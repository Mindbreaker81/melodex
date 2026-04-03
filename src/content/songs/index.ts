import { estrellita } from "./estrellita";
import { himnoAlegria } from "./himno-alegria";
import type { Song } from "@/types/content";

export const allSongs: Song[] = [estrellita, himnoAlegria];

export function getSongById(id: string): Song | undefined {
  return allSongs.find((s) => s.id === id);
}
