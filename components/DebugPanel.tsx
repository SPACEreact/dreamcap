import React, { useState } from 'react';
import { testConnection } from '../services/geminiService';
import { LightningIcon, CheckIcon, CloseIcon } from './Icon';

export const DebugPanel: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [model, setModel] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleTest = async () => {
        setStatus('testing');
        setMessage('Testing connection...');
        const result = await testConnection();
        if (result.success) {
            setStatus('success');
            setMessage(result.message);
            setModel(result.model || '');
        } else {
            setStatus('error');
            setMessage(result.message);
            setModel(result.model || '');
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 bg-gray-800 text-xs text-gray-500 px-2 py-1 rounded opacity-50 hover:opacity-100 transition-opacity z-50"
            >
                Debug AI
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 z-50 text-sm font-mono animate-fade-in">
            <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
                <h4 className="font-bold text-gray-300 flex items-center gap-2">
                    <LightningIcon /> AI Diagnostics
                </h4>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                    <CloseIcon />
                </button>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-bold ${status === 'success' ? 'text-green-400' :
                            status === 'error' ? 'text-red-400' :
                                status === 'testing' ? 'text-yellow-400' : 'text-gray-500'
                        }`}>
                        {status.toUpperCase()}
                    </span>
                </div>

                {model && (
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">Model:</span>
                        <span className="text-indigo-400">{model}</span>
                    </div>
                )}

                {message && (
                    <div className={`p-2 rounded border ${status === 'success' ? 'bg-green-900/20 border-green-900/50 text-green-300' :
                            status === 'error' ? 'bg-red-900/20 border-red-900/50 text-red-300' :
                                'bg-gray-800 border-gray-700 text-gray-300'
                        } break-words`}>
                        {message}
                    </div>
                )}

                <button
                    onClick={handleTest}
                    disabled={status === 'testing'}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {status === 'testing' ? 'Testing...' : 'Test Connection'}
                </button>
            </div>
        </div>
    );
};
