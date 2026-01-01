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
import { Progress } from "@/components/ui/progress";
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
  Calendar,
  CheckCircle2,
  DollarSign,
  FolderKanban,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Search,
  Target,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  category: string;
  start_date: string | null;
  target_date: string | null;
  budget_estimate: number | null;
  currency: string;
  progress: number;
  cover_image: string | null;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

const projectCategories = [
  { value: "personal", label: "Cá nhân", icon: "👤" },
  { value: "business", label: "Business", icon: "💼" },
  { value: "tech", label: "Tech/Dev", icon: "💻" },
  { value: "creative", label: "Creative", icon: "🎨" },
  { value: "learning", label: "Học tập", icon: "📚" },
  { value: "other", label: "Khác", icon: "📌" },
];

const statusOptions = [
  { value: "planning", label: "Đang lên kế hoạch", icon: Target, color: "bg-slate-500" },
  { value: "in_progress", label: "Đang thực hiện", icon: Play, color: "bg-blue-500" },
  { value: "on_hold", label: "Tạm dừng", icon: Pause, color: "bg-yellow-500" },
  { value: "completed", label: "Hoàn thành", icon: CheckCircle2, color: "bg-green-500" },
  { value: "cancelled", label: "Đã hủy", icon: XCircle, color: "bg-red-500" },
];

export default function MyProjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    category: "personal",
    target_date: "",
    budget_estimate: "",
  });

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["user-projects", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user?.id,
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: async (project: typeof newProject) => {
      const { data, error } = await supabase
        .from("user_projects")
        .insert({
          user_id: user?.id,
          name: project.name,
          description: project.description || null,
          category: project.category,
          target_date: project.target_date || null,
          budget_estimate: project.budget_estimate ? parseFloat(project.budget_estimate) : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-projects"] });
      setIsCreateOpen(false);
      setNewProject({
        name: "",
        description: "",
        category: "personal",
        target_date: "",
        budget_estimate: "",
      });
      toast.success("Dự án đã được tạo!");
    },
    onError: (error) => {
      toast.error("Lỗi khi tạo dự án: " + error.message);
    },
  });

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const { error } = await supabase.from("user_projects").update(updates).eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-projects"] });
      toast.success("Đã cập nhật dự án");
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_projects").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-projects"] });
      toast.success("Đã xóa dự án");
    },
  });

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: projects.length,
    planning: projects.filter((p) => p.status === "planning").length,
    inProgress: projects.filter((p) => p.status === "in_progress").length,
    completed: projects.filter((p) => p.status === "completed").length,
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    if (!amount) return null;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency || "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderKanban className="h-8 w-8 text-green-500" />
            My Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và theo dõi tiến độ các dự án cá nhân
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Dự Án Mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-green-500" />
                Tạo Dự Án Mới
              </DialogTitle>
              <DialogDescription>Bắt đầu một dự án mới để theo dõi tiến độ</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên dự án *</Label>
                <Input
                  id="name"
                  placeholder="VD: Website cá nhân"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Chi tiết về dự án..."
                  rows={3}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Danh mục</Label>
                  <Select
                    value={newProject.category}
                    onValueChange={(v) => setNewProject({ ...newProject, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projectCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ngày mục tiêu</Label>
                  <Input
                    type="date"
                    value={newProject.target_date}
                    onChange={(e) => setNewProject({ ...newProject, target_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ngân sách dự kiến (VND)</Label>
                <Input
                  type="number"
                  placeholder="VD: 5000000"
                  value={newProject.budget_estimate}
                  onChange={(e) =>
                    setNewProject({ ...newProject, budget_estimate: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={() => createMutation.mutate(newProject)}
                disabled={!newProject.name.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? "Đang tạo..." : "Tạo Dự Án"}
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
            <div className="text-sm text-muted-foreground">Tổng dự án</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-500/10 to-gray-500/10 border-slate-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-500">{stats.planning}</div>
            <div className="text-sm text-muted-foreground">Đang lên KH</div>
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
            placeholder="Tìm kiếm dự án..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có dự án nào</h3>
          <p className="text-muted-foreground mb-4">Bắt đầu tạo dự án đầu tiên của bạn!</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo Dự Án
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                formatCurrency={formatCurrency}
                onUpdate={(updates) => updateMutation.mutate({ id: project.id, updates })}
                onDelete={() => deleteMutation.mutate(project.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Project Card Component
function ProjectCard({
  project,
  formatCurrency,
  onUpdate,
  onDelete,
}: {
  project: Project;
  formatCurrency: (amount: number | null, currency: string) => string | null;
  onUpdate: (updates: Partial<Project>) => void;
  onDelete: () => void;
}) {
  const category = projectCategories.find((c) => c.value === project.category);
  const status = statusOptions.find((s) => s.value === project.status);
  const StatusIcon = status?.icon || Target;

  const daysUntilTarget = project.target_date
    ? Math.ceil((new Date(project.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group hover:shadow-lg transition-all h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{category?.icon}</span>
                <Badge className={`${status?.color} text-white text-xs`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status?.label}
                </Badge>
              </div>
              <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {project.description || "Không có mô tả"}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onUpdate({ status: "in_progress" })}>
                  <Play className="h-4 w-4 mr-2" />
                  Bắt đầu thực hiện
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdate({ status: "on_hold" })}>
                  <Pause className="h-4 w-4 mr-2" />
                  Tạm dừng
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdate({ status: "completed" })}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Đánh dấu hoàn thành
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end space-y-3">
          {/* Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tiến độ</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            {project.target_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {daysUntilTarget !== null && daysUntilTarget > 0
                    ? `Còn ${daysUntilTarget} ngày`
                    : daysUntilTarget === 0
                    ? "Hôm nay"
                    : `Quá ${Math.abs(daysUntilTarget!)} ngày`}
                </span>
              </div>
            )}
            {project.budget_estimate && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>{formatCurrency(project.budget_estimate, project.currency)}</span>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground pt-2 border-t">
            Tạo {new Date(project.created_at).toLocaleDateString("vi-VN")}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
