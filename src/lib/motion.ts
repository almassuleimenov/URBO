"use client";

import { useSyncExternalStore } from "react";
import type Lenis from "lenis";

/** Общие кривые: быстрый старт, долгое мягкое торможение — «накат» велосипеда */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const;

/* ---------- Готовность страницы после интро ---------- */
let introDone = false;
const listeners = new Set<() => void>();

export function markIntroDone() {
  if (introDone) return;
  introDone = true;
  listeners.forEach((l) => l());
}

export function useIntroDone() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => introDone,
    () => false,
  );
}

/* ---------- Ссылка на Lenis ---------- */
let lenisInstance: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenisInstance = l;
};
export const getLenis = () => lenisInstance;

/* ---------- media query ---------- */
export function useMediaQuery(query: string, serverValue = true) {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** Угол поворота колеса, которое прокатилось на distance пикселей */
export const rollAngle = (distance: number, radiusPx: number) =>
  (distance / (2 * Math.PI * radiusPx)) * 360;

/** Безопасная для гидратации версия: на сервере и при гидратации — false */
export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)", false);

/** Телефон или планшет: отключаем декоративные эффекты, завязанные на прокрутку (параллакс и т.п.) */
export const LITE_QUERY = "(max-width: 767px), (pointer: coarse)";
export const useLite = () => useMediaQuery(LITE_QUERY, false);
