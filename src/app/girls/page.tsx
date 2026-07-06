import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GirlCard from "@/components/GirlCard";
import NeonButton from "@/components/NeonButton";
import { girls } from "@/data/girls";

export default function GirlsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-5">
        <section className="py-16 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">
            Personajes ficticios generados por IA · Solo +18
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight gradient-text sm:text-5xl">
            Habla con personajes IA<br />en segundos
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted">
            Elige una personalidad, personalízala y empieza a chatear.
            Sin registro, sin anuncios, 100% gratis.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="chip bg-pink-500/15 text-pink-300 border-pink-500/25">+18</span>
            <span className="chip bg-purple-500/15 text-purple-300 border-purple-500/25">Personajes IA</span>
            <span className="chip bg-emerald-500/15 text-emerald-300 border-emerald-500/25">Sin registro</span>
            <span className="chip bg-amber-500/15 text-amber-300 border-amber-500/25">Personalizable</span>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#girls">
              <NeonButton>Empezar ahora</NeonButton>
            </a>
            <Link href="/info">
              <NeonButton variant="ghost">Ver info</NeonButton>
            </Link>
          </div>
        </section>

        <section id="girls" className="scroll-mt-20">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {girls.map((girl) => (
              <GirlCard key={girl.id} girl={girl} />
            ))}
          </div>
        </section>

        <section className="py-16">
          <h2 className="mb-10 text-center text-2xl font-bold">Cómo funciona</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { n: "1", t: "Elige personaje", d: "Selecciona la chica que más te guste" },
              { n: "2", t: "Personaliza", d: "Ajusta personalidad, tono y estilo" },
              { n: "3", t: "Empieza el chat", d: "Chatea o llama sin límites" },
              { n: "4", t: "Disfruta", d: "Cambia cuando quieras, siempre gratis" },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl card-surface p-5 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full gradient-btn text-sm font-bold">
                  {s.n}
                </div>
                <p className="mb-1 text-sm font-semibold">{s.t}</p>
                <p className="text-xs text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
