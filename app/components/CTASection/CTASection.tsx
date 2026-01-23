"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./CTASection.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CTASectionProps {
  logoSrc: string;
  bodyCopy: string;
  buttonText: string;
  buttonHref: string;
}

// Parallax animation values for cards (kept for tests)
export const PARALLAX_VALUES = {
  leftX: [-800, -900, -400],
  rightX: [800, 900, 400],
  leftRotation: [-30, -20, -35],
  rightRotation: [30, 20, 35],
  y: [100, -150, -400],
};

// Calculate card transform based on scroll progress (kept for tests)
export function calculateCardTransform(
  progress: number,
  rowIndex: number,
  isLeft: boolean
): { x: number; y: number; rotation: number } {
  const xValues = isLeft ? PARALLAX_VALUES.leftX : PARALLAX_VALUES.rightX;
  const rotationValues = isLeft ? PARALLAX_VALUES.leftRotation : PARALLAX_VALUES.rightRotation;
  
  const safeIndex = Math.min(rowIndex, xValues.length - 1);
  
  return {
    x: progress * xValues[safeIndex],
    y: progress * PARALLAX_VALUES.y[safeIndex],
    rotation: progress * rotationValues[safeIndex],
  };
}

export default function CTASection({
  logoSrc,
  bodyCopy,
  buttonText,
  buttonHref,
}: CTASectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  // Logo scale animation
  useEffect(() => {
    const logoEl = logoRef.current;
    if (!logoEl) return;

    gsap.to(logoEl, {
      scale: 1,
      duration: 0.5,
      ease: "power1.out",
      scrollTrigger: {
        trigger: ".cta",
        start: "top 25%",
        toggleActions: "play reverse play reverse",
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === ".cta") st.kill();
      });
    };
  }, []);

  // Copy text line reveal animation
  useEffect(() => {
    const copyEl = copyRef.current;
    if (!copyEl) return;

    const lines = copyEl.querySelectorAll(".line");
    gsap.set(lines, { yPercent: 100 });

    gsap.to(lines, {
      yPercent: 0,
      duration: 0.5,
      ease: "power1.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: ".cta",
        start: "top 25%",
        toggleActions: "play reverse play reverse",
      },
    });
  }, [bodyCopy]);

  // Button fade animation
  useEffect(() => {
    const btnEl = buttonRef.current;
    if (!btnEl) return;

    gsap.set(btnEl, { y: 25, opacity: 0 });
    gsap.to(btnEl, {
      y: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power1.out",
      delay: 0.3,
      scrollTrigger: {
        trigger: ".cta",
        start: "top 25%",
        toggleActions: "play reverse play reverse",
      },
    });
  }, []);

  // Split text into lines for animation
  const splitTextIntoLines = (text: string) => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    
    words.forEach((word, i) => {
      currentLine += (currentLine ? " " : "") + word;
      if ((i + 1) % 7 === 0 || i === words.length - 1) {
        lines.push(currentLine);
        currentLine = "";
      }
    });
    
    return lines;
  };

  const textLines = splitTextIntoLines(bodyCopy);

  return (
    <section className="cta" ref={sectionRef}>
      <div className="cta-content">
        <div className="cta-logo" ref={logoRef}>
          <Image src={logoSrc} alt="App Name Logo" width={150} height={150} />
        </div>
        <div className="cta-copy" ref={copyRef}>
          {textLines.map((line, i) => (
            <div className="line-mask" key={i}>
              <span className="line bodyCopy">{line}</span>
            </div>
          ))}
        </div>
        <div className="btn">
          <Link href={buttonHref} className="btn" ref={buttonRef}>
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
