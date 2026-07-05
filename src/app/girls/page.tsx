import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GirlCard from "@/components/GirlCard";
import { girls } from "@/data/girls";

export default function GirlsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="mb-2 text-center text-3xl font-extrabold gradient-text">
          Elige tu chica IA
        </h1>
        <p className="mb-10 text-center text-muted">
          Personajes ficticios generados por IA. Personalízalos antes de empezar.
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {girls.map((girl) => (
            <GirlCard key={girl.id} girl={girl} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
