"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { NavLink } from "../../utils/pageData";
import { MOBILE_BREAKPOINT } from "../../utils/constants";
import "./Navigation.css";

interface NavigationProps {
  links: NavLink[];
  onLinkClick?: (href: string) => void;
}

export default function Navigation({ links, onLinkClick }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT) {
      e.stopPropagation();
      setIsOpen((prev) => !prev);
    }
  }, []);

  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT) {
      e.stopPropagation();
      setTimeout(() => setIsOpen(false), 300);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className={isOpen ? "nav-open" : ""}>
      <div className="nav-container">
        <div className="nav-bg"></div>
      </div>

      <div className="nav-mobile-header" onClick={handleToggle}>
        <p className="nav-logo">Orbit Matter</p>
        <p className="nav-menu-toggle">Menu</p>
      </div>

      <div className="nav-overlay">
        <div className="nav-items">
          {links.map((link) => (
            <div key={link.href} className="nav-item">
              <Link href={link.href} onClick={handleLinkClick}>
                {link.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
