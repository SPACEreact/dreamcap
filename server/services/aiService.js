const { GoogleGenerativeAI } = require("@google/generative-ai");

// Model fallback chain
const MODEL_FALLBACK_CHAIN = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash-001',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro-002',
    'gemini-1.5-pro-001',
    'gemini-1.5-pro',
    'gemini-pro'
];

let cachedWorkingModel = null;

// Find working model
const findWorkingModel = async (genAI) => {
    // Simplified: try a single known model first
    const primaryModel = 'gemini-1.5-flash';
    try {
        const model = genAI.getGenerativeModel({ model: primaryModel });
        await model.generateContent('test');
        cachedWorkingModel = primaryModel;
        console.log(`✅ Using primary model: ${primaryModel}`);
        return primaryModel;
    } catch (e) {
        console.warn(`❌ Primary model ${primaryModel} failed, trying fallback chain`);
        // fallback to original chain if primary fails
        for (const modelName of MODEL_FALLBACK_CHAIN) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                await model.generateContent('test');
                console.log(`✅ Found working model: ${modelName}`);
                cachedWorkingModel = modelName;
                return modelName;
            } catch (_) {
                // ignore
            }
        }
        throw new Error('No working Gemini models found');
    }
};

const getGenAI = (apiKey) => {
    if (!apiKey) throw new Error("Gemini API key is required");
    return new GoogleGenerativeAI(apiKey);
};

module.exports = {
    generateShotsFromScript: async (apiKey, script, directorInstructions, vision) => {
        const genAI = getGenAI(apiKey);
        const modelName = await findWorkingModel(genAI);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `Analyze the following script and generate a cinematic shot list.
        
Script: ${script}
Director's Instructions: ${directorInstructions}
Director's Vision: ${vision ? JSON.stringify(vision) : "None"}

Return JSON with: {"story": {"title": "...", "logline": "..."}, "shots": [...]}`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
        });

        const response = await result.response;
        return JSON.parse(response.text());
    },

    suggestStyles: async (apiKey, script) => {
        const genAI = getGenAI(apiKey);
        const modelName = await findWorkingModel(genAI);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `Analyze this script and suggest 3 distinct visual styles.
    
Script: ${script.substring(0, 2000)}

Return JSON with: {"styles": [{genre, tone, colorPalette, inspirations}, ...]}`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
        });

        const response = await result.response;
        const parsed = JSON.parse(response.text());
        return parsed.styles || [];
    },

    testConnection: async (apiKey) => {
        const genAI = getGenAI(apiKey);
        const modelName = await findWorkingModel(genAI);
        return { success: true, model: modelName };
    }
};
