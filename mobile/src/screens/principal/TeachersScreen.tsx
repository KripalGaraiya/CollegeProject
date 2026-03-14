import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { teacherAPI, departmentAPI } from '../../services/api';
import { Card, Badge, Loading, EmptyState, Button } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { Teacher, Department } from '../../types';

const TeachersScreen: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    phone: '',
    employee_id: '',
    department_id: '',
    designation: '',
    qualification: '',
  });

  const fetchTeachers = useCallback(async () => {
    try {
      const data = await teacherAPI.getAvailability();
      setTeachers(data);
    } catch (error) {
      console.error('Fetch teachers error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await departmentAPI.getAll();
      setDepartments(data);
    } catch (error) {
      console.error('Fetch departments error:', error);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, [fetchTeachers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeachers();
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Teacher', 'Are you sure you want to delete this teacher?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await teacherAPI.delete(id);
            Alert.alert('Success', 'Teacher deleted');
            fetchTeachers();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete teacher');
          }
        },
      },
    ]);
  };

  const handleAddTeacher = async () => {
    if (!newTeacher.name || !newTeacher.email || !newTeacher.employee_id) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    try {
      await teacherAPI.create(newTeacher);
      Alert.alert('Success', 'Teacher added successfully');
      setShowAddModal(false);
      setNewTeacher({
        name: '',
        email: '',
        phone: '',
        employee_id: '',
        department_id: '',
        designation: '',
        qualification: '',
      });
      fetchTeachers();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add teacher');
    }
  };

  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name || '-';

  const presentCount = teachers.filter((t) => !t.is_on_leave).length;
  const onLeaveCount = teachers.filter((t) => t.is_on_leave).length;

  const renderTeacher = ({ item }: { item: Teacher }) => (
    <Card style={styles.teacherCard}>
      <View style={styles.teacherHeader}>
        <View style={[styles.statusIndicator, { backgroundColor: item.is_on_leave ? COLORS.status.error : COLORS.status.success }]} />
        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName}>{item.name}</Text>
          <Text style={styles.teacherDesignation}>{item.designation}</Text>
        </View>
        <Badge text={item.is_on_leave ? 'On Leave' : 'Present'} variant={item.is_on_leave ? 'error' : 'success'} />
      </View>
      <View style={styles.teacherDetails}>
        <Text style={styles.detailText}>🆔 {item.employee_id}</Text>
        <Text style={styles.detailText}>📧 {item.email}</Text>
        <Text style={styles.detailText}>🏛️ {getDeptName(item.department_id)}</Text>
      </View>
      {item.is_on_leave && item.leave_reason && (
        <View style={styles.leaveReasonContainer}>
          <Text style={styles.leaveReasonLabel}>Leave Reason:</Text>
          <Text style={styles.leaveReason}>{item.leave_reason}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
        <Text style={styles.deleteText}>🗑️ Delete</Text>
      </TouchableOpacity>
    </Card>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsHeader}>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: COLORS.status.success }]} />
          <Text style={styles.statText}>Present: {presentCount}</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: COLORS.status.error }]} />
          <Text style={styles.statText}>On Leave: {onLeaveCount}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>➕ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Teachers List */}
      <FlatList
        data={teachers}
        renderItem={renderTeacher}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={<EmptyState icon={<Text style={{ fontSize: 48 }}>👨‍🏫</Text>} title="No teachers found" />}
      />

      {/* Add Teacher Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Teacher</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter full name"
                value={newTeacher.name}
                onChangeText={(text) => setNewTeacher({ ...newTeacher, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter email"
                value={newTeacher.email}
                onChangeText={(text) => setNewTeacher({ ...newTeacher, email: text })}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Employee ID *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter employee ID"
                value={newTeacher.employee_id}
                onChangeText={(text) => setNewTeacher({ ...newTeacher, employee_id: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Designation</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Professor"
                value={newTeacher.designation}
                onChangeText={(text) => setNewTeacher({ ...newTeacher, designation: text })}
              />
            </View>

            <Button title="Add Teacher" onPress={handleAddTeacher} style={styles.submitButton} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.xs,
  },
  statText: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
  },
  addButton: {
    marginLeft: 'auto',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  addButtonText: {
    fontSize: FONTS.sm,
    color: COLORS.white,
    fontWeight: '500',
  },
  listContent: {
    padding: SPACING.lg,
  },
  teacherCard: {
    marginBottom: SPACING.md,
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.md,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  teacherDesignation: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
  },
  teacherDetails: {
    marginBottom: SPACING.md,
  },
  detailText: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  leaveReasonContainer: {
    backgroundColor: '#FEF3C7',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  leaveReasonLabel: {
    fontSize: FONTS.xs,
    color: COLORS.accent,
    fontWeight: '500',
  },
  leaveReason: {
    fontSize: FONTS.sm,
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  deleteText: {
    fontSize: FONTS.sm,
    color: COLORS.status.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.text.muted,
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
  submitButton: {
    marginTop: SPACING.md,
  },
});

export default TeachersScreen;
