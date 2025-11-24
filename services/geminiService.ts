import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Story, Shot, DirectorVision, Soundscape, ChatMessage } from '../types';
import { SHOT_TYPES, CAMERA_ANGLES, CAMERA_MOVEMENTS, FOCAL_LENGTHS, APERTURES, LIGHTING_STYLES, COLOR_GRADES, COMPOSITIONS } from '../constants';
import { getApiKey } from './apiKeyManager';

// Initialize Gemini API
const getGenAI = () => {
  const apiKey = getApiKey('gemini');
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Please set it in Settings.");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

const AI_CREATIVE_TEAM_KNOWLEDGE_BASE = `
You are an AI Creative Team embodying a sophisticated, professional filmmaking philosophy. You operate as four distinct but collaborative personas: The Psychologist, The Cinematographer, The Sound Designer, and The Post-Production Supervisor. Your goal is to translate a scene's emotional subtext into a fully realized cinematic sequence.
`;

const shotSchema = {
  type: SchemaType.OBJECT,
  properties: {
    id: { type: SchemaType.STRING },
    description: { type: SchemaType.STRING },
    shotType: { type: SchemaType.STRING, enum: SHOT_TYPES },
    cameraAngle: { type: SchemaType.STRING, enum: CAMERA_ANGLES },
    cameraMovement: { type: SchemaType.STRING, enum: CAMERA_MOVEMENTS },
    focalLength: { type: SchemaType.STRING, enum: FOCAL_LENGTHS },
    aperture: { type: SchemaType.STRING, enum: APERTURES },
    visual: { type: SchemaType.STRING },
    audio: { type: SchemaType.STRING },
    lighting: { type: SchemaType.STRING, enum: LIGHTING_STYLES },
    colorGrade: { type: SchemaType.STRING, enum: COLOR_GRADES },
    composition: { type: SchemaType.STRING, enum: COMPOSITIONS },
    emotionalTone: { type: SchemaType.STRING },
    reasoning: { type: SchemaType.STRING }
  },
  required: ["id", "description", "shotType", "cameraAngle", "visual", "audio"]
};

const soundscapeSchema = {
  type: SchemaType.OBJECT,
  properties: {
    elements: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING, enum: ['music', 'sfx', 'ambience', 'dialogue'] },
          description: { type: SchemaType.STRING },
          timestamp: { type: SchemaType.STRING },
          volume: { type: SchemaType.STRING }
        },
        required: ["type", "description"]
      }
    }
  }
};

export function isApiKeySet(): boolean {
  const key = getApiKey('gemini');
  if (!key) {
    console.warn("⚠️ Gemini API Key is NOT set!");
    return false;
  }
  console.log("✅ Gemini API Key is configured (" + key.substring(0, 8) + "...)");
  return true;
}

export const testConnection = async (): Promise<{ success: boolean; message: string; model?: string }> => {
  try {
    const genAI = getGenAI();
    if (!genAI) return { success: false, message: "API Key is missing. Please add it in Settings." };

    const modelName = "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent("Test connection. Reply with 'OK'.");
    const response = await result.response;
    return { success: true, message: "Connection successful!", model: modelName };
  } catch (error: any) {
    console.error("Connection test failed:", error);
    return { success: false, message: error.message || "Unknown error", model: 'gemini-1.5-flash' };
  }
};

