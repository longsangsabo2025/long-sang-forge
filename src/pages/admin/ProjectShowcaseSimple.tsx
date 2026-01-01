/**
 * Project Showcase Simple - Form đơn giản để cập nhật thông tin project
 * Chỉ những field thiết yếu: tên, mô tả, screenshots, links
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface ProjectData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  status: string;
  production_url: string;
  logo_url: string;

  // Hero Section
  hero_title: string;
  hero_description: string;

  // Screenshots
  screenshots: Array<{ url: string; caption: string }>;

  // Social Links
  social_links: {
    github?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    website?: string;
  };

  // Key Features (ngắn gọn)
  key_features: string[];

  // Tech stack với icon
  tech_stack: Array<{ name: string; category: string; iconifyIcon?: string }>;

  // Features chi tiết
  features: Array<{ icon: string; title: string; color: string; points: string[] }>;

  // Impacts
  impacts: string[];

  // Tech stack đơn giản
  tech_summary: string;
}

const INITIAL_DATA: ProjectData = {
  name: "",
  slug: "",
  description: "",
  category: "Web App",
  status: "development",
  production_url: "",
  logo_url: "",
  hero_title: "",
  hero_description: "",
  screenshots: [],
  social_links: {},
  tech_stack: [],
  features: [],
  impacts: [],
  key_features: [],
  tech_summary: "",
};

export default function ProjectShowcaseSimple() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProjectData>(INITIAL_DATA);

  const isEditing = projectId && projectId !== "new";

  // Load data if editing
  useEffect(() => {
    if (isEditing) {
      loadProject();
    }
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
      return;
    }

    setData({
      id: project.id,
      name: project.name || "",
      slug: project.slug || "",
      description: project.description || "",
      category: project.category || "Web App",
      status: project.status || "development",
      production_url: project.production_url || "",
      logo_url: project.logo_url || "",
      hero_title: project.hero_title || "",
      hero_description: project.hero_description || "",
      screenshots: project.screenshots || [],
      social_links: project.social_links || {},
      key_features: project.key_features || [],
      tech_stack: project.tech_stack || [],
      features: project.features || [],
      impacts: project.impacts || [],
      tech_summary: project.tech_summary || "",
    });
    setLoading(false);
  };

  const handleSave = async () => {
    if (!data.name || !data.slug) {
      toast({ title: "Lỗi", description: "Tên và slug là bắt buộc", variant: "destructive" });
      return;
    }

    setLoading(true);

    const payload = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      category: data.category,
      status: data.status,
      production_url: data.production_url,
      logo_url: data.logo_url,
      hero_title: data.hero_title,
      hero_description: data.hero_description,
      screenshots: data.screenshots,
      social_links: data.social_links,
      key_features: data.key_features,
      tech_stack: data.tech_stack,
      features: data.features,
      impacts: data.impacts,
      tech_summary: data.tech_summary,
    };

    let error;
    if (isEditing) {
      ({ error } = await supabase.from("project_showcase").update(payload).eq("id", projectId));
    } else {
      ({ error } = await supabase.from("project_showcase").insert(payload));
    }

    setLoading(false);

    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Thành công!", description: isEditing ? "Đã cập nhật" : "Đã tạo mới" });
    navigate("/admin/projects");
  };

  // Helper to update nested data
  const updateField = (field: keyof ProjectData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const addScreenshot = () => {
    setData((prev) => ({
      ...prev,
      screenshots: [...prev.screenshots, { url: "", caption: "" }],
    }));
  };

  const removeScreenshot = (index: number) => {
    setData((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index),
    }));
  };

  const updateScreenshot = (index: number, field: "url" | "caption", value: string) => {
    setData((prev) => ({
      ...prev,
      screenshots: prev.screenshots.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  };

  const addFeature = () => {
    setData((prev) => ({
      ...prev,
      key_features: [...prev.key_features, ""],
    }));
  };

  const removeFeature = (index: number) => {
    setData((prev) => ({
      ...prev,
      key_features: prev.key_features.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setData((prev) => ({
      ...prev,
      key_features: prev.key_features.map((f, i) => (i === index ? value : f)),
    }));
  };

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/projects")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? `Sửa: ${data.name}` : "Thêm Project Mới"}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* 1. Thông tin cơ bản */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Thông Tin Cơ Bản</CardTitle>
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
                  className="w-full h-10 px-3 border rounded-md"
                  value={data.category}
                  onChange={(e) => updateField("category", e.target.value)}
                >
                  <option>Mobile App</option>
                  <option>Web App</option>
                  <option>AI Platform</option>
                  <option>E-commerce</option>
                  <option>SaaS</option>
                </select>
              </div>
              <div>
                <Label>Trạng thái</Label>
                <select
                  className="w-full h-10 px-3 border rounded-md"
                  value={data.status}
                  onChange={(e) => updateField("status", e.target.value)}
                >
                  <option value="live">🟢 Live</option>
                  <option value="development">🟡 Development</option>
                  <option value="planned">🔵 Planned</option>
                  <option value="maintenance">🟠 Maintenance</option>
                </select>
              </div>
              <div>
                <Label>Tech Stack</Label>
                <Input
                  value={data.tech_summary}
                  onChange={(e) => updateField("tech_summary", e.target.value)}
                  placeholder="React, Node.js, PostgreSQL..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1.5 Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Hero Section (Trang Showcase)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Hero Title</Label>
              <Input
                value={data.hero_title}
                onChange={(e) => updateField("hero_title", e.target.value)}
                placeholder="VD: SABO ARENA"
              />
            </div>
            <div>
              <Label>Hero Description</Label>
              <Textarea
                value={data.hero_description}
                onChange={(e) => updateField("hero_description", e.target.value)}
                placeholder="Mô tả chi tiết hiển thị trên trang showcase..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Links */}
        <Card>
          <CardHeader>
            <CardTitle>🔗 Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>🌐 Website / Demo</Label>
                <Input
                  value={data.production_url}
                  onChange={(e) => updateField("production_url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>🖼️ Logo URL</Label>
                <Input
                  value={data.logo_url}
                  onChange={(e) => updateField("logo_url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>📘 Facebook</Label>
                <Input
                  value={data.social_links.facebook || ""}
                  onChange={(e) =>
                    updateField("social_links", { ...data.social_links, facebook: e.target.value })
                  }
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <Label>🐙 GitHub</Label>
                <Input
                  value={data.social_links.github || ""}
                  onChange={(e) =>
                    updateField("social_links", { ...data.social_links, github: e.target.value })
                  }
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>📺 YouTube</Label>
                <Input
                  value={data.social_links.youtube || ""}
                  onChange={(e) =>
                    updateField("social_links", { ...data.social_links, youtube: e.target.value })
                  }
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div>
                <Label>🎵 TikTok</Label>
                <Input
                  value={data.social_links.tiktok || ""}
                  onChange={(e) =>
                    updateField("social_links", { ...data.social_links, tiktok: e.target.value })
                  }
                  placeholder="https://tiktok.com/..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Screenshots */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>📸 Screenshots</CardTitle>
            <Button variant="outline" size="sm" onClick={addScreenshot}>
              <Plus className="h-4 w-4 mr-1" /> Thêm
            </Button>
          </CardHeader>
          <CardContent>
            {data.screenshots.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Chưa có screenshot. Bấm "Thêm" để thêm mới.
              </p>
            ) : (
              <div className="space-y-4">
                {data.screenshots.map((ss, i) => (
                  <div key={i} className="flex gap-4 items-start p-4 border rounded-lg">
                    {ss.url && (
                      <img
                        src={ss.url}
                        alt={ss.caption}
                        className="w-24 h-16 object-cover rounded"
                        onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.png")}
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <Input
                        value={ss.url}
                        onChange={(e) => updateScreenshot(i, "url", e.target.value)}
                        placeholder="URL hình ảnh"
                      />
                      <Input
                        value={ss.caption}
                        onChange={(e) => updateScreenshot(i, "caption", e.target.value)}
                        placeholder="Mô tả (VD: Trang chủ, Dashboard...)"
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeScreenshot(i)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Key Features */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>⚡ Tính Năng Chính</CardTitle>
            <Button variant="outline" size="sm" onClick={addFeature}>
              <Plus className="h-4 w-4 mr-1" /> Thêm
            </Button>
          </CardHeader>
          <CardContent>
            {data.key_features.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Chưa có tính năng. Bấm "Thêm" để thêm mới.
              </p>
            ) : (
              <div className="space-y-2">
                {data.key_features.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={f}
                      onChange={(e) => updateFeature(i, e.target.value)}
                      placeholder="VD: Quản lý đặt sân realtime"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeFeature(i)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5. Tech Stack */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>🛠️ Tech Stack</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateField("tech_stack", [
                  ...data.tech_stack,
                  { name: "", category: "Frontend", iconifyIcon: "" },
                ])
              }
            >
              <Plus className="h-4 w-4 mr-1" /> Thêm
            </Button>
          </CardHeader>
          <CardContent>
            {data.tech_stack.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Chưa có tech stack. Bấm "Thêm" để thêm mới.
              </p>
            ) : (
              <div className="space-y-3">
                {data.tech_stack.map((tech, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      value={tech.name}
                      onChange={(e) => {
                        const newStack = [...data.tech_stack];
                        newStack[i] = { ...newStack[i], name: e.target.value };
                        updateField("tech_stack", newStack);
                      }}
                      placeholder="React, Node.js..."
                      className="flex-1"
                    />
                    <select
                      className="h-10 px-2 border rounded-md text-sm"
                      value={tech.category}
                      onChange={(e) => {
                        const newStack = [...data.tech_stack];
                        newStack[i] = { ...newStack[i], category: e.target.value };
                        updateField("tech_stack", newStack);
                      }}
                    >
                      <option>Frontend</option>
                      <option>Backend</option>
                      <option>Database</option>
                      <option>DevOps</option>
                      <option>AI/ML</option>
                    </select>
                    <Input
                      value={tech.iconifyIcon || ""}
                      onChange={(e) => {
                        const newStack = [...data.tech_stack];
                        newStack[i] = { ...newStack[i], iconifyIcon: e.target.value };
                        updateField("tech_stack", newStack);
                      }}
                      placeholder="logos:react"
                      className="w-32"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateField(
                          "tech_stack",
                          data.tech_stack.filter((_, idx) => idx !== i)
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 6. Impacts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>📊 Impacts (Kết quả đạt được)</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateField("impacts", [...data.impacts, ""])}
            >
              <Plus className="h-4 w-4 mr-1" /> Thêm
            </Button>
          </CardHeader>
          <CardContent>
            {data.impacts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Chưa có impact. Bấm "Thêm" để thêm mới.
              </p>
            ) : (
              <div className="space-y-2">
                {data.impacts.map((impact, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={impact}
                      onChange={(e) => {
                        const newImpacts = [...data.impacts];
                        newImpacts[i] = e.target.value;
                        updateField("impacts", newImpacts);
                      }}
                      placeholder="VD: Tăng 50% hiệu suất quản lý"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateField(
                          "impacts",
                          data.impacts.filter((_, idx) => idx !== i)
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      {data.logo_url && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>👁️ Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <img
                src={data.logo_url}
                alt={data.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-bold text-lg">{data.name || "Tên Project"}</h3>
                <p className="text-muted-foreground">{data.description || "Mô tả..."}</p>
                {data.production_url && (
                  <a
                    href={data.production_url}
                    target="_blank"
                    className="text-primary text-sm flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" /> {data.production_url}
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
