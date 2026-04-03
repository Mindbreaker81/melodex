import type { LessonAttempt, SongAttempt } from "@/types/storage";

const DEFAULT_SESSION_GAP_MS = 30 * 60 * 1000;

export interface PracticeSessionActivity {
  type: "lesson" | "song";
  id: string;
}

export interface PracticeSessionItem extends PracticeSessionActivity {
  createdAt: string;
  durationSeconds: number | null;
}

export interface PracticeSession {
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  attemptCount: number;
  activities: PracticeSessionActivity[];
  items: PracticeSessionItem[];
}

function toPracticeSessionItems(
  lessonAttempts: LessonAttempt[],
  songAttempts: SongAttempt[],
): PracticeSessionItem[] {
  return [
    ...lessonAttempts.map((attempt) => ({
      type: "lesson" as const,
      id: attempt.lessonId,
      createdAt: attempt.createdAt,
      durationSeconds: attempt.durationSeconds,
    })),
    ...songAttempts.map((attempt) => ({
      type: "song" as const,
      id: attempt.songId,
      createdAt: attempt.createdAt,
      durationSeconds: attempt.durationSeconds,
    })),
  ].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function buildSession(items: PracticeSessionItem[]): PracticeSession {
  const dedupedActivities = new Map<string, PracticeSessionActivity>();

  for (const item of items) {
    dedupedActivities.set(`${item.type}:${item.id}`, {
      type: item.type,
      id: item.id,
    });
  }

  return {
    startedAt: items[0].createdAt,
    endedAt: items[items.length - 1].createdAt,
    durationSeconds: items.reduce(
      (total, item) => total + (item.durationSeconds ?? 0),
      0,
    ),
    attemptCount: items.length,
    activities: [...dedupedActivities.values()],
    items,
  };
}

export function buildPracticeSessions(
  lessonAttempts: LessonAttempt[],
  songAttempts: SongAttempt[],
  maxGapMs = DEFAULT_SESSION_GAP_MS,
): PracticeSession[] {
  const items = toPracticeSessionItems(lessonAttempts, songAttempts);
  if (items.length === 0) return [];

  const sessions: PracticeSessionItem[][] = [[items[0]]];

  for (let index = 1; index < items.length; index++) {
    const currentItem = items[index];
    const previousItem = items[index - 1];
    const currentSession = sessions[sessions.length - 1];
    const gapMs =
      new Date(currentItem.createdAt).getTime() -
      new Date(previousItem.createdAt).getTime();

    if (gapMs <= maxGapMs) {
      currentSession.push(currentItem);
    } else {
      sessions.push([currentItem]);
    }
  }

  return sessions.map(buildSession);
}
