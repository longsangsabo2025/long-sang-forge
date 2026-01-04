import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Clock, Copy, FileText, History, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";

interface SavedJson {
  id: string;
  name: string;
  json: string;
  savedAt: string;
}

const STORAGE_KEY = "project-import-history";

interface ProjectInfoGuideDialogProps {
  onImport?: (data: any) => void;
}

export function ProjectInfoGuideDialog({ onImport }: ProjectInfoGuideDialogProps) {
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState("");
  const [open, setOpen] = useState(false);
  const [savedJsons, setSavedJsons] = useState<SavedJson[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load saved JSONs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSavedJsons(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error loading saved JSONs:", e);
    }
  }, []);

  // Save JSON to history
  const saveToHistory = (json: string, projectName: string) => {
    const newEntry: SavedJson = {
      id: Date.now().toString(),
      name: projectName || `Import ${new Date().toLocaleDateString("vi-VN")}`,
      json,
      savedAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...savedJsons].slice(0, 10); // Keep last 10
    setSavedJsons(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Load from history
  const loadFromHistory = (saved: SavedJson) => {
    setJsonInput(saved.json);
    setShowHistory(false);
    toast({
      title: "Đã tải JSON",
      description: `"${saved.name}" đã được tải vào ô nhập liệu.`,
    });
  };

  // Delete from history
  const deleteFromHistory = (id: string) => {
    const updated = savedJsons.filter((s) => s.id !== id);
    setSavedJsons(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast({
      title: "Đã xóa",
      description: "JSON đã được xóa khỏi lịch sử.",
    });
  };

  // Phiếu hướng dẫn điền form (phù hợp với UI)
  const guideContent = `# 📋 PHIẾU THÔNG TIN DỰ ÁN (PROJECT SHOWCASE)

## 1. THÔNG TIN CƠ BẢN (Basic Info)
*Phần này dùng để hiển thị thẻ dự án (card) bên ngoài danh sách.*

*   **Tên dự án (Name):** ....................................................................................
*   **Slug (URL friendly):** (Ví dụ: \`ai-trading-bot\`, \`crm-system\`) ....................................
*   **Mô tả ngắn (Description):** (Khoảng 1-2 câu giới thiệu) ........................................
*   **Danh mục (Category):** (Chọn 1: Mobile App / Web App / AI Platform / E-commerce / SaaS / Desktop App)
*   **Trạng thái (Status):** (Chọn 1: Live 🟢 / Development 🟡 / Planned 🔵 / Maintenance 🟠)
*   **Tiến độ (Progress):** ...... %
*   **Vai trò của bạn (My Role):** (Ví dụ: Full-stack Developer, Tech Lead...) ............................
*   **Quy mô team (Team Size):** ...... người
*   **Thời gian:**
    *   Bắt đầu: ....................
    *   Kết thúc (hoặc Hiện tại): ....................

## 2. LIÊN KẾT & MEDIA (URLs & Media)
*Các đường dẫn và hình ảnh minh họa.*

*   **Link Demo (Production URL):** ........................................................................
*   **Link Source Code (Github URL):** .....................................................................
*   **Link Video Demo (Video URL):** .......................................................................
*   **Link Logo (Logo URL):** ..............................................................................
*   **Danh sách ảnh chụp màn hình (Screenshots):**
    *   *Ảnh 1:* URL: .................................... | Chú thích: ....................................
    *   *Ảnh 2:* URL: .................................... | Chú thích: ....................................

## 3. PHẦN GIỚI THIỆU (Hero Section)
*Phần hiển thị đầu tiên khi vào chi tiết dự án, gây ấn tượng mạnh.*

*   **Tiêu đề lớn (Hero Title):** ..............................................................................
*   **Mô tả dẫn dắt (Hero Description):** ........................................
*   **Chỉ số nổi bật (Hero Stats):** (Tối đa 3-4 chỉ số)
    *   *Chỉ số 1:* Label: .................... | Value: .................... (Ví dụ: Users | 10k+)
    *   *Chỉ số 2:* Label: .................... | Value: ....................
    *   *Chỉ số 3:* Label: .................... | Value: ....................

## 4. TỔNG QUAN DỰ ÁN (Overview)
*Mô tả sâu hơn về bài toán và giải pháp.*

*   **Tiêu đề tổng quan:** (Mặc định: TỔNG QUAN DỰ ÁN)
*   **Nội dung chi tiết (Overview Description):** ........................................
*   **Mục tiêu dự án (Objectives):** (Liệt kê các gạch đầu dòng)
    *   - ....................................................................................
    *   - ....................................................................................
*   **Tác động/Kết quả (Impacts):** (Liệt kê các gạch đầu dòng)
    *   - ....................................................................................
    *   - ....................................................................................

## 5. CÔNG NGHỆ SỬ DỤNG (Tech Stack)
*   **Tóm tắt công nghệ (Tech Summary):** (1 câu tóm tắt stack chính)
*   **Danh sách chi tiết:**
    *   *Frontend:* (Ví dụ: React, Tailwind...)
    *   *Backend:* (Ví dụ: Node.js, Supabase...)
    *   *Database:* (Ví dụ: PostgreSQL, Redis...)
    *   *DevOps/Cloud:* (Ví dụ: Docker, AWS...)

## 6. TÍNH NĂNG (Features)
*   **Tính năng chính (Key Features):**
    *   - ....................................................................................
    *   - ....................................................................................
*   **Tính năng chi tiết (Detailed Features):**
    *   *Nhóm 1:* Tên: .................... | Mô tả: ....................................
    *   *Nhóm 2:* Tên: .................... | Mô tả: ....................................

## 7. CHỈ SỐ & HIỆU NĂNG (Metrics)
*   **Metrics:** (Ví dụ: Uptime 99.9%, Users 10k+)
*   **Performance:** (Ví dụ: Lighthouse Score 95+)
*   **Infrastructure:** (Ví dụ: Multi-region, Auto-scaling)

## 8. CẤU HÌNH HIỂN THỊ (Display Settings)
*   **Kiểu Mockup:** (Chọn 1: auto / phone 📱 / browser 🖥️)
*   **Nổi bật (Featured):** (Có/Không)
*   **Thứ tự hiển thị (Order):** (Số nguyên, số nhỏ hiện trước)

---

## 💡 CÁCH IMPORT NHANH VỚI AI

1. Copy toàn bộ phiếu này (bấm "Sao chép")
2. Gửi cho AI (ChatGPT/Claude) kèm prompt: "Hãy điền thông tin dự án của tôi vào phiếu này, sau đó chuyển thành JSON với format flat (snake_case keys)"
3. Copy JSON từ AI → Tab "Import JSON" → "Phân tích & Điền Form"
`;

  const jsonTemplate = {
    name: "Tên dự án",
    slug: "slug-du-an",
    description: "Mô tả ngắn 1-2 câu về dự án",
    category: "Web App",
    status: "development",
    progress: 80,
    my_role: "Full-stack Developer",
    team_size: 1,
    start_date: "Q1 2025",
    end_date: "Hiện tại",
    production_url: "https://...",
    github_url: "https://github.com/...",
    video_url: "",
    logo_url: "",
    hero_title: "Tiêu đề Hero gây ấn tượng",
    hero_description: "Mô tả ngắn về giá trị cốt lõi",
    hero_stats: [{ icon: "Users", label: "Users", value: "1,000+", color: "blue" }],
    overview_title: "TỔNG QUAN DỰ ÁN",
    overview_description: "Mô tả chi tiết về dự án...",
    objectives: ["Mục tiêu 1", "Mục tiêu 2"],
    impacts: ["Kết quả 1", "Kết quả 2"],
    tech_summary: "React, Node.js, Supabase",
    tech_stack: [
      { name: "React", category: "Frontend" },
      { name: "Node.js", category: "Backend" },
    ],
    key_features: ["Tính năng 1", "Tính năng 2"],
    features: [{ icon: "Star", title: "Feature Group", color: "blue", points: ["Detail 1"] }],
    metrics: [{ label: "Uptime", value: "99.9%", unit: "" }],
    performance: [{ label: "Lighthouse", value: "95+" }],
    infrastructure: [{ label: "Deploy", value: "Vercel" }],
    screenshots: [],
    is_featured: false,
    is_active: true,
    display_order: 0,
    display_type: "auto",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(guideContent);
    toast({
      title: "Đã sao chép!",
      description: "Bạn có thể dán vào file Word hoặc Note để điền thông tin.",
    });
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonTemplate, null, 2));
    toast({
      title: "Đã sao chép JSON mẫu!",
      description: "Dùng mẫu này để điền dữ liệu và import lại.",
    });
  };

  // Transform nested JSON to flat structure matching ProjectData
  const transformImportData = (raw: any): any => {
    // If already flat structure, return as-is
    if (raw.name && raw.slug) {
      return raw;
    }

    // Handle nested projectShowcase structure
    const src = raw.projectShowcase || raw;
    // Handle flat structure with prefixes (basic_info_name, hero_stat_1_label, etc.)
    if (raw.basic_info_name || raw.hero_title) {
      // Helper to collect numbered items into array
      const collectNumbered = (prefix: string, suffix: string = ""): string[] => {
        const items: string[] = [];
        for (let i = 1; i <= 10; i++) {
          const key = suffix ? `${prefix}_${i}_${suffix}` : `${prefix}_${i}`;
          if (raw[key]) items.push(raw[key]);
        }
        return items;
      };

      // Helper to collect numbered pairs into array of objects
      const collectPairs = (prefix: string, labelSuffix: string, valueSuffix: string): any[] => {
        const items: any[] = [];
        for (let i = 1; i <= 10; i++) {
          const label = raw[`${prefix}_${i}_${labelSuffix}`];
          const value = raw[`${prefix}_${i}_${valueSuffix}`];
          if (label || value) {
            items.push({ label: label || "", value: value || "" });
          }
        }
        return items;
      };

      // Parse status from "Live 🟢" format
      const statusRaw = raw.basic_info_status || "";
      const status = statusRaw.toLowerCase().includes("live")
        ? "live"
        : statusRaw.toLowerCase().includes("development")
        ? "development"
        : statusRaw.toLowerCase().includes("planned")
        ? "planned"
        : statusRaw.toLowerCase().includes("maintenance")
        ? "maintenance"
        : "development";

      // Parse display_type from "phone 📱" format
      const mockupRaw = raw.display_mockup_type || "";
      const displayType =
        mockupRaw.includes("📱") || mockupRaw.toLowerCase().includes("phone")
          ? "phone"
          : mockupRaw.includes("🖥️") || mockupRaw.toLowerCase().includes("browser")
          ? "browser"
          : "auto";

      return {
        // Basic Info
        name: raw.basic_info_name || "",
        slug: raw.basic_info_slug || "",
        description: raw.basic_info_short_description || raw.basic_info_description || "",
        category: (raw.basic_info_category || "Web App").replace(/[🟢🟡🔵🟠]/gu, "").trim(),
        status,
        progress: raw.basic_info_progress || 0,
        my_role: raw.basic_info_my_role || "",
        team_size: raw.basic_info_team_size || 1,
        start_date: raw.basic_info_start_date || "",
        end_date: raw.basic_info_end_date || "",

        // URLs
        production_url: raw.urls_production_url || "",
        github_url: (raw.urls_source_code_url || "").includes("Private")
          ? ""
          : raw.urls_source_code_url || "",
        video_url: (raw.urls_video_demo_url || "").includes("cập nhật")
          ? ""
          : raw.urls_video_demo_url || "",
        logo_url: raw.urls_logo_url || "",
        screenshots: (() => {
          const shots: any[] = [];
          for (let i = 1; i <= 10; i++) {
            const url = raw[`urls_screenshot_${i}_url`];
            const caption = raw[`urls_screenshot_${i}_caption`] || "";
            if (url && !url.includes("cập nhật") && !url.includes("Cần")) {
              shots.push({ url, caption });
            }
          }
          return shots;
        })(),

        // Hero Section
        hero_title: raw.hero_title || "",
        hero_description: raw.hero_description || "",
        hero_stats: collectPairs("hero_stat", "label", "value").map((s) => ({
          icon: "Star",
          label: s.label,
          value: s.value,
          color: "blue",
        })),

        // Overview
        overview_title: raw.overview_title || "TỔNG QUAN DỰ ÁN",
        overview_description: raw.overview_description || "",
        objectives: collectNumbered("overview_objective"),
        impacts: collectNumbered("overview_impact"),

        // Tech Stack
        tech_summary: raw.tech_summary || "",
        tech_stack: [
          ...(raw.tech_frontend
            ? raw.tech_frontend
                .split(",")
                .map((t: string) => ({ name: t.trim(), category: "Frontend" }))
            : []),
          ...(raw.tech_backend
            ? raw.tech_backend
                .split(",")
                .map((t: string) => ({ name: t.trim(), category: "Backend" }))
            : []),
          ...(raw.tech_database
            ? raw.tech_database
                .split(",")
                .map((t: string) => ({ name: t.trim(), category: "Database" }))
            : []),
          ...(raw.tech_devops_cloud
            ? raw.tech_devops_cloud
                .split(",")
                .map((t: string) => ({ name: t.trim(), category: "DevOps" }))
            : []),
          ...(raw.tech_ai_ml && !raw.tech_ai_ml.includes("Không")
            ? raw.tech_ai_ml.split(",").map((t: string) => ({ name: t.trim(), category: "AI/ML" }))
            : []),
        ],

        // Features
        key_features: collectNumbered("feature_key"),
        features: (() => {
          const groups: any[] = [];
          for (let i = 1; i <= 10; i++) {
            const name = raw[`feature_group_${i}_name`];
            const desc = raw[`feature_group_${i}_description`];
            if (name) {
              groups.push({
                icon: "Star",
                title: name,
                color: "blue",
                points: desc ? [desc] : [],
              });
            }
          }
          return groups;
        })(),

        // Metrics
        metrics: collectNumbered("metrics").map((m: string) => {
          const parts = m.split(":");
          return { label: parts[0]?.trim() || m, value: parts[1]?.trim() || "", unit: "" };
        }),
        performance: collectNumbered("performance").map((p: string) => {
          const parts = p.split(":");
          return { label: parts[0]?.trim() || p, value: parts[1]?.trim() || "" };
        }),
        infrastructure: collectNumbered("infrastructure").map((i: string) => {
          const parts = i.split(":");
          return { label: parts[0]?.trim() || i, value: parts[1]?.trim() || "" };
        }),

        // Display Settings
        is_featured: raw.display_featured === "Có" || raw.display_featured === true,
        display_order: raw.display_order || 0,
        display_type: displayType,
        is_active: true,
      };
    }

    // Handle nested projectShowcase structure
    const basic = src.basicInfo || {};
    const urls = src.urls || {};
    const hero = src.heroSection || {};
    const overview = src.overview || {};
    const tech = src.techStack || {};
    const features = src.features || {};
    const metrics = src.metricsPerformance || {};
    const display = src.displaySettings || {};

    return {
      // Basic Info
      name: basic.name || "",
      slug: basic.slug || "",
      description: basic.shortDescription || basic.description || "",
      category:
        basic.category
          ?.replace(" 🟢", "")
          .replace(" 🟡", "")
          .replace(" 🔵", "")
          .replace(" 🟠", "") || "Web App",
      status: basic.status?.toLowerCase().includes("live")
        ? "live"
        : basic.status?.toLowerCase().includes("development")
        ? "development"
        : basic.status?.toLowerCase().includes("planned")
        ? "planned"
        : "development",
      progress: basic.progress || 0,
      my_role: basic.myRole || "",
      team_size: basic.teamSize || 1,
      start_date: basic.timeline?.startDate || "",
      end_date: basic.timeline?.endDate || "",

      // URLs
      production_url: urls.productionUrl || "",
      github_url: urls.sourceCodeUrl?.includes("[") ? "" : urls.sourceCodeUrl || "",
      video_url: urls.videoDemoUrl?.includes("[") ? "" : urls.videoDemoUrl || "",
      logo_url: urls.logoUrl || "",
      screenshots: (urls.screenshots || [])
        .filter((s: any) => s.url && !s.url.includes("["))
        .map((s: any) => ({ url: s.url, caption: s.caption || "" })),

      // Hero Section
      hero_title: hero.title || "",
      hero_description: hero.description || "",
      hero_stats: (hero.stats || []).map((s: any) => ({
        icon: "Star",
        label: s.label || "",
        value: s.value || "",
        color: "blue",
      })),

      // Overview
      overview_title: overview.title || "TỔNG QUAN DỰ ÁN",
      overview_description: overview.detailedDescription || overview.description || "",
      objectives: overview.objectives || [],
      impacts: overview.impacts || [],

      // Tech Stack
      tech_summary: tech.summary || "",
      tech_stack: Object.entries(tech.details || {}).flatMap(([category, techs]) => {
        if (typeof techs === "string") {
          return techs.split(",").map((t: string) => ({
            name: t.trim(),
            category: category.charAt(0).toUpperCase() + category.slice(1),
          }));
        }
        return [];
      }),

      // Features
      key_features: features.keyFeatures || [],
      features: (features.detailedFeatures || []).map((f: any) => ({
        icon: "Star",
        title: f.group || "",
        color: "blue",
        points: f.description ? [f.description] : [],
      })),

      // Metrics
      metrics: (metrics.metrics || []).map((m: string) => {
        const parts = m.split(":");
        return { label: parts[0]?.trim() || m, value: parts[1]?.trim() || "", unit: "" };
      }),
      performance: (metrics.performance || []).map((p: string) => {
        const parts = p.split(":");
        return { label: parts[0]?.trim() || p, value: parts[1]?.trim() || "" };
      }),
      infrastructure: (metrics.infrastructure || []).map((i: string) => {
        const parts = i.split(":");
        return { label: parts[0]?.trim() || i, value: parts[1]?.trim() || "" };
      }),

      // Display Settings
      is_featured: display.featured || false,
      display_order: display.displayOrder || 0,
      display_type: display.mockupType?.includes("📱")
        ? "phone"
        : display.mockupType?.includes("🖥️")
        ? "browser"
        : "auto",
      is_active: true,
    };
  };

  const handleImport = () => {
    try {
      const rawData = JSON.parse(jsonInput);
      const transformedData = transformImportData(rawData);

      if (onImport) {
        // Save to history before importing
        const projectName = transformedData.name || rawData.name || rawData.basic_info_name || "";
        saveToHistory(jsonInput, projectName);

        onImport(transformedData);
        toast({
          title: "Import thành công!",
          description: `Đã điền ${
            Object.keys(transformedData).filter((k) => transformedData[k]).length
          } trường vào form.`,
        });
        setJsonInput("");
        setOpen(false);
      } else {
        toast({
          title: "Không thể import",
          description: "Chức năng import chưa được kết nối.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Lỗi định dạng JSON",
        description: "Vui lòng kiểm tra lại cú pháp JSON.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Phiếu Thông Tin & Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Hướng Dẫn & Nhập Liệu</DialogTitle>
          <DialogDescription>
            Xem hướng dẫn điền thông tin hoặc Import dữ liệu từ JSON.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="guide" className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 shrink-0">
            <TabsTrigger value="guide">📄 Hướng Dẫn Điền</TabsTrigger>
            <TabsTrigger value="import">📥 Import JSON</TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 mt-4 overflow-hidden">
            <TabsContent
              value="guide"
              className="h-full flex flex-col m-0 data-[state=inactive]:hidden"
            >
              <div className="flex justify-end mb-2 shrink-0">
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Sao chép mẫu văn bản
                </Button>
              </div>
              <ScrollArea className="flex-1 p-4 border rounded-md bg-muted/50">
                <pre className="whitespace-pre-wrap font-mono text-sm">{guideContent}</pre>
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="import"
              className="h-full flex flex-col m-0 data-[state=inactive]:hidden"
            >
              <div className="flex justify-between items-center mb-2 shrink-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Dán nội dung JSON vào bên dưới để tự động điền form.
                  </p>
                  {savedJsons.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHistory(!showHistory)}
                      className="gap-1 text-xs"
                    >
                      <History className="h-3 w-3" />
                      Lịch sử ({savedJsons.length})
                    </Button>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyJson} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Sao chép mẫu JSON
                </Button>
              </div>

              {/* History Panel */}
              {showHistory && savedJsons.length > 0 && (
                <div className="mb-3 p-3 border rounded-md bg-muted/30 shrink-0">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      JSON đã import trước đó
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHistory(false)}
                      className="h-6 px-2 text-xs"
                    >
                      Đóng
                    </Button>
                  </div>
                  <ScrollArea className="max-h-32">
                    <div className="space-y-1">
                      {savedJsons.map((saved) => (
                        <div
                          key={saved.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-muted/50 group"
                        >
                          <button
                            onClick={() => loadFromHistory(saved)}
                            className="flex-1 text-left"
                          >
                            <span className="text-sm font-medium">{saved.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {new Date(saved.savedAt).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteFromHistory(saved.id)}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <Textarea
                className="flex-1 font-mono text-sm resize-none"
                placeholder='{ "name": "My Project", ... }'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
              <div className="flex justify-end mt-4 shrink-0">
                <Button onClick={handleImport} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Phân tích & Điền Form
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
