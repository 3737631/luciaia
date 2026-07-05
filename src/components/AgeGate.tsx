"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasAgeAccepted } from "@/lib/storage";

const ALLOWED = ["/age", "/terms", "/privacy", "/age-notice"];

function getPath() {
  if (typeof window === "undefined") return "";
  const p = window.location.pathname;
  const base = "/luciaia";
  return p.startsWith(base) ? p.slice(base.length) || "/" : p;
}

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  const redirect = useCallback(() => {
    try { router.replace("/age"); } catch {}
    setTimeout(() => {
      if (!hasAgeAccepted()) {
        const base = window.location.pathname.replace(/\/?$/, "");
        window.location.href = base + "/age/";
      }
    }, 1000);
  }, [router]);

  useEffect(() => {
    const p = pathname || getPath();
    if (!hasAgeAccepted() && !ALLOWED.includes(p)) {
      redirect();
      return;
    }
    setReady(true);
  }, [pathname, redirect]);

  const showGate = !ready && !ALLOWED.includes(pathname || getPath());

  if (showGate) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-pink border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
