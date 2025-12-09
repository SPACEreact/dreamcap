import * as geminiService from './geminiService';
import * as transformersService from './transformersService';
import type { Story, Shot, DirectorVision } from '../types';
import { getApiKey } from './apiKeyManager';

export type AIProvider = 'gemini' | 'transformers' | 'auto';

let currentProvider: AIProvider = 'auto';
let lastUsedProvider: 'gemini' | 'transformers' | null = null;

// Set preferred AI provider
export const setAIProvider = (provider: AIProvider) => {
    currentProvider = provider;
    console.log(`AI Provider set to: ${provider}`);
};

// Get current provider
export const getAIProvider = (): AIProvider => currentProvider;

// Get last actually used provider
export const getLastUsedProvider = () => lastUsedProvider;

// Check which provider should be used
const determineProvider = async (): Promise<'gemini' | 'transformers'> => {
    // If explicitly set, use that
    if (currentProvider === 'gemini') {
        const hasKey = geminiService.isApiKeySet();
        if (!hasKey) {
            console.warn('Gemini selected but no API key found, falling back to Transformers');
            return 'transformers';
        }
        return 'gemini';
    }

    if (currentProvider === 'transformers') {
        return 'transformers';
    }

    // Auto mode: prefer Transformers (free), fallback to Gemini if available
    const hasGeminiKey = geminiService.isApiKeySet();
    const transformersStatus = transformersService.getTransformersStatus();

    // If Transformers is ready, use it
    if (transformersStatus.isReady) {
        return 'transformers';
    }

    // If Transformers is not loaded but Gemini has a key, use Gemini
    if (hasGeminiKey && !transformersStatus.isReady) {
        return 'gemini';
    }

    // Default to Transformers (will auto-load on first use)
    return 'transformers';
};

// Initialize Transformers if needed
export const initializeAI = async (
    onProgress?: (progress: { status: string; progress?: number }) => void
): Promise<void> => {
    const provider = await determineProvider();

    if (provider === 'transformers') {
        const status = transformersService.getTransformersStatus();
        if (!status.isReady && !status.isLoading) {
            await transformersService.initializeTransformers(onProgress);
        }
    }
};

// Test connection for current provider
export const testConnection = async (): Promise<{
    success: boolean;
    message: string;
    provider: string;
    model?: string
}> => {
    try {
        const provider = await determineProvider();
        lastUsedProvider = provider;

        if (provider === 'gemini') {
            const result = await geminiService.testConnection();
            return {
                ...result,
                provider: 'Gemini API',
            };
        } else {
            // Initialize Transformers if needed
            await initializeAI();
            const status = transformersService.getTransformersStatus();

            if (status.isReady) {
                return {
                    success: true,
                    message: 'Browser AI ready!',
                    provider: 'Transformers.js (Local)',
                    model: status.modelName
                };
            } else if (status.error) {
                return {
                    success: false,
                    message: status.error,
                    provider: 'Transformers.js'
                };
            } else {
                return {
                    success: false,
                    message: 'Model still loading...',
                    provider: 'Transformers.js'
                };
            }
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Connection test failed',
            provider: 'Unknown'
        };
    }
};

// Generate shots from script (orchestrated)
export const generateShotsFromScript = async (
    script: string,
    directorInstructions: string,
    vision?: DirectorVision,
    onProgress?: (progress: { status: string; progress?: number }) => void
): Promise<{ story: Pick<Story, 'title' | 'logline'>, shots: Shot[] }> => {
    try {
        const provider = await determineProvider();
        lastUsedProvider = provider;

        console.log(`🎬 Generating shots using: ${provider}`);

        if (provider === 'gemini') {
            return await geminiService.generateShotsFromScript(script, directorInstructions, vision);
        } else {
            // Ensure Transformers is initialized
            const status = transformersService.getTransformersStatus();
            if (!status.isReady) {
                await transformersService.initializeTransformers(onProgress);
            }
            return await transformersService.generateShotsFromScript(script, directorInstructions, vision);
        }
    } catch (error: any) {
        console.error('Error in generateShotsFromScript:', error);

        // Try fallback if current provider failed
        const provider = lastUsedProvider;
        if (provider === 'transformers' && geminiService.isApiKeySet()) {
            console.log('Transformers failed, trying Gemini fallback...');
            lastUsedProvider = 'gemini';
            return await geminiService.generateShotsFromScript(script, directorInstructions, vision);
        } else if (provider === 'gemini') {
            console.log('Gemini failed, trying Transformers fallback...');
            await transformersService.initializeTransformers(onProgress);
            lastUsedProvider = 'transformers';
            return await transformersService.generateShotsFromScript(script, directorInstructions, vision);
        }

        throw error;
    }
};

// Suggest styles from script (orchestrated)
export const suggestStylesFromScript = async (
    script: string,
    onProgress?: (progress: { status: string; progress?: number }) => void
): Promise<DirectorVision[]> => {
    try {
        const provider = await determineProvider();
        lastUsedProvider = provider;

        console.log(`🎨 Suggesting styles using: ${provider}`);

        if (provider === 'gemini') {
            return await geminiService.suggestStylesFromScript(script);
        } else {
            const status = transformersService.getTransformersStatus();
            if (!status.isReady) {
                await transformersService.initializeTransformers(onProgress);
            }
            return await transformersService.suggestStylesFromScript(script);
        }
    } catch (error: any) {
        console.error('Error in suggestStylesFromScript:', error);

        // Try fallback
        const provider = lastUsedProvider;
        if (provider === 'transformers' && geminiService.isApiKeySet()) {
            lastUsedProvider = 'gemini';
            return await geminiService.suggestStylesFromScript(script);
        } else if (provider === 'gemini') {
            await transformersService.initializeTransformers(onProgress);
            lastUsedProvider = 'transformers';
            return await transformersService.suggestStylesFromScript(script);
        }

        return [];
    }
};

// Re-export other services that don't need orchestration
export {
    getInitialScene,
    enrichStoryDetails,
    generateChatResponse,
    analyzeImageStyle,
    generateSoundscape,
    rewriteLogline,
    searchForInspirations,
    getSuggestionForField,
    enrichWithSearch,
    getGeminiSceneSuggestions,
    getGeminiShotDetails,
    getDirectorNoteSuggestion,
    enhancePromptWithGemini
} from './geminiService';

// Provider info
export const getProviderInfo = () => {
    const geminiAvailable = geminiService.isApiKeySet();
    const transformersStatus = transformersService.getTransformersStatus();

    return {
        gemini: {
            available: geminiAvailable,
            description: 'Google Gemini API - High quality, requires API key'
        },
        transformers: {
            available: true,
            ready: transformersStatus.isReady,
            loading: transformersStatus.isLoading,
            error: transformersStatus.error,
            description: 'Browser AI - Free, runs locally, no API needed',
            modelInfo: transformersService.getModelInfo()
        },
        current: currentProvider,
        lastUsed: lastUsedProvider
    };
};

// Check WebGPU availability
export const checkWebGPU = transformersService.isWebGPUAvailable;
