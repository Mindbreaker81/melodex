import { describe, it, expect, vi, beforeEach } from "vitest";
import { noteToFrequency, noteToMidi } from "@/lib/audio";

function createOscillatorMock() {
  return {
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
    type: "triangle" as OscillatorType,
    frequency: { setValueAtTime: vi.fn() },
    onended: null as (() => void) | null,
  };
}

function createBufferSourceMock() {
  return {
    buffer: null as AudioBuffer | null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
    onended: null as (() => void) | null,
  };
}

function createGainMock() {
  return {
    connect: vi.fn(),
    disconnect: vi.fn(),
    gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
  };
}

const mockContext = {
  createOscillator: vi.fn(() => createOscillatorMock()),
  createGain: vi.fn(() => createGainMock()),
  createBufferSource: vi.fn(() => createBufferSourceMock()),
  decodeAudioData: vi.fn(async () => ({ id: "buffer" }) as unknown as AudioBuffer),
  currentTime: 0,
  destination: {},
  state: "running" as AudioContextState,
  resume: vi.fn(),
};

const fetchMock = vi.fn();
const audioPlayMock = vi.fn();
const audioPauseMock = vi.fn();
const AudioMock = vi.fn().mockImplementation((url: string) => ({
  src: url,
  playbackRate: 1,
  currentTime: 0,
  play: audioPlayMock,
  pause: audioPauseMock,
  onended: null as (() => void) | null,
  onerror: null as (() => void) | null,
}));

vi.stubGlobal("AudioContext", vi.fn(() => mockContext));
vi.stubGlobal("fetch", fetchMock);
vi.stubGlobal("Audio", AudioMock as unknown as typeof Audio);

describe("noteToMidi", () => {
  it("returns 60 for C4", () => {
    expect(noteToMidi("C4")).toBe(60);
  });

  it("returns 69 for A4", () => {
    expect(noteToMidi("A4")).toBe(69);
  });

  it("returns 61 for C#4", () => {
    expect(noteToMidi("C#4")).toBe(61);
  });

  it("handles flats (Bb3 -> A#3 = 58)", () => {
    expect(noteToMidi("Bb3")).toBe(58);
  });

  it("throws for invalid note", () => {
    expect(() => noteToMidi("X9")).toThrow("Invalid note");
  });
});

describe("noteToFrequency", () => {
  it("returns 440 for A4", () => {
    expect(noteToFrequency("A4")).toBeCloseTo(440, 2);
  });

  it("returns ~261.63 for C4", () => {
    expect(noteToFrequency("C4")).toBeCloseTo(261.63, 1);
  });

  it("returns ~329.63 for E4", () => {
    expect(noteToFrequency("E4")).toBeCloseTo(329.63, 1);
  });
});

describe("AudioEngine", () => {
  let AudioEngine: typeof import("@/lib/audio").AudioEngine;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockContext.currentTime = 0;
    mockContext.state = "running";
    mockContext.createOscillator.mockImplementation(() => createOscillatorMock());
    mockContext.createGain.mockImplementation(() => createGainMock());
    mockContext.createBufferSource.mockImplementation(() => createBufferSourceMock());
    mockContext.decodeAudioData.mockResolvedValue({ id: "buffer" } as unknown as AudioBuffer);
    fetchMock.mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    });
    audioPlayMock.mockResolvedValue(undefined);

    const mod = await import("@/lib/audio");
    AudioEngine = mod.AudioEngine;
  });

  it("playNote creates oscillator with triangle waveform and correct frequency", async () => {
    const engine = new AudioEngine();
    await engine.playNote("A4", 0.5);

    expect(mockContext.createOscillator).toHaveBeenCalled();
    expect(mockContext.createGain).toHaveBeenCalled();

    const osc = mockContext.createOscillator.mock.results[0].value;
    expect(osc.type).toBe("triangle");
    expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0);
    expect(osc.start).toHaveBeenCalled();
    expect(osc.stop).toHaveBeenCalled();
  });

  it("playNote applies gain envelope with fade out", async () => {
    const engine = new AudioEngine();
    await engine.playNote("C4", 1.0);

    const gain = mockContext.createGain.mock.results[0].value;
    expect(gain.gain.setValueAtTime).toHaveBeenCalledWith(1, 0);
    expect(gain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 0.95);
  });

  it("playSequence schedules multiple notes at correct offsets", async () => {
    const engine = new AudioEngine();
    await engine.playSequence([
      { note: "C4", durationMs: 500 },
      { note: "E4", durationMs: 500 },
    ]);

    expect(mockContext.createOscillator).toHaveBeenCalledTimes(2);
    expect(mockContext.createGain).toHaveBeenCalledTimes(2);

    const osc1 = mockContext.createOscillator.mock.results[0].value;
    const osc2 = mockContext.createOscillator.mock.results[1].value;

    expect(osc1.start).toHaveBeenCalledWith(0);
    expect(osc1.stop).toHaveBeenCalledWith(0.5);
    expect(osc2.start).toHaveBeenCalledWith(0.5);
    expect(osc2.stop).toHaveBeenCalledWith(1.0);
  });

  it("playReferenceNote prefers note samples when available", async () => {
    const engine = new AudioEngine();
    await engine.playReferenceNote("A4", 0.5);

    expect(fetchMock).toHaveBeenCalledWith("/audio/notes/A4.wav");
    expect(mockContext.createBufferSource).toHaveBeenCalled();
    expect(mockContext.createOscillator).not.toHaveBeenCalled();
  });

  it("playReferenceNote falls back to oscillator when sample loading fails", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      arrayBuffer: vi.fn(),
    });

    const engine = new AudioEngine();
    await engine.playReferenceNote("A4", 0.5);

    expect(mockContext.createOscillator).toHaveBeenCalled();
  });

  it("playAsset uses HTML audio with playbackRate", async () => {
    const engine = new AudioEngine();
    const audio = await engine.playAsset("/audio/songs/estrellita.wav", 0.75);

    expect(AudioMock).toHaveBeenCalledWith("/audio/songs/estrellita.wav");
    expect(audioPlayMock).toHaveBeenCalled();
    expect(audio?.playbackRate).toBe(0.75);
  });

  it("stop clears active nodes and playing assets", async () => {
    const engine = new AudioEngine();
    await engine.playReferenceNote("A4", 2.0);
    const audio = await engine.playAsset("/audio/songs/estrellita.wav");

    const source = mockContext.createBufferSource.mock.results[0].value;

    engine.stop();

    expect(source.stop).toHaveBeenCalled();
    expect(source.disconnect).toHaveBeenCalled();
    expect(audioPauseMock).toHaveBeenCalled();
    expect(audio?.currentTime).toBe(0);
  });

  it("resume calls ctx.resume when suspended", async () => {
    mockContext.state = "suspended";
    mockContext.resume.mockResolvedValue(undefined);

    const engine = new AudioEngine();
    await engine.resume();

    expect(mockContext.resume).toHaveBeenCalled();
  });
});
