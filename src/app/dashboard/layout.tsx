'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { TaskService } from '@/lib/tasks'
import { createClient } from '@/lib/supabase/client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [taskCounts, setTaskCounts] = useState({
    all: 0,
    todo: 0,
    'in-progress': 0,
    done: 0
  })

  // Optimized task count loading with useCallback
  const loadTaskCounts = useCallback(async () => {
    if (!user) return

    try {
      const taskService = new TaskService()
      const tasks = await taskService.getTasks()

      setTaskCounts({
        all: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        'in-progress': tasks.filter(t => t.status === 'in-progress').length,
        done: tasks.filter(t => t.status === 'done').length,
      })
    } catch (error) {
      console.error('Failed to load task counts:', error)
      setTaskCounts({ all: 0, todo: 0, 'in-progress': 0, done: 0 })
    }
  }, [user])

  // Single useEffect for task counts - no auth listener here
  useEffect(() => {
    loadTaskCounts()
  }, [loadTaskCounts])

  // Redirect logic without auth state listener
  useEffect(() => {
    if (!user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    try {
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Tu-Dum
                </h1>
                <p className="text-xs text-gray-500">Task Tracker</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center">
              <span className="text-lg text-gray-700 font-medium">
                Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}! 👋
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  {taskCounts.all} tasks
                </span>
              </div>

              <Button
                variant="outline"
                onClick={handleSignOut}
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
