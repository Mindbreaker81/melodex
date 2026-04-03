"use server";

import { db } from "@/db";
import { students, lessonAttempts, songAttempts } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { AppState } from "@/types/storage";

export interface MigrationResult {
  imported: boolean;
  studentCreated: boolean;
  lessons: number;
  songs: number;
}

export async function migrateLocalData(
  localState: AppState,
  familyId: string,
): Promise<MigrationResult> {
  let studentCreated = false;
  let lessonsImported = 0;
  let songsImported = 0;

  if (!localState.student) {
    return { imported: false, studentCreated: false, lessons: 0, songs: 0 };
  }

  const existing = await db
    .select()
    .from(students)
    .where(eq(students.familyId, familyId));

  let studentId: string;

  if (existing.length > 0) {
    studentId = existing[0].id;
  } else {
    const [created] = await db
      .insert(students)
      .values({
        familyId,
        displayName: localState.student.displayName,
        avatar: localState.student.avatar,
        currentLessonId: localState.student.currentLessonId,
      })
      .returning();
    studentId = created.id;
    studentCreated = true;
  }

  for (const attempt of localState.lessonAttempts) {
    try {
      await db.insert(lessonAttempts).values({
        studentId,
        lessonId: attempt.lessonId,
        stars: attempt.stars,
        quizErrors: attempt.quizErrors,
        completed: attempt.completed,
        durationSeconds: attempt.durationSeconds,
      });
      lessonsImported++;
    } catch {
      // duplicate or constraint violation — skip
    }
  }

  for (const attempt of localState.songAttempts) {
    try {
      await db.insert(songAttempts).values({
        studentId,
        songId: attempt.songId,
        fragmentId: attempt.fragmentId,
        completed: attempt.completed,
        tempoPercent: attempt.tempoPercent,
        durationSeconds: attempt.durationSeconds,
      });
      songsImported++;
    } catch {
      // duplicate or constraint violation — skip
    }
  }

  return {
    imported: true,
    studentCreated,
    lessons: lessonsImported,
    songs: songsImported,
  };
}
