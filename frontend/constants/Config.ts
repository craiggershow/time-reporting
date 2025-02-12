import Constants from 'expo-constants';

// Development
const DEV_API_URL = 'http://192.168.2.241:8000'; // Default development URL
const PROD_API_URL = 'https://api.yourapp.com'; // Production URL

export const API_BASE_URL = __DEV__ 
  ? (process.env.EXPO_PUBLIC_API_URL || DEV_API_URL)
  : PROD_API_URL;

export const API_TIMEOUT = 10000; // 10 seconds

export const API_ENDPOINTS = {
  LOGIN: 'api/auth/login',
  LOGOUT: 'api/auth/logout',
  CURRENT_USER: 'api/auth/me',
  CURRENT_TIMESHEET: 'api/timesheets/current',
  PREVIOUS_TIMESHEET: 'api/timesheets/previous',
  SUBMIT_TIMESHEET: 'api/timesheets/submit',
  RECALL_TIMESHEET: (id: string) => `api/timesheets/${id}/recall`,
  PENDING_TIMESHEETS: 'api/admin/timesheets/pending',
  APPROVE_TIMESHEET: 'api/admin/timesheets/approve',
  PAY_PERIODS: 'api/pay-periods',
  EMPLOYEES: 'api/employees',
  SAVE_TIMESHEET_DRAFT: '/api/timesheet/draft',
  USERS: 'api/admin/users',
  // USER: (id: string) => `api/admin/users/${id}`, // Remove this if not using
} as const;

// Helper function to build API URLs
export function buildApiUrl(endpoint: keyof typeof API_ENDPOINTS): string {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || DEV_API_URL;
  console.log('Building URL with base:', baseUrl); // Debug log
  return `${baseUrl}/${API_ENDPOINTS[endpoint]}`;
}

// For debugging
if (__DEV__) {
  console.log('API_BASE_URL:', API_BASE_URL);
} 