import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { leaveAPI } from '../../services/api';
import { Card, Badge, Loading, Button, EmptyState } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { Leave } from '../../types';

const LeaveScreen: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    start_date: '',
    end_date: '',
    leave_type: 'casual',
  });

  const fetchLeaves = useCallback(async () => {
    try {
      const data = await leaveAPI.getAll({ user_id: user?.id });
      setLeaves(data);
    } catch (error) {
      console.error('Fetch leaves error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleSubmit = async () => {
    if (!formData.start_date || !formData.end_date || !formData.reason) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await leaveAPI.apply(formData);
      Alert.alert('Success', 'Leave application submitted');
      setFormData({
        reason: '',
        start_date: '',
        end_date: '',
        leave_type: 'casual',
      });
      fetchLeaves();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  const renderLeave = ({ item }: { item: Leave }) => (
    <Card style={styles.leaveCard}>
      <View style={styles.leaveHeader}>
        <Badge
          text={item.status}
          variant={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'error' : 'warning'}
        />
        <Badge text={item.leave_type} variant="info" />
      </View>
      <Text style={styles.leaveReason}>{item.reason}</Text>
      <Text style={styles.leaveDate}>📅 {item.start_date} - {item.end_date}</Text>
    </Card>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {/* Apply Leave Form */}
      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Apply for Leave</Text>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Leave Type</Text>
          <View style={styles.leaveTypes}>
            {['casual', 'sick', 'emergency'].map((type) => (
              <Button
                key={type}
                title={type.charAt(0).toUpperCase() + type.slice(1)}
                variant={formData.leave_type === type ? 'primary' : 'outline'}
                onPress={() => setFormData({ ...formData, leave_type: type })}
                style={styles.typeBtn}
              />
            ))}
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.formLabel}>Start Date</Text>
            <TextInput
              style={styles.formInput}
              placeholder="YYYY-MM-DD"
              value={formData.start_date}
              onChangeText={(text) => setFormData({ ...formData, start_date: text })}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.formLabel}>End Date</Text>
            <TextInput
              style={styles.formInput}
              placeholder="YYYY-MM-DD"
              value={formData.end_date}
              onChangeText={(text) => setFormData({ ...formData, end_date: text })}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Reason</Text>
          <TextInput
            style={[styles.formInput, styles.textArea]}
            placeholder="Enter reason for leave..."
            value={formData.reason}
            onChangeText={(text) => setFormData({ ...formData, reason: text })}
            multiline
            numberOfLines={3}
          />
        </View>

        <Button title="Submit Application" onPress={handleSubmit} loading={submitting} />
      </Card>

      {/* Leave History */}
      <Text style={styles.historyTitle}>Leave History</Text>
      <FlatList
        data={leaves}
        renderItem={renderLeave}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon={<Text style={{ fontSize: 48 }}>🗓️</Text>} title="No leave applications" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  formCard: {
    margin: SPACING.lg,
  },
  formTitle: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  formLabel: {
    fontSize: FONTS.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  formInput: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONTS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  leaveTypes: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeBtn: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  historyTitle: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  leaveCard: {
    marginBottom: SPACING.md,
  },
  leaveHeader: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  leaveReason: {
    fontSize: FONTS.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  leaveDate: {
    fontSize: FONTS.sm,
    color: COLORS.text.muted,
  },
});

export default LeaveScreen;
