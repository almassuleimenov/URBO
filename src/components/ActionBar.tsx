"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { EASE_OUT, getLenis, useReducedMotion } from "@/lib/motion";

// Блоки, где панель только мешает: на карте и в форме она закрывает нужное
const HIDE_ON = ["#map", "#franchise", "footer"];

export function ActionBar() {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const [pastHero, setPastHero] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setPastHero(y > window.innerHeight * 0.85));

  useEffect(() => {
    const seen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.add(e.target);
          else seen.delete(e.target);
        }
        setBlocked(seen.size > 0);
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    HIDE_ON.forEach((s) => document.querySelectorAll(s).forEach((el) => io.observe(el)));
    return () => io.disconnect();
  }, []);

  const go = (href: string) => {
    const el = document.querySelector<HTMLElement>(href);
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { duration: 1.2 });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  const show = pastHero && !blocked;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="action-bar fixed inset-x-0 bottom-0 z-40 px-3 pt-3 md:hidden"
          initial={{ y: "110%" }}
          animate={{ y: "0%" }}
          exit={{ y: "110%" }}
          transition={{ duration: reduce ? 0 : 0.35, ease: EASE_OUT }}
        >
          <div className="flex gap-2 rounded-full bg-urbo p-1.5 shadow-[0_10px_30px_-10px_rgb(42_13_18/0.55)]">
            <button type="button" onClick={() => go("#map")} className="btn btn-peach h-12 flex-1">
              Найти кофейню
            </button>
            <button type="button" onClick={() => go("#menu")} className="btn btn-ghost-light h-12 flex-1 border-transparent">
              Меню
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
