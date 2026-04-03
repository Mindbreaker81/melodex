"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import ParentDashboard from "@/components/ParentDashboard";

export default function ParentPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const markHydrated = () => setHydrated(true);
    const unsub = useAppStore.persist.onFinishHydration(markHydrated);
    if (useAppStore.persist.hasHydrated()) markHydrated();
    return unsub;
  }, []);

  const student = useAppStore((s) => s.student);
  const lessonAttempts = useAppStore((s) => s.lessonAttempts);
  const songAttempts = useAppStore((s) => s.songAttempts);
  const totalLessonStars = useAppStore((s) => s.getTotalStars());
  const getCompletedLessonIds = useAppStore((s) => s.getCompletedLessonIds);
  const completedLessonIds = getCompletedLessonIds();

  useEffect(() => {
    if (hydrated && !student) {
      router.push("/onboarding");
    }
  }, [hydrated, student, router]);

  if (!hydrated) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <span className="text-3xl animate-pulse">🎵</span>
      </main>
    );
  }

  if (!student) return null;

  return (
    <main className="mx-auto flex flex-1 flex-col p-6 max-w-3xl">
      <ParentDashboard
        student={student}
        lessonAttempts={lessonAttempts}
        songAttempts={songAttempts}
        totalLessonStars={totalLessonStars}
        completedLessonIds={completedLessonIds}
      />
    </main>
  );
}
