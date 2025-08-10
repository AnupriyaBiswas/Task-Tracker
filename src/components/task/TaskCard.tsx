'use client'

import { Calendar, Flag, Folder } from 'lucide-react'
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
    <Card className={`border-l-4 ${priorityColors[task.priority]} card-hover task-animation bg-white`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{task.title}</h3>
            {task.description && (
              <p className="text-gray-600 text-sm leading-relaxed">{task.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status]} transition-colors`}>
              {task.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          {task.priority && (
            <div className="flex items-center gap-1">
              <Flag className="h-3 w-3" />
              <span className="capitalize">{task.priority} priority</span>
            </div>
          )}

          {task.category && (
            <div className="flex items-center gap-1">
              <Folder className="h-3 w-3" />
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {task.category}
              </span>
            </div>
          )}

          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex gap-2">
            {task.status !== 'in-progress' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('in-progress')}
                disabled={loading}
                className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
              >
                {task.status === 'todo' ? 'Start' : 'Resume'}
              </Button>
            )}
            {task.status !== 'done' && (
              <Button
                size="sm"
                onClick={() => handleStatusChange('done')}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
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
                className="hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300"
              >
                Reopen
              </Button>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(task)}
              className="text-gray-500 hover:text-gray-700"
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(task.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

}
