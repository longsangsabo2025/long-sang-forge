import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { Suspense, lazy } from "react";

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  </div>
);

// Lazy load all page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AutomationDashboard = lazy(() => import("./pages/AutomationDashboard"));
const AgentDetail = lazy(() => import("./pages/AgentDetail"));
const AgentCenter = lazy(() => import("./pages/AgentCenter"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const WorkflowTest = lazy(() => import("./pages/WorkflowTest"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminWorkflows = lazy(() => import("./pages/AdminWorkflows"));
const AdminContentQueue = lazy(() => import("./pages/AdminContentQueue"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminFileManagerReal = lazy(() => import("./pages/AdminFileManagerReal"));
const AdminDocumentEditor = lazy(() => import("./pages/AdminDocumentEditor"));
const GoogleDriveIntegrationTest = lazy(() => import("./pages/GoogleDriveIntegrationTest"));
const CredentialManager = lazy(() => import("./pages/CredentialManager"));
const ConsultationBooking = lazy(() => import("./pages/ConsultationBooking"));
const AdminConsultations = lazy(() => import("./pages/AdminConsultations"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DevSetup = lazy(() => import("./pages/DevSetup").then(m => ({ default: m.DevSetup })));
const SupabaseTest = lazy(() => import("./pages/SupabaseTest").then(m => ({ default: m.SupabaseTest })));
const DatabaseSchema = lazy(() => import("./pages/DatabaseSchema").then(m => ({ default: m.DatabaseSchema })));
const GoogleServices = lazy(() => import("./pages/GoogleServices"));
const GoogleAutomation = lazy(() => import("./pages/GoogleAutomation"));
const GoogleMaps = lazy(() => import("./pages/GoogleMaps"));
const SEOMonitoringDashboard = lazy(() => import("./components/monitoring/SEOMonitoringDashboard").then(m => ({ default: m.SEOMonitoringDashboard })));
const AgentTest = lazy(() => import("./pages/AgentTest"));
const AdminSEOCenter = lazy(() => import("./pages/AdminSEOCenter"));
const PricingPage = lazy(() => import("./pages/Pricing").then(m => ({ default: m.PricingPage })));
const SubscriptionDashboard = lazy(() => import("./components/subscription/SubscriptionDashboard").then(m => ({ default: m.SubscriptionDashboard })));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminCourses = lazy(() => import("./pages/AdminCourses"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PlatformIntegrations = lazy(() => import("./pages/PlatformIntegrations"));
const Academy = lazy(() => import("./pages/Academy"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const LearningPathPage = lazy(() => import("./pages/LearningPathPage"));
const MVPMarketplace = lazy(() => import("./components/agent-center/MVPMarketplace").then(m => ({ default: m.MVPMarketplace })));
const AgentDetailPage = lazy(() => import("./pages/AgentDetailPage").then(m => ({ default: m.AgentDetailPage })));
const AgentDashboard = lazy(() => import("./pages/AgentDashboard"));
const ProjectShowcase = lazy(() => import("./pages/ProjectShowcase"));
const EnhancedProjectShowcase = lazy(() => import("./pages/EnhancedProjectShowcase"));
const AppShowcaseDetail = lazy(() => import("./pages/AppShowcaseDetail"));
const AppShowcaseAdmin = lazy(() => import("./pages/AppShowcaseAdmin").then(m => ({ default: m.AppShowcaseAdmin })));
const ProjectInterest = lazy(() => import("./pages/ProjectInterest"));
const InvestmentPortalLayout = lazy(() => import("./pages/InvestmentPortalLayout"));
const InvestmentOverview = lazy(() => import("./pages/InvestmentOverview"));
const InvestmentRoadmap = lazy(() => import("./pages/InvestmentRoadmap"));
const InvestmentFinancials = lazy(() => import("./pages/InvestmentFinancials"));
const InvestmentApply = lazy(() => import("./pages/InvestmentApply"));
const CVPage = lazy(() => import("./pages/cv/CVPage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="sabo-arena-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<Index />} />
          
          {/* Public Pricing Page */}
          <Route path="/pricing" element={<PricingPage />} />
          
          {/* CV Page */}
          <Route path="/cv" element={<CVPage />} />
          
          {/* Academy - Learning Platform */}
          <Route path="/academy" element={<Academy />} />
          <Route path="/academy/course/:id" element={<CourseDetail />} />
          <Route path="/academy/learning-path" element={<LearningPathPage />} />
          
          {/* Payment Success */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          
          {/* Public Consultation Booking */}
          <Route path="/consultation" element={<ConsultationBooking />} />
          
          {/* MVP Marketplace - Public */}
          <Route path="/marketplace" element={<MVPMarketplace />} />
          <Route path="/marketplace/:agentId" element={<AgentDetailPage />} />
          
          {/* Showcase Pages */}
          <Route path="/project-showcase" element={<EnhancedProjectShowcase />} />
          <Route path="/legacy-showcase" element={<ProjectShowcase />} />
          <Route path="/project-showcase/:slug" element={<AppShowcaseDetail />} />
          <Route path="/project-showcase/:slug/interest" element={<ProjectInterest />} />
          
          {/* Investment Portal - Nested Routes */}
          <Route path="/project-showcase/:slug/investment" element={<InvestmentPortalLayout />}>
            <Route index element={<InvestmentOverview />} />
            <Route path="roadmap" element={<InvestmentRoadmap />} />
            <Route path="financials" element={<InvestmentFinancials />} />
            <Route path="apply" element={<InvestmentApply />} />
          </Route>
          
          <Route path="/app-showcase/admin" element={<AppShowcaseAdmin />} />
          
          {/* User Dashboard */}
          <Route path="/dashboard" element={<AgentDashboard />} />
          
          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Dev/Debug Routes */}
          <Route path="/dev-setup" element={<DevSetup />} />
          <Route path="/supabase-test" element={<SupabaseTest />} />
          <Route path="/google-drive-test" element={<GoogleDriveIntegrationTest />} />
          
          {/* Admin Portal - Protected with AdminLayout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="workflows" element={<AdminWorkflows />} />
            <Route path="content-queue" element={<AdminContentQueue />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="consultations" element={<AdminConsultations />} />
            <Route path="files" element={<AdminFileManagerReal />} />
            <Route path="documents" element={<AdminDocumentEditor />} />
            <Route path="credentials" element={<CredentialManager />} />
            <Route path="seo-monitoring" element={<SEOMonitoringDashboard />} />
            <Route path="seo-center" element={<AdminSEOCenter />} />
            <Route path="subscription" element={<SubscriptionDashboard />} />
            <Route path="integrations" element={<PlatformIntegrations />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="google-services" element={<GoogleServices />} />
            <Route path="google-automation" element={<GoogleAutomation />} />
            <Route path="google-maps" element={<GoogleMaps />} />
            <Route path="database-schema" element={<DatabaseSchema />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Automation & Agent Center - Protected with AdminLayout */}
          <Route
            path="/automation"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AutomationDashboard />} />
            <Route path="agents/:id" element={<AgentDetail />} />
          </Route>

          <Route
            path="/agent-center"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AgentCenter />} />
          </Route>

          {/* Additional Admin Tools - Protected with AdminLayout */}
          <Route
            path="/agent-test"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AgentTest />} />
          </Route>

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AnalyticsDashboard />} />
          </Route>

          {/* Workflow Test - Public for testing */}
          <Route path="/workflow-test" element={<WorkflowTest />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
