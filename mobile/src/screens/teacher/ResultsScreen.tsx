import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { classAPI, studentAPI, resultAPI } from '../../services/api';
import { Card, Badge, Loading, Button, EmptyState } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { Class, Student, Result } from '../../types';

const ResultsScreen: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newResult, setNewResult] = useState({
    student_id: '',
    subject: '',
    exam_type: 'midterm',
    marks_obtained: '',
    total_marks: '100',
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsAndResults();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const data = await classAPI.getAll();
      setClasses(data);
    } catch (error) {
      console.error('Fetch classes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndResults = async () => {
    setLoading(true);
    try {
      const [studentsRes, resultsRes] = await Promise.all([
        studentAPI.getAll({ class_id: selectedClass, limit: 100 }),
        resultAPI.getAll({ class_id: selectedClass }),
      ]);
      setStudents(studentsRes.students);
      setResults(resultsRes);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResult = async () => {
    if (!newResult.student_id || !newResult.subject || !newResult.marks_obtained) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    try {
      await resultAPI.add({
        ...newResult,
        class_id: selectedClass,
        marks_obtained: parseFloat(newResult.marks_obtained),
        total_marks: parseFloat(newResult.total_marks),
      });
      Alert.alert('Success', 'Result added');
      setShowModal(false);
      setNewResult({
        student_id: '',
        subject: '',
        exam_type: 'midterm',
        marks_obtained: '',
        total_marks: '100',
      });
      fetchStudentsAndResults();
    } catch (error) {
      Alert.alert('Error', 'Failed to add result');
    }
  };

  const getStudentName = (id: string) => students.find((s) => s.id === id)?.name || '-';

  const renderResult = ({ item }: { item: Result }) => (
    <Card style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Text style={styles.studentName}>{getStudentName(item.student_id)}</Text>
        <Badge
          text={item.grade}
          variant={item.grade === 'A+' || item.grade === 'A' ? 'success' : item.grade === 'F' ? 'error' : 'info'}
        />
      </View>
      <View style={styles.resultDetails}>
        <Text style={styles.subject}>{item.subject}</Text>
        <Text style={styles.examType}>{item.exam_type}</Text>
      </View>
      <View style={styles.marksRow}>
        <Text style={styles.marks}>{item.marks_obtained}/{item.total_marks}</Text>
        <Text style={styles.percentage}>{item.percentage}%</Text>
      </View>
    </Card>
  );

  if (loading && classes.length === 0) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {/* Class Selector */}
      <View style={styles.header}>
        <View style={styles.classSelector}>
          {classes.map((cls) => (
            <TouchableOpacity
              key={cls.id}
              style={[styles.classChip, selectedClass === cls.id && styles.classChipActive]}
              onPress={() => setSelectedClass(cls.id)}
            >
              <Text style={[styles.classChipText, selectedClass === cls.id && styles.classChipTextActive]}>
                {cls.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {selectedClass && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
            <Text style={styles.addBtnText}>➕ Add Result</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results List */}
      {selectedClass && (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState icon={<Text style={{ fontSize: 48 }}>📝</Text>} title="No results uploaded" />}
        />
      )}

      {/* Add Result Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Result</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Student *</Text>
              <View style={styles.studentPicker}>
                {students.slice(0, 5).map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.studentOption, newResult.student_id === s.id && styles.studentOptionActive]}
                    onPress={() => setNewResult({ ...newResult, student_id: s.id })}
                  >
                    <Text style={styles.studentOptionText}>{s.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Subject *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter subject"
                value={newResult.subject}
                onChangeText={(text) => setNewResult({ ...newResult, subject: text })}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Marks *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Obtained"
                  keyboardType="numeric"
                  value={newResult.marks_obtained}
                  onChangeText={(text) => setNewResult({ ...newResult, marks_obtained: text })}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Total</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Total"
                  keyboardType="numeric"
                  value={newResult.total_marks}
                  onChangeText={(text) => setNewResult({ ...newResult, total_marks: text })}
                />
              </View>
            </View>

            <Button title="Add Result" onPress={handleAddResult} style={styles.submitBtn} />
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
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  classSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  classChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
  },
  classChipActive: {
    backgroundColor: COLORS.secondary,
  },
  classChipText: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
  },
  classChipTextActive: {
    color: COLORS.white,
    fontWeight: '500',
  },
  addBtn: {
    backgroundColor: COLORS.secondary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  addBtnText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  listContent: {
    padding: SPACING.lg,
  },
  resultCard: {
    marginBottom: SPACING.md,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  studentName: {
    fontSize: FONTS.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  resultDetails: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  subject: {
    fontSize: FONTS.sm,
    color: COLORS.text.primary,
  },
  examType: {
    fontSize: FONTS.sm,
    color: COLORS.text.muted,
    textTransform: 'capitalize',
  },
  marksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  marks: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  percentage: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.primary,
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
  },
  closeBtn: {
    fontSize: 24,
    color: COLORS.text.muted,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  formLabel: {
    fontSize: FONTS.sm,
    fontWeight: '500',
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
  formRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  studentPicker: {
    gap: SPACING.sm,
  },
  studentOption: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
  },
  studentOptionActive: {
    backgroundColor: `${COLORS.secondary}20`,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  studentOptionText: {
    fontSize: FONTS.sm,
  },
  submitBtn: {
    marginTop: SPACING.md,
  },
});

export default ResultsScreen;
