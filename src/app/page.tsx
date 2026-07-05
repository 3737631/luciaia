import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NeonButton from "@/components/NeonButton";

const advantages = [
  "Sin registro",
  "Sin anuncios",
  "Entra desde el móvil",
  "Gratis cada día",
  "Personajes personalizables",
  "Chat o llamada simulada",
];

const steps = [
  "Confirma que eres +18",
  "Elige una chica ficticia",
  "Personalízala",
  "Prueba chat o videollamada",
  "Desbloquea premium si quieres seguir",
];

const premiumBenefits = [
  "Llamadas más largas",
  "Más mensajes",
  "Memoria de conversación",
  "Más fondos",
  "Más personalización",
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-5">
        <section className="py-16 text-center">
          <p className="mb-4 text-sm text-muted">
            🔞 Personajes ficticios generados por IA. Solo +18.
          </p>
          <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight gradient-text sm:text-5xl">
            Elige tu chica IA y habla en segundos
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-muted">
            Chat, voz y videollamada simulada. 3 minutos gratis de llamada o 5
            mensajes gratis de chat. Sin registro. Sin anuncios.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/girls">
              <NeonButton>Probar ahora</NeonButton>
            </Link>
            <Link href="/girls">
              <NeonButton variant="secondary">Ver chicas IA</NeonButton>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((a) => (
            <div
              key={a}
              className="rounded-xl2 card-surface p-5 text-center font-medium hover:-translate-y-1 hover:shadow-glowSm transition-all duration-200"
            >
              {a}
            </div>
          ))}
        </section>

        <section className="py-14">
          <h2 className="mb-8 text-center text-2xl font-bold">Cómo funciona</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s, i) => (
              <div
                key={s}
                className="rounded-xl2 card-surface p-5 text-center"
              >
                <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full gradient-btn text-sm font-bold">
                  {i + 1}
                </div>
                <p className="text-sm text-muted">{s}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-14">
          <div className="mx-auto max-w-2xl rounded-xl2 card-surface p-8 text-center shadow-glow">
            <p className="mb-2 text-sm text-pink font-semibold">✨ Premium</p>
            <p className="mb-6 text-4xl font-extrabold gradient-text">6€/mes</p>
            <ul className="mb-6 grid grid-cols-1 gap-2 text-sm text-muted sm:grid-cols-2">
              {premiumBenefits.map((b) => (
                <li key={b}>• {b}</li>
              ))}
            </ul>
            <Link href="/premium">
              <NeonButton>Ver Premium</NeonButton>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
