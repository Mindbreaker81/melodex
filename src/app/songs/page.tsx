"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { allSongs } from "@/content/songs";

export default function SongsPage() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const markHydrated = () => setHydrated(true);
    const unsub = useAppStore.persist.onFinishHydration(markHydrated);
    if (useAppStore.persist.hasHydrated()) markHydrated();
    return unsub;
  }, []);

  const isLessonCompleted = useAppStore((s) => s.isLessonCompleted);
  const songAttempts = useAppStore((s) => s.songAttempts);

  const unlocked = isLessonCompleted("lesson-7");

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

      <h1 className="mb-8 text-3xl font-bold text-purple-600">Canciones</h1>

      {!unlocked ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-gray-200 bg-gray-50 p-8 text-center">
          <span className="text-4xl">🔒</span>
          <p className="text-lg text-gray-600">
            Completa todas las lecciones para desbloquear las canciones
          </p>
          <Link
            href="/lessons"
            className="min-h-[44px] rounded-2xl bg-blue-500 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-blue-600"
          >
            Ir a lecciones
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {allSongs.map((song) => {
            const completedFragments = song.fragments.filter((f) =>
              songAttempts.some(
                (a) =>
                  a.songId === song.id &&
                  a.fragmentId === f.id &&
                  a.completed,
              ),
            ).length;

            const difficultyLabel =
              song.difficulty === "easy" ? "Fácil" : "Media";
            const difficultyColor =
              song.difficulty === "easy"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700";

            return (
              <Link
                key={song.id}
                href={`/songs/${song.id}`}
                className="flex min-h-[68px] items-center justify-between rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 transition-all hover:border-purple-300 hover:shadow-md"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold text-gray-800">
                      {song.title}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColor}`}
                    >
                      {difficultyLabel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {song.fragments.length} fragmentos · {completedFragments}{" "}
                    completados
                  </p>
                </div>
                <span className="text-2xl text-purple-500">▶</span>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
