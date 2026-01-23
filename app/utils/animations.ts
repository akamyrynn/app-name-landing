"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface SlideAnimationOptions {
  delay?: number;
  stagger?: number;
  onScroll?: boolean;
  scrollTrigger?: HTMLElement;
}

export interface FlickerAnimationOptions {
  delay?: number;
  onScroll?: boolean;
  scrollTrigger?: HTMLElement;
}

// Slide animation for text lines
export function createSlideAnimation(
  lines: HTMLElement[],
  options: SlideAnimationOptions = {}
): gsap.core.Tween {
  const { delay = 0, stagger = 0.1, onScroll = false, scrollTrigger } = options;

  gsap.set(lines, { yPercent: 100 });

  const animation = gsap.to(lines, {
    yPercent: 0,
    duration: 0.75,
    ease: "power3.out",
    delay,
    stagger,
    paused: onScroll,
  });

  if (onScroll && scrollTrigger) {
    ScrollTrigger.create({
      trigger: scrollTrigger,
      start: "top 70%",
      animation,
      toggleActions: "play none none none",
    });
  }

  return animation;
}

// Flicker animation for characters
export function createFlickerAnimation(
  chars: HTMLElement[],
  options: FlickerAnimationOptions = {}
): gsap.core.Tween {
  const { delay = 0, onScroll = false, scrollTrigger } = options;

  gsap.set(chars, { opacity: 0 });

  const animation = gsap.to(chars, {
    delay,
    duration: 0.05,
    opacity: 1,
    ease: "power2.inOut",
    stagger: {
      amount: 0.5,
      each: 0.1,
      from: "random",
    },
    paused: onScroll,
  });

  if (onScroll && scrollTrigger) {
    ScrollTrigger.create({
      trigger: scrollTrigger,
      start: "top 85%",
      animation,
      toggleActions: "play none none none",
    });
  }

  return animation;
}


// Text fill animation (intro section)
export function createTextFillAnimation(
  chars: HTMLElement[],
  trigger: HTMLElement
): ScrollTrigger {
  return ScrollTrigger.create({
    trigger,
    start: "top 75%",
    end: "bottom 30%",
    onUpdate: (self) => {
      const progress = self.progress;
      const totalChars = chars.length;
      const charsToColor = Math.floor(progress * totalChars);

      chars.forEach((char, index) => {
        if (index < charsToColor) {
          char.style.color = "var(--base-100)";
        } else {
          char.style.color = "var(--base-300)";
        }
      });
    },
  });
}

// Sticky header animation
export function createStickyAnimation(
  trigger: HTMLElement,
  endTrigger: HTMLElement
): ScrollTrigger {
  return ScrollTrigger.create({
    trigger,
    start: "top top",
    endTrigger,
    end: "bottom bottom",
    pin: true,
    pinSpacing: false,
  });
}

// CTA cards parallax animation
export interface ParallaxConfig {
  leftXValues: number[];
  rightXValues: number[];
  leftRotationValues: number[];
  rightRotationValues: number[];
  yValues: number[];
}

export function createParallaxCardsAnimation(
  rows: HTMLElement[],
  config: ParallaxConfig
): ScrollTrigger[] {
  const triggers: ScrollTrigger[] = [];

  rows.forEach((row, index) => {
    const cardLeft = row.querySelector(".cta-card-left") as HTMLElement;
    const cardRight = row.querySelector(".cta-card-right") as HTMLElement;

    if (!cardLeft || !cardRight) return;

    const trigger = ScrollTrigger.create({
      trigger: ".cta",
      start: "top center",
      end: "150% bottom",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        cardLeft.style.transform = `translateX(${
          progress * config.leftXValues[index]
        }px) translateY(${progress * config.yValues[index]}px) rotate(${
          progress * config.leftRotationValues[index]
        }deg)`;
        cardRight.style.transform = `translateX(${
          progress * config.rightXValues[index]
        }px) translateY(${progress * config.yValues[index]}px) rotate(${
          progress * config.rightRotationValues[index]
        }deg)`;
      },
    });

    triggers.push(trigger);
  });

  return triggers;
}

// Calculate animation delay based on preloader state
export function getAnimationDelay(baseDelay: number, isPreloaderShowing: boolean): number {
  return isPreloaderShowing ? baseDelay + 2 : baseDelay;
}
