"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { RotateBanner } from "@/components/RotateBanner";

export default function HomePage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const markHydrated = () => setHydrated(true);
    const unsub = useAppStore.persist.onFinishHydration(markHydrated);
    if (useAppStore.persist.hasHydrated()) markHydrated();
    return unsub;
  }, []);

  const student = useAppStore((s) => s.student);
  const totalStars = useAppStore((s) => s.getTotalStars());
  const hasCompletedLessons = useAppStore(
    (s) => s.lessonAttempts.some((a) => a.completed),
  );

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

  const hasSongs = hasCompletedLessons;

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <RotateBanner />
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <span className="text-6xl">{student.avatar}</span>
          <h1 className="text-3xl font-bold text-purple-600">
            ¡Hola, {student.displayName}!
          </h1>
        </div>

        <p className="text-2xl font-semibold text-yellow-500">
          ⭐ {totalStars} estrellas
        </p>

        <button
          type="button"
          onClick={() =>
            router.push(
              `/lesson/${student.currentLessonId ?? "lesson-1"}`,
            )
          }
          className="w-full rounded-2xl bg-blue-500 px-8 py-4 text-2xl font-bold text-white transition-colors hover:bg-blue-600"
        >
          Continuar
        </button>

        <Link
          href="/lessons"
          className="text-base font-medium text-blue-500 hover:underline"
        >
          📋 Ver todas las lecciones
        </Link>

        <button
          type="button"
          disabled={!hasSongs}
          title={!hasSongs ? "Completa las lecciones primero" : undefined}
          onClick={() => hasSongs && router.push("/songs")}
          className="w-full rounded-2xl bg-purple-500 px-8 py-3 text-xl font-bold text-white transition-colors hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Canciones
        </button>

        <Link href="/parent" className="text-sm text-gray-500 underline">
          👨‍👩‍👦 Panel del padre
        </Link>
      </div>
    </main>
  );
}
