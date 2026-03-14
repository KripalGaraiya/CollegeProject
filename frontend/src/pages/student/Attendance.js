import React, { useState, useEffect } from 'react';
import { Calendar, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import StudentLayout from '../../components/layouts/StudentLayout';
import { getStudentByUser, getAttendance, getAttendanceStats } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const studentRes = await getStudentByUser(user.id);
      setStudent(studentRes.data);

      const [attRes, statsRes] = await Promise.all([
        getAttendance({ student_id: studentRes.data.id }),
        getAttendanceStats(studentRes.data.id)
      ]);
      
      setAttendance(attRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout title="Attendance">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="My Attendance">
      <div className="space-y-6" data-testid="student-attendance-page">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-heading font-bold text-primary">{stats?.percentage || 0}%</p>
            <p className="text-sm text-gray-500">Overall</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-heading font-bold text-green-500">{stats?.present || 0}</p>
            <p className="text-sm text-gray-500">Present</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-heading font-bold text-red-500">{stats?.absent || 0}</p>
            <p className="text-sm text-gray-500">Absent</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-heading font-bold text-amber-500">{stats?.leave || 0}</p>
            <p className="text-sm text-gray-500">Leave</p>
          </div>
        </div>

        {/* Attendance Progress */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-heading font-semibold mb-4">Attendance Progress</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
              <div className="h-full flex">
                <div className="bg-green-500 transition-all" style={{ width: `${(stats?.present / stats?.total_days * 100) || 0}%` }}></div>
                <div className="bg-red-500 transition-all" style={{ width: `${(stats?.absent / stats?.total_days * 100) || 0}%` }}></div>
                <div className="bg-amber-500 transition-all" style={{ width: `${(stats?.leave / stats?.total_days * 100) || 0}%` }}></div>
              </div>
            </div>
            <span className="font-semibold">{stats?.percentage || 0}%</span>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div> Present
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div> Absent
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded"></div> Leave
            </span>
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-heading font-semibold mb-4">Attendance History</h3>
          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No attendance records found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {attendance.slice().reverse().map((record, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      record.status === 'present' ? 'bg-green-100' :
                      record.status === 'absent' ? 'bg-red-100' : 'bg-amber-100'
                    }`}>
                      {record.status === 'present' ? (
                        <Check size={20} className="text-green-600" />
                      ) : record.status === 'absent' ? (
                        <X size={20} className="text-red-600" />
                      ) : (
                        <Clock size={20} className="text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{record.date}</p>
                    </div>
                  </div>
                  <span className={`badge ${
                    record.status === 'present' ? 'badge-success' :
                    record.status === 'absent' ? 'badge-error' : 'badge-warning'
                  } capitalize`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default Attendance;
