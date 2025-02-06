import { createContext, useContext, useReducer } from 'react';
import { PayPeriod, TimeEntry, DayType } from '@/types/timesheet';

interface TimesheetState {
  currentPayPeriod: PayPeriod | null;
  isLoading: boolean;
  error: string | null;
}

type TimesheetAction =
  | { type: 'SET_PAY_PERIOD'; payload: PayPeriod }
  | { type: 'UPDATE_TIME_ENTRY'; payload: { week: 1 | 2; day: keyof WeekData; entry: TimeEntry } }
  | { type: 'SET_EXTRA_HOURS'; payload: { week: 1 | 2; hours: number } }
  | { type: 'SET_VACATION_HOURS'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: TimesheetState = {
  currentPayPeriod: null,
  isLoading: false,
  error: null,
};

export function createEmptyTimeEntry(): TimeEntry {
  return {
    startTime: null,
    endTime: null,
    lunchStartTime: null,
    lunchEndTime: null,
    dayType: 'regular',
    totalHours: 0,
  };
}

export function createEmptyWeekData(): WeekData {
  return {
    monday: createEmptyTimeEntry(),
    tuesday: createEmptyTimeEntry(),
    wednesday: createEmptyTimeEntry(),
    thursday: createEmptyTimeEntry(),
    friday: createEmptyTimeEntry(),
    extraHours: 0,
    totalHours: 0,
  };
}

function timesheetReducer(state: TimesheetState, action: TimesheetAction): TimesheetState {
  switch (action.type) {
    case 'SET_PAY_PERIOD':
      return {
        ...state,
        currentPayPeriod: action.payload,
        error: null,
      };
    case 'UPDATE_TIME_ENTRY': {
      const { week, day, entry } = action.payload;
      if (!state.currentPayPeriod) return state;

      const weekKey = `week${week}` as const;
      
      console.log('Reducer Update:', {
        week,
        weekKey,
        day,
        entry,
        currentState: state.currentPayPeriod[weekKey]
      });

      return {
        ...state,
        currentPayPeriod: {
          ...state.currentPayPeriod,
          [weekKey]: {
            ...state.currentPayPeriod[weekKey],
            [day]: entry,
          },
        },
      };
    }
    case 'SET_EXTRA_HOURS':
      if (!state.currentPayPeriod) return state;
      const week = `week${action.payload.week}` as keyof PayPeriod;
      return {
        ...state,
        currentPayPeriod: {
          ...state.currentPayPeriod,
          [week]: {
            ...state.currentPayPeriod[week],
            extraHours: action.payload.hours,
          },
        },
      };
    case 'SET_VACATION_HOURS':
      if (!state.currentPayPeriod) return state;
      return {
        ...state,
        currentPayPeriod: {
          ...state.currentPayPeriod,
          vacationHours: action.payload,
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
}

const TimesheetContext = createContext<{
  state: TimesheetState;
  dispatch: React.Dispatch<TimesheetAction>;
} | null>(null);

export function TimesheetProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(timesheetReducer, initialState);

  return (
    <TimesheetContext.Provider value={{ state, dispatch }}>
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