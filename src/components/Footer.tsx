"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useSpring, useTransform } from "motion/react";
import { RidingBike } from "./RidingBike";
import { INSTAGRAM } from "@/data/content";
import { EASE_EXPO, useReducedMotion } from "@/lib/motion";

const nav = [
  { href: "#menu", label: "Меню" },
  { href: "#process", label: "Как мы варим" },
  { href: "#map", label: "Кофейни на карте" },
  { href: "#spaces", label: "VIP-комнаты" },
  { href: "#franchise", label: "Франшиза" },
  { href: "#jobs", label: "Работа в URBO" },
  { href: "#faq", label: "Частые вопросы" },
];

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(wordRef, { once: true, margin: "0px 0px -10% 0px" });
  const [w, setW] = useState(1200);
  const bikeW = Math.round(Math.max(60, Math.min(120, w * 0.09)));

  useEffect(() => {
    const m = () => wordRef.current && setW(wordRef.current.clientWidth);
    m();
    window.addEventListener("resize", m);
    return () => window.removeEventListener("resize", m);
  }, []);

  // Велосипед проезжает по верхней кромке логотипа, пока футер въезжает в экран
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const x = useSpring(useTransform(scrollYProgress, [0.2, 1], [0, Math.max(0, w - bikeW)]), {
    stiffness: 120,
    damping: 26,
  });

  return (
    <footer ref={ref} className="overflow-hidden bg-urbo pt-[clamp(80px,12vh,140px)] text-cream">
      <div className="wrap">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-[14ch] text-[clamp(2.5rem,5.4vw,5rem)] leading-[1] font-bold tracking-[-0.02em]">
            Увидимся по&nbsp;пути.
          </h2>
          <a href="#map" className="btn btn-peach self-start md:self-auto">
            Найти ближайшую кофейню
          </a>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-10 border-t border-cream/15 pt-10 md:grid-cols-4">
          <div>
            <p className="text-[0.95rem] font-semibold text-peach">Сайт</p>
            <ul className="mt-4 space-y-2.5">
              {nav.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="link-draw text-cream/85 hover:text-cream">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[0.95rem] font-semibold text-peach">Мы в соцсетях</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="link-draw text-cream/85 hover:text-cream">
                  Instagram @urbocoffee
                </a>
              </li>
            </ul>
          </div>
          <div className="col-span-2">
            <p className="text-[0.95rem] font-semibold text-peach">Часы работы</p>
            <p className="mt-4 max-w-[36ch] text-cream/85">
              Большинство кофеен работают с&nbsp;7:30–8:00 до&nbsp;22:00–23:00. Часы каждой точки есть на&nbsp;карте.
            </p>
          </div>
        </div>

        {/* Большой логотип с велосипедом на кромке букв */}
        <div ref={wordRef} className="relative mt-[clamp(56px,9vh,110px)]" aria-hidden>
          <motion.div
            className="absolute left-0 text-peach"
            style={{ x: reduce ? 0 : x, width: bikeW, top: -(bikeW * 0.565 - 4) }}
          >
            <RidingBike distance={x} width={bikeW} interactive strokeWidth={13} />
          </motion.div>
          <div className="flex justify-between font-display text-[clamp(6rem,30.5vw,27rem)] leading-[0.76] font-extrabold tracking-[-0.03em]">
            {"URBO".split("").map((ch, i) => (
              <span key={i} className="line-mask">
                <motion.span
                  className="block"
                  initial={{ y: "100%" }}
                  animate={inView || reduce ? { y: "0%" } : undefined}
                  transition={{ duration: reduce ? 0 : 1.2, delay: reduce ? 0 : i * 0.07, ease: EASE_EXPO }}
                >
                  {ch}
                </motion.span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-cream/15 py-6 text-sm text-cream/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 URBO coffee. Өзіміздің URBO.</p>
          <Link href="/credits" className="link-draw hover:text-cream">
            Фотографии: Wikimedia Commons — авторы и лицензии
          </Link>
        </div>
      </div>
    </footer>
  );
}
