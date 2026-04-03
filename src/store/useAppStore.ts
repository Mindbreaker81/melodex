import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AppState,
  StudentProfile,
  LessonAttempt,
  SongAttempt,
} from "@/types/storage";

interface AppStore extends AppState {
  setStudent: (profile: StudentProfile) => void;
  clearStudent: () => void;
  addLessonAttempt: (attempt: Omit<LessonAttempt, "id" | "createdAt">) => void;
  getBestAttempt: (lessonId: string) => LessonAttempt | undefined;
  addSongAttempt: (attempt: Omit<SongAttempt, "id" | "createdAt">) => void;
  getTotalStars: () => number;
  getCompletedLessonIds: () => string[];
  isLessonCompleted: (lessonId: string) => boolean;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      student: null,
      lessonAttempts: [],
      songAttempts: [],

      setStudent: (profile) => set({ student: profile }),

      clearStudent: () => set({ student: null }),

      addLessonAttempt: (attempt) =>
        set((state) => ({
          lessonAttempts: [
            ...state.lessonAttempts,
            {
              ...attempt,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      getBestAttempt: (lessonId) => {
        const attempts = get().lessonAttempts.filter(
          (a) => a.lessonId === lessonId,
        );
        if (attempts.length === 0) return undefined;
        return attempts.reduce((best, curr) =>
          curr.stars > best.stars ? curr : best,
        );
      },

      addSongAttempt: (attempt) =>
        set((state) => ({
          songAttempts: [
            ...state.songAttempts,
            {
              ...attempt,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      getTotalStars: () => {
        const { lessonAttempts } = get();
        const bestByLesson = new Map<string, number>();
        for (const a of lessonAttempts) {
          if (!a.completed) continue;
          const current = bestByLesson.get(a.lessonId) ?? 0;
          if (a.stars > current) bestByLesson.set(a.lessonId, a.stars);
        }
        let total = 0;
        for (const stars of bestByLesson.values()) total += stars;
        return total;
      },

      getCompletedLessonIds: () => [
        ...new Set(
          get()
            .lessonAttempts.filter((a) => a.completed)
            .map((a) => a.lessonId),
        ),
      ],

      isLessonCompleted: (lessonId) =>
        get().lessonAttempts.some(
          (a) => a.lessonId === lessonId && a.completed,
        ),
    }),
    {
      name: "melodex-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
    },
  ),
);
