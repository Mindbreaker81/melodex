"use client";

import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { getLessonById } from "@/content";
import {
  allSongs,
  getSongMaxStars,
  isSongUnlocked,
} from "@/content/songs";

export default function SongsPage() {
  const hydrated = useAppStore((s) => s.hydrated);

  const getCompletedLessonIds = useAppStore((s) => s.getCompletedLessonIds);
  const getSongStars = useAppStore((s) => s.getSongStars);
  const songAttempts = useAppStore((s) => s.songAttempts);
  const completedLessonIds = getCompletedLessonIds();
  const hasUnlockedSongs = allSongs.some((song) =>
    isSongUnlocked(song, completedLessonIds),
  );

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

      {!hasUnlockedSongs && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-gray-200 bg-gray-50 p-8 text-center">
          <span className="text-4xl">🔒</span>
          <p className="text-lg text-gray-600">
            Completa hasta la lección 6 para desbloquear las primeras canciones
          </p>
          <Link
            href="/lessons"
            className="min-h-[44px] rounded-2xl bg-blue-500 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-blue-600"
          >
            Ir a lecciones
          </Link>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {allSongs.map((song) => {
          const unlocked = isSongUnlocked(song, completedLessonIds);
          const completedFragments = new Set(
            songAttempts
              .filter(
                (attempt) =>
                  attempt.songId === song.id &&
                  attempt.fragmentId !== null &&
                  attempt.completed,
              )
              .map((attempt) => attempt.fragmentId as string),
          ).size;
          const earnedStars = getSongStars(song.id);
          const maxStars = getSongMaxStars(song);
          const requiredLesson = getLessonById(song.requiredLessonId);
          const difficultyLabel =
            song.difficulty === "easy" ? "Fácil" : "Media";
          const difficultyColor =
            song.difficulty === "easy"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700";
          const cardClass = unlocked
            ? "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
            : "border-gray-200 bg-gray-100 opacity-70";

          const content = (
            <>
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
                  {song.fragments.length} fragmentos · {completedFragments} completados
                </p>
                <p className="text-sm font-medium text-purple-600">
                  ⭐ {earnedStars} / {maxStars} estrellas
                </p>
                {!unlocked && (
                  <p className="text-xs text-gray-500">
                    Requiere {requiredLesson?.title ?? song.requiredLessonId}
                  </p>
                )}
              </div>
              <span className="text-2xl text-purple-500">
                {unlocked ? "▶" : "🔒"}
              </span>
            </>
          );

          if (!unlocked) {
            return (
              <div
                key={song.id}
                className={`flex min-h-[68px] items-center justify-between rounded-2xl border-2 px-5 py-4 ${cardClass}`}
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={song.id}
              href={`/songs/${song.id}`}
              className={`flex min-h-[68px] items-center justify-between rounded-2xl border-2 px-5 py-4 transition-all ${cardClass}`}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
