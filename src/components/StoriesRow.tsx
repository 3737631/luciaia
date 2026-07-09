"use client";

import { Plus } from "lucide-react";

const previewImages = [
  "/placeholder2.jpg", "/placeholder3.jpg", "/placeholder4.jpg",
  "/placeholder2.jpg", "/placeholder3.jpg", "/placeholder4.jpg",
  "/placeholder2.jpg", "/placeholder3.jpg",
];

export default function StoriesRow({ label = "Explorar personajes" }: { label?: string }) {
  return (
    <section className="container-nuvia" style={{ paddingTop: 10, paddingBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h3 style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em", margin: 0 }}>
          {label}
        </h3>
        <button className="btn-ghost" style={{ fontSize: "0.55rem", height: 22, padding: "0 8px" }}>
          Ver todos
        </button>
      </div>

      <div className="scrollbar-none" style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 2 }}>
        {/* Add story */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", flexShrink: 0 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            border: "1.5px dashed rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}>
            <Plus size={16} style={{ color: "var(--muted)" }} />
          </div>
          <span style={{ fontSize: "0.5rem", color: "var(--subdued)", whiteSpace: "nowrap" }}>Tu historia</span>
        </div>

        {previewImages.map((src, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", flexShrink: 0 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              padding: 1.5,
              background: "linear-gradient(135deg, #ff2d75, #ff5b6e, #ff2d75)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "var(--bg)" }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
            <span style={{ fontSize: "0.5rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
              {["Lucía", "Martina", "Valeria", "Camila", "Sofía", "Isabella", "Elena", "Gabriela"][i]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}