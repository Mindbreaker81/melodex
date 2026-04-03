import { describe, it, expect } from "vitest";
import type { Lesson } from "@/types/content";
import {
  initLesson,
  processAction,
  getCurrentStep,
  calculateStars,
  isLessonUnlocked,
} from "@/engine/lesson-engine";

const mockLesson: Lesson = {
  id: "lesson-1",
  worldId: "world-1",
  order: 1,
  title: "Test",
  objective: "Test",
  estimatedMinutes: 5,
  hand: "right",
  notesUsed: ["C4", "D4"],
  steps: [
    { id: "s1", type: "intro", instruction: "Intro" },
    { id: "s2", type: "find-note", instruction: "Find C", targetNotes: ["C4"] },
    { id: "s3", type: "play-real", instruction: "Play it" },
  ],
};

describe("initLesson", () => {
  it("sets correct initial state", () => {
    const state = initLesson(mockLesson);
    expect(state.lessonId).toBe("lesson-1");
    expect(state.currentStepIndex).toBe(0);
    expect(state.totalSteps).toBe(3);
    expect(state.quizErrors).toBe(0);
    expect(state.completedStepIds).toEqual([]);
    expect(state.isComplete).toBe(false);
    expect(state.startedAt).toBeDefined();
  });
});

describe("processAction", () => {
  it('"next" advances step on intro', () => {
    const state = initLesson(mockLesson);
    const next = processAction(state, { type: "next" }, mockLesson);
    expect(next.currentStepIndex).toBe(1);
    expect(next.completedStepIds).toContain("s1");
  });

  it('"next" advances step on demo', () => {
    const demoLesson: Lesson = {
      ...mockLesson,
      steps: [
        { id: "d1", type: "demo", instruction: "Demo" },
        { id: "d2", type: "intro", instruction: "Next" },
      ],
    };
    const state = initLesson(demoLesson);
    const next = processAction(state, { type: "next" }, demoLesson);
    expect(next.currentStepIndex).toBe(1);
    expect(next.completedStepIds).toContain("d1");
  });

  it('"next" advances step on play-real', () => {
    const state = initLesson(mockLesson);
    const afterIntro = processAction(state, { type: "next" }, mockLesson);
    const afterFind = processAction(
      afterIntro,
      { type: "answer", note: "C4" },
      mockLesson,
    );
    const afterPlay = processAction(afterFind, { type: "next" }, mockLesson);
    expect(afterPlay.isComplete).toBe(true);
    expect(afterPlay.completedStepIds).toContain("s3");
  });

  it('"next" on last step completes the lesson', () => {
    const singleLesson: Lesson = {
      ...mockLesson,
      steps: [{ id: "only", type: "intro", instruction: "Only step" }],
    };
    const state = initLesson(singleLesson);
    const next = processAction(state, { type: "next" }, singleLesson);
    expect(next.isComplete).toBe(true);
  });

  it('"answer" with correct note advances', () => {
    const state = initLesson(mockLesson);
    const afterIntro = processAction(state, { type: "next" }, mockLesson);
    const afterAnswer = processAction(
      afterIntro,
      { type: "answer", note: "C4" },
      mockLesson,
    );
    expect(afterAnswer.currentStepIndex).toBe(2);
    expect(afterAnswer.completedStepIds).toContain("s2");
    expect(afterAnswer.quizErrors).toBe(0);
  });

  it('"answer" with wrong note increments errors and stays', () => {
    const state = initLesson(mockLesson);
    const afterIntro = processAction(state, { type: "next" }, mockLesson);
    const afterWrong = processAction(
      afterIntro,
      { type: "answer", note: "D4" },
      mockLesson,
    );
    expect(afterWrong.currentStepIndex).toBe(1);
    expect(afterWrong.quizErrors).toBe(1);
    expect(afterWrong.completedStepIds).not.toContain("s2");
  });

  it('"answer-sequence" with correct notes advances', () => {
    const seqLesson: Lesson = {
      ...mockLesson,
      steps: [
        {
          id: "seq1",
          type: "sequence-quiz",
          instruction: "Play sequence",
          targetNotes: ["C4", "D4"],
        },
        { id: "seq2", type: "intro", instruction: "Done" },
      ],
    };
    const state = initLesson(seqLesson);
    const next = processAction(
      state,
      { type: "answer-sequence", notes: ["C4", "D4"] },
      seqLesson,
    );
    expect(next.currentStepIndex).toBe(1);
    expect(next.completedStepIds).toContain("seq1");
  });

  it('"answer-sequence" with wrong notes increments errors', () => {
    const seqLesson: Lesson = {
      ...mockLesson,
      steps: [
        {
          id: "seq1",
          type: "sequence-quiz",
          instruction: "Play sequence",
          targetNotes: ["C4", "D4"],
        },
      ],
    };
    const state = initLesson(seqLesson);
    const next = processAction(
      state,
      { type: "answer-sequence", notes: ["D4", "C4"] },
      seqLesson,
    );
    expect(next.currentStepIndex).toBe(0);
    expect(next.quizErrors).toBe(1);
  });

  it("ignores actions when lesson is complete", () => {
    const singleLesson: Lesson = {
      ...mockLesson,
      steps: [{ id: "only", type: "intro", instruction: "Only" }],
    };
    const state = initLesson(singleLesson);
    const complete = processAction(state, { type: "next" }, singleLesson);
    expect(complete.isComplete).toBe(true);

    const after = processAction(complete, { type: "next" }, singleLesson);
    expect(after).toBe(complete);
  });

  it('"retry" resets to step 0 but keeps errors', () => {
    const state = initLesson(mockLesson);
    const afterIntro = processAction(state, { type: "next" }, mockLesson);
    const afterWrong = processAction(
      afterIntro,
      { type: "answer", note: "D4" },
      mockLesson,
    );
    const retried = processAction(afterWrong, { type: "retry" }, mockLesson);
    expect(retried.currentStepIndex).toBe(0);
    expect(retried.quizErrors).toBe(1);
    expect(retried.isComplete).toBe(false);
  });
});

