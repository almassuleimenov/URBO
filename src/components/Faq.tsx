"use client";

import { useId, useState } from "react";
import { faq } from "@/data/extra";
import { INSTAGRAM_DM } from "@/data/content";
import { typo } from "@/lib/typo";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <section id="faq" aria-labelledby="faq-title" className="bg-peach-soft py-[clamp(88px,12vh,140px)]">
      <div className="wrap grid gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-4">
          <h2
            id="faq-title"
            className="max-w-[10ch] text-[clamp(2.4rem,4.8vw,4.5rem)] leading-[0.98] font-bold tracking-[-0.028em] text-urbo"
          >
            Частые вопросы
          </h2>
          <p className="mt-6 max-w-[30ch] text-lg leading-[1.6] text-muted">
            {typo("Не нашли ответ? Спросите нас в")}{" "}
            <a href={INSTAGRAM_DM} target="_blank" rel="noreferrer" className="font-semibold text-urbo underline">
              Instagram
            </a>
            .
          </p>
        </div>

        <ul className="border-t border-urbo/15 md:col-span-8">
          {faq.map((item, i) => {
            const isOpen = open === i;
            const btn = `${base}-q${i}`;
            const panel = `${base}-a${i}`;
            return (
              <li key={item.q} className="border-b border-urbo/15">
                <h3 className="font-sans">
                  <button
                    id={btn}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panel}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="faq-q flex w-full items-center justify-between gap-6 py-6 text-left text-[clamp(1.15rem,1.6vw,1.4rem)] leading-snug font-semibold text-urbo-ink"
                  >
                    {typo(item.q)}
                    <span aria-hidden className="faq-icon relative size-9 shrink-0 rounded-full border">
                      <span className="absolute top-1/2 left-1/2 h-[1.5px] w-3.5 -translate-1/2 bg-current" />
                      <span className="faq-icon-v absolute top-1/2 left-1/2 h-3.5 w-[1.5px] -translate-1/2 bg-current" />
                    </span>
                  </button>
                </h3>
                {/* grid-rows 0fr → 1fr: высота по содержимому без замеров */}
                <div
                  id={panel}
                  role="region"
                  aria-labelledby={btn}
                  className="faq-panel grid"
                  data-open={isOpen}
                  inert={!isOpen}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[58ch] pr-14 pb-7 text-[1.05rem] leading-[1.6] text-muted">{typo(item.a)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
