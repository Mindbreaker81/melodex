import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAppStore } from "@/store/useAppStore";
import Home from "./page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
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
    pushMock.mockReset();
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

  it("redirects to onboarding when hydrated and no student exists", async () => {
    useAppStore.setState({
      student: null,
      lessonAttempts: [],
      songAttempts: [],
      hydrated: true,
    });

    render(<Home />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/onboarding");
    });
  });
});
