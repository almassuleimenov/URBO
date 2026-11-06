"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { EASE_OUT, useLite, useReducedMotion } from "@/lib/motion";
import { typo } from "@/lib/typo";

// Слова-акценты — то, ради чего абзац написан
const TEXT = typo(
  "По-казахски «өзіміздің» значит «наш, свой». Так мы и хотим: чтобы URBO у дома был своим. Можно забежать за эспрессо на две минуты, а можно сесть с ноутбуком до вечера.",
);
const ACCENT = new Set(["«наш,", "свой».", "своим."]);

function Word({
  children,
  progress,
  range,
  accent,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  accent: boolean;
}) {
  // Слово проявляется и чуть «садится» на строку — текст словно печатается по мере чтения
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, ["0.12em", "0em"]);
  return (
    <motion.span style={{ opacity, y }} className={`inline-block ${accent ? "text-urbo" : ""}`}>
      {children}
    </motion.span>
  );
}

export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  // На телефоне без «прилипания» и пословной анимации: десятки слов, пересчитываемые на каждый кадр
  // прокрутки, — главный источник лагов. Абзац просто проявляется один раз.
  const lite = useLite();
  const still = reduce || lite;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.6", "end end"] });
  // Разбиваем по обычным пробелам; неразрывные остаются внутри слова-группы
  const words = TEXT.split(" ");
  const span = 0.8 / words.length;

  return (
    <section ref={ref} aria-labelledby="manifesto-title" className={`relative bg-cream ${still ? "" : "h-[190vh]"}`}>
      <div className={`${still ? "" : "sticky top-0 min-h-[100dvh]"} flex items-center py-[clamp(80px,12vh,96px)]`}>
        <div className="wrap">
          <h2
            id="manifesto-title"
            className="font-display text-[clamp(3.5rem,11vw,10rem)] leading-[0.86] font-extrabold tracking-[-0.035em] text-urbo"
          >
            Өзіміздің URBO
          </h2>
          <motion.p
            initial={lite && !reduce ? { opacity: 0, y: 24 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
            className="mt-10 max-w-[24ch] font-display text-[clamp(1.6rem,3.2vw,2.9rem)] leading-[1.18] font-medium tracking-[-0.015em] text-urbo-ink md:mt-14 md:ml-[33%] md:max-w-[28ch]">
            {words.map((w, i) => {
              const accent = ACCENT.has(w.split(" ").pop() ?? "") || ACCENT.has(w);
              return still ? (
                <span key={i} className={accent ? "text-urbo" : undefined}>
                  {w}{" "}
                </span>
              ) : (
                <span key={i}>
                  <Word progress={scrollYProgress} range={[i * span, i * span + span * 5]} accent={accent}>
                    {w}
                  </Word>{" "}
                </span>
              );
            })}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
