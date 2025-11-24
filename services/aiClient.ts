// Frontend API client for backend AI endpoints

export const generateShotsFromScript = async (
    script: string,
    directorInstructions: string,
    vision?: any
) => {
    const response = await fetch('/api/ai/generate-shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, directorInstructions, vision })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate shots');
    }

    return response.json();
};

export const suggestStylesFromScript = async (script: string) => {
    const response = await fetch('/api/ai/suggest-styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to suggest styles');
    }

    const data = await response.json();
    return data.styles;
};

export const testConnection = async () => {
    const response = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });

    return response.json();
};

// Placeholder functions for features not yet migrated
export const isApiKeySet = () => true; // Backend handles this now
export const getInitialScene = async () => [];
export const enrichStoryDetails = async (story: any) => story;
export const generateChatResponse = async () => "AI chat temporarily disabled";
export const analyzeImageStyle = async () => ({});
export const generateSoundscape = async () => [];
export const rewriteLogline = async (title: string, logline: string) => logline;
export const searchForInspirations = async () => "";
export const getSuggestionForField = async () => "";
export const enrichWithSearch = async (subject: string, desc: string) => desc;
export const getGeminiSceneSuggestions = async () => [];
export const getGeminiShotDetails = async () => ({});
export const getDirectorNoteSuggestion = async () => "";
export const enhancePromptWithGemini = async (prompt: string) => prompt;
