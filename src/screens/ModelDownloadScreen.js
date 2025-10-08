import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { downloadModelIfNeeded, addDownloadListener, removeDownloadListener, isModelReady } from '../services/gemmaService';

export default function ModelDownloadScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    checkModel();
  }, []);

  const checkModel = async () => {
    const ready = await isModelReady();
    setModelReady(ready);
    if (ready && onComplete) {
      onComplete();
    }
  };

  const startDownload = async () => {
    setIsDownloading(true);
    setError(null);

    const progressListener = (p) => {
      setProgress(p);
    };

    addDownloadListener(progressListener);

    try {
      await downloadModelIfNeeded();
      setModelReady(true);
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      setError('Failed to download model: ' + err.message);
      console.error(err);
    } finally {
      removeDownloadListener(progressListener);
      setIsDownloading(false);
    }
  };

  if (modelReady) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>✓ Ready to Go!</Text>
        <Text style={styles.description}>AI model is installed and ready.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Medical AI Assistant</Text>
      
      {!isDownloading && !error && (
        <>
          <Text style={styles.description}>
            This app needs to download the Gemma AI model (~3GB) to work offline.
            {'\n\n'}
            ⚠️ Please connect to WiFi before downloading.
            {'\n\n'}
            This is a one-time download. The model will stay on your device.
          </Text>
          <Button title="Download AI Model (3GB)" onPress={startDownload} />
        </>
      )}

      {isDownloading && (
        <>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.progressText}>
            Downloading: {Math.round(progress * 100)}%
          </Text>
          <Text style={styles.sizeText}>
            {Math.round(progress * 3000)} MB / 3000 MB
          </Text>
        </>
      )}

      {error && (
        <>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Try Again" onPress={startDownload} color="#f44336" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    color: '#666',
  },
  progressText: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: 'bold',
  },
  sizeText: {
    fontSize: 14,
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginBottom: 20,
    textAlign: 'center',
  },
});