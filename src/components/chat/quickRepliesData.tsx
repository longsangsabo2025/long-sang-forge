/**
 * Quick Replies Data
 * Extracted for Fast Refresh compatibility
 */

import { Clock, CreditCard, HelpCircle, Package, Phone, Sparkles, Truck } from "lucide-react";

export interface QuickReply {
  id: string;
  label: string;
  message: string;
  icon?: React.ReactNode;
  category?: "info" | "service" | "contact" | "product";
}

// Default quick replies
export const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  {
    id: "services",
    label: "Dịch vụ của bạn",
    message: "Tôi muốn biết về các dịch vụ của bạn",
    icon: <Package className="w-3.5 h-3.5" />,
    category: "service",
  },
  {
    id: "pricing",
    label: "Báo giá",
    message: "Tôi muốn nhận báo giá cho dự án",
    icon: <CreditCard className="w-3.5 h-3.5" />,
    category: "info",
  },
  {
    id: "contact",
    label: "Liên hệ tư vấn",
    message: "Tôi muốn được tư vấn trực tiếp",
    icon: <Phone className="w-3.5 h-3.5" />,
    category: "contact",
  },
  {
    id: "hours",
    label: "Giờ làm việc",
    message: "Giờ làm việc của bạn là gì?",
    icon: <Clock className="w-3.5 h-3.5" />,
    category: "info",
  },
];

// Quick replies specifically for product inquiries
export const PRODUCT_QUICK_REPLIES: QuickReply[] = [
  {
    id: "materials",
    label: "Chất liệu",
    message: "Cho tôi biết về các loại chất liệu bạn sử dụng",
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  {
    id: "warranty",
    label: "Bảo hành",
    message: "Chính sách bảo hành như thế nào?",
    icon: <HelpCircle className="w-3.5 h-3.5" />,
  },
  {
    id: "delivery",
    label: "Giao hàng",
    message: "Thời gian và phí giao hàng ra sao?",
    icon: <Truck className="w-3.5 h-3.5" />,
  },
];

// Get quick replies by context
export const getQuickRepliesByContext = (
  context: "default" | "product" | "support"
): QuickReply[] => {
  switch (context) {
    case "product":
      return PRODUCT_QUICK_REPLIES;
    case "support":
      return DEFAULT_QUICK_REPLIES.filter((r) => r.category === "contact" || r.category === "info");
    default:
      return DEFAULT_QUICK_REPLIES;
  }
};
