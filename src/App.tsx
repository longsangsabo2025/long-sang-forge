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
// AI SECOND BRAIN (COMING SOON)
// ============================================
const BrainDashboard = lazy(() => import("./pages/ComingSoon"));
const DomainView = lazy(() => import("./pages/ComingSoon"));

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
const IdeasHub = lazy(() => import("./pages/workspace/IdeasHub"));
const MyProjects = lazy(() => import("./pages/workspace/MyProjects"));
const SavedProducts = lazy(() => import("./pages/workspace/SavedProducts"));
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

const queryClient = new QueryClient();

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
                <ScrollRestoration />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* ===== PORTFOLIO HOME ===== */}
                    <Route path="/" element={<Index />} />

                    {/* ===== MY CV ===== */}
                    <Route path="/cv" element={<CVPage />} />

                    {/* ===== PAYMENT SUCCESS ===== */}
                    <Route path="/payment-success" element={<PaymentSuccess />} />

                    {/* ===== PROJECT SHOWCASE (V2 - 100% Database) ===== */}
                    <Route path="/showcase" element={<EnhancedProjectShowcase />} />
                    <Route path="/project-showcase" element={<EnhancedProjectShowcase />} />
                    <Route path="/projects/:slug" element={<EnhancedProjectShowcase />} />
                    <Route path="/showcase/:slug" element={<AppShowcaseDetail />} />
                    <Route path="/project-showcase/:slug" element={<AppShowcaseDetail />} />
                    <Route path="/project-showcase/:slug/interest" element={<ProjectInterest />} />

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

                    {/* ===== AI SECOND BRAIN (COMING SOON) ===== */}
                    <Route path="/brain" element={<ComingSoon />} />
                    <Route path="/brain/*" element={<ComingSoon />} />

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
                      <Route path="ideas" element={<IdeasHub />} />
                      <Route path="projects" element={<MyProjects />} />
                      <Route path="saved" element={<SavedProducts />} />
                      <Route path="consultations" element={<MyConsultations />} />
                    </Route>

                    {/* ===== AUTH CALLBACK ===== */}
                    <Route path="/auth/callback" element={<AuthCallback />} />

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
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
