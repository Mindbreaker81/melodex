import { describe, it, expect } from "vitest";
import { worlds, allLessons, getLessonById, getWorldById } from "@/content";
import { allSongs } from "@/content/songs";
import { VALID_NOTES } from "@/types/content";
import type { FingerNumber } from "@/types/content";

describe("Content validation", () => {
  it("every lesson has at least one step", () => {
    for (const lesson of allLessons) {
      expect(lesson.steps.length, `${lesson.id} has no steps`).toBeGreaterThan(0);
    }
  });

  it("every lesson has a unique id", () => {
    const ids = allLessons.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all notesUsed in lessons are in VALID_NOTES", () => {
    for (const lesson of allLessons) {
      for (const note of lesson.notesUsed) {
        expect(VALID_NOTES).toContain(note);
      }
    }
  });

  it("all targetNotes in steps are in VALID_NOTES", () => {
    for (const lesson of allLessons) {
      for (const step of lesson.steps) {
        if (step.targetNotes) {
          for (const note of step.targetNotes) {
            expect(VALID_NOTES, `${step.id}: invalid note ${note}`).toContain(note);
          }
        }
      }
    }
  });

  it("all fingers values are between 1 and 5", () => {
    const validFingers: FingerNumber[] = [1, 2, 3, 4, 5];
    for (const lesson of allLessons) {
      for (const step of lesson.steps) {
        if (step.fingers) {
          for (const finger of step.fingers) {
            expect(validFingers, `${step.id}: invalid finger ${finger}`).toContain(finger);
          }
        }
      }
    }
  });

  it("world lessonIds reference existing lessons", () => {
    const lessonIds = new Set(allLessons.map((l) => l.id));
    for (const world of worlds) {
      for (const lid of world.lessonIds) {
        expect(lessonIds.has(lid), `${world.id} references missing lesson ${lid}`).toBe(true);
      }
    }
  });

  it("lessons are ordered sequentially", () => {
    for (const world of worlds) {
      const worldLessons = allLessons
        .filter((l) => l.worldId === world.id)
        .sort((a, b) => a.order - b.order);
      worldLessons.forEach((lesson, idx) => {
        expect(lesson.order, `${lesson.id} order mismatch`).toBe(idx + 1);
      });
    }
  });

  it("every step has a non-empty instruction", () => {
    for (const lesson of allLessons) {
      for (const step of lesson.steps) {
        expect(step.instruction.trim().length, `${step.id} has empty instruction`).toBeGreaterThan(0);
      }
    }
  });

  it("find-note and sequence-quiz steps have targetNotes", () => {
    for (const lesson of allLessons) {
      for (const step of lesson.steps) {
        if (step.type === "find-note" || step.type === "sequence-quiz") {
          expect(step.targetNotes, `${step.id} missing targetNotes`).toBeDefined();
          expect(step.targetNotes!.length, `${step.id} has empty targetNotes`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("intro steps include an illustration and descriptive alt text", () => {
    for (const lesson of allLessons) {
      for (const step of lesson.steps) {
        if (step.type === "intro") {
          expect(step.image, `${step.id} missing image`).toBeDefined();
          expect(step.imageAlt, `${step.id} missing imageAlt`).toBeDefined();
          expect(step.image!.trim().length, `${step.id} empty image`).toBeGreaterThan(0);
          expect(step.imageAlt!.trim().length, `${step.id} empty imageAlt`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("demo steps provide either demoAudio or targetNotes", () => {
    for (const lesson of allLessons) {
      for (const step of lesson.steps) {
        if (step.type === "demo") {
          const hasDemoAudio = step.demoAudio !== undefined && step.demoAudio.trim().length > 0;
          const hasTargetNotes = step.targetNotes !== undefined && step.targetNotes.length > 0;
          expect(
            hasDemoAudio || hasTargetNotes,
            `${step.id} should define demoAudio or targetNotes`,
          ).toBe(true);
        }
      }
    }
  });

  it("songs reference existing required lessons", () => {
    const lessonIds = new Set(allLessons.map((lesson) => lesson.id));
    for (const song of allSongs) {
      expect(
        lessonIds.has(song.requiredLessonId),
        `${song.id} references missing required lesson ${song.requiredLessonId}`,
      ).toBe(true);
    }
  });

  it("song fragments stay within the guided practice size", () => {
    for (const song of allSongs) {
      for (const fragment of song.fragments) {
        expect(
          fragment.notes.length,
          `${fragment.id} should have between 4 and 8 notes`,
        ).toBeGreaterThanOrEqual(4);
        expect(
          fragment.notes.length,
          `${fragment.id} should have between 4 and 8 notes`,
        ).toBeLessThanOrEqual(8);
      }
    }
  });

  it("getLessonById returns correct lesson", () => {
    for (const lesson of allLessons) {
      const found = getLessonById(lesson.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(lesson.id);
    }
    expect(getLessonById("nonexistent")).toBeUndefined();
  });

  it("getWorldById returns correct world", () => {
    for (const world of worlds) {
      const found = getWorldById(world.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(world.id);
    }
    expect(getWorldById("nonexistent")).toBeUndefined();
  });
});
