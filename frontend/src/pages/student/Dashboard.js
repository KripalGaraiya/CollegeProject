import React, { useState, useEffect } from 'react';
import { 
  User, 
  ClipboardCheck, 
  CreditCard, 
  FileText, 
  Bell,
  TrendingUp,
  Building2,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import StudentLayout from '../../components/layouts/StudentLayout';
import { getStudentDashboard, getDepartments, getTeacherAvailability } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashRes, deptsRes, teachersRes] = await Promise.all([
        getStudentDashboard(),
        getDepartments(),
        getTeacherAvailability()
      ]);
      setData(dashRes.data);
      setDepartments(deptsRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getDeptName = (id) => departments.find(d => d.id === id)?.name || '-';

  if (loading) {
    return (
      <StudentLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Dashboard">
      <div className="space-y-8" data-testid="student-dashboard">
        {/* Welcome + Profile Card */}
        <div className="bg-gradient-to-r from-accent to-accent/80 rounded-2xl p-6 lg:p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <User size={40} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-heading font-bold mb-1">
                Welcome, {data?.student?.name || user?.name}
              </h2>
              <p className="text-white/80">Roll No: {data?.student?.roll_number}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  Year {data?.student?.year}
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {getDeptName(data?.student?.department_id)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {/* Attendance */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ClipboardCheck size={24} className="text-green-600" />
              </div>
              <span className="text-2xl font-heading font-bold text-green-600">
                {data?.attendance?.percentage || 0}%
              </span>
            </div>
            <h3 className="font-medium text-gray-900">Attendance</h3>
            <p className="text-sm text-gray-500 mt-1">
              {data?.attendance?.present_days || 0} / {data?.attendance?.total_days || 0} days
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${data?.attendance?.percentage || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Fees */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CreditCard size={24} className="text-blue-600" />
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded ${
                data?.fees?.pending > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
              }`}>
                {data?.fees?.pending > 0 ? 'Pending' : 'Paid'}
              </span>
            </div>
            <h3 className="font-medium text-gray-900">Fee Status</h3>
            <p className="text-sm text-gray-500 mt-1">
              Paid: ₹{(data?.fees?.paid || 0).toLocaleString()}
            </p>
            {data?.fees?.pending > 0 && (
              <p className="text-sm text-red-500 font-medium mt-1">
                Pending: ₹{data.fees.pending.toLocaleString()}
              </p>
            )}
          </div>

          {/* Results */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText size={24} className="text-purple-600" />
              </div>
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <h3 className="font-medium text-gray-900">Recent Results</h3>
            <p className="text-sm text-gray-500 mt-1">
              {data?.recent_results?.length || 0} results available
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teacher Availability */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-heading font-semibold mb-4">Teacher Availability</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {teachers.slice(0, 5).map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${teacher.is_on_leave ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <div>
                      <p className="font-medium text-sm">{teacher.name}</p>
                      <p className="text-xs text-gray-500">{teacher.designation}</p>
                    </div>
                  </div>
                  <span className={`badge ${teacher.is_on_leave ? 'badge-error' : 'badge-success'}`}>
                    {teacher.is_on_leave ? 'On Leave' : 'Available'}
                  </span>
                </div>
              ))}
              {teachers.length === 0 && (
                <p className="text-center text-gray-500 py-4">No teachers found</p>
              )}
            </div>
          </div>

          {/* Recent Notices */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-heading font-semibold mb-4">Recent Notices</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {data?.recent_notices?.map((notice) => (
                <div key={notice.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Bell size={16} className="text-amber-500 mt-1" />
                    <div>
                      <p className="font-medium text-sm">{notice.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notice.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              {(!data?.recent_notices || data.recent_notices.length === 0) && (
                <p className="text-center text-gray-500 py-4">No recent notices</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Dashboard;
