"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mission } from "../../utils/pageData";
import "./FeaturedMissionsSection.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface FeaturedMissionsSectionProps {
  heading: string;
  missions: Mission[];
}

export default function FeaturedMissionsSection({
  heading,
  missions,
}: FeaturedMissionsSectionProps) {
  const headerRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Sticky header animation
  useEffect(() => {
    const headerEl = headerRef.current;
    const listEl = listRef.current;

    if (!headerEl || !listEl) return;

    ScrollTrigger.create({
      trigger: headerEl,
      start: "top top",
      endTrigger: listEl,
      end: "bottom bottom",
      pin: true,
      pinSpacing: false,
    });
  }, []);

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

  const headingLines = heading.split("\n");

  return (
    <>
      <section className="featured-missions-header" ref={headerRef}>
        <h1 ref={headingRef}>
          {headingLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < headingLines.length - 1 && <br />}
            </span>
          ))}
        </h1>
      </section>

      <section className="featured-missions" ref={listRef}>
        <div className="featured-missions-list">
          {missions.map((mission) => (
            <Link
              key={mission.id}
              href={mission.href}
              className="featured-missions-item"
            >
              <p>{mission.number}</p>
              <h3>{mission.title}</h3>
              <div className="featured-mission-item-img">
                {mission.videoSrc ? (
                  <video
                    src={mission.videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : mission.imageSrc ? (
                  <Image
                    src={mission.imageSrc}
                    alt={mission.title}
                    width={600}
                    height={360}
                    style={{ objectFit: "cover" }}
                  />
                ) : null}
              </div>
              <p>{mission.tag}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
