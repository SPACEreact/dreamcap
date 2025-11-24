import React, { useState, useEffect } from 'react';
import { CloseIcon, SettingsIcon } from './Icon';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [geminiKey, setGeminiKey] = useState('');
    const [groqKey, setGroqKey] = useState('');
    const [huggingFaceKey, setHuggingFaceKey] = useState('');
    const [activeProvider, setActiveProvider] = useState('gemini');

    useEffect(() => {
        if (isOpen) {
            setGeminiKey(localStorage.getItem('API_KEY_GEMINI') || '');
            setGroqKey(localStorage.getItem('API_KEY_GROQ') || '');
            setHuggingFaceKey(localStorage.getItem('API_KEY_HF') || '');
            setActiveProvider(localStorage.getItem('ACTIVE_PROVIDER') || 'gemini');
        }
    }, [isOpen]);

    const handleSave = () => {
        if (geminiKey) localStorage.setItem('API_KEY_GEMINI', geminiKey);
        if (groqKey) localStorage.setItem('API_KEY_GROQ', groqKey);
        if (huggingFaceKey) localStorage.setItem('API_KEY_HF', huggingFaceKey);
        localStorage.setItem('ACTIVE_PROVIDER', activeProvider);

        // Trigger a reload or event to update services (simple reload for now)
        window.location.reload();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <SettingsIcon /> Settings
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <CloseIcon />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Provider Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Active AI Provider</label>
                        <select
                            value={activeProvider}
                            onChange={(e) => setActiveProvider(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="gemini">Google Gemini (Recommended)</option>
                            <option value="groq">Groq (Fastest)</option>
                            <option value="hf">Hugging Face (Open Source)</option>
                        </select>
                    </div>

                    {/* API Keys */}
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-sm font-medium text-gray-300">Gemini API Key</label>
                                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300">Get Key ↗</a>
                            </div>
                            <input
                                type="password"
                                value={geminiKey}
                                onChange={(e) => setGeminiKey(e.target.value)}
                                placeholder="AIza..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-sm font-medium text-gray-300">Groq API Key</label>
                                <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300">Get Key ↗</a>
                            </div>
                            <input
                                type="password"
                                value={groqKey}
                                onChange={(e) => setGroqKey(e.target.value)}
                                placeholder="gsk_..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-sm font-medium text-gray-300">Hugging Face Token</label>
                                <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300">Get Token ↗</a>
                            </div>
                            <input
                                type="password"
                                value={huggingFaceKey}
                                onChange={(e) => setHuggingFaceKey(e.target.value)}
                                placeholder="hf_..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Save & Reload
                    </button>
                </div>
            </div>
        </div>
    );
};
