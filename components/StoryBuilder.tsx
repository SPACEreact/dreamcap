
import React, { useState, useEffect, useRef } from 'react';
import type { Story } from '../types';
import { PlusIcon, TrashIcon, MagicIcon, GoogleIcon } from './Icon';
import { getSuggestionForField, enrichWithSearch } from '../services/geminiService';

interface StoryBuilderProps {
  story: Story;
  setStory: React.Dispatch<React.SetStateAction<Story>>;
  onNext: () => void;
}

const LoadingSpinner = () => (
  <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Auto-expanding textarea component
const AutoTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [props.value]);

  return (
    <textarea
      {...props}
      ref={textareaRef}
      className={`cinematic-input resize-none overflow-hidden ${props.className}`}
    />
  );
};

const InputLabel: React.FC<{ htmlFor: string, children: React.ReactNode, action?: React.ReactNode }> = ({ htmlFor, children, action }) => (
  <div className="flex justify-between items-end mb-2">
    <label htmlFor={htmlFor} className="block text-xs font-bold uppercase tracking-wider text-gray-500">
      {children}
    </label>
    {action}
  </div>
);


const StoryBuilder: React.FC<StoryBuilderProps> = ({ story, setStory, onNext }) => {
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const handleStoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStory({ ...story, [e.target.name]: e.target.value });
  };

  const handleCharacterChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newCharacters = [...story.characters];
    newCharacters[index] = { ...newCharacters[index], [e.target.name]: e.target.value };
    setStory({ ...story, characters: newCharacters });
  };

  const addCharacter = () => {
    setStory({ ...story, characters: [...story.characters, { name: '', description: '' }] });
  };

  const removeCharacter = (index: number) => {
    const newCharacters = story.characters.filter((_, i) => i !== index);
    setStory({ ...story, characters: newCharacters });
  };

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStory({ ...story, setting: { ...story.setting, [e.target.name]: e.target.value } });
  };

  const handleSuggestion = async (key: string, field: 'logline' | 'character' | 'setting', index: number = -1) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    try {
      const suggestion = await getSuggestionForField(field, story);
      if (field === 'logline') {
        setStory(prev => ({ ...prev, logline: suggestion }));
      } else if (field === 'character' && index > -1) {
        const newCharacters = [...story.characters];
        newCharacters[index].description = suggestion;
        setStory(prev => ({ ...prev, characters: newCharacters }));
      } else if (field === 'setting') {
        setStory(prev => ({ ...prev, setting: { ...prev.setting, description: suggestion } }));
      }
    } catch (error) {
      alert("Failed to get suggestion. Please check your API key.");
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleEnrichment = async (key: string, field: 'character' | 'setting', index: number = -1) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    try {
      let subject = '';
      let existingDesc = '';
      if (field === 'character' && index > -1) {
        subject = story.characters[index].name;
        existingDesc = story.characters[index].description;
      } else if (field === 'setting') {
        subject = story.setting.name;
        existingDesc = story.setting.description;
      }

      if (!subject) {
        alert(`Please provide a name for the ${field} to enrich it.`);
        setLoadingStates(prev => ({ ...prev, [key]: false }));
        return;
      }

      const enrichedText = await enrichWithSearch(subject, existingDesc);

      if (field === 'character' && index > -1) {
        const newCharacters = [...story.characters];
        newCharacters[index].description = enrichedText;
        setStory(prev => ({ ...prev, characters: newCharacters }));
      } else if (field === 'setting') {
        setStory(prev => ({ ...prev, setting: { ...prev.setting, description: enrichedText } }));
      }
    } catch (error) {
      alert("Failed to enrich content. Please check your API key.");
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  };


  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold cinematic-gradient-text font-cinzel">Define Your Story</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">Lay the foundation of your narrative. This context will inform every prompt you generate.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <InputLabel htmlFor="title">Title</InputLabel>
            <input
              type="text"
              name="title"
              id="title"
              value={story.title}
              onChange={handleStoryChange}
              className="cinematic-input"
              placeholder="e.g., Echoes of Neon"
            />
          </div>

          <div>
            <InputLabel htmlFor="logline" action={
              <button onClick={() => handleSuggestion('logline', 'logline')} disabled={!story.title || loadingStates['logline']} className="flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loadingStates['logline'] ? <LoadingSpinner /> : <MagicIcon />} Suggest
              </button>
            }>Logline</InputLabel>
            <AutoTextArea
              name="logline"
              id="logline"
              value={story.logline}
              onChange={handleStoryChange}
              rows={3}
              placeholder="A brief summary of your story..."
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-4 font-cinzel border-b border-gray-800 pb-2">Setting</h3>
            <div className="space-y-4">
              <div>
                <InputLabel htmlFor="setting-name">Name</InputLabel>
                <input type="text" name="name" id="setting-name" value={story.setting.name} onChange={handleSettingChange} className="cinematic-input" placeholder="e.g., Neo-Kyoto, 2088" />
              </div>
              <div>
                <InputLabel htmlFor="setting-desc" action={
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEnrichment('enrich_setting', 'setting')} disabled={!story.setting.name || loadingStates['enrich_setting']} className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      {loadingStates['enrich_setting'] ? <LoadingSpinner /> : <GoogleIcon />} Enrich
                    </button>
                    <button onClick={() => handleSuggestion('suggest_setting', 'setting')} disabled={!story.setting.name || loadingStates['suggest_setting']} className="flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      {loadingStates['suggest_setting'] ? <LoadingSpinner /> : <MagicIcon />} Suggest
                    </button>
                  </div>
                }>Description</InputLabel>
                <AutoTextArea name="description" id="setting-desc" value={story.setting.description} onChange={handleSettingChange} rows={3} placeholder="e.g., a rain-slicked metropolis where tradition and technology clash" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <h3 className="text-lg font-semibold text-gray-200 font-cinzel">Characters</h3>
            <button onClick={addCharacter} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors">
              <PlusIcon /> Add New
            </button>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {story.characters.map((char, index) => (
              <div key={index} className="p-5 cinematic-glass rounded-xl space-y-4 hover:border-gray-600 transition-colors group">
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-4">
                    <InputLabel htmlFor={`char-name-${index}`}>Name</InputLabel>
                    <input type="text" name="name" id={`char-name-${index}`} value={char.name} onChange={(e) => handleCharacterChange(index, e)} className="cinematic-input" placeholder="e.g., Alex" />
                  </div>
                  {story.characters.length > 1 && (
                    <button onClick={() => removeCharacter(index)} className="mt-6 p-2 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                      <TrashIcon />
                    </button>
                  )}
                </div>
                <div>
                  <InputLabel htmlFor={`char-desc-${index}`} action={
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleEnrichment(`enrich_char_${index}`, 'character', index)} disabled={!char.name || loadingStates[`enrich_char_${index}`]} className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {loadingStates[`enrich_char_${index}`] ? <LoadingSpinner /> : <GoogleIcon />} Enrich
                      </button>
                      <button onClick={() => handleSuggestion(`suggest_char_${index}`, 'character', index)} disabled={!char.name || loadingStates[`suggest_char_${index}`]} className="flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {loadingStates[`suggest_char_${index}`] ? <LoadingSpinner /> : <MagicIcon />} Suggest
                      </button>
                    </div>
                  }>Description</InputLabel>
                  <AutoTextArea name="description" id={`char-desc-${index}`} value={char.description} onChange={(e) => handleCharacterChange(index, e)} rows={2} placeholder="e.g., a rogue AI with a penchant for poetry" className="bg-transparent" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-8 border-t border-gray-800">
        <button onClick={onNext} className="cinematic-button flex items-center gap-2">
          Set Director's Vision &rarr;
        </button>
      </div>
    </div>
  );
};

export default StoryBuilder;