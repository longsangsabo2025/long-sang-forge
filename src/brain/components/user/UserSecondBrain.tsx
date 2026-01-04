/**
 * User Second Brain Dashboard
 * ===========================
 * Personal knowledge management for users
 */

import {
  useUserBrainDomains,
  useUserBrainImports,
  useUserBrainQuota,
} from "@/brain/hooks/useUserBrain";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Brain,
  Crown,
  FileText,
  FolderOpen,
  MessageCircle,
  Plus,
  Settings,
  Sparkles,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { UserBrainChat } from "./UserBrainChat";
import { UserBrainImport } from "./UserBrainImport";

export function UserSecondBrain() {
  const { user } = useAuth();
  const { data: quota, isLoading: quotaLoading } = useUserBrainQuota();
  const { data: domains } = useUserBrainDomains();
  const { data: imports } = useUserBrainImports();

  if (!user) {
    return (
      <div className="container mx-auto py-16 text-center">
        <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Đăng nhập để sử dụng Second Brain</h2>
        <p className="text-muted-foreground mb-4">Tạo hệ thống quản lý tri thức cá nhân với AI</p>
        <Link to="/welcome">
          <Button size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            Đăng nhập ngay
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate usage percentages
  const docsUsage = quota ? (quota.documentsCount / quota.maxDocuments) * 100 : 0;
  const queriesUsage = quota ? (quota.queriesCount / quota.maxQueriesPerMonth) * 100 : 0;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Second Brain</h1>
            <Badge variant="secondary" className="ml-2">
              {quota?.maxDocuments === 50 ? "Free" : quota?.maxDocuments === 500 ? "Pro" : "Team"}
            </Badge>
          </div>
          <Link to="/brain/pricing">
            <Button variant="outline" size="sm">
              <Crown className="mr-2 h-4 w-4" />
              Nâng cấp
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground text-lg">
          Hệ thống quản lý tri thức cá nhân - Học nhanh hơn, nhớ lâu hơn
        </p>
      </div>

      {/* Quota Overview */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quota?.documentsCount || 0} / {quota?.maxDocuments || 50}
            </div>
            <Progress value={docsUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Queries tháng này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quota?.queriesCount || 0} / {quota?.maxQueriesPerMonth || 100}
            </div>
            <Progress value={queriesUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quota?.domainsCount || 0} / {quota?.maxDomains || 3}
            </div>
            <Progress
              value={quota ? (quota.domainsCount / quota.maxDomains) * 100 : 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Imports gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{imports?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {imports?.filter((i) => i.status === "completed").length || 0} hoàn thành
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Knowledge
          </TabsTrigger>
          <TabsTrigger value="domains" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Domains
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <UserBrainChat />
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import">
          <UserBrainImport />
        </TabsContent>

        {/* Knowledge Tab */}
        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <CardTitle>Kiến thức đã lưu</CardTitle>
              <CardDescription>
                Quản lý và tìm kiếm tất cả kiến thức trong brain của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {domains && domains.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {domains.map((domain) => (
                    <Card
                      key={domain.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{domain.icon || "📂"}</span>
                          <CardTitle className="text-lg">{domain.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          {domain.description || "Không có mô tả"}
                        </p>
                        <Badge variant="outline">{domain.knowledgeCount} documents</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Chưa có kiến thức nào</h3>
                  <p className="text-muted-foreground mb-4">
                    Import kiến thức từ YouTube, website hoặc nhập thủ công
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Import ngay
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domains Tab */}
        <TabsContent value="domains">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quản lý Domains</CardTitle>
                  <CardDescription>Tổ chức kiến thức theo chủ đề</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo Domain
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {domains && domains.length > 0 ? (
                <div className="space-y-4">
                  {domains.map((domain) => (
                    <div
                      key={domain.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{domain.icon || "📂"}</span>
                        <div>
                          <h4 className="font-medium">{domain.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {domain.knowledgeCount} documents
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Chưa có domain nào</h3>
                  <p className="text-muted-foreground mb-4">
                    Tạo domain để tổ chức kiến thức theo chủ đề
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo Domain đầu tiên
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
