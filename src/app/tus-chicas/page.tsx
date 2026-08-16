"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { getCustomGirls, CustomGirlData, deleteCustomGirl } from "@/lib/storage";
import { getGirlImage } from "@/lib/images";

export default function TusChicasPage() {
  const [customGirls, setCustomGirls] = useState<CustomGirlData[]>([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setCustomGirls(getCustomGirls());
  }, [version]);

  function refresh() {
    setVersion((v) => v + 1);
  }

  function openChat(g: CustomGirlData) {
    localStorage.setItem(
      "custom_scenario",
      JSON.stringify({ girl: g.girlDesc, roleplay: g.roleplayDesc }),
    );
  }

  return (
    <>
      <Header />

      <main style={{ minHeight: "100dvh", maxWidth: 480, margin: "0 auto", padding: "24px 16px 40px" }}>
        {/* Header estilo "Diseña tu chica ideal" */}
        <div>
          <h3 className="text-[1.4rem] font-bold leading-tight tracking-tight text-white">
            Tus chicas
          </h3>
          <p className="mt-1 text-xs text-white/40">Mensajes privados con tus creaciones</p>
        </div>

        <div className="mt-5 h-0.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full"
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #FF5798, #FF6AA5)",
            }}
          />
        </div>

        {/* Lista DM de Instagram */}
        <div className="mt-6">
          {customGirls.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.04] px-6 py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ff2f78] to-[#ff6aa5]/50 text-2xl font-black text-white">
                ✦
              </div>
              <p className="text-sm font-semibold text-white/80">Aún no tienes chicas creadas</p>
              <p className="text-xs text-white/40">
                Diseña tu chica ideal y aparecerá aquí en tu bandeja de mensajes.
              </p>
              <Link
                href="/girls"
                className="mt-2 flex h-[48px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff2f78] to-[#ff4c91] text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.99]"
              >
                Crear mi chica →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {customGirls.map((g) => {
                const imgSrc = g.imageUrl || getGirlImage(g.baseId || "luna", g.hair, g.pose, g.background);
                const lastMsg = g.story || g.girlDesc || "Hola 😊";
                return (
                  <div key={g.id} className="group relative">
                    <Link
                      href={`/chat/luna?custom=${g.id}`}
                      onClick={() => openChat(g)}
                      className="flex items-center gap-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3 transition hover:bg-white/[0.07] active:scale-[0.99]"
                    >
                      {/* Avatar circular tipo DM */}
                      <div className="relative shrink-0 rounded-full p-[2px]"
                        style={{ background: "linear-gradient(135deg, #ff2f78, #ff6aa5, #ffd166)" }}>
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-[#141416] bg-white/[0.06]">
                          <img
                            src={imgSrc}
                            alt={g.name}
                            className="h-full w-full object-cover object-top"
                          />
                        </div>
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#141416] bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                      </div>

                      {/* Texto DM */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-[0.95rem] font-bold text-white">
                            {g.name} <span className="font-semibold text-white/60">{g.age}</span>
                          </p>
                          <span className="shrink-0 rounded-full bg-[#ff2f78] px-1.5 py-0.5 text-[0.55rem] font-bold text-white">1</span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-white/45">{lastMsg}</p>
                        <p className="mt-0.5 text-[0.6rem] uppercase tracking-wide text-white/25">Online • Nuvia IA</p>
                      </div>

                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Link>

                    <button
                      onClick={() => {
                        deleteCustomGirl(g.id);
                        refresh();
                      }}
                      className="absolute right-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-red-600/90 text-white shadow-lg transition hover:bg-red-500 group-hover:flex active:scale-90"
                      title="Eliminar"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
