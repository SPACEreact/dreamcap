import React, { useState, useEffect, useCallback } from 'react';
import type { Story, Shot, ChatMessage, Soundscape, DirectorVision as DirectorVisionType } from './types';
import { AppStep, AppMode } from './types';
import StoryBuilder from './components/StoryBuilder';
import DirectorVision from './components/DirectorVision';
import ShotBuilder from './components/ShotBuilder';
import SoundscapeBuilder from './components/SoundscapeBuilder';
import PromptViewer from './components/PromptViewer';
import Chatbot from './components/Chatbot';
import StartScreen from './components/StartScreen';
import ScriptProcessor from './components/ScriptProcessor';
import { CameraIcon, FilmIcon, SparklesIcon, ChatIcon, ClipboardListIcon, HeartIcon, SpeakerIcon, LightningIcon, SettingsIcon } from './components/Icon';
import { generateChatResponse, getInitialScene } from './services/geminiService';
import { SettingsModal } from './components/SettingsModal';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.SELECTION);
  const [step, setStep] = useState<AppStep>(AppStep.STORY);
  const [isPastelMode, setIsPastelMode] = useState(false);
  const [isQuickMode, setIsQuickMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [story, setStory] = useState<Story>({
    title: '',
    logline: '',
    characters: [{ name: '', description: '' }],
    setting: { name: '', description: '' },
  });

  const [directorVision, setDirectorVision] = useState<DirectorVisionType>({
    genre: '',
    tone: '',
    colorPalette: '',
    inspirations: '',
  });
  const [shots, setShots] = useState<Shot[]>([]);
  const [soundscape, setSoundscape] = useState<Soundscape>([]);
  const [sceneEmotionalCore, setSceneEmotionalCore] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'gemini', text: "Hello! I'm your AI filmmaking assistant. Ask me anything about scriptwriting, cinematography, or for creative ideas." }
  ]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [directorInstructions, setDirectorInstructions] = useState('');
  const [isInitializingScene, setIsInitializingScene] = useState(false);

  useEffect(() => {
    // Check if API key is missing for the active provider
    const provider = localStorage.getItem('ACTIVE_PROVIDER') || 'gemini';
    const key = localStorage.getItem(`API_KEY_${provider.toUpperCase()}`);
    const envKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!key && !envKey && provider === 'gemini') {
      // If no key found, open settings automatically on first load
      const hasSeenSettings = sessionStorage.getItem('hasSeenSettings');
      if (!hasSeenSettings) {
        setIsSettingsOpen(true);
        sessionStorage.setItem('hasSeenSettings', 'true');
      }
    }
  }, []);

  useEffect(() => {
    const initializeScene = async () => {
      if (appMode === AppMode.CREATOR && step === AppStep.SCENE && shots.length === 0 && (story.title || story.logline)) {
        setIsInitializingScene(true);
        try {
          const initialShots = await getInitialScene(story, directorVision, sceneEmotionalCore || "The opening of the story.");
          setShots(initialShots);
        } catch (error) {
          console.error("Failed to initialize scene:", error);
          alert("There was an error generating the initial scene. Please try adding shots manually or refresh the page.");
        } finally {
          setIsInitializingScene(false);
        }
      }
    };
    initializeScene();
  }, [step, appMode, story, directorVision, sceneEmotionalCore]);

  useEffect(() => {
    if (isPastelMode) {
      setChatMessages([{ sender: 'gemini', text: "Welcome to Pastel Mode! How about we create a whimsical fairytale today?" }]);
    } else {
      setChatMessages([{ sender: 'gemini', text: "Hello! I'm your AI filmmaking assistant. Ask me anything about scriptwriting, cinematography, or for creative ideas." }]);
    }
  }, [isPastelMode]);

  const handleNext = useCallback(() => {
    if (step === AppStep.STORY) setStep(AppStep.VISION);
    if (step === AppStep.VISION) setStep(AppStep.SCENE);
    if (step === AppStep.SCENE) {
      if (isQuickMode) {
        setStep(AppStep.PROMPTS);
      } else {
        setStep(AppStep.SOUNDSCAPE);
      }
    }
    if (step === AppStep.SOUNDSCAPE) setStep(AppStep.PROMPTS);
  }, [step, isQuickMode]);

  const handleBack = useCallback(() => {
    if (step === AppStep.PROMPTS) {
      if (isQuickMode) {
        setStep(AppStep.SCENE);
      } else {
        setStep(AppStep.SOUNDSCAPE);
      }
    }
    if (step === AppStep.SOUNDSCAPE) setStep(AppStep.SCENE);
    if (step === AppStep.SCENE) setStep(AppStep.VISION);
    if (step === AppStep.VISION) setStep(AppStep.STORY);
  }, [step, isQuickMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handleBack]);

  const handleSendMessage = async (message: string) => {
    const newMessages: ChatMessage[] = [...chatMessages, { sender: 'user', text: message }];
    setChatMessages(newMessages);
    setIsBotThinking(true);
    try {
      const response = await generateChatResponse(newMessages);
      setChatMessages([...newMessages, { sender: 'gemini', text: response }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setChatMessages([...newMessages, { sender: 'gemini', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsBotThinking(false);
    }
  };

  const handleScriptProcessComplete = (processedStory: Story, processedShots: Shot[], instructions: string, vision?: DirectorVisionType) => {
    if (processedShots.length === 0) {
      alert("The AI could not generate a shot list from this script. Please try again or check the script content.");
      return;
    }

    setStory({
      ...story,
      title: processedStory.title,
      logline: processedStory.logline,
    });
    setShots(processedShots);
    setDirectorInstructions(instructions);
    if (vision) {
      setDirectorVision(vision);
    }
    // Skip story and vision steps, go directly to scene editing
    setStep(AppStep.SCENE);
    setAppMode(AppMode.CREATOR);
  };

  const renderCreatorSteps = () => {
    switch (step) {
      case AppStep.STORY:
        return <StoryBuilder story={story} setStory={setStory} onNext={handleNext} />;
      case AppStep.VISION:
        return <DirectorVision vision={directorVision} setVision={setDirectorVision} onBack={handleBack} onNext={handleNext} />;
      case AppStep.SCENE:
        return <ShotBuilder
          shots={shots}
          setShots={setShots}
          story={story}
          directorVision={directorVision}
          onBack={handleBack}
          onNext={handleNext}
          isInitializing={isInitializingScene}
          sceneEmotionalCore={sceneEmotionalCore}
          setSceneEmotionalCore={setSceneEmotionalCore}
        />;
      case AppStep.SOUNDSCAPE:
        return <SoundscapeBuilder
          shots={shots}
          story={story}
          directorVision={directorVision}
          soundscape={soundscape}
          setSoundscape={setSoundscape}
          onBack={handleBack}
          onNext={handleNext}
        />;
      case AppStep.PROMPTS:
        return <PromptViewer shots={shots} story={story} soundscape={soundscape} onBack={handleBack} directorInstructions={directorInstructions} />;
      default:
        return <div>Invalid Step</div>;
    }
  };

  const steps = [
    { id: AppStep.STORY, name: 'The Story', icon: <SparklesIcon /> },
    { id: AppStep.VISION, name: "Director's Vision", icon: <ClipboardListIcon /> },
    { id: AppStep.SCENE, name: 'The Scene', icon: <CameraIcon /> },
    { id: AppStep.SOUNDSCAPE, name: 'The Soundscape', icon: <SpeakerIcon /> },
    { id: AppStep.PROMPTS, name: 'The Prompts', icon: <FilmIcon /> },
  ];

  const renderContent = () => {
    switch (appMode) {
      case AppMode.SELECTION:
        return <StartScreen
          isPastelMode={isPastelMode}
          onSelectCreator={() => setAppMode(AppMode.CREATOR)}
          onSelectScript={() => setAppMode(AppMode.SCRIPT_INPUT)}
        />;
      case AppMode.SCRIPT_INPUT:
        return <ScriptProcessor onProcessComplete={handleScriptProcessComplete} />;
      case AppMode.CREATOR:
        return (
          <>
            <nav className="mb-8 sticky top-0 z-30 cinematic-glass py-4 rounded-b-2xl border-b border-gray-800/50">
              <ol className="flex items-center justify-center w-full text-sm font-medium text-center text-gray-500 px-4 overflow-x-auto no-scrollbar">
                {steps.map((s, index) => {
                  // Hide Soundscape in Quick Mode
                  if (isQuickMode && s.id === AppStep.SOUNDSCAPE) return null;

                  return (
                    <li key={s.id} className={`flex items-center whitespace-nowrap ${step === s.id ? 'text-indigo-400' : ''} ${index < steps.length - 1 ? "mx-4" : ""}`}>
                      <span className={`flex items-center p-2 rounded-lg transition-all ${step === s.id ? "bg-indigo-500/10 ring-1 ring-indigo-500/50" : "hover:text-gray-300"}`}>
                        <span className={step === s.id ? "text-indigo-400" : ""}>{s.icon}</span>
                        <span className="ml-2 font-cinzel tracking-wide">{s.name}</span>
                      </span>
                      {index < steps.length - 1 && !(isQuickMode && index === 2) && ( // Logic to hide separator if next is soundscape and we are in quick mode
                        <span className="hidden sm:inline-block mx-2 text-gray-700">/</span>
                      )}
                    </li>
                  )
                })}
              </ol>
            </nav>
            <main className="cinematic-glass rounded-2xl p-6 md:p-10 min-h-[60vh] relative overflow-hidden">
              {/* Decorative gradients */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

              {renderCreatorSteps()}
            </main>
          </>
        );
    }
  }

  const appTitle = "Cinematic Prompt Weaver";

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 selection:bg-indigo-500/30 ${isPastelMode ? 'bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 text-gray-800' : 'text-gray-100'}`}>
      {/* Global Background for Dark Mode */}
      {!isPastelMode && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px]"></div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 relative z-10">
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 py-4 border-b border-gray-800/50">
          <div className="flex items-center gap-4 mb-4 md:mb-0 cursor-pointer group" onClick={() => window.location.reload()}>
            <div className={`p-2 rounded-lg ${isPastelMode ? 'bg-pink-200 text-pink-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
              <FilmIcon />
            </div>
            <h1 className={`font-cinzel font-bold text-3xl tracking-wider ${isPastelMode ? 'text-gray-800' : 'cinematic-gradient-text'}`}>
              {appTitle}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {appMode === AppMode.CREATOR && (
              <button
                onClick={() => setIsQuickMode(!isQuickMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${isQuickMode ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}
                title="Skip optional steps for faster generation"
              >
                <LightningIcon /> {isQuickMode ? 'Quick Mode On' : 'Quick Mode Off'}
              </button>
            )}

            <button onClick={() => setIsPastelMode(!isPastelMode)} className={`p-2 rounded-full transition-all ${isPastelMode ? 'bg-pink-200 text-pink-600' : 'bg-gray-800 text-gray-400 hover:text-pink-400 hover:bg-gray-700'}`}>
              <HeartIcon />
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-full transition-all ${isPastelMode ? 'bg-pink-200 text-pink-600' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
              title="Settings"
            >
              <SettingsIcon />
            </button>
          </div>
        </header>

        {renderContent()}

        <footer className={`text-center mt-12 text-sm ${isPastelMode ? 'text-gray-500' : 'text-gray-600'}`}>
          <p className="font-cinzel">Crafted with <span className="text-red-500">♥</span> by Himanshu & Gemini</p>
        </footer>
      </div>

      <div className="fixed bottom-6 right-6 z-40">
        <button onClick={() => setIsChatOpen(!isChatOpen)} className={`text-white rounded-full p-4 shadow-lg shadow-indigo-500/20 transition-all hover:scale-110 hover:shadow-indigo-500/40 ${isPastelMode ? 'bg-pink-500 hover:bg-pink-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          <ChatIcon />
        </button>
      </div>

      <Chatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isThinking={isBotThinking}
        isPastelMode={isPastelMode}
      />

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default App;
