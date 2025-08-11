'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { TaskService } from '@/lib/tasks'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  
  // Fixed: Initialize with all properties
  const [taskCounts, setTaskCounts] = useState({ 
    all: 0, 
    todo: 0, 
    'in-progress': 0, 
    done: 0 
  })

  // Load task counts for the navbar
  useEffect(() => {
    const loadTaskCounts = async () => {
      if (user) {
        try {
          const taskService = new TaskService()
          const tasks = await taskService.getTasks()
          
          // Fixed: Properly update state instead of declaring useState again
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
      }
    }

    loadTaskCounts()
  }, [user])

  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/signin')
    } catch (error) {
      console.error('Sign out failed:', error)
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
      {/* SINGLE UNIFIED NAVBAR */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side - Logo and App Name */}
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

            {/* Center - Welcome Message */}
            <div className="hidden lg:flex items-center">
              <span className="text-lg text-gray-700 font-medium">
                Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}! 👋
              </span>
            </div>

            {/* Right Side - Task Count and Sign Out */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
