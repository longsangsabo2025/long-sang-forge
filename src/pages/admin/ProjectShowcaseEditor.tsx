/**
 * Project Showcase Full Editor - Đầy đủ tất cả fields
 * Bao gồm: Basic info, Hero, Media, Tech, Features, Metrics, Timeline
 */

import { ImageUpload } from "@/components/admin/ImageUpload";
import { ProjectInfoGuideDialog } from "@/components/admin/ProjectInfoGuideDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  BarChart3,
  Code,
  ExternalLink,
  Film,
  Image,
  Info,
  Layout,
  Loader2,
  Plus,
  Save,
  Settings,
  Star,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface ProjectData {
  id?: string;
  // Basic
  name: string;
  slug: string;
  description: string;
  category: string;
  status: string;
  progress: number;

  // URLs
  production_url: string;
  logo_url: string;
  video_url: string;
  github_url: string;

  // Hero Section
  hero_title: string;
  hero_description: string;
  hero_stats: Array<{ icon: string; label: string; value: string; color: string }>;

  // Overview
  overview_title: string;
  overview_description: string;
  objectives: string[];
  impacts: string[];

  // Media
  screenshots: Array<{ url: string; caption: string }>;

  // Tech
  tech_stack: Array<{ name: string; category: string; iconifyIcon?: string }>;
  tech_summary: string;

  // Features
  features: Array<{ icon: string; title: string; color: string; points: string[] }>;
  key_features: string[];

  // Metrics
  metrics: Array<{ label: string; value: string; unit: string }>;
  performance: Array<{ label: string; value: string }>;
  infrastructure: Array<{ label: string; value: string }>;

  // Project Meta
  my_role: string;
  team_size: number;
  start_date: string;
  end_date: string;

  // Display
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  display_type: string;
}

const INITIAL_DATA: ProjectData = {
  name: "",
  slug: "",
  description: "",
  category: "Web App",
  status: "development",
  progress: 0,
  production_url: "",
  logo_url: "",
  video_url: "",
  github_url: "",
  hero_title: "",
  hero_description: "",
  hero_stats: [],
  overview_title: "TỔNG QUAN DỰ ÁN",
  overview_description: "",
  objectives: [],
  impacts: [],
  screenshots: [],
  tech_stack: [],
  tech_summary: "",
  features: [],
  key_features: [],
  metrics: [],
  performance: [],
  infrastructure: [],
  my_role: "Full-stack Developer",
  team_size: 1,
  start_date: "",
  end_date: "",
  is_featured: false,
  is_active: true,
  display_order: 0,
  display_type: "",
};

const CATEGORIES = ["Mobile App", "Web App", "AI Platform", "E-commerce", "SaaS", "Desktop App"];
const STATUSES = [
  { value: "live", label: "🟢 Live", color: "bg-green-500" },
  { value: "development", label: "🟡 Development", color: "bg-yellow-500" },
  { value: "planned", label: "🔵 Planned", color: "bg-blue-500" },
  { value: "maintenance", label: "🟠 Maintenance", color: "bg-orange-500" },
];
const TECH_CATEGORIES = ["Frontend", "Backend", "Database", "DevOps", "AI/ML", "Mobile", "Other"];
const ICON_OPTIONS = ["Zap", "Code", "Database", "Users", "BarChart3", "Globe", "Shield", "Cpu"];
const COLOR_OPTIONS = ["cyan", "blue", "green", "purple", "orange", "pink"];
const ROLE_OPTIONS = [
  "Full-stack Developer",
  "Lead Developer",
  "Frontend Developer",
  "Backend Developer",
  "Project Manager",
  "Tech Lead",
  "Solo Developer",
];

const DISPLAY_TYPES = [
  { value: "", label: "🔄 Auto-detect (từ Category)" },
  { value: "phone", label: "📱 Phone Mockup" },
  { value: "browser", label: "🖥️ Browser Mockup" },
  { value: "tablet", label: "📱 Tablet Mockup" },
  { value: "responsive", label: "🔀 Responsive (Toggle)" },
];

