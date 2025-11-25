import { User } from "./user";

export interface DailyReport {
  id: number;
  user: number;
  course: number;
  content?: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  user: User;
  content: string;
  created_at: string;
  content_type: number;
  object_id: number;
}
