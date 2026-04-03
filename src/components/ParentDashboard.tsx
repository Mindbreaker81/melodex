"use client";

import Link from "next/link";
import Stars from "@/components/Stars";
import ProgressBar from "@/components/ProgressBar";
import { worlds, allLessons, getLessonById } from "@/content";
import { allSongs } from "@/content/songs";
import type { StudentProfile, LessonAttempt, SongAttempt } from "@/types/storage";

interface ParentDashboardProps {
  student: StudentProfile;
  lessonAttempts: LessonAttempt[];
  songAttempts: SongAttempt[];
  totalStars: number;
  completedLessonIds: string[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins} min ${secs} s` : `${secs} s`;
}

export default function ParentDashboard({
  student,
  lessonAttempts,
  songAttempts,
  totalStars,
  completedLessonIds,
}: ParentDashboardProps) {
  const totalLessons = allLessons.length;
  const completedCount = completedLessonIds.length;
  const maxStars = totalLessons * 3;

  const lastSession = getLastSession(lessonAttempts, songAttempts);
  const weakAreas = getWeakAreas(lessonAttempts);
  const recommendation = getRecommendation(
    lessonAttempts,
    songAttempts,
    completedLessonIds,
    weakAreas,
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel del padre</h1>
          <div className="mt-1 flex items-center gap-2 text-gray-600">
            <span className="text-2xl">{student.avatar}</span>
            <span className="text-lg font-medium">{student.displayName}</span>
          </div>
        </div>
        <Link
          href="/"
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
        >
          ← Volver
        </Link>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold text-gray-700">Progreso global</h2>
        <ProgressBar
          completed={completedCount}
          total={totalLessons}
          totalStars={totalStars}
          maxStars={maxStars}
        />
        <p className="mt-2 text-sm text-gray-500">
          Lección {completedCount} de {totalLessons} · {totalStars} de {maxStars} estrellas
        </p>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold text-gray-700">Última sesión</h2>
        {lastSession ? (
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-medium">Fecha:</span> {lastSession.date}
            </p>
            <p>
              <span className="font-medium">Actividad:</span> {lastSession.activity}
            </p>
            {lastSession.duration && (
              <p>
                <span className="font-medium">Duración:</span> {lastSession.duration}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aún no hay sesiones registradas</p>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold text-gray-700">Áreas débiles</h2>
        {weakAreas.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {weakAreas.map((area) => (
              <li
                key={area.lessonId}
                className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-2 text-sm"
              >
                <span className="font-medium text-gray-700">{area.title}</span>
                <span className="text-red-600">{area.errors} errores</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">¡Sin errores! 🎉</p>
        )}
      </section>

      <section className="rounded-xl border border-blue-100 bg-blue-50 p-5">
        <h2 className="mb-2 text-lg font-semibold text-blue-800">Siguiente recomendación</h2>
        <p className="text-sm text-blue-700">{recommendation}</p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Detalle por lección</h2>
        {worlds.map((world) => (
          <div key={world.id} className="mb-6">
            <h3 className="mb-2 text-base font-bold text-gray-600">{world.title}</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Lección</th>
                    <th className="px-4 py-2 font-medium text-center">Estrellas</th>
                    <th className="px-4 py-2 font-medium text-center">Intentos</th>
                    <th className="px-4 py-2 font-medium text-center">Errores</th>
                  </tr>
                </thead>
                <tbody>
                  {world.lessonIds.map((lessonId) => {
                    const lesson = getLessonById(lessonId);
                    if (!lesson) return null;

                    const attempts = lessonAttempts.filter(
                      (a) => a.lessonId === lessonId,
                    );
                    const best = attempts.reduce<LessonAttempt | null>(
                      (b, a) => (!b || a.stars > b.stars ? a : b),
                      null,
                    );
                    const totalErrors = attempts.reduce(
                      (sum, a) => sum + a.quizErrors,
                      0,
                    );

                    return (
                      <tr key={lessonId} className="border-t border-gray-100">
                        <td className="px-4 py-2 text-gray-700">{lesson.title}</td>
                        <td className="px-4 py-2 text-center">
                          <Stars earned={best?.stars ?? 0} size="sm" />
                        </td>
                        <td className="px-4 py-2 text-center text-gray-600">
                          {attempts.length}
                        </td>
                        <td className="px-4 py-2 text-center text-gray-600">
                          {totalErrors}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

interface LastSessionInfo {
  date: string;
  activity: string;
  duration: string | null;
}

function getLastSession(
  lessonAttempts: LessonAttempt[],
  songAttempts: SongAttempt[],
): LastSessionInfo | null {
  let latest: { createdAt: string; type: "lesson" | "song"; id: string; duration: number | null } | null = null;

  for (const a of lessonAttempts) {
    if (!latest || a.createdAt > latest.createdAt) {
      latest = { createdAt: a.createdAt, type: "lesson", id: a.lessonId, duration: a.durationSeconds };
    }
  }

  for (const a of songAttempts) {
    if (!latest || a.createdAt > latest.createdAt) {
      latest = { createdAt: a.createdAt, type: "song", id: a.songId, duration: null };
    }
  }

  if (!latest) return null;

  let activity: string;
  if (latest.type === "lesson") {
    const lesson = getLessonById(latest.id);
    activity = lesson ? `Lección: ${lesson.title}` : `Lección desconocida`;
  } else {
    const song = allSongs.find((s) => s.id === latest!.id);
    activity = song ? `Canción: ${song.title}` : `Canción desconocida`;
  }

  return {
    date: formatDate(latest.createdAt),
    activity,
    duration: latest.duration != null ? formatDuration(latest.duration) : null,
  };
}

interface WeakArea {
  lessonId: string;
  title: string;
  errors: number;
}

function getWeakAreas(lessonAttempts: LessonAttempt[]): WeakArea[] {
  const errorsByLesson = new Map<string, number>();

  for (const a of lessonAttempts) {
    errorsByLesson.set(a.lessonId, (errorsByLesson.get(a.lessonId) ?? 0) + a.quizErrors);
  }

  return [...errorsByLesson.entries()]
    .filter(([, errors]) => errors > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lessonId, errors]) => {
      const lesson = getLessonById(lessonId);
      return { lessonId, title: lesson?.title ?? lessonId, errors };
    });
}

function getRecommendation(
  lessonAttempts: LessonAttempt[],
  songAttempts: SongAttempt[],
  completedLessonIds: string[],
  weakAreas: WeakArea[],
): string {
  const lessonsWithLowStarsAndErrors = lessonAttempts.filter((a) => {
    const isWeak = weakAreas.some((w) => w.lessonId === a.lessonId);
    return isWeak && a.stars <= 1 && a.completed;
  });

  if (lessonsWithLowStarsAndErrors.length > 0) {
    const lessonId = lessonsWithLowStarsAndErrors[0].lessonId;
    const lesson = getLessonById(lessonId);
    return `Repetir "${lesson?.title ?? lessonId}"`;
  }

  const allCompleted = completedLessonIds.length >= allLessons.length;

  if (!allCompleted) {
    const sorted = [...allLessons].sort((a, b) => a.order - b.order);
    const next = sorted.find((l) => !completedLessonIds.includes(l.id));
    return next
      ? `Continuar con "${next.title}"`
      : "Continuar con la siguiente lección";
  }

  if (songAttempts.length === 0) {
    return "Probar Estrellita en modo lento";
  }

  if (weakAreas.length > 0) {
    return `Repetir "${weakAreas[0].title}"`;
  }

  return "Probar las canciones";
}
