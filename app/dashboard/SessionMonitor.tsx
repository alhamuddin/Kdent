"use client";

import { useEffect } from "react";
import { hasActiveSession } from "@/app/actions/session";

export default function SessionMonitor() {
  useEffect(() => {
    let checking = false;
    const checkSession = async () => {
      if (checking || document.visibilityState === "hidden") return;
      checking = true;
      try {
        if (!(await hasActiveSession())) window.location.replace("/login");
      } catch {
        // Keep the current view on transient network failures; the next check retries.
      } finally {
        checking = false;
      }
    };

    const timer = window.setInterval(checkSession, 60_000);
    window.addEventListener("focus", checkSession);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", checkSession);
    };
  }, []);

  return null;
}
