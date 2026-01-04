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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  Flag,
  Lightbulb,
  MessageSquare,
  Search,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SavedFeature {
  id: string;
  showcase_slug: string;
  showcase_name: string | null;
  feature_index: number;
  feature_title: string;
  feature_points: string[] | null;
  feature_color: string | null;
  user_notes: string | null;
  use_case: string | null;
  target_project: string | null;
  priority: "high" | "medium" | "low";
  status: "saved" | "planning" | "requested" | "in_progress" | "implemented";
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  saved: { label: "Đã lưu", color: "bg-gray-500", icon: Sparkles },
  planning: { label: "Đang lên kế hoạch", color: "bg-blue-500", icon: Lightbulb },
  requested: { label: "Đã yêu cầu", color: "bg-yellow-500", icon: MessageSquare },
  in_progress: { label: "Đang thực hiện", color: "bg-orange-500", icon: Clock },
  implemented: { label: "Hoàn thành", color: "bg-green-500", icon: CheckCircle2 },
};

const priorityConfig = {
  high: { label: "Cao", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  medium: { label: "Trung bình", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  low: { label: "Thấp", color: "text-green-500 bg-green-500/10 border-green-500/20" },
};

export default function IdeaBank() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [editingFeature, setEditingFeature] = useState<SavedFeature | null>(null);
  const [editForm, setEditForm] = useState({
    user_notes: "",
    use_case: "",
    target_project: "",
    priority: "medium" as "high" | "medium" | "low",
    status: "saved" as SavedFeature["status"],
  });

  // Fetch saved features
  const { data: savedFeatures = [], isLoading } = useQuery({
    queryKey: ["saved-features", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("saved_features")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SavedFeature[];
    },
    enabled: !!user?.id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saved_features").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-features"] });
      toast.success("Đã xóa idea");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SavedFeature> }) => {
      const { error } = await supabase.from("saved_features").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-features"] });
      toast.success("Đã cập nhật idea");
      setEditingFeature(null);
    },
  });

  // Filter features
  const filteredFeatures = savedFeatures.filter((item) => {
    const matchesSearch =
      item.feature_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.showcase_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user_notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeTab === "all" || item.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: savedFeatures.length,
    saved: savedFeatures.filter((f) => f.status === "saved").length,
    planning: savedFeatures.filter((f) => f.status === "planning").length,
    requested: savedFeatures.filter((f) => f.status === "requested").length,
    in_progress: savedFeatures.filter((f) => f.status === "in_progress").length,
    implemented: savedFeatures.filter((f) => f.status === "implemented").length,
  };

  const handleEdit = (feature: SavedFeature) => {
    setEditingFeature(feature);
    setEditForm({
      user_notes: feature.user_notes || "",
      use_case: feature.use_case || "",
      target_project: feature.target_project || "",
      priority: feature.priority,
      status: feature.status,
    });
  };

  const handleSaveEdit = () => {
    if (!editingFeature) return;
    updateMutation.mutate({
      id: editingFeature.id,
      updates: editForm,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-500" />
          Idea Bank
        </h1>
        <p className="text-muted-foreground mt-1">
          Lưu trữ & quản lý các tính năng hay từ showcase để áp dụng vào dự án của bạn
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-500">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Tổng ideas</div>
          </CardContent>
        </Card>
        {Object.entries(statusConfig).map(([key, config]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <config.icon className="h-4 w-4 text-muted-foreground" />
                <div className="text-xl font-bold">{stats[key as keyof typeof stats]}</div>
              </div>
              <div className="text-xs text-muted-foreground">{config.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm ideas..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">Tất cả ({stats.total})</TabsTrigger>
          {Object.entries(statusConfig).map(([key, config]) => (
            <TabsTrigger key={key} value={key} className="gap-1">
              <config.icon className="h-3 w-3" />
              {config.label} ({stats[key as keyof typeof stats]})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredFeatures.length === 0 ? (
            <Card className="p-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có idea nào được lưu</h3>
              <p className="text-muted-foreground mb-4">
                Khám phá các showcase và nhấn "Lưu idea" để thêm vào đây
              </p>
              <Button onClick={() => navigate("/showcase")}>
                <Lightbulb className="h-4 w-4 mr-2" />
                Khám phá Showcase
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredFeatures.map((feature) => {
                  const status = statusConfig[feature.status];
                  const priority = priorityConfig[feature.priority];

                  return (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-all group">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base line-clamp-2">
                                {feature.feature_title}
                              </CardTitle>
                              <CardDescription className="text-xs mt-1">
                                từ{" "}
                                <span
                                  className="text-primary cursor-pointer hover:underline"
                                  onClick={() => navigate(`/showcase/${feature.showcase_slug}`)}
                                >
                                  {feature.showcase_name || feature.showcase_slug}
                                </span>
                              </CardDescription>
                            </div>
                            <Badge className={`${status.color} text-white text-xs shrink-0`}>
                              {status.label}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          {/* Feature points */}
                          {feature.feature_points && feature.feature_points.length > 0 && (
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {feature.feature_points.slice(0, 3).map((point, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <span className="text-primary">•</span>
                                  <span className="line-clamp-1">{point}</span>
                                </li>
                              ))}
                              {feature.feature_points.length > 3 && (
                                <li className="text-muted-foreground/50">
                                  +{feature.feature_points.length - 3} more...
                                </li>
                              )}
                            </ul>
                          )}

                          {/* User notes */}
                          {feature.user_notes && (
                            <div className="p-2 bg-muted/50 rounded text-xs">
                              <p className="text-muted-foreground line-clamp-2">
                                💭 {feature.user_notes}
                              </p>
                            </div>
                          )}

                          {/* Target project */}
                          {feature.target_project && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Target className="h-3 w-3" />
                              <span>Cho: {feature.target_project}</span>
                            </div>
                          )}

                          {/* Priority & Actions */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <Badge variant="outline" className={priority.color}>
                              <Flag className="h-3 w-3 mr-1" />
                              {priority.label}
                            </Badge>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleEdit(feature)}
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500"
                                onClick={() => deleteMutation.mutate(feature.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Date */}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Lưu {new Date(feature.created_at).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingFeature} onOpenChange={() => setEditingFeature(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Idea</DialogTitle>
            <DialogDescription>
              {editingFeature?.feature_title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ghi chú của bạn</Label>
              <Textarea
                placeholder="Ghi chú về tính năng này..."
                value={editForm.user_notes}
                onChange={(e) => setEditForm({ ...editForm, user_notes: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Use case</Label>
              <Textarea
                placeholder="Bạn muốn dùng tính năng này như thế nào?"
                value={editForm.use_case}
                onChange={(e) => setEditForm({ ...editForm, use_case: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Project mục tiêu</Label>
              <Input
                placeholder="Tên project bạn muốn áp dụng"
                value={editForm.target_project}
                onChange={(e) => setEditForm({ ...editForm, target_project: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Độ ưu tiên</Label>
                <Select
                  value={editForm.priority}
                  onValueChange={(v) => setEditForm({ ...editForm, priority: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 Cao</SelectItem>
                    <SelectItem value="medium">🟡 Trung bình</SelectItem>
                    <SelectItem value="low">🟢 Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) => setEditForm({ ...editForm, status: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saved">💾 Đã lưu</SelectItem>
                    <SelectItem value="planning">💡 Đang lên kế hoạch</SelectItem>
                    <SelectItem value="requested">📨 Đã yêu cầu</SelectItem>
                    <SelectItem value="in_progress">⏳ Đang thực hiện</SelectItem>
                    <SelectItem value="implemented">✅ Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFeature(null)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
