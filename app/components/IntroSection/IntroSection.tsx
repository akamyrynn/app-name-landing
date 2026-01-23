"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Stat } from "../../utils/pageData";
import "./IntroSection.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface IntroSectionProps {
  stats: Stat[];
  heading: string;
  bodyCopy: string;
  isPreloaderShowing: boolean;
}

// Pure function for testing - calculates how many chars should be colored
export function calculateColoredChars(progress: number, totalChars: number): number {
  return Math.floor(progress * totalChars);
}

export default function IntroSection({
  stats,
  heading,
  bodyCopy,
  isPreloaderShowing,
}: IntroSectionProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const copyRef = useRef<HTMLHeadingElement>(null);
  const copyWrapperRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);

  // Heading slide animation on scroll
  useEffect(() => {
    const headingEl = headingRef.current;
    if (!headingEl) return;

    gsap.set(headingEl, { opacity: 0, y: 50 });

    ScrollTrigger.create({
      trigger: headingEl,
      start: "top 70%",
      onEnter: () => {
        gsap.to(headingEl, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
        });
      },
    });
  }, []);


  // Text fill animation on scroll
  useEffect(() => {
    const copyEl = copyRef.current;
    const wrapperEl = copyWrapperRef.current;
    if (!copyEl || !wrapperEl) return;

    // Split text into characters
    const text = bodyCopy;
    copyEl.innerHTML = "";
    charsRef.current = [];

    text.split("").forEach((char) => {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = char === " " ? "\u00A0" : char;
      span.style.color = "var(--base-300)";
      copyEl.appendChild(span);
      charsRef.current.push(span);
    });

    ScrollTrigger.create({
      trigger: wrapperEl,
      start: "top 75%",
      end: "bottom 30%",
      onUpdate: (self) => {
        const progress = self.progress;
        const totalChars = charsRef.current.length;
        const charsToColor = calculateColoredChars(progress, totalChars);

        charsRef.current.forEach((char, index) => {
          if (index < charsToColor) {
            char.style.color = "var(--base-100)";
          } else {
            char.style.color = "var(--base-300)";
          }
        });
      },
    });
  }, [bodyCopy]);

  return (
    <section className="intro">
      <div className="container">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat">
              <div className="stat-copy">
                <div className="stats-copy-label">
                  <p>{stat.label}</p>
                </div>
                <div className="stats-copy-count">
                  <h3>{stat.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="intro-header">
          <h1 ref={headingRef}>{heading}</h1>
        </div>

        <div className="intro-copy" ref={copyWrapperRef}>
          <div className="intro-copy-wrapper">
            <h3 ref={copyRef}>{bodyCopy}</h3>
          </div>
        </div>
      </div>
    </section>
  );
}
