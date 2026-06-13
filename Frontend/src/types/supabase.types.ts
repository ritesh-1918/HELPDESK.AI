/**
 * Strict TypeScript interfaces for Supabase database models.
 * This guarantees type safety across the frontend layer.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tickets: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          status: 'pending' | 'open' | 'in_progress' | 'resolved' | 'closed'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          user_id: string
          assigned_to: string | null
          company_id: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          status?: 'pending' | 'open' | 'in_progress' | 'resolved' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          user_id: string
          assigned_to?: string | null
          company_id: string
          metadata?: Json | null
        }
        Update: Partial<Database['public']['Tables']['tickets']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin' | 'master_admin'
          company_id: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'master_admin'
          company_id?: string | null
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      companies: {
        Row: {
          id: string
          created_at: string
          name: string
          domain: string | null
          plan: 'free' | 'pro' | 'enterprise'
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          domain?: string | null
          plan?: 'free' | 'pro' | 'enterprise'
        }
        Update: Partial<Database['public']['Tables']['companies']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for quick access
export type Ticket = Database['public']['Tables']['tickets']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
