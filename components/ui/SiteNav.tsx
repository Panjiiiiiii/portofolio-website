"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  EnvelopeSimple,
  FolderSimple,
  House,
  Stack,
  User,
} from "@phosphor-icons/react/dist/ssr";
import { navItems } from "@/data/site";
import { ScrollLink } from "./ScrollLink";

// Icon relevance: house = home, user = about, stack = tech stack,
// folder = projects, briefcase = experience, envelope = contact.
const icons: Record<string, React.ReactNode> = {
  home: <House size={22} weight="regular" aria-hidden />,
  about: <User size={22} weight="regular" aria-hidden />,
  stack: <Stack size={22} weight="regular" aria-hidden />,
  projects: <FolderSimple size={22} weight="regular" aria-hidden />,
  experience: <Briefcase size={22} weight="regular" aria-hidden />,
  contact: <EnvelopeSimple size={22} weight="regular" aria-hidden />,
};

function useActiveSection() {
  const [active, setActive] = useState("home");
  useEffect(() => {
    // The footer sits below the Contact section, so it counts as Contact.
    const els = [...navItems.map((n) => n.id), "site-footer"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id === "site-footer" ? "contact" : e.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

export function SiteNav() {
  const active = useActiveSection();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Desktop and tablet: slash-separated top bar */}
      <header
        className={`fixed inset-x-0 top-0 z-40 hidden border-b transition-colors duration-200 md:block ${
          scrolled ? "border-line bg-bg" : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-12">
          <ScrollLink
            href="#home"
            aria-label="NJOEL, back to top"
            className="font-display text-xl font-extrabold tracking-tight"
          >
            NJOEL
          </ScrollLink>
          <nav aria-label="Primary">
            <ul className="flex items-center gap-3 font-mono text-[13px]">
              {navItems.map((item, i) => {
                const isActive = active === item.id;
                return (
                  <li key={item.id} className="flex items-center gap-3">
                    {i > 0 && (
                      <span aria-hidden className="text-muted/50">
                        /
                      </span>
                    )}
                    <ScrollLink
                      href={`#${item.id}`}
                      aria-current={isActive ? "location" : undefined}
                      className={`relative inline-flex min-h-11 items-center transition-colors duration-200 hover:text-fg ${
                        isActive ? "text-fg" : "text-muted"
                      }`}
                    >
                      {item.label}
                      <span
                        aria-hidden
                        className={`absolute inset-x-0 bottom-2 h-0.5 origin-left bg-accent transition-transform duration-200 ${
                          isActive ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </ScrollLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      {/* Below 768px: bottom dock */}
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-6 px-1">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <ScrollLink
                  href={`#${item.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={`relative flex min-h-14 flex-col items-center justify-center gap-1 px-0.5 font-sans text-[12px] transition-colors duration-200 ${
                    isActive ? "text-fg" : "text-muted"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute inset-x-3 top-0 h-0.5 bg-accent transition-opacity duration-200 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {icons[item.id]}
                  <span>{item.label}</span>
                </ScrollLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
