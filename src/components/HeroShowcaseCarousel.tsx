"use client";

import { ChevronRight } from "lucide-react";

export default function HeroShowcaseCarousel() {
  return (
    <section className="container-nuvia" style={{ paddingTop: 24, paddingBottom: 0 }}>
      <div style={{
        background: "linear-gradient(135deg, #0d0d12 0%, #1a0a14 50%, #0f0d12 100%)",
        borderRadius: "var(--radius-xl)",
        border: "0.5px solid rgba(255,45,117,0.1)",
        overflow: "hidden",
        position: "relative",
        height: 200,
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(255,45,117,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", alignItems: "center", height: "100%", padding: "0 20px", gap: 16 }}>
          {/* Left - Text */}
          <div style={{ flex: "1 1 55%", display: "flex", flexDirection: "column", gap: 6, zIndex: 2 }}>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              <span className="pill-tag">Gratis</span>
              <span className="pill-tag">Sin tarjeta</span>
              <span className="pill-tag" style={{ borderColor: "rgba(255,45,117,0.3)", color: "var(--pink)" }}>IA personalizable</span>
            </div>

            <h2 style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              margin: 0,
              color: "var(--text)",
            }}>
              Tu universo de<span style={{ display: "block" }}>conexiones con IA</span>
            </h2>

            <p style={{ fontSize: "0.6rem", color: "var(--muted)", lineHeight: 1.4, margin: 0 }}>
              Lorem ipsum dolor sit amet consectetur. Arcu cras praesent aliquet leo.
            </p>

            <button className="btn-pill" style={{ alignSelf: "flex-start", gap: 2 }}>
              Explorar <ChevronRight size={10} />
            </button>
          </div>

          {/* Right - Avatars collage */}
          <div style={{ flex: "0 0 auto", position: "relative", width: 110, height: 150 }}>
            <div style={{
              position: "absolute", top: 10, left: 16, width: 52, height: 52, borderRadius: "50%",
              overflow: "hidden", border: "2px solid rgba(255,45,117,0.3)", boxShadow: "0 0 20px rgba(255,45,117,0.15)",
            }}>
              <img src="/placeholder2.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{
              position: "absolute", top: 34, left: 40, width: 56, height: 56, borderRadius: "50%",
              overflow: "hidden", border: "2px solid rgba(255,45,117,0.2)", boxShadow: "0 0 20px rgba(255,45,117,0.08)",
            }}>
              <img src="/placeholder3.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{
              position: "absolute", top: 66, left: 16, width: 48, height: 48, borderRadius: "50%",
              overflow: "hidden", border: "2px solid rgba(255,45,117,0.2)",
            }}>
              <img src="/placeholder4.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .pill-tag {
          display: inline-flex;
          align-items: center;
          font-size: 0.5rem;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 999px;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.1);
          color: var(--muted);
          letter-spacing: -0.01em;
          line-height: 1.4;
        }
      `}</style>
    </section>
  );
}