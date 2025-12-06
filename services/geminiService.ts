import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { DatabaseDialect } from "../types";

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

// Helper to get API key (env or local storage)
const getApiKey = (): string | null => {
  return process.env.API_KEY || localStorage.getItem('gemini_api_key') || null;
};

// Initialize the chat session
export const initChat = async (): Promise<boolean> => {
  const apiKey = getApiKey();
  if (!apiKey) return false;

  try {
    genAI = new GoogleGenAI({ apiKey });
    chatSession = genAI.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are the intelligent assistant for "VisionDB Architect", a professional tool that converts ERD images into code. 
        Your Capabilities: You can convert diagrams into PostgreSQL, MySQL, MongoDB (Mongoose), and Prisma. 
        Your Goal: Guide the user to select the right database. If they have a relational diagram, suggest SQL. If they have unstructured data, suggest MongoDB. 
        Context: The user has uploaded a diagram. You are here to critique it and help generate the code.`,
      },
    });
    return true;
  } catch (error) {
    console.warn("Failed to initialize Gemini chat:", error);
    chatSession = null;
    return false;
  }
};

export const updateApiKey = (key: string) => {
  if (key) {
    localStorage.setItem('gemini_api_key', key);
    genAI = new GoogleGenAI({ apiKey: key });
    initChat();
  } else {
    localStorage.removeItem('gemini_api_key');
    genAI = null;
    chatSession = null;
  }
};

export const sendMessageToGemini = async (text: string): Promise<string> => {
  if (!chatSession) {
    return "Please configure your API Key in settings to chat with the AI Architect.";
  }

  try {
    const result: GenerateContentResponse = await chatSession.sendMessage({ message: text });
    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error communicating with the AI service. Please check your API Key.";
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Initial Analysis Prompt
export const analyzeDiagram = async (imageFile: File): Promise<void> => {
    // This function is effectively a no-op in the real version 
    // because we do the real work in generateSqlFromImage.
    // However, to check if the key works, we can do a lightweight check.
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("No API Key");
    if (!genAI) genAI = new GoogleGenAI({ apiKey });
    return; 
};

// Real Generation Function for SQL/NoSQL
export const generateSqlFromImage = async (
  imageFile: File, 
  dialect: DatabaseDialect, 
  isEnhanced: boolean
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Missing API Key");

  if (!genAI) genAI = new GoogleGenAI({ apiKey });

  const base64Data = await fileToBase64(imageFile);

  let promptText = "";

  if (dialect === 'MongoDB') {
    promptText = `Act as a Senior Backend Developer. Convert this ERD diagram into a production-ready Mongoose Schema (Node.js).
    Use new Schema({}) syntax.
    Include specific types (e.g., mongoose.Schema.Types.ObjectId).
    Add validation (required: true, enum, min/max).
    Do not just write JSON; write the full JS/TS code export.
    Return ONLY the code. Do not include markdown backticks.`;
  } else if (dialect === 'Prisma') {
    promptText = `Act as a Senior Backend Developer. Convert this ERD diagram into a valid schema.prisma file.
    Include models, relationships (@relation), and enums.
    Return ONLY the code. Do not include markdown backticks.`;
  } else {
    // Standard SQL Dialects
    promptText = isEnhanced
    ? `Analyze this database diagram image. Return ONLY the production-ready, optimized ${dialect} code to create this schema. 
       Apply 'Nano Banana' mode: Normalize tables, ensure all foreign keys are defined, add appropriate indexes, and use consistent naming conventions.
       Do not include markdown backticks or explanations, just the code.`
    : `Analyze this database diagram image. Return ONLY the raw ${dialect} code that exactly matches the diagram. 
       Do not add optimizations. Do not include markdown backticks or explanations, just the code.`;
  }

  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: imageFile.type, data: base64Data } },
        { text: promptText }
      ]
    }
  });

  let text = response.text || '';
  text = text.replace(/```sql/g, '').replace(/```json/g, '').replace(/```javascript/g, '').replace(/```typescript/g, '').replace(/```prisma/g, '').replace(/```/g, '').trim();
  
  return text;
};

// Real Image Generation (High Fidelity)
export const generateEnhancedDiagram = async (imageFile: File): Promise<string | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  if (!genAI) genAI = new GoogleGenAI({ apiKey });
  const base64Data = await fileToBase64(imageFile);

  // Refined Prompt for better structural preservation and normalization
  const prompt = `
    Transform this hand-drawn or rough database diagram into a professional, high-fidelity Entity Relationship Diagram (ERD).
    
    1. **Structure Preservation**: You MUST preserve the core logic, entities, and relationships from the original image. Do not invent unrelated tables.
    2. **Normalization**: Apply standard normalization. Ensure every table has a Primary Key (PK) clearly marked. If you detect direct Many-to-Many relationships, resolve them with an intermediate junction table. Use consistent field naming (snake_case).
    3. **Visual Style**: Use a clean, minimalist technical style with a white background. Use Crow's Foot notation for relationships. Ensure all text, lines, and cardinality markers are sharp and legible.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-image', // Real model
      contents: {
        parts: [
          { inlineData: { mimeType: imageFile.type, data: base64Data } },
          { text: prompt }
        ]
      }
    });

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (error) {
    console.warn("Image generation failed (likely safety filter or permission).", error);
    // Return null to signal graceful degradation
    return null;
  }
  return null;
};