"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import { RidingBike } from "./RidingBike";
import { EASE_EXPO, EASE_IN_OUT, markIntroDone } from "@/lib/motion";

/**
 * Интро один раз за сессию (≈2 с, пропускается кликом или клавишей).
 * Велосипед рисуется линией и «едет на месте» по бегущей дороге, под ним собирается
 * логотип URBO coffee. Потом велосипед разгоняется и уезжает вправо, а шторка поднимается —
 * и в первом экране велосипед въезжает уже слева: одна поездка через всю загрузку.
 */
const LETTERS = ["U", "R", "B", "O"];
// Разгон: медленный старт, быстрый уход — так ускоряется настоящий велосипед
const ACCEL = [0.45, 0, 0.8, 0.3] as const;

export function Intro() {
  const [show, setShow] = useState(true);
  const distance = useMotionValue(0);
  const travel = useMotionValue(0);
  const road = useTransform(distance, (d) => `${-d}px 0`);
  const done = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem("urbo-intro") === "1";
    } catch {}

    const finish = () => {
      if (done.current) return;
      done.current = true;
      try {
        sessionStorage.setItem("urbo-intro", "1");
      } catch {}
      setShow(false);
      markIntroDone();
    };

    if (seen || reduce) {
      const raf = requestAnimationFrame(finish);
      return () => cancelAnimationFrame(raf);
    }

    // Таймлайн ~4,5 с: рисуется велосипед (0,2–2,2) → встают буквы (0,9–2,4) → педали и разгон (2,3–4,1)
    // → велосипед уезжает (3,5–4,4) → шторки уходят вверх (с 4,0)
    const pedal = animate(distance, 2600, { duration: 2.2, delay: 2.3, ease: ACCEL });
    const leave = animate(travel, window.innerWidth * 0.75, { duration: 0.9, delay: 3.5, ease: ACCEL });
    const t = setTimeout(finish, 4000);
    const skip = () => finish();
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      clearTimeout(t);
      pedal.stop();
      leave.stop();
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [distance, travel]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="peach"
          aria-hidden
          data-intro
          className="fixed inset-0 z-[99] bg-peach"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE_IN_OUT }}
        />
      )}
      {show && (
        <motion.div
          key="curtain"
          data-intro
          role="status"
          aria-label="Загрузка URBO coffee"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-urbo text-cream"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.85, ease: EASE_IN_OUT }}
        >
          <div className="flex flex-col items-center">
            <motion.div style={{ x: travel }} className="text-cream">
              <RidingBike distance={distance} width={176} draw drawDelay={0.2} drawScale={1.5} strokeWidth={10} flip={false} />
            </motion.div>
            {/* Дорога бежит под колёсами, пока велосипед крутит педали на месте */}
            <motion.div
              className="mt-1 h-[2px] w-[min(340px,70vw)]"
              style={{
                backgroundImage: "repeating-linear-gradient(90deg, rgb(242 214 196 / 0.55) 0 10px, transparent 10px 20px)",
                backgroundPosition: road,
              }}
              initial={{ opacity: 0, scaleX: 0.4 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: EASE_EXPO }}
            />
            <div className="mt-5 flex font-display text-[clamp(3.5rem,9vw,5.5rem)] leading-[0.9] font-extrabold tracking-[0.01em]" aria-hidden>
              {LETTERS.map((ch, i) => (
                <span key={ch} className="line-mask">
                  <motion.span
                    className="block"
                    initial={{ y: "105%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "-105%", transition: { duration: 0.5, delay: i * 0.04, ease: EASE_IN_OUT } }}
                    transition={{ duration: 1.1, delay: 0.9 + i * 0.12, ease: EASE_EXPO }}
                  >
                    {ch}
                  </motion.span>
                </span>
              ))}
            </div>
            <motion.span
              className="mt-1 text-[clamp(1.4rem,3.2vw,2rem)] leading-none font-medium text-cream/90"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
              transition={{ duration: 0.9, delay: 1.6, ease: EASE_EXPO }}
            >
              coffee
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
