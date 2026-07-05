"use client";

import { useEffect, useState } from "react";
import { hasAgeAccepted } from "@/lib/storage";

const ALLOWED = ["/age", "/terms", "/privacy", "/age-notice"];

function getRelPath() {
  if (typeof window === "undefined") return "/";
  var p = window.location.pathname.replace(/\/+$/, "") || "/";
  var s = p.indexOf("/", 1);
  var base = s > 0 ? p.substring(0, s) : "";
  if (base && p.startsWith(base)) return p.slice(base.length) || "/";
  return p;
}

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(function checkAge() {
    if (hasAgeAccepted()) { setReady(true); return; }
    var rel = getRelPath();
    if (ALLOWED.indexOf(rel) !== -1) { setReady(true); return; }
    // Not on an allowed page and age not accepted → redirect
    var raw = window.location.pathname;
    var norm = raw.replace(/\/+$/, "") || "/";
    var s2 = norm.indexOf("/", 1);
    var base = s2 > 0 ? norm.substring(0, s2) : "";
    var target = base + "/age/";
    if (raw.replace(/\/+$/, "") !== target.replace(/\/+$/, "")) {
      window.location.replace(target);
    }
  }, []);

  var rel = getRelPath();
  var showGate = !ready && ALLOWED.indexOf(rel) === -1;

  if (showGate) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-pink border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
