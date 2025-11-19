import React, { useState } from 'react';
import type { Shot, Story, DirectorVision, Soundscape, ShotSoundDesign } from '../types';
import { MagicIcon, SpeakerIcon, CopyIcon } from './Icon';
import { generateSoundscape } from '../services/geminiService';

interface SoundscapeBuilderProps {
  shots: Shot[];
  story: Story;
  directorVision: DirectorVision;
  soundscape: Soundscape;
  setSoundscape: React.Dispatch<React.SetStateAction<Soundscape>>;
  onBack: () => void;
  onNext: () => void;
}

const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const SoundscapeBuilder: React.FC<SoundscapeBuilderProps> = ({ shots, story, directorVision, soundscape, setSoundscape, onBack, onNext }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [copiedShotId, setCopiedShotId] = useState<string | null>(null);

  const handleGenerateSoundscape = async () => {
    setIsLoading(true);
    try {
      const generatedSoundscape = await generateSoundscape(story, directorVision, shots);
      setSoundscape(generatedSoundscape);
    } catch (error) {
      console.error("Failed to generate soundscape:", error);
      alert("There was an error generating the soundscape. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSoundDesignChange = (shotId: string, field: keyof Omit<ShotSoundDesign, 'shotId'>, value: string) => {
    const newSoundscape = [...soundscape];
    const index = newSoundscape.findIndex(s => s.shotId === shotId);
    if (index > -1) {
      newSoundscape[index] = { ...newSoundscape[index], [field]: value };
      setSoundscape(newSoundscape);
    }
  };

  const getSoundDesignForShot = (shotId: string): ShotSoundDesign => {
    return soundscape.find(s => s.shotId === shotId) || { shotId, score: '', sfx: '', ambience: '' };
  };

  const handleCopyShotSound = (shot: Shot, soundDesign: ShotSoundDesign) => {
    const textToCopy = `Shot ${shots.findIndex(s => s.id === shot.id) + 1}: ${shot.description}\n---\nScore: ${soundDesign.score}\nSFX: ${soundDesign.sfx}\nAmbience: ${soundDesign.ambience}`.trim();
    navigator.clipboard.writeText(textToCopy);
    setCopiedShotId(shot.id);
    setTimeout(() => setCopiedShotId(null), 2000);
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Design Your Soundscape</h2>
        <p className="text-gray-400">Sound is half the experience. Generate an AI-powered audio blueprint for your scene, then refine it to perfection.</p>
      </div>

      {soundscape.length === 0 && !isLoading && (
        <div className="text-center py-12 px-6 bg-gray-900/50 rounded-lg">
          <div className="w-16 h-16 mx-auto text-purple-400"><SpeakerIcon /></div>
          <p className="text-gray-300 mt-4 mb-6">Your soundscape is silent. Let our AI Sound Designer create an audio plan for you.</p>
          <button
            onClick={handleGenerateSoundscape}
            className="flex items-center justify-center gap-2 mx-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            <MagicIcon /> Generate AI Soundscape
          </button>
        </div>
      )}

      {isLoading && (
         <div className="flex flex-col items-center justify-center h-full min-h-[40vh] text-center">
            <div className="w-12 h-12 text-purple-400"><SpeakerIcon /></div>
            <h3 className="text-2xl font-bold mt-4">Crafting Your Sound...</h3>
            <p className="text-gray-400 mt-2">Our AI Sound Designer is listening to your scene's emotional core.</p>
            <div className="mt-6">
                <LoadingSpinner />
            </div>
        </div>
      )}

      {soundscape.length > 0 && (
        <div className="space-y-6">
          {shots.map((shot, index) => {
            const soundDesign = getSoundDesignForShot(shot.id);
            const isCopied = copiedShotId === shot.id;
            return (
              <div key={shot.id} className="bg-gray-900/50 p-5 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center font-bold text-purple-300">{index + 1}</div>
                    <div>
                        <p className="font-semibold text-white">{shot.description}</p>
                        <p className="text-xs text-gray-400">{shot.shotType} - {shot.cameraAngle}</p>
                    </div>
                  </div>
                   <button 
                      onClick={() => handleCopyShotSound(shot, soundDesign)} 
                      className={`flex-shrink-0 flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-md transition-all ${isCopied ? 'bg-green-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                    >
                      <CopyIcon /> {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SoundTextarea
                    label="Score Direction"
                    value={soundDesign.score}
                    onChange={(e) => handleSoundDesignChange(shot.id, 'score', e.target.value)}
                    placeholder="e.g., A low, tense drone begins to build..."
                  />
                  <SoundTextarea
                    label="Key Sound Effects (SFX)"
                    value={soundDesign.sfx}
                    onChange={(e) => handleSoundDesignChange(shot.id, 'sfx', e.target.value)}
                    placeholder="e.g., The sharp click of the briefcase latch."
                  />
                  <SoundTextarea
                    label="Ambience & Foley"
                    value={soundDesign.ambience}
                    onChange={(e) => handleSoundDesignChange(shot.id, 'ambience', e.target.value)}
                    placeholder="e.g., Distant city sirens, the rustle of clothing."
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="flex justify-between pt-8 mt-4 border-t border-gray-700">
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">&larr; Back to Scene</button>
        <button onClick={onNext} disabled={shots.length === 0} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Generate Prompts &rarr;
        </button>
      </div>
    </div>
  );
};

const SoundTextarea: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder: string; }> = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={4}
            className="w-full p-2 bg-gray-700 rounded-md text-gray-300 text-sm border border-gray-600 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition"
        />
    </div>
);


export default SoundscapeBuilder;