import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NeonButton from "@/components/NeonButton";

const plans = [
  {
    name: "Gratis",
    price: "0€",
    period: "para siempre",
    highlight: false,
    features: [
      "Chat con todos los personajes",
      "Llamada de voz",
      "Historias de todas las chicas",
      "Directos con vista previa (5s)",
      "1 chica creada al día",
    ],
    cta: "Empezar gratis",
    href: "/girls",
  },
  {
    name: "Premium",
    price: "7,99€",
    period: "/ mes",
    highlight: true,
    features: [
      "Directos y videollamadas ilimitados",
      "Fotos y reacción a tus fotos",
      "Notas de voz y respuestas largas",
      "Crea chicas ilimitadas",
      "Sin anuncios, prioridad de respuesta",
    ],
    cta: "Hacerme Premium",
    href: "/girls",
  },
  {
    name: "Premium+",
    price: "15,99€",
    period: "/ mes",
    highlight: false,
    features: [
      "Todo lo de Premium",
      "Personajes ilimitados",
      "Memoria extendida",
      "Modo incógnito reforzado",
      "Soporte prioritario 24/7",
    ],
    cta: "Ir a Premium+",
    href: "/girls",
  },
];

export default function PremiumPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl overflow-x-hidden px-4 pb-24 sm:px-5">
        <section className="py-16 text-center sm:py-20">
          <p className="mb-3 text-sm font-semibold tracking-wide uppercase text-pink">Planes y funciones</p>
          <h1 className="mx-auto max-w-2xl text-5xl font-extrabold leading-[1.1] gradient-text sm:text-6xl">
            NuviaChat Premium
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base text-muted/80 leading-relaxed">
            Desbloquea llamadas sin límites, fotos privadas, notas de voz y mucho más.
            Un pago, todos los beneficios.
          </p>
          <p className="mt-3 text-xs text-muted/60">+18 &middot; Sin registro &middot; Cancela cuando quieras</p>
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={
                "glass rounded-xl3 p-6 text-center " +
                (p.highlight ? "ring-2 ring-pink shadow-glow md:-mt-3 md:mb-3" : "glass-hover")
              }
            >
              <p className={"mb-3 text-sm font-semibold tracking-wide uppercase " + (p.highlight ? "text-pink" : "text-muted")}>
                {p.name}
              </p>
              <div className="mb-1">
                <span className="text-4xl font-extrabold gradient-text">{p.price}</span>
                <span className="text-sm text-muted/70"> {p.period}</span>
              </div>
              <ul className="my-6 space-y-2 text-left">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted/80">
                    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-pink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={p.href}>
                {p.highlight ? <NeonButton>{p.cta}</NeonButton> : <span className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-muted transition hover:bg-white/5">{p.cta}</span>}
              </Link>
            </div>
          ))}
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-lg rounded-xl3 glass p-6 text-center shadow-glow sm:p-10">
            <p className="mb-2 text-sm text-pink font-semibold tracking-wide uppercase">Empieza sin compromiso</p>
            <p className="mb-4 text-5xl font-extrabold gradient-text">Prueba gratis</p>
            <p className="mb-8 text-sm text-muted/70 leading-relaxed">
              Explora el chat y las llamadas sin registro. Actualiza a Premium cuando quieras.
            </p>
            <Link href="/girls">
              <NeonButton>Probar ahora</NeonButton>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
