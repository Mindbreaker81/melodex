import { describe, expect, it } from "vitest";
import { buildPracticeSessions } from "./session-utils";
import type { LessonAttempt, SongAttempt } from "@/types/storage";

const lessonAttempt = (
  overrides: Partial<LessonAttempt> = {},
): LessonAttempt => ({
  id: "lesson-attempt-1",
  studentId: "student-1",
  lessonId: "lesson-1",
  stars: 2,
  quizErrors: 0,
  completed: true,
  durationSeconds: 120,
  createdAt: "2026-04-03T10:00:00.000Z",
  ...overrides,
});

const songAttempt = (
  overrides: Partial<SongAttempt> = {},
): SongAttempt => ({
  id: "song-attempt-1",
  studentId: "student-1",
  songId: "song-estrellita",
  fragmentId: "estrellita-f1",
  completed: true,
  tempoPercent: 75,
  durationSeconds: 90,
  createdAt: "2026-04-03T10:15:00.000Z",
  ...overrides,
});

describe("buildPracticeSessions", () => {
  it("groups nearby lesson and song attempts into one session", () => {
    const sessions = buildPracticeSessions(
      [lessonAttempt()],
      [songAttempt()],
    );

    expect(sessions).toHaveLength(1);
    expect(sessions[0].attemptCount).toBe(2);
    expect(sessions[0].durationSeconds).toBe(210);
    expect(sessions[0].activities).toEqual([
      { type: "lesson", id: "lesson-1" },
      { type: "song", id: "song-estrellita" },
    ]);
  });

  it("splits sessions when the gap is greater than 30 minutes", () => {
    const sessions = buildPracticeSessions(
      [lessonAttempt()],
      [
        songAttempt({
          createdAt: "2026-04-03T11:00:01.000Z",
        }),
      ],
    );

    expect(sessions).toHaveLength(2);
    expect(sessions[0].attemptCount).toBe(1);
    expect(sessions[1].attemptCount).toBe(1);
  });
});
