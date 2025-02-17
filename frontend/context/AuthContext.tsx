import { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginResponse } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildApiUrl } from '@/constants/Config';

interface LoginCredentials {
  email: string;
  password: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('Login attempt:', { ...credentials, password: '[REDACTED]' });
      
      const response = await fetch(buildApiUrl('LOGIN'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (!data.user || !data.user.role) {
        console.error('Invalid user data:', data);
        throw new Error('Invalid user data received');
      }

      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        role: data.user.role,
        isAdmin: data.user.role === 'ADMIN'
      };

      console.log('Processed user data:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(buildApiUrl('LOGOUT'), {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(buildApiUrl('CURRENT_USER'), {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user && data.user.role) {
          setUser({
            ...data.user,
            isAdmin: data.user.role === 'ADMIN'
          });
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 