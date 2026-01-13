"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { getAnimationDelay } from "../../utils/animations";
import "./HeroSection.css";

// Dynamic import for 3D model (client-side only)
const IPhoneModel = dynamic(() => import("./IPhoneModel"), {
  ssr: false,
  loading: () => <div className="hero-model-loading" />,
});

interface HeroSectionProps {
  title: string;
  bodyCopy: string;
  imageSrc: string;
  callouts: string[];
  isPreloaderShowing: boolean;
}

// Pure function for testing - formats time for hero timer
export function formatHeroTimer(date: Date, timezone: string = "America/Toronto"): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  };

  const timeString = date.toLocaleString("en-US", options);
  const hour = parseInt(timeString.split(":")[0]);
  const sector = Math.floor(hour / 4) + 1;
  const sectorFormatted = String(sector).padStart(2, "0");

  return `Zone ${sectorFormatted} __ ${timeString}`;
}

export default function HeroSection({
  title,
  bodyCopy,
  imageSrc,
  callouts,
  isPreloaderShowing,
}: HeroSectionProps) {
  const [timerText, setTimerText] = useState("Zone 00 __ 00:00");
  const timerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);
  const calloutRefs = useRef<(HTMLParagraphElement | null)[]>([]);


  // Timer update
  useEffect(() => {
    const updateTime = () => {
      setTimerText(formatHeroTimer(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Animations
  useEffect(() => {
    const timer = timerRef.current;
    const titleEl = titleRef.current;
    const copyEl = copyRef.current;

    if (!timer || !titleEl || !copyEl) return;

    const timerDelay = getAnimationDelay(1, isPreloaderShowing);
    const titleDelay = getAnimationDelay(0.6, isPreloaderShowing);
    const copyDelay = getAnimationDelay(0.75, isPreloaderShowing);

    // Timer flicker animation
    gsap.set(timer, { opacity: 0 });
    gsap.to(timer, {
      delay: timerDelay,
      duration: 0.1,
      opacity: 1,
      ease: "power2.inOut",
      repeat: 4,
    });

    // Title slide animation (simplified - full SplitText would need GSAP Club)
    gsap.set(titleEl, { opacity: 0, y: 50 });
    gsap.to(titleEl, {
      delay: titleDelay,
      duration: 0.75,
      opacity: 1,
      y: 0,
      ease: "power3.out",
    });

    // Body copy slide animation
    gsap.set(copyEl, { opacity: 0, y: 30 });
    gsap.to(copyEl, {
      delay: copyDelay,
      duration: 0.75,
      opacity: 1,
      y: 0,
      ease: "power3.out",
    });

    // Callout flicker animations
    calloutRefs.current.forEach((callout, index) => {
      if (!callout) return;
      const calloutDelay = getAnimationDelay(0.85 + index * 0.15, isPreloaderShowing);
      gsap.set(callout, { opacity: 0 });
      gsap.to(callout, {
        delay: calloutDelay,
        duration: 0.05,
        opacity: 1,
        ease: "power2.inOut",
        stagger: {
          amount: 0.5,
          from: "random",
        },
      });
    });
  }, [isPreloaderShowing]);

  const titleLines = title.split("\n");

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-bg"></div>

        <div className="hero-model-fullscreen">
          <Suspense fallback={<div className="hero-model-loading" />}>
            <IPhoneModel />
          </Suspense>
        </div>

        <div className="hero-content">
          <div className="container">
            <div className="hero-content-nav">
              <div className="hero-timer" ref={timerRef}>
                <p>{timerText}</p>
              </div>
            </div>

            <div className="hero-content-main">
              <div className="hero-content-header">
                <h1 ref={titleRef}>
                  {titleLines.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < titleLines.length - 1 && <br />}
                    </span>
                  ))}
                </h1>
              </div>
            </div>

            <div className="hero-content-footer">
              <div className="hero-footer-copy">
                <p className="bodyCopy" ref={copyRef}>
                  {bodyCopy}
                </p>
              </div>

              <div className="hero-callout">
                {callouts.map((callout, index) => (
                  <p
                    key={index}
                    ref={(el) => { calloutRefs.current[index] = el; }}
                  >
                    {callout}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
