"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import AccountModal from "@/components/AccountModal";

interface SessionContextValue {
  email: string | null;
  openModal: () => void;
  closeModal: () => void;
  requireLogin: () => boolean;
}

const SessionContext = createContext<SessionContextValue>({
  email: null,
  openModal: () => {},
  closeModal: () => {},
  requireLogin: () => false,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setEmail(data.session?.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setEmail(s?.user?.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);
  const requireLogin = useCallback(() => {
    if (email) return true;
    setOpen(true);
    return false;
  }, [email]);

  const value = useMemo(
    () => ({ email, openModal, closeModal, requireLogin }),
    [email, openModal, closeModal, requireLogin]
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
      <AccountModal open={open} onClose={closeModal} onDone={closeModal} />
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}