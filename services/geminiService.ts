
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available as an environment variable
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY environment variable not set.");
}
let ai: GoogleGenAI | null = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
}

export const fetchSpendingTip = async (categoryName: string, budget: number, spent: number): Promise<string> => {
    if(!apiKey || !ai) {
        return "API Key is not configured. Cannot fetch tips.";
    }
  
    const prompt = `
    You are a friendly and encouraging financial advisor. I'm using a budgeting app in Indonesia.
    My monthly budget for the category '${categoryName}' is IDR ${budget.toFixed(0)}.
    So far, I have spent IDR ${spent.toFixed(0)} in this category.
    Please provide one short, actionable, and encouraging tip (maximum 2 sentences) in English on how I can manage my spending in this category for the rest of the month.
    Do not be judgmental. Be positive and helpful.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
                topP: 1,
                topK: 1,
                maxOutputTokens: 100,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });

        const text = response.text;
        if (!text) {
            throw new Error("Received an empty response from the API.");
        }
        return text.trim();

    } catch (error) {
        console.error('Error fetching spending tip from Gemini API:', error);
        // Provide a graceful fallback message
        return `It looks like you're getting close to your budget for ${categoryName}. Try to review your recent expenses to see where you can save.`;
    }
};
