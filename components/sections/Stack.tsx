import { BrandIcon } from "@/components/ui/BrandIcon";
import { Marquee } from "@/components/ui/Marquee";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { stack, type StackItem } from "@/data/site";

function StackCard({
  item,
  group,
  className,
  large = false,
  extraIcon,
}: {
  item: StackItem;
  group: string;
  className: string;
  large?: boolean;
  /** A second logo for items that name two technologies, like React Native (Expo). */
  extraIcon?: string;
}) {
  return (
    // Focusable so keyboard users can reveal the same detail that hover shows.
    <li
      tabIndex={0}
      className={`stack-card group flex flex-col justify-between rounded-card border border-line bg-surface p-6 transition-colors duration-200 hover:border-accent focus-visible:border-accent md:p-8 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-[13px] tracking-[0.08em] text-muted">{group}</span>
        <span className="flex gap-3 text-fg transition-colors duration-200 group-hover:text-accent group-focus-visible:text-accent">
          <BrandIcon id={item.id} decorative className="size-9" />
          {extraIcon && <BrandIcon id={extraIcon} decorative className="size-9" />}
        </span>
      </div>
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
  const allNames = [...web.items, ...mobile.items].map((i) => i.name).join(", ");

  return (
    <section id="stack" aria-labelledby="stack-title" className="py-[clamp(80px,11vw,160px)]">
      <div className="px-6 md:px-12">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeader index="03" title={stack.title} id="stack-title" />
        </div>
      </div>

      <div className="mt-14 md:mt-20">
        <p className="sr-only">{allNames}</p>
        <Marquee ids={stack.marquee} label="Stack logos" />
      </div>

      <div className="mt-16 px-6 md:mt-24 md:px-12">
        <div className="mx-auto max-w-[1200px]">
          {/* Widths alternate 7/5 then 5/7 so the grid does not read as a repeated template */}
          <ul className="grid gap-4 md:grid-cols-12">
            <StackCard
              item={web.items[0]}
              group={web.label}
              large
              className="min-h-[16rem] md:col-span-7 md:min-h-[20rem]"
            />
            <StackCard
              item={web.items[1]}
              group={web.label}
              className="min-h-[14rem] md:col-span-5 md:min-h-[20rem]"
            />
            <StackCard
              item={web.items[2]}
              group={web.label}
              className="min-h-[14rem] md:col-span-5 md:min-h-[16rem]"
            />
            <StackCard
              item={web.items[3]}
              group={web.label}
              large
              className="min-h-[14rem] md:col-span-7 md:min-h-[16rem]"
            />
            <StackCard
              item={mobile.items[0]}
              group={mobile.label}
              large
              extraIcon="expo"
              className="min-h-[12rem] md:col-span-12 md:min-h-[14rem]"
            />
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="mr-2 font-mono text-[13px] tracking-[0.08em] text-muted">
              {stack.additionalLabel}
            </span>
            {stack.tools.map((tool) => (
              <span
                key={tool.id}
                className="inline-flex h-9 items-center gap-2 rounded-pill border border-line px-4 font-mono text-[13px] text-muted transition-colors duration-200 hover:border-accent hover:text-fg"
              >
                <BrandIcon id={tool.id} decorative className="size-4" />
                {tool.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
