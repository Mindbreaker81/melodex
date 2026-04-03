import type { Lesson, LessonStep } from "@/types/content";

export interface LessonState {
  lessonId: string;
  currentStepIndex: number;
  totalSteps: number;
  quizErrors: number;
  completedStepIds: string[];
  mainExerciseRepeated: boolean;
  isComplete: boolean;
  startedAt: string;
}

export type UserAction =
  | { type: "next" }
  | { type: "answer"; note: string }
  | { type: "answer-sequence"; notes: string[] }
  | { type: "repeat-main" }
  | { type: "retry" };

export function initLesson(lesson: Lesson): LessonState {
  return {
    lessonId: lesson.id,
    currentStepIndex: 0,
    totalSteps: lesson.steps.length,
    quizErrors: 0,
    completedStepIds: [],
    mainExerciseRepeated: false,
    isComplete: false,
    startedAt: new Date().toISOString(),
  };
}

export function processAction(
  state: LessonState,
  action: UserAction,
  lesson: Lesson,
): LessonState {
  if (action.type === "retry") {
    return {
      ...state,
      currentStepIndex: 0,
      completedStepIds: [...state.completedStepIds],
      isComplete: false,
    };
  }

  if (action.type === "repeat-main") {
    if (!state.isComplete) return state;
    return {
      ...state,
      currentStepIndex: getMainExerciseIndex(lesson),
      isComplete: false,
    };
  }

  if (state.isComplete) return state;

  const currentStep = lesson.steps[state.currentStepIndex];
  if (!currentStep) return state;

  switch (action.type) {
    case "next": {
      if (
        currentStep.type !== "intro" &&
        currentStep.type !== "demo" &&
        currentStep.type !== "play-real"
      ) {
        return state;
      }
      return advanceStep(state, currentStep, lesson);
    }

    case "answer": {
      if (currentStep.type !== "find-note") return state;
      const expected = currentStep.targetNotes ?? [];
      if (expected.includes(action.note)) {
        return advanceStep(state, currentStep, lesson);
      }
      return { ...state, quizErrors: state.quizErrors + 1 };
    }

    case "answer-sequence": {
      if (currentStep.type !== "sequence-quiz") return state;
      const expected = currentStep.targetNotes ?? [];
      const isCorrect =
        action.notes.length === expected.length &&
        action.notes.every((n, i) => n === expected[i]);
      if (isCorrect) {
        return advanceStep(state, currentStep, lesson);
      }
      return { ...state, quizErrors: state.quizErrors + 1 };
    }

    default:
      return state;
  }
}

function advanceStep(
  state: LessonState,
  currentStep: LessonStep,
  lesson: Lesson,
): LessonState {
  const completedStepIds = [...state.completedStepIds, currentStep.id];
  const nextIndex = state.currentStepIndex + 1;
  const isComplete = nextIndex >= state.totalSteps;
  const mainExerciseStep = lesson.steps[getMainExerciseIndex(lesson)];
  const mainExerciseRepeated =
    state.mainExerciseRepeated ||
    (
      currentStep.id === mainExerciseStep?.id &&
      state.completedStepIds.includes(currentStep.id)
    );

  return {
    ...state,
    currentStepIndex: isComplete ? state.currentStepIndex : nextIndex,
    completedStepIds,
    mainExerciseRepeated,
    isComplete,
  };
}

function getMainExerciseIndex(lesson: Lesson): number {
  for (let index = lesson.steps.length - 1; index >= 0; index--) {
    const stepType = lesson.steps[index]?.type;
    if (
      stepType === "play-real" ||
      stepType === "sequence-quiz" ||
      stepType === "find-note"
    ) {
      return index;
    }
  }

  return Math.max(lesson.steps.length - 1, 0);
}

export function getCurrentStep(
  state: LessonState,
  lesson: Lesson,
): LessonStep | null {
  if (state.isComplete) return null;
  return lesson.steps[state.currentStepIndex] ?? null;
}

export function calculateStars(state: LessonState): number {
  if (!state.isComplete) return 0;
  if (state.quizErrors > 0) return 1;
  if (state.mainExerciseRepeated) return 3;
  return 2;
}

export function isLessonUnlocked(
  lessonId: string,
  completedLessonIds: string[],
  orderedLessons: Lesson[],
): boolean {
  const currentIndex = orderedLessons.findIndex((lesson) => lesson.id === lessonId);
  if (currentIndex === -1) return false;
  if (currentIndex === 0) return true;
  return completedLessonIds.includes(orderedLessons[currentIndex - 1].id);
}
