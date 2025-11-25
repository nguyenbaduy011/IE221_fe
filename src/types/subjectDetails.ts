export enum TaskStatus {
  DONE = "DONE",
  NOT_DONE = "NOT_DONE",
}

export interface UserTask {
  id: number;
  name: string;
  status: TaskStatus;
}

export interface Trainee {
  id: number;
  full_name: string;
  avatar?: string | null;
  email: string;
}

export interface CommentHistory {
  id: number;
  user: {
    id: number;
    full_name: string;
    email?: string;
  };
  content: string;
  created_at: string;
}

export interface SubjectDetail {
  id: number;
  name: string;
  course_name: string;
  supervisor_name: string;
  last_updated: string;
  duration: string;

  start_date: string;
  end_date: string;

  actual_start_date?: string | null;
  actual_end_date?: string | null;

  score?: number | null;
  max_score: number;
  supervisor_comment?: string | null;

  tasks: UserTask[];
  status: "IN_PROGRESS" | "COMPLETED";
  comment_history?: CommentHistory[];
  comment_updated_at?: string | null;
}
