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
        <section className="py-20 text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted/60">
            Personajes ficticios generados por IA
          </p>
          <h1 className="mx-auto max-w-3xl text-5xl font-extrabold leading-[1.1] gradient-text sm:text-6xl">
            Habla con personajes IA
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base text-muted/80 leading-relaxed">
            Elige una personalidad, personalízala y empieza a chatear o llamar.
            Sin registro, sin anuncios, gratis.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="chip bg-pink-500/15 text-pink-300 border-pink-500/25">+18</span>
            <span className="chip bg-purple-500/15 text-purple-300 border-purple-500/25">Personajes IA</span>
            <span className="chip bg-emerald-500/15 text-emerald-300 border-emerald-500/25">Sin registro</span>
            <span className="chip bg-amber-500/15 text-amber-300 border-amber-500/25">Personalizable</span>
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
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

        <section className="py-20">
          <h2 className="mb-3 text-center text-2xl font-bold tracking-tight">Cómo funciona</h2>
          <p className="mb-10 text-center text-sm text-muted/70">Empieza en segundos, sin complicaciones</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { n: "01", t: "Elige", d: "Selecciona la chica que más te guste" },
              { n: "02", t: "Personaliza", d: "Ajusta personalidad, tono y estilo" },
              { n: "03", t: "Chatea o llama", d: "Conversaciones naturales sin límites" },
              { n: "04", t: "Disfruta", d: "Cambia cuando quieras, siempre gratis" },
            ].map((s) => (
              <div key={s.n} className="glass glass-hover rounded-xl3 p-6 text-center">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full gradient-btn text-sm font-bold shadow-lg shadow-pink-500/25">
                  {s.n}
                </div>
                <p className="mb-1.5 text-sm font-semibold">{s.t}</p>
                <p className="text-xs text-muted/70 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
