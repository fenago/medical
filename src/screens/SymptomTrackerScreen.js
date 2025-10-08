import AsyncStorage from '@react-native-async-storage/async-storage';
import { askGemma } from '../services/gemmaService';
const analyzeWeeklyPatterns = async () => {
const logs = await AsyncStorage.getItem('symptomLogs');
const parsedLogs = JSON.parse(logs || '[]');
const prompt = `Here are my daily symptom logs for the past week: ${JSON.stringify(parsedLogs)}. What patterns do you see? Are any symptoms correlating with specific foods or activities? What should I investigate further?`;
const insights = await askGemma(prompt);
return insights;
};