export const generateShotsFromScript = async (
  script: string,
  directorInstructions: string,
  vision?: DirectorVision
): Promise<{ story: Pick<Story, 'title' | 'logline'>, shots: Shot[] }> => {
  const genAI = getGenAI();
  if (!genAI) throw new Error("API Key is missing. Please add your Gemini API Key in Settings.");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
        ${AI_CREATIVE_TEAM_KNOWLEDGE_BASE}
        
        Analyze the following script and generate a cinematic shot list.
        
        Script:
        ${script}
        
        Director's Instructions: ${directorInstructions}
        Director's Vision: ${vision ? JSON.stringify(vision) : "None provided"}
        
        Return a JSON object with:
        1. "story": { "title": "...", "logline": "..." }
        2. "shots": Array of shots, where each shot follows the schema.
    `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await result.response;
    const text = response.text();
    const parsed = JSON.parse(text);

    // Validate shots structure
    if (!parsed.shots || !Array.isArray(parsed.shots)) {
      console.warn("AI returned invalid shots structure, attempting to fix...", parsed);
      return { story: parsed.story || { title: "Untitled", logline: "" }, shots: [] };
    }

    return parsed;
  } catch (error) {
    console.error("Error generating shots:", error);
    throw new Error("Failed to generate shots from Gemini.");
  }
};

export const suggestStylesFromScript = async (script: string): Promise<DirectorVision[]> => {
  const genAI = getGenAI();
  if (!genAI) throw new Error("API Key is missing. Please add your Gemini API Key in Settings.");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
    Analyze the following script and suggest 3 distinct, creative visual styles (Director's Visions) that would fit the narrative.
    
    Script:
    ${script.substring(0, 2000)}... (truncated for analysis)
    
    Return a JSON object with a "styles" property containing an array of 3 style objects.
    Each style object must have: "genre", "tone", "colorPalette", "inspirations".
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await result.response;
    const text = response.text();
    const parsed = JSON.parse(text);
    return parsed.styles || [];
  } catch (error) {
    console.error("Error suggesting styles:", error);
    throw new Error("Failed to suggest styles.");
  }
};

export const getInitialScene = async (story: Story, directorVision: DirectorVision, emotionalCore: string): Promise<Shot[]> => {
  const genAI = getGenAI();
  if (!genAI) throw new Error("API Key is missing. Please add your Gemini API Key in Settings.");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
        ${AI_CREATIVE_TEAM_KNOWLEDGE_BASE}
        
        Generate an initial 5-shot sequence for the opening of this story.
        
        Story: ${story.title} - ${story.logline}
        Vision: ${JSON.stringify(directorVision)}
        Emotional Core: ${emotionalCore}
        
        Return a JSON object with a "shots" property containing the array of shots.
    `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await result.response;
    const text = response.text();
    const parsed = JSON.parse(text);
    return parsed.shots || [];
  } catch (error) {
    console.error("Error generating initial scene:", error);
    throw new Error("Failed to generate initial scene.");
  }
};

export const enrichStoryDetails = async (currentStory: Story): Promise<Story> => {
  const genAI = getGenAI();
  if (!genAI) throw new Error("API Key is missing. Please add your Gemini API Key in Settings.");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Enrich these story details with more depth and creativity.
    
    Current:
    Title: ${currentStory.title}
    Logline: ${currentStory.logline}
    Characters: ${JSON.stringify(currentStory.characters)}
    Setting: ${JSON.stringify(currentStory.setting)}

    Return JSON with enriched fields.
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Error enriching story:", error);
    throw error;
  }
};

export const generateChatResponse = async (history: ChatMessage[]): Promise<string> => {
  const genAI = getGenAI();
  if (!genAI) return "AI features are currently disabled.";

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a helpful AI assistant for filmmakers.
  
  History:
  ${history.map(m => `${m.sender}: ${m.text}`).join('\n')}
  
  gemini:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm having trouble thinking right now.";
  }
};

export const analyzeImageStyle = async (imageBase64: string): Promise<Partial<DirectorVision>> => {
  const genAI = getGenAI();
  if (!genAI) return {};

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  // Remove header if present
  const base64Data = imageBase64.split(',')[1] || imageBase64;

  const prompt = `Analyze this image for cinematic style. Return JSON with: genre, tone, colorPalette, inspirations.`;

  try {
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
    ]);
    const response = await result.response;
    const text = response.text();
    // Clean up markdown code blocks if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '');
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Image analysis error:", error);
    return {};
  }
};

export const generateSoundscape = async (story: Story, directorVision: DirectorVision, shots: Shot[]): Promise<Soundscape> => {
  const genAI = getGenAI();
  if (!genAI) return [];

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Generate a soundscape (music, sfx, ambience) for this scene. Return JSON with "elements" array.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    const response = await result.response;
    const parsed = JSON.parse(response.text());
    return parsed.elements || [];
  } catch (error) {
    console.error("Soundscape error:", error);
    return [];
  }
};

