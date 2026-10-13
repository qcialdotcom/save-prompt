// src/configs/routes.ts

export interface Route {
  path: string;
  name: string;
}

export const HOME_ROUTE: Route = {
  path: "/",
  name: "Home",
};

export const DOWNLOAD_ROUTE: Route = {
  path: "/#download",
  name: "Download",
};

export const FEATURES_ROUTE: Route = {
  path: "/#features",
  name: "Features",
};

export const HOW_IT_WORKS_ROUTE: Route = {
  path: "/#how-it-works",
  name: "How it works",
};

export const PRIVACY_ROUTE: Route = {
  path: "/#privacy",
  name: "Privacy",
};

export const ROADMAP_ROUTE: Route = {
  path: "/#roadmap",
  name: "Roadmap",
};

export const FAQ_ROUTE: Route = {
  path: "/#faq",
  name: "FAQ",
};
