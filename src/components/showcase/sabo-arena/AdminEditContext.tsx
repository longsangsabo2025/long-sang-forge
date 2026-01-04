/**
 * SABO Arena Admin Edit Context
 * =============================
 * Re-exports the global AdminEditProvider with SABO Arena specific configuration
 *
 * This file exists for backward compatibility.
 * New code should use the global AdminEditProvider from @/components/admin
 */
import {
  AdminEditProvider,
  EditableLink,
  EditableText,
  EditableImage as GlobalEditableImage,
  useAdminEdit,
} from "@/components/admin";
import type { ReactNode } from "react";

// ============================================================================
// SABO Arena Specific Provider (wrapper around global provider)
// ============================================================================
export const SaboArenaAdminProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AdminEditProvider
      pageId="sabo-arena"
      storageBucket="showcase-assets"
      adminEmails={["longsangadmin@gmail.com", "longsangsabo@gmail.com"]}
    >
      {children}
    </AdminEditProvider>
  );
};

// ============================================================================
// Re-exports for backward compatibility
// ============================================================================
export const useSaboArenaAdmin = useAdminEdit;
export const EditableImage = GlobalEditableImage;
export { EditableLink, EditableText };

// Legacy compatibility functions
export const useAdminEditContext = useAdminEdit;

// Export content helpers
export const updateContent = (key: string, value: string) => {
  // This is now handled by the context directly
  console.warn("updateContent is deprecated, use setText or setImage from useAdminEdit hook");
};

export const getContent = (key: string) => {
  console.warn("getContent is deprecated, use getText or getImage from useAdminEdit hook");
  return "";
};

export default SaboArenaAdminProvider;
