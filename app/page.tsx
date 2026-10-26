import { PageReadyProvider } from "@/components/providers/PageReady";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Evidence } from "@/components/sections/Evidence";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Stack } from "@/components/sections/Stack";
import { Preloader } from "@/components/ui/Preloader";
import { SiteNav } from "@/components/ui/SiteNav";
import { socials } from "@/data/contact";
import { siteUrl } from "@/lib/site";

// Regenerate the static page every 6 hours so GitHub data stays fresh.
export const revalidate = 21600;

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Panji Putra Ardian",
  alternateName: "NJOEL",
  jobTitle: "Associate Developer",
  url: siteUrl,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Malang",
    addressCountry: "Indonesia",
  },
  sameAs: socials.map((s) => s.url),
};

export default function Home() {
  return (
    <PageReadyProvider>
      <SmoothScroll>
        <script
          type="application/ld+json"
          // "<" is escaped so the JSON can never close the script tag.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Preloader />
        <a
          href="#main"
          className="sr-only-focusable fixed top-3 left-3 z-[1100] rounded-pill bg-accent px-5 py-3 font-sans text-[15px] font-medium text-bg"
        >
          Skip to content
        </a>
        <SiteNav />
        <main id="main" tabIndex={-1}>
          <Hero />
          <About />
          <Stack />
          <Evidence />
          <Experience />
          <Contact />
        </main>
        <Footer />
      </SmoothScroll>
    </PageReadyProvider>
  );
}
