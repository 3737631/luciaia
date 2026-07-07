import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NeonButton from "@/components/NeonButton";

const features = [
  { icon: "mail", title: "Sin registro", desc: "Empieza al momento sin crear cuenta." },
  { icon: "x", title: "Sin anuncios", desc: "Experiencia limpia, sin interrupciones." },
  { icon: "edit", title: "Personalizable", desc: "Ajusta personalidad, tono y estilo." },
  { icon: "chat", title: "Chat con IA", desc: "Respuestas naturales con contexto real." },
  { icon: "lock", title: "+18", desc: "Solo para mayores de edad." },
  { icon: "cpu", title: "Personajes IA", desc: "Todos los personajes son generados por IA." },
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
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                {f.icon === "mail" && <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>}
                {f.icon === "x" && <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                {f.icon === "edit" && <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>}
                {f.icon === "chat" && <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                {f.icon === "lock" && <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                {f.icon === "cpu" && <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>}
              </span>
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
