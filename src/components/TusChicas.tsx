"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getCustomGirls, deleteCustomGirl, saveCustomGirl, CustomGirlData } from "@/lib/storage";
import { getGirlImage } from "@/lib/images";

export default function TusChicas({
  open,
  onClose,
  onEdit,
}: {
  open: boolean;
  onClose: () => void;
  onEdit?: (g: CustomGirlData) => void;
}) {
  const [customGirls, setCustomGirls] = useState<CustomGirlData[]>([]);
  const [editing, setEditing] = useState<CustomGirlData | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
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

  function handleSave() {
    if (!editing) return;
    const updated = {
      ...editing,
      name: editing.name.trim() || editing.name,
      description: editing.girlDesc.trim() || editing.description,
    };
    saveCustomGirl(updated);
    refresh();
    setEditing(null);
  }

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
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.08] text-white/70 backdrop-blur transition hover:bg-white/[0.14] hover:text-white active:scale-90"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Contenido */}
              <div className="p-2.5">
                {customGirls.length === 0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05] text-white/45">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/80">Aún no tienes chicas creadas</p>
                      <p className="mx-auto mt-1 max-w-[210px] text-xs leading-relaxed text-white/40">
                        Diseña tu chica ideal y aparecerá aquí.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-1 flex h-[44px] w-full max-w-[240px] items-center justify-center rounded-xl bg-gradient-to-r from-[#ff2f78] to-[#ff4c91] text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.99]"
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
                            className="flex items-center gap-3 rounded-2xl px-2.5 py-2.5 pr-24 transition hover:bg-white/[0.05] active:scale-[0.99]"
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

                          {/* Botón menú (editar/eliminar) */}
                          <button
                            onClick={() => setMenuId(menuId === g.id ? null : g.id)}
                            className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.08] text-white/60 backdrop-blur transition hover:bg-white/[0.14] hover:text-white active:scale-90"
                            title="Opciones"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>
                          </button>

                          {menuId === g.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setMenuId(null)} />
                              <div className="absolute right-2 top-1/2 z-20 flex -translate-y-1/2 items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#1c1c22]/95 p-1.5 shadow-2xl backdrop-blur-xl">
                                <button
                                  onClick={() => {
                                    setMenuId(null);
                                    onEdit?.(g);
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08] text-white/80 transition hover:bg-white/[0.16] hover:text-white active:scale-90"
                                  title="Editar"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                </button>
                                <button
                                  onClick={() => {
                                    deleteCustomGirl(g.id);
                                    setMenuId(null);
                                    refresh();
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/[0.14] text-red-300 transition hover:bg-red-500/[0.24] hover:text-red-200 active:scale-90"
                                  title="Eliminar"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Modal de edición */}
          {editing && (
            <>
              <motion.div
                className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditing(null)}
              />
              <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
                <motion.div
                  className="max-h-[85dvh] w-full max-w-[400px] overflow-y-auto overscroll-contain rounded-3xl border border-white/[0.08] bg-[#121216]/95 p-5 shadow-2xl backdrop-blur-xl"
                  style={{ WebkitOverflowScrolling: "touch" }}
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 12 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[0.95rem] font-bold tracking-tight text-white">Editar chica</h3>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      aria-label="Cerrar"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.08] text-white/70 backdrop-blur transition hover:bg-white/[0.14] hover:text-white active:scale-90"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/70">Nombre</label>
                      <input
                        value={editing.name}
                        maxLength={20}
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.06] px-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#FF5798]/40 focus:bg-white/[0.09]"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/70">Describe a tu chica</label>
                      <textarea
                        value={editing.girlDesc}
                        rows={2}
                        onChange={(e) => setEditing({ ...editing, girlDesc: e.target.value })}
                        placeholder="Ej: chica de pelo negro, uniforme blanco ajustado..."
                        className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.08] px-3.5 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-white/[0.12] focus:bg-white/[0.11]"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/70">Roleplay</label>
                      <textarea
                        value={editing.roleplayDesc}
                        rows={2}
                        onChange={(e) => setEditing({ ...editing, roleplayDesc: e.target.value })}
                        placeholder="Ej: te duchas conmigo..."
                        className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.08] px-3.5 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-white/[0.12] focus:bg-white/[0.11]"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/70">Personalidad</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "carinosa", label: "Cariñosa" },
                          { value: "atrevida", label: "Atrevida" },
                          { value: "timida", label: "Tímida" },
                          { value: "dominante", label: "Dominante" },
                        ].map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setEditing({ ...editing, personality: p.value })}
                            className={`h-10 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${editing.personality === p.value ? "bg-gradient-to-r from-[#ff2f78] to-[#ff4c91] text-white" : "bg-white/[0.05] text-white/60 hover:bg-white/[0.09] hover:text-white"}`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSave}
                      className="h-12 w-full rounded-xl bg-gradient-to-r from-[#ff2f78] to-[#ff4c91] text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.99]"
                    >
                      Guardar cambios
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        deleteCustomGirl(editing.id);
                        refresh();
                        setEditing(null);
                      }}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 active:scale-[0.99]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      Eliminar a {editing.name}
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </>
      )}
    </AnimatePresence>
  );
}