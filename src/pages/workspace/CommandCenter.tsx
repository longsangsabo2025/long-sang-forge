/**
 * COMMAND CENTER - Unified Workspace Hub
 * ======================================
 * Elon Musk Style: One place to rule them all
 *
 * Gộp: Ideas Hub + My Projects + AI Settings
 * - Ideas & Projects trong tabs
 * - AI Settings trong drawer/modal
 */

import { UserSecondBrain } from "@/brain/components/user";
import AISettingsPanel from "@/components/ai/AISettingsPanel";
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
  DropdownMenuSeparator,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { WorkspaceIdeaChat } from "@/components/workspace/WorkspaceIdeaChat";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  ArrowLeft,
  Bot,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  FolderKanban,
  Lightbulb,
  MessageCircle,
  MoreVertical,
  Pause,
  Pin,
  Play,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Target,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Cast để bypass strict types cho tables chưa có trong generated types

const supabaseAny = supabase as any;

// Helper: Mở chat với context ý tưởng
const IDEA_CHAT_PROMPT =
  "Tôi muốn phát triển một ý tưởng mới. Bạn có thể giúp tôi brainstorm và lên kế hoạch không?";

// ============================================
// TYPES
// ============================================
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
  source_idea_id?: string;
}

// ============================================
// CONSTANTS
// ============================================
const ideaCategories = [
  { value: "general", label: "Chung", color: "#6B7280" },
  { value: "business", label: "Business", color: "#3B82F6" },
  { value: "product", label: "Product", color: "#10B981" },
  { value: "marketing", label: "Marketing", color: "#F59E0B" },
  { value: "tech", label: "Tech", color: "#8B5CF6" },
  { value: "personal", label: "Cá nhân", color: "#EC4899" },
];

