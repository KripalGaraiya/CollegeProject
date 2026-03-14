import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { classAPI, studentAPI, attendanceAPI } from '../../services/api';
import { Card, Badge, Loading, Button } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { Class, Student } from '../../types';

const AttendanceScreen: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
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

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentAPI.getAll({ class_id: selectedClass, limit: 100 });
      setStudents(response.students);
      // Fetch existing attendance
      const attData = await attendanceAPI.getAll({ class_id: selectedClass, date });
      const existingAtt: Record<string, string> = {};
      attData.forEach((a: any) => {
        existingAtt[a.student_id] = a.status;
      });
      setAttendance(existingAtt);
    } catch (error) {
      console.error('Fetch students error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: string) => {
    const newAtt: Record<string, string> = {};
    students.forEach((s) => {
      newAtt[s.id] = status;
    });
    setAttendance(newAtt);
  };

  const handleSave = async () => {
    if (Object.keys(attendance).length === 0) {
      Alert.alert('Error', 'Please mark attendance for at least one student');
      return;
    }

    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([student_id, status]) => ({
        student_id,
        status,
      }));
      await attendanceAPI.markBulk({ class_id: selectedClass, date, attendance_records: records });
      Alert.alert('Success', 'Attendance saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const renderStudent = ({ item }: { item: Student }) => (
    <Card style={styles.studentCard}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.rollNumber}>{item.roll_number}</Text>
      </View>
      <View style={styles.statusButtons}>
        <TouchableOpacity
          style={[styles.statusBtn, attendance[item.id] === 'present' && styles.presentBtn]}
          onPress={() => handleStatusChange(item.id, 'present')}
        >
          <Text style={[styles.statusText, attendance[item.id] === 'present' && styles.activeStatusText]}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusBtn, attendance[item.id] === 'absent' && styles.absentBtn]}
          onPress={() => handleStatusChange(item.id, 'absent')}
        >
          <Text style={[styles.statusText, attendance[item.id] === 'absent' && styles.activeStatusText]}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusBtn, attendance[item.id] === 'leave' && styles.leaveBtn]}
          onPress={() => handleStatusChange(item.id, 'leave')}
        >
          <Text style={[styles.statusText, attendance[item.id] === 'leave' && styles.activeStatusText]}>L</Text>
        </TouchableOpacity>
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
        <Text style={styles.dateText}>📅 {date}</Text>
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
      </View>

      {selectedClass && (
        <>
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickBtn} onPress={() => handleMarkAll('present')}>
              <Text style={styles.quickBtnText}>All Present</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickBtn} onPress={() => handleMarkAll('absent')}>
              <Text style={styles.quickBtnText}>All Absent</Text>
            </TouchableOpacity>
          </View>

          {/* Students List */}
          <FlatList
            data={students}
            renderItem={renderStudent}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={
              <Button title="Save Attendance" onPress={handleSave} loading={saving} style={styles.saveBtn} />
            }
          />
        </>
      )}
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
  dateText: {
    fontSize: FONTS.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  classSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  classChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  classChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  classChipText: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
  },
  classChipTextActive: {
    color: COLORS.white,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  quickBtnText: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
  },
  listContent: {
    padding: SPACING.lg,
  },
  studentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: FONTS.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  rollNumber: {
    fontSize: FONTS.sm,
    color: COLORS.text.muted,
    fontFamily: 'monospace',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statusBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presentBtn: {
    backgroundColor: COLORS.status.success,
    borderColor: COLORS.status.success,
  },
  absentBtn: {
    backgroundColor: COLORS.status.error,
    borderColor: COLORS.status.error,
  },
  leaveBtn: {
    backgroundColor: COLORS.status.warning,
    borderColor: COLORS.status.warning,
  },
  statusText: {
    fontSize: FONTS.md,
    color: COLORS.text.muted,
    fontWeight: 'bold',
  },
  activeStatusText: {
    color: COLORS.white,
  },
  saveBtn: {
    marginTop: SPACING.lg,
  },
});

export default AttendanceScreen;
