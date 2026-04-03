import { estrellita } from "./estrellita";
import { himnoAlegria } from "./himno-alegria";
import type { Song } from "@/types/content";

export const allSongs: Song[] = [estrellita, himnoAlegria];
const songsById = new Map(allSongs.map((song) => [song.id, song]));

export function getSongById(id: string): Song | undefined {
  return songsById.get(id);
}

export function isSongUnlocked(
  song: Song,
  completedLessonIds: string[],
): boolean {
  return completedLessonIds.includes(song.requiredLessonId);
}

export function getSongMaxStars(song: Song): number {
  return song.fragments.length + 1;
}
