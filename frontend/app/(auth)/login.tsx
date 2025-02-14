import { View, StyleSheet, Image, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Picker } from '@react-native-picker/picker';
import { getRememberedEmail, saveRememberedEmail, clearRememberedEmail } from '@/utils/storage';
import { useTheme } from '@/hooks/useTheme';
import { buildApiUrl } from '@/constants/Config';
import { useAuth } from '@/context/AuthContext';
import { colors as commonColors } from '@/styles/common';

export default function LoginScreen() {
  const { colors: themeColors } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [loginType, setLoginType] = useState<'employee' | 'admin'>('employee');

  useEffect(() => {
    // Load remembered email on mount
    loadRememberedEmail();
  }, []);

  async function loadRememberedEmail() {
    const savedEmail = await getRememberedEmail();
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(buildApiUrl('LOGIN'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          isAdmin: loginType === 'admin'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Handle remember me
      if (rememberMe) {
        await saveRememberedEmail(email);
      } else {
        await clearRememberedEmail();
      }

      // Save user data and handle navigation in one place
      await login(data);
      
      // Navigate based on user role
      if (data.isAdmin) {
        router.replace('/(app)/admin');
      } else {
        router.replace('/(app)/timesheet');
      }

    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!isLoading) {
      handleLogin();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        <Image 
          source={require('@/assets/images/KV-Dental-Sign-logo-and-Name-500x86.gif')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText type="title">Time Sheet Portal</ThemedText>
        
        <View style={styles.formContainer}>
          <View style={[styles.pickerContainer, { backgroundColor: themeColors.inputBackground }]}>
            <Picker
              selectedValue={loginType}
              onValueChange={(value) => setLoginType(value as 'employee' | 'admin')}
              style={styles.picker}
              enabled={!isLoading}
            >
              <Picker.Item label="Employee Login" value="employee" />
              <Picker.Item label="Admin Login" value="admin" />
            </Picker>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              returnKeyType="next"
            />
            
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              editable={!isLoading}
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />

            {error && (
              <ThemedText style={styles.error}>{error}</ThemedText>
            )}

            <Checkbox
              checked={rememberMe}
              onValueChange={() => setRememberMe(!rememberMe)}
              label="Remember my email"
              labelStyle={styles.rememberMeText}
            />

            <Button 
              onPress={handleLogin} 
              style={styles.loginButton}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

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
  pickerContainer: {
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
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