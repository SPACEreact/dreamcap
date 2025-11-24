export const getApiKey = (provider: 'gemini' | 'groq' | 'hf' = 'gemini'): string | null => {
    const key = localStorage.getItem(`API_KEY_${provider.toUpperCase()}`);
    if (key) return key;

    // Fallback to env vars for Gemini if not in local storage
    if (provider === 'gemini') {
        return process.env.GEMINI_API_KEY || process.env.API_KEY || null;
    }
    return null;
};

export const getActiveProvider = (): 'gemini' | 'groq' | 'hf' => {
    return (localStorage.getItem('ACTIVE_PROVIDER') as 'gemini' | 'groq' | 'hf') || 'gemini';
};
