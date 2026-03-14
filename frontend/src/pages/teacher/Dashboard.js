import React, { useState, useEffect } from 'react';
import { ClipboardCheck, FileText, Calendar, Bell, Users } from 'lucide-react';
import { toast } from 'sonner';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import { getTeacherDashboard } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getTeacherDashboard();
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <TeacherLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout title="Dashboard">
      <div className="space-y-8" data-testid="teacher-dashboard">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-secondary to-secondary/80 rounded-2xl p-6 lg:p-8 text-white">
          <h2 className="text-2xl lg:text-3xl font-heading font-bold mb-2">
            Welcome, {user?.name || 'Teacher'}
          </h2>
          <p className="text-white/80">{data?.teacher?.designation} - {data?.teacher?.department_id}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Users size={20} className="text-blue-600" />
            </div>
            <p className="text-2xl font-heading font-bold">{data?.assigned_classes?.length || 0}</p>
            <p className="text-sm text-gray-500">Assigned Classes</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <ClipboardCheck size={20} className="text-green-600" />
            </div>
            <p className="text-2xl font-heading font-bold">-</p>
            <p className="text-sm text-gray-500">Attendance Marked</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <FileText size={20} className="text-purple-600" />
            </div>
            <p className="text-2xl font-heading font-bold">-</p>
            <p className="text-sm text-gray-500">Results Uploaded</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
              <Calendar size={20} className="text-amber-600" />
            </div>
            <p className="text-2xl font-heading font-bold">{data?.pending_leaves?.length || 0}</p>
            <p className="text-sm text-gray-500">Pending Leaves</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Classes */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-heading font-semibold mb-4">Your Classes</h3>
            <div className="space-y-3">
              {data?.assigned_classes?.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{cls.name}</p>
                    <p className="text-sm text-gray-500">Year {cls.year} - Section {cls.section}</p>
                  </div>
                  <span className="badge badge-info">Active</span>
                </div>
              ))}
              {(!data?.assigned_classes || data.assigned_classes.length === 0) && (
                <p className="text-center text-gray-500 py-4">No classes assigned</p>
              )}
            </div>
          </div>

          {/* Recent Notices */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-heading font-semibold mb-4">Recent Notices</h3>
            <div className="space-y-3">
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
    </TeacherLayout>
  );
};

export default Dashboard;
