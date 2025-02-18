import React, { useMemo } from 'react';
import { View } from 'react-native';
import { DayRow } from './DayRow';

interface WeekProps {
  weekNumber: number;
  startDate: Date;
  // ... other props
}

export function Week({ weekNumber, startDate, ...props }: WeekProps) {
  // Calculate dates for each day of the week
  const dates = useMemo(() => {
    const weekDates = [];
    const weekStart = new Date(startDate);
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      weekDates.push(date);
    }
    
    return weekDates;
  }, [startDate]);

  return (
    <View>
      {/* Render each day with its correct date */}
      {dates.map((date, index) => (
        <DayRow
          key={index}
          date={date}
          // ... other props
        />
      ))}
    </View>
  );
} 