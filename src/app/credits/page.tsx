import Link from "next/link";
import type { Metadata } from "next";
import credits from "../../../public/assets/img/credits.json";

export const metadata: Metadata = { title: "Фотографии — URBO coffee" };

const extra = [
  {
    file: "food-breakfast.webp",
    by: "Joseph Gonzalez",
    licence: "CC0",
    page: "https://commons.wikimedia.org/wiki/File:Avocado_and_Egg_Toast_(Unsplash).jpg",
  },
  {
    file: "food-bowl.webp",
    by: "Ella Olsson",
    licence: "CC BY 2.0",
    page: "https://commons.wikimedia.org/wiki/File:Acai_bowl_(43779425762).jpg",
  },
];

export default function Credits() {
  const list = [
    ...credits.photos.map((p) => ({ file: p.file, by: p.by, licence: p.licence, page: p.page })),
    ...extra,
  ];
  return (
    <main className="wrap min-h-[100dvh] py-24">
      <Link href="/" className="link-draw text-urbo">
        ← На главную
      </Link>
      <h1 className="mt-8 text-[clamp(2rem,4vw,3.5rem)] font-bold text-urbo">Фотографии на сайте</h1>
      <p className="mt-4 max-w-[60ch] text-muted">
        Временные фотографии из Wikimedia Commons до собственной съёмки URBO.
      </p>
      <ul className="mt-10 divide-y divide-urbo/10 border-y border-urbo/10">
        {list.map((p) => (
          <li key={p.file} className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between">
            <span className="text-urbo-ink">{p.by}</span>
            <a href={p.page} target="_blank" rel="noreferrer" className="link-draw text-muted">
              {p.licence} · Wikimedia Commons
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
