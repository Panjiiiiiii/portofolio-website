import { Marquee } from "@/components/ui/Marquee";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { stack } from "@/data/site";

type Item = (typeof stack.groups)[number]["items"][number];

function StackCard({
  item,
  group,
  className,
  large = false,
}: {
  item: Item;
  group: string;
  className: string;
  large?: boolean;
}) {
  return (
    // Focusable so keyboard users can reveal the same detail that hover shows.
    <li
      tabIndex={0}
      className={`stack-card group flex flex-col justify-between rounded-card border border-line bg-surface p-6 transition-colors duration-200 hover:border-accent focus-visible:border-accent md:p-8 ${className}`}
    >
      <span className="font-mono text-[13px] tracking-[0.08em] text-muted">{group}</span>
      <div>
        <h3
          className={`font-display leading-[1] font-bold tracking-[-0.025em] ${
            large ? "text-[clamp(2.25rem,5vw,4.5rem)]" : "text-[clamp(1.75rem,3vw,2.5rem)]"
          }`}
        >
          {item.name}
        </h3>
        <div className="stack-detail">
          <div className="overflow-hidden">
            <p className="max-w-[26rem] pt-4 text-[15px] text-muted">{item.description}</p>
          </div>
        </div>
      </div>
    </li>
  );
}

export function Stack() {
  const [web, mobile] = stack.groups;

  return (
    <section id="stack" aria-labelledby="stack-title" className="py-[clamp(80px,11vw,160px)]">
      <div className="px-6 md:px-12">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeader index="03" title={stack.title} id="stack-title" />
        </div>
      </div>

      <div className="mt-14 md:mt-20">
        <p className="sr-only">{stack.marquee.join(", ")}</p>
        <Marquee items={stack.marquee} label="Stack names" />
      </div>

      <div className="mt-16 px-6 md:mt-24 md:px-12">
       <div className="mx-auto max-w-[1200px]">
        {/* Web gets the larger cards: three items, Next.js leads */}
        <ul className="grid gap-4 md:grid-cols-12">
          <StackCard
            item={web.items[0]}
            group={web.label}
            large
            className="min-h-[18rem] md:col-span-7 md:row-span-2 md:min-h-[26rem]"
          />
          <StackCard
            item={web.items[1]}
            group={web.label}
            className="min-h-[11rem] md:col-span-5"
          />
          <StackCard
            item={web.items[2]}
            group={web.label}
            className="min-h-[11rem] md:col-span-5"
          />
          <StackCard
            item={mobile.items[0]}
            group={mobile.label}
            large
            className="min-h-[12rem] md:col-span-12 md:min-h-[14rem]"
          />
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <span className="mr-2 font-mono text-[13px] tracking-[0.08em] text-muted">
            {stack.additionalLabel}
          </span>
          {stack.tools.map((tool) => (
            <span
              key={tool}
              className="inline-flex h-7 items-center rounded-pill border border-line px-3 font-mono text-[13px] text-muted"
            >
              {tool}
            </span>
          ))}
        </div>
       </div>
      </div>
    </section>
  );
}
