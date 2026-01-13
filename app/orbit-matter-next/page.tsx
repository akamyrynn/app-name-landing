"use client";

import { useEffect, useState } from "react";
import GooFilter from "./components/GooFilter";
import Navigation from "./components/Navigation";
import Preloader from "./components/Preloader";
import InteractiveGrid from "./components/InteractiveGrid";
import TransitionGrid from "./components/TransitionGrid";
import HeroSection from "./components/HeroSection";
import IntroSection from "./components/IntroSection";
import FeaturedMissionsSection from "./components/FeaturedMissionsSection";
import CTASection from "./components/CTASection";
import ShowcaseSection from "./components/ShowcaseSection";
import Footer from "./components/Footer";
import { useLenis } from "./hooks/useLenis";
import {
  NAV_LINKS,
  STATS,
  MISSIONS,
  CTA_CARDS,
  SOCIAL_LINKS,
  HERO_DATA,
  INTRO_DATA,
  CTA_DATA,
  FOOTER_DATA,
} from "./utils/pageData";

export default function OrbitMatterHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [showTransition, setShowTransition] = useState(false);

  // Initialize Lenis smooth scroll
  useLenis();

  // Handle preloader completion
  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  // Handle navigation click for page transitions
  const handleNavClick = (href: string) => {
    if (href !== "/") {
      setShowTransition(true);
      // Navigate after transition animation
      setTimeout(() => {
        window.location.href = href;
      }, 800);
    }
  };

  return (
    <>
      <GooFilter />
      
      {isLoading && <Preloader onComplete={handlePreloaderComplete} isVisible={isLoading} />}
      
      {showTransition && <TransitionGrid />}
      
      <InteractiveGrid />
      
      <Navigation 
        links={NAV_LINKS} 
        onLinkClick={handleNavClick}
      />

      <main>
        <HeroSection
          title={HERO_DATA.title}
          bodyCopy={HERO_DATA.bodyCopy}
          imageSrc={HERO_DATA.imageSrc}
          callouts={HERO_DATA.callouts}
          isPreloaderShowing={isLoading}
        />

        <IntroSection
          stats={STATS}
          heading={INTRO_DATA.heading}
          bodyCopy={INTRO_DATA.bodyCopy}
          isPreloaderShowing={isLoading}
        />

        <FeaturedMissionsSection 
          heading="Our\nSolutions"
          missions={MISSIONS} 
        />

        <CTASection
          logoSrc={CTA_DATA.logoSrc}
          bodyCopy={CTA_DATA.bodyCopy}
          buttonText={CTA_DATA.buttonText}
          buttonHref={CTA_DATA.buttonHref}
        />

        <ShowcaseSection cards={CTA_CARDS[0]} />

        <Footer
          heading={FOOTER_DATA.heading}
          bodyCopy={FOOTER_DATA.bodyCopy}
          copyright={FOOTER_DATA.copyright}
          credits={FOOTER_DATA.credits}
          socialLinks={SOCIAL_LINKS}
          telegramLink={FOOTER_DATA.telegramLink}
        />
      </main>
    </>
  );
}
