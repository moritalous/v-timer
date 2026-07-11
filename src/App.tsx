import { useCallback, useEffect, useRef, useState } from "react";
import { SettingsSheet } from "./components/SettingsSheet";
import { TimerBar } from "./components/TimerBar";
import {
  MAX_DURATION_SEC,
  MAX_MINUTES,
  MAX_SEGMENTS,
  MIN_SEGMENTS,
  STORAGE_KEY,
} from "./constants";
import { useAlarm } from "./hooks/useAlarm";
import { useTheme } from "./hooks/useTheme";
import { useWakeLock } from "./hooks/useWakeLock";
import type { Phase, Settings } from "./types";
import {
  digitsToParts,
  durationToDigits,
  formatDurationLabel,
  formatTime,
  loadSettings,
} from "./utils";

function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [phase, setPhase] = useState<Phase>("idle");
  const [remainingMs, setRemainingMs] = useState(settings.durationSec * 1000);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [digits, setDigits] = useState("");

  const endAtRef = useRef(0);
  const halfFiredRef = useRef(false);

  const durationMs = settings.durationSec * 1000;
  const running = phase === "running";
  const finished = phase === "finished";

  const { ensureAudio, startAlarm, stopAlarm, fireHalfAlert } = useAlarm(
    settings.sound,
    settings.vibrate,
  );
  useTheme(settings.theme);
  useWakeLock(running);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (phase !== "running") return;
    const tick = () => {
      const rest = endAtRef.current - Date.now();
      if (rest <= 0) {
        setRemainingMs(0);
        setPhase("finished");
        startAlarm();
        return;
      }
      if (
        settings.halfAlert &&
        !halfFiredRef.current &&
        rest <= durationMs / 2
      ) {
        halfFiredRef.current = true;
        fireHalfAlert();
      }
      setRemainingMs(rest);
    };
    const id = setInterval(tick, 100);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [phase, durationMs, settings.halfAlert, startAlarm, fireHalfAlert]);

  const start = useCallback(() => {
    ensureAudio();
    const rest = phase === "paused" ? remainingMs : durationMs;
    if (phase !== "paused") halfFiredRef.current = false;
    endAtRef.current = Date.now() + rest;
    setRemainingMs(rest);
    setPhase("running");
  }, [phase, remainingMs, durationMs, ensureAudio]);

  const pause = useCallback(() => {
    setRemainingMs(Math.max(0, endAtRef.current - Date.now()));
    setPhase("paused");
  }, []);

  const reset = useCallback(() => {
    stopAlarm();
    halfFiredRef.current = false;
    setRemainingMs(durationMs);
    setPhase("idle");
  }, [durationMs, stopAlarm]);

  const handleMainAction = useCallback(() => {
    if (phase === "running") pause();
    else if (phase === "finished") reset();
    else start();
  }, [phase, start, pause, reset]);

  const applyDigits = useCallback(
    (d: string) => {
      setDigits(d);
      const { min, sec } = digitsToParts(d);
      const total = Math.min(MAX_DURATION_SEC, min * 60 + sec);
      stopAlarm();
      halfFiredRef.current = false;
      setSettings((s) => ({ ...s, durationSec: total }));
      setRemainingMs(total * 1000);
      setPhase("idle");
    },
    [stopAlarm],
  );

  const pushDigit = useCallback(
    (d: string) => {
      const next = (digits + d).replace(/^0+/, "");
      if (next.length > 5 || Number(next.slice(0, -2) || 0) > MAX_MINUTES) {
        return;
      }
      if (next === digits) return;
      applyDigits(next);
    },
    [digits, applyDigits],
  );

  const popDigit = useCallback(() => {
    if (digits === "") return;
    applyDigits(digits.slice(0, -1));
  }, [digits, applyDigits]);

  const updateSegments = useCallback((n: number) => {
    setSettings((s) => ({
      ...s,
      segments: Math.min(MAX_SEGMENTS, Math.max(MIN_SEGMENTS, n)),
    }));
  }, []);

  const patchSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const openSettings = useCallback(() => {
    if (running) pause();
    setDigits(durationToDigits(settings.durationSec));
    setSettingsOpen(true);
  }, [running, pause, settings.durationSec]);

  const { segments } = settings;
  const msPerSegment = durationMs / segments;
  const litCount = finished
    ? 0
    : Math.min(segments, Math.ceil(remainingMs / msPerSegment - 1e-6));
  const time = formatTime(remainingMs);

  const mainLabel =
    phase === "running"
      ? "一時停止"
      : phase === "paused"
        ? "再開"
        : phase === "finished"
          ? "停止"
          : "スタート";

  return (
    <div className="flex h-dvh flex-col gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] landscape:flex-row landscape:items-stretch">
      <header className="flex items-center justify-between landscape:w-44 landscape:flex-col landscape:justify-center landscape:gap-4">
        <div>
          <div
            className={`font-mono text-5xl font-bold tabular-nums tracking-tight ${
              finished
                ? "animate-pulse text-rose-500"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {time.min}
            <span className="text-3xl text-gray-400 dark:text-gray-500">:</span>
            {time.sec}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            1目盛り = {formatDurationLabel(settings.durationSec / segments)}
            <span className="mx-1.5">·</span>
            残り {litCount}/{segments}
          </div>
        </div>
        <button
          type="button"
          onClick={openSettings}
          aria-label="設定"
          className="rounded-full bg-gray-200 p-3 text-gray-600 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:active:bg-gray-700"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
        </button>
      </header>

      <TimerBar
        view={settings.view}
        segments={segments}
        durationMs={durationMs}
        remainingMs={remainingMs}
        litCount={litCount}
        finished={finished}
        label={mainLabel}
        onClick={handleMainAction}
      />

      <footer className="flex gap-3 landscape:w-36 landscape:flex-col-reverse landscape:justify-center">
        <button
          type="button"
          onClick={reset}
          disabled={phase === "idle"}
          className="rounded-xl bg-gray-200 px-6 py-4 text-base font-medium text-gray-700 active:bg-gray-300 disabled:opacity-40 dark:bg-gray-800 dark:text-gray-300 dark:active:bg-gray-700"
        >
          リセット
        </button>
        <button
          type="button"
          onClick={handleMainAction}
          disabled={phase === "idle" && settings.durationSec === 0}
          className={`flex-1 rounded-xl px-6 py-4 text-lg font-bold text-white disabled:opacity-40 landscape:flex-none ${
            running
              ? "bg-amber-600 active:bg-amber-500"
              : finished
                ? "bg-rose-600 active:bg-rose-500"
                : "bg-emerald-600 active:bg-emerald-500"
          }`}
        >
          {mainLabel}
        </button>
      </footer>

      {settingsOpen && (
        <SettingsSheet
          settings={settings}
          digits={digits}
          onPushDigit={pushDigit}
          onPopDigit={popDigit}
          onUpdateSegments={updateSegments}
          onPatch={patchSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
