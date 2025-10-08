import { LlmInference } from 'expo-llm-mediapipe';
import * as FileSystem from 'expo-file-system';

// Model will be downloaded from Hugging Face on first launch
const MODEL_URL = 'https://huggingface.co/google/gemma-3n-E2B-it-litert-preview/resolve/main/gemma-3n-E2B-it-int4.task';
const MODEL_PATH = FileSystem.documentDirectory + 'gemma-model.task';

let llmInstance = null;
let downloadProgress = 0;
let downloadListeners = [];

// Add listener for download progress
export const addDownloadListener = (listener) => {
  downloadListeners.push(listener);
};

// Remove listener
export const removeDownloadListener = (listener) => {
  downloadListeners = downloadListeners.filter(l => l !== listener);
};

// Notify all listeners of progress
const notifyListeners = (progress) => {
  downloadProgress = progress;
  downloadListeners.forEach(listener => listener(progress));
};

// Check if model exists, download if needed
export const downloadModelIfNeeded = async () => {
  const fileInfo = await FileSystem.getInfoAsync(MODEL_PATH);
  
  if (!fileInfo.exists) {
    console.log('Model not found, downloading...');
    
    const downloadResumable = FileSystem.createDownloadResumable(
      MODEL_URL,
      MODEL_PATH,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        notifyListeners(progress);
      }
    );
    
    await downloadResumable.downloadAsync();
    console.log('Model download complete');
    notifyListeners(1);
  } else {
    console.log('Model already exists');
    notifyListeners(1);
  }
};

// Initialize Gemma (downloads model if needed)
export const initializeGemma = async () => {
  if (!llmInstance) {
    // Ensure model is downloaded
    await downloadModelIfNeeded();
    
    // Initialize LLM
    llmInstance = await LlmInference.createFromOptions(MODEL_PATH, {
      maxTokens: 512,
      temperature: 0.7,
      topK: 40
    });
  }
  return llmInstance;
};

// Ask Gemma a question
export const askGemma = async (prompt, context = '') => {
  const llm = await initializeGemma();
  const fullPrompt = context ? `${context}\n\nUser: ${prompt}` : prompt;
  const response = await llm.generateResponse(fullPrompt);
  return response.text;
};

// Get current download progress (0 to 1)
export const getDownloadProgress = () => {
  return downloadProgress;
};

// Check if model is ready
export const isModelReady = async () => {
  const fileInfo = await FileSystem.getInfoAsync(MODEL_PATH);
  return fileInfo.exists;
};