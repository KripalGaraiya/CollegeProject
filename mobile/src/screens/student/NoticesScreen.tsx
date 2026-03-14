import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NoticesScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Notices</Text>
    <Text style={styles.subtitle}>View college notices and announcements</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});

export default NoticesScreen;
