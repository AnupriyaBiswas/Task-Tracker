'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { CheckCircle, Clock, Target, Zap } from 'lucide-react'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        console.error('Login error:', error.message)
        alert(`Login failed: ${error.message}`)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('Login failed - check console')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: <Target className="h-6 w-6 text-blue-600" />,
      title: "Stay Organized",
      description: "Keep track of all your tasks in one beautiful dashboard"
    },
    {
      icon: <Clock className="h-6 w-6 text-green-600" />,
      title: "Track Progress",
      description: "Monitor your productivity with visual status indicators"
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-purple-600" />,
      title: "Get Things Done",
      description: "Complete tasks efficiently with priority management"
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-600" />,
      title: "Boost Productivity",
      description: "Focus on what matters with smart filtering and search"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Task Tracker
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Made Simple
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Organize your life, boost your productivity, and achieve your goals with our beautiful and intuitive task management platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleGoogleLogin} 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Continue with Google'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to stay productive
            </h2>
            <p className="text-gray-600 text-lg">
              Simple, powerful tools to help you manage your tasks effectively
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to get organized?</h2>
            <p className="text-blue-100 mb-8 text-lg">
              Join thousands of productive people who trust Task Tracker
            </p>
            <Button 
              onClick={handleGoogleLogin}
              size="lg"
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium"
              disabled={loading}
            >
              {loading ? 'Starting...' : 'Get Started Free'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
