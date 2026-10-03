"use client";

import { useTransform, type MotionValue } from "motion/react";

/**
 * Scroll-linked mapping that is safe for motion's native scroll-timeline
 * acceleration: keyframes are clamped to [0,1], kept monotonic, and padded
 * to cover the whole track — otherwise the browser drops the value (no fill)
 * before the first / after the last keyframe.
 */
export function useProgress(p: MotionValue<number>, input: number[], output: number[]): MotionValue<number>;
export function useProgress(p: MotionValue<number>, input: number[], output: string[]): MotionValue<string>;
export function useProgress(p: MotionValue<number>, input: number[], output: number[] | string[]): MotionValue<number> | MotionValue<string> {
  const i: number[] = [];
  let prev = 0;
  for (const v of input) i.push((prev = Math.max(prev, Math.min(1, Math.max(0, v)))));
  const o: (number | string)[] = [...output];
  if (i[0] > 0) {
    i.unshift(0);
    o.unshift(o[0]);
  }
  if (i[i.length - 1] < 1) {
    i.push(1);
    o.push(o[o.length - 1]);
  }
  return useTransform(p, i, o as number[]);
}