export default function ProjectShowcaseEditor() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ProjectData>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState("basic");

  const isEditing = projectId && projectId !== "new";

  useEffect(() => {
    if (isEditing) loadProject();
  }, [projectId]);

  const loadProject = async () => {
    setLoading(true);
    const { data: project, error } = await supabase
      .from("project_showcase")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    setData({
      id: project.id,
      name: project.name || "",
      slug: project.slug || "",
      description: project.description || "",
      category: project.category || "Web App",
      status: project.status || "development",
      progress: project.progress || 0,
      production_url: project.production_url || "",
      logo_url: project.logo_url || "",
      video_url: project.video_url || "",
      github_url: project.github_url || "",
      hero_title: project.hero_title || "",
      hero_description: project.hero_description || "",
      hero_stats: project.hero_stats || [],
      overview_title: project.overview_title || "TỔNG QUAN DỰ ÁN",
      overview_description: project.overview_description || "",
      objectives: project.objectives || [],
      impacts: project.impacts || [],
      screenshots: project.screenshots || [],
      tech_stack: project.tech_stack || [],
      tech_summary: project.tech_summary || "",
      features: project.features || [],
      key_features: project.key_features || [],
      metrics: project.metrics || [],
      performance: project.performance || [],
      infrastructure: project.infrastructure || [],
      my_role: project.my_role || "Full-stack Developer",
      team_size: project.team_size || 1,
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      is_featured: project.is_featured || false,
      is_active: project.is_active !== false,
      display_order: project.display_order || 0,
      display_type: project.display_type || "",
    });
    setLoading(false);
  };

  const handleSave = async () => {
    if (!data.name || !data.slug) {
      toast({ title: "Lỗi", description: "Tên và slug là bắt buộc", variant: "destructive" });
      return;
    }

    setSaving(true);

    const { id, ...payload } = data;

    let error;
    if (isEditing) {
      ({ error } = await supabase.from("project_showcase").update(payload).eq("id", projectId));
    } else {
      ({ error } = await supabase.from("project_showcase").insert(payload));
    }

    setSaving(false);

    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "✅ Thành công!", description: isEditing ? "Đã cập nhật" : "Đã tạo mới" });
    navigate("/admin/projects");
  };

  const updateField = <K extends keyof ProjectData>(field: K, value: ProjectData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  // Array helpers
  const addToArray = <T,>(field: keyof ProjectData, item: T) => {
    setData((prev) => ({ ...prev, [field]: [...(prev[field] as T[]), item] }));
  };

  const removeFromArray = (field: keyof ProjectData, index: number) => {
    setData((prev) => ({
      ...prev,
      [field]: (prev[field] as unknown[]).filter((_, i) => i !== index),
    }));
  };

  const updateArrayItem = <T,>(field: keyof ProjectData, index: number, value: T) => {
    setData((prev) => ({
      ...prev,
      [field]: (prev[field] as T[]).map((item, i) => (i === index ? value : item)),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-background/95 backdrop-blur z-10 py-4 -mt-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/projects")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? data.name || "Edit Project" : "Thêm Project Mới"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditing ? `Slug: ${data.slug}` : "Điền thông tin chi tiết dự án"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ProjectInfoGuideDialog
            onImport={(importedData) => setData((prev) => ({ ...prev, ...importedData }))}
          />
          {data.production_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={data.production_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview
              </a>
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">Cơ Bản</span>
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <span className="hidden sm:inline">Hero</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Media</span>
          </TabsTrigger>
          <TabsTrigger value="tech" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">Tech</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Features</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Metrics</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Basic Info */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📋 Thông Tin Cơ Bản</CardTitle>
              <CardDescription>Thông tin chính của dự án</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tên Project *</Label>
                  <Input
                    value={data.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="VD: SABO Arena"
                  />
                </div>
                <div>
                  <Label>Slug (URL) *</Label>
                  <Input
                    value={data.slug}
                    onChange={(e) => updateField("slug", e.target.value)}
                    placeholder="VD: sabo-arena"
                  />
                </div>
              </div>

              <div>
                <Label>Mô tả ngắn</Label>
                <Textarea
                  value={data.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Mô tả ngắn gọn về project..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Danh mục</Label>
                  <select
                    className="w-full h-10 px-3 border rounded-md bg-background"
                    value={data.category}
                    onChange={(e) => updateField("category", e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <select
                    className="w-full h-10 px-3 border rounded-md bg-background"
                    value={data.status}
                    onChange={(e) => updateField("status", e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Progress (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={data.progress}
                    onChange={(e) => updateField("progress", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔗 Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>🌐 Production URL</Label>
                  <Input
                    value={data.production_url}
                    onChange={(e) => updateField("production_url", e.target.value)}
                    placeholder="https://myapp.com"
                  />
                </div>
                <div>
                  <Label>🐙 GitHub URL</Label>
                  <Input
                    value={data.github_url}
                    onChange={(e) => updateField("github_url", e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>🖼️ Logo URL</Label>
                  <ImageUpload
                    value={data.logo_url}
                    onChange={(url) => updateField("logo_url", url)}
                    folder="logos"
                  />
                </div>
                <div>
                  <Label>🎬 Video Demo URL</Label>
                  <Input
                    value={data.video_url}
                    onChange={(e) => updateField("video_url", e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Users className="inline h-5 w-5 mr-2" />
                Thông Tin Dự Án
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vai trò của bạn</Label>
                  <select
                    className="w-full h-10 px-3 border rounded-md bg-background"
                    value={data.my_role}
                    onChange={(e) => updateField("my_role", e.target.value)}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Số thành viên</Label>
                  <Input
                    type="number"
                    min={1}
                    value={data.team_size}
                    onChange={(e) => updateField("team_size", parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ngày bắt đầu</Label>
                  <Input
                    type="date"
                    value={data.start_date}
                    onChange={(e) => updateField("start_date", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Ngày kết thúc (để trống nếu đang tiếp tục)</Label>
                  <Input
                    type="date"
                    value={data.end_date}
                    onChange={(e) => updateField("end_date", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Settings className="inline h-5 w-5 mr-2" />
                Cài Đặt Hiển Thị
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Hiển thị trên Portfolio</Label>
                  <p className="text-sm text-muted-foreground">
                    Project có hiển thị công khai không
                  </p>
                </div>
                <Switch
                  checked={data.is_active}
                  onCheckedChange={(v) => updateField("is_active", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Featured Project</Label>
                  <p className="text-sm text-muted-foreground">Hiển thị nổi bật ở trang chủ</p>
                </div>
                <Switch
                  checked={data.is_featured}
                  onCheckedChange={(v) => updateField("is_featured", v)}
                />
              </div>
              <div>
                <Label>Thứ tự hiển thị</Label>
                <Input
                  type="number"
                  value={data.display_order}
                  onChange={(e) => updateField("display_order", parseInt(e.target.value) || 0)}
                  className="w-24"
                />
              </div>
              <div>
                <Label>Kiểu hiển thị Screenshots</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Chọn mockup phù hợp với loại project (hoặc để Auto-detect)
                </p>
                <select
                  className="w-full h-10 px-3 border rounded-md bg-background"
                  value={data.display_type}
                  onChange={(e) => updateField("display_type", e.target.value)}
                >
                  {DISPLAY_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>
                      {dt.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Hero Section */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🎯 Hero Section</CardTitle>
              <CardDescription>Phần đầu trang showcase project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hero Title</Label>
                <Input
                  value={data.hero_title}
                  onChange={(e) => updateField("hero_title", e.target.value)}
                  placeholder="VD: SABO ARENA"
                  className="text-lg font-bold"
                />
              </div>
              <div>
                <Label>Hero Description</Label>
                <Textarea
                  value={data.hero_description}
                  onChange={(e) => updateField("hero_description", e.target.value)}
                  placeholder="Mô tả chi tiết hiển thị trên hero section..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>📊 Hero Stats</CardTitle>
                <CardDescription>Các con số nổi bật (max 4)</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  addToArray("hero_stats", { icon: "Users", label: "", value: "", color: "cyan" })
                }
                disabled={data.hero_stats.length >= 4}
              >
                <Plus className="h-4 w-4 mr-1" /> Thêm
              </Button>
            </CardHeader>
            <CardContent>
              {data.hero_stats.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Chưa có stats. Bấm "Thêm" để thêm.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.hero_stats.map((stat, i) => (
                    <div key={i} className="flex gap-2 items-center p-3 border rounded-lg">
                      <select
                        className="h-9 px-2 border rounded bg-background"
                        value={stat.icon}
                        onChange={(e) =>
                          updateArrayItem("hero_stats", i, { ...stat, icon: e.target.value })
                        }
                      >
                        {ICON_OPTIONS.map((icon) => (
                          <option key={icon}>{icon}</option>
                        ))}
                      </select>
                      <Input
                        value={stat.label}
                        onChange={(e) =>
                          updateArrayItem("hero_stats", i, { ...stat, label: e.target.value })
                        }
                        placeholder="Label (VD: Active Users)"
                        className="flex-1"
                      />
                      <Input
                        value={stat.value}
                        onChange={(e) =>
                          updateArrayItem("hero_stats", i, { ...stat, value: e.target.value })
                        }
                        placeholder="Value (VD: 1,500+)"
                        className="w-28"
                      />
                      <select
                        className="h-9 px-2 border rounded bg-background"
                        value={stat.color}
                        onChange={(e) =>
                          updateArrayItem("hero_stats", i, { ...stat, color: e.target.value })
                        }
                      >
                        {COLOR_OPTIONS.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromArray("hero_stats", i)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📝 Overview Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Overview Title</Label>
                <Input
                  value={data.overview_title}
                  onChange={(e) => updateField("overview_title", e.target.value)}
                  placeholder="TỔNG QUAN DỰ ÁN"
                />
              </div>
              <div>
                <Label>Overview Description</Label>
                <Textarea
                  value={data.overview_description}
                  onChange={(e) => updateField("overview_description", e.target.value)}
                  placeholder="Mô tả tổng quan dự án..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  <Target className="inline h-5 w-5 mr-2" />
                  Objectives (Mục tiêu)
                </CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => addToArray("objectives", "")}>
                <Plus className="h-4 w-4 mr-1" /> Thêm
              </Button>
            </CardHeader>
            <CardContent>
              {data.objectives.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Chưa có mục tiêu.</p>
              ) : (
                <div className="space-y-2">
                  {data.objectives.map((obj, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={obj}
                        onChange={(e) => updateArrayItem("objectives", i, e.target.value)}
                        placeholder="VD: Tăng hiệu suất quản lý 50%"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromArray("objectives", i)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>📈 Impacts (Kết quả đạt được)</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => addToArray("impacts", "")}>
                <Plus className="h-4 w-4 mr-1" /> Thêm
              </Button>
            </CardHeader>
            <CardContent>
              {data.impacts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Chưa có impacts.</p>
              ) : (
                <div className="space-y-2">
                  {data.impacts.map((impact, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={impact}
                        onChange={(e) => updateArrayItem("impacts", i, e.target.value)}
                        placeholder="VD: Giảm 30% thời gian xử lý"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromArray("impacts", i)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Media */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>📸 Screenshots</CardTitle>
                <CardDescription>Hình ảnh demo ứng dụng</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addToArray("screenshots", { url: "", caption: "" })}
              >
                <Plus className="h-4 w-4 mr-1" /> Thêm
              </Button>
            </CardHeader>
            <CardContent>
              {data.screenshots.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Chưa có screenshot. Bấm "Thêm" để thêm mới.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {data.screenshots.map((ss, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <ImageUpload
                        value={ss.url}
                        onChange={(url) => updateArrayItem("screenshots", i, { ...ss, url })}
                        folder="screenshots"
                      />
                      <Input
                        value={ss.caption}
                        onChange={(e) =>
                          updateArrayItem("screenshots", i, { ...ss, caption: e.target.value })
                        }
                        placeholder="Caption (VD: Dashboard chính)"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => removeFromArray("screenshots", i)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Xóa
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {data.video_url && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <Film className="inline h-5 w-5 mr-2" />
                  Video Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  {data.video_url.includes("youtube") ? (
                    <iframe
                      src={data.video_url.replace("watch?v=", "embed/")}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  ) : (
                    <a
                      href={data.video_url}
                      target="_blank"
                      className="text-primary hover:underline"
                    >
                      {data.video_url}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 4: Tech Stack */}
        <TabsContent value="tech" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>🛠️ Tech Stack</CardTitle>
                <CardDescription>Công nghệ sử dụng trong dự án</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  addToArray("tech_stack", { name: "", category: "Frontend", iconifyIcon: "" })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Thêm
              </Button>
            </CardHeader>
            <CardContent>
              {data.tech_stack.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Chưa có tech stack.</p>
              ) : (
                <div className="space-y-2">
                  {data.tech_stack.map((tech, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        value={tech.name}
                        onChange={(e) =>
                          updateArrayItem("tech_stack", i, { ...tech, name: e.target.value })
                        }
                        placeholder="React, Node.js..."
                        className="flex-1"
                      />
                      <select
                        className="h-10 px-2 border rounded-md bg-background"
                        value={tech.category}
                        onChange={(e) =>
                          updateArrayItem("tech_stack", i, { ...tech, category: e.target.value })
                        }
                      >
                        {TECH_CATEGORIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                      <Input
                        value={tech.iconifyIcon || ""}
                        onChange={(e) =>
                          updateArrayItem("tech_stack", i, { ...tech, iconifyIcon: e.target.value })
                        }
                        placeholder="logos:react"
                        className="w-32"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromArray("tech_stack", i)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 Icon: Dùng{" "}
                  <a
                    href="https://icon-sets.iconify.design/"
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    Iconify
                  </a>{" "}
                  format, VD: logos:react, logos:nodejs-icon, logos:postgresql
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Performance & Infrastructure</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              {/* Performance */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Performance Metrics</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addToArray("performance", { label: "", value: "" })}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {data.performance.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={p.label}
                      onChange={(e) =>
                        updateArrayItem("performance", i, { ...p, label: e.target.value })
                      }
                      placeholder="API Response"
                      className="flex-1"
                    />
                    <Input
                      value={p.value}
                      onChange={(e) =>
                        updateArrayItem("performance", i, { ...p, value: e.target.value })
                      }
                      placeholder="<100ms"
                      className="w-24"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromArray("performance", i)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Infrastructure */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Infrastructure</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addToArray("infrastructure", { label: "", value: "" })}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {data.infrastructure.map((inf, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={inf.label}
                      onChange={(e) =>
                        updateArrayItem("infrastructure", i, { ...inf, label: e.target.value })
                      }
                      placeholder="Hosting"
                      className="flex-1"
                    />
                    <Input
                      value={inf.value}
                      onChange={(e) =>
                        updateArrayItem("infrastructure", i, { ...inf, value: e.target.value })
                      }
                      placeholder="Vercel"
                      className="w-32"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromArray("infrastructure", i)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: Features */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>⚡ Key Features (Đơn giản)</CardTitle>
                <CardDescription>Danh sách tính năng chính</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => addToArray("key_features", "")}>
                <Plus className="h-4 w-4 mr-1" /> Thêm
              </Button>
            </CardHeader>
            <CardContent>
              {data.key_features.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Chưa có tính năng.</p>
              ) : (
                <div className="space-y-2">
                  {data.key_features.map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={f}
                        onChange={(e) => updateArrayItem("key_features", i, e.target.value)}
                        placeholder="VD: Realtime booking system"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromArray("key_features", i)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>🌟 Features Chi Tiết</CardTitle>
                <CardDescription>Tính năng với mô tả và bullet points</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  addToArray("features", { icon: "Zap", title: "", color: "cyan", points: [] })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Thêm
              </Button>
            </CardHeader>
            <CardContent>
              {data.features.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Chưa có features chi tiết.</p>
              ) : (
                <div className="space-y-4">
                  {data.features.map((feature, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <div className="flex gap-2 items-center">
                        <select
                          className="h-9 px-2 border rounded bg-background"
                          value={feature.icon}
                          onChange={(e) =>
                            updateArrayItem("features", i, { ...feature, icon: e.target.value })
                          }
                        >
                          {ICON_OPTIONS.map((icon) => (
                            <option key={icon}>{icon}</option>
                          ))}
                        </select>
                        <Input
                          value={feature.title}
                          onChange={(e) =>
                            updateArrayItem("features", i, { ...feature, title: e.target.value })
                          }
                          placeholder="Tên tính năng"
                          className="flex-1"
                        />
                        <select
                          className="h-9 px-2 border rounded bg-background"
                          value={feature.color}
                          onChange={(e) =>
                            updateArrayItem("features", i, { ...feature, color: e.target.value })
                          }
                        >
                          {COLOR_OPTIONS.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromArray("features", i)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="pl-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Bullet points:</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateArrayItem("features", i, {
                                ...feature,
                                points: [...feature.points, ""],
                              })
                            }
                          >
                            <Plus className="h-3 w-3 mr-1" /> Point
                          </Button>
                        </div>
                        {feature.points.map((point, pi) => (
                          <div key={pi} className="flex gap-2">
                            <span className="text-muted-foreground">•</span>
                            <Input
                              value={point}
                              onChange={(e) => {
                                const newPoints = [...feature.points];
                                newPoints[pi] = e.target.value;
                                updateArrayItem("features", i, { ...feature, points: newPoints });
                              }}
                              placeholder="Chi tiết..."
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newPoints = feature.points.filter((_, idx) => idx !== pi);
                                updateArrayItem("features", i, { ...feature, points: newPoints });
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: Metrics */}
        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>📊 Project Metrics</CardTitle>
                <CardDescription>Các số liệu nổi bật của dự án</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addToArray("metrics", { label: "", value: "", unit: "" })}
              >
                <Plus className="h-4 w-4 mr-1" /> Thêm
              </Button>
            </CardHeader>
            <CardContent>
              {data.metrics.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Chưa có metrics.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {data.metrics.map((m, i) => (
                    <div key={i} className="flex gap-2 items-center p-3 border rounded-lg">
                      <Input
                        value={m.label}
                        onChange={(e) =>
                          updateArrayItem("metrics", i, { ...m, label: e.target.value })
                        }
                        placeholder="Label (VD: Users)"
                        className="flex-1"
                      />
                      <Input
                        value={m.value}
                        onChange={(e) =>
                          updateArrayItem("metrics", i, { ...m, value: e.target.value })
                        }
                        placeholder="1,500+"
                        className="w-24"
                      />
                      <Input
                        value={m.unit}
                        onChange={(e) =>
                          updateArrayItem("metrics", i, { ...m, unit: e.target.value })
                        }
                        placeholder="Unit"
                        className="w-20"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromArray("metrics", i)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Preview Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">Screenshots</p>
                  <p className="text-2xl font-bold text-primary">{data.screenshots.length}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">Tech Stack</p>
                  <p className="text-2xl font-bold text-primary">{data.tech_stack.length}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">Features</p>
                  <p className="text-2xl font-bold text-primary">{data.features.length}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {data.is_active && <Badge className="bg-green-500">Active</Badge>}
                {data.is_featured && <Badge className="bg-yellow-500">Featured</Badge>}
                <Badge variant="outline">{data.category}</Badge>
                <Badge variant="outline">{data.status}</Badge>
                {data.my_role && <Badge variant="secondary">{data.my_role}</Badge>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
