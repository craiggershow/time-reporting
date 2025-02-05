import { View, StyleSheet, Image } from 'react-native';
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

export default function LoginScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      
      // Store user data or token if needed
      // await AsyncStorage.setItem('user', JSON.stringify(data.user));

      if (rememberMe) {
        await saveRememberedEmail(email);
      } else {
        await clearRememberedEmail();
      }

      router.replace('/(app)/timesheet');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image 
        source={require('@/assets/images/KV-Dental-Sign-logo-and-Name-500x86.gif')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ThemedText type="title">Time Sheet Portal</ThemedText>
      
      <View style={styles.form}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
        
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          editable={!isLoading}
        />

        {error && (
          <ThemedText style={styles.error}>{error}</ThemedText>
        )}

        <Checkbox
          checked={rememberMe}
          onPress={() => setRememberMe(!rememberMe)}
          label="Remember my email"
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
  form: {
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
}); 