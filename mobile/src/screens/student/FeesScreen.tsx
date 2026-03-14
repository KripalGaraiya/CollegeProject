import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FeesScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Fee Status</Text>
    <Text style={styles.subtitle}>View fee breakdown and payment status</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});

export default FeesScreen;
