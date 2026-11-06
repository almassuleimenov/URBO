"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { INSTAGRAM_DM } from "@/data/content";
import { typo } from "@/lib/typo";
import { EASE_EXPO, EASE_OUT, useReducedMotion } from "@/lib/motion";

const uses = [
  { t: "Встречи", d: "Закрытая дверь, общий стол и кофе на всех." },
  { t: "Учёба и созвоны", d: "Тихо, есть где разложить ноутбуки и тетради." },
  { t: "Дни рождения", d: "Накроем стол заранее, вам останется только прийти." },
];

function Photo({
  src,
  alt,
  w,
  h,
  className,
  pos,
  delay = 0,
}: {
  src: string;
  alt: string;
  w: number;
  h: number;
  className: string;
  pos: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  return (
    <motion.div
      ref={ref}
      data-reveal
      className={`relative overflow-hidden bg-peach-soft ${className}`}
      initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
      animate={inView || reduce ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
      transition={{ duration: reduce ? 0 : 1.2, delay: reduce ? 0 : delay, ease: EASE_EXPO }}
    >
      <motion.div className="absolute inset-x-0 -inset-y-[8%]" style={{ y: reduce ? 0 : y }}>
        <Image src={src} alt={alt} width={w} height={h} sizes="(max-width: 767px) 100vw, 40vw" className="size-full object-cover" style={{ objectPosition: pos }} />
      </motion.div>
    </motion.div>
  );
}

export function Spaces() {
  const listRef = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(listRef, { once: true, margin: "0px 0px -10% 0px" });

  return (
    <section id="spaces" aria-labelledby="spaces-title" className="bg-peach-soft py-[clamp(88px,12vh,140px)]">
      <div className="wrap grid gap-12 md:grid-cols-12 md:gap-10">
        <div className="grid grid-cols-2 gap-4 self-start md:col-span-6 md:gap-5">
          <Photo
            src="/assets/img/photo-m61714648.webp"
            alt="Эспрессо наливают в чашку на деревянной стойке"
            w={960}
            h={1433}
            pos="60% 70%"
            className="row-span-2 h-full min-h-[300px]"
          />
          <Photo
            src="/assets/img/photo-m61713103.webp"
            alt="Фильтр-кофе капает в стеклянный сервер"
            w={1280}
            h={853}
            pos="58% 45%"
            className="aspect-square"
            delay={0.12}
          />
          <Photo
            src="/assets/img/photo-m147143898-1200.webp"
            alt="Щуп с обжаренными зёрнами у кофейного ростера"
            w={1200}
            h={800}
            pos="45% 50%"
            className="aspect-square"
            delay={0.22}
          />
        </div>

        <div className="flex flex-col md:col-span-6 md:pl-[clamp(0px,4vw,64px)]">
          <h2
            id="spaces-title"
            className="max-w-[13ch] text-[clamp(2.4rem,4.8vw,4.5rem)] leading-[0.98] font-bold tracking-[-0.028em] text-urbo"
          >
            VIP-комната для своих
          </h2>
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-muted">
            {typo("В части кофеен URBO есть отдельные комнаты. Напишите нам в Instagram, на какой день и сколько вас будет.")}
          </p>
          <ul ref={listRef} className="mt-10 border-t border-urbo/15">
            {uses.map((u, i) => (
              <motion.li
                key={u.t}
                className="border-b border-urbo/15 py-5"
                initial={{ opacity: 0, y: 16 }}
                animate={inView || reduce ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.1 + i * 0.08, ease: EASE_OUT }}
              >
                <div>
                  <h3 className="text-[1.3rem] leading-snug font-bold text-urbo-ink">{u.t}</h3>
                  <p className="mt-1 text-muted">{typo(u.d)}</p>
                </div>
              </motion.li>
            ))}
          </ul>
          <div className="mt-10">
            <a href={INSTAGRAM_DM} target="_blank" rel="noreferrer" className="btn btn-urbo">
              Забронировать комнату
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
