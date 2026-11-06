"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";
import { Bike } from "./Bike";
import { EASE_IN_OUT, EASE_OUT, getLenis } from "@/lib/motion";

const links = [
  { href: "#menu", label: "Меню" },
  { href: "#process", label: "Как мы варим" },
  { href: "#map", label: "Кофейни" },
  { href: "#spaces", label: "VIP-комнаты" },
  { href: "#franchise", label: "Франшиза" },
];

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <Bike className="h-6 w-auto" strokeWidth={16} />
      <span className="font-display text-[1.35rem] leading-none font-extrabold tracking-[0.02em]">
        URBO
      </span>
      <span className="text-[0.95rem] leading-none font-medium opacity-80">coffee</span>
    </span>
  );
}

export function Nav() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, mass: 0.3 });
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > window.innerHeight * 0.82);
    if (open) return;
    setHidden(y > 240 && y > prev + 2);
    if (y < prev - 2) setHidden(false);
  });

  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (!el) return;
    const lenis = getLenis();
    // ждём, пока меню начнёт закрываться, чтобы прокрутка не дёргалась
    requestAnimationFrame(() => {
      lenis?.start();
      if (lenis) lenis.scrollTo(el as HTMLElement, { duration: 1.4 });
      else el.scrollIntoView({ behavior: "smooth" });
    });
  };

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4"
        animate={{ y: hidden ? "-120%" : "0%" }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
      >
        <div className="wrap">
          <nav
            aria-label="Основная навигация"
            className={`flex h-14 items-center justify-between rounded-full pr-2 pl-5 transition-[background-color,color,box-shadow] duration-300 ${
              solid
                ? "bg-cream/90 text-urbo shadow-[0_10px_30px_-18px_rgb(42_13_18/0.5)] backdrop-blur-md"
                : "bg-transparent text-cream"
            }`}
          >
            <a href="#top" aria-label="URBO coffee — наверх" className="shrink-0">
              <Logo />
            </a>
            <ul className="hidden items-center gap-8 text-[0.95rem] font-medium md:flex">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="link-draw">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#map"
              className={`btn hidden h-10 px-5 text-[0.9rem] md:inline-flex ${solid ? "btn-urbo" : "btn-peach"}`}
            >
              Найти кофейню
            </a>
            <button
              type="button"
              className="relative grid size-11 place-items-center md:hidden"
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <motion.span
                className="absolute h-[2px] w-6 rounded bg-current"
                animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
              />
              <motion.span
                className="absolute h-[2px] w-6 rounded bg-current"
                animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
              />
            </button>
          </nav>
        </div>
        <motion.div
          aria-hidden
          className="fixed top-0 left-0 h-[3px] w-full origin-left bg-peach"
          style={{ scaleX: progress }}
        />
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col justify-between bg-urbo px-5 pt-28 pb-10 text-cream md:hidden"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.6, ease: EASE_IN_OUT }}
          >
            <ul className="flex flex-col gap-2">
              {links.map((l, i) => (
                <li key={l.href} className="line-mask">
                  <motion.a
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault();
                      go(l.href);
                    }}
                    className="block font-display text-[2.6rem] leading-tight font-bold"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "110%" }}
                    transition={{ duration: 0.6, delay: 0.15 + i * 0.06, ease: EASE_OUT }}
                  >
                    {l.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.a
              href="#map"
              onClick={(e) => {
                e.preventDefault();
                go("#map");
              }}
              className="btn btn-peach w-full"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: EASE_OUT }}
            >
              Найти ближайшую кофейню
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
