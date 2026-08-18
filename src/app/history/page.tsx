"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getHistory, clearHistory, getConversationHistory, HistoryEntry } from "@/lib/memory";
import { getCustomGirls, CustomGirlData } from "@/lib/storage";
import { getGirlImage } from "@/lib/images";
import { girls } from "@/data/girls";

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [customGirls, setCustomGirls] = useState<CustomGirlData[]>([]);

  useEffect(() => {
    setEntries(getHistory());
    setCustomGirls(getCustomGirls());
  }, []);

  function handleClear() {
    clearHistory();
    setEntries([]);
  }

  function resolveGirl(girlId: string): { href: string; img: string | null; name: string } {
    if (girlId.startsWith("custom_")) {
      const g = customGirls.find((x) => x.id === girlId);
      if (g) {
        return {
          href: `/chat/luna?custom=${g.id}`,
          img: g.imageUrl || getGirlImage(g.baseId || "luna", g.hair, g.pose, g.background),
          name: g.name,
        };
      }
    }
    const built = girls.find((g) => g.id === girlId);
    return {
      href: `/chat/${girlId}`,
      img: built ? getGirlImage(built.id, null, null, null, built.cloudinaryImage) : null,
      name: built?.name ?? girlId,
    };
  }

  function formatDate(ts: number) {
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
            <p className="mt-1.5 text-sm text-muted/70">Conversaciones anteriores</p>
          </div>
          {entries.length > 0 && (
            <button
              onClick={handleClear}
              className="rounded-xl bg-white/10 px-4 py-2 text-xs text-muted hover:bg-white/20 transition-all active:scale-95"
            >
              Limpiar historial
            </button>
          )}
        </div>

        {/* Mis chicas: las creadas, arriba del todo, con su última conversación */}
        {customGirls.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold tracking-tight text-white">Mis chicas</h2>
            <p className="mt-1 text-xs text-muted/70">Tus creaciones, con su última conversación</p>
            <div className="mt-4">
              {customGirls.map((g) => {
                const hist = getConversationHistory(g.id);
                const lastMsg = [...hist].reverse().find((m) => m.role === "assistant")?.content ?? "";
                const img = g.imageUrl || getGirlImage(g.baseId || "luna", g.hair, g.pose, g.background);
                return (
                  <Link
                    key={g.id}
                    href={`/chat/luna?custom=${g.id}`}
                    className="flex items-center gap-3.5 rounded-2xl px-2 py-2.5 transition hover:bg-white/[0.04] active:scale-[0.99]"
                  >
                    <div className="h-[60px] w-[60px] shrink-0 overflow-hidden rounded-full border border-white/[0.09] bg-gradient-to-br from-[#ff5798]/30 to-[#8b5cf6]/25">
                      <img src={img} alt={g.name} className="h-full w-full object-cover object-center" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[1.02rem] font-semibold leading-tight text-white">{g.name}</p>
                      <p className="mt-0.5 max-w-full truncate text-[13px] text-white/40">
                        {lastMsg || "Sin conversación todavía"}
                      </p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-white/25"><path d="M9 18l6-6-6-6" /></svg>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Historial de conversaciones */}
        <h2 className="text-xl font-bold tracking-tight text-white">Conversaciones</h2>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl glass">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-muted/50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 7L2 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold tracking-tight">No hay conversaciones</p>
            <p className="mt-2 text-sm text-muted/70 max-w-xs">
              Las conversaciones aparecerán aquí cuando cuelgues una llamada o salgas de un chat.
            </p>
            <Link
              href="/girls"
              className="mt-8 rounded-xl gradient-btn px-6 py-3 text-sm font-semibold shadow-lg shadow-pink-500/25"
            >
              Ir a chicas IA
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const r = resolveGirl(entry.girlId);
              return (
                <Link
                  key={entry.id}
                  href={r.href}
                  className="glass glass-hover rounded-xl3 flex items-center gap-4 p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-pink to-purple text-lg font-bold text-white shadow-lg shadow-pink-500/25">
                    {r.img ? (
                      <img src={r.img} alt={r.name} className="h-full w-full object-cover object-center" />
                    ) : (
                      r.name[0]
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold tracking-tight">{r.name}</p>
                    <p className="truncate text-xs text-muted/70 mt-0.5">{entry.preview}</p>
                    <p className="mt-1 text-[10px] text-muted/50">{formatDate(entry.timestamp)}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-muted/40"><path d="M9 18l6-6-6-6" /></svg>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}