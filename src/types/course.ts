/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "./user";

export interface Category {
  id: number;
  name: string;
}

export interface Subject {
  id: number;
  name: string;
  max_score: number;
  estimated_time_days?: number | null;
  categories?: Category[];
}

export interface Task {
  id: number;
  name: string;
  content_type: number;
  object_id: number;
}

export interface CourseSupervisor {
  id: number;
  course: number;
  supervisor: User;
  created_at: string;
}

export interface CourseSubject {
  id: number;
  course: number;
  subject: Subject;
  position?: number | null;
  start_date?: string | null;
  finish_date?: string | null;
}

export interface Course {
  id: number;
  name: string;
  link_to_course?: string | null;
  image?: string | null;
  start_date: string;
  finish_date: string;
  creator: User;
  status: number;
  created_at: string;
  updated_at: string;

  course_supervisors: CourseSupervisor[];
  course_subjects: CourseSubject[];
}

export enum CourseStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  FINISHED = 2,
}

export interface DashboardCourse {
  id: number;
  name: string;
  link_to_course: string | null;
  image: string | null;
  start_date: string;
  finish_date: string;
  status: CourseStatus;
  created_at: string;
  member_count: number;
  supervisor_count: number;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

export interface ActivityData {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  avatar?: string;
}

export interface DashboardStats {
  total_supervisors: number;
  total_trainees: number;
  active_courses: number;
  completion_rate: number;
  chart_data: ChartData[];
  recent_activities: ActivityData[];
}
