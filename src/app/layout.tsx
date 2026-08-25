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
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var V="v1440-6";try{var cur=localStorage.getItem("app_version_v2");if(cur!==V){if('caches' in window){caches.keys().then(function(n){n.forEach(function(c){caches.delete(c)})})}try{sessionStorage.clear()}catch(e){}localStorage.setItem("app_version_v2",V);if(cur!==null) location.reload()}var last=localStorage.getItem("last_cache_clear");var now=Date.now();if(!last||now-parseInt(last,10)>86400000){localStorage.setItem("last_cache_clear",String(now));if('caches' in window){caches.keys().then(function(n){n.forEach(function(c){caches.delete(c)})})}}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${jakarta.className} min-h-screen bg-bg text-ink antialiased`}>
        <ErrorBoundary>
          <AnimatedBackground />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
