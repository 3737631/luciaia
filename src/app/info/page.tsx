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
      <main className="mx-auto max-w-6xl overflow-x-hidden px-4 pb-24 sm:px-5">
        <section className="py-16 text-center sm:py-20">
          <h1 className="mx-auto max-w-2xl text-5xl font-extrabold leading-[1.1] gradient-text sm:text-6xl">
            LunaCall
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base text-muted/80 leading-relaxed">
            Habla con personajes IA en segundos. Elige, personaliza y chatea o llama sin límites.
          </p>
          <p className="mt-3 text-xs text-muted/60">
            Personajes ficticios &middot; +18 &middot; Sin registro
          </p>
          <div className="mt-10">
            <Link href="/girls">
              <NeonButton>Empezar ahora</NeonButton>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass glass-hover rounded-xl3 p-6 text-center"
            >
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                {f.icon === "mail" && <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>}
                {f.icon === "x" && <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                {f.icon === "edit" && <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>}
                {f.icon === "chat" && <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                {f.icon === "lock" && <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                {f.icon === "cpu" && <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>}
              </span>
              <h3 className="mb-1.5 text-sm font-semibold">{f.title}</h3>
              <p className="text-xs text-muted/70 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="py-16 sm:py-20">
          <h2 className="mb-3 text-center text-2xl font-bold tracking-tight">Cómo funciona</h2>
          <p className="mb-10 text-center text-sm text-muted/70">Empieza en segundos, sin complicaciones</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s} className="glass glass-hover rounded-xl3 p-6 text-center">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full gradient-btn text-sm font-bold shadow-lg shadow-pink-500/25">
                  {i + 1}
                </div>
                <p className="text-sm text-muted/80">{s}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-lg rounded-xl3 glass p-6 text-center shadow-glow sm:p-10">
            <p className="mb-2 text-sm text-pink font-semibold tracking-wide uppercase">Demo gratuita</p>
            <p className="mb-4 text-5xl font-extrabold gradient-text">Sin límites</p>
            <p className="mb-8 text-sm text-muted/70 leading-relaxed">
              Chat con IA real, llamada simulada, personalización. Todo gratis, sin registro.
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
