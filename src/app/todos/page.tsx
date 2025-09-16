import { UserButton } from '@clerk/nextjs';
import TodoList from '@/components/TodoList';

export default function TodosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Todos</h1>
        <UserButton afterSignOutUrl="/" />
      </div>
      
      <TodoList />
    </div>
  );
}