import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to Todo App
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Organize your tasks and boost your productivity
        </p>

        <SignedOut>
          <div className="space-y-4">
            <p className="text-gray-500">Sign in to manage your todos</p>
            <SignInButton>
              <Button size="lg">Get Started</Button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <Link href="/todos">
            <Button size="lg">Go to My Todos</Button>
          </Link>
        </SignedIn>
      </div>
    </div>
  );
}