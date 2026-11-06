"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { menu } from "@/data/content";
import { typo } from "@/lib/typo";
import { INSTAGRAM } from "@/data/content";
import { EASE_EXPO, EASE_OUT, useReducedMotion } from "@/lib/motion";

const price = (n: number) => `${n.toLocaleString("ru-RU")} ₸`;

export function Menu() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const cat = menu[active];

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : -1) + menu.length) % menu.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="menu" aria-labelledby="menu-title" className="bg-white py-[clamp(88px,12vh,140px)]">
      <div className="wrap">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2
              id="menu-title"
              className="max-w-[14ch] text-[clamp(2.4rem,4.8vw,4.5rem)] leading-[0.98] font-bold tracking-[-0.028em] text-urbo"
            >
              Кофе, завтраки и боулы
            </h2>
          </div>

          <LayoutGroup id="menu-tabs">
            <div
              role="tablist"
              aria-label="Разделы меню"
              onKeyDown={onKey}
              className="flex w-full gap-1 rounded-full bg-peach-soft p-1.5 sm:w-auto"
            >
              {menu.map((c, i) => {
                const selected = i === active;
                return (
                  <button
                    key={c.id}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    role="tab"
                    id={`tab-${c.id}`}
                    aria-selected={selected}
                    aria-controls={`panel-${c.id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(i)}
                    className={`relative h-11 flex-1 rounded-full px-5 text-[0.95rem] font-semibold transition-colors duration-200 active:scale-[0.97] sm:flex-none ${
                      selected ? "text-cream" : "text-urbo hover:text-urbo-ink"
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="menu-pill"
                        className="absolute inset-0 rounded-full bg-urbo"
                        transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
                      />
                    )}
                    <span className="relative">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>

        <div
          role="tabpanel"
          id={`panel-${cat.id}`}
          aria-labelledby={`tab-${cat.id}`}
          className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12 md:gap-12"
        >
          {/* Фото раздела: шторка снизу вверх при смене вкладки */}
          <div className="relative aspect-[4/5] overflow-hidden bg-peach-soft md:col-span-5">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={cat.id}
                className="absolute inset-0"
                style={{ zIndex: 1 }}
                initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0% 0% 0%)" }}
                animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
                exit={{
                  zIndex: 0,
                  opacity: 0.99,
                  transition: { zIndex: { duration: 0 }, opacity: { duration: 0.9 } },
                }}
                transition={{ duration: 0.85, ease: EASE_EXPO }}
              >
                <motion.div
                  className="absolute inset-0"
                  initial={reduce ? false : { scale: 1.18 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.2, ease: EASE_EXPO }}
                >
                  <Image
                    src={cat.photo.src}
                    alt={cat.photo.alt}
                    fill
                    sizes="(max-width: 767px) 100vw, 40vw"
                    className="object-cover"
                    style={{ objectPosition: cat.photo.position }}
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col md:col-span-7">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={cat.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2 }}
              >
                <p className="max-w-[46ch] text-lg leading-[1.6] text-muted">{typo(cat.lead)}</p>
                <ul className="mt-8 border-t border-urbo/15">
                  {cat.items.map((item, i) => (
                    <motion.li
                      key={item.name}
                      initial={reduce ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.55, delay: 0.05 + i * 0.045, ease: EASE_OUT }}
                      className="group relative border-b border-urbo/15"
                    >
                      <span
                        aria-hidden
                        className="absolute inset-0 origin-left scale-x-0 bg-peach-soft transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:scale-x-100"
                      />
                      <div className="relative flex items-baseline gap-4 py-5 transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-[1.35rem] leading-snug font-bold text-urbo-ink">
                            {item.name}
                          </p>
                          <p className="mt-1 text-base text-muted">{item.note}</p>
                        </div>
                        <p className="shrink-0 pr-3 font-display text-[1.2rem] font-bold text-urbo tabular-nums">
                          {price(item.price)}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
            <div className="mt-auto pt-10">
              <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="btn btn-ghost-dark">
                Полное меню в Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
