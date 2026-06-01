import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useKeyedListMotion, type KeyedListMotionOptions } from "./use-keyed-list-motion";

type MotionRecord = {
  cancel: ReturnType<typeof vi.fn>;
  element: HTMLElement;
  keyframes: Keyframe[];
  options?: KeyframeAnimationOptions;
};

const rect = (top: number, left = 0): DOMRectReadOnly => ({
  bottom: top + 20,
  height: 20,
  left,
  right: left + 100,
  toJSON: () => ({}),
  top,
  width: 100,
  x: left,
  y: top,
});

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
};

const mockAnimate = () => {
  const records: MotionRecord[] = [];

  Object.defineProperty(HTMLElement.prototype, "animate", {
    configurable: true,
    value: vi.fn(function (
      this: HTMLElement,
      keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
      options?: number | KeyframeAnimationOptions,
    ) {
      const record: MotionRecord = {
        cancel: vi.fn(() => {
          animation.oncancel?.(undefined as never);
        }),
        element: this,
        keyframes: Array.isArray(keyframes) ? keyframes : [],
        options: typeof options === "number" ? { duration: options } : options,
      };
      const animation = {
        cancel: record.cancel,
        oncancel: undefined as Animation["oncancel"],
        onfinish: undefined as Animation["onfinish"],
      } as Animation;

      records.push(record);
      return animation;
    }),
  });

  return records;
};

function MotionList({
  items,
  options,
  positions,
}: {
  items: string[];
  options?: Partial<KeyedListMotionOptions>;
  positions: Record<string, number>;
}) {
  const motion = useKeyedListMotion<HTMLDivElement>({
    itemKeys: items,
    ...options,
  });

  return (
    <div>
      {items.map((item) => (
        <div
          data-testid={item}
          key={item}
          ref={(node) => {
            if (node) {
              node.getBoundingClientRect = () => rect(positions[item]);
            }
            motion.registerItem(item, node);
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

describe("useKeyedListMotion", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(HTMLElement.prototype, "animate", {
      configurable: true,
      value: undefined,
    });
  });

  it("animates existing keyed items from their previous rects", () => {
    mockMatchMedia(false);
    const records = mockAnimate();
    const { rerender } = render(
      <MotionList items={["A", "B"]} positions={{ A: 0, B: 50 }} />,
    );

    rerender(<MotionList items={["B", "A"]} positions={{ A: 50, B: 0 }} />);

    expect(records.map((record) => record.element.dataset.testid)).toEqual(["B", "A"]);
    expect(records[0].keyframes[0]).toMatchObject({
      opacity: 0.96,
      transform: "translate(0px, 50px)",
    });
    expect(records[0].options).toMatchObject({ duration: 533 });
  });

  it("crossfades a newly visible item after the first layout pass", () => {
    mockMatchMedia(false);
    const records = mockAnimate();
    const { rerender } = render(<MotionList items={["A"]} positions={{ A: 0 }} />);

    rerender(<MotionList items={["A", "B"]} positions={{ A: 0, B: 50 }} />);

    expect(records).toHaveLength(1);
    expect(records[0].element.dataset.testid).toBe("B");
    expect(records[0].keyframes[0]).toMatchObject({
      opacity: 0,
      transform: "translateY(8px)",
    });
  });

  it("cancels interrupted animations before starting a new one for the same key", () => {
    mockMatchMedia(false);
    const records = mockAnimate();
    const { rerender } = render(
      <MotionList items={["A", "B"]} positions={{ A: 0, B: 50 }} />,
    );

    rerender(<MotionList items={["B", "A"]} positions={{ A: 50, B: 0 }} />);
    rerender(<MotionList items={["A", "B"]} positions={{ A: 0, B: 50 }} />);

    expect(records[0].cancel).toHaveBeenCalled();
    expect(records[1].cancel).toHaveBeenCalled();
    expect(records).toHaveLength(4);
  });

  it("does nothing when the browser animation API is unavailable", () => {
    mockMatchMedia(false);
    const { rerender } = render(
      <MotionList items={["A", "B"]} positions={{ A: 0, B: 50 }} />,
    );

    expect(() =>
      rerender(<MotionList items={["B", "A"]} positions={{ A: 50, B: 0 }} />),
    ).not.toThrow();
  });

  it("respects reduced-motion preferences", () => {
    mockMatchMedia(true);
    const records = mockAnimate();
    const { rerender } = render(
      <MotionList items={["A", "B"]} positions={{ A: 0, B: 50 }} />,
    );

    rerender(<MotionList items={["B", "A"]} positions={{ A: 50, B: 0 }} />);

    expect(records).toHaveLength(0);
  });
});
