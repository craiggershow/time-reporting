export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EMPLOYEE';
  isAdmin: boolean;
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
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'EMPLOYEE';
  };
  token: string;
}

export interface AuthError {
  error: string;
} 