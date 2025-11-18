import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem } from '../types';

const API_KEY = process.env.API_KEY;

// Conditionally initialize the AI client to prevent errors if API_KEY is missing.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

if (!ai) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

export const analyzeInventory = async (inventory: InventoryItem[]): Promise<string> => {
  if (!ai) {
    return Promise.resolve("AI features are disabled because the API key is not configured.");
  }

  if (inventory.length === 0) {
    return Promise.resolve("There are no items in the inventory to analyze.");
  }

  const inventoryDataString = inventory
    .map(
      (item) =>
      `- ${item.name} (SKU: ${item.sku}): ${item.quantity} units, Category: ${item.category}, Type: ${item.type}`
    )
    .join('\n');

  const prompt = `
    Analyze the following inventory data for a small business. Provide actionable insights in markdown format.

    Current Inventory:
    ${inventoryDataString}

    Please provide the following:
    1.  **Overall Summary:** A brief overview of the inventory status.
    2.  **Low Stock Alert:** Identify items with quantities of 10 or less that may need reordering soon.
    3.  **High Stock Warning:** Identify items with quantities over 100 that might be overstocked.
    4.  **Category Breakdown:** Briefly summarize the stock distribution across different categories.
    5.  **Actionable Recommendations:** Suggest one or two key actions the business owner should consider based on this data (e.g., "Consider a promotion for [high-stock item]" or "Prioritize reordering [low-stock raw material]").
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return 'An error occurred while analyzing the inventory. Please check the console for details.';
  }
};


export const suggestBOM = async (
  finishedGoodName: string,
  rawMaterials: InventoryItem[]
): Promise<{ rawMaterialName: string; quantity: number }[]> => {
  if (!ai) {
    throw new Error("AI features are disabled because the API key is not configured.");
  }
  if (rawMaterials.length === 0) {
    return [];
  }

  const rawMaterialNames = rawMaterials.map(rm => rm.name).join(', ');

  const prompt = `
    As a manufacturing expert for small-batch artisanal products, create a plausible recipe (Bill of Materials) for creating ONE unit of "${finishedGoodName}".
    
    You MUST ONLY use ingredients from the following list of available raw materials:
    [${rawMaterialNames}]

    - Your response must be a JSON object.
    - Select 2 to 5 of the most relevant raw materials from the list.
    - Assign a small, reasonable quantity (e.g., between 0.01 and 1) for each selected material needed to make one unit of the finished good.
    - Do not invent new materials. If no materials from the list seem relevant, return an empty list of components.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            components: {
              type: Type.ARRAY,
              description: "A list of raw materials and quantities for the recipe.",
              items: {
                type: Type.OBJECT,
                properties: {
                  rawMaterialName: {
                    type: Type.STRING,
                    description: "The name of the raw material, exactly as provided in the list.",
                  },
                  quantity: {
                    type: Type.NUMBER,
                    description: "The quantity of the raw material needed for one unit of the finished good.",
                  },
                },
                required: ["rawMaterialName", "quantity"],
              },
            },
          },
        },
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      console.warn("Gemini API returned an empty response for BOM suggestion.");
      return [];
    }

    const result = JSON.parse(jsonText);
    return result.components || [];

  } catch (error) {
    console.error('Error calling Gemini API for BOM suggestion:', error);
    throw new Error('Failed to get recipe suggestion from AI.');
  }
};
