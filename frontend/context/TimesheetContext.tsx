import { createContext, useContext, useState, useCallback } from 'react';
import { router } from 'expo-router';
import { buildApiUrl } from '@/constants/Config';
import { WeekData, TimeEntry, DayType, TimesheetData } from '@/types/timesheet';

interface TimesheetContextType {
  currentTimesheet: TimesheetData | null;
  isLoading: boolean;
  error: string | null;
  fetchCurrentTimesheet: () => Promise<void>;
  updateTimeEntry: (action: any) => void;
}

// Helper function to calculate total hours for a week
export function calculateWeekTotalHours(week: WeekData): number {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
  
  return days.reduce((total, day) => {
    const entry = week.days[day];
    if (!entry) return total;
    return total + (entry.totalHours || 0);
  }, 0);
}

const TimesheetContext = createContext<TimesheetContextType | null>(null);

export function TimesheetProvider({ children }: { children: React.ReactNode }) {
  const [currentTimesheet, setCurrentTimesheet] = useState<TimesheetData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentTimesheet = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(buildApiUrl('TIMESHEETS_CURRENT'), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch timesheet');
      }

      const data = await response.json();
      
      // Transform the data to match our frontend structure
      const transformedData: TimesheetData = {
        id: data.id,
        userId: data.userId,
        status: data.status,
        payPeriod: data.payPeriod,
        vacationHours: data.vacationHours,
        submittedAt: data.submittedAt,
        week1: {
          days: {
            monday: data.weeks.week1.days.monday || null,
            tuesday: data.weeks.week1.days.tuesday || null,
            wednesday: data.weeks.week1.days.wednesday || null,
            thursday: data.weeks.week1.days.thursday || null,
            friday: data.weeks.week1.days.friday || null,
          },
          totalHours: calculateWeekTotalHours(data.weeks.week1)
        },
        week2: {
          days: {
            monday: data.weeks.week2.days.monday || null,
            tuesday: data.weeks.week2.days.tuesday || null,
            wednesday: data.weeks.week2.days.wednesday || null,
            thursday: data.weeks.week2.days.thursday || null,
            friday: data.weeks.week2.days.friday || null,
          },
          totalHours: calculateWeekTotalHours(data.weeks.week2)
        }
      };

      setCurrentTimesheet(transformedData);
    } catch (error) {
      console.error('Error fetching timesheet:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch timesheet');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTimeEntry = useCallback((action: any) => {
    // Implementation of updateTimeEntry
    // ...
  }, []);

  return (
    <TimesheetContext.Provider 
      value={{ 
        currentTimesheet, 
        isLoading, 
        error,
        fetchCurrentTimesheet,
        updateTimeEntry
      }}
    >
      {children}
    </TimesheetContext.Provider>
  );
}

export function useTimesheet() {
  const context = useContext(TimesheetContext);
  if (!context) {
    throw new Error('useTimesheet must be used within a TimesheetProvider');
  }
  return context;
} 