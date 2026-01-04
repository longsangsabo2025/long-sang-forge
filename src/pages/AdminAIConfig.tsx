// ================================================
// ADMIN AI CONFIG PAGE
// ================================================
// Manage AI Sales Consultant configuration
// Model selection, System Prompt editing, etc.

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
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  AlertCircle,
  Bot,
  Brain,
  CheckCircle2,
  History,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AIConfig {
  id: string;
  version: number;
  is_active: boolean;
  model: string;
  max_tokens: number;
  temperature: number;
  system_prompt: string;
  name: string;
  description: string;
  total_chats: number;
  created_at: string;
  updated_at: string;
}

const AVAILABLE_MODELS = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    cost: "$0.15/$0.60 per 1M tokens",
    speed: "⚡ Fast",
    quality: "★★★★ Good",
    description: "Best balance of cost and quality",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    cost: "$2.5/$10 per 1M tokens",
    speed: "🔄 Medium",
    quality: "★★★★★ Excellent",
    description: "Premium quality for complex tasks",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    cost: "$10/$30 per 1M tokens",
    speed: "🐢 Slow",
    quality: "★★★★★ Best",
    description: "Maximum quality, highest cost",
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    cost: "$0.50/$1.50 per 1M tokens",
    speed: "⚡⚡ Fastest",
    quality: "★★★ Decent",
    description: "Budget option, fast responses",
  },
];

