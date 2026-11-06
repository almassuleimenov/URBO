"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { setLenis } from "@/lib/motion";

/** Плавная прокрутка колесом мыши. Тач-скролл остаётся нативным. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // На тач-устройствах прокрутка и так плавная — лишний цикл requestAnimationFrame не нужен
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.11,
      smoothWheel: true,
      syncTouch: false,
      anchors: { offset: 0, duration: 1.4 },
    });
    setLenis(lenis);
    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, []);
  return null;
}
