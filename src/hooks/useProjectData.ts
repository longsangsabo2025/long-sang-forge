/**
 * Hook để merge data từ file tĩnh (projects-data.ts) với data động từ database
 *
 * Cách hoạt động:
 * 1. Base data: lấy từ projectsData (file tĩnh) - đã có đầy đủ UI, features, metrics
 * 2. Dynamic data: fetch từ Supabase - screenshots, social_links, production_url mới
 * 3. Merge: overlay dynamic data lên base data
 * 4. Cache: lưu trong memory để tránh fetch lại liên tục
 */

import { ProjectData, projectsData } from "@/data/projects-data";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useState } from "react";

interface DynamicProjectData {
  slug: string;
  production_url?: string;
  logo_url?: string;
  screenshots?: Array<{ url: string; caption: string }>;
  social_links?: {
    github?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    website?: string;
  };
}

// Simple in-memory cache
let cachedProjects: ProjectData[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useProjectData() {
  const [projects, setProjects] = useState<ProjectData[]>(cachedProjects || projectsData);
  const [loading, setLoading] = useState(!cachedProjects);
  const [error, setError] = useState<string | null>(null);

  const fetchAndMerge = useCallback(async (forceRefresh = false) => {
    // Check cache validity
    const now = Date.now();
    if (!forceRefresh && cachedProjects && now - cacheTimestamp < CACHE_TTL) {
      setProjects(cachedProjects);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch dynamic data from database
      const { data: dbProjects, error: fetchError } = await supabase
        .from("project_showcase")
        .select("slug, production_url, logo_url, screenshots, social_links");

      if (fetchError) {
        console.warn("Failed to fetch dynamic project data:", fetchError.message);
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      if (!dbProjects || dbProjects.length === 0) {
        setLoading(false);
        return;
      }

      // Create lookup map by slug
      const dbMap = new Map<string, DynamicProjectData>();
      dbProjects.forEach((p) => {
        if (p.slug) {
          dbMap.set(p.slug, p as DynamicProjectData);
        }
      });

      // Merge dynamic data into static data
      const mergedProjects = projectsData.map((staticProject) => {
        const dynamicData = staticProject.slug ? dbMap.get(staticProject.slug) : null;

        if (!dynamicData) {
          return staticProject;
        }

        // Overlay dynamic fields (only if they have values)
        return {
          ...staticProject,
          // Override production URL if set in database
          productionUrl: dynamicData.production_url || staticProject.productionUrl,
          // Override logo if set in database
          logoUrl: dynamicData.logo_url || staticProject.logoUrl,
          // Override screenshots if set in database (and not empty)
          screenshots:
            dynamicData.screenshots && dynamicData.screenshots.length > 0
              ? dynamicData.screenshots.map((s) => s.url)
              : staticProject.screenshots,
          // Add social links (new field from database)
          socialLinks: dynamicData.social_links || {},
        };
      });

      // Update cache
      cachedProjects = mergedProjects;
      cacheTimestamp = now;

      setProjects(mergedProjects);
    } catch (err) {
      console.error("Error merging project data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndMerge();
  }, [fetchAndMerge]);

  // Force refresh function for admin updates
  const refresh = useCallback(() => {
    cachedProjects = null;
    cacheTimestamp = 0;
    fetchAndMerge(true);
  }, [fetchAndMerge]);

  return { projects, loading, error, refresh };
}

/**
 * Hook để lấy 1 project theo ID với data đã merge
 */
export function useProjectById(projectId: number) {
  const { projects, loading } = useProjectData();
  const project = projects.find((p) => p.id === projectId) || projects[0];
  return { project, loading };
}

/**
 * Hook để lấy 1 project theo slug với data đã merge
 */
export function useProjectBySlug(slug: string) {
  const { projects, loading } = useProjectData();
  const project = projects.find((p) => p.slug === slug) || null;
  return { project, loading };
}
