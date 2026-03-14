import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TeachersScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Teachers Management</Text>
    <Text style={styles.subtitle}>Implement teacher list with availability status</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});

export default TeachersScreen;
