import { SITE_INFO } from "./site";

interface FaviconConfig {
  rel: string;
  href: string;
  type: string;
  sizes?: string;
}

export const FAVICONS: FaviconConfig[] = [
  { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "apple-touch-icon", href: "/logo.png", type: "image/png" },
];

export interface SeoMetaOptions {
  title: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
}

export interface OpenGraphConfig {
  basic: { title: string; type: "website"; image: string; url: string };
  optional: { description: string; locale: string; siteName: string };
  image: {
    url: string;
    secureUrl: string;
    type: string;
    width: number;
    height: number;
    alt: string;
  };
}

export function createOpenGraphConfig({
  title,
  description,
  url,
  image,
  imageAlt,
}: SeoMetaOptions): OpenGraphConfig {
  return {
    basic: { title, type: "website", image, url },
    optional: { description, locale: "en_US", siteName: SITE_INFO.name },
    image: {
      url: image,
      secureUrl: image,
      type: "image/png",
      width: SITE_INFO.ogImage.width,
      height: SITE_INFO.ogImage.height,
      alt: imageAlt,
    },
  };
}

export interface TwitterCardConfig {
  card: "summary_large_image";
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

export function createTwitterCardConfig({
  title,
  description,
  image,
  imageAlt,
}: SeoMetaOptions): TwitterCardConfig {
  return { card: "summary_large_image", title, description, image, imageAlt };
}

export function createSeoExtendConfig(keywords: string[]) {
  return {
    link: [{ rel: "alternate", href: SITE_INFO.url, hreflang: "en" }],
    meta: [
      { name: "author", content: SITE_INFO.name },
      { name: "keywords", content: keywords.join(", ") },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      {
        name: "theme-color",
        content: SITE_INFO.themeColor.light,
        media: "(prefers-color-scheme: light)",
      },
      {
        name: "theme-color",
        content: SITE_INFO.themeColor.dark,
        media: "(prefers-color-scheme: dark)",
      },
    ],
  };
}
