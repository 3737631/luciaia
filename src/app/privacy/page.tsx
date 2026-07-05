import Header from "@/components/Header";
import Footer from "@/components/Footer";

const items = [
  "Se usa localStorage y cookies para recordar la aceptación +18, los límites gratis y el estado premium.",
  "No se guardan datos de pago.",
  "No se deben compartir datos personales sensibles.",
  "En una versión futura puede usarse IP hasheada para evitar abuso, pero nunca IP pública en texto plano.",
  "El usuario puede borrar sus datos limpiando cookies y localStorage del navegador.",
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-5 py-14">
        <h1 className="mb-6 text-3xl font-extrabold gradient-text">Privacidad</h1>
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
