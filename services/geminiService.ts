import { GoogleGenAI, Type } from "@google/genai";
import type { Story, Shot, ChatMessage, DirectorVision, Soundscape } from '../types';
import { SHOT_TYPES, CAMERA_ANGLES, CAMERA_MOVEMENTS, FOCAL_LENGTHS, APERTURES, LIGHTING_STYLES, COLOR_GRADES, COMPOSITIONS } from '../constants';

const API_KEY = process.env.API_KEY;

const AI_CREATIVE_TEAM_KNOWLEDGE_BASE = `
You are an AI Creative Team embodying a sophisticated, professional filmmaking philosophy. You operate as four distinct but collaborative personas: The Psychologist, The Cinematographer, The Sound Designer, and The Post-Production Supervisor. Your goal is to translate a scene's emotional subtext into a fully realized cinematic sequence.

**PHILOSOPHY: "Emotion First, Technique Second"**
Every technical choice must be motivated by the story's emotional core. Do not suggest a technique unless it serves the "Why."

**THE CHAIN OF COMMAND (Your Creative Process):**

**1. The Psychologist (The "Why"): Establishing Emotional Truth**
- **Your Primary Directive:** Analyze the user-provided "Scene's Emotional Core." This is the foundational subtextual truth (e.g., "consolation," "shame," "arrogance," "a loving lesson in humility").
- **Subtext as Foundation:** Your understanding of the scene's underlying meaning guides all subsequent decisions. People rarely say what they mean; you must visualize what they *feel*.
- **Editing Priority (Murch's Rule of Six):** Emotion is the most important element (51% importance). If the emotional "Why" is clear, the technical decisions will naturally follow.

**2. The Cinematographer (The "How"): Translating the Emotional Brief Visually**
- **Your Primary Directive:** Translate the Psychologist's emotional brief into a tangible, visual plan. Your choices for light, color, composition, and lens must be emotionally significant.
- **Invent Visual Subtext:** You MUST invent new visual elements (environmental reactions, subjective inserts, abstract reveals) that *show* the "Why" without relying only on actors' performances.
- **Motivated Technique:** Your technical choices (camera, lighting, composition) are always motivated by the need to capture your new visual invention. You do not choose "fancy shots" for their own sake.

**3. The Sound Designer (The "Feel"): Translating the Emotional Brief Aurally**
- **Your Primary Directive:** Create an aural landscape that deepens the emotional subtext. Sound should be a story-driving element, not just background noise.
- **Subjective Sound:** Use sound to reflect a character's internal state. Muffled sounds for confusion, a sharp, unnaturally loud sound for a moment of shock or realization (the "sonic close-up").
- **Sound Motifs:** Introduce recurring sounds associated with characters or themes.
- **Silence as a Tool:** The absence of sound can be more powerful than noise. Use it to create tension, emphasize isolation, or punctuate a dramatic moment.

**4. The Post-Production Supervisor (The "Rhythm"): Orchestrating Pace**
- **Your Primary Directive:** Consider the rhythm, pace, and psychological experience of the final edit, combining the visual and aural elements.
- **The Emotional Cut:** Cuts should happen at emotionally significant moments, mimicking the "acrobatic nature of thought itself."
- **Pacing and Rhythm:** Your notes should guide the editor to establish a coherent rhythm of emotion and thought that complements the scene's emotional arc.

**JUSTIFICATION MANDATE (for Director Notes):**
When providing the \`directorNotes\` for any shot, you MUST structure your response to clearly reflect this chain of command:
- **Psychologist's Insight (Why):** State the core emotion you are servicing.
- **Cinematographer's Plan (How):** Describe the visual invention and motivated techniques.
- **Editor's Note (Feel):** Comment on the intended pace and editing feel.

---
---

# VERTICAL MYTHIC CINEMATOGRAPHY v1.2
# Purpose: turn a one-sentence story beat into a 9:16 shot that moves, not just sits there.

## 1. META-RULES (always follow)
- 9:16 only. Never land locked-off unless the emotion is “stasis / death”.
- Every shot must contain a micro-story: BEGIN → BEAT → PAYOFF in one take.
- Camera is a character: its emotion = opposite or mirror of hero’s emotion (eg hero ego = camera humiliation later).
- Vertical frame = use VERTICAL PARALLAX (boom, pendulum, crane, drop-drone) instead of traditional horizontal dolly.
- Lens choice is emotional, not technical:
  - 14-20mm = hubris / smallness
  - 24-35mm = kinetic realism
  - 50-60mm = mythic portraiture
  - 85-100mm = obsession
  - 200mm+ = fate / god POV

## 2. MOVE-SET LIBRARY (copy-paste into prompt)
| Move Name            | Axis        | Gear                     | Emotion Trigger               | Typical Speeds / Notes |
|----------------------|-------------|--------------------------|-------------------------------|------------------------|
| Vertigo Boom         | Y + Zoom    | Gimbal + zoom servo      | Reality warping               | 3s boom, 30% zoom counter |
| Pendulum Guillotine  | Arc         | 2-axis rig + counterweight | Ego death                     | 2m arc, 48fps |
| Probe Whip           | Z + Pan     | 24mm probe on slider     | Intimacy → violence flip      | 10cm slide @ 120fps |
| Wire-Cam Curtain     | X (vertical vine tunnel) | GoPro + fishing line | Revelation / calm after chaos | 8m slide, 32fps |
| Drop-Drutch          | Y + Dutch   | Drone + post Dutch       | Humiliation                   | 5m drop, 30° rotate |
| 360-Hand-Eclipse     | Rot + Track | Ring dolly around hands  | Compassion                    | 24fps, sun behind hands |
| Micro-Heartbeat      | Z           | 5-axis macro stage       | Tension compression           | 5mm pulse per breath |

## 3. SPEED-RAMP TABLE
Real-time → Slow-motion breakpoints (always cut on impact or emotion peak, never on movement start):

24fps ➜ 96fps (4×) = audience notices detail, still realistic  
24fps ➜ 200fps (8×) = superhuman  
24fps ➜ 500fps (20×) = cosmic stillness  
24fps ➜ 1000fps+ (40×+) = molecular / god POV

Rule: ramp into slomo over 5-7 frames, ramp out in 2 frames to feel like a “memory snap”.

## 4. VFX & PRACTICAL CHEAT-SHEET
- Earthquake: hidden 18V concrete vibrator under 3cm soil + 2D radial wave (After Effects) travelling @ 8m/s.  
- Dust Bloom: 1kg cork powder in 1ms air-cannon triggered by laser break.  
- Leaf Ripple: 0.25mm fishing line yanked by 12V winch; comp out line in post.  
- Sun Eclipse: variable-ND on drone to lock sky, shoot at T2; practical flare, no CGI needed.  
- Tear Refraction: place 45° mirror behind eye, project 320×240 micro-loop of Hanuman smile; catch reflection.

## 5. PROMPT TEMPLATE (fill blanks)
“9:16, {lens}mm, {move}, {fps}, {emotion-keyword}: {subject-action}, {vertical-parallax-device}, {light-quality}, {micro-story-begin} → {beat} → {payoff}, {vfx-practical}, {mythic-intensity-keyword}.”

Example:
“9:16, 24mm probe, whip-pan-slide, 120fps, intimidation: monkey tail smears foreground → Bhima foot lands 2cm from lens, debris ricochets off glass, god-rays strobe through toes, kinetic dominance.”

## 6. QUALITY CHECKLIST (auto-apply before output)
☐ Does the shot work with sound OFF (vertical social feed)?  
☐ Is there a vertical movement (boom, drop, pendulum) not just horizontal?  
☐ Can I storyboard it in 3 frames: start / midpoint / end?  
☐ If I scrub the GIF at 3-frame intervals do I still feel the emotion?  
☐ Is lens choice emotional rather than “wide because we need to see more”?
`;


