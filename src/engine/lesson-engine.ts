import type { Lesson, LessonStep } from "@/types/content";

export interface LessonState {
  lessonId: string;
  currentStepIndex: number;
  totalSteps: number;
  quizErrors: number;
  completedStepIds: string[];
  isComplete: boolean;
  startedAt: string;
}

export type UserAction =
  | { type: "next" }
  | { type: "answer"; note: string }
  | { type: "answer-sequence"; notes: string[] }
  | { type: "retry" };

export function initLesson(lesson: Lesson): LessonState {
  return {
    lessonId: lesson.id,
    currentStepIndex: 0,
    totalSteps: lesson.steps.length,
    quizErrors: 0,
    completedStepIds: [],
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
      return advanceStep(state, currentStep);
    }

    case "answer": {
      if (currentStep.type !== "find-note") return state;
      const expected = currentStep.targetNotes?.[0];
      if (action.note === expected) {
        return advanceStep(state, currentStep);
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
        return advanceStep(state, currentStep);
      }
      return { ...state, quizErrors: state.quizErrors + 1 };
    }

    default:
      return state;
  }
}

function advanceStep(state: LessonState, currentStep: LessonStep): LessonState {
  const completedStepIds = [...state.completedStepIds, currentStep.id];
  const nextIndex = state.currentStepIndex + 1;
  const isComplete = nextIndex >= state.totalSteps;

  return {
    ...state,
    currentStepIndex: isComplete ? state.currentStepIndex : nextIndex,
    completedStepIds,
    isComplete,
  };
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
  if (state.completedStepIds.length > state.totalSteps) return 3;
  return 2;
}

export function isLessonUnlocked(
  lessonOrder: number,
  completedLessonIds: string[],
  allLessons: Lesson[],
): boolean {
  if (lessonOrder <= 1) return true;
  const previousLesson = allLessons.find((l) => l.order === lessonOrder - 1);
  if (!previousLesson) return false;
  return completedLessonIds.includes(previousLesson.id);
}
