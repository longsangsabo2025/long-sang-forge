import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Globe, Settings, BarChart3, Link, FileText, Sparkles } from "lucide-react";
import { DomainManagement } from "@/components/seo/DomainManagement";
import { IndexingMonitor } from "@/components/seo/IndexingMonitor";
import { SEOSettings } from "@/components/seo/SEOSettings";
import { SitemapGenerator } from "@/components/seo/SitemapGenerator";
import { KeywordTracker } from "@/components/seo/KeywordTracker";
import { SEOAnalytics } from "@/components/seo/SEOAnalytics";
import { AIAutoSEO } from "@/components/seo/AIAutoSEO";

export default function AdminSEOCenter() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            SEO Management Center
          </h1>
          <p className="text-muted-foreground mt-2">
            Quản lý SEO tự động cho tất cả domains - Google Indexing, Bing, Sitemap & Analytics
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng Domains</p>
              <p className="text-2xl font-bold">3</p>
            </div>
            <Globe className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">URLs Indexed</p>
              <p className="text-2xl font-bold">1,245</p>
            </div>
            <Link className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Organic Traffic</p>
              <p className="text-2xl font-bold">8.5K</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Top Rankings</p>
              <p className="text-2xl font-bold">127</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="ai-auto" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="ai-auto" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Auto
          </TabsTrigger>
          <TabsTrigger value="domains" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Domains
          </TabsTrigger>
          <TabsTrigger value="indexing" className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            Indexing
          </TabsTrigger>
          <TabsTrigger value="sitemap" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Sitemap
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Keywords
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-auto" className="space-y-4">
          <AIAutoSEO />
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          <DomainManagement />
        </TabsContent>

        <TabsContent value="indexing" className="space-y-4">
          <IndexingMonitor />
        </TabsContent>

        <TabsContent value="sitemap" className="space-y-4">
          <SitemapGenerator />
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <KeywordTracker />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <SEOAnalytics />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <SEOSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
