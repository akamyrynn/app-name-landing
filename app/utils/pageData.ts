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
  // PBR Texture paths (optional - if not provided, uses color)
  textures?: {
    color: string;
    normal: string;
    roughness: string;
  };
}

export interface TableCoating {
  id: string;
  name: string;
  color: string; // Tint color for the coating
  clearcoat: number; // 0 = none, 1 = full gloss
  clearcoatRoughness: number;
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
  rotation: number;
}

export const TABLE_MATERIALS: TableMaterial[] = [
  {
    id: "wood051",
    name: "Материал 1 (1K)",
    color: "#C4A77D",
    roughness: 0.8,
    metalness: 0,
    textures: {
      color: "/textures/Wood051_1K-JPG/Wood051_1K-JPG_Color.jpg",
      normal: "/textures/Wood051_1K-JPG/Wood051_1K-JPG_NormalGL.jpg",
      roughness: "/textures/Wood051_1K-JPG/Wood051_1K-JPG_Roughness.jpg",
    }
  },
  {
    id: "wood084",
    name: "Материал 2 (1K)",
    color: "#5C4033",
    roughness: 0.7,
    metalness: 0,
    textures: {
      color: "/textures/Wood084B_1K-JPG/Wood084B_1K-JPG_Color.jpg",
      normal: "/textures/Wood084B_1K-JPG/Wood084B_1K-JPG_NormalGL.jpg",
      roughness: "/textures/Wood084B_1K-JPG/Wood084B_1K-JPG_Roughness.jpg",
    }
  },
  {
    id: "woodfloor048",
    name: "Материал 3 (1K)",
    color: "#A0826D",
    roughness: 0.6,
    metalness: 0,
    textures: {
      color: "/textures/WoodFloor048_1K-JPG/WoodFloor048_1K-JPG_Color.jpg",
      normal: "/textures/WoodFloor048_1K-JPG/WoodFloor048_1K-JPG_NormalGL.jpg",
      roughness: "/textures/WoodFloor048_1K-JPG/WoodFloor048_1K-JPG_Roughness.jpg",
    }
  },
  {
    id: "wood069",
    name: "Материал 4 (2K)",
    color: "#B8956E",
    roughness: 0.75,
    metalness: 0,
    textures: {
      color: "/textures/Wood069_2K-JPG/Wood069_2K-JPG_Color.jpg",
      normal: "/textures/Wood069_2K-JPG/Wood069_2K-JPG_NormalGL.jpg",
      roughness: "/textures/Wood069_2K-JPG/Wood069_2K-JPG_Roughness.jpg",
    }
  },
  {
    id: "wood009",
    name: "4K Тест",
    color: "#C9B896",
    roughness: 0.7,
    metalness: 0,
    textures: {
      color: "/textures/Wood009_4K-JPG/Wood009_4K-JPG_Color.jpg",
      normal: "/textures/Wood009_4K-JPG/Wood009_4K-JPG_NormalGL.jpg",
      roughness: "/textures/Wood009_4K-JPG/Wood009_4K-JPG_Roughness.jpg",
    }
  },
];

// OSMO Oil Coating - только коды
export const TABLE_COATINGS: TableCoating[] = [
  { id: "none", name: "—", color: "transparent", clearcoat: 0, clearcoatRoughness: 1 },
  { id: "osmo-3032", name: "3032", color: "#F5E6D3", clearcoat: 0.4, clearcoatRoughness: 0.5 },
  { id: "osmo-3062", name: "3062", color: "#EDE0CC", clearcoat: 0.25, clearcoatRoughness: 0.7 },
  { id: "osmo-3040", name: "3040", color: "#F8F4ED", clearcoat: 0.35, clearcoatRoughness: 0.5 },
  { id: "osmo-3067", name: "3067", color: "#B8B5AD", clearcoat: 0.4, clearcoatRoughness: 0.45 },
  { id: "osmo-3074", name: "3074", color: "#4A4A48", clearcoat: 0.5, clearcoatRoughness: 0.35 },
  { id: "osmo-3044", name: "3044", color: "#C9A869", clearcoat: 0.4, clearcoatRoughness: 0.45 },
  { id: "osmo-3073", name: "3073", color: "#8B6914", clearcoat: 0.45, clearcoatRoughness: 0.4 },
  { id: "osmo-3075", name: "3075", color: "#1C1C1C", clearcoat: 0.55, clearcoatRoughness: 0.3 },
  { id: "osmo-3028", name: "3028", color: "#D4A34C", clearcoat: 0.4, clearcoatRoughness: 0.45 },
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
