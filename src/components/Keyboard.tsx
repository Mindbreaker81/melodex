"use client";

import { type FingerNumber, FINGER_COLORS, FINGER_NAMES } from "@/types/content";

interface KeyboardProps {
  activeNote?: string | null;
  activeFinger?: FingerNumber | null;
  nextNote?: string | null;
  onKeyClick?: (note: string) => void;
  startOctave?: number;
  endOctave?: number;
}

const SPANISH_NAMES: Record<string, string> = {
  C: "Do",
  D: "Re",
  E: "Mi",
  F: "Fa",
  G: "Sol",
  A: "La",
  B: "Si",
};

const WHITE_NOTES = ["C", "D", "E", "F", "G", "A", "B"];
const NOTES_WITH_SHARP = new Set(["C", "D", "F", "G", "A"]);
const WHITE_KEY_WIDTH = 44;
const BLACK_KEY_WIDTH = 36;

interface KeyInfo {
  note: string;
  isBlack: boolean;
  whiteIndex: number;
  spanishName: string;
}

export function generateKeys(
  startOctave: number,
  endOctave: number,
): KeyInfo[] {
  const keys: KeyInfo[] = [];
  let whiteIndex = 0;

  for (let octave = startOctave; octave <= endOctave; octave++) {
    const isLast = octave === endOctave;
    const notes = isLast ? ["C"] : WHITE_NOTES;

    for (const note of notes) {
      const spanish = SPANISH_NAMES[note];
      keys.push({
        note: `${note}${octave}`,
        isBlack: false,
        whiteIndex,
        spanishName: spanish,
      });

      if (!isLast && NOTES_WITH_SHARP.has(note)) {
        keys.push({
          note: `${note}#${octave}`,
          isBlack: true,
          whiteIndex,
          spanishName: `${spanish}#`,
        });
      }

      whiteIndex++;
    }
  }

  return keys;
}

export default function Keyboard({
  activeNote = null,
  activeFinger = null,
  nextNote = null,
  onKeyClick,
  startOctave = 3,
  endOctave = 5,
}: KeyboardProps) {
  const keys = generateKeys(startOctave, endOctave);
  const whiteKeys = keys.filter((k) => !k.isBlack);
  const blackKeys = keys.filter((k) => k.isBlack);

  function keyStyle(note: string): React.CSSProperties {
    if (note === activeNote && activeFinger) {
      return { backgroundColor: FINGER_COLORS[activeFinger] };
    }
    if (note === nextNote) {
      const color = activeFinger ? FINGER_COLORS[activeFinger] : "#93C5FD";
      return { backgroundColor: color, opacity: 0.3 };
    }
    return {};
  }

  const isActive = (note: string) => note === activeNote && activeFinger;

  function ariaLabel(key: KeyInfo): string {
    const base = `${key.note} (${key.spanishName})`;
    if (key.note === activeNote && activeFinger) {
      return `${base} - dedo ${activeFinger}, ${FINGER_NAMES[activeFinger]}`;
    }
    return base;
  }

  return (
    <div>
      <p className="mb-2 text-center text-xs text-gray-400 sm:hidden">
        📱 Gira tu dispositivo para ver el teclado completo
      </p>
      <div className="overflow-x-auto">
        <div
          className="relative inline-flex"
          style={{ width: whiteKeys.length * WHITE_KEY_WIDTH }}
        >
          {whiteKeys.map((key) => (
            <button
              key={key.note}
              type="button"
              aria-label={ariaLabel(key)}
              className="relative flex h-48 items-end justify-center border border-gray-300 bg-white pb-2 text-xs text-gray-500"
              style={{
                width: WHITE_KEY_WIDTH,
                minWidth: WHITE_KEY_WIDTH,
                ...keyStyle(key.note),
              }}
              onClick={() => onKeyClick?.(key.note)}
            >
              {isActive(key.note) && (
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                  {activeFinger}
                </span>
              )}
            </button>
          ))}
          {blackKeys.map((key) => (
            <button
              key={key.note}
              type="button"
              aria-label={ariaLabel(key)}
              className="absolute top-0 z-10 flex h-36 items-end justify-center rounded-b border border-gray-800 bg-black pb-1 text-xs"
              style={{
                width: BLACK_KEY_WIDTH,
                left:
                  (key.whiteIndex + 1) * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2,
                ...keyStyle(key.note),
              }}
              onClick={() => onKeyClick?.(key.note)}
            >
              {isActive(key.note) && (
                <span className="flex items-center justify-center text-sm font-bold text-white">
                  {activeFinger}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
