export type AppRole = 'admin' | 'member'
export type SuggestionKind = 'change' | 'channel'
export type SuggestionStatus = 'pending' | 'reviewed' | 'done' | 'rejected'
export type BookingStatus = 'pending' | 'confirmed' | 'done' | 'rejected'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          what_they_do: string | null
          company_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          what_they_do?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          email?: string | null
          what_they_do?: string | null
          company_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: number
          user_id: string
          role: AppRole
        }
        Insert: {
          user_id: string
          role: AppRole
          id?: number
        }
        Update: {
          role?: AppRole
        }
        Relationships: []
      }
      channels: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          name?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          channel_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          channel_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          content?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          location: string | null
          capacity: number | null
          starts_at: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          location?: string | null
          capacity?: number | null
          starts_at: string
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          location?: string | null
          capacity?: number | null
          starts_at?: string
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          id: string
          event_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          created_at?: string
        }
        Update: Record<PropertyKey, never>
        Relationships: []
      }
      consulting_bookings: {
        Row: {
          id: string
          name: string
          email: string
          topic: string
          status: BookingStatus
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          topic: string
          status?: BookingStatus
          created_at?: string
        }
        Update: {
          status?: BookingStatus
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          id: string
          user_id: string
          kind: SuggestionKind
          title: string
          details: string | null
          status: SuggestionStatus
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          kind: SuggestionKind
          title: string
          details?: string | null
          status?: SuggestionStatus
          created_at?: string
        }
        Update: {
          status?: SuggestionStatus
        }
        Relationships: []
      }
    }
    Views: Record<PropertyKey, never>
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: AppRole
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: AppRole
      suggestion_kind: SuggestionKind
      suggestion_status: SuggestionStatus
      booking_status: BookingStatus
    }
    CompositeTypes: Record<PropertyKey, never>
  }
}
