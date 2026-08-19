"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getHistory, clearHistory, getConversationHistory } from "@/lib/memory";
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
  const [singleMsgs, setSingleMsgs] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const customId = searchParams.get("custom");
    const girlId = searchParams.get("girl");
    setSingleMsgs([]);

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
        setSingleMsgs(getConversationHistory(g.id));
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
        setSingleMsgs(getConversationHistory(girl.id));
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

    const all = [...customRows, ...otherRows].sort((a, b) => b.lastTs - a.lastTs);

    setRows(all);
  }, [searchParams]);

  function handleClear() {
    if (single) {
      clearGirlConversation(single.girlId);
      setSingleLast("");
      setSingleMsgs([]);
    } else {
      clearHistory();
      for (const girl of girls) clearGirlConversation(girl.id);
      for (const g of getCustomGirls()) clearGirlConversation(g.id);
      setRows((rs) => rs.map((r) => ({ ...r, lastTs: 0, lastPreview: "" })));
    }
    setConfirmClear(false);
  }

  function lastMessage(girlId: string): string {
    const msgs = getConversationHistory(girlId);
    if (msgs.length === 0) return "";
    const last = msgs[msgs.length - 1];
    return (last.role === "user" ? "Tú: " : "") + last.content.slice(0, 80);
  }

  function clearGirlConversation(girlId: string) {
    try {
      localStorage.removeItem(`lunacall_${girlId}_history`);
      localStorage.removeItem(`lunacall_${girlId}_summary`);
    } catch {}
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
                ? "Tus mensajes con esta chica. Al entrar retomas donde la dejaste."
                : "Tus conversaciones con cada chica. Al entrar retomas donde la dejaste."}
            </p>
          </div>
          {!single && rows.some((r) => r.lastTs > 0) && (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-muted transition-all hover:bg-[#ff2f78]/15 hover:text-white active:scale-95"
              aria-label="Limpiar historial"
              title="Limpiar historial"
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
          <div className="flex flex-col">
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

            <div className="mb-5 flex items-center gap-3">
              <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full border border-white/[0.09] bg-gradient-to-br from-[#ff5798]/30 to-[#8b5cf6]/25">
                {single.img ? (
                  <img src={single.img} alt={single.name} className="h-full w-full object-cover object-center" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">{single.name[0]}</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[1.02rem] font-semibold leading-tight text-white">{single.name}</p>
                <p className="mt-0.5 max-w-full truncate text-[13px] text-white/40">
                  {singleMsgs.length > 0 ? `${singleMsgs.length} mensajes` : "Sin mensajes guardados"}
                </p>
              </div>
              <Link href={single.href} className="shrink-0 rounded-full bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/[0.1] hover:text-white active:scale-95">
                Chatear
              </Link>
            </div>

            <div className="space-y-2">
              {singleMsgs.length === 0 ? (
                <p className="py-10 text-center text-sm text-white/35">No hay mensajes guardados con {single.name}.</p>
              ) : (
                singleMsgs.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                        m.role === "user"
                          ? "rounded-br-md bg-gradient-to-br from-[#ff2f78] to-[#ff4c91] text-white"
                          : "rounded-bl-md bg-white/[0.07] text-white/85"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl glass">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-muted/50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" /></svg>
            </div>
            <p className="text-lg font-semibold tracking-tight">No hay conversaciones todavía</p>
            <p className="mt-2 text-sm text-muted/70 max-w-xs">
              Cuando hables con una chica, aquí aparecerá con su foto y el último mensaje.
            </p>
            <Link href="/girls" className="mt-8 rounded-xl gradient-btn px-6 py-3 text-sm font-semibold shadow-lg shadow-pink-500/25">
              Ir a chicas IA
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {rows.map((r) => (
              <Link
                key={r.girlId}
                href={r.href}
                className="flex w-full items-center gap-3.5 rounded-2xl px-2 py-2.5 text-left transition hover:bg-white/[0.04] active:scale-[0.99]"
              >
                <div className="h-[62px] w-[62px] shrink-0 overflow-hidden rounded-full border border-white/[0.09] bg-gradient-to-br from-[#ff5798]/30 to-[#8b5cf6]/25">
                  {r.img ? (
                    <img src={r.img} alt={r.name} className="h-full w-full object-cover object-center" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">{r.name[0]}</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[1.02rem] font-semibold leading-tight text-white">{r.name}</p>
                    {r.lastTs > 0 && (
                      <p className="shrink-0 text-[10px] text-white/30">{formatDate(r.lastTs)}</p>
                    )}
                  </div>
                  <p className="mt-0.5 max-w-full truncate text-[13px] text-white/40">
                    {r.lastPreview || "Toca para empezar a chatear"}
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-white/25"><path d="M9 18l6-6-6-6" /></svg>
              </Link>
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
                {single ? `Borrar conversación con ${single.name}` : "Borrar todo el historial"}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {single ? (
                  <>
                    Se borrará <span className="font-semibold text-white/80">para siempre</span> la conversación con {single.name}. Esta acción no se puede deshacer.
                  </>
                ) : (
                  <>
                    Se borrarán <span className="font-semibold text-white/80">para siempre</span> todas las conversaciones de este dispositivo. Esta acción no se puede deshacer.
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
      </main>
    </>
  );
}