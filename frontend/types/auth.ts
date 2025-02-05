export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

export interface LoginResponse {
  user: User;
}

export interface AuthError {
  error: string;
} 