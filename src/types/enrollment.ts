// types/enrollment.ts

/**
 * Trạng thái của Trainee trong một Khóa học
 */
export enum UserCourseStatus {
  IN_PROGRESS = 0,
  PASS = 1,
  FAIL = 2,
  RESIGN = 3,
}

/**
 * Kiểu cho model UserCourse (Trainee tham gia Khóa học)
 */
export interface UserCourse {
  id: number;
  user: number; // ID của Trainee
  course: number; // ID của Course
  joined_at: string;
  finished_at?: string | null;
  status: UserCourseStatus;
}

/**
 * Trạng thái của Trainee trong một Môn học
 */
export enum UserSubjectStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  FINISHED = 2,
}

/**
 * Kiểu cho model UserSubject (Tiến độ Môn học của Trainee)
 */
export interface UserSubject {
  id: number;
  user_course: number; // ID của UserCourse
  course_subject: number; // ID của CourseSubject
  user: number; // ID của Trainee
  status: UserSubjectStatus;
  score?: number | null;
  started_at?: string | null;
  completed_at?: string | null;
}

/**
 * Trạng thái của Trainee trong một Task
 */
export enum UserTaskStatus {
  IN_PROGRESS = 0,
  COMPLETED = 1,
}

/**
 * Kiểu cho model UserTask (Tiến độ Task của Trainee)
 */
export interface UserTask {
  id: number;
  user: number; // ID của Trainee
  task: number; // ID của Task
  user_subject: number; // ID của UserSubject
  status: UserTaskStatus;
  spent_time?: number | null;
}
