export interface NavLink {
  href: string;
  label: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface Mission {
  id: string;
  number: string;
  title: string;
  videoSrc?: string;
  imageSrc?: string;
  tag: string;
  href: string;
}

export interface CTACard {
  imageSrc: string;
  alt: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Главная" },
  { href: "/corporate", label: "Корп связь" },
  { href: "/streaming", label: "Стриминг" },
  { href: "/careers", label: "Вакансии" },
];

export const STATS: Stat[] = [
  { label: "Active Users", value: "2M+" },
  { label: "Countries", value: "120" },
  { label: "Uptime", value: "99.9%" },
  { label: "Support", value: "24/7" },
];

export const MISSIONS: Mission[] = [
  { 
    id: "1", 
    number: "01 / 02", 
    title: "Corporate Connect", 
    videoSrc: "/Corporate_streaming_service_202601130127_1j6t.mp4",
    tag: "[ Enterprise Solution ]", 
    href: "/corporate" 
  },
  { 
    id: "2", 
    number: "02 / 02", 
    title: "Live Streaming", 
    videoSrc: "/Not_games__1080p_202601130104.mp4",
    tag: "[ Broadcasting Platform ]", 
    href: "/streaming" 
  },
];

export const CTA_CARDS: CTACard[][] = [
  [
    { imageSrc: "/orbit-matter/index/cta_img_01.jpg", alt: "App screenshot 1" },
    { imageSrc: "/orbit-matter/index/cta_img_02.jpg", alt: "App screenshot 2" },
  ],
];

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "[ Twitter ]", href: "/contact" },
  { label: "[ LinkedIn ]", href: "/contact" },
  { label: "[ GitHub ]", href: "/contact" },
  { label: "[ Discord ]", href: "/contact" },
];

export const HERO_DATA = {
  title: "Connect\nEverywhere",
  bodyCopy: "Seamless video conferencing and live streaming platform for teams and creators. Crystal clear quality, enterprise-grade security.",
  imageSrc: "/orbit-matter/index/hero.jpg",
  callouts: ["Version 2.0 / Live", "Status: Online"],
};

export const INTRO_DATA = {
  heading: "Communication reimagined",
  bodyCopy: "From boardroom meetings to global broadcasts, App Name delivers flawless video experiences. HD streaming, real-time collaboration, and enterprise security built for the modern workplace.",
};

export const CTA_DATA = {
  logoSrc: "/orbit-matter/index/logo_cta.png",
  bodyCopy: "Ready to transform your communication? Start your free trial today and experience the future of video collaboration.",
  buttonText: "Start Free Trial",
  buttonHref: "/contact",
};

export const FOOTER_DATA = {
  heading: "Let's connect and build together",
  bodyCopy: "App Name is the all-in-one platform for video communication. Whether you're hosting a team meeting or streaming to millions, we've got you covered.",
  copyright: "App Name©",
  credits: ["[ @rouslanrouzmetov ]", "[ Version 2.0 / 2026 ]"],
  telegramLink: "https://t.me/rouslanrouzmetov",
};
