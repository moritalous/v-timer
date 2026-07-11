import { useCallback, useRef } from "react";

function beep(
  ctx: AudioContext,
  dest: AudioNode,
  at: number,
  freq = 1760,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.25, at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);
  osc.connect(gain).connect(dest);
  osc.start(at);
  osc.stop(at + 0.2);
}

export function useAlarm(sound: boolean, vibrate: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmGainRef = useRef<GainNode | null>(null);

  const ensureAudio = useCallback((): AudioContext | null => {
    if (typeof AudioContext === "undefined") return null;
    audioCtxRef.current ??= new AudioContext();
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const stopAlarm = useCallback(() => {
    alarmGainRef.current?.disconnect();
    alarmGainRef.current = null;
    navigator.vibrate?.(0);
  }, []);

  const startAlarm = useCallback(() => {
    if (vibrate) {
      navigator.vibrate?.([500, 200, 500, 200, 500, 200, 500]);
    }
    if (!sound) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    alarmGainRef.current?.disconnect();
    const master = ctx.createGain();
    master.connect(ctx.destination);
    alarmGainRef.current = master;
    const start = ctx.currentTime + 0.05;
    for (let s = 0; s < 10; s++) {
      for (let i = 0; i < 3; i++) {
        beep(ctx, master, start + s + i * 0.16);
      }
    }
  }, [sound, vibrate, ensureAudio]);

  const fireHalfAlert = useCallback(() => {
    if (vibrate) navigator.vibrate?.(200);
    if (!sound) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const at = ctx.currentTime + 0.02;
    beep(ctx, ctx.destination, at, 1320);
    beep(ctx, ctx.destination, at + 0.2, 1320);
  }, [sound, vibrate, ensureAudio]);

  return { ensureAudio, startAlarm, stopAlarm, fireHalfAlert };
}
