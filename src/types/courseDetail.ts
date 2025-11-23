// types/courseDetail.ts

export interface SupervisorInfo {
  id: number;
  full_name: string;
  avatar?: string; // Nếu BE trả về
}

export interface SubjectItem {
  id: number; // CourseSubject ID
  subject_id: number;
  subject_name: string;
  subject_image: string | null;
  max_score: number;
  my_score: number | null;
  my_status: string;
  start_date: string | null;
  finish_date: string | null;
  // Feedback Data
  supervisor_comment: string;
  supervisor_info: SupervisorInfo | null;
  comment_at: string | null;
}

export interface Trainer {
  id: number;
  full_name: string;
  email: string;
  avatar?: string;
}

export interface Trainee {
  id: number;
  full_name: string;
  email: string;
  status: string; // "In Progress" | "Finished" ...
  joined_at: string;
}

export interface CourseMembers {
  trainers: {
    count: number;
    list: Trainer[];
  };
  trainees: {
    count: number;
    list: Trainee[];
  };
}

export interface CourseSubjectsData {
  count: number;
  list: SubjectItem[];
}

export interface CourseDetailResponse {
  id: number;
  name: string;
  image: string | null;
  status: number;
  status_display: string;
  start_date_fmt: string;
  finish_date_fmt: string;
  creator_name: string;
  updated_at_fmt: string;
  subjects: CourseSubjectsData;
  members: CourseMembers;
}
