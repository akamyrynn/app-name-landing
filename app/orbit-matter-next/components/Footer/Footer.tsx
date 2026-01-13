"use client";

import Link from "next/link";
import { SocialLink } from "../../utils/pageData";
import "./Footer.css";

interface FooterProps {
  heading: string;
  bodyCopy: string;
  copyright: string;
  credits: string[];
  socialLinks: SocialLink[];
  telegramLink?: string;
}

export default function Footer({
  heading,
  bodyCopy,
  copyright,
  credits,
  socialLinks,
  telegramLink,
}: FooterProps) {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-bg-container" />

        <div className="footer-content">
          <div className="footer-content-meta">
            <div className="footer-content-col">
              <h3>{heading}</h3>

              <div className="footer-form">
                <input type="text" placeholder="Unit Address" />
              </div>
            </div>

            <div className="footer-content-col">
              <p className="bodyCopy">{bodyCopy}</p>

              <div className="footer-socials">
                {socialLinks.map((link, index) => (
                  <div className="footer-social" key={index}>
                    <Link href={link.href}>{link.label}</Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="footer-content-meta">
            <div className="footer-content-col">
              {credits.map((credit, index) => (
                <p key={index}>
                  {telegramLink && credit.includes("@") ? (
                    <Link href={telegramLink} target="_blank" rel="noopener noreferrer">
                      {credit}
                    </Link>
                  ) : (
                    credit
                  )}
                </p>
              ))}
            </div>

            <div className="footer-content-col">
              <h1>{copyright}</h1>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
