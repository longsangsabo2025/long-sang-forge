import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ScrollRestoration } from "./components/ScrollRestoration";
import { AdminRoute } from "./components/auth/AdminRoute";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ChatLayoutProvider } from "./components/chat/GlobalChat";
import { ThemeProvider } from "./components/theme/ThemeProvider";

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-muted-foreground">Đang tải...</p>
    </div>
  </div>
);

// ============================================
// PUBLIC PAGES - Portfolio & Marketing
// ============================================
const Index = lazy(() => import("./pages/Index"));
const CVPage = lazy(() => import("./pages/cv/CVPage"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));

// ============================================
// PUBLIC PAGES - Showcase & Projects (V2 - Database Only)
// ============================================
const EnhancedProjectShowcase = lazy(() => import("./pages/EnhancedProjectShowcaseV2"));
const AppShowcaseDetail = lazy(() => import("./pages/AppShowcaseDetail"));
const ProjectShowcaseDetailPage = lazy(() => import("./pages/ProjectShowcaseDetailPage"));
const ProjectInterest = lazy(() => import("./pages/ProjectInterest"));

// Investment Portal
const InvestmentPortalLayout = lazy(() => import("./pages/InvestmentPortalLayout"));
const InvestmentOverview = lazy(() => import("./pages/InvestmentOverview"));
const InvestmentRoadmap = lazy(() => import("./pages/InvestmentRoadmap"));
const InvestmentFinancials = lazy(() => import("./pages/InvestmentFinancials"));
const InvestmentApply = lazy(() => import("./pages/InvestmentApply"));

// ============================================
// PUBLIC PAGES - Academy & Learning (COMING SOON)
// ============================================
const Academy = lazy(() => import("./pages/ComingSoon"));
const CourseDetail = lazy(() => import("./pages/ComingSoon"));
const LearningPathPage = lazy(() => import("./pages/ComingSoon"));

// ============================================
// PUBLIC PAGES - Marketplace (COMING SOON)
// ============================================
const MVPMarketplace = lazy(() => import("./pages/ComingSoon"));
const AgentDetailPage = lazy(() => import("./pages/ComingSoon"));

// ============================================
// AI SECOND BRAIN (ENABLED!)
// ============================================
const BrainDashboard = lazy(() => import("./pages/BrainDashboard"));
const DomainView = lazy(() => import("./pages/DomainView"));
const MyBrain = lazy(() => import("./pages/MyBrain"));
const BrainPricing = lazy(() => import("./pages/BrainPricing"));

// Coming Soon Page
const ComingSoon = lazy(() => import("./pages/ComingSoon"));

// Legal Pages
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));

