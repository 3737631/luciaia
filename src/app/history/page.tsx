"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getHistory, clearHistory, clearGirlData, getConversationHistory, isGirlPinned, togglePinGirl, getPinnedGirls } from "@/lib/memory";
import { getCustomGirls } from "@/lib/storage";
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
  return (
    <Suspense fallback={null}>
      <HistoryContent />
    </Suspense>
  );
}

function HistoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [rows, setRows] = useState<GirlRow[]>([]);
  const [single, setSingle] = useState<GirlRow | null>(null);
  const [singleLast, setSingleLast] = useState("");
  const [singleSessions, setSingleSessions] = useState<{ id: string; ts: number; preview: string }[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [deleteRow, setDeleteRow] = useState<GirlRow | null>(null);
  const [menuRow, setMenuRow] = useState<GirlRow | null>(null);

  useEffect(() => {
    const customId = searchParams.get("custom");
    const girlId = searchParams.get("girl");
    setSingleSessions([]);

    if (customId) {
      const g = getCustomGirls().find((x) => x.id === customId);
      if (g) {
        setSingle({
          girlId: g.id,
          name: g.name,
          img: g.imageUrl || getGirlImage(g.baseId || "luna", g.hair, g.pose, g.background),
          href: `/chat/luna?custom=${g.id}`,
          lastTs: 0,
          lastPreview: "",
        });
        setSingleLast(lastMessage(g.id));
        setSingleSessions(girlSessions(g.id));
        return;
      }
    }
    if (girlId) {
      const girl = girls.find((g) => g.id === girlId);
      if (girl) {
        setSingle({
          girlId: girl.id,
          name: girl.name,
          img: getGirlImage(girl.id, null, null, null, girl.cloudinaryImage),
          href: `/chat/${girl.id}`,
          lastTs: 0,
          lastPreview: "",
        });
        setSingleLast(lastMessage(girl.id));
        setSingleSessions(girlSessions(girl.id));
        return;
      }
    }

    const customs = getCustomGirls();

    const entries = getHistory();
    const byGirl = new Map<string, { ts: number; preview: string }>();
    for (const e of entries) {
      const prev = byGirl.get(e.girlId);
      if (!prev || e.timestamp > prev.ts) byGirl.set(e.girlId, { ts: e.timestamp, preview: e.preview });
    }

    const customRows: GirlRow[] = [...customs]
      .reverse()
      .map((g) => {
        const saved = getConversationHistory(g.id);
        const info = byGirl.get(g.id);
        return {
          girlId: g.id,
          name: g.name,
          img: g.imageUrl || getGirlImage(g.baseId || "luna", g.hair, g.pose, g.background),
          href: `/chat/luna?custom=${g.id}`,
          lastTs: info?.ts ?? 0,
          lastPreview:
            info?.preview ??
            (saved.length > 0 ? saved[saved.length - 1].content.slice(0, 80) : ""),
        };
      });

    const otherRows: GirlRow[] = [];
    for (const girl of girls) {
      const info = byGirl.get(girl.id);
      const saved = getConversationHistory(girl.id);
      if (!info && saved.length === 0) continue;
      otherRows.push({
        girlId: girl.id,
        name: girl.name,
        img: getGirlImage(girl.id, null, null, null, girl.cloudinaryImage),
        href: `/chat/${girl.id}`,
        lastTs: info?.ts ?? 0,
        lastPreview:
          info?.preview ??
          (saved.length > 0 ? saved[saved.length - 1].content.slice(0, 80) : ""),
      });
    }
    otherRows.sort((a, b) => b.lastTs - a.lastTs);

    const all = [...customRows, ...otherRows]
      .filter((r) => r.lastTs > 0 || r.lastPreview)
      .sort((a, b) => {
        const pa = getPinnedGirls().includes(a.girlId) ? 1 : 0;
        const pb = getPinnedGirls().includes(b.girlId) ? 1 : 0;
        if (pa !== pb) return pb - pa;
        return b.lastTs - a.lastTs;
      });

    setRows(all);
  }, [searchParams]);

  function handleClear() {
    if (single) {
      clearGirlData(single.girlId);
      setSingleLast("");
      setSingleSessions([]);
    } else {
      clearHistory();
      for (const girl of girls) clearGirlData(girl.id);
      for (const g of getCustomGirls()) clearGirlData(g.id);
      setRows([]);
    }
    setConfirmClear(false);
  }

  function handleDeleteRow() {
    if (!deleteRow) return;
    clearGirlData(deleteRow.girlId);
    setRows((prev) => prev.filter((r) => r.girlId !== deleteRow.girlId));
    setDeleteRow(null);
  }

  function handlePinRow(r: GirlRow) {
    togglePinGirl(r.girlId);
    setRows((prev) =>
      [...prev].sort((a, b) => {
        const pa = getPinnedGirls().includes(a.girlId) ? 1 : 0;
        const pb = getPinnedGirls().includes(b.girlId) ? 1 : 0;
        if (pa !== pb) return pb - pa;
        return b.lastTs - a.lastTs;
      }),
    );
    setMenuRow(null);
  }

  function girlSessions(girlId: string) {
    return getHistory()
      .filter((e) => e.girlId === girlId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((e) => ({ id: e.id, ts: e.timestamp, preview: e.preview }));
  }

  function lastMessage(girlId: string): string {
    const msgs = getConversationHistory(girlId);
    if (msgs.length === 0) return "";
    const last = msgs[msgs.length - 1];
    return (last.role === "user" ? "Tú: " : "") + last.content.slice(0, 80);
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
      <main className="mx-auto max-w-3xl overflow-x-hidden px-4 pb-10 pt-8 sm:px-5 sm:py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">
              {single ? `Historial con ${single.name}` : "Historial"}
            </h1>
            <p className="mt-1.5 text-sm text-muted/70">
              {single
                ? "Todas las veces que has hablado con ella, en orden."
                : "Tus conversaciones con cada chica."}
            </p>
          </div>
          {!single && (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-muted transition-all hover:bg-[#ff2f78]/15 hover:text-white active:scale-95"
              aria-label="Borrar todos tus mensajes"
              title="Borrar todos tus mensajes"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          )}
        </div>

        {single ? (
          <div className="flex min-h-[50dvh] flex-col">
            <div className="mb-4 flex items-center gap-2">
              <button
                onClick={() => { if (window.history.length > 1) router.back(); else router.push("/history"); }}
                className="flex w-fit items-center gap-1.5 rounded-full bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/[0.1] hover:text-white active:scale-95"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                Volver
              </button>
              <button
                onClick={() => setConfirmClear(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-white/60 transition hover:bg-[#ff2f78]/15 hover:text-white active:scale-95"
                aria-label="Limpiar historial"
                title="Limpiar historial"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </button>
            </div>

            <div className="space-y-1">
              {singleSessions.length === 0 ? (
                <p className="py-10 text-center text-sm text-white/35">No hay conversaciones con {single.name} todavía.</p>
              ) : (
                singleSessions.map((s) => (
                  <Link
                    key={s.id}
                    href={single.href}
                    className="flex w-full items-center gap-3.5 rounded-2xl px-2 py-2.5 text-left transition hover:bg-white/[0.04] active:scale-[0.99]"
                  >
                    <div className="h-[62px] w-[62px] shrink-0 overflow-hidden rounded-full bg-[#ff2f78]">
                      {single.img ? (
                        <img src={single.img} alt={single.name} className="h-full w-full object-cover object-center" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">{single.name[0]}</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-[1.02rem] font-semibold leading-tight text-white">{single.name}</p>
                        <p className="shrink-0 text-[10px] text-white/30">{formatDate(s.ts)}</p>
                      </div>
                      <p className="mt-0.5 max-w-full truncate text-[13px] text-white/40">{s.preview || "Conversación"}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-white/25"><path d="M9 18l6-6-6-6" /></svg>
                  </Link>
                ))
              )}
            </div>

            <div className="mt-auto pb-2">
              <Link
                href={`${single.href}${single.href.includes("?") ? "&" : "?"}picker=1`}
                className="flex w-full items-center gap-3.5 px-2 py-2.5 text-left"
              >
                <div className="h-[62px] w-[62px] shrink-0 overflow-hidden rounded-full bg-[#ff2f78]">
                  {single.img ? (
                    <img src={single.img} alt={single.name} className="h-full w-full object-cover object-center" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">{single.name[0]}</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[1.02rem] font-semibold leading-tight text-white">{single.name}</p>
                  <p className="mt-0.5 max-w-full truncate text-[13px] text-white/40">
                    {singleLast || "Chatear"}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        ) : rows.length === 0 ? null : (
          <div className="space-y-1">
            {rows.map((r) => (
              <div key={r.girlId} className="group relative flex items-center">
                <Link
                  href={r.href}
                  className="flex w-full items-center gap-3.5 rounded-2xl px-2 py-2.5 pr-14 text-left transition hover:bg-white/[0.04] active:scale-[0.99]"
                >
                  <div className="relative h-[62px] w-[62px] shrink-0 overflow-hidden rounded-full bg-[#ff2f78]">
                    {isGirlPinned(r.girlId) && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: -1,
                          right: -1,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "#121212",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 2,
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="#ff2f78" stroke="#ff2f78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
                      </span>
                    )}
                    {r.img && (
                      <img src={r.img} alt={r.name} className="absolute inset-0 h-full w-full object-cover object-center"
                        onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    )}
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">{r.name[0]}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-[1.02rem] font-semibold leading-tight text-white">{r.name}</p>
                      {r.lastTs > 0 && (
                        <p className="shrink-0 text-[10px] text-white/30">{formatDate(r.lastTs)}</p>
                      )}
                    </div>
                    <p className="mt-0.5 max-w-full truncate text-[13px] text-white/40">
                      {r.lastPreview || "Conversación"}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-white/25"><path d="M9 18l6-6-6-6" /></svg>
                </Link>
                <button
                  onClick={() => setMenuRow(r)}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[1.15rem] font-semibold leading-none tracking-widest text-white/45 transition hover:bg-white/[0.07] hover:text-white active:scale-90"
                  aria-label={`Opciones de ${r.name}`}
                  title="Opciones"
                  style={{ paddingLeft: 4, paddingRight: 2 }}
                >
                  ···
                </button>
              </div>
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
              <h3 className="mt-4 text-lg font-bold tracking-tight text-white">
                {single ? `Borrar conversación con ${single.name}` : "Borrar todos tus mensajes"}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {single ? (
                  <>
                    Se borrará <span className="font-semibold text-white/80">para siempre</span> la conversación con {single.name} y nunca volverá a aparecer. Esta acción no se puede deshacer.
                  </>
                ) : (
                  <>
                    Se borrarán <span className="font-semibold text-white/80">para siempre</span> todas las conversaciones de este dispositivo y nunca volverán a aparecer. Esta acción no se puede deshacer.
                  </>
                )}
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

        {/* Confirmación de borrado de una sola chica */}
        {deleteRow && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/80 px-6 backdrop-blur-md" onClick={() => setDeleteRow(null)}>
            <div className="my-auto w-full max-w-[340px] rounded-3xl border border-white/[0.08] bg-[#15151a]/95 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff2f78]/15 text-[#ff5f8f]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              </div>
              <h3 className="mt-4 text-lg font-bold tracking-tight text-white">Borrar conversación con {deleteRow.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Se borrará <span className="font-semibold text-white/80">para siempre</span> la conversación con {deleteRow.name} y nunca volverá a aparecer. Esta acción no se puede deshacer.
              </p>
              <div className="mt-6 flex gap-2.5">
                <button onClick={() => setDeleteRow(null)} className="h-12 flex-1 rounded-2xl bg-white/[0.06] text-sm font-bold text-white/80 transition hover:bg-white/[0.1] active:scale-[0.98]">
                  Cancelar
                </button>
                <button onClick={handleDeleteRow} className="h-12 flex-[1.4] rounded-2xl bg-gradient-to-r from-[#ff2f78] to-[#ff4c91] text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.98]">
                  Borrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Menú de opciones (···) */}
        {menuRow && (
          <>
            <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md" onClick={() => setMenuRow(null)} />
            <div className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-6">
              <div className="w-full max-w-[400px] overflow-hidden rounded-[1.8rem] border border-white/[0.08] bg-[#15151a]/95 shadow-[0_-20px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                <div className="flex items-center gap-3 px-5 pb-2 pt-5">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#ff2f78]">
                    {menuRow.img && (
                      <img src={menuRow.img} alt={menuRow.name} className="absolute inset-0 h-full w-full object-cover object-center" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    )}
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">{menuRow.name[0]}</div>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[0.95rem] font-bold leading-tight text-white">{menuRow.name}</p>
                    <p className="text-xs text-white/40">Opciones de conversación</p>
                  </div>
                </div>
                <div className="p-2.5">
                  <button
                    onClick={() => handlePinRow(menuRow)}
                    className="flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-3.5 text-left transition hover:bg-white/[0.06] active:scale-[0.985] active:bg-white/[0.09]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff2f78]/20 to-[#ff4c91]/10 text-[#ff5798]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{isGirlPinned(menuRow.girlId) ? "Desfijar chat" : "Fijar chat"}</span>
                      <span className="block text-xs text-white/40">{isGirlPinned(menuRow.girlId) ? "Dejará de aparecer arriba" : "Siempre aparecerá arriba"}</span>
                    </span>
                  </button>
                  <div className="mx-4 h-px bg-white/[0.06]" />
                  <button
                    onClick={() => { setDeleteRow(menuRow); setMenuRow(null); }}
                    className="flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-3.5 text-left transition hover:bg-[#ff2f78]/[0.08] active:scale-[0.985] active:bg-[#ff2f78]/[0.14]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff2f78]/15 text-[#ff5f8f]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#ff5f8f]">Borrar conversación</span>
                      <span className="block text-xs text-white/40">Se borrará para siempre</span>
                    </span>
                  </button>
                </div>
                <div className="p-2.5 pt-0">
                  <button onClick={() => setMenuRow(null)} className="flex h-12 w-full items-center justify-center rounded-2xl bg-white/[0.05] text-sm font-bold text-white/80 transition hover:bg-white/[0.09] active:scale-[0.985]">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}