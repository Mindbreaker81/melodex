"use server";

import { db } from "@/db";
import { students, lessonAttempts, songAttempts } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { AppState } from "@/types/storage";

export async function getOrCreateStudent(
  familyId: string,
  data: { displayName: string; avatar: string },
) {
  const existing = await db
    .select()
    .from(students)
    .where(eq(students.familyId, familyId));

  if (existing.length > 0) return existing[0];

  const [student] = await db
    .insert(students)
    .values({
      familyId,
      displayName: data.displayName,
      avatar: data.avatar,
    })
    .returning();
  return student;
}

export async function updateCurrentLesson(
  studentId: string,
  lessonId: string,
) {
  await db
    .update(students)
    .set({ currentLessonId: lessonId })
    .where(eq(students.id, studentId));
}

export async function getStudentWithProgress(
  familyId: string,
): Promise<AppState | null> {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.familyId, familyId));

  if (!student) return null;

  const lessons = await db
    .select()
    .from(lessonAttempts)
    .where(eq(lessonAttempts.studentId, student.id));

  const songs = await db
    .select()
    .from(songAttempts)
    .where(eq(songAttempts.studentId, student.id));

  return {
    student: {
      id: student.id,
      displayName: student.displayName,
      avatar: student.avatar,
      currentLessonId: student.currentLessonId,
      createdAt: student.createdAt.toISOString(),
    },
    lessonAttempts: lessons.map((a) => ({
      id: a.id,
      studentId: a.studentId,
      lessonId: a.lessonId,
      stars: a.stars,
      quizErrors: a.quizErrors,
      completed: a.completed,
      durationSeconds: a.durationSeconds,
      createdAt: a.createdAt.toISOString(),
    })),
    songAttempts: songs.map((a) => ({
      id: a.id,
      studentId: a.studentId,
      songId: a.songId,
      fragmentId: a.fragmentId,
      completed: a.completed,
      tempoPercent: a.tempoPercent,
      durationSeconds: a.durationSeconds,
      createdAt: a.createdAt.toISOString(),
    })),
  };
}
