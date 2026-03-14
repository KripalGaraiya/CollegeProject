import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { leaveAPI } from '../../services/api';
import { Card, Badge, Loading, EmptyState } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { Leave } from '../../types';

const LeavesScreen: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('pending');

  const fetchLeaves = useCallback(async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await leaveAPI.getAll(params);
      setLeaves(data);
    } catch (error) {
      console.error('Fetch leaves error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaves();
  };

  const handleApprove = async (id: string) => {
    Alert.alert('Approve Leave', 'Are you sure you want to approve this leave?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          try {
            await leaveAPI.approve(id);
            Alert.alert('Success', 'Leave approved');
            fetchLeaves();
          } catch (error) {
            Alert.alert('Error', 'Failed to approve leave');
          }
        },
      },
    ]);
  };

  const handleReject = async (id: string) => {
    Alert.alert('Reject Leave', 'Are you sure you want to reject this leave?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveAPI.reject(id);
            Alert.alert('Success', 'Leave rejected');
            fetchLeaves();
          } catch (error) {
            Alert.alert('Error', 'Failed to reject leave');
          }
        },
      },
    ]);
  };

  const filters = ['pending', 'approved', 'rejected', 'all'];

  const renderLeave = ({ item }: { item: Leave }) => (
    <Card style={styles.leaveCard}>
      <View style={styles.leaveHeader}>
        <Text style={styles.leaveName}>{item.user_name}</Text>
        <Badge
          text={item.status}
          variant={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'error' : 'warning'}
        />
      </View>
      <Text style={styles.leaveReason}>{item.reason}</Text>
      <View style={styles.leaveMeta}>
        <Text style={styles.leaveDate}>📅 {item.start_date} - {item.end_date}</Text>
        <Badge text={item.leave_type} variant="info" />
      </View>
      {item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)}>
            <Text style={styles.approveBtnText}>✓ Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
            <Text style={styles.rejectBtnText}>✕ Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leaves List */}
      <FlatList
        data={leaves}
        renderItem={renderLeave}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon={<Text style={{ fontSize: 48 }}>⏰</Text>}
            title={`No ${filter !== 'all' ? filter : ''} leave requests`}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: '500',
  },
  listContent: {
    padding: SPACING.lg,
  },
  leaveCard: {
    marginBottom: SPACING.md,
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  leaveName: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  leaveReason: {
    fontSize: FONTS.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  leaveMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  leaveDate: {
    fontSize: FONTS.sm,
    color: COLORS.text.muted,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#D1FAE5',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  approveBtnText: {
    fontSize: FONTS.md,
    fontWeight: '500',
    color: '#059669',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  rejectBtnText: {
    fontSize: FONTS.md,
    fontWeight: '500',
    color: '#DC2626',
  },
});

export default LeavesScreen;
