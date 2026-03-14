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
import { noticeAPI, departmentAPI } from '../../services/api';
import { Card, Badge, Loading, EmptyState, Button } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { Notice, Department } from '../../types';

const NoticesScreen: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    description: '',
    department_id: '',
    target_roles: ['student', 'teacher'],
  });

  const fetchNotices = useCallback(async () => {
    try {
      const data = await noticeAPI.getAll();
      setNotices(data);
    } catch (error) {
      console.error('Fetch notices error:', error);
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
    fetchNotices();
    fetchDepartments();
  }, [fetchNotices]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotices();
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Notice', 'Are you sure you want to delete this notice?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await noticeAPI.delete(id);
            Alert.alert('Success', 'Notice deleted');
            fetchNotices();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete notice');
          }
        },
      },
    ]);
  };

  const handleAddNotice = async () => {
    if (!newNotice.title || !newNotice.description) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    try {
      await noticeAPI.create({
        ...newNotice,
        department_id: newNotice.department_id || undefined,
      });
      Alert.alert('Success', 'Notice published');
      setShowAddModal(false);
      setNewNotice({
        title: '',
        description: '',
        department_id: '',
        target_roles: ['student', 'teacher'],
      });
      fetchNotices();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create notice');
    }
  };

  const toggleRole = (role: string) => {
    setNewNotice((prev) => ({
      ...prev,
      target_roles: prev.target_roles.includes(role)
        ? prev.target_roles.filter((r) => r !== role)
        : [...prev.target_roles, role],
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderNotice = ({ item }: { item: Notice }) => (
    <Card style={styles.noticeCard}>
      <View style={styles.noticeHeader}>
        <View style={styles.noticeIcon}>
          <Text style={styles.noticeEmoji}>📢</Text>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.noticeTitle}>{item.title}</Text>
      <Text style={styles.noticeDesc}>{item.description}</Text>
      <View style={styles.noticeMeta}>
        <View style={styles.badges}>
          {item.target_roles?.map((role) => (
            <Badge key={role} text={role} variant="info" style={styles.badge} />
          ))}
        </View>
        <Text style={styles.noticeDate}>📅 {formatDate(item.created_at)}</Text>
      </View>
    </Card>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{notices.length} Notices</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>➕ Create</Text>
        </TouchableOpacity>
      </View>

      {/* Notices List */}
      <FlatList
        data={notices}
        renderItem={renderNotice}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={<EmptyState icon={<Text style={{ fontSize: 48 }}>📢</Text>} title="No notices found" />}
      />

      {/* Add Notice Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Notice</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter notice title"
                value={newNotice.title}
                onChangeText={(text) => setNewNotice({ ...newNotice, title: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description *</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Enter notice content"
                value={newNotice.description}
                onChangeText={(text) => setNewNotice({ ...newNotice, description: text })}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Target Audience</Text>
              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={[styles.checkbox, newNotice.target_roles.includes('student') && styles.checkboxActive]}
                  onPress={() => toggleRole('student')}
                >
                  <Text style={styles.checkboxText}>👨‍🎓 Students</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.checkbox, newNotice.target_roles.includes('teacher') && styles.checkboxActive]}
                  onPress={() => toggleRole('teacher')}
                >
                  <Text style={styles.checkboxText}>👨‍🏫 Teachers</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button title="Publish Notice" onPress={handleAddNotice} style={styles.submitButton} />
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
  noticeCard: {
    marginBottom: SPACING.md,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  noticeIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeEmoji: {
    fontSize: 20,
  },
  deleteBtn: {
    padding: SPACING.xs,
  },
  deleteIcon: {
    fontSize: 18,
  },
  noticeTitle: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  noticeDesc: {
    fontSize: FONTS.md,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  noticeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  badge: {
    textTransform: 'capitalize',
  },
  noticeDate: {
    fontSize: FONTS.xs,
    color: COLORS.text.muted,
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
    maxHeight: '85%',
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
    height: 100,
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  checkbox: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkboxActive: {
    backgroundColor: `${COLORS.primary}20`,
    borderColor: COLORS.primary,
  },
  checkboxText: {
    fontSize: FONTS.sm,
    color: COLORS.text.primary,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
});

export default NoticesScreen;
