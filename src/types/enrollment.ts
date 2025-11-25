export enum UserCourseStatus {
  IN_PROGRESS = 0,
  PASS = 1,
  FAIL = 2,
  RESIGN = 3,
}

export interface UserCourse {
  id: number;
  user: number;
  course: number;
  joined_at: string;
  finished_at?: string | null;
  status: UserCourseStatus;
}

export enum UserSubjectStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  FINISHED = 2,
}

export interface UserSubject {
  id: number;
  user_course: number;
  course_subject: number;
  user: number;
  status: UserSubjectStatus;
  score?: number | null;
  started_at?: string | null;
  completed_at?: string | null;
}

export enum UserTaskStatus {
  IN_PROGRESS = 0,
  COMPLETED = 1,
}

export interface UserTask {
  id: number;
  user: number;
  task: number;
  user_subject: number;
  status: UserTaskStatus;
  spent_time?: number | null;
}
