import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Bot, DollarSign, Plus, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AgentCard from "./AgentCard";
import CreateAgentDialog from "./CreateAgentDialog";

interface Agent {
  id: string;
  name: string;
  role: string;
  type: string;
  status: string;
  description: string;
  category?: string; // Thêm category
  capabilities: string[];
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_execution_time_ms: number;
  total_cost_usd: number;
  last_used_at: string | null;
  created_at?: string;
  updated_at?: string;
}

// Danh sách lĩnh vực/categories
const AGENT_CATEGORIES = {
  marketing: { label: "Marketing & Sales", icon: "📢", color: "bg-pink-100 text-pink-800" },
  "customer-service": {
    label: "Dịch Vụ Khách Hàng",
    icon: "🎧",
    color: "bg-blue-100 text-blue-800",
  },
  content: { label: "Nội Dung & Sáng Tạo", icon: "✍️", color: "bg-purple-100 text-purple-800" },
  "data-analysis": { label: "Phân Tích Dữ Liệu", icon: "📊", color: "bg-green-100 text-green-800" },
  automation: { label: "Tự Động Hóa", icon: "⚙️", color: "bg-orange-100 text-orange-800" },
  research: { label: "Nghiên Cứu & Tìm Kiếm", icon: "🔍", color: "bg-indigo-100 text-indigo-800" },
  development: { label: "Phát Triển & Lập Trình", icon: "💻", color: "bg-cyan-100 text-cyan-800" },
  finance: { label: "Tài Chính & Kế Toán", icon: "💰", color: "bg-emerald-100 text-emerald-800" },
  other: { label: "Khác", icon: "📦", color: "bg-gray-100 text-gray-800" },
};

const AgentsDashboard = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAgents((data || []) as unknown as Agent[]);
    } catch (error) {
      console.error("❌ Error fetching agents:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách agents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const calculateStats = () => {
    const totalExecutions = agents.reduce((sum, a) => sum + a.total_executions, 0);
    const totalCost = agents.reduce((sum, a) => sum + a.total_cost_usd, 0);
    const avgSuccessRate =
      agents.length > 0
        ? agents.reduce((sum, a) => {
            const rate =
              a.total_executions > 0 ? (a.successful_executions / a.total_executions) * 100 : 0;
            return sum + rate;
          }, 0) / agents.length
        : 0;
    const activeAgents = agents.filter((a) => a.status === "active").length;

    return { totalExecutions, totalCost, avgSuccessRate, activeAgents };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* DEBUG INFO */}
      <div className="bg-yellow-900 border border-yellow-600 rounded p-4">
        <p className="text-white font-bold">DEBUG: Agents count = {agents.length}</p>
        <p className="text-yellow-200">Loading: {loading ? "true" : "false"}</p>
        {agents.length > 0 && (
          <details className="mt-2">
            <summary className="text-yellow-200 cursor-pointer">Show agents data</summary>
            <pre className="text-xs mt-2 overflow-auto bg-slate-950 p-2 rounded">
              {JSON.stringify(agents, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-950 to-blue-900 border-blue-700 shadow-lg shadow-blue-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{agents.length}</div>
            <p className="text-xs text-slate-400">{stats.activeAgents} active</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-950 to-green-900 border-green-700 shadow-lg shadow-green-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Total Executions</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalExecutions.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400">Across all agents</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-950 to-purple-900 border-purple-700 shadow-lg shadow-purple-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-slate-400">Average across agents</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-950 to-orange-900 border-orange-700 shadow-lg shadow-orange-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime usage</p>
          </CardContent>
        </Card>
      </div>

      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Danh Sách AI Agents</h2>
          <p className="text-sm text-muted-foreground">Quản lý và giám sát các AI agents của bạn</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Tạo Agent Mới
        </Button>
      </div>

      {/* Category Filter */}
      <Card className="bg-slate-900 border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-slate-200">🏷️ Lọc Theo Lĩnh Vực</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className={
                selectedCategory === "all"
                  ? ""
                  : "border-slate-600 text-slate-300 hover:bg-slate-800"
              }
            >
              Tất Cả ({agents.length})
            </Button>
            {Object.entries(AGENT_CATEGORIES).map(([key, cat]) => {
              const count = agents.filter((a) => a.category === key).length;
              if (count === 0) return null;
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className={`gap-1 ${
                    selectedCategory === key
                      ? ""
                      : "border-slate-600 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <Badge variant="secondary" className="ml-1 bg-slate-700 text-slate-200">
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Agents Grid */}
      {agents.length === 0 ? (
        <Card className="bg-slate-900 border-slate-700 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="w-16 h-16 text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-slate-200">Chưa có agent nào</h3>
            <p className="text-sm text-slate-400 mb-4">Tạo agent đầu tiên của bạn để bắt đầu</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo Agent Mới
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents
            .filter((agent) => selectedCategory === "all" || agent.category === selectedCategory)
            .map((agent) => (
              <AgentCard key={agent.id} agent={agent} onUpdate={fetchAgents} />
            ))}
        </div>
      )}

      {/* Create Agent Dialog */}
      <CreateAgentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchAgents}
      />
    </div>
  );
};

export default AgentsDashboard;
