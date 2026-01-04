/**
 * Execution History Panel
 * Display and manage execution history
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useExecutionHistory } from "@/hooks/useExecutionHistory";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Download, History, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
// Format distance to now (simple version without date-fns dependency)
function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  let result = "";
  if (diffDays > 0) {
    result = `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  } else if (diffHours > 0) {
    result = `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
  } else if (diffMinutes > 0) {
    result = `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
  } else {
    result = `${diffSeconds} second${diffSeconds !== 1 ? "s" : ""}`;
  }

  return options?.addSuffix ? `${result} ago` : result;
}

export function ExecutionHistoryPanel() {
  const { history, deleteExecution, clearHistory, exportHistory, getExecution } =
    useExecutionHistory();
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);

  const selected = selectedExecution ? getExecution(selectedExecution) : null;

  const getStatusIcon = (status: ExecutionHistory["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: ExecutionHistory["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-400 border border-green-500/40">
            Completed
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Execution History
            </CardTitle>
            <CardDescription>{history.length} execution(s) recorded</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportHistory}
              disabled={history.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              disabled={history.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No execution history yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your execution steps will be saved here automatically
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {history.map((execution) => (
                <div
                  key={execution.id}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-colors",
                    selectedExecution === execution.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedExecution(execution.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(execution.status)}
                        <span className="font-medium text-sm truncate">{execution.command}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(execution.timestamp, { addSuffix: true })}</span>
                        <span>•</span>
                        <span>{execution.steps.length} step(s)</span>
                        <span>•</span>
                        <span>{(execution.duration / 1000).toFixed(1)}s</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(execution.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteExecution(execution.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Execution Details Dialog */}
      <Dialog
        open={!!selectedExecution}
        onOpenChange={(open) => !open && setSelectedExecution(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Execution Details</DialogTitle>
            <DialogDescription>
              {selected && formatDistanceToNow(selected.timestamp, { addSuffix: true })}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 overflow-y-auto max-h-[60vh]">
              <div>
                <div className="text-sm font-medium mb-2">Command:</div>
                <code className="text-sm bg-muted p-2 rounded block">{selected.command}</code>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Steps ({selected.steps.length}):</div>
                <div className="space-y-2">
                  {selected.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 p-2 border rounded-lg">
                      <div className="flex-shrink-0 w-8 text-center text-sm font-medium text-muted-foreground">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{step.name}</div>
                        {step.description && (
                          <div className="text-xs text-muted-foreground">{step.description}</div>
                        )}
                      </div>
                      {getStatusBadge(step.status as any)}
                      {step.duration && (
                        <div className="text-xs text-muted-foreground">
                          {(step.duration / 1000).toFixed(1)}s
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {selected.error && (
                <div>
                  <div className="text-sm font-medium mb-2 text-destructive">Error:</div>
                  <div className="text-sm bg-destructive/10 text-destructive p-2 rounded">
                    {selected.error}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
