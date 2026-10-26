import { BackToTop } from "@/components/ui/BackToTop";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { Copyright } from "@/components/ui/Copyright";
import { FooterReveal } from "@/components/ui/FooterReveal";
import { socials } from "@/data/contact";

export function Footer() {
  return (
    <FooterReveal>
      <div className="px-6 py-[clamp(64px,8vw,112px)] md:px-12">
        <div className="mx-auto grid max-w-[1200px] gap-14 md:grid-cols-[1fr_auto] md:gap-24">
          <CopyEmail />
          <nav aria-label="Social links">
            <ul className="flex flex-col gap-1">
              {socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.ariaLabel}
                    className="inline-flex min-h-11 items-center font-display text-2xl font-bold tracking-[-0.02em] transition-colors duration-200 hover:text-accent"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mx-auto mt-16 flex max-w-[1200px] flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
          <Copyright />
          <BackToTop />
        </div>
      </div>
    </FooterReveal>
  );
}
