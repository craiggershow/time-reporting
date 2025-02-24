import { View, StyleSheet, Image, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { getRememberedEmail, saveRememberedEmail, clearRememberedEmail } from '@/utils/storage';
import { useTheme } from '@/hooks/useTheme';
import { buildApiUrl } from '@/constants/Config';
import { useAuth } from '@/context/AuthContext';
import { colors as commonColors } from '@/styles/common';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * LoginScreen Component
 * 
 * Handles user authentication through a login form interface.
 * Manages email/password input, "remember me" functionality, and login state.
 */
export default function LoginScreen() {
  // Theme and navigation hooks
  const { colors: themeColors } = useTheme();
  const { login } = useAuth();
  const router = useRouter();

  // Form state management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Effect to load remembered email on component mount
   * Retrieves previously saved email if "remember me" was enabled
   */
  useEffect(() => {
    loadRememberedEmail();
  }, []);

  /**
   * Loads the remembered email from storage if it exists
   * Updates form state accordingly
   */
  async function loadRememberedEmail() {
    const savedEmail = await getRememberedEmail();
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }

  /**
   * Handles the login form submission
   * Validates input, makes API request, and manages login state
   */
  async function handleLogin() {
    try {
      setIsLoading(true);
      setError(null);

      // Input validation
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      // Make login request
      const response = await fetch(buildApiUrl('LOGIN'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      // Handle response
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await response.json();

      // Handle "remember me" functionality
      if (rememberMe) {
        await saveRememberedEmail(email);
      } else {
        await clearRememberedEmail();
      }

      // Update auth context and redirect
      await login(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Main render method
   * Displays login form with email/password inputs, remember me checkbox,
   * and login button. Shows error message if login fails.
   */
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        <Image 
          source={require('@/assets/images/KV-Dental-Sign-logo-and-Name-500x86.gif')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <View style={styles.formContainer}>
          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Checkbox
                checked={rememberMe}
                onValueChange={setRememberMe}
                label="Remember me"
                labelStyle={styles.rememberMeText}
              />
            </View>

            {error && (
              <ThemedText style={styles.error}>
                {error}
              </ThemedText>
            )}

            <Button
              onPress={handleLogin}
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * Component styles
 * Defines layout and appearance for the login screen and its elements
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 52,
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
    marginTop: 32,
  },
  loginButton: {
    marginTop: 8,
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
  },
  rememberMeText: {
    color: commonColors.text.light,
  },
}); 