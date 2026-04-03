const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

const FLAT_TO_SHARP: Record<string, string> = {
  Db: "C#",
  Eb: "D#",
  Fb: "E",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
  Cb: "B",
};

export function noteToMidi(note: string): number {
  const match = note.match(/^([A-Ga-g][#b]?)(-?\d+)$/);
  if (!match) throw new Error(`Invalid note: ${note}`);

  let [, name] = match;
  const octaveStr = match[2];
  name = name[0].toUpperCase() + name.slice(1);

  if (name in FLAT_TO_SHARP) {
    name = FLAT_TO_SHARP[name];
  }

  const semitone = NOTE_NAMES.indexOf(name as (typeof NOTE_NAMES)[number]);
  if (semitone === -1) throw new Error(`Invalid note name: ${name}`);

  const octave = parseInt(octaveStr, 10);
  return (octave + 1) * 12 + semitone;
}

export function noteToFrequency(note: string): number {
  const midi = noteToMidi(note);
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const FADE_OUT_DURATION = 0.05;

export interface ReferenceSequenceNote {
  note: string;
  durationMs: number;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private sampleCache: Map<string, AudioBuffer> = new Map();
  private activeNodes: Array<AudioBufferSourceNode | OscillatorNode> = [];
  private activeAssets: HTMLAudioElement[] = [];

  private getContext(): AudioContext {
    if (!this.ctx) {
      if (typeof AudioContext === "undefined") {
        throw new Error("AudioContext is not available in this environment");
      }
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  private cleanupNode(node: AudioBufferSourceNode | OscillatorNode) {
    const idx = this.activeNodes.indexOf(node);
    if (idx !== -1) this.activeNodes.splice(idx, 1);
    node.disconnect();
  }

  private scheduleOscillator(note: string, startTime: number, duration: number) {
    const ctx = this.getContext();
    const freq = noteToFrequency(note);

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1, startTime);
    gain.gain.linearRampToValueAtTime(
      0,
      Math.max(startTime + duration - FADE_OUT_DURATION, startTime),
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);

    this.activeNodes.push(osc);

    osc.onended = () => {
      this.cleanupNode(osc);
      gain.disconnect();
    };
  }

  private scheduleSample(note: string, startTime: number, duration?: number): boolean {
    const buffer = this.sampleCache.get(note);
    if (!buffer) return false;

    const ctx = this.getContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1, startTime);
    if (duration !== undefined) {
      gain.gain.linearRampToValueAtTime(
        0,
        Math.max(startTime + duration - FADE_OUT_DURATION, startTime),
      );
    }

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(startTime);

    if (duration !== undefined) {
      source.stop(startTime + duration);
    }

    this.activeNodes.push(source);

    source.onended = () => {
      this.cleanupNode(source);
      gain.disconnect();
    };

    return true;
  }

  async resume(): Promise<void> {
    const ctx = this.getContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
  }

  async playNote(note: string, duration = 0.5): Promise<void> {
    const ctx = this.getContext();
    this.scheduleOscillator(note, ctx.currentTime, duration);
  }

  async playSequence(
    notes: ReferenceSequenceNote[],
    tempo = 1.0,
  ): Promise<void> {
    const ctx = this.getContext();
    let offset = ctx.currentTime;

    for (const { note, durationMs } of notes) {
      const durationSec = (durationMs / 1000) * (1 / tempo);
      this.scheduleOscillator(note, offset, durationSec);
      offset += durationSec;
    }
  }

  async preloadNotes(notes: string[]): Promise<void> {
    const uniqueNotes = [...new Set(notes)];
    await Promise.all(uniqueNotes.map((note) => this.loadSample(note)));
  }

  async playReferenceNote(note: string, duration = 0.5): Promise<void> {
    const ctx = this.getContext();
    if (!this.sampleCache.has(note)) {
      await this.loadSample(note);
    }

    if (!this.scheduleSample(note, ctx.currentTime, duration)) {
      this.scheduleOscillator(note, ctx.currentTime, duration);
    }
  }

  async playReferenceSequence(
    notes: ReferenceSequenceNote[],
    tempo = 1.0,
  ): Promise<void> {
    await this.preloadNotes(notes.map((item) => item.note));

    const ctx = this.getContext();
    let offset = ctx.currentTime;

    for (const { note, durationMs } of notes) {
      const durationSec = (durationMs / 1000) * (1 / tempo);
      if (!this.scheduleSample(note, offset, durationSec)) {
        this.scheduleOscillator(note, offset, durationSec);
      }
      offset += durationSec;
    }
  }

  async playAsset(url: string, playbackRate = 1): Promise<HTMLAudioElement | null> {
    if (typeof Audio === "undefined") return null;

    const audio = new Audio(url);
    audio.playbackRate = playbackRate;
    this.activeAssets.push(audio);

    const cleanup = () => {
      const idx = this.activeAssets.indexOf(audio);
      if (idx !== -1) this.activeAssets.splice(idx, 1);
    };

    audio.onended = cleanup;
    audio.onerror = cleanup;

    try {
      await audio.play();
      return audio;
    } catch {
      cleanup();
      return null;
    }
  }

  stop(): void {
    for (const node of this.activeNodes) {
      try {
        node.stop();
        node.disconnect();
      } catch {
        // already stopped
      }
    }
    this.activeNodes = [];

    for (const asset of this.activeAssets) {
      asset.pause();
      asset.currentTime = 0;
    }
    this.activeAssets = [];
  }

  async loadSample(note: string): Promise<boolean> {
    if (this.sampleCache.has(note)) return true;

    try {
      const ctx = this.getContext();
      const safeName = note.replace("#", "s");
      const res = await fetch(`/audio/notes/${safeName}.wav`);
      if (!res.ok) return false;
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.sampleCache.set(note, audioBuffer);
      return true;
    } catch {
      return false;
    }
  }

  async playNoteSample(note: string, duration?: number): Promise<void> {
    const ctx = this.getContext();

    if (!this.sampleCache.has(note)) {
      await this.loadSample(note);
    }

    if (!this.scheduleSample(note, ctx.currentTime, duration)) {
      this.scheduleOscillator(note, ctx.currentTime, duration ?? 0.5);
    }
  }
}

export const audioEngine = new AudioEngine();
