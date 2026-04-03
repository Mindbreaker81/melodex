import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAppStore } from "@/store/useAppStore";
import Home from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
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
    });
  });

  it("renders the greeting when student exists", () => {
    render(<Home />);
    expect(screen.getByText("¡Hola, Test!")).toBeInTheDocument();
  });
});
