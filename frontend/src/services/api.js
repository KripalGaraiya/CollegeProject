import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) => api.post('/api/auth/login', { email, password });
export const register = (data) => api.post('/api/auth/register', data);
export const getMe = () => api.get('/api/auth/me');

// Departments
export const getDepartments = () => api.get('/api/departments');
export const createDepartment = (data) => api.post('/api/departments', data);
export const updateDepartment = (id, data) => api.put(`/api/departments/${id}`, data);
export const deleteDepartment = (id) => api.delete(`/api/departments/${id}`);

// Classes
export const getClasses = (params) => api.get('/api/classes', { params });
export const createClass = (data) => api.post('/api/classes', data);
export const deleteClass = (id) => api.delete(`/api/classes/${id}`);

// Students
export const getStudents = (params) => api.get('/api/students', { params });
export const getStudent = (id) => api.get(`/api/students/${id}`);
export const getStudentByUser = (userId) => api.get(`/api/students/by-user/${userId}`);
export const createStudent = (data) => api.post('/api/students', data);
export const updateStudent = (id, data) => api.put(`/api/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/api/students/${id}`);

// Teachers
export const getTeachers = (params) => api.get('/api/teachers', { params });
export const getTeacher = (id) => api.get(`/api/teachers/${id}`);
export const getTeacherByUser = (userId) => api.get(`/api/teachers/by-user/${userId}`);
export const createTeacher = (data) => api.post('/api/teachers', data);
export const updateTeacher = (id, data) => api.put(`/api/teachers/${id}`, data);
export const deleteTeacher = (id) => api.delete(`/api/teachers/${id}`);
export const getTeacherAvailability = () => api.get('/api/teachers/availability/status');

// Attendance
export const getAttendance = (params) => api.get('/api/attendance', { params });
export const markAttendance = (data) => api.post('/api/attendance', data);
export const markBulkAttendance = (data) => api.post('/api/attendance/bulk', data);
export const getAttendanceStats = (studentId) => api.get(`/api/attendance/stats/${studentId}`);

// Results
export const getResults = (params) => api.get('/api/results', { params });
export const addResult = (data) => api.post('/api/results', data);
export const getStudentResultSummary = (studentId) => api.get(`/api/results/student/${studentId}/summary`);

// Fees
export const getFees = (params) => api.get('/api/fees', { params });
export const createFee = (data) => api.post('/api/fees', data);
export const recordPayment = (data) => api.post('/api/fees/payment', data);
export const getStudentFeeSummary = (studentId) => api.get(`/api/fees/student/${studentId}/summary`);

// Notices
export const getNotices = (params) => api.get('/api/notices', { params });
export const createNotice = (data) => api.post('/api/notices', data);
export const getNotice = (id) => api.get(`/api/notices/${id}`);
export const deleteNotice = (id) => api.delete(`/api/notices/${id}`);

// Leaves
export const getLeaves = (params) => api.get('/api/leaves', { params });
export const applyLeave = (data) => api.post('/api/leaves', data);
export const approveLeave = (id) => api.put(`/api/leaves/${id}/approve`);
export const rejectLeave = (id) => api.put(`/api/leaves/${id}/reject`);

// Dashboard
export const getPrincipalDashboard = () => api.get('/api/dashboard/principal');
export const getTeacherDashboard = () => api.get('/api/dashboard/teacher');
export const getStudentDashboard = () => api.get('/api/dashboard/student');

// Reports
export const getAttendanceReport = (params) => api.get('/api/reports/attendance', { params });
export const getFeesReport = (params) => api.get('/api/reports/fees', { params });

// Seed data
export const seedData = () => api.post('/api/seed');

export default api;
