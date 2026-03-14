import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI, teacherAPI } from '../../services/api';
import { Card, Badge, Loading, EmptyState } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { StudentDashboard, Teacher } from '../../types';

const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState<StudentDashboard | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [dashRes, teachersRes] = await Promise.all([
        dashboardAPI.getStudent(),
        teacherAPI.getAvailability(),
      ]);
      setData(dashRes);
      setTeachers(teachersRes);
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileIcon}>
          <Text style={styles.profileEmoji}>👨‍🎓</Text>
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
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📋</Text>
          <Text style={[styles.statValue, { color: COLORS.status.success }]}>{data?.attendance?.percentage || 0}%</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>💰</Text>
          <Text style={[styles.statValue, data?.fees?.pending && data.fees.pending > 0 ? { color: COLORS.status.error } : {}]}>
            {data?.fees?.pending && data.fees.pending > 0 ? 'Due' : 'Paid'}
          </Text>
          <Text style={styles.statLabel}>Fees</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📝</Text>
          <Text style={styles.statValue}>{data?.recent_results?.length || 0}</Text>
          <Text style={styles.statLabel}>Results</Text>
        </View>
      </View>

      {/* Teacher Availability */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Teacher Availability</Text>
        {teachers.length === 0 ? (
          <EmptyState title="No teachers found" />
        ) : (
          teachers.slice(0, 4).map((teacher) => (
            <View key={teacher.id} style={styles.teacherItem}>
              <View style={styles.teacherInfo}>
                <View style={[styles.statusDot, { backgroundColor: teacher.is_on_leave ? COLORS.status.error : COLORS.status.success }]} />
                <View>
                  <Text style={styles.teacherName}>{teacher.name}</Text>
                  <Text style={styles.teacherRole}>{teacher.designation}</Text>
                </View>
              </View>
              <Badge text={teacher.is_on_leave ? 'On Leave' : 'Available'} variant={teacher.is_on_leave ? 'error' : 'success'} />
            </View>
          ))
        )}
      </Card>

      {/* Recent Notices */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Notices</Text>
        {data?.recent_notices && data.recent_notices.length > 0 ? (
          data.recent_notices.map((notice) => (
            <View key={notice.id} style={styles.noticeItem}>
              <Text style={styles.noticeIcon}>📢</Text>
              <View style={styles.noticeContent}>
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Text style={styles.noticeDesc} numberOfLines={2}>{notice.description}</Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState title="No recent notices" />
        )}
      </Card>

      {/* Logout */}
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
  profileHeader: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileEmoji: {
    fontSize: 32,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  profileRoll: {
    fontSize: FONTS.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: FONTS.xs,
    color: COLORS.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: FONTS.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
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
    width: 8,
    height: 8,
    borderRadius: 4,
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
  noticeItem: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  noticeIcon: {
    fontSize: 20,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: FONTS.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  noticeDesc: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
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
