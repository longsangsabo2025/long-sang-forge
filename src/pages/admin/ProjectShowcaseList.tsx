/**
 * Project Showcase List - Danh sách các dự án showcase
 * Admin có thể xem, thêm, sửa, xóa dự án
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { projectsData } from "@/data/projects-data";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Database,
  Edit,
  ExternalLink,
  Eye,
  Layers,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProjectListItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  status: "live" | "development" | "planned" | "maintenance";
  progress: number;
  production_url: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG = {
  live: { label: "Live", color: "bg-green-500" },
  development: { label: "Development", color: "bg-yellow-500" },
  planned: { label: "Planned", color: "bg-blue-500" },
  maintenance: { label: "Maintenance", color: "bg-orange-500" },
};

export default function ProjectShowcaseList() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectListItem | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("project_showcase")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách dự án",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sync từ file tĩnh - tạo records cho các project chưa có trong DB
  const syncFromStaticData = async () => {
    setSyncing(true);
    try {
      // Lấy danh sách slug đã có trong DB
      const { data: existingSlugs } = await supabase.from("project_showcase").select("slug");

      const existingSet = new Set(existingSlugs?.map((p) => p.slug) || []);

      // Lọc các project chưa có trong DB
      const missingProjects = projectsData.filter((p) => p.slug && !existingSet.has(p.slug));

      if (missingProjects.length === 0) {
        toast({
          title: "Đã đồng bộ",
          description: "Tất cả dự án từ file tĩnh đã có trong database",
        });
        setSyncing(false);
        return;
      }

      // Insert các project thiếu
      const toInsert = missingProjects.map((p) => ({
        name: p.name,
        slug: p.slug,
        description: p.description,
        category: p.category,
        status: p.status || "development",
        progress: p.progress || 0,
        production_url: p.productionUrl || null,
        logo_url: p.logoUrl || null,
        screenshots: p.screenshots?.map((url) => ({ url, caption: "" })) || [],
        social_links: {},
        key_features: [],
        tech_summary: "",
      }));

      const { error } = await supabase.from("project_showcase").insert(toInsert);

      if (error) throw error;

      toast({
        title: "Đồng bộ thành công!",
        description: `Đã thêm ${missingProjects.length} dự án từ file tĩnh`,
      });

      loadProjects();
    } catch (error) {
      console.error("Error syncing:", error);
      toast({
        title: "Lỗi đồng bộ",
        description: error instanceof Error ? error.message : "Không thể đồng bộ",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;

    try {
      const { error } = await supabase
        .from("project_showcase")
        .delete()
        .eq("id", projectToDelete.id);

      if (error) throw error;

      toast({
        title: "Đã xóa",
        description: `Dự án "${projectToDelete.name}" đã được xóa`,
      });

      loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa dự án",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6" />
            Quản lý Project Showcase
          </h1>
          <p className="text-muted-foreground">
            Quản lý thông tin các dự án hiển thị trên trang showcase
          </p>
        </div>
        <Button onClick={() => navigate("/admin/projects/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm dự án mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-sm text-muted-foreground">Tổng dự án</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {projects.filter((p) => p.status === "live").length}
            </div>
            <p className="text-sm text-muted-foreground">Đang Live</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {projects.filter((p) => p.status === "development").length}
            </div>
            <p className="text-sm text-muted-foreground">Đang phát triển</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {projects.filter((p) => p.status === "planned").length}
            </div>
            <p className="text-sm text-muted-foreground">Kế hoạch</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm dự án..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={loadProjects}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="secondary" onClick={syncFromStaticData} disabled={syncing}>
              <Database className="h-4 w-4 mr-2" />
              {syncing ? "Đang sync..." : "Sync từ file tĩnh"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách dự án</CardTitle>
          <CardDescription>{filteredProjects.length} dự án</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Chưa có dự án nào</h3>
              <p className="text-muted-foreground mb-4">Bắt đầu bằng cách thêm dự án đầu tiên</p>
              <Button onClick={() => navigate("/admin/projects/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm dự án
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên dự án</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Tiến độ</TableHead>
                  <TableHead>Cập nhật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {project.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{project.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_CONFIG[project.status]?.color}>
                        {STATUS_CONFIG[project.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(project.updated_at).toLocaleDateString("vi-VN")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/projects/${project.slug}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem showcase
                          </DropdownMenuItem>
                          {project.production_url && (
                            <DropdownMenuItem
                              onClick={() => window.open(project.production_url!, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Mở trang web
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => navigate(`/admin/projects/${project.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setProjectToDelete(project);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa dự án?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa dự án "{projectToDelete?.name}"? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
