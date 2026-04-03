"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getLessonById,
  getNextLessonById,
  getNextPendingLesson,
} from "@/content";
import {
  initLesson,
  processAction,
  getCurrentStep,
  calculateStars,
  type LessonState,
} from "@/engine/lesson-engine";
import { useAppStore } from "@/store/useAppStore";
import { audioEngine } from "@/lib/audio";
import Keyboard from "@/components/Keyboard";
import type { Lesson } from "@/types/content";

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="h-3 w-full rounded-full bg-gray-200">
      <div
        className="h-3 rounded-full bg-blue-500 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StarsDisplay({ earned }: { earned: number }) {
  return (
    <div className="flex gap-2 text-5xl">
      {[1, 2, 3].map((i) => (
        <span key={i} className={i > earned ? "opacity-30 grayscale" : ""}>
          ⭐
        </span>
      ))}
    </div>
  );
}

function CompletionScreen({
  stars,
  nextLesson,
  onNext,
  onMap,
  onRepeat,
}: {
  stars: number;
  nextLesson: Lesson | null;
  onNext: () => void;
  onMap: () => void;
  onRepeat: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
      <h2 className="text-3xl font-bold text-purple-600">
        ¡Lección completada!
      </h2>
      <StarsDisplay earned={stars} />
      <button
        type="button"
        onClick={onRepeat}
        className="min-h-[48px] w-full max-w-xs rounded-2xl border-2 border-purple-400 bg-white px-6 py-3 text-lg font-bold text-purple-600 transition-colors hover:bg-purple-50"
      >
        {stars < 3
          ? "🔄 Repetir ejercicio principal"
          : "🔄 Repetir lección"}
      </button>
      <div className="flex w-full max-w-xs flex-col gap-3">
        {nextLesson && (
          <button
            type="button"
            onClick={onNext}
            className="min-h-[48px] w-full rounded-2xl bg-blue-500 px-6 py-4 text-xl font-bold text-white transition-colors hover:bg-blue-600"
          >
            Siguiente lección
          </button>
        )}
        <button
          type="button"
          onClick={onMap}
          className="min-h-[48px] w-full rounded-2xl bg-gray-200 px-6 py-4 text-xl font-bold text-gray-700 transition-colors hover:bg-gray-300"
        >
          Volver al mapa
        </button>
      </div>
    </div>
  );
}

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;
  const lesson = getLessonById(lessonId);

  const [state, setState] = useState<LessonState | null>(() =>
    lesson ? initLesson(lesson) : null,
  );
  const [errorFlash, setErrorFlash] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);

  const audioResumedRef = useRef(false);
  const savedForLessonRef = useRef<string | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const student = useAppStore((s) => s.student);
  const addLessonAttempt = useAppStore((s) => s.addLessonAttempt);
  const setCurrentLessonId = useAppStore((s) => s.setCurrentLessonId);
  const lessonState =
    state?.lessonId === lessonId
      ? state
      : lesson
        ? initLesson(lesson)
        : null;
  const activeSequenceIndex =
    state?.lessonId === lessonId ? sequenceIndex : 0;

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    savedForLessonRef.current = null;
  }, [lessonId]);

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

  function saveIfComplete(newState: LessonState) {
    if (
      newState.isComplete &&
      savedForLessonRef.current !== newState.lessonId &&
      student &&
      lesson
    ) {
      savedForLessonRef.current = newState.lessonId;
      addLessonAttempt({
        studentId: student.id,
        lessonId: lesson.id,
        stars: calculateStars(newState),
        quizErrors: newState.quizErrors,
        completed: true,
        durationSeconds: Math.floor(
          (Date.now() - new Date(newState.startedAt).getTime()) / 1000,
        ),
      });
      const completedIds = useAppStore.getState().getCompletedLessonIds();
      const projectedCompletedIds = completedIds.includes(lesson.id)
        ? completedIds
        : [...completedIds, lesson.id];
      const nextPendingLesson = getNextPendingLesson(projectedCompletedIds);
      setCurrentLessonId(nextPendingLesson?.id ?? lesson.id);
    }
  }

  function handleNext() {
    if (!lessonState || !lesson) return;
    resumeAudio();
    const newState = processAction(lessonState, { type: "next" }, lesson);
    setState(newState);
    saveIfComplete(newState);
  }

  async function handlePlayDemo(notes: string[]) {
    resumeAudio();
    for (const note of notes) {
      audioEngine.playNote(note, 0.5);
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  function handleNoteClick(note: string) {
    if (!lessonState || !lesson || lessonState.isComplete) return;
    resumeAudio();
    audioEngine.playNote(note);

    const step = getCurrentStep(lessonState, lesson);
    if (!step) return;

    if (step.type === "find-note") {
      const newState = processAction(
        lessonState,
        { type: "answer", note },
        lesson,
      );
      if (newState.quizErrors > lessonState.quizErrors) triggerFlash();
      setState(newState);
      saveIfComplete(newState);
    } else if (step.type === "sequence-quiz") {
      const expected = step.targetNotes?.[activeSequenceIndex];
      if (note === expected) {
        const nextIdx = activeSequenceIndex + 1;
        if (nextIdx >= (step.targetNotes?.length ?? 0)) {
          const newState = processAction(
            lessonState,
            { type: "answer-sequence", notes: step.targetNotes! },
            lesson,
          );
          setState(newState);
          setSequenceIndex(0);
          saveIfComplete(newState);
        } else {
          setSequenceIndex(nextIdx);
        }
      } else {
        triggerFlash();
        const wrong = [
          ...(step.targetNotes?.slice(0, activeSequenceIndex) ?? []),
          note,
        ];
        const newState = processAction(
          lessonState,
          { type: "answer-sequence", notes: wrong },
          lesson,
        );
        setState(newState);
        setSequenceIndex(0);
      }
    }
  }

  if (!lesson) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-2xl font-bold text-red-500">
          Lección no encontrada
        </p>
        <Link
          href="/lessons"
          className="text-lg text-blue-500 hover:underline"
        >
          Volver al mapa
        </Link>
      </main>
    );
  }

  if (!lessonState) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <span className="text-3xl animate-pulse">🎵</span>
      </main>
    );
  }

  const nextLesson = getNextLessonById(lesson.id);
  const earnedStars = calculateStars(lessonState);

  if (lessonState.isComplete) {
    return (
      <main className="flex flex-1 flex-col">
        <CompletionScreen
          stars={earnedStars}
          nextLesson={nextLesson}
          onNext={() =>
            nextLesson && router.push(`/lesson/${nextLesson.id}`)
          }
          onMap={() => router.push("/lessons")}
          onRepeat={() => {
            if (!lesson) return;
            savedForLessonRef.current = null;
            setState(
              processAction(
                lessonState,
                { type: earnedStars < 3 ? "repeat-main" : "retry" },
                lesson,
              ),
            );
            setSequenceIndex(0);
          }}
        />
      </main>
    );
  }

  const step = getCurrentStep(lessonState, lesson);
  if (!step) return null;

  return (
    <main className="flex flex-1 flex-col">
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-lg font-bold text-purple-600">{lesson.title}</h1>
          <span className="text-sm text-gray-500">
            {lessonState.currentStepIndex + 1} / {lessonState.totalSteps}
          </span>
        </div>
        <ProgressBar
          current={lessonState.currentStepIndex}
          total={lessonState.totalSteps}
        />
      </div>

      <div
        className={`flex flex-1 flex-col items-center justify-center gap-6 px-6 py-4 transition-colors duration-300 ${
          errorFlash ? "bg-red-50" : ""
        }`}
      >
        <p className="max-w-lg text-center text-2xl font-semibold text-gray-800">
          {step.instruction}
        </p>

        {step.type === "intro" && (
          <button
            type="button"
            onClick={handleNext}
            className="min-h-[48px] rounded-2xl bg-blue-500 px-10 py-4 text-xl font-bold text-white transition-colors hover:bg-blue-600"
          >
            Siguiente
          </button>
        )}

        {step.type === "demo" && (
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => handlePlayDemo(step.targetNotes ?? [])}
              className="min-h-[48px] rounded-2xl bg-yellow-500 px-10 py-4 text-xl font-bold text-white transition-colors hover:bg-yellow-600"
            >
              🔊 Escuchar
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="min-h-[48px] rounded-2xl bg-blue-500 px-10 py-4 text-xl font-bold text-white transition-colors hover:bg-blue-600"
            >
              Siguiente
            </button>
          </div>
        )}

        {step.type === "find-note" && (
          <div className="w-full">
            <Keyboard onKeyClick={handleNoteClick} />
          </div>
        )}

        {step.type === "play-real" && (
          <div className="flex w-full flex-col items-center gap-6">
            <Keyboard
              activeNote={step.targetNotes?.[0]}
              activeFinger={step.fingers?.[0]}
              onKeyClick={(note) => {
                resumeAudio();
                audioEngine.playNote(note);
              }}
            />
            <button
              type="button"
              onClick={handleNext}
              className="min-h-[48px] rounded-2xl bg-green-500 px-10 py-4 text-xl font-bold text-white transition-colors hover:bg-green-600"
            >
              ¡Listo!
            </button>
          </div>
        )}

        {step.type === "sequence-quiz" && (
          <div className="w-full">
            <Keyboard
              nextNote={step.targetNotes?.[activeSequenceIndex]}
              activeFinger={step.fingers?.[activeSequenceIndex]}
              onKeyClick={handleNoteClick}
            />
          </div>
        )}
      </div>
    </main>
  );
}