export default function AdminAIConfig() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [versions, setVersions] = useState<AIConfig[]>([]);

  // Editable fields
  const [model, setModel] = useState("gpt-4o-mini");
  const [maxTokens, setMaxTokens] = useState(1200);
  const [temperature, setTemperature] = useState(0.8);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [configName, setConfigName] = useState("");
  const [configDescription, setConfigDescription] = useState("");

  // Test result
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      // Load active config
      const { data: activeConfig, error } = await supabase
        .from("ai_sales_config")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error) throw error;

      if (activeConfig) {
        setConfig(activeConfig);
        setModel(activeConfig.model);
        setMaxTokens(activeConfig.max_tokens);
        setTemperature(Number(activeConfig.temperature));
        setSystemPrompt(activeConfig.system_prompt);
        setConfigName(activeConfig.name || "");
        setConfigDescription(activeConfig.description || "");
      }

      // Load all versions for history
      const { data: allVersions } = await supabase
        .from("ai_sales_config")
        .select("id, version, name, is_active, model, created_at")
        .order("version", { ascending: false });

      if (allVersions) {
        setVersions(allVersions);
      }
    } catch (err) {
      console.error("Failed to load config:", err);
      toast({
        title: "❌ Error",
        description: "Failed to load AI configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("ai_sales_config")
        .update({
          model,
          max_tokens: maxTokens,
          temperature,
          system_prompt: systemPrompt,
          name: configName,
          description: configDescription,
          updated_at: new Date().toISOString(),
        })
        .eq("id", config?.id);

      if (error) throw error;

      toast({
        title: "✅ Saved!",
        description: "AI configuration updated. Changes take effect in ~5 minutes (cache TTL).",
      });

      loadConfig();
    } catch (err) {
      console.error("Failed to save:", err);
      toast({
        title: "❌ Save Failed",
        description: "Could not update configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sales-consultant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userMessage: "Xin chào, tôi muốn làm website bán hàng",
            messages: [],
          }),
        }
      );

      const data = await response.json();

      if (data.response) {
        setTestResult(data.response);
        toast({
          title: "✅ Test Successful",
          description: `Model: ${data.usage?.model || model}`,
        });
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err) {
      console.error("Test failed:", err);
      setTestResult("❌ Test failed: " + (err as Error).message);
    } finally {
      setTesting(false);
    }
  };

  const handleCreateNewVersion = async () => {
    const newVersion = (config?.version || 1) + 1;
    const confirmed = window.confirm(
      `Create new version ${newVersion}? Current config will be saved as inactive.`
    );

    if (!confirmed) return;

    setSaving(true);
    try {
      // Deactivate current
      await supabase.from("ai_sales_config").update({ is_active: false }).eq("id", config?.id);

      // Create new
      const { error } = await supabase.from("ai_sales_config").insert({
        version: newVersion,
        is_active: true,
        model,
        max_tokens: maxTokens,
        temperature,
        system_prompt: systemPrompt,
        name: `Version ${newVersion}`,
        description: `Created from v${config?.version}`,
      });

      if (error) throw error;

      toast({
        title: "✅ New Version Created",
        description: `Version ${newVersion} is now active`,
      });

      loadConfig();
    } catch (err) {
      console.error("Failed to create version:", err);
      toast({
        title: "❌ Error",
        description: "Failed to create new version",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async (versionId: string) => {
    const confirmed = window.confirm(
      "Rollback to this version? Current config will be deactivated."
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      // Deactivate all
      await supabase.from("ai_sales_config").update({ is_active: false }).neq("id", "none");

      // Activate selected
      await supabase.from("ai_sales_config").update({ is_active: true }).eq("id", versionId);

      toast({
        title: "✅ Rollback Complete",
        description: "Configuration has been rolled back",
      });

      loadConfig();
    } catch (err) {
      console.error("Rollback failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Bot className="h-10 w-10 text-primary" />
              AI Sales Config
            </h1>
            <p className="text-muted-foreground">
              Configure AI Sales Consultant - Model, Prompt, Parameters
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadConfig}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload
            </Button>
            <Button variant="outline" onClick={handleCreateNewVersion}>
              <Sparkles className="h-4 w-4 mr-2" />
              New Version
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold">{configName || `Version ${config?.version}`}</p>
                  <p className="text-sm text-muted-foreground">
                    {model} • {maxTokens} tokens • temp {temperature}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{config?.total_chats || 0} chats</Badge>
                <Badge variant="outline">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Config */}
          <div className="lg:col-span-2 space-y-6">
            {/* Model Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Model Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{m.name}</span>
                          <span className="text-xs text-muted-foreground">{m.speed}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Model Info */}
                {AVAILABLE_MODELS.map(
                  (m) =>
                    m.id === model && (
                      <div key={m.id} className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{m.name}</span>
                          <Badge variant="outline">{m.cost}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{m.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span>Speed: {m.speed}</span>
                          <span>Quality: {m.quality}</span>
                        </div>
                      </div>
                    )
                )}
              </CardContent>
            </Card>

            {/* Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Max Tokens: {maxTokens}</Label>
                    <Slider
                      value={[maxTokens]}
                      onValueChange={(v) => setMaxTokens(v[0])}
                      min={100}
                      max={4000}
                      step={100}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Higher = longer responses, more cost
                    </p>
                  </div>

                  <div>
                    <Label>Temperature: {temperature}</Label>
                    <Slider
                      value={[temperature]}
                      onValueChange={(v) => setTemperature(v[0])}
                      min={0}
                      max={1}
                      step={0.1}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Higher = more creative, lower = more focused
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Prompt */}
            <Card>
              <CardHeader>
                <CardTitle>System Prompt</CardTitle>
                <CardDescription>
                  The personality and instructions for AI Sales Consultant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                  placeholder="Enter system prompt..."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {systemPrompt.length} characters
                </p>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Config Name</Label>
                  <Input
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    placeholder="e.g., System Prompt V2 - Elon Edition"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={configDescription}
                    onChange={(e) => setConfigDescription(e.target.value)}
                    placeholder="Describe this configuration..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleTest}
                  disabled={testing}
                >
                  {testing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Test AI Response
                </Button>
              </CardContent>
            </Card>

            {/* Test Result */}
            {testResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Test Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                    {testResult}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Version History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Version History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {versions.map((v) => (
                    <div
                      key={v.id}
                      className={`p-3 rounded-lg border ${
                        v.is_active ? "border-green-500 bg-green-50 dark:bg-green-950" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">v{v.version}</p>
                          <p className="text-xs text-muted-foreground">{v.model}</p>
                        </div>
                        {v.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleRollback(v.id)}>
                            Rollback
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Changes are cached for 5 minutes</p>
                <p>• Test before saving to production</p>
                <p>• Create new version for major changes</p>
                <p>• Rollback if something goes wrong</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
