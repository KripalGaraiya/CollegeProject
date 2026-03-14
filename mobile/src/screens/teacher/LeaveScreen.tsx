import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LeaveScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Apply Leave</Text>
    <Text style={styles.subtitle}>Implement leave application interface</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});

export default LeaveScreen;
