import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  FolderKanban,
  GraduationCap,
  Lightbulb,
  Plus,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WorkspaceDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["workspace-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return { ideas: 0, projects: 0, saved: 0 };

      const [ideasRes, projectsRes, savedRes] = await Promise.all([
        supabase
          .from("user_ideas")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("user_projects")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("saved_products")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      return {
        ideas: ideasRes.count || 0,
        projects: projectsRes.count || 0,
        saved: savedRes.count || 0,
      };
    },
    enabled: !!user?.id,
  });

  // Fetch recent ideas
  const { data: recentIdeas = [] } = useQuery({
    queryKey: ["recent-ideas", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("user_ideas")
        .select("id, title, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch recent projects
  const { data: recentProjects = [] } = useQuery({
    queryKey: ["recent-projects", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("user_projects")
        .select("id, name, status, progress, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const quickActions = [
    {
      icon: Lightbulb,
      title: "Ý tưởng mới",
      description: "Ghi lại ý tưởng",
      href: "/workspace/ideas",
      color: "from-yellow-500 to-orange-500",
      action: "new-idea",
    },
    {
      icon: FolderKanban,
      title: "Dự án mới",
      description: "Tạo dự án",
      href: "/workspace/projects",
      color: "from-green-500 to-emerald-500",
      action: "new-project",
    },
    {
      icon: Star,
      title: "Khám phá",
      description: "Xem Showcase",
      href: "/projects",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: GraduationCap,
      title: "Học tập",
      description: "AI Academy",
      href: "/academy",
      color: "from-purple-500 to-pink-500",
    },
  ];

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {userInitial}
        </div>
        <div>
          <h1 className="text-3xl font-bold">
            {getTimeGreeting()}, {userName}! 👋
          </h1>
          <p className="text-muted-foreground">Chào mừng bạn đến với workspace cá nhân</p>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20"
            onClick={() => navigate("/workspace/ideas")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ý tưởng</p>
                  <p className="text-3xl font-bold text-yellow-500">{stats?.ideas || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20"
            onClick={() => navigate("/workspace/projects")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dự án</p>
                  <p className="text-3xl font-bold text-green-500">{stats?.projects || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <FolderKanban className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20"
            onClick={() => navigate("/workspace/saved")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Đã lưu</p>
                  <p className="text-3xl font-bold text-purple-500">{stats?.saved || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Bookmark className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Hành động nhanh</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => navigate(action.href)}
              className="group bg-card border border-border/50 rounded-xl p-4 text-left hover:-translate-y-1 hover:shadow-lg transition-all"
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
              >
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Ideas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />Ý tưởng gần đây
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/workspace/ideas")}>
              Xem tất cả <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentIdeas.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">Chưa có ý tưởng nào</p>
                <Button size="sm" onClick={() => navigate("/workspace/ideas")}>
                  <Plus className="h-4 w-4 mr-1" />
                  Tạo ý tưởng
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentIdeas.map((idea: any) => (
                  <div
                    key={idea.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate("/workspace/ideas")}
                  >
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{idea.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(idea.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-green-500" />
                Dự án gần đây
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/workspace/projects")}>
              Xem tất cả <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">Chưa có dự án nào</p>
                <Button size="sm" onClick={() => navigate("/workspace/projects")}>
                  <Plus className="h-4 w-4 mr-1" />
                  Tạo dự án
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project: any) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate("/workspace/projects")}
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <FolderKanban className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{project.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>{project.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Explore Section */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <Star className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-semibold mb-2">Khám phá Product Showcase</h3>
              <p className="text-muted-foreground mb-4">
                Xem các dự án thực tế, case studies và tìm cảm hứng cho ý tưởng của bạn
              </p>
              <Button onClick={() => navigate("/projects")}>
                <Star className="h-4 w-4 mr-2" />
                Xem Showcase
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
