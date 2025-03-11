export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EMPLOYEE';
  isAdmin: boolean;
  employeeId?: string; // Optional for backward compatibility
}

// Optional: Add a more detailed user type for the backend
export interface BackendUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EMPLOYEE';
  employeeId: string;
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
    employeeId?: string;
  };
  token: string;
}

export interface AuthError {
  error: string;
} 