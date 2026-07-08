import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "@/components/AnimatedBackground";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

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
      <body className={`${jakarta.className} min-h-screen bg-bg text-ink antialiased`}>
        <script dangerouslySetInnerHTML={{
          __html: `
(function(){
  try { if (localStorage.getItem("lunacall_age_accepted") === "true") return; } catch(e) { return; }
  var base = location.pathname.match(/^\/[^/]+/)?.[0] || "";
  var p = location.pathname.replace(/\/+$/, "") || base || "/";
  var allowed = [base+"/age",base+"/terms",base+"/privacy",base+"/age-notice"];
  for (var i = 0; i < allowed.length; i++) {
    if (p === allowed[i]) return;
  }
  location.replace((base||"/")+"/age/");
})();
`
        }} />
        <AnimatedBackground />
        {children}
      </body>
    </html>
  );
}
