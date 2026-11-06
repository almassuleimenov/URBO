import Link from "next/link";
import { Bike } from "@/components/Bike";

export default function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-urbo px-6 text-center text-cream">
      <div>
        <Bike className="mx-auto w-40 text-peach" strokeWidth={10} />
        <h1 className="mt-10 text-[clamp(2.25rem,5vw,4rem)] leading-tight font-bold">Кажется, мы свернули не туда</h1>
        <p className="mx-auto mt-4 max-w-[40ch] text-cream/75">Такой страницы нет. Вернёмся на маршрут?</p>
        <Link href="/" className="btn btn-peach mt-8">
          На главную
        </Link>
      </div>
    </main>
  );
}
