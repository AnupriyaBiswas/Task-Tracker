import { createClient } from '@/lib/supabase/client'

export class TaskService {
  private supabase = createClient()

  async getTasks() {
    try {
      console.log('🔍 TaskService: Starting getTasks...')
      
      // Step 1: Check Supabase client
      if (!this.supabase) {
        throw new Error('Supabase client not initialized')
      }
      console.log('✅ Supabase client exists')

      // Step 2: Check environment variables
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      console.log('🔧 Environment check:', { 
        hasUrl: !!url, 
        hasKey: !!key,
        urlPreview: url?.substring(0, 30) + '...'
      })

      // Step 3: Check authentication
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      if (authError) {
        console.error('❌ Auth error details:', authError)
        throw new Error(`Authentication failed: ${authError.message}`)
      }
      
      if (!user) {
        console.error('❌ No authenticated user found')
        throw new Error('Please sign in to view tasks')
      }
      
      console.log('✅ User authenticated:', { 
        id: user.id, 
        email: user.email 
      })

      // Step 4: Test database connection
      const { data, error, count } = await this.supabase
        .from('tasks')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Database error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(`Database error: ${error.message}`)
      }
      
      console.log('✅ Query successful:', { 
        count: count, 
        dataLength: data?.length || 0,
        firstTask: data?.[0]?.title || 'No tasks'
      })
      
      return data || []
      
    } catch (error) {
      console.error('❌ TaskService.getTasks complete error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

  async createTask(task: any) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const taskData = {
        ...task,
        user_id: user.id,
        status: task.status || 'todo',
        priority: task.priority || 'medium'
      }

      console.log('Creating task:', taskData)

      const { data, error } = await this.supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single()
      
      if (error) {
        console.error('Create task error:', error)
        throw new Error(`Failed to create task: ${error.message}`)
      }
      
      console.log('✅ Task created:', data)
      return data
    } catch (error) {
      console.error('TaskService.createTask error:', error)
      throw error
    }
  }

  async updateTask(id: string, updates: any) {
    try {
      const { data, error } = await this.supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw new Error(`Failed to update task: ${error.message}`)
      return data
    } catch (error) {
      console.error('TaskService.updateTask error:', error)
      throw error
    }
  }

  async deleteTask(id: string) {
    try {
      const { error } = await this.supabase
        .from('tasks')
        .delete()
        .eq('id', id)
      
      if (error) throw new Error(`Failed to delete task: ${error.message}`)
    } catch (error) {
      console.error('TaskService.deleteTask error:', error)
      throw error
    }
  }
}
