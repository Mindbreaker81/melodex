import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "@/store/useAppStore";
import type { StudentProfile } from "@/types/storage";

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
    });
  });

  it("has correct initial state", () => {
    const { student, lessonAttempts, songAttempts } = useAppStore.getState();
    expect(student).toBeNull();
    expect(lessonAttempts).toEqual([]);
    expect(songAttempts).toEqual([]);
  });

  it("setStudent sets the student profile", () => {
    useAppStore.getState().setStudent(mockStudent);
    expect(useAppStore.getState().student).toEqual(mockStudent);
  });

  it("setCurrentLessonId updates the current lesson", () => {
    useAppStore.getState().setStudent(mockStudent);
    useAppStore.getState().setCurrentLessonId("lesson-3");
    expect(useAppStore.getState().student?.currentLessonId).toBe("lesson-3");
  });

  it("clearStudent resets student to null", () => {
    useAppStore.getState().setStudent(mockStudent);
    useAppStore.getState().clearStudent();
    expect(useAppStore.getState().student).toBeNull();
  });

  it("addLessonAttempt adds an attempt with auto-generated id and createdAt", () => {
    useAppStore.getState().addLessonAttempt({
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

  it("getBestAttempt returns the attempt with highest stars", () => {
    const { addLessonAttempt } = useAppStore.getState();

    addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-1",
      stars: 1,
      quizErrors: 3,
      completed: true,
      durationSeconds: 200,
    });
    addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-1",
      stars: 3,
      quizErrors: 0,
      completed: true,
      durationSeconds: 100,
    });
    addLessonAttempt({
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

  it("addSongAttempt adds a song attempt with auto-generated id and createdAt", () => {
    useAppStore.getState().addSongAttempt({
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

  it("getSongStars counts unique fragments and full-song completion", () => {
    const { addSongAttempt } = useAppStore.getState();

    addSongAttempt({
      studentId: "student-1",
      songId: "song-1",
      fragmentId: "frag-1",
      completed: true,
      tempoPercent: 50,
      durationSeconds: 20,
    });
    addSongAttempt({
      studentId: "student-1",
      songId: "song-1",
      fragmentId: "frag-1",
      completed: true,
      tempoPercent: 75,
      durationSeconds: 18,
    });
    addSongAttempt({
      studentId: "student-1",
      songId: "song-1",
      fragmentId: "frag-2",
      completed: true,
      tempoPercent: 75,
      durationSeconds: 22,
    });
    addSongAttempt({
      studentId: "student-1",
      songId: "song-1",
      fragmentId: null,
      completed: true,
      tempoPercent: 100,
      durationSeconds: 40,
    });

    expect(useAppStore.getState().getSongStars("song-1")).toBe(3);
  });

  it("getTotalSongStars sums unique stars across songs", () => {
    const { addSongAttempt } = useAppStore.getState();

    addSongAttempt({
      studentId: "student-1",
      songId: "song-1",
      fragmentId: "frag-1",
      completed: true,
      tempoPercent: 50,
      durationSeconds: 12,
    });
    addSongAttempt({
      studentId: "student-1",
      songId: "song-1",
      fragmentId: null,
      completed: true,
      tempoPercent: 100,
      durationSeconds: 25,
    });
    addSongAttempt({
      studentId: "student-1",
      songId: "song-2",
      fragmentId: "frag-a",
      completed: true,
      tempoPercent: 75,
      durationSeconds: 15,
    });

    expect(useAppStore.getState().getTotalSongStars()).toBe(3);
  });

  it("getTotalStars sums best stars per completed lesson", () => {
    const { addLessonAttempt } = useAppStore.getState();

    addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-1",
      stars: 2,
      quizErrors: 1,
      completed: true,
      durationSeconds: 100,
    });
    addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-1",
      stars: 3,
      quizErrors: 0,
      completed: true,
      durationSeconds: 90,
    });
    addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-2",
      stars: 1,
      quizErrors: 2,
      completed: true,
      durationSeconds: 150,
    });
    addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-3",
      stars: 2,
      quizErrors: 0,
      completed: false,
      durationSeconds: 60,
    });

    expect(useAppStore.getState().getTotalStars()).toBe(4);
  });

  it("getCompletedLessonIds returns only completed lesson IDs", () => {
    const { addLessonAttempt } = useAppStore.getState();

    addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-1",
      stars: 3,
      quizErrors: 0,
      completed: true,
      durationSeconds: 100,
    });
    addLessonAttempt({
      studentId: "student-1",
      lessonId: "lesson-2",
      stars: 0,
      quizErrors: 5,
      completed: false,
      durationSeconds: 50,
    });
    addLessonAttempt({
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

  it("isLessonCompleted returns correct boolean", () => {
    useAppStore.getState().addLessonAttempt({
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
