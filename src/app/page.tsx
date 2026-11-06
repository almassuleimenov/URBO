import { Intro } from "@/components/Intro";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Manifesto } from "@/components/Manifesto";
import { Menu } from "@/components/Menu";
import { Process } from "@/components/Process";
import { BranchMap } from "@/components/BranchMap";
import { Spaces } from "@/components/Spaces";
import { Franchise } from "@/components/Franchise";
import { Jobs } from "@/components/Jobs";
import { Faq } from "@/components/Faq";
import { ActionBar } from "@/components/ActionBar";
import { Footer } from "@/components/Footer";
import { MotionProvider } from "@/components/MotionProvider";

export default function Home() {
  return (
    <MotionProvider>
      <Intro />
      <SmoothScroll />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Manifesto />
        <Menu />
        <Process />
        <BranchMap />
        <Spaces />
        <Franchise />
        <Jobs />
        <Faq />
      </main>
      <Footer />
      <ActionBar />
    </MotionProvider>
  );
}
