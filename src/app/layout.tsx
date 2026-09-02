import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "@/components/AnimatedBackground";
import ErrorBoundary from "@/components/ErrorBoundary";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "NuviaChat — Chatea y llama con tus personajes",
  description:
    "Experiencia +18 de compañía. Chat, voz y videollamada simulada. Sin registro y sin anuncios.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${jakarta.className} min-h-screen bg-bg text-ink antialiased`}>
        <ErrorBoundary>
          <AnimatedBackground />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
