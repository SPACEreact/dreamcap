import { pipeline, env } from '@xenova/transformers';
import type { Story, Shot, DirectorVision } from '../types';
import { SHOT_TYPES, CAMERA_ANGLES, CAMERA_MOVEMENTS } from '../constants';

// Configure Transformers.js
env.allowLocalModels = false;
env.allowRemoteModels = true;

// Model loading state
let textGenerator: any = null;
let isLoading = false;
let loadError: string | null = null;

export interface TransformersStatus {
    isReady: boolean;
    isLoading: boolean;
    error: string | null;
    modelName: string;
}

// Initialize the text generation pipeline
export const initializeTransformers = async (
    onProgress?: (progress: { status: string; progress?: number }) => void
): Promise<void> => {
    if (textGenerator) return; // Already initialized
    if (isLoading) return; // Already loading

    isLoading = true;
    loadError = null;

    try {
        onProgress?.({ status: 'Downloading model...', progress: 0 });

        // Use a smaller, faster model for browser usage
        // For v2.17.2: Use LaMini or similar text generation model
        textGenerator = await pipeline(
            'text-generation',
            'Xenova/LaMini-Flan-T5-783M',
            {
                progress_callback: (progress: any) => {
                    if (progress.status === 'progress') {
                        onProgress?.({
                            status: `Downloading ${progress.file}...`,
                            progress: progress.progress
                        });
                    } else if (progress.status === 'ready') {
                        onProgress?.({ status: 'Model ready!', progress: 100 });
                    }
                }
            }
        );

        isLoading = false;
    } catch (error: any) {
        console.error('Failed to initialize Transformers:', error);
        loadError = error.message || 'Failed to load AI model';
        isLoading = false;
        throw error;
    }
};

// Get current status
export const getTransformersStatus = (): TransformersStatus => {
    return {
        isReady: textGenerator !== null && !isLoading,
        isLoading,
        error: loadError,
        modelName: 'LaMini-Flan-T5-783M'
    };
};

// Generate text using the model
const generateText = async (prompt: string, maxTokens: number = 500): Promise<string> => {
    if (!textGenerator) {
        throw new Error('Model not initialized. Call initializeTransformers first.');
    }

    try {
        const result = await textGenerator(prompt, {
            max_new_tokens: maxTokens,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
        });

        return result[0].generated_text.replace(prompt, '').trim();
    } catch (error) {
        console.error('Text generation error:', error);
        throw new Error('Failed to generate text');
    }
};

// Parse JSON from AI response (handles markdown code blocks)
const parseAIResponse = (text: string): any => {
    // Remove markdown code blocks if present
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Try to find JSON object in the text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.warn('Failed to parse JSON from response:', cleaned);
        }
    }

    throw new Error('Invalid JSON response from AI');
};

// Generate shots from script
export const generateShotsFromScript = async (
    script: string,
    directorInstructions: string,
    vision?: DirectorVision
): Promise<{ story: Pick<Story, 'title' | 'logline'>, shots: Shot[] }> => {
    const prompt = `You are a professional cinematographer. Analyze this script and create a shot list.

Script: ${script.substring(0, 1000)}

Director's Instructions: ${directorInstructions}
Vision: ${vision ? `${vision.genre}, ${vision.tone}` : 'Not specified'}

Return ONLY valid JSON in this exact format:
{
  "story": {
    "title": "Brief title",
    "logline": "One sentence summary"
  },
  "shots": [
    {
      "id": "1",
      "description": "Shot description",
      "shotType": "${SHOT_TYPES[0]}",
      "cameraAngle": "${CAMERA_ANGLES[0]}",
      "cameraMovement": "${CAMERA_MOVEMENTS[0]}",
      "visual": "Visual description",
      "audio": "Audio description"
    }
  ]
}

JSON:`;

    try {
        const response = await generateText(prompt, 800);
        const parsed = parseAIResponse(response);

        // Validate and ensure required fields
        if (!parsed.story) {
            parsed.story = { title: 'Untitled', logline: 'A story' };
        }
        if (!Array.isArray(parsed.shots)) {
            parsed.shots = [];
        }

        // Ensure each shot has an ID
        parsed.shots = parsed.shots.map((shot: any, idx: number) => ({
            ...shot,
            id: shot.id || `shot-${idx + 1}`
        }));

        return parsed;
    } catch (error) {
        console.error('Error generating shots with Transformers:', error);
        throw new Error('Failed to generate shots. Please try again.');
    }
};

// Suggest visual styles
export const suggestStylesFromScript = async (script: string): Promise<DirectorVision[]> => {
    const prompt = `Analyze this script and suggest 3 distinct visual styles.

Script: ${script.substring(0, 800)}

Return ONLY valid JSON with 3 style suggestions:
{
  "styles": [
    {
      "genre": "Genre name",
      "tone": "Tone description",
      "colorPalette": "Color palette description",
      "inspirations": "Inspired by..."
    }
  ]
}

JSON:`;

    try {
        const response = await generateText(prompt, 600);
        const parsed = parseAIResponse(response);
        return parsed.styles || [];
    } catch (error) {
        console.error('Error suggesting styles with Transformers:', error);
        return [];
    }
};

// Test if WebGPU is available
export const isWebGPUAvailable = async (): Promise<boolean> => {
    if (typeof navigator === 'undefined') return false;

    try {
        // @ts-ignore - WebGPU types not in standard lib yet
        const adapter = await navigator.gpu?.requestAdapter();
        return !!adapter;
    } catch {
        return false;
    }
};

// Get model info
export const getModelInfo = () => {
    return {
        name: 'LaMini-Flan-T5-783M',
        size: '~300MB',
        provider: 'Transformers.js (v2.17.2)',
        runsLocally: true,
        requiresInternet: 'Only for first download',
        privacy: 'Complete - all processing happens in your browser'
    };
};
