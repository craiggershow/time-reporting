import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/auth';
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

  const checkAuth = async () => {
    try {
      console.log('Checking auth status...');
      const response = await fetch(buildApiUrl('CURRENT_USER'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('Auth check response status:', response.status);
      
      if (!response.ok) {
        console.log('Auth check failed:', response.status);
        setUser(null);
        return;
      }

      const data = await response.json();
      console.log('Auth check data:', data);

      if (data.user && data.user.role) {
        const userData = {
          ...data.user,
          isAdmin: data.user.role === 'ADMIN'
        };
        console.log('Setting user data:', userData);
        setUser(userData);
      } else {
        console.log('No valid user data in response');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('Attempting login...');
      const response = await fetch(buildApiUrl('LOGIN'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
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
        throw new Error('Invalid user data received');
      }

      const userData = {
        ...data.user,
        isAdmin: data.user.role === 'ADMIN'
      };
      console.log('Setting user after login:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      await fetch(buildApiUrl('LOGOUT'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
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