export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      onboarding_info: {
        Row: {
          created_at: string | null
          help_with: Json | null
          id: string
          objectives: Json | null
          opposition_id: string | null
          slot_duration_minutes: number
          study_days: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          help_with?: Json | null
          id?: string
          objectives?: Json | null
          opposition_id?: string | null
          slot_duration_minutes?: number
          study_days?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          help_with?: Json | null
          id?: string
          objectives?: Json | null
          opposition_id?: string | null
          slot_duration_minutes?: number
          study_days?: Json | null
          user_id?: string
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          stripe_customer_id: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          stripe_customer_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          stripe_customer_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          id: string
          text: string
          topic_id: string | null
        }
        Insert: {
          id?: string
          text: string
          topic_id?: string | null
        }
        Update: {
          id?: string
          text?: string
          topic_id?: string | null
        }
        Relationships: [
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
          change_summary: Json | null
          content: string | null
          created_at: string
          id: string
          last_scraped_at: string | null
          name: string | null
          status: string | null
          url: string
        }
        Insert: {
          change_summary?: Json | null
          content?: string | null
          created_at?: string
          id?: string
          last_scraped_at?: string | null
          name?: string | null
          status?: string | null
          url: string
        }
        Update: {
          change_summary?: Json | null
          content?: string | null
          created_at?: string
          id?: string
          last_scraped_at?: string | null
          name?: string | null
          status?: string | null
          url?: string
        }
        Relationships: []
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
      test_attempt_questions: {
        Row: {
          answer_id: string | null
          created_at: string | null
          id: string
          is_correct: boolean
          question_id: string
          test_attempt_id: string
        }
        Insert: {
          answer_id?: string | null
          created_at?: string | null
          id?: string
          is_correct: boolean
          question_id: string
          test_attempt_id: string
        }
        Update: {
          answer_id?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string
          test_attempt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_attempt_questions_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
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
          id: string
          opposition_id: string
          score: number | null
          study_cycle_id: string
          test_id: string
          total_questions: number | null
          user_id: string
          wrong_answers: number | null
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number | null
          id?: string
          opposition_id: string
          score?: number | null
          study_cycle_id: string
          test_id: string
          total_questions?: number | null
          user_id: string
          wrong_answers?: number | null
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number | null
          id?: string
          opposition_id?: string
          score?: number | null
          study_cycle_id?: string
          test_id?: string
          total_questions?: number | null
          user_id?: string
          wrong_answers?: number | null
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
            foreignKeyName: "test_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
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
      test_questions: {
        Row: {
          created_at: string | null
          id: string
          position: number | null
          question_id: string
          test_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          position?: number | null
          question_id: string
          test_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          position?: number | null
          question_id?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_tags: {
        Row: {
          id: string
          tag: string
          test_id: string | null
        }
        Insert: {
          id?: string
          tag: string
          test_id?: string | null
        }
        Update: {
          id?: string
          tag?: string
          test_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_tags_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          id: string
          opposition_id: string
          title: string
        }
        Insert: {
          id?: string
          opposition_id: string
          title: string
        }
        Update: {
          id?: string
          opposition_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_opposition"
            columns: ["opposition_id"]
            isOneToOne: false
            referencedRelation: "oppositions"
            referencedColumns: ["id"]
          },
        ]
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
      wrong_answers_view: {
        Row: {
          created_at: string | null
          id: string | null
          pregunta: string | null
          question_id: string | null
          tema: string | null
          user_id: string | null
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
            foreignKeyName: "test_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      delete_user_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_daily_study_summary: {
        Args: { days_limit: number }
        Returns: {
          study_date: string
          total_minutes: number
        }[]
      }
      get_questions_by_opposition: {
        Args:
          | { opp_id: string }
          | { opp_id: string; include_no_topic?: boolean }
        Returns: {
          id: string
        }[]
      }
      get_url_history_by_id: {
        Args: { target_url_id: string }
        Returns: {
          summary: Json
          created_at: string
        }[]
      }
      get_urls_with_user_subscription: {
        Args: { user_id_param: string }
        Returns: {
          id: string
          name: string
          description: string
          is_subscribed: boolean
        }[]
      }
      get_user_failed_questions: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      has_role: {
        Args: {
          user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      list_oppositions_with_user_count: {
        Args: Record<PropertyKey, never>
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
          name: string
          is_assigned: boolean
        }[]
      }
      rpc_start_next_study_cycle: {
        Args: { p_user_id: string; p_opposition_id: string }
        Returns: undefined
      }
      start_next_study_cycle: {
        Args: { p_user_id: string; p_opposition_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      status_enum: "not_started" | "in_progress" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      status_enum: ["not_started", "in_progress", "completed"],
    },
  },
} as const
