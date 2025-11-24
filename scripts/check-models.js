import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

let apiKey = process.env.GEMINI_API_KEY;

if (!apiKey && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim();
    }
}

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in environment or .env.local");
    process.exit(1);
}

console.log(`Checking models with API Key: ${apiKey.substring(0, 8)}...`);

const ai = new GoogleGenAI({ apiKey });

async function listModels() {
    try {
        console.log("Fetching available models...");

        const candidates = [
            'gemini-3.0-pro',
            'gemini-3.0-flash',
            'gemini-2.5-pro',
            'gemini-2.5-flash',
            'gemini-2.0-flash-exp',
            'gemini-1.5-pro',
            'gemini-1.5-pro-latest',
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash-8b',
            'gemini-1.0-pro'
        ];

        console.log("\nTesting specific models:");

        for (const model of candidates) {
            try {
                process.stdout.write(`Testing ${model}... `);
                const response = await ai.models.generateContent({
                    model: model,
                    contents: "Hello, are you available?",
                });
                console.log("✅ AVAILABLE");
            } catch (error) {
                console.log(`❌ FAILED (${error.message?.substring(0, 50)}...)`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
