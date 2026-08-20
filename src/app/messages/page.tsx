"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import {
  getHistory,
  getConversationHistory,
  clearAllUnreadReplies,
  clearUnreadReply,
  clearHistory,
  clearGirlData,
  getUnreadReplies,
  onUnreadChange,
  isGirlPinned,
  togglePinGirl,
  isSessionPinned,
  togglePinSession,
  deleteHistoryEntry,
} from "@/lib/memory";
import { getCustomGirls } from "@/lib/storage";
import { getGirlImage } from "@/lib/images";
import { girls } from "@/data/girls";
import { isDebugMode, getShowSessionIds, setShowSessionIds, onShowSessionIdsChange, sessionShortId } from "@/lib/debug";

interface MsgRow {
  key: string;
  girlId: string;
  name: string;
  img: string;
  href: string;
  ts: number;
  preview: string;
  pending: boolean;
  sessionId?: string;
  reply?: string;
  sent?: string;
}

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const [rows, setRows] = useState<MsgRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<"all" | MsgRow | null>(null);
  const [menuRow, setMenuRow] = useState<MsgRow | null>(null);

  const rebuild = useCallback(() => {
    const pending = getUnreadReplies();
    const customs = getCustomGirls();
    const entries = getHistory();

    const girlInfo = new Map<string, { name: string; img: string; href: string }>();
    for (const g of customs) {
      girlInfo.set(g.id, {
        name: g.name,
        img: g.imageUrl || getGirlImage(g.baseId || "luna", g.hair, g.pose, g.background),
        href: `/chat/luna?custom=${g.id}`,
      });
    }
    for (const girl of girls) {
      girlInfo.set(girl.id, {
        name: girl.name,
        img: getGirlImage(girl.id, null, null, null, girl.cloudinaryImage),
        href: `/chat/${girl.id}`,
      });
    }

    const rows: MsgRow[] = [];

    // Respuestas sin contestar (reacciones a historias): una fila por chica, arriba.
    const seenPendingGirls = new Set<string>();
    let pendingCount = 0;
    for (const u of [...pending].sort((a, b) => b.ts - a.ts)) {
      if (seenPendingGirls.has(u.girlId)) continue;
      seenPendingGirls.add(u.girlId);
      pendingCount++;
      rows.push({
        key: `p-${u.id}`,
        girlId: u.girlId,
        name: u.name,
        img: u.img,
        href: `/chat/${u.girlId}?reply=${encodeURIComponent(u.reply)}&sent=${encodeURIComponent(u.sent)}`,
        ts: u.ts,
        preview: u.reply,
        pending: true,
        reply: u.reply,
        sent: u.sent,
      });
    }

    // Cada vez que hablas con una chica se crea una sesión nueva y aparece
    // como un chat independiente (esté fijada o no).
    for (const e of entries) {
      const info = girlInfo.get(e.girlId);
      if (!info) continue;
      rows.push({
        key: `s-${e.id}`,
        girlId: e.girlId,
        name: e.girlName || info.name,
        img: info.img,
        href: info.href,
        ts: e.timestamp,
        preview: e.preview,
        pending: false,
        sessionId: e.id,
      });
    }

    // Chicas con conversación pero sin ninguna sesión todavía.
    const seenGirls = new Set(entries.map((e) => e.girlId));
    const pendingGirls = new Set(pending.map((u) => u.girlId));
    for (const g of [...customs].reverse()) {
      if (seenGirls.has(g.id) || pendingGirls.has(g.id)) continue;
      const saved = getConversationHistory(g.id);
      if (saved.length === 0) continue;
      const info = girlInfo.get(g.id)!;
      rows.push({
        key: `c-${g.id}`,
        girlId: g.id,
        name: info.name,
        img: info.img,
        href: info.href,
        ts: 0,
        preview: saved[saved.length - 1].content.slice(0, 80),
        pending: false,
      });
    }
    for (const girl of girls) {
      if (seenGirls.has(girl.id) || pendingGirls.has(girl.id)) continue;
      const saved = getConversationHistory(girl.id);
      if (saved.length === 0) continue;
      const info = girlInfo.get(girl.id)!;
      rows.push({
        key: `g-${girl.id}`,
        girlId: girl.id,
        name: info.name,
        img: info.img,
        href: info.href,
        ts: 0,
        preview: saved[saved.length - 1].content.slice(0, 80),
        pending: false,
      });
    }

    rows.sort((a, b) => {
      const pa = pinScore(a);
      const pb = pinScore(b);
      if (pa !== pb) return pb - pa;
      if (a.pending !== b.pending) return a.pending ? -1 : 1;
      return b.ts - a.ts;
    });

    setRows(rows);
    setUnreadCount(pendingCount);
  }, []);

  useEffect(() => {
    rebuild();
    return onUnreadChange(rebuild);
  }, [rebuild]);

  function pinScore(r: MsgRow): number {
    if (r.sessionId) return isSessionPinned(r.sessionId) ? 2 : 0;
    if (r.pending) return 0;
    return isGirlPinned(r.girlId) ? 1 : 0;
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

  function handleDeleteAll() {
    clearHistory();
    for (const girl of girls) clearGirlData(girl.id);
    for (const g of getCustomGirls()) clearGirlData(g.id);
    clearAllUnreadReplies();
    rebuild();
    setConfirmDelete(null);
  }

  function handleDeleteRow(r: MsgRow) {
    if (r.pending) {
      clearUnreadReply(r.girlId);
    } else if (r.sessionId) {
      deleteHistoryEntry(r.sessionId);
    } else {
      clearGirlData(r.girlId);
    }
    rebuild();
    setConfirmDelete(null);
  }

  function handlePinRow(r: MsgRow) {
    if (r.sessionId) {
      togglePinSession(r.sessionId);
    } else {
      togglePinGirl(r.girlId);
    }
    rebuild();
    setMenuRow(null);
  }

  const debug = isDebugMode();
  const [showSessionIds, setShowSessionIdsState] = useState(() => getShowSessionIds());

  useEffect(() => {
    return onShowSessionIdsChange(() => setShowSessionIdsState(getShowSessionIds()));
  }, []);

  const showNum = debug || showSessionIds;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl overflow-x-hidden px-4 pb-10 pt-8 sm:px-5 sm:py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Mensajes</h1>
            <p className="mt-1.5 text-sm text-muted/70">
              Respuestas sin contestar arriba y todas tus conversaciones.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
          {rows.length > 0 && (
            <button
              onClick={() => setConfirmDelete("all")}
              className="flex h-11 w-11 items-center justify-center text-muted transition-all hover:text-white active:scale-95"
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
          <button
            onClick={() => setShowSessionIds(!getShowSessionIds())}
            className="flex h-11 w-11 items-center justify-center text-muted transition-all hover:text-white active:scale-95"
            aria-label="Ver números de sesión"
            title={showNum ? "Ocultar números de sesión" : "Ver números de sesión"}
            style={showNum ? { color: "#ff2f78" } : undefined}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={() => { clearAllUnreadReplies(); rebuild(); }}
              className="flex h-11 w-11 items-center justify-center text-muted transition-all hover:text-white active:scale-95"
              aria-label="Marcar todos como leídos"
              title="Marcar todos como leídos"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            </button>
          )}
        </div>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl glass">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-muted/50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4 4V5a1 1 0 0 1 1-1z" /></svg>
            </div>
            <p className="text-lg font-semibold tracking-tight">No tienes mensajes todavía</p>
            <p className="mt-2 text-sm text-muted/70 max-w-xs">
              Cuando contestes a una historia y la chica te responda, aparecerá aquí.
            </p>
            <Link href="/girls" className="mt-8 rounded-xl gradient-btn px-6 py-3 text-sm font-semibold shadow-lg shadow-pink-500/25">
              Ir a chicas IA
            </Link>
          </div>
        ) : (
          <div className="list-enter space-y-1">
            {rows.map((r) => (
              <div key={r.key} className="group relative flex items-center">
                <Link
                  href={r.href}
                  className={`flex w-full items-center gap-3.5 rounded-2xl px-2 py-2.5 pr-14 text-left transition hover:bg-white/[0.04] active:scale-[0.99] ${r.pending ? "bg-[#ff2f78]/[0.07]" : ""}`}
                >
                  <div className="relative h-[62px] w-[62px] shrink-0">
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-[#ff2f78]">
                      {r.img && (
                        <img src={r.img} alt={r.name} className="absolute inset-0 h-full w-full object-cover object-center" onError={(e) => { e.currentTarget.style.display = "none"; }} />
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
                          zIndex: 3,
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="#ff2f78" stroke="#ff2f78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
                      </span>
                    )}
                    {r.pending && (
                      <span
                        style={{
                          position: "absolute",
                          top: -2,
                          right: -2,
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "#ff2f78",
                          border: "2px solid #121212",
                          zIndex: 4,
                        }}
                      />
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
                      <p className="shrink-0 text-[10px] text-white/30">{formatDate(r.ts)}</p>
                    </div>
                    <p className="mt-0.5 max-w-full truncate text-[13px] text-white/40">
                      {r.pending ? <span className="font-semibold text-[#ff7fae]">{r.preview}</span> : (r.preview || "Toca para chatear")}
                    </p>
                  </div>
                  {r.pending && (
                    <span className="shrink-0 rounded-full bg-[#ff2f78]/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#ff7fae]">
                      Nueva
                    </span>
                  )}
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
      </main>

      {confirmDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/80 px-6 backdrop-blur-md" onClick={() => setConfirmDelete(null)}>
          <div className="my-auto w-full max-w-[340px] rounded-3xl border border-white/[0.08] bg-[#15151a]/95 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff2f78]/15 text-[#ff5f8f]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            </div>
            <h3 className="mt-4 text-lg font-bold tracking-tight text-white">
              {confirmDelete === "all"
                ? "Borrar todos tus mensajes"
                : confirmDelete.pending
                  ? "Borrar respuesta"
                  : confirmDelete.sessionId
                    ? "Borrar esta sesión"
                    : `Borrar conversación con ${confirmDelete.name}`}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              {confirmDelete === "all" ? (
                <>
                  Se borrarán <span className="font-semibold text-white/80">para siempre</span> todos los mensajes y nunca volverán a aparecer. Esta acción no se puede deshacer.
                </>
              ) : confirmDelete.pending ? (
                <>
                  Se borrará <span className="font-semibold text-white/80">para siempre</span> la respuesta sin contestar de {confirmDelete.name}. Esta acción no se puede deshacer.
                </>
              ) : confirmDelete.sessionId ? (
                <>
                  Se borrará <span className="font-semibold text-white/80">para siempre</span> esta sesión con {confirmDelete.name} y nunca volverá a aparecer. Esta acción no se puede deshacer.
                </>
              ) : (
                <>
                  Se borrará <span className="font-semibold text-white/80">para siempre</span> la conversación con {confirmDelete.name} y nunca volverá a aparecer. Esta acción no se puede deshacer.
                </>
              )}
            </p>
            <div className="mt-6 flex gap-2.5">
              <button onClick={() => setConfirmDelete(null)} className="h-12 flex-1 rounded-2xl bg-white/[0.06] text-sm font-bold text-white/80 transition hover:bg-white/[0.1] active:scale-[0.98]">
                Cancelar
              </button>
              <button
                onClick={() => (confirmDelete === "all" ? handleDeleteAll() : handleDeleteRow(confirmDelete))}
                className="h-12 flex-[1.4] rounded-2xl bg-gradient-to-r from-[#ff2f78] to-[#ff4c91] text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
              >
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
                {menuRow.sessionId || !menuRow.pending ? (
                  <>
                    <button
                      onClick={() => handlePinRow(menuRow)}
                      className="flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-3.5 text-left transition hover:bg-white/[0.06] active:scale-[0.985] active:bg-white/[0.09]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff2f78]/20 to-[#ff4c91]/10 text-[#ff5798]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-white">
                          {menuRow.sessionId
                            ? (isSessionPinned(menuRow.sessionId) ? "Desfijar sesión" : "Fijar sesión")
                            : (isGirlPinned(menuRow.girlId) ? "Desfijar chat" : "Fijar chat")}
                        </span>
                        <span className="block text-xs text-white/40">
                          {menuRow.sessionId
                            ? (isSessionPinned(menuRow.sessionId) ? "Dejará de aparecer arriba" : "Siempre aparecerá arriba")
                            : (isGirlPinned(menuRow.girlId) ? "Dejará de aparecer arriba" : "Siempre aparecerá arriba")}
                        </span>
                      </span>
                    </button>
                    <div className="mx-4 h-px bg-white/[0.06]" />
                  </>
                ) : null}
                <button
                  onClick={() => { setConfirmDelete(menuRow); setMenuRow(null); }}
                  className="flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-3.5 text-left transition hover:bg-[#ff2f78]/[0.08] active:scale-[0.985] active:bg-[#ff2f78]/[0.14]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff2f78]/15 text-[#ff5f8f]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-[#ff5f8f]">
                      {menuRow.pending ? "Borrar respuesta" : menuRow.sessionId ? "Borrar sesión" : "Borrar conversación"}
                    </span>
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
    </>
  );
}