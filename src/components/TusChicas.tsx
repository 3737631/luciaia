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
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div
              ref={scrollRef}
              className="max-h-[80dvh] w-full max-w-[400px] overflow-y-auto overscroll-contain rounded-3xl border border-white/[0.08] bg-[#121216]/95 shadow-2xl backdrop-blur-xl"
              style={{ WebkitOverflowScrolling: "touch" }}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Cabecera mínima */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <h3 className="text-[0.95rem] font-bold tracking-tight text-white">
                  Tus chicas
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-white/60 transition hover:bg-white/[0.1] hover:text-white active:scale-95"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Contenido */}
              <div className="p-2.5">
                {customGirls.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.05] text-white/50">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    </div>
                    <p className="text-sm font-semibold text-white/80">Aún no tienes chicas creadas</p>
                    <p className="max-w-[220px] text-xs leading-relaxed text-white/40">
                      Diseña tu chica ideal y aparecerá aquí.
                    </p>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-1 flex h-[44px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff2f78] to-[#ff4c91] text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.99]"
                    >
                      Crear mi chica
                    </button>
                  </div>
                ) : (
                  <div>
                    {customGirls.map((g) => {
                      const imgSrc = g.imageUrl || getGirlImage(g.baseId || "luna", g.hair, g.pose, g.background);
                      const lastMsg = g.story || g.girlDesc || "Hola 😊";
                      return (
                        <div key={g.id} className="group relative">
                          <Link
                            href={`/chat/luna?custom=${g.id}`}
                            onClick={() => openChat(g)}
                            className="flex items-center gap-3 rounded-2xl px-2.5 py-2.5 transition hover:bg-white/[0.05] active:scale-[0.99]"
                          >
                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.05]">
                              <img src={imgSrc} alt={g.name} className="h-full w-full object-cover object-top" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-[0.9rem] font-semibold text-white">
                                  {g.name}
                                </p>
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                              </div>
                              <p className="mt-0.5 truncate text-xs text-white/40">{lastMsg}</p>
                            </div>
                          </Link>

                          <button
                            onClick={() => {
                              deleteCustomGirl(g.id);
                              refresh();
                            }}
                            className="absolute right-3 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-red-600/90 text-white shadow-lg transition hover:bg-red-500 group-hover:flex active:scale-90"
                            title="Eliminar"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}