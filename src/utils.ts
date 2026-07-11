import {
  DEFAULT_SETTINGS,
  MAX_DURATION_SEC,
  MAX_SEGMENTS,
  MIN_SEGMENTS,
  SEGMENT_COLORS,
  SEGMENT_INKS,
  STORAGE_KEY,
  THEME_OPTIONS,
  VIEW_OPTIONS,
} from "./constants";
import type { Settings, Theme, ViewStyle } from "./types";

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      durationSec: Math.min(
        MAX_DURATION_SEC,
        Math.max(0, parsed.durationSec ?? DEFAULT_SETTINGS.durationSec),
      ),
      segments: Math.min(
        MAX_SEGMENTS,
        Math.max(MIN_SEGMENTS, parsed.segments ?? DEFAULT_SETTINGS.segments),
      ),
      theme: THEME_OPTIONS.some(([t]) => t === parsed.theme)
        ? (parsed.theme as Theme)
        : DEFAULT_SETTINGS.theme,
      view: VIEW_OPTIONS.some(([v]) => v === parsed.view)
        ? (parsed.view as ViewStyle)
        : DEFAULT_SETTINGS.view,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function segmentBlock(index: number, total: number): number {
  return Math.min(3, Math.floor((index / total) * 4));
}

export function segmentColor(index: number, total: number): string {
  return SEGMENT_COLORS[segmentBlock(index, total)];
}

export function segmentInk(index: number, total: number): string {
  return SEGMENT_INKS[segmentBlock(index, total)];
}

export function formatTime(ms: number): { min: string; sec: string } {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  return {
    min: String(Math.floor(totalSec / 60)),
    sec: String(totalSec % 60).padStart(2, "0"),
  };
}

export function formatDurationLabel(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  if (m === 0) return `${s}秒`;
  if (s === 0) return `${m}分`;
  return `${m}分${s}秒`;
}

export function durationToDigits(sec: number): string {
  if (sec <= 0) return "";
  return String(Math.floor(sec / 60) * 100 + (sec % 60));
}

export function digitsToParts(digits: string): { min: number; sec: number } {
  return {
    min: Number(digits.slice(0, -2) || 0),
    sec: Number(digits.slice(-2) || 0),
  };
}
