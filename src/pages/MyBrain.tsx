/**
 * My Brain Page
 * =============
 * User's personal Second Brain dashboard
 *
 * ELON AUDIT: Gate behind Pro subscription
 * Free users cannot access Second Brain
 */

import { UserSecondBrain } from "@/brain/components/user/UserSecondBrain";
import PremiumGate from "@/components/subscription/PremiumGate";

export default function MyBrain() {
  return (
    <PremiumGate
      minPlan="pro"
      featureName="Second Brain"
      featureDescription="Tính năng Second Brain chỉ dành cho thành viên Pro và VIP. Nâng cấp để tạo hệ thống quản lý tri thức cá nhân với AI."
      showBlurredPreview={false}
    >
      <UserSecondBrain />
    </PremiumGate>
  );
}
