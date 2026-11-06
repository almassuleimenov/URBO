"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { steps } from "@/data/content";
import { typo } from "@/lib/typo";
import { RidingBike } from "./RidingBike";
import { useMediaQuery, useReducedMotion } from "@/lib/motion";

function StepCard({
  step,
  progress,
  index,
  parallax,
}: {
  step: (typeof steps)[number];
  progress: MotionValue<number>;
  index: number;
  parallax: boolean;
}) {
  // Фото внутри рамки едет чуть медленнее карточки — глубина без лишнего движения
  const imgX = useTransform(progress, [0, 1], [`${-4 + index * 1.5}%`, `${4 - index * 1.5}%`]);
  return (
    <article className="w-[min(80vw,400px)] shrink-0 snap-start md:w-[clamp(280px,min(26vw,50dvh),420px)]">
      <div className="zoom-frame relative aspect-[4/3] overflow-hidden bg-urbo-deep">
        <motion.div className="absolute inset-y-0 -inset-x-[8%]" style={{ x: parallax ? imgX : 0 }}>
          <Image
            src={step.photo.src}
            alt={step.alt}
            fill
            sizes="(max-width: 767px) 78vw, 28vw"
            className="object-cover"
            style={{ objectPosition: step.photo.position }}
          />
        </motion.div>
      </div>
      <div className="mt-6 flex items-baseline gap-4">
        <span className="font-display text-[1.05rem] font-bold text-peach tabular-nums">{step.n}</span>
        <h3 className="text-[1.6rem] leading-tight font-bold text-cream">{step.title}</h3>
      </div>
      <p className="mt-3 max-w-[34ch] text-base leading-[1.6] text-cream/70">{typo(step.text)}</p>
    </article>
  );
}

export function Process() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const lane = useRef<HTMLDivElement>(null);
  const desktop = useMediaQuery("(min-width: 768px)");
  const reduce = useReducedMotion();
  const pinned = desktop && !reduce;
  const [dist, setDist] = useState(0);
  const [laneW, setLaneW] = useState(0);
  const bikeW = 96;

  useEffect(() => {
    const measure = () => {
      if (track.current) setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
      if (lane.current) setLaneW(lane.current.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  // Десктоп: вертикальный скролл двигает ленту вбок. Мобильный: нативная горизонтальная прокрутка.
  const pageProgress = useScroll({ target: section, offset: ["start start", "end end"] }).scrollYProgress;
  const swipeProgress = useScroll({ container: track }).scrollXProgress;
  const progress = pinned ? pageProgress : swipeProgress;

  const x = useTransform(pageProgress, [0, 1], [0, -dist]);
  const smooth = useSpring(progress, { stiffness: 160, damping: 30, mass: 0.4 });
  const bikeX = useTransform(smooth, [0, 1], [0, Math.max(0, laneW - bikeW)]);

  return (
    <section
      id="process"
      ref={section}
      aria-labelledby="process-title"
      className="relative bg-urbo-ink text-cream"
      style={{ height: pinned ? `calc(100dvh + ${dist}px)` : undefined }}
    >
      <div className={`${pinned ? "sticky top-0 h-[100dvh] overflow-hidden" : ""} flex flex-col justify-center py-[clamp(56px,8vh,96px)]`}>
        <div className="wrap flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2
              id="process-title"
              className="max-w-[18ch] text-[clamp(2.2rem,4vw,3.75rem)] leading-[0.98] font-bold tracking-[-0.028em]"
            >
              От зерна до чашки
            </h2>
          </div>
          <p className="max-w-[36ch] text-cream/70">
            {pinned ? typo("Крутите колесо мыши, и велосипед довезёт до чашки.") : "Листайте карточки вбок."}
          </p>
        </div>

        <motion.div
          ref={track}
          style={{ x: pinned ? x : 0 }}
          className={`mt-[clamp(32px,5vh,56px)] flex gap-[clamp(20px,2.4vw,36px)] px-[max(clamp(20px,5.5vw,80px),calc((100vw-1440px)/2+80px))] ${
            pinned ? "w-max" : "snap-x snap-mandatory scroll-px-[clamp(20px,5.5vw,80px)] overflow-x-auto pb-2 [scrollbar-width:none]"
          }`}
        >
          {steps.map((s, i) => (
            <StepCard key={s.n} step={s} index={i} progress={pageProgress} parallax={pinned} />
          ))}
        </motion.div>

        {/* Прогресс: велосипед едет по маршруту */}
        <div className="wrap mt-[clamp(28px,4vh,48px)]" aria-hidden>
          <div ref={lane} className="relative h-12">
            <div className="absolute inset-x-0 bottom-1 border-t-2 border-dashed border-cream/20" />
            <motion.div
              className="absolute bottom-1 left-0 h-[2px] origin-left bg-peach"
              style={{ width: "100%", scaleX: smooth }}
            />
            <motion.div className="absolute bottom-[5px] left-0 text-peach" style={{ x: bikeX, width: bikeW }}>
              <RidingBike distance={bikeX} width={bikeW} strokeWidth={13} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
