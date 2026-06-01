"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";

export type KeyedListMotionOptions = {
  durationMs?: number;
  easing?: string;
  enabled?: boolean;
  enterDurationMs?: number;
  enterOffsetPx?: number;
  itemKeys: readonly string[];
};

const defaultEasing = "cubic-bezier(0.2, 0, 0, 1)";
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(reducedMotionQuery).matches;

const canAnimate = (element: HTMLElement) => typeof element.animate === "function";

const clearMotionFlag = (element: HTMLElement, motionType: string) => {
  if (element.dataset.layoutMotion === motionType) {
    delete element.dataset.layoutMotion;
  }
};

export function useKeyedListMotion<TElement extends HTMLElement>({
  durationMs = 533,
  easing = defaultEasing,
  enabled = true,
  enterDurationMs = 356,
  enterOffsetPx = 8,
  itemKeys,
}: KeyedListMotionOptions) {
  const activeAnimationsRef = useRef(new Map<string, Animation>());
  const previousRectsRef = useRef(new Map<string, DOMRectReadOnly>());
  const nodesRef = useRef(new Map<string, TElement>());
  const motionKey = useMemo(() => itemKeys.join("\u001f"), [itemKeys]);

  const registerItem = useCallback((key: string, node: TElement | null) => {
    if (node) {
      nodesRef.current.set(key, node);
      return;
    }

    nodesRef.current.delete(key);
  }, []);

  useLayoutEffect(() => {
    const nextRects = new Map<string, DOMRectReadOnly>();
    const shouldAnimate = enabled && !prefersReducedMotion();
    const currentKeys = new Set(itemKeys);

    activeAnimationsRef.current.forEach((animation, key) => {
      if (!currentKeys.has(key)) {
        animation.cancel();
        activeAnimationsRef.current.delete(key);
      }
    });

    itemKeys.forEach((key) => {
      const element = nodesRef.current.get(key);
      if (!element) {
        return;
      }

      const currentRect = element.getBoundingClientRect();
      const previousRect = previousRectsRef.current.get(key);
      nextRects.set(key, currentRect);

      if (!shouldAnimate || !canAnimate(element)) {
        return;
      }

      activeAnimationsRef.current.get(key)?.cancel();

      if (previousRect) {
        const deltaX = previousRect.left - currentRect.left;
        const deltaY = previousRect.top - currentRect.top;

        if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
          return;
        }

        element.dataset.layoutMotion = "moved";
        const animation = element.animate(
          [
            { opacity: 0.96, transform: `translate(${deltaX}px, ${deltaY}px)` },
            { opacity: 1, transform: "translate(0, 0)" },
          ],
          { duration: durationMs, easing },
        );

        animation.onfinish = () => {
          activeAnimationsRef.current.delete(key);
          clearMotionFlag(element, "moved");
        };
        animation.oncancel = () => {
          clearMotionFlag(element, "moved");
        };
        activeAnimationsRef.current.set(key, animation);
        return;
      }

      if (previousRectsRef.current.size === 0 || enterDurationMs <= 0) {
        return;
      }

      element.dataset.layoutMotion = "entered";
      const animation = element.animate(
        [
          { opacity: 0, transform: `translateY(${enterOffsetPx}px)` },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: enterDurationMs, easing },
      );

      animation.onfinish = () => {
        activeAnimationsRef.current.delete(key);
        clearMotionFlag(element, "entered");
      };
      animation.oncancel = () => {
        clearMotionFlag(element, "entered");
      };
      activeAnimationsRef.current.set(key, animation);
    });

    previousRectsRef.current = nextRects;
  }, [durationMs, easing, enabled, enterDurationMs, enterOffsetPx, motionKey]);

  return { registerItem };
}
