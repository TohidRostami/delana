import siteConfigJson from "@/content/site-config.json";

export type NavLink = { label: string; href: string };
export type FooterColumn = { title: string; links: NavLink[] };
export type CategoryConfig = { slug: string; title: string; description: string };
export type ShippingMethodKey = "POST" | "TIPAX";
export type IconKey =
  | "truck"
  | "return"
  | "shield"
  | "headset"
  | "fabric"
  | "needle"
  | "hanger";

export type SiteConfig = {
  site: {
    name: string;
    nameLatin: string;
    tagline: string;
    shortDescription: string;
    description: string;
    url: string;
    locale: string;
    keywords: string[];
  };
  theme: {
    colors: Record<string, string>;
    radius: string;
  };
  contact: {
    phone: string;
    mobile: string;
    email: string;
    address: string;
    mapUrl: string;
    workingHours: string;
  };
  social: { instagram: string; telegram: string; whatsapp: string };
  nav: {
    main: NavLink[];
    categoryMenu: {
      clothingTitle: string;
      accessoriesTitle: string;
      accessorySlugs: string[];
      extraLinks: (NavLink & { tone?: "sale" })[];
      promo: { title: string; subtitle: string; href: string; image: string };
    };
    footerColumns: FooterColumn[];
    legalLinks: NavLink[];
  };
  home: {
    hero: {
      eyebrow: string;
      headline: string[];
      subheadline: string;
      ctaPrimary: NavLink;
      fallbackImage: string;
      fallbackAlt: string;
    };
    categoriesTitle: string;
    homeCategorySlugs: string[];
    latest: {
      title: string;
      subtitle: string;
      tabs: { label: string; slugs: string[] }[];
    };
    promos: {
      party: {
        eyebrow: string;
        title: string;
        body: string;
        cta: NavLink;
        image: string;
      };
      sale: {
        badge: string;
        title: string;
        body: string;
        cta: NavLink;
        image: string;
      };
    };
    valueProps: { icon: IconKey; title: string; description: string }[];
  };
  shipping: {
    methods: Record<ShippingMethodKey, { label: string; description: string }>;
    returnDays: number;
  };
  about: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    image: string;
    pillarsTitle: string;
    pillars: { icon: IconKey; title: string; body: string }[];
    quote: { text: string; author: string };
    collectionTitle: string;
  };
  contactPage: { title: string; intro: string; hoursLabel: string };
  faq: {
    title: string;
    groups: {
      id: string;
      title: string;
      items: { q: string; a: string }[];
    }[];
  };
  notFound: { title: string; body: string; suggestionsTitle: string };
  search: { placeholder: string; popular: string[] };
  ui: Record<string, string>;
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
  };
};

export const siteConfig = siteConfigJson as unknown as SiteConfig;
