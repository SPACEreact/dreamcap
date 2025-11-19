import React, { useState } from 'react';
import type { Shot, Soundscape } from '../types';
import { CopyIcon, MagicIcon, CheckIcon } from './Icon';
import { enhancePromptWithGemini } from '../services/geminiService';

interface PromptViewerProps {
  shots: Shot[];
  soundscape: Soundscape;
  onBack: () => void;
  onReset: () => void;
  isQuickMode: boolean;
}

const PromptCard: React.FC<{
  title: string;
  prompt: string;
  index: number;
  onEnhance: () => void;
  isEnhancing: boolean;
}> = ({ title, prompt, index, onEnhance, isEnhancing }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cinematic-glass rounded-xl overflow-hidden hover:border-indigo-500/30 transition-all group">
      <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-700/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2 py-1 rounded border border-indigo-500/20">Shot {index + 1}</span>
          <h3 className="font-bold text-gray-200 font-cinzel">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEnhance}
            disabled={isEnhancing}
            className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors disabled:opacity-50"
            title="Enhance with AI"
          >
            <MagicIcon />
          </button>
          <button
            onClick={handleCopy}
            className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            title="Copy to clipboard"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-300 leading-relaxed border border-gray-800/50">
          {prompt}
        </div>
      </div>
    </div>
  );
};

const PromptViewer: React.FC<PromptViewerProps> = ({ shots, soundscape, onBack, onReset, isQuickMode }) => {
  const [enhancedShots, setEnhancedShots] = useState<Shot[]>(shots);
  const [enhancingIndex, setEnhancingIndex] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  const generateImagePrompt = (shot: Shot): string => {
    // Construct a rich prompt based on all shot details
    let prompt = `Cinematic shot of ${shot.description}. `;
    if (shot.shotType) prompt += `${shot.shotType}, `;
    if (shot.cameraAngle) prompt += `${shot.cameraAngle}, `;
    if (shot.cameraMovement) prompt += `${shot.cameraMovement}, `;
    if (shot.lightingStyle) prompt += `${shot.lightingStyle} lighting, `;
    if (shot.colorGrade) prompt += `${shot.colorGrade} color grading, `;
    if (shot.composition) prompt += `composed with ${shot.composition}. `;
    if (shot.technicalSpecs?.camera) prompt += `Shot on ${shot.technicalSpecs.camera}. `;
    prompt += "High resolution, photorealistic, 8k, cinematic lighting.";
    return prompt;
  };

  const handleEnhancePrompt = async (index: number) => {
    setEnhancingIndex(index);
    try {
      const shot = enhancedShots[index];
      const currentPrompt = generateImagePrompt(shot);
      const enhancedPrompt = await enhancePromptWithGemini(currentPrompt);

      // We'll store the enhanced prompt in the description for now, or ideally add a new field
      // For this demo, let's update the description to be the full prompt
      const newShots = [...enhancedShots];
      newShots[index] = { ...shot, description: enhancedPrompt }; // simplified for demo
      setEnhancedShots(newShots);
    } catch (error) {
      console.error("Failed to enhance prompt:", error);
      alert("Failed to enhance prompt. Please try again.");
    } finally {
      setEnhancingIndex(null);
    }
  };

  const handleCopyAll = () => {
    const allPrompts = enhancedShots.map((shot, index) => {
      return `[Shot ${index + 1}]\n${generateImagePrompt(shot)}\n`;
    }).join('\n');

    navigator.clipboard.writeText(allPrompts);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-5xl mx-auto pb-20">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold cinematic-gradient-text font-cinzel">Production Ready Prompts</h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">Here are your professionally crafted prompts, ready for your favorite AI image generator.</p>

        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={handleCopyAll}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-lg ${allCopied ? 'bg-green-600 text-white shadow-green-500/30' : 'cinematic-button'}`}
          >
            {allCopied ? <CheckIcon /> : <CopyIcon />}
            {allCopied ? 'All Copied!' : 'Copy All Prompts'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {enhancedShots.map((shot, index) => (
          <PromptCard
            key={shot.id}
            index={index}
            title={shot.shotType || "Cinematic Shot"}
            prompt={generateImagePrompt(shot)}
            onEnhance={() => handleEnhancePrompt(index)}
            isEnhancing={enhancingIndex === index}
          />
        ))}
      </div>

      {!isQuickMode && soundscape && (
        <div className="mt-12 cinematic-glass rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 font-cinzel flex items-center gap-3">
            <span className="text-pink-500">♫</span> Audio Direction
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Music Prompt</h4>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-300 border border-gray-800/50">
                {soundscape.musicPrompt}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Sound Effects</h4>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-300 border border-gray-800/50">
                {soundscape.sfxPrompt}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center pt-12 border-t border-gray-800">
        <button onClick={onReset} className="bg-transparent hover:bg-red-500/10 text-gray-500 hover:text-red-400 font-bold py-3 px-8 rounded-xl transition-colors border border-gray-800 hover:border-red-500/30">
          Start New Project
        </button>
      </div>
    </div>
  );
};

export default PromptViewer;