import React, { useState } from 'react';
import type { Story, Shot, DirectorVision } from '../types';
import { generateShotsFromScript, analyzeImageStyle } from '../services/geminiService';
import { FilmIcon, MagicIcon, CameraIcon } from './Icon';

interface ScriptProcessorProps {
  onProcessComplete: (story: Pick<Story, 'title' | 'logline'>, shots: Shot[], directorInstructions: string, vision?: DirectorVision) => void;
}

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


const ScriptProcessor: React.FC<ScriptProcessorProps> = ({ onProcessComplete }) => {
  const [script, setScript] = useState('');
  const [directorInstructions, setDirectorInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [vision, setVision] = useState<DirectorVision | undefined>(undefined);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const style = await analyzeImageStyle(base64String);
        setVision({
          genre: style.genre || '',
          tone: style.tone || '',
          colorPalette: style.colorPalette || '',
          inspirations: style.inspirations || ''
        });
      } catch (error) {
        console.error("Failed to analyze image", error);
        alert("Failed to analyze image style. Please try again.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!script.trim()) {
      alert("Please paste your script before generating.");
      return;
    }
    setIsLoading(true);
    try {
      const { story, shots } = await generateShotsFromScript(script, directorInstructions, vision);
      onProcessComplete(story, shots, directorInstructions, vision);
    } catch (error) {
      console.error("Failed to process script:", error);
      alert("There was an error processing your script. Please check your API key and try again.");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center p-8 animate-fade-in">
        <div className="w-16 h-16 text-purple-400">
          <FilmIcon />
        </div>
        <h3 className="text-3xl font-bold mt-6">Directing Your Reel...</h3>
        <p className="text-gray-400 mt-3 max-w-md">Our AI Director is analyzing your script, breaking it down into an engaging, fast-paced shot list.</p>
        <div className="mt-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-8 animate-fade-in min-h-[50vh]">
      <h2 className="text-3xl font-bold cinematic-gradient-text mb-4">From Script to Screen</h2>
      <p className="text-gray-400 mb-8 max-w-xl text-center">Paste your script below. Our AI director will analyze the content and generate a cinematic shot list optimized for an engaging Instagram Reel.</p>

      <div className="w-full max-w-3xl space-y-6">
        {/* Vision Match Section */}
        <div className="cinematic-glass rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-bold text-indigo-300 flex items-center justify-center md:justify-start gap-2">
                <MagicIcon /> Vision Match <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">BETA</span>
              </h3>
              <p className="text-sm text-gray-400 max-w-md">
                {vision ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Style Extracted: {vision.genre} / {vision.tone}
                  </span>
                ) : (
                  "Upload a reference image to guide the AI's visual style."
                )}
              </p>
            </div>

            <label className={`cursor-pointer flex items-center gap-3 px-6 py-3 rounded-lg font-bold transition-all ${isAnalyzing ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'cinematic-button'}`}>
              {isAnalyzing ? (
                <>
                  <LoadingSpinner />
                  Analyzing...
                </>
              ) : (
                <>
                  <CameraIcon />
                  {vision ? 'Change Reference' : 'Upload Reference'}
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isAnalyzing} />
            </label>
          </div>
        </div>

        <div className="cinematic-glass rounded-2xl shadow-2xl p-6">
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="[SCENE START]
    
    INT. COFFEE SHOP - DAY
    
    JANE (30s) nervously stirs her coffee. ACROSS from her, MARK (30s) looks at his phone, oblivious.
    
    JANE
    (quietly)
    We need to talk.
    
    Mark looks up, annoyed.
    
    MARK
    About what?
    
    [SCENE END]"
            className="cinematic-input h-64 font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <div className="mt-6">
            <label htmlFor="director-instructions" className="block text-sm font-medium text-gray-300 mb-2">Director's Instructions (Optional)</label>
            <textarea
              id="director-instructions"
              value={directorInstructions}
              onChange={(e) => setDirectorInstructions(e.target.value)}
              placeholder="e.g., 'Focus on extreme close-ups for emotional impact.' 'Use a lot of handheld camera work to create a sense of urgency.' 'The color palette should be cold and desaturated.'"
              className="cinematic-input h-24 font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full mt-6 cinematic-button flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner /> : <FilmIcon />}
            Generate Cinematic Reel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScriptProcessor;
