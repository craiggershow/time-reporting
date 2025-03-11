import { Platform } from 'react-native';

/**
 * Adds a beforeunload event listener on web platforms.
 * Does nothing on native platforms.
 * 
 * @param callback The function to call when the user tries to leave the page
 * @returns A cleanup function that removes the event listener
 */
export function addBeforeUnloadListener(callback: (event: any) => void): () => void {
  // Only add the event listener on web
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      window.addEventListener('beforeunload', callback);
      return () => {
        try {
          window.removeEventListener('beforeunload', callback);
        } catch (error) {
          console.warn('Error removing beforeunload event listener:', error);
        }
      };
    } catch (error) {
      console.warn('Error adding beforeunload event listener:', error);
      return () => {};
    }
  }
  
  // Return a no-op cleanup function for native platforms
  return () => {};
}

/**
 * Checks if the code is running on a web platform
 */
export function isWeb(): boolean {
  return Platform.OS === 'web';
}

/**
 * Checks if the code is running on iOS
 */
export function isIOS(): boolean {
  return Platform.OS === 'ios';
}

/**
 * Checks if the code is running on Android
 */
export function isAndroid(): boolean {
  return Platform.OS === 'android';
}

/**
 * Executes different code based on the platform
 * 
 * @param options Object containing platform-specific implementations
 * @returns The result of the platform-specific implementation
 */
export function platformSelect<T>(options: {
  web?: () => T;
  ios?: () => T;
  android?: () => T;
  default?: () => T;
}): T | undefined {
  if (isWeb() && options.web) {
    return options.web();
  } else if (isIOS() && options.ios) {
    return options.ios();
  } else if (isAndroid() && options.android) {
    return options.android();
  } else if (options.default) {
    return options.default();
  }
  return undefined;
}

/**
 * Downloads a file on web platforms.
 * On native platforms, this will need to be implemented differently.
 * 
 * @param content The content of the file
 * @param filename The name of the file
 * @param mimeType The MIME type of the file
 */
export function downloadFile(content: string | Blob, filename: string, mimeType: string = 'text/plain'): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      // Create a blob if content is a string
      const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link element
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      
      // Trigger the download
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.warn('Error downloading file:', error);
    }
  } else {
    console.warn('File download is not supported on this platform');
    // For native platforms, you would need to use react-native-fs or expo-file-system
    // to save files to the device's storage
  }
} 