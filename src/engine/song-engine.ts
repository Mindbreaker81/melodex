import type { Song, FingerNumber } from "@/types/content";

export interface SongPlayState {
  songId: string;
  mode: "listen" | "fragment" | "full";
  activeFragmentIndex: number;
  activeNoteIndex: number;
  errors: number;
  completedFragmentIds: string[];
  isComplete: boolean;
}

export function initSongPlay(
  songId: string,
  mode: "listen" | "fragment" | "full",
): SongPlayState {
  return {
    songId,
    mode,
    activeFragmentIndex: 0,
    activeNoteIndex: 0,
    errors: 0,
    completedFragmentIds: [],
    isComplete: false,
  };
}

export function processNoteInput(
  state: SongPlayState,
  inputNote: string,
  song: Song,
): SongPlayState {
  if (state.isComplete) return state;

  const target = getCurrentTarget(state, song);
  if (!target) return state;

  if (inputNote !== target.note) {
    return { ...state, errors: state.errors + 1 };
  }

  const fragment = song.fragments[state.activeFragmentIndex];
  const nextNoteIndex = state.activeNoteIndex + 1;

  if (nextNoteIndex < fragment.notes.length) {
    return { ...state, activeNoteIndex: nextNoteIndex };
  }

  const completedFragmentIds = [
    ...state.completedFragmentIds,
    fragment.id,
  ];

  if (state.mode === "fragment") {
    return {
      ...state,
      activeNoteIndex: 0,
      completedFragmentIds,
      isComplete: true,
    };
  }

  const nextFragmentIndex = state.activeFragmentIndex + 1;
  if (nextFragmentIndex < song.fragments.length) {
    return {
      ...state,
      activeFragmentIndex: nextFragmentIndex,
      activeNoteIndex: 0,
      completedFragmentIds,
    };
  }

  return {
    ...state,
    activeNoteIndex: 0,
    completedFragmentIds,
    isComplete: true,
  };
}

export function getCurrentTarget(
  state: SongPlayState,
  song: Song,
): {
  note: string;
  finger: FingerNumber;
  isLastInFragment: boolean;
  isLastInSong: boolean;
} | null {
  const fragment = song.fragments[state.activeFragmentIndex];
  if (!fragment) return null;

  const noteEntry = fragment.notes[state.activeNoteIndex];
  if (!noteEntry) return null;

  const isLastInFragment =
    state.activeNoteIndex === fragment.notes.length - 1;
  const isLastInSong =
    isLastInFragment &&
    state.activeFragmentIndex === song.fragments.length - 1;

  return {
    note: noteEntry.note,
    finger: noteEntry.finger,
    isLastInFragment,
    isLastInSong,
  };
}

export function getFragmentNotes(
  song: Song,
  fragmentIndex: number,
): Array<{ note: string; durationMs: number }> {
  const fragment = song.fragments[fragmentIndex];
  if (!fragment) return [];
  return fragment.notes.map(({ note, durationMs }) => ({ note, durationMs }));
}

export function getAllNotes(
  song: Song,
): Array<{ note: string; durationMs: number }> {
  return song.fragments.flatMap((f) =>
    f.notes.map(({ note, durationMs }) => ({ note, durationMs })),
  );
}
