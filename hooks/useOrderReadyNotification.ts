"use client";

import { useEffect, useRef, useState } from "react";
import { getReverbEcho } from "@/lib/reverb-client";
import type { OrderStatus } from "@/lib/order-status";

export type OrderReadyEvent = {
  order: {
    id: number;
    order_number: string;
    status: OrderStatus;
    customer_name: string;
  };
};

// ---------------------------------------------------------------------------
// Module-level AudioContext — created once, kept alive and unlocked after
// the first user gesture so it can be used from WebSocket callbacks later.
// ---------------------------------------------------------------------------
let _audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_audioCtx) {
    _audioCtx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();
  }
  return _audioCtx;
}

/** Must be called inside a user-gesture handler to satisfy browser policy. */
function unlockAudioCtx() {
  const ctx = getAudioCtx();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

/**
 * Play a pleasant 4-note chime.
 * Resumes the AudioContext first in case the browser suspended it.
 */
async function playReadyChime() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;

    // Resume if suspended (may happen after unlock races)
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const schedule = [
      { freq: 523.25, start: 0,    dur: 0.18 }, // C5
      { freq: 659.25, start: 0.16, dur: 0.18 }, // E5
      { freq: 783.99, start: 0.32, dur: 0.28 }, // G5
      { freq: 1046.5, start: 0.52, dur: 0.45 }, // C6
    ];

    schedule.forEach(({ freq, start, dur }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.value = freq;

      const t0 = ctx.currentTime + start;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.4, t0 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    });
  } catch {
    // Web Audio not supported — silent fallback
  }
}

/** Request and send a browser / system push notification. */
function sendBrowserNotification(orderNumber: string) {
  if (!("Notification" in window)) return;

  const send = () => {
    try {
      new Notification("☕ Pesanan Siap!", {
        body: `${orderNumber} sudah siap diambil. Silakan ke kasir!`,
        icon: "/favicon.ico",
        tag: `order-ready-${orderNumber}`,
        requireInteraction: true,
      });
    } catch {
      // silent
    }
  };

  if (Notification.permission === "granted") {
    send();
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((p) => { if (p === "granted") send(); });
  }
}

// ---------------------------------------------------------------------------

type Options = {
  orderId: number | null;
  onReady?: (event: OrderReadyEvent) => void;
};

export function useOrderReadyNotification({ orderId, onReady }: Options) {
  const [isReady, setIsReady] = useState(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  // 1️⃣  Request notification permission early (before the user leaves the tab).
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // 2️⃣  Unlock the AudioContext on the FIRST user interaction (click or touch).
  //     After this, ctx.state === "running" and we can call play() from anywhere.
  useEffect(() => {
    // Eagerly create the context so it's registered before any gesture.
    getAudioCtx();

    const unlock = () => unlockAudioCtx();
    window.addEventListener("click",      unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("keydown",    unlock, { passive: true });

    return () => {
      window.removeEventListener("click",      unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown",    unlock);
    };
  }, []);

  // 3️⃣  Subscribe to the WebSocket channel for this order.
  useEffect(() => {
    if (!orderId) return;

    const echo = getReverbEcho();
    if (!echo) return;

    const channel = echo.channel(`orders.${orderId}`);

    channel.listen(".order.status.updated", (event: OrderReadyEvent) => {
      if (event.order?.status === "ready_for_pickup") {
        setIsReady(true);
        playReadyChime();                              // uses unlocked ctx
        sendBrowserNotification(event.order.order_number);
        onReadyRef.current?.(event);
      }
    });

    return () => {
      echo.leaveChannel(`orders.${orderId}`);
    };
  }, [orderId]);

  return { isReady };
}
