
import { GoogleGenAI } from "@google/genai";

// Use direct process.env.API_KEY and named parameter for initialization
export async function getCoffeeInsights(origin: string, roaster: string, notes: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Basado en el origen "${origin}", el tostador "${roaster}" y las notas del usuario "${notes}", genera un breve párrafo (máximo 150 caracteres) con una recomendación de preparación o un dato curioso sobre ese perfil de sabor.`,
      config: {
        // Use systemInstruction for the persona as recommended in the guidelines
        systemInstruction: "Actúa como un catador de café profesional.",
        temperature: 0.7,
      }
    });
    
    // Access response.text directly as a property (not a method)
    return response.text;
  } catch (error) {
    console.error("Error generating coffee insights:", error);
    return null;
  }
}
