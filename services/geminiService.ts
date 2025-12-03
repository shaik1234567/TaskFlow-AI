import { GoogleGenAI, Type } from "@google/genai";
import { TaskPriority, TaskStatus } from "../types";

// Initialize Gemini
// Note: In a real backend architecture, this key would be on the server.
// For this client-side demo, we use the env variable directly.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const geminiService = {
  /**
   * Generates a broken-down list of tasks based on a high-level goal.
   */
  async generateSubtasks(goal: string): Promise<Array<{ title: string; description: string; priority: TaskPriority }>> {
    if (!apiKey) {
      console.warn("No API Key provided for Gemini");
      return [];
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Break down the following goal into 3-5 specific, actionable tasks for a project management dashboard. Goal: "${goal}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Short title of the task" },
                description: { type: Type.STRING, description: "Detailed description" },
                priority: { type: Type.STRING, enum: [TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW] }
              },
              required: ["title", "description", "priority"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) return [];
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  },

  /**
   * Suggests priority and refinement for a task description.
   */
  async analyzeTask(description: string): Promise<{ priority: TaskPriority; refinedDescription: string }> {
    if (!apiKey) return { priority: TaskPriority.MEDIUM, refinedDescription: description };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze this task description. Suggest a priority level and a more professional, concise description. Description: "${description}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        priority: { type: Type.STRING, enum: [TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW] },
                        refinedDescription: { type: Type.STRING }
                    },
                    required: ["priority", "refinedDescription"]
                }
            }
        });

        const text = response.text;
        if(!text) throw new Error("No response from AI");
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Analysis Error", error);
        return { priority: TaskPriority.MEDIUM, refinedDescription: description };
    }
  }
};