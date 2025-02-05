import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  REMEMBERED_EMAIL: '@time_reporting:remembered_email',
} as const;

export async function saveRememberedEmail(email: string) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
  } catch (error) {
    console.error('Error saving remembered email:', error);
  }
}

export async function getRememberedEmail(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL);
  } catch (error) {
    console.error('Error getting remembered email:', error);
    return null;
  }
}

export async function clearRememberedEmail() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
  } catch (error) {
    console.error('Error clearing remembered email:', error);
  }
} 