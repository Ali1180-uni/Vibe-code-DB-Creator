import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { DatabaseDialect } from "../types";

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

// Helper to get API key (env or local storage)
const getApiKey = (): string | null => {
  return process.env.API_KEY || localStorage.getItem('gemini_api_key') || null;
};

// Initialize the chat session
export const initChat = async (): Promise<void> => {
  const apiKey = getApiKey();
  if (!apiKey) return;

  try {
    genAI = new GoogleGenAI({ apiKey });
    chatSession = genAI.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are VisionDB, an expert Database Architect and SQL Consultant. 
        You are embedded in a web app that converts ERD diagrams to SQL.
        The user has just uploaded a diagram and generated SQL.
        Your goal is to help them refine, optimize, and debug their SQL schema.
        Be concise, technical, and helpful. Use markdown for code blocks.`,
      },
    });
  } catch (error) {
    console.warn("Failed to initialize Gemini chat:", error);
    chatSession = null;
  }
};

export const updateApiKey = (key: string) => {
  if (key) {
    genAI = new GoogleGenAI({ apiKey: key });
    initChat();
  }
};

export const sendMessageToGemini = async (text: string): Promise<string> => {
  if (!chatSession) {
    // Mock Fallback if no API key or init failed
    await new Promise(resolve => setTimeout(resolve, 1000));
    return "I'm currently in demo mode (no API key detected). In a live environment, I would analyze your request using Gemini 2.5 Flash and provide specific schema optimizations based on your input!";
  }

  try {
    const result: GenerateContentResponse = await chatSession.sendMessage({ message: text });
    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error communicating with the AI service. Please check your API Key.";
  }
};

// Mock function for initial analysis simulation
export const convertImageToSqlMock = async (imageFile: File): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 2000));
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Real Generation Function for SQL
export const generateSqlFromImage = async (
  imageFile: File, 
  dialect: DatabaseDialect, 
  isEnhanced: boolean
): Promise<string | null> => {
  const apiKey = getApiKey();
  
  // If no API key, return null to signal the app to use mock data
  if (!apiKey) {
    return null;
  }

  try {
    if (!genAI) genAI = new GoogleGenAI({ apiKey });

    const base64Data = await fileToBase64(imageFile);

    const promptText = isEnhanced
      ? `Analyze this database diagram image. Return ONLY the production-ready, optimized ${dialect} code to create this schema. 
         Apply 'Nano Banana' mode: Normalize tables, ensure all foreign keys are defined, add appropriate indexes, and use consistent naming conventions.
         Do not include markdown backticks or explanations, just the code.`
      : `Analyze this database diagram image. Return ONLY the raw ${dialect} code that exactly matches the diagram. 
         Do not add optimizations. Do not include markdown backticks or explanations, just the code.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Data
            }
          },
          {
            text: promptText
          }
        ]
      }
    });

    // Clean up response (remove markdown if model adds it despite instructions)
    let text = response.text || '';
    text = text.replace(/```sql/g, '').replace(/```/g, '').trim();
    
    return text;
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return `/* Error generating code with Gemini API: ${error instanceof Error ? error.message : 'Unknown error'} */`;
  }
};

// Generate Enhanced Diagram Image
export const generateEnhancedDiagram = async (imageFile: File): Promise<string | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    if (!genAI) genAI = new GoogleGenAI({ apiKey });

    const base64Data = await fileToBase64(imageFile);

    // Call Gemini to edit/generate image
    // Using gemini-2.5-flash-image which supports image input + prompt
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Data
            }
          },
          {
            text: 'Transform this hand-drawn database diagram into a clean, professional, high-resolution digital ERD diagram. Use a modern color scheme with teal and dark blue. Ensure text labels are legible. Style: Minimalist Tech Diagram.'
          }
        ]
      }
    });

    // Iterate through parts to find the image
    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Gemini Image Enhancement Error:", error);
    // Return null to trigger fallback
    return null;
  }
};