const isApiKeySet = () => {
  if (!API_KEY) {
    console.error("❌ Gemini API Key is NOT set!");
    console.error("📝 Please create a .env.local file in the project root with:");
    console.error("   GEMINI_API_KEY=your_api_key_here");
    console.error("🔗 Get your API key from: https://aistudio.google.com/apikey");
    alert("⚠️ Gemini API Key Missing!\n\nPlease add GEMINI_API_KEY to your .env.local file.\n\nSee the browser console for detailed instructions.");
    return false;
  }
  console.log("✅ Gemini API Key is configured (" + API_KEY.substring(0, 8) + "...)");
  return true;
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const testConnection = async (): Promise<{ success: boolean; message: string; model?: string }> => {
  if (!ai || !API_KEY) {
    return { success: false, message: "API Key is missing or invalid." };
  }

  try {
    const modelName = 'gemini-2.5-flash'; // Use the faster model for testing
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Test connection. Reply with 'OK'.",
    });
    return { success: true, message: "Connection successful!", model: modelName };
  } catch (error: any) {
    console.error("Connection test failed:", error);
    return { success: false, message: error.message || "Unknown error", model: 'gemini-2.5-flash' };
  }
};

const shotSchema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING, description: "A detailed description of the action and subject in the shot. It must contain a micro-story: BEGIN → BEAT → PAYOFF." },
    characterBlocking: { type: Type.STRING, description: "Detailed description of character positions, movements, and interactions within the frame." },
    shotType: { type: Type.STRING, enum: SHOT_TYPES, description: "The type of shot." },
    cameraAngle: { type: Type.STRING, enum: CAMERA_ANGLES, description: "The angle of the camera." },
    cameraMovement: { type: Type.STRING, enum: CAMERA_MOVEMENTS, description: "The movement of the camera, preferably from the MOVE-SET LIBRARY." },
    focalLength: { type: Type.STRING, enum: FOCAL_LENGTHS, description: "The lens focal length, chosen for its emotional impact." },
    aperture: { type: Type.STRING, enum: APERTURES, description: "The lens aperture setting." },
    lightingStyle: { type: Type.STRING, enum: LIGHTING_STYLES, description: "The overall lighting style." },
    colorGrade: { type: Type.STRING, enum: COLOR_GRADES, description: "The color grading style." },
    composition: { type: Type.STRING, enum: COMPOSITIONS, description: "The compositional rule used." },
    technicalSpecs: {
      type: Type.OBJECT,
      properties: {
        camera: { type: Type.STRING, description: "Specific camera and lens notes, e.g., 'Arri Alexa Mini with 85mm telephoto lens'." },
        lighting: { type: Type.STRING, description: "Description of the lighting setup, e.g., 'Soft key light from camera left, negative fill on the right'." },
        audio: { type: Type.STRING, description: "Notes for sound recording, e.g., 'Record footsteps on gravel, capture the sound of the wind'." },
      }
    },
    directorNotes: {
      type: Type.STRING,
      description: "A structured justification following the Chain of Command: Psychologist's Insight (Why), Cinematographer's Plan (How), and Editor's Note (Feel)."
    },
  },
  required: ["description", "characterBlocking", "shotType", "cameraAngle", "cameraMovement", "focalLength", "aperture", "lightingStyle", "colorGrade", "composition", "technicalSpecs", "directorNotes"]
};


