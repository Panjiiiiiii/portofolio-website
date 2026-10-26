// Brand logos come from the `simple-icons` package (CC0). Nothing is hand-drawn or invented.
import {
  siExpo,
  siExpress,
  siFigma,
  siGithub,
  siLaravel,
  siNextdotjs,
  siPostgresql,
  siReact,
} from "simple-icons";

export type BrandIcon = { title: string; path: string };

/**
 * simple-icons has no separate React Native mark, so React Native uses the React logo
 * (React Native is built on React). Every other id maps to its own logo.
 */
export const brandIcons: Record<string, BrandIcon> = {
  nextjs: { title: "Next.js", path: siNextdotjs.path },
  laravel: { title: "Laravel", path: siLaravel.path },
  express: { title: "Express.js", path: siExpress.path },
  postgresql: { title: "PostgreSQL", path: siPostgresql.path },
  reactnative: { title: "React Native", path: siReact.path },
  expo: { title: "Expo", path: siExpo.path },
  github: { title: "GitHub", path: siGithub.path },
  figma: { title: "Figma", path: siFigma.path },
};
