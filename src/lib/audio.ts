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

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private sampleCache: Map<string, AudioBuffer> = new Map();
  private activeNodes: Array<AudioBufferSourceNode | OscillatorNode> = [];

  private getContext(): AudioContext {
    if (!this.ctx) {
      if (typeof AudioContext === "undefined") {
        throw new Error("AudioContext is not available in this environment");
      }
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  async resume(): Promise<void> {
    const ctx = this.getContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
  }

  async playNote(note: string, duration = 0.5): Promise<void> {
    const ctx = this.getContext();
    const freq = noteToFrequency(note);

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(
      0,
      ctx.currentTime + duration - FADE_OUT_DURATION,
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);

    this.activeNodes.push(osc);

    osc.onended = () => {
      const idx = this.activeNodes.indexOf(osc);
      if (idx !== -1) this.activeNodes.splice(idx, 1);
      osc.disconnect();
      gain.disconnect();
    };
  }

  async playSequence(
    notes: Array<{ note: string; durationMs: number }>,
    tempo = 1.0,
  ): Promise<void> {
    const ctx = this.getContext();
    let offset = ctx.currentTime;

    for (const { note, durationMs } of notes) {
      const durationSec = (durationMs / 1000) * (1 / tempo);
      const freq = noteToFrequency(note);

      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, offset);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1, offset);
      gain.gain.linearRampToValueAtTime(
        0,
        offset + durationSec - FADE_OUT_DURATION,
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(offset);
      osc.stop(offset + durationSec);

      this.activeNodes.push(osc);

      osc.onended = () => {
        const idx = this.activeNodes.indexOf(osc);
        if (idx !== -1) this.activeNodes.splice(idx, 1);
        osc.disconnect();
        gain.disconnect();
      };

      offset += durationSec;
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
  }

  async loadSample(note: string): Promise<boolean> {
    try {
      const ctx = this.getContext();
      const res = await fetch(`/audio/notes/${note}.mp3`);
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
    const buffer = this.sampleCache.get(note);
    if (!buffer) {
      return this.playNote(note, duration);
    }

    const ctx = this.getContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1, ctx.currentTime);

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);

    if (duration !== undefined) {
      source.stop(ctx.currentTime + duration);
    }

    this.activeNodes.push(source);

    source.onended = () => {
      const idx = this.activeNodes.indexOf(source);
      if (idx !== -1) this.activeNodes.splice(idx, 1);
      source.disconnect();
      gain.disconnect();
    };
  }
}

export const audioEngine = new AudioEngine();
