import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const evaluateClinicalCase = async (caseDescription: string, specialty: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      You are an expert senior consultant in dentistry, specifically in the field of ${specialty}.
      A colleague has posted the following clinical case description or question:
      
      "${caseDescription}"
      
      Please provide a professional, concise evaluation. 
      Include:
      1. Potential differential diagnoses.
      2. Recommended diagnostic tests (if applicable).
      3. Suggested treatment approaches based on current evidence-based dentistry.
      4. Any red flags or urgent considerations.
      
      Format the response in Markdown. Keep the tone professional and supportive.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Unable to generate evaluation at this time.";
  } catch (error) {
    console.error("Error evaluating case:", error);
    return "An error occurred while contacting the AI consultant service.";
  }
};
