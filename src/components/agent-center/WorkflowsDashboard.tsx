import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Workflow, Play, GitBranch, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WorkflowCard from "./WorkflowCard";
import CreateWorkflowDialog from "./CreateWorkflowDialog";

interface WorkflowType {
  id: string;
  name: string;
  type: string;
  description: string;
  status: string;
  is_template: boolean;
  tags: string[];
  total_executions: number;
  avg_execution_time_ms: number;
  success_rate: number;
  last_executed_at: string | null;
}

const WorkflowsDashboard = () => {
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      // TODO: Replace with actual API call
      // Simulated data
      const mockWorkflows: WorkflowType[] = [
        {
          id: "1",
          name: "content_creation_pipeline",
          type: "sequential",
          description: "Complete content creation workflow: Research → Outline → Write → Edit → SEO",
          status: "active",
          is_template: true,
          tags: ["content", "marketing", "seo"],
          total_executions: 45,
          avg_execution_time_ms: 12500,
          success_rate: 95.5,
          last_executed_at: new Date().toISOString(),
        },
        {
          id: "2",
          name: "data_analysis_workflow",
          type: "sequential",
          description: "Data analysis pipeline: Collect → Clean → Analyze → Visualize → Report",
          status: "active",
          is_template: true,
          tags: ["data", "analysis", "reporting"],
          total_executions: 28,
          avg_execution_time_ms: 18000,
          success_rate: 92.8,
          last_executed_at: new Date().toISOString(),
        },
        {
          id: "3",
          name: "multi_channel_marketing",
          type: "parallel",
          description: "Create content for multiple channels simultaneously",
          status: "active",
          is_template: true,
          tags: ["marketing", "content", "multi-channel"],
          total_executions: 15,
          avg_execution_time_ms: 8500,
          success_rate: 88.0,
          last_executed_at: new Date().toISOString(),
        },
      ];
      
      setWorkflows(mockWorkflows);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load workflows",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalExecutions = workflows.reduce((sum, w) => sum + w.total_executions, 0);
    const avgSuccessRate = workflows.length > 0
      ? workflows.reduce((sum, w) => sum + w.success_rate, 0) / workflows.length
      : 0;
    const activeWorkflows = workflows.filter(w => w.status === 'active').length;
    const templates = workflows.filter(w => w.is_template).length;

    return { totalExecutions, avgSuccessRate, activeWorkflows, templates };
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-950 to-blue-900 border-blue-700 shadow-lg shadow-blue-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Total Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{workflows.length}</div>
            <p className="text-xs text-slate-400">
              {stats.activeWorkflows} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-950 to-green-900 border-green-700 shadow-lg shadow-green-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Executions</CardTitle>
            <Play className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalExecutions}</div>
            <p className="text-xs text-slate-400">
              Total runs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-950 to-purple-900 border-purple-700 shadow-lg shadow-purple-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Success Rate</CardTitle>
            <Zap className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-slate-400">
              Average
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-950 to-orange-900 border-orange-700 shadow-lg shadow-orange-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Templates</CardTitle>
            <GitBranch className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.templates}</div>
            <p className="text-xs text-muted-foreground">
              Pre-built workflows
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Workflows</h2>
          <p className="text-sm text-slate-400">
            Orchestrate complex multi-agent workflows
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
          <Plus className="w-4 h-4" />
          Create Workflow
        </Button>
      </div>

      {/* Workflows Grid */}
      {workflows.length === 0 ? (
        <Card className="bg-slate-900 border-slate-700 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Workflow className="w-16 h-16 text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-slate-200">No workflows yet</h3>
            <p className="text-sm text-slate-400 mb-4">
              Create your first workflow to get started
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} onUpdate={fetchWorkflows} />
          ))}
        </div>
      )}

      {/* Create Workflow Dialog */}
      <CreateWorkflowDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchWorkflows}
      />
    </div>
  );
};

export default WorkflowsDashboard;
