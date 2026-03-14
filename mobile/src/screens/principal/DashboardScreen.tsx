import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI, teacherAPI, leaveAPI } from '../../services/api';
import { Card, Badge, Loading, SectionHeader, EmptyState } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { PrincipalDashboard, Teacher, Leave } from '../../types';

const { width } = Dimensions.get('window');
const cardWidth = (width - SPACING.xl * 2 - SPACING.md) / 2;

const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<PrincipalDashboard | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
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
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Welcome Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Welcome to College Management</Text>
        <Text style={styles.bannerSubtitle}>Shri B. G. Garaiya Homoeopathic Medical College & Hospital, Rajkot</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { width: cardWidth }]}>
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <Text style={styles.statEmoji}>👨‍🎓</Text>
          </View>
          <Text style={styles.statValue}>{stats?.total_students || 0}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>

        <View style={[styles.statCard, { width: cardWidth }]}>
          <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
            <Text style={styles.statEmoji}>👨‍🏫</Text>
          </View>
          <Text style={styles.statValue}>{stats?.total_teachers || 0}</Text>
          <Text style={styles.statLabel}>Total Teachers</Text>
        </View>

        <View style={[styles.statCard, { width: cardWidth }]}>
          <View style={[styles.statIcon, { backgroundColor: '#EDE9FE' }]}>
            <Text style={styles.statEmoji}>🏛️</Text>
          </View>
          <Text style={styles.statValue}>{stats?.total_departments || 0}</Text>
          <Text style={styles.statLabel}>Departments</Text>
        </View>

        <View style={[styles.statCard, { width: cardWidth }]}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.statEmoji}>💰</Text>
          </View>
          <Text style={styles.statValue}>₹{(stats?.pending_fees_amount || 0).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Pending Fees</Text>
        </View>
      </View>

      {/* Teacher Availability */}
      <Card style={styles.section}>
        <SectionHeader title="Teacher Availability" />
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.status.success }]} />
            <Text style={styles.legendText}>Present: {stats?.teachers_present || 0}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.status.error }]} />
            <Text style={styles.legendText}>On Leave: {stats?.teachers_on_leave || 0}</Text>
          </View>
        </View>

        {teachers.length === 0 ? (
          <EmptyState title="No teachers found" />
        ) : (
          teachers.slice(0, 5).map((teacher) => (
            <View key={teacher.id} style={styles.teacherItem}>
              <View style={styles.teacherInfo}>
                <View style={[styles.statusDot, { backgroundColor: teacher.is_on_leave ? COLORS.status.error : COLORS.status.success }]} />
                <View>
                  <Text style={styles.teacherName}>{teacher.name}</Text>
                  <Text style={styles.teacherRole}>{teacher.designation}</Text>
                </View>
              </View>
              <Badge text={teacher.is_on_leave ? 'On Leave' : 'Present'} variant={teacher.is_on_leave ? 'error' : 'success'} />
            </View>
          ))
        )}
      </Card>

      {/* Pending Leave Requests */}
      <Card style={styles.section}>
        <SectionHeader title="Pending Leave Requests" />
        {pendingLeaves.length === 0 ? (
          <EmptyState icon={<Text style={styles.emptyIcon}>⏰</Text>} title="No pending leave requests" />
        ) : (
          pendingLeaves.slice(0, 3).map((leave) => (
            <View key={leave.id} style={styles.leaveItem}>
              <View style={styles.leaveHeader}>
                <Text style={styles.leaveName}>{leave.user_name}</Text>
                <Badge text="Pending" variant="warning" />
              </View>
              <Text style={styles.leaveReason}>{leave.reason}</Text>
              <Text style={styles.leaveDate}>📅 {leave.start_date} - {leave.end_date}</Text>
            </View>
          ))
        )}
      </Card>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.quickStatItem}>
          <Text style={[styles.quickStatValue, { color: COLORS.status.success }]}>{stats?.students_present_today || 0}</Text>
          <Text style={styles.quickStatLabel}>Students Today</Text>
        </View>
        <View style={styles.quickStatItem}>
          <Text style={[styles.quickStatValue, { color: COLORS.primary }]}>{stats?.teachers_present || 0}</Text>
          <Text style={styles.quickStatLabel}>Teachers Present</Text>
        </View>
        <View style={styles.quickStatItem}>
          <Text style={[styles.quickStatValue, { color: COLORS.accent }]}>{stats?.pending_leave_requests || 0}</Text>
          <Text style={styles.quickStatLabel}>Pending Leaves</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  banner: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  bannerTitle: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  bannerSubtitle: {
    fontSize: FONTS.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  statEmoji: {
    fontSize: 24,
  },
  statValue: {
    fontSize: FONTS.xxl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: FONTS.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  legendRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
  },
  teacherItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  teacherName: {
    fontSize: FONTS.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  teacherRole: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
  },
  emptyIcon: {
    fontSize: 48,
  },
  leaveItem: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  leaveName: {
    fontSize: FONTS.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  leaveReason: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  leaveDate: {
    fontSize: FONTS.xs,
    color: COLORS.text.muted,
  },
  quickStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  quickStatItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: FONTS.xxl,
    fontWeight: 'bold',
  },
  quickStatLabel: {
    fontSize: FONTS.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FEE2E2',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xxl,
  },
  logoutIcon: {
    fontSize: 20,
  },
  logoutText: {
    fontSize: FONTS.lg,
    fontWeight: '500',
    color: COLORS.status.error,
  },
});

export default DashboardScreen;
