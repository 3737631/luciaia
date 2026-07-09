import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "@/components/AnimatedBackground";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "NuviaChat — Chica IA ficticia por chat y videollamada",
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
      <body className={`${inter.className} min-h-screen bg-bg text-ink antialiased`}>
        <AnimatedBackground />
        {children}
      </body>
    </html>
  );
}