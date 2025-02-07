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
  CURRENT_TIMESHEET: 'api/timesheets/current',
  SUBMIT_TIMESHEET: 'api/timesheets/submit',
  RECALL_TIMESHEET: 'api/timesheets/recall',
  PAY_PERIODS: 'api/pay-periods',
  EMPLOYEES: 'api/employees',
  SAVE_TIMESHEET_DRAFT: '/api/timesheet/draft',
} as const;

// Helper function to build API URLs
export function buildApiUrl(endpoint: keyof typeof API_ENDPOINTS): string {
  return `${API_BASE_URL}/${API_ENDPOINTS[endpoint]}`;
}

// For debugging
if (__DEV__) {
  console.log('API_BASE_URL:', API_BASE_URL);
} 