"use client";

import { useReducedMotion } from "@/lib/motion";

import { Fragment, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { Bike } from "./Bike";

const WORDS = ["Кофе", "Завтраки", "Боулы", "50+ кофеен", "Өзіміздің URBO"];

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/**
 * Лента КОФЕ · ЗАВТРАКИ · БОУЛЫ. Скорость зависит от скорости прокрутки,
 * направление — от направления прокрутки; при наведении лента сбавляет ход.
 */
export function Marquee() {
  const reduce = useReducedMotion();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [-1500, 0, 1500], [-5, 0, 5], { clamp: false });
  const dir = useRef(1);
  const hoverMul = useSpring(1, { stiffness: 120, damping: 20 });
  const x = useTransform(base, (v) => `${wrap(-50, -25, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    let move = dir.current * -1.6 * (delta / 1000);
    move += move * Math.abs(f);
    base.set(base.get() + move * hoverMul.get());
  });

  const row = (
    <span className="flex shrink-0 items-center">
      {WORDS.map((w) => (
        <Fragment key={w}>
          <span className="px-[0.45em]">{w}</span>
          <Bike className="mx-[0.25em] h-[0.62em] w-auto shrink-0 opacity-70" strokeWidth={14} />
        </Fragment>
      ))}
    </span>
  );

  return (
    <section aria-label="Кофе, завтраки, боулы" className="overflow-hidden bg-peach py-[clamp(18px,3vw,34px)] text-urbo">
      <p className="sr-only">Кофе, завтраки и боулы. 50+ кофеен URBO.</p>
      <motion.div
        aria-hidden
        className="flex w-max font-display text-[clamp(2.25rem,6vw,5.5rem)] leading-none font-extrabold whitespace-nowrap uppercase"
        style={{ x: reduce ? "-25%" : x }}
        onHoverStart={() => hoverMul.set(0.15)}
        onHoverEnd={() => hoverMul.set(1)}
      >
        {row}
        {row}
        {row}
        {row}
      </motion.div>
    </section>
  );
}
