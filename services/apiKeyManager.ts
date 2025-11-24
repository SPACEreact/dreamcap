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

export const syncConfigWithBackend = async () => {
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            const config = await response.json();
            if (config.gemini) localStorage.setItem('API_KEY_GEMINI', config.gemini);
            if (config.groq) localStorage.setItem('API_KEY_GROQ', config.groq);
            if (config.hf) localStorage.setItem('API_KEY_HF', config.hf);
            if (config.activeProvider) localStorage.setItem('ACTIVE_PROVIDER', config.activeProvider);
            console.log("Synced config from backend");
        }
    } catch (e) {
        console.warn("Backend not available, using local storage");
    }
};

export const saveConfigToBackend = async (gemini?: string, groq?: string, hf?: string, activeProvider?: string) => {
    try {
        await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gemini, groq, hf, activeProvider })
        });
    } catch (e) {
        console.error("Failed to save config to backend", e);
    }
};
