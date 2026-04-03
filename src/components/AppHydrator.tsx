"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { AppState } from "@/types/storage";

export function AppHydrator({ data }: { data: AppState | null }) {
  const hydrate = useAppStore((s) => s.hydrate);
  const hydrated = useAppStore((s) => s.hydrated);

  useEffect(() => {
    if (data && !hydrated) hydrate(data);
  }, [data, hydrate, hydrated]);

  return null;
}
