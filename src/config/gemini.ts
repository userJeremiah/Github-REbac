import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || 'mock_key';
const genAI = new GoogleGenerativeAI(apiKey);

// Using Gemini 2.0 Flash - Latest and fastest model
export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp'
});

export async function generateContent(prompt: string): Promise<string> {
  try {
    console.log('🔍 Gemini API Key present:', !!process.env.GEMINI_API_KEY);
    console.log('🔍 API Key starts with:', process.env.GEMINI_API_KEY?.substring(0, 10));
    
    // Check if using mock key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_key_here') {
      console.log('⚠️  Gemini API not configured - returning mock response');
      return `[MOCK AI RESPONSE]\n\nThis is a simulated AI response. To get real AI-powered features:\n1. Get API key from https://aistudio.google.com/app/apikey\n2. Set GEMINI_API_KEY in .env\n3. Restart the server\n\nPrompt received: ${prompt.substring(0, 100)}...`;
    }
    
    console.log('✅ Calling Gemini API...');
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log('✅ Gemini response received');
    return text;
  } catch (error: any) {
    console.error('Gemini error:', error.message);
    return `[AI ERROR]\n\nFailed to generate AI response: ${error.message}\n\nPlease check your GEMINI_API_KEY configuration.`;
  }
}
