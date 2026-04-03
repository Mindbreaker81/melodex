"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import {
  worlds,
  orderedLessons,
  getLessonById,
  getNextPendingLesson,
} from "@/content";
import { isLessonUnlocked } from "@/engine/lesson-engine";

export default function LessonsPage() {
  const router = useRouter();
  const hydrated = useAppStore((s) => s.hydrated);

  const getCompletedLessonIds = useAppStore((s) => s.getCompletedLessonIds);
  const isCompleted = useAppStore((s) => s.isLessonCompleted);
  const getBestAttempt = useAppStore((s) => s.getBestAttempt);
  const completedIds = getCompletedLessonIds();

  const currentLessonId = useMemo(() => {
    return getNextPendingLesson(completedIds)?.id ?? null;
  }, [completedIds]);

  if (!hydrated) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <span className="text-3xl animate-pulse">🎵</span>
      </main>
    );
  }

  return (
    <main className="mx-auto flex flex-1 flex-col p-6 max-w-2xl">
      <Link href="/" className="mb-6 text-lg text-blue-500 hover:underline">
        ← Volver
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-purple-600">
        Mapa de Lecciones
      </h1>

      {worlds.map((world) => (
        <section key={world.id} className="mb-10">
          <h2 className="mb-1 text-2xl font-bold text-gray-800">
            {world.title}
          </h2>
          <p className="mb-4 text-gray-500">{world.description}</p>

          <div className="flex flex-col gap-3">
            {world.lessonIds.map((lessonId) => {
              const lesson = getLessonById(lessonId);
              if (!lesson) return null;

              const completed = isCompleted(lessonId);
              const sequenceNumber =
                orderedLessons.findIndex((item) => item.id === lesson.id) + 1;
              const unlocked = isLessonUnlocked(
                lesson.id,
                completedIds,
                orderedLessons,
              );
              const isCurrent = lessonId === currentLessonId;
              const best = getBestAttempt(lessonId);

              const bgClass = completed
                ? "bg-green-50 border-green-400"
                : isCurrent
                  ? "bg-blue-50 border-blue-400 ring-2 ring-blue-300"
                  : unlocked
                    ? "bg-white border-gray-300"
                    : "bg-gray-100 border-gray-200 opacity-50";

              return (
                <button
                  key={lessonId}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => router.push(`/lesson/${lessonId}`)}
                  className={`flex min-h-[68px] items-center justify-between rounded-2xl border-2 px-5 py-4 text-left transition-all ${bgClass} ${
                    unlocked
                      ? "cursor-pointer hover:shadow-md"
                      : "cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-gray-700">
                      {sequenceNumber}
                    </span>
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        {lesson.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        ~{lesson.estimatedMinutes} min
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xl">
                    {completed && best
                      ? Array.from({ length: 3 }, (_, i) => (
                          <span key={i}>{i < best.stars ? "⭐" : "☆"}</span>
                        ))
                      : unlocked
                        ? <span className="text-2xl text-blue-500">▶</span>
                        : <span className="text-2xl text-gray-400">🔒</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
