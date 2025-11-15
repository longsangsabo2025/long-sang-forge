import WorkflowTester from "@/components/WorkflowTester";

const AdminWorkflows = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-2">
          <span className="text-3xl">🔧</span>
          <div>
            <h1 className="text-3xl font-bold">Developer Testing Tools</h1>
            <p className="text-muted-foreground mt-1">
              Dành cho <strong>Developers</strong> - Công cụ test và debug workflows nâng cao
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              💡 <strong>Mục đích:</strong> Test workflows, debug issues, validate automation logic
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Tester Component */}
      <WorkflowTester />
    </div>
  );
};

export default AdminWorkflows;
