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
      <main className="min-h-screen overflow-x-hidden px-4 pb-24 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Personajes <span className="gradient-text">IA</span>
              </h1>
              <p className="mt-0.5 text-xs text-muted/60 sm:text-sm">
                Elige, chatea o llama, gratis
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip bg-pink-500/15 text-pink-300 border-pink-500/25">+18</span>
              <span className="chip bg-purple-500/15 text-purple-300 border-purple-500/25">IA</span>
              <span className="chip bg-emerald-500/15 text-emerald-300 border-emerald-500/25">Gratis</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {girls.map((girl) => (
              <GirlCard key={girl.id} girl={girl} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
