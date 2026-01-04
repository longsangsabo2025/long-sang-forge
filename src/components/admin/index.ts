/**
 * Admin Edit Components
 * =====================
 * Reusable admin editing tools for any page
 *
 * Usage:
 * ```tsx
 * import {
 *   AdminEditProvider,
 *   EditableImage,
 *   EditableText,
 *   EditableLink,
 *   useAdminEdit
 * } from "@/components/admin";
 *
 * // Wrap your page
 * <AdminEditProvider pageId="my-page">
 *   <EditableImage imageKey="hero" defaultSrc="/hero.jpg" alt="Hero" />
 *   <EditableText textKey="title" defaultText="Welcome" as="h1" />
 * </AdminEditProvider>
 * ```
 */
export {
  AdminEditProvider,
  EditableImage,
  EditableLink,
  EditableText,
  useAdminEdit,
} from "./AdminEditProvider";
