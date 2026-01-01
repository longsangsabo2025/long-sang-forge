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
import { Copy, FileText, Upload } from "lucide-react";
import { useState } from "react";

interface ProjectInfoGuideDialogProps {
  onImport?: (data: any) => void;
}

export function ProjectInfoGuideDialog({ onImport }: ProjectInfoGuideDialogProps) {
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState("");

  const guideContent = `# 📋 PHIẾU THÔNG TIN DỰ ÁN (PROJECT SHOWCASE)

## 1. THÔNG TIN CƠ BẢN (Basic Info)
*Phần này dùng để hiển thị thẻ dự án (card) bên ngoài danh sách.*

*   **Tên dự án (Name):** ....................................................................................
*   **Slug (URL friendly):** (Ví dụ: \`ai-trading-bot\`, \`crm-system\`) ....................................
*   **Mô tả ngắn (Description):** (Khoảng 1-2 câu giới thiệu) ........................................................................................................................................................................
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
    *   *Ảnh 3:* URL: .................................... | Chú thích: ....................................

## 3. PHẦN GIỚI THIỆU (Hero Section)
*Phần hiển thị đầu tiên khi vào chi tiết dự án, gây ấn tượng mạnh.*

*   **Tiêu đề lớn (Hero Title):** ..............................................................................
*   **Mô tả dẫn dắt (Hero Description):** ........................................................................................................................................................................
*   **Chỉ số nổi bật (Hero Stats):** (Tối đa 3-4 chỉ số)
    *   *Chỉ số 1:* Tên (Label): .................... | Giá trị (Value): .................... (Ví dụ: Users | 10k+)
    *   *Chỉ số 2:* Tên (Label): .................... | Giá trị (Value): ....................
    *   *Chỉ số 3:* Tên (Label): .................... | Giá trị (Value): ....................

## 4. TỔNG QUAN DỰ ÁN (Overview)
*Mô tả sâu hơn về bài toán và giải pháp.*

*   **Tiêu đề tổng quan:** (Mặc định: TỔNG QUAN DỰ ÁN)
*   **Nội dung chi tiết (Overview Description):** ........................................................................................................................................................................
*   **Mục tiêu dự án (Objectives):** (Liệt kê các gạch đầu dòng)
    *   - ....................................................................................
    *   - ....................................................................................
*   **Tác động/Kết quả (Impacts):** (Liệt kê các gạch đầu dòng)
    *   - ....................................................................................
    *   - ....................................................................................

## 5. CÔNG NGHỆ SỬ DỤNG (Tech Stack)
*   **Tóm tắt công nghệ (Tech Summary):** (1 câu tóm tắt stack chính) ....................................
*   **Danh sách chi tiết:**
    *   *Frontend:* (Ví dụ: React, Tailwind...) ............................................................
    *   *Backend:* (Ví dụ: Node.js, Supabase...) ...........................................................
    *   *Database:* (Ví dụ: PostgreSQL, Redis...) ..........................................................
    *   *DevOps/Cloud:* (Ví dụ: Docker, AWS...) ............................................................
    *   *AI/ML:* (Nếu có) ..................................................................................

## 6. TÍNH NĂNG (Features)
*   **Tính năng chính (Key Features - List ngắn gọn):**
    *   - ....................................................................................
    *   - ....................................................................................
*   **Tính năng chi tiết (Detailed Features - Có icon & mô tả):**
    *   *Nhóm 1:* Tên nhóm: .................... | Các ý chính: ....................................
    *   *Nhóm 2:* Tên nhóm: .................... | Các ý chính: ....................................

## 7. CHỈ SỐ & HIỆU NĂNG (Metrics & Performance)
*Số liệu kỹ thuật hoặc kinh doanh thực tế.*

*   **Metrics (Đo lường):** (Ví dụ: Uptime 99.9%, Latency <100ms)
    *   - ....................................................................................
*   **Performance (Hiệu năng):** (Ví dụ: Lighthouse Score 100)
    *   - ....................................................................................
*   **Infrastructure (Hạ tầng):** (Ví dụ: 3 Regions, Auto-scaling)
    *   - ....................................................................................

## 8. CẤU HÌNH HIỂN THỊ (Display Settings)
*   **Kiểu Mockup:** (Chọn 1: Tự động / Điện thoại 📱 / Trình duyệt 🖥️ / Tablet)
*   **Nổi bật (Featured):** (Có/Không) - *Dự án nổi bật sẽ hiện lên đầu trang chủ.*
*   **Thứ tự hiển thị (Order):** (Số nguyên, số nhỏ hiện trước)
`;

  const jsonTemplate = {
    name: "Tên dự án",
    slug: "slug-du-an",
    description: "Mô tả ngắn",
    category: "Web App",
    status: "development",
    progress: 80,
    production_url: "https://...",
    github_url: "https://...",
    hero_title: "Tiêu đề Hero",
    hero_description: "Mô tả Hero",
    overview_description: "Mô tả chi tiết tổng quan",
    tech_summary: "React, Node.js, Supabase",
    my_role: "Full-stack Developer",
    team_size: 1,
    key_features: ["Tính năng 1", "Tính năng 2"],
    objectives: ["Mục tiêu 1", "Mục tiêu 2"],
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

  const handleImport = () => {
    try {
      const data = JSON.parse(jsonInput);
      if (onImport) {
        onImport(data);
        toast({
          title: "Import thành công!",
          description: "Dữ liệu đã được điền vào form.",
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Phiếu Thông Tin & Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Hướng Dẫn & Nhập Liệu</DialogTitle>
          <DialogDescription>
            Xem hướng dẫn điền thông tin hoặc Import dữ liệu từ JSON.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="guide" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guide">📄 Hướng Dẫn Điền</TabsTrigger>
            <TabsTrigger value="import">📥 Import JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="guide" className="flex-1 flex flex-col mt-4">
            <div className="flex justify-end mb-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                <Copy className="h-4 w-4" />
                Sao chép mẫu văn bản
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4 border rounded-md bg-muted/50">
              <pre className="whitespace-pre-wrap font-mono text-sm">{guideContent}</pre>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="import" className="flex-1 flex flex-col mt-4">
            <div className="flex justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                Dán nội dung JSON vào bên dưới để tự động điền form.
              </p>
              <Button variant="outline" size="sm" onClick={handleCopyJson} className="gap-2">
                <Copy className="h-4 w-4" />
                Sao chép mẫu JSON
              </Button>
            </div>
            <Textarea
              className="flex-1 font-mono text-sm"
              placeholder='{ "name": "My Project", ... }'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            <div className="flex justify-end mt-4">
              <Button onClick={handleImport} className="gap-2">
                <Upload className="h-4 w-4" />
                Phân tích & Điền Form
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
