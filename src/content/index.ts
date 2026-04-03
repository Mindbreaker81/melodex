import { world1, world1Lessons } from "./world-1";
import { world2, world2Lessons } from "./world-2";
import { world3, world3Lessons } from "./world-3";
import type { World, Lesson } from "@/types/content";

export const worlds: World[] = [world1, world2, world3];
export const allLessons: Lesson[] = [...world1Lessons, ...world2Lessons, ...world3Lessons];

export function getLessonById(id: string): Lesson | undefined {
  return allLessons.find((l) => l.id === id);
}

export function getWorldById(id: string): World | undefined {
  return worlds.find((w) => w.id === id);
}
