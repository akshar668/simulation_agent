import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SimulationConfig, EquipmentType } from "../types";

// Helper to get the AI instance. 
// Uses the API Key from the environment variable.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * GENERATE 3D SIMULATION CONFIG
 * Agent: Industrial Automation Architect
 * Model: gemini-2.5-flash
 * Reasoning: Uses Thinking Config for spatial planning.
 */
export const generateSimulationLayout = async (prompt: string): Promise<SimulationConfig> => {
  const ai = getAI();
  
  const simulationSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the automation concept" },
      description: { type: Type.STRING, description: "Technical description of the process flow and logic" },
      entities: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { 
                type: Type.STRING, 
                enum: [
                    EquipmentType.ROBOT_ARM, 
                    EquipmentType.CONVEYOR, 
                    EquipmentType.AGV, 
                    EquipmentType.CNC_MACHINE, 
                    EquipmentType.STORAGE_RACK
                ] 
            },
            position: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
                description: "Exact [x, y, z] coordinates. y must be 0 for floor items. Grid range: -10 to 10."
            },
            rotation: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
                description: "Rotation in radians [x, y, z]. Use Y-axis rotation (index 1) to align flow. E.g., [0, 1.57, 0] is 90 deg."
            },
            status: { type: Type.STRING, enum: ['idle', 'active'] },
            name: { type: Type.STRING }
          },
          required: ["id", "type", "position", "name", "status"]
        }
      }
    },
    required: ["title", "description", "entities"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `User Query: ${prompt}
    
    Task: Design a 3D industrial layout.
    1. Analyze the user's request to identify necessary equipment.
    2. Plan the spatial arrangement on a 20x20 grid (x: -10 to 10, z: -10 to 10).
    3. Ensure logical process flow (Output of A -> Input of B).
    4. Calculate precise coordinates and rotations to avoid collisions.
    `,
    config: {
        thinkingConfig: { thinkingBudget: 2048 }, // Enable thinking for better spatial reasoning
        systemInstruction: `You are a Senior Industrial Automation Architect. 
        Your goal is to design efficient, collision-free 3D factory layouts.
        
        Rules:
        - Place equipment logically.
        - Conveyors should align with machines.
        - Robots should be placed near the equipment they service.
        - Ensure y=0 for all floor-mounted equipment.
        - Maintain 2-3 unit spacing between distinct clusters to avoid clipping.
        `,
        responseMimeType: "application/json",
        responseSchema: simulationSchema
    }
  });

  if (!response.text) {
      throw new Error("Failed to generate simulation config");
  }

  return JSON.parse(response.text) as SimulationConfig;
};

/**
 * EDIT IMAGE (Nano Banana)
 * Uses gemini-2.5-flash-image to edit images via text prompt.
 */
export const editImageWithGemini = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = getAI();
    
    // Using Nano Banana model as requested for image editing/generation
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType
                    }
                },
                {
                    text: prompt
                }
            ]
        }
    });

    // Iterate to find the image part in the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }

    throw new Error("No image data found in response");
};

/**
 * GENERATE VIDEO (Veo)
 * Uses veo-3.1-fast-generate-preview to animate images.
 */
export const generateVideoWithVeo = async (base64Image: string, mimeType: string): Promise<string> => {
    // IMPORTANT: For Veo, we must ensure the key is selected via the window.aistudio mechanism if available
    // This is handled in the Component before calling this service, but we create a fresh instance here.
    const ai = getAI();

    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        image: {
            imageBytes: base64Image,
            mimeType: mimeType
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p', // Fast preview supports 720p
            aspectRatio: '16:9'
        }
    });

    // Polling loop
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!videoUri) {
        throw new Error("Video generation failed or returned no URI");
    }

    // We need to fetch the actual video bytes using the API key
    // Note: In a real browser environment, we return the URI with the key appended so the video tag can load it,
    // or fetch it as a blob. Here we'll return the URL with the key appended for direct src usage.
    
    return `${videoUri}&key=${process.env.API_KEY}`;
};