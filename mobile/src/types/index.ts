// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'principal' | 'teacher' | 'student';
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Student Types
export interface Student {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  roll_number: string;
  department_id: string;
  class_id: string;
  year: number;
  admission_date?: string;
  date_of_birth?: string;
  address?: string;
  guardian_name?: string;
  guardian_phone?: string;
  photo_url?: string;
}

// Teacher Types
export interface Teacher {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  employee_id: string;
  department_id: string;
  designation: string;
  qualification?: string;
  specialization?: string;
  joining_date?: string;
  photo_url?: string;
  is_available: boolean;
  is_on_leave?: boolean;
  leave_reason?: string;
}

// Department Types
export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  head_teacher_id?: string;
}

// Class Types
export interface Class {
  id: string;
  name: string;
  year: number;
  department_id: string;
  section: string;
}

// Attendance Types
export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'leave';
  marked_by: string;
}

export interface AttendanceStats {
  total_days: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number;
}

// Result Types
export interface Result {
  id: string;
  student_id: string;
  class_id: string;
  subject: string;
  exam_type: 'midterm' | 'final' | 'internal';
  marks_obtained: number;
  total_marks: number;
  grade: string;
  percentage: number;
}

// Fee Types
export interface Fee {
  id: string;
  student_id: string;
  fee_type: string;
  amount: number;
  amount_paid: number;
  due_date: string;
  academic_year: string;
  status: 'pending' | 'partial' | 'paid';
}

// Notice Types
export interface Notice {
  id: string;
  title: string;
  description: string;
  department_id?: string;
  class_id?: string;
  target_roles: string[];
  attachment_url?: string;
  created_by: string;
  created_at: string;
}

// Leave Types
export interface Leave {
  id: string;
  user_id: string;
  user_name: string;
  reason: string;
  start_date: string;
  end_date: string;
  leave_type: 'sick' | 'casual' | 'emergency';
  status: 'pending' | 'approved' | 'rejected';
}

// Dashboard Types
export interface PrincipalDashboard {
  total_students: number;
  total_teachers: number;
  total_departments: number;
  teachers_present: number;
  teachers_on_leave: number;
  students_present_today: number;
  pending_fees_amount: number;
  pending_leave_requests: number;
}

export interface TeacherDashboard {
  teacher: Teacher;
  assigned_classes: Class[];
  pending_leaves: Leave[];
  recent_notices: Notice[];
}

export interface StudentDashboard {
  student: Student;
  attendance: {
    total_days: number;
    present_days: number;
    percentage: number;
  };
  fees: {
    total: number;
    paid: number;
    pending: number;
  };
  recent_results: Result[];
  recent_notices: Notice[];
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  PrincipalTabs: undefined;
  TeacherTabs: undefined;
  StudentTabs: undefined;
  StudentProfile: { studentId: string };
};

export type PrincipalTabParamList = {
  Dashboard: undefined;
  Students: undefined;
  Teachers: undefined;
  Departments: undefined;
  Notices: undefined;
  Leaves: undefined;
};

export type TeacherTabParamList = {
  Dashboard: undefined;
  Attendance: undefined;
  Results: undefined;
  Leave: undefined;
};

export type StudentTabParamList = {
  Dashboard: undefined;
  Attendance: undefined;
  Fees: undefined;
  Results: undefined;
  Notices: undefined;
};
