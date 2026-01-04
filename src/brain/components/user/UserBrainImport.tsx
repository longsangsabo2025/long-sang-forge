/**
 * User Brain Import Component
 * ===========================
 * Import knowledge from YouTube, URL, or text
 */

import {
  useImportContent,
  useUserBrainDomains,
  useUserBrainImports,
  useUserBrainQuota,
} from "@/brain/hooks/useUserBrain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Crown,
  FileText,
  Link as LinkIcon,
  Loader2,
  Upload,
  Youtube,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function UserBrainImport() {
  const { data: quota } = useUserBrainQuota();
  const { data: domains } = useUserBrainDomains();
  const { data: imports } = useUserBrainImports();
  const importMutation = useImportContent();

  const [sourceType, setSourceType] = useState<"youtube" | "url" | "text">("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [domainId, setDomainId] = useState<string | undefined>();

  // Check if user can import more
  const canImport = quota ? quota.documentsCount < quota.maxDocuments : true;
  const isProPlan = quota && quota.maxDocuments >= 500;

  const handleImport = async () => {
    if (sourceType === "text" && !text.trim()) return;
    if (sourceType !== "text" && !url.trim()) return;

    await importMutation.mutateAsync({
      sourceType,
      sourceUrl: sourceType !== "text" ? url : undefined,
      content: sourceType === "text" ? text : undefined,
      title: title || undefined,
      domainId,
    });

    // Clear form
    setUrl("");
    setText("");
    setTitle("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Hoàn thành
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Đang xử lý
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" /> Chờ xử lý
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" /> Lỗi
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Import Form */}
      <Card>
        <CardHeader>
          <CardTitle>Import kiến thức mới</CardTitle>
          <CardDescription>Thêm kiến thức từ YouTube, website hoặc nhập thủ công</CardDescription>
        </CardHeader>
        <CardContent>
          {!canImport ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
              <h3 className="font-medium mb-2">Đã đạt giới hạn documents</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Bạn đã sử dụng {quota?.documentsCount} / {quota?.maxDocuments} documents. Nâng cấp
                để import thêm.
              </p>
              <Link to="/brain/pricing">
                <Button>
                  <Crown className="mr-2 h-4 w-4" />
                  Nâng cấp ngay
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <Tabs value={sourceType} onValueChange={(v) => setSourceType(v as typeof sourceType)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger
                    value="youtube"
                    className="flex items-center gap-2"
                    disabled={!isProPlan}
                  >
                    <Youtube className="h-4 w-4" />
                    YouTube
                    {!isProPlan && <Crown className="h-3 w-3 text-orange-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Text
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-4">
                  <div>
                    <Label htmlFor="url">URL website</Label>
                    <Input
                      id="url"
                      placeholder="https://example.com/article"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Hệ thống sẽ tự động extract nội dung từ website
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="youtube" className="space-y-4">
                  {!isProPlan ? (
                    <div className="text-center py-4">
                      <Crown className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Import từ YouTube chỉ có ở gói Pro trở lên
                      </p>
                      <Link to="/brain/pricing">
                        <Button variant="link" size="sm">
                          Xem các gói
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="youtube-url">YouTube URL</Label>
                      <Input
                        id="youtube-url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Hệ thống sẽ tự động lấy transcript từ video
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <div>
                    <Label htmlFor="title">Tiêu đề</Label>
                    <Input
                      id="title"
                      placeholder="Tên cho kiến thức này"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Nội dung</Label>
                    <Textarea
                      id="content"
                      placeholder="Nhập nội dung kiến thức cần lưu..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Tối thiểu 100 ký tự</p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Domain selector */}
              <div>
                <Label>Domain (tùy chọn)</Label>
                <Select value={domainId} onValueChange={setDomainId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không chọn domain</SelectItem>
                    {domains?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.icon} {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleImport}
                disabled={
                  importMutation.isPending ||
                  (sourceType === "text" ? text.length < 100 : !url.trim())
                }
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang import...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import kiến thức
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử Import</CardTitle>
          <CardDescription>Các kiến thức đã và đang được import</CardDescription>
        </CardHeader>
        <CardContent>
          {imports && imports.length > 0 ? (
            <div className="space-y-3">
              {imports.map((job) => (
                <div key={job.id} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {job.sourceType === "youtube" && <Youtube className="h-4 w-4 text-red-500" />}
                      {job.sourceType === "url" && <LinkIcon className="h-4 w-4 text-blue-500" />}
                      {job.sourceType === "text" && <FileText className="h-4 w-4 text-green-500" />}
                      <span className="text-sm font-medium line-clamp-1">
                        {job.sourceTitle || job.sourceUrl || "Manual import"}
                      </span>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>

                  {job.status === "processing" && (
                    <Progress value={job.progress} className="h-2 mb-2" />
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {job.status === "completed" && `${job.documentsCreated} documents`}
                      {job.status === "failed" && job.errorMessage}
                      {job.status === "processing" && `${job.progress}%`}
                      {job.status === "pending" && "Đang chờ..."}
                    </span>
                    <span>{new Date(job.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chưa có import nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
