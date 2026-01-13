import gsap from "gsap";

const TRACES_DATA = [
  {
    name: "Haven",
    img: "/traces/trace_img_01.jpg",
    tag: "Dome Settlement",
  },
  {
    name: "Longstrider",
    img: "/traces/trace_img_02.jpg",
    tag: "Field Transport",
  },
  {
    name: "Verdant Colonies",
    img: "/traces/trace_img_03.jpg",
    tag: "Eco Habitat",
  },
  {
    name: "Suncross",
    img: "/traces/trace_img_04.jpg",
    tag: "Surface Journey",
  },
  {
    name: "Red Bluffs",
    img: "/traces/trace_img_05.jpg",
    tag: "Highland District",
  },
  {
    name: "Moonshore",
    img: "/traces/trace_img_06.jpg",
    tag: "Polar Settlement",
  },
  {
    name: "Solspire",
    img: "/traces/trace_img_07.jpg",
    tag: "Solar Tower",
  },
  {
    name: "Frostline Basin",
    img: "/traces/trace_img_08.jpg",
    tag: "Glacial Plains",
  },
  {
    name: "Emberhold",
    img: "/traces/trace_img_09.jpg",
    tag: "Volcanic Outpost",
  },
  {
    name: "The Gate",
    img: "/traces/trace_img_010.jpg",
    tag: "Ancient Structure",
  },
];

const SPACING = 0.4;
const SLIDE_WIDTH = SPACING * 1000;

let currentProductIndex = 0;
let slideItems = [];
let isPreviewAnimating = false;
let isPreviewOpen = false;
let BUFFER_SIZE = 3;

document.addEventListener("DOMContentLoaded", () => {
  initTracesSlider();
  initTracesAnimations();
});

