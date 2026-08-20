const LAST_TAB_KEY = "lunacall_last_tab";

interface RouterLike {
  back: () => void;
  replace: (href: string) => void;
}

export function rememberTab(pathname: string) {
  if (!pathname) return;
  if (/^\/(girls|anime|chicos|messages)(\?|$)/.test(pathname)) {
    try {
      sessionStorage.setItem(LAST_TAB_KEY, pathname);
    } catch {}
  }
}

export function getLastTab(fallback: string): string {
  try {
    return sessionStorage.getItem(LAST_TAB_KEY) || fallback;
  } catch {
    return fallback;
  }
}

export function goBack(router: RouterLike, fallback: string) {
  if (typeof window !== "undefined" && window.history.length > 1) {
    router.back();
  } else {
    router.replace(getLastTab(fallback));
  }
}