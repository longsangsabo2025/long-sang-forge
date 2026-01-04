import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Crown,
  DollarSign,
  Edit2,
  Eye,
  Gift,
  RefreshCw,
  Search,
  Settings,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Untyped client for new tables
const db = supabase as any;

interface Subscription {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  plan_id: string;
  status: string;
  payment_status: string;
  payment_amount: number;
  billing_cycle: string;
  starts_at: string;
  expires_at: string;
  created_at: string;
  payment_transaction_id?: string;
}

interface DiscountCode {
  id: string;
  code: string;
  discount_percent: number;
  discount_amount: number;
  valid_from: string;
  valid_until: string;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  applicable_plans: string[];
}

interface PlanFeatures {
  showcase_limit: number;
  investment_access: boolean;
  priority_support: boolean;
  consultation_limit?: number;
  chat_limit?: number;
  brain_domains?: number;
  early_access_days?: number;
  [key: string]: number | boolean | undefined;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: PlanFeatures;
}

// ELON AUDIT: User Override System
interface UserFeatureOverride {
  id: string;
  user_id: string;
  feature_key: string;
  feature_value: number | boolean;
  reason: string | null;
  granted_by: string | null;
  expires_at: string | null;
  created_at: string;
  user_email?: string;
}

export default function AdminSubscriptions() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  // User Overrides state
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [newOverride, setNewOverride] = useState({
    user_email: "",
    feature_key: "showcase_limit",
    feature_value: 5,
    reason: "",
    expires_days: 30,
  });
  const [newDiscount, setNewDiscount] = useState({
    code: "",
    discount_percent: 0,
    valid_days: 30,
    max_uses: 100,
    applicable_plans: ["pro", "vip"],
  });

  // Fetch all subscriptions
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      const { data, error } = await db
        .from("user_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Subscription[];
    },
  });

  // Fetch discount codes
  const { data: discountCodes = [] } = useQuery({
    queryKey: ["discount-codes"],
    queryFn: async () => {
      const { data, error } = await db
        .from("discount_codes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        // Discount codes table may not exist yet
        return [];
      }
      return data as DiscountCode[];
    },
  });

  // Fetch subscription plans for editing features
  const { data: subscriptionPlans = [] } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await db
        .from("subscription_plans")
        .select("*")
        .order("price", { ascending: true });
      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });

  // ELON AUDIT: Fetch user feature overrides
  const { data: userOverrides = [], refetch: refetchOverrides } = useQuery({
    queryKey: ["user-feature-overrides-admin"],
    queryFn: async () => {
      const { data, error } = await db
        .from("user_feature_overrides")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as UserFeatureOverride[];
    },
  });

  // Update plan features
  const handleUpdatePlanFeatures = async () => {
    if (!editingPlan) return;

    try {
      const { error } = await db
        .from("subscription_plans")
        .update({ features: editingPlan.features })
        .eq("id", editingPlan.id);

      if (error) throw error;

      toast.success(`Đã cập nhật features cho gói ${editingPlan.name}`);
      setShowPlanDialog(false);
      setEditingPlan(null);
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
    } catch (error) {
      toast.error("Lỗi khi cập nhật features");
      console.error(error);
    }
  };

  // ELON AUDIT: Create user override
  const handleCreateOverride = async () => {
    try {
      // Find user by email
      const { data: users, error: userError } = await db
        .from("auth.users")
        .select("id")
        .eq("email", newOverride.user_email)
        .single();

      if (userError || !users) {
        // Try via RPC or direct lookup
        const { data: subUser } = await db
          .from("user_subscriptions")
          .select("user_id")
          .eq("user_email", newOverride.user_email)
          .limit(1)
          .single();

        if (!subUser) {
          toast.error(`Không tìm thấy user với email: ${newOverride.user_email}`);
          return;
        }

        const userId = subUser.user_id;
        const expiresAt =
          newOverride.expires_days > 0
            ? new Date(Date.now() + newOverride.expires_days * 24 * 60 * 60 * 1000).toISOString()
            : null;

        const { error } = await db.from("user_feature_overrides").upsert(
          {
            user_id: userId,
            feature_key: newOverride.feature_key,
            feature_value: newOverride.feature_value,
            reason: newOverride.reason || null,
            expires_at: expiresAt,
          },
          { onConflict: "user_id,feature_key" }
        );

        if (error) throw error;

        toast.success(
          `Đã cấp override ${newOverride.feature_key}=${newOverride.feature_value} cho ${newOverride.user_email}`
        );
        setShowOverrideDialog(false);
        setNewOverride({
          user_email: "",
          feature_key: "showcase_limit",
          feature_value: 5,
          reason: "",
          expires_days: 30,
        });
        refetchOverrides();
        return;
      }

      const userId = users.id;
      const expiresAt =
        newOverride.expires_days > 0
          ? new Date(Date.now() + newOverride.expires_days * 24 * 60 * 60 * 1000).toISOString()
          : null;

      const { error } = await db.from("user_feature_overrides").upsert(
        {
          user_id: userId,
          feature_key: newOverride.feature_key,
          feature_value: newOverride.feature_value,
          reason: newOverride.reason || null,
          expires_at: expiresAt,
        },
        { onConflict: "user_id,feature_key" }
      );

      if (error) throw error;

      toast.success(`Đã cấp override cho ${newOverride.user_email}`);
      setShowOverrideDialog(false);
      refetchOverrides();
    } catch (error) {
      console.error("Error creating override:", error);
      toast.error("Lỗi khi tạo override");
    }
  };

  // Delete user override
  const handleDeleteOverride = async (overrideId: string) => {
    try {
      const { error } = await db.from("user_feature_overrides").delete().eq("id", overrideId);

      if (error) throw error;

      toast.success("Đã xóa override");
      refetchOverrides();
    } catch (error) {
      console.error("Error deleting override:", error);
      toast.error("Lỗi khi xóa override");
    }
  };

  // Stats calculations
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === "active").length,
    pending: subscriptions.filter((s) => s.payment_status === "pending").length,
    pro: subscriptions.filter((s) => s.plan_id === "pro" && s.status === "active").length,
    vip: subscriptions.filter((s) => s.plan_id === "vip" && s.status === "active").length,
    revenue: subscriptions
      .filter((s) => s.payment_status === "confirmed")
      .reduce((sum, s) => sum + (s.payment_amount || 0), 0),
    thisMonth: subscriptions.filter((s) => {
      const created = new Date(s.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length,
  };

  // Filter subscriptions
  const filteredSubs = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Manual activate subscription
  const handleActivate = async () => {
    if (!selectedSub) return;

    try {
      const now = new Date();
      const durationDays = selectedSub.billing_cycle === "yearly" ? 365 : 30;
      const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

      const { error } = await db
        .from("user_subscriptions")
        .update({
          status: "active",
          payment_status: "confirmed",
          payment_confirmed_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq("id", selectedSub.id);

      if (error) throw error;

      toast.success(`Đã kích hoạt subscription cho ${selectedSub.user_email}`);
      setShowActivateDialog(false);
      setSelectedSub(null);
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
    } catch (error) {
      toast.error("Lỗi khi kích hoạt subscription");
      console.error(error);
    }
  };

  // Create discount code
  const handleCreateDiscount = async () => {
    if (!newDiscount.code) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + newDiscount.valid_days);

      const { error } = await db.from("discount_codes").insert({
        code: newDiscount.code.toUpperCase(),
        discount_percent: newDiscount.discount_percent,
        discount_amount: 0,
        valid_from: new Date().toISOString(),
        valid_until: validUntil.toISOString(),
        max_uses: newDiscount.max_uses,
        used_count: 0,
        is_active: true,
        applicable_plans: newDiscount.applicable_plans,
      });

      if (error) throw error;

      toast.success(`Đã tạo mã giảm giá: ${newDiscount.code.toUpperCase()}`);
      setShowDiscountDialog(false);
      setNewDiscount({
        code: "",
        discount_percent: 0,
        valid_days: 30,
        max_uses: 100,
        applicable_plans: ["pro", "vip"],
      });
      queryClient.invalidateQueries({ queryKey: ["discount-codes"] });
    } catch (error) {
      toast.error("Lỗi khi tạo mã giảm giá");
      console.error(error);
    }
  };

  // Send renewal reminder
  const sendRenewalReminder = async (sub: Subscription) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          to: sub.user_email,
          template: "subscriptionRenewal",
          data: {
            userName: sub.user_name,
            planId: sub.plan_id,
            expiresAt: new Date(sub.expires_at).toLocaleDateString("vi-VN"),
          },
        }),
      });

      if (response.ok) {
        toast.success(`Đã gửi email nhắc gia hạn cho ${sub.user_email}`);
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      toast.error("Lỗi khi gửi email");
      console.error(error);
    }
  };

  const formatCurrency = (amount: number) => `${amount.toLocaleString("vi-VN")}đ`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString("vi-VN");

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const days = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Subscriptions</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý gói đăng ký của người dùng</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] })}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowDiscountDialog(true)}>
            <Gift className="h-4 w-4 mr-2" />
            Tạo Mã Giảm Giá
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Tổng</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Pro</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.pro}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">VIP</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.vip}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Doanh thu</span>
            </div>
            <p className="text-xl font-bold text-green-600">{formatCurrency(stats.revenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Tháng này</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.thisMonth}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="subscriptions">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="plan-features">
            <Settings className="h-4 w-4 mr-1" />
            Plan Features
          </TabsTrigger>
          <TabsTrigger value="user-overrides">
            <Gift className="h-4 w-4 mr-1" />
            User Overrides
          </TabsTrigger>
          <TabsTrigger value="discounts">Mã Giảm Giá</TabsTrigger>
          <TabsTrigger value="expiring">Sắp Hết Hạn</TabsTrigger>
        </TabsList>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo email hoặc tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Gói</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thanh toán</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Hết hạn</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredSubs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Không có subscription nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubs.map((sub) => {
                      const daysLeft = getDaysRemaining(sub.expires_at);
                      const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;

                      return (
                        <TableRow key={sub.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{sub.user_name || "N/A"}</p>
                              <p className="text-sm text-muted-foreground">{sub.user_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={sub.plan_id === "vip" ? "default" : "secondary"}
                              className={
                                sub.plan_id === "vip"
                                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                  : sub.plan_id === "pro"
                                  ? "bg-blue-500"
                                  : ""
                              }
                            >
                              {sub.plan_id === "vip" && <Crown className="h-3 w-3 mr-1" />}
                              {sub.plan_id === "pro" && <Zap className="h-3 w-3 mr-1" />}
                              {sub.plan_id.toUpperCase()}
                              {sub.billing_cycle === "yearly" && " (Năm)"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                sub.status === "active"
                                  ? "default"
                                  : sub.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className={
                                sub.status === "active"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/40"
                                  : ""
                              }
                            >
                              {sub.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                sub.payment_status === "confirmed"
                                  ? "default"
                                  : sub.payment_status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className={
                                sub.payment_status === "confirmed"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/40"
                                  : ""
                              }
                            >
                              {sub.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(sub.payment_amount || 0)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{formatDate(sub.expires_at)}</span>
                              {isExpiringSoon && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {daysLeft}d
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {sub.payment_status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedSub(sub);
                                    setShowActivateDialog(true);
                                  }}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Activate
                                </Button>
                              )}
                              {isExpiringSoon && sub.status === "active" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => sendRenewalReminder(sub)}
                                >
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Nhắc
                                </Button>
                              )}
                              {/* ELON AUDIT: Quick Grant Access */}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-500/10"
                                onClick={() => {
                                  setNewOverride({
                                    ...newOverride,
                                    user_email: sub.user_email,
                                    feature_key: "showcase_limit",
                                    feature_value: 5,
                                    reason: `Quick grant from admin - ${sub.plan_id} user`,
                                    expires_days: 30,
                                  });
                                  setShowOverrideDialog(true);
                                }}
                                title="Cấp quyền đặc biệt"
                              >
                                <Gift className="h-3 w-3 mr-1" />
                                Grant
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan Features Tab */}
        <TabsContent value="plan-features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quản Lý Features Theo Gói
              </CardTitle>
              <CardDescription>
                Chỉnh sửa giới hạn và tính năng cho từng gói đăng ký. Ví dụ: cho Pro xem thêm
                showcase, thay đổi giới hạn chat AI...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {subscriptionPlans.map((plan) => {
                  const features = plan.features || {};
                  const showcaseLimit = features.showcase_limit;
                  const showcaseText =
                    showcaseLimit === -1
                      ? "Không giới hạn"
                      : showcaseLimit === 0
                      ? "Không có"
                      : `${showcaseLimit} dự án`;

                  return (
                    <Card
                      key={plan.id}
                      className={
                        plan.id === "vip"
                          ? "border-amber-500/50 bg-gradient-to-br from-amber-500/5 to-orange-500/5"
                          : plan.id === "pro"
                          ? "border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"
                          : ""
                      }
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            {plan.id === "vip" && <Crown className="h-5 w-5 text-amber-500" />}
                            {plan.id === "pro" && <Zap className="h-5 w-5 text-blue-500" />}
                            {plan.id === "free" && <Users className="h-5 w-5 text-gray-500" />}
                            {plan.name}
                          </CardTitle>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingPlan(plan);
                              setShowPlanDialog(true);
                            }}
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Sửa
                          </Button>
                        </div>
                        <CardDescription>{formatCurrency(plan.price)}/tháng</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            Xem dự án
                          </span>
                          <Badge variant={showcaseLimit === -1 ? "default" : "secondary"}>
                            {showcaseText}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm">Chat AI</span>
                          <Badge variant="secondary">
                            {features.chat_limit === -1
                              ? "Không giới hạn"
                              : `${features.chat_limit || 5}/tháng`}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm">Đặt tư vấn</span>
                          <Badge variant="secondary">
                            {features.consultation_limit === -1
                              ? "Không giới hạn"
                              : `${features.consultation_limit || 1}/tháng`}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm">Second Brain</span>
                          <Badge variant="secondary">
                            {features.brain_domains
                              ? `${features.brain_domains} domains`
                              : "Không có"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm">Đầu tư dự án</span>
                          {features.investment_access ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm">Hỗ trợ ưu tiên</span>
                          {features.priority_support ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ELON AUDIT: User Overrides Tab */}
        <TabsContent value="user-overrides" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-yellow-500" />
                  User Feature Overrides
                </CardTitle>
                <CardDescription>
                  Cấp quyền đặc biệt cho từng user mà không cần thay đổi gói
                </CardDescription>
              </div>
              <Button onClick={() => setShowOverrideDialog(true)}>
                <Zap className="h-4 w-4 mr-2" />
                Thêm Override
              </Button>
            </CardHeader>
            <CardContent>
              {userOverrides.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có user override nào</p>
                  <p className="text-sm mt-2">
                    Override cho phép cấp thêm quyền cho user cụ thể (ví dụ: thêm showcase_limit)
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Feature</TableHead>
                      <TableHead>Giá trị</TableHead>
                      <TableHead>Lý do</TableHead>
                      <TableHead>Hết hạn</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userOverrides.map((override) => (
                      <TableRow key={override.id}>
                        <TableCell className="font-mono text-xs">
                          {override.user_id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{override.feature_key}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-yellow-500/20 text-yellow-600">
                            {String(override.feature_value)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {override.reason || "-"}
                        </TableCell>
                        <TableCell>
                          {override.expires_at ? (
                            <span className="text-sm">
                              {new Date(override.expires_at).toLocaleDateString("vi-VN")}
                            </span>
                          ) : (
                            <Badge variant="secondary">Vĩnh viễn</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteOverride(override.id)}
                          >
                            Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Quick Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Feature Keys Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="p-2 bg-muted rounded">
                  <code>showcase_limit</code>
                  <p className="text-xs text-muted-foreground">Số project được xem</p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <code>investment_access</code>
                  <p className="text-xs text-muted-foreground">Xem đầu tư (true/false)</p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <code>consultation_discount</code>
                  <p className="text-xs text-muted-foreground">% giảm giá tư vấn</p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <code>brain_domains</code>
                  <p className="text-xs text-muted-foreground">Số domain Brain</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discount Codes Tab */}
        <TabsContent value="discounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mã Giảm Giá</CardTitle>
              <CardDescription>Quản lý các mã khuyến mãi</CardDescription>
            </CardHeader>
            <CardContent>
              {discountCodes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có mã giảm giá nào</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowDiscountDialog(true)}
                  >
                    Tạo mã đầu tiên
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã</TableHead>
                      <TableHead>Giảm giá</TableHead>
                      <TableHead>Áp dụng</TableHead>
                      <TableHead>Đã dùng</TableHead>
                      <TableHead>Hết hạn</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discountCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded font-mono">{code.code}</code>
                        </TableCell>
                        <TableCell>
                          {code.discount_percent > 0
                            ? `${code.discount_percent}%`
                            : formatCurrency(code.discount_amount)}
                        </TableCell>
                        <TableCell>
                          {code.applicable_plans?.map((p: string) => (
                            <Badge key={p} variant="outline" className="mr-1">
                              {p}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell>
                          {code.used_count}/{code.max_uses}
                        </TableCell>
                        <TableCell>{formatDate(code.valid_until)}</TableCell>
                        <TableCell>
                          <Badge variant={code.is_active ? "default" : "secondary"}>
                            {code.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expiring Soon Tab */}
        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sắp Hết Hạn (7 ngày)</CardTitle>
              <CardDescription>Subscriptions cần nhắc gia hạn</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const expiringSubs = subscriptions.filter((s) => {
                  const daysLeft = getDaysRemaining(s.expires_at);
                  return s.status === "active" && daysLeft > 0 && daysLeft <= 7;
                });

                if (expiringSubs.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>Không có subscription nào sắp hết hạn</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {expiringSubs.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{sub.user_name}</p>
                          <p className="text-sm text-muted-foreground">{sub.user_email}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="destructive">
                            {getDaysRemaining(sub.expires_at)} ngày còn lại
                          </Badge>
                          <Button size="sm" onClick={() => sendRenewalReminder(sub)}>
                            Gửi nhắc nhở
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Activate Dialog */}
      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kích hoạt Subscription</DialogTitle>
            <DialogDescription>Xác nhận kích hoạt thủ công cho subscription này?</DialogDescription>
          </DialogHeader>
          {selectedSub && (
            <div className="space-y-2 py-4">
              <p>
                <strong>User:</strong> {selectedSub.user_name} ({selectedSub.user_email})
              </p>
              <p>
                <strong>Gói:</strong> {selectedSub.plan_id.toUpperCase()}
                {selectedSub.billing_cycle === "yearly" ? " (Năm)" : " (Tháng)"}
              </p>
              <p>
                <strong>Số tiền:</strong> {formatCurrency(selectedSub.payment_amount || 0)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivateDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleActivate}>Kích hoạt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Discount Dialog */}
      <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo Mã Giảm Giá</DialogTitle>
            <DialogDescription>Tạo mã khuyến mãi mới cho subscribers</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mã giảm giá</Label>
              <Input
                placeholder="VD: NEWYEAR2025"
                value={newDiscount.code}
                onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phần trăm giảm (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={newDiscount.discount_percent}
                onChange={(e) =>
                  setNewDiscount({
                    ...newDiscount,
                    discount_percent: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Số ngày hiệu lực</Label>
              <Input
                type="number"
                min={1}
                value={newDiscount.valid_days}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, valid_days: parseInt(e.target.value) || 30 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Số lần sử dụng tối đa</Label>
              <Input
                type="number"
                min={1}
                value={newDiscount.max_uses}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, max_uses: parseInt(e.target.value) || 100 })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiscountDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateDiscount}>Tạo mã</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Features Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingPlan?.id === "vip" && <Crown className="h-5 w-5 text-amber-500" />}
              {editingPlan?.id === "pro" && <Zap className="h-5 w-5 text-blue-500" />}
              Chỉnh sửa Features - {editingPlan?.name}
            </DialogTitle>
            <DialogDescription>
              Thay đổi giới hạn và tính năng cho gói {editingPlan?.name}
            </DialogDescription>
          </DialogHeader>
          {editingPlan && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Số dự án được xem (showcase_limit)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={-1}
                    value={editingPlan.features.showcase_limit ?? 0}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        features: {
                          ...editingPlan.features,
                          showcase_limit: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">
                    (-1 = không giới hạn, 0 = không có)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Chat AI / tháng (chat_limit)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={-1}
                    value={editingPlan.features.chat_limit ?? 5}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        features: {
                          ...editingPlan.features,
                          chat_limit: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">(-1 = không giới hạn)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Đặt tư vấn / tháng (consultation_limit)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={-1}
                    value={editingPlan.features.consultation_limit ?? 1}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        features: {
                          ...editingPlan.features,
                          consultation_limit: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">(-1 = không giới hạn)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Second Brain domains (brain_domains)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={editingPlan.features.brain_domains ?? 0}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        features: {
                          ...editingPlan.features,
                          brain_domains: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">(0 = không có)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Truy cập sớm (ngày)</Label>
                <Input
                  type="number"
                  min={0}
                  value={editingPlan.features.early_access_days ?? 0}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      features: {
                        ...editingPlan.features,
                        early_access_days: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-24"
                />
              </div>

              <div className="flex items-center justify-between py-2 border rounded-lg px-3">
                <Label>Đầu tư dự án (investment_access)</Label>
                <input
                  type="checkbox"
                  checked={!!editingPlan.features.investment_access}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      features: { ...editingPlan.features, investment_access: e.target.checked },
                    })
                  }
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between py-2 border rounded-lg px-3">
                <Label>Hỗ trợ ưu tiên (priority_support)</Label>
                <input
                  type="checkbox"
                  checked={!!editingPlan.features.priority_support}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      features: { ...editingPlan.features, priority_support: e.target.checked },
                    })
                  }
                  className="h-4 w-4"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPlanDialog(false);
                setEditingPlan(null);
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdatePlanFeatures}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ELON AUDIT: Create User Override Dialog */}
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-yellow-500" />
              Thêm User Override
            </DialogTitle>
            <DialogDescription>
              Cấp quyền đặc biệt cho user mà không cần thay đổi subscription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email User</Label>
              <Input
                placeholder="user@example.com"
                value={newOverride.user_email}
                onChange={(e) => setNewOverride({ ...newOverride, user_email: e.target.value })}
              />
            </div>
            <div>
              <Label>Feature Key</Label>
              <Select
                value={newOverride.feature_key}
                onValueChange={(v) => setNewOverride({ ...newOverride, feature_key: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="showcase_limit">showcase_limit (số project)</SelectItem>
                  <SelectItem value="investment_access">investment_access (true/false)</SelectItem>
                  <SelectItem value="consultation_discount">consultation_discount (%)</SelectItem>
                  <SelectItem value="brain_domains">brain_domains (số domain)</SelectItem>
                  <SelectItem value="priority_support">priority_support (true/false)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Giá trị</Label>
              <Input
                type="number"
                value={newOverride.feature_value}
                onChange={(e) =>
                  setNewOverride({
                    ...newOverride,
                    feature_value: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Số cho limits, 1=true/0=false cho boolean
              </p>
            </div>
            <div>
              <Label>Lý do (optional)</Label>
              <Input
                placeholder="VD: Marketing campaign, VIP customer..."
                value={newOverride.reason}
                onChange={(e) => setNewOverride({ ...newOverride, reason: e.target.value })}
              />
            </div>
            <div>
              <Label>Hết hạn sau (ngày)</Label>
              <Input
                type="number"
                value={newOverride.expires_days}
                onChange={(e) =>
                  setNewOverride({
                    ...newOverride,
                    expires_days: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">0 = vĩnh viễn (không hết hạn)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOverrideDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateOverride}>
              <Zap className="h-4 w-4 mr-1" />
              Tạo Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
