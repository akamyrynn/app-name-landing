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
  { href: "/configurator", label: "Конфигуратор" },
  { href: "/streaming", label: "Стриминг" },
  { href: "/careers", label: "Вакансии" },
];

export const STATS: Stat[] = [
  { label: "Custom Tables", value: "5K+" },
  { label: "Materials", value: "50+" },
  { label: "Happy Clients", value: "2K+" },
  { label: "Delivery", value: "24/7" },
];

export const MISSIONS: Mission[] = [
  { 
    id: "1", 
    number: "01 / 02", 
    title: "Table Configurator", 
    videoSrc: "/Corporate_streaming_service_202601130127_1j6t.mp4",
    tag: "[ Interactive Design ]", 
    href: "/configurator" 
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
  title: "Конфигуратор\nСтолешниц",
  bodyCopy: "Создайте идеальную столешницу с помощью интерактивного 3D конфигуратора. Выбирайте материалы, настраивайте размеры, добавляйте вырезы и получайте мгновенную визуализацию.",
  imageSrc: "/orbit-matter/index/hero.jpg",
  callouts: ["Version 2.0 / Live", "Status: Online"],
};

export const INTRO_DATA = {
  heading: "Furniture reimagined",
  bodyCopy: "From selecting premium materials to adjusting every dimension, our interactive configurator lets you design the perfect table. Real-time 3D visualization, instant pricing, and seamless ordering.",
};

export const CTA_DATA = {
  logoSrc: "/orbit-matter/index/logo_cta.png",
  bodyCopy: "Ready to create your custom table? Start designing now and bring your vision to life with our interactive 3D configurator.",
  buttonText: "Start Designing",
  buttonHref: "/configurator",
};

export const FOOTER_DATA = {
  heading: "Let's create something beautiful together",
  bodyCopy: "App Name is the ultimate platform for custom furniture design. Whether you're furnishing your home or streaming to millions, we've got you covered.",
  copyright: "App Name©",
  credits: ["[ @rouslanrouzmetov ]", "[ Version 2.0 / 2026 ]"],
  telegramLink: "https://t.me/rouslanrouzmetov",
};

// Table configurator options
export interface TableMaterial {
  id: string;
  name: string;
  color: string;
  roughness: number;
  metalness: number;
}

export interface TableShape {
  id: string;
  name: string;
}

export interface TableCutout {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const TABLE_MATERIALS: TableMaterial[] = [
  { id: "oak", name: "Дерево (Дуб)", color: "#8B7355", roughness: 0.8, metalness: 0 },
  { id: "walnut", name: "Дерево (Орех)", color: "#5C4033", roughness: 0.7, metalness: 0 },
  { id: "marble", name: "Камень (Мрамор)", color: "#F5F5F5", roughness: 0.2, metalness: 0.1 },
  { id: "granite", name: "Камень (Гранит)", color: "#4A4A4A", roughness: 0.3, metalness: 0.05 },
  { id: "steel", name: "Металл (Сталь)", color: "#B8B8B8", roughness: 0.4, metalness: 0.9 },
  { id: "brass", name: "Металл (Латунь)", color: "#B5A642", roughness: 0.3, metalness: 0.8 },
];

export const TABLE_SHAPES: TableShape[] = [
  { id: "rectangle", name: "Прямоугольная" },
  { id: "round", name: "Круглая" },
  { id: "trapezoid", name: "Трапеция" },
  { id: "custom", name: "Нестандартная" },
];

export const CUTOUT_TYPES = [
  { id: "sink", name: "Мойка" },
  { id: "cooktop", name: "Варочная панель" },
  { id: "grill", name: "Решётка" },
  { id: "technical", name: "Техническое отверстие" },
];
