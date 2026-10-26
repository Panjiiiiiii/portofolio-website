import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, JetBrains_Mono } from "next/font/google";
import { hero } from "@/data/site";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--nf-display",
  display: "swap",
});

const body = Geist({
  subsets: ["latin"],
  variable: "--nf-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--nf-mono",
  display: "swap",
});

const title = "NJOEL | Panji Putra Ardian";
const description = hero.tagline;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "NJOEL",
    title,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

// Runs before first paint: marks JS as available (enables GSAP initial states)
// and hides the preloader if it was already shown this session.
const bootScript = `try{var d=document.documentElement;d.classList.add('js');if(sessionStorage.getItem('njoel:preloaded')==='1')d.setAttribute('data-preloaded','')}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        {children}
        <noscript>
          <style>{"#preloader{display:none}"}</style>
        </noscript>
      </body>
    </html>
  );
}
