import { describe, it, expect, beforeEach, vi } from "vitest";
import type { StudentProfile } from "@/types/storage";

vi.mock("@/lib/repositories/student-repo", () => ({
  getOrCreateStudent: vi.fn().mockResolvedValue({
    id: "db-student-1",
    familyId: "fam-1",
    displayName: "Ana",
    avatar: "cat",
    currentLessonId: "lesson-1",
    createdAt: new Date("2025-01-01"),
  }),
  updateCurrentLesson: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/repositories/attempt-repo", () => ({
  addLessonAttemptToDB: vi.fn().mockImplementation((data) => ({
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  })),
  addSongAttemptToDB: vi.fn().mockImplementation((data) => ({
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  })),
}));

vi.mock("@/lib/auth", () => ({
  getFamilyId: vi.fn().mockResolvedValue("fam-1"),
}));

import { useAppStore } from "@/store/useAppStore";

const mockStudent: StudentProfile = {
  id: "student-1",
  displayName: "Ana",
  avatar: "cat",
  currentLessonId: "lesson-1",
  createdAt: "2025-01-01T00:00:00.000Z",
};

describe("useAppStore", () => {
  beforeEach(() => {
    useAppStore.setState({
      student: null,
      lessonAttempts: [],
      songAttempts: [],
      hydrated: false,
    });
  });

  it("has correct initial state", () => {
    const { student, lessonAttempts, songAttempts } = useAppStore.getState();
    expect(student).toBeNull();
    expect(lessonAttempts).toEqual([]);
    expect(songAttempts).toEqual([]);
  });

  it("hydrate sets data and hydrated flag", () => {
    useAppStore.getState().hydrate({
      student: mockStudent,
      lessonAttempts: [],
      songAttempts: [],
    });
    expect(useAppStore.getState().hydrated).toBe(true);
    expect(useAppStore.getState().student).toEqual(mockStudent);
  });

  it("setStudent calls server action and sets student from DB", async () => {
    await useAppStore.getState().setStudent(mockStudent);
    const s = useAppStore.getState().student;
    expect(s).toBeDefined();
    expect(s!.id).toBe("db-student-1");
    expect(s!.displayName).toBe("Ana");
  });

  it("setCurrentLessonId updates the current lesson", async () => {
    useAppStore.setState({ student: mockStudent });
    await useAppStore.getState().setCurrentLessonId("lesson-3");
    expect(useAppStore.getState().student?.currentLessonId).toBe("lesson-3");
  });

  it("clearStudent resets student to null", () => {
    useAppStore.setState({ student: mockStudent });
    useAppStore.getState().clearStudent();
    expect(useAppStore.getState().student).toBeNull();
  });

  it("addLessonAttempt adds an attempt via server action", async () => {
    await useAppStore.getState().addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-1",
      stars: 2,
      quizErrors: 1,
      completed: true,
      durationSeconds: 120,
    });

    const attempts = useAppStore.getState().lessonAttempts;
    expect(attempts).toHaveLength(1);
    expect(attempts[0].id).toBeDefined();
    expect(attempts[0].createdAt).toBeDefined();
    expect(attempts[0].stars).toBe(2);
    expect(attempts[0].lessonId).toBe("lesson-1");
  });

  it("getBestAttempt returns the attempt with highest stars", async () => {
    const { addLessonAttempt } = useAppStore.getState();

    await addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-1",
      stars: 1,
      quizErrors: 3,
      completed: true,
      durationSeconds: 200,
    });
    await addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-1",
      stars: 3,
      quizErrors: 0,
      completed: true,
      durationSeconds: 100,
    });
    await addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-1",
      stars: 2,
      quizErrors: 1,
      completed: true,
      durationSeconds: 150,
    });

    const best = useAppStore.getState().getBestAttempt("lesson-1");
    expect(best).toBeDefined();
    expect(best!.stars).toBe(3);
  });

  it("getBestAttempt returns undefined for unknown lessonId", () => {
    expect(useAppStore.getState().getBestAttempt("nonexistent")).toBeUndefined();
  });

  it("addSongAttempt adds a song attempt via server action", async () => {
    await useAppStore.getState().addSongAttempt({
      studentId: "student-1",
      songId: "song-1",
      fragmentId: "frag-1",
      completed: true,
      tempoPercent: 80,
      durationSeconds: 45,
    });

    const attempts = useAppStore.getState().songAttempts;
    expect(attempts).toHaveLength(1);
    expect(attempts[0].id).toBeDefined();
    expect(attempts[0].createdAt).toBeDefined();
    expect(attempts[0].songId).toBe("song-1");
  });

  it("getSongStars counts unique fragments and full-song completion", async () => {
    const { addSongAttempt } = useAppStore.getState();

    await addSongAttempt({
      studentId: "student-1",
      songId: "song-1",
      fragmentId: "frag-1",
      completed: true,
      tempoPercent: 50,
      durationSeconds: 20,
    });
    await addSongAttempt({
      studentId: "student-1",
      songId: "song-1",
      fragmentId: "frag-1",
      completed: true,
      tempoPercent: 75,
      durationSeconds: 18,
    });
    await addSongAttempt({
      studentId: "student-1",
      songId: "song-1",
      fragmentId: "frag-2",
      completed: true,
      tempoPercent: 75,
      durationSeconds: 22,
    });
    await addSongAttempt({
      studentId: "student-1",
      songId: "song-1",
      fragmentId: null,
      completed: true,
      tempoPercent: 100,
      durationSeconds: 40,
    });

    expect(useAppStore.getState().getSongStars("song-1")).toBe(3);
  });

  it("getTotalSongStars sums unique stars across songs", async () => {
    const { addSongAttempt } = useAppStore.getState();

    await addSongAttempt({
      studentId: "student-1",
      songId: "song-1",
      fragmentId: "frag-1",
      completed: true,
      tempoPercent: 50,
      durationSeconds: 12,
    });
    await addSongAttempt({
      studentId: "student-1",
      songId: "song-1",
      fragmentId: null,
      completed: true,
      tempoPercent: 100,
      durationSeconds: 25,
    });
    await addSongAttempt({
      studentId: "student-1",
      songId: "song-2",
      fragmentId: "frag-a",
      completed: true,
      tempoPercent: 75,
      durationSeconds: 15,
    });

    expect(useAppStore.getState().getTotalSongStars()).toBe(3);
  });

  it("getTotalStars sums best stars per completed lesson", async () => {
    const { addLessonAttempt } = useAppStore.getState();

    await addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-1",
      stars: 2,
      quizErrors: 1,
      completed: true,
      durationSeconds: 100,
    });
    await addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-1",
      stars: 3,
      quizErrors: 0,
      completed: true,
      durationSeconds: 90,
    });
    await addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-2",
      stars: 1,
      quizErrors: 2,
      completed: true,
      durationSeconds: 150,
    });
    await addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-3",
      stars: 2,
      quizErrors: 0,
      completed: false,
      durationSeconds: 60,
    });

    expect(useAppStore.getState().getTotalStars()).toBe(4);
  });

  it("getCompletedLessonIds returns only completed lesson IDs", async () => {
    const { addLessonAttempt } = useAppStore.getState();

    await addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-1",
      stars: 3,
      quizErrors: 0,
      completed: true,
      durationSeconds: 100,
    });
    await addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-2",
      stars: 0,
      quizErrors: 5,
      completed: false,
      durationSeconds: 50,
    });
    await addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-3",
      stars: 2,
      quizErrors: 1,
      completed: true,
      durationSeconds: 120,
    });

    const ids = useAppStore.getState().getCompletedLessonIds();
    expect(ids).toHaveLength(2);
    expect(ids).toContain("lesson-1");
    expect(ids).toContain("lesson-3");
    expect(ids).not.toContain("lesson-2");
  });

  it("isLessonCompleted returns correct boolean", async () => {
    await useAppStore.getState().addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-1",
      stars: 3,
      quizErrors: 0,
      completed: true,
      durationSeconds: 100,
    });

    expect(useAppStore.getState().isLessonCompleted("lesson-1")).toBe(true);
    expect(useAppStore.getState().isLessonCompleted("lesson-2")).toBe(false);
  });
});
