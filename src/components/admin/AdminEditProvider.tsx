/**
 * Global Admin Edit Provider
 * ===========================
 * A reusable admin edit tool that can be applied to ANY page on the website.
 *
 * Usage:
 * 1. Wrap your page with <AdminEditProvider pageId="your-page-id">
 * 2. Use <EditableImage> for editable images
 * 3. Use <EditableText> for editable text
 * 4. Use useAdminEdit() hook for custom editable components
 *
 * Example:
 * ```tsx
 * <AdminEditProvider pageId="landing-page">
 *   <EditableImage imageKey="hero" defaultSrc="/hero.jpg" alt="Hero" />
 *   <EditableText textKey="title" defaultText="Welcome" as="h1" />
 * </AdminEditProvider>
 * ```
 */
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Check, Loader2, Pencil, RotateCcw, Save, Settings, Type } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

// Helper type for page_content table (not in generated types yet)
interface PageContentRow {
  page_id: string;
  content: EditableContent;
  updated_at: string;
  updated_by: string | null;
}

// Helper to bypass TypeScript for new table (not in generated types yet)
const supabaseAny = supabase as unknown as {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (
        column: string,
        value: string
      ) => {
        single: () => Promise<{ data: PageContentRow | null; error: Error | null }>;
      };
    };
    upsert: (
      data: Partial<PageContentRow>,
      options: { onConflict: string }
    ) => Promise<{ error: Error | null }>;
    delete: () => {
      eq: (column: string, value: string) => Promise<{ error: Error | null }>;
    };
  };
};
interface EditableContent {
  images: Record<string, string>;
  texts: Record<string, string>;
  styles: Record<string, Record<string, string>>; // key -> { color, fontSize, etc. }
}

interface AdminEditContextType {
  pageId: string;
  isEditMode: boolean;
  isAdmin: boolean;
  isSaving: boolean;
  toggleEditMode: () => void;
  getImage: (key: string, defaultUrl: string) => string;
  setImage: (key: string, url: string) => void;
  getText: (key: string, defaultText: string) => string;
  setText: (key: string, text: string) => void;
  getStyle: (key: string, styleName: string, defaultValue: string) => string;
  setStyle: (key: string, styleName: string, value: string) => void;
  uploadImage: (key: string, file: File) => Promise<string | null>;
  resetAll: () => void;
  saveAll: () => Promise<void>;
  hasChanges: boolean;
}

interface AdminEditProviderProps {
  children: ReactNode;
  pageId: string;
  storageBucket?: string;
  adminEmails?: string[];
}

const AdminEditContext = createContext<AdminEditContextType | null>(null);

// ============================================================================
// Constants
// ============================================================================
const DEFAULT_ADMIN_EMAILS = ["longsangadmin@gmail.com", "longsangsabo@gmail.com"];
const DEFAULT_BUCKET = "showcase-assets";

// ============================================================================
// Helper Functions
// ============================================================================
const getStorageKey = (pageId: string) => `admin_edit_${pageId}`;

const getDefaultContent = (): EditableContent => ({
  images: {},
  texts: {},
  styles: {},
});

