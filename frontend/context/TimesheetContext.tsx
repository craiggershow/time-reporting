import { createContext, useContext, useState, useCallback } from 'react';
import { router } from 'expo-router';
import { buildApiUrl } from '@/constants/Config';
import { WeekData, TimeEntry, DayType, TimesheetData } from '@/types/timesheet';

interface TimesheetContextType {
  currentTimesheet: TimesheetData | null;
  isLoading: boolean;
  error: string | null;
  fetchCurrentTimesheet: () => Promise<void>;
  updateTimesheetState: (action: TimesheetAction) => void;
}

// Define action types
export type TimesheetAction = 
  | { type: 'UPDATE_TIME_ENTRY'; payload: { week: 1 | 2; day: string; entry: any } }
  | { type: 'SET_EXTRA_HOURS'; payload: { week: 1 | 2; hours: number } }
  | { type: 'UPDATE_VACATION_HOURS'; payload: number };

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
      console.log('🔍 fetchCurrentTimesheet: Starting API call');
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(buildApiUrl('TIMESHEETS_CURRENT'), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch timesheet');
      }

      const data = await response.json();
      console.log('🔍 fetchCurrentTimesheet: Received data from API', data);
      
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

      console.log('🔍 fetchCurrentTimesheet: Setting transformed data', transformedData);
      setCurrentTimesheet(transformedData);
    } catch (error) {
      console.error('🔍 Error fetching timesheet:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch timesheet');
    } finally {
      setIsLoading(false);
      console.log('🔍 fetchCurrentTimesheet: Completed');
    }
  }, []);

  // New function to update timesheet state without fetching from the database
  const updateTimesheetState = useCallback((action: TimesheetAction) => {
    console.log('📝 updateTimesheetState:', action);
    
    if (!currentTimesheet) {
      console.error('Cannot update timesheet: No current timesheet');
      return;
    }
    
    // Create a deep copy of the current timesheet
    const updatedTimesheet = JSON.parse(JSON.stringify(currentTimesheet));
    
    switch (action.type) {
      case 'UPDATE_TIME_ENTRY': {
        const { week, day, entry } = action.payload;
        console.log('📝 Updating time entry in state:', { week, day, entry });
        
        const weekKey = `week${week}` as const;
        
        // Update the entry
        if (updatedTimesheet[weekKey]?.days?.[day]) {
          updatedTimesheet[weekKey].days[day] = entry;
          
          // Recalculate total hours for the week
          updatedTimesheet[weekKey].totalHours = calculateWeekTotalHours(updatedTimesheet[weekKey]);
          
          // Update the state
          setCurrentTimesheet(updatedTimesheet);
          console.log('📝 Updated timesheet state:', updatedTimesheet);
          
          // Send update to the server (this will be implemented later)
          saveTimeEntryToDatabase(week, day, entry);
        }
        break;
      }
      
      case 'SET_EXTRA_HOURS': {
        const { week, hours } = action.payload;
        console.log('📝 Setting extra hours in state:', { week, hours });
        
        const weekKey = `week${week}` as const;
        
        // Update the extra hours
        if (updatedTimesheet[weekKey]) {
          updatedTimesheet[weekKey].extraHours = hours;
          
          // Recalculate total hours for the week
          updatedTimesheet[weekKey].totalHours = calculateWeekTotalHours(updatedTimesheet[weekKey]);
          
          // Update the state
          setCurrentTimesheet(updatedTimesheet);
          console.log('📝 Updated timesheet state with extra hours:', updatedTimesheet);
          
          // TODO: Send update to the server
        }
        break;
      }
      
      case 'UPDATE_VACATION_HOURS': {
        const hours = action.payload;
        console.log('📝 Setting vacation hours in state:', hours);
        
        // Update the vacation hours
        updatedTimesheet.vacationHours = hours;
        
        // Update the state
        setCurrentTimesheet(updatedTimesheet);
        console.log('📝 Updated timesheet state with vacation hours:', updatedTimesheet);
        
        // TODO: Send update to the server
        break;
      }
      
      default:
        console.error('Unknown action type:', (action as any).type);
    }
  }, [currentTimesheet]);
  
  // Function to save time entry to database
  const saveTimeEntryToDatabase = async (week: 1 | 2, day: string, entry: any) => {
    if (!currentTimesheet) return;
    
    try {
      console.log('💾 Saving time entry to database:', { week, day, entry });
      
      const response = await fetch(buildApiUrl('UPDATE_TIME_ENTRY'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          timesheetId: currentTimesheet.id,
          week,
          day,
          entry,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update time entry');
      }
      
      const updatedDay = await response.json();
      console.log('💾 Time entry saved successfully:', updatedDay);
    } catch (error) {
      console.error('💾 Error saving time entry to database:', error);
    }
  };

  return (
    <TimesheetContext.Provider 
      value={{ 
        currentTimesheet, 
        isLoading, 
        error,
        fetchCurrentTimesheet,
        updateTimesheetState
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