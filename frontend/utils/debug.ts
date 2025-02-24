export function logDebug(component: string, action: string, data?: any) {
  console.log(`[${component}] ${action}`, data ? data : '');
} 