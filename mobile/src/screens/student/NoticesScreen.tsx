import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { noticeAPI } from '../../services/api';
import { Card, Badge, Loading, EmptyState } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { Notice } from '../../types';

const NoticesScreen: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotices();
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
      </View>
      <Text style={styles.noticeTitle}>{item.title}</Text>
      <Text style={styles.noticeDesc}>{item.description}</Text>
      <View style={styles.noticeMeta}>
        <View style={styles.badges}>
          {item.target_roles?.map((role) => (
            <Badge key={role} text={role} variant="info" />
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
      <FlatList
        data={notices}
        renderItem={renderNotice}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        ListEmptyComponent={<EmptyState icon={<Text style={{ fontSize: 48 }}>📢</Text>} title="No notices available" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.lg,
  },
  noticeCard: {
    marginBottom: SPACING.md,
  },
  noticeHeader: {
    marginBottom: SPACING.md,
  },
  noticeIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeEmoji: {
    fontSize: 24,
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
    lineHeight: 22,
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
  noticeDate: {
    fontSize: FONTS.xs,
    color: COLORS.text.muted,
  },
});

export default NoticesScreen;
