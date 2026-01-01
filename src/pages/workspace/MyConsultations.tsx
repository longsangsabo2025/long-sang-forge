import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isPast, isToday, isTomorrow, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Types
interface Consultation {
  id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  consultation_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  consultation_type?: string;
  notes?: string;
  meeting_link?: string;
  payment_status?: string;
  payment_amount?: number;
  created_at: string;
}

interface Deliverable {
  id: string;
  consultation_id: string;
  title: string;
  description?: string;
  file_url?: string;
  file_type?: string;
  category?: string;
  created_at: string;
}

interface ActionItem {
  id: string;
  consultation_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assigned_to: "client" | "consultant" | "both";
  completed_at?: string;
}

interface ConsultationNote {
  id: string;
  consultation_id: string;
  content: string;
  author_type: "client" | "consultant" | "system";
  created_at: string;
}

// Status config
const statusConfig = {
  pending: {
    label: "Chờ xác nhận",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: Clock,
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: CalendarCheck,
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: CalendarX,
  },
  completed: {
    label: "Hoàn thành",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: CheckCircle2,
  },
  no_show: {
    label: "Không tham gia",
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    icon: AlertCircle,
  },
};

const priorityConfig = {
  low: { label: "Thấp", color: "bg-gray-500/20 text-gray-400" },
  medium: { label: "Trung bình", color: "bg-blue-500/20 text-blue-400" },
  high: { label: "Cao", color: "bg-orange-500/20 text-orange-400" },
  urgent: { label: "Khẩn cấp", color: "bg-red-500/20 text-red-400" },
};

const fileTypeIcons: Record<string, string> = {
  pdf: "📄",
  doc: "📝",
  spreadsheet: "📊",
  presentation: "📑",
  video: "🎥",
  link: "🔗",
};

