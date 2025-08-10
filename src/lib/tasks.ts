import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export class TaskService {
  private supabase = createClient()

  async getTasks() {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async createTask(task: Omit<TaskInsert, 'user_id'>) {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await this.supabase
      .from('tasks')
      .insert([{ ...task, user_id: user.id }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateTask(id: string, updates: TaskUpdate) {
    const { data, error } = await this.supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async deleteTask(id: string) {
    const { error } = await this.supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
