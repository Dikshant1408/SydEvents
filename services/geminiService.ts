import { GoogleGenAI, Type } from "@google/genai";
import { Event } from "../types";

// TypeScript declaration to satisfy the compiler for the global process shim
declare const process: {
  env: {
    API_KEY: string;
  };
};

export const scrapeEvents = async (city: string = "Sydney"): Promise<Partial<Event>[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Gemini API Key is missing.");
    return [];
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `List 5 real, upcoming events in ${city}, Australia. 
      Return them as a JSON array. 
      Include fields: title, dateTime (ISO format), venueName, venueAddress, city, description, category, imageUrl (use https://picsum.photos/seed/[random]/800/600), sourceName, originalUrl.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              dateTime: { type: Type.STRING },
              venueName: { type: Type.STRING },
              venueAddress: { type: Type.STRING },
              city: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              sourceName: { type: Type.STRING },
              originalUrl: { type: Type.STRING },
            },
            required: ["title", "dateTime", "venueName", "city", "description", "originalUrl"],
          },
        },
      },
    });

    const text = response.text;
    return JSON.parse(text || "[]");
  } catch (error) {
    console.error("Scraping error:", error);
    return [];
  }
};

export const getRecommendations = async (userPrompt: string, events: Event[]): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Recommendation service unavailable.";

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const eventContext = events.map(e => `${e.title} at ${e.venueName} on ${e.dateTime}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user wants event recommendations in Sydney.
      Available Events:
      ${eventContext}

      User Prompt: "${userPrompt}"

      Based on the available events and the user's preferences, provide a friendly recommendation. If no events match perfectly, suggest the closest ones. Be concise and helpful.`,
      config: {
        systemInstruction: "You are a helpful Sydney local event expert. You recommend events based on a provided list and user preferences.",
      }
    });

    return response.text || "I couldn't find any specific recommendations right now.";
  } catch (error) {
    console.error("Recommendation error:", error);
    return "I'm having a bit of trouble connecting right now.";
  }
};