"use server";

import { db } from "@/db";
import {
  lessonAttempts,
  songAttempts,
} from "@/db/schema";

export async function addLessonAttemptToDB(data: {
  studentId: string;
  lessonId: string;
  stars: number;
  quizErrors: number;
  completed: boolean;
  durationSeconds: number | null;
}) {
  const [attempt] = await db
    .insert(lessonAttempts)
    .values(data)
    .returning();
  return {
    id: attempt.id,
    studentId: attempt.studentId,
    lessonId: attempt.lessonId,
    stars: attempt.stars,
    quizErrors: attempt.quizErrors,
    completed: attempt.completed,
    durationSeconds: attempt.durationSeconds,
    createdAt: attempt.createdAt.toISOString(),
  };
}

export async function addSongAttemptToDB(data: {
  studentId: string;
  songId: string;
  fragmentId: string | null;
  completed: boolean;
  tempoPercent: number;
  durationSeconds: number | null;
}) {
  const [attempt] = await db
    .insert(songAttempts)
    .values(data)
    .returning();
  return {
    id: attempt.id,
    studentId: attempt.studentId,
    songId: attempt.songId,
    fragmentId: attempt.fragmentId,
    completed: attempt.completed,
    tempoPercent: attempt.tempoPercent,
    durationSeconds: attempt.durationSeconds,
    createdAt: attempt.createdAt.toISOString(),
  };
}
