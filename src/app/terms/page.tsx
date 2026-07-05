import Header from "@/components/Header";
import Footer from "@/components/Footer";

const items = [
  "Servicio solo para mayores de 18 años.",
  "Todos los personajes son ficticios.",
  "No representan personas reales.",
  "No se permite usar nombres de famosas o personas reales.",
  "No se permite contenido ilegal.",
  "El servicio es entretenimiento.",
  "No es relación real ni terapia.",
  "El usuario puede dejar de usarlo cuando quiera.",
];

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-5 py-14">
        <h1 className="mb-6 text-3xl font-extrabold gradient-text">Términos</h1>
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
