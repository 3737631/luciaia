import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GirlCard from "@/components/GirlCard";
import { girls } from "@/data/girls";

export default function GirlsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen overflow-x-hidden pb-24">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-pink-500/20 blur-[120px]" />
            <div className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-purple-500/15 blur-[100px]" />
          </div>
          <div className="mx-auto w-full max-w-6xl">
            <div className="mx-auto max-w-xl text-center">
              <h1 className="text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl">
                Chatea con{' '}
                <span className="bg-gradient-to-r from-pink to-purple-500 bg-clip-text text-transparent">ellas</span>
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted/70">
                Elige, personaliza y conversa. Sin registro.
              </p>
              <div className="mt-6">
                <Link
                  href="#girls"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-pink to-purple-500 px-8 text-sm font-bold shadow-lg shadow-pink-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-pink-500/30 active:scale-[0.97]"
                >
                  Ver chicas
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section id="girls" className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 sm:mb-6">
              <h2 className="text-lg font-bold tracking-tight sm:text-xl">
                Personajes <span className="gradient-text">disponibles</span>
              </h2>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[0.65rem] font-medium text-muted/60">{girls.length} chicas</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
              {girls.map((girl) => (
                <GirlCard key={girl.id} girl={girl} />
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
