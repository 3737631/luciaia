"use client";

import { useEffect, useRef, useState } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export interface NotificationData {
  id: string;
  type: "success" | "reaction" | "message" | "error";
  title: string;
  message: string;
  avatar?: string;
  duration?: number;
  sent?: string;
}

interface Props {
  notification: NotificationData;
  onRemove: (id: string) => void;
  onClick?: () => void;
}

export default function InAppNotification({ notification, onRemove, onClick }: Props) {
  const [exit, setExit] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setExit(true), (notification.duration ?? 2500) - 300);
    const r = setTimeout(() => onRemove(notification.id), notification.duration ?? 2500);
    return () => { clearTimeout(t); clearTimeout(r); };
  }, [notification, onRemove]);

  const iconMap: Record<string, string> = {
    success: "✓",
    reaction: "❤️",
    message: "💬",
    error: "✕",
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      onClick={onClick}
      onPointerDown={(e) => {
        startRef.current = { x: e.clientX, y: e.clientY };
        setDragY(0);
      }}
      onPointerMove={(e) => {
        if (!startRef.current) return;
        const dy = e.clientY - startRef.current.y;
        if (dy < 0) setDragY(dy);
      }}
      onPointerUp={(e) => {
        if (!startRef.current) return;
        const dy = startRef.current.y - e.clientY;
        startRef.current = null;
        setDragY(0);
        if (dy > 45) { setExit(true); onRemove(notification.id); }
      }}
      onPointerCancel={() => { startRef.current = null; setDragY(0); }}
      style={{
        position: "fixed",
        top: `calc(env(safe-area-inset-top, 8px) + 8px)`,
        left: 12,
        right: 12,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        borderRadius: 14,
        background: "rgba(20,20,20,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        animation: exit ? "slideOutUp 0.3s ease forwards" : "slideInDown 0.3s ease",
        transform: dragY < 0 ? `translateY(${dragY}px)` : undefined,
        transition: dragY < 0 ? "none" : "transform 0.2s ease",
        maxWidth: 400,
        margin: "0 auto",
        cursor: onClick ? "pointer" : "default",
        border: "1px solid rgba(255,255,255,0.08)",
        touchAction: "pan-y",
      }}
    >
      {notification.avatar ? (
        <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
          <img src={notification.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : (
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,87,152,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
          {iconMap[notification.type] || "✓"}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{notification.title}</div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{notification.message}</div>
      </div>
      {onClick && (
        <div style={{ color: "#FF5798", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>Ver →</div>
      )}
    </div>
  );
}
