"use client";

import Image from "next/image";
import { CTACard } from "../../utils/pageData";
import "./ShowcaseSection.css";

interface ShowcaseSectionProps {
  cards: CTACard[];
}

export default function ShowcaseSection({ cards }: ShowcaseSectionProps) {
  return (
    <section className="showcase">
      <div className="showcase-container">
        <div className="showcase-header">
          <h2>App in Action</h2>
          <p className="bodyCopy">See how teams and creators use App Name every day</p>
        </div>
        
        <div className="showcase-cards">
          {cards.map((card, index) => (
            <div className="showcase-card" key={index}>
              <div className="showcase-card-frame">
                <div className="showcase-card-img">
                  <Image
                    src={card.imageSrc}
                    alt={card.alt}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="showcase-card-gradient" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
