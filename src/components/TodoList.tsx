'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Todo, FilterType } from '@/lib/types';
import { TodoService } from '@/lib/supabase';
import TodoForm from './TodoForm';
import TodoItem from './TodoItem';
import Button from './ui/Button';

export default function TodoList() {
  const { user } = useUser();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (user) {
      loadTodos();
    }
  }, [user]);

  const loadTodos = async () => {
    if (!user) return;
    
    try {
      const data = await TodoService.getTodos(user.id);
      setTodos(data);
    } catch (error) {
      console.error('Error loading todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (title: string) => {
    if (!user) return;

    setIsAdding(true);
    try {
      const newTodo = await TodoService.createTodo(user.id, title);
      setTodos(prev => [newTodo, ...prev]);
    } catch (error) {
      console.error('Error adding todo:', error);
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
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await TodoService.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleUpdate = async (id: string, title: string) => {
    try {
      const updatedTodo = await TodoService.updateTodo(id, { title });
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
      </div>

      {filteredTodos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {todos.length === 0 
            ? "No todos yet. Add your first task above!" 
            : `No ${filter} todos found.`
          }
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