describe("calculateStars", () => {
  it("returns 1 for completed with errors", () => {
    const state = initLesson(mockLesson);
    const result = {
      ...state,
      isComplete: true,
      quizErrors: 2,
      completedStepIds: ["s1", "s2", "s3"],
    };
    expect(calculateStars(result)).toBe(1);
  });

  it("returns 2 for completed with 0 errors", () => {
    const state = initLesson(mockLesson);
    const result = {
      ...state,
      isComplete: true,
      quizErrors: 0,
      completedStepIds: ["s1", "s2", "s3"],
    };
    expect(calculateStars(result)).toBe(2);
  });

  it("returns 3 for 0 errors and repeated steps", () => {
    const state = initLesson(mockLesson);
    const result = {
      ...state,
      isComplete: true,
      quizErrors: 0,
      completedStepIds: ["s1", "s2", "s3", "s1"],
    };
    expect(calculateStars(result)).toBe(3);
  });

  it("returns 0 for incomplete", () => {
    const state = initLesson(mockLesson);
    expect(calculateStars(state)).toBe(0);
  });
});

describe("getCurrentStep", () => {
  it("returns correct step", () => {
    const state = initLesson(mockLesson);
    const step = getCurrentStep(state, mockLesson);
    expect(step).toEqual(mockLesson.steps[0]);
  });

  it("returns null when complete", () => {
    const state = { ...initLesson(mockLesson), isComplete: true };
    expect(getCurrentStep(state, mockLesson)).toBeNull();
  });
});

describe("isLessonUnlocked", () => {
  const allLessons: Lesson[] = [
    mockLesson,
    { ...mockLesson, id: "lesson-2", order: 2 },
    { ...mockLesson, id: "lesson-3", order: 3 },
  ];

  it("lesson 1 is always unlocked", () => {
    expect(isLessonUnlocked(1, [], allLessons)).toBe(true);
  });

  it("lesson 2 requires lesson 1 completed", () => {
    expect(isLessonUnlocked(2, ["lesson-1"], allLessons)).toBe(true);
    expect(isLessonUnlocked(2, [], allLessons)).toBe(false);
  });

  it("lesson 3 not unlocked if lesson 2 not completed", () => {
    expect(isLessonUnlocked(3, ["lesson-1"], allLessons)).toBe(false);
    expect(isLessonUnlocked(3, ["lesson-1", "lesson-2"], allLessons)).toBe(true);
  });
});
