import { useAuth } from "@/components/auth/AuthProvider";
import { Layout } from "@/components/LayoutWithChat";
import SubscriptionCard from "@/components/subscription/SubscriptionCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { getSubscriptionHistory, type UserSubscription } from "@/lib/api/subscriptions";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  FileText,
  Key,
  Lightbulb,
  LogOut,
  Mail,
  MessageSquare,
  Receipt,
  Rocket,
  Settings,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function UserProfile() {
  const { user, signOut } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const isVietnamese = i18n.language === "vi";

  // Billing history state
  const [billingHistory, setBillingHistory] = useState<UserSubscription[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url;
  const joinedDate = new Date(user?.created_at || "");
  const daysSinceJoined = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));

  // Fetch billing history
  useEffect(() => {
    async function fetchHistory() {
      setLoadingHistory(true);
      try {
        const history = await getSubscriptionHistory();
        setBillingHistory(history);
      } catch (err) {
        console.error("Error fetching billing history:", err);
      } finally {
        setLoadingHistory(false);
      }
    }
    if (user) fetchHistory();
  }, [user]);

  // Handle password reset
  const handleResetPassword = async () => {
    if (!userEmail) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success(
        isVietnamese ? "Email đặt lại mật khẩu đã được gửi!" : "Password reset email sent!"
      );
    } catch (err) {
      toast.error(isVietnamese ? "Có lỗi xảy ra" : "Something went wrong");
    }
  };

  // Handle sign out all devices
  const handleSignOutAll = async () => {
    try {
      await supabase.auth.signOut({ scope: "global" });
      toast.success(isVietnamese ? "Đã đăng xuất tất cả thiết bị" : "Signed out from all devices");
      navigate("/");
    } catch (err) {
      toast.error(isVietnamese ? "Có lỗi xảy ra" : "Something went wrong");
    }
  };

  // Quick stats
  const quickStats = [
    {
      icon: Calendar,
      label: isVietnamese ? "Ngày tham gia" : "Member since",
      value: joinedDate.toLocaleDateString(isVietnamese ? "vi-VN" : "en-US", {
        month: "short",
        year: "numeric",
      }),
      color: "text-blue-500",
    },
    {
      icon: Clock,
      label: isVietnamese ? "Thời gian" : "Days active",
      value: `${daysSinceJoined} ${isVietnamese ? "ngày" : "days"}`,
      color: "text-green-500",
    },
    {
      icon: Crown,
      label: isVietnamese ? "Gói hiện tại" : "Current plan",
      value: subscription?.plan?.name || (isVietnamese ? "Miễn phí" : "Free"),
      color: "text-amber-500",
    },
  ];

  // Quick actions
  const quickActions = [
    {
      icon: Lightbulb,
      title: "Workspace",
      description: isVietnamese ? "Ý tưởng & dự án" : "Ideas & projects",
      href: "/workspace",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Calendar,
      title: isVietnamese ? "Lịch hẹn" : "Appointments",
      description: isVietnamese ? "Quản lý lịch tư vấn" : "Manage consultations",
      href: "/workspace/consultations",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: Rocket,
      title: isVietnamese ? "Dự án đã lưu" : "Saved Projects",
      description: isVietnamese ? "Dự án quan tâm" : "Interested projects",
      href: "/workspace/saved",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  // Account features based on subscription
  const accountFeatures = [
    {
      icon: MessageSquare,
      title: isVietnamese ? "Chat AI" : "AI Chat",
      description: isVietnamese ? "Hỏi đáp thông minh" : "Smart Q&A",
      available: true,
    },
    {
      icon: FileText,
      title: isVietnamese ? "Lưu ý tưởng" : "Save Ideas",
      description: isVietnamese ? "Ghi chú & quản lý" : "Notes & management",
      available: true,
    },
    {
      icon: Sparkles,
      title: isVietnamese ? "AI Đề xuất" : "AI Suggestions",
      description: isVietnamese ? "Gợi ý thông minh" : "Smart recommendations",
      available: subscription?.plan?.name !== "Free",
    },
    {
      icon: TrendingUp,
      title: isVietnamese ? "Phân tích" : "Analytics",
      description: isVietnamese ? "Báo cáo chi tiết" : "Detailed reports",
      available: subscription?.plan?.name === "Enterprise",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen relative overflow-hidden py-8 md:py-12">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Profile Header - Hero Style */}
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-violet-500/5" />
              <CardContent className="relative p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Avatar */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative"
                  >
                    <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary/20 shadow-2xl shadow-primary/20">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="text-3xl md:text-4xl bg-gradient-to-br from-primary to-violet-500 text-white">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    {subscription?.plan && (
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </motion.div>

                  {/* User Info */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold">{userName}</h1>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        <Shield className="w-3 h-3 mr-1" />
                        {isVietnamese ? "Đã xác thực" : "Verified"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-center md:justify-start text-muted-foreground mb-4">
                      <Mail className="h-4 w-4 mr-2" />
                      {userEmail}
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      {quickStats.map((stat) => (
                        <div
                          key={stat.label}
                          className="flex items-center gap-2 bg-background/50 rounded-lg px-3 py-2"
                        >
                          <stat.icon className={`w-4 h-4 ${stat.color}`} />
                          <div className="text-sm">
                            <span className="font-semibold">{stat.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => navigate("/workspace")}
                    >
                      <Zap className="w-4 h-4" />
                      {isVietnamese ? "Đến Workspace" : "Go to Workspace"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid bg-background/50 backdrop-blur-sm">
                <TabsTrigger value="overview" className="gap-2">
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isVietnamese ? "Tổng quan" : "Overview"}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="subscription" className="gap-2">
                  <Crown className="w-4 h-4" />
                  <span className="hidden sm:inline">{isVietnamese ? "Gói" : "Plan"}</span>
                </TabsTrigger>
                <TabsTrigger value="billing" className="gap-2">
                  <Receipt className="w-4 h-4" />
                  <span className="hidden sm:inline">{isVietnamese ? "Hóa đơn" : "Billing"}</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">{isVietnamese ? "Bảo mật" : "Security"}</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">{isVietnamese ? "Tài khoản" : "Account"}</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    {isVietnamese ? "Truy cập nhanh" : "Quick Access"}
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                      <motion.button
                        key={action.href}
                        onClick={() => navigate(action.href)}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative overflow-hidden rounded-xl p-5 text-left bg-card/50 backdrop-blur-sm border border-border/20 hover:border-primary/30 transition-all"
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}
                        />
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3`}
                        >
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-semibold mb-1">{action.title}</h4>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Features Status */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      {isVietnamese ? "Tính năng của bạn" : "Your Features"}
                    </CardTitle>
                    <CardDescription>
                      {isVietnamese
                        ? "Tính năng khả dụng dựa trên gói của bạn"
                        : "Available features based on your plan"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {accountFeatures.map((feature) => (
                        <div
                          key={feature.title}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            feature.available
                              ? "bg-green-500/5 border-green-500/20"
                              : "bg-muted/50 border-border/50 opacity-60"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              feature.available ? "bg-green-500/10" : "bg-muted"
                            }`}
                          >
                            <feature.icon
                              className={`w-5 h-5 ${
                                feature.available ? "text-green-500" : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{feature.title}</span>
                              {feature.available ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  {isVietnamese ? "Nâng cấp" : "Upgrade"}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Subscription Tab */}
              <TabsContent value="subscription" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      {isVietnamese ? "Gói hiện tại" : "Current Plan"}
                    </h3>
                    <SubscriptionCard />
                  </div>

                  <Card className="bg-card/30 backdrop-blur-sm border-primary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500" />
                        {isVietnamese ? "Nâng cấp gói" : "Upgrade Plan"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        {isVietnamese
                          ? "Mở khóa thêm tính năng AI và ưu tiên hỗ trợ."
                          : "Unlock more AI features and priority support."}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          {isVietnamese ? "AI đề xuất thông minh" : "Smart AI suggestions"}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          {isVietnamese ? "Ưu tiên tư vấn 1:1" : "Priority 1:1 consultation"}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          {isVietnamese ? "Hỗ trợ 24/7" : "24/7 Support"}
                        </div>
                      </div>
                      <Button className="w-full gap-2" onClick={() => navigate("/subscription")}>
                        <Crown className="w-4 h-4" />
                        {isVietnamese ? "Xem các gói" : "View Plans"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Billing Tab - NEW */}
              <TabsContent value="billing" className="space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-primary" />
                      {isVietnamese ? "Lịch sử thanh toán" : "Billing History"}
                    </CardTitle>
                    <CardDescription>
                      {isVietnamese
                        ? "Xem tất cả giao dịch và hóa đơn của bạn"
                        : "View all your transactions and invoices"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingHistory ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : billingHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>{isVietnamese ? "Chưa có giao dịch nào" : "No transactions yet"}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {billingHistory.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/20"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  item.payment_status === "confirmed"
                                    ? "bg-green-500/10"
                                    : item.payment_status === "pending"
                                    ? "bg-yellow-500/10"
                                    : "bg-red-500/10"
                                }`}
                              >
                                {item.payment_status === "confirmed" ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : item.payment_status === "pending" ? (
                                  <Clock className="w-5 h-5 text-yellow-500" />
                                ) : (
                                  <AlertTriangle className="w-5 h-5 text-red-500" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {item.plan?.name || item.plan_id}
                                  {item.billing_cycle === "yearly" && (
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      {isVietnamese ? "Năm" : "Yearly"}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(item.created_at).toLocaleDateString(
                                    isVietnamese ? "vi-VN" : "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                {item.payment_amount?.toLocaleString(
                                  isVietnamese ? "vi-VN" : "en-US"
                                )}{" "}
                                ₫
                              </div>
                              <Badge
                                variant={
                                  item.payment_status === "confirmed" ? "default" : "outline"
                                }
                                className={`text-xs ${
                                  item.payment_status === "confirmed"
                                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                                    : ""
                                }`}
                              >
                                {item.payment_status === "confirmed"
                                  ? isVietnamese
                                    ? "Đã thanh toán"
                                    : "Paid"
                                  : item.payment_status === "pending"
                                  ? isVietnamese
                                    ? "Đang chờ"
                                    : "Pending"
                                  : item.payment_status === "free"
                                  ? isVietnamese
                                    ? "Miễn phí"
                                    : "Free"
                                  : isVietnamese
                                  ? "Thất bại"
                                  : "Failed"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab - NEW */}
              <TabsContent value="security" className="space-y-6">
                {/* Password & Authentication */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-primary" />
                      {isVietnamese ? "Mật khẩu & Xác thực" : "Password & Authentication"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/20">
                      <div className="flex items-center gap-3">
                        <Key className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {isVietnamese ? "Đổi mật khẩu" : "Change Password"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {isVietnamese
                              ? "Gửi email đặt lại mật khẩu"
                              : "Send password reset email"}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleResetPassword}>
                        {isVietnamese ? "Gửi email" : "Send Email"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Sessions */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-primary" />
                      {isVietnamese ? "Phiên đăng nhập" : "Active Sessions"}
                    </CardTitle>
                    <CardDescription>
                      {isVietnamese
                        ? "Quản lý các thiết bị đang đăng nhập"
                        : "Manage your logged in devices"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {isVietnamese ? "Thiết bị hiện tại" : "Current Device"}
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              {isVietnamese ? "Đang hoạt động" : "Active"}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {navigator.userAgent.includes("Windows")
                              ? "Windows"
                              : navigator.userAgent.includes("Mac")
                              ? "macOS"
                              : navigator.userAgent.includes("Linux")
                              ? "Linux"
                              : "Unknown"}
                            {" • "}
                            {isVietnamese ? "Bây giờ" : "Now"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={handleSignOutAll}
                    >
                      <LogOut className="w-4 h-4" />
                      {isVietnamese ? "Đăng xuất tất cả thiết bị" : "Sign out all devices"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="bg-red-500/5 border-red-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="w-5 h-5" />
                      {isVietnamese ? "Vùng nguy hiểm" : "Danger Zone"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {isVietnamese ? "Xóa tài khoản" : "Delete Account"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isVietnamese
                            ? "Xóa vĩnh viễn tài khoản và tất cả dữ liệu"
                            : "Permanently delete your account and all data"}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                        onClick={() => {
                          toast.info(
                            isVietnamese
                              ? "Vui lòng liên hệ support@longsang.org để xóa tài khoản"
                              : "Please contact support@longsang.org to delete your account"
                          );
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isVietnamese ? "Xóa" : "Delete"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Account Tab */}
              <TabsContent value="account" className="space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {isVietnamese ? "Thông tin tài khoản" : "Account Information"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div className="text-sm font-medium text-muted-foreground">ID</div>
                        <div className="col-span-2 text-sm font-mono bg-background/50 p-2 rounded truncate">
                          {user?.id}
                        </div>
                      </div>
                      <Separator className="bg-border/30" />
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div className="text-sm font-medium text-muted-foreground">Email</div>
                        <div className="col-span-2 text-sm">{userEmail}</div>
                      </div>
                      <Separator className="bg-border/30" />
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div className="text-sm font-medium text-muted-foreground">
                          {isVietnamese ? "Tên" : "Name"}
                        </div>
                        <div className="col-span-2 text-sm">{userName}</div>
                      </div>
                      <Separator className="bg-border/30" />
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div className="text-sm font-medium text-muted-foreground">
                          {isVietnamese ? "Ngày tham gia" : "Joined Date"}
                        </div>
                        <div className="col-span-2 text-sm">
                          {joinedDate.toLocaleDateString(isVietnamese ? "vi-VN" : "en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notification Preferences */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-primary" />
                      {isVietnamese ? "Tùy chọn thông báo" : "Notification Preferences"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/20">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {isVietnamese ? "Email cập nhật" : "Email Updates"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {isVietnamese ? "Nhận tin tức và ưu đãi" : "Receive news and offers"}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">{isVietnamese ? "Đang bật" : "Enabled"}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/20">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {isVietnamese ? "Nhắc nhở lịch hẹn" : "Appointment Reminders"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {isVietnamese ? "Nhận nhắc nhở qua email" : "Get email reminders"}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">{isVietnamese ? "Đang bật" : "Enabled"}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Help Card */}
                <Card className="bg-card/30 backdrop-blur-sm border-primary/10">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      {isVietnamese ? "Cần hỗ trợ?" : "Need Help?"}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isVietnamese
                        ? "Liên hệ với chúng tôi nếu bạn cần thay đổi gói hoặc hỗ trợ kỹ thuật."
                        : "Contact us if you need to change your plan or technical support."}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" asChild>
                        <a href="mailto:support@longsang.org">
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate("/#contact")}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
