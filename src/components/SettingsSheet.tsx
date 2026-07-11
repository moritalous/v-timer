import { SEGMENT_PRESETS, THEME_OPTIONS, VIEW_OPTIONS } from "../constants";
import type { Settings } from "../types";
import { digitsToParts } from "../utils";

const PAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0"];

const TOGGLES = [
  ["sound", "アラーム音"],
  ["vibrate", "バイブレーション(対応端末のみ)"],
  ["halfAlert", "半分経過でお知らせ"],
] as const;

interface SettingsSheetProps {
  settings: Settings;
  digits: string;
  onPushDigit: (d: string) => void;
  onPopDigit: () => void;
  onUpdateSegments: (n: number) => void;
  onPatch: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

function segmentedButtonClass(selected: boolean): string {
  return `flex-1 rounded-lg px-3 py-2.5 text-sm font-medium ${
    selected
      ? "bg-blue-600 text-white"
      : "bg-gray-100 text-gray-700 active:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:active:bg-gray-700"
  }`;
}

export function SettingsSheet({
  settings,
  digits,
  onPushDigit,
  onPopDigit,
  onUpdateSegments,
  onPatch,
  onClose,
}: SettingsSheetProps) {
  const padParts = digitsToParts(digits);

  return (
    <div
      className="fixed inset-0 z-10 flex items-end justify-center bg-black/60 landscape:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-2xl bg-white landscape:rounded-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-h-0 overflow-y-auto p-5 pb-2">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
            設定
          </h2>

          <div className="mb-5">
            <span className="mb-1.5 block text-sm text-gray-500 dark:text-gray-400">
              タイマー時間
            </span>
            <div
              className={`mb-3 text-center font-mono text-4xl font-bold tabular-nums ${
                digits === ""
                  ? "text-gray-300 dark:text-gray-600"
                  : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {padParts.min}
              <span className="mx-1 text-lg font-normal text-gray-400 dark:text-gray-500">
                分
              </span>
              {String(padParts.sec).padStart(2, "0")}
              <span className="ml-1 text-lg font-normal text-gray-400 dark:text-gray-500">
                秒
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PAD_KEYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onPushDigit(d)}
                  className="rounded-full bg-gray-100 py-3 text-2xl font-medium text-gray-800 active:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:active:bg-gray-700"
                >
                  {d}
                </button>
              ))}
              <button
                type="button"
                onClick={onPopDigit}
                aria-label="1桁消す"
                className="rounded-full bg-gray-100 py-3 text-2xl text-gray-800 active:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:active:bg-gray-700"
              >
                ⌫
              </button>
            </div>
          </div>

          <div className="mb-5">
            <span className="mb-1.5 block text-sm text-gray-500 dark:text-gray-400">
              目盛りの数(プレゼンのページ数などに)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdateSegments(settings.segments - 1)}
                className="rounded-lg bg-gray-100 px-4 py-3 text-xl text-gray-700 active:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:active:bg-gray-700"
                aria-label="目盛りを減らす"
              >
                −
              </button>
              <div className="w-full rounded-lg bg-gray-100 px-4 py-3 text-center text-xl text-gray-900 tabular-nums dark:bg-gray-800 dark:text-gray-100">
                {settings.segments}
              </div>
              <button
                type="button"
                onClick={() => onUpdateSegments(settings.segments + 1)}
                className="rounded-lg bg-gray-100 px-4 py-3 text-xl text-gray-700 active:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:active:bg-gray-700"
                aria-label="目盛りを増やす"
              >
                ＋
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              {SEGMENT_PRESETS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onUpdateSegments(n)}
                  className={segmentedButtonClass(settings.segments === n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <span className="mb-1.5 block text-sm text-gray-500 dark:text-gray-400">
              表示スタイル
            </span>
            <div className="flex gap-2">
              {VIEW_OPTIONS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onPatch({ view: value })}
                  className={segmentedButtonClass(settings.view === value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <span className="mb-1.5 block text-sm text-gray-500 dark:text-gray-400">
              テーマ
            </span>
            <div className="flex gap-2">
              {THEME_OPTIONS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onPatch({ theme: value })}
                  className={segmentedButtonClass(settings.theme === value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {TOGGLES.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => onPatch({ [key]: !settings[key] })}
              className="mb-3 flex w-full items-center justify-between rounded-lg bg-gray-100 px-4 py-3 dark:bg-gray-800"
            >
              <span className="text-sm text-gray-700 dark:text-gray-200">
                {label}
              </span>
              <span
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  settings[key]
                    ? "bg-emerald-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                    settings[key] ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          ))}
        </div>

        <div className="border-t border-gray-100 p-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-gray-900 px-6 py-3.5 font-bold text-white active:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:active:bg-white"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
