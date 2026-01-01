/**
 * Campaign Monitor Component
 * Real-time campaign performance monitoring
 *
 * Features:
 * - WebSocket connection for live updates
 * - Multi-platform metrics
 * - Performance charts
 * - Budget tracking
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CampaignMetrics } from "@/lib/api/advertising-api";
import { advertisingAPI } from "@/lib/api/advertising-api";
import { Activity, DollarSign, Loader2, MousePointerClick, TrendingUp, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Types imported from API client
type Metrics = CampaignMetrics;

export function CampaignMonitor() {
  const [campaignId, setCampaignId] = useState("");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const WS_URL = API_URL.replace("http://", "ws://").replace("https://", "wss://");

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const startMonitoring = async () => {
    if (!campaignId) {
      setError("Please enter a campaign ID");
      return;
    }

    try {
      const result = await advertisingAPI.startMonitoring(campaignId, ["facebook", "google"]);
      if (result.success) {
        setIsMonitoring(true);
        connectWebSocket();
      } else {
        setError(result.error || "Failed to start monitoring");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const stopMonitoring = async () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      await advertisingAPI.stopMonitoring(campaignId);
      setIsMonitoring(false);
      setMetrics(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const connectWebSocket = () => {
    const ws = new WebSocket(`${WS_URL}/ws/campaign-monitoring`);
    wsRef.current = ws;

    ws.onopen = () => {
      // Request to start monitoring
      ws.send(
        JSON.stringify({
          type: "start_monitoring",
          payload: {
            campaign_id: campaignId,
            platforms: ["facebook", "google"],
            update_interval: 30000,
          },
        })
      );
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "metrics_update") {
        setMetrics(message.metrics);
      } else if (message.type === "error") {
        setError(message.error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("WebSocket connection error");
    };

    ws.onclose = () => {
      if (isMonitoring) {
        // Attempt to reconnect
        setTimeout(() => {
          if (isMonitoring) connectWebSocket();
        }, 5000);
      }
    };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaign Monitor</h1>
          <p className="text-muted-foreground mt-2">Real-time campaign performance monitoring</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monitoring Control</CardTitle>
          <CardDescription>Start/stop campaign monitoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              placeholder="Enter campaign ID"
              disabled={isMonitoring}
            />
            {!isMonitoring ? (
              <Button onClick={startMonitoring} disabled={!campaignId}>
                <Activity className="mr-2 h-4 w-4" />
                Start Monitoring
              </Button>
            ) : (
              <Button onClick={stopMonitoring} variant="destructive">
                Stop Monitoring
              </Button>
            )}
          </div>

          {isMonitoring && (
            <Badge variant="outline" className="flex items-center gap-2 w-fit">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              Monitoring Active
            </Badge>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md">{error}</div>
          )}
        </CardContent>
      </Card>

      {metrics && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="facebook">Facebook</TabsTrigger>
            <TabsTrigger value="google">Google Ads</TabsTrigger>
            <TabsTrigger value="tiktok">TikTok</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.aggregated.total_impressions.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.aggregated.total_clicks.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    CTR: {metrics.aggregated.overall_ctr.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Spend</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${metrics.aggregated.total_spend.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    CPC: ${metrics.aggregated.overall_cpc.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.aggregated.total_conversions}</div>
                  <p className="text-xs text-muted-foreground">
                    CPA: ${metrics.aggregated.overall_cpa.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Facebook Tab */}
          <TabsContent value="facebook">
            {metrics.platforms.facebook ? (
              <Card>
                <CardHeader>
                  <CardTitle>Facebook Ads Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Impressions</p>
                      <p className="text-2xl font-bold">
                        {metrics.platforms.facebook.impressions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clicks</p>
                      <p className="text-2xl font-bold">
                        {metrics.platforms.facebook.clicks.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Spend</p>
                      <p className="text-2xl font-bold">
                        ${metrics.platforms.facebook.spend.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CTR</p>
                      <p className="text-2xl font-bold">
                        {metrics.platforms.facebook.ctr.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <p className="text-muted-foreground">No Facebook metrics available</p>
            )}
          </TabsContent>

          {/* Google Tab */}
          <TabsContent value="google">
            {metrics.platforms.google ? (
              <Card>
                <CardHeader>
                  <CardTitle>Google Ads Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Impressions</p>
                      <p className="text-2xl font-bold">
                        {metrics.platforms.google.impressions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clicks</p>
                      <p className="text-2xl font-bold">
                        {metrics.platforms.google.clicks.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Spend</p>
                      <p className="text-2xl font-bold">
                        ${metrics.platforms.google.spend.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CTR</p>
                      <p className="text-2xl font-bold">
                        {metrics.platforms.google.ctr.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <p className="text-muted-foreground">No Google Ads metrics available</p>
            )}
          </TabsContent>

          {/* TikTok Tab */}
          <TabsContent value="tiktok">
            {metrics.platforms.tiktok ? (
              <Card>
                <CardHeader>
                  <CardTitle>TikTok Ads Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Impressions</p>
                      <p className="text-2xl font-bold">
                        {metrics.platforms.tiktok.impressions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clicks</p>
                      <p className="text-2xl font-bold">
                        {metrics.platforms.tiktok.clicks.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Spend</p>
                      <p className="text-2xl font-bold">
                        ${metrics.platforms.tiktok.spend.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CTR</p>
                      <p className="text-2xl font-bold">
                        {metrics.platforms.tiktok.ctr.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <p className="text-muted-foreground">No TikTok metrics available</p>
            )}
          </TabsContent>
        </Tabs>
      )}

      {!metrics && isMonitoring && (
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Waiting for metrics...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
