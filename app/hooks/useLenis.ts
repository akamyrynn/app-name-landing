"use client";

import { useEffect, useRef, useCallback } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LENIS_CONFIG, MOBILE_BREAKPOINT } from "../utils/constants";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface UseLenisOptions {
  duration?: number;
  lerp?: number;
  smoothWheel?: boolean;
  syncTouch?: boolean;
  touchMultiplier?: number;
}

export interface UseLenisReturn {
  lenis: Lenis | null;
  start: () => void;
  stop: () => void;
}

export function useLenis(options?: UseLenisOptions): UseLenisReturn {
  const lenisRef = useRef<Lenis | null>(null);

  const start = useCallback(() => {
    lenisRef.current?.start();
  }, []);

  const stop = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const config = isMobile ? LENIS_CONFIG.mobile : LENIS_CONFIG.desktop;

    lenisRef.current = new Lenis({
      duration: options?.duration ?? config.duration,
      lerp: options?.lerp ?? config.lerp,
      smoothWheel: options?.smoothWheel ?? true,
      syncTouch: options?.syncTouch ?? true,
      touchMultiplier: options?.touchMultiplier ?? (isMobile ? 1.5 : 2),
    });

    lenisRef.current.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenisRef.current?.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, [options]);

  return {
    lenis: lenisRef.current,
    start,
    stop,
  };
}
