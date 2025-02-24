import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { logDebug } from '@/utils/debug';

export function useProtectedRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      logDebug('useProtectedRoute', 'Loading - skipping route check');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const isAdmin = user?.role === 'ADMIN';

    logDebug('useProtectedRoute', 'Route check', {
      isAuthenticated,
      isAdmin,
      user: user ? {
        id: user.id,
        role: user.role,
        email: user.email
      } : null,
      currentPath: segments.join('/'),
      segments
    });

    // Only handle two cases for now:
    // 1. Unauthenticated -> login
    // 2. Admin in auth group -> admin section
    
    if (!isAuthenticated && !inAuthGroup) {
      logDebug('useProtectedRoute', 'Redirecting to login');
      router.replace('/(auth)/login');
      return;
    }

    if (isAuthenticated && inAuthGroup && isAdmin) {
      logDebug('useProtectedRoute', 'Redirecting admin from auth group to admin section');
      router.replace('/(app)/admin');
      return;
    }

  }, [isAuthenticated, isLoading, user, segments]);
} 