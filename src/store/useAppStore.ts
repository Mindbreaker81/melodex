import { create } from "zustand";
import type {
  AppState,
  StudentProfile,
  LessonAttempt,
  SongAttempt,
} from "@/types/storage";
import {
  getOrCreateStudent,
  updateCurrentLesson,
} from "@/lib/repositories/student-repo";
import {
  addLessonAttemptToDB,
  addSongAttemptToDB,
} from "@/lib/repositories/attempt-repo";
import { getFamilyId } from "@/lib/auth";

interface AppStore extends AppState {
  hydrated: boolean;
  hydrate: (data: AppState) => void;
  setStudent: (profile: StudentProfile) => Promise<void>;
  setCurrentLessonId: (lessonId: string) => Promise<void>;
  clearStudent: () => void;
  addLessonAttempt: (
    attempt: Omit<LessonAttempt, "id" | "createdAt">,
  ) => Promise<void>;
  getBestAttempt: (lessonId: string) => LessonAttempt | undefined;
  addSongAttempt: (
    attempt: Omit<SongAttempt, "id" | "createdAt">,
  ) => Promise<void>;
  getTotalStars: () => number;
  getSongStars: (songId: string) => number;
  getTotalSongStars: () => number;
  getCompletedLessonIds: () => string[];
  isLessonCompleted: (lessonId: string) => boolean;
}

export const useAppStore = create<AppStore>()((set, get) => ({
  student: null,
  lessonAttempts: [],
  songAttempts: [],
  hydrated: false,

  hydrate: (data) => set({ ...data, hydrated: true }),

  setStudent: async (profile) => {
    const familyId = await getFamilyId();
    if (!familyId) throw new Error("No autenticado");
    const dbStudent = await getOrCreateStudent(familyId, {
      displayName: profile.displayName,
      avatar: profile.avatar,
    });
    set({
      student: {
        id: dbStudent.id,
        displayName: dbStudent.displayName,
        avatar: dbStudent.avatar,
        currentLessonId: dbStudent.currentLessonId,
        createdAt: dbStudent.createdAt.toISOString(),
      },
    });
  },

  setCurrentLessonId: async (lessonId) => {
    const student = get().student;
    if (!student) return;
    set({ student: { ...student, currentLessonId: lessonId } });
    await updateCurrentLesson(student.id, lessonId);
  },

  clearStudent: () =>
    set({ student: null, lessonAttempts: [], songAttempts: [] }),

  addLessonAttempt: async (attempt) => {
    const saved = await addLessonAttemptToDB(attempt);
    set((state) => ({
      lessonAttempts: [...state.lessonAttempts, saved],
    }));
  },

  getBestAttempt: (lessonId) => {
    const attempts = get().lessonAttempts.filter(
      (a) => a.lessonId === lessonId,
    );
    if (attempts.length === 0) return undefined;
    return attempts.reduce((best, curr) =>
      curr.stars > best.stars ? curr : best,
    );
  },

  addSongAttempt: async (attempt) => {
    const saved = await addSongAttemptToDB(attempt);
    set((state) => ({
      songAttempts: [...state.songAttempts, saved],
    }));
  },

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
}));