const ideaStatusOptions = [
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

const projectCategories = [
  { value: "personal", label: "Cá nhân", icon: "👤" },
  { value: "business", label: "Business", icon: "💼" },
  { value: "tech", label: "Tech/Dev", icon: "💻" },
  { value: "creative", label: "Creative", icon: "🎨" },
  { value: "learning", label: "Học tập", icon: "📚" },
  { value: "other", label: "Khác", icon: "📌" },
];

const projectStatusOptions = [
  { value: "planning", label: "Đang lên kế hoạch", icon: Target, color: "bg-slate-500" },
  { value: "in_progress", label: "Đang thực hiện", icon: Play, color: "bg-blue-500" },
  { value: "on_hold", label: "Tạm dừng", icon: Pause, color: "bg-yellow-500" },
  { value: "completed", label: "Hoàn thành", icon: CheckCircle2, color: "bg-green-500" },
  { value: "cancelled", label: "Đã hủy", icon: XCircle, color: "bg-red-500" },
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function CommandCenter() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("ideas");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);

  // Ideas view mode: "list" or "chat"
  const [ideaViewMode, setIdeaViewMode] = useState<"list" | "chat">("list");

  // Handler: Toggle to chat mode for brainstorming
  const handleBrainstormIdea = () => {
    setIdeaViewMode("chat");
  };

  // Handler: When idea is saved from chat, switch back to list
  const handleIdeaSaved = () => {
    setIdeaViewMode("list");
    queryClient.invalidateQueries({ queryKey: ["user-ideas"] });
  };

  // Handler: Convert idea to project from chat
  const handleConvertToProject = async (ideaId: string) => {
    // Find the idea
    const idea = ideas.find((i) => i.id === ideaId);
    if (!idea) {
      toast.error("Không tìm thấy ý tưởng");
      return;
    }
    await graduateToProject(idea);
    setIdeaViewMode("list");
  };

  // ============================================
  // IDEAS STATE & LOGIC
  // ============================================
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateIdeaOpen, setIsCreateIdeaOpen] = useState(false);
  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    category: "general",
    priority: "medium",
  });

  // Fetch ideas
  const { data: ideas = [], isLoading: ideasLoading } = useQuery({
    queryKey: ["user-ideas", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabaseAny
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
  const createIdeaMutation = useMutation({
    mutationFn: async (idea: typeof newIdea) => {
      const { data, error } = await supabaseAny
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
      setIsCreateIdeaOpen(false);
      setNewIdea({ title: "", description: "", category: "general", priority: "medium" });
      toast.success("💡 Ý tưởng đã được tạo!");
    },
    onError: (error) => {
      toast.error("Lỗi khi tạo ý tưởng: " + error.message);
    },
  });

  // Update idea mutation
  const updateIdeaMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Idea> }) => {
      const { error } = await supabaseAny
        .from("user_ideas")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-ideas"] });
    },
  });

  // Delete idea mutation
  const deleteIdeaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAny.from("user_ideas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-ideas"] });
      toast.success("Đã xóa ý tưởng");
    },
  });

  // ============================================
  // PROJECTS STATE & LOGIC
  // ============================================
  const [filterProjectStatus, setFilterProjectStatus] = useState("all");
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    category: "personal",
    target_date: "",
    budget_estimate: "",
  });

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["user-projects", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabaseAny
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
  const createProjectMutation = useMutation({
    mutationFn: async (project: typeof newProject) => {
      const { data, error } = await supabaseAny
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
      setIsCreateProjectOpen(false);
      setNewProject({
        name: "",
        description: "",
        category: "personal",
        target_date: "",
        budget_estimate: "",
      });
      toast.success("🚀 Dự án đã được tạo!");
    },
    onError: (error) => {
      toast.error("Lỗi khi tạo dự án: " + error.message);
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const { error } = await supabaseAny
        .from("user_projects")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-projects"] });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAny.from("user_projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-projects"] });
      toast.success("Đã xóa dự án");
    },
  });

  // ============================================
  // GRADUATE: Idea → Project
  // ============================================
  const graduateToProject = async (idea: Idea) => {
    try {
      // Create project from idea
      const { data, error } = await supabaseAny
        .from("user_projects")
        .insert({
          user_id: user?.id,
          name: idea.title,
          description: idea.description,
          category: idea.category === "business" ? "business" : "personal",
          source_idea_id: idea.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update idea status to completed
      await updateIdeaMutation.mutateAsync({
        id: idea.id,
        updates: { status: "completed" },
      });

      queryClient.invalidateQueries({ queryKey: ["user-projects"] });
      toast.success("🎉 Ý tưởng đã được chuyển thành dự án!", {
        description: `Dự án "${idea.title}" đã được tạo.`,
      });
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    }
  };

  // ============================================
  // FILTER LOGIC
  // ============================================
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || idea.category === filterCategory;
    const matchesStatus = filterStatus === "all" || idea.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterProjectStatus === "all" || project.status === filterProjectStatus;
    return matchesSearch && matchesStatus;
  });

  // ============================================
  // STATS
  // ============================================
  const stats = {
    totalIdeas: ideas.length,
    activeIdeas: ideas.filter((i) => i.status === "in_progress").length,
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "in_progress").length,
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Zap className="h-7 w-7 text-primary" />
            Workspace
          </h1>
          <p className="text-muted-foreground mt-1">Quản lý ý tưởng & dự án tại một nơi duy nhất</p>
        </div>

        {/* AI Settings Button (opens drawer) */}
        <Sheet open={aiSettingsOpen} onOpenChange={setAiSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">AI Settings</span>
              <Badge variant="secondary" className="text-xs">
                Pro
              </Badge>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Cài đặt AI Cá nhân hóa
              </SheetTitle>
              <SheetDescription>Tùy chỉnh trợ lý AI theo phong cách của bạn</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <AISettingsPanel />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalIdeas}</p>
                <p className="text-xs text-muted-foreground">Ý tưởng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeIdeas}</p>
                <p className="text-xs text-muted-foreground">Đang thực hiện</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FolderKanban className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
                <p className="text-xs text-muted-foreground">Dự án</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Rocket className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeProjects}</p>
                <p className="text-xs text-muted-foreground">Dự án active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm ý tưởng hoặc dự án..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-3">
            <TabsTrigger value="ideas" className="gap-2">
              <Lightbulb className="h-4 w-4" />Ý tưởng
              <Badge variant="secondary" className="ml-1">
                {ideas.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <FolderKanban className="h-4 w-4" />
              Dự án
              <Badge variant="secondary" className="ml-1">
                {projects.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="brain" className="gap-2">
              <Brain className="h-4 w-4" />
              Second Brain
            </TabsTrigger>
          </TabsList>

          {/* Create Button */}
          {activeTab === "ideas" ? (
            <div className="flex gap-2">
              {/* Primary: Brainstorm với AI */}
              <Button onClick={handleBrainstormIdea} className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Brainstorm với AI
              </Button>
              {/* Secondary: Form nhanh */}
              <Dialog open={isCreateIdeaOpen} onOpenChange={setIsCreateIdeaOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" title="Tạo nhanh">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Tạo ý tưởng mới
                    </DialogTitle>
                    <DialogDescription>Ghi lại ý tưởng của bạn để phát triển sau</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Tiêu đề *</Label>
                      <Input
                        placeholder="Ý tưởng kinh doanh mới..."
                        value={newIdea.title}
                        onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mô tả</Label>
                      <Textarea
                        placeholder="Chi tiết về ý tưởng..."
                        value={newIdea.description}
                        onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                        rows={3}
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
                            {ideaCategories.map((cat) => (
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
                            {priorityOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => createIdeaMutation.mutate(newIdea)}
                      disabled={!newIdea.title || createIdeaMutation.isPending}
                    >
                      {createIdeaMutation.isPending ? "Đang tạo..." : "Tạo ý tưởng"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : activeTab === "projects" ? (
            <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Dự án mới
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-green-500" />
                    Tạo dự án mới
                  </DialogTitle>
                  <DialogDescription>Quản lý và theo dõi tiến độ dự án của bạn</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Tên dự án *</Label>
                    <Input
                      placeholder="Website bán hàng..."
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mô tả</Label>
                    <Textarea
                      placeholder="Chi tiết về dự án..."
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({ ...newProject, description: e.target.value })
                      }
                      rows={3}
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
                        onChange={(e) =>
                          setNewProject({ ...newProject, target_date: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Ngân sách dự kiến (VNĐ)</Label>
                    <Input
                      type="number"
                      placeholder="10000000"
                      value={newProject.budget_estimate}
                      onChange={(e) =>
                        setNewProject({ ...newProject, budget_estimate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => createProjectMutation.mutate(newProject)}
                    disabled={!newProject.name || createProjectMutation.isPending}
                  >
                    {createProjectMutation.isPending ? "Đang tạo..." : "Tạo dự án"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>

        {/* IDEAS TAB */}
        <TabsContent value="ideas" className="space-y-4">
          {ideaViewMode === "chat" ? (
            <>
              {/* Back to list button */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIdeaViewMode("list")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại danh sách
                </Button>
                <span className="text-sm text-muted-foreground">
                  Brainstorm với Long Sang AI • Ý tưởng tự động lưu
                </span>
              </div>
              {/* Embedded Chat */}
              <WorkspaceIdeaChat
                onIdeaSaved={handleIdeaSaved}
                onConvertToProject={handleConvertToProject}
              />
            </>
          ) : (
            <>
              {/* Filters + Brainstorm button */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {ideaCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {ideaStatusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleBrainstormIdea} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Brainstorm với AI
                </Button>
              </div>

              {/* Ideas Grid */}
              {ideasLoading ? (
                <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
              ) : filteredIdeas.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <MessageCircle className="h-12 w-12 mx-auto text-primary/50 mb-4" />
                    <h3 className="font-semibold mb-2">Chưa có ý tưởng nào</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Hãy brainstorm với Long Sang AI để phát triển ý tưởng
                    </p>
                    <Button onClick={handleBrainstormIdea}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Bắt đầu với AI
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {filteredIdeas.map((idea) => {
                      const category = ideaCategories.find((c) => c.value === idea.category);
                      const status = ideaStatusOptions.find((s) => s.value === idea.status);
                      const priority = priorityOptions.find((p) => p.value === idea.priority);

                      return (
                        <motion.div
                          key={idea.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                        >
                          <Card
                            className={`relative overflow-hidden transition-all hover:shadow-lg ${
                              idea.is_pinned ? "ring-2 ring-yellow-500/50" : ""
                            }`}
                          >
                            {/* Category color bar */}
                            <div
                              className="absolute top-0 left-0 right-0 h-1"
                              style={{ backgroundColor: category?.color }}
                            />

                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base flex items-center gap-2">
                                    {idea.is_pinned && <Pin className="h-3 w-3 text-yellow-500" />}
                                    <span className="truncate">{idea.title}</span>
                                  </CardTitle>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {category?.label}
                                    </Badge>
                                    <Badge className={`text-xs ${priority?.color} text-white`}>
                                      {priority?.label}
                                    </Badge>
                                  </div>
                                </div>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        updateIdeaMutation.mutate({
                                          id: idea.id,
                                          updates: { is_pinned: !idea.is_pinned },
                                        })
                                      }
                                    >
                                      <Pin className="h-4 w-4 mr-2" />
                                      {idea.is_pinned ? "Bỏ ghim" : "Ghim lên đầu"}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {ideaStatusOptions.map((opt) => (
                                      <DropdownMenuItem
                                        key={opt.value}
                                        onClick={() =>
                                          updateIdeaMutation.mutate({
                                            id: idea.id,
                                            updates: { status: opt.value },
                                          })
                                        }
                                      >
                                        <opt.icon className="h-4 w-4 mr-2" />
                                        {opt.label}
                                      </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => graduateToProject(idea)}
                                      className="text-green-600"
                                    >
                                      <Rocket className="h-4 w-4 mr-2" />
                                      Chuyển thành dự án
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => deleteIdeaMutation.mutate(idea.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Xóa
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardHeader>

                            <CardContent>
                              {idea.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {idea.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  {status && <status.icon className="h-3 w-3" />}
                                  {status?.label}
                                </span>
                                <span>{new Date(idea.created_at).toLocaleDateString("vi-VN")}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* PROJECTS TAB */}
        <TabsContent value="projects" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={filterProjectStatus} onValueChange={setFilterProjectStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {projectStatusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Projects Grid */}
          {projectsLoading ? (
            <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
          ) : filteredProjects.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">Chưa có dự án nào</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tạo dự án mới hoặc chuyển từ ý tưởng
                </p>
                <Button onClick={() => setIsCreateProjectOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo dự án đầu tiên
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => {
                  const category = projectCategories.find((c) => c.value === project.category);
                  const status = projectStatusOptions.find((s) => s.value === project.status);

                  return (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Card className="relative overflow-hidden transition-all hover:shadow-lg">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base flex items-center gap-2">
                                <span className="text-lg">{category?.icon}</span>
                                <span className="truncate">{project.name}</span>
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`text-xs ${status?.color} text-white`}>
                                  {status?.label}
                                </Badge>
                                {project.source_idea_id && (
                                  <Badge variant="outline" className="text-xs">
                                    💡 Từ ý tưởng
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {projectStatusOptions.map((opt) => (
                                  <DropdownMenuItem
                                    key={opt.value}
                                    onClick={() =>
                                      updateProjectMutation.mutate({
                                        id: project.id,
                                        updates: { status: opt.value },
                                      })
                                    }
                                  >
                                    <opt.icon className="h-4 w-4 mr-2" />
                                    {opt.label}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => deleteProjectMutation.mutate(project.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          {project.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {project.description}
                            </p>
                          )}

                          {/* Progress */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Tiến độ</span>
                              <span className="font-medium">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                          </div>

                          {/* Meta info */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {project.target_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(project.target_date).toLocaleDateString("vi-VN")}
                              </span>
                            )}
                            {project.budget_estimate && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {(project.budget_estimate / 1000000).toFixed(1)}M
                              </span>
                            )}
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

        {/* Second Brain Tab */}
        <TabsContent value="brain" className="space-y-4">
          <UserSecondBrain />
        </TabsContent>
      </Tabs>
    </div>
  );
}
