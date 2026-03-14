import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';
import {
  LoginResponse,
  User,
  Student,
  Teacher,
  Department,
  Class,
  Attendance,
  AttendanceStats,
  Result,
  Fee,
  Notice,
  Leave,
  PrincipalDashboard,
  TeacherDashboard,
  StudentDashboard,
} from '../types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ============ AUTH API ============
export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  register: async (data: Partial<User> & { password: string }): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// ============ DEPARTMENT API ============
export const departmentAPI = {
  getAll: async (): Promise<Department[]> => {
    const response = await api.get('/api/departments');
    return response.data;
  },

  getById: async (id: string): Promise<Department> => {
    const response = await api.get(`/api/departments/${id}`);
    return response.data;
  },

  create: async (data: Partial<Department>): Promise<Department> => {
    const response = await api.post('/api/departments', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Department>): Promise<void> => {
    await api.put(`/api/departments/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/departments/${id}`);
  },
};

// ============ CLASS API ============
export const classAPI = {
  getAll: async (params?: { department_id?: string; year?: number }): Promise<Class[]> => {
    const response = await api.get('/api/classes', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Class> => {
    const response = await api.get(`/api/classes/${id}`);
    return response.data;
  },

  create: async (data: Partial<Class>): Promise<Class> => {
    const response = await api.post('/api/classes', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/classes/${id}`);
  },
};

// ============ STUDENT API ============
export const studentAPI = {
  getAll: async (params?: {
    department_id?: string;
    class_id?: string;
    year?: number;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ students: Student[]; total: number; page: number; pages: number }> => {
    const response = await api.get('/api/students', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Student> => {
    const response = await api.get(`/api/students/${id}`);
    return response.data;
  },

  getByUserId: async (userId: string): Promise<Student> => {
    const response = await api.get(`/api/students/by-user/${userId}`);
    return response.data;
  },

  create: async (data: Partial<Student>): Promise<Student> => {
    const response = await api.post('/api/students', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Student>): Promise<void> => {
    await api.put(`/api/students/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/students/${id}`);
  },
};

// ============ TEACHER API ============
export const teacherAPI = {
  getAll: async (params?: { department_id?: string }): Promise<Teacher[]> => {
    const response = await api.get('/api/teachers', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Teacher> => {
    const response = await api.get(`/api/teachers/${id}`);
    return response.data;
  },

  getByUserId: async (userId: string): Promise<Teacher> => {
    const response = await api.get(`/api/teachers/by-user/${userId}`);
    return response.data;
  },

  getAvailability: async (): Promise<Teacher[]> => {
    const response = await api.get('/api/teachers/availability/status');
    return response.data;
  },

  create: async (data: Partial<Teacher>): Promise<Teacher> => {
    const response = await api.post('/api/teachers', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Teacher>): Promise<void> => {
    await api.put(`/api/teachers/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/teachers/${id}`);
  },
};

// ============ ATTENDANCE API ============
export const attendanceAPI = {
  getAll: async (params?: {
    class_id?: string;
    student_id?: string;
    date?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Attendance[]> => {
    const response = await api.get('/api/attendance', { params });
    return response.data;
  },

  mark: async (data: Partial<Attendance>): Promise<Attendance> => {
    const response = await api.post('/api/attendance', data);
    return response.data;
  },

  markBulk: async (data: {
    class_id: string;
    date: string;
    attendance_records: { student_id: string; status: string }[];
  }): Promise<{ message: string; records: number }> => {
    const response = await api.post('/api/attendance/bulk', data);
    return response.data;
  },

  getStats: async (studentId: string): Promise<AttendanceStats> => {
    const response = await api.get(`/api/attendance/stats/${studentId}`);
    return response.data;
  },
};

// ============ RESULT API ============
export const resultAPI = {
  getAll: async (params?: {
    student_id?: string;
    class_id?: string;
    exam_type?: string;
  }): Promise<Result[]> => {
    const response = await api.get('/api/results', { params });
    return response.data;
  },

  add: async (data: Partial<Result>): Promise<Result> => {
    const response = await api.post('/api/results', data);
    return response.data;
  },

  getStudentSummary: async (
    studentId: string
  ): Promise<{
    results: Result[];
    total_obtained: number;
    total_marks: number;
    overall_percentage: number;
  }> => {
    const response = await api.get(`/api/results/student/${studentId}/summary`);
    return response.data;
  },
};

// ============ FEE API ============
export const feeAPI = {
  getAll: async (params?: { student_id?: string; status?: string }): Promise<Fee[]> => {
    const response = await api.get('/api/fees', { params });
    return response.data;
  },

  create: async (data: Partial<Fee>): Promise<Fee> => {
    const response = await api.post('/api/fees', data);
    return response.data;
  },

  recordPayment: async (data: {
    fee_id: string;
    amount_paid: number;
    payment_date: string;
    payment_method: string;
  }): Promise<{ message: string; new_status: string }> => {
    const response = await api.post('/api/fees/payment', data);
    return response.data;
  },

  getStudentSummary: async (
    studentId: string
  ): Promise<{
    fees: Fee[];
    total_fees: number;
    total_paid: number;
    pending: number;
  }> => {
    const response = await api.get(`/api/fees/student/${studentId}/summary`);
    return response.data;
  },
};

// ============ NOTICE API ============
export const noticeAPI = {
  getAll: async (params?: { department_id?: string; class_id?: string }): Promise<Notice[]> => {
    const response = await api.get('/api/notices', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Notice> => {
    const response = await api.get(`/api/notices/${id}`);
    return response.data;
  },

  create: async (data: Partial<Notice>): Promise<Notice> => {
    const response = await api.post('/api/notices', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/notices/${id}`);
  },
};

// ============ LEAVE API ============
export const leaveAPI = {
  getAll: async (params?: { user_id?: string; status?: string }): Promise<Leave[]> => {
    const response = await api.get('/api/leaves', { params });
    return response.data;
  },

  apply: async (data: Partial<Leave>): Promise<Leave> => {
    const response = await api.post('/api/leaves', data);
    return response.data;
  },

  approve: async (id: string): Promise<void> => {
    await api.put(`/api/leaves/${id}/approve`);
  },

  reject: async (id: string): Promise<void> => {
    await api.put(`/api/leaves/${id}/reject`);
  },
};

// ============ DASHBOARD API ============
export const dashboardAPI = {
  getPrincipal: async (): Promise<PrincipalDashboard> => {
    const response = await api.get('/api/dashboard/principal');
    return response.data;
  },

  getTeacher: async (): Promise<TeacherDashboard> => {
    const response = await api.get('/api/dashboard/teacher');
    return response.data;
  },

  getStudent: async (): Promise<StudentDashboard> => {
    const response = await api.get('/api/dashboard/student');
    return response.data;
  },
};

// ============ SEED API ============
export const seedData = async (): Promise<{ message: string }> => {
  const response = await api.post('/api/seed');
  return response.data;
};

export default api;
