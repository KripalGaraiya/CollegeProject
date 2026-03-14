import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { dashboardAPI, teacherAPI, leaveAPI } from '../../services/api';
import { PrincipalDashboard, Teacher, Leave } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48 - 16) / 2;

const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<PrincipalDashboard | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, teachersRes, leavesRes] = await Promise.all([
        dashboardAPI.getPrincipal(),
        teacherAPI.getAvailability(),
        leaveAPI.getAll({ status: 'pending' }),
      ]);
      setStats(statsRes);
      setTeachers(teachersRes);
      setPendingLeaves(leavesRes);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const StatCard = ({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) => (
    <View style={[styles.statCard, { width: cardWidth }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <Text style={styles.welcomeText}>Welcome to College Management</Text>
        <Text style={styles.collegeText}>Shri B. G. Garaiya Homoeopathic Medical College</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard icon="users" value={stats?.total_students || 0} label="Total Students" color="#3B82F6" />
        <StatCard icon="user-check" value={stats?.total_teachers || 0} label="Total Teachers" color="#10B981" />
        <StatCard icon="briefcase" value={stats?.total_departments || 0} label="Departments" color="#8B5CF6" />
        <StatCard icon="credit-card" value={`₹${stats?.pending_fees_amount || 0}`} label="Pending Fees" color="#F59E0B" />
      </View>

      {/* Teacher Availability */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Teacher Availability</Text>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>{stats?.teachers_present || 0} Present</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>{stats?.teachers_on_leave || 0} On Leave</Text>
            </View>
          </View>
        </View>
        {teachers.slice(0, 4).map((teacher) => (
          <View key={teacher.id} style={styles.teacherItem}>
            <View style={styles.teacherInfo}>
              <View style={[styles.statusDot, { backgroundColor: teacher.is_on_leave ? '#EF4444' : '#10B981' }]} />
              <View>
                <Text style={styles.teacherName}>{teacher.name}</Text>
                <Text style={styles.teacherDesignation}>{teacher.designation}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: teacher.is_on_leave ? '#FEE2E2' : '#D1FAE5' }]}>
              <Text style={[styles.statusText, { color: teacher.is_on_leave ? '#DC2626' : '#059669' }]}>
                {teacher.is_on_leave ? 'On Leave' : 'Present'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Pending Leave Requests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Leave Requests</Text>
        {pendingLeaves.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="clock" size={40} color="#D1D5DB" />
            <Text style={styles.emptyText}>No pending leave requests</Text>
          </View>
        ) : (
          pendingLeaves.slice(0, 3).map((leave) => (
            <View key={leave.id} style={styles.leaveItem}>
              <Text style={styles.leaveName}>{leave.user_name}</Text>
              <Text style={styles.leaveReason}>{leave.reason}</Text>
              <Text style={styles.leaveDate}>{leave.start_date} - {leave.end_date}</Text>
            </View>
          ))
        )}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Icon name="log-out" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeBanner: {
    backgroundColor: '#4A6C58',
    padding: 20,
    margin: 16,
    borderRadius: 16,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  collegeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  teacherItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  teacherName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  teacherDesignation: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  leaveItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  leaveName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  leaveReason: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  leaveDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
});

export default DashboardScreen;
