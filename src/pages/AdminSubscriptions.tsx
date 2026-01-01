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
  Gift,
  RefreshCw,
  Search,
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

export default function AdminSubscriptions() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
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
                              className={sub.status === "active" ? "bg-green-500" : ""}
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
                              className={sub.payment_status === "confirmed" ? "bg-green-500" : ""}
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
    </div>
  );
}
