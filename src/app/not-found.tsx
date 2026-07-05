import Link from "next/link";
import NeonButton from "@/components/NeonButton";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <h1 className="mb-3 text-3xl font-bold gradient-text">Página no encontrada</h1>
      <p className="mb-6 text-muted">Esa chica IA no existe todavía.</p>
      <Link href="/girls">
        <NeonButton>Volver a chicas</NeonButton>
      </Link>
    </main>
  );
}
