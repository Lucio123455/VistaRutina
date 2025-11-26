import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WorkoutPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert blob to base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:audio/wav;base64,")
      const base64Data = base64String.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Transcribes audio using Gemini Flash.
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const base64Audio = await blobToBase64(audioBlob);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioBlob.type || "audio/wav",
              data: base64Audio,
            },
          },
          {
            text: "Transcribe the audio exactly as spoken. Return only the text.",
          },
        ],
      },
    });

    return response.text || "";
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio.");
  }
};

/**
 * Modifies the workout routine based on a user's request (text).
 * Returns the new JSON structure.
 */
export const modifyRoutineWithGemini = async (
  currentRoutine: WorkoutPlan,
  userRequest: string
): Promise<WorkoutPlan> => {
  try {
    const responseSchema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING },
          title: { type: Type.STRING },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                sets: { type: Type.INTEGER },
                reps: { type: Type.STRING },
              },
              required: ["name", "sets", "reps"],
            },
          },
        },
        required: ["day", "title", "exercises"],
      },
    };

    const prompt = `
      You are an expert fitness coach. 
      Here is the current workout plan in JSON:
      ${JSON.stringify(currentRoutine)}

      The user wants to modify this plan: "${userRequest}"

      Please generate a NEW JSON response representing the updated workout plan.
      Keep the structure exactly the same. 
      Maintain the Spanish language for the content.
      Be creative but safe with the exercises.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from Gemini");
    
    return JSON.parse(jsonText) as WorkoutPlan;

  } catch (error) {
    console.error("Routine modification error:", error);
    throw new Error("Failed to update routine.");
  }
};