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
        <div className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Personajes <span className="gradient-text">IA</span>
            </h1>
            <p className="mt-0.5 text-xs text-muted/60">
              Elige, chatea o llama, gratis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="chip bg-pink-500/15 text-pink-300 border-pink-500/25">+18</span>
            <span className="chip bg-purple-500/15 text-purple-300 border-purple-500/25">IA</span>
            <span className="chip bg-emerald-500/15 text-emerald-300 border-emerald-500/25">Gratis</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {girls.map((girl) => (
            <GirlCard key={girl.id} girl={girl} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
