import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { exportHealthDataAsJSON, exportHealthDataAsText, clearAllData } from '../services/exportService';
export default function SettingsScreen() {
  const [isExporting, setIsExporting] = useState(false);
  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      await exportHealthDataAsJSON();
      Alert.alert('Success', 'Your health data has been exported as JSON');
    } catch (error) {
      Alert.alert('Error', 'Failed to export data: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };
  const handleExportText = async () => {
    setIsExporting(true);
    try {
      await exportHealthDataAsText();
      Alert.alert('Success', 'Your health report has been exported');
    } catch (error) {
      Alert.alert('Error', 'Failed to export report: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all your health data? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data: ' + error.message);
            }
          }
        }
      ]
    );
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Privacy & Data</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Data Privacy</Text>
          <Text style={styles.description}>
            🔒 All your health data is stored locally on your device. Nothing is sent to the cloud.
            No servers. No tracking. Complete privacy.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Your Data</Text>
          <Text style={styles.description}>
            Share your health data with your doctor or keep a backup.
          </Text>
          
          <View style={styles.buttonGroup}>
            <Button
              title="Export as JSON (Technical)"
              onPress={handleExportJSON}
              disabled={isExporting}
            />
            <Button
              title="Export as Text Report (Readable)"
              onPress={handleExportText}
              disabled={isExporting}
              color="#2196F3"
            />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <Text style={styles.description}>
            Clear all your stored health data from this device.
          </Text>
          
          <Button
            title="Clear All Data"
            onPress={handleClearData}
            color="#f44336"
          />
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How Your Data is Stored:</Text>
          <Text style={styles.infoText}>• Symptom logs: Local device storage</Text>
          <Text style={styles.infoText}>• Blood work analysis: Local device storage</Text>
          <Text style={styles.infoText}>• AI responses: Generated on-device, not saved</Text>
          <Text style={styles.infoText}>• Images: Stored locally, never uploaded</Text>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  buttonGroup: {
    gap: 10,
  },
  infoSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2e7d32',
  },
  infoText: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 5,
  },
});