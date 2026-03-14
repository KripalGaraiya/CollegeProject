# College Management Mobile App

## React Native CLI Project Structure

This is the mobile application for Shri B. G. Garaiya Homoeopathic Medical College Management System.

## Tech Stack
- React Native CLI
- TypeScript
- React Navigation (Native Stack + Bottom Tabs)
- Redux Toolkit (State Management)
- React Query (Server State)
- Firebase Cloud Messaging (Push Notifications)
- Axios (API calls)

## Prerequisites
- Node.js 18+
- JDK 17 (for Android)
- Xcode 15+ (for iOS)
- Android Studio with SDK 34

## Setup Instructions

### 1. Install dependencies
```bash
cd mobile
npm install
```

### 2. iOS Setup
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

### 3. Android Setup
```bash
npx react-native run-android
```

### 4. Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Download `google-services.json` for Android → place in `android/app/`
3. Download `GoogleService-Info.plist` for iOS → add to Xcode project
4. Enable Cloud Messaging in Firebase Console

## Project Structure
```
mobile/
├── src/
│   ├── screens/
│   │   ├── auth/           # Login, Role Selection
│   │   ├── principal/      # Principal Dashboard & Features
│   │   ├── teacher/        # Teacher Dashboard & Features
│   │   └── student/        # Student Dashboard & Features
│   ├── components/         # Reusable UI Components
│   ├── navigation/         # React Navigation Setup
│   ├── services/           # API Services
│   ├── contexts/           # React Contexts
│   ├── hooks/              # Custom Hooks
│   └── types/              # TypeScript Types
├── android/                # Android native code
├── ios/                    # iOS native code
└── package.json
```

## API Configuration
Update the API base URL in `src/services/api.ts`:
```typescript
const API_BASE_URL = 'https://your-backend-url.com';
```

## Demo Credentials
- Principal: principal@bggaraiya.edu / principal123
- Teacher: teacher@bggaraiya.edu / teacher123
- Student: student@bggaraiya.edu / student123

## Features
- Role-based Authentication (JWT)
- Principal Dashboard (Manage Students, Teachers, Departments)
- Teacher Dashboard (Attendance, Results, Leave)
- Student Dashboard (View Attendance, Fees, Results, Notices)
- Push Notifications (FCM)
- Offline Support (MMKV Storage)
