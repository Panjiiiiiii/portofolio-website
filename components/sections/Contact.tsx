import { Suspense } from "react";
import { GithubLogo, InstagramLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cta, githubCopy, socials, type Social } from "@/data/contact";
import { GithubContributions, GithubSkeleton } from "./GithubContributions";

// One icon set (Phosphor). Each icon is the brand mark of the link it sits on.
const icons: Record<Social["id"], React.ReactNode> = {
  linkedin: <LinkedinLogo size={22} weight="fill" aria-hidden />,
  instagram: <InstagramLogo size={22} weight="fill" aria-hidden />,
  github: <GithubLogo size={22} weight="fill" aria-hidden />,
};

/** Contact anchor: 06 GitHub contributions, directly above 07 call to action. */
export function Contact() {
  return (
    <section id="contact" aria-labelledby="github-title">
      <div className="px-6 pt-[clamp(96px,12vw,180px)] md:px-12">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeader index="06" title={githubCopy.title} id="github-title" />
          <Suspense fallback={<GithubSkeleton />}>
            <GithubContributions />
          </Suspense>
        </div>
      </div>

      <div className="px-6 pt-[clamp(120px,16vw,240px)] pb-[clamp(96px,12vw,180px)] md:px-12">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="font-display text-[clamp(3.5rem,13vw,12rem)] leading-[0.88] font-extrabold tracking-[-0.045em]">
            {cta.headline}
          </h2>
          <ul className="mt-12 flex flex-wrap gap-3 md:mt-16">
            {socials.map((s, i) => (
              <li key={s.id}>
                <MagneticLink
                  href={s.url}
                  aria-label={s.ariaLabel}
                  className={`inline-flex min-h-14 items-center gap-3 rounded-pill px-8 text-[16px] font-medium transition-colors duration-200 ${
                    i === 0
                      ? "bg-accent text-bg hover:bg-accent-hover"
                      : "border border-line text-fg hover:border-accent"
                  }`}
                >
                  {icons[s.id]}
                  {s.label}
                </MagneticLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
