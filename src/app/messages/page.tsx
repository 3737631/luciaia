"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import {
  getHistory,
  getConversationHistory,
  clearAllUnreadReplies,
  getUnreadReplies,
  onUnreadChange,
} from "@/lib/memory";
import { getCustomGirls } from "@/lib/storage";
import { getGirlImage } from "@/lib/images";
import { girls } from "@/data/girls";

interface MsgRow {
  key: string;
  girlId: string;
  name: string;
  img: string;
  href: string;
  ts: number;
  preview: string;
  pending: boolean;
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

  useEffect(() => {
    const rebuild = () => {
      const pending = getUnreadReplies();
      const customs = getCustomGirls();
      const entries = getHistory();
      const byGirl = new Map<string, { ts: number; preview: string }>();
      for (const e of entries) {
        const prev = byGirl.get(e.girlId);
        if (!prev || e.timestamp > prev.ts) byGirl.set(e.girlId, { ts: e.timestamp, preview: e.preview });
      }

      const pendingRows: MsgRow[] = pending.map((u) => ({
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
      }));
      pendingRows.sort((a, b) => b.ts - a.ts);

      const seenPending = new Set(pending.map((u) => u.girlId));
      const restRows: MsgRow[] = [];

      for (const g of [...customs].reverse()) {
        if (seenPending.has(g.id)) continue;
        const saved = getConversationHistory(g.id);
        const info = byGirl.get(g.id);
        if (!info && saved.length === 0) continue;
        restRows.push({
          key: `c-${g.id}`,
          girlId: g.id,
          name: g.name,
          img: g.imageUrl || getGirlImage(g.baseId || "luna", g.hair, g.pose, g.background),
          href: `/chat/luna?custom=${g.id}`,
          ts: info?.ts ?? 0,
          preview: info?.preview ?? (saved.length > 0 ? saved[saved.length - 1].content.slice(0, 80) : ""),
          pending: false,
        });
      }

      for (const girl of girls) {
        if (seenPending.has(girl.id)) continue;
        const saved = getConversationHistory(girl.id);
        const info = byGirl.get(girl.id);
        if (!info && saved.length === 0) continue;
        restRows.push({
          key: `g-${girl.id}`,
          girlId: girl.id,
          name: girl.name,
          img: getGirlImage(girl.id, null, null, null, girl.cloudinaryImage),
          href: `/chat/${girl.id}`,
          ts: info?.ts ?? 0,
          preview: info?.preview ?? (saved.length > 0 ? saved[saved.length - 1].content.slice(0, 80) : ""),
          pending: false,
        });
      }
      restRows.sort((a, b) => b.ts - a.ts);

      setRows([...pendingRows, ...restRows]);
      setUnreadCount(pendingRows.length);
    };
    rebuild();
    return onUnreadChange(rebuild);
  }, []);

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
      <main className="mx-auto max-w-3xl overflow-x-hidden px-4 pb-10 pt-8 sm:px-5 sm:py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Mensajes</h1>
            <p className="mt-1.5 text-sm text-muted/70">
              Respuestas sin contestar arriba y todas tus conversaciones.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => clearAllUnreadReplies()}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-muted transition-all hover:bg-[#ff2f78]/15 hover:text-white active:scale-95"
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
          <div className="space-y-1">
            {rows.map((r) => (
              <Link
                key={r.key}
                href={r.href}
                className={`flex w-full items-center gap-3.5 rounded-2xl px-2 py-2.5 text-left transition hover:bg-white/[0.04] active:scale-[0.99] ${r.pending ? "bg-[#ff2f78]/[0.07] ring-1 ring-[#ff2f78]/25" : ""}`}
              >
                <div className="relative shrink-0">
                  <div className="h-[62px] w-[62px] overflow-hidden rounded-full bg-[#ff2f78]">
                    {r.img ? (
                      <img src={r.img} alt={r.name} className="h-full w-full object-cover object-center" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">{r.name[0]}</div>
                    )}
                  </div>
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
                        boxShadow: "0 0 8px rgba(255,47,120,0.9)",
                      }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[1.02rem] font-semibold leading-tight text-white">{r.name}</p>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-white/25"><path d="M9 18l6-6-6-6" /></svg>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}