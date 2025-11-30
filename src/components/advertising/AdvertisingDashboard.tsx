/**
 * Advertising Dashboard - Main Component
 * Complete UI for AI Advertising Platform
 *
 * Features:
 * - Campaign creation & management
 * - Real-time monitoring
 * - Budget optimization
 * - Multi-platform deployment
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { advertisingAPI } from "@/lib/api/advertising-api";
import { Activity, BarChart3, DollarSign, Target, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { AdCampaignGenerator } from "./AdCampaignGenerator";
import { BudgetOptimizer } from "./BudgetOptimizer";
import { CampaignList } from "./CampaignList";
import { CampaignMonitor } from "./CampaignMonitor";

export function AdvertisingDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalSpend: 0,
    avgROI: 0,
  });

  // Fetch real stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await advertisingAPI.getCampaignStats();
        if (result.success && result.stats) {
          setStats({
            activeCampaigns: result.stats.activeCampaigns || 0,
            totalSpend: result.stats.totalSpend || 0,
            avgROI: result.stats.avgROI || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Advertising Platform
          </h1>
          <p className="text-muted-foreground mt-2">Tự động hóa quảng cáo đa nền tảng với AI</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-500" />
          System Online
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platforms</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Facebook, Google, TikTok</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">Active campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpend.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgROI > 0 ? `${stats.avgROI.toFixed(1)}%` : "-"}
            </div>
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Create
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitor
          </TabsTrigger>
          <TabsTrigger value="optimize" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Optimize
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => setActiveTab("create")}
                  className="w-full text-left p-3 border rounded hover:bg-muted transition-colors"
                >
                  <div className="font-medium">Create New Campaign</div>
                  <div className="text-sm text-muted-foreground">
                    Generate AI-powered ad campaign
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("monitor")}
                  className="w-full text-left p-3 border rounded hover:bg-muted transition-colors"
                >
                  <div className="font-medium">Monitor Campaigns</div>
                  <div className="text-sm text-muted-foreground">
                    Real-time performance tracking
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("optimize")}
                  className="w-full text-left p-3 border rounded hover:bg-muted transition-colors"
                >
                  <div className="font-medium">Optimize Budget</div>
                  <div className="text-sm text-muted-foreground">AI-powered budget allocation</div>
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supported Platforms</CardTitle>
                <CardDescription>Integrated advertising platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">Facebook Ads</div>
                      <div className="text-sm text-muted-foreground">Official SDK v24.0</div>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">Google Ads</div>
                      <div className="text-sm text-muted-foreground">Official SDK v15.0</div>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">TikTok Ads</div>
                      <div className="text-sm text-muted-foreground">Marketing API v1.3</div>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest campaign activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No recent activity. Create your first campaign to get started.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <CampaignList />
        </TabsContent>

        {/* Create Campaign Tab */}
        <TabsContent value="create">
          <AdCampaignGenerator />
        </TabsContent>

        {/* Monitor Tab */}
        <TabsContent value="monitor">
          <CampaignMonitor />
        </TabsContent>

        {/* Optimize Tab */}
        <TabsContent value="optimize">
          <BudgetOptimizer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
