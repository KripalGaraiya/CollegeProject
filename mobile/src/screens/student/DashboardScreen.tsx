import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { dashboardAPI, teacherAPI } from '../../services/api';
import { StudentDashboard as StudentDashboardType, Teacher } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState<StudentDashboardType | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [dashRes, teachersRes] = await Promise.all([
        dashboardAPI.getStudent(),
        teacherAPI.getAvailability(),
      ]);
      setData(dashRes);
      setTeachers(teachersRes);
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
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileIcon}>
          <Icon name="user" size={40} color="#fff" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{data?.student?.name || user?.name}</Text>
          <Text style={styles.profileRoll}>Roll No: {data?.student?.roll_number}</Text>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Year {data?.student?.year}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        {/* Attendance */}
        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: '#D1FAE5' }]}>
            <Icon name="clipboard" size={20} color="#059669" />
          </View>
          <Text style={styles.statValue}>{data?.attendance?.percentage || 0}%</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>

        {/* Fees */}
        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: '#DBEAFE' }]}>
            <Icon name="credit-card" size={20} color="#2563EB" />
          </View>
          <Text style={[styles.statValue, data?.fees?.pending && data.fees.pending > 0 ? { color: '#DC2626' } : {}]}>
            {data?.fees?.pending && data.fees.pending > 0 ? 'Pending' : 'Paid'}
          </Text>
          <Text style={styles.statLabel}>Fee Status</Text>
        </View>

        {/* Results */}
        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: '#EDE9FE' }]}>
            <Icon name="file-text" size={20} color="#7C3AED" />
          </View>
          <Text style={styles.statValue}>{data?.recent_results?.length || 0}</Text>
          <Text style={styles.statLabel}>Results</Text>
        </View>
      </View>

      {/* Teacher Availability */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teacher Availability</Text>
        {teachers.slice(0, 4).map((teacher) => (
          <View key={teacher.id} style={styles.teacherItem}>
            <View style={styles.teacherInfo}>
              <View style={[styles.dot, { backgroundColor: teacher.is_on_leave ? '#EF4444' : '#10B981' }]} />
              <View>
                <Text style={styles.teacherName}>{teacher.name}</Text>
                <Text style={styles.teacherRole}>{teacher.designation}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: teacher.is_on_leave ? '#FEE2E2' : '#D1FAE5' }]}>
              <Text style={[styles.statusText, { color: teacher.is_on_leave ? '#DC2626' : '#059669' }]}>
                {teacher.is_on_leave ? 'On Leave' : 'Available'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Recent Notices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Notices</Text>
        {data?.recent_notices && data.recent_notices.length > 0 ? (
          data.recent_notices.slice(0, 3).map((notice) => (
            <View key={notice.id} style={styles.noticeItem}>
              <Icon name="bell" size={16} color="#F59E0B" />
              <View style={styles.noticeContent}>
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Text style={styles.noticeDesc} numberOfLines={2}>{notice.description}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recent notices</Text>
          </View>
        )}
      </View>

      {/* Logout */}
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
  profileHeader: {
    backgroundColor: '#D97706',
    padding: 20,
    margin: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileRoll: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  teacherItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  teacherName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  teacherRole: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  noticeItem: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  noticeDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
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
