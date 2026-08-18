"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getHistory, clearHistory, getHistoryForGirl, HistoryEntry } from "@/lib/memory";
import { getCustomGirls, CustomGirlData } from "@/lib/storage";
import { getGirlImage } from "@/lib/images";
import { girls } from "@/data/girls";

interface GirlRow {
  girlId: string;
  name: string;
  img: string | null;
  href: string;
  lastTs: number;
  lastPreview: string;
}

export default function HistoryPage() {
  const [rows, setRows] = useState<GirlRow[]>([]);
  const [customGirls, setCustomGirls] = useState<CustomGirlData[]>([]);
  const [selected, setSelected] = useState<GirlRow | null>(null);
  const [session, setSession] = useState<HistoryEntry | null>(null);
  const [sessions, setSessions] = useState<HistoryEntry[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const customs = getCustomGirls();
    setCustomGirls(customs);

    const entries = getHistory();
    const byGirl = new Map<string, { ts: number; preview: string }>();
    for (const e of entries) {
      const prev = byGirl.get(e.girlId);
      if (!prev || e.timestamp > prev.ts) byGirl.set(e.girlId, { ts: e.timestamp, preview: e.preview });
    }

    const customIds = new Set(customs.map((g) => g.id));
    const customRows: GirlRow[] = customs.map((g) => ({
      girlId: g.id,
      name: g.name,
      img: g.imageUrl || getGirlImage(g.baseId || "luna", g.hair, g.pose, g.background),
      href: `/chat/luna?custom=${g.id}`,
      lastTs: byGirl.get(g.id)?.ts ?? 0,
      lastPreview: byGirl.get(g.id)?.preview ?? "",
    }));

    const otherRows: GirlRow[] = [];
    for (const [girlId, info] of byGirl) {
      if (customIds.has(girlId)) continue;
      const built = girls.find((g) => g.id === girlId);
      if (!built) continue;
      otherRows.push({
        girlId,
        name: built.name,
        img: getGirlImage(built.id, null, null, null, built.cloudinaryImage),
        href: `/chat/${girlId}`,
        lastTs: info.ts,
        lastPreview: info.preview,
      });
    }
    otherRows.sort((a, b) => b.lastTs - a.lastTs);

    const allRows = [...customRows, ...otherRows];
    setRows(allRows);

    const params = new URLSearchParams(window.location.search);
    const preselect = params.get("custom") || params.get("girl");
    if (preselect) {
      const row = allRows.find((r) => r.girlId === preselect);
      if (row) openGirl(row);
    }
  }, []);

  function openGirl(row: GirlRow) {
    setSession(null);
    setSelected(row);
    setSessions(getHistoryForGirl(row.girlId));
  }

  function handleClear() {
    clearHistory();
    setRows((rs) => rs.map((r) => ({ ...r, lastTs: 0, lastPreview: "" })));
    setSessions([]);
    setConfirmClear(false);
  }

  function formatDate(ts: number) {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl overflow-x-hidden px-4 pb-24 pt-6 sm:px-5 sm:py-20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Historial</h1>
            <p className="mt-1.5 text-sm text-muted/70">
              {session
                ? `Conversación con ${session.girlName}`
                : selected
                  ? `Conversaciones con ${selected.name}`
                  : "Toca una chica para ver solo su historial"}
            </p>
          </div>
          {!selected && !session && rows.some((r) => r.lastTs > 0) && (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs text-muted transition-all hover:bg-[#ff2f78]/15 hover:text-white active:scale-95"
              aria-label="Limpiar historial"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M10 11v6M14 11v6" />
              </svg>
              Limpiar
            </button>
          )}
        </div>

        {session ? (
          <div className="flex min-h-[50dvh] flex-col">
            <button
              onClick={() => setSession(null)}
              className="mb-4 flex w-fit items-center gap-1.5 rounded-full bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/[0.1] hover:text-white active:scale-95"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Volver
            </button>

            <div className="flex flex-col gap-3 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-4">
              {session.messages.length === 0 && (
                <p className="py-6 text-center text-sm text-white/40">Conversación vacía</p>
              )}
              {session.messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-md bg-gradient-to-r from-[#ff2f78] to-[#ff4c91] text-white"
                        : "rounded-bl-md bg-white/[0.08] text-white/85"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            {selected && (
              <Link href={selected.href} className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-xl gradient-btn px-6 py-3 text-sm font-semibold shadow-lg shadow-pink-500/25">
                Chatear con {selected.name}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
              </Link>
            )}
          </div>
        ) : selected ? (
          <div className="flex min-h-[50dvh] flex-col">
            <button
              onClick={() => { setSelected(null); setSessions([]); }}
              className="mb-4 flex w-fit items-center gap-1.5 rounded-full bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/[0.1] hover:text-white active:scale-95"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Volver
            </button>

            {sessions.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl glass">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 text-muted/50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" /></svg>
                </div>
                <p className="text-lg font-semibold tracking-tight">Aún no hay conversación</p>
                <Link href={selected.href} className="mt-8 rounded-xl gradient-btn px-6 py-3 text-sm font-semibold shadow-lg shadow-pink-500/25">
                  Empezar a chatear con {selected.name}
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSession(s)}
                    className="flex w-full items-center gap-3.5 rounded-2xl px-2 py-3 text-left transition hover:bg-white/[0.04] active:scale-[0.99]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-white/40"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" /></svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{s.preview}</p>
                      <p className="mt-0.5 text-[11px] text-white/35">{formatDate(s.timestamp)}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-white/25"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl glass">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-muted/50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" /></svg>
            </div>
            <p className="text-lg font-semibold tracking-tight">No hay historial</p>
            <p className="mt-2 text-sm text-muted/70 max-w-xs">
              Las conversaciones aparecerán aquí cuando cuelgues una llamada o salgas de un chat.
            </p>
            <Link href="/girls" className="mt-8 rounded-xl gradient-btn px-6 py-3 text-sm font-semibold shadow-lg shadow-pink-500/25">
              Ir a chicas IA
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {rows.map((r) => (
              <button
                key={r.girlId}
                onClick={() => openGirl(r)}
                className="flex w-full items-center gap-3.5 rounded-2xl px-2 py-2.5 text-left transition hover:bg-white/[0.04] active:scale-[0.99]"
              >
                <div className="h-[60px] w-[60px] shrink-0 overflow-hidden rounded-full border border-white/[0.09] bg-gradient-to-br from-[#ff5798]/30 to-[#8b5cf6]/25">
                  {r.img ? (
                    <img src={r.img} alt={r.name} className="h-full w-full object-cover object-center" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">{r.name[0]}</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[1.02rem] font-semibold leading-tight text-white">{r.name}</p>
                  <p className="mt-0.5 max-w-full truncate text-[13px] text-white/40">
                    {r.lastPreview || "Sin conversación todavía"}
                  </p>
                  {r.lastTs > 0 && (
                    <p className="mt-0.5 text-[10px] text-white/30">{formatDate(r.lastTs)}</p>
                  )}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-white/25"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            ))}
          </div>
        )}

        {/* Confirmación de borrado */}
        {confirmClear && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/80 px-6 backdrop-blur-md" onClick={() => setConfirmClear(false)}>
            <div className="my-auto w-full max-w-[340px] rounded-3xl border border-white/[0.08] bg-[#15151a]/95 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff2f78]/15 text-[#ff5f8f]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              </div>
              <h3 className="mt-4 text-lg font-bold tracking-tight text-white">Borrar todo el historial</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Se borrarán <span className="font-semibold text-white/80">para siempre</span> todas las conversaciones de este dispositivo. Esta acción no se puede deshacer.
              </p>
              <div className="mt-6 flex gap-2.5">
                <button onClick={() => setConfirmClear(false)} className="h-12 flex-1 rounded-2xl bg-white/[0.06] text-sm font-bold text-white/80 transition hover:bg-white/[0.1] active:scale-[0.98]">
                  Cancelar
                </button>
                <button onClick={handleClear} className="h-12 flex-[1.4] rounded-2xl bg-gradient-to-r from-[#ff2f78] to-[#ff4c91] text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.98]">
                  Borrar todo
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}