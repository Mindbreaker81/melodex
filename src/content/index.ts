import { world1, world1Lessons } from "./world-1";
import { world2, world2Lessons } from "./world-2";
import { world3, world3Lessons } from "./world-3";
import type { World, Lesson } from "@/types/content";

export const worlds: World[] = [world1, world2, world3];
export const allLessons: Lesson[] = [...world1Lessons, ...world2Lessons, ...world3Lessons];
const lessonsById = new Map(allLessons.map((lesson) => [lesson.id, lesson]));

export const orderedLessons: Lesson[] = [...worlds]
  .sort((a, b) => a.order - b.order)
  .flatMap((world) =>
    world.lessonIds
      .map((lessonId) => lessonsById.get(lessonId))
      .filter((lesson): lesson is Lesson => lesson !== undefined),
  );

export function getLessonById(id: string): Lesson | undefined {
  return lessonsById.get(id);
}

export function getWorldById(id: string): World | undefined {
  return worlds.find((w) => w.id === id);
}

export function getLessonSequenceIndex(lessonId: string): number {
  return orderedLessons.findIndex((lesson) => lesson.id === lessonId);
}

export function getNextLessonById(lessonId: string): Lesson | null {
  const currentIndex = getLessonSequenceIndex(lessonId);
  if (currentIndex < 0 || currentIndex >= orderedLessons.length - 1) {
    return null;
  }
  return orderedLessons[currentIndex + 1] ?? null;
}

export function getNextPendingLesson(completedLessonIds: string[]): Lesson | null {
  const completedSet = new Set(completedLessonIds);
  return orderedLessons.find((lesson) => !completedSet.has(lesson.id)) ?? null;
}
