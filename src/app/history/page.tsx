"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { getHistory, clearHistory, clearGirlData, getConversationHistory, isGirlPinned, togglePinGirl, getPinnedGirls, isSessionPinned, togglePinSession, deleteHistoryEntry } from "@/lib/memory";
import { getCustomGirls } from "@/lib/storage";
import { getGirlImage } from "@/lib/images";
import { goBack } from "@/lib/nav";
import { isDebugMode, getShowSessionIds, setShowSessionIds, onShowSessionIdsChange, sessionShortId } from "@/lib/debug";
import { girls } from "@/data/girls";

interface GirlRow {
  girlId: string;
  name: string;
  img: string | null;
  href: string;
  lastTs: number;
  lastPreview: string;
  sessionId?: string;
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
  const debug = isDebugMode();
  const [showSessionIds, setShowSessionIdsState] = useState(() => getShowSessionIds());

  useEffect(() => {
    return onShowSessionIdsChange(() => setShowSessionIdsState(getShowSessionIds()));
  }, []);

  const showNum = debug || showSessionIds;
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

    const girlInfo = new Map<string, { img: string | null; href: string; name: string }>();
    for (const girl of girls) {
      girlInfo.set(girl.id, {
        img: getGirlImage(girl.id, null, null, null, girl.cloudinaryImage),
        href: `/chat/${girl.id}?picker=1`,
        name: girl.name,
      });
    }
    for (const g of customs) {
      girlInfo.set(g.id, {
        img: g.imageUrl || getGirlImage(g.baseId || "luna", g.hair, g.pose, g.background),
        href: `/chat/luna?custom=${g.id}&picker=1`,
        name: g.name,
      });
    }

    const entries = getHistory();
    const all: GirlRow[] = [];
    // Cada vez que entras y sales de un chat se crea una sesión: cada una sale
    // como una fila independiente (da igual que haya alguna fijada).
    for (const e of entries) {
      const info = girlInfo.get(e.girlId);
      if (!info) continue;
      all.push({
        girlId: e.girlId,
        name: e.girlName || girlInfo.get(e.girlId)?.name || e.girlId,
        img: info.img,
        href: info.href,
        lastTs: e.timestamp,
        lastPreview: e.preview,
        sessionId: e.id,
      });
    }

    // Chicas con conversación pero sin entrada aún (p. ej. reacciones sin abrir).
    const seen = new Set(entries.map((e) => e.girlId));
    for (const g of [...customs].reverse()) {
      if (seen.has(g.id)) continue;
      const saved = getConversationHistory(g.id);
      if (saved.length === 0) continue;
      const info = girlInfo.get(g.id)!;
      all.push({
        girlId: g.id,
        name: g.name,
        img: info.img,
        href: info.href,
        lastTs: 0,
        lastPreview: saved[saved.length - 1].content.slice(0, 80),
      });
    }
    for (const girl of girls) {
      if (seen.has(girl.id)) continue;
      const saved = getConversationHistory(girl.id);
      if ( saved.length === 0) continue;
      const info = girlInfo.get(girl.id)!;
      all.push({
        girlId: girl.id,
        name: girl.name,
        img: info.img,
        href: info.href,
        lastTs: 0,
        lastPreview: saved[saved.length - 1].content.slice(0, 80),
      });
    }

