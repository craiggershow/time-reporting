import Constants from 'expo-constants';

// Development
const DEV_API_URL = 'http://192.168.2.241:8000'; // Default development URL
const PROD_API_URL = 'https://api.yourapp.com'; // Production URL

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const API_TIMEOUT = 10000; // 10 seconds

// Define endpoint type
type EndpointKey = keyof typeof API_ENDPOINTS;

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  CURRENT_USER: '/api/auth/me',
  TIMESHEETS_CURRENT: '/api/timesheets/current',
  TIMESHEETS: '/api/timesheets',
  PREVIOUS_TIMESHEET: '/api/timesheets/previous',
  SUBMIT_TIMESHEET: '/api/timesheets/submit',
  RECALL_TIMESHEET: '/api/timesheets/recall',
  PENDING_TIMESHEETS: '/api/admin/timesheets/pending',
  APPROVE_TIMESHEET: '/api/admin/timesheets/approve',
  PAY_PERIODS: '/api/pay-periods',
  EMPLOYEES: '/api/employees',
  SAVE_TIMESHEET_DRAFT: '/api/timesheet/draft',
  USERS: '/api/admin/users',
  USER_PROFILE: '/api/users/profile',
  SETTINGS: '/api/settings',
} as const;

export function buildApiUrl(endpoint: EndpointKey, ...params: string[]): string {
  if (!endpoint) {
    throw new Error('Endpoint is required');
  }

  const path = API_ENDPOINTS[endpoint];
  if (!path) {
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }

  // Ensure path starts with slash and remove any double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${cleanPath}`;

  // Add any additional parameters
  if (params.length > 0) {
    return `${url}/${params.join('/')}`;
  }

  return url;
}

// For debugging
if (__DEV__) {
  console.log('API_BASE_URL:', API_BASE_URL);
} 