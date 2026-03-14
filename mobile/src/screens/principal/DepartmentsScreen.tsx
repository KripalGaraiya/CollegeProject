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
import { departmentAPI } from '../../services/api';
import { Card, Loading, EmptyState, Button } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { Department } from '../../types';

const DepartmentsScreen: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '', description: '' });

  const fetchDepartments = useCallback(async () => {
    try {
      const data = await departmentAPI.getAll();
      setDepartments(data);
    } catch (error) {
      console.error('Fetch departments error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDepartments();
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Department', 'Are you sure you want to delete this department?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await departmentAPI.delete(id);
            Alert.alert('Success', 'Department deleted');
            fetchDepartments();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete department');
          }
        },
      },
    ]);
  };

  const handleAddDepartment = async () => {
    if (!newDept.name || !newDept.code) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    try {
      await departmentAPI.create(newDept);
      Alert.alert('Success', 'Department added successfully');
      setShowAddModal(false);
      setNewDept({ name: '', code: '', description: '' });
      fetchDepartments();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add department');
    }
  };

  const renderDepartment = ({ item }: { item: Department }) => (
    <Card style={styles.deptCard}>
      <View style={styles.deptHeader}>
        <View style={styles.deptIcon}>
          <Text style={styles.deptEmoji}>🏛️</Text>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.deptName}>{item.name}</Text>
      <Text style={styles.deptCode}>{item.code}</Text>
      {item.description && <Text style={styles.deptDesc}>{item.description}</Text>}
    </Card>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Total: {departments.length} Departments</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>➕ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Departments Grid */}
      <FlatList
        data={departments}
        renderItem={renderDepartment}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={<EmptyState icon={<Text style={{ fontSize: 48 }}>🏛️</Text>} title="No departments found" />}
      />

      {/* Add Department Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Department</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter department name"
                value={newDept.name}
                onChangeText={(text) => setNewDept({ ...newDept, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Code *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter code (e.g., FMT)"
                value={newDept.code}
                onChangeText={(text) => setNewDept({ ...newDept, code: text })}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Enter description"
                value={newDept.description}
                onChangeText={(text) => setNewDept({ ...newDept, description: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <Button title="Add Department" onPress={handleAddDepartment} style={styles.submitButton} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.md,
    color: COLORS.text.secondary,
  },
  addButton: {
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
  row: {
    justifyContent: 'space-between',
  },
  deptCard: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  deptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  deptIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deptEmoji: {
    fontSize: 24,
  },
  deleteBtn: {
    padding: SPACING.xs,
  },
  deleteIcon: {
    fontSize: 18,
  },
  deptName: {
    fontSize: FONTS.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  deptCode: {
    fontSize: FONTS.sm,
    color: COLORS.text.muted,
    fontFamily: 'monospace',
  },
  deptDesc: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: SPACING.md,
  },
});

export default DepartmentsScreen;