    all.sort((a, b) => {
      const pa = a.sessionId ? (isSessionPinned(a.sessionId) ? 1 : 0) : (isGirlPinned(a.girlId) ? 1 : 0);
      const pb = b.sessionId ? (isSessionPinned(b.sessionId) ? 1 : 0) : (isGirlPinned(b.girlId) ? 1 : 0);
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
    if (deleteRow.sessionId) {
      deleteHistoryEntry(deleteRow.sessionId);
      setRows((prev) => prev.filter((r) => r.sessionId !== deleteRow.sessionId));
      if (single && deleteRow.girlId === single.girlId) {
        setSingleSessions(girlSessions(single.girlId));
        setSingleLast(lastMessage(single.girlId));
      }
    } else {
      clearGirlData(deleteRow.girlId);
      setRows((prev) => prev.filter((r) => r.girlId !== deleteRow.girlId));
      if (single && deleteRow.girlId === single.girlId) {
        setSingle(null);
        setSingleSessions([]);
      }
    }
    setDeleteRow(null);
  }

  function pinScore(r: GirlRow) {
    if (r.sessionId) return isSessionPinned(r.sessionId) ? 1 : 0;
    return isGirlPinned(r.girlId) ? 1 : 0;
  }

  function handlePinRow(r: GirlRow) {
    if (r.sessionId) {
      togglePinSession(r.sessionId);
      setRows((prev) =>
        [...prev].sort((a, b) => {
          const pa = pinScore(a);
          const pb = pinScore(b);
          if (pa !== pb) return pb - pa;
          return b.lastTs - a.lastTs;
        }),
      );
      if (single) setSingleSessions(girlSessions(single.girlId));
    } else {
      togglePinGirl(r.girlId);
      setRows((prev) =>
        [...prev].sort((a, b) => {
          const pa = getPinnedGirls().includes(a.girlId) ? 1 : 0;
          const pb = getPinnedGirls().includes(b.girlId) ? 1 : 0;
          if (pa !== pb) return pb - pa;
          return b.lastTs - a.lastTs;
        }),
      );
    }
    setMenuRow(null);
  }

  function girlSessions(girlId: string) {
    return getHistory()
      .filter((e) => e.girlId === girlId)
      .sort((a, b) => {
        const pa = isSessionPinned(a.id) ? 1 : 0;
        const pb = isSessionPinned(b.id) ? 1 : 0;
        if (pa !== pb) return pb - pa;
        return b.timestamp - a.timestamp;
      })
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
    const d = new Date(ts);
    const day = d.toLocaleDateString("es-ES", { day: "numeric" });
    const month = d.toLocaleDateString("es-ES", { month: "short" });
    const time = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    return `${day} ${month} ${time}`;
  }

  return (
    <>
      <Header />
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
            <>
              <button
                onClick={() => setShowSessionIds(!getShowSessionIds())}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-muted transition-all hover:bg-[#ff2f78]/15 hover:text-white active:scale-95"
                aria-label="Ver números de sesión"
                title={showNum ? "Ocultar números de sesión" : "Ver números de sesión"}
                style={showNum ? { color: "#ff2f78" } : undefined}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
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
            </>
          )}
        </div>

        {single ? (
          <div className="flex min-h-[50dvh] flex-col">
            <div className="mb-4 flex items-center gap-2">
              <button
                onClick={() => goBack(router, "/history")}
                className="flex w-fit items-center gap-1.5 rounded-full bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/[0.1] hover:text-white active:scale-95"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                Volver
              </button>
              <button
                onClick={() => setShowSessionIds(!getShowSessionIds())}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-white/60 transition hover:bg-[#ff2f78]/15 hover:text-white active:scale-95"
                aria-label="Ver números de sesión"
                title={showNum ? "Ocultar números de sesión" : "Ver números de sesión"}
                style={showNum ? { color: "#ff2f78" } : undefined}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <button
                onClick={() => setConfirmClear(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-white/60 transition hover:bg-[#ff2f78]/15 hover:text-white active:scale-95"
                aria-label={`Borrar todo con ${single.name}`}
                title="Borrar todo"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </button>
            </div>

            {singleSessions.length === 0 && !singleLast ? null : (
              <>
                {singleSessions.length > 0 && (
                  <div className="list-enter space-y-1">
                    {singleSessions.map((s) => (
                      <div key={s.id} className="group relative flex items-center">
                        <Link
                          href={single.href}
                          className="flex w-full items-center gap-3.5 rounded-2xl px-2 py-2.5 pr-14 text-left transition hover:bg-white/[0.04] active:scale-[0.99]"
                        >
                          <div className="relative h-[62px] w-[62px] shrink-0">
                            <div className="relative h-full w-full overflow-hidden rounded-full bg-[#ff2f78]">
                              {single.img && (
                                <img src={single.img} alt={single.name} className="absolute inset-0 h-full w-full object-cover object-center" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                              )}
                              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">{single.name[0]}</div>
                            </div>
                            {isSessionPinned(s.id) && (
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
                          </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="truncate text-[1.02rem] font-semibold leading-tight text-white">
                              {single.name}
                              {showNum && (
                                <span className="ml-1.5 rounded bg-white/10 px-1.5 py-0.5 align-middle font-mono text-[9px] font-normal leading-none text-white/40">
                                  #{sessionShortId(s.id)}
                                </span>
                              )}
                            </p>
                            <p className="shrink-0 text-[10px] text-white/30">{formatDate(s.ts)}</p>
                          </div>
                          <p className="mt-0.5 max-w-full truncate text-[13px] text-white/40">{s.preview || "Conversación"}</p>
                          </div>
                        </Link>
                        <button
                          onClick={() => setMenuRow({ ...single, lastTs: s.ts, lastPreview: s.preview, sessionId: s.id })}
                          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-white/45 transition hover:bg-white/[0.07] hover:text-white active:scale-90"
                          aria-label={`Opciones de ${single.name}`}
                          title="Opciones"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : rows.length === 0 ? (
          <div className="min-h-[calc(100dvh-114px)] flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl glass">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-muted/50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <p className="text-lg font-semibold tracking-tight">No tienes historial todavía</p>
            <p className="mt-2 max-w-xs text-sm text-muted/70">
              Cuando hables con una chica, tus conversaciones aparecerán aquí.
            </p>
            <Link href="/girls" className="mt-8 rounded-xl gradient-btn px-6 py-3 text-sm font-semibold shadow-lg shadow-pink-500/25">
              Ir a chicas IA
            </Link>
          </div>
        ) : (
          <div className="list-enter space-y-1">
            {rows.map((r) => (
              <div key={r.girlId} className="group relative flex items-center">
                <Link
                  href={r.href}
                  className="flex w-full items-center gap-3.5 rounded-2xl px-2 py-2.5 pr-14 text-left transition hover:bg-white/[0.04] active:scale-[0.99]"
                >
                  <div className="relative h-[62px] w-[62px] shrink-0">
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-[#ff2f78]">
                      {r.img && (
                        <img src={r.img} alt={r.name} className="absolute inset-0 h-full w-full object-cover object-center"
                          onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      )}
                      <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">{r.name[0]}</div>
                    </div>
                    {pinScore(r) > 0 && (
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
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-[1.02rem] font-semibold leading-tight text-white">
                      {r.name}
                      {showNum && r.sessionId && (
                        <span className="ml-1.5 rounded bg-white/10 px-1.5 py-0.5 align-middle font-mono text-[9px] font-normal leading-none text-white/40">
                          #{sessionShortId(r.sessionId)}
                        </span>
                      )}
                    </p>
                      {r.lastTs > 0 && (
                        <p className="shrink-0 text-[10px] text-white/30">{formatDate(r.lastTs)}</p>
                      )}
                    </div>
                    <p className="mt-0.5 max-w-full truncate text-[13px] text-white/40">
                      {r.lastPreview || "Conversación"}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => setMenuRow(r)}
                  className="absolute right-2 top-1.5 flex h-9 w-9 items-center justify-center rounded-xl text-white/45 transition hover:bg-white/[0.07] hover:text-white active:scale-90"
                  aria-label={`Opciones de ${r.name}`}
                  title="Opciones"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>
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
              <h3 className="mt-4 text-lg font-bold tracking-tight text-white">{deleteRow.sessionId ? "Borrar esta sesión" : `Borrar conversación con ${deleteRow.name}`}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {deleteRow.sessionId ? (
                  <>
                    Se borrará <span className="font-semibold text-white/80">para siempre</span> esta sesión del historial. Esta acción no se puede deshacer.
                  </>
                ) : (
                  <>
                    Se borrará <span className="font-semibold text-white/80">para siempre</span> la conversación con {deleteRow.name} y nunca volverá a aparecer. Esta acción no se puede deshacer.
                  </>
                )}
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
            <div className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-6" onClick={(e) => { if (e.target === e.currentTarget) setMenuRow(null); }}>
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
                      <span className="block text-sm font-semibold text-white">{(menuRow.sessionId ? isSessionPinned(menuRow.sessionId) : isGirlPinned(menuRow.girlId)) ? "Desfijar chat" : "Fijar chat"}</span>
                      <span className="block text-xs text-white/40">{(menuRow.sessionId ? isSessionPinned(menuRow.sessionId) : isGirlPinned(menuRow.girlId)) ? "Dejará de aparecer arriba" : "Solo esta sesión aparecerá fijada"}</span>
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