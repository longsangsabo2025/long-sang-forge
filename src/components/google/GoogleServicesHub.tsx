/**
 * Google Services Hub - Dashboard
 * Unified view for all Google services integration
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointerClick,
  RefreshCw,
  Settings,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import {
  getDashboardMetrics,
  getGoogleConfig,
  syncToGoogleSheets,
  generateDashboardReport,
  getSyncLogs,
  type DashboardMetrics,
  type GoogleServicesConfig,
  type SyncLog
} from '@/lib/google/hub';
import { toast } from 'sonner';

export const GoogleServicesHub = () => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [config, setConfig] = useState<GoogleServicesConfig | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsData, configData, logs] = await Promise.all([
        getDashboardMetrics().catch(() => null),
        getGoogleConfig(),
        getSyncLogs(20),
      ]);

      setMetrics(metricsData);
      setConfig(configData);
      setSyncLogs(logs);
    } catch (error) {
      console.error('Error loading Google Services data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      toast.info('Starting sync to Google Sheets...');
      
      const result = await syncToGoogleSheets();
      
      toast.success(`Synced ${result.recordsSynced} records to Google Sheets`);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      toast.info('Generating dashboard report...');
      const result = await generateDashboardReport();
      toast.success('Dashboard report generated successfully');
      window.open(result.spreadsheetUrl, '_blank');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Report generation failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="space-y-6">
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            Google Services not configured. Please set up your Google Analytics Property ID in settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Google Services Hub</h1>
          <p className="text-muted-foreground mt-1">
            Unified dashboard for Analytics, SEO, and automation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadData}
            disabled={syncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleSync}
            disabled={syncing || !config.sheets_auto_sync}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Sync to Sheets
          </Button>
          <Button
            variant="secondary"
            onClick={handleGenerateReport}
            disabled={!config.reporting_spreadsheet_id}
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.analytics.totalSessions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={metrics.analytics.comparison.sessionsChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {metrics.analytics.comparison.sessionsChange >= 0 ? '+' : ''}
                  {metrics.analytics.comparison.sessionsChange.toFixed(1)}%
                </span> from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.analytics.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={metrics.analytics.comparison.usersChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {metrics.analytics.comparison.usersChange >= 0 ? '+' : ''}
                  {metrics.analytics.comparison.usersChange.toFixed(1)}%
                </span> from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.analytics.conversions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={metrics.analytics.comparison.conversionsChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {metrics.analytics.comparison.conversionsChange >= 0 ? '+' : ''}
                  {metrics.analytics.comparison.conversionsChange.toFixed(1)}%
                </span> from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg SEO Position</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.seo.avgPosition.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {metrics.seo.topKeywords.length} keywords
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="seo">SEO Keywords</TabsTrigger>
          <TabsTrigger value="sync">Sync Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Analytics Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Last 7 Days Analytics</CardTitle>
                <CardDescription>Sessions and users trend</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics?.analytics.last7Days.map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                    <div className="flex gap-4 text-sm">
                      <span><BarChart3 className="h-3 w-3 inline mr-1" />{day.sessions}</span>
                      <span><Users className="h-3 w-3 inline mr-1" />{day.users}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Google Sheets Info */}
            <Card>
              <CardHeader>
                <CardTitle>Google Sheets Sync</CardTitle>
                <CardDescription>Reporting spreadsheet status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.reporting_spreadsheet_id ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Spreadsheet</span>
                      <a
                        href={metrics?.sheets.spreadsheetUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Sync</span>
                      <span className="text-sm text-muted-foreground">
                        {metrics?.sheets.lastSyncTime 
                          ? new Date(metrics.sheets.lastSyncTime).toLocaleString()
                          : 'Never'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Auto-Sync</span>
                      <Badge variant={config.sheets_auto_sync ? 'default' : 'secondary'}>
                        {config.sheets_auto_sync ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <Alert>
                    <AlertDescription>
                      No reporting spreadsheet configured. Click "Sync to Sheets" to create one.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Top 5 traffic sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.traffic.sources.map((source, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{source.source}</div>
                        <div className="text-xs text-muted-foreground">{source.sessions} sessions</div>
                      </div>
                      <div className="text-sm font-bold">{source.percentage.toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>Traffic by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.traffic.devices.map((device, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium capitalize">{device.device}</div>
                        <div className="text-xs text-muted-foreground">{device.sessions} sessions</div>
                      </div>
                      <div className="text-sm font-bold">{device.percentage.toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top SEO Keywords</CardTitle>
              <CardDescription>Best performing keywords</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics?.seo.topKeywords.map((keyword, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <div className="text-sm font-medium">{keyword.keyword}</div>
                      <div className="text-xs text-muted-foreground">{keyword.clicks} clicks</div>
                    </div>
                    <Badge variant={keyword.position <= 3 ? 'default' : 'secondary'}>
                      #{keyword.position.toFixed(0)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Logs Tab */}
        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sync History</CardTitle>
              <CardDescription>Last 20 sync operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {syncLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      {log.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      {log.status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                      {log.status === 'running' && <Clock className="h-4 w-4 text-blue-600 animate-spin" />}
                      <div>
                        <div className="text-sm font-medium capitalize">{log.service}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={log.status === 'success' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}>
                        {log.status}
                      </Badge>
                      {log.records_synced > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {log.records_synced} records
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
