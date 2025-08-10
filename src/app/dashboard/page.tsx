'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TaskCard } from '@/components/task/TaskCard'
import { TaskForm, TaskFormData } from '@/components/task/TaskForm'
import { TaskFilters } from '@/components/task/TaskFilters'
import { TaskService } from '@/lib/tasks'
import { CheckCircle } from 'lucide-react' // Added missing import
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


  // Move loadTasks outside useEffect
  const loadTasks = useCallback(async () => {
    try {
      const data = await taskService.getTasks()
      setTasks(data)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [taskService])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        loadTasks()
      } else {
        router.push('/auth/signin')
      }
    }
    checkUser()
  }, [router, supabase.auth, loadTasks]) // Add loadTasks to deps


  const handleCreateTask = async (formData: TaskFormData) => {
    try {
      const newTask = await taskService.createTask(formData)
      setTasks([newTask, ...tasks])
      setShowForm(false)
    } catch (error) {
      console.error('Error creating task:', error)
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
    }
  }

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try {
      await taskService.updateTask(taskId, { status })
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t))
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await taskService.deleteTask(taskId)
      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Stats Dashboard */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{taskCounts.all}</div>
                <div className="text-sm text-gray-500">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{taskCounts.todo}</div>
                <div className="text-sm text-gray-500">To Do</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{taskCounts['in-progress']}</div>
                <div className="text-sm text-gray-500">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{taskCounts.done}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
          </div>

          {/* Enhanced Header - KEEP THIS ONE */}
          <header className="bg-white shadow-sm border-b sticky top-0 z-10 backdrop-blur-sm bg-white/95">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Task Tracker
                  </h1>
                  {/* Add welcome message to header */}
                  <span className="hidden lg:block text-sm text-gray-600 ml-4">
                    Welcome back, {user?.user_metadata?.name || 'User'}!
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {/* Add New Task button to header */}
                  <Button
                    onClick={() => setShowForm(true)}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    + New Task
                  </Button>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">
                      {taskCounts.all} tasks
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 hidden sm:block">
                    {user?.user_metadata?.name || user?.email}
                  </span>
                  <Button variant="outline" onClick={handleSignOut} size="sm">
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </header>


          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Your Tasks</h3>
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <TaskFilters
              currentFilter={filter}
              onFilterChange={setFilter}
              taskCounts={taskCounts}
            />
          </div>

          {/* Task Form */}
          {(showForm || editingTask) && (
            <TaskForm
              task={editingTask || undefined}
              onSubmit={editingTask ? handleEditTask : handleCreateTask}
              onCancel={() => {
                setShowForm(false)
                setEditingTask(null)
              }}
            />
          )}

          {/* Task List */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
                {tasks.length === 0 ? (
                  <div>
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">No tasks yet!</p>
                    <p className="text-gray-600 mb-4">Create your first task to get started on your productivity journey.</p>
                    <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Create Your First Task
                    </Button>
                  </div>
                ) : (
                  <p>No tasks match your current filter.</p>
                )}
              </div>
            ) : (
              filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
