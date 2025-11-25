export enum TaskStatus {
  NOT_DONE = 0,
  DONE = 1,
}

export enum SubjectStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  FINISHED_EARLY = 2,
  FINISHED_ON_TIME = 3,
  FINISHED_BUT_OVERDUE = 4,
  OVERDUE_AND_NOT_FINISHED = 5,
}

export interface Task {
  id: number;
  name: string;
  status: TaskStatus;
  spent_time: number | null;
  submission_file: string | null;
}

export interface Comment {
  id: number;
  user: {
    id: number;
    full_name: string;
  };
  content: string;
  created_at: string;
}

export interface SubjectDetail {
  id: number;
  subject_name: string;
  status: SubjectStatus;
  score: number | null;
  max_score: number;
  estimated_time_days: number;

  start_date: string;
  deadline: string;
  actual_start_day: string | null;
  actual_end_day: string | null;

  tasks: Task[];
  comments: Comment[];

  student: {
    name: string;
  };
  course: {
    name: string;
    start_date: string;
    finish_date: string;
    status: number;
  };
}