// ============================================================================
// Provider Component
// ============================================================================
export const AdminEditProvider = ({
  children,
  pageId,
  storageBucket = DEFAULT_BUCKET,
  adminEmails = DEFAULT_ADMIN_EMAILS,
}: AdminEditProviderProps) => {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<EditableContent>(getDefaultContent());
  const [originalContent, setOriginalContent] = useState<EditableContent>(getDefaultContent());
  const uploadingRef = useRef<Set<string>>(new Set());
  const storageKey = getStorageKey(pageId);

  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === "admin" || adminEmails.includes(user?.email || "");

  // Debug: Log admin check
  console.log("[AdminEditProvider] Admin check:", {
    pageId,
    userEmail: user?.email,
    userRole: user?.user_metadata?.role,
    adminEmails,
    isAdmin,
    user: user ? "logged in" : "not logged in",
  });

  // Check if there are unsaved changes
  const hasChanges = JSON.stringify(content) !== JSON.stringify(originalContent);

  // Load saved content from DATABASE first, then fallback to localStorage
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        // Try to load from database first
        const { data, error } = await supabaseAny
          .from("page_content")
          .select("content")
          .eq("page_id", pageId)
          .single();

        if (data && !error) {
          const dbContent = data.content as EditableContent;
          const loadedContent = {
            images: dbContent?.images || {},
            texts: dbContent?.texts || {},
            styles: dbContent?.styles || {},
          };
          setContent(loadedContent);
          setOriginalContent(loadedContent);
          // Also update localStorage as cache
          localStorage.setItem(storageKey, JSON.stringify(loadedContent));
          console.log("[AdminEditProvider] Loaded content from DATABASE:", pageId);
        } else {
          // Fallback to localStorage
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            const loadedContent = {
              images: parsed.images || {},
              texts: parsed.texts || {},
              styles: parsed.styles || {},
            };
            setContent(loadedContent);
            setOriginalContent(loadedContent);
            console.log("[AdminEditProvider] Loaded content from localStorage:", pageId);
          }
        }
      } catch (err) {
        console.error("[AdminEditProvider] Error loading content:", err);
        // Fallback to localStorage
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setContent(parsed);
            setOriginalContent(parsed);
          } catch {
            // Use defaults
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [pageId, storageKey]);

  // Save to both localStorage AND database
  const saveToStorage = useCallback(
    async (newContent: EditableContent) => {
      // Save to localStorage immediately (cache)
      localStorage.setItem(storageKey, JSON.stringify(newContent));

      // Save to database
      try {
        const { error } = await supabaseAny.from("page_content").upsert(
          {
            page_id: pageId,
            content: newContent,
            updated_at: new Date().toISOString(),
            updated_by: user?.id || null,
          },
          { onConflict: "page_id" }
        );

        if (error) {
          console.error("[AdminEditProvider] Error saving to database:", error);
          toast.error("Lỗi lưu vào database, chỉ lưu local");
        } else {
          console.log("[AdminEditProvider] Saved to DATABASE:", pageId);
        }
      } catch (err) {
        console.error("[AdminEditProvider] Error saving:", err);
      }
    },
    [storageKey, pageId, user?.id]
  );

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  // Get image URL
  const getImage = useCallback(
    (key: string, defaultUrl: string) => {
      return content.images[key] || defaultUrl;
    },
    [content.images]
  );

  // Set image URL
  const setImage = useCallback((key: string, url: string) => {
    setContent((prev) => ({
      ...prev,
      images: { ...prev.images, [key]: url },
    }));
  }, []);

  // Get text
  const getText = useCallback(
    (key: string, defaultText: string) => {
      return content.texts[key] ?? defaultText;
    },
    [content.texts]
  );

  // Set text
  const setText = useCallback((key: string, text: string) => {
    setContent((prev) => ({
      ...prev,
      texts: { ...prev.texts, [key]: text },
    }));
  }, []);

  // Get style
  const getStyle = useCallback(
    (key: string, styleName: string, defaultValue: string) => {
      return content.styles[key]?.[styleName] ?? defaultValue;
    },
    [content.styles]
  );

  // Set style
  const setStyle = useCallback((key: string, styleName: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      styles: {
        ...prev.styles,
        [key]: { ...prev.styles[key], [styleName]: value },
      },
    }));
  }, []);

  // Upload image to Supabase
  const uploadImage = useCallback(
    async (key: string, file: File): Promise<string | null> => {
      if (uploadingRef.current.has(key)) return null;

      // Validate
      if (!file.type.startsWith("image/")) {
        toast.error("Chỉ chấp nhận file ảnh");
        return null;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File quá lớn (max 10MB)");
        return null;
      }

      uploadingRef.current.add(key);

      try {
        const ext = file.name.split(".").pop();
        const filename = `${pageId}/${key}-${Date.now()}.${ext}`;

        const { data, error } = await supabase.storage
          .from(storageBucket)
          .upload(filename, file, { cacheControl: "3600", upsert: true });

        if (error) {
          console.error("Supabase upload error:", error);
          // Fallback to local blob URL
          const localUrl = URL.createObjectURL(file);
          setImage(key, localUrl);
          toast.success("Đã cập nhật ảnh (local)");
          return localUrl;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(storageBucket).getPublicUrl(data.path);

        setImage(key, publicUrl);
        toast.success("Đã upload ảnh!");
        return publicUrl;
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Lỗi upload ảnh");
        return null;
      } finally {
        uploadingRef.current.delete(key);
      }
    },
    [pageId, storageBucket, setImage]
  );

  // Reset all to defaults
  const resetAll = useCallback(async () => {
    if (confirm("Reset tất cả thay đổi về ban đầu?")) {
      const defaultContent = getDefaultContent();
      setContent(defaultContent);
      setOriginalContent(defaultContent);
      localStorage.removeItem(storageKey);

      // Also remove from database
      try {
        await supabaseAny.from("page_content").delete().eq("page_id", pageId);
        console.log("[AdminEditProvider] Deleted from DATABASE:", pageId);
      } catch (err) {
        console.error("[AdminEditProvider] Error deleting from database:", err);
      }

      toast.success("Đã reset về mặc định");
    }
  }, [storageKey, pageId]);

  // Save all changes
  const saveAll = useCallback(async () => {
    setIsSaving(true);
    try {
      // Save to database
      const { error } = await supabaseAny.from("page_content").upsert(
        {
          page_id: pageId,
          content: content,
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null,
        },
        { onConflict: "page_id" }
      );

      if (error) {
        console.error("[AdminEditProvider] Error saving to database:", error);
        toast.error("Lỗi lưu vào database!");
        return;
      }

      // Also save to localStorage as cache
      localStorage.setItem(storageKey, JSON.stringify(content));
      setOriginalContent(content);
      toast.success("Đã lưu vào database!");
      console.log("[AdminEditProvider] Saved to DATABASE:", pageId);
    } catch (err) {
      console.error("[AdminEditProvider] Save error:", err);
      toast.error("Lỗi khi lưu!");
    } finally {
      setIsSaving(false);
    }
  }, [content, pageId, storageKey, user?.id]);

  // Auto-save when exiting edit mode with changes
  useEffect(() => {
    if (!isEditMode && hasChanges) {
      saveAll();
    }
  }, [isEditMode]);

  return (
    <AdminEditContext.Provider
      value={{
        pageId,
        isEditMode,
        isAdmin,
        isSaving,
        toggleEditMode,
        getImage,
        setImage,
        getText,
        setText,
        getStyle,
        setStyle,
        uploadImage,
        resetAll,
        saveAll,
        hasChanges,
      }}
    >
      {children}

      {/* Floating Admin Toolbar */}
      {isAdmin && <AdminToolbar />}

      {/* Edit Mode Indicator */}
      {isEditMode && <EditModeIndicator pageId={pageId} />}
    </AdminEditContext.Provider>
  );
};

