/**
 * useUserBrain Hook
 * =================
 * React Query hooks for User's Second Brain
 */

import { userBrainAPI, type ChatResponse } from "@/brain/lib/services/user-brain-api";
import { useAuth } from "@/components/auth/AuthProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

const QUERY_KEYS = {
  quota: ["user-brain", "quota"],
  plans: ["user-brain", "plans"],
  userPlan: ["user-brain", "user-plan"],
  imports: ["user-brain", "imports"],
  chats: ["user-brain", "chats"],
  domains: ["user-brain", "domains"],
};

/**
 * Hook to get user's brain quota
 */
export function useUserBrainQuota() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.quota, user?.id],
    queryFn: () => userBrainAPI.getQuota(user!.id),
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to get user's current subscription plan
 */
export function useUserPlan() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.userPlan, user?.id],
    queryFn: () => userBrainAPI.getUserPlan(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get all subscription plans with brain features
 */
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: QUERY_KEYS.plans,
    queryFn: () => userBrainAPI.getPlans(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * @deprecated Use useSubscriptionPlans instead
 */
export function useBrainPlanLimits() {
  return useSubscriptionPlans();
}

/**
 * Hook to get import jobs
 */
export function useUserBrainImports() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.imports, user?.id],
    queryFn: () => userBrainAPI.getImportJobs(user!.id),
    enabled: !!user?.id,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: (query) => {
      // Refetch more often if there are pending imports
      const data = query.state.data;
      const hasPending = data?.some((j) => j.status === "pending" || j.status === "processing");
      return hasPending ? 5000 : 30000;
    },
  });
}

/**
 * Hook to import content
 */
export function useImportContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      domainId?: string;
      sourceType: "youtube" | "url" | "text";
      sourceUrl?: string;
      content?: string;
      title?: string;
    }) => {
      if (!user?.id) throw new Error("User not logged in");
      return userBrainAPI.importContent({ ...params, userId: user.id });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Import successful! ${result.documentsCreated} documents created.`);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.imports });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.domains });
      } else {
        toast.error(result.error || "Import failed");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Import failed");
    },
  });
}

/**
 * Hook for brain chat
 */
export function useUserBrainChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null);

  const sendMessage = async (message: string, domainId?: string) => {
    if (!user?.id) {
      toast.error("Please login to use Brain Chat");
      return;
    }

    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      const response = await userBrainAPI.chat({
        userId: user.id,
        message,
        sessionId,
        domainId,
        messages,
      });

      setMessages((prev) => [...prev, { role: "assistant", content: response.response }]);
      setLastResponse(response);

      // Refresh quota
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota });

      return response;
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes("limit")) {
        toast.error("Bạn đã hết quota! Nâng cấp plan để tiếp tục.", {
          action: {
            label: "Nâng cấp",
            onClick: () => (window.location.href = "/brain/pricing"),
          },
        });
      } else {
        toast.error(errorMessage);
      }
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setLastResponse(null);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    lastResponse,
    sessionId,
  };
}

/**
 * Hook to get chat history
 */
export function useUserBrainChatHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.chats, user?.id],
    queryFn: () => userBrainAPI.getChatHistory(user!.id),
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to delete chat
 */
export function useDeleteBrainChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: string) => userBrainAPI.deleteChat(chatId),
    onSuccess: () => {
      toast.success("Chat deleted");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chats });
    },
    onError: () => {
      toast.error("Failed to delete chat");
    },
  });
}

/**
 * Hook to get user's domains
 */
export function useUserBrainDomains() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.domains, user?.id],
    queryFn: () => userBrainAPI.getUserDomains(user!.id),
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minute
  });
}