// traces section - slider and preview initialization
function initTracesSlider() {
  const tracesContainer = document.querySelector(".traces");
  const traceName = document.querySelector(".trace-name p");
  const tracePreview = document.querySelector(".traces-preview");
  const tracePreviewName = document.querySelector(".traces-preview-name h3");
  const tracePreviewImg = document.querySelector(".traces-preview-img img");
  const tracePreviewTag = document.querySelector(".traces-preview-tag p");
  const controllerInner = document.querySelector(".controller-inner");
  const controllerOuter = document.querySelector(".controller-outer");
  const traceControllerCloseIconSpan = document.querySelectorAll(
    ".controller-close-icon span"
  );
  const traceControllerPrevBtn = document.querySelector(
    ".traces-controller-nav-btn.prev"
  );
  const traceControllerNextBtn = document.querySelector(
    ".traces-controller-nav-btn.next"
  );

  if (
    !tracesContainer ||
    !traceName ||
    !tracePreview ||
    !tracePreviewName ||
    !tracePreviewImg ||
    !tracePreviewTag ||
    !controllerInner ||
    !controllerOuter ||
    !traceControllerPrevBtn ||
    !traceControllerNextBtn
  ) {
    return;
  }

  function getBufferSize() {
    return window.innerWidth < 1000 ? 1 : 3;
  }

  function addSlideItem(relativeIndex) {
    const productIndex =
      (((currentProductIndex + relativeIndex) % TRACES_DATA.length) +
        TRACES_DATA.length) %
      TRACES_DATA.length;
    const product = TRACES_DATA[productIndex];

    const li = document.createElement("li");
    li.innerHTML = `<div class="product-item-bg-wrapper"><div class="product-item-bg"></div></div><div class="outline-wrapper"><div class="product-bg-outline"></div></div><div class="product-img-wrapper"><img src="${product.img}" alt="${product.name}" /></div>`;
    li.dataset.relativeIndex = relativeIndex;

    gsap.set(li, {
      x: relativeIndex * SLIDE_WIDTH,
      scale: 0,
      zIndex: relativeIndex === 0 ? 100 : 1,
      force3D: true,
    });

    tracesContainer.appendChild(li);
    slideItems.push({ element: li, relativeIndex: relativeIndex });
  }

  function removeSlideItem(relativeIndex) {
    const itemIndex = slideItems.findIndex(
      (item) => item.relativeIndex === relativeIndex
    );
    if (itemIndex !== -1) {
      const item = slideItems[itemIndex];
      item.element.remove();
      slideItems.splice(itemIndex, 1);
    }
  }

  function updateSliderPosition() {
    const tl = gsap.timeline();

    slideItems.forEach((item) => {
      const isActive = item.relativeIndex === 0;
      tl.to(
        item.element,
        {
          x: item.relativeIndex * SLIDE_WIDTH,
          scale: isActive ? 1.1 : 0.75,
          zIndex: isActive ? 100 : 1,
          duration: 0.75,
          ease: "power3.out",
          force3D: true,
        },
        0
      );
    });
  }

  function updatetraceName() {
    const actualIndex =
      ((currentProductIndex % TRACES_DATA.length) + TRACES_DATA.length) %
      TRACES_DATA.length;
    traceName.textContent = TRACES_DATA[actualIndex].name;
  }

  function updatePreviewContent() {
    const actualIndex =
      ((currentProductIndex % TRACES_DATA.length) + TRACES_DATA.length) %
      TRACES_DATA.length;
    const currentProduct = TRACES_DATA[actualIndex];
    tracePreviewName.textContent = currentProduct.name;
    tracePreviewImg.src = currentProduct.img;
    tracePreviewImg.alt = currentProduct.name;
    tracePreviewTag.textContent = currentProduct.tag;
  }

  function moveNext() {
    if (isPreviewAnimating || isPreviewOpen) return;

    currentProductIndex++;
    removeSlideItem(-BUFFER_SIZE);
    slideItems.forEach((item) => {
      item.relativeIndex--;
      item.element.dataset.relativeIndex = item.relativeIndex;
    });
    addSlideItem(BUFFER_SIZE);
    updateSliderPosition();
    updatetraceName();
    updatePreviewContent();
  }

  function movePrev() {
    if (isPreviewAnimating || isPreviewOpen) return;

    currentProductIndex--;
    removeSlideItem(BUFFER_SIZE);
    slideItems.forEach((item) => {
      item.relativeIndex++;
      item.element.dataset.relativeIndex = item.relativeIndex;
    });
    addSlideItem(-BUFFER_SIZE);
    updateSliderPosition();
    updatetraceName();
    updatePreviewContent();
  }

  function updateButtonStates() {
    if (isPreviewAnimating || isPreviewOpen) {
      traceControllerPrevBtn.classList.add("disabled");
      traceControllerNextBtn.classList.add("disabled");
    } else {
      traceControllerPrevBtn.classList.remove("disabled");
      traceControllerNextBtn.classList.remove("disabled");
    }
  }

  function getActiveSlide() {
    return slideItems.find((item) => item.relativeIndex === 0);
  }

  function animateSideItems(hide = false) {
    const activeSlide = getActiveSlide();

    slideItems.forEach((item) => {
      const absIndex = Math.abs(item.relativeIndex);
      if (absIndex === 1 || absIndex === 2) {
        gsap.to(item.element, {
          x: hide
            ? item.relativeIndex * SLIDE_WIDTH * 1.5
            : item.relativeIndex * SLIDE_WIDTH,
          opacity: hide ? 0 : 1,
          duration: 0.75,
          ease: "power3.inOut",
          force3D: true,
        });
      }
    });

    if (activeSlide) {
      gsap.to(activeSlide.element, {
        scale: hide ? 0.75 : 1.1,
        opacity: hide ? 0 : 1,
        duration: 0.75,
        ease: "power3.inOut",
        force3D: true,
      });
    }
  }

  function animateControllerTransition(opening = false) {
    const navEls = [".controller-label p", ".traces-controller-nav-btn"];

    gsap.to(navEls, {
      opacity: opening ? 0 : 1,
      duration: 0.2,
      ease: "power3.out",
      delay: opening ? 0 : 0.4,
    });

    gsap.to(controllerOuter, {
      clipPath: opening ? "circle(0% at 50% 50%)" : "circle(50% at 50% 50%)",
      duration: 0.75,
      ease: "power3.inOut",
    });

    gsap.to(controllerInner, {
      clipPath: opening ? "circle(50% at 50% 50%)" : "circle(40% at 50% 50%)",
      duration: 0.75,
      ease: "power3.inOut",
    });

    gsap.to(traceControllerCloseIconSpan, {
      width: opening ? "20px" : "0px",
      duration: opening ? 0.4 : 0.3,
      ease: opening ? "power3.out" : "power3.in",
      stagger: opening ? 0.1 : 0.05,
      delay: opening ? 0.2 : 0,
    });
  }

  function togglePreview() {
    if (isPreviewAnimating) return;

    isPreviewAnimating = true;
    updateButtonStates();

    if (!isPreviewOpen) updatePreviewContent();

    gsap.to(tracePreview, {
      y: isPreviewOpen ? "100%" : "-50%",
      duration: 0.75,
      ease: "power3.inOut",
    });

    animateSideItems(!isPreviewOpen);
    animateControllerTransition(!isPreviewOpen);

    setTimeout(() => {
      isPreviewAnimating = false;
      isPreviewOpen = !isPreviewOpen;
      updateButtonStates();
    }, 600);
  }

  function clearSlider() {
    slideItems.forEach((item) => {
      item.element.remove();
    });
    slideItems = [];
  }

  function rebuildSlider() {
    clearSlider();
    BUFFER_SIZE = getBufferSize();
    for (let i = -BUFFER_SIZE; i <= BUFFER_SIZE; i++) {
      addSlideItem(i);
    }
    updateSliderPosition();
    updatetraceName();
    updatePreviewContent();
    updateButtonStates();
  }

  function initializeSlider() {
    BUFFER_SIZE = getBufferSize();
    for (let i = -BUFFER_SIZE; i <= BUFFER_SIZE; i++) {
      addSlideItem(i);
    }

    slideItems.forEach((item) => {
      const isActive = item.relativeIndex === 0;
      gsap.set(item.element, {
        x: item.relativeIndex * SLIDE_WIDTH,
        zIndex: isActive ? 100 : 1,
      });
    });

    slideItems.forEach((item) => {
      const isActive = item.relativeIndex === 0;
      gsap.to(item.element, {
        scale: isActive ? 1.1 : 0.75,
        duration: 1,
        ease: "power3.out",
        delay: 0.5,
      });
    });

    updatetraceName();
    updatePreviewContent();
    updateButtonStates();
  }

  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newBufferSize = getBufferSize();
      if (newBufferSize !== BUFFER_SIZE) {
        rebuildSlider();
      }
    }, 150);
  }

  let resizeTimeout;
  traceControllerPrevBtn.addEventListener("click", movePrev);
  traceControllerNextBtn.addEventListener("click", moveNext);
  controllerInner.addEventListener("click", togglePreview);
  window.addEventListener("resize", handleResize);

  initializeSlider();
}

// traces section - slide in animations for nav, footer, and controller
function initTracesAnimations() {
  const tracesNav = document.querySelector(".traces-nav");
  const tracesFooter = document.querySelector(".traces-footer");
  const controller = document.querySelector(".traces-slider .controller");

  if (tracesNav) {
    gsap.set(tracesNav, { y: -100 });
    gsap.to(tracesNav, {
      y: 0,
      duration: 1,
      ease: "power3.out",
      delay: 0.5,
    });
  }

  if (tracesFooter) {
    gsap.set(tracesFooter, { y: 100 });
    gsap.to(tracesFooter, {
      y: 0,
      duration: 1,
      ease: "power3.out",
      delay: 0.5,
    });
  }

  if (controller) {
    gsap.set(controller, { y: 300 });
    gsap.to(controller, {
      y: 0,
      duration: 1,
      ease: "power3.out",
      delay: 0.5,
    });
  }
}