// ============================================
// USER PAGES - After Login
// ============================================
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Welcome = lazy(() => import("./pages/Welcome"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ConsultationBooking = lazy(() => import("./pages/ConsultationBooking"));

// ============================================
// USER WORKSPACE
// ============================================
const UserWorkspaceLayout = lazy(() =>
  import("./components/workspace/UserWorkspaceLayout").then((m) => ({
    default: m.UserWorkspaceLayout,
  }))
);
const WorkspaceDashboard = lazy(() => import("./pages/workspace/WorkspaceDashboard"));
const CommandCenter = lazy(() => import("./pages/workspace/CommandCenter"));
const IdeaBank = lazy(() => import("./pages/workspace/IdeaBank"));
const MyConsultations = lazy(() => import("./pages/workspace/MyConsultations"));

// ============================================
// ADMIN PAGES
// ============================================
const AdminLayout = lazy(() =>
  import("./components/admin/AdminLayout").then((m) => ({ default: m.AdminLayout }))
);
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminIdeas = lazy(() => import("./pages/AdminIdeas"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminAIConfig = lazy(() => import("./pages/AdminAIConfig"));
const AdminSEOCenter = lazy(() => import("./pages/AdminSEOCenter"));
const AdminWorkflows = lazy(() => import("./pages/AdminWorkflows"));
const AdminCourses = lazy(() => import("./pages/AdminCourses"));
const AdminContentQueue = lazy(() => import("./pages/AdminContentQueue"));
const AdminConsultations = lazy(() => import("./pages/AdminConsultations"));
const AdminContacts = lazy(() => import("./pages/AdminContacts"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminFileManager = lazy(() => import("./pages/AdminFileManager"));
const AdminDocumentEditor = lazy(() => import("./pages/AdminDocumentEditor"));
const AdminSubscriptions = lazy(() => import("./pages/AdminSubscriptions"));
const ProjectShowcaseList = lazy(() => import("./pages/admin/ProjectShowcaseList"));
const ProjectShowcaseEditor = lazy(() => import("./pages/admin/ProjectShowcaseEditor"));

// ============================================
// USER SUBSCRIPTION
// ============================================
const SubscriptionPricing = lazy(() => import("./pages/SubscriptionPricing"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes before refetching
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Don't refetch on window focus in production
      refetchOnWindowFocus: import.meta.env.DEV,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="longsang-theme">
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <ChatLayoutProvider>
                  <ScrollRestoration />
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* ===== PORTFOLIO HOME ===== */}
                      <Route path="/" element={<Index />} />

                      {/* ===== MY CV ===== */}
                      <Route path="/cv" element={<CVPage />} />

                      {/* ===== PAYMENT SUCCESS ===== */}
                      <Route path="/payment-success" element={<PaymentSuccess />} />

                      {/* ===== PROJECT SHOWCASE ===== */}
                      {/* Main showcase list with sidebar (can select projects) */}
                      <Route path="/showcase" element={<EnhancedProjectShowcase />} />
                      <Route path="/projects" element={<EnhancedProjectShowcase />} />
                      <Route path="/projects/:slug" element={<EnhancedProjectShowcase />} />
                      <Route path="/project-showcase" element={<EnhancedProjectShowcase />} />

                      {/* Landing pages (standalone, no sidebar) */}
                      <Route path="/showcase/:slug" element={<AppShowcaseDetail />} />
                      <Route path="/landing-page/:slug" element={<AppShowcaseDetail />} />

                      {/* Detail page (requires auth) */}
                      <Route
                        path="/project-showcase/:slug"
                        element={<ProjectShowcaseDetailPage />}
                      />
                      <Route
                        path="/project-showcase/:slug/interest"
                        element={<ProjectInterest />}
                      />

                      {/* Investment Portal */}
                      <Route
                        path="/project-showcase/:slug/investment"
                        element={<InvestmentPortalLayout />}
                      >
                        <Route index element={<InvestmentOverview />} />
                        <Route path="roadmap" element={<InvestmentRoadmap />} />
                        <Route path="financials" element={<InvestmentFinancials />} />
                        <Route path="apply" element={<InvestmentApply />} />
                      </Route>

                      {/* ===== ACADEMY (COMING SOON) ===== */}
                      <Route path="/academy" element={<ComingSoon />} />
                      <Route path="/academy/*" element={<ComingSoon />} />
                      <Route path="/coming-soon/:feature" element={<ComingSoon />} />

                      {/* ===== MARKETPLACE (COMING SOON) ===== */}
                      <Route path="/marketplace" element={<ComingSoon />} />
                      <Route path="/marketplace/*" element={<ComingSoon />} />

                      {/* ===== AI SECOND BRAIN (ENABLED!) ===== */}
                      <Route path="/brain" element={<BrainDashboard />} />
                      <Route path="/brain/domain/:domainId" element={<DomainView />} />
                      <Route path="/my-brain" element={<MyBrain />} />
                      <Route path="/brain/pricing" element={<BrainPricing />} />

                      {/* ===== LEGAL PAGES ===== */}
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<TermsOfService />} />

                      {/* ===== USER PAGES ===== */}
                      <Route path="/dashboard" element={<Welcome />} />
                      <Route path="/welcome" element={<Welcome />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/consultation" element={<ConsultationBooking />} />

                      {/* ===== USER SUBSCRIPTION ===== */}
                      <Route path="/subscription" element={<SubscriptionPricing />} />

                      {/* ===== USER WORKSPACE ===== */}
                      <Route path="/workspace" element={<UserWorkspaceLayout />}>
                        <Route index element={<WorkspaceDashboard />} />
                        <Route path="hub" element={<CommandCenter />} />
                        <Route path="ideas" element={<IdeaBank />} />
                        <Route path="consultations" element={<MyConsultations />} />
                      </Route>

                      {/* ===== AUTH CALLBACK ===== */}
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route path="/reset-password" element={<ResetPassword />} />

                      {/* ===== ADMIN ROUTES ===== */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route
                        path="/admin"
                        element={
                          <AdminRoute>
                            <AdminLayout />
                          </AdminRoute>
                        }
                      >
                        <Route index element={<AdminDashboard />} />
                        <Route path="ideas" element={<AdminIdeas />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="settings" element={<AdminSettings />} />
                        <Route path="ai-config" element={<AdminAIConfig />} />
                        <Route path="seo-center" element={<AdminSEOCenter />} />
                        <Route path="workflows" element={<AdminWorkflows />} />
                        <Route path="courses" element={<AdminCourses />} />
                        <Route path="content-queue" element={<AdminContentQueue />} />
                        <Route path="consultations" element={<AdminConsultations />} />
                        <Route path="contacts" element={<AdminContacts />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="files" element={<AdminFileManager />} />
                        <Route path="documents" element={<AdminDocumentEditor />} />
                        <Route path="subscriptions" element={<AdminSubscriptions />} />
                        <Route path="projects" element={<ProjectShowcaseList />} />
                        <Route path="projects/new" element={<ProjectShowcaseEditor />} />
                        <Route path="projects/:projectId" element={<ProjectShowcaseEditor />} />
                      </Route>

                      {/* ===== 404 NOT FOUND ===== */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ChatLayoutProvider>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
