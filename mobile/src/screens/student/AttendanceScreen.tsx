import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { studentAPI, attendanceAPI } from '../../services/api';
import { Card, Badge, Loading, EmptyState } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { Attendance, AttendanceStats } from '../../types';

const AttendanceScreen: React.FC = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const studentRes = await studentAPI.getByUserId(user!.id);
      const [attRes, statsRes] = await Promise.all([
        attendanceAPI.getAll({ student_id: studentRes.id }),
        attendanceAPI.getStats(studentRes.id),
      ]);
      setAttendance(attRes);
      setStats(statsRes);
    } catch (error) {
      console.error('Fetch attendance error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
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
      {/* Stats Overview */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.mainStat]}>
          <Text style={styles.mainStatValue}>{stats?.percentage || 0}%</Text>
          <Text style={styles.mainStatLabel}>Overall Attendance</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.status.success }]}>{stats?.present || 0}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.status.error }]}>{stats?.absent || 0}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.status.warning }]}>{stats?.leave || 0}</Text>
          <Text style={styles.statLabel}>Leave</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <Card style={styles.progressCard}>
        <Text style={styles.progressTitle}>Attendance Progress</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, styles.presentFill, { width: `${(stats?.present || 0) / (stats?.total_days || 1) * 100}%` }]} />
          <View style={[styles.progressFill, styles.absentFill, { width: `${(stats?.absent || 0) / (stats?.total_days || 1) * 100}%` }]} />
          <View style={[styles.progressFill, styles.leaveFill, { width: `${(stats?.leave || 0) / (stats?.total_days || 1) * 100}%` }]} />
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.status.success }]} />
            <Text style={styles.legendText}>Present</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.status.error }]} />
            <Text style={styles.legendText}>Absent</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.status.warning }]} />
            <Text style={styles.legendText}>Leave</Text>
          </View>
        </View>
      </Card>

      {/* Attendance History */}
      <Card style={styles.historyCard}>
        <Text style={styles.historyTitle}>Attendance History</Text>
        {attendance.length === 0 ? (
          <EmptyState icon={<Text style={{ fontSize: 48 }}>📋</Text>} title="No attendance records" />
        ) : (
          [...attendance].reverse().slice(0, 20).map((record, idx) => (
            <View key={idx} style={styles.recordItem}>
              <View style={styles.recordInfo}>
                <View style={[
                  styles.recordIcon,
                  { backgroundColor: record.status === 'present' ? '#D1FAE5' : record.status === 'absent' ? '#FEE2E2' : '#FEF3C7' }
                ]}>
                  <Text style={styles.recordEmoji}>
                    {record.status === 'present' ? '✓' : record.status === 'absent' ? '✕' : '⏰'}
                  </Text>
                </View>
                <Text style={styles.recordDate}>{record.date}</Text>
              </View>
              <Badge
                text={record.status}
                variant={record.status === 'present' ? 'success' : record.status === 'absent' ? 'error' : 'warning'}
              />
            </View>
          ))
        )}
      </Card>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  mainStat: {
    width: '100%',
    backgroundColor: COLORS.primary,
  },
  mainStatValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  mainStatLabel: {
    fontSize: FONTS.md,
    color: 'rgba(255,255,255,0.8)',
  },
  statValue: {
    fontSize: FONTS.xxl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  progressCard: {
    marginBottom: SPACING.lg,
  },
  progressTitle: {
    fontSize: FONTS.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 16,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  presentFill: {
    backgroundColor: COLORS.status.success,
  },
  absentFill: {
    backgroundColor: COLORS.status.error,
  },
  leaveFill: {
    backgroundColor: COLORS.status.warning,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
  },
  historyCard: {
    marginBottom: SPACING.xxl,
  },
  historyTitle: {
    fontSize: FONTS.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  recordIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordEmoji: {
    fontSize: 16,
  },
  recordDate: {
    fontSize: FONTS.md,
    color: COLORS.text.primary,
  },
});

export default AttendanceScreen;
