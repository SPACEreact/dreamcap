
export enum AppStep {
  STORY,
  VISION,
  SCENE,
  SOUNDSCAPE,
  PROMPTS,
}

export enum AppMode {
  SELECTION,
  CREATOR,
  SCRIPT_INPUT,
}

export interface Character {
  name: string;
  description: string;
}

export interface Setting {
  name: string;
  description: string;
}

export interface Story {
  title: string;
  logline: string;
  characters: Character[];
  setting: Setting;
}

export interface DirectorVision {
  genre: string;
  tone: string;
  colorPalette: string;
  inspirations: string;
}

export interface Shot {
  id: string;
  description: string;
  characterBlocking: string;
  shotType: string;
  cameraAngle: string;
  cameraMovement: string;
  focalLength: string;
  aperture: string;
  lightingStyle: string;
  colorGrade: string;
  composition: string;
  technicalSpecs: {
    camera: string;
    lighting: string;
    audio: string;
  };
  directorNotes: string;
}

export interface ChatMessage {
  sender: 'user' | 'gemini';
  text: string;
}

export interface ShotSoundDesign {
  shotId: string;
  score: string;
  sfx: string;
  ambience: string;
}

export type Soundscape = ShotSoundDesign[];
