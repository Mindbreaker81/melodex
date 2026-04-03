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
  setCurrentLessonId: (lessonId: string) => void;
  clearStudent: () => void;
  addLessonAttempt: (attempt: Omit<LessonAttempt, "id" | "createdAt">) => void;
  getBestAttempt: (lessonId: string) => LessonAttempt | undefined;
  addSongAttempt: (attempt: Omit<SongAttempt, "id" | "createdAt">) => void;
  getTotalStars: () => number;
  getSongStars: (songId: string) => number;
  getTotalSongStars: () => number;
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

      setCurrentLessonId: (lessonId) =>
        set((state) =>
          state.student
            ? { student: { ...state.student, currentLessonId: lessonId } }
            : {},
        ),

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

      getSongStars: (songId) => {
        const attempts = get().songAttempts.filter(
          (attempt) => attempt.songId === songId && attempt.completed,
        );
        const completedFragments = new Set(
          attempts
            .filter((attempt) => attempt.fragmentId !== null)
            .map((attempt) => attempt.fragmentId as string),
        );
        const fullSongCompleted = attempts.some(
          (attempt) => attempt.fragmentId === null,
        );
        return completedFragments.size + (fullSongCompleted ? 1 : 0);
      },

      getTotalSongStars: () => {
        const songProgress = new Map<
          string,
          { fragments: Set<string>; fullSongCompleted: boolean }
        >();

        for (const attempt of get().songAttempts) {
          if (!attempt.completed) continue;

          const current = songProgress.get(attempt.songId) ?? {
            fragments: new Set<string>(),
            fullSongCompleted: false,
          };

          if (attempt.fragmentId) {
            current.fragments.add(attempt.fragmentId);
          } else {
            current.fullSongCompleted = true;
          }

          songProgress.set(attempt.songId, current);
        }

        let total = 0;
        for (const progress of songProgress.values()) {
          total += progress.fragments.size;
          if (progress.fullSongCompleted) total += 1;
        }
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
