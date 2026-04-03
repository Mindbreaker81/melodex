export type FingerNumber = 1 | 2 | 3 | 4 | 5;

export type StepType =
  | "intro"
  | "demo"
  | "find-note"
  | "play-real"
  | "sequence-quiz"
  | "song-fragment";

export type VisualHint =
  | "group-2-3"
  | "find-c"
  | "fingers-1-5"
  | "scale-up"
  | "song-fragment";

export interface LessonStep {
  id: string;
  type: StepType;
  instruction: string;
  targetNotes?: string[];
  fingers?: FingerNumber[];
  demoAudio?: string;
  image?: string;
  imageAlt?: string;
  visualHint?: VisualHint;
}

export interface Lesson {
  id: string;
  worldId: string;
  order: number;
  title: string;
  objective: string;
  estimatedMinutes: number;
  hand: "right" | "left";
  notesUsed: string[];
  steps: LessonStep[];
}

export interface SongFragment {
  id: string;
  notes: { note: string; finger: FingerNumber; durationMs: number }[];
}

export interface Song {
  id: string;
  title: string;
  difficulty: "easy" | "medium";
  requiredLessonId: string;
  fragments: SongFragment[];
  fullDemoAudio?: string;
}

export interface World {
  id: string;
  order: number;
  title: string;
  description: string;
  lessonIds: string[];
}

/** C3–C5 chromatic scale */
export const VALID_NOTES = [
  "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
  "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
  "C5",
] as const;

export const FINGER_COLORS: Record<FingerNumber, string> = {
  1: "#B91C1C",
  2: "#1D4ED8",
  3: "#166534",
  4: "#9A3412",
  5: "#5B21B6",
};

export const FINGER_TEXT_COLORS: Record<FingerNumber, string> = {
  1: "#FFFFFF",
  2: "#FFFFFF",
  3: "#FFFFFF",
  4: "#FFFFFF",
  5: "#FFFFFF",
};

export const FINGER_NAMES: Record<FingerNumber, string> = {
  1: "pulgar",
  2: "índice",
  3: "medio",
  4: "anular",
  5: "meñique",
};
