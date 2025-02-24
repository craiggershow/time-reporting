import { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { useSettings } from './SettingsContext';
import { logDebug } from '@/utils/debug';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (data: { user: User }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { clearSettings, fetchSettings } = useSettings();

  useEffect(() => {
    logDebug('AuthProvider', 'Initializing');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      logDebug('AuthProvider', 'checkAuth - START');
      setIsLoading(true);
      
      const savedUser = await AsyncStorage.getItem('user');
      logDebug('AuthProvider', 'checkAuth - savedUser', savedUser);
      
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        logDebug('AuthProvider', 'checkAuth - parsed userData', userData);
        
        setUser(userData);
        setIsAuthenticated(true);
        logDebug('AuthProvider', 'checkAuth - auth state updated', {
          user: userData,
          isAuthenticated: true
        });
        
        if (userData.role !== 'ADMIN') {
          logDebug('AuthProvider', 'checkAuth - fetching settings for non-admin');
          await fetchSettings();
        } else {
          logDebug('AuthProvider', 'checkAuth - skipping settings for admin');
        }
      } else {
        logDebug('AuthProvider', 'checkAuth - No saved user found');
      }
    } catch (error) {
      logDebug('AuthProvider', 'checkAuth - ERROR', error);
    } finally {
      setIsLoading(false);
      logDebug('AuthProvider', 'checkAuth - COMPLETE', {
        user,
        isAuthenticated,
        isLoading: false
      });
    }
  };

  const login = async (data: { user: User }) => {
    try {
      logDebug('AuthProvider', 'login - START', data);
      setIsLoading(true);
      
      setUser(data.user);
      setIsAuthenticated(true);
      logDebug('AuthProvider', 'login - auth state updated', {
        user: data.user,
        isAuthenticated: true
      });
      
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      logDebug('AuthProvider', 'login - user saved to storage');
      
      if (data.user.role !== 'ADMIN') {
        logDebug('AuthProvider', 'login - fetching settings for non-admin');
        await fetchSettings();
      } else {
        logDebug('AuthProvider', 'login - ADMIN detected');
      }
    } catch (error) {
      logDebug('AuthProvider', 'login - ERROR', error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
      logDebug('AuthProvider', 'login - COMPLETE', {
        user: data.user,
        isAuthenticated: true,
        isLoading: false
      });
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      clearSettings();
      await AsyncStorage.removeItem('user');
      await router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error in logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated,
        isLoading,
        login,
        logout 
      }}
    >
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