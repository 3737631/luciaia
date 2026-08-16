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

      <main style={{ minHeight: "100dvh", maxWidth: 480, margin: "0 auto", padding: "20px 16px 40px" }}>
        {/* Cabecera tipo bandeja */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Bandeja
            </h1>
            <p className="mt-0.5 text-xs text-white/40">
              {customGirls.length > 0
                ? `${customGirls.length} conversaciones`
                : "Conversaciones con tus creaciones"}
            </p>
          </div>
          <Link
            href="/girls"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.05] text-white/70 backdrop-blur-md transition hover:bg-white/[0.09] hover:text-white active:scale-95"
            title="Crear nueva"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          </Link>
        </div>

        <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

        {/* Lista de conversaciones */}
        <div className="mt-5">
          {customGirls.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/[0.07] bg-white/[0.04] px-6 py-16 text-center backdrop-blur-xl">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-pink-400/30 bg-gradient-to-br from-pink-500/20 to-purple-500/10 shadow-[0_0_40px_rgba(255,87,152,0.15)]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF5798" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white/85">Sin conversaciones todavía</p>
                <p className="mx-auto mt-1.5 max-w-[240px] text-xs leading-relaxed text-white/40">
                  Diseña tu chica ideal y aparecerá aquí como un mensaje nuevo.
                </p>
              </div>
              <Link
                href="/girls"
                className="mt-1 flex h-[50px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff2f78] to-[#ff4c91] text-sm font-bold text-white shadow-[0_10px_30px_rgba(255,47,120,0.25)] transition hover:brightness-110 active:scale-[0.98]"
              >
                Crear mi chica
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {customGirls.map((g) => {
                const imgSrc = g.imageUrl || getGirlImage(g.baseId || "luna", g.hair, g.pose, g.background);
                const lastMsg = g.story || g.girlDesc || "Hola 😊";
                return (
                  <div
                    key={g.id}
                    className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.04] backdrop-blur-xl transition hover:border-pink-400/25 hover:bg-white/[0.06]"
                  >
                    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-pink-500/10 blur-2xl" />
                    <Link
                      href={`/chat/luna?custom=${g.id}`}
                      onClick={() => openChat(g)}
                      className="relative flex items-center gap-4 p-3.5"
                    >
                      {/* Avatar con anillo de historia */}
                      <div className="relative shrink-0">
                        <div
                          className="rounded-full p-[2.5px]"
                          style={{ background: "conic-gradient(from 140deg, #ff2f78, #ffd166, #ff6aa5, #ff2f78)" }}
                        >
                          <div className="flex h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-full border-[3px] border-[#101014] bg-white/[0.06]">
                            <img src={imgSrc} alt={g.name} className="h-full w-full object-cover object-top" />
                          </div>
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-[#101014] bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[0.95rem] font-bold text-white">{g.name}</p>
                          <span className="text-xs font-semibold text-white/30">{g.age}</span>
                        </div>
                        <p className="mt-0.5 truncate text-[0.8rem] text-white/50">{lastMsg}</p>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className="rounded-full bg-gradient-to-r from-[#ff2f78] to-[#ff4c91] px-2 py-0.5 text-[0.6rem] font-extrabold text-white shadow-[0_2px_10px_rgba(255,47,120,0.4)]">
                          ahora
                        </span>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>
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
