'use client'

import { Button } from '@/components/ui/button'
import { Task } from '@/types/database'

interface TaskFiltersProps {
  currentFilter: 'all' | Task['status']
  onFilterChange: (filter: 'all' | Task['status']) => void
  taskCounts: Record<'all' | Task['status'], number>
}

export function TaskFilters({ currentFilter, onFilterChange, taskCounts }: TaskFiltersProps) {
  const filters = [
    { key: 'all' as const, label: 'All', count: taskCounts.all },
    { key: 'todo' as const, label: 'To Do', count: taskCounts.todo },
    { key: 'in-progress' as const, label: 'In Progress', count: taskCounts['in-progress'] },
    { key: 'done' as const, label: 'Done', count: taskCounts.done },
  ]

  return (
    <div className="flex gap-2 flex-wrap mb-4">
      {filters.map(filter => (
        <Button
          key={filter.key}
          variant={currentFilter === filter.key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(filter.key)}
        >
          {filter.label} ({filter.count})
        </Button>
      ))}
    </div>
  )
}