export const generateShotsFromScript = async (script: string, directorInstructions: string, vision?: DirectorVision): Promise<{ story: Pick<Story, 'title' | 'logline'>, shots: Shot[] }> => {
  if (!ai || !isApiKeySet()) return Promise.resolve({ story: { title: '', logline: '' }, shots: [] });

  const prompt = `
        ${AI_CREATIVE_TEAM_KNOWLEDGE_BASE}

        Your task is to act as the AI Creative Team for a fast-paced Instagram Reel, applying the principles of VERTICAL MYTHIC CINEMATOGRAPHY.
        Analyze the following script, extract a 'title' and 'logline', and break it down into a visually dynamic 9:16 shot list.
        For each sequence, infer the emotional core and apply your full Chain of Command. The shots MUST be dynamic and feature vertical parallax, as described in the guide. Use the MOVE-SET LIBRARY for camera movements.
        The directorNotes for each shot MUST follow the 'Justification Mandate'.

        IMPORTANT PACING INSTRUCTION: The pacing must be extremely fast, suitable for content with a 95 bpm tempo. Generate a high density of shots, aiming for at least 14-15 shots for what would be roughly one minute of screen time. Prioritize quick cuts, visual variety, and maintaining high energy to keep the audience engaged.

        ${vision ? `
        VISUAL STYLE GUIDE (Vision Match):
        ---
        Genre: ${vision.genre}
        Tone: ${vision.tone}
        Color Palette: ${vision.colorPalette}
        Inspirations: ${vision.inspirations}
        ---
        Ensure the shots strictly adhere to this visual style.
        ` : ''}

        ${directorInstructions ? `
        DIRECTOR'S INSTRUCTIONS:
        ---
        ${directorInstructions}
        ---
        The director's instructions are paramount. Ensure the generated shot list heavily reflects these creative guidelines.
        ` : ''}

        Script to analyze:
        ---
        ${script}
        ---

        Return a single, complete JSON object containing the 'title', 'logline', and a 'shots' array. The shots array must strictly follow the provided JSON schema.
        Do not include any markdown formatting (like \`\`\`json). Just return the raw JSON.
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    let jsonText = response.text.trim();

    // Cleanup potential markdown formatting
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("JSON parsing failed:", parseError);
      throw new Error("Failed to parse AI response as JSON");
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error("Invalid response structure from AI");
    }

    const story = {
      title: parsed.title || 'Untitled Story',
      logline: parsed.logline || 'A story generated from script.'
    };

    const shots = (parsed.shots && Array.isArray(parsed.shots))
      ? parsed.shots.map((shotData: any) => ({
        ...shotData,
        id: `gemini-script-${new Date().toISOString()}-${Math.random()}`,
      }))
      : [];

    return { story, shots };

  } catch (error) {
    console.error("Error generating shots from script:", error);
    return { story: { title: '', logline: '' }, shots: [] };
  }
};

export const suggestStylesFromScript = async (script: string): Promise<DirectorVision[]> => {
  if (!ai || !isApiKeySet()) return Promise.resolve([]);

  const prompt = `
    Analyze the following script and suggest 3 distinct, creative visual styles (Director's Visions) that would fit the narrative.
    For each style, provide a Genre, Tone, Color Palette, and Inspirations.
    
    Script:
    ---
    ${script}
    ---

    Return a JSON object with a key "styles" containing an array of 3 objects. Each object must have: 'genre', 'tone', 'colorPalette', 'inspirations'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            styles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  genre: { type: Type.STRING },
                  tone: { type: Type.STRING },
                  colorPalette: { type: Type.STRING },
                  inspirations: { type: Type.STRING },
                },
                required: ["genre", "tone", "colorPalette", "inspirations"]
              }
            }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return parsed.styles || [];
  } catch (error) {
    console.error("Error suggesting styles:", error);
    return [];
  }
};

