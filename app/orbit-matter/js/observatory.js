import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  initRoutineSlider();
  initTeamCards();
});

// routine section - slider scroll animation with progress bar
function initRoutineSlider() {
  const sliderWrapper = document.querySelector(".routine-slider-wrapper");
  const progressBar = document.querySelector(".routine-progress");
  if (!sliderWrapper || !progressBar) return;

  const sliderContainer = sliderWrapper.parentElement;

  function calculateMaxTranslate() {
    const containerWidth = sliderContainer.offsetWidth;
    const wrapperWidth = sliderWrapper.offsetWidth;
    return -(wrapperWidth - containerWidth);
  }

  ScrollTrigger.create({
    trigger: ".routine",
    start: "top top",
    end: `+=${window.innerHeight * 5}px`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress;
      const maxTranslateX = calculateMaxTranslate();

      gsap.set(sliderWrapper, { x: progress * maxTranslateX });
      gsap.set(progressBar, { scaleX: progress });
    },
  });
}

// team section - cards arc animation and counter
function initTeamCards() {
  const stickySection = document.querySelector(".team");
  const cards = document.querySelectorAll(".card");
  const countContainer = document.querySelector(".count-container");
  if (!stickySection || !cards.length || !countContainer) return;

  const stickyHeight = window.innerHeight * 7;
  const totalCards = cards.length;

  function getRadius() {
    return window.innerWidth < 900
      ? window.innerWidth * 7.5
      : window.innerWidth * 2.5;
  }

  const arcAngle = Math.PI * 0.4;
  const startAngle = Math.PI / 2 - arcAngle / 2;

  function positionCards(progress = 0) {
    const radius = getRadius();
    const cardSpacing = 0.15;
    const initialOffset = -cardSpacing * (totalCards - 1);
    const totalTravel = 1 - initialOffset;
    const arcProgress = initialOffset + progress * totalTravel;

    cards.forEach((card, i) => {
      const cardOffset = (totalCards - 1 - i) * cardSpacing;
      const cardProgress = cardOffset + arcProgress;
      const angle = startAngle + arcAngle * cardProgress;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const rotation = (angle - Math.PI / 2) * (180 / Math.PI);

      gsap.set(card, {
        x: x,
        y: -y + radius,
        rotation: -rotation,
        transformOrigin: "center center",
      });
    });
  }

  function updateTeamCounter(progress) {
    const positions = [150, 0, -150, -300, -450, -600, -750];
    const startProgress = 0.15;
    const endProgress = 0.9;
    const range = endProgress - startProgress;

    let index;
    if (progress < startProgress) {
      index = 0;
    } else if (progress > endProgress) {
      index = 6;
    } else {
      const normalizedProgress = (progress - startProgress) / range;
      index = Math.min(6, Math.floor(normalizedProgress * 7));
    }

    const targetY = positions[index];

    gsap.to(countContainer, {
      y: targetY,
      duration: 0.3,
      ease: "power1.out",
      overwrite: true,
    });
  }

  positionCards(0);
  updateTeamCounter(0);

  ScrollTrigger.create({
    trigger: stickySection,
    start: "top top",
    end: `+=${stickyHeight}px`,
    pin: true,
    pinSpacing: true,
    onUpdate: (self) => {
      positionCards(self.progress);
      updateTeamCounter(self.progress);
    },
  });

  window.addEventListener("resize", () => positionCards(0));
}
