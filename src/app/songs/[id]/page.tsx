"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getSongById,
  getSongMaxStars,
  isSongUnlocked,
} from "@/content/songs";
import {
  initSongPlay,
  processNoteInput,
  getCurrentTarget,
  getFragmentNotes,
  getAllNotes,
  type SongPlayState,
} from "@/engine/song-engine";
import { useAppStore } from "@/store/useAppStore";
import { audioEngine } from "@/lib/audio";
import Keyboard from "@/components/Keyboard";

type Mode = "listen" | "fragment" | "full";
type TempoOption = { label: string; value: number };

const TEMPOS: TempoOption[] = [
  { label: "Lento (50%)", value: 0.5 },
  { label: "Normal (75%)", value: 0.75 },
  { label: "Original (100%)", value: 1.0 },
];

const MODE_LABELS: Record<Mode, string> = {
  listen: "Escuchar",
  fragment: "Fragmento",
  full: "Completa",
};

export default function SongPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const songId = params.id as string;
  const song = getSongById(songId);

  const hydrated = useAppStore((s) => s.hydrated);
  const [mode, setMode] = useState<Mode>("listen");
  const [tempoPercent, setTempoPercent] = useState(0.5);
  const [activeFragmentIdx, setActiveFragmentIdx] = useState(0);
  const [playState, setPlayState] = useState<SongPlayState | null>(null);
  const [errorFlash, setErrorFlash] = useState(false);
  const [fragmentComplete, setFragmentComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [listenNoteIdx, setListenNoteIdx] = useState<number | null>(null);

  const student = useAppStore((s) => s.student);
  const getCompletedLessonIds = useAppStore((s) => s.getCompletedLessonIds);
  const getSongStars = useAppStore((s) => s.getSongStars);
  const addSongAttempt = useAppStore((s) => s.addSongAttempt);
  const completedLessonIds = getCompletedLessonIds();

  const audioResumedRef = useRef(false);
  const attemptStartedAtRef = useRef(Date.now());
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const listenTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const listenAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      for (const timer of listenTimersRef.current) clearTimeout(timer);
      listenTimersRef.current = [];
      listenAudioRef.current?.pause();
      if (listenAudioRef.current) {
        listenAudioRef.current.currentTime = 0;
      }
      listenAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (hydrated && !student) {
      router.push("/onboarding");
    }
  }, [hydrated, student, router]);

  function resumeAudio() {
    if (!audioResumedRef.current) {
      audioEngine.resume();
      audioResumedRef.current = true;
    }
  }

  function triggerFlash() {
    setErrorFlash(true);
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => setErrorFlash(false), 500);
  }

  function resetAttemptTimer() {
    attemptStartedAtRef.current = Date.now();
  }

  function clearListenTimers() {
    for (const timer of listenTimersRef.current) clearTimeout(timer);
    listenTimersRef.current = [];
  }

  function stopListenAudio() {
    listenAudioRef.current?.pause();
    if (listenAudioRef.current) {
      listenAudioRef.current.currentTime = 0;
    }
    listenAudioRef.current = null;
  }

  function scheduleListenHighlights() {
    if (!song) return;
    const notes = getAllNotes(song);

    setIsPlaying(true);
    setListenNoteIdx(0);

    let offset = 0;
    for (let i = 0; i < notes.length; i++) {
      const timer = setTimeout(() => setListenNoteIdx(i), offset);
      listenTimersRef.current.push(timer);
      offset += notes[i].durationMs / tempoPercent;
    }

    const endTimer = setTimeout(() => {
      setIsPlaying(false);
      setListenNoteIdx(null);
    }, offset);
    listenTimersRef.current.push(endTimer);
  }

  function switchMode(newMode: Mode) {
    if (!song) return;
    audioEngine.stop();
    setIsPlaying(false);
    setListenNoteIdx(null);
    clearListenTimers();
    stopListenAudio();

    setMode(newMode);
    setFragmentComplete(false);
    setErrorFlash(false);
    resetAttemptTimer();

    if (newMode === "fragment") {
      setPlayState(initSongPlay(song.id, "fragment"));
      setActiveFragmentIdx(0);
    } else if (newMode === "full") {
      setPlayState(initSongPlay(song.id, "full"));
    } else {
      setPlayState(null);
    }
  }

  function selectFragment(idx: number) {
    if (!song) return;
    resetAttemptTimer();
    setActiveFragmentIdx(idx);
    setFragmentComplete(false);
    const newState = initSongPlay(song.id, "fragment");
    newState.activeFragmentIndex = idx;
    setPlayState(newState);
  }

  async function handleListen() {
    if (!song) return;
    resumeAudio();
    audioEngine.stop();
    clearListenTimers();
    stopListenAudio();
    scheduleListenHighlights();

    if (song.fullDemoAudio) {
      const audio = new Audio(song.fullDemoAudio);
      audio.playbackRate = tempoPercent;
      listenAudioRef.current = audio;

      try {
        await audio.play();
        return;
      } catch {
        listenAudioRef.current = null;
      }
    }

    audioEngine.playSequence(getAllNotes(song), tempoPercent);
  }

  function handleStopListen() {
    audioEngine.stop();
    stopListenAudio();
    setIsPlaying(false);
    setListenNoteIdx(null);
    clearListenTimers();
  }

  async function saveSongAttempt(fragmentId: string | null) {
    if (!student || !song) return;
    await addSongAttempt({
      studentId: student.id,
      songId: song.id,
      fragmentId,
      completed: true,
      tempoPercent: Math.round(tempoPercent * 100),
      durationSeconds: Math.floor(
        (Date.now() - attemptStartedAtRef.current) / 1000,
      ),
    });
  }

  function handleNoteClick(note: string) {
    if (!song || !playState || playState.isComplete) return;
    resumeAudio();
    audioEngine.playNote(note);

    const newState = processNoteInput(playState, note, song);

    if (newState.errors > playState.errors) {
      triggerFlash();
      setPlayState(newState);
      return;
    }

    setPlayState(newState);

    if (newState.isComplete) {
      if (mode === "fragment") {
        const fragment = song.fragments[newState.activeFragmentIndex];
        saveSongAttempt(fragment.id);
        setFragmentComplete(true);
      } else if (mode === "full") {
        saveSongAttempt(null);
        setFragmentComplete(true);
      }
    }
  }

  if (!hydrated) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <span className="text-3xl animate-pulse">🎵</span>
      </main>
    );
  }

  if (!song) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-2xl font-bold text-red-500">
          Canción no encontrada
        </p>
        <Link
          href="/songs"
          className="text-lg text-blue-500 hover:underline"
        >
          Volver a canciones
        </Link>
      </main>
    );
  }

  if (!student) return null;

  const unlocked = isSongUnlocked(song, completedLessonIds);
  const earnedStars = getSongStars(song.id);
  const maxStars = getSongMaxStars(song);

  if (!unlocked) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-2xl font-bold text-purple-600">
          Esta canción aún está bloqueada
        </p>
        <p className="max-w-md text-gray-600">
          Completa la lección requerida para desbloquearla.
        </p>
        <Link
          href="/songs"
          className="rounded-2xl bg-blue-500 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-blue-600"
        >
          Volver a canciones
        </Link>
      </main>
    );
  }

  const listenNotes = getAllNotes(song);
  const listenCurrentNote =
    listenNoteIdx !== null ? listenNotes[listenNoteIdx] : null;

  const allFragmentNotes = song.fragments.flatMap((f) => f.notes);
  const listenCurrentFinger =
    listenNoteIdx !== null ? allFragmentNotes[listenNoteIdx]?.finger : null;

  const target =
    playState && !playState.isComplete
      ? getCurrentTarget(playState, song)
      : null;

  return (
    <main className="flex flex-1 flex-col">
      <div className="border-b border-gray-200 p-4">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/songs"
            className="mb-3 inline-block text-blue-500 hover:underline"
          >
            ← Canciones
          </Link>
          <h1 className="mb-4 text-2xl font-bold text-purple-600">
            {song.title}
          </h1>
          <p className="mb-4 text-sm font-medium text-purple-600">
            ⭐ {earnedStars} / {maxStars} estrellas de canciones
          </p>

          <div className="flex gap-2">
            {(["listen", "fragment", "full"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`min-h-[44px] flex-1 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                  mode === m
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`flex flex-1 flex-col items-center gap-4 px-4 py-6 transition-colors duration-300 ${
          errorFlash ? "bg-red-50" : ""
        }`}
      >
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {TEMPOS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTempoPercent(t.value)}
                className={`min-h-[44px] rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  tempoPercent === t.value
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {mode === "listen" && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-lg text-gray-600">
                Escucha la canción completa y observa las notas en el teclado
              </p>

              {isPlaying ? (
                <button
                  type="button"
                  onClick={handleStopListen}
                  className="min-h-[48px] rounded-2xl bg-red-500 px-10 py-4 text-xl font-bold text-white transition-colors hover:bg-red-600"
                >
                  ⏹ Detener
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleListen}
                  className="min-h-[48px] rounded-2xl bg-yellow-500 px-10 py-4 text-xl font-bold text-white transition-colors hover:bg-yellow-600"
                >
                  🔊 Reproducir
                </button>
              )}
            </div>
          )}

          {mode === "fragment" && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-lg text-gray-600">
                Practica un fragmento a la vez
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                {song.fragments.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectFragment(idx)}
                    className={`min-h-[44px] rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                      activeFragmentIdx === idx
                        ? "bg-purple-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Fragmento {idx + 1}
                  </button>
                ))}
              </div>

              {fragmentComplete ? (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-2xl font-bold text-green-600">
                    ¡Completado! 🎉
                  </p>
                  <button
                    type="button"
                    onClick={() => selectFragment(activeFragmentIdx)}
                    className="min-h-[44px] rounded-2xl bg-blue-500 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-blue-600"
                  >
                    Repetir fragmento
                  </button>
                </div>
              ) : (
                target && (
                  <p className="text-center text-sm text-gray-500">
                    Nota {playState!.activeNoteIndex + 1} de{" "}
                    {getFragmentNotes(song, activeFragmentIdx).length}
                  </p>
                )
              )}
            </div>
          )}

          {mode === "full" && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-lg text-gray-600">
                Toca la canción completa de principio a fin
              </p>

              {fragmentComplete ? (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-2xl font-bold text-green-600">
                    ¡Canción completada! 🎉
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      resetAttemptTimer();
                      setPlayState(initSongPlay(song.id, "full"));
                      setFragmentComplete(false);
                    }}
                    className="min-h-[44px] rounded-2xl bg-blue-500 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-blue-600"
                  >
                    Repetir canción
                  </button>
                </div>
              ) : (
                playState && target && (
                  <p className="text-center text-sm text-gray-500">
                    Fragmento {playState.activeFragmentIndex + 1} de{" "}
                    {song.fragments.length} · Nota{" "}
                    {playState.activeNoteIndex + 1} de{" "}
                    {song.fragments[playState.activeFragmentIndex].notes.length}
                  </p>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 p-4">
        <Keyboard
          activeNote={
            mode === "listen"
              ? listenCurrentNote?.note ?? null
              : target?.note ?? null
          }
          activeFinger={
            mode === "listen"
              ? listenCurrentFinger ?? null
              : target?.finger ?? null
          }
          nextNote={
            mode !== "listen" && target ? target.note : null
          }
          onKeyClick={
            mode !== "listen" ? handleNoteClick : undefined
          }
        />
      </div>
    </main>
  );
}
