import { describe, it, expect, vi, beforeEach } from "vitest";
import { noteToFrequency, noteToMidi } from "@/lib/audio";

const mockOscillator = {
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  disconnect: vi.fn(),
  type: "triangle" as OscillatorType,
  frequency: { setValueAtTime: vi.fn() },
  onended: null as (() => void) | null,
};

const mockContext = {
  createOscillator: vi.fn(() => ({ ...mockOscillator })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
  })),
  createBufferSource: vi.fn(),
  decodeAudioData: vi.fn(),
  currentTime: 0,
  destination: {},
  state: "running" as AudioContextState,
  resume: vi.fn(),
};

vi.stubGlobal("AudioContext", vi.fn(() => mockContext));

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
    mockContext.createOscillator.mockReturnValue({ ...mockOscillator });
    mockContext.createGain.mockReturnValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    });

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

  it("stop clears active nodes", async () => {
    const mockStop = vi.fn();
    const mockDisconnect = vi.fn();
    mockContext.createOscillator.mockReturnValue({
      ...mockOscillator,
      stop: mockStop,
      disconnect: mockDisconnect,
      onended: null,
    });

    const engine = new AudioEngine();
    await engine.playNote("A4", 2.0);

    engine.stop();
    expect(mockStop).toHaveBeenCalled();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("resume calls ctx.resume when suspended", async () => {
    mockContext.state = "suspended";
    mockContext.resume.mockResolvedValue(undefined);

    const engine = new AudioEngine();
    await engine.resume();

    expect(mockContext.resume).toHaveBeenCalled();
  });
});
