"use client";

import { useState, useEffect, useCallback } from "react";

const PRELOADER_KEY = "preloaderSeen";

export interface UsePreloaderReturn {
  isVisible: boolean;
  hasSeenPreloader: boolean;
  markAsSeen: () => void;
}

// Pure function for testing - determines if preloader should be visible
export function shouldShowPreloader(sessionValue: string | null): boolean {
  return sessionValue !== "true";
}

export function usePreloader(): UsePreloaderReturn {
  const [hasSeenPreloader, setHasSeenPreloader] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem(PRELOADER_KEY);
      const shouldShow = shouldShowPreloader(seen);
      setHasSeenPreloader(!shouldShow);
      setIsVisible(shouldShow);
    } catch {
      // sessionStorage not available, show preloader
      setHasSeenPreloader(false);
      setIsVisible(true);
    }
  }, []);

  const markAsSeen = useCallback(() => {
    try {
      sessionStorage.setItem(PRELOADER_KEY, "true");
    } catch {
      // sessionStorage not available
    }
    setHasSeenPreloader(true);
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    hasSeenPreloader,
    markAsSeen,
  };
}
