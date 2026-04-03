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
});
