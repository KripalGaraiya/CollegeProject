import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AttendanceScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Mark Attendance</Text>
    <Text style={styles.subtitle}>Implement attendance marking interface</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});

export default AttendanceScreen;
