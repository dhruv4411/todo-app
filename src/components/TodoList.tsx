'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Todo, FilterType } from '@/lib/types';
import { TodoService } from '@/lib/supabase';
import TodoForm from './TodoForm';
import TodoItem from './TodoItem';
import Button from './ui/Button';

export default function TodoList() {
  const { user, isLoaded } = useUser();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      console.log('👤 User loaded:', user.id);
      loadTodos();
    }
  }, [user, isLoaded]);

  const loadTodos = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await TodoService.getTodos(user.id);
      setTodos(data);
      console.log('📋 Loaded todos successfully');
    } catch (error: any) {
      console.error('❌ Error loading todos:', error);
      setError(error?.message || 'Failed to load todos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (title: string) => {
    if (!user) return;

    setIsAdding(true);
    setError(null);
    
    try {
      console.log('➕ Adding todo:', title);
      const newTodo = await TodoService.createTodo(user.id, title);
      setTodos(prev => [newTodo, ...prev]);
      console.log('✅ Todo added successfully');
    } catch (error: any) {
      console.error('❌ Error adding todo:', error);
      setError(error?.message || 'Failed to add todo');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      const updatedTodo = await TodoService.updateTodo(id, { completed });
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
    } catch (error: any) {
      console.error('❌ Error updating todo:', error);
      setError(error?.message || 'Failed to update todo');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await TodoService.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error: any) {
      console.error('❌ Error deleting todo:', error);
      setError(error?.message || 'Failed to delete todo');
    }
  };

  const handleUpdate = async (id: string, title: string) => {
    try {
      const updatedTodo = await TodoService.updateTodo(id, { title });
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
    } catch (error: any) {
      console.error('❌ Error updating todo:', error);
      setError(error?.message || 'Failed to update todo');
    }
  };

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'completed': return todo.completed;
      case 'pending': return !todo.completed;
      default: return true;
    }
  });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500">Loading your todos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-800 font-medium mb-2">Error</h3>
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <Button size="sm" onClick={loadTodos}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <TodoForm onAdd={handleAdd} isLoading={isAdding} />

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </Button>
          <Button
            size="sm"
            variant={filter === 'pending' ? 'primary' : 'secondary'}
            onClick={() => setFilter('pending')}
          >
            Pending ({stats.pending})
          </Button>
          <Button
            size="sm"
            variant={filter === 'completed' ? 'primary' : 'secondary'}
            onClick={() => setFilter('completed')}
          >
            Completed ({stats.completed})
          </Button>
        </div>
        
        {todos.length > 0 && (
          <Button size="sm" variant="secondary" onClick={loadTodos}>
            Refresh
          </Button>
        )}
      </div>

      {filteredTodos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-gray-600 text-lg font-medium mb-2">
            {todos.length === 0 
              ? "No todos yet!" 
              : `No ${filter} todos found`
            }
          </h3>
          <p className="text-gray-500">
            {todos.length === 0 
              ? "Add your first task above to get started" 
              : `Try switching to a different filter`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}