import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ResultsScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>My Results</Text>
    <Text style={styles.subtitle}>View subject-wise results and grades</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});

export default ResultsScreen;
