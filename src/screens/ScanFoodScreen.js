import { Camera, CameraView } from 'expo-camera';
import { useState } from 'react';
import { askGemma } from '../services/gemmaService';
export default function ScanFoodScreen() {
const [hasPermission, setHasPermission] = useState(null);
const [imageUri, setImageUri] = useState(null);
const [analysis, setAnalysis] = useState('');
const takePicture = async (cameraRef) => {
const photo = await cameraRef.takePictureAsync({ base64: true });
setImageUri(photo.uri);
const healthContext = `I have diabetes (A1C was 12.4, now 6.3). I am following a ketogenic diet and intermittent fasting. I need to avoid sugars and carbs.`;
const prompt = `Analyze this food label image. List all ingredients that could spike my blood sugar. Explain why each is problematic. Give me a simple yes/no: should I eat this?`;
const result = await askGemma(prompt, healthContext);
setAnalysis(result);
};
return (
<CameraView ref={(ref) => (cameraRef = ref)}>
<Button title="Scan Label" onPress={() => takePicture(cameraRef)} />
{analysis && <Text>{analysis}</Text>}
</CameraView>
);
}