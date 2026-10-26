import { ProjectMockup } from "@/components/ui/ProjectMockup";
import { ProjectText } from "@/components/ui/ProjectText";
import type { ProjectItem } from "@/lib/images";

/** Reduced motion: no pinning. Every project is a normal block with everything visible. */
export function ProjectsStacked({ items }: { items: ProjectItem[] }) {
  return (
    <ol>
      {items.map(({ project, image }, i) => (
        <li key={project.slug} className="border-t border-line py-14 first:border-t-0 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-12 md:gap-8">
            <div className="pj-flat md:col-span-7">
              <ProjectMockup project={project} image={image} />
            </div>
            <div className="md:col-span-5">
              <ProjectText project={project} index={i} total={items.length} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
