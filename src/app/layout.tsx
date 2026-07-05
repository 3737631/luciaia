import type { Metadata } from "next";
import "./globals.css";
import AnimatedBackground from "@/components/AnimatedBackground";
import AgeGate from "@/components/AgeGate";

export const metadata: Metadata = {
  title: "LunaCall — Chica IA ficticia por chat y videollamada",
  description:
    "Prueba una experiencia +18 con personajes IA ficticios. Chat, voz y videollamada simulada. Sin registro y sin anuncios.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-bg text-ink antialiased">
        <AnimatedBackground />
        <AgeGate>{children}</AgeGate>
      </body>
    </html>
  );
}
