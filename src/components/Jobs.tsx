"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { jobs } from "@/data/extra";
import { INSTAGRAM_DM } from "@/data/content";
import { typo } from "@/lib/typo";
import { EASE_EXPO, useReducedMotion } from "@/lib/motion";

export function Jobs() {
  const listRef = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(listRef, { once: true, margin: "0px 0px -10% 0px" });

  return (
    <section id="jobs" aria-labelledby="jobs-title" className="bg-cream py-[clamp(88px,12vh,140px)]">
      <div className="wrap">
        <div className="grid gap-6 md:grid-cols-12 md:items-end md:gap-10">
          <h2
            id="jobs-title"
            className="max-w-[13ch] text-[clamp(2.4rem,4.8vw,4.5rem)] leading-[0.98] font-bold tracking-[-0.028em] text-urbo md:col-span-7"
          >
            Работа в URBO
          </h2>
          <p className="max-w-[40ch] text-lg leading-[1.6] text-muted md:col-span-5">
            {typo(
              "Ищем людей в кофейни Алматы и Каскелена. Напишите нам в Instagram, какая должность интересна и в каком районе удобно работать.",
            )}
          </p>
        </div>

        <ul ref={listRef} className="mt-14 border-t border-urbo/15">
          {jobs.map((j, i) => (
            <li key={j.role} className="border-b border-urbo/15">
              <a
                href={INSTAGRAM_DM}
                target="_blank"
                rel="noreferrer"
                className="group job-row relative grid gap-2 py-7 md:grid-cols-12 md:items-center md:gap-10 md:py-9"
              >
                {/* Заливка строки при наведении: растёт снизу вверх */}
                <span aria-hidden className="job-fill absolute inset-x-[-12px] inset-y-0 rounded-[18px] bg-peach-soft md:inset-x-[-24px]" />
                <span className="line-mask relative md:col-span-6">
                  <motion.span
                    className="block font-display text-[clamp(2rem,4.2vw,3.6rem)] leading-[1.02] font-bold tracking-[-0.025em] text-urbo-ink"
                    initial={{ y: "105%" }}
                    animate={inView || reduce ? { y: "0%" } : undefined}
                    transition={{ duration: reduce ? 0 : 1, delay: reduce ? 0 : i * 0.08, ease: EASE_EXPO }}
                  >
                    {j.role}
                  </motion.span>
                </span>
                <span className="relative max-w-[36ch] text-[1.05rem] leading-[1.55] text-muted md:col-span-4">
                  {typo(j.note)}
                </span>
                <span className="relative mt-2 inline-flex items-center gap-2 font-semibold text-urbo md:col-span-2 md:mt-0 md:justify-self-end">
                  Написать
                  <svg viewBox="0 0 24 24" className="job-arrow size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
