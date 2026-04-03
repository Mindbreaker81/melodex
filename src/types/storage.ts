export interface StudentProfile {
  id: string;
  displayName: string;
  avatar: string;
  currentLessonId: string;
  createdAt: string;
}

export interface LessonAttempt {
  id: string;
  studentId: string;
  lessonId: string;
  stars: number;
  quizErrors: number;
  completed: boolean;
  durationSeconds: number | null;
  createdAt: string;
}

export interface SongAttempt {
  id: string;
  studentId: string;
  songId: string;
  fragmentId: string | null;
  completed: boolean;
  tempoPercent: number;
  durationSeconds: number | null;
  createdAt: string;
}

export interface AppState {
  student: StudentProfile | null;
  lessonAttempts: LessonAttempt[];
  songAttempts: SongAttempt[];
}

export const EMPTY_APP_STATE: AppState = {
  student: null,
  lessonAttempts: [],
  songAttempts: [],
};

export function createEmptyAppState(): AppState {
  return {
    student: null,
    lessonAttempts: [],
    songAttempts: [],
  };
}
