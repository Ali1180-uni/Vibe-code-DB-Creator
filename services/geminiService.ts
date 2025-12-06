import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";

// Helper to check if API key is present
const hasApiKey = (): boolean => !!process.env.API_KEY;

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

// Initialize the chat session
export const initChat = async (): Promise<void> => {
  if (!hasApiKey()) return;

  try {
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    return "Sorry, I encountered an error communicating with the AI service.";
  }
};

// Mock function for image to SQL conversion as per requirements
export const convertImageToSqlMock = async (imageFile: File): Promise<void> => {
    // This is a pure mock as requested by the prompt for the demo
    // In a real app, this would use gemini-2.5-flash-image to analyze the base64 image
    return new Promise((resolve) => setTimeout(resolve, 2000));
};
