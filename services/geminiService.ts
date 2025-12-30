import { GoogleGenAI } from "@google/genai";

/**
 * Generates a chat response using Gemini API.
 * Fix: Changed history parts type from tuple to array to resolve TypeScript error in ChatDetail.tsx
 */
export const generateChatResponse = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  newMessage: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are a helpful, friendly, and concise AI assistant integrated into a futuristic social home media app called Oja-odan. Keep your responses short, casual, and engaging, like a text message friend.",
      },
      history: history,
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I'm having trouble connecting right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't process that ask Mightyben or try again later.";
  }
};

/**
 * Generates smart replies based on a message context.
 */
export const generateSmartReplies = async (context: string): Promise<string[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate 3 short, relevant, and casual text message replies (max 5 words each) to the following message: "${context}". Return them as a JSON array of strings.`,
            config: {
                responseMimeType: 'application/json'
            }
        });
        const text = response.text;
        if (!text) return [];
        return JSON.parse(text) as string[];
    } catch (e) {
        console.error("Smart reply error", e);
        return [];
    }
}