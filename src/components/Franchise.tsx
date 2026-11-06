"use client";

import { useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { franchisePoints } from "@/data/extra";
import { typo } from "@/lib/typo";
import { EASE_OUT, useReducedMotion } from "@/lib/motion";

type Fields = { name: string; phone: string; city: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Как к вам обращаться?";
  if (f.phone.replace(/\D/g, "").length < 10) e.phone = "Нужен номер, чтобы мы перезвонили";
  if (f.city.trim().length < 2) e.city = "В каком городе хотите открыться?";
  return e;
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[0.95rem] font-semibold text-urbo-ink">
        {label}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            className="mt-1.5 text-sm text-[#b3261e]"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Franchise() {
  const listRef = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(listRef, { once: true, margin: "0px 0px -10% 0px" });

  const [fields, setFields] = useState<Fields>({ name: "", phone: "", city: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`fr-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/franchise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = (await res.json()) as { ok: boolean; errors?: Errors };
      if (data.ok) setState("done");
      else if (data.errors) {
        setErrors(data.errors);
        setState("idle");
      } else setState("error");
    } catch {
      setState("error");
    }
  }

  return (
    <section
      id="franchise"
      aria-labelledby="franchise-title"
      className="bg-urbo-deep py-[clamp(88px,12vh,140px)] text-cream"
    >
      <div className="wrap grid gap-14 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-6">
          <h2
            id="franchise-title"
            className="max-w-[13ch] text-[clamp(2.4rem,4.8vw,4.5rem)] leading-[0.98] font-bold tracking-[-0.028em]"
          >
            Франшиза URBO
          </h2>
          <p className="mt-6 max-w-[44ch] text-lg leading-[1.6] text-cream/75">
            {typo(
              "Больше 50 кофеен уже работают под вывеской URBO. Оставьте заявку, и мы перезвоним: расскажем об условиях, вложениях и сроках открытия.",
            )}
          </p>
          <ul ref={listRef} className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {franchisePoints.map((p, i) => (
              <motion.li
                key={p.t}
                className="border-t border-cream/15 pt-5"
                initial={{ opacity: 0, y: 16 }}
                animate={inView || reduce ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.1 + i * 0.08, ease: EASE_OUT }}
              >
                <h3 className="text-[1.25rem] leading-snug font-bold text-peach">{p.t}</h3>
                <p className="mt-2 leading-[1.55] text-cream/70">{typo(p.d)}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-5 md:col-start-8">
          <div className="relative overflow-hidden rounded-[28px] bg-cream p-6 text-urbo-ink sm:p-9">
            <AnimatePresence mode="wait" initial={false}>
              {state === "done" ? (
                <motion.div
                  key="done"
                  className="flex min-h-[420px] flex-col justify-center"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0 : 0.45, ease: EASE_OUT }}
                  role="status"
                >
                  <svg viewBox="0 0 48 48" className="size-14 text-urbo" aria-hidden>
                    <motion.circle
                      cx="24"
                      cy="24"
                      r="21"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      initial={{ pathLength: reduce ? 1 : 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: EASE_OUT }}
                    />
                    <motion.path
                      d="M15 24.5l6 6 12-13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: reduce ? 1 : 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: reduce ? 0 : 0.45, ease: EASE_OUT }}
                    />
                  </svg>
                  <h3 className="mt-6 text-[1.9rem] leading-[1.05] font-bold text-urbo">Заявка у нас</h3>
                  <p className="mt-3 max-w-[32ch] text-lg leading-[1.55] text-muted">
                    {typo(`${fields.name.trim()}, перезвоним на ${fields.phone.trim()} и расскажем, с чего начать.`)}
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  noValidate
                  onSubmit={submit}
                  className="space-y-5"
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: reduce ? 0 : 0.25, ease: EASE_OUT }}
                >
                  <h3 className="pb-2 text-[1.6rem] leading-[1.1] font-bold text-urbo">Заявка на франшизу</h3>
                  <Field id="fr-name" label="Имя" error={errors.name}>
                    <input
                      id="fr-name"
                      className="field"
                      autoComplete="name"
                      value={fields.name}
                      onChange={set("name")}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "fr-name-error" : undefined}
                    />
                  </Field>
                  <Field id="fr-phone" label="Телефон" error={errors.phone}>
                    <input
                      id="fr-phone"
                      className="field tabular-nums"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+7"
                      value={fields.phone}
                      onChange={set("phone")}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "fr-phone-error" : undefined}
                    />
                  </Field>
                  <Field id="fr-city" label="Город" error={errors.city}>
                    <input
                      id="fr-city"
                      className="field"
                      autoComplete="address-level2"
                      value={fields.city}
                      onChange={set("city")}
                      aria-invalid={!!errors.city}
                      aria-describedby={errors.city ? "fr-city-error" : undefined}
                    />
                  </Field>
                  <Field id="fr-message" label="Комментарий, если есть">
                    <textarea
                      id="fr-message"
                      className="field min-h-[6.5rem] resize-y"
                      rows={3}
                      placeholder="Есть ли помещение, опыт в общепите"
                      value={fields.message}
                      onChange={set("message")}
                    />
                  </Field>
                  {state === "error" && (
                    <p role="alert" className="text-sm text-[#b3261e]">
                      Не получилось отправить. Проверьте интернет и попробуйте ещё раз.
                    </p>
                  )}
                  <button type="submit" className="btn btn-urbo w-full" disabled={state === "sending"}>
                    {state === "sending" ? "Отправляем…" : "Отправить заявку"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