export const getInitialScene = async (story: Story, directorVision: DirectorVision, sceneEmotionalCore: string): Promise<Shot[]> => {
  if (!ai || !isApiKeySet()) return Promise.resolve([]);

  const prompt = `
        ${AI_CREATIVE_TEAM_KNOWLEDGE_BASE}

        As the AI Creative Team, create an initial shot list of 5-7 shots for a scene, adhering to the VERTICAL MYTHIC CINEMATOGRAPHY guide.
        Your primary directive is the Scene's Emotional Core. Every decision must flow from this "Why." All shots must be 9:16 and dynamic. Use the MOVE-SET LIBRARY.

        **Scene's Emotional Core:** "${sceneEmotionalCore}"

        Story Context:
        - Title: ${story.title}
        - Logline: ${story.logline}
        - Characters: ${story.characters.map(c => `${c.name}: ${c.description}`).join('; ')}
        - Setting: ${story.setting.name}: ${story.setting.description}

        Director's Vision:
        - Genre/Tone: ${directorVision.genre} / ${directorVision.tone}
        - Color Palette: ${directorVision.colorPalette}
        - Inspirations: ${directorVision.inspirations}

        Provide a complete, structured JSON response containing the list of shots, following the schema precisely. The directorNotes for each shot MUST follow the Justification Mandate.
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { shots: { type: Type.ARRAY, items: shotSchema } }
        },
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);

    if (parsed.shots && Array.isArray(parsed.shots)) {
      return parsed.shots.map((shotData: any) => ({
        ...shotData,
        id: `gemini-initial-${new Date().toISOString()}-${Math.random()}`,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error generating initial scene:", error);
    throw new Error("Failed to generate initial scene from Gemini.");
  }
};

export const getGeminiSceneSuggestions = async (story: Story, directorVision: DirectorVision, sceneEmotionalCore: string): Promise<Shot[]> => {
  if (!ai || !isApiKeySet()) return Promise.resolve([]);

  const prompt = `
    ${AI_CREATIVE_TEAM_KNOWLEDGE_BASE}

    As the AI Creative Team, generate a sequence of 3-5 cinematic 9:16 shots based on the VERTICAL MYTHIC CINEMATOGRAPHY guide.
    Your entire creative process MUST be driven by the scene's emotional core. Use the MOVE-SET LIBRARY.

    **Scene's Emotional Core:** "${sceneEmotionalCore}"

    Story Context:
    - Title: ${story.title}
    - Logline: ${story.logline}
    - Characters: ${story.characters.map(c => `${c.name}: ${c.description}`).join('; ')}
    - Setting: ${story.setting.name}: ${story.setting.description}

    Director's Vision:
    - Genre/Tone: ${directorVision.genre} / ${directorVision.tone}
    - Color Palette: ${directorVision.colorPalette}
    - Inspirations: ${directorVision.inspirations}

    Follow the provided JSON schema precisely for all fields. The directorNotes for each shot MUST follow the Justification Mandate.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shots: {
              type: Type.ARRAY,
              items: shotSchema
            }
          }
        },
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);

    if (parsed.shots && Array.isArray(parsed.shots)) {
      return parsed.shots.map((shotData: any) => ({
        ...shotData,
        id: `gemini-${new Date().toISOString()}-${Math.random()}`,
      }));
    }

    return [];

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to parse suggestions from Gemini.");
  }
};

