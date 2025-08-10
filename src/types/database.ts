export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'todo' | 'in-progress' | 'done'
          priority: 'low' | 'medium' | 'high'
          category: string | null
          due_date: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'todo' | 'in-progress' | 'done'
          priority?: 'low' | 'medium' | 'high'
          category?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in-progress' | 'done'
          priority?: 'low' | 'medium' | 'high'
          category?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
    }
  }
}

export type Task = Database['public']['Tables']['tasks']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
