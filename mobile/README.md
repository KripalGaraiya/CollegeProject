# College Management System - React Native CLI App

**Shri B. G. Garaiya Homoeopathic Medical College & Hospital, Rajkot**

A complete mobile application built with React Native CLI for managing students, teachers, attendance, results, fees, notices, and leaves.

## Prerequisites

- Node.js >= 18
- React Native CLI (`npm install -g react-native`)
- For Android: Android Studio with SDK 33+, JDK 17
- For iOS: Xcode 15+, CocoaPods

## Setup

```bash
# 1. Navigate to project
cd mobile

# 2. Install dependencies
yarn install

# 3. For iOS only - install pods
cd ios && pod install && cd ..

# 4. Update API URL (if needed)
# Edit src/constants/index.ts and set API_BASE_URL to your backend URL

# 5. Run the app
yarn android   # For Android
yarn ios       # For iOS
```

## Backend API

The app connects to a FastAPI backend. Make sure the backend is running before using the app.

**Default API URL**: `https://student-portal-app-10.preview.emergentagent.com`

To change the API URL, edit `src/constants/index.ts`:
```typescript
export const API_BASE_URL = 'YOUR_BACKEND_URL';
```

## Demo Credentials

| Role      | Email                       | Password     |
|-----------|-----------------------------|--------------|
| Principal | principal@bggaraiya.edu     | principal123 |
| Teacher   | teacher@bggaraiya.edu       | teacher123   |
| Student   | student@bggaraiya.edu       | student123   |

**First Login**: Tap "Initialize Demo Data" on the login screen to seed the database.

## App Structure

```
src/
├── App.tsx                    # App entry point
├── components/index.tsx       # Reusable UI components
├── constants/index.ts         # Colors, fonts, spacing, API URL
├── contexts/AuthContext.tsx    # JWT authentication context
├── navigation/
│   └── AppNavigator.tsx       # Role-based navigation
├── screens/
│   ├── auth/LoginScreen.tsx
│   ├── principal/             # Principal screens (6 tabs)
│   │   ├── DashboardScreen.tsx
│   │   ├── StudentsScreen.tsx
│   │   ├── TeachersScreen.tsx
│   │   ├── DepartmentsScreen.tsx
│   │   ├── NoticesScreen.tsx
│   │   └── LeavesScreen.tsx
│   ├── teacher/               # Teacher screens (4 tabs)
│   │   ├── DashboardScreen.tsx
│   │   ├── AttendanceScreen.tsx
│   │   ├── ResultsScreen.tsx
│   │   └── LeaveScreen.tsx
│   └── student/               # Student screens (5 tabs)
│       ├── DashboardScreen.tsx
│       ├── AttendanceScreen.tsx
│       ├── FeesScreen.tsx
│       ├── ResultsScreen.tsx
│       └── NoticesScreen.tsx
├── services/api.ts            # Axios API client
└── types/index.ts             # TypeScript interfaces
```

## Features by Role

### Principal
- Dashboard with statistics (students, teachers, fees, leaves)
- Student management (add, view, search, delete, pagination)
- Teacher management with availability tracking
- Department management (grid view)
- Notice board (create, delete, target audience)
- Leave request approval/rejection with filters

### Teacher
- Dashboard with assigned classes and recent notices
- Mark attendance (individual/bulk, per class)
- Upload student results (auto-grading)
- Apply for leave (sick, casual, emergency)

### Student
- Profile dashboard with attendance %, fee status
- Attendance history with progress visualization
- Fee breakdown with payment progress
- Results with subject-wise grades and overall performance
- Notice board

## Tech Stack

- React Native 0.73.2 (CLI)
- TypeScript
- React Navigation 6 (Native Stack + Bottom Tabs)
- Axios (HTTP client)
- AsyncStorage (Token persistence)
- react-native-gesture-handler
- react-native-screens
- react-native-safe-area-context
- react-native-vector-icons