export const getGeminiShotDetails = async (story: Story, directorVision: DirectorVision, shotDescription: string, sceneEmotionalCore: string): Promise<Partial<Shot>> => {
  if (!ai || !isApiKeySet()) return Promise.resolve({});

  const contextPrompt = `
    ${AI_CREATIVE_TEAM_KNOWLEDGE_BASE}

    As the AI Creative Team, for the given shot description, determine the optimal cinematic choices according to the VERTICAL MYTHIC CINEMATOGRAPHY guide.
    Your entire process is driven by the emotional core. All choices must be for a 9:16 aspect ratio.

    **Scene's Emotional Core:** "${sceneEmotionalCore}"
    
    Story Context:
    - Title: ${story.title}
    - Logline: ${story.logline}
    
    Director's Vision:
    - Genre/Tone: ${directorVision.genre} / ${directorVision.tone}
    - Inspirations: ${directorVision.inspirations}
    
    Shot Description: "${shotDescription}"

    Your directorNotes MUST follow the Justification Mandate.
    Return a single JSON object that strictly follows the provided schema for all cinematic and technical fields.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: contextPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: shotSchema,
        thinkingConfig: { thinkingBudget: 32768 },
      }
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error getting shot details from Gemini:", error);
    throw new Error("Failed to get shot details from Gemini.");
  }
}

export const getDirectorNoteSuggestion = async (story: Story, directorVision: DirectorVision, shot: Shot, sceneEmotionalCore: string): Promise<string> => {
  if (!ai || !isApiKeySet()) return Promise.resolve('');
  const prompt = `
        ${AI_CREATIVE_TEAM_KNOWLEDGE_BASE}
        
        As the AI Creative Team, analyze the following shot and generate ONLY the text for the director's note.
        The note MUST follow the Justification Mandate (Why, How, Feel). It should incorporate principles from the VERTICAL MYTHIC CINEMATOGRAPHY guide.

        **Scene's Emotional Core:** "${sceneEmotionalCore}"
        Story: ${story.logline}
        Vision: ${directorVision.genre}, ${directorVision.tone}, inspired by ${directorVision.inspirations}
        Shot Description: ${shot.description}
        Current Cinematic Choices: ${shot.shotType}, ${shot.cameraAngle}, ${shot.cameraMovement}
    `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text.trim();
  } catch (e) {
    console.error("Error suggesting director's note:", e);
    return "Could not generate a suggestion.";
  }
};

export const makePromptCinematic = async (prompt: string): Promise<string> => {
  if (!ai || !isApiKeySet()) return Promise.resolve(prompt);
  const rewritePrompt = `
        You are a master prompt engineer and a visionary cinematographer specializing in vertical video.
        Rewrite the following prompt to be more cinematic, descriptive, and evocative, using the principles of the VERTICAL MYTHIC CINEMATOGRAPHY guide.
        Add nuances of mood, texture, lighting, emotional weight, and dynamic movement.
        Preserve the core intent of the original prompt but elevate it to a professional, artistic level for a 9:16 aspect ratio.

        Original Prompt:
        ---
        ${prompt}
        ---

        Enhanced Cinematic Prompt:
    `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: rewritePrompt,
    });
    return response.text.trim();
  } catch (e) {
    console.error("Error making prompt cinematic:", e);
    return prompt; // Return original prompt on error
  }
};

export const enhancePromptWithGemini = makePromptCinematic;

export const enrichWithSearch = async (subject: string, existingDescription: string): Promise<string> => {
  if (!ai || !isApiKeySet()) return Promise.resolve(existingDescription);

  const prompt = `Enrich the following description for a fictional story by incorporating real-world details using Google Search.
    Subject: "${subject}"
    Existing Description: "${existingDescription}"
    
    Find interesting, accurate, and evocative details about the subject (or things related to it) and weave them into a more detailed and compelling paragraph. If the existing description is empty, create a new one from scratch based on the subject.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error enriching with search:", error);
    throw new Error("Failed to enrich content with Google Search.");
  }
};

