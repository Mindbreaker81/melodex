import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AppHydrator } from "./AppHydrator";
import { useAppStore } from "@/store/useAppStore";
import { createEmptyAppState } from "@/types/storage";

describe("AppHydrator", () => {
  beforeEach(() => {
    useAppStore.setState({
      ...createEmptyAppState(),
      hydrated: false,
    });
  });

  it("hydrates the store with an empty app state when data is null", async () => {
    render(<AppHydrator data={null} />);

    await waitFor(() => {
      const state = useAppStore.getState();
      expect(state.hydrated).toBe(true);
      expect(state.student).toBeNull();
    });
  });

  it("re-hydrates when server sends student after login page already hydrated empty", async () => {
    useAppStore.setState({
      ...createEmptyAppState(),
      hydrated: true,
    });

    const serverData = {
      student: {
        id: "student-uuid",
        displayName: "Ana",
        avatar: "🎹",
        currentLessonId: "lesson-1",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      lessonAttempts: [],
      songAttempts: [],
    };

    render(<AppHydrator data={serverData} />);

    await waitFor(() => {
      const state = useAppStore.getState();
      expect(state.student).toEqual(serverData.student);
      expect(state.hydrated).toBe(true);
    });
  });
});
