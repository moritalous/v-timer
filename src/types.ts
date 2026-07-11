export type Phase = "idle" | "running" | "paused" | "finished";
export type Theme = "system" | "light" | "dark";
export type ViewStyle = "bar" | "cheese";

export interface Settings {
  durationSec: number;
  segments: number;
  sound: boolean;
  vibrate: boolean;
  halfAlert: boolean;
  theme: Theme;
  view: ViewStyle;
}
