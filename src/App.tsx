import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
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
const PricingPage = lazy(() => import("./pages/Pricing").then((m) => ({ default: m.PricingPage })));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));

// ============================================
// PUBLIC PAGES - Showcase & Projects
// ============================================
const EnhancedProjectShowcase = lazy(() => import("./pages/EnhancedProjectShowcase"));
const AppShowcaseDetail = lazy(() => import("./pages/AppShowcaseDetail"));
const ProjectInterest = lazy(() => import("./pages/ProjectInterest"));

// Investment Portal
const InvestmentPortalLayout = lazy(() => import("./pages/InvestmentPortalLayout"));
const InvestmentOverview = lazy(() => import("./pages/InvestmentOverview"));
const InvestmentRoadmap = lazy(() => import("./pages/InvestmentRoadmap"));
const InvestmentFinancials = lazy(() => import("./pages/InvestmentFinancials"));
const InvestmentApply = lazy(() => import("./pages/InvestmentApply"));

// ============================================
// PUBLIC PAGES - Academy & Learning
// ============================================
const Academy = lazy(() => import("./pages/Academy"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const LearningPathPage = lazy(() => import("./pages/LearningPathPage"));

// ============================================
// PUBLIC PAGES - Marketplace
// ============================================
const MVPMarketplace = lazy(() =>
  import("./components/agent-center/MVPMarketplace").then((m) => ({ default: m.MVPMarketplace }))
);
const AgentDetailPage = lazy(() =>
  import("./pages/AgentDetailPage").then((m) => ({ default: m.AgentDetailPage }))
);

// ============================================
// AI SECOND BRAIN
// ============================================
const BrainDashboard = lazy(() => import("./pages/BrainDashboard"));
const DomainView = lazy(() => import("./pages/DomainView"));

// ============================================
// USER PAGES - After Login
// ============================================
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

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
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* ===== PORTFOLIO HOME ===== */}
                    <Route path="/" element={<Index />} />

                    {/* ===== MY CV ===== */}
                    <Route path="/cv" element={<CVPage />} />

                    {/* ===== PRICING ===== */}
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />

                    {/* ===== PROJECT SHOWCASE ===== */}
                    <Route path="/project-showcase" element={<EnhancedProjectShowcase />} />
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

                    {/* ===== ACADEMY ===== */}
                    <Route path="/academy" element={<Academy />} />
                    <Route path="/academy/course/:id" element={<CourseDetail />} />
                    <Route path="/academy/learning-path" element={<LearningPathPage />} />

                    {/* ===== MARKETPLACE ===== */}
                    <Route path="/marketplace" element={<MVPMarketplace />} />
                    <Route path="/marketplace/:agentId" element={<AgentDetailPage />} />

                    {/* ===== AI SECOND BRAIN ===== */}
                    <Route path="/brain" element={<BrainDashboard />} />
                    <Route path="/brain/domain/:id" element={<DomainView />} />

                    {/* ===== USER DASHBOARD ===== */}
                    <Route path="/dashboard" element={<UserDashboard />} />

                    {/* ===== AUTH CALLBACK ===== */}
                    <Route path="/auth/callback" element={<AuthCallback />} />

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
