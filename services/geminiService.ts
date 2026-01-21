import { GoogleGenAI, Type } from "@google/genai";
import { GOOGLE_FONTS_LIST } from "../constants";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY not found in environment");
  }
  return new GoogleGenAI({ apiKey });
};

export const getFontRecommendations = async (query: string): Promise<{ fonts: string[], reasoning: string }> => {
  try {
    const ai = getClient();
    
    const availableFonts = GOOGLE_FONTS_LIST.map(f => f.family).join(", ");
    
    const prompt = `
      You are a typography expert. The user wants fonts matching this description: "${query}".
      
      Select the best matching fonts from this specific list of available Google Fonts:
      [${availableFonts}]
      
      Return a JSON object with:
      1. "fonts": An array of strings containing exactly the font family names from the list that match the vibe. Aim for a generous selection of 10-20 best matches.
      2. "reasoning": A short, punchy sentence explaining why these fit the vibe.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fonts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            reasoning: { type: Type.STRING }
          },
          required: ["fonts", "reasoning"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if AI fails: just return a random slice
    return {
      fonts: ["Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Inter"],
      reasoning: "AI was temporarily unreachable, so here are some high-quality classics."
    };
  }
};

export const generateSampleText = async (vibe: string): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a single short, punchy, creative sentence (max 10 words) that demonstrates the vibe: "${vibe}". No quotes.`,
    });
    return response.text?.trim() || "The quick brown fox jumps over the lazy dog.";
  } catch (e) {
    return "The quick brown fox jumps over the lazy dog.";
  }
}
