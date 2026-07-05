"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasAgeAccepted } from "@/lib/storage";

const ALLOWED_WITHOUT_GATE = ["/age", "/terms", "/privacy", "/age-notice"];

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const accepted = hasAgeAccepted();
    if (!accepted && !ALLOWED_WITHOUT_GATE.includes(pathname)) {
      router.replace("/age");
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready && !ALLOWED_WITHOUT_GATE.includes(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-pink border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
