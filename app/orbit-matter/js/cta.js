import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener("DOMContentLoaded", () => {
  const ctaSection = document.querySelector(".cta");
  if (!ctaSection) return;

  document.fonts.ready.then(() => {
    initCtaCopyAnimation();
    initCtaCardsAnimation();
    initCtaLogoAnimation();
    initCtaButtonAnimation();
    ScrollTrigger.refresh();
  });

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });
});

// cta section - copy text line reveal animation
function initCtaCopyAnimation() {
  const copyText = document.querySelector(".cta-copy .bodyCopy");
  if (!copyText) return;

  const split = SplitText.create(copyText, {
    type: "lines",
    linesClass: "line",
  });

  split.lines.forEach((line) => {
    const mask = document.createElement("div");
    mask.className = "line-mask";
    line.parentNode.insertBefore(mask, line);
    mask.appendChild(line);
  });

  gsap.set(split.lines, { yPercent: 100 });

  const scrollTriggerSettings = {
    trigger: ".cta",
    start: "top 25%",
    toggleActions: "play reverse play reverse",
  };

  gsap.to(split.lines, {
    yPercent: 0,
    duration: 0.5,
    ease: "power1.out",
    stagger: 0.1,
    scrollTrigger: scrollTriggerSettings,
  });
}

// cta section - cards images animation
function initCtaCardsAnimation() {
  gsap.utils.toArray(".cta-row").forEach((row, index) => {
    const cardLeft = row.querySelector(".cta-card-left");
    const cardRight = row.querySelector(".cta-card-right");

    const leftXValues = [-800, -900, -400];
    const rightXValues = [800, 900, 400];
    const leftRotationValues = [-30, -20, -35];
    const rightRotationValues = [30, 20, 35];
    const yValues = [100, -150, -400];

    gsap.to(cardLeft, {
      x: leftXValues[index],
      scrollTrigger: {
        trigger: ".cta",
        start: "top center",
        end: "150% bottom",
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          cardLeft.style.transform = `translateX(${
            progress * leftXValues[index]
          }px) translateY(${progress * yValues[index]}px) rotate(${
            progress * leftRotationValues[index]
          }deg)`;
          cardRight.style.transform = `translateX(${
            progress * rightXValues[index]
          }px) translateY(${progress * yValues[index]}px) rotate(${
            progress * rightRotationValues[index]
          }deg)`;
        },
      },
    });
  });
}

// cta section - logo scale animation
function initCtaLogoAnimation() {
  const scrollTriggerSettings = {
    trigger: ".cta",
    start: "top 25%",
    toggleActions: "play reverse play reverse",
  };

  gsap.to(".cta-logo", {
    scale: 1,
    duration: 0.5,
    ease: "power1.out",
    scrollTrigger: scrollTriggerSettings,
  });
}

// cta section - button fade in animation
function initCtaButtonAnimation() {
  const btn = document.querySelector(".cta .btn a.btn");
  if (!btn) return;

  const scrollTriggerSettings = {
    trigger: ".cta",
    start: "top 25%",
    toggleActions: "play reverse play reverse",
  };

  gsap.set(btn, { y: 25, opacity: 0 });
  gsap.to(btn, {
    y: 0,
    opacity: 1,
    duration: 0.5,
    ease: "power1.out",
    delay: 0.3,
    scrollTrigger: scrollTriggerSettings,
  });
}
