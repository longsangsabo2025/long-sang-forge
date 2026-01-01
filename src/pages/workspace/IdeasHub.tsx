import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  CheckCircle2,
  Clock,
  Filter,
  Lightbulb,
  MoreVertical,
  Pin,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Idea {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  priority: string;
  tags: string[];
  color: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

const categories = [
  { value: "general", label: "Chung", color: "#6B7280" },
  { value: "business", label: "Business", color: "#3B82F6" },
  { value: "product", label: "Product", color: "#10B981" },
  { value: "marketing", label: "Marketing", color: "#F59E0B" },
  { value: "tech", label: "Tech", color: "#8B5CF6" },
  { value: "personal", label: "Cá nhân", color: "#EC4899" },
];

const statusOptions = [
  { value: "draft", label: "Nháp", icon: Clock, color: "bg-gray-500" },
  { value: "in_progress", label: "Đang thực hiện", icon: Sparkles, color: "bg-blue-500" },
  { value: "completed", label: "Hoàn thành", icon: CheckCircle2, color: "bg-green-500" },
  { value: "archived", label: "Lưu trữ", icon: Archive, color: "bg-slate-500" },
];

const priorityOptions = [
  { value: "low", label: "Thấp", color: "bg-slate-400" },
  { value: "medium", label: "Trung bình", color: "bg-yellow-500" },
  { value: "high", label: "Cao", color: "bg-orange-500" },
  { value: "urgent", label: "Khẩn cấp", color: "bg-red-500" },
];

export default function IdeasHub() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    category: "general",
    priority: "medium",
  });

  // Fetch ideas
  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ["user-ideas", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_ideas")
        .select("*")
        .eq("user_id", user.id)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Idea[];
    },
    enabled: !!user?.id,
  });

  // Create idea mutation
  const createMutation = useMutation({
    mutationFn: async (idea: typeof newIdea) => {
      const { data, error } = await supabase
        .from("user_ideas")
        .insert({
          user_id: user?.id,
          title: idea.title,
          description: idea.description,
          category: idea.category,
          priority: idea.priority,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-ideas"] });
      setIsCreateOpen(false);
      setNewIdea({ title: "", description: "", category: "general", priority: "medium" });
      toast.success("Ý tưởng đã được tạo!");
    },
    onError: (error) => {
      toast.error("Lỗi khi tạo ý tưởng: " + error.message);
    },
  });

  // Update idea mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Idea> }) => {
      const { error } = await supabase.from("user_ideas").update(updates).eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-ideas"] });
    },
  });

  // Delete idea mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_ideas").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-ideas"] });
      toast.success("Đã xóa ý tưởng");
    },
  });

  // Filter ideas
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || idea.category === filterCategory;
    const matchesStatus = filterStatus === "all" || idea.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const pinnedIdeas = filteredIdeas.filter((i) => i.is_pinned);
  const regularIdeas = filteredIdeas.filter((i) => !i.is_pinned);

  const stats = {
    total: ideas.length,
    draft: ideas.filter((i) => i.status === "draft").length,
    inProgress: ideas.filter((i) => i.status === "in_progress").length,
    completed: ideas.filter((i) => i.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="h-8 w-8 text-yellow-500" />
            Ideas Hub
          </h1>
          <p className="text-muted-foreground mt-1">Nơi lưu trữ và phát triển ý tưởng của bạn</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />Ý Tưởng Mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Tạo Ý Tưởng Mới
              </DialogTitle>
              <DialogDescription>Ghi lại ý tưởng của bạn để không bỏ lỡ</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  placeholder="VD: App quản lý thời gian cho freelancer"
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Chi tiết về ý tưởng..."
                  rows={4}
                  value={newIdea.description}
                  onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Danh mục</Label>
                  <Select
                    value={newIdea.category}
                    onValueChange={(v) => setNewIdea({ ...newIdea, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Độ ưu tiên</Label>
                  <Select
                    value={newIdea.priority}
                    onValueChange={(v) => setNewIdea({ ...newIdea, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={() => createMutation.mutate(newIdea)}
                disabled={!newIdea.title.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? "Đang tạo..." : "Tạo Ý Tưởng"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-500">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Tổng ý tưởng</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-500/10 to-gray-500/10 border-slate-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-500">{stats.draft}</div>
            <div className="text-sm text-muted-foreground">Nháp</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-500">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">Đang thực hiện</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Hoàn thành</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm ý tưởng..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ideas Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredIdeas.length === 0 ? (
        <Card className="p-12 text-center">
          <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có ý tưởng nào</h3>
          <p className="text-muted-foreground mb-4">Bắt đầu ghi lại ý tưởng đầu tiên của bạn!</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo Ý Tưởng
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pinned Ideas */}
          {pinnedIdeas.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Đã ghim ({pinnedIdeas.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {pinnedIdeas.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      onUpdate={(updates) => updateMutation.mutate({ id: idea.id, updates })}
                      onDelete={() => deleteMutation.mutate(idea.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Regular Ideas */}
          <div>
            {pinnedIdeas.length > 0 && (
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Tất cả ý tưởng ({regularIdeas.length})
              </h3>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {regularIdeas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onUpdate={(updates) => updateMutation.mutate({ id: idea.id, updates })}
                    onDelete={() => deleteMutation.mutate(idea.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Idea Card Component
function IdeaCard({
  idea,
  onUpdate,
  onDelete,
}: {
  idea: Idea;
  onUpdate: (updates: Partial<Idea>) => void;
  onDelete: () => void;
}) {
  const category = categories.find((c) => c.value === idea.category);
  const status = statusOptions.find((s) => s.value === idea.status);
  const priority = priorityOptions.find((p) => p.value === idea.priority);
  const StatusIcon = status?.icon || Clock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`group hover:shadow-lg transition-all cursor-pointer border-l-4`}
        style={{ borderLeftColor: category?.color }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-2 flex items-center gap-2">
                {idea.is_pinned && <Pin className="h-3 w-3 text-yellow-500 flex-shrink-0" />}
                {idea.title}
              </CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onUpdate({ is_pinned: !idea.is_pinned })}>
                  <Pin className="h-4 w-4 mr-2" />
                  {idea.is_pinned ? "Bỏ ghim" : "Ghim"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdate({ status: "completed" })}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Đánh dấu hoàn thành
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdate({ status: "archived" })}>
                  <Archive className="h-4 w-4 mr-2" />
                  Lưu trữ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {idea.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{idea.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              <StatusIcon className="h-3 w-3 mr-1" />
              {status?.label}
            </Badge>
            <Badge variant="secondary" className={`text-xs ${priority?.color} text-white`}>
              {priority?.label}
            </Badge>
            <Badge variant="outline" className="text-xs" style={{ color: category?.color }}>
              <Tag className="h-3 w-3 mr-1" />
              {category?.label}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(idea.created_at).toLocaleDateString("vi-VN")}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
