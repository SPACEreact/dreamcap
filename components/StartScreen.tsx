
import React from 'react';
import { SparklesIcon, DocumentTextIcon } from './Icon';

interface StartScreenProps {
  onSelectCreator: () => void;
  onSelectScript: () => void;
  isPastelMode: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onSelectCreator, onSelectScript, isPastelMode }) => {

  const cardBaseClasses = "relative p-8 rounded-2xl border transition-all duration-500 transform hover:-translate-y-2 group overflow-hidden";
  const darkCardClasses = "bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20";
  const pastelCardClasses = "bg-white/60 backdrop-blur-sm border-pink-200 hover:border-pink-400 hover:shadow-xl hover:shadow-pink-500/20";

  const iconContainerBase = "flex items-center justify-center h-20 w-20 rounded-2xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg";
  const darkIconContainer = "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/30";
  const darkIconContainer2 = "bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-purple-500/30";
  const pastelIconContainer = "bg-gradient-to-br from-pink-300 to-rose-400 text-white shadow-pink-400/30";

  const titleClasses = `text-2xl font-bold mb-3 font-cinzel ${isPastelMode ? 'text-gray-800' : 'text-white'}`;
  const textClasses = `leading-relaxed ${isPastelMode ? 'text-gray-600' : 'text-gray-400'}`;


  return (
    <div className="flex flex-col items-center justify-center p-4 animate-fade-in text-center min-h-[60vh]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mt-8">
        {/* Creator Mode */}
        <button
          onClick={onSelectCreator}
          className={`${cardBaseClasses} ${isPastelMode ? pastelCardClasses : darkCardClasses}`}
        >
          <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
          <div className={`${iconContainerBase} ${isPastelMode ? pastelIconContainer : darkIconContainer}`}>
            <SparklesIcon />
          </div>
          <h3 className={titleClasses}>Build from Scratch</h3>
          <p className={textClasses}>The original step-by-step process. Define your story, characters, and setting, then craft each shot manually with precision.</p>
        </button>

        {/* Script Mode */}
        <button
          onClick={onSelectScript}
          className={`${cardBaseClasses} ${isPastelMode ? pastelCardClasses : 'bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20'}`}
        >
          <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
          <div className={`${iconContainerBase} ${isPastelMode ? pastelIconContainer : darkIconContainer2}`}>
            <DocumentTextIcon />
          </div>
          <h3 className={titleClasses}>Generate from Script</h3>
          <p className={textClasses}>Paste your script and get an AI-generated, reel-optimized shot list in seconds. Perfect for fast-paced content creation.</p>
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
