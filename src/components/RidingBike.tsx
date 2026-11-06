"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { Bike, BIKE_VB_WIDTH, WHEEL_R } from "./Bike";
import { rollAngle, useReducedMotion } from "@/lib/motion";

/** Передаточное число: шатун крутится медленнее колеса, как на городском велосипеде */
const GEAR = 2.2;
/** Точка касания заднего колеса — ось для наклона и «вилли» */
const CONTACT = { x: 0.2, y: 0.97 };

type Props = {
  /** Пройденный путь в пикселях: из него считаются колёса, шатун и наклон */
  distance: MotionValue<number>;
  /** Ширина велосипеда в пикселях */
  width: number;
  className?: string;
  /** Поднимать переднее колесо при наведении и нажатии */
  interactive?: boolean;
  /** Разворачиваться, когда едет назад */
  flip?: boolean;
  /** Линии ветра за велосипедом на скорости */
  speedLines?: boolean;
  draw?: boolean;
  drawDelay?: number;
  drawScale?: number;
  strokeWidth?: number;
};

export function RidingBike({
  distance,
  width,
  className,
  interactive = false,
  flip = true,
  speedLines = true,
  draw = false,
  drawDelay = 0,
  drawScale = 1,
  strokeWidth = 9,
}: Props) {
  const reduce = useReducedMotion();
  const radius = (WHEEL_R * width) / BIKE_VB_WIDTH;
  const velocity = useVelocity(distance);

  // Направление: разворачиваемся только при уверенном движении назад, без дрожи на мелких сдвигах
  const dir = useMotionValue(1);
  useMotionValueEvent(velocity, "change", (v) => {
    if (!flip) return;
    if (v < -160 && dir.get() !== -1) dir.set(-1);
    else if (v > 160 && dir.get() !== 1) dir.set(1);
  });
  const flipX = useSpring(dir, { stiffness: 260, damping: 30 });

  // В зеркальном кадре колесо должно крутиться в обратную сторону, иначе оно «буксует»
  const wheel = useTransform(() => rollAngle(distance.get(), radius) * dir.get());
  const crank = useTransform(wheel, (w) => w / GEAR);
  const pedal = useTransform(crank, (c) => -c);

  // Наклон от ускорения: на разгоне нос приподнимается, при торможении клюёт вниз
  const smoothV = useSpring(velocity, { stiffness: 40, damping: 18 });
  const lean = useSpring(
    useTransform(() => {
      const accel = (velocity.get() - smoothV.get()) * dir.get();
      return Math.max(-5, Math.min(5, -accel / 260));
    }),
    { stiffness: 160, damping: 16 },
  );

  // Скорость 0..1 для тряски и ветра
  const speed = useTransform(velocity, (v) => Math.min(1, Math.abs(v) / 1800));
  const bob = useTransform(() => Math.sin(distance.get() / 11) * speed.get() * 1.4);
  const windOpacity = useTransform(speed, [0.15, 0.8], [0, 0.6]);
  const windScale = useTransform(speed, [0, 1], [0.3, 1]);

  return (
    <motion.div className={className} style={{ width }}>
      <motion.div style={{ scaleX: flip ? flipX : 1 }}>
        <motion.div
          style={{ y: reduce ? 0 : bob, rotate: reduce ? 0 : lean, originX: CONTACT.x, originY: CONTACT.y }}
        >
          <motion.div
            className={`relative ${interactive ? "pointer-events-auto touch-manipulation" : ""}`}
            style={{ originX: CONTACT.x, originY: CONTACT.y }}
            whileHover={interactive && !reduce ? { rotate: -13 } : undefined}
            whileTap={interactive && !reduce ? { rotate: -16 } : undefined}
            transition={{ type: "spring", stiffness: 300, damping: 13, mass: 0.9 }}
          >
            {speedLines && !reduce && (
              <motion.svg
                aria-hidden
                viewBox="0 0 60 40"
                className="absolute top-[38%] -left-[34%] w-[36%] origin-right"
                style={{ opacity: windOpacity, scaleX: windScale }}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth={3}
              >
                <path d="M58 8 H18" />
                <path d="M52 20 H4" />
                <path d="M58 32 H26" />
              </motion.svg>
            )}
            <Bike
              rotate={wheel}
              crank={crank}
              pedal={pedal}
              spokes
              draw={draw}
              drawDelay={drawDelay}
              drawScale={drawScale}
              strokeWidth={strokeWidth}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
