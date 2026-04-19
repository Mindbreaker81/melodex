"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { createEmptyAppState } from "@/types/storage";
import type { AppState } from "@/types/storage";

export function AppHydrator({ data }: { data: AppState | null }) {
  const hydrate = useAppStore((s) => s.hydrate);
  const hydrated = useAppStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) {
      hydrate(data ?? createEmptyAppState());
      return;
    }
    if (data?.student && !useAppStore.getState().student) {
      hydrate(data);
    }
  }, [data, hydrate, hydrated]);

  return null;
}
