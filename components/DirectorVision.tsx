import React, { useState } from 'react';
import type { DirectorVision } from '../types';
import { MagicIcon, CameraIcon } from './Icon';
import { analyzeImageStyle } from '../services/geminiService';

interface DirectorVisionProps {
  vision: DirectorVision;
  setVision: React.Dispatch<React.SetStateAction<DirectorVision>>;
  onBack: () => void;
  onNext: () => void;
}

const InputLabel: React.FC<{ htmlFor: string, children: React.ReactNode }> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
    {children}
  </label>
);

const DirectorVision: React.FC<DirectorVisionProps> = ({ vision, setVision, onBack, onNext }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const style = await analyzeImageStyle(base64String);
        setVision(prev => ({
          ...prev,
          genre: style.genre || prev.genre,
          tone: style.tone || prev.tone,
          colorPalette: style.colorPalette || prev.colorPalette,
          inspirations: style.inspirations || prev.inspirations
        }));
      } catch (error) {
        console.error("Failed to analyze image", error);
        alert("Failed to analyze image style. Please try again.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setVision({ ...vision, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold cinematic-gradient-text font-cinzel">Set Your Director's Vision</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">Define the cinematic language of your film. This will guide the AI in generating stylistically coherent shots.</p>
      </div>

      {/* Vision Match Section */}
      <div className="cinematic-glass rounded-xl p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold text-indigo-300 flex items-center justify-center md:justify-start gap-2">
              <MagicIcon /> Vision Match <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">BETA</span>
            </h3>
            <p className="text-sm text-gray-400 max-w-md">
              Upload a reference image (movie still, painting, or photo) and Gemini will instantly extract its genre, tone, and color palette.
            </p>
          </div>

          <label className={`cursor-pointer flex items-center gap-3 px-6 py-3 rounded-lg font-bold transition-all ${isAnalyzing ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'cinematic-button'}`}>
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Style...
              </>
            ) : (
              <>
                <CameraIcon />
                Upload Reference
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isAnalyzing} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <InputLabel htmlFor="genre">Genre</InputLabel>
            <input type="text" name="genre" id="genre" value={vision.genre} onChange={handleChange} className="cinematic-input" placeholder="e.g., Sci-Fi Noir, Romantic Comedy" />
          </div>
          <div>
            <InputLabel htmlFor="tone">Tone</InputLabel>
            <input type="text" name="tone" id="tone" value={vision.tone} onChange={handleChange} className="cinematic-input" placeholder="e.g., Gritty and tense, whimsical and lighthearted" />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <InputLabel htmlFor="colorPalette">Core Color Palette</InputLabel>
            <input type="text" name="colorPalette" id="colorPalette" value={vision.colorPalette} onChange={handleChange} className="cinematic-input" placeholder="e.g., Desaturated blues, vibrant neons, warm earth tones" />
          </div>
          <div>
            <InputLabel htmlFor="inspirations">Cinematic Inspirations</InputLabel>
            <textarea name="inspirations" id="inspirations" value={vision.inspirations} onChange={handleChange} rows={3} className="cinematic-input resize-none" placeholder="e.g., Inspired by the handheld realism of 'Children of Men' and the color palette of 'Blade Runner 2049'"></textarea>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-8 border-t border-gray-800">
        <button onClick={onBack} className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-4 px-8 rounded-xl transition-colors">&larr; Back to Story</button>
        <button onClick={onNext} className="cinematic-button">
          Plan The Scene &rarr;
        </button>
      </div>
    </div>
  );
};

export default DirectorVision;