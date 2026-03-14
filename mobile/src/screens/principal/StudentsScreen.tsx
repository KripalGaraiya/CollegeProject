import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { studentAPI, departmentAPI } from '../../services/api';
import { Card, Badge, Loading, EmptyState, Button } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { Student, Department } from '../../types';

const StudentsScreen: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    roll_number: '',
    department_id: '',
    class_id: '',
    year: 1,
  });

  const fetchStudents = useCallback(async (pageNum = 1) => {
    try {
      const response = await studentAPI.getAll({
        page: pageNum,
        limit: 20,
        search: search || undefined,
      });
      if (pageNum === 1) {
        setStudents(response.students);
      } else {
        setStudents((prev) => [...prev, ...response.students]);
      }
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Fetch students error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  const fetchDepartments = async () => {
    try {
      const data = await departmentAPI.getAll();
      setDepartments(data);
    } catch (error) {
      console.error('Fetch departments error:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
  }, [fetchStudents]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchStudents(1);
  };

  const handleSearch = () => {
    setPage(1);
    setLoading(true);
    fetchStudents(1);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchStudents(nextPage);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Student', 'Are you sure you want to delete this student?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await studentAPI.delete(id);
            Alert.alert('Success', 'Student deleted');
            onRefresh();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete student');
          }
        },
      },
    ]);
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email || !newStudent.roll_number) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    try {
      await studentAPI.create(newStudent);
      Alert.alert('Success', 'Student added successfully');
      setShowAddModal(false);
      setNewStudent({
        name: '',
        email: '',
        phone: '',
        roll_number: '',
        department_id: '',
        class_id: '',
        year: 1,
      });
      onRefresh();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add student');
    }
  };

  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name || '-';

  const renderStudent = ({ item }: { item: Student }) => (
    <Card style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <View>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.rollNumber}>{item.roll_number}</Text>
        </View>
        <Badge text={`Year ${item.year}`} variant="info" />
      </View>
      <View style={styles.studentDetails}>
        <Text style={styles.detailText}>📧 {item.email}</Text>
        <Text style={styles.detailText}>🏛️ {getDeptName(item.department_id)}</Text>
      </View>
      <View style={styles.studentActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>👁️ View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading && students.length === 0) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, roll number..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>➕</Text>
        </TouchableOpacity>
      </View>

      {/* Students List */}
      <FlatList
        data={students}
        renderItem={renderStudent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<EmptyState icon={<Text style={{ fontSize: 48 }}>👨‍🎓</Text>} title="No students found" />}
      />

      {/* Add Student Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Student</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter full name"
                value={newStudent.name}
                onChangeText={(text) => setNewStudent({ ...newStudent, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter email"
                value={newStudent.email}
                onChangeText={(text) => setNewStudent({ ...newStudent, email: text })}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Roll Number *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter roll number"
                value={newStudent.roll_number}
                onChangeText={(text) => setNewStudent({ ...newStudent, roll_number: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter phone number"
                value={newStudent.phone}
                onChangeText={(text) => setNewStudent({ ...newStudent, phone: text })}
                keyboardType="phone-pad"
              />
            </View>

            <Button title="Add Student" onPress={handleAddStudent} style={styles.submitButton} />
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
  searchContainer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: FONTS.md,
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 20,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  studentCard: {
    marginBottom: SPACING.md,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  studentName: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  rollNumber: {
    fontSize: FONTS.sm,
    color: COLORS.text.muted,
    fontFamily: 'monospace',
  },
  studentDetails: {
    marginBottom: SPACING.md,
  },
  detailText: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  studentActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  actionText: {
    fontSize: FONTS.sm,
    color: COLORS.text.primary,
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
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

export default StudentsScreen;
