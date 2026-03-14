import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, FONTS } from '../constants';
import {
  RootStackParamList,
  PrincipalTabParamList,
  TeacherTabParamList,
  StudentTabParamList,
} from '../types';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';

// Principal
import PrincipalDashboard from '../screens/principal/DashboardScreen';
import StudentsScreen from '../screens/principal/StudentsScreen';
import TeachersScreen from '../screens/principal/TeachersScreen';
import DepartmentsScreen from '../screens/principal/DepartmentsScreen';
import PrincipalNoticesScreen from '../screens/principal/NoticesScreen';
import LeavesScreen from '../screens/principal/LeavesScreen';

// Teacher
import TeacherDashboard from '../screens/teacher/DashboardScreen';
import TeacherAttendanceScreen from '../screens/teacher/AttendanceScreen';
import TeacherResultsScreen from '../screens/teacher/ResultsScreen';
import TeacherLeaveScreen from '../screens/teacher/LeaveScreen';

// Student
import StudentDashboard from '../screens/student/DashboardScreen';
import StudentAttendanceScreen from '../screens/student/AttendanceScreen';
import StudentFeesScreen from '../screens/student/FeesScreen';
import StudentResultsScreen from '../screens/student/ResultsScreen';
import StudentNoticesScreen from '../screens/student/NoticesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const PrincipalTab = createBottomTabNavigator<PrincipalTabParamList>();
const TeacherTab = createBottomTabNavigator<TeacherTabParamList>();
const StudentTab = createBottomTabNavigator<StudentTabParamList>();

// Tab icon component
const TabIcon: React.FC<{ label: string; focused: boolean }> = ({ label, focused }) => {
  const icons: Record<string, string> = {
    Dashboard: '📊',
    Students: '👨‍🎓',
    Teachers: '👨‍🏫',
    Departments: '🏛️',
    Notices: '📢',
    Leaves: '🗓️',
    Attendance: '📋',
    Results: '📝',
    Leave: '🗓️',
    Fees: '💰',
  };

  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        {icons[label] || '📌'}
      </Text>
    </View>
  );
};

// Principal Tab Navigator
const PrincipalTabNavigator: React.FC = () => (
  <PrincipalTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.text.muted,
      tabBarLabelStyle: { fontSize: FONTS.xs, fontWeight: '500' },
      tabBarStyle: {
        backgroundColor: COLORS.white,
        borderTopColor: COLORS.border,
        height: 60,
        paddingBottom: 6,
        paddingTop: 6,
      },
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: COLORS.white,
      headerTitleStyle: { fontWeight: '600', fontSize: FONTS.lg },
    })}
  >
    <PrincipalTab.Screen
      name="Dashboard"
      component={PrincipalDashboard}
      options={{ headerTitle: 'Principal Dashboard' }}
    />
    <PrincipalTab.Screen
      name="Students"
      component={StudentsScreen}
      options={{ headerTitle: 'Students' }}
    />
    <PrincipalTab.Screen
      name="Teachers"
      component={TeachersScreen}
      options={{ headerTitle: 'Teachers' }}
    />
    <PrincipalTab.Screen
      name="Departments"
      component={DepartmentsScreen}
      options={{ headerTitle: 'Departments' }}
    />
    <PrincipalTab.Screen
      name="Notices"
      component={PrincipalNoticesScreen}
      options={{ headerTitle: 'Notices' }}
    />
    <PrincipalTab.Screen
      name="Leaves"
      component={LeavesScreen}
      options={{ headerTitle: 'Leave Requests' }}
    />
  </PrincipalTab.Navigator>
);

// Teacher Tab Navigator
const TeacherTabNavigator: React.FC = () => (
  <TeacherTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      tabBarActiveTintColor: COLORS.secondary,
      tabBarInactiveTintColor: COLORS.text.muted,
      tabBarLabelStyle: { fontSize: FONTS.xs, fontWeight: '500' },
      tabBarStyle: {
        backgroundColor: COLORS.white,
        borderTopColor: COLORS.border,
        height: 60,
        paddingBottom: 6,
        paddingTop: 6,
      },
      headerStyle: { backgroundColor: COLORS.secondary },
      headerTintColor: COLORS.white,
      headerTitleStyle: { fontWeight: '600', fontSize: FONTS.lg },
    })}
  >
    <TeacherTab.Screen
      name="Dashboard"
      component={TeacherDashboard}
      options={{ headerTitle: 'Teacher Dashboard' }}
    />
    <TeacherTab.Screen
      name="Attendance"
      component={TeacherAttendanceScreen}
      options={{ headerTitle: 'Mark Attendance' }}
    />
    <TeacherTab.Screen
      name="Results"
      component={TeacherResultsScreen}
      options={{ headerTitle: 'Upload Results' }}
    />
    <TeacherTab.Screen
      name="Leave"
      component={TeacherLeaveScreen}
      options={{ headerTitle: 'Leave Management' }}
    />
  </TeacherTab.Navigator>
);

// Student Tab Navigator
const StudentTabNavigator: React.FC = () => (
  <StudentTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      tabBarActiveTintColor: COLORS.accent,
      tabBarInactiveTintColor: COLORS.text.muted,
      tabBarLabelStyle: { fontSize: FONTS.xs, fontWeight: '500' },
      tabBarStyle: {
        backgroundColor: COLORS.white,
        borderTopColor: COLORS.border,
        height: 60,
        paddingBottom: 6,
        paddingTop: 6,
      },
      headerStyle: { backgroundColor: COLORS.accent },
      headerTintColor: COLORS.white,
      headerTitleStyle: { fontWeight: '600', fontSize: FONTS.lg },
    })}
  >
    <StudentTab.Screen
      name="Dashboard"
      component={StudentDashboard}
      options={{ headerTitle: 'Student Dashboard' }}
    />
    <StudentTab.Screen
      name="Attendance"
      component={StudentAttendanceScreen}
      options={{ headerTitle: 'My Attendance' }}
    />
    <StudentTab.Screen
      name="Fees"
      component={StudentFeesScreen}
      options={{ headerTitle: 'Fee Status' }}
    />
    <StudentTab.Screen
      name="Results"
      component={StudentResultsScreen}
      options={{ headerTitle: 'My Results' }}
    />
    <StudentTab.Screen
      name="Notices"
      component={StudentNoticesScreen}
      options={{ headerTitle: 'Notices' }}
    />
  </StudentTab.Navigator>
);

// Main App Navigator
const AppNavigator: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>🎓</Text>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : user?.role === 'principal' ? (
        <Stack.Screen name="PrincipalTabs" component={PrincipalTabNavigator} />
      ) : user?.role === 'teacher' ? (
        <Stack.Screen name="TeacherTabs" component={TeacherTabNavigator} />
      ) : (
        <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: FONTS.lg,
    color: COLORS.text.secondary,
  },
});

export default AppNavigator;
