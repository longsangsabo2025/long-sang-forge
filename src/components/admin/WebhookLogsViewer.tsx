import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getWebhookLogs, retryWebhook } from "@/lib/api/subscription-features";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Clock,
  Loader2,
  RefreshCcw,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function WebhookLogsViewer() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const {
    data: logs = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["webhook-logs", statusFilter],
    queryFn: () => getWebhookLogs({ status: statusFilter || undefined, limit: 50 }),
    refetchInterval: 30000, // Refresh every 30s
  });

  const retryMutation = useMutation({
    mutationFn: retryWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhook-logs"] });
    },
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      received: { icon: Clock, color: "bg-blue-100 text-blue-800" },
      processed: { icon: CheckCircle, color: "bg-green-100 text-green-800" },
      failed: { icon: XCircle, color: "bg-red-100 text-red-800" },
      retry_pending: { icon: RefreshCcw, color: "bg-yellow-100 text-yellow-800" },
      retry_failed: { icon: AlertCircle, color: "bg-red-100 text-red-800" },
    };

    const style = styles[status as keyof typeof styles] || styles.received;
    const Icon = style.icon;

    return (
      <Badge className={cn("flex items-center gap-1", style.color)}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Stats
  const stats = {
    total: logs.length,
    processed: logs.filter((l) => l.status === "processed").length,
    failed: logs.filter((l) => l.status === "failed" || l.status === "retry_failed").length,
    pending: logs.filter((l) => l.status === "received" || l.status === "retry_pending").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Webhooks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.processed}</div>
            <div className="text-sm text-muted-foreground">Processed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["", "processed", "failed", "retry_pending"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status || "All"}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Logs (Last 50)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <Collapsible
                  key={log.id}
                  open={expandedRow === log.id}
                  onOpenChange={(open) => setExpandedRow(open ? log.id : null)}
                >
                  <TableRow className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>{formatAmount(log.amount)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {log.transfer_content || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {(log.status === "failed" || log.status === "retry_failed") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => retryMutation.mutate(log.id)}
                            disabled={retryMutation.isPending}
                          >
                            {retryMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform",
                                expandedRow === log.id && "rotate-180"
                              )}
                            />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </TableCell>
                  </TableRow>
                  <CollapsibleContent asChild>
                    <TableRow>
                      <TableCell colSpan={5} className="bg-muted/30">
                        <div className="p-4 space-y-2 text-sm">
                          <div>
                            <strong>ID:</strong> {log.id}
                          </div>
                          {log.error_message && (
                            <div className="text-red-600">
                              <strong>Error:</strong> {log.error_message}
                            </div>
                          )}
                          {log.matched_user_id && (
                            <div>
                              <strong>Matched User:</strong> {log.matched_user_id}
                            </div>
                          )}
                          {log.processed_at && (
                            <div>
                              <strong>Processed At:</strong> {formatDate(log.processed_at)}
                            </div>
                          )}
                          <div>
                            <strong>Retry Count:</strong> {log.retry_count}
                          </div>
                          <details>
                            <summary className="cursor-pointer font-medium">View Payload</summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-48">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          </details>
                        </div>
                      </TableCell>
                    </TableRow>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </TableBody>
          </Table>

          {logs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No webhook logs found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
