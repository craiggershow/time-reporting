import { View, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { ThemedText } from '../ThemedText';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DateTimePicker } from '../ui/DateTimePicker';
import { colors, spacing } from '@/styles/common';
import { format } from 'date-fns';

interface Holiday {
  date: Date;
  name: string;
  payRate: number;
}

interface HolidayManagementModalProps {
  holidays: Holiday[];
  onClose: () => void;
  onSave: (holidays: Holiday[]) => void;
}

export function HolidayManagementModal({ holidays: initialHolidays, onClose, onSave }: HolidayManagementModalProps) {
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [newHoliday, setNewHoliday] = useState<Holiday>({
    date: new Date(),
    name: '',
    payRate: 1.5,
  });

  const handleAddHoliday = () => {
    if (!newHoliday.name) return;
    
    setHolidays([...holidays, { ...newHoliday }]);
    setNewHoliday({
      date: new Date(),
      name: '',
      payRate: 1.5,
    });
  };

  const handleRemoveHoliday = (index: number) => {
    setHolidays(holidays.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(holidays);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <View style={styles.container}>
        <ThemedText type="title">Manage Holidays</ThemedText>
        
        <View style={styles.section}>
          <ThemedText style={styles.subtitle}>Add New Holiday</ThemedText>
          <View style={styles.addHolidayForm}>
            <DateTimePicker
              label="Date"
              value={newHoliday.date}
              onChange={(date) => setNewHoliday({ ...newHoliday, date })}
            />
            <Input
              label="Holiday Name"
              value={newHoliday.name}
              onChangeText={(name) => setNewHoliday({ ...newHoliday, name })}
              placeholder="e.g., Christmas Day"
            />
            <Input
              label="Pay Rate Multiplier"
              value={newHoliday.payRate.toString()}
              onChangeText={(value) => setNewHoliday({ ...newHoliday, payRate: parseFloat(value) || 1.5 })}
              keyboardType="decimal-pad"
            />
            <Button onPress={handleAddHoliday} disabled={!newHoliday.name}>
              Add Holiday
            </Button>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.subtitle}>Current Holidays</ThemedText>
          <ScrollView style={styles.holidayList}>
            {holidays.map((holiday, index) => (
              <View key={index} style={styles.holidayItem}>
                <View style={styles.holidayInfo}>
                  <ThemedText>{holiday.name}</ThemedText>
                  <ThemedText style={styles.holidayDetails}>
                    {format(holiday.date, 'MMM d, yyyy')} - {holiday.payRate}x pay
                  </ThemedText>
                </View>
                <Button
                  onPress={() => handleRemoveHoliday(index)}
                  variant="secondary"
                >
                  Remove
                </Button>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.actions}>
          <Button onPress={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onPress={handleSave}>
            Save Changes
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  section: {
    backgroundColor: colors.background.tableAlt,
    padding: spacing.md,
    borderRadius: 8,
  },
  addHolidayForm: {
    gap: spacing.md,
  },
  holidayList: {
    maxHeight: 300,
  },
  holidayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  holidayInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  holidayDetails: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
}); 