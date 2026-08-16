"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getCustomGirls, deleteCustomGirl, CustomGirlData } from "@/lib/storage";
import { getGirlImage } from "@/lib/images";

export default function TusChicas({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [customGirls, setCustomGirls] = useState<CustomGirlData[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCustomGirls(getCustomGirls());
  }, [open]);

  function refresh() {
    setCustomGirls(getCustomGirls());
  }

  function openChat(g: CustomGirlData) {
    localStorage.setItem(
      "custom_scenario",
      JSON.stringify({ girl: g.girlDesc, roleplay: g.roleplayDesc }),
    );
    onClose();
  }

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo(0, 0);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={scrollRef}
            className="fixed left-0 right-0 top-0 z-50 h-[100dvh] overflow-y-auto overscroll-contain"
            style={{ WebkitOverflowScrolling: "touch" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="mx-auto w-full max-w-[480px] px-5 pb-32 pt-10 sm:pt-16"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {/* Header idéntico al modal */}
              <div>
                <h3 className="text-[1.4rem] font-bold leading-tight tracking-tight text-white">
                  Tus chicas
                </h3>
                <p className="mt-1 text-xs text-white/40">
                  {customGirls.length > 0
                    ? `${customGirls.length} ${customGirls.length === 1 ? "conversación" : "conversaciones"}`
                    : "Conversaciones con tus creaciones"}
                </p>
              </div>

              {/* Línea de progreso del modal */}
              <div className="mt-5 h-0.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full"
                  style={{ width: "100%", background: "linear-gradient(135deg, #FF5798, #FF6AA5)" }}
                />
              </div>

              {/* Lista de conversaciones */}
              <div className="mt-6">
                {customGirls.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.04] px-6 py-14 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.06] text-white/60">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    </div>
                    <p className="text-sm font-semibold text-white/80">Aún no tienes chicas creadas</p>
                    <p className="text-xs text-white/40">
                      Diseña tu chica ideal y aparecerá aquí en tu bandeja de mensajes.
                    </p>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-2 flex h-[48px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff2f78] to-[#ff4c91] text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.99]"
                    >
                      Crear mi chica →
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
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
                            {/* Avatar circular */}
                            <div className="relative shrink-0 rounded-full p-[2px]"
                              style={{ background: "linear-gradient(135deg, #ff2f78, #ff6aa5, #ffd166)" }}>
                              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-black/50 bg-white/[0.06]">
                                <img
                                  src={imgSrc}
                                  alt={g.name}
                                  className="h-full w-full object-cover object-top"
                                />
                              </div>
                              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-black/50 bg-green-400" />
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
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
