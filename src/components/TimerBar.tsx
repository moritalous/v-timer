import {
  BITE_STEPS,
  CHEESE,
  CHEESE_ADVANCE_EM,
  EMOJI_FONT,
  FINISHED_COLOR,
  GLYPH_ADVANCE,
  MAX_CHEESE_PER_ROW,
  MIN_CHEESE_PER_ROW,
  MOUSE,
  UNLIT_COLOR,
} from "../constants";
import { useElementSize } from "../hooks/useElementSize";
import type { ViewStyle } from "../types";
import { segmentColor, segmentInk } from "../utils";

interface TimerBarProps {
  view: ViewStyle;
  segments: number;
  durationMs: number;
  remainingMs: number;
  litCount: number;
  running: boolean;
  finished: boolean;
  label: string;
  onClick: () => void;
}

export function TimerBar({
  view,
  segments,
  durationMs,
  remainingMs,
  litCount,
  running,
  finished,
  label,
  onClick,
}: TimerBarProps) {
  const [barRef, barSize] = useElementSize<HTMLButtonElement>();

  const cheeseView = view === "cheese";
  const rowFontLimit = barSize.h > 0 ? (barSize.h * 0.85) / segments : 16;
  const cheesePerRow =
    barSize.w > 0
      ? Math.max(
          MIN_CHEESE_PER_ROW,
          Math.min(
            MAX_CHEESE_PER_ROW,
            Math.floor(barSize.w / (rowFontLimit * GLYPH_ADVANCE) - 1.5),
          ),
        )
      : 10;
  const cheeseFontPx = Math.min(
    rowFontLimit,
    barSize.w > 0
      ? barSize.w / ((cheesePerRow + 1.5) * GLYPH_ADVANCE)
      : rowFontLimit,
  );
  const unitMs = durationMs / (segments * cheesePerRow);
  const remainingUnits = finished
    ? 0
    : Math.min(segments * cheesePerRow, Math.ceil(remainingMs / unitMs - 1e-6));
  const activeRow = Math.ceil(remainingUnits / cheesePerRow) - 1;
  // アクティブユニットの経過割合をBITE_STEPS段階に量子化した「かじられ具合」
  const activeUnitRestMs = remainingMs - (remainingUnits - 1) * unitMs;
  const biteFraction = Math.max(0, Math.min(1, 1 - activeUnitRestMs / unitMs));
  const eatenQ =
    Math.min(BITE_STEPS - 1, Math.floor(biteFraction * BITE_STEPS)) /
    BITE_STEPS;

  return (
    <button
      ref={barRef}
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex min-h-0 flex-1 flex-col rounded-2xl bg-black/5 p-2 dark:bg-gray-900/60 ${
        finished ? "animate-pulse" : ""
      }`}
      style={cheeseView ? undefined : { gap: segments > 40 ? 2 : 4 }}
    >
      {cheeseView ? (
        finished ? (
          <div
            className="flex min-h-0 flex-1 items-center justify-center"
            style={{
              fontFamily: EMOJI_FONT,
              fontSize: Math.min(barSize.w, barSize.h) * 0.25 || 64,
              lineHeight: 1,
            }}
          >
            <span className="text-rose-500">{MOUSE}</span>
          </div>
        ) : (
          <div className="mx-auto flex min-h-0 w-fit flex-1 flex-col">
            <div
              aria-hidden="true"
              className="invisible h-0 overflow-hidden whitespace-nowrap"
              style={{
                fontFamily: EMOJI_FONT,
                lineHeight: 1,
                fontSize: cheeseFontPx,
              }}
            >
              <span className="px-[0.12em]">
                {CHEESE.repeat(cheesePerRow + 1)}
              </span>
            </div>
            {Array.from({ length: segments }, (_, i) => {
              const row = segments - 1 - i;
              const count = Math.max(
                0,
                Math.min(cheesePerRow, remainingUnits - row * cheesePerRow),
              );
              const isActive = row === activeRow;
              const shown = isActive ? count - 1 : count;
              return (
                <div
                  key={row}
                  className="flex min-h-0 flex-1 items-center overflow-hidden whitespace-nowrap"
                  style={{
                    fontFamily: EMOJI_FONT,
                    lineHeight: 1,
                    fontSize: cheeseFontPx,
                  }}
                >
                  {(shown > 0 || isActive) && (
                    <span
                      className="rounded-sm px-[0.12em] py-[0.04em]"
                      style={{
                        backgroundColor: segmentColor(row, segments),
                        color: segmentInk(row, segments),
                      }}
                    >
                      {CHEESE.repeat(Math.max(0, shown))}
                      {isActive && (
                        <span
                          className="inline-block overflow-hidden whitespace-nowrap align-bottom"
                          style={{
                            width: `${((1 - eatenQ) * CHEESE_ADVANCE_EM).toFixed(3)}em`,
                          }}
                        >
                          {CHEESE}
                        </span>
                      )}
                    </span>
                  )}
                  {isActive && (
                    <span
                      className={`inline-block origin-bottom text-gray-700 dark:text-gray-300 ${
                        running ? "animate-munch" : ""
                      }`}
                    >
                      {MOUSE}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        Array.from({ length: segments }, (_, i) => {
          const index = segments - 1 - i;
          const lit = index < litCount;
          return (
            <span
              key={index}
              className="min-h-0 min-w-0 flex-1 rounded-sm transition-colors duration-300"
              style={{
                backgroundColor: finished
                  ? FINISHED_COLOR
                  : lit
                    ? segmentColor(index, segments)
                    : UNLIT_COLOR,
              }}
            />
          );
        })
      )}
    </button>
  );
}
