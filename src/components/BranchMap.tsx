"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MLMap, Marker as MLMarker, StyleSpecification } from "maplibre-gl";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  branches,
  cities,
  distanceKm,
  getStatus,
  routeUrl,
  type Branch,
} from "@/data/branches";
import { BIKE_SVG_STRING } from "./Bike";
import { typo } from "@/lib/typo";
import { EASE_EXPO, EASE_OUT, useReducedMotion } from "@/lib/motion";

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";
const ALMATY: [number, number] = [76.89, 43.24];

const PALETTE = {
  ground: "#f6ece4",
  water: "#e7c2ad",
  green: "#efdccd",
  building: "#ead6c8",
  road: "#ffffff",
  roadMajor: "#f4dccb",
  label: "#6e3a43",
  boundary: "#c9a595",
};

/** Перекрашиваем базовую карту в цвета URBO и переводим подписи на русский */
function brandify(map: MLMap) {
  const style = map.getStyle() as StyleSpecification;
  for (const layer of style.layers) {
    const id = layer.id.toLowerCase();
    try {
      if (layer.type === "background") {
        map.setPaintProperty(layer.id, "background-color", PALETTE.ground);
      } else if (layer.type === "fill") {
        if (/water|ocean|lake/.test(id)) map.setPaintProperty(layer.id, "fill-color", PALETTE.water);
        else if (/building/.test(id)) map.setPaintProperty(layer.id, "fill-color", PALETTE.building);
        else if (/park|wood|grass|forest|landcover|landuse|green/.test(id))
          map.setPaintProperty(layer.id, "fill-color", PALETTE.green);
      } else if (layer.type === "line") {
        if (/water|river|stream|canal/.test(id)) map.setPaintProperty(layer.id, "line-color", PALETTE.water);
        else if (/boundary|admin/.test(id)) map.setPaintProperty(layer.id, "line-color", PALETTE.boundary);
        else if (/motorway|trunk|primary/.test(id) && !/casing/.test(id))
          map.setPaintProperty(layer.id, "line-color", PALETTE.roadMajor);
        else if (/road|highway|street|bridge|tunnel|minor|secondary|tertiary|path/.test(id) && !/casing/.test(id))
          map.setPaintProperty(layer.id, "line-color", PALETTE.road);
      } else if (layer.type === "symbol") {
        const field = layer.layout?.["text-field"];
        if (!field) continue;
        map.setPaintProperty(layer.id, "text-color", PALETTE.label);
        map.setPaintProperty(layer.id, "text-halo-color", PALETTE.ground);
        if (JSON.stringify(field).includes("name")) {
          map.setLayoutProperty(layer.id, "text-field", [
            "coalesce",
            ["get", "name:ru"],
            ["get", "name"],
          ]);
        }
      }
    } catch {
      /* слой без такого свойства — пропускаем */
    }
  }
}

/* Часы, которые тикают раз в минуту (на сервере — null, чтобы не было расхождения при гидратации) */
let clock = new Date();
function subscribeClock(cb: () => void) {
  clock = new Date();
  const t = setInterval(() => {
    clock = new Date();
    cb();
  }, 60_000);
  return () => clearInterval(t);
}
function useNow() {
  return useSyncExternalStore<Date | null>(subscribeClock, () => clock, () => null);
}

function StatusDot({ open }: { open: boolean }) {
  return (
    <span className="relative inline-flex size-2">
      {open && <span className="absolute inset-0 animate-ping rounded-full bg-open/60" />}
      <span className={`relative size-2 rounded-full ${open ? "bg-open" : "bg-muted/50"}`} />
    </span>
  );
}

