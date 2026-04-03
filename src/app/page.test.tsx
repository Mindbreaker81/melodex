import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAppStore } from "@/store/useAppStore";
import Home from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/repositories/student-repo", () => ({
  getOrCreateStudent: vi.fn(),
  updateCurrentLesson: vi.fn(),
}));

vi.mock("@/lib/repositories/attempt-repo", () => ({
  addLessonAttemptToDB: vi.fn(),
  addSongAttemptToDB: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getFamilyId: vi.fn().mockResolvedValue("fam-1"),
}));

describe("Home", () => {
  beforeEach(() => {
    useAppStore.setState({
      student: {
        id: "test-id",
        displayName: "Test",
        avatar: "🎹",
        currentLessonId: "lesson-1",
        createdAt: new Date().toISOString(),
      },
      lessonAttempts: [],
      songAttempts: [],
      hydrated: true,
    });
  });

  it("renders the greeting when student exists", () => {
    render(<Home />);
    expect(screen.getByText("¡Hola, Test!")).toBeInTheDocument();
  });
});
