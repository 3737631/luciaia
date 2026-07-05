import type { Metadata } from "next";
import "./globals.css";
import AnimatedBackground from "@/components/AnimatedBackground";

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
        <script dangerouslySetInnerHTML={{
          __html: `
(function(){
  try { if (localStorage.getItem("lunacall_age_accepted") === "true") return; } catch(e) { return; }
  var raw = location.pathname;
  var p = raw.replace(/\\/+$/, "") || "/";
  var allowed = ["/age","/terms","/privacy","/age-notice"];
  for (var i = 0; i < allowed.length; i++) {
    if (p === allowed[i] || p.endsWith(allowed[i])) return;
  }
  var s = p.indexOf("/", 1);
  var base = s > 0 ? p.substring(0, s) : "";
  var target = base + "/age/";
  if (raw.replace(/\\/+$/, "") !== target.replace(/\\/+$/, "")) {
    location.replace(target);
  }
})();
`
        }} />
        <AnimatedBackground />
        {children}
      </body>
    </html>
  );
}