// ============================================================================
// Admin Toolbar Component
// ============================================================================
const AdminToolbar = () => {
  const { isEditMode, toggleEditMode, resetAll, saveAll, isSaving, hasChanges } = useAdminEdit();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-[9999] flex gap-2 items-center"
      >
        {/* Changes indicator */}
        {hasChanges && !isEditMode && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 bg-orange-500 rounded-full animate-pulse shadow-lg"
          />
        )}

        {isEditMode ? (
          <>
            {/* Reset Button - Red/Orange */}
            <Button
              variant="outline"
              size="sm"
              onClick={resetAll}
              className="gap-2 bg-red-500/10 hover:bg-red-500/20 border-red-400 text-red-400 hover:text-red-300 shadow-lg backdrop-blur-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
            {/* Save Button - Blue */}
            <Button
              variant="default"
              size="sm"
              onClick={saveAll}
              disabled={isSaving || !hasChanges}
              className="gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-lg font-medium disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </Button>
            {/* Done Button - Green */}
            <Button
              variant="default"
              size="sm"
              onClick={toggleEditMode}
              className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg font-medium"
            >
              <Check className="w-4 h-4" /> Done
            </Button>
          </>
        ) : (
          /* Edit Mode Button - Cyan/Bright */
          <Button
            variant="default"
            size="sm"
            onClick={toggleEditMode}
            className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg font-medium border-0"
          >
            <Pencil className="w-4 h-4" /> Edit Mode
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// Edit Mode Indicator
// ============================================================================
const EditModeIndicator = ({ pageId }: { pageId: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-xl flex items-center gap-3 border border-amber-400/30"
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <Pencil className="w-4 h-4" />
        <span>EDIT MODE</span>
      </div>
      <span className="text-amber-200">|</span>
      <span className="text-amber-100 text-xs font-normal">{pageId}</span>
    </motion.div>
  );
};

// ============================================================================
// Hook
// ============================================================================
export const useAdminEdit = () => {
  const context = useContext(AdminEditContext);
  if (!context) {
    // Return a safe default when not in provider
    return {
      pageId: "",
      isEditMode: false,
      isAdmin: false,
      isSaving: false,
      toggleEditMode: () => {},
      getImage: (_key: string, defaultUrl: string) => defaultUrl,
      setImage: () => {},
      getText: (_key: string, defaultText: string) => defaultText,
      setText: () => {},
      getStyle: (_key: string, _styleName: string, defaultValue: string) => defaultValue,
      setStyle: () => {},
      uploadImage: async () => null,
      resetAll: () => {},
      saveAll: async () => {},
      hasChanges: false,
    };
  }
  return context;
};

// ============================================================================
// EditableImage Component
// ============================================================================
interface EditableImageProps {
  imageKey: string;
  defaultSrc: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
}

export const EditableImage = ({
  imageKey,
  defaultSrc,
  alt,
  className = "",
  containerClassName = "",
  onClick,
}: EditableImageProps) => {
  const { isEditMode, getImage, uploadImage } = useAdminEdit();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const src = getImage(imageKey, defaultSrc);

  const handleClick = () => {
    if (isEditMode) {
      fileInputRef.current?.click();
    } else if (onClick) {
      onClick();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    await uploadImage(imageKey, file);
    setIsUploading(false);
    e.target.value = "";
  };

  return (
    <div className={`relative ${containerClassName} ${isEditMode ? "cursor-pointer" : ""}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <img
        src={src}
        alt={alt}
        className={`${className} ${
          isEditMode ? "ring-2 ring-cyan-500 ring-offset-2 ring-offset-background" : ""
        }`}
        onClick={handleClick}
      />

      {/* Edit Overlay */}
      {isEditMode && (
        <div
          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
          onClick={handleClick}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <div className="text-center text-white">
              <Camera className="w-8 h-8 mx-auto mb-1" />
              <span className="text-xs font-medium">Click để đổi ảnh</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EditableText Component
// ============================================================================
interface EditableTextProps {
  textKey: string;
  defaultText: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

export const EditableText = ({
  textKey,
  defaultText,
  as: Component = "span",
  className = "",
  multiline = false,
  placeholder = "Nhập nội dung...",
}: EditableTextProps) => {
  const { isEditMode, getText, setText } = useAdminEdit();
  const [isEditing, setIsEditing] = useState(false);
  const text = getText(textKey, defaultText);

  if (!isEditMode) {
    return <Component className={className}>{text}</Component>;
  }

  if (isEditing) {
    const InputComponent = multiline ? Textarea : Input;
    return (
      <div className="relative inline-block w-full">
        <InputComponent
          value={text}
          onChange={(e) => setText(textKey, e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !multiline) {
              setIsEditing(false);
            }
            if (e.key === "Escape") {
              setIsEditing(false);
            }
          }}
          placeholder={placeholder}
          autoFocus
          className={`${className} bg-background/80 backdrop-blur border-cyan-500`}
        />
      </div>
    );
  }

  return (
    <Component
      className={`${className} cursor-pointer hover:ring-2 hover:ring-cyan-500 hover:ring-offset-2 transition-all rounded px-1`}
      onClick={() => setIsEditing(true)}
      title="Click để chỉnh sửa"
    >
      {text || <span className="opacity-50 italic">{placeholder}</span>}
      <Type className="inline-block w-3 h-3 ml-1 opacity-50" />
    </Component>
  );
};

// ============================================================================
// EditableLink Component (for buttons, links with href)
// ============================================================================
interface EditableLinkProps {
  linkKey: string;
  defaultHref: string;
  defaultText: string;
  className?: string;
  children?: ReactNode;
}

export const EditableLink = ({
  linkKey,
  defaultHref,
  defaultText,
  className = "",
  children,
}: EditableLinkProps) => {
  const { isEditMode, getText, setText } = useAdminEdit();
  const [showEditor, setShowEditor] = useState(false);

  const href = getText(`${linkKey}_href`, defaultHref);
  const text = getText(`${linkKey}_text`, defaultText);

  if (isEditMode && showEditor) {
    return (
      <div className="inline-flex flex-col gap-2 p-3 bg-background border border-cyan-500 rounded-lg shadow-lg">
        <Input
          value={text}
          onChange={(e) => setText(`${linkKey}_text`, e.target.value)}
          placeholder="Text hiển thị"
          className="text-sm"
        />
        <Input
          value={href}
          onChange={(e) => setText(`${linkKey}_href`, e.target.value)}
          placeholder="URL (https://...)"
          className="text-sm"
        />
        <Button size="sm" onClick={() => setShowEditor(false)}>
          <Check className="w-4 h-4 mr-1" /> Done
        </Button>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <span
        className={`${className} cursor-pointer ring-2 ring-cyan-500 ring-offset-2`}
        onClick={() => setShowEditor(true)}
        title="Click để chỉnh sửa link"
      >
        {children || text}
        <Settings className="inline-block w-3 h-3 ml-1 opacity-50" />
      </span>
    );
  }

  return (
    <a href={href} className={className}>
      {children || text}
    </a>
  );
};

// ============================================================================
// Export
// ============================================================================
export default AdminEditProvider;
