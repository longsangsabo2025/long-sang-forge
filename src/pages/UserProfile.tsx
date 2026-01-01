import { useAuth } from "@/components/auth/AuthProvider";
import { Layout } from "@/components/LayoutWithChat";
import SubscriptionCard from "@/components/subscription/SubscriptionCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Mail, User } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function UserProfile() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <Layout>
      <div className="min-h-screen relative overflow-hidden py-12">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isVietnamese ? "Hồ sơ cá nhân" : "User Profile"}
              </h1>
              <p className="text-muted-foreground">
                {isVietnamese
                  ? "Quản lý thông tin cá nhân và gói đăng ký của bạn"
                  : "Manage your personal information and subscription plan"}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Left Column: User Info */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {isVietnamese ? "Thông tin tài khoản" : "Account Information"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20 border-2 border-primary/20">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold">{userName}</h3>
                        <div className="flex items-center text-muted-foreground">
                          <Mail className="h-4 w-4 mr-2" />
                          {userEmail}
                        </div>
                        <Badge variant="secondary" className="mt-2">
                          {isVietnamese ? "Thành viên" : "Member"}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-sm font-medium text-muted-foreground">ID</div>
                        <div className="col-span-2 text-sm font-mono bg-muted/50 p-2 rounded">
                          {user?.id}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-sm font-medium text-muted-foreground">Email</div>
                        <div className="col-span-2 text-sm">{userEmail}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-sm font-medium text-muted-foreground">
                          {isVietnamese ? "Ngày tham gia" : "Joined Date"}
                        </div>
                        <div className="col-span-2 text-sm">
                          {new Date(user?.created_at || "").toLocaleDateString(
                            isVietnamese ? "vi-VN" : "en-US"
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Subscription */}
              <div className="space-y-6">
                <div className="sticky top-24">
                  <h3 className="text-lg font-semibold mb-4">
                    {isVietnamese ? "Gói hiện tại" : "Current Plan"}
                  </h3>
                  <SubscriptionCard />

                  <div className="mt-6">
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="pt-6">
                        <h4 className="font-semibold mb-2">
                          {isVietnamese ? "Cần hỗ trợ?" : "Need Help?"}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          {isVietnamese
                            ? "Liên hệ với chúng tôi nếu bạn cần thay đổi gói hoặc hủy đăng ký."
                            : "Contact us if you need to change your plan or cancel subscription."}
                        </p>
                        <Button variant="outline" className="w-full" asChild>
                          <a href="mailto:support@longsang.com">
                            {isVietnamese ? "Liên hệ hỗ trợ" : "Contact Support"}
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
