import type { Settings, Theme, ViewStyle } from "./types";

export const SEGMENT_COLORS = ["#f43f5e", "#a855f7", "#6366f1", "#38bdf8"];
export const UNLIT_COLOR = "var(--unlit)";
export const FINISHED_COLOR = "#f43f5e";
export const SEGMENT_INKS = ["#ffffff", "#ffffff", "#ffffff", "#ffffff"];

export const SEGMENT_PRESETS = [10, 20, 30, 40];
export const MIN_SEGMENTS = 1;
export const MAX_SEGMENTS = 100;
export const MAX_MINUTES = 199;
export const MAX_DURATION_SEC = MAX_MINUTES * 60 + 59;

export const THEME_OPTIONS: [Theme, string][] = [
  ["system", "端末設定"],
  ["light", "ライト"],
  ["dark", "ダーク"],
];

export const VIEW_OPTIONS: [ViewStyle, string][] = [
  ["bar", "バー"],
  ["cheese", "チーズ"],
];

export const MIN_CHEESE_PER_ROW = 4;
export const MAX_CHEESE_PER_ROW = 20;
export const CHEESE = "🧀";
export const MOUSE = "🐁";
export const EMOJI_FONT = "'Noto Emoji', sans-serif";
export const GLYPH_ADVANCE = 1.3;
// Noto Emojiの🧀1個ぶんの実測送り幅（em）。かじりかけの幅クリップに使う
export const CHEESE_ADVANCE_EM = 1.27;
export const BITE_STEPS = 4;

export const DEFAULT_SETTINGS: Settings = {
  durationSec: 10 * 60,
  segments: 20,
  sound: true,
  vibrate: true,
  halfAlert: false,
  theme: "system",
  view: "cheese",
};

export const STORAGE_KEY = "v-timer-settings";
