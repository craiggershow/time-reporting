import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { user } = useAuth();
  return <Redirect href={user?.role === 'ADMIN' ? '/(app)/admin' : '/(app)/timesheet'} />;
} 