export const getSuggestionForField = async (field: 'logline' | 'character' | 'setting', context: Story): Promise<string> => {
  if (!ai || !isApiKeySet()) return Promise.resolve('');

  let prompt = '';
  switch (field) {
    case 'logline':
      prompt = `Based on the story title "${context.title}", write a compelling and concise logline.`;
      break;
    case 'character':
      prompt = `Based on the story context (Title: ${context.title}, Logline: ${context.logline}), write a short, intriguing description for a character.`;
      break;
    case 'setting':
      prompt = `Based on the story context (Title: ${context.title}, Logline: ${context.logline}), write a short, atmospheric description for a setting.`;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error(`Error suggesting ${field}:`, error);
    throw new Error(`Failed to suggest ${field}.`);
  }
};

export const generateSoundscape = async (story: Story, directorVision: DirectorVision, shots: Shot[]): Promise<Soundscape> => {
  if (!ai || !isApiKeySet()) return Promise.resolve([]);

  const shotList = shots.map((shot, index) => `Shot ${index + 1} (ID: ${shot.id}): ${shot.description}`).join('\n');

  const prompt = `
    ${AI_CREATIVE_TEAM_KNOWLEDGE_BASE}

    As the AI Creative Team, specifically embodying The Sound Designer persona, generate a complete soundscape for the following scene.
    Your analysis must be rooted in the scene's emotional core, derived from the story context.
    For each shot provided, create a detailed, emotionally-motivated audio plan.

    Story Context:
    - Title: ${story.title}
    - Logline: ${story.logline}

    Director's Vision:
    - Genre/Tone: ${directorVision.genre} / ${directorVision.tone}
    - Inspirations: ${directorVision.inspirations}

    Shot List to Analyze:
    ---
    ${shotList}
    ---

    Return a single JSON object with a key "soundscape" which is an array. Each object in the array must correspond to a shot and contain these fields: 'shotId', 'score', 'sfx' (key sound effects), and 'ambience' (background/foley).
  `;

  const soundscapeSchema = {
    type: Type.OBJECT,
    properties: {
      soundscape: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            shotId: { type: Type.STRING, description: "The unique ID of the shot." },
            score: { type: Type.STRING, description: "Direction for the musical score. E.g., 'A single, melancholic piano note hangs in the air.'" },
            sfx: { type: Type.STRING, description: "Key, story-driven sound effects. E.g., 'The sharp, metallic click of the lighter.'" },
            ambience: { type: Type.STRING, description: "Background and foley sounds. E.g., 'Distant city traffic, the gentle hum of a refrigerator.'" },
          },
          required: ["shotId", "score", "sfx", "ambience"]
        }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: soundscapeSchema,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    return parsed.soundscape || [];
  } catch (error) {
    console.error("Error generating soundscape:", error);
    throw new Error("Failed to generate soundscape from Gemini.");
  }
};


