"use client";

import { motion, type MotionValue } from "motion/react";
import { EASE_OUT } from "@/lib/motion";

/**
 * Велосипед из логотипа URBO, перерисованный линиями.
 * Координаты взяты с логотипа (масштаб ≈ 0.94), колёса — отдельные группы,
 * чтобы их можно было вращать синхронно с движением.
 */

export const BIKE_VIEWBOX = "12 14 418 236";
export const BIKE_VB_WIDTH = 418;
export const BIKE_VB_HEIGHT = 236;
export const WHEEL_R = 74;

const REAR = { x: 95, y: 166 };
const FRONT = { x: 345, y: 168 };

const FOOT = "M219 210 H256"; // «подножка» логотипа = шатун в покое
const FRAME = [
  "M95 166 L146 121", // задняя перья
  "M127 85 H265", // верхняя перекладина-седло
  "M174 87 L219 207", // подседельная труба
  FOOT,
  "M214 170 L300 85", // нижняя труба
  "M282 28 L322 140 Q331 162 345 168", // вилка
  "M282 28 Q296 44 311 40 Q323 36 325 27", // руль
];
const BB = { x: 219, y: 210 }; // каретка: ось шатуна

type Props = {
  className?: string;
  rotate?: MotionValue<number>;
  /** Угол шатуна: если задан, «подножка» становится вращающимся шатуном с педалью */
  crank?: MotionValue<number>;
  /** Обратный угол для педали, чтобы она оставалась горизонтальной */
  pedal?: MotionValue<number>;
  /** Нарисовать велосипед линией при появлении */
  draw?: boolean;
  drawDelay?: number;
  /** Во сколько раз медленнее рисовать (1 = обычная скорость) */
  drawScale?: number;
  spokes?: boolean;
  strokeWidth?: number;
  title?: string;
};

function Wheel({
  cx,
  cy,
  rotate,
  spokes,
  draw,
  delay,
  sw,
  scale = 1,
}: {
  cx: number;
  cy: number;
  rotate?: MotionValue<number>;
  spokes?: boolean;
  draw?: boolean;
  delay: number;
  sw: number;
  scale?: number;
}) {
  return (
    <motion.g style={{ rotate, transformBox: "fill-box", transformOrigin: "center" }}>
      <motion.circle
        cx={cx}
        cy={cy}
        r={WHEEL_R}
        fill="none"
        stroke="currentColor"
        strokeWidth={sw}
        initial={draw ? { pathLength: 0 } : false}
        animate={draw ? { pathLength: 1 } : undefined}
        transition={{ duration: 1.1 * scale, delay, ease: EASE_OUT }}
      />
      {spokes &&
        [0, 60, 120].map((deg) => {
          const a = (deg * Math.PI) / 180;
          const r = WHEEL_R - 6;
          return (
            <line
              key={deg}
              x1={cx - Math.cos(a) * r}
              y1={cy - Math.sin(a) * r}
              x2={cx + Math.cos(a) * r}
              y2={cy + Math.sin(a) * r}
              stroke="currentColor"
              strokeWidth={1.6}
              opacity={0.28}
            />
          );
        })}
      {/* ниппель — маленькая метка на ободе, чтобы вращение читалось */}
      <circle cx={cx} cy={cy - WHEEL_R} r={sw * 0.55} fill="currentColor" />
      <circle cx={cx} cy={cy} r={sw * 0.7} fill="currentColor" />
    </motion.g>
  );
}

export function Bike({
  className,
  rotate,
  crank,
  pedal,
  draw = false,
  drawDelay = 0,
  drawScale: k = 1,
  spokes = false,
  strokeWidth = 10,
  title,
}: Props) {
  return (
    <svg
      viewBox={BIKE_VIEWBOX}
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <Wheel cx={REAR.x} cy={REAR.y} rotate={rotate} spokes={spokes} draw={draw} delay={drawDelay} sw={strokeWidth} scale={k} />
      <Wheel
        cx={FRONT.x}
        cy={FRONT.y}
        rotate={rotate}
        spokes={spokes}
        draw={draw}
        delay={drawDelay + 0.12 * k}
        sw={strokeWidth}
        scale={k}
      />
      {crank && (
        <motion.g
          style={{ rotate: crank, transformBox: "view-box", transformOrigin: `${BB.x}px ${BB.y}px` }}
        >
          <motion.path
            d={FOOT}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            initial={draw ? { pathLength: 0, opacity: 0 } : false}
            animate={draw ? { pathLength: 1, opacity: 1 } : undefined}
            transition={{ duration: 0.7 * k, delay: drawDelay + (0.35 + 3 * 0.07) * k, ease: EASE_OUT }}
          />
          <motion.path
            d="M247 210 H265"
            stroke="currentColor"
            strokeWidth={strokeWidth * 0.8}
            style={{ rotate: pedal, transformBox: "fill-box", transformOrigin: "center" }}
            initial={draw ? { opacity: 0 } : false}
            animate={draw ? { opacity: 1 } : undefined}
            transition={{ duration: 0.4 * k, delay: drawDelay + 0.9 * k, ease: EASE_OUT }}
          />
        </motion.g>
      )}
      {crank && <circle cx={BB.x} cy={BB.y} r={strokeWidth * 0.75} fill="currentColor" />}
      {FRAME.filter((d) => !(crank && d === FOOT)).map((d, i) => (
        <motion.path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          initial={draw ? { pathLength: 0, opacity: 0 } : false}
          animate={draw ? { pathLength: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.7 * k, delay: drawDelay + (0.35 + i * 0.07) * k, ease: EASE_OUT }}
        />
      ))}
    </svg>
  );
}

/** Статичная версия для DOM-пинов карты */
export const BIKE_SVG_STRING = `<svg viewBox="${BIKE_VIEWBOX}" fill="none" stroke="currentColor" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="${REAR.x}" cy="${REAR.y}" r="${WHEEL_R}"/><circle cx="${FRONT.x}" cy="${FRONT.y}" r="${WHEEL_R}"/>${FRAME.map((d) => `<path d="${d}"/>`).join("")}</svg>`;
