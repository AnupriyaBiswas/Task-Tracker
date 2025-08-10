'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Task } from '@/types/database'
import { useState } from 'react'

interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: string, status: Task['status']) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const [loading, setLoading] = useState(false)

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800'
  }

  const priorityColors = {
    low: 'border-l-gray-400',
    medium: 'border-l-yellow-400',
    high: 'border-l-red-400'
  }

  const handleStatusChange = async (status: Task['status']) => {
    setLoading(true)
    await onStatusChange(task.id, status)
    setLoading(false)
  }

  return (
    <Card className={`border-l-4 ${priorityColors[task.priority]} transition-all hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">{task.title}</h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
              {task.status.replace('-', ' ')}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700`}>
              {task.priority}
            </span>
          </div>
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
        )}
        
        {task.category && (
          <div className="mb-3">
            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
              {task.category}
            </span>
          </div>
        )}

        {task.due_date && (
          <p className="text-xs text-gray-500 mb-3">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {task.status !== 'in-progress' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleStatusChange('in-progress')}
                disabled={loading}
              >
                {task.status === 'todo' ? 'Start' : 'Resume'}
              </Button>
            )}
            {task.status !== 'done' && (
              <Button 
                size="sm"
                onClick={() => handleStatusChange('done')}
                disabled={loading}
              >
                Complete
              </Button>
            )}
            {task.status === 'done' && (
              <Button 
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('todo')}
                disabled={loading}
              >
                Reopen
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => onEdit(task)}
            >
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => onDelete(task.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
