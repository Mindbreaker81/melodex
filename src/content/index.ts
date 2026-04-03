import { world1, world1Lessons } from "./world-1";
import type { World, Lesson } from "@/types/content";

export const worlds: World[] = [world1];
export const allLessons: Lesson[] = [...world1Lessons];

export function getLessonById(id: string): Lesson | undefined {
  return allLessons.find((l) => l.id === id);
}

export function getWorldById(id: string): World | undefined {
  return worlds.find((w) => w.id === id);
}
