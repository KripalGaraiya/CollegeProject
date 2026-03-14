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
import { dashboardAPI } from '../../services/api';
import { Card, Badge, Loading, EmptyState } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { TeacherDashboard } from '../../types';

const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState<TeacherDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await dashboardAPI.getTeacher();
      setData(response);
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />}
    >
      {/* Welcome Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Welcome, {user?.name || 'Teacher'}</Text>
        <Text style={styles.bannerSubtitle}>
          {data?.teacher?.designation} • {data?.teacher?.qualification}
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📚</Text>
          <Text style={styles.statValue}>{data?.assigned_classes?.length || 0}</Text>
          <Text style={styles.statLabel}>Classes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📋</Text>
          <Text style={styles.statValue}>-</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📝</Text>
          <Text style={styles.statValue}>-</Text>
          <Text style={styles.statLabel}>Results</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🗓️</Text>
          <Text style={styles.statValue}>{data?.pending_leaves?.length || 0}</Text>
          <Text style={styles.statLabel}>Leaves</Text>
        </View>
      </View>

      {/* Assigned Classes */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Your Classes</Text>
        {data?.assigned_classes && data.assigned_classes.length > 0 ? (
          data.assigned_classes.map((cls) => (
            <View key={cls.id} style={styles.classItem}>
              <View>
                <Text style={styles.className}>{cls.name}</Text>
                <Text style={styles.classInfo}>Year {cls.year} • Section {cls.section}</Text>
              </View>
              <Badge text="Active" variant="success" />
            </View>
          ))
        ) : (
          <EmptyState title="No classes assigned" />
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
    backgroundColor: COLORS.secondary,
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
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  className: {
    fontSize: FONTS.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  classInfo: {
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
