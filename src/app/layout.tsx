import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "@/components/AnimatedBackground";
import BottomNav from "@/components/BottomNav";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

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
      <body
        className={`${inter.className} min-h-screen antialiased`}
        style={{ background: "#000000", color: "#FFFFFF" }}
      >
        {children}
        <BottomNav />
      </body>
    </html>
  );
}