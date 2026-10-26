import { Portrait } from "@/components/ui/Portrait";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { about } from "@/data/site";
import { getPortrait } from "@/lib/images";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="px-6 py-[clamp(96px,14vw,200px)] md:px-12"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionHeader index="02" title={about.title} id="about-title" />

        {/* Asymmetric split: portrait sits lower than the text column */}
        <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5 md:mt-20">
            <Portrait image={getPortrait()} alt={about.portraitAlt} />
          </div>

          <div className="md:col-span-7 md:pl-10">
            <p className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.02em]">
              {about.name}
              <span className="mt-2 block font-mono text-[13px] font-normal tracking-normal text-muted">
                alias {about.alias}
              </span>
            </p>

            <p className="mt-10 max-w-[34rem] text-lg leading-relaxed text-fg">{about.bio}</p>

            <dl className="mt-14 border-t border-line">
              {about.facts.map((f) => (
                <div
                  key={f.label}
                  className="grid gap-1 border-b border-line py-4 sm:grid-cols-[9rem_1fr] sm:gap-6"
                >
                  <dt className="font-mono text-[13px] tracking-[0.08em] text-muted">{f.label}</dt>
                  <dd className="text-fg">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
