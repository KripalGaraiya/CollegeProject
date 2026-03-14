import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  Calendar,
  CreditCard,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import PrincipalLayout from '../../components/layouts/PrincipalLayout';
import { getPrincipalDashboard, getTeacherAvailability, getLeaves } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, teachersRes, leavesRes] = await Promise.all([
        getPrincipalDashboard(),
        getTeacherAvailability(),
        getLeaves({ status: 'pending' })
      ]);
      setStats(statsRes.data);
      setTeachers(teachersRes.data);
      setPendingLeaves(leavesRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PrincipalLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PrincipalLayout>
    );
  }

  const statCards = [
    { 
      label: 'Total Students', 
      value: stats?.total_students || 0, 
      icon: Users, 
      color: 'bg-blue-500',
      link: '/principal/students'
    },
    { 
      label: 'Total Teachers', 
      value: stats?.total_teachers || 0, 
      icon: GraduationCap, 
      color: 'bg-green-500',
      link: '/principal/teachers'
    },
    { 
      label: 'Departments', 
      value: stats?.total_departments || 0, 
      icon: Building2, 
      color: 'bg-purple-500',
      link: '/principal/departments'
    },
    { 
      label: 'Pending Fees', 
      value: `₹${(stats?.pending_fees_amount || 0).toLocaleString()}`, 
      icon: CreditCard, 
      color: 'bg-amber-500',
      link: '/principal/students'
    },
  ];

  return (
    <PrincipalLayout title="Dashboard">
      <div className="space-y-8" data-testid="principal-dashboard">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-6 lg:p-8 text-white">
          <h2 className="text-2xl lg:text-3xl font-heading font-bold mb-2">
            Welcome to College Management System
          </h2>
          <p className="text-white/80">
            Shri B. G. Garaiya Homoeopathic Medical College & Hospital, Rajkot
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {statCards.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="bg-white rounded-xl border border-gray-100 p-6 card-hover"
              data-testid={`stat-card-${stat.label.toLowerCase().replace(' ', '-')}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon size={24} className="text-white" />
                </div>
                <ArrowRight size={20} className="text-gray-400" />
              </div>
              <p className="text-2xl font-heading font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teacher Availability */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-heading font-semibold">Teacher Availability</h3>
              <Link to="/principal/teachers" className="text-primary text-sm hover:underline">
                View All
              </Link>
            </div>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Present: {stats?.teachers_present || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">On Leave: {stats?.teachers_on_leave || 0}</span>
              </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {teachers.slice(0, 5).map((teacher) => (
                <div 
                  key={teacher.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      teacher.is_on_leave ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {teacher.is_on_leave ? (
                        <UserX size={20} className="text-red-600" />
                      ) : (
                        <UserCheck size={20} className="text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{teacher.name}</p>
                      <p className="text-xs text-gray-500">{teacher.designation}</p>
                    </div>
                  </div>
                  <span className={`badge ${teacher.is_on_leave ? 'badge-error' : 'badge-success'}`}>
                    {teacher.is_on_leave ? 'On Leave' : 'Present'}
                  </span>
                </div>
              ))}
              {teachers.length === 0 && (
                <p className="text-center text-gray-500 py-4">No teachers found</p>
              )}
            </div>
          </div>

          {/* Pending Leave Requests */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-heading font-semibold">Pending Leave Requests</h3>
              <Link to="/principal/leaves" className="text-primary text-sm hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {pendingLeaves.slice(0, 5).map((leave) => (
                <div 
                  key={leave.id} 
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{leave.user_name}</p>
                    <span className="badge badge-warning">Pending</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{leave.reason}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={14} />
                    <span>{leave.start_date} to {leave.end_date}</span>
                  </div>
                </div>
              ))}
              {pendingLeaves.length === 0 && (
                <div className="text-center py-8">
                  <Clock size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No pending leave requests</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-3xl font-heading font-bold text-green-500">
              {stats?.students_present_today || 0}
            </p>
            <p className="text-sm text-gray-500">Students Present Today</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-3xl font-heading font-bold text-primary">
              {stats?.teachers_present || 0}
            </p>
            <p className="text-sm text-gray-500">Teachers Present</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-3xl font-heading font-bold text-amber-500">
              {stats?.pending_leave_requests || 0}
            </p>
            <p className="text-sm text-gray-500">Pending Leaves</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-3xl font-heading font-bold text-blue-500">
              {stats?.total_departments || 0}
            </p>
            <p className="text-sm text-gray-500">Active Departments</p>
          </div>
        </div>
      </div>
    </PrincipalLayout>
  );
};

export default Dashboard;
