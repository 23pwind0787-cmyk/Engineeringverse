"use client";

import { useEffect } from "react";

/* Registers /sw.js so visited public pages keep working offline.
 * Registration failure is swallowed on purpose: offline support is a
 * progressive enhancement and must never break the page. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .catch(() => {});
    }
  }, []);
  return null;
}
