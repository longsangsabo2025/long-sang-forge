/**
 * Hook để fetch project showcase data từ database
 * Updated theo Elon Musk Audit - Single Source of Truth
 */
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface ProjectShowcase {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  status: string;
  progress: number;
  production_url: string | null;
  logo_url: string | null;

  // Hero section
  hero_title: string;
  hero_description: string;
  hero_stats: Array<{ icon: string; label: string; value: string; color: string }>;

  // Content
  overview_title: string;
  overview_description: string;
  objectives: string[];
  impacts: string[];

  // Features & Tech
  features: Array<{ icon: string; title: string; color: string; points: string[] }>;
  tech_stack: Array<{ name: string; category: string; iconifyIcon?: string }>;
  key_features: string[];

  // Media
  screenshots: Array<{ url: string; caption?: string }>;
  video_url: string | null;

  // Metrics
  metrics: Array<{ label: string; value: string; unit: string }>;
  performance: Array<{ label: string; value: string }>;
  infrastructure: Array<{ label: string; value: string }>;

  // Project Meta (NEW)
  github_url: string | null;
  my_role: string | null;
  team_size: number;
  start_date: string | null;
  end_date: string | null;

  // Display Meta
  is_featured: boolean;
  display_order: number;
  is_active: boolean;

  // Display Type - Override auto-detection (NEW for flexible mockup)
  display_type?: "phone" | "browser" | "tablet" | "responsive" | null;

  // Case Study (for CaseStudyCard)
  case_study?: {
    problem: string;
    solution: string;
    result: string;
    metrics?: Array<{ label: string; value: string }>;
  };

  // Testimonials (from customers)
  testimonials?: Array<{
    name: string;
    role: string;
    content: string;
    rating?: number;
    avatar?: string;
  }>;
}

// Type alias for backward compatibility
export type ProjectShowcaseData = ProjectShowcase;

export const useProjectShowcase = (slug: string) => {
  return useQuery({
    queryKey: ["project-showcase", slug],
    queryFn: async (): Promise<ProjectShowcase | null> => {
      const { data, error } = await supabase
        .from("project_showcase")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        console.error("Error fetching project showcase:", error);
        return null;
      }

      return data as ProjectShowcase | null;
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    enabled: !!slug,
  });
};

export const useAllProjectShowcases = () => {
  return useQuery({
    queryKey: ["project-showcases-all"],
    queryFn: async (): Promise<ProjectShowcase[]> => {
      const { data, error } = await supabase
        .from("project_showcase")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error fetching project showcases:", error);
        return [];
      }

      return (data as ProjectShowcase[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
