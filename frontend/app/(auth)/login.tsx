import { View, StyleSheet, Image, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
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
import { SafeAreaView } from 'react-native-safe-area-context';

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
   * Handles key press events in the input fields
   * Triggers login when Enter key is pressed
   */
  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  /**
   * Main render method
   * Displays login form with email/password inputs, remember me checkbox,
   * and login button. Shows error message if login fails.
   */
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/KV-Dental-Sign-logo-and-Name-500x86.gif')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <ThemedText style={styles.formTitle}>Sign In</ThemedText>
              
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                onKeyPress={handleKeyPress}
                autoComplete="email"
                textContentType="emailAddress"
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                onKeyPress={handleKeyPress}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                passwordRules="minlength: 6;"
              />

              <View style={styles.rememberMeContainer}>
                <Checkbox
                  checked={rememberMe}
                  onValueChange={setRememberMe}
                  label="Remember me"
                  labelStyle={styles.rememberMeText}
                />
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <ThemedText style={styles.error}>
                    {error}
                  </ThemedText>
                </View>
              )}

              <Button
                onPress={isLoading ? () => {} : handleLogin}
                disabled={isLoading}
                style={styles.loginButton}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**
 * Component styles
 * Defines layout and appearance for the login screen and its elements
 */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 450,
    alignItems: 'center',
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  logo: {
    width: 300,
    height: 52,
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  form: {
    padding: 24,
    gap: 16,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1e293b',
  },
  input: {
    marginBottom: 8,
    ...Platform.select({
      web: {
        outline: 'none',
      },
    }),
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rememberMeText: {
    color: '#4b5563',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 8,
  },
}); 