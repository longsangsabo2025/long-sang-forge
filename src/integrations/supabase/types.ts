Initialising login role...
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ab_tests: {
        Row: {
          created_at: string | null
          ends_at: string | null
          id: string
          metrics: Json | null
          page_id: string
          status: string | null
          strategy: string | null
          target_metric: string | null
          topic: string
          updated_at: string | null
          variants: Json
          winner_variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          ends_at?: string | null
          id: string
          metrics?: Json | null
          page_id: string
          status?: string | null
          strategy?: string | null
          target_metric?: string | null
          topic: string
          updated_at?: string | null
          variants?: Json
          winner_variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          metrics?: Json | null
          page_id?: string
          status?: string | null
          strategy?: string | null
          target_metric?: string | null
          topic?: string
          updated_at?: string | null
          variants?: Json
          winner_variant_id?: string | null
        }
        Relationships: []
      }
      activities: {
        Row: {
          activity_type: string
          contact_id: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          metadata: Json | null
          title: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          contact_id: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          title: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          contact_id?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts_with_latest_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          agent_id: string | null
          created_at: string | null
          details: Json | null
          duration_ms: number | null
          error_message: string | null
          id: string
          status: string
          workflow_id: string | null
        }
        Insert: {
          action: string
          agent_id?: string | null
          created_at?: string | null
          details?: Json | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          status: string
          workflow_id?: string | null
        }
        Update: {
          action?: string
          agent_id?: string | null
          created_at?: string | null
          details?: Json | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          status?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_profiles: {
        Row: {
          ai_verbosity: string | null
          avatar_url: string | null
          bio: string | null
          communication_style: string | null
          created_at: string | null
          email: string | null
          expertise_level: string | null
          full_name: string
          id: string
          include_examples: boolean | null
          include_explanations: boolean | null
          location: string | null
          nickname: string | null
          phone: string | null
          preferred_language: string | null
          response_preference: string | null
          role: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_verbosity?: string | null
          avatar_url?: string | null
          bio?: string | null
          communication_style?: string | null
          created_at?: string | null
          email?: string | null
          expertise_level?: string | null
          full_name?: string
          id?: string
          include_examples?: boolean | null
          include_explanations?: boolean | null
          location?: string | null
          nickname?: string | null
          phone?: string | null
          preferred_language?: string | null
          response_preference?: string | null
          role?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          ai_verbosity?: string | null
          avatar_url?: string | null
          bio?: string | null
          communication_style?: string | null
          created_at?: string | null
          email?: string | null
          expertise_level?: string | null
          full_name?: string
          id?: string
          include_examples?: boolean | null
          include_explanations?: boolean | null
          location?: string | null
          nickname?: string | null
          phone?: string | null
          preferred_language?: string | null
          response_preference?: string | null
          role?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          config?: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      agent_budgets: {
        Row: {
          agent_id: string | null
          alert_threshold_percent: number | null
          auto_pause_on_exceed: boolean | null
          created_at: string | null
          current_daily_spent: number | null
          current_monthly_spent: number | null
          id: string
          last_reset_daily: string | null
          last_reset_monthly: string | null
          max_daily_cost: number | null
          max_monthly_cost: number | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          alert_threshold_percent?: number | null
          auto_pause_on_exceed?: boolean | null
          created_at?: string | null
          current_daily_spent?: number | null
          current_monthly_spent?: number | null
          id?: string
          last_reset_daily?: string | null
          last_reset_monthly?: string | null
          max_daily_cost?: number | null
          max_monthly_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          alert_threshold_percent?: number | null
          auto_pause_on_exceed?: boolean | null
          created_at?: string | null
          current_daily_spent?: number | null
          current_monthly_spent?: number | null
          id?: string
          last_reset_daily?: string | null
          last_reset_monthly?: string | null
          max_daily_cost?: number | null
          max_monthly_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_budgets_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_communications: {
        Row: {
          content: string
          created_at: string | null
          from_agent_id: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          read_at: string | null
          related_task_id: string | null
          subject: string | null
          to_agent_id: string | null
          to_user: boolean | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          from_agent_id?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          related_task_id?: string | null
          subject?: string | null
          to_agent_id?: string | null
          to_user?: boolean | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          from_agent_id?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          related_task_id?: string | null
          subject?: string | null
          to_agent_id?: string | null
          to_user?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_communications_from_agent_id_fkey"
            columns: ["from_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_communications_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "agent_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_communications_to_agent_id_fkey"
            columns: ["to_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_executions: {
        Row: {
          agent_id: string | null
          completed_at: string | null
          cost_usd: number | null
          created_by: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          output_data: Json | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          agent_id?: string | null
          completed_at?: string | null
          cost_usd?: number | null
          created_by?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          agent_id?: string | null
          completed_at?: string | null
          cost_usd?: number | null
          created_by?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_executions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_jobs: {
        Row: {
          agent_type: string
          completed_at: string | null
          created_at: string | null
          episode_id: string
          error_message: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          status: string
          updated_at: string | null
        }
        Insert: {
          agent_type: string
          completed_at?: string | null
          created_at?: string | null
          episode_id: string
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          agent_type?: string
          completed_at?: string | null
          created_at?: string | null
          episode_id?: string
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_jobs_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "ai_episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_memory: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          importance: string | null
          is_active: boolean | null
          last_used_at: string | null
          linked_items: string[] | null
          memory_type: string
          source: string | null
          source_agent_id: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          used_count: number | null
          user_id: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          importance?: string | null
          is_active?: boolean | null
          last_used_at?: string | null
          linked_items?: string[] | null
          memory_type: string
          source?: string | null
          source_agent_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          used_count?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          importance?: string | null
          is_active?: boolean | null
          last_used_at?: string | null
          linked_items?: string[] | null
          memory_type?: string
          source?: string | null
          source_agent_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          used_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_memory_source_agent_id_fkey"
            columns: ["source_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_responses: {
        Row: {
          agent_id: string | null
          agent_type: string
          created_at: string | null
          id: string
          model_used: string | null
          raw_response: string | null
          response: Json
          response_time_ms: number | null
          status: string | null
          task_id: string | null
          tokens_used: number | null
        }
        Insert: {
          agent_id?: string | null
          agent_type: string
          created_at?: string | null
          id?: string
          model_used?: string | null
          raw_response?: string | null
          response: Json
          response_time_ms?: number | null
          status?: string | null
          task_id?: string | null
          tokens_used?: number | null
        }
        Update: {
          agent_id?: string | null
          agent_type?: string
          created_at?: string | null
          id?: string
          model_used?: string | null
          raw_response?: string | null
          response?: Json
          response_time_ms?: number | null
          status?: string | null
          task_id?: string | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_responses_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_responses_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "agent_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_tasks: {
        Row: {
          agent_id: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          error_message: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          priority: string | null
          progress: number | null
          started_at: string | null
          status: string | null
          task_type: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          priority?: string | null
          progress?: number | null
          started_at?: string | null
          status?: string | null
          task_type: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          priority?: string | null
          progress?: number | null
          started_at?: string | null
          status?: string | null
          task_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_tasks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          agent_type: string
          avg_execution_time_ms: number | null
          capabilities: Json | null
          config: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          failed_executions: number | null
          id: string
          last_used_at: string | null
          metadata: Json | null
          name: string
          role: string
          status: string | null
          successful_executions: number | null
          total_cost_usd: number | null
          total_executions: number | null
          updated_at: string | null
        }
        Insert: {
          agent_type?: string
          avg_execution_time_ms?: number | null
          capabilities?: Json | null
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          failed_executions?: number | null
          id?: string
          last_used_at?: string | null
          metadata?: Json | null
          name: string
          role: string
          status?: string | null
          successful_executions?: number | null
          total_cost_usd?: number | null
          total_executions?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_type?: string
          avg_execution_time_ms?: number | null
          capabilities?: Json | null
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          failed_executions?: number | null
          id?: string
          last_used_at?: string | null
          metadata?: Json | null
          name?: string
          role?: string
          status?: string | null
          successful_executions?: number | null
          total_cost_usd?: number | null
          total_executions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_agents: {
        Row: {
          category: string | null
          config: Json | null
          created_at: string | null
          description: string | null
          id: string
          last_error: string | null
          last_run: string | null
          name: string
          status: string | null
          successful_runs: number | null
          total_runs: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_error?: string | null
          last_run?: string | null
          name: string
          status?: string | null
          successful_runs?: number | null
          total_runs?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_error?: string | null
          last_run?: string | null
          name?: string
          status?: string | null
          successful_runs?: number | null
          total_runs?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_channels: {
        Row: {
          ai_models: Json | null
          avatar_url: string | null
          banner_url: string | null
          brand_colors: Json | null
          created_at: string | null
          default_aspect_ratio: string | null
          description: string | null
          handle: string | null
          id: string
          influencer_name: string | null
          influencer_persona: string | null
          influencer_style: string | null
          metadata: Json | null
          name: string
          niche: string | null
          platforms: Json | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_models?: Json | null
          avatar_url?: string | null
          banner_url?: string | null
          brand_colors?: Json | null
          created_at?: string | null
          default_aspect_ratio?: string | null
          description?: string | null
          handle?: string | null
          id?: string
          influencer_name?: string | null
          influencer_persona?: string | null
          influencer_style?: string | null
          metadata?: Json | null
          name: string
          niche?: string | null
          platforms?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_models?: Json | null
          avatar_url?: string | null
          banner_url?: string | null
          brand_colors?: Json | null
          created_at?: string | null
          default_aspect_ratio?: string | null
          description?: string | null
          handle?: string | null
          id?: string
          influencer_name?: string | null
          influencer_persona?: string | null
          influencer_style?: string | null
          metadata?: Json | null
          name?: string
          niche?: string | null
          platforms?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_content_ideas: {
        Row: {
          ai_generated: boolean | null
          ai_model: string | null
          category: string | null
          channel_id: string | null
          content_type: string | null
          created_at: string | null
          description: string | null
          generation_prompt: string | null
          id: string
          metadata: Json | null
          platforms: string[] | null
          published_at: string | null
          scheduled_at: string | null
          status: string | null
          tags: string[] | null
          target_audience: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          ai_model?: string | null
          category?: string | null
          channel_id?: string | null
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          generation_prompt?: string | null
          id?: string
          metadata?: Json | null
          platforms?: string[] | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          tags?: string[] | null
          target_audience?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          ai_model?: string | null
          category?: string | null
          channel_id?: string | null
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          generation_prompt?: string | null
          id?: string
          metadata?: Json | null
          platforms?: string[] | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          tags?: string[] | null
          target_audience?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_context_cache: {
        Row: {
          context_content: string
          context_type: string
          created_at: string | null
          id: string
          is_stale: boolean | null
          related_entity_id: string | null
          token_count: number | null
          updated_at: string | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          context_content: string
          context_type: string
          created_at?: string | null
          id?: string
          is_stale?: boolean | null
          related_entity_id?: string | null
          token_count?: number | null
          updated_at?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Update: {
          context_content?: string
          context_type?: string
          created_at?: string | null
          id?: string
          is_stale?: boolean | null
          related_entity_id?: string | null
          token_count?: number | null
          updated_at?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      ai_creative_jobs: {
        Row: {
          cloudinary_id: string | null
          cloudinary_url: string | null
          completed_at: string | null
          cost_usd: number | null
          created_at: string | null
          drive_id: string | null
          drive_url: string | null
          enhanced_prompt: string | null
          external_task_id: string | null
          external_task_url: string | null
          id: string
          input_images: Json | null
          is_favorite: boolean | null
          job_type: Database["public"]["Enums"]["job_type"]
          model: string | null
          notes: string | null
          original_prompt: string | null
          output_metadata: Json | null
          output_url: string | null
          processing_time_ms: number | null
          provider: string | null
          settings: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["job_status"] | null
          tags: string[] | null
          user_id: string | null
          user_rating: number | null
        }
        Insert: {
          cloudinary_id?: string | null
          cloudinary_url?: string | null
          completed_at?: string | null
          cost_usd?: number | null
          created_at?: string | null
          drive_id?: string | null
          drive_url?: string | null
          enhanced_prompt?: string | null
          external_task_id?: string | null
          external_task_url?: string | null
          id?: string
          input_images?: Json | null
          is_favorite?: boolean | null
          job_type: Database["public"]["Enums"]["job_type"]
          model?: string | null
          notes?: string | null
          original_prompt?: string | null
          output_metadata?: Json | null
          output_url?: string | null
          processing_time_ms?: number | null
          provider?: string | null
          settings?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          tags?: string[] | null
          user_id?: string | null
          user_rating?: number | null
        }
        Update: {
          cloudinary_id?: string | null
          cloudinary_url?: string | null
          completed_at?: string | null
          cost_usd?: number | null
          created_at?: string | null
          drive_id?: string | null
          drive_url?: string | null
          enhanced_prompt?: string | null
          external_task_id?: string | null
          external_task_url?: string | null
          id?: string
          input_images?: Json | null
          is_favorite?: boolean | null
          job_type?: Database["public"]["Enums"]["job_type"]
          model?: string | null
          notes?: string | null
          original_prompt?: string | null
          output_metadata?: Json | null
          output_url?: string | null
          processing_time_ms?: number | null
          provider?: string | null
          settings?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          tags?: string[] | null
          user_id?: string | null
          user_rating?: number | null
        }
        Relationships: []
      }
      ai_episodes: {
        Row: {
          channel_id: string | null
          cinematography: Json | null
          created_at: string | null
          description: string | null
          episode_number: number
          hashtags: string[] | null
          hook: string | null
          id: string
          image_prompts: Json | null
          motion_prompts: Json | null
          scheduled_date: string | null
          script_content: string | null
          series_id: string | null
          shot_list: Json | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          channel_id?: string | null
          cinematography?: Json | null
          created_at?: string | null
          description?: string | null
          episode_number: number
          hashtags?: string[] | null
          hook?: string | null
          id?: string
          image_prompts?: Json | null
          motion_prompts?: Json | null
          scheduled_date?: string | null
          script_content?: string | null
          series_id?: string | null
          shot_list?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          channel_id?: string | null
          cinematography?: Json | null
          created_at?: string | null
          description?: string | null
          episode_number?: number
          hashtags?: string[] | null
          hook?: string | null
          id?: string
          image_prompts?: Json | null
          motion_prompts?: Json | null
          scheduled_date?: string | null
          script_content?: string | null
          series_id?: string | null
          shot_list?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_episodes_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "ai_series"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_fix_suggestions: {
        Row: {
          ai_model: string | null
          analysis: Json
          applied_at: string | null
          confidence: number | null
          created_at: string | null
          error_id: string | null
          error_message: string
          error_type: string
          fix_code: string | null
          id: string
          success: boolean | null
          suggested_fix: string | null
          was_applied: boolean | null
        }
        Insert: {
          ai_model?: string | null
          analysis?: Json
          applied_at?: string | null
          confidence?: number | null
          created_at?: string | null
          error_id?: string | null
          error_message: string
          error_type: string
          fix_code?: string | null
          id?: string
          success?: boolean | null
          suggested_fix?: string | null
          was_applied?: boolean | null
        }
        Update: {
          ai_model?: string | null
          analysis?: Json
          applied_at?: string | null
          confidence?: number | null
          created_at?: string | null
          error_id?: string | null
          error_message?: string
          error_type?: string
          fix_code?: string | null
          id?: string
          success?: boolean | null
          suggested_fix?: string | null
          was_applied?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_fix_suggestions_error_id_fkey"
            columns: ["error_id"]
            isOneToOne: false
            referencedRelation: "error_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_sales_config: {
        Row: {
          avg_satisfaction: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          model: string | null
          name: string | null
          system_prompt: string
          temperature: number | null
          total_chats: number | null
          updated_at: string | null
          version: number
        }
        Insert: {
          avg_satisfaction?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model?: string | null
          name?: string | null
          system_prompt: string
          temperature?: number | null
          total_chats?: number | null
          updated_at?: string | null
          version?: number
        }
        Update: {
          avg_satisfaction?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model?: string | null
          name?: string | null
          system_prompt?: string
          temperature?: number | null
          total_chats?: number | null
          updated_at?: string | null
          version?: number
        }
        Relationships: []
      }
      ai_series: {
        Row: {
          arcs: Json | null
          channel_id: string | null
          character: string | null
          created_at: string | null
          description: string | null
          episode_duration: number | null
          hook: string | null
          id: string
          image_style_prompt: string | null
          location: string | null
          metadata: Json | null
          reference_image_ids: string[] | null
          scene_prompt_template: string | null
          status: string | null
          target_episodes: number | null
          theme: string | null
          title: string
          tone: string | null
          total_episodes: number | null
          updated_at: string | null
          visual_style: string | null
        }
        Insert: {
          arcs?: Json | null
          channel_id?: string | null
          character?: string | null
          created_at?: string | null
          description?: string | null
          episode_duration?: number | null
          hook?: string | null
          id?: string
          image_style_prompt?: string | null
          location?: string | null
          metadata?: Json | null
          reference_image_ids?: string[] | null
          scene_prompt_template?: string | null
          status?: string | null
          target_episodes?: number | null
          theme?: string | null
          title: string
          tone?: string | null
          total_episodes?: number | null
          updated_at?: string | null
          visual_style?: string | null
        }
        Update: {
          arcs?: Json | null
          channel_id?: string | null
          character?: string | null
          created_at?: string | null
          description?: string | null
          episode_duration?: number | null
          hook?: string | null
          id?: string
          image_style_prompt?: string | null
          location?: string | null
          metadata?: Json | null
          reference_image_ids?: string[] | null
          scene_prompt_template?: string | null
          status?: string | null
          target_episodes?: number | null
          theme?: string | null
          title?: string
          tone?: string | null
          total_episodes?: number | null
          updated_at?: string | null
          visual_style?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_series_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "ai_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_suggestions: {
        Row: {
          created_at: string | null
          dismissed_at: string | null
          estimated_impact: string | null
          executed_at: string | null
          id: string
          priority: string
          reason: string
          suggested_action: Json | null
          suggested_workflow_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dismissed_at?: string | null
          estimated_impact?: string | null
          executed_at?: string | null
          id?: string
          priority: string
          reason: string
          suggested_action?: Json | null
          suggested_workflow_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dismissed_at?: string | null
          estimated_impact?: string | null
          executed_at?: string | null
          id?: string
          priority?: string
          reason?: string
          suggested_action?: Json | null
          suggested_workflow_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          action_type: string | null
          cost_estimate: number | null
          cost_usd: number | null
          created_at: string | null
          error_message: string | null
          id: string
          input_tokens: number | null
          metadata: Json | null
          model: string | null
          output_tokens: number | null
          page_id: string | null
          request_type: string | null
          service: string
          success: boolean | null
          tokens_used: number | null
          total_tokens: number | null
        }
        Insert: {
          action_type?: string | null
          cost_estimate?: number | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model?: string | null
          output_tokens?: number | null
          page_id?: string | null
          request_type?: string | null
          service: string
          success?: boolean | null
          tokens_used?: number | null
          total_tokens?: number | null
        }
        Update: {
          action_type?: string | null
          cost_estimate?: number | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model?: string | null
          output_tokens?: number | null
          page_id?: string | null
          request_type?: string | null
          service?: string
          success?: boolean | null
          tokens_used?: number | null
          total_tokens?: number | null
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          content_type: string
          cost_usd: number | null
          created_at: string
          error_message: string | null
          id: string
          input_cost_usd: number | null
          input_tokens: number
          ip_address: unknown
          max_tokens: number | null
          model: string
          model_used: string | null
          output_cost_usd: number | null
          output_tokens: number
          prompt_text: string | null
          request_params: Json
          response_id: string | null
          response_time_ms: number | null
          temperature: number | null
          total_cost_usd: number | null
          total_tokens: number | null
          user_agent: string | null
          user_id: string
          was_successful: boolean
        }
        Insert: {
          content_type: string
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_cost_usd?: number | null
          input_tokens: number
          ip_address?: unknown
          max_tokens?: number | null
          model?: string
          model_used?: string | null
          output_cost_usd?: number | null
          output_tokens: number
          prompt_text?: string | null
          request_params: Json
          response_id?: string | null
          response_time_ms?: number | null
          temperature?: number | null
          total_cost_usd?: number | null
          total_tokens?: number | null
          user_agent?: string | null
          user_id: string
          was_successful?: boolean
        }
        Update: {
          content_type?: string
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_cost_usd?: number | null
          input_tokens?: number
          ip_address?: unknown
          max_tokens?: number | null
          model?: string
          model_used?: string | null
          output_cost_usd?: number | null
          output_tokens?: number
          prompt_text?: string | null
          request_params?: Json
          response_id?: string | null
          response_time_ms?: number | null
          temperature?: number | null
          total_cost_usd?: number | null
          total_tokens?: number | null
          user_agent?: string | null
          user_id?: string
          was_successful?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_stats: {
        Row: {
          avg_response_time_ms: number | null
          blogs_count: number
          created_at: string
          custom_count: number
          error_count: number
          id: string
          projects_count: number
          services_count: number
          stat_date: string
          total_cost_usd: number
          total_generations: number
          total_input_tokens: number
          total_output_tokens: number
          total_users: number
          updated_at: string
        }
        Insert: {
          avg_response_time_ms?: number | null
          blogs_count?: number
          created_at?: string
          custom_count?: number
          error_count?: number
          id?: string
          projects_count?: number
          services_count?: number
          stat_date: string
          total_cost_usd?: number
          total_generations?: number
          total_input_tokens?: number
          total_output_tokens?: number
          total_users?: number
          updated_at?: string
        }
        Update: {
          avg_response_time_ms?: number | null
          blogs_count?: number
          created_at?: string
          custom_count?: number
          error_count?: number
          id?: string
          projects_count?: number
          services_count?: number
          stat_date?: string
          total_cost_usd?: number
          total_generations?: number
          total_input_tokens?: number
          total_output_tokens?: number
          total_users?: number
          updated_at?: string
        }
        Relationships: []
      }
      alert_logs: {
        Row: {
          channel: string
          created_at: string | null
          error_id: string | null
          id: string
          message: string
          payload: Json | null
          project_name: string | null
          sent_at: string | null
          severity: string
          status: string
          title: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          error_id?: string | null
          id?: string
          message: string
          payload?: Json | null
          project_name?: string | null
          sent_at?: string | null
          severity: string
          status?: string
          title?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          error_id?: string | null
          id?: string
          message?: string
          payload?: Json | null
          project_name?: string | null
          sent_at?: string | null
          severity?: string
          status?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_logs_error_id_fkey"
            columns: ["error_id"]
            isOneToOne: false
            referencedRelation: "error_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_daily_summary: {
        Row: {
          avg_page_load_time: number | null
          avg_time_on_site: number | null
          bounce_rate: number | null
          conversion_rate: number | null
          conversions: number | null
          created_at: string | null
          date: string
          error_count: number | null
          error_rate: number | null
          id: string
          new_visitors: number | null
          page_views: number | null
          pages_per_session: number | null
          product_name: string
          returning_visitors: number | null
          unique_visitors: number | null
          updated_at: string | null
        }
        Insert: {
          avg_page_load_time?: number | null
          avg_time_on_site?: number | null
          bounce_rate?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          date: string
          error_count?: number | null
          error_rate?: number | null
          id?: string
          new_visitors?: number | null
          page_views?: number | null
          pages_per_session?: number | null
          product_name: string
          returning_visitors?: number | null
          unique_visitors?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_page_load_time?: number | null
          avg_time_on_site?: number | null
          bounce_rate?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          date?: string
          error_count?: number | null
          error_rate?: number | null
          id?: string
          new_visitors?: number | null
          page_views?: number | null
          pages_per_session?: number | null
          product_name?: string
          returning_visitors?: number | null
          unique_visitors?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          anonymous_id: string | null
          browser: string | null
          city: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          event_category: string | null
          event_name: string
          event_type: string
          id: string
          os: string | null
          page_load_time: number | null
          page_title: string | null
          page_url: string | null
          product_name: string
          properties: Json | null
          referrer: string | null
          session_id: string | null
          time_on_page: number | null
          user_id: string | null
        }
        Insert: {
          anonymous_id?: string | null
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category?: string | null
          event_name: string
          event_type: string
          id?: string
          os?: string | null
          page_load_time?: number | null
          page_title?: string | null
          page_url?: string | null
          product_name: string
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
          time_on_page?: number | null
          user_id?: string | null
        }
        Update: {
          anonymous_id?: string | null
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category?: string | null
          event_name?: string
          event_type?: string
          id?: string
          os?: string | null
          page_load_time?: number | null
          page_title?: string | null
          page_url?: string | null
          product_name?: string
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
          time_on_page?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys_vault: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_name: string | null
          last_rotated: string | null
          provider: string
          rotation_interval_days: number | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_name?: string | null
          last_rotated?: string | null
          provider: string
          rotation_interval_days?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_name?: string | null
          last_rotated?: string | null
          provider?: string
          rotation_interval_days?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_vault_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      app_showcase: {
        Row: {
          app_id: string
          app_name: string
          branding: Json
          created_at: string | null
          created_by: string | null
          cta: Json
          description: string | null
          downloads: Json
          features: Json
          hero: Json
          icon: string | null
          id: string
          production_url: string | null
          published_at: string | null
          slug: string | null
          social: Json
          status: string | null
          tagline: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          app_id: string
          app_name: string
          branding?: Json
          created_at?: string | null
          created_by?: string | null
          cta?: Json
          description?: string | null
          downloads?: Json
          features?: Json
          hero?: Json
          icon?: string | null
          id?: string
          production_url?: string | null
          published_at?: string | null
          slug?: string | null
          social?: Json
          status?: string | null
          tagline?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          app_id?: string
          app_name?: string
          branding?: Json
          created_at?: string | null
          created_by?: string | null
          cta?: Json
          description?: string | null
          downloads?: Json
          features?: Json
          hero?: Json
          icon?: string | null
          id?: string
          production_url?: string | null
          published_at?: string | null
          slug?: string | null
          social?: Json
          status?: string | null
          tagline?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_showcase_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_showcase_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_showcase_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_showcase_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          created_at: string | null
          feedback: string | null
          grade: number | null
          graded_at: string | null
          graded_by: string | null
          id: string
          rubric_scores: Json | null
          status: string | null
          submission_content: string | null
          submission_files: Json | null
          submitted_at: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string | null
          feedback?: string | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          rubric_scores?: Json | null
          status?: string | null
          submission_content?: string | null
          submission_files?: Json | null
          submitted_at?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assignment_id?: string
          created_at?: string | null
          feedback?: string | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          rubric_scores?: Json | null
          status?: string | null
          submission_content?: string | null
          submission_files?: Json | null
          submitted_at?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "course_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          contact_id: string
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_public: boolean | null
          metadata: Json | null
          storage_path: string | null
          uploaded_by: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts_with_latest_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      automated_workflows: {
        Row: {
          created_at: string | null
          description: string | null
          error_count: number | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          is_paused: boolean | null
          last_executed_at: string | null
          n8n_workflow_id: string
          name: string
          success_count: number | null
          trigger_config: Json | null
          trigger_type: string | null
          updated_at: string | null
          user_id: string | null
          workflow_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          error_count?: number | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          is_paused?: boolean | null
          last_executed_at?: string | null
          n8n_workflow_id: string
          name: string
          success_count?: number | null
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          workflow_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          error_count?: number | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          is_paused?: boolean | null
          last_executed_at?: string | null
          n8n_workflow_id?: string
          name?: string
          success_count?: number | null
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "automated_workflows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automated_workflows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          actions: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          name: string
          trigger_conditions: Json
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          actions: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name: string
          trigger_conditions: Json
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name?: string
          trigger_conditions?: Json
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_triggers: {
        Row: {
          agent_id: string | null
          created_at: string | null
          enabled: boolean | null
          id: string
          last_triggered: string | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_triggered?: string | null
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          last_triggered?: string | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_triggers_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_settings: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          badge_key: string
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          rarity: string | null
          requirement_type: string
          requirement_value: Json
          unlock_condition: Json | null
          xp_reward: number | null
        }
        Insert: {
          badge_key: string
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rarity?: string | null
          requirement_type: string
          requirement_value: Json
          unlock_condition?: Json | null
          xp_reward?: number | null
        }
        Update: {
          badge_key?: string
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rarity?: string | null
          requirement_type?: string
          requirement_value?: Json
          unlock_condition?: Json | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      brain_actions: {
        Row: {
          action_type: string
          created_at: string | null
          error_log: string | null
          executed_at: string | null
          id: string
          payload: Json | null
          result: Json | null
          session_id: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          error_log?: string | null
          executed_at?: string | null
          id?: string
          payload?: Json | null
          result?: Json | null
          session_id?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          error_log?: string | null
          executed_at?: string | null
          id?: string
          payload?: Json | null
          result?: Json | null
          session_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_actions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "brain_master_session"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_analytics: {
        Row: {
          client_info: Json | null
          created_at: string | null
          feedback: string | null
          helpful: boolean | null
          id: string
          query: string
          query_embedding_time_ms: number | null
          rag_applied: boolean | null
          rag_reason: string | null
          results_count: number | null
          search_method: string | null
          search_time_ms: number | null
          session_id: string | null
          sources: Json | null
          top_relevance: number | null
          total_time_ms: number | null
          user_id: string | null
        }
        Insert: {
          client_info?: Json | null
          created_at?: string | null
          feedback?: string | null
          helpful?: boolean | null
          id?: string
          query: string
          query_embedding_time_ms?: number | null
          rag_applied?: boolean | null
          rag_reason?: string | null
          results_count?: number | null
          search_method?: string | null
          search_time_ms?: number | null
          session_id?: string | null
          sources?: Json | null
          top_relevance?: number | null
          total_time_ms?: number | null
          user_id?: string | null
        }
        Update: {
          client_info?: Json | null
          created_at?: string | null
          feedback?: string | null
          helpful?: boolean | null
          id?: string
          query?: string
          query_embedding_time_ms?: number | null
          rag_applied?: boolean | null
          rag_reason?: string | null
          results_count?: number | null
          search_method?: string | null
          search_time_ms?: number | null
          session_id?: string | null
          sources?: Json | null
          top_relevance?: number | null
          total_time_ms?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      brain_analytics_events: {
        Row: {
          event_data: Json | null
          event_type: string
          id: string
          metadata: Json | null
          session_id: string | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_analytics_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "brain_master_session"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_api_keys: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          name: string
          rate_limit: number | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          name: string
          rate_limit?: number | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          name?: string
          rate_limit?: number | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      brain_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_characters: {
        Row: {
          attributes: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_owner: boolean | null
          name: string
          negative_prompt_keywords: string[] | null
          positive_prompt_keywords: string[] | null
          preferred_outfits: string[] | null
          preferred_styles: string[] | null
          primary_image_id: string | null
          reference_image_ids: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attributes?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_owner?: boolean | null
          name: string
          negative_prompt_keywords?: string[] | null
          positive_prompt_keywords?: string[] | null
          preferred_outfits?: string[] | null
          preferred_styles?: string[] | null
          primary_image_id?: string | null
          reference_image_ids?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attributes?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_owner?: boolean | null
          name?: string
          negative_prompt_keywords?: string[] | null
          positive_prompt_keywords?: string[] | null
          preferred_outfits?: string[] | null
          preferred_styles?: string[] | null
          primary_image_id?: string | null
          reference_image_ids?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_characters_primary_image_id_fkey"
            columns: ["primary_image_id"]
            isOneToOne: false
            referencedRelation: "brain_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_characters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_characters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_collaboration_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          knowledge_id: string
          parent_comment_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          knowledge_id: string
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          knowledge_id?: string
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_collaboration_comments_knowledge_id_fkey"
            columns: ["knowledge_id"]
            isOneToOne: false
            referencedRelation: "brain_knowledge"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_collaboration_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "brain_collaboration_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_collaboration_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_collaboration_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_collaboration_shares: {
        Row: {
          created_at: string | null
          id: string
          knowledge_id: string
          permission: string
          shared_by: string
          shared_with: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          knowledge_id: string
          permission?: string
          shared_by: string
          shared_with: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          knowledge_id?: string
          permission?: string
          shared_by?: string
          shared_with?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_collaboration_shares_knowledge_id_fkey"
            columns: ["knowledge_id"]
            isOneToOne: false
            referencedRelation: "brain_knowledge"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_collaboration_shares_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_collaboration_shares_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_collaboration_shares_shared_with_fkey"
            columns: ["shared_with"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_collaboration_shares_shared_with_fkey"
            columns: ["shared_with"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_core_logic: {
        Row: {
          anti_patterns: Json | null
          approved_at: string | null
          approved_by: string | null
          change_reason: string | null
          change_summary: string | null
          changelog: Json | null
          created_at: string | null
          cross_domain_links: Json | null
          decision_rules: Json | null
          domain_id: string | null
          first_principles: Json | null
          id: string
          is_active: boolean | null
          last_distilled_at: string | null
          mental_models: Json | null
          parent_version_id: string | null
          updated_at: string | null
          user_id: string | null
          version: number | null
        }
        Insert: {
          anti_patterns?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          change_reason?: string | null
          change_summary?: string | null
          changelog?: Json | null
          created_at?: string | null
          cross_domain_links?: Json | null
          decision_rules?: Json | null
          domain_id?: string | null
          first_principles?: Json | null
          id?: string
          is_active?: boolean | null
          last_distilled_at?: string | null
          mental_models?: Json | null
          parent_version_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
        }
        Update: {
          anti_patterns?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          change_reason?: string | null
          change_summary?: string | null
          changelog?: Json | null
          created_at?: string | null
          cross_domain_links?: Json | null
          decision_rules?: Json | null
          domain_id?: string | null
          first_principles?: Json | null
          id?: string
          is_active?: boolean | null
          last_distilled_at?: string | null
          mental_models?: Json | null
          parent_version_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_core_logic_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_core_logic_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_core_logic_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "brain_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_core_logic_parent_version_id_fkey"
            columns: ["parent_version_id"]
            isOneToOne: false
            referencedRelation: "brain_core_logic"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_core_logic_parent_version_id_fkey"
            columns: ["parent_version_id"]
            isOneToOne: false
            referencedRelation: "brain_core_logic_version_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_core_logic_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_core_logic_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_core_logic_queue: {
        Row: {
          completed_at: string | null
          config: Json | null
          created_at: string | null
          domain_id: string | null
          id: string
          last_error: string | null
          max_retries: number | null
          priority: number | null
          result_core_logic_id: string | null
          result_summary: Json | null
          retry_count: number | null
          started_at: string | null
          status: string | null
          triggered_at: string | null
          triggered_by: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          config?: Json | null
          created_at?: string | null
          domain_id?: string | null
          id?: string
          last_error?: string | null
          max_retries?: number | null
          priority?: number | null
          result_core_logic_id?: string | null
          result_summary?: Json | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
          triggered_at?: string | null
          triggered_by?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          config?: Json | null
          created_at?: string | null
          domain_id?: string | null
          id?: string
          last_error?: string | null
          max_retries?: number | null
          priority?: number | null
          result_core_logic_id?: string | null
          result_summary?: Json | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
          triggered_at?: string | null
          triggered_by?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_core_logic_queue_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "brain_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_core_logic_queue_result_core_logic_id_fkey"
            columns: ["result_core_logic_id"]
            isOneToOne: false
            referencedRelation: "brain_core_logic"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_core_logic_queue_result_core_logic_id_fkey"
            columns: ["result_core_logic_id"]
            isOneToOne: false
            referencedRelation: "brain_core_logic_version_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_core_logic_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_core_logic_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_domain_connections: {
        Row: {
          common_concepts: string[] | null
          connection_strength: number | null
          created_at: string | null
          domain_a_id: string
          domain_b_id: string
          id: string
          user_id: string
        }
        Insert: {
          common_concepts?: string[] | null
          connection_strength?: number | null
          created_at?: string | null
          domain_a_id: string
          domain_b_id: string
          id?: string
          user_id: string
        }
        Update: {
          common_concepts?: string[] | null
          connection_strength?: number | null
          created_at?: string | null
          domain_a_id?: string
          domain_b_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      brain_domain_relevance_history: {
        Row: {
          avg_result_similarity: number | null
          context_score: number | null
          created_at: string | null
          domain_id: string
          feedback_score: number | null
          id: string
          keyword_match_score: number | null
          query_embedding: string | null
          query_text: string
          relevance_score: number
          results_count: number | null
          selection_rank: number | null
          similarity_score: number | null
          user_id: string | null
          was_selected: boolean | null
        }
        Insert: {
          avg_result_similarity?: number | null
          context_score?: number | null
          created_at?: string | null
          domain_id: string
          feedback_score?: number | null
          id?: string
          keyword_match_score?: number | null
          query_embedding?: string | null
          query_text: string
          relevance_score: number
          results_count?: number | null
          selection_rank?: number | null
          similarity_score?: number | null
          user_id?: string | null
          was_selected?: boolean | null
        }
        Update: {
          avg_result_similarity?: number | null
          context_score?: number | null
          created_at?: string | null
          domain_id?: string
          feedback_score?: number | null
          id?: string
          keyword_match_score?: number | null
          query_embedding?: string | null
          query_text?: string
          relevance_score?: number
          results_count?: number | null
          selection_rank?: number | null
          similarity_score?: number | null
          user_id?: string | null
          was_selected?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_domain_relevance_history_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "brain_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_domain_relevance_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_domain_relevance_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_domain_stats: {
        Row: {
          avg_content_length: number | null
          avg_similarity_score: number | null
          computed_at: string | null
          daily_growth: Json | null
          domain_id: string | null
          id: string
          knowledge_count_this_month: number | null
          knowledge_count_this_week: number | null
          last_activity_at: string | null
          last_knowledge_added_at: string | null
          last_query_at: string | null
          top_tags: Json | null
          total_knowledge_count: number | null
          total_queries: number | null
          total_unique_tags: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avg_content_length?: number | null
          avg_similarity_score?: number | null
          computed_at?: string | null
          daily_growth?: Json | null
          domain_id?: string | null
          id?: string
          knowledge_count_this_month?: number | null
          knowledge_count_this_week?: number | null
          last_activity_at?: string | null
          last_knowledge_added_at?: string | null
          last_query_at?: string | null
          top_tags?: Json | null
          total_knowledge_count?: number | null
          total_queries?: number | null
          total_unique_tags?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avg_content_length?: number | null
          avg_similarity_score?: number | null
          computed_at?: string | null
          daily_growth?: Json | null
          domain_id?: string | null
          id?: string
          knowledge_count_this_month?: number | null
          knowledge_count_this_week?: number | null
          last_activity_at?: string | null
          last_knowledge_added_at?: string | null
          last_query_at?: string | null
          top_tags?: Json | null
          total_knowledge_count?: number | null
          total_queries?: number | null
          total_unique_tags?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_domain_stats_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: true
            referencedRelation: "brain_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_domain_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_domain_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_domains: {
        Row: {
          agent_config: Json | null
          agent_last_used_at: string | null
          agent_success_rate: number | null
          agent_total_queries: number | null
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_public: boolean | null
          keywords: string[] | null
          knowledge_count: number | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_config?: Json | null
          agent_last_used_at?: string | null
          agent_success_rate?: number | null
          agent_total_queries?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          keywords?: string[] | null
          knowledge_count?: number | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_config?: Json | null
          agent_last_used_at?: string | null
          agent_success_rate?: number | null
          agent_total_queries?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          keywords?: string[] | null
          knowledge_count?: number | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_domains_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_domains_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_generation_history: {
        Row: {
          api_response: Json | null
          context: Json | null
          created_at: string | null
          enhanced_prompt: string | null
          feedback: string | null
          id: string
          model: string | null
          negative_prompt: string | null
          original_prompt: string
          output_image_id: string | null
          output_url: string | null
          provider: string | null
          rating: number | null
          user_id: string
        }
        Insert: {
          api_response?: Json | null
          context?: Json | null
          created_at?: string | null
          enhanced_prompt?: string | null
          feedback?: string | null
          id?: string
          model?: string | null
          negative_prompt?: string | null
          original_prompt: string
          output_image_id?: string | null
          output_url?: string | null
          provider?: string | null
          rating?: number | null
          user_id: string
        }
        Update: {
          api_response?: Json | null
          context?: Json | null
          created_at?: string | null
          enhanced_prompt?: string | null
          feedback?: string | null
          id?: string
          model?: string | null
          negative_prompt?: string | null
          original_prompt?: string
          output_image_id?: string | null
          output_url?: string | null
          provider?: string | null
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_generation_history_output_image_id_fkey"
            columns: ["output_image_id"]
            isOneToOne: false
            referencedRelation: "brain_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_generation_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_generation_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_image_collections: {
        Row: {
          cover_image_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_ids: string[] | null
          is_public: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_image_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_ids?: string[] | null
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_image_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_ids?: string[] | null
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_image_collections_cover_image_id_fkey"
            columns: ["cover_image_id"]
            isOneToOne: false
            referencedRelation: "brain_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_image_collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_image_collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_images: {
        Row: {
          analysis: Json
          analyzed_at: string | null
          character_name: string | null
          collections: string[] | null
          created_at: string | null
          custom_description: string | null
          custom_tags: string[] | null
          custom_title: string | null
          domain_id: string | null
          embedding: string | null
          embedding_model: string | null
          file_size: number | null
          folder_id: string | null
          format: string | null
          height: number | null
          id: string
          image_url: string
          is_archived: boolean | null
          is_favorite: boolean | null
          is_owner_portrait: boolean | null
          last_used_at: string | null
          local_path: string | null
          original_filename: string | null
          thumbnail_url: string | null
          updated_at: string | null
          use_count: number | null
          user_id: string
          width: number | null
        }
        Insert: {
          analysis?: Json
          analyzed_at?: string | null
          character_name?: string | null
          collections?: string[] | null
          created_at?: string | null
          custom_description?: string | null
          custom_tags?: string[] | null
          custom_title?: string | null
          domain_id?: string | null
          embedding?: string | null
          embedding_model?: string | null
          file_size?: number | null
          folder_id?: string | null
          format?: string | null
          height?: number | null
          id?: string
          image_url: string
          is_archived?: boolean | null
          is_favorite?: boolean | null
          is_owner_portrait?: boolean | null
          last_used_at?: string | null
          local_path?: string | null
          original_filename?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          use_count?: number | null
          user_id: string
          width?: number | null
        }
        Update: {
          analysis?: Json
          analyzed_at?: string | null
          character_name?: string | null
          collections?: string[] | null
          created_at?: string | null
          custom_description?: string | null
          custom_tags?: string[] | null
          custom_title?: string | null
          domain_id?: string | null
          embedding?: string | null
          embedding_model?: string | null
          file_size?: number | null
          folder_id?: string | null
          format?: string | null
          height?: number | null
          id?: string
          image_url?: string
          is_archived?: boolean | null
          is_favorite?: boolean | null
          is_owner_portrait?: boolean | null
          last_used_at?: string | null
          local_path?: string | null
          original_filename?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          use_count?: number | null
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_images_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "brain_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_integrations: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          integration_type: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          integration_type: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_knowledge: {
        Row: {
          access_count: number | null
          chunk_index: number | null
          content: string
          content_type: string | null
          created_at: string | null
          domain_id: string | null
          embedding: string | null
          id: string
          importance_score: number | null
          last_accessed: string | null
          metadata: Json | null
          parent_id: string | null
          source_file: string | null
          source_url: string | null
          tags: string[] | null
          title: string
          token_count: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_count?: number | null
          chunk_index?: number | null
          content: string
          content_type?: string | null
          created_at?: string | null
          domain_id?: string | null
          embedding?: string | null
          id?: string
          importance_score?: number | null
          last_accessed?: string | null
          metadata?: Json | null
          parent_id?: string | null
          source_file?: string | null
          source_url?: string | null
          tags?: string[] | null
          title: string
          token_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_count?: number | null
          chunk_index?: number | null
          content?: string
          content_type?: string | null
          created_at?: string | null
          domain_id?: string | null
          embedding?: string | null
          id?: string
          importance_score?: number | null
          last_accessed?: string | null
          metadata?: Json | null
          parent_id?: string | null
          source_file?: string | null
          source_url?: string | null
          tags?: string[] | null
          title?: string
          token_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_knowledge_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "brain_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_knowledge_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_knowledge_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_knowledge_graph_edges: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          edge_label: string | null
          edge_type: string
          edge_weight: number | null
          id: string
          is_cross_domain: boolean | null
          properties: Json | null
          source_node_id: string
          target_node_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          edge_label?: string | null
          edge_type: string
          edge_weight?: number | null
          id?: string
          is_cross_domain?: boolean | null
          properties?: Json | null
          source_node_id: string
          target_node_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          edge_label?: string | null
          edge_type?: string
          edge_weight?: number | null
          id?: string
          is_cross_domain?: boolean | null
          properties?: Json | null
          source_node_id?: string
          target_node_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_knowledge_graph_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "brain_knowledge_graph_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_knowledge_graph_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "brain_knowledge_graph_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_knowledge_graph_edges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_knowledge_graph_edges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_knowledge_graph_nodes: {
        Row: {
          created_at: string | null
          domain_id: string | null
          embedding: string | null
          id: string
          importance_score: number | null
          node_description: string | null
          node_id: string | null
          node_label: string
          node_type: string
          properties: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          domain_id?: string | null
          embedding?: string | null
          id?: string
          importance_score?: number | null
          node_description?: string | null
          node_id?: string | null
          node_label: string
          node_type: string
          properties?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          domain_id?: string | null
          embedding?: string | null
          id?: string
          importance_score?: number | null
          node_description?: string | null
          node_id?: string | null
          node_label?: string
          node_type?: string
          properties?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_knowledge_graph_nodes_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "brain_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_knowledge_graph_nodes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_knowledge_graph_nodes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_knowledge_quality_scores: {
        Row: {
          created_at: string | null
          id: string
          knowledge_id: string
          last_calculated_at: string | null
          quality_score: number
          score_components: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          knowledge_id: string
          last_calculated_at?: string | null
          quality_score: number
          score_components?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          knowledge_id?: string
          last_calculated_at?: string | null
          quality_score?: number
          score_components?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_knowledge_quality_scores_knowledge_id_fkey"
            columns: ["knowledge_id"]
            isOneToOne: true
            referencedRelation: "brain_knowledge"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_learning_metrics: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          metric_type: string
          metric_value: number
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          metric_type: string
          metric_value: number
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          metric_type?: string
          metric_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_learning_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_learning_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_locations: {
        Row: {
          attributes: Json | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          negative_prompt_keywords: string[] | null
          positive_prompt_keywords: string[] | null
          reference_image_ids: string[] | null
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attributes?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          negative_prompt_keywords?: string[] | null
          positive_prompt_keywords?: string[] | null
          reference_image_ids?: string[] | null
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attributes?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          negative_prompt_keywords?: string[] | null
          positive_prompt_keywords?: string[] | null
          reference_image_ids?: string[] | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_locations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_locations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_master_session: {
        Row: {
          accumulated_knowledge: Json | null
          active_domain_ids: string[] | null
          avg_response_time_ms: number | null
          conversation_history: Json | null
          created_at: string | null
          current_context: Json | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          last_activity_at: string | null
          session_feedback: string | null
          session_goals: string[] | null
          session_name: string | null
          session_rating: number | null
          session_type: string | null
          started_at: string | null
          total_queries: number | null
          total_tokens_used: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accumulated_knowledge?: Json | null
          active_domain_ids?: string[] | null
          avg_response_time_ms?: number | null
          conversation_history?: Json | null
          created_at?: string | null
          current_context?: Json | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          session_feedback?: string | null
          session_goals?: string[] | null
          session_name?: string | null
          session_rating?: number | null
          session_type?: string | null
          started_at?: string | null
          total_queries?: number | null
          total_tokens_used?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accumulated_knowledge?: Json | null
          active_domain_ids?: string[] | null
          avg_response_time_ms?: number | null
          conversation_history?: Json | null
          created_at?: string | null
          current_context?: Json | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          session_feedback?: string | null
          session_goals?: string[] | null
          session_name?: string | null
          session_rating?: number | null
          session_type?: string | null
          started_at?: string | null
          total_queries?: number | null
          total_tokens_used?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_master_session_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_master_session_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_memory: {
        Row: {
          access_count: number | null
          content: string
          created_at: string | null
          decay_rate: number | null
          id: string
          importance_score: number | null
          last_accessed_at: string | null
          memory_type: string | null
          metadata: Json | null
          related_domain_ids: string[] | null
          related_knowledge_ids: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_count?: number | null
          content: string
          created_at?: string | null
          decay_rate?: number | null
          id?: string
          importance_score?: number | null
          last_accessed_at?: string | null
          memory_type?: string | null
          metadata?: Json | null
          related_domain_ids?: string[] | null
          related_knowledge_ids?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_count?: number | null
          content?: string
          created_at?: string | null
          decay_rate?: number | null
          id?: string
          importance_score?: number | null
          last_accessed_at?: string | null
          memory_type?: string | null
          metadata?: Json | null
          related_domain_ids?: string[] | null
          related_knowledge_ids?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_memory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_memory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_multi_domain_context: {
        Row: {
          context_embedding: string | null
          context_text: string
          context_type: string | null
          core_logic_ids: string[] | null
          created_at: string | null
          domain_id: string | null
          id: string
          importance_score: number | null
          knowledge_ids: string[] | null
          related_context_ids: string[] | null
          relevance_score: number | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          context_embedding?: string | null
          context_text: string
          context_type?: string | null
          core_logic_ids?: string[] | null
          created_at?: string | null
          domain_id?: string | null
          id?: string
          importance_score?: number | null
          knowledge_ids?: string[] | null
          related_context_ids?: string[] | null
          relevance_score?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          context_embedding?: string | null
          context_text?: string
          context_type?: string | null
          core_logic_ids?: string[] | null
          created_at?: string | null
          domain_id?: string | null
          id?: string
          importance_score?: number | null
          knowledge_ids?: string[] | null
          related_context_ids?: string[] | null
          relevance_score?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_multi_domain_context_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "brain_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_multi_domain_context_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "brain_master_session"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_multi_domain_context_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_multi_domain_context_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_orchestration_state: {
        Row: {
          analysis_results: Json | null
          created_at: string | null
          current_step: string | null
          domain_status: Json | null
          errors: Json | null
          gathered_context: Json | null
          id: string
          session_id: string | null
          step_progress: number | null
          synthesis_data: Json | null
          updated_at: string | null
          user_id: string | null
          warnings: Json | null
        }
        Insert: {
          analysis_results?: Json | null
          created_at?: string | null
          current_step?: string | null
          domain_status?: Json | null
          errors?: Json | null
          gathered_context?: Json | null
          id?: string
          session_id?: string | null
          step_progress?: number | null
          synthesis_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
          warnings?: Json | null
        }
        Update: {
          analysis_results?: Json | null
          created_at?: string | null
          current_step?: string | null
          domain_status?: Json | null
          errors?: Json | null
          gathered_context?: Json | null
          id?: string
          session_id?: string | null
          step_progress?: number | null
          synthesis_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
          warnings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_orchestration_state_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "brain_master_session"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_orchestration_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_orchestration_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_query_history: {
        Row: {
          core_logic_ids: string[] | null
          cost_usd: number | null
          created_at: string | null
          domain_ids: string[] | null
          id: string
          knowledge_ids: string[] | null
          latency_ms: number | null
          query: string
          response: string | null
          tokens_used: number | null
          user_feedback: string | null
          user_id: string | null
          user_rating: number | null
        }
        Insert: {
          core_logic_ids?: string[] | null
          cost_usd?: number | null
          created_at?: string | null
          domain_ids?: string[] | null
          id?: string
          knowledge_ids?: string[] | null
          latency_ms?: number | null
          query: string
          response?: string | null
          tokens_used?: number | null
          user_feedback?: string | null
          user_id?: string | null
          user_rating?: number | null
        }
        Update: {
          core_logic_ids?: string[] | null
          cost_usd?: number | null
          created_at?: string | null
          domain_ids?: string[] | null
          id?: string
          knowledge_ids?: string[] | null
          latency_ms?: number | null
          query?: string
          response?: string | null
          tokens_used?: number | null
          user_feedback?: string | null
          user_id?: string | null
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_query_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_query_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_query_routing: {
        Row: {
          cost_usd: number | null
          created_at: string | null
          domain_scores: Json | null
          id: string
          latency_ms: number | null
          learning_data: Json | null
          query_embedding: string | null
          query_text: string
          results_count: number | null
          results_quality_score: number | null
          routing_confidence: number | null
          routing_strategy: string | null
          selected_domain_ids: string[] | null
          tokens_used: number | null
          user_feedback: string | null
          user_id: string | null
          user_rating: number | null
          was_helpful: boolean | null
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string | null
          domain_scores?: Json | null
          id?: string
          latency_ms?: number | null
          learning_data?: Json | null
          query_embedding?: string | null
          query_text: string
          results_count?: number | null
          results_quality_score?: number | null
          routing_confidence?: number | null
          routing_strategy?: string | null
          selected_domain_ids?: string[] | null
          tokens_used?: number | null
          user_feedback?: string | null
          user_id?: string | null
          user_rating?: number | null
          was_helpful?: boolean | null
        }
        Update: {
          cost_usd?: number | null
          created_at?: string | null
          domain_scores?: Json | null
          id?: string
          latency_ms?: number | null
          learning_data?: Json | null
          query_embedding?: string | null
          query_text?: string
          results_count?: number | null
          results_quality_score?: number | null
          routing_confidence?: number | null
          routing_strategy?: string | null
          selected_domain_ids?: string[] | null
          tokens_used?: number | null
          user_feedback?: string | null
          user_id?: string | null
          user_rating?: number | null
          was_helpful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_query_routing_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_query_routing_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_routing_performance: {
        Row: {
          avg_latency_ms: number | null
          avg_relevance_score: number | null
          avg_results_quality: number | null
          avg_user_rating: number | null
          created_at: string | null
          domain_id: string | null
          id: string
          improvement_trend: number | null
          period_end: string
          period_start: string
          period_type: string | null
          selected_count: number | null
          total_queries: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avg_latency_ms?: number | null
          avg_relevance_score?: number | null
          avg_results_quality?: number | null
          avg_user_rating?: number | null
          created_at?: string | null
          domain_id?: string | null
          id?: string
          improvement_trend?: number | null
          period_end: string
          period_start: string
          period_type?: string | null
          selected_count?: number | null
          total_queries?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avg_latency_ms?: number | null
          avg_relevance_score?: number | null
          avg_results_quality?: number | null
          avg_user_rating?: number | null
          created_at?: string | null
          domain_id?: string | null
          id?: string
          improvement_trend?: number | null
          period_end?: string
          period_start?: string
          period_type?: string | null
          selected_count?: number | null
          total_queries?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_routing_performance_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "brain_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_routing_performance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_routing_performance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_routing_weights: {
        Row: {
          created_at: string | null
          domain_id: string
          failure_count: number | null
          id: string
          last_updated: string | null
          success_count: number | null
          user_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          domain_id: string
          failure_count?: number | null
          id?: string
          last_updated?: string | null
          success_count?: number | null
          user_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          domain_id?: string
          failure_count?: number | null
          id?: string
          last_updated?: string | null
          success_count?: number | null
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_routing_weights_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "brain_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_routing_weights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_routing_weights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_sessions: {
        Row: {
          context: Json | null
          domains_used: string[] | null
          id: string
          last_activity_at: string | null
          message_count: number | null
          session_type: string | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          context?: Json | null
          domains_used?: string[] | null
          id?: string
          last_activity_at?: string | null
          message_count?: number | null
          session_type?: string | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          context?: Json | null
          domains_used?: string[] | null
          id?: string
          last_activity_at?: string | null
          message_count?: number | null
          session_type?: string | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      brain_tasks: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          priority: string | null
          related_domain_id: string | null
          related_session_id: string | null
          source: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          related_domain_id?: string | null
          related_session_id?: string | null
          source?: string | null
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          related_domain_id?: string | null
          related_session_id?: string | null
          source?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_tasks_related_domain_id_fkey"
            columns: ["related_domain_id"]
            isOneToOne: false
            referencedRelation: "brain_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_tasks_related_session_id_fkey"
            columns: ["related_session_id"]
            isOneToOne: false
            referencedRelation: "brain_master_session"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_team_members: {
        Row: {
          joined_at: string | null
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string | null
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          joined_at?: string | null
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "brain_team_workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_team_workspaces: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_team_workspaces_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_team_workspaces_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_user_feedback: {
        Row: {
          comment: string | null
          context: Json | null
          created_at: string | null
          feedback_type: string
          id: string
          query_id: string | null
          rating: number | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          context?: Json | null
          created_at?: string | null
          feedback_type: string
          id?: string
          query_id?: string | null
          rating?: number | null
          user_id: string
        }
        Update: {
          comment?: string | null
          context?: Json | null
          created_at?: string | null
          feedback_type?: string
          id?: string
          query_id?: string | null
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_user_feedback_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "brain_query_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_user_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_user_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_workflows: {
        Row: {
          actions: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          trigger_config: Json | null
          trigger_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_workflows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_workflows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          agent_id: string | null
          alert_type: string
          created_at: string | null
          current_amount: number | null
          id: string
          message: string
          threshold_amount: number | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          agent_id?: string | null
          alert_type: string
          created_at?: string | null
          current_amount?: number | null
          id?: string
          message: string
          threshold_amount?: number | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          agent_id?: string | null
          alert_type?: string
          created_at?: string | null
          current_amount?: number | null
          id?: string
          message?: string
          threshold_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_alerts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      bug_reports: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          error_log_id: string | null
          first_seen_at: string | null
          fix_description: string | null
          fixed_at: string | null
          fixed_by: string | null
          id: string
          last_seen_at: string | null
          occurrence_count: number | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          error_log_id?: string | null
          first_seen_at?: string | null
          fix_description?: string | null
          fixed_at?: string | null
          fixed_by?: string | null
          id?: string
          last_seen_at?: string | null
          occurrence_count?: number | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          error_log_id?: string | null
          first_seen_at?: string | null
          fix_description?: string | null
          fixed_at?: string | null
          fixed_by?: string | null
          id?: string
          last_seen_at?: string | null
          occurrence_count?: number | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bug_reports_error_log_id_fkey"
            columns: ["error_log_id"]
            isOneToOne: false
            referencedRelation: "error_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bug_reports_fixed_by_fkey"
            columns: ["fixed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bug_reports_fixed_by_fkey"
            columns: ["fixed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      business_entities: {
        Row: {
          business_model: string | null
          created_at: string | null
          description: string | null
          founded_date: string | null
          funding_stage: string | null
          id: string
          industries: string[] | null
          legal_name: string | null
          mission: string | null
          monthly_costs: number | null
          monthly_revenue: number | null
          name: string
          revenue_model: string[] | null
          roles: Json | null
          social_links: Json | null
          status: string | null
          target_market: string | null
          team_size: number | null
          type: string
          updated_at: string | null
          user_id: string
          vision: string | null
          website: string | null
        }
        Insert: {
          business_model?: string | null
          created_at?: string | null
          description?: string | null
          founded_date?: string | null
          funding_stage?: string | null
          id?: string
          industries?: string[] | null
          legal_name?: string | null
          mission?: string | null
          monthly_costs?: number | null
          monthly_revenue?: number | null
          name: string
          revenue_model?: string[] | null
          roles?: Json | null
          social_links?: Json | null
          status?: string | null
          target_market?: string | null
          team_size?: number | null
          type: string
          updated_at?: string | null
          user_id?: string
          vision?: string | null
          website?: string | null
        }
        Update: {
          business_model?: string | null
          created_at?: string | null
          description?: string | null
          founded_date?: string | null
          funding_stage?: string | null
          id?: string
          industries?: string[] | null
          legal_name?: string | null
          mission?: string | null
          monthly_costs?: number | null
          monthly_revenue?: number | null
          name?: string
          revenue_model?: string[] | null
          roles?: Json | null
          social_links?: Json | null
          status?: string | null
          target_market?: string | null
          team_size?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
          vision?: string | null
          website?: string | null
        }
        Relationships: []
      }
      campaign_posts: {
        Row: {
          campaign_id: string | null
          clicks: number | null
          comments: number | null
          content: string | null
          created_at: string | null
          engagement: number | null
          error_message: string | null
          id: string
          image_url: string | null
          impressions: number | null
          likes: number | null
          platform: string
          post_id: string | null
          post_url: string | null
          posted_at: string | null
          reach: number | null
          retry_count: number | null
          shares: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicks?: number | null
          comments?: number | null
          content?: string | null
          created_at?: string | null
          engagement?: number | null
          error_message?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          likes?: number | null
          platform: string
          post_id?: string | null
          post_url?: string | null
          posted_at?: string | null
          reach?: number | null
          retry_count?: number | null
          shares?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicks?: number | null
          comments?: number | null
          content?: string | null
          created_at?: string | null
          engagement?: number | null
          error_message?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          likes?: number | null
          platform?: string
          post_id?: string | null
          post_url?: string | null
          posted_at?: string | null
          reach?: number | null
          retry_count?: number | null
          shares?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      carousels: {
        Row: {
          caption: string | null
          created_at: string | null
          facebook_post_id: string | null
          hashtags: Json | null
          id: string
          page_id: string
          published_at: string | null
          slides: Json
          status: string | null
          theme: string | null
          topic: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          facebook_post_id?: string | null
          hashtags?: Json | null
          id: string
          page_id: string
          published_at?: string | null
          slides?: Json
          status?: string | null
          theme?: string | null
          topic: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          facebook_post_id?: string | null
          hashtags?: Json | null
          id?: string
          page_id?: string
          published_at?: string | null
          slides?: Json
          status?: string | null
          theme?: string | null
          topic?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_number: string | null
          course_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          issued_at: string | null
          pdf_url: string | null
          user_id: string
          verification_code: string | null
        }
        Insert: {
          certificate_number?: string | null
          course_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          pdf_url?: string | null
          user_id: string
          verification_code?: string | null
        }
        Update: {
          certificate_number?: string | null
          course_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          pdf_url?: string | null
          user_id?: string
          verification_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_credits: {
        Row: {
          created_at: string | null
          credits_limit: number
          credits_used: number
          date: string
          id: string
          period_start: string | null
          period_type: string | null
          subscription_plan: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_limit?: number
          credits_used?: number
          date?: string
          id?: string
          period_start?: string | null
          period_type?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_limit?: number
          credits_used?: number
          date?: string
          id?: string
          period_start?: string | null
          period_type?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          category: string
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      consultation_bookings: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          preferred_date: string | null
          preferred_time: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      consultation_types: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      consultations: {
        Row: {
          calendar_event_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          consultant_id: string | null
          consultation_date: string
          consultation_type: string | null
          created_at: string | null
          duration_minutes: number | null
          end_time: string
          id: string
          meeting_link: string | null
          notes: string | null
          payment_amount: number | null
          payment_confirmed_at: string | null
          payment_status: string | null
          payment_transaction_id: string | null
          reminder_metadata: Json | null
          reminder_sent: boolean | null
          start_time: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          calendar_event_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          consultant_id?: string | null
          consultation_date: string
          consultation_type?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          end_time: string
          id?: string
          meeting_link?: string | null
          notes?: string | null
          payment_amount?: number | null
          payment_confirmed_at?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          reminder_metadata?: Json | null
          reminder_sent?: boolean | null
          start_time: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          calendar_event_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          consultant_id?: string | null
          consultation_date?: string
          consultation_type?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string
          id?: string
          meeting_link?: string | null
          notes?: string | null
          payment_amount?: number | null
          payment_confirmed_at?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          reminder_metadata?: Json | null
          reminder_sent?: boolean | null
          start_time?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          assigned_to: string | null
          budget: string | null
          company: string | null
          converted_at: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          deal_value: number | null
          email: string
          followed_up_at: string | null
          id: string
          is_archived: boolean | null
          last_contacted_at: string | null
          lead_score: number | null
          lost_at: string | null
          lost_reason: string | null
          message: string
          name: string
          next_follow_up: string | null
          notes: string | null
          phone: string | null
          pipeline_stage: string | null
          priority: string | null
          service: string
          source: string | null
          status: string | null
          subscribe_newsletter: boolean | null
          tags: string[] | null
          updated_at: string | null
          won_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          budget?: string | null
          company?: string | null
          converted_at?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          deal_value?: number | null
          email: string
          followed_up_at?: string | null
          id?: string
          is_archived?: boolean | null
          last_contacted_at?: string | null
          lead_score?: number | null
          lost_at?: string | null
          lost_reason?: string | null
          message: string
          name: string
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          pipeline_stage?: string | null
          priority?: string | null
          service: string
          source?: string | null
          status?: string | null
          subscribe_newsletter?: boolean | null
          tags?: string[] | null
          updated_at?: string | null
          won_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          budget?: string | null
          company?: string | null
          converted_at?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          deal_value?: number | null
          email?: string
          followed_up_at?: string | null
          id?: string
          is_archived?: boolean | null
          last_contacted_at?: string | null
          lead_score?: number | null
          lost_at?: string | null
          lost_reason?: string | null
          message?: string
          name?: string
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          pipeline_stage?: string | null
          priority?: string | null
          service?: string
          source?: string | null
          status?: string | null
          subscribe_newsletter?: boolean | null
          tags?: string[] | null
          updated_at?: string | null
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      content_library: {
        Row: {
          ai_prompt: string | null
          avg_engagement: number | null
          best_platform: string | null
          category: string | null
          content: string
          content_type: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_ai_generated: boolean | null
          last_used_at: string | null
          media_urls: string[] | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          used_count: number | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          ai_prompt?: string | null
          avg_engagement?: number | null
          best_platform?: string | null
          category?: string | null
          content: string
          content_type?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_ai_generated?: boolean | null
          last_used_at?: string | null
          media_urls?: string[] | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          used_count?: number | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          ai_prompt?: string | null
          avg_engagement?: number | null
          best_platform?: string | null
          category?: string | null
          content?: string
          content_type?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_ai_generated?: boolean | null
          last_used_at?: string | null
          media_urls?: string[] | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          used_count?: number | null
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_library_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_library_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      content_performance: {
        Row: {
          ab_test_id: string | null
          clicks: number | null
          comments: number | null
          content_type: string | null
          created_at: string | null
          engagement: number | null
          id: string
          impressions: number | null
          page_id: string
          platform: string
          post_id: string | null
          reach: number | null
          reactions: number | null
          shares: number | null
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          ab_test_id?: string | null
          clicks?: number | null
          comments?: number | null
          content_type?: string | null
          created_at?: string | null
          engagement?: number | null
          id?: string
          impressions?: number | null
          page_id: string
          platform: string
          post_id?: string | null
          reach?: number | null
          reactions?: number | null
          shares?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          ab_test_id?: string | null
          clicks?: number | null
          comments?: number | null
          content_type?: string | null
          created_at?: string | null
          engagement?: number | null
          id?: string
          impressions?: number | null
          page_id?: string
          platform?: string
          post_id?: string | null
          reach?: number | null
          reactions?: number | null
          shares?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: []
      }
      content_queue: {
        Row: {
          agent_id: string | null
          content: Json
          content_type: string
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          platform: string | null
          priority: number | null
          project_id: string | null
          published_at: string | null
          retry_count: number | null
          scheduled_for: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          content?: Json
          content_type: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          platform?: string | null
          priority?: number | null
          project_id?: string | null
          published_at?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          content?: Json
          content_type?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          platform?: string | null
          priority?: number | null
          project_id?: string | null
          published_at?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_queue_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assistant_type: string
          created_at: string | null
          id: string
          messages: Json | null
          metadata: Json | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assistant_type: string
          created_at?: string | null
          id?: string
          messages?: Json | null
          metadata?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assistant_type?: string
          created_at?: string | null
          id?: string
          messages?: Json | null
          metadata?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      copilot_feedback: {
        Row: {
          ai_response: string | null
          comment: string | null
          context: Json | null
          corrected_response: string | null
          created_at: string | null
          execution_time: number | null
          feedback_text: string | null
          feedback_type: string | null
          id: string
          interaction_type: string | null
          layers_used: Json | null
          metadata: Json | null
          original_message: string | null
          rating: number | null
          reference_id: string | null
          reference_type: string | null
          request_id: string | null
          response_type: string | null
          success: boolean | null
          user_id: string | null
          user_message: string | null
          user_rating: number | null
        }
        Insert: {
          ai_response?: string | null
          comment?: string | null
          context?: Json | null
          corrected_response?: string | null
          created_at?: string | null
          execution_time?: number | null
          feedback_text?: string | null
          feedback_type?: string | null
          id?: string
          interaction_type?: string | null
          layers_used?: Json | null
          metadata?: Json | null
          original_message?: string | null
          rating?: number | null
          reference_id?: string | null
          reference_type?: string | null
          request_id?: string | null
          response_type?: string | null
          success?: boolean | null
          user_id?: string | null
          user_message?: string | null
          user_rating?: number | null
        }
        Update: {
          ai_response?: string | null
          comment?: string | null
          context?: Json | null
          corrected_response?: string | null
          created_at?: string | null
          execution_time?: number | null
          feedback_text?: string | null
          feedback_type?: string | null
          id?: string
          interaction_type?: string | null
          layers_used?: Json | null
          metadata?: Json | null
          original_message?: string | null
          rating?: number | null
          reference_id?: string | null
          reference_type?: string | null
          request_id?: string | null
          response_type?: string | null
          success?: boolean | null
          user_id?: string | null
          user_message?: string | null
          user_rating?: number | null
        }
        Relationships: []
      }
      cost_analytics: {
        Row: {
          agent_id: string | null
          avg_cost_per_request: number | null
          avg_tokens_per_request: number | null
          created_at: string | null
          date: string
          id: string
          models_used: Json | null
          total_cost: number | null
          total_requests: number | null
          total_tokens: number | null
        }
        Insert: {
          agent_id?: string | null
          avg_cost_per_request?: number | null
          avg_tokens_per_request?: number | null
          created_at?: string | null
          date: string
          id?: string
          models_used?: Json | null
          total_cost?: number | null
          total_requests?: number | null
          total_tokens?: number | null
        }
        Update: {
          agent_id?: string | null
          avg_cost_per_request?: number | null
          avg_tokens_per_request?: number | null
          created_at?: string | null
          date?: string
          id?: string
          models_used?: Json | null
          total_cost?: number | null
          total_requests?: number | null
          total_tokens?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_analytics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_codes: {
        Row: {
          applicable_courses: string[] | null
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          discount_type: string | null
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_purchase_amount: number | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_courses?: string[] | null
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          discount_type?: string | null
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_courses?: string[] | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          discount_applied: number
          id: string
          order_id: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          discount_applied: number
          id?: string
          order_id?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          discount_applied?: number
          id?: string
          order_id?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupon_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      course_announcements: {
        Row: {
          announcement_type: string | null
          content: string
          course_id: string
          created_at: string | null
          created_by: string | null
          id: string
          is_pinned: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          announcement_type?: string | null
          content: string
          course_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_pinned?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          announcement_type?: string | null
          content?: string
          course_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_pinned?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_assignments: {
        Row: {
          allow_late_submission: boolean | null
          assignment_type: string | null
          course_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string
          id: string
          instructions: string | null
          late_penalty_percent: number | null
          max_score: number | null
          rubric: Json | null
          section_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          allow_late_submission?: boolean | null
          assignment_type?: string | null
          course_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date: string
          id?: string
          instructions?: string | null
          late_penalty_percent?: number | null
          max_score?: number | null
          rubric?: Json | null
          section_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          allow_late_submission?: boolean | null
          assignment_type?: string | null
          course_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string
          id?: string
          instructions?: string | null
          late_penalty_percent?: number | null
          max_score?: number | null
          rubric?: Json | null
          section_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_assignments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      course_certificates: {
        Row: {
          certificate_number: string | null
          certificate_url: string | null
          course_id: string
          created_at: string | null
          enrollment_id: string | null
          expires_at: string | null
          id: string
          is_revoked: boolean | null
          issued_at: string
          revoke_reason: string | null
          revoked_at: string | null
          updated_at: string | null
          user_id: string
          verification_code: string | null
        }
        Insert: {
          certificate_number?: string | null
          certificate_url?: string | null
          course_id: string
          created_at?: string | null
          enrollment_id?: string | null
          expires_at?: string | null
          id?: string
          is_revoked?: boolean | null
          issued_at?: string
          revoke_reason?: string | null
          revoked_at?: string | null
          updated_at?: string | null
          user_id: string
          verification_code?: string | null
        }
        Update: {
          certificate_number?: string | null
          certificate_url?: string | null
          course_id?: string
          created_at?: string | null
          enrollment_id?: string | null
          expires_at?: string | null
          id?: string
          is_revoked?: boolean | null
          issued_at?: string
          revoke_reason?: string | null
          revoked_at?: string | null
          updated_at?: string | null
          user_id?: string
          verification_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      course_discussions: {
        Row: {
          content: string
          course_id: string | null
          created_at: string | null
          id: string
          is_resolved: boolean | null
          lesson_id: string | null
          replies_count: number | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          lesson_id?: string | null
          replies_count?: number | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          lesson_id?: string | null
          replies_count?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_discussions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_discussions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_discussions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_discussions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          certificate_issued: boolean | null
          certificate_url: string | null
          completed_at: string | null
          course_id: string | null
          enrolled_at: string | null
          id: string
          last_accessed_at: string | null
          last_accessed_lesson_id: string | null
          progress_percentage: number | null
          user_id: string | null
        }
        Insert: {
          certificate_issued?: boolean | null
          certificate_url?: string | null
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          last_accessed_lesson_id?: string | null
          progress_percentage?: number | null
          user_id?: string | null
        }
        Update: {
          certificate_issued?: boolean | null
          certificate_url?: string | null
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          last_accessed_lesson_id?: string | null
          progress_percentage?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_last_accessed_lesson_id_fkey"
            columns: ["last_accessed_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      course_quizzes: {
        Row: {
          allow_review: boolean | null
          course_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          max_attempts: number | null
          passing_score: number | null
          quiz_type: string | null
          randomize_answers: boolean | null
          randomize_questions: boolean | null
          section_id: string | null
          show_correct_answers: boolean | null
          time_limit_minutes: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          allow_review?: boolean | null
          course_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          max_attempts?: number | null
          passing_score?: number | null
          quiz_type?: string | null
          randomize_answers?: boolean | null
          randomize_questions?: boolean | null
          section_id?: string | null
          show_correct_answers?: boolean | null
          time_limit_minutes?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          allow_review?: boolean | null
          course_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          max_attempts?: number | null
          passing_score?: number | null
          quiz_type?: string | null
          randomize_answers?: boolean | null
          randomize_questions?: boolean | null
          section_id?: string | null
          show_correct_answers?: boolean | null
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_quizzes_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      course_resources: {
        Row: {
          course_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          download_count: number | null
          file_size_kb: number | null
          id: string
          is_required: boolean | null
          order_index: number | null
          resource_type: string | null
          resource_url: string
          section_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          file_size_kb?: number | null
          id?: string
          is_required?: boolean | null
          order_index?: number | null
          resource_type?: string | null
          resource_url: string
          section_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          file_size_kb?: number | null
          id?: string
          is_required?: boolean | null
          order_index?: number | null
          resource_type?: string | null
          resource_url?: string
          section_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_resources_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          comment: string | null
          course_id: string | null
          created_at: string | null
          enrollment_id: string | null
          helpful_count: number | null
          id: string
          rating: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          course_id?: string | null
          created_at?: string | null
          enrollment_id?: string | null
          helpful_count?: number | null
          id?: string
          rating: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          course_id?: string | null
          created_at?: string | null
          enrollment_id?: string | null
          helpful_count?: number | null
          id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_reviews_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sections: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          order_index: number
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_index: number
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_syllabus: {
        Row: {
          course_id: string
          course_materials: string[] | null
          course_schedule: Json | null
          created_at: string | null
          grading_policy: Json | null
          id: string
          instructor_notes: string | null
          learning_objectives: string[] | null
          prerequisites: string[] | null
          updated_at: string | null
        }
        Insert: {
          course_id: string
          course_materials?: string[] | null
          course_schedule?: Json | null
          created_at?: string | null
          grading_policy?: Json | null
          id?: string
          instructor_notes?: string | null
          learning_objectives?: string[] | null
          prerequisites?: string[] | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          course_materials?: string[] | null
          course_schedule?: Json | null
          created_at?: string | null
          grading_policy?: Json | null
          id?: string
          instructor_notes?: string | null
          learning_objectives?: string[] | null
          prerequisites?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_syllabus_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: true
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_waitlist: {
        Row: {
          course_id: string
          created_at: string | null
          email: string
          id: string
          notified: boolean | null
          notified_at: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          email: string
          id?: string
          notified?: boolean | null
          notified_at?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          email?: string
          id?: string
          notified?: boolean | null
          notified_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_waitlist_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          average_rating: number | null
          category: string
          created_at: string | null
          description: string | null
          duration_hours: number | null
          features: string[] | null
          id: string
          instructor_id: string | null
          is_free: boolean | null
          is_published: boolean | null
          language: string | null
          last_updated: string | null
          level: string
          original_price: number | null
          price: number | null
          requirements: string[] | null
          subtitle: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          total_lessons: number | null
          total_reviews: number | null
          total_students: number | null
          updated_at: string | null
          what_you_learn: string[] | null
        }
        Insert: {
          average_rating?: number | null
          category: string
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          features?: string[] | null
          id?: string
          instructor_id?: string | null
          is_free?: boolean | null
          is_published?: boolean | null
          language?: string | null
          last_updated?: string | null
          level: string
          original_price?: number | null
          price?: number | null
          requirements?: string[] | null
          subtitle?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          total_lessons?: number | null
          total_reviews?: number | null
          total_students?: number | null
          updated_at?: string | null
          what_you_learn?: string[] | null
        }
        Update: {
          average_rating?: number | null
          category?: string
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          features?: string[] | null
          id?: string
          instructor_id?: string | null
          is_free?: boolean | null
          is_published?: boolean | null
          language?: string | null
          last_updated?: string | null
          level?: string
          original_price?: number | null
          price?: number | null
          requirements?: string[] | null
          subtitle?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          total_lessons?: number | null
          total_reviews?: number | null
          total_students?: number | null
          updated_at?: string | null
          what_you_learn?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      credentials: {
        Row: {
          access_count: number | null
          category: string
          created_at: string | null
          encrypted_api_key: string | null
          encrypted_password: string | null
          id: string
          is_favorite: boolean | null
          last_accessed_at: string | null
          name: string
          notes: string | null
          tags: string[] | null
          updated_at: string | null
          url: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          access_count?: number | null
          category: string
          created_at?: string | null
          encrypted_api_key?: string | null
          encrypted_password?: string | null
          id?: string
          is_favorite?: boolean | null
          last_accessed_at?: string | null
          name: string
          notes?: string | null
          tags?: string[] | null
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          access_count?: number | null
          category?: string
          created_at?: string | null
          encrypted_api_key?: string | null
          encrypted_password?: string | null
          id?: string
          is_favorite?: boolean | null
          last_accessed_at?: string | null
          name?: string
          notes?: string | null
          tags?: string[] | null
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      credentials_vault: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          credential_preview: string | null
          credential_type: string
          credential_value: string
          dashboard_url: string | null
          description: string | null
          docs_url: string | null
          environment: string | null
          expires_at: string | null
          id: string
          last_rotated_at: string | null
          last_used_at: string | null
          name: string
          notes: string | null
          project_id: string | null
          provider: string | null
          rotation_reminder_days: number | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          credential_preview?: string | null
          credential_type: string
          credential_value: string
          dashboard_url?: string | null
          description?: string | null
          docs_url?: string | null
          environment?: string | null
          expires_at?: string | null
          id?: string
          last_rotated_at?: string | null
          last_used_at?: string | null
          name: string
          notes?: string | null
          project_id?: string | null
          provider?: string | null
          rotation_reminder_days?: number | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          credential_preview?: string | null
          credential_type?: string
          credential_value?: string
          dashboard_url?: string | null
          description?: string | null
          docs_url?: string | null
          environment?: string | null
          expires_at?: string | null
          id?: string
          last_rotated_at?: string | null
          last_used_at?: string | null
          name?: string
          notes?: string | null
          project_id?: string | null
          provider?: string | null
          rotation_reminder_days?: number | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credentials_vault_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credentials_vault_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credentials_vault_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cross_platform_posts: {
        Row: {
          created_at: string | null
          id: string
          original_content: string
          page_id: string
          platforms: Json
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          original_content: string
          page_id: string
          platforms?: Json
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          original_content?: string
          page_id?: string
          platforms?: Json
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      decision_queue: {
        Row: {
          agent_id: string | null
          attachments: Json | null
          created_at: string | null
          deadline: string | null
          decided_at: string | null
          decision_type: string
          description: string | null
          details: Json | null
          id: string
          impact: string | null
          recommendation: string | null
          recommendation_reason: string | null
          status: string | null
          task_id: string | null
          title: string
          updated_at: string | null
          urgency: string | null
          user_feedback: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          attachments?: Json | null
          created_at?: string | null
          deadline?: string | null
          decided_at?: string | null
          decision_type: string
          description?: string | null
          details?: Json | null
          id?: string
          impact?: string | null
          recommendation?: string | null
          recommendation_reason?: string | null
          status?: string | null
          task_id?: string | null
          title: string
          updated_at?: string | null
          urgency?: string | null
          user_feedback?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          attachments?: Json | null
          created_at?: string | null
          deadline?: string | null
          decided_at?: string | null
          decision_type?: string
          description?: string | null
          details?: Json | null
          id?: string
          impact?: string | null
          recommendation?: string | null
          recommendation_reason?: string | null
          status?: string | null
          task_id?: string | null
          title?: string
          updated_at?: string | null
          urgency?: string | null
          user_feedback?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decision_queue_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decision_queue_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "agent_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_code_usages: {
        Row: {
          discount_amount: number
          discount_code_id: string | null
          final_amount: number
          id: string
          original_amount: number
          subscription_id: string | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          discount_amount: number
          discount_code_id?: string | null
          final_amount: number
          id?: string
          original_amount: number
          subscription_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          discount_amount?: number
          discount_code_id?: string | null
          final_amount?: number
          id?: string
          original_amount?: number
          subscription_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_code_usages_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_code_usages_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_code_usages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_code_usages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          applicable_cycles: string[] | null
          applicable_plans: string[] | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: string | null
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_amount: number | null
          updated_at: string | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_cycles?: string[] | null
          applicable_plans?: string[] | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_amount?: number | null
          updated_at?: string | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_cycles?: string[] | null
          applicable_plans?: string[] | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_amount?: number | null
          updated_at?: string | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_replies: {
        Row: {
          content: string
          created_at: string | null
          discussion_id: string | null
          id: string
          is_instructor_reply: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          discussion_id?: string | null
          id?: string
          is_instructor_reply?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          discussion_id?: string | null
          id?: string
          is_instructor_reply?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "course_discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
          source_id: string | null
          source_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          source_id?: string | null
          source_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          source_id?: string | null
          source_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          bounced_count: number | null
          campaign_id: string | null
          clicked_count: number | null
          content: string
          created_at: string | null
          delivered_count: number | null
          id: string
          mautic_campaign_id: string | null
          opened_count: number | null
          recipient_list_id: string | null
          recipient_type: string | null
          recipients_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string | null
          subject: string
          template_id: string | null
          unsubscribed_count: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bounced_count?: number | null
          campaign_id?: string | null
          clicked_count?: number | null
          content: string
          created_at?: string | null
          delivered_count?: number | null
          id?: string
          mautic_campaign_id?: string | null
          opened_count?: number | null
          recipient_list_id?: string | null
          recipient_type?: string | null
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          subject: string
          template_id?: string | null
          unsubscribed_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bounced_count?: number | null
          campaign_id?: string | null
          clicked_count?: number | null
          content?: string
          created_at?: string | null
          delivered_count?: number | null
          id?: string
          mautic_campaign_id?: string | null
          opened_count?: number | null
          recipient_list_id?: string | null
          recipient_type?: string | null
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          subject?: string
          template_id?: string | null
          unsubscribed_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string | null
          email_queue_id: string | null
          error_message: string | null
          id: string
          provider: string | null
          provider_message_id: string | null
          sent_at: string | null
          status: string
          subject: string
          template_type: string | null
          to_email: string
        }
        Insert: {
          created_at?: string | null
          email_queue_id?: string | null
          error_message?: string | null
          id?: string
          provider?: string | null
          provider_message_id?: string | null
          sent_at?: string | null
          status: string
          subject: string
          template_type?: string | null
          to_email: string
        }
        Update: {
          created_at?: string | null
          email_queue_id?: string | null
          error_message?: string | null
          id?: string
          provider?: string | null
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_type?: string | null
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_email_queue_id_fkey"
            columns: ["email_queue_id"]
            isOneToOne: false
            referencedRelation: "email_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          max_retries: number | null
          retry_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          subject: string
          template_id: string | null
          to_email: string
          to_name: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          max_retries?: number | null
          retry_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
          to_email: string
          to_name?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          max_retries?: number | null
          retry_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
          to_email?: string
          to_name?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_type: string | null
          updated_at: string | null
          usage_count: number | null
          variables: string[] | null
        }
        Insert: {
          body: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_type?: string | null
          updated_at?: string | null
          usage_count?: number | null
          variables?: string[] | null
        }
        Update: {
          body?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_type?: string | null
          updated_at?: string | null
          usage_count?: number | null
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string | null
          created_at: string | null
          enrolled_at: string | null
          expires_at: string | null
          id: string
          progress_percent: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          enrolled_at?: string | null
          expires_at?: string | null
          id?: string
          progress_percent?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          enrolled_at?: string | null
          expires_at?: string | null
          id?: string
          progress_percent?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          context: Json | null
          created_at: string | null
          error_message: string
          error_stack: string | null
          error_type: string
          id: string
          page_url: string | null
          project_name: string | null
          sentry_event_id: string | null
          session_id: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          error_message: string
          error_stack?: string | null
          error_type: string
          id?: string
          page_url?: string | null
          project_name?: string | null
          sentry_event_id?: string | null
          session_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          error_message?: string
          error_stack?: string | null
          error_type?: string
          id?: string
          page_url?: string | null
          project_name?: string | null
          sentry_event_id?: string | null
          session_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "error_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      error_metrics: {
        Row: {
          ai_fixes_applied: number | null
          auto_resolved: number | null
          created_at: string | null
          critical_errors: number | null
          granularity: string
          high_errors: number | null
          id: string
          low_errors: number | null
          manual_resolved: number | null
          medium_errors: number | null
          mtbf_seconds: number | null
          mttr_seconds: number | null
          period_end: string
          period_start: string
          total_errors: number | null
          uptime_percentage: number | null
        }
        Insert: {
          ai_fixes_applied?: number | null
          auto_resolved?: number | null
          created_at?: string | null
          critical_errors?: number | null
          granularity: string
          high_errors?: number | null
          id?: string
          low_errors?: number | null
          manual_resolved?: number | null
          medium_errors?: number | null
          mtbf_seconds?: number | null
          mttr_seconds?: number | null
          period_end: string
          period_start: string
          total_errors?: number | null
          uptime_percentage?: number | null
        }
        Update: {
          ai_fixes_applied?: number | null
          auto_resolved?: number | null
          created_at?: string | null
          critical_errors?: number | null
          granularity?: string
          high_errors?: number | null
          id?: string
          low_errors?: number | null
          manual_resolved?: number | null
          medium_errors?: number | null
          mtbf_seconds?: number | null
          mttr_seconds?: number | null
          period_end?: string
          period_start?: string
          total_errors?: number | null
          uptime_percentage?: number | null
        }
        Relationships: []
      }
      error_patterns: {
        Row: {
          category: string | null
          created_at: string | null
          error_type: string | null
          first_seen_at: string | null
          id: string
          is_resolved: boolean | null
          last_seen_at: string | null
          occurrence_count: number | null
          pattern_name: string
          pattern_signature: string
          suggested_fix: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          error_type?: string | null
          first_seen_at?: string | null
          id?: string
          is_resolved?: boolean | null
          last_seen_at?: string | null
          occurrence_count?: number | null
          pattern_name: string
          pattern_signature: string
          suggested_fix?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          error_type?: string | null
          first_seen_at?: string | null
          id?: string
          is_resolved?: boolean | null
          last_seen_at?: string | null
          occurrence_count?: number | null
          pattern_name?: string
          pattern_signature?: string
          suggested_fix?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      error_resolutions: {
        Row: {
          created_at: string | null
          error_fingerprint: string
          error_id: string | null
          id: string
          occurred_at: string
          resolution_details: Json | null
          resolution_method: string | null
          resolved_at: string | null
          time_to_resolve_seconds: number | null
        }
        Insert: {
          created_at?: string | null
          error_fingerprint: string
          error_id?: string | null
          id?: string
          occurred_at: string
          resolution_details?: Json | null
          resolution_method?: string | null
          resolved_at?: string | null
          time_to_resolve_seconds?: number | null
        }
        Update: {
          created_at?: string | null
          error_fingerprint?: string
          error_id?: string | null
          id?: string
          occurred_at?: string
          resolution_details?: Json | null
          resolution_method?: string | null
          resolved_at?: string | null
          time_to_resolve_seconds?: number | null
        }
        Relationships: []
      }
      execution_history: {
        Row: {
          command: string
          created_at: string | null
          duration: number | null
          error: string | null
          id: string
          metadata: Json | null
          status: string | null
          steps: Json | null
          user_id: string | null
        }
        Insert: {
          command: string
          created_at?: string | null
          duration?: number | null
          error?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          steps?: Json | null
          user_id?: string | null
        }
        Update: {
          command?: string
          created_at?: string | null
          duration?: number | null
          error?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          steps?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          enterprise_plan: boolean | null
          feature_key: string
          feature_name: string
          free_plan: boolean | null
          id: string
          is_active: boolean | null
          pro_plan: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enterprise_plan?: boolean | null
          feature_key: string
          feature_name: string
          free_plan?: boolean | null
          id?: string
          is_active?: boolean | null
          pro_plan?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enterprise_plan?: boolean | null
          feature_key?: string
          feature_name?: string
          free_plan?: boolean | null
          id?: string
          is_active?: boolean | null
          pro_plan?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      feature_usage: {
        Row: {
          created_at: string | null
          feature_key: string
          id: string
          metadata: Json | null
          usage_count: number | null
          usage_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feature_key: string
          id?: string
          metadata?: Json | null
          usage_count?: number | null
          usage_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feature_key?: string
          id?: string
          metadata?: Json | null
          usage_count?: number | null
          usage_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_overview: {
        Row: {
          assets: Json | null
          created_at: string | null
          expense_categories: Json | null
          id: string
          liabilities: Json | null
          net_income: number | null
          notes: string | null
          period_end: string
          period_start: string
          period_type: string
          revenue_streams: Json | null
          savings_actual: number | null
          savings_goal: number | null
          total_expenses: number | null
          total_revenue: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assets?: Json | null
          created_at?: string | null
          expense_categories?: Json | null
          id?: string
          liabilities?: Json | null
          net_income?: number | null
          notes?: string | null
          period_end: string
          period_start: string
          period_type: string
          revenue_streams?: Json | null
          savings_actual?: number | null
          savings_goal?: number | null
          total_expenses?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          assets?: Json | null
          created_at?: string | null
          expense_categories?: Json | null
          id?: string
          liabilities?: Json | null
          net_income?: number | null
          notes?: string | null
          period_end?: string
          period_start?: string
          period_type?: string
          revenue_streams?: Json | null
          savings_actual?: number | null
          savings_goal?: number | null
          total_expenses?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_summaries: {
        Row: {
          content: string
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_analytics: {
        Row: {
          conversion_rate: number | null
          created_at: string | null
          date: string
          funnel_name: string
          id: string
          product_name: string
          step_name: string
          step_number: number
          users_completed: number | null
          users_entered: number | null
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string | null
          date: string
          funnel_name: string
          id?: string
          product_name: string
          step_name: string
          step_number: number
          users_completed?: number | null
          users_entered?: number | null
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string | null
          date?: string
          funnel_name?: string
          id?: string
          product_name?: string
          step_name?: string
          step_number?: number
          users_completed?: number | null
          users_entered?: number | null
        }
        Relationships: []
      }
      goals_roadmap: {
        Row: {
          business_entity_id: string | null
          completed_date: string | null
          created_at: string | null
          current_value: number | null
          description: string | null
          id: string
          parent_goal_id: string | null
          priority: number | null
          progress_percent: number | null
          project_id: string | null
          start_date: string | null
          status: string | null
          target_date: string | null
          target_metric: string | null
          target_value: number | null
          timeframe: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_entity_id?: string | null
          completed_date?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          id?: string
          parent_goal_id?: string | null
          priority?: number | null
          progress_percent?: number | null
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          target_date?: string | null
          target_metric?: string | null
          target_value?: number | null
          timeframe?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          business_entity_id?: string | null
          completed_date?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          id?: string
          parent_goal_id?: string | null
          priority?: number | null
          progress_percent?: number | null
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          target_date?: string | null
          target_metric?: string | null
          target_value?: number | null
          timeframe?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_roadmap_business_entity_id_fkey"
            columns: ["business_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_roadmap_parent_goal_id_fkey"
            columns: ["parent_goal_id"]
            isOneToOne: false
            referencedRelation: "goals_roadmap"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_roadmap_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      google_reports: {
        Row: {
          created_at: string | null
          date_range_end: string
          date_range_start: string
          id: string
          metrics: Json | null
          report_title: string
          report_type: string
          sheet_name: string | null
          spreadsheet_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_range_end: string
          date_range_start: string
          id?: string
          metrics?: Json | null
          report_title: string
          report_type: string
          sheet_name?: string | null
          spreadsheet_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_range_end?: string
          date_range_start?: string
          id?: string
          metrics?: Json | null
          report_title?: string
          report_type?: string
          sheet_name?: string | null
          spreadsheet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      google_services_config: {
        Row: {
          analytics_enabled: boolean | null
          analytics_property_id: string | null
          created_at: string | null
          daily_sync_enabled: boolean | null
          email_reports: boolean | null
          id: string
          report_recipients: string[] | null
          reporting_spreadsheet_id: string | null
          search_console_enabled: boolean | null
          sheets_auto_sync: boolean | null
          sync_time: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analytics_enabled?: boolean | null
          analytics_property_id?: string | null
          created_at?: string | null
          daily_sync_enabled?: boolean | null
          email_reports?: boolean | null
          id?: string
          report_recipients?: string[] | null
          reporting_spreadsheet_id?: string | null
          search_console_enabled?: boolean | null
          sheets_auto_sync?: boolean | null
          sync_time?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analytics_enabled?: boolean | null
          analytics_property_id?: string | null
          created_at?: string | null
          daily_sync_enabled?: boolean | null
          email_reports?: boolean | null
          id?: string
          report_recipients?: string[] | null
          reporting_spreadsheet_id?: string | null
          search_console_enabled?: boolean | null
          sheets_auto_sync?: boolean | null
          sync_time?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_services_config_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_services_config_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      google_sync_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          records_synced: number | null
          service: string
          started_at: string
          status: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          records_synced?: number | null
          service: string
          started_at: string
          status: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          records_synced?: number | null
          service?: string
          started_at?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_sync_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_sync_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      healing_actions: {
        Row: {
          action_result: string | null
          action_type: string
          created_at: string | null
          details: Json | null
          error_log_id: string | null
          execution_time_ms: number | null
          id: string
          retry_count: number | null
        }
        Insert: {
          action_result?: string | null
          action_type: string
          created_at?: string | null
          details?: Json | null
          error_log_id?: string | null
          execution_time_ms?: number | null
          id?: string
          retry_count?: number | null
        }
        Update: {
          action_result?: string | null
          action_type?: string
          created_at?: string | null
          details?: Json | null
          error_log_id?: string | null
          execution_time_ms?: number | null
          id?: string
          retry_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "healing_actions_error_log_id_fkey"
            columns: ["error_log_id"]
            isOneToOne: false
            referencedRelation: "error_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          idea_id: string
          parent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          idea_id: string
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          idea_id?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_comments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "user_ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "idea_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      inbound_emails: {
        Row: {
          body_html: string | null
          body_text: string | null
          from_email: string
          id: string
          processed: boolean | null
          processing_error: string | null
          raw_email: Json | null
          received_at: string | null
          subject: string | null
          ticket_id: string | null
          to_email: string
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          from_email: string
          id?: string
          processed?: boolean | null
          processing_error?: string | null
          raw_email?: Json | null
          received_at?: string | null
          subject?: string | null
          ticket_id?: string | null
          to_email: string
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          from_email?: string
          id?: string
          processed?: boolean | null
          processing_error?: string | null
          raw_email?: Json | null
          received_at?: string | null
          subject?: string | null
          ticket_id?: string | null
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "inbound_emails_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_earnings: {
        Row: {
          course_id: string
          earned_at: string | null
          gross_amount: number
          id: string
          instructor_id: string
          net_amount: number
          order_id: string
          platform_fee: number
          status: string | null
        }
        Insert: {
          course_id: string
          earned_at?: string | null
          gross_amount: number
          id?: string
          instructor_id: string
          net_amount: number
          order_id: string
          platform_fee: number
          status?: string | null
        }
        Update: {
          course_id?: string
          earned_at?: string | null
          gross_amount?: number
          id?: string
          instructor_id?: string
          net_amount?: number
          order_id?: string
          platform_fee?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instructor_earnings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instructor_earnings_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instructor_earnings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_payouts: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          instructor_id: string
          notes: string | null
          payment_details: Json | null
          payment_method: string
          processed_at: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          instructor_id: string
          notes?: string | null
          payment_details?: Json | null
          payment_method: string
          processed_at?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          instructor_id?: string
          notes?: string | null
          payment_details?: Json | null
          payment_method?: string
          processed_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instructor_payouts_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      instructors: {
        Row: {
          avatar_url: string | null
          average_rating: number | null
          bio: string | null
          created_at: string | null
          id: string
          name: string
          title: string | null
          total_courses: number | null
          total_students: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          created_at?: string | null
          id?: string
          name: string
          title?: string | null
          total_courses?: number | null
          total_students?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          created_at?: string | null
          id?: string
          name?: string
          title?: string | null
          total_courses?: number | null
          total_students?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instructors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instructors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligent_alerts: {
        Row: {
          auto_resolve: boolean | null
          detected_at: string | null
          id: string
          message: string
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          suggested_workflow_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          auto_resolve?: boolean | null
          detected_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          suggested_workflow_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          auto_resolve?: boolean | null
          detected_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          suggested_workflow_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      investment_applications: {
        Row: {
          address: string
          admin_notes: string | null
          agree_privacy: boolean
          agree_risk: boolean
          agree_terms: boolean
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          identity_document: string
          investment_amount: number
          investment_experience: string
          investment_purpose: string
          investor_type: string
          phone: string
          project_id: number
          project_name: string
          project_slug: string
          reviewed_at: string | null
          reviewed_by: string | null
          risk_tolerance: string
          status: string
          updated_at: string | null
        }
        Insert: {
          address: string
          admin_notes?: string | null
          agree_privacy?: boolean
          agree_risk?: boolean
          agree_terms?: boolean
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          identity_document: string
          investment_amount: number
          investment_experience: string
          investment_purpose: string
          investor_type: string
          phone: string
          project_id: number
          project_name: string
          project_slug: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_tolerance: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          admin_notes?: string | null
          agree_privacy?: boolean
          agree_risk?: boolean
          agree_terms?: boolean
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          identity_document?: string
          investment_amount?: number
          investment_experience?: string
          investment_purpose?: string
          investor_type?: string
          phone?: string
          project_id?: number
          project_name?: string
          project_slug?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_tolerance?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          access_count: number | null
          business_entity_id: string | null
          category: string
          content: string
          context_prefix: string | null
          created_at: string | null
          embedding: string | null
          expires_at: string | null
          id: string
          importance: number | null
          is_active: boolean | null
          is_public: boolean | null
          last_accessed: string | null
          metadata: Json | null
          previous_version_id: string | null
          project_id: string | null
          search_vector: unknown
          source: string | null
          source_file: string | null
          source_url: string | null
          subcategory: string | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          access_count?: number | null
          business_entity_id?: string | null
          category: string
          content: string
          context_prefix?: string | null
          created_at?: string | null
          embedding?: string | null
          expires_at?: string | null
          id?: string
          importance?: number | null
          is_active?: boolean | null
          is_public?: boolean | null
          last_accessed?: string | null
          metadata?: Json | null
          previous_version_id?: string | null
          project_id?: string | null
          search_vector?: unknown
          source?: string | null
          source_file?: string | null
          source_url?: string | null
          subcategory?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string
          version?: number | null
        }
        Update: {
          access_count?: number | null
          business_entity_id?: string | null
          category?: string
          content?: string
          context_prefix?: string | null
          created_at?: string | null
          embedding?: string | null
          expires_at?: string | null
          id?: string
          importance?: number | null
          is_active?: boolean | null
          is_public?: boolean | null
          last_accessed?: string | null
          metadata?: Json | null
          previous_version_id?: string | null
          project_id?: string | null
          search_vector?: unknown
          source?: string | null
          source_file?: string | null
          source_url?: string | null
          subcategory?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_business_entity_id_fkey"
            columns: ["business_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_base_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_cache: {
        Row: {
          courses_completed: number | null
          id: string
          lessons_completed: number | null
          period: string
          period_start: string
          rank: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          courses_completed?: number | null
          id?: string
          lessons_completed?: number | null
          period: string
          period_start: string
          rank?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          courses_completed?: number | null
          id?: string
          lessons_completed?: number | null
          period?: string
          period_start?: string
          rank?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_analytics: {
        Row: {
          assignments_completed: number | null
          assignments_total: number | null
          average_assignment_score: number | null
          average_quiz_score: number | null
          course_id: string
          created_at: string | null
          engagement_score: number | null
          enrollment_id: string | null
          id: string
          last_activity_at: string | null
          learning_path_progress: Json | null
          lessons_completed: number | null
          lessons_total: number | null
          quizzes_completed: number | null
          quizzes_total: number | null
          total_time_spent_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assignments_completed?: number | null
          assignments_total?: number | null
          average_assignment_score?: number | null
          average_quiz_score?: number | null
          course_id: string
          created_at?: string | null
          engagement_score?: number | null
          enrollment_id?: string | null
          id?: string
          last_activity_at?: string | null
          learning_path_progress?: Json | null
          lessons_completed?: number | null
          lessons_total?: number | null
          quizzes_completed?: number | null
          quizzes_total?: number | null
          total_time_spent_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assignments_completed?: number | null
          assignments_total?: number | null
          average_assignment_score?: number | null
          average_quiz_score?: number | null
          course_id?: string
          created_at?: string | null
          engagement_score?: number | null
          enrollment_id?: string | null
          id?: string
          last_activity_at?: string | null
          learning_path_progress?: Json | null
          lessons_completed?: number | null
          lessons_total?: number | null
          quizzes_completed?: number | null
          quizzes_total?: number | null
          total_time_spent_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_analytics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_analytics_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_path_courses: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          order_index: number
          step_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          order_index: number
          step_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          order_index?: number
          step_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_courses_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "learning_path_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_path_steps: {
        Row: {
          created_at: string | null
          description: string | null
          duration_weeks: number | null
          id: string
          order_index: number
          path_id: string | null
          skills: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          order_index: number
          path_id?: string | null
          skills?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          order_index?: number
          path_id?: string | null
          skills?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_steps_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          order_index: number
          title: string
          total_duration_weeks: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_index: number
          title: string
          total_duration_weeks?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number
          title?: string
          total_duration_weeks?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      learning_streaks: {
        Row: {
          created_at: string | null
          id: string
          lessons_completed: number | null
          minutes_learned: number | null
          streak_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lessons_completed?: number | null
          minutes_learned?: number | null
          streak_date: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lessons_completed?: number | null
          minutes_learned?: number | null
          streak_date?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          enrollment_id: string | null
          id: string
          is_completed: boolean | null
          last_position_seconds: number | null
          lesson_id: string | null
          updated_at: string | null
          user_id: string | null
          watch_time_seconds: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          is_completed?: boolean | null
          last_position_seconds?: number | null
          lesson_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          watch_time_seconds?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          is_completed?: boolean | null
          last_position_seconds?: number | null
          lesson_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          article_content: string | null
          content_type: string
          course_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_free_preview: boolean | null
          order_index: number
          resources: Json | null
          section_id: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          article_content?: string | null
          content_type: string
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free_preview?: boolean | null
          order_index: number
          resources?: Json | null
          section_id?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          article_content?: string | null
          content_type?: string
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free_preview?: boolean | null
          order_index?: number
          resources?: Json | null
          section_id?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      library_activity_log: {
        Row: {
          action: string
          created_at: string | null
          description: string
          id: string
          item_count: number | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          description: string
          id?: string
          item_count?: number | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string
          id?: string
          item_count?: number | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      library_products: {
        Row: {
          added_at: string | null
          ai_tags: string[] | null
          category: string | null
          created_at: string | null
          file_id: string
          file_name: string
          file_type: string
          file_url: string | null
          id: string
          mime_type: string | null
          notes: string | null
          parent_folder_id: string | null
          status: string
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          ai_tags?: string[] | null
          category?: string | null
          created_at?: string | null
          file_id: string
          file_name: string
          file_type: string
          file_url?: string | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          parent_folder_id?: string | null
          status?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          ai_tags?: string[] | null
          category?: string | null
          created_at?: string | null
          file_id?: string
          file_name?: string
          file_type?: string
          file_url?: string | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          parent_folder_id?: string | null
          status?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      library_workspace: {
        Row: {
          added_at: string | null
          created_at: string | null
          file_id: string
          file_name: string
          file_type: string
          file_url: string | null
          id: string
          mime_type: string | null
          notes: string | null
          parent_folder_id: string | null
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          created_at?: string | null
          file_id: string
          file_name: string
          file_type: string
          file_url?: string | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          parent_folder_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          created_at?: string | null
          file_id?: string
          file_name?: string
          file_type?: string
          file_url?: string | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          parent_folder_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_workspace_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_workspace_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      live_session_attendees: {
        Row: {
          attendance_duration_minutes: number | null
          id: string
          joined_at: string | null
          left_at: string | null
          registered_at: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          attendance_duration_minutes?: number | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          registered_at?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          attendance_duration_minutes?: number | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          registered_at?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_attendee"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_attendee"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_session"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          created_at: string | null
          current_attendees: number | null
          description: string | null
          duration_minutes: number | null
          id: string
          instructor_id: string | null
          is_completed: boolean | null
          max_attendees: number | null
          meeting_url: string | null
          recording_url: string | null
          scheduled_at: string
          session_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_attendees?: number | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_id?: string | null
          is_completed?: boolean | null
          max_attendees?: number | null
          meeting_url?: string | null
          recording_url?: string | null
          scheduled_at: string
          session_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_attendees?: number | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_id?: string | null
          is_completed?: boolean | null
          max_attendees?: number | null
          meeting_url?: string | null
          recording_url?: string | null
          scheduled_at?: string
          session_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_instructor"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_instructor"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_knowledge_harvests: {
        Row: {
          analysis: Json | null
          channel: string | null
          content: string | null
          created_at: string | null
          domain: string | null
          id: string
          metadata: Json | null
          source_type: string | null
          source_url: string | null
          tags: string[] | null
          title: string
          transcript: string | null
          updated_at: string | null
          user_email: string | null
          video_id: string | null
        }
        Insert: {
          analysis?: Json | null
          channel?: string | null
          content?: string | null
          created_at?: string | null
          domain?: string | null
          id?: string
          metadata?: Json | null
          source_type?: string | null
          source_url?: string | null
          tags?: string[] | null
          title: string
          transcript?: string | null
          updated_at?: string | null
          user_email?: string | null
          video_id?: string | null
        }
        Update: {
          analysis?: Json | null
          channel?: string | null
          content?: string | null
          created_at?: string | null
          domain?: string | null
          id?: string
          metadata?: Json | null
          source_type?: string | null
          source_url?: string | null
          tags?: string[] | null
          title?: string
          transcript?: string | null
          updated_at?: string | null
          user_email?: string | null
          video_id?: string | null
        }
        Relationships: []
      }
      manager_library_items: {
        Row: {
          created_at: string | null
          drive_file_id: string | null
          id: string
          is_favorite: boolean | null
          metadata: Json | null
          name: string
          prompt: string | null
          source: string | null
          tags: string[] | null
          thumbnail_url: string | null
          type: string | null
          updated_at: string | null
          url: string
          user_email: string | null
        }
        Insert: {
          created_at?: string | null
          drive_file_id?: string | null
          id?: string
          is_favorite?: boolean | null
          metadata?: Json | null
          name: string
          prompt?: string | null
          source?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          type?: string | null
          updated_at?: string | null
          url: string
          user_email?: string | null
        }
        Update: {
          created_at?: string | null
          drive_file_id?: string | null
          id?: string
          is_favorite?: boolean | null
          metadata?: Json | null
          name?: string
          prompt?: string | null
          source?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          type?: string | null
          updated_at?: string | null
          url?: string
          user_email?: string | null
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          completed_at: string | null
          content: string | null
          created_at: string | null
          id: string
          n8n_execution_id: string | null
          n8n_workflow_id: string | null
          name: string
          platforms: string[] | null
          project_id: string | null
          scheduled_at: string | null
          started_at: string | null
          status: string | null
          target_audience: Json | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          n8n_execution_id?: string | null
          n8n_workflow_id?: string | null
          name: string
          platforms?: string[] | null
          project_id?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          target_audience?: Json | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          n8n_execution_id?: string | null
          n8n_workflow_id?: string | null
          name?: string
          platforms?: string[] | null
          project_id?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          target_audience?: Json | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_leads: {
        Row: {
          campaign_id: string | null
          company: string | null
          contact_count: number | null
          created_at: string | null
          custom_fields: Json | null
          email: string
          first_contact_at: string | null
          id: string
          interests: string[] | null
          last_contact_at: string | null
          lead_score: number | null
          lead_status: string | null
          name: string | null
          nurturing_status: string | null
          nurturing_workflow_id: string | null
          phone: string | null
          source: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          company?: string | null
          contact_count?: number | null
          created_at?: string | null
          custom_fields?: Json | null
          email: string
          first_contact_at?: string | null
          id?: string
          interests?: string[] | null
          last_contact_at?: string | null
          lead_score?: number | null
          lead_status?: string | null
          name?: string | null
          nurturing_status?: string | null
          nurturing_workflow_id?: string | null
          phone?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          company?: string | null
          contact_count?: number | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string
          first_contact_at?: string | null
          id?: string
          interests?: string[] | null
          last_contact_at?: string | null
          lead_score?: number | null
          lead_status?: string | null
          name?: string | null
          nurturing_status?: string | null
          nurturing_workflow_id?: string | null
          phone?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_leads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_leads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_workflow_executions: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          execution_id: string
          finished_at: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          started_at: string | null
          status: string | null
          user_id: string | null
          workflow_id: string
          workflow_name: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          execution_id: string
          finished_at?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
          workflow_id: string
          workflow_name: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          execution_id?: string
          finished_at?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
          workflow_id?: string
          workflow_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_workflow_executions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_workflow_executions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_workflow_executions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          contact_id: string
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          parent_message_id: string | null
          read_at: string | null
          sender_email: string | null
          sender_id: string | null
          sender_name: string | null
          sender_type: string
        }
        Insert: {
          attachments?: Json | null
          contact_id: string
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          parent_message_id?: string | null
          read_at?: string | null
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sender_type: string
        }
        Update: {
          attachments?: Json | null
          contact_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          parent_message_id?: string | null
          read_at?: string | null
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts_with_latest_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      morning_briefings: {
        Row: {
          ai_insights: string | null
          content_queue: Json | null
          created_at: string | null
          date: string
          decisions_needed: Json | null
          generated_by: string | null
          id: string
          is_read: boolean | null
          key_metrics: Json | null
          motivation_quote: string | null
          pending_emails: Json | null
          pending_tasks: Json | null
          priorities: Json | null
          read_at: string | null
          summary: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_insights?: string | null
          content_queue?: Json | null
          created_at?: string | null
          date?: string
          decisions_needed?: Json | null
          generated_by?: string | null
          id?: string
          is_read?: boolean | null
          key_metrics?: Json | null
          motivation_quote?: string | null
          pending_emails?: Json | null
          pending_tasks?: Json | null
          priorities?: Json | null
          read_at?: string | null
          summary?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_insights?: string | null
          content_queue?: Json | null
          created_at?: string | null
          date?: string
          decisions_needed?: Json | null
          generated_by?: string | null
          id?: string
          is_read?: boolean | null
          key_metrics?: Json | null
          motivation_quote?: string | null
          pending_emails?: Json | null
          pending_tasks?: Json | null
          priorities?: Json | null
          read_at?: string | null
          summary?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      n8n_executions: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          end_time: string | null
          error_message: string | null
          id: string
          input_data: Json | null
          n8n_execution_id: string
          output_data: Json | null
          start_time: string
          status: string
          workflow_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          end_time?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          n8n_execution_id: string
          output_data?: Json | null
          start_time?: string
          status: string
          workflow_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          end_time?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          n8n_execution_id?: string
          output_data?: Json | null
          start_time?: string
          status?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "n8n_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "n8n_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_workflow_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          tags: string[] | null
          template_data: Json
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          tags?: string[] | null
          template_data: Json
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          tags?: string[] | null
          template_data?: Json
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "n8n_workflow_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "n8n_workflow_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_workflows: {
        Row: {
          agent_id: string | null
          created_at: string | null
          description: string | null
          id: string
          last_execution: string | null
          n8n_data: Json | null
          name: string
          status: string | null
          successful_executions: number | null
          tags: string[] | null
          total_executions: number | null
          updated_at: string | null
          webhook_url: string | null
          workflow_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_execution?: string | null
          n8n_data?: Json | null
          name: string
          status?: string | null
          successful_executions?: number | null
          tags?: string[] | null
          total_executions?: number | null
          updated_at?: string | null
          webhook_url?: string | null
          workflow_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_execution?: string | null
          n8n_data?: Json | null
          name?: string
          status?: string | null
          successful_executions?: number | null
          tags?: string[] | null
          total_executions?: number | null
          updated_at?: string | null
          webhook_url?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "n8n_workflows_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      news_digests: {
        Row: {
          content: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_digests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_digests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          contact_id: string
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          is_private: boolean | null
          mentioned_users: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_id: string
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          is_private?: boolean | null
          mentioned_users?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          is_private?: boolean | null
          mentioned_users?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts_with_latest_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_queue: {
        Row: {
          channel: string | null
          content: string | null
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          notification_type: string
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          channel?: string | null
          content?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          channel?: string | null
          content?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string
          created_at: string | null
          data: Json | null
          icon: string | null
          id: string
          is_read: boolean | null
          read_at: string | null
          sent_via: string[] | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body: string
          created_at?: string | null
          data?: Json | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          sent_via?: string[] | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string | null
          data?: Json | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          sent_via?: string[] | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      page_content: {
        Row: {
          content: Json
          page_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content?: Json
          page_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content?: Json
          page_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          paid_at: string | null
          status: string
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          stripe_receipt_url: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          paid_at?: string | null
          status: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_receipt_url?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          paid_at?: string | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_receipt_url?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_orders: {
        Row: {
          amount: number
          coupon_code: string | null
          course_id: string | null
          created_at: string | null
          currency: string | null
          discount_amount: number | null
          final_amount: number
          id: string
          metadata: Json | null
          order_type: string | null
          paid_at: string | null
          payment_method: string | null
          payment_provider: string | null
          payment_reference: string | null
          payment_status: string | null
          subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          coupon_code?: string | null
          course_id?: string | null
          created_at?: string | null
          currency?: string | null
          discount_amount?: number | null
          final_amount: number
          id?: string
          metadata?: Json | null
          order_type?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          coupon_code?: string | null
          course_id?: string | null
          created_at?: string | null
          currency?: string | null
          discount_amount?: number | null
          final_amount?: number
          id?: string
          metadata?: Json | null
          order_type?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_orders_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          automation_rules: string[] | null
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          position: number
          slug: string
          updated_at: string | null
        }
        Insert: {
          automation_rules?: string[] | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          position: number
          slug: string
          updated_at?: string | null
        }
        Update: {
          automation_rules?: string[] | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          position?: number
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_analytics: {
        Row: {
          created_at: string | null
          date: string
          id: string
          page_id: string
          platform: string
          posts_count: number | null
          total_clicks: number | null
          total_engagement: number | null
          total_reach: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          page_id: string
          platform: string
          posts_count?: number | null
          total_clicks?: number | null
          total_engagement?: number | null
          total_reach?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          page_id?: string
          platform?: string
          posts_count?: number | null
          total_clicks?: number | null
          total_engagement?: number | null
          total_reach?: number | null
        }
        Relationships: []
      }
      predictions_log: {
        Row: {
          actual_occurred_at: string | null
          created_at: string | null
          description: string
          id: string
          metrics_snapshot: Json | null
          predicted_at: string
          prediction_type: string
          probability: number | null
          recommendations: Json | null
          severity: string
          was_accurate: boolean | null
        }
        Insert: {
          actual_occurred_at?: string | null
          created_at?: string | null
          description: string
          id?: string
          metrics_snapshot?: Json | null
          predicted_at?: string
          prediction_type: string
          probability?: number | null
          recommendations?: Json | null
          severity: string
          was_accurate?: boolean | null
        }
        Update: {
          actual_occurred_at?: string | null
          created_at?: string | null
          description?: string
          id?: string
          metrics_snapshot?: Json | null
          predicted_at?: string
          prediction_type?: string
          probability?: number | null
          recommendations?: Json | null
          severity?: string
          was_accurate?: boolean | null
        }
        Relationships: []
      }
      product_metrics: {
        Row: {
          active_users: number | null
          avg_response_time: number | null
          error_rate: number | null
          feature_usage: Json | null
          id: string
          monthly_active_users: number | null
          monthly_revenue: number | null
          product_name: string
          total_revenue: number | null
          total_users: number | null
          updated_at: string | null
          uptime_percentage: number | null
        }
        Insert: {
          active_users?: number | null
          avg_response_time?: number | null
          error_rate?: number | null
          feature_usage?: Json | null
          id?: string
          monthly_active_users?: number | null
          monthly_revenue?: number | null
          product_name: string
          total_revenue?: number | null
          total_users?: number | null
          updated_at?: string | null
          uptime_percentage?: number | null
        }
        Update: {
          active_users?: number | null
          avg_response_time?: number | null
          error_rate?: number | null
          feature_usage?: Json | null
          id?: string
          monthly_active_users?: number | null
          monthly_revenue?: number | null
          product_name?: string
          total_revenue?: number | null
          total_users?: number | null
          updated_at?: string | null
          uptime_percentage?: number | null
        }
        Relationships: []
      }
      production_assets: {
        Row: {
          asset_type: string
          created_at: string | null
          duration: number | null
          file_size: number | null
          height: number | null
          id: string
          model_used: string | null
          prediction_id: string | null
          production_id: string | null
          prompt_used: string | null
          scene_id: string | null
          url: string
          width: number | null
        }
        Insert: {
          asset_type: string
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          height?: number | null
          id?: string
          model_used?: string | null
          prediction_id?: string | null
          production_id?: string | null
          prompt_used?: string | null
          scene_id?: string | null
          url: string
          width?: number | null
        }
        Update: {
          asset_type?: string
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          height?: number | null
          id?: string
          model_used?: string | null
          prediction_id?: string | null
          production_id?: string | null
          prompt_used?: string | null
          scene_id?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "production_assets_production_id_fkey"
            columns: ["production_id"]
            isOneToOne: false
            referencedRelation: "video_productions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_seen_at: string | null
          notification_settings: Json | null
          phone: string | null
          preferences: Json | null
          role: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_seen_at?: string | null
          notification_settings?: Json | null
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          notification_settings?: Json | null
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      project_access: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: []
      }
      project_agents: {
        Row: {
          agent_id: string
          assigned_by: string | null
          auto_trigger_events: string[] | null
          config_override: Json | null
          created_at: string | null
          failed_runs: number | null
          id: string
          is_enabled: boolean | null
          last_run_at: string | null
          notes: string | null
          priority: number | null
          project_id: string
          schedule_cron: string | null
          successful_runs: number | null
          total_cost_usd: number | null
          total_runs: number | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          assigned_by?: string | null
          auto_trigger_events?: string[] | null
          config_override?: Json | null
          created_at?: string | null
          failed_runs?: number | null
          id?: string
          is_enabled?: boolean | null
          last_run_at?: string | null
          notes?: string | null
          priority?: number | null
          project_id: string
          schedule_cron?: string | null
          successful_runs?: number | null
          total_cost_usd?: number | null
          total_runs?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          assigned_by?: string | null
          auto_trigger_events?: string[] | null
          config_override?: Json | null
          created_at?: string | null
          failed_runs?: number | null
          id?: string
          is_enabled?: boolean | null
          last_run_at?: string | null
          notes?: string | null
          priority?: number | null
          project_id?: string
          schedule_cron?: string | null
          successful_runs?: number | null
          total_cost_usd?: number | null
          total_runs?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_agents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_analytics: {
        Row: {
          api_credentials_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_data_at: string | null
          notes: string | null
          platform: string
          project_id: string
          property_id: string | null
          tracking_id: string | null
          updated_at: string | null
        }
        Insert: {
          api_credentials_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_data_at?: string | null
          notes?: string | null
          platform: string
          project_id: string
          property_id?: string | null
          tracking_id?: string | null
          updated_at?: string | null
        }
        Update: {
          api_credentials_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_data_at?: string | null
          notes?: string | null
          platform?: string
          project_id?: string
          property_id?: string | null
          tracking_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_analytics_api_credentials_id_fkey"
            columns: ["api_credentials_id"]
            isOneToOne: false
            referencedRelation: "credentials_vault"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_analytics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          notes: string | null
          phone: string | null
          project_id: string
          role: string | null
          telegram: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          project_id: string
          role?: string | null
          telegram?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          project_id?: string
          role?: string | null
          telegram?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_contacts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_credentials: {
        Row: {
          created_at: string | null
          created_by: string | null
          environment: string | null
          expires_at: string | null
          id: string
          key_preview: string | null
          key_value: string
          last_rotated_at: string | null
          last_used_at: string | null
          metadata: Json | null
          name: string
          project_id: string
          status: string | null
          tags: string[] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          environment?: string | null
          expires_at?: string | null
          id?: string
          key_preview?: string | null
          key_value: string
          last_rotated_at?: string | null
          last_used_at?: string | null
          metadata?: Json | null
          name: string
          project_id: string
          status?: string | null
          tags?: string[] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          environment?: string | null
          expires_at?: string | null
          id?: string
          key_preview?: string | null
          key_value?: string
          last_rotated_at?: string | null
          last_used_at?: string | null
          metadata?: Json | null
          name?: string
          project_id?: string
          status?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_credentials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_documents: {
        Row: {
          content: string | null
          created_at: string | null
          doc_type: string | null
          id: string
          is_pinned: boolean | null
          project_id: string
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          doc_type?: string | null
          id?: string
          is_pinned?: boolean | null
          project_id: string
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          doc_type?: string | null
          id?: string
          is_pinned?: boolean | null
          project_id?: string
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_domains: {
        Row: {
          created_at: string | null
          dns_provider: string | null
          domain: string
          domain_type: string | null
          expires_at: string | null
          hosting_provider: string | null
          id: string
          is_primary: boolean | null
          notes: string | null
          project_id: string
          registrar: string | null
          ssl_expires_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dns_provider?: string | null
          domain: string
          domain_type?: string | null
          expires_at?: string | null
          hosting_provider?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          project_id: string
          registrar?: string | null
          ssl_expires_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dns_provider?: string | null
          domain?: string
          domain_type?: string | null
          expires_at?: string | null
          hosting_provider?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          project_id?: string
          registrar?: string | null
          ssl_expires_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_domains_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_environments: {
        Row: {
          auto_deploy: boolean | null
          branch: string | null
          created_at: string | null
          env_name: string
          id: string
          last_deploy_at: string | null
          notes: string | null
          project_id: string
          status: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          auto_deploy?: boolean | null
          branch?: string | null
          created_at?: string | null
          env_name: string
          id?: string
          last_deploy_at?: string | null
          notes?: string | null
          project_id: string
          status?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          auto_deploy?: boolean | null
          branch?: string | null
          created_at?: string | null
          env_name?: string
          id?: string
          last_deploy_at?: string | null
          notes?: string | null
          project_id?: string
          status?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_environments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_integrations: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          notes: string | null
          project_id: string
          service_name: string
          service_type: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          notes?: string | null
          project_id: string
          service_name: string
          service_type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          notes?: string | null
          project_id?: string
          service_name?: string
          service_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_integrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_interests: {
        Row: {
          contacted_at: string | null
          contacted_by: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string
          project_id: number
          project_name: string
          project_slug: string
          status: string
          updated_at: string | null
        }
        Insert: {
          contacted_at?: string | null
          contacted_by?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone: string
          project_id: number
          project_name: string
          project_slug: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          contacted_at?: string | null
          contacted_by?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string
          project_id?: number
          project_name?: string
          project_slug?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_interests_contacted_by_fkey"
            columns: ["contacted_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_interests_contacted_by_fkey"
            columns: ["contacted_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      project_posts: {
        Row: {
          content: string
          created_at: string | null
          hashtags: string[] | null
          id: string
          link_url: string | null
          media_urls: string[] | null
          metadata: Json | null
          platforms: string[]
          project_id: string | null
          published_at: string | null
          results: Json | null
          scheduled_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          link_url?: string | null
          media_urls?: string[] | null
          metadata?: Json | null
          platforms: string[]
          project_id?: string | null
          published_at?: string | null
          results?: Json | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          link_url?: string | null
          media_urls?: string[] | null
          metadata?: Json | null
          platforms?: string[]
          project_id?: string | null
          published_at?: string | null
          results?: Json | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_posts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_registry: {
        Row: {
          budget: number | null
          business_entity_id: string | null
          category: string | null
          created_at: string | null
          current_phase: string | null
          description: string | null
          docs_url: string | null
          folder_path: string | null
          id: string
          infrastructure: Json | null
          live_url: string | null
          long_term_goals: string[] | null
          milestones: Json | null
          monetization_status: string | null
          name: string
          priority: number | null
          progress_percent: number | null
          repository_url: string | null
          revenue: number | null
          short_term_goals: string[] | null
          slug: string | null
          spent: number | null
          start_date: string | null
          status: string | null
          success_metrics: Json | null
          target_launch_date: string | null
          tech_stack: Json | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget?: number | null
          business_entity_id?: string | null
          category?: string | null
          created_at?: string | null
          current_phase?: string | null
          description?: string | null
          docs_url?: string | null
          folder_path?: string | null
          id?: string
          infrastructure?: Json | null
          live_url?: string | null
          long_term_goals?: string[] | null
          milestones?: Json | null
          monetization_status?: string | null
          name: string
          priority?: number | null
          progress_percent?: number | null
          repository_url?: string | null
          revenue?: number | null
          short_term_goals?: string[] | null
          slug?: string | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          success_metrics?: Json | null
          target_launch_date?: string | null
          tech_stack?: Json | null
          type: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          budget?: number | null
          business_entity_id?: string | null
          category?: string | null
          created_at?: string | null
          current_phase?: string | null
          description?: string | null
          docs_url?: string | null
          folder_path?: string | null
          id?: string
          infrastructure?: Json | null
          live_url?: string | null
          long_term_goals?: string[] | null
          milestones?: Json | null
          monetization_status?: string | null
          name?: string
          priority?: number | null
          progress_percent?: number | null
          repository_url?: string | null
          revenue?: number | null
          short_term_goals?: string[] | null
          slug?: string | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          success_metrics?: Json | null
          target_launch_date?: string | null
          tech_stack?: Json | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_registry_business_entity_id_fkey"
            columns: ["business_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      project_showcase: {
        Row: {
          bar_data: Json | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          display_order: number | null
          display_type: string | null
          end_date: string | null
          features: Json | null
          github_url: string | null
          hero_description: string | null
          hero_stats: Json | null
          hero_title: string | null
          icon: string | null
          id: string
          impacts: Json | null
          infrastructure: Json | null
          is_active: boolean | null
          is_featured: boolean | null
          key_features: Json | null
          line_data: Json | null
          logo_url: string | null
          metrics: Json | null
          my_role: string | null
          name: string
          objectives: Json | null
          overview_description: string | null
          overview_title: string | null
          performance: Json | null
          production_url: string | null
          progress: number | null
          published_at: string | null
          screenshots: Json | null
          slug: string
          social_links: Json | null
          start_date: string | null
          status: string | null
          status_label: string | null
          team_size: number | null
          tech_connections: Json | null
          tech_nodes: Json | null
          tech_stack: Json | null
          tech_summary: string | null
          tools: Json | null
          updated_at: string | null
          updated_by: string | null
          video_url: string | null
        }
        Insert: {
          bar_data?: Json | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          display_type?: string | null
          end_date?: string | null
          features?: Json | null
          github_url?: string | null
          hero_description?: string | null
          hero_stats?: Json | null
          hero_title?: string | null
          icon?: string | null
          id?: string
          impacts?: Json | null
          infrastructure?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          key_features?: Json | null
          line_data?: Json | null
          logo_url?: string | null
          metrics?: Json | null
          my_role?: string | null
          name: string
          objectives?: Json | null
          overview_description?: string | null
          overview_title?: string | null
          performance?: Json | null
          production_url?: string | null
          progress?: number | null
          published_at?: string | null
          screenshots?: Json | null
          slug: string
          social_links?: Json | null
          start_date?: string | null
          status?: string | null
          status_label?: string | null
          team_size?: number | null
          tech_connections?: Json | null
          tech_nodes?: Json | null
          tech_stack?: Json | null
          tech_summary?: string | null
          tools?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          video_url?: string | null
        }
        Update: {
          bar_data?: Json | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          display_type?: string | null
          end_date?: string | null
          features?: Json | null
          github_url?: string | null
          hero_description?: string | null
          hero_stats?: Json | null
          hero_title?: string | null
          icon?: string | null
          id?: string
          impacts?: Json | null
          infrastructure?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          key_features?: Json | null
          line_data?: Json | null
          logo_url?: string | null
          metrics?: Json | null
          my_role?: string | null
          name?: string
          objectives?: Json | null
          overview_description?: string | null
          overview_title?: string | null
          performance?: Json | null
          production_url?: string | null
          progress?: number | null
          published_at?: string | null
          screenshots?: Json | null
          slug?: string
          social_links?: Json | null
          start_date?: string | null
          status?: string | null
          status_label?: string | null
          team_size?: number | null
          tech_connections?: Json | null
          tech_nodes?: Json | null
          tech_stack?: Json | null
          tech_summary?: string | null
          tools?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_showcase_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_showcase_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_showcase_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_showcase_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      project_social_accounts: {
        Row: {
          account_avatar: string | null
          account_id: string
          account_name: string
          account_type: string | null
          account_username: string | null
          created_at: string | null
          credentials_ref: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          platform: string
          project_id: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          account_avatar?: string | null
          account_id: string
          account_name: string
          account_type?: string | null
          account_username?: string | null
          created_at?: string | null
          credentials_ref?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          platform: string
          project_id?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          account_avatar?: string | null
          account_id?: string
          account_name?: string
          account_type?: string | null
          account_username?: string | null
          created_at?: string | null
          credentials_ref?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          platform?: string
          project_id?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_social_accounts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_social_links: {
        Row: {
          api_endpoint: string | null
          auto_post_enabled: boolean | null
          created_at: string | null
          credential_id: string | null
          follower_count: number | null
          id: string
          is_primary: boolean | null
          is_verified: boolean | null
          last_synced_at: string | null
          notes: string | null
          page_id: string | null
          platform: string
          project_id: string
          token_expires_at: string | null
          updated_at: string | null
          url: string
          username: string | null
        }
        Insert: {
          api_endpoint?: string | null
          auto_post_enabled?: boolean | null
          created_at?: string | null
          credential_id?: string | null
          follower_count?: number | null
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          last_synced_at?: string | null
          notes?: string | null
          page_id?: string | null
          platform: string
          project_id: string
          token_expires_at?: string | null
          updated_at?: string | null
          url: string
          username?: string | null
        }
        Update: {
          api_endpoint?: string | null
          auto_post_enabled?: boolean | null
          created_at?: string | null
          credential_id?: string | null
          follower_count?: number | null
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          last_synced_at?: string | null
          notes?: string | null
          page_id?: string | null
          platform?: string
          project_id?: string
          token_expires_at?: string | null
          updated_at?: string | null
          url?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_social_links_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "project_credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_social_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_submissions: {
        Row: {
          ai_review: Json | null
          course_id: string
          created_at: string | null
          demo_url: string | null
          description: string | null
          github_url: string | null
          grade: number | null
          id: string
          instructor_feedback: string | null
          lesson_id: string
          reviewed_at: string | null
          screenshots: Json | null
          status: string | null
          submission_files: Json | null
          submitted_at: string | null
          title: string
          updated_at: string | null
          user_id: string
          xp_awarded: number | null
        }
        Insert: {
          ai_review?: Json | null
          course_id: string
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          github_url?: string | null
          grade?: number | null
          id?: string
          instructor_feedback?: string | null
          lesson_id: string
          reviewed_at?: string | null
          screenshots?: Json | null
          status?: string | null
          submission_files?: Json | null
          submitted_at?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          xp_awarded?: number | null
        }
        Update: {
          ai_review?: Json | null
          course_id?: string
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          github_url?: string | null
          grade?: number | null
          id?: string
          instructor_feedback?: string | null
          lesson_id?: string
          reviewed_at?: string | null
          screenshots?: Json | null
          status?: string | null
          submission_files?: Json | null
          submitted_at?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_submission_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_submission_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          order_index: number | null
          parent_task_id: string | null
          priority: string | null
          project_id: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          order_index?: number | null
          parent_task_id?: string | null
          priority?: string | null
          project_id: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          order_index?: number | null
          parent_task_id?: string | null
          priority?: string | null
          project_id?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      project_workflow_instances: {
        Row: {
          auto_trigger_events: string[] | null
          average_execution_time_ms: number | null
          config: Json | null
          created_at: string | null
          created_by: string | null
          credential_mappings: Json | null
          description: string | null
          failed_executions: number | null
          id: string
          is_enabled: boolean | null
          last_execution_at: string | null
          last_execution_status: string | null
          n8n_workflow_id: string | null
          n8n_workflow_json: Json | null
          name: string
          notes: string | null
          project_id: string
          schedule_cron: string | null
          status: string | null
          successful_executions: number | null
          template_id: string
          total_cost_usd: number | null
          total_executions: number | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          auto_trigger_events?: string[] | null
          average_execution_time_ms?: number | null
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          credential_mappings?: Json | null
          description?: string | null
          failed_executions?: number | null
          id?: string
          is_enabled?: boolean | null
          last_execution_at?: string | null
          last_execution_status?: string | null
          n8n_workflow_id?: string | null
          n8n_workflow_json?: Json | null
          name: string
          notes?: string | null
          project_id: string
          schedule_cron?: string | null
          status?: string | null
          successful_executions?: number | null
          template_id: string
          total_cost_usd?: number | null
          total_executions?: number | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          auto_trigger_events?: string[] | null
          average_execution_time_ms?: number | null
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          credential_mappings?: Json | null
          description?: string | null
          failed_executions?: number | null
          id?: string
          is_enabled?: boolean | null
          last_execution_at?: string | null
          last_execution_status?: string | null
          n8n_workflow_id?: string | null
          n8n_workflow_json?: Json | null
          name?: string
          notes?: string | null
          project_id?: string
          schedule_cron?: string | null
          status?: string | null
          successful_executions?: number | null
          template_id?: string
          total_cost_usd?: number | null
          total_executions?: number | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_workflow_instances_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_workflow_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget_usd: number | null
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          favicon_url: string | null
          features: string[] | null
          github_url: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          launch_date: string | null
          local_url: string | null
          logo_url: string | null
          metadata: Json | null
          name: string
          notes: string | null
          primary_color: string | null
          priority: number | null
          production_url: string | null
          settings: Json | null
          slug: string | null
          spent_usd: number | null
          status: string | null
          tagline: string | null
          tech_stack: string[] | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          budget_usd?: number | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          favicon_url?: string | null
          features?: string[] | null
          github_url?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          launch_date?: string | null
          local_url?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name: string
          notes?: string | null
          primary_color?: string | null
          priority?: number | null
          production_url?: string | null
          settings?: Json | null
          slug?: string | null
          spent_usd?: number | null
          status?: string | null
          tagline?: string | null
          tech_stack?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          budget_usd?: number | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          favicon_url?: string | null
          features?: string[] | null
          github_url?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          launch_date?: string | null
          local_url?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          primary_color?: string | null
          priority?: number | null
          production_url?: string | null
          settings?: Json | null
          slug?: string | null
          spent_usd?: number | null
          status?: string | null
          tagline?: string | null
          tech_stack?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          completed_at: string | null
          created_at: string | null
          enrollment_id: string | null
          id: string
          passed: boolean | null
          percentage: number | null
          quiz_id: string
          score: number | null
          started_at: string
          time_spent_seconds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          passed?: boolean | null
          percentage?: number | null
          quiz_id: string
          score?: number | null
          started_at?: string
          time_spent_seconds?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          passed?: boolean | null
          percentage?: number | null
          quiz_id?: string
          score?: number | null
          started_at?: string
          time_spent_seconds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "course_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_question_options: {
        Row: {
          created_at: string | null
          id: string
          is_correct: boolean | null
          option_text: string
          order_index: number | null
          question_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          option_text: string
          order_index?: number | null
          question_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          option_text?: string
          order_index?: number | null
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string | null
          explanation: string | null
          id: string
          order_index: number | null
          points: number | null
          question_text: string
          question_type: string | null
          quiz_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          explanation?: string | null
          id?: string
          order_index?: number | null
          points?: number | null
          question_text: string
          question_type?: string | null
          quiz_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          explanation?: string | null
          id?: string
          order_index?: number | null
          points?: number | null
          question_text?: string
          question_type?: string | null
          quiz_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "course_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          lesson_id: string | null
          max_attempts: number | null
          pass_percentage: number | null
          time_limit_minutes: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          lesson_id?: string | null
          max_attempts?: number | null
          pass_percentage?: number | null
          time_limit_minutes?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          lesson_id?: string | null
          max_attempts?: number | null
          pass_percentage?: number | null
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      response_cache: {
        Row: {
          assistant_type: string
          created_at: string | null
          id: string
          query_hash: string
          response: string
        }
        Insert: {
          assistant_type: string
          created_at?: string | null
          id?: string
          query_hash: string
          response: string
        }
        Update: {
          assistant_type?: string
          created_at?: string | null
          id?: string
          query_hash?: string
          response?: string
        }
        Relationships: []
      }
      review_helpful_votes: {
        Row: {
          created_at: string | null
          id: string
          review_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "course_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_helpful_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_helpful_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_features: {
        Row: {
          created_at: string | null
          feature_color: string | null
          feature_index: number
          feature_points: string[] | null
          feature_title: string
          id: string
          priority: string | null
          showcase_name: string | null
          showcase_slug: string
          status: string | null
          target_project: string | null
          updated_at: string | null
          use_case: string | null
          user_id: string
          user_notes: string | null
        }
        Insert: {
          created_at?: string | null
          feature_color?: string | null
          feature_index: number
          feature_points?: string[] | null
          feature_title: string
          id?: string
          priority?: string | null
          showcase_name?: string | null
          showcase_slug: string
          status?: string | null
          target_project?: string | null
          updated_at?: string | null
          use_case?: string | null
          user_id: string
          user_notes?: string | null
        }
        Update: {
          created_at?: string | null
          feature_color?: string | null
          feature_index?: number
          feature_points?: string[] | null
          feature_title?: string
          id?: string
          priority?: string | null
          showcase_name?: string | null
          showcase_slug?: string
          status?: string | null
          target_project?: string | null
          updated_at?: string | null
          use_case?: string | null
          user_id?: string
          user_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_features_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_features_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_products: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          product_slug: string
          product_type: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_slug: string
          product_type?: string | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_slug?: string
          product_type?: string | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_posts: {
        Row: {
          content: string
          created_at: string | null
          error_message: string | null
          facebook_post_id: string | null
          id: string
          image_url: string | null
          page_id: string
          post_type: string | null
          scheduled_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          error_message?: string | null
          facebook_post_id?: string | null
          id: string
          image_url?: string | null
          page_id: string
          post_type?: string | null
          scheduled_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          error_message?: string | null
          facebook_post_id?: string | null
          id?: string
          image_url?: string | null
          page_id?: string
          post_type?: string | null
          scheduled_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sections: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          order_index: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_analytics: {
        Row: {
          avg_position: number | null
          created_at: string | null
          date: string | null
          domain_id: string | null
          id: string
          organic_traffic: number | null
          top_rankings: number | null
          total_indexed: number | null
        }
        Insert: {
          avg_position?: number | null
          created_at?: string | null
          date?: string | null
          domain_id?: string | null
          id?: string
          organic_traffic?: number | null
          top_rankings?: number | null
          total_indexed?: number | null
        }
        Update: {
          avg_position?: number | null
          created_at?: string | null
          date?: string | null
          domain_id?: string | null
          id?: string
          organic_traffic?: number | null
          top_rankings?: number | null
          total_indexed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_analytics_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "seo_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_domains: {
        Row: {
          auto_index: boolean | null
          bing_api_key: string | null
          created_at: string | null
          created_by: string | null
          enabled: boolean | null
          google_service_account_json: Json | null
          id: string
          indexed_urls: number | null
          name: string
          total_urls: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          auto_index?: boolean | null
          bing_api_key?: string | null
          created_at?: string | null
          created_by?: string | null
          enabled?: boolean | null
          google_service_account_json?: Json | null
          id?: string
          indexed_urls?: number | null
          name: string
          total_urls?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          auto_index?: boolean | null
          bing_api_key?: string | null
          created_at?: string | null
          created_by?: string | null
          enabled?: boolean | null
          google_service_account_json?: Json | null
          id?: string
          indexed_urls?: number | null
          name?: string
          total_urls?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_domains_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_domains_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_indexing_queue: {
        Row: {
          created_at: string | null
          domain_id: string | null
          error_message: string | null
          id: string
          indexed_at: string | null
          retry_count: number | null
          search_engine: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          domain_id?: string | null
          error_message?: string | null
          id?: string
          indexed_at?: string | null
          retry_count?: number | null
          search_engine?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          domain_id?: string | null
          error_message?: string | null
          id?: string
          indexed_at?: string | null
          retry_count?: number | null
          search_engine?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_indexing_queue_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "seo_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_keywords: {
        Row: {
          created_at: string | null
          current_position: number | null
          difficulty: string | null
          domain_id: string | null
          id: string
          keyword: string
          previous_position: number | null
          target_url: string | null
          updated_at: string | null
          volume: string | null
        }
        Insert: {
          created_at?: string | null
          current_position?: number | null
          difficulty?: string | null
          domain_id?: string | null
          id?: string
          keyword: string
          previous_position?: number | null
          target_url?: string | null
          updated_at?: string | null
          volume?: string | null
        }
        Update: {
          created_at?: string | null
          current_position?: number | null
          difficulty?: string | null
          domain_id?: string | null
          id?: string
          keyword?: string
          previous_position?: number | null
          target_url?: string | null
          updated_at?: string | null
          volume?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_keywords_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "seo_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_pages: {
        Row: {
          avg_time_on_page: number | null
          bounce_rate: number | null
          created_at: string | null
          description: string | null
          id: string
          keywords: string[] | null
          page_url: string
          page_views: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          keywords?: string[] | null
          page_url: string
          page_views?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          keywords?: string[] | null
          page_url?: string
          page_views?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          auto_submit_new_content: boolean | null
          bing_api_enabled: boolean | null
          created_at: string | null
          google_api_enabled: boolean | null
          google_daily_quota_limit: number | null
          id: string
          retry_failed_after_hours: number | null
          search_console_webhook: string | null
          sitemap_auto_update: boolean | null
          updated_at: string | null
        }
        Insert: {
          auto_submit_new_content?: boolean | null
          bing_api_enabled?: boolean | null
          created_at?: string | null
          google_api_enabled?: boolean | null
          google_daily_quota_limit?: number | null
          id?: string
          retry_failed_after_hours?: number | null
          search_console_webhook?: string | null
          sitemap_auto_update?: boolean | null
          updated_at?: string | null
        }
        Update: {
          auto_submit_new_content?: boolean | null
          bing_api_enabled?: boolean | null
          created_at?: string | null
          google_api_enabled?: boolean | null
          google_daily_quota_limit?: number | null
          id?: string
          retry_failed_after_hours?: number | null
          search_console_webhook?: string | null
          sitemap_auto_update?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_sitemaps: {
        Row: {
          created_at: string | null
          domain_id: string | null
          file_size: string | null
          id: string
          last_generated: string | null
          total_urls: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          domain_id?: string | null
          file_size?: string | null
          id?: string
          last_generated?: string | null
          total_urls?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          domain_id?: string | null
          file_size?: string | null
          id?: string
          last_generated?: string | null
          total_urls?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_sitemaps_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "seo_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      skills_expertise: {
        Row: {
          category: string
          certifications: string[] | null
          created_at: string | null
          currently_learning: boolean | null
          id: string
          learning_goal: string | null
          name: string
          proficiency_level: string | null
          projects_used: string[] | null
          updated_at: string | null
          user_id: string
          years_experience: number | null
        }
        Insert: {
          category: string
          certifications?: string[] | null
          created_at?: string | null
          currently_learning?: boolean | null
          id?: string
          learning_goal?: string | null
          name: string
          proficiency_level?: string | null
          projects_used?: string[] | null
          updated_at?: string | null
          user_id?: string
          years_experience?: number | null
        }
        Update: {
          category?: string
          certifications?: string[] | null
          created_at?: string | null
          currently_learning?: boolean | null
          id?: string
          learning_goal?: string | null
          name?: string
          proficiency_level?: string | null
          projects_used?: string[] | null
          updated_at?: string | null
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      social_media_accounts: {
        Row: {
          access_token: string | null
          account_id: string
          account_name: string | null
          account_url: string | null
          connected_at: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_sync_at: string | null
          platform: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          account_id: string
          account_name?: string | null
          account_url?: string | null
          connected_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_sync_at?: string | null
          platform: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          account_id?: string
          account_name?: string | null
          account_url?: string | null
          connected_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_sync_at?: string | null
          platform?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_media_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_media_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_credentials: {
        Row: {
          account_info: Json | null
          created_at: string | null
          credentials: Json
          id: string
          is_active: boolean | null
          last_error: string | null
          last_tested_at: string | null
          platform: string
          settings: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_info?: Json | null
          created_at?: string | null
          credentials: Json
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_tested_at?: string | null
          platform: string
          settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_info?: Json | null
          created_at?: string | null
          credentials?: Json
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_tested_at?: string | null
          platform?: string
          settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_media_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_media_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      student_notifications: {
        Row: {
          content: string | null
          course_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          notification_type: string
          read_at: string | null
          related_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          content?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          notification_type: string
          read_at?: string | null
          related_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          content?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          notification_type?: string
          read_at?: string | null
          related_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_notifications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      student_revenue: {
        Row: {
          amount: number
          client_name: string | null
          created_at: string | null
          currency: string | null
          earned_at: string | null
          id: string
          metadata: Json | null
          project_description: string | null
          revenue_source: string
          user_id: string
        }
        Insert: {
          amount: number
          client_name?: string | null
          created_at?: string | null
          currency?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          project_description?: string | null
          revenue_source: string
          user_id: string
        }
        Update: {
          amount?: number
          client_name?: string | null
          created_at?: string | null
          currency?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          project_description?: string | null
          revenue_source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_revenue_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_revenue_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          last_active_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          last_active_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          last_active_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_group"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_member"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_member"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_members: number | null
          description: string | null
          id: string
          is_active: boolean | null
          level: string
          max_members: number | null
          meeting_schedule: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_members?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level: string
          max_members?: number | null
          meeting_schedule?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_members?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: string
          max_members?: number | null
          meeting_schedule?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_creator"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_creator"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          description_vi: string | null
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          name_vi: string
          price: number
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_vi?: string | null
          duration_days?: number
          features?: Json | null
          id: string
          is_active?: boolean | null
          name: string
          name_vi: string
          price?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_vi?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_vi?: string
          price?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string | null
          customer_email: string
          customer_name: string | null
          first_response_at: string | null
          id: string
          metadata: Json | null
          priority: string | null
          resolved_at: string | null
          sla_deadline: string | null
          status: string | null
          subject: string
          ticket_number: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          customer_email: string
          customer_name?: string | null
          first_response_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          resolved_at?: string | null
          sla_deadline?: string | null
          status?: string | null
          subject: string
          ticket_number: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string | null
          first_response_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          resolved_at?: string | null
          sla_deadline?: string | null
          status?: string | null
          subject?: string
          ticket_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          reminder_at: string | null
          status: string | null
          task_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          reminder_at?: string | null
          status?: string | null
          task_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          reminder_at?: string | null
          status?: string | null
          task_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts_with_latest_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          attachments: Json | null
          body_html: string | null
          body_text: string | null
          created_at: string | null
          from_email: string
          id: string
          is_from_customer: boolean | null
          message_type: string | null
          metadata: Json | null
          subject: string | null
          ticket_id: string | null
          to_email: string
        }
        Insert: {
          attachments?: Json | null
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          from_email: string
          id?: string
          is_from_customer?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          subject?: string | null
          ticket_id?: string | null
          to_email: string
        }
        Update: {
          attachments?: Json | null
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          from_email?: string
          id?: string
          is_from_customer?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          subject?: string | null
          ticket_id?: string | null
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      token_usage: {
        Row: {
          completion_tokens: number
          conversation_id: string | null
          cost_usd: number
          created_at: string | null
          id: string
          intent: string | null
          model: string
          prompt_tokens: number
          source: string | null
          total_tokens: number
          user_id: string
        }
        Insert: {
          completion_tokens?: number
          conversation_id?: string | null
          cost_usd?: number
          created_at?: string | null
          id?: string
          intent?: string | null
          model?: string
          prompt_tokens?: number
          source?: string | null
          total_tokens?: number
          user_id: string
        }
        Update: {
          completion_tokens?: number
          conversation_id?: string | null
          cost_usd?: number
          created_at?: string | null
          id?: string
          intent?: string | null
          model?: string
          prompt_tokens?: number
          source?: string | null
          total_tokens?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          config: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          status: string | null
          tool_type: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string | null
          tool_type?: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string | null
          tool_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      unavailable_dates: {
        Row: {
          created_at: string | null
          date: string
          id: string
          reason: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unavailable_dates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unavailable_dates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          agents_created: number | null
          api_calls_count: number | null
          created_at: string | null
          credentials_stored: number | null
          id: string
          period_end: string | null
          period_start: string | null
          storage_used_mb: number | null
          updated_at: string | null
          user_id: string
          workflows_executed: number | null
        }
        Insert: {
          agents_created?: number | null
          api_calls_count?: number | null
          created_at?: string | null
          credentials_stored?: number | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          storage_used_mb?: number | null
          updated_at?: string | null
          user_id: string
          workflows_executed?: number | null
        }
        Update: {
          agents_created?: number | null
          api_calls_count?: number | null
          created_at?: string | null
          credentials_stored?: number | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          storage_used_mb?: number | null
          updated_at?: string | null
          user_id?: string
          workflows_executed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          created_at: string | null
          earned_at: string | null
          id: string
          metadata: Json | null
          user_id: string
          xp_awarded: number | null
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
          xp_awarded?: number | null
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: unknown
          product_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          product_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          product_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ai_preferences: {
        Row: {
          ai_name: string | null
          budget_range: string | null
          business_goal: string | null
          communication_level: string | null
          company_description: string | null
          company_name: string | null
          competitors: string | null
          created_at: string | null
          custom_greeting: string | null
          enable_memory: boolean | null
          id: string
          industry: string | null
          is_active: boolean | null
          language_style: string | null
          main_pain_point: string | null
          preferred_tone: string | null
          products_services: string | null
          target_customers: string | null
          unique_selling_points: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_name?: string | null
          budget_range?: string | null
          business_goal?: string | null
          communication_level?: string | null
          company_description?: string | null
          company_name?: string | null
          competitors?: string | null
          created_at?: string | null
          custom_greeting?: string | null
          enable_memory?: boolean | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          language_style?: string | null
          main_pain_point?: string | null
          preferred_tone?: string | null
          products_services?: string | null
          target_customers?: string | null
          unique_selling_points?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_name?: string | null
          budget_range?: string | null
          business_goal?: string | null
          communication_level?: string | null
          company_description?: string | null
          company_name?: string | null
          competitors?: string | null
          created_at?: string | null
          custom_greeting?: string | null
          enable_memory?: boolean | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          language_style?: string | null
          main_pain_point?: string | null
          preferred_tone?: string | null
          products_services?: string | null
          target_customers?: string | null
          unique_selling_points?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ai_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ai_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bookmarks: {
        Row: {
          bookmark_type: string | null
          created_at: string | null
          id: string
          lesson_id: string
          note: string | null
          timestamp_seconds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bookmark_type?: string | null
          created_at?: string | null
          id?: string
          lesson_id: string
          note?: string | null
          timestamp_seconds?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bookmark_type?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          note?: string | null
          timestamp_seconds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_brain_chats: {
        Row: {
          created_at: string | null
          domain_id: string | null
          id: string
          knowledge_ids: string[] | null
          last_message_at: string | null
          messages: Json | null
          session_id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          domain_id?: string | null
          id?: string
          knowledge_ids?: string[] | null
          last_message_at?: string | null
          messages?: Json | null
          session_id: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          domain_id?: string | null
          id?: string
          knowledge_ids?: string[] | null
          last_message_at?: string | null
          messages?: Json | null
          session_id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_brain_chats_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "brain_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_brain_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_brain_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      user_brain_imports: {
        Row: {
          chunks_generated: number | null
          completed_at: string | null
          created_at: string | null
          documents_created: number | null
          domain_id: string | null
          error_message: string | null
          id: string
          progress: number | null
          source_title: string | null
          source_type: string
          source_url: string | null
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          chunks_generated?: number | null
          completed_at?: string | null
          created_at?: string | null
          documents_created?: number | null
          domain_id?: string | null
          error_message?: string | null
          id?: string
          progress?: number | null
          source_title?: string | null
          source_type: string
          source_url?: string | null
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          chunks_generated?: number | null
          completed_at?: string | null
          created_at?: string | null
          documents_created?: number | null
          domain_id?: string | null
          error_message?: string | null
          id?: string
          progress?: number | null
          source_title?: string | null
          source_type?: string
          source_url?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_brain_imports_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "brain_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_brain_imports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_brain_imports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      user_brain_quotas: {
        Row: {
          created_at: string | null
          documents_count: number | null
          domains_count: number | null
          id: string
          last_query_at: string | null
          max_documents: number | null
          max_domains: number | null
          max_queries_per_month: number | null
          month_year: string
          queries_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          documents_count?: number | null
          domains_count?: number | null
          id?: string
          last_query_at?: string | null
          max_documents?: number | null
          max_domains?: number | null
          max_queries_per_month?: number | null
          month_year?: string
          queries_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          documents_count?: number | null
          domains_count?: number | null
          id?: string
          last_query_at?: string | null
          max_documents?: number | null
          max_domains?: number | null
          max_queries_per_month?: number | null
          month_year?: string
          queries_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_brain_quotas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_brain_quotas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feature_overrides: {
        Row: {
          created_at: string | null
          expires_at: string | null
          feature_key: string
          feature_value: Json
          granted_by: string | null
          id: string
          reason: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          feature_key: string
          feature_value: Json
          granted_by?: string | null
          id?: string
          reason?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          feature_key?: string
          feature_value?: Json
          granted_by?: string | null
          id?: string
          reason?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feature_overrides_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feature_overrides_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feature_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feature_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ideas: {
        Row: {
          ai_suggestions: Json | null
          category: string | null
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_pinned: boolean | null
          metadata: Json | null
          priority: string | null
          related_project_id: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_suggestions?: Json | null
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_pinned?: boolean | null
          metadata?: Json | null
          priority?: string | null
          related_project_id?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_suggestions?: Json | null
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_pinned?: boolean | null
          metadata?: Json | null
          priority?: string | null
          related_project_id?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ideas_related_project_id_fkey"
            columns: ["related_project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ideas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ideas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_path_progress: {
        Row: {
          completed_steps: string[] | null
          current_step_id: string | null
          id: string
          path_id: string | null
          started_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_steps?: string[] | null
          current_step_id?: string | null
          id?: string
          path_id?: string | null
          started_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_steps?: string[] | null
          current_step_id?: string | null
          id?: string
          path_id?: string | null
          started_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_path_progress_current_step_id_fkey"
            columns: ["current_step_id"]
            isOneToOne: false
            referencedRelation: "learning_path_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_learning_path_progress_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_learning_path_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_learning_path_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed_at: string | null
          course_id: string | null
          created_at: string | null
          id: string
          last_position_seconds: number | null
          lesson_id: string | null
          progress_percent: number | null
          status: string | null
          updated_at: string | null
          user_id: string
          watch_time_seconds: number | null
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          last_position_seconds?: number | null
          lesson_id?: string | null
          progress_percent?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          watch_time_seconds?: number | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          last_position_seconds?: number | null
          lesson_id?: string | null
          progress_percent?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_projects: {
        Row: {
          budget_estimate: number | null
          category: string | null
          collaborators: string[] | null
          cover_image: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          name: string
          progress: number | null
          settings: Json | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          target_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_estimate?: number | null
          category?: string | null
          collaborators?: string[] | null
          cover_image?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          name: string
          progress?: number | null
          settings?: Json | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          target_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_estimate?: number | null
          category?: string | null
          collaborators?: string[] | null
          cover_image?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          name?: string
          progress?: number | null
          settings?: Json | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          target_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          settings_key: string
          settings_value: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          settings_key: string
          settings_value: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          settings_key?: string
          settings_value?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          streak_start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          billing_cycle: string | null
          created_at: string | null
          discount_code_id: string | null
          expires_at: string
          id: string
          payment_amount: number | null
          payment_confirmed_at: string | null
          payment_status: string | null
          payment_transaction_id: string | null
          plan_id: string
          starts_at: string
          status: string
          updated_at: string | null
          user_email: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          billing_cycle?: string | null
          created_at?: string | null
          discount_code_id?: string | null
          expires_at?: string
          id?: string
          payment_amount?: number | null
          payment_confirmed_at?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          plan_id: string
          starts_at?: string
          status?: string
          updated_at?: string | null
          user_email?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          billing_cycle?: string | null
          created_at?: string | null
          discount_code_id?: string | null
          expires_at?: string
          id?: string
          payment_amount?: number | null
          payment_confirmed_at?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          plan_id?: string
          starts_at?: string
          status?: string
          updated_at?: string | null
          user_email?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp: {
        Row: {
          current_level: number | null
          id: string
          total_achievements: number | null
          total_courses_completed: number | null
          total_revenue_generated: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
          xp_to_next_level: number | null
        }
        Insert: {
          current_level?: number | null
          id?: string
          total_achievements?: number | null
          total_courses_completed?: number | null
          total_revenue_generated?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
          xp_to_next_level?: number | null
        }
        Update: {
          current_level?: number | null
          id?: string
          total_achievements?: number | null
          total_courses_completed?: number | null
          total_revenue_generated?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
          xp_to_next_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_xp"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_xp"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp_history: {
        Row: {
          action_key: string
          created_at: string | null
          id: string
          source_id: string | null
          source_type: string | null
          user_id: string
          xp_earned: number
        }
        Insert: {
          action_key: string
          created_at?: string | null
          id?: string
          source_id?: string | null
          source_type?: string | null
          user_id: string
          xp_earned: number
        }
        Update: {
          action_key?: string
          created_at?: string | null
          id?: string
          source_id?: string | null
          source_type?: string | null
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      user_xp_log: {
        Row: {
          action_id: string
          earned_at: string | null
          id: string
          related_id: string | null
          related_type: string | null
          user_id: string
          xp_earned: number
        }
        Insert: {
          action_id: string
          earned_at?: string | null
          id?: string
          related_id?: string | null
          related_type?: string | null
          user_id: string
          xp_earned: number
        }
        Update: {
          action_id?: string
          earned_at?: string | null
          id?: string
          related_id?: string | null
          related_type?: string | null
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_xp_log_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "xp_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp_summary: {
        Row: {
          current_level: number | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
          xp_to_next_level: number | null
        }
        Insert: {
          current_level?: number | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
          xp_to_next_level?: number | null
        }
        Update: {
          current_level?: number | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
          xp_to_next_level?: number | null
        }
        Relationships: []
      }
      veo_usage_logs: {
        Row: {
          aspect_ratio: string | null
          completed_at: string | null
          created_at: string | null
          duration_seconds: number | null
          episode_title: string | null
          error_code: string | null
          error_message: string | null
          estimated_cost_usd: number | null
          generation_time_seconds: number | null
          id: string
          image_size_bytes: number | null
          image_url: string | null
          metadata: Json | null
          model: string
          operation_name: string
          price_per_second: number | null
          production_id: string | null
          prompt: string | null
          prompt_tokens: number | null
          request_type: string
          resolution: string | null
          scene_id: string | null
          scene_number: number | null
          started_at: string | null
          status: string
          total_video_seconds: number | null
          user_id: string | null
          video_duration_actual: number | null
          video_size_bytes: number | null
          video_url: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          episode_title?: string | null
          error_code?: string | null
          error_message?: string | null
          estimated_cost_usd?: number | null
          generation_time_seconds?: number | null
          id?: string
          image_size_bytes?: number | null
          image_url?: string | null
          metadata?: Json | null
          model?: string
          operation_name: string
          price_per_second?: number | null
          production_id?: string | null
          prompt?: string | null
          prompt_tokens?: number | null
          request_type: string
          resolution?: string | null
          scene_id?: string | null
          scene_number?: number | null
          started_at?: string | null
          status?: string
          total_video_seconds?: number | null
          user_id?: string | null
          video_duration_actual?: number | null
          video_size_bytes?: number | null
          video_url?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          episode_title?: string | null
          error_code?: string | null
          error_message?: string | null
          estimated_cost_usd?: number | null
          generation_time_seconds?: number | null
          id?: string
          image_size_bytes?: number | null
          image_url?: string | null
          metadata?: Json | null
          model?: string
          operation_name?: string
          price_per_second?: number | null
          production_id?: string | null
          prompt?: string | null
          prompt_tokens?: number | null
          request_type?: string
          resolution?: string | null
          scene_id?: string | null
          scene_number?: number | null
          started_at?: string | null
          status?: string
          total_video_seconds?: number | null
          user_id?: string | null
          video_duration_actual?: number | null
          video_size_bytes?: number | null
          video_url?: string | null
        }
        Relationships: []
      }
      video_productions: {
        Row: {
          channel_id: string | null
          completed_scenes: number | null
          created_at: string | null
          episode_id: string | null
          episode_number: number | null
          episode_title: string
          final_video_url: string | null
          id: string
          scenes: Json | null
          script_content: string | null
          series_id: string | null
          settings: Json | null
          status: string | null
          total_scenes: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          completed_scenes?: number | null
          created_at?: string | null
          episode_id?: string | null
          episode_number?: number | null
          episode_title: string
          final_video_url?: string | null
          id?: string
          scenes?: Json | null
          script_content?: string | null
          series_id?: string | null
          settings?: Json | null
          status?: string | null
          total_scenes?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          completed_scenes?: number | null
          created_at?: string | null
          episode_id?: string | null
          episode_number?: number | null
          episode_title?: string
          final_video_url?: string | null
          id?: string
          scenes?: Json | null
          script_content?: string | null
          series_id?: string | null
          settings?: Json | null
          status?: string | null
          total_scenes?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      video_transcripts: {
        Row: {
          auto_generated: boolean | null
          created_at: string | null
          id: string
          language: string | null
          lesson_id: string
          timestamps: Json | null
          transcript_text: string
          updated_at: string | null
        }
        Insert: {
          auto_generated?: boolean | null
          created_at?: string | null
          id?: string
          language?: string | null
          lesson_id: string
          timestamps?: Json | null
          transcript_text: string
          updated_at?: string | null
        }
        Update: {
          auto_generated?: boolean | null
          created_at?: string | null
          id?: string
          language?: string | null
          lesson_id?: string
          timestamps?: Json | null
          transcript_text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_transcripts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      web_vitals_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_name: string
          metric_value: number
          page_url: string
          rating: string | null
          recorded_at: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_name: string
          metric_value: number
          page_url: string
          rating?: string | null
          recorded_at?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_name?: string
          metric_value?: number
          page_url?: string
          rating?: string | null
          recorded_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          amount: number | null
          created_at: string | null
          error_message: string | null
          id: string
          matched_subscription_id: string | null
          matched_user_id: string | null
          max_retries: number | null
          next_retry_at: string | null
          payload: Json
          processed_at: string | null
          retry_count: number | null
          signature: string | null
          status: string | null
          transfer_content: string | null
          webhook_type: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          matched_subscription_id?: string | null
          matched_user_id?: string | null
          max_retries?: number | null
          next_retry_at?: string | null
          payload: Json
          processed_at?: string | null
          retry_count?: number | null
          signature?: string | null
          status?: string | null
          transfer_content?: string | null
          webhook_type?: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          matched_subscription_id?: string | null
          matched_user_id?: string | null
          max_retries?: number | null
          next_retry_at?: string | null
          payload?: Json
          processed_at?: string | null
          retry_count?: number | null
          signature?: string | null
          status?: string | null
          transfer_content?: string | null
          webhook_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_matched_subscription_id_fkey"
            columns: ["matched_subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_logs_matched_user_id_fkey"
            columns: ["matched_user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_logs_matched_user_id_fkey"
            columns: ["matched_user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      website_blog_posts: {
        Row: {
          author_id: string | null
          category: string
          content_en: string
          content_vi: string
          cover_image_url: string | null
          created_at: string | null
          excerpt_en: string | null
          excerpt_vi: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          read_time_minutes: number | null
          slug: string
          tags: string[] | null
          title_en: string
          title_vi: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          category: string
          content_en: string
          content_vi: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt_en?: string | null
          excerpt_vi?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug: string
          tags?: string[] | null
          title_en: string
          title_vi: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string
          content_en?: string
          content_vi?: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt_en?: string | null
          excerpt_vi?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug?: string
          tags?: string[] | null
          title_en?: string
          title_vi?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "website_blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      website_projects: {
        Row: {
          category: string | null
          client_name: string | null
          created_at: string | null
          created_by: string | null
          demo_url: string | null
          description_en: string
          description_vi: string
          full_description_en: string | null
          full_description_vi: string | null
          github_url: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          project_date: string | null
          sort_order: number | null
          tech_stack: string[] | null
          title_en: string
          title_vi: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          client_name?: string | null
          created_at?: string | null
          created_by?: string | null
          demo_url?: string | null
          description_en: string
          description_vi: string
          full_description_en?: string | null
          full_description_vi?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          project_date?: string | null
          sort_order?: number | null
          tech_stack?: string[] | null
          title_en: string
          title_vi: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          client_name?: string | null
          created_at?: string | null
          created_by?: string | null
          demo_url?: string | null
          description_en?: string
          description_vi?: string
          full_description_en?: string | null
          full_description_vi?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          project_date?: string | null
          sort_order?: number | null
          tech_stack?: string[] | null
          title_en?: string
          title_vi?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      website_services: {
        Row: {
          created_at: string | null
          created_by: string | null
          description_en: string
          description_vi: string
          icon: string
          id: string
          is_published: boolean | null
          sort_order: number | null
          tech_stack: string[] | null
          title_en: string
          title_vi: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description_en: string
          description_vi: string
          icon: string
          id?: string
          is_published?: boolean | null
          sort_order?: number | null
          tech_stack?: string[] | null
          title_en: string
          title_vi: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description_en?: string
          description_vi?: string
          icon?: string
          id?: string
          is_published?: boolean | null
          sort_order?: number | null
          tech_stack?: string[] | null
          title_en?: string
          title_vi?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_services_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_services_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      website_settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      website_stats: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          label_en: string
          label_vi: string
          sort_order: number | null
          stat_key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label_en: string
          label_vi: string
          sort_order?: number | null
          stat_key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label_en?: string
          label_vi?: string
          sort_order?: number | null
          stat_key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      website_tech_stack: {
        Row: {
          category: string
          created_at: string | null
          description_en: string | null
          description_vi: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          proficiency_level: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description_en?: string | null
          description_vi?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          proficiency_level?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description_en?: string | null
          description_vi?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          proficiency_level?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      website_testimonials: {
        Row: {
          client_avatar_url: string | null
          client_company: string | null
          client_name: string
          client_title: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          project_id: string | null
          rating: number | null
          sort_order: number | null
          testimonial_en: string
          testimonial_vi: string
          updated_at: string | null
        }
        Insert: {
          client_avatar_url?: string | null
          client_company?: string | null
          client_name: string
          client_title?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          project_id?: string | null
          rating?: number | null
          sort_order?: number | null
          testimonial_en: string
          testimonial_vi: string
          updated_at?: string | null
        }
        Update: {
          client_avatar_url?: string | null
          client_company?: string | null
          client_name?: string
          client_title?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          project_id?: string | null
          rating?: number | null
          sort_order?: number | null
          testimonial_en?: string
          testimonial_vi?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_testimonials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "website_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          created_by: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          output_data: Json | null
          project_id: string | null
          started_at: string | null
          status: string | null
          workflow_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_by?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          project_id?: string | null
          started_at?: string | null
          status?: string | null
          workflow_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_by?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          project_id?: string | null
          started_at?: string | null
          status?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_metrics: {
        Row: {
          cost_usd: number | null
          created_at: string | null
          execution_id: string | null
          execution_time_ms: number | null
          id: string
          metadata: Json | null
          node_id: string | null
          success: boolean | null
          workflow_id: string
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string | null
          execution_id?: string | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          node_id?: string | null
          success?: boolean | null
          workflow_id: string
        }
        Update: {
          cost_usd?: number | null
          created_at?: string | null
          execution_id?: string | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          node_id?: string | null
          success?: boolean | null
          workflow_id?: string
        }
        Relationships: []
      }
      workflow_templates: {
        Row: {
          category: string
          clone_count: number | null
          config_schema: Json | null
          created_at: string | null
          created_by: string | null
          default_config: Json | null
          description: string | null
          icon: string | null
          id: string
          is_public: boolean | null
          n8n_template_id: string | null
          n8n_template_json: Json | null
          name: string
          required_credentials: string[] | null
          slug: string
          status: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          category?: string
          clone_count?: number | null
          config_schema?: Json | null
          created_at?: string | null
          created_by?: string | null
          default_config?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          n8n_template_id?: string | null
          n8n_template_json?: Json | null
          name: string
          required_credentials?: string[] | null
          slug: string
          status?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          category?: string
          clone_count?: number | null
          config_schema?: Json | null
          created_at?: string | null
          created_by?: string | null
          default_config?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          n8n_template_id?: string | null
          n8n_template_json?: Json | null
          name?: string
          required_credentials?: string[] | null
          slug?: string
          status?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      workflows: {
        Row: {
          agent_id: string | null
          created_at: string | null
          description: string | null
          id: string
          last_execution: string | null
          name: string
          status: string | null
          steps: Json
          successful_executions: number | null
          total_executions: number | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_execution?: string | null
          name: string
          status?: string | null
          steps?: Json
          successful_executions?: number | null
          total_executions?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_execution?: string | null
          name?: string
          status?: string | null
          steps?: Json
          successful_executions?: number | null
          total_executions?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflows_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_actions: {
        Row: {
          action_key: string
          action_name: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          max_daily: number | null
          xp_amount: number
        }
        Insert: {
          action_key: string
          action_name: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          max_daily?: number | null
          xp_amount: number
        }
        Update: {
          action_key?: string
          action_name?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          max_daily?: number | null
          xp_amount?: number
        }
        Relationships: []
      }
      zalo_batch_jobs: {
        Row: {
          batch_name: string | null
          completed_at: string | null
          created_at: string | null
          failed_count: number | null
          id: string
          message_type: string
          oa_id: string
          started_at: string | null
          status: string | null
          success_count: number | null
          total_count: number | null
        }
        Insert: {
          batch_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          failed_count?: number | null
          id?: string
          message_type: string
          oa_id: string
          started_at?: string | null
          status?: string | null
          success_count?: number | null
          total_count?: number | null
        }
        Update: {
          batch_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          failed_count?: number | null
          id?: string
          message_type?: string
          oa_id?: string
          started_at?: string | null
          status?: string | null
          success_count?: number | null
          total_count?: number | null
        }
        Relationships: []
      }
      zalo_campaign_targets: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          converted_at: string | null
          created_at: string | null
          customer_id: string
          delivered_at: string | null
          error_message: string | null
          id: string
          message_id: string | null
          opened_at: string | null
          retry_count: number | null
          sent_at: string | null
          status: string | null
          updated_at: string | null
          voucher_code: string | null
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          customer_id: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_id?: string | null
          opened_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
          voucher_code?: string | null
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          customer_id?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_id?: string | null
          opened_at?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
          voucher_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zalo_campaign_targets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "zalo_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zalo_campaign_targets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "zalo_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      zalo_campaigns: {
        Row: {
          auto_followup: boolean | null
          campaign_type: string
          clicked_count: number | null
          completed_at: string | null
          converted_count: number | null
          created_at: string | null
          created_by: string | null
          delay_between_messages: number | null
          delivered_count: number | null
          description: string | null
          followup_days: number | null
          id: string
          message_template_id: string | null
          name: string
          oa_id: string
          opened_count: number | null
          scheduled_at: string | null
          sent_count: number | null
          started_at: string | null
          status: string | null
          target_filter: Json | null
          target_segment: string | null
          total_targets: number | null
          updated_at: string | null
        }
        Insert: {
          auto_followup?: boolean | null
          campaign_type: string
          clicked_count?: number | null
          completed_at?: string | null
          converted_count?: number | null
          created_at?: string | null
          created_by?: string | null
          delay_between_messages?: number | null
          delivered_count?: number | null
          description?: string | null
          followup_days?: number | null
          id?: string
          message_template_id?: string | null
          name: string
          oa_id: string
          opened_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string | null
          target_filter?: Json | null
          target_segment?: string | null
          total_targets?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_followup?: boolean | null
          campaign_type?: string
          clicked_count?: number | null
          completed_at?: string | null
          converted_count?: number | null
          created_at?: string | null
          created_by?: string | null
          delay_between_messages?: number | null
          delivered_count?: number | null
          description?: string | null
          followup_days?: number | null
          id?: string
          message_template_id?: string | null
          name?: string
          oa_id?: string
          opened_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string | null
          target_filter?: Json | null
          target_segment?: string | null
          total_targets?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      zalo_customer_vouchers: {
        Row: {
          assigned_at: string | null
          campaign_id: string | null
          customer_id: string
          expired_at: string | null
          id: string
          order_amount: number | null
          personal_code: string
          sent_at: string | null
          status: string | null
          used_amount: number | null
          used_at: string | null
          viewed_at: string | null
          voucher_id: string
        }
        Insert: {
          assigned_at?: string | null
          campaign_id?: string | null
          customer_id: string
          expired_at?: string | null
          id?: string
          order_amount?: number | null
          personal_code: string
          sent_at?: string | null
          status?: string | null
          used_amount?: number | null
          used_at?: string | null
          viewed_at?: string | null
          voucher_id: string
        }
        Update: {
          assigned_at?: string | null
          campaign_id?: string | null
          customer_id?: string
          expired_at?: string | null
          id?: string
          order_amount?: number | null
          personal_code?: string
          sent_at?: string | null
          status?: string | null
          used_amount?: number | null
          used_at?: string | null
          viewed_at?: string | null
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zalo_customer_vouchers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "zalo_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zalo_customer_vouchers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "zalo_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zalo_customer_vouchers_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "zalo_vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      zalo_customers: {
        Row: {
          average_spend: number | null
          created_at: string | null
          customer_segment: string | null
          first_visit_date: string | null
          id: string
          is_follower: boolean | null
          last_campaign_id: string | null
          last_contacted_at: string | null
          last_sent_at: string | null
          last_visit_date: string | null
          name: string
          notes: string | null
          oa_id: string
          opt_out_reason: string | null
          opted_out: boolean | null
          phone: string
          review_count: number | null
          status: string | null
          total_spend: number | null
          total_visits: number | null
          updated_at: string | null
          zalo_user_id: string | null
        }
        Insert: {
          average_spend?: number | null
          created_at?: string | null
          customer_segment?: string | null
          first_visit_date?: string | null
          id?: string
          is_follower?: boolean | null
          last_campaign_id?: string | null
          last_contacted_at?: string | null
          last_sent_at?: string | null
          last_visit_date?: string | null
          name: string
          notes?: string | null
          oa_id: string
          opt_out_reason?: string | null
          opted_out?: boolean | null
          phone: string
          review_count?: number | null
          status?: string | null
          total_spend?: number | null
          total_visits?: number | null
          updated_at?: string | null
          zalo_user_id?: string | null
        }
        Update: {
          average_spend?: number | null
          created_at?: string | null
          customer_segment?: string | null
          first_visit_date?: string | null
          id?: string
          is_follower?: boolean | null
          last_campaign_id?: string | null
          last_contacted_at?: string | null
          last_sent_at?: string | null
          last_visit_date?: string | null
          name?: string
          notes?: string | null
          oa_id?: string
          opt_out_reason?: string | null
          opted_out?: boolean | null
          phone?: string
          review_count?: number | null
          status?: string | null
          total_spend?: number | null
          total_visits?: number | null
          updated_at?: string | null
          zalo_user_id?: string | null
        }
        Relationships: []
      }
      zalo_message_templates: {
        Row: {
          buttons: Json | null
          content: string
          content_variables: string[] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          oa_id: string
          preview_image_url: string | null
          template_type: string
          updated_at: string | null
        }
        Insert: {
          buttons?: Json | null
          content: string
          content_variables?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          oa_id: string
          preview_image_url?: string | null
          template_type: string
          updated_at?: string | null
        }
        Update: {
          buttons?: Json | null
          content?: string
          content_variables?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          oa_id?: string
          preview_image_url?: string | null
          template_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      zalo_messages: {
        Row: {
          content: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          error_message: string | null
          id: string
          message_type: string
          oa_id: string
          sent_at: string | null
          status: string | null
          zalo_message_id: string | null
        }
        Insert: {
          content?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          error_message?: string | null
          id?: string
          message_type: string
          oa_id: string
          sent_at?: string | null
          status?: string | null
          zalo_message_id?: string | null
        }
        Update: {
          content?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          error_message?: string | null
          id?: string
          message_type?: string
          oa_id?: string
          sent_at?: string | null
          status?: string | null
          zalo_message_id?: string | null
        }
        Relationships: []
      }
      zalo_oa_config: {
        Row: {
          app_id: string
          business_address: string | null
          business_name: string
          business_phone: string | null
          created_at: string | null
          google_review_link: string | null
          id: string
          num_followers: number | null
          oa_id: string
          oa_name: string
          updated_at: string | null
        }
        Insert: {
          app_id: string
          business_address?: string | null
          business_name: string
          business_phone?: string | null
          created_at?: string | null
          google_review_link?: string | null
          id?: string
          num_followers?: number | null
          oa_id: string
          oa_name: string
          updated_at?: string | null
        }
        Update: {
          app_id?: string
          business_address?: string | null
          business_name?: string
          business_phone?: string | null
          created_at?: string | null
          google_review_link?: string | null
          id?: string
          num_followers?: number | null
          oa_id?: string
          oa_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      zalo_tracking_events: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          customer_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          message_id: string | null
          source: string | null
          user_agent: string | null
          voucher_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          message_id?: string | null
          source?: string | null
          user_agent?: string | null
          voucher_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          message_id?: string | null
          source?: string | null
          user_agent?: string | null
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zalo_tracking_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "zalo_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zalo_tracking_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "zalo_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zalo_tracking_events_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "zalo_vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      zalo_vouchers: {
        Row: {
          applicable_days: string[] | null
          applicable_hours: string | null
          campaign_id: string | null
          code: string
          created_at: string | null
          current_uses: number | null
          description: string | null
          id: string
          max_discount: number | null
          max_uses: number | null
          max_uses_per_customer: number | null
          min_spend: number | null
          oa_id: string
          status: string | null
          terms_conditions: string | null
          title: string
          updated_at: string | null
          valid_from: string | null
          valid_until: string
          value: number
          value_unit: string | null
          voucher_type: string
        }
        Insert: {
          applicable_days?: string[] | null
          applicable_hours?: string | null
          campaign_id?: string | null
          code: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          id?: string
          max_discount?: number | null
          max_uses?: number | null
          max_uses_per_customer?: number | null
          min_spend?: number | null
          oa_id: string
          status?: string | null
          terms_conditions?: string | null
          title: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until: string
          value: number
          value_unit?: string | null
          voucher_type: string
        }
        Update: {
          applicable_days?: string[] | null
          applicable_hours?: string | null
          campaign_id?: string | null
          code?: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          id?: string
          max_discount?: number | null
          max_uses?: number | null
          max_uses_per_customer?: number | null
          min_spend?: number | null
          oa_id?: string
          status?: string | null
          terms_conditions?: string | null
          title?: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string
          value?: number
          value_unit?: string | null
          voucher_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "zalo_vouchers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "zalo_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      ai_usage_daily_summary: {
        Row: {
          avg_response_time_ms: number | null
          content_type: string | null
          error_count: number | null
          generation_count: number | null
          total_cost_usd: number | null
          total_input_tokens: number | null
          total_output_tokens: number | null
          total_tokens: number | null
          usage_date: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_limits: {
        Row: {
          blogs_today: number | null
          projects_today: number | null
          services_today: number | null
          total_cost_today: number | null
          total_generations_today: number | null
          usage_date: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_24h_overview: {
        Row: {
          avg_load_time: number | null
          error_count: number | null
          product_name: string | null
          sessions: number | null
          total_events: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      app_showcase_published: {
        Row: {
          app_id: string | null
          app_name: string | null
          branding: Json | null
          cta: Json | null
          description: string | null
          downloads: Json | null
          features: Json | null
          hero: Json | null
          id: string | null
          published_at: string | null
          social: Json | null
          tagline: string | null
          updated_at: string | null
        }
        Insert: {
          app_id?: string | null
          app_name?: string | null
          branding?: Json | null
          cta?: Json | null
          description?: string | null
          downloads?: Json | null
          features?: Json | null
          hero?: Json | null
          id?: string | null
          published_at?: string | null
          social?: Json | null
          tagline?: string | null
          updated_at?: string | null
        }
        Update: {
          app_id?: string | null
          app_name?: string | null
          branding?: Json | null
          cta?: Json | null
          description?: string | null
          downloads?: Json | null
          features?: Json | null
          hero?: Json | null
          id?: string | null
          published_at?: string | null
          social?: Json | null
          tagline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      brain_analytics_daily_user_activity: {
        Row: {
          date: string | null
          event_count: number | null
          event_type: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_analytics_domain_usage: {
        Row: {
          date: string | null
          domain_id: string | null
          event_count: number | null
          event_type: string | null
          unique_users: number | null
        }
        Relationships: []
      }
      brain_analytics_query_patterns: {
        Row: {
          avg_response_time: number | null
          date: string | null
          domains_queried: number | null
          query_count: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_audit_logs_summary: {
        Row: {
          action: string | null
          action_count: number | null
          last_action_at: string | null
          resource_type: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_core_logic_version_history: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          change_count: number | null
          change_reason: string | null
          change_summary: string | null
          created_at: string | null
          domain_id: string | null
          id: string | null
          is_active: boolean | null
          last_distilled_at: string | null
          parent_version_id: string | null
          updated_at: string | null
          user_id: string | null
          version: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          change_count?: never
          change_reason?: string | null
          change_summary?: string | null
          created_at?: string | null
          domain_id?: string | null
          id?: string | null
          is_active?: boolean | null
          last_distilled_at?: string | null
          parent_version_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          change_count?: never
          change_reason?: string | null
          change_summary?: string | null
          created_at?: string | null
          domain_id?: string | null
          id?: string | null
          is_active?: boolean | null
          last_distilled_at?: string | null
          parent_version_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_core_logic_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_core_logic_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_core_logic_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "brain_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_core_logic_parent_version_id_fkey"
            columns: ["parent_version_id"]
            isOneToOne: false
            referencedRelation: "brain_core_logic"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_core_logic_parent_version_id_fkey"
            columns: ["parent_version_id"]
            isOneToOne: false
            referencedRelation: "brain_core_logic_version_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_core_logic_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_core_logic_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts_with_latest_activity: {
        Row: {
          assigned_to: string | null
          assigned_to_avatar: string | null
          assigned_to_name: string | null
          budget: string | null
          company: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          deal_value: number | null
          email: string | null
          id: string | null
          is_archived: boolean | null
          last_contacted_at: string | null
          latest_activity: Json | null
          lead_score: number | null
          lost_at: string | null
          lost_reason: string | null
          message: string | null
          name: string | null
          next_follow_up: string | null
          notes_count: number | null
          pending_tasks_count: number | null
          phone: string | null
          pipeline_stage: string | null
          priority: string | null
          service: string | null
          source: string | null
          status: string | null
          subscribe_newsletter: boolean | null
          tags: string[] | null
          updated_at: string | null
          won_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_revenue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_xp"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_stats: {
        Row: {
          active_tasks: number | null
          leads_today: number | null
          overdue_tasks: number | null
          pipeline_value: number | null
          total_leads: number | null
          total_lost: number | null
          total_revenue: number | null
          total_won: number | null
        }
        Relationships: []
      }
      leaderboard_revenue: {
        Row: {
          avatar_url: string | null
          current_level: number | null
          email: string | null
          full_name: string | null
          id: string | null
          rank: number | null
          total_revenue_generated: number | null
          total_xp: number | null
        }
        Relationships: []
      }
      leaderboard_xp: {
        Row: {
          avatar_url: string | null
          current_level: number | null
          email: string | null
          full_name: string | null
          id: string | null
          rank: number | null
          total_achievements: number | null
          total_courses_completed: number | null
          total_xp: number | null
        }
        Relationships: []
      }
      project_workflows: {
        Row: {
          auto_trigger_events: string[] | null
          average_execution_time_ms: number | null
          config: Json | null
          created_at: string | null
          created_by: string | null
          credential_mappings: Json | null
          description: string | null
          failed_executions: number | null
          id: string | null
          is_enabled: boolean | null
          last_execution_at: string | null
          last_execution_status: string | null
          n8n_workflow_id: string | null
          n8n_workflow_json: Json | null
          name: string | null
          notes: string | null
          project_id: string | null
          schedule_cron: string | null
          status: string | null
          successful_executions: number | null
          template_id: string | null
          total_cost_usd: number | null
          total_executions: number | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          auto_trigger_events?: string[] | null
          average_execution_time_ms?: number | null
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          credential_mappings?: Json | null
          description?: string | null
          failed_executions?: number | null
          id?: string | null
          is_enabled?: boolean | null
          last_execution_at?: string | null
          last_execution_status?: string | null
          n8n_workflow_id?: string | null
          n8n_workflow_json?: Json | null
          name?: string | null
          notes?: string | null
          project_id?: string | null
          schedule_cron?: string | null
          status?: string | null
          successful_executions?: number | null
          template_id?: string | null
          total_cost_usd?: number | null
          total_executions?: number | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          auto_trigger_events?: string[] | null
          average_execution_time_ms?: number | null
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          credential_mappings?: Json | null
          description?: string | null
          failed_executions?: number | null
          id?: string | null
          is_enabled?: boolean | null
          last_execution_at?: string | null
          last_execution_status?: string | null
          n8n_workflow_id?: string | null
          n8n_workflow_json?: Json | null
          name?: string | null
          notes?: string | null
          project_id?: string | null
          schedule_cron?: string | null
          status?: string | null
          successful_executions?: number | null
          template_id?: string | null
          total_cost_usd?: number | null
          total_executions?: number | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_workflow_instances_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_workflow_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      v_pending_decisions: {
        Row: {
          high_impact_count: number | null
          immediate_count: number | null
          today_count: number | null
          total_pending: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_session_context: {
        Args: {
          p_context_embedding?: string
          p_context_text: string
          p_context_type?: string
          p_domain_id: string
          p_session_id: string
          p_user_id: string
        }
        Returns: string
      }
      aggregate_daily_ai_stats: {
        Args: { p_date?: string }
        Returns: undefined
      }
      brain_search: {
        Args: {
          embedding_text: string
          filter_domain_id?: string
          max_results?: number
          threshold?: number
        }
        Returns: {
          content: string
          domain_id: string
          id: string
          similarity: number
          title: string
        }[]
      }
      build_graph_from_knowledge: {
        Args: { p_domain_id: string; p_user_id: string }
        Returns: Json
      }
      calculate_routing_accuracy: {
        Args: { p_time_range_hours?: number; p_user_id: string }
        Returns: number
      }
      check_agent_budget: { Args: { p_agent_id: string }; Returns: boolean }
      check_ai_usage_limit: {
        Args: {
          p_content_type: string
          p_daily_limit?: number
          p_user_id: string
        }
        Returns: boolean
      }
      check_brain_quota: {
        Args: { p_action: string; p_user_id: string }
        Returns: Json
      }
      check_budget_threshold: {
        Args: { p_agent_id: string }
        Returns: undefined
      }
      classify_error: {
        Args: { p_error_message: string; p_error_stack?: string }
        Returns: string
      }
      compare_core_logic_versions: {
        Args: {
          p_user_id: string
          p_version1_id: string
          p_version2_id: string
        }
        Returns: Json
      }
      create_budget_alert: {
        Args: {
          p_agent_id: string
          p_alert_type: string
          p_current_amount?: number
          p_message: string
          p_threshold_amount?: number
        }
        Returns: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          agent_id: string | null
          alert_type: string
          created_at: string | null
          current_amount: number | null
          id: string
          message: string
          threshold_amount: number | null
        }
        SetofOptions: {
          from: "*"
          to: "budget_alerts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_master_session: {
        Args: {
          p_domain_ids: string[]
          p_session_name: string
          p_session_type?: string
          p_user_id: string
        }
        Returns: string
      }
      create_or_update_bug_report: {
        Args: { p_error_log_id: string }
        Returns: string
      }
      detect_error_patterns: {
        Args: { p_days?: number; p_min_occurrences?: number }
        Returns: {
          category: string
          error_message_sample: string
          error_type: string
          first_seen_at: string
          last_seen_at: string
          occurrence_count: number
          pattern_signature: string
        }[]
      }
      end_master_session: {
        Args: {
          p_feedback?: string
          p_rating?: number
          p_session_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      exec_raw_sql: { Args: { query: string }; Returns: Json }
      exec_safe_sql: { Args: { query: string }; Returns: Json }
      expire_subscriptions: { Args: never; Returns: Json }
      find_graph_paths: {
        Args: {
          p_max_depth?: number
          p_source_node_id: string
          p_target_node_id: string
          p_user_id: string
        }
        Returns: {
          path_edges: string[]
          path_id: number
          path_length: number
          path_nodes: string[]
          total_weight: number
        }[]
      }
      generate_ticket_number: { Args: never; Returns: string }
      get_ai_context: {
        Args: { p_user_id?: string }
        Returns: {
          active_goals: Json
          businesses: Json
          profile: Json
          projects: Json
          skills: Json
        }[]
      }
      get_all_pricing: {
        Args: never
        Returns: {
          details: Json
          price_display: string
          service_name: string
          timeline: string
        }[]
      }
      get_brain_images_by_categories: {
        Args: { p_categories: string[]; p_user_id: string }
        Returns: {
          analysis: Json
          analyzed_at: string | null
          character_name: string | null
          collections: string[] | null
          created_at: string | null
          custom_description: string | null
          custom_tags: string[] | null
          custom_title: string | null
          domain_id: string | null
          embedding: string | null
          embedding_model: string | null
          file_size: number | null
          folder_id: string | null
          format: string | null
          height: number | null
          id: string
          image_url: string
          is_archived: boolean | null
          is_favorite: boolean | null
          is_owner_portrait: boolean | null
          last_used_at: string | null
          local_path: string | null
          original_filename: string | null
          thumbnail_url: string | null
          updated_at: string | null
          use_count: number | null
          user_id: string
          width: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "brain_images"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_chat_credits: { Args: { p_user_id: string }; Returns: Json }
      get_company_setting: { Args: { p_key: string }; Returns: Json }
      get_company_settings_by_category: {
        Args: { p_category: string }
        Returns: {
          key: string
          value: Json
        }[]
      }
      get_credit_config: { Args: { p_plan: string }; Returns: Json }
      get_current_promotion: { Args: never; Returns: Json }
      get_daily_stats: {
        Args: { p_days?: number; p_product_name: string }
        Returns: {
          avg_time: number
          conversions: number
          date: string
          page_views: number
          unique_visitors: number
        }[]
      }
      get_domain_agent_context: {
        Args: { p_domain_id: string; p_user_id: string }
        Returns: Json
      }
      get_error_statistics: {
        Args: { p_days?: number }
        Returns: {
          avg_errors_per_day: number
          critical_errors: number
          errors_by_category: Json
          errors_by_type: Json
          high_errors: number
          low_errors: number
          medium_errors: number
          total_errors: number
        }[]
      }
      get_expiring_subscriptions: {
        Args: { p_days?: number }
        Returns: {
          days_remaining: number
          expires_at: string
          plan_id: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      get_healing_statistics: {
        Args: { p_days?: number }
        Returns: {
          actions_by_type: Json
          avg_execution_time_ms: number
          failed_actions: number
          success_rate: number
          successful_actions: number
          total_actions: number
        }[]
      }
      get_latest_core_logic: {
        Args: { p_domain_id: string; p_user_id: string }
        Returns: {
          anti_patterns: Json
          changelog: Json
          cross_domain_links: Json
          decision_rules: Json
          domain_id: string
          first_principles: Json
          id: string
          is_active: boolean
          last_distilled_at: string
          mental_models: Json
          version: number
        }[]
      }
      get_next_distillation_job: {
        Args: never
        Returns: {
          config: Json
          domain_id: string
          id: string
          user_id: string
        }[]
      }
      get_product_overview: {
        Args: { p_product_name?: string }
        Returns: {
          active_users: number
          avg_response_time: number
          error_rate: number
          product: string
          total_users: number
          uptime: number
        }[]
      }
      get_related_concepts: {
        Args: { p_max_results?: number; p_node_id: string; p_user_id: string }
        Returns: {
          edge_type: string
          edge_weight: number
          node_id: string
          node_label: string
          node_type: string
          similarity_score: number
        }[]
      }
      get_related_documents: {
        Args: { max_results?: number; source_id: string }
        Returns: {
          category: string
          content: string
          id: string
          similarity: number
          tags: string[]
          title: string
        }[]
      }
      get_remaining_generations: {
        Args: { p_daily_limit?: number; p_user_id: string }
        Returns: {
          blogs_used: number
          projects_used: number
          services_used: number
          total_cost_today: number
          total_remaining: number
          total_used: number
        }[]
      }
      get_session_context: {
        Args: { p_limit?: number; p_session_id: string; p_user_id: string }
        Returns: {
          context_id: string
          context_text: string
          context_type: string
          created_at: string
          domain_id: string
          domain_name: string
          relevance_score: number
        }[]
      }
      get_subscription_billing_date: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_system_performance_metrics: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: {
          metric_name: string
          metric_value: number
          unit: string
        }[]
      }
      get_user_behavior_analytics: {
        Args: { p_end_date: string; p_start_date: string; p_user_id: string }
        Returns: {
          avg_per_day: number
          event_count: number
          event_type: string
        }[]
      }
      get_user_daily_usage: {
        Args: { p_days?: number; p_user_id: string }
        Returns: {
          request_count: number
          total_cost_usd: number
          total_tokens: number
          usage_date: string
        }[]
      }
      get_user_feature_usage: {
        Args: { p_feature_key: string; p_period?: string; p_user_id: string }
        Returns: number
      }
      get_user_plan: {
        Args: { p_user_id: string }
        Returns: {
          features: Json
          limits: Json
          plan_display_name: string
          plan_name: string
          status: string
        }[]
      }
      get_user_subscription_plan: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_user_token_usage: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: {
          avg_tokens_per_request: number
          request_count: number
          total_completion_tokens: number
          total_cost_usd: number
          total_prompt_tokens: number
          total_tokens: number
        }[]
      }
      has_feature_access: {
        Args: { p_feature_key: string; p_user_id: string }
        Returns: boolean
      }
      hybrid_search_knowledge: {
        Args: {
          filter_category?: string
          filter_user_id?: string
          keyword_weight?: number
          match_count?: number
          query_embedding: string
          query_text: string
          semantic_weight?: number
        }
        Returns: {
          category: string
          combined_score: number
          content: string
          context_prefix: string
          id: string
          keyword_rank: number
          metadata: Json
          similarity: number
          tags: string[]
          title: string
        }[]
      }
      increment_agent_runs: {
        Args: { agent_id: string; success?: boolean }
        Returns: undefined
      }
      increment_brain_usage: {
        Args: { p_action: string; p_amount?: number; p_user_id: string }
        Returns: undefined
      }
      increment_image_use_count: {
        Args: { image_id: string }
        Returns: undefined
      }
      increment_template_usage: {
        Args: { template_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      log_audit_event: {
        Args: {
          p_action: string
          p_details?: Json
          p_ip_address?: unknown
          p_resource_id?: string
          p_resource_type: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      mark_distillation_job_complete: {
        Args: { p_core_logic_id: string; p_job_id: string; p_summary?: Json }
        Returns: undefined
      }
      mark_distillation_job_failed: {
        Args: { p_error: string; p_job_id: string }
        Returns: undefined
      }
      mark_overdue_tasks: { Args: never; Returns: undefined }
      match_documents: {
        Args: {
          filter_source_types?: string[]
          filter_user_id?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
          source_type: string
        }[]
      }
      match_knowledge: {
        Args: {
          match_count?: number
          match_threshold?: number
          p_domain_id?: string
          query_embedding: string
        }
        Returns: {
          content: string
          domain_id: string
          id: string
          similarity: number
          title: string
        }[]
      }
      match_knowledge_v2: {
        Args: {
          importance_weight?: number
          match_count?: number
          match_threshold?: number
          query_embedding: string
          time_decay_days?: number
          user_id_filter?: string
        }
        Returns: {
          content: string
          domain_id: string
          final_score: number
          id: string
          importance_score: number
          similarity: number
          source_url: string
          tags: string[]
          title: string
        }[]
      }
      refresh_analytics_views: { Args: never; Returns: undefined }
      reset_daily_budgets: { Args: never; Returns: undefined }
      reset_monthly_budgets: { Args: never; Returns: undefined }
      rollback_core_logic_version: {
        Args: {
          p_domain_id: string
          p_reason?: string
          p_target_version: number
          p_user_id: string
        }
        Returns: string
      }
      score_domain_relevance: {
        Args: {
          p_domain_id: string
          p_query_embedding: string
          p_query_text: string
          p_user_id: string
        }
        Returns: number
      }
      search_brain_images: {
        Args: {
          filter_category?: string
          filter_is_owner_portrait?: boolean
          filter_user_id?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          analysis: Json
          character_name: string
          custom_tags: string[]
          custom_title: string
          id: string
          image_url: string
          is_owner_portrait: boolean
          similarity: number
          thumbnail_url: string
          user_id: string
        }[]
      }
      search_by_topic: {
        Args: { max_results?: number; topic_name: string }
        Returns: {
          category: string
          content: string
          id: string
          relevance: number
          tags: string[]
          title: string
        }[]
      }
      search_knowledge: {
        Args: {
          match_count?: number
          match_threshold?: number
          p_domain_id?: string
          query_embedding: string
        }
        Returns: {
          content: string
          domain_id: string
          id: string
          similarity: number
          title: string
        }[]
      }
      select_relevant_domains: {
        Args: {
          p_max_domains?: number
          p_min_score?: number
          p_query_embedding: string
          p_query_text: string
          p_user_id: string
        }
        Returns: {
          domain_id: string
          domain_name: string
          rank: number
          relevance_score: number
        }[]
      }
      send_renewal_reminders: { Args: never; Returns: Json }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      track_agent_cost: {
        Args: {
          p_agent_id: string
          p_cost: number
          p_model: string
          p_tokens: number
        }
        Returns: boolean
      }
      track_analytics_event: {
        Args: {
          p_event_name: string
          p_event_type: string
          p_product_name: string
          p_properties?: Json
          p_session_id?: string
          p_user_id?: string
        }
        Returns: string
      }
      track_feature_usage: {
        Args: { p_feature_key: string; p_increment?: number; p_user_id: string }
        Returns: number
      }
      track_usage: {
        Args: { p_increment?: number; p_metric: string; p_user_id: string }
        Returns: undefined
      }
      traverse_graph: {
        Args: {
          p_max_depth?: number
          p_start_node_id: string
          p_user_id: string
        }
        Returns: {
          depth: number
          node_id: string
          node_label: string
          node_type: string
          path_from_start: string[]
        }[]
      }
      update_domain_stats: { Args: { p_domain_id: string }; Returns: undefined }
      update_orchestration_state: {
        Args: {
          p_analysis_results?: Json
          p_current_step: string
          p_gathered_context?: Json
          p_session_id: string
          p_step_progress?: number
          p_synthesis_data?: Json
          p_user_id: string
        }
        Returns: undefined
      }
      update_product_metrics: {
        Args: {
          p_active_users?: number
          p_error_rate?: number
          p_product_name: string
          p_response_time?: number
          p_uptime?: number
        }
        Returns: undefined
      }
      update_routing_performance: {
        Args: { p_domain_id: string; p_period_type?: string; p_user_id: string }
        Returns: undefined
      }
      update_routing_weight: {
        Args: { p_domain_id: string; p_success: boolean; p_user_id: string }
        Returns: undefined
      }
      use_chat_credit: { Args: { p_user_id: string }; Returns: Json }
      use_discount_code: { Args: { p_code_id: string }; Returns: undefined }
      validate_discount_code: {
        Args: {
          p_amount: number
          p_billing_cycle: string
          p_code: string
          p_plan_id: string
        }
        Returns: {
          discount_id: string
          discount_type: string
          discount_value: number
          error_message: string
          final_amount: number
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      job_status: "pending" | "processing" | "success" | "failed" | "cancelled"
      job_type:
        | "text-to-image"
        | "image-to-video"
        | "bg-removal"
        | "upscale"
        | "enhance-prompt"
        | "face-swap"
        | "style-transfer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      job_status: ["pending", "processing", "success", "failed", "cancelled"],
      job_type: [
        "text-to-image",
        "image-to-video",
        "bg-removal",
        "upscale",
        "enhance-prompt",
        "face-swap",
        "style-transfer",
      ],
    },
  },
} as const