export function BranchMap() {
  const reduce = useReducedMotion();
  const now = useNow();
  const container = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markers = useRef(new Map<string, { marker: MLMarker; el: HTMLButtonElement }>());
  const youMarker = useRef<MLMarker | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<(typeof cities)[number]>("Все");
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [tip, setTip] = useState<{ id: string; x: number; y: number } | null>(null);
  const [geo, setGeo] = useState<"idle" | "busy" | "error">("idle");
  const [distances, setDistances] = useState<Record<string, number> | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = branches.filter(
      (b) =>
        (city === "Все" || b.city === city) &&
        (!q || `${b.name} ${b.street} ${b.district} ${b.city}`.toLowerCase().includes(q)),
    );
    if (distances) list.sort((a, b) => distances[a.id] - distances[b.id]);
    return list;
  }, [query, city, distances]);

  const selectedBranch = branches.find((b) => b.id === selected) ?? null;

  /* ---------- Инициализация карты ---------- */
  useEffect(() => {
    let cancelled = false;
    let map: MLMap | null = null;
    const markerStore = markers.current;

    // MapLibre (~800 КБ) подгружаем, только когда до карты осталось около двух экранов
    const nearView = new Promise<void>((resolve) => {
      if (!container.current || !("IntersectionObserver" in window)) return resolve();
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            io.disconnect();
            resolve();
          }
        },
        { rootMargin: "1600px 0px" },
      );
      io.observe(container.current);
    });

    (async () => {
      try {
        await nearView;
        if (cancelled) return;
        const ml = await import("maplibre-gl");
        if (cancelled || !container.current) return;
        ml.setWorkerUrl("/vendor/maplibre-gl-worker.mjs");
        map = new ml.Map({
          container: container.current,
          style: STYLE_URL,
          center: ALMATY,
          zoom: 9.4,
          minZoom: 8,
          maxZoom: 17,
          attributionControl: { compact: true },
          cooperativeGestures: true,
          dragRotate: false,
          pitchWithRotate: false,
          locale: {
            "CooperativeGesturesHandler.WindowsHelpText": "Ctrl + колесо мыши — масштаб карты",
            "CooperativeGesturesHandler.MacHelpText": "⌘ + колесо мыши — масштаб карты",
            "CooperativeGesturesHandler.MobileHelpText": "Двигайте карту двумя пальцами",
            "NavigationControl.ZoomIn": "Приблизить",
            "NavigationControl.ZoomOut": "Отдалить",
          },
        });
        mapRef.current = map;
        map.addControl(new ml.NavigationControl({ showCompass: false }), "top-right");

        map.on("error", (e) => {
          if (!map?.loaded() && /style|Failed to fetch/i.test(String(e.error?.message))) setFailed(true);
        });

        map.on("load", () => {
          if (!map || cancelled) return;
          brandify(map);

          branches.forEach((b, i) => {
            const el = document.createElement("button");
            el.type = "button";
            el.className = "urbo-pin";
            el.setAttribute("aria-label", `${b.name}, ${b.street}`);
            el.style.setProperty("--pulse-delay", `${(i % 6) * 0.45}s`);
            el.innerHTML = `<span class="urbo-pin__pulse"></span><span class="urbo-pin__dot">${BIKE_SVG_STRING}</span>`;
            el.addEventListener("mouseenter", () => setHovered(b.id));
            el.addEventListener("mouseleave", () => setHovered((h) => (h === b.id ? null : h)));
            el.addEventListener("focus", () => setHovered(b.id));
            el.addEventListener("blur", () => setHovered((h) => (h === b.id ? null : h)));
            el.addEventListener("click", (ev) => {
              ev.stopPropagation();
              setSelected(b.id);
            });
            const marker = new ml.Marker({ element: el, anchor: "center" }).setLngLat(b.coords).addTo(map!);
            markerStore.set(b.id, { marker, el });
          });

          map.on("click", () => setSelected(null));
          setLoaded(true);
        });
      } catch {
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      markerStore.forEach(({ marker }) => marker.remove());
      markerStore.clear();
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  /* ---------- Кинематографичный пролёт при первом появлении ---------- */
  const fitVisible = useCallback(
    (list: Branch[], opts?: { duration?: number; cinematic?: boolean }) => {
      const map = mapRef.current;
      if (!map || !list.length) return;
      if (list.length === 1) {
        map.flyTo({ center: list[0].coords, zoom: 14, duration: reduce ? 0 : 1400 });
        return;
      }
      const lngs = list.map((b) => b.coords[0]);
      const lats = list.map((b) => b.coords[1]);
      const wide = container.current ? container.current.clientWidth > 640 : true;
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        {
          padding: wide ? { top: 90, bottom: 90, left: 80, right: 80 } : 48,
          maxZoom: 13.5,
          duration: reduce ? 0 : (opts?.duration ?? 1600),
          pitch: opts?.cinematic && !reduce && wide ? 38 : 0,
          bearing: opts?.cinematic && !reduce && wide ? -12 : 0,
          essential: true,
        },
      );
    },
    [reduce],
  );

  useEffect(() => {
    if (!loaded || !section.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fitVisible(branches.filter((b) => b.city === "Алматы"), { duration: 2800, cinematic: true });
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(section.current);
    return () => io.disconnect();
  }, [loaded, fitVisible]);

  /* ---------- Состояния пинов ---------- */
  useEffect(() => {
    const ids = new Set(visible.map((b) => b.id));
    markers.current.forEach(({ el }, id) => {
      el.classList.toggle("is-hovered", hovered === id);
      el.classList.toggle("is-active", selected === id);
      el.classList.toggle("is-hidden", !ids.has(id));
      el.style.zIndex = selected === id ? "3" : hovered === id ? "2" : "1";
    });
  }, [hovered, selected, visible, loaded]);

  /* ---------- Подсказка у пина при наведении ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !hovered) {
      setTip(null);
      return;
    }
    const b = branches.find((x) => x.id === hovered)!;
    const place = () => {
      const p = map.project(b.coords);
      setTip({ id: b.id, x: p.x, y: p.y });
    };
    place();
    map.on("move", place);
    return () => {
      map.off("move", place);
    };
  }, [hovered]);

  /* ---------- Выбор точки: пролёт к кофейне ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedBranch) return;
    map.flyTo({
      center: selectedBranch.coords,
      zoom: 15,
      pitch: reduce ? 0 : 45,
      bearing: reduce ? 0 : -8,
      duration: reduce ? 0 : 1800,
      curve: 1.6,
      essential: true,
      offset: container.current && container.current.clientWidth > 640 ? [0, 60] : [0, -40],
    });
    const item = listRef.current?.querySelector<HTMLElement>(`[data-id="${selectedBranch.id}"]`);
    item?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [selectedBranch, reduce]);

  // наведение на строку списка мягко подводит карту к точке (с задержкой, чтобы не дёргать)
  const previewOnMap = (b: Branch | null) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHovered(b?.id ?? null);
    if (!b || selected) return;
    hoverTimer.current = setTimeout(() => {
      const map = mapRef.current;
      if (!map) return;
      map.easeTo({ center: b.coords, zoom: Math.max(map.getZoom(), 12.5), duration: reduce ? 0 : 900 });
    }, 260);
  };

  const applyFilter = (next: (typeof cities)[number]) => {
    setCity(next);
    setSelected(null);
    fitVisible(branches.filter((b) => next === "Все" || b.city === next));
  };

  const locate = () => {
    if (!("geolocation" in navigator)) return setGeo("error");
    setGeo("busy");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const me: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        const d: Record<string, number> = {};
        branches.forEach((b) => (d[b.id] = distanceKm(me, b.coords)));
        setDistances(d);
        setCity("Все");
        setQuery("");
        const nearest = [...branches].sort((a, b) => d[a.id] - d[b.id])[0];
        const map = mapRef.current;
        if (map) {
          const ml = await import("maplibre-gl");
          youMarker.current?.remove();
          const el = document.createElement("div");
          el.className = "urbo-you";
          el.setAttribute("aria-label", "Вы здесь");
          youMarker.current = new ml.Marker({ element: el }).setLngLat(me).addTo(map);
        }
        setSelected(nearest.id);
        setGeo("idle");
      },
      () => setGeo("error"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
    );
  };

  const tipBranch = tip ? branches.find((b) => b.id === tip.id) : null;

  return (
    <section
      id="map"
      ref={section}
      aria-labelledby="map-title"
      className="bg-cream py-[clamp(80px,11vh,130px)]"
    >
      <div className="wrap">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2
              id="map-title"
              className="max-w-[15ch] text-[clamp(2.4rem,4.8vw,4.5rem)] leading-[0.98] font-bold tracking-[-0.028em] text-urbo"
            >
              Найдите URBO на своём маршруте
            </h2>
          </div>
          <p className="max-w-[38ch] text-muted">
            {typo("Наведите на точку, чтобы увидеть адрес и часы. Нажмите, и карта подлетит к кофейне.")}
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:mt-14 lg:h-[min(76dvh,760px)] lg:grid-cols-12">
          {/* ---------- Список ---------- */}
          <div className="order-2 flex min-h-0 flex-col bg-white lg:order-1 lg:col-span-4">
            <div className="border-b border-urbo/10 p-5">
              <label htmlFor="branch-search" className="sr-only">
                Поиск кофейни
              </label>
              <div className="relative">
                <svg className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  id="branch-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Улица или район"
                  className="h-12 w-full rounded-full border border-urbo/15 bg-cream pr-4 pl-11 text-base text-urbo-ink placeholder:text-muted/80 focus:border-urbo focus:outline-none"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {cities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => applyFilter(c)}
                    aria-pressed={city === c}
                    className={`h-9 rounded-full px-4 text-sm font-semibold transition-colors duration-200 active:scale-[0.97] ${
                      city === c ? "bg-urbo text-cream" : "bg-peach-soft text-urbo hover:bg-peach"
                    }`}
                  >
                    {c}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={locate}
                  disabled={geo === "busy"}
                  className="ml-auto inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold text-urbo transition-colors duration-200 hover:bg-peach-soft active:scale-[0.97] disabled:opacity-60"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                  {geo === "busy" ? "Ищем…" : "Рядом со мной"}
                </button>
              </div>
              {geo === "error" && (
                <p role="status" className="mt-3 text-sm text-urbo">
                  Не удалось определить местоположение. Разрешите доступ к геолокации или найдите
                  кофейню по улице.
                </p>
              )}
            </div>

            <p className="px-5 pt-4 pb-2 text-sm text-muted" aria-live="polite">
              {visible.length === 0
                ? "Ничего не нашли — попробуйте другую улицу"
                : `${visible.length} ${visible.length % 10 === 1 && visible.length % 100 !== 11 ? "кофейня" : visible.length % 10 >= 2 && visible.length % 10 <= 4 && (visible.length % 100 < 10 || visible.length % 100 >= 20) ? "кофейни" : "кофеен"} на карте`}
            </p>

            <ul
              ref={listRef}
              data-lenis-prevent
              className="max-h-[420px] min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3 lg:max-h-none"
            >
              <AnimatePresence initial={false}>
                {visible.map((b) => {
                  const st = now ? getStatus(b, now) : null;
                  const isSel = selected === b.id;
                  return (
                    <motion.li
                      key={b.id}
                      data-id={b.id}
                      layout={!reduce}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                    >
                      <button
                        type="button"
                        onMouseEnter={() => previewOnMap(b)}
                        onMouseLeave={() => previewOnMap(null)}
                        onFocus={() => setHovered(b.id)}
                        onBlur={() => setHovered(null)}
                        onClick={() => setSelected(isSel ? null : b.id)}
                        aria-pressed={isSel}
                        className={`group relative w-full rounded-xl px-4 py-4 text-left transition-colors duration-200 ${
                          isSel ? "bg-urbo text-cream" : hovered === b.id ? "bg-peach-soft" : ""
                        }`}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span className="font-display text-[1.15rem] leading-snug font-bold">{b.name}</span>
                          {distances && (
                            <span className={`shrink-0 pt-1 text-sm tabular-nums ${isSel ? "text-peach" : "text-muted"}`}>
                              {distances[b.id] < 1
                                ? `${Math.round(distances[b.id] * 1000)} м`
                                : `${distances[b.id].toFixed(1)} км`}
                            </span>
                          )}
                        </span>
                        <span className={`mt-1 block text-[0.95rem] ${isSel ? "text-cream/80" : "text-muted"}`}>
                          {b.street} · {b.district}
                        </span>
                        {st && (
                          <span className={`mt-2 flex items-center gap-2 text-sm ${isSel ? "text-cream/90" : "text-urbo-ink/80"}`}>
                            <StatusDot open={st.isOpen} />
                            {st.label}
                          </span>
                        )}
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </div>

          {/* ---------- Карта ---------- */}
          <div className="relative order-1 h-[64dvh] min-h-[380px] overflow-hidden bg-peach-soft lg:order-2 lg:col-span-8 lg:h-full">
            <div className="absolute inset-0">
              <div ref={container} className="h-full w-full" aria-label="Карта кофеен URBO" role="region" />
            </div>

            {!loaded && !failed && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="eyebrow animate-pulse text-muted">Загружаем карту…</span>
              </div>
            )}
            {failed && (
              <div className="absolute inset-0 grid place-items-center p-8 text-center">
                <p className="max-w-[32ch] text-muted">
                  Карта сейчас не загрузилась. Все адреса кофеен — в списке, а маршрут можно открыть в
                  2GIS.
                </p>
              </div>
            )}

            {/* подсказка при наведении на пин */}
            <AnimatePresence>
              {tip && tipBranch && tip.id !== selected && (
                <div
                  key={tip.id}
                  className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
                  style={{ left: tip.x, top: tip.y - 30 }}
                >
                <motion.div
                  className="w-max max-w-[260px] origin-bottom bg-urbo-ink px-4 py-3 text-cream shadow-[0_16px_40px_-16px_rgb(42_13_18/0.6)]"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                >
                  <p className="font-display text-base font-bold">{tipBranch.name}</p>
                  <p className="mt-0.5 text-sm text-cream/75">{tipBranch.street}</p>
                  {now && (
                    <p className="mt-1.5 flex items-center gap-2 text-xs text-cream/85">
                      <StatusDot open={getStatus(tipBranch, now).isOpen} />
                      {getStatus(tipBranch, now).label}
                    </p>
                  )}
                </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* карточка выбранной кофейни */}
            <AnimatePresence>
              {selectedBranch && (
                <motion.div
                  key={selectedBranch.id}
                  className="absolute inset-x-3 bottom-3 z-20 bg-white p-5 shadow-[0_24px_60px_-24px_rgb(42_13_18/0.55)] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[340px] sm:p-6"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.55, ease: EASE_EXPO }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow text-muted">{selectedBranch.city}</p>
                      <h3 className="mt-2 text-[1.5rem] leading-tight font-bold text-urbo">{selectedBranch.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      aria-label="Закрыть карточку"
                      className="-mt-1 -mr-2 grid size-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-peach-soft hover:text-urbo active:scale-[0.95]"
                    >
                      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                        <path d="M6 6l12 12M18 6 6 18" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-2 text-muted">
                    {selectedBranch.street} · {selectedBranch.district}
                  </p>
                  <p className="mt-1 text-urbo-ink">
                    Ежедневно {selectedBranch.hours.open}–{selectedBranch.hours.close}
                  </p>
                  {now && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-urbo-ink/85">
                      <StatusDot open={getStatus(selectedBranch, now).isOpen} />
                      {getStatus(selectedBranch, now).label}
                    </p>
                  )}
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {selectedBranch.tags.map((t) => (
                      <li key={t} className="rounded-full bg-peach-soft px-3 py-1 text-sm font-medium text-urbo">
                        {t}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={routeUrl(selectedBranch)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-urbo mt-5 w-full"
                  >
                    Построить маршрут в 2GIS
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
