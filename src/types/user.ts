export enum UserRole {
  TRAINEE = "TRAINEE",
  SUPERVISOR = "SUPERVISOR",
  ADMIN = "ADMIN",
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  birthday?: string | null;
  gender?: number | null;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
}

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
