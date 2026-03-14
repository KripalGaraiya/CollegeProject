import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../contexts/AuthContext';

// Import Screens
import LoginScreen from '../screens/auth/LoginScreen';
// Principal Screens
import PrincipalDashboard from '../screens/principal/DashboardScreen';
import StudentsScreen from '../screens/principal/StudentsScreen';
import TeachersScreen from '../screens/principal/TeachersScreen';
import DepartmentsScreen from '../screens/principal/DepartmentsScreen';
import NoticesScreen from '../screens/principal/NoticesScreen';
// Teacher Screens
import TeacherDashboard from '../screens/teacher/DashboardScreen';
import AttendanceScreen from '../screens/teacher/AttendanceScreen';
import ResultsScreen from '../screens/teacher/ResultsScreen';
import LeaveScreen from '../screens/teacher/LeaveScreen';
// Student Screens
import StudentDashboard from '../screens/student/DashboardScreen';
import StudentAttendanceScreen from '../screens/student/AttendanceScreen';
import StudentFeesScreen from '../screens/student/FeesScreen';
import StudentResultsScreen from '../screens/student/ResultsScreen';
import StudentNoticesScreen from '../screens/student/NoticesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Colors
const COLORS = {
  primary: '#4A6C58',
  secondary: '#2C3E50',
  accent: '#D97706',
  inactive: '#9CA3AF',
};

// Principal Tab Navigator
const PrincipalTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName = 'home';
        if (route.name === 'Dashboard') iconName = 'grid';
        else if (route.name === 'Students') iconName = 'users';
        else if (route.name === 'Teachers') iconName = 'user-check';
        else if (route.name === 'Departments') iconName = 'briefcase';
        else if (route.name === 'Notices') iconName = 'bell';
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.inactive,
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: '#fff',
    })}
  >
    <Tab.Screen name="Dashboard" component={PrincipalDashboard} />
    <Tab.Screen name="Students" component={StudentsScreen} />
    <Tab.Screen name="Teachers" component={TeachersScreen} />
    <Tab.Screen name="Departments" component={DepartmentsScreen} />
    <Tab.Screen name="Notices" component={NoticesScreen} />
  </Tab.Navigator>
);

// Teacher Tab Navigator
const TeacherTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName = 'home';
        if (route.name === 'Dashboard') iconName = 'grid';
        else if (route.name === 'Attendance') iconName = 'clipboard';
        else if (route.name === 'Results') iconName = 'file-text';
        else if (route.name === 'Leave') iconName = 'calendar';
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.secondary,
      tabBarInactiveTintColor: COLORS.inactive,
      headerStyle: { backgroundColor: COLORS.secondary },
      headerTintColor: '#fff',
    })}
  >
    <Tab.Screen name="Dashboard" component={TeacherDashboard} />
    <Tab.Screen name="Attendance" component={AttendanceScreen} />
    <Tab.Screen name="Results" component={ResultsScreen} />
    <Tab.Screen name="Leave" component={LeaveScreen} />
  </Tab.Navigator>
);

// Student Tab Navigator
const StudentTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName = 'home';
        if (route.name === 'Dashboard') iconName = 'grid';
        else if (route.name === 'Attendance') iconName = 'clipboard';
        else if (route.name === 'Fees') iconName = 'credit-card';
        else if (route.name === 'Results') iconName = 'file-text';
        else if (route.name === 'Notices') iconName = 'bell';
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.accent,
      tabBarInactiveTintColor: COLORS.inactive,
      headerStyle: { backgroundColor: COLORS.accent },
      headerTintColor: '#fff',
    })}
  >
    <Tab.Screen name="Dashboard" component={StudentDashboard} />
    <Tab.Screen name="Attendance" component={StudentAttendanceScreen} />
    <Tab.Screen name="Fees" component={StudentFeesScreen} />
    <Tab.Screen name="Results" component={StudentResultsScreen} />
    <Tab.Screen name="Notices" component={StudentNoticesScreen} />
  </Tab.Navigator>
);

// Main App Navigator
const AppNavigator: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  const getMainScreen = () => {
    if (!isAuthenticated) return 'Login';
    switch (user?.role) {
      case 'principal':
        return 'PrincipalTabs';
      case 'teacher':
        return 'TeacherTabs';
      case 'student':
        return 'StudentTabs';
      default:
        return 'Login';
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getMainScreen()}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="PrincipalTabs" component={PrincipalTabs} />
        <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
        <Stack.Screen name="StudentTabs" component={StudentTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
