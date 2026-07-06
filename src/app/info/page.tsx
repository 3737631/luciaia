import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NeonButton from "@/components/NeonButton";

const features = [
  { icon: "✉️", title: "Sin registro", desc: "Empieza al momento sin crear cuenta." },
  { icon: "🚫", title: "Sin anuncios", desc: "Experiencia limpia, sin interrupciones." },
  { icon: "🎨", title: "Personalizable", desc: "Ajusta personalidad, tono y estilo." },
  { icon: "💬", title: "Chat con IA", desc: "Respuestas naturales con contexto real." },
  { icon: "🔞", title: "+18", desc: "Solo para mayores de edad." },
  { icon: "🤖", title: "Personajes IA", desc: "Todos los personajes son generados por IA." },
];

const steps = [
  "Confirma que eres +18",
  "Elige una chica ficticia",
  "Personalízala",
  "Chatea o llama sin límites",
];

export default function InfoPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-5">
        <section className="py-16 text-center">
          <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight gradient-text sm:text-5xl">
            LunaCall
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted">
            Habla con personajes IA en segundos. Elige una personalidad, personalízala y empieza a chatear.
          </p>
          <p className="mt-2 text-xs text-muted">
            Personajes ficticios · +18 · Sin registro
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/girls">
              <NeonButton>Empezar ahora</NeonButton>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl card-surface p-6 text-center hover:-translate-y-1 hover:shadow-glowSm transition-all duration-200"
            >
              <span className="mb-3 inline-block text-2xl">{f.icon}</span>
              <h3 className="mb-1 text-sm font-semibold">{f.title}</h3>
              <p className="text-xs text-muted">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="py-16">
          <h2 className="mb-8 text-center text-2xl font-bold">Cómo funciona</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s} className="rounded-2xl card-surface p-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full gradient-btn text-sm font-bold">
                  {i + 1}
                </div>
                <p className="text-sm text-muted">{s}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-2xl rounded-2xl card-surface p-8 text-center shadow-glow">
            <p className="mb-2 text-sm text-pink font-semibold">Demo gratuita</p>
            <p className="mb-4 text-4xl font-extrabold gradient-text">Sin límites</p>
            <p className="mb-6 text-sm text-muted">
              Chat con IA real, videollamada simulada, personalización. Todo gratis, sin registro.
            </p>
            <Link href="/girls">
              <NeonButton>Empezar ahora</NeonButton>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
