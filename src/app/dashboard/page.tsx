'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TaskCard } from '@/components/task/TaskCard'
import { TaskForm, TaskFormData } from '@/components/task/TaskForm'
import { TaskFilters } from '@/components/task/TaskFilters'
import { TaskService } from '@/lib/tasks'
import { CheckCircle } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Task } from '@/types/database'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<'all' | Task['status']>('all')
  const [search, setSearch] = useState('')

  const supabase = createClient()
  const router = useRouter()
  const taskService = new TaskService()

  // Fixed loadTasks with useCallback to prevent infinite loops
  const loadTasks = useCallback(async () => {
    try {
      if (!user) {
        setLoading(false)
        return
      }

      const data = await taskService.getTasks()
      setTasks(data)
    } catch (error) {
      console.error('❌ Dashboard: Error loading tasks:', error)
      if (error instanceof Error && error.message.includes('Auth session missing')) {
        setUser(null)
        setTasks([])
        router.push('/')
        return
      }

      if (error instanceof Error) {
        alert(`Failed to load tasks: ${error.message}`)
      } else {
        alert('Failed to load tasks. Please check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }, [taskService, user, router])

  // Fixed auth state management to prevent continuous checking
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          if (session?.user) {
            setUser(session.user)
            // Load tasks only once on initial auth
            if (tasks.length === 0) {
              loadTasks()
            }
          } else {
            router.push('/')
          }
        }
      } catch (error) {
        console.error('Session check failed:', error)
        if (mounted) {
          router.push('/')
        }
      }
    }

    initializeAuth()

    // Single auth state listener with proper event filtering
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      // Filter out token refresh events to prevent continuous checking
      if (event === 'TOKEN_REFRESHED') return

      if (event === 'SIGNED_OUT' || !session) {
        setUser(null)
        setTasks([])
        router.push('/')
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        // Only load tasks on actual sign in, not on page refresh
        loadTasks()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router]) // Minimal dependencies to prevent re-runs

  const handleCreateTask = async (formData: TaskFormData) => {
    try {
      const newTask = await taskService.createTask(formData)
      setTasks([newTask, ...tasks])
      setShowForm(false)
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task. Please try again.')
    }
  }

  const handleEditTask = async (formData: TaskFormData) => {
    if (!editingTask) return

    try {
      const updatedTask = await taskService.updateTask(editingTask.id, formData)
      setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t))
      setEditingTask(null)
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Failed to update task. Please try again.')
    }
  }

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try {
      await taskService.updateTask(taskId, { status })
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t))
    } catch (error) {
      console.error('Error updating task status:', error)
      alert('Failed to update task status. Please try again.')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await taskService.deleteTask(taskId)
      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task. Please try again.')
    }
  }

  // Fixed sign out function to redirect to landing page
  const handleSignOut = async () => {
    try {
      setUser(null)
      setTasks([])
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase sign out error:', error)
      }
      
      window.location.href = '/'
      
    } catch (error) {
      console.error('Sign out process failed:', error)
      window.location.href = '/'
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter
    const matchesSearch = search === '' ||
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase()) ||
      task.category?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const taskCounts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Enhanced Stats Dashboard */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-3xl font-bold text-gray-900 mb-1">{taskCounts.all}</div>
                <div className="text-sm text-gray-600 font-medium">Total Tasks</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-3xl font-bold text-blue-600 mb-1">{taskCounts.todo}</div>
                <div className="text-sm text-blue-600 font-medium">To Do</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-100">
                <div className="text-3xl font-bold text-orange-600 mb-1">{taskCounts['in-progress']}</div>
                <div className="text-sm text-orange-600 font-medium">In Progress</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100">
                <div className="text-3xl font-bold text-green-600 mb-1">{taskCounts.done}</div>
                <div className="text-sm text-green-600 font-medium">Completed</div>
              </div>
            </div>
          </div>

          {/* ENHANCED "YOUR TASKS" SECTION WITH INTEGRATED CONTROLS */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            {/* Header Row with Title, Search, and New Task Button */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Tasks</h2>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                {/* Search Input */}
                <div className="relative flex-1 lg:flex-initial">
                  <input
                    type="text"
                    placeholder="🔍 Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-4 pr-4 py-3 border border-gray-300 rounded-xl w-full lg:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white/80 backdrop-blur-sm"
                  />
                </div>
                
                {/* New Task Button */}
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
                >
                  ✨ New Task
                </Button>
              </div>
            </div>
            
            {/* Task Filters */}
            <TaskFilters
              currentFilter={filter}
              onFilterChange={setFilter}
              taskCounts={taskCounts}
            />
          </div>

          {/* Task Form */}
          {(showForm || editingTask) && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
              <TaskForm
                task={editingTask || undefined}
                onSubmit={editingTask ? handleEditTask : handleCreateTask}
                onCancel={() => {
                  setShowForm(false)
                  setEditingTask(null)
                }}
              />
            </div>
          )}

          {/* Enhanced Task List */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center">
                {tasks.length === 0 ? (
                  <div>
                    <div className="flex justify-center mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-blue-500" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No tasks yet!</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Create your first task to get started on your productivity journey. 
                      Organize your life, one task at a time! 🚀
                    </p>
                    <Button 
                      onClick={() => setShowForm(true)} 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                    >
                      ✨ Create Your First Task
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No matching tasks</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTasks.map(task => (
                  <div key={task.id} className="transform hover:scale-[1.02] transition-transform duration-200">
                    <TaskCard
                      task={task}
                      onStatusChange={handleStatusChange}
                      onEdit={setEditingTask}
                      onDelete={handleDeleteTask}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
