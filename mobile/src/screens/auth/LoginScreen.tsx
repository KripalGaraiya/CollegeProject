import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { seedData } from '../../services/api';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedData();
      Alert.alert('Success', 'Demo data created! Use the credentials below to login.');
    } catch (error) {
      Alert.alert('Error', 'Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  const fillCredentials = (role: 'principal' | 'teacher' | 'student') => {
    const creds = {
      principal: { email: 'principal@bggaraiya.edu', password: 'principal123' },
      teacher: { email: 'teacher@bggaraiya.edu', password: 'teacher123' },
      student: { email: 'student@bggaraiya.edu', password: 'student123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>🎓</Text>
            </View>
            <Text style={styles.collegeName}>Shri B. G. Garaiya</Text>
            <Text style={styles.collegeSubtitle}>Homoeopathic Medical College</Text>
            <Text style={styles.collegeLocation}>& Hospital, Rajkot</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formSection}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>Sign in to your account</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.text.muted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.text.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button title="Sign In" onPress={handleLogin} loading={loading} style={styles.loginButton} />

            {/* Demo Credentials */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Demo Credentials</Text>

              <TouchableOpacity style={styles.demoItem} onPress={() => fillCredentials('principal')}>
                <Text style={styles.demoRole}>Principal</Text>
                <Text style={styles.demoCreds}>principal@bggaraiya.edu / principal123</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.demoItem} onPress={() => fillCredentials('teacher')}>
                <Text style={styles.demoRole}>Teacher</Text>
                <Text style={styles.demoCreds}>teacher@bggaraiya.edu / teacher123</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.demoItem} onPress={() => fillCredentials('student')}>
                <Text style={styles.demoRole}>Student</Text>
                <Text style={styles.demoCreds}>student@bggaraiya.edu / student123</Text>
              </TouchableOpacity>

              <Button
                title={seeding ? 'Creating...' : 'Initialize Demo Data'}
                onPress={handleSeedData}
                variant="outline"
                loading={seeding}
                style={styles.seedButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoSection: {
    paddingVertical: SPACING.xxxl,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  logoEmoji: {
    fontSize: 40,
  },
  collegeName: {
    fontSize: FONTS.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  collegeSubtitle: {
    fontSize: FONTS.xl,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  collegeLocation: {
    fontSize: FONTS.md,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  formSection: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xxxl,
    borderTopRightRadius: RADIUS.xxxl,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  welcomeText: {
    fontSize: FONTS.xxl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: FONTS.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONTS.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: FONTS.lg,
    color: COLORS.text.primary,
  },
  eyeIcon: {
    fontSize: 18,
  },
  loginButton: {
    marginTop: SPACING.md,
  },
  demoSection: {
    marginTop: SPACING.xxl,
    paddingTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  demoTitle: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  demoItem: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  demoRole: {
    fontSize: FONTS.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  demoCreds: {
    fontSize: FONTS.xs,
    color: COLORS.text.muted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  seedButton: {
    marginTop: SPACING.md,
  },
});

export default LoginScreen;