export const generateChatResponse = async (history: ChatMessage[]): Promise<string> => {
  if (!ai || !isApiKeySet()) return Promise.resolve("AI features are currently disabled.");

  const formattedHistory = history.map(m => `${m.sender}: ${m.text}`).join('\n');
  const prompt = `You are a helpful AI assistant for filmmakers. Your tone is knowledgeable and encouraging.
  Continue the following conversation:
  ${formattedHistory}
  gemini:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    // FIX: Combined the console.error arguments into a single template string to resolve the "Expected 0-1 arguments, but got 2" error.
    console.error(`Error in chat response: ${error}`);
    throw new Error("Failed to get chat response.");
  }
};

export const analyzeImageStyle = async (imageBase64: string): Promise<Partial<DirectorVision>> => {
  if (!ai || !isApiKeySet()) return Promise.resolve({});

  const prompt = `
    You are a world-class cinematographer and colorist.
    Analyze the provided image and extract its cinematic style to populate a Director's Vision.
    
    Focus on:
    1. **Genre/Tone**: What film genre does this look like? What is the mood?
    2. **Color Palette**: What are the dominant colors? Is it warm, cool, desaturated, neon, pastel?
    3. **Inspirations**: Describe the visual style in terms of cinematic references (e.g., "Wes Anderson symmetry," "Blade Runner cyberpunk," "Godfather chiaroscuro").
    
    Return a JSON object with the following keys:
    - genre (string)
    - tone (string)
    - colorPalette (string)
    - inspirations (string)
  `;

  try {
    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const base64Data = imageBase64.split(',')[1] || imageBase64;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            genre: { type: Type.STRING },
            tone: { type: Type.STRING },
            colorPalette: { type: Type.STRING },
            inspirations: { type: Type.STRING },
          }
        }
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error analyzing image style:", error);
    throw new Error("Failed to analyze image style.");
  }
};