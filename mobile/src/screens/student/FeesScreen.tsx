import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { studentAPI, feeAPI } from '../../services/api';
import { Card, Badge, Loading, EmptyState } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { Fee } from '../../types';

const FeesScreen: React.FC = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState<{ fees: Fee[]; total_fees: number; total_paid: number; pending: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const studentRes = await studentAPI.getByUserId(user!.id);
      const feesRes = await feeAPI.getStudentSummary(studentRes.id);
      setFees(feesRes);
    } catch (error) {
      console.error('Fetch fees error:', error);
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

  const paymentPercentage = fees?.total_fees ? (fees.total_paid / fees.total_fees * 100) : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
    >
      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryEmoji}>💰</Text>
          <Text style={styles.summaryValue}>₹{(fees?.total_fees || 0).toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Total Fees</Text>
        </Card>
        <Card style={[styles.summaryCard, styles.paidCard]}>
          <Text style={styles.summaryEmoji}>✓</Text>
          <Text style={[styles.summaryValue, { color: COLORS.status.success }]}>₹{(fees?.total_paid || 0).toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Paid</Text>
        </Card>
        <Card style={[styles.summaryCard, styles.pendingCard]}>
          <Text style={styles.summaryEmoji}>⚠️</Text>
          <Text style={[styles.summaryValue, { color: COLORS.status.error }]}>₹{(fees?.pending || 0).toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </Card>
      </View>

      {/* Payment Progress */}
      {fees?.total_fees && fees.total_fees > 0 && (
        <Card style={styles.progressCard}>
          <Text style={styles.progressTitle}>Payment Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${paymentPercentage}%` }]} />
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressPercent}>{Math.round(paymentPercentage)}% Paid</Text>
            <Text style={styles.progressRemaining}>₹{fees.pending.toLocaleString()} remaining</Text>
          </View>
        </Card>
      )}

      {/* Fee Breakdown */}
      <Card style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>Fee Breakdown</Text>
        {!fees?.fees || fees.fees.length === 0 ? (
          <EmptyState icon={<Text style={{ fontSize: 48 }}>💳</Text>} title="No fee records found" />
        ) : (
          fees.fees.map((fee, idx) => (
            <View key={idx} style={styles.feeItem}>
              <View style={styles.feeInfo}>
                <Text style={styles.feeType}>{fee.fee_type}</Text>
                <Text style={styles.feeYear}>{fee.academic_year}</Text>
              </View>
              <View style={styles.feeAmounts}>
                <Text style={styles.feeAmount}>₹{fee.amount.toLocaleString()}</Text>
                <Badge
                  text={fee.status}
                  variant={fee.status === 'paid' ? 'success' : fee.status === 'partial' ? 'warning' : 'error'}
                />
              </View>
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
  summaryGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  paidCard: {},
  pendingCard: {},
  summaryEmoji: {
    fontSize: 24,
    marginBottom: SPACING.sm,
  },
  summaryValue: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  summaryLabel: {
    fontSize: FONTS.xs,
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
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.status.success,
    borderRadius: RADIUS.full,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  progressPercent: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
  },
  progressRemaining: {
    fontSize: FONTS.sm,
    color: COLORS.text.muted,
  },
  breakdownCard: {
    marginBottom: SPACING.xxl,
  },
  breakdownTitle: {
    fontSize: FONTS.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  feeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  feeInfo: {},
  feeType: {
    fontSize: FONTS.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    textTransform: 'capitalize',
  },
  feeYear: {
    fontSize: FONTS.sm,
    color: COLORS.text.muted,
  },
  feeAmounts: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  feeAmount: {
    fontSize: FONTS.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
});

export default FeesScreen;
