export interface Todo {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export type FilterType = 'all' | 'pending' | 'completed';