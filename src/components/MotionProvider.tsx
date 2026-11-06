"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** При «уменьшить движение» в системе сдвиги и масштаб применяются мгновенно, остаётся только прозрачность */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
