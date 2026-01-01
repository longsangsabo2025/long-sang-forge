import GoogleDriveTest from "@/components/GoogleDriveTest";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  TrendingUp,
  Workflow,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Tổng Quy Trình",
      value: "15",
      change: "+3 tuần này",
      icon: Workflow,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "AI Agents",
      value: "4",
      change: "Tất cả hoạt động",
      icon: Bot,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Thực Thi Hôm Nay",
      value: "127",
      change: "+23% so với hôm qua",
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Tỷ Lệ Thành Công",
      value: "98.5%",
      change: "Xuất sắc",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const quickActions = [
    {
      title: "🛒 AI Marketplace",
      description: "Mua và sử dụng AI agents có sẵn",
      icon: Bot,
      color: "bg-indigo-600",
      action: () => navigate("/marketplace"),
    },
    {
      title: "Kiểm Tra Quy Trình AI",
      description: "Chạy và kiểm tra các quy trình tự động",
      icon: Workflow,
      color: "bg-blue-600",
      action: () => navigate("/admin/workflows"),
    },
    {
      title: "Quản Lý AI Agents",
      description: "Điều khiển và giám sát các AI agents",
      icon: Bot,
      color: "bg-purple-600",
      action: () => navigate("/marketplace"),
    },
    {
      title: "Xem Phân Tích",
      description: "Kiểm tra hiệu suất và số liệu",
      icon: TrendingUp,
      color: "bg-green-600",
      action: () => navigate("/admin/analytics"),
    },
  ];

  const recentActivity = [
    {
      type: "success",
      workflow: "Nhà Máy Nội Dung AI",
      message: "Tạo bài viết blog thành công",
      time: "2 phút trước",
    },
    {
      type: "success",
      workflow: "Quản Lý Khách Hàng Tiềm Năng",
      message: "Khách hàng mới được xử lý và chấm điểm",
      time: "15 phút trước",
    },
    {
      type: "running",
      workflow: "Email Marketing",
      message: "Chiến dịch đang thực hiện",
      time: "23 phút trước",
    },
    {
      type: "success",
      workflow: "Quản Lý Mạng Xã Hội",
      message: "Bài viết đã lên lịch cho LinkedIn",
      time: "1 giờ trước",
    },
    {
      type: "error",
      workflow: "Hỗ Trợ Khách Hàng",
      message: "Vượt giới hạn API",
      time: "2 giờ trước",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "running":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Bảng Điều Khiển Admin</h1>
        <p className="text-muted-foreground mt-1">
          Chào mừng trở lại! Đây là những gì đang diễn ra với hệ thống tự động hóa AI của bạn.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.title}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={action.action}
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription className="text-xs">{action.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt Động Gần Đây</CardTitle>
            <CardDescription>Các quy trình và sự kiện thực thi mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                >
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.workflow}</p>
                    <p className="text-xs text-muted-foreground">{activity.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate("/admin/workflows")}
            >
              Xem Tất Cả Hoạt Động <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng Thái Hệ Thống</CardTitle>
            <CardDescription>Trạng thái hiện tại của tất cả các dịch vụ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">N8N Workflow Engine</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Hoạt động
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Supabase Database</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Hoạt động
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">OpenAI API</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Đã Kết Nối
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Vite Dev Server</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Đang Chạy
                </Badge>
              </div>
            </div>
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                🟢 Tất Cả Hệ Thống Hoạt Động Bình Thường
              </p>
              <p className="text-xs text-green-600 mt-1">
                Không phát hiện sự cố. Mọi thứ đang chạy trơn tru.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Google Drive Integration Test */}
        <div className="mt-6">
          <GoogleDriveTest />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
