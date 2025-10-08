import React, { useState } from 'react';
import { View, Text, Button, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { askGemma } from '../services/gemmaService';

export default function BloodWorkAnalyzerScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  let cameraRef = null;

  // Request camera permissions
  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Take a picture of blood work
  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({ 
          base64: true,
          quality: 0.8 
        });
        setImageUri(photo.uri);
        setShowCamera(false);
        await analyzeBloodWork(photo.base64);
      } catch (error) {
        Alert.alert('Error', 'Failed to capture image');
        console.error(error);
      }
    }
  };

  // Analyze blood work with Gemma
  const analyzeBloodWork = async (imageBase64) => {
    setIsAnalyzing(true);
    try {
      // Retrieve previous blood work results from storage
      const previousResultsJson = await AsyncStorage.getItem('previousBloodWork');
      const previousResults = previousResultsJson ? JSON.parse(previousResultsJson) : null;

      // Create the analysis prompt
      const prompt = `This is a blood test result image. Extract the key values: glucose, A1C, liver enzymes (ALT, AST), kidney function (creatinine, eGFR, BUN), cholesterol (total, LDL, HDL, triglycerides). ${
        previousResults 
          ? `Compare them to these previous results: ${JSON.stringify(previousResults)}. What trends concern you?` 
          : 'This is the first blood work result.'
      } What do these numbers tell you about my metabolic health? Highlight any values outside normal ranges.`;

      const analysisResult = await askGemma(prompt);
      setAnalysis(analysisResult);

      // Save current results for future comparison
      const timestamp = new Date().toISOString();
      const currentResults = {
        timestamp,
        analysis: analysisResult,
        imageUri: imageUri
      };
      
      // Store in history
      const historyJson = await AsyncStorage.getItem('bloodWorkHistory');
      const history = historyJson ? JSON.parse(historyJson) : [];
      history.push(currentResults);
      await AsyncStorage.setItem('bloodWorkHistory', JSON.stringify(history));
      
      // Update previous results for next comparison
      await AsyncStorage.setItem('previousBloodWork', JSON.stringify(currentResults));

    } catch (error) {
      Alert.alert('Error', 'Failed to analyze blood work');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // View blood work history
  const viewHistory = async () => {
    try {
      const historyJson = await AsyncStorage.getItem('bloodWorkHistory');
      const history = historyJson ? JSON.parse(historyJson) : [];
      
      if (history.length === 0) {
        Alert.alert('No History', 'You haven\'t analyzed any blood work yet.');
        return;
      }

      // Format history for display
      const historyText = history.map((item, index) => 
        `\n--- Test ${index + 1} (${new Date(item.timestamp).toLocaleDateString()}) ---\n${item.analysis}`
      ).join('\n');

      setAnalysis(historyText);
    } catch (error) {
      Alert.alert('Error', 'Failed to load history');
      console.error(error);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  if (showCamera) {
    return (
      <View style={styles.container}>
        <CameraView 
          style={styles.camera}
          ref={(ref) => { cameraRef = ref; }}
        >
          <View style={styles.buttonContainer}>
            <Button title="Capture Blood Work" onPress={takePicture} />
            <Button title="Cancel" onPress={() => setShowCamera(false)} color="red" />
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Blood Work Analyzer</Text>
        
        <View style={styles.buttonGroup}>
          <Button 
            title="Take Photo of Lab Results" 
            onPress={() => setShowCamera(true)} 
          />
          <Button 
            title="View History" 
            onPress={viewHistory}
            color="#666"
          />
        </View>

        {imageUri && (
          <View style={styles.imageContainer}>
            <Text style={styles.sectionTitle}>Captured Image:</Text>
            <Image source={{ uri: imageUri }} style={styles.image} />
          </View>
        )}

        {isAnalyzing && (
          <View style={styles.loadingContainer}>
            <Text>Analyzing blood work with Gemma AI...</Text>
          </View>
        )}

        {analysis && !isAnalyzing && (
          <View style={styles.analysisContainer}>
            <Text style={styles.sectionTitle}>Analysis:</Text>
            <Text style={styles.analysisText}>{analysis}</Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            💡 Tip: Take a clear, well-lit photo of your lab results. 
            The AI will extract values and compare them to previous tests.
          </Text>
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
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonGroup: {
    gap: 10,
    marginBottom: 20,
  },
  imageContainer: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  analysisContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  analysisText: {
    fontSize: 14,
    lineHeight: 22,
  },
  infoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1976d2',
  },
});