export default function MyConsultations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [newNote, setNewNote] = useState("");

  const userEmail = user?.email || "";

  // Fetch consultations
  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ["my-consultations", userEmail],
    queryFn: async () => {
      if (!userEmail) return [];

      // Query consultations where client_email matches OR user_id matches
      const { data, error } = await (supabase as any)
        .from("consultations")
        .select("*")
        .eq("client_email", userEmail)
        .order("consultation_date", { ascending: false });

      if (error) {
        console.error("Error fetching consultations:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!userEmail,
  });

  // Fetch deliverables for selected consultation
  const { data: deliverables = [] } = useQuery({
    queryKey: ["consultation-deliverables", selectedConsultation?.id],
    queryFn: async () => {
      if (!selectedConsultation?.id) return [];

      const { data, error } = await (supabase as any)
        .from("consultation_deliverables")
        .select("*")
        .eq("consultation_id", selectedConsultation.id)
        .order("created_at", { ascending: false });

      if (error) return [];
      return data || [];
    },
    enabled: !!selectedConsultation?.id,
  });

  // Fetch action items for selected consultation
  const { data: actionItems = [] } = useQuery({
    queryKey: ["consultation-action-items", selectedConsultation?.id],
    queryFn: async () => {
      if (!selectedConsultation?.id) return [];

      const { data, error } = await (supabase as any)
        .from("consultation_action_items")
        .select("*")
        .eq("consultation_id", selectedConsultation.id)
        .order("due_date", { ascending: true });

      if (error) return [];
      return data || [];
    },
    enabled: !!selectedConsultation?.id,
  });

  // Fetch notes for selected consultation
  const { data: notes = [] } = useQuery({
    queryKey: ["consultation-notes", selectedConsultation?.id],
    queryFn: async () => {
      if (!selectedConsultation?.id) return [];

      const { data, error } = await (supabase as any)
        .from("consultation_notes")
        .select("*")
        .eq("consultation_id", selectedConsultation.id)
        .order("created_at", { ascending: true });

      if (error) return [];
      return data || [];
    },
    enabled: !!selectedConsultation?.id,
  });

  // Cancel consultation mutation
  const cancelMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await (supabase as any)
        .from("consultations")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-consultations"] });
      setCancelDialogOpen(false);
      setSelectedConsultation(null);
      setCancelReason("");
      toast.success("Đã hủy lịch hẹn thành công");
    },
    onError: () => {
      toast.error("Không thể hủy lịch hẹn. Vui lòng thử lại.");
    },
  });

  // Toggle action item status
  const toggleActionMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await (supabase as any)
        .from("consultation_action_items")
        .update({
          status: completed ? "completed" : "pending",
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultation-action-items"] });
      toast.success("Đã cập nhật task");
    },
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConsultation?.id) return;

      const { error } = await (supabase as any).from("consultation_notes").insert({
        consultation_id: selectedConsultation.id,
        content,
        author_id: user?.id,
        author_type: "client",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultation-notes"] });
      setNewNote("");
      toast.success("Đã gửi tin nhắn");
    },
  });

  // Filter consultations by tab
  const filteredConsultations = consultations.filter((c: Consultation) => {
    const consultDate = parseISO(c.consultation_date);
    const isUpcoming = !isPast(consultDate) || isToday(consultDate);

    switch (activeTab) {
      case "upcoming":
        return isUpcoming && c.status !== "cancelled" && c.status !== "completed";
      case "completed":
        return c.status === "completed";
      case "cancelled":
        return c.status === "cancelled";
      case "all":
      default:
        return true;
    }
  });

  // Stats
  const stats = {
    total: consultations.length,
    upcoming: consultations.filter((c: Consultation) => {
      const consultDate = parseISO(c.consultation_date);
      return (
        (!isPast(consultDate) || isToday(consultDate)) &&
        c.status !== "cancelled" &&
        c.status !== "completed"
      );
    }).length,
    completed: consultations.filter((c: Consultation) => c.status === "completed").length,
    deliverables: 0, // Would need aggregate query
  };

  // Can reschedule/cancel if > 24h before
  const canModify = (consultation: Consultation) => {
    const consultDate = parseISO(`${consultation.consultation_date}T${consultation.start_time}`);
    const hoursUntil = (consultDate.getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntil > 24 && consultation.status === "confirmed";
  };

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hôm nay";
    if (isTomorrow(date)) return "Ngày mai";
    return format(date, "EEEE, dd/MM/yyyy", { locale: vi });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Lịch Hẹn Của Tôi</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các buổi tư vấn và theo dõi tiến độ công việc
          </p>
        </div>
        <Button onClick={() => navigate("/consultation")} className="gap-2">
          <Plus className="h-4 w-4" />
          Đặt lịch mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Tổng cộng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CalendarClock className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
                <p className="text-xs text-muted-foreground">Sắp tới</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <CheckCircle2 className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Hoàn thành</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <FileText className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.deliverables}</p>
                <p className="text-xs text-muted-foreground">Tài liệu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consultations List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="upcoming" className="text-xs">
                    Sắp tới
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs">
                    Xong
                  </TabsTrigger>
                  <TabsTrigger value="cancelled" className="text-xs">
                    Hủy
                  </TabsTrigger>
                  <TabsTrigger value="all" className="text-xs">
                    Tất cả
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {filteredConsultations.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Không có lịch hẹn nào</p>
                    <Button
                      variant="link"
                      onClick={() => navigate("/consultation")}
                      className="mt-2"
                    >
                      Đặt lịch ngay
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredConsultations.map((consultation: Consultation) => {
                      const StatusIcon = statusConfig[consultation.status].icon;
                      const isSelected = selectedConsultation?.id === consultation.id;

                      return (
                        <motion.div
                          key={consultation.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                            isSelected ? "bg-primary/10 border-l-2 border-l-primary" : ""
                          }`}
                          onClick={() => setSelectedConsultation(consultation)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {consultation.consultation_type || "Tư vấn"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(consultation.consultation_date)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {consultation.start_time} - {consultation.end_time}
                              </p>
                            </div>
                            <Badge
                              className={`${statusConfig[consultation.status].color} shrink-0`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[consultation.status].label}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Consultation Detail / Timeline */}
        <div className="lg:col-span-2">
          {selectedConsultation ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedConsultation.consultation_type || "Buổi Tư Vấn"}
                      <Badge className={statusConfig[selectedConsultation.status].color}>
                        {statusConfig[selectedConsultation.status].label}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {formatDate(selectedConsultation.consultation_date)} •{" "}
                      {selectedConsultation.start_time} - {selectedConsultation.end_time}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {selectedConsultation.meeting_link &&
                      selectedConsultation.status === "confirmed" && (
                        <Button size="sm" asChild>
                          <a
                            href={selectedConsultation.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Tham gia
                          </a>
                        </Button>
                      )}
                    {canModify(selectedConsultation) && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRescheduleDialogOpen(true)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Đổi lịch
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setCancelDialogOpen(true)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Hủy
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="timeline" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="deliverables">
                      Tài liệu
                      {deliverables.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {deliverables.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="actions">
                      Tasks
                      {actionItems.filter((a: ActionItem) => a.status !== "completed").length >
                        0 && (
                        <Badge variant="secondary" className="ml-2">
                          {actionItems.filter((a: ActionItem) => a.status !== "completed").length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="notes">Ghi chú</TabsTrigger>
                  </TabsList>

                  {/* Timeline Tab */}
                  <TabsContent value="timeline" className="space-y-4">
                    <div className="relative pl-6 border-l-2 border-border space-y-6">
                      {/* Booking Created */}
                      <div className="relative">
                        <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
                        <div>
                          <p className="font-medium text-green-400">Đã đặt lịch</p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(selectedConsultation.created_at), "dd/MM/yyyy HH:mm")}
                          </p>
                        </div>
                      </div>

                      {/* Payment */}
                      {selectedConsultation.payment_status === "confirmed" && (
                        <div className="relative">
                          <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-blue-500 border-2 border-background" />
                          <div>
                            <p className="font-medium text-blue-400">Đã thanh toán</p>
                            <p className="text-sm text-muted-foreground">
                              {(selectedConsultation.payment_amount || 0).toLocaleString("vi-VN")}đ
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Confirmed */}
                      {selectedConsultation.status !== "pending" &&
                        selectedConsultation.status !== "cancelled" && (
                          <div className="relative">
                            <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-cyan-500 border-2 border-background" />
                            <div>
                              <p className="font-medium text-cyan-400">Đã xác nhận</p>
                              {selectedConsultation.meeting_link && (
                                <a
                                  href={selectedConsultation.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                  <Video className="h-3 w-3" />
                                  Link cuộc họp
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Completed */}
                      {selectedConsultation.status === "completed" && (
                        <div className="relative">
                          <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-purple-500 border-2 border-background" />
                          <div>
                            <p className="font-medium text-purple-400">Hoàn thành</p>
                            <p className="text-sm text-muted-foreground">Đã hoàn tất buổi tư vấn</p>
                          </div>
                        </div>
                      )}

                      {/* Cancelled */}
                      {selectedConsultation.status === "cancelled" && (
                        <div className="relative">
                          <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-red-500 border-2 border-background" />
                          <div>
                            <p className="font-medium text-red-400">Đã hủy</p>
                            {selectedConsultation.cancellation_reason && (
                              <p className="text-sm text-muted-foreground">
                                Lý do: {selectedConsultation.cancellation_reason}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Upcoming marker for confirmed consultations */}
                      {selectedConsultation.status === "confirmed" &&
                        !isPast(parseISO(selectedConsultation.consultation_date)) && (
                          <div className="relative">
                            <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-yellow-500 border-2 border-background animate-pulse" />
                            <div>
                              <p className="font-medium text-yellow-400">Sắp diễn ra</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(selectedConsultation.consultation_date)} lúc{" "}
                                {selectedConsultation.start_time}
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  </TabsContent>

                  {/* Deliverables Tab */}
                  <TabsContent value="deliverables" className="space-y-4">
                    {deliverables.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Chưa có tài liệu nào</p>
                        <p className="text-sm">Tài liệu sẽ được gửi sau buổi tư vấn</p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {deliverables.map((d: Deliverable) => (
                          <Card key={d.id} className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">
                                {fileTypeIcons[d.file_type || "link"] || "📎"}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{d.title}</p>
                                {d.description && (
                                  <p className="text-sm text-muted-foreground">{d.description}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(parseISO(d.created_at), "dd/MM/yyyy")}
                                </p>
                              </div>
                              {d.file_url && (
                                <Button size="sm" variant="ghost" asChild>
                                  <a href={d.file_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Action Items Tab */}
                  <TabsContent value="actions" className="space-y-4">
                    {actionItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Check className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Chưa có tasks nào</p>
                        <p className="text-sm">Các bước tiếp theo sẽ được thêm sau buổi tư vấn</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {actionItems.map((item: ActionItem) => (
                          <Card
                            key={item.id}
                            className={`p-4 ${item.status === "completed" ? "opacity-60" : ""}`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() =>
                                  toggleActionMutation.mutate({
                                    id: item.id,
                                    completed: item.status !== "completed",
                                  })
                                }
                                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  item.status === "completed"
                                    ? "bg-green-500 border-green-500"
                                    : "border-muted-foreground hover:border-primary"
                                }`}
                              >
                                {item.status === "completed" && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </button>
                              <div className="flex-1">
                                <p
                                  className={`font-medium ${
                                    item.status === "completed" ? "line-through" : ""
                                  }`}
                                >
                                  {item.title}
                                </p>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {item.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className={priorityConfig[item.priority].color}>
                                    {priorityConfig[item.priority].label}
                                  </Badge>
                                  {item.due_date && (
                                    <span className="text-xs text-muted-foreground">
                                      Hạn: {format(parseISO(item.due_date), "dd/MM")}
                                    </span>
                                  )}
                                  <Badge variant="outline">
                                    {item.assigned_to === "client"
                                      ? "Bạn"
                                      : item.assigned_to === "consultant"
                                      ? "Tư vấn viên"
                                      : "Cả hai"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Notes Tab */}
                  <TabsContent value="notes" className="space-y-4">
                    <ScrollArea className="h-[250px] pr-4">
                      {notes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Chưa có ghi chú nào</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {notes.map((note: ConsultationNote) => (
                            <div
                              key={note.id}
                              className={`p-3 rounded-lg ${
                                note.author_type === "client"
                                  ? "bg-primary/10 ml-8"
                                  : note.author_type === "consultant"
                                  ? "bg-muted mr-8"
                                  : "bg-yellow-500/10 text-center text-sm"
                              }`}
                            >
                              <p>{note.content}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(parseISO(note.created_at), "dd/MM HH:mm")}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>

                    <Separator />

                    <div className="flex gap-2">
                      <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Viết ghi chú hoặc câu hỏi..."
                        className="min-h-[60px]"
                      />
                      <Button
                        size="icon"
                        onClick={() => newNote.trim() && addNoteMutation.mutate(newNote)}
                        disabled={!newNote.trim() || addNoteMutation.isPending}
                      >
                        {addNoteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Chọn một lịch hẹn để xem chi tiết</p>
                <p className="text-sm">Xem timeline, tài liệu và các bước tiếp theo</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hủy lịch hẹn</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn hủy buổi tư vấn này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Lý do hủy (không bắt buộc)</label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Vui lòng cho biết lý do..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Quay lại
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedConsultation &&
                cancelMutation.mutate({
                  id: selectedConsultation.id,
                  reason: cancelReason,
                })
              }
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Xác nhận hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog - Simplified, will redirect to booking page */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi lịch hẹn</DialogTitle>
            <DialogDescription>
              Để đổi lịch, bạn sẽ được chuyển đến trang đặt lịch mới. Lịch hẹn cũ sẽ được tự động
              hủy sau khi bạn đặt lịch mới thành công.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => {
                // Store old consultation ID for cancellation after new booking
                localStorage.setItem("reschedule_consultation_id", selectedConsultation?.id || "");
                navigate("/consultation");
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Đặt lịch mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
