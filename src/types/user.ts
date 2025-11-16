// types/user.ts
export enum UserRole {
  TRAINEE = "TRAINEE",
  SUPERVISOR = "SUPERVISOR",
  ADMIN = "ADMIN",
}

/**
 * Kiểu dữ liệu cho model CustomUser.
 */
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  birthday?: string | null; // DateField -> string (ISO 8601)
  gender?: number | null;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string; // DateTimeField -> string (ISO 8601)
}

/**
 * Dữ liệu trả về từ API /auth/login/ (Serializer tùy chỉnh)
 */
export interface AuthLoginResponse {
  status: string;
  data: {
    access: string;
    refresh: string;
    user: User;
  };
  message: string;
}

export interface AuthRegisterResponse {
  status: string;
  data: {
    user: User;
  };
  message: string;
}