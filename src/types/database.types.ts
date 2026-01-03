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
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      analytics_visits: {
        Row: {
          browser: string | null
          created_at: string | null
          device_type: string | null
          id: string
          page_path: string
          post_id: string | null
          referrer: string | null
          view_duration: number | null
          visitor_hash: string | null
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          page_path: string
          post_id?: string | null
          referrer?: string | null
          view_duration?: number | null
          visitor_hash?: string | null
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          page_path?: string
          post_id?: string | null
          referrer?: string | null
          view_duration?: number | null
          visitor_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_visits_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          ai_response: string | null
          created_at: string | null
          id: string
          intent: string | null
          ip_address: string | null
          is_helpful: boolean | null
          model_used: string | null
          response_time_ms: number | null
          session_id: string
          user_agent: string | null
          user_message: string
        }
        Insert: {
          ai_response?: string | null
          created_at?: string | null
          id?: string
          intent?: string | null
          ip_address?: string | null
          is_helpful?: boolean | null
          model_used?: string | null
          response_time_ms?: number | null
          session_id: string
          user_agent?: string | null
          user_message: string
        }
        Update: {
          ai_response?: string | null
          created_at?: string | null
          id?: string
          intent?: string | null
          ip_address?: string | null
          is_helpful?: boolean | null
          model_used?: string | null
          response_time_ms?: number | null
          session_id?: string
          user_agent?: string | null
          user_message?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      download_logs: {
        Row: {
          country: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          software_id: string | null
          user_agent: string | null
          version_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          software_id?: string | null
          user_agent?: string | null
          version_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          software_id?: string | null
          user_agent?: string | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "download_logs_software_id_fkey"
            columns: ["software_id"]
            isOneToOne: false
            referencedRelation: "software_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "download_logs_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "software_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_assignments: {
        Row: {
          assigned_at: string | null
          experiment_id: string | null
          id: string
          session_id: string
          variant_id: string
        }
        Insert: {
          assigned_at?: string | null
          experiment_id?: string | null
          id?: string
          session_id: string
          variant_id: string
        }
        Update: {
          assigned_at?: string | null
          experiment_id?: string | null
          id?: string
          session_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_assignments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiment_results"
            referencedColumns: ["experiment_id"]
          },
          {
            foreignKeyName: "experiment_assignments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_conversions: {
        Row: {
          assignment_id: string | null
          conversion_type: string | null
          conversion_value: number | null
          converted_at: string | null
          experiment_id: string | null
          id: string
          metadata: Json | null
          session_id: string
          variant_id: string
        }
        Insert: {
          assignment_id?: string | null
          conversion_type?: string | null
          conversion_value?: number | null
          converted_at?: string | null
          experiment_id?: string | null
          id?: string
          metadata?: Json | null
          session_id: string
          variant_id: string
        }
        Update: {
          assignment_id?: string | null
          conversion_type?: string | null
          conversion_value?: number | null
          converted_at?: string | null
          experiment_id?: string | null
          id?: string
          metadata?: Json | null
          session_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_conversions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "experiment_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiment_conversions_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiment_results"
            referencedColumns: ["experiment_id"]
          },
          {
            foreignKeyName: "experiment_conversions_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          primary_metric: string | null
          slug: string
          start_date: string | null
          status: string | null
          target_element: string | null
          target_page: string | null
          updated_at: string | null
          variants: Json
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          primary_metric?: string | null
          slug: string
          start_date?: string | null
          status?: string | null
          target_element?: string | null
          target_page?: string | null
          updated_at?: string | null
          variants?: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          primary_metric?: string | null
          slug?: string
          start_date?: string | null
          status?: string | null
          target_element?: string | null
          target_page?: string | null
          updated_at?: string | null
          variants?: Json
        }
        Relationships: [
          {
            foreignKeyName: "experiments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_sources: {
        Row: {
          articles_count: number | null
          category_id: string | null
          created_at: string | null
          fetch_interval: number | null
          id: string
          is_active: boolean | null
          last_fetched_at: string | null
          name: string
          updated_at: string | null
          url: string
        }
        Insert: {
          articles_count?: number | null
          category_id?: string | null
          created_at?: string | null
          fetch_interval?: number | null
          id?: string
          is_active?: boolean | null
          last_fetched_at?: string | null
          name: string
          updated_at?: string | null
          url: string
        }
        Update: {
          articles_count?: number | null
          category_id?: string | null
          created_at?: string | null
          fetch_interval?: number | null
          id?: string
          is_active?: boolean | null
          last_fetched_at?: string | null
          name?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_sources_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      imported_articles: {
        Row: {
          ai_rewritten_content: string | null
          ai_rewritten_title: string | null
          created_at: string | null
          featured_image: string | null
          fetched_at: string | null
          id: string
          original_content: string | null
          original_title: string
          original_url: string
          post_id: string | null
          source_id: string
          source_name: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ai_rewritten_content?: string | null
          ai_rewritten_title?: string | null
          created_at?: string | null
          featured_image?: string | null
          fetched_at?: string | null
          id?: string
          original_content?: string | null
          original_title: string
          original_url: string
          post_id?: string | null
          source_id: string
          source_name?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_rewritten_content?: string | null
          ai_rewritten_title?: string | null
          created_at?: string | null
          featured_image?: string | null
          fetched_at?: string | null
          id?: string
          original_content?: string | null
          original_title?: string
          original_url?: string
          post_id?: string | null
          source_id?: string
          source_name?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imported_articles_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_articles_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "feed_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      post_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          post_id: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          post_id?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          post_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_attachments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_embeddings: {
        Row: {
          chunk_index: number
          content_chunk: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          post_id: string | null
          updated_at: string | null
        }
        Insert: {
          chunk_index: number
          content_chunk: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          post_id?: string | null
          updated_at?: string | null
        }
        Update: {
          chunk_index?: number
          content_chunk?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          post_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_embeddings_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          allow_comments: boolean | null
          author_id: string | null
          canonical_url: string | null
          category_id: string | null
          content: Json | null
          content_html: string | null
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          is_featured: boolean | null
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          published_at: string | null
          scheduled_at: string | null
          slug: string
          status: string | null
          title: string
          translations: Json | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          allow_comments?: boolean | null
          author_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          content?: Json | null
          content_html?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          slug: string
          status?: string | null
          title: string
          translations?: Json | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          allow_comments?: boolean | null
          author_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          content?: Json | null
          content_html?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          slug?: string
          status?: string | null
          title?: string
          translations?: Json | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number | null
          created_at: string | null
          id: string
          key: string
          window_start: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          id?: string
          key: string
          window_start?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          id?: string
          key?: string
          window_start?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      software_products: {
        Row: {
          created_at: string | null
          description: Json | null
          description_html: string | null
          download_count: number | null
          faq: Json | null
          highlights: Json | null
          icon_url: string | null
          id: string
          is_featured: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          screenshots: Json | null
          slug: string
          status: string | null
          summary: string | null
          system_requirements: Json | null
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: Json | null
          description_html?: string | null
          download_count?: number | null
          faq?: Json | null
          highlights?: Json | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          screenshots?: Json | null
          slug: string
          status?: string | null
          summary?: string | null
          system_requirements?: Json | null
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: Json | null
          description_html?: string | null
          download_count?: number | null
          faq?: Json | null
          highlights?: Json | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          screenshots?: Json | null
          slug?: string
          status?: string | null
          summary?: string | null
          system_requirements?: Json | null
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      software_versions: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_latest: boolean | null
          release_notes: string | null
          released_at: string | null
          software_id: string | null
          status: string | null
          version: string
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_latest?: boolean | null
          release_notes?: string | null
          released_at?: string | null
          software_id?: string | null
          status?: string | null
          version: string
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_latest?: boolean | null
          release_notes?: string | null
          released_at?: string | null
          software_id?: string | null
          status?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "software_versions_software_id_fkey"
            columns: ["software_id"]
            isOneToOne: false
            referencedRelation: "software_products"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_avatar: string | null
          author_name: string
          author_title: string | null
          content: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          author_avatar?: string | null
          author_name: string
          author_title?: string | null
          content: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          author_title?: string | null
          content?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          rating?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      translation_queue: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          error: string | null
          id: string
          post_id: string
          started_at: string | null
          status: string
          target_language: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error?: string | null
          id?: string
          post_id: string
          started_at?: string | null
          status?: string
          target_language?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error?: string | null
          id?: string
          post_id?: string
          started_at?: string | null
          status?: string
          target_language?: string
        }
        Relationships: [
          {
            foreignKeyName: "translation_queue_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translation_queue_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          referrer: string | null
          session_id: string
          target_id: string | null
          target_slug: string | null
          target_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          referrer?: string | null
          session_id: string
          target_id?: string | null
          target_slug?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          referrer?: string | null
          session_id?: string
          target_id?: string | null
          target_slug?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          fingerprint: string | null
          first_seen: string | null
          id: string
          ip_address: string | null
          last_seen: string | null
          page_views: number | null
          preferred_categories: string[] | null
          preferred_tags: string[] | null
          session_id: string
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          fingerprint?: string | null
          first_seen?: string | null
          id?: string
          ip_address?: string | null
          last_seen?: string | null
          page_views?: number | null
          preferred_categories?: string[] | null
          preferred_tags?: string[] | null
          session_id: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          fingerprint?: string | null
          first_seen?: string | null
          id?: string
          ip_address?: string | null
          last_seen?: string | null
          page_views?: number | null
          preferred_categories?: string[] | null
          preferred_tags?: string[] | null
          session_id?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      chat_analytics: {
        Row: {
          avg_response_time: number | null
          date: string | null
          helpful_count: number | null
          not_helpful_count: number | null
          total_messages: number | null
          unique_sessions: number | null
        }
        Relationships: []
      }
      experiment_results: {
        Row: {
          conversion_rate: number | null
          conversions: number | null
          experiment_id: string | null
          experiment_name: string | null
          participants: number | null
          slug: string | null
          status: string | null
          total_value: number | null
          variant_id: string | null
        }
        Relationships: []
      }
      popular_content: {
        Row: {
          last_viewed: string | null
          target_id: string | null
          target_type: string | null
          unique_visitors: number | null
          view_count: number | null
        }
        Relationships: []
      }
      user_content_preferences: {
        Row: {
          category_id: string | null
          category_name: string | null
          last_viewed: string | null
          session_id: string | null
          user_id: string | null
          view_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_rate_limit: {
        Args: { p_key: string; p_limit?: number; p_window_seconds?: number }
        Returns: boolean
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      complete_translation_job: {
        Args: { p_error?: string; p_job_id: string; p_success: boolean }
        Returns: undefined
      }
      get_experiment_variant: {
        Args: { p_experiment_slug: string; p_session_id: string }
        Returns: string
      }
      get_next_translation_job: {
        Args: never
        Returns: {
          id: string
          post_id: string
          target_language: string
        }[]
      }
      get_recommendations: {
        Args: { p_limit?: number; p_session_id: string }
        Returns: {
          category_id: string
          post_id: string
          score: number
          slug: string
          title: string
        }[]
      }
      increment_view_duration: {
        Args: { seconds: number; visit_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_editor_or_admin: { Args: never; Returns: boolean }
      record_visit: {
        Args: {
          p_browser: string
          p_device: string
          p_hash: string
          p_path: string
          p_post_id: string
          p_referrer: string
        }
        Returns: string
      }
      search_posts: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          chunk_text: string
          post_id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const

// Type aliases for common tables
export type Profile = Tables<'profiles'>
export type Post = Tables<'posts'>
export type Category = Tables<'categories'>
export type Tag = Tables<'tags'>
export type PostTag = Tables<'post_tags'>
export type PostAttachment = Tables<'post_attachments'>
export type SoftwareProduct = Tables<'software_products'>
export type SoftwareVersion = Tables<'software_versions'>
export type DownloadLog = Tables<'download_logs'>
export type ContactMessage = Tables<'contact_messages'>
export type Setting = Tables<'settings'>
export type AuditLog = Tables<'audit_logs'>
export type UserEvent = Tables<'user_events'>
export type UserSession = Tables<'user_sessions'>
export type Experiment = Tables<'experiments'>
export type ExperimentAssignment = Tables<'experiment_assignments'>
export type ExperimentConversion = Tables<'experiment_conversions'>
export type Testimonial = Tables<'testimonials'>
export type RateLimit = Tables<'rate_limits'>
export type TranslationQueue = Tables<'translation_queue'>
export type AnalyticsVisit = Tables<'analytics_visits'>
export type FeedSource = Tables<'feed_sources'>
export type ImportedArticle = Tables<'imported_articles'>
export type AdminNotification = Tables<'admin_notifications'>
export type ChatSession = Tables<'chat_sessions'>
export type PostEmbedding = Tables<'post_embeddings'>
