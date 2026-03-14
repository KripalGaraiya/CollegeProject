import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { studentAPI, resultAPI } from '../../services/api';
import { Card, Badge, Loading, EmptyState } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { Result } from '../../types';

const ResultsScreen: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<{
    results: Result[];
    total_obtained: number;
    total_marks: number;
    overall_percentage: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const studentRes = await studentAPI.getByUserId(user!.id);
      const resultsRes = await resultAPI.getStudentSummary(studentRes.id);
      setResults(resultsRes);
    } catch (error) {
      console.error('Fetch results error:', error);
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
      {/* Overall Performance */}
      {results?.results && results.results.length > 0 && (
        <View style={styles.overallCard}>
          <View style={styles.overallIcon}>
            <Text style={styles.overallEmoji}>🏆</Text>
          </View>
          <View style={styles.overallInfo}>
            <Text style={styles.overallLabel}>Overall Performance</Text>
            <Text style={styles.overallValue}>{results.overall_percentage}%</Text>
            <Text style={styles.overallMarks}>
              {results.total_obtained} / {results.total_marks} marks
            </Text>
          </View>
        </View>
      )}

      {/* Results List */}
      <Card style={styles.resultsCard}>
        <Text style={styles.resultsTitle}>Subject-wise Results</Text>
        {!results?.results || results.results.length === 0 ? (
          <EmptyState icon={<Text style={{ fontSize: 48 }}>📝</Text>} title="No results available" />
        ) : (
          results.results.map((result, idx) => (
            <View key={idx} style={styles.resultItem}>
              <View style={styles.resultInfo}>
                <Text style={styles.subjectName}>{result.subject}</Text>
                <Text style={styles.examType}>{result.exam_type}</Text>
              </View>
              <View style={styles.resultMarks}>
                <Text style={styles.marksText}>
                  {result.marks_obtained}/{result.total_marks}
                </Text>
                <Text style={[styles.percentText, { color: result.percentage >= 60 ? COLORS.status.success : result.percentage >= 40 ? COLORS.status.warning : COLORS.status.error }]}>
                  {result.percentage}%
                </Text>
              </View>
              <Badge
                text={result.grade}
                variant={result.grade === 'A+' || result.grade === 'A' ? 'success' : result.grade === 'F' ? 'error' : 'info'}
              />
            </View>
          ))
        )}
      </Card>

      {/* Grading Scale */}
      <Card style={styles.gradeCard}>
        <Text style={styles.gradeTitle}>Grading Scale</Text>
        <View style={styles.gradeGrid}>
          {[
            { grade: 'A+', range: '90-100%', color: '#D1FAE5', textColor: '#059669' },
            { grade: 'A', range: '80-89%', color: '#D1FAE5', textColor: '#059669' },
            { grade: 'B+', range: '70-79%', color: '#DBEAFE', textColor: '#2563EB' },
            { grade: 'B', range: '60-69%', color: '#DBEAFE', textColor: '#2563EB' },
            { grade: 'C', range: '50-59%', color: '#FEF3C7', textColor: '#D97706' },
            { grade: 'D', range: '40-49%', color: '#FEF3C7', textColor: '#D97706' },
            { grade: 'F', range: '<40%', color: '#FEE2E2', textColor: '#DC2626' },
          ].map((item) => (
            <View key={item.grade} style={[styles.gradeItem, { backgroundColor: item.color }]}>
              <Text style={[styles.gradeValue, { color: item.textColor }]}>{item.grade}</Text>
              <Text style={styles.gradeRange}>{item.range}</Text>
            </View>
          ))}
        </View>
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
  overallCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  overallIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallEmoji: {
    fontSize: 32,
  },
  overallInfo: {},
  overallLabel: {
    fontSize: FONTS.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  overallValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  overallMarks: {
    fontSize: FONTS.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  resultsCard: {
    marginBottom: SPACING.lg,
  },
  resultsTitle: {
    fontSize: FONTS.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: FONTS.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  examType: {
    fontSize: FONTS.sm,
    color: COLORS.text.muted,
    textTransform: 'capitalize',
  },
  resultMarks: {
    alignItems: 'flex-end',
    marginRight: SPACING.md,
  },
  marksText: {
    fontSize: FONTS.md,
    color: COLORS.text.primary,
  },
  percentText: {
    fontSize: FONTS.sm,
    fontWeight: '600',
  },
  gradeCard: {
    marginBottom: SPACING.xxl,
  },
  gradeTitle: {
    fontSize: FONTS.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  gradeItem: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    minWidth: 60,
  },
  gradeValue: {
    fontSize: FONTS.lg,
    fontWeight: 'bold',
  },
  gradeRange: {
    fontSize: FONTS.xs,
    color: COLORS.text.secondary,
  },
});

export default ResultsScreen;
