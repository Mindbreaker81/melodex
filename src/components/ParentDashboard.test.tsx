import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ParentDashboard from "./ParentDashboard";
import type {
  StudentProfile,
  LessonAttempt,
  SongAttempt,
} from "@/types/storage";

const student: StudentProfile = {
  id: "student-1",
  displayName: "Ana",
  avatar: "🐱",
  currentLessonId: "lesson-2",
  createdAt: "2026-04-03T09:00:00.000Z",
};

const lessonAttempts: LessonAttempt[] = [
  {
    id: "lesson-attempt-1",
    studentId: "student-1",
    lessonId: "lesson-1",
    stars: 2,
    quizErrors: 1,
    completed: true,
    durationSeconds: 120,
    createdAt: "2026-04-03T10:00:00.000Z",
  },
];

const songAttempts: SongAttempt[] = [
  {
    id: "song-attempt-1",
    studentId: "student-1",
    songId: "song-estrellita",
    fragmentId: "estrellita-f1",
    completed: true,
    tempoPercent: 75,
    durationSeconds: 90,
    createdAt: "2026-04-03T10:12:00.000Z",
  },
];

describe("ParentDashboard", () => {
  it("shows the last session as a grouped practice session", () => {
    render(
      <ParentDashboard
        student={student}
        lessonAttempts={lessonAttempts}
        songAttempts={songAttempts}
        totalLessonStars={2}
        completedLessonIds={["lesson-1", "lesson-6"]}
      />,
    );

    expect(screen.getByText(/Actividades:/)).toBeInTheDocument();
    expect(
      screen.getByText(/Lección: Las teclas negras · Canción: Estrellita/),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => element?.textContent === "Intentos: 2"),
    ).toBeInTheDocument();
  });
});
