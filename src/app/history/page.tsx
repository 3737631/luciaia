"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getHistory, clearHistory, HistoryEntry } from "@/lib/memory";

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  function handleClear() {
    clearHistory();
    setEntries([]);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl overflow-x-hidden px-4 pb-24 pt-6 sm:px-5 sm:py-20">
        <div className="mb-10 flex items-center justify-between">
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

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl glass">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-muted/50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 7L2 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold tracking-tight">No hay historial</p>
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
            {entries.map((entry) => (
              <Link
                key={entry.id}
                href={`/chat/${entry.girlId}`}
                className="glass glass-hover rounded-xl3 flex items-center gap-4 p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink to-purple text-lg font-bold text-white shadow-lg shadow-pink-500/25">
                  {entry.girlName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold tracking-tight">{entry.girlName}</p>
                  <p className="truncate text-xs text-muted/70 mt-0.5">{entry.preview}</p>
                  <p className="mt-1 text-[10px] text-muted/50">
                    {new Date(entry.timestamp).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-muted/40"><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
