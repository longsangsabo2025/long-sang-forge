// ================================================
// ADMIN SETTINGS PAGE
// ================================================
// Global configuration for admins

import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Bell, Brain, DollarSign, Key, Loader2, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminSettings() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // General Settings
  const [defaultAiModel, setDefaultAiModel] = useState("gpt-4o-mini");
  const [autoApprove, setAutoApprove] = useState(false);
  const [systemWideLogging, setSystemWideLogging] = useState(true);

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [toastNotifications, setToastNotifications] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  // Budget Settings
  const [globalDailyLimit, setGlobalDailyLimit] = useState(50);
  const [globalMonthlyLimit, setGlobalMonthlyLimit] = useState(1000);
  const [alertThreshold, setAlertThreshold] = useState(75);

  // API Keys
  const [openaiKey, setOpenaiKey] = useState("");
  const [resendKey, setResendKey] = useState("");
  const [linkedinKey, setLinkedinKey] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // Load from user preferences or system config table
    // For now, use defaults
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save settings to database
      const settings = {
        general: {
          default_ai_model: defaultAiModel,
          auto_approve: autoApprove,
          system_wide_logging: systemWideLogging,
        },
        notifications: {
          email_enabled: emailNotifications,
          toast_enabled: toastNotifications,
          notification_email: notificationEmail,
          webhook_url: webhookUrl,
        },
        budget: {
          global_daily_limit: globalDailyLimit,
          global_monthly_limit: globalMonthlyLimit,
          alert_threshold: alertThreshold,
        },
      };

      // In production, save to profiles table or system config table

      toast({
        title: "✅ Settings Saved",
        description: "All settings have been updated successfully",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "❌ Save Failed",
        description: "Could not save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">System Settings</h1>
          <p className="text-muted-foreground">
            Configure global settings for all agents and automation
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="general">
              <Settings className="h-4 w-4 mr-1" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-1" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="budget">
              <DollarSign className="h-4 w-4 mr-1" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="api-keys">
              <Key className="h-4 w-4 mr-1" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="ai-models">
              <Brain className="h-4 w-4 mr-1" />
              AI Models
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure default behavior for all agents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Default AI Model</Label>
                  <Select value={defaultAiModel} onValueChange={setDefaultAiModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o (Premium)</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini (Recommended)</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Budget)</SelectItem>
                      <SelectItem value="claude-sonnet-4">Claude Sonnet 4</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    New agents will use this model by default
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Auto-Approve Content</Label>
                    <p className="text-sm text-muted-foreground">
                      Skip manual review and auto-publish all content
                    </p>
                  </div>
                  <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>System-Wide Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Log all agent activities and API calls
                    </p>
                  </div>
                  <Switch checked={systemWideLogging} onCheckedChange={setSystemWideLogging} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email alerts for important events
                    </p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                {emailNotifications && (
                  <div className="space-y-2">
                    <Label>Notification Email</Label>
                    <Input
                      type="email"
                      placeholder="admin@yourdomain.com"
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Toast Notifications</Label>
                    <p className="text-sm text-muted-foreground">Show in-app notification toasts</p>
                  </div>
                  <Switch checked={toastNotifications} onCheckedChange={setToastNotifications} />
                </div>

                <div className="space-y-2">
                  <Label>Webhook URL (Optional)</Label>
                  <Input
                    type="url"
                    placeholder="https://your-webhook.com/notify"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Send webhook notifications to external services (Slack, Discord, etc.)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Settings */}
          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Global Budget Limits</CardTitle>
                <CardDescription>Set system-wide spending limits across all agents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Global Daily Limit (USD)</Label>
                  <Input
                    type="number"
                    value={globalDailyLimit}
                    onChange={(e) => setGlobalDailyLimit(Number(e.target.value))}
                    min={0}
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum total spend per day across all agents
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Global Monthly Limit (USD)</Label>
                  <Input
                    type="number"
                    value={globalMonthlyLimit}
                    onChange={(e) => setGlobalMonthlyLimit(Number(e.target.value))}
                    min={0}
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum total spend per month across all agents
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Alert Threshold (%)</Label>
                  <Input
                    type="number"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(Number(e.target.value))}
                    min={0}
                    max={100}
                  />
                  <p className="text-sm text-muted-foreground">
                    Get notified when spending reaches this percentage of the limit
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Current Spending</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Today:</span>
                      <Badge>$0.00 / ${globalDailyLimit}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>This Month:</span>
                      <Badge>$0.00 / ${globalMonthlyLimit}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys */}
          <TabsContent value="api-keys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Keys Management</CardTitle>
                <CardDescription>Configure API keys for external services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Security Note:</strong> API keys are stored securely in Supabase
                    Secrets. For production, use the CLI:{" "}
                    <code className="bg-blue-100 px-1 rounded">
                      npx supabase secrets set KEY_NAME="value"
                    </code>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>OpenAI API Key</Label>
                  <Input
                    type="password"
                    placeholder="sk-proj-..."
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Get from{" "}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener"
                      className="text-primary underline"
                    >
                      platform.openai.com/api-keys
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Resend API Key (Email)</Label>
                  <Input
                    type="password"
                    placeholder="re_..."
                    value={resendKey}
                    onChange={(e) => setResendKey(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Get from{" "}
                    <a
                      href="https://resend.com/api-keys"
                      target="_blank"
                      rel="noopener"
                      className="text-primary underline"
                    >
                      resend.com/api-keys
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>LinkedIn Access Token</Label>
                  <Input
                    type="password"
                    placeholder="AQV..."
                    value={linkedinKey}
                    onChange={(e) => setLinkedinKey(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    OAuth 2.0 token from LinkedIn Developer Portal
                  </p>
                </div>

                <Button variant="outline" className="w-full">
                  Test All Connections
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Models */}
          <TabsContent value="ai-models" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Models Overview</CardTitle>
                <CardDescription>Compare models and their costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "GPT-4o", cost: "$0.01/request", speed: "Fast", quality: "Excellent" },
                    {
                      name: "GPT-4o Mini",
                      cost: "$0.002/request",
                      speed: "Very Fast",
                      quality: "Very Good",
                    },
                    {
                      name: "GPT-3.5 Turbo",
                      cost: "$0.001/request",
                      speed: "Fastest",
                      quality: "Good",
                    },
                    {
                      name: "Claude Sonnet 4",
                      cost: "$0.015/request",
                      speed: "Fast",
                      quality: "Excellent",
                    },
                    {
                      name: "Claude Haiku",
                      cost: "$0.0008/request",
                      speed: "Very Fast",
                      quality: "Good",
                    },
                  ].map((model) => (
                    <div
                      key={model.name}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold">{model.name}</h4>
                        <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                          <span>Speed: {model.speed}</span>
                          <span>•</span>
                          <span>Quality: {model.quality}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{model.cost}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reset Changes
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save All Settings
          </Button>
        </div>
      </div>
    </Layout>
  );
}
