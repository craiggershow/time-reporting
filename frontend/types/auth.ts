export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  token: string;
}

// Optional: Add a more detailed user type for the backend
export interface BackendUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EMPLOYEE';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  user: User;
}

export interface AuthError {
  error: string;
} 