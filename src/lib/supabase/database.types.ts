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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      anki_cards: {
        Row: {
          back: string
          block_id: string | null
          created_at: string | null
          front: string
          id: string
          is_public: boolean | null
          opposition_id: string | null
          topic_id: string | null
          user_id: string | null
        }
        Insert: {
          back: string
          block_id?: string | null
          created_at?: string | null
          front: string
          id?: string
          is_public?: boolean | null
          opposition_id?: string | null
          topic_id?: string | null
          user_id?: string | null
        }
        Update: {
          back?: string
          block_id?: string | null
          created_at?: string | null
          front?: string
          id?: string
          is_public?: boolean | null
          opposition_id?: string | null
          topic_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anki_cards_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anki_cards_opposition_id_fkey"
            columns: ["opposition_id"]
            isOneToOne: false
            referencedRelation: "oppositions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anki_cards_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anki_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      answers: {
        Row: {
          id: string
          is_correct: boolean | null
          question_id: string | null
          text: string
        }
        Insert: {
          id?: string
          is_correct?: boolean | null
          question_id?: string | null
          text: string
        }
        Update: {
          id?: string
          is_correct?: boolean | null
          question_id?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          description: string | null
          id: string
          name: string
          opposition_id: string | null
          position: number
          updated_at: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          opposition_id?: string | null
          position?: number
          updated_at?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          opposition_id?: string | null
          position?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocks_opposition_id_fkey"
            columns: ["opposition_id"]
            isOneToOne: false
            referencedRelation: "oppositions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      infografias: {
        Row: {
          contenido_html: string | null
          created_at: string
          id: string
          published: boolean
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contenido_html?: string | null
          created_at?: string
          id: string
          published?: boolean
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contenido_html?: string | null
          created_at?: string
          id?: string
          published?: boolean
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_info: {
        Row: {
          baseline_assessment: Json | null
          created_at: string | null
          help_with: Json | null
          id: string
          objectives: Json | null
          opposition_id: string | null
          slot_duration_minutes: number
          study_days: Json | null
          user_id: string
          weekly_study_goal_hours: number | null
        }
        Insert: {
          baseline_assessment?: Json | null
          created_at?: string | null
          help_with?: Json | null
          id?: string
          objectives?: Json | null
          opposition_id?: string | null
          slot_duration_minutes?: number
          study_days?: Json | null
          user_id: string
          weekly_study_goal_hours?: number | null
        }
        Update: {
          baseline_assessment?: Json | null
          created_at?: string | null
          help_with?: Json | null
          id?: string
          objectives?: Json | null
          opposition_id?: string | null
          slot_duration_minutes?: number
          study_days?: Json | null
          user_id?: string
          weekly_study_goal_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_info_opposition_id_fkey"
            columns: ["opposition_id"]
            isOneToOne: false
            referencedRelation: "oppositions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_info_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opposition_resources: {
        Row: {
          opposition_id: string
          resource_id: string
        }
        Insert: {
          opposition_id: string
          resource_id: string
        }
        Update: {
          opposition_id?: string
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opposition_resources_opposition_id_fkey"
            columns: ["opposition_id"]
            isOneToOne: false
            referencedRelation: "oppositions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opposition_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      oppositions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      process_stages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key_date: string | null
          name: string
          official_link: string | null
          process_id: string | null
          stage_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key_date?: string | null
          name: string
          official_link?: string | null
          process_id?: string | null
          stage_order: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key_date?: string | null
          name?: string
          official_link?: string | null
          process_id?: string | null
          stage_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "process_stages_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "selective_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          notify_on_new_login: boolean
          stripe_customer_id: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          notify_on_new_login?: boolean
          stripe_customer_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          notify_on_new_login?: boolean
          stripe_customer_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          created_at: string | null
          id: string
          is_archived: boolean
          opposition_id: string | null
          text: string
          topic_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_archived?: boolean
          opposition_id?: string | null
          text: string
          topic_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_archived?: boolean
          opposition_id?: string | null
          text?: string
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_opposition_id_fkey"
            columns: ["opposition_id"]
            isOneToOne: false
            referencedRelation: "oppositions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_blocks: {
        Row: {
          block_id: string | null
          id: string
          resource_id: string | null
        }
        Insert: {
          block_id?: string | null
          id?: string
          resource_id?: string | null
        }
        Update: {
          block_id?: string | null
          id?: string
          resource_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_blocks_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_blocks_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_change_history: {
        Row: {
          created_at: string
          id: string
          resource_id: string
          summary: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          resource_id: string
          summary?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          resource_id?: string
          summary?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_scraped_resources"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "scraped_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_change_history_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "scraped_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_oppositions: {
        Row: {
          id: string
          opposition_id: string | null
          resource_id: string | null
        }
        Insert: {
          id?: string
          opposition_id?: string | null
          resource_id?: string | null
        }
        Update: {
          id?: string
          opposition_id?: string | null
          resource_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_oppositions_opposition_id_fkey"
            columns: ["opposition_id"]
            isOneToOne: false
            referencedRelation: "oppositions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_oppositions_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_topics: {
        Row: {
          id: string
          resource_id: string | null
          topic_id: string | null
        }
        Insert: {
          id?: string
          resource_id?: string | null
          topic_id?: string | null
        }
        Update: {
          id?: string
          resource_id?: string | null
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_topics_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string | null
          id: string
          key_resources: string | null
          main_function: string | null
          scope: string | null
          title: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key_resources?: string | null
          main_function?: string | null
          scope?: string | null
          title: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key_resources?: string | null
          main_function?: string | null
          scope?: string | null
          title?: string
          url?: string
        }
        Relationships: []
      }
      scraped_resources: {
        Row: {
          active: boolean | null
          change_summary: Json | null
          content: string | null
          created_at: string
          id: string
          last_scraped_at: string | null
          name: string
          status: string | null
          url: string
        }
        Insert: {
          active?: boolean | null
          change_summary?: Json | null
          content?: string | null
          created_at?: string
          id?: string
          last_scraped_at?: string | null
          name: string
          status?: string | null
          url: string
        }
        Update: {
          active?: boolean | null
          change_summary?: Json | null
          content?: string | null
          created_at?: string
          id?: string
          last_scraped_at?: string | null
          name?: string
          status?: string | null
          url?: string
        }
        Relationships: []
      }
      selective_processes: {
        Row: {
          created_at: string
          id: string
          name: string
          opposition_id: string | null
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          opposition_id?: string | null
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          opposition_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "selective_processes_opposition_id_fkey"
            columns: ["opposition_id"]
            isOneToOne: false
            referencedRelation: "oppositions"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sounds: {
        Row: {
          created_at: string | null
          id: string
          name: string
          url: string
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          url: string
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          url?: string
          value?: string
        }
        Relationships: []
      }
      test_attempt_answers: {
        Row: {
          created_at: string
          id: string
          question_id: string
          selected_answer_id: string
          test_attempt_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          selected_answer_id: string
          test_attempt_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          selected_answer_id?: string
          test_attempt_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_attempt_answers_selected_answer_id_fkey"
            columns: ["selected_answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_attempt_answers_test_attempt_id_fkey"
            columns: ["test_attempt_id"]
            isOneToOne: false
            referencedRelation: "test_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      test_attempt_questions: {
        Row: {
          created_at: string | null
          id: string
          question_id: string
          test_attempt_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_id: string
          test_attempt_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question_id?: string
          test_attempt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_attempt_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_attempt_questions_test_attempt_id_fkey"
            columns: ["test_attempt_id"]
            isOneToOne: false
            referencedRelation: "test_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      test_attempts: {
        Row: {
          completed_at: string | null
          correct_answers: number | null
          created_at: string
          finished_at: string | null
          id: string
          incorrect_answers: number | null
          opposition_id: string
          score: number | null
          status: string | null
          study_cycle_id: string
          title: string | null
          total_questions: number | null
          unanswered_questions: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string
          finished_at?: string | null
          id?: string
          incorrect_answers?: number | null
          opposition_id: string
          score?: number | null
          status?: string | null
          study_cycle_id: string
          title?: string | null
          total_questions?: number | null
          unanswered_questions?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string
          finished_at?: string | null
          id?: string
          incorrect_answers?: number | null
          opposition_id?: string
          score?: number | null
          status?: string | null
          study_cycle_id?: string
          title?: string | null
          total_questions?: number | null
          unanswered_questions?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_attempts_opposition_id_fkey"
            columns: ["opposition_id"]
            isOneToOne: false
            referencedRelation: "oppositions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      test_tags: {
        Row: {
          created_at: string | null
          id: string
          question_id: string | null
          tag: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_id?: string | null
          tag: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question_id?: string | null
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_tags_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          created_at: string
          description: string
          id: string
          instagram: string | null
          linkedin: string | null
          name: string
          position: string | null
          reviewed: boolean
          surname: string | null
          website: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id: string
          instagram?: string | null
          linkedin?: string | null
          name: string
          position?: string | null
          reviewed?: boolean
          surname?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name?: string
          position?: string | null
          reviewed?: boolean
          surname?: string | null
          website?: string | null
        }
        Relationships: []
      }
      topics: {
        Row: {
          block_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          position: number
          updated_at: string | null
        }
        Insert: {
          block_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          position?: number
          updated_at?: string | null
        }
        Update: {
          block_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          position?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      urls: {
        Row: {
          active: boolean | null
          created_at: string
          description: string
          id: string
          name: string
          url: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string
          id?: string
          name: string
          url: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string
          id?: string
          name?: string
          url?: string
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          block_id: string | null
          created_at: string | null
          id: string
          status: string | null
          study_cycle_id: string | null
          user_id: string | null
        }
        Insert: {
          block_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          study_cycle_id?: string | null
          user_id?: string | null
        }
        Update: {
          block_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          study_cycle_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_blocks_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_study_cycle_id_fkey"
            columns: ["study_cycle_id"]
            isOneToOne: false
            referencedRelation: "user_study_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_oppositions: {
        Row: {
          active: boolean | null
          enrolled_at: string | null
          id: string
          opposition_id: string | null
          profile_id: string | null
        }
        Insert: {
          active?: boolean | null
          enrolled_at?: string | null
          id?: string
          opposition_id?: string | null
          profile_id?: string | null
        }
        Update: {
          active?: boolean | null
          enrolled_at?: string | null
          id?: string
          opposition_id?: string | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_oppositions_opposition_id_fkey"
            columns: ["opposition_id"]
            isOneToOne: false
            referencedRelation: "oppositions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_oppositions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_process_status: {
        Row: {
          created_at: string
          current_stage_id: string | null
          id: string
          process_id: string | null
          tracking_status: Database["public"]["Enums"]["tracking_status_enum"]
          user_id: string | null
          user_notes: string | null
        }
        Insert: {
          created_at?: string
          current_stage_id?: string | null
          id?: string
          process_id?: string | null
          tracking_status?: Database["public"]["Enums"]["tracking_status_enum"]
          user_id?: string | null
          user_notes?: string | null
        }
        Update: {
          created_at?: string
          current_stage_id?: string | null
          id?: string
          process_id?: string | null
          tracking_status?: Database["public"]["Enums"]["tracking_status_enum"]
          user_id?: string | null
          user_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_process_status_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "process_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_process_status_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "selective_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_study_cycles: {
        Row: {
          completed_at: string | null
          cycle_number: number
          id: string
          opposition_id: string | null
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          cycle_number: number
          id?: string
          opposition_id?: string | null
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          cycle_number?: number
          id?: string
          opposition_id?: string | null
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_study_cycles_opposition_id_fkey"
            columns: ["opposition_id"]
            isOneToOne: false
            referencedRelation: "oppositions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_study_cycles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_study_sessions: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          opposition_id: string | null
          started_at: string
          study_cycle_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          opposition_id?: string | null
          started_at?: string
          study_cycle_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          opposition_id?: string | null
          started_at?: string
          study_cycle_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_study_sessions_opposition_id_fkey"
            columns: ["opposition_id"]
            isOneToOne: false
            referencedRelation: "oppositions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_study_sessions_study_cycle_id_fkey"
            columns: ["study_cycle_id"]
            isOneToOne: false
            referencedRelation: "user_study_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_study_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          status: string
          stripe_customer_id: string | null
          trial_end: string | null
          trial_start: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start: string
          ended_at?: string | null
          id: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status: string
          stripe_customer_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: string
          stripe_customer_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_topics: {
        Row: {
          created_at: string
          id: string
          status: string
          study_cycle_id: string
          topic_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          study_cycle_id: string
          topic_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          study_cycle_id?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_topics_study_cycle_id_fkey"
            columns: ["study_cycle_id"]
            isOneToOne: false
            referencedRelation: "user_study_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_url_subscriptions: {
        Row: {
          created_at: string
          is_active: boolean | null
          url_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          is_active?: boolean | null
          url_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          is_active?: boolean | null
          url_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_url_subscriptions_url_id_fkey"
            columns: ["url_id"]
            isOneToOne: false
            referencedRelation: "urls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_url_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_data: { Args: never; Returns: undefined }
      get_daily_study_summary: {
        Args: { days_limit: number }
        Returns: {
          study_date: string
          total_minutes: number
        }[]
      }
      get_questions_by_opposition:
        | {
            Args: { include_no_topic?: boolean; opp_id: string }
            Returns: {
              id: string
            }[]
          }
        | { Args: { opp_id: string }; Returns: string[] }
      get_url_history_by_id: {
        Args: { target_url_id: string }
        Returns: {
          created_at: string
          summary: Json
        }[]
      }
      get_urls_with_user_subscription: {
        Args: { user_id_param: string }
        Returns: {
          description: string
          id: string
          is_subscribed: boolean
          name: string
        }[]
      }
      get_user_failed_questions: {
        Args: never
        Returns: {
          question_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Returns: boolean
      }
      list_oppositions_with_user_count: {
        Args: never
        Returns: {
          id: string
          name: string
          user_count: number
        }[]
      }
      list_user_oppositions: {
        Args: { profile_id: string }
        Returns: {
          id: string
          is_assigned: boolean
          name: string
        }[]
      }
      rpc_start_next_study_cycle: {
        Args: { p_opposition_id: string; p_user_id: string }
        Returns: undefined
      }
      set_correct_answer: {
        Args: { p_new_answer_id: string; p_question_id: string }
        Returns: undefined
      }
      start_next_study_cycle: {
        Args: { p_opposition_id: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      status_enum: "not_started" | "in_progress" | "completed"
      tracking_status_enum: "TRACKING" | "PREPARING" | "PAUSED"
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
    Enums: {
      app_role: ["admin", "user"],
      status_enum: ["not_started", "in_progress", "completed"],
      tracking_status_enum: ["TRACKING", "PREPARING", "PAUSED"],
    },
  },
} as const
