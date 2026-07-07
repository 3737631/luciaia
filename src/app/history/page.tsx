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
      <main className="mx-auto max-w-3xl px-5 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Historial</h1>
            <p className="mt-1 text-sm text-muted">Conversaciones anteriores</p>
          </div>
          {entries.length > 0 && (
            <button
              onClick={handleClear}
              className="rounded-lg bg-white/10 px-4 py-2 text-xs text-muted hover:bg-white/20"
            >
              Limpiar historial
            </button>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-4xl">📭</div>
            <p className="text-lg font-semibold">No hay historial</p>
            <p className="mt-1 text-sm text-muted">
              Las conversaciones aparecerán aquí cuando cuelgues una llamada o salgas de un chat.
            </p>
            <Link
              href="/girls"
              className="mt-6 rounded-xl gradient-btn px-6 py-3 text-sm font-semibold"
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
                className="flex items-center gap-4 rounded-2xl card-surface p-4 transition hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink to-purple text-lg font-bold text-white">
                  {entry.girlName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{entry.girlName}</p>
                  <p className="truncate text-xs text-muted">{entry.preview}</p>
                  <p className="mt-0.5 text-[10px] text-muted/60">
                    {new Date(entry.timestamp).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-muted"><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
