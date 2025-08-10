#!/usr/bin/env python3
import json
import sys
import os
from datetime import datetime

class TaskTracker:
    def __init__(self, filename="tasks.json"):
        self.filename = filename
        self.tasks = self.load_tasks()
    
    def load_tasks(self):
        """Load tasks from JSON file, create file if it doesn't exist"""
        if not os.path.exists(self.filename):
            return []
        
        try:
            with open(self.filename, 'r') as file:
                return json.load(file)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading tasks: {e}")
            return []
    
    def save_tasks(self):
        """Save tasks to JSON file"""
        try:
            with open(self.filename, 'w') as file:
                json.dump(self.tasks, file, indent=2)
        except IOError as e:
            print(f"Error saving tasks: {e}")
    
    def get_next_id(self):
        """Get next available ID for a new task"""
        if not self.tasks:
            return 1
        return max(task['id'] for task in self.tasks) + 1
    
    def find_task_by_id(self, task_id):
        """Find task by ID"""
        for task in self.tasks:
            if task['id'] == task_id:
                return task
        return None
    
    def add_task(self, description):
        """Add a new task"""
        if not description.strip():
            print("Error: Task description cannot be empty")
            return
        
        task = {
            'id': self.get_next_id(),
            'description': description,
            'status': 'todo',
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
        
        self.tasks.append(task)
        self.save_tasks()
        print(f"Task added successfully (ID: {task['id']})")
    
    def update_task(self, task_id, description):
        """Update task description"""
        task = self.find_task_by_id(task_id)
        if not task:
            print(f"Error: Task with ID {task_id} not found")
            return
        
        if not description.strip():
            print("Error: Task description cannot be empty")
            return
        
        task['description'] = description
        task['updatedAt'] = datetime.now().isoformat()
        self.save_tasks()
        print(f"Task {task_id} updated successfully")
    
    def delete_task(self, task_id):
        """Delete a task"""
        task = self.find_task_by_id(task_id)
        if not task:
            print(f"Error: Task with ID {task_id} not found")
            return
        
        self.tasks = [t for t in self.tasks if t['id'] != task_id]
        self.save_tasks()
        print(f"Task {task_id} deleted successfully")
    
    def mark_task_status(self, task_id, status):
        """Mark task with specific status"""
        valid_statuses = ['todo', 'in-progress', 'done']
        if status not in valid_statuses:
            print(f"Error: Invalid status. Valid statuses are: {', '.join(valid_statuses)}")
            return
        
        task = self.find_task_by_id(task_id)
        if not task:
            print(f"Error: Task with ID {task_id} not found")
            return
        
        task['status'] = status
        task['updatedAt'] = datetime.now().isoformat()
        self.save_tasks()
        print(f"Task {task_id} marked as {status}")
    
    def list_tasks(self, status_filter=None):
        """List tasks with optional status filter"""
        if not self.tasks:
            print("No tasks found")
            return
        
        filtered_tasks = self.tasks
        if status_filter:
            filtered_tasks = [task for task in self.tasks if task['status'] == status_filter]
        
        if not filtered_tasks:
            status_msg = f" with status '{status_filter}'" if status_filter else ""
            print(f"No tasks found{status_msg}")
            return
        
        print(f"\n{'ID':<4} {'Status':<12} {'Description':<50} {'Created':<20}")
        print("-" * 86)
        
        for task in filtered_tasks:
            created_date = datetime.fromisoformat(task['createdAt']).strftime('%Y-%m-%d %H:%M')
            print(f"{task['id']:<4} {task['status']:<12} {task['description']:<50} {created_date:<20}")

def print_usage():
    """Print usage instructions"""
    usage = """
Usage: python task_cli.py <command> [arguments]

Commands:
  add <description>              Add a new task
  update <id> <description>      Update task description
  delete <id>                    Delete a task
  mark-in-progress <id>          Mark task as in progress
  mark-done <id>                 Mark task as done
  list [status]                  List tasks (optionally filter by status)
                                 Status options: todo, in-progress, done

Examples:
  python task_cli.py add "Buy groceries"
  python task_cli.py update 1 "Buy groceries and cook dinner"
  python task_cli.py delete 1
  python task_cli.py mark-in-progress 1
  python task_cli.py mark-done 1
  python task_cli.py list
  python task_cli.py list done
  python task_cli.py list todo
  python task_cli.py list in-progress
    """
    print(usage)

def main():
    if len(sys.argv) < 2:
        print_usage()
        sys.exit(1)
    
    tracker = TaskTracker()
    command = sys.argv[1].lower()
    
    try:
        if command == "add":
            if len(sys.argv) < 3:
                print("Error: Please provide a task description")
                sys.exit(1)
            description = " ".join(sys.argv[2:])
            tracker.add_task(description)
        
        elif command == "update":
            if len(sys.argv) < 4:
                print("Error: Please provide task ID and new description")
                sys.exit(1)
            try:
                task_id = int(sys.argv[2])
                description = " ".join(sys.argv[3:])
                tracker.update_task(task_id, description)
            except ValueError:
                print("Error: Task ID must be a number")
                sys.exit(1)
        
        elif command == "delete":
            if len(sys.argv) < 3:
                print("Error: Please provide task ID")
                sys.exit(1)
            try:
                task_id = int(sys.argv[2])
                tracker.delete_task(task_id)
            except ValueError:
                print("Error: Task ID must be a number")
                sys.exit(1)
        
        elif command == "mark-in-progress":
            if len(sys.argv) < 3:
                print("Error: Please provide task ID")
                sys.exit(1)
            try:
                task_id = int(sys.argv[2])
                tracker.mark_task_status(task_id, "in-progress")
            except ValueError:
                print("Error: Task ID must be a number")
                sys.exit(1)
        
        elif command == "mark-done":
            if len(sys.argv) < 3:
                print("Error: Please provide task ID")
                sys.exit(1)
            try:
                task_id = int(sys.argv[2])
                tracker.mark_task_status(task_id, "done")
            except ValueError:
                print("Error: Task ID must be a number")
                sys.exit(1)
        
        elif command == "list":
            status_filter = None
            if len(sys.argv) > 2:
                status_filter = sys.argv[2].lower()
                if status_filter not in ['todo', 'in-progress', 'done']:
                    print("Error: Invalid status filter. Use: todo, in-progress, or done")
                    sys.exit(1)
            tracker.list_tasks(status_filter)
        
        else:
            print(f"Error: Unknown command '{command}'")
            print_usage()
            sys.exit(1)
    
    except KeyboardInterrupt:
        print("\nOperation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
