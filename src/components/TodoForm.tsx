'use client';

import { useState } from 'react';
import Button from './ui/Button';

interface TodoFormProps {
  onAdd: (title: string) => Promise<void>;
  isLoading: boolean;
}

export default function TodoForm({ onAdd, isLoading }: TodoFormProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onAdd(title.trim());
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !title.trim()}>
          {isLoading ? 'Adding...' : 'Add'}
        </Button>
      </div>
    </form>
  );
}