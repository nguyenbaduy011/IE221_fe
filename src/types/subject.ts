// src/types/subject.ts

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
  submission_file: string | null; // URL file
}

export interface Comment {
  id: number;
  user: {
    id: number;
    full_name: string;
    // avatar: string; // Nếu backend có trả về avatar
  };
  content: string;
  created_at: string;
}

export interface SubjectDetail {
  id: number; // UserSubject ID
  subject_name: string;
  status: SubjectStatus;
  score: number | null;
  max_score: number;
  estimated_time_days: number;
  
  // Date info
  start_date: string; // CourseSubject start date (Plan)
  deadline: string;   // CourseSubject finish date (Plan)
  actual_start_day: string | null;
  actual_end_day: string | null;
  
  tasks: Task[];
  comments: Comment[]; // Danh sách nhận xét
  
  // Thông tin Student & Course (Lấy từ relation)
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