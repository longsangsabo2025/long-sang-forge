/**
 * useKnowledge Hook
 * Manages knowledge ingestion and search with React Query
 */

import { brainAPI } from "@/brain/lib/services/brain-api";
import type { IngestKnowledgeInput, KnowledgeSearchOptions } from "@/brain/types/brain.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const QUERY_KEY = ["brain", "knowledge"];

/**
 * Hook to search knowledge
 */
export function useSearchKnowledge(
  query: string | null,
  options: KnowledgeSearchOptions = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [...QUERY_KEY, "search", query, options],
    queryFn: () => {
      if (!query) throw new Error("Query is required");
      return brainAPI.searchKnowledge(query, options);
    },
    enabled: enabled && !!query && query.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get knowledge by ID
 */
export function useKnowledge(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => {
      if (!id) throw new Error("Knowledge ID is required");
      return brainAPI.getKnowledge(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to ingest knowledge
 */
export function useIngestKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: IngestKnowledgeInput) => brainAPI.ingestKnowledge(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY[0], "search"] });
      toast.success("Knowledge added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add knowledge");
    },
  });
}