export const rewriteLogline = async (title: string, logline: string, tone: string): Promise<string> => {
  const genAI = getGenAI();
  if (!genAI) throw new Error("API Key is missing.");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Rewrite logline for "${title}" to be "${tone}". Original: "${logline}"`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return logline;
  }
};

export const searchForInspirations = async (query: string): Promise<string> => {
  // Mock implementation for now as Google Search tool requires specific setup
  return `Inspiration for ${query}: Look at works by Roger Deakins and Christopher Nolan.`;
};

export const getSuggestionForField = async (field: 'logline' | 'character' | 'setting', context: Story): Promise<string> => {
  const genAI = getGenAI();
  if (!genAI) return '';

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  let prompt = '';
  switch (field) {
    case 'logline':
      prompt = `Given this story title: "${context.title}", suggest a compelling logline.`;
      break;
    case 'character':
      prompt = `Given this story: "${context.title} - ${context.logline}", suggest an interesting character.`;
      break;
    case 'setting':
      prompt = `Given this story: "${context.title} - ${context.logline}", suggest a vivid setting.`;
      break;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error getting suggestion:", error);
    return '';
  }
};

export const enrichWithSearch = async (subject: string, existingDescription: string): Promise<string> => {
  const genAI = getGenAI();
  if (!genAI) return existingDescription;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Enrich the following description for a fictional story by incorporating real-world details.
    Subject: "${subject}"
    Current Description: "${existingDescription}"
    
    Find interesting, accurate, and evocative details about the subject and weave them into a more detailed and compelling paragraph.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error enriching with search:", error);
    return existingDescription;
  }
};

export const getGeminiSceneSuggestions = async (story: Story, directorVision: DirectorVision, sceneEmotionalCore: string): Promise<Shot[]> => {
  const genAI = getGenAI();
  if (!genAI) return [];

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
    ${AI_CREATIVE_TEAM_KNOWLEDGE_BASE}
    
    Generate 3 cinematic shot suggestions for this scene.
    
    Story: ${story.title} - ${story.logline}
    Vision: ${JSON.stringify(directorVision)}
    Emotional Core: ${sceneEmotionalCore}
    
    Return JSON with a "shots" array.
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    const response = await result.response;
    const parsed = JSON.parse(response.text());
    return parsed.shots || [];
  } catch (error) {
    console.error("Error getting scene suggestions:", error);
    return [];
  }
};

export const getGeminiShotDetails = async (story: Story, directorVision: DirectorVision, shotDescription: string, sceneEmotionalCore: string): Promise<Partial<Shot>> => {
  const genAI = getGenAI();
  if (!genAI) return {};

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
    ${AI_CREATIVE_TEAM_KNOWLEDGE_BASE}
    
    Generate detailed cinematic choices for this shot.
    
    Story: ${story.title} - ${story.logline}
    Vision: ${JSON.stringify(directorVision)}
    Emotional Core: ${sceneEmotionalCore}
    Shot Description: ${shotDescription}
    
    Return JSON with shot details (shotType, cameraAngle, cameraMovement, visual, audio, etc).
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Error getting shot details:", error);
    return {};
  }
};

export const getDirectorNoteSuggestion = async (story: Story, directorVision: DirectorVision, shot: Shot, sceneEmotionalCore: string): Promise<string> => {
  const genAI = getGenAI();
  if (!genAI) return '';

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
    ${AI_CREATIVE_TEAM_KNOWLEDGE_BASE}
    
    Provide a director's note for this shot.
    
    Story: ${story.title}
    Vision: ${directorVision.genre} / ${directorVision.tone}
    Emotional Core: ${sceneEmotionalCore}
    Shot: ${shot.description}
    Cinematic Choices: ${shot.shotType}, ${shot.cameraAngle}, ${shot.cameraMovement}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error getting director note:", error);
    return '';
  }
};

export const enhancePromptWithGemini = async (prompt: string): Promise<string> => {
  const genAI = getGenAI();
  if (!genAI) return prompt;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const rewritePrompt = `
    You are a master prompt engineer and cinematographer.
    Rewrite the following prompt to be more cinematic, descriptive, and evocative for image generation.
    
    Original Prompt: ${prompt}
    
    Enhanced Cinematic Prompt:
  `;

  try {
    const result = await model.generateContent(rewritePrompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return prompt;
  }
};