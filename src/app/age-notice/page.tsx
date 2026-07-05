import Header from "@/components/Header";
import Footer from "@/components/Footer";

const items = [
  "Solo mayores de 18 años.",
  "Personajes ficticios.",
  "No representan personas reales.",
  "No hay desnudos en la versión actual.",
  "Contenido sensual ligero, no explícito.",
];

export default function AgeNoticePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-5 py-14">
        <h1 className="mb-6 text-3xl font-extrabold gradient-text">Aviso +18</h1>
        <ul className="space-y-3 rounded-xl2 card-surface p-6 text-sm text-muted">
          {items.map((i) => (
            <li key={i}>• {i}</li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
