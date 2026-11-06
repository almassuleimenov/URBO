"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { Bike } from "./Bike";
import { RidingBike } from "./RidingBike";
import { typo } from "@/lib/typo";
import { EASE_EXPO, EASE_OUT, useIntroDone, useReducedMotion } from "@/lib/motion";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const H1_LINES = ["Кофе для тех,", "кто в ритме", "города"];

function Arrow() {
  return (
    <svg className="btn-arrow size-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Круглый бейдж с текстом по окружности: крутится сам и ускоряется от скорости скролла */
function Badge({ ready }: { ready: boolean }) {
  const { scrollY } = useScroll();
  const vel = useVelocity(scrollY);
  const boost = useSpring(useTransform(vel, [-2000, 0, 2000], [-140, 0, 140]), { stiffness: 60, damping: 20 });
  return (
    <motion.div
      data-reveal
      className="absolute -bottom-10 -left-10 hidden size-32 lg:block"
      initial={{ scale: 0, rotate: -90 }}
      animate={ready ? { scale: 1, rotate: 0 } : undefined}
      transition={{ duration: 1, delay: 0.75, ease: EASE_EXPO }}
    >
      <motion.div style={{ rotate: boost }} className="size-full">
        <div className="relative grid size-full place-items-center rounded-full bg-peach text-urbo">
          <svg viewBox="0 0 120 120" className="absolute inset-0 size-full animate-[spin_16s_linear_infinite]" aria-hidden>
            <defs>
              <path id="badge-circle" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
            </defs>
            <text className="fill-current font-sans text-[10.5px] font-semibold tracking-[0.2em] uppercase">
              <textPath href="#badge-circle">50+ кофеен · Өзіміздің URBO ·</textPath>
            </text>
          </svg>
          <Bike className="w-11" strokeWidth={16} />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const ready = useIntroDone();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const laneRef = useRef<HTMLDivElement>(null);
  const bikeRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ lane: 1200, bike: 180 });

  useIsoLayoutEffect(() => {
    const measure = () => {
      if (!laneRef.current || !bikeRef.current) return;
      const cs = getComputedStyle(laneRef.current);
      const inner =
        laneRef.current.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      setDims({ lane: inner, bike: bikeRef.current.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (laneRef.current) ro.observe(laneRef.current);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Велосипед въезжает слева после интро, а затем катится вправо вместе со скроллом.
  const enter = useMotionValue(-(dims.bike + 120));
  useEffect(() => {
    if (!ready) return;
    if (reduce) {
      enter.set(0);
      return;
    }
    const c = animate(enter, 0, { duration: 1.8, delay: 0.25, ease: EASE_EXPO });
    return () => c.stop();
  }, [ready, reduce, enter]);

  const ride = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, Math.max(0, dims.lane - dims.bike)]),
    { stiffness: 140, damping: 28, mass: 0.6 },
  );
  const x = useTransform(() => enter.get() + ride.get());

  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

  const show = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, delay, ease: EASE_OUT },
  });

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-urbo pt-[clamp(96px,13vh,120px)] text-cream"
    >
      <div className="wrap grid flex-1 items-center gap-10 md:grid-cols-12">
        <motion.div className="md:col-span-7" style={{ y: reduce ? 0 : textY }}>
          <h1 className="text-[clamp(2.9rem,6.6vw,6rem)] leading-[0.94] font-bold tracking-[-0.03em]">
            {H1_LINES.map((line, i) => (
              <span key={line} className="line-mask">
                <motion.span
                  data-reveal
                  className="block"
                  initial={{ y: "112%" }}
                  animate={ready ? { y: "0%" } : undefined}
                  transition={{ duration: 1.15, delay: 0.1 + i * 0.09, ease: EASE_EXPO }}
                >
                  {i === 2 ? <em className="text-peach not-italic">{line}</em> : line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            data-reveal
            className="mt-8 max-w-[31rem] text-[1.0625rem] leading-[1.6] text-cream/80 sm:text-lg"
            {...show(0.45)}
          >
            {typo("Кофе, завтраки и боулы. Больше 50 кофеен в Алматы и области, так что одна наверняка есть у вас по дороге.")}
          </motion.p>
          <motion.div data-reveal className="mt-9 flex flex-col gap-3 sm:flex-row" {...show(0.55)}>
            <a href="#map" className="btn btn-peach">
              Найти кофейню <Arrow />
            </a>
            <a href="#menu" className="btn btn-ghost-light">
              Меню
            </a>
          </motion.div>
        </motion.div>

        <div className="relative hidden justify-self-end md:col-span-5 md:block">
          <motion.div
            data-reveal
            className="relative aspect-[4/5] h-[min(56dvh,580px)] overflow-hidden bg-urbo-deep"
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={ready ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
            transition={{ duration: 1.3, delay: 0.2, ease: EASE_EXPO }}
          >
            <motion.div
              className="absolute inset-[-8%_0]"
              style={{ y: reduce ? 0 : photoY }}
              initial={{ scale: 1.25 }}
              animate={ready ? { scale: 1 } : undefined}
              transition={{ duration: 1.6, delay: 0.2, ease: EASE_EXPO }}
            >
              <Image
                src="/assets/img/photo-m61713028.webp"
                alt="Эспрессо стекает из холдера кофемашины"
                fill
                preload
                sizes="(max-width: 767px) 0px, 42vw"
                className="object-cover"
                style={{ objectPosition: "60% 50%" }}
              />
            </motion.div>
          </motion.div>
          <Badge ready={ready} />
        </div>
      </div>

      {/* Дорога и велосипед из логотипа */}
      <div ref={laneRef} className="wrap relative mt-8 h-[clamp(80px,13vh,128px)]" aria-hidden>
        <div className="absolute inset-x-[clamp(20px,5.5vw,80px)] bottom-3 border-t-2 border-dashed border-peach/35" />
        <motion.div
          ref={bikeRef}
          className="absolute bottom-[13px] left-[clamp(20px,5.5vw,80px)] w-[clamp(110px,13vw,190px)] text-peach"
          style={{ x: reduce ? enter : x }}
        >
          <RidingBike distance={reduce ? enter : x} width={dims.bike} interactive strokeWidth={9} />
        </motion.div>
      </div>
    </section>
  );
}
