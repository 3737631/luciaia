"use client";

import { Component, ReactNode } from "react";

export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0a0d", color: "#f7f7f8", padding: 24, gap: 12, textAlign: "center" }}>
          <p style={{ fontSize: 16, fontWeight: 600 }}>Algo salió mal</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", maxWidth: 320 }}>{String(this.state.error?.message || this.state.error)}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 8, background: "linear-gradient(135deg,#ff5f8f,#ff2b86)", border: 0, borderRadius: 999, padding: "10px 22px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}