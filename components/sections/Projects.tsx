import { SectionHeader } from "@/components/ui/SectionHeader";
import { projects, projectsCopy } from "@/data/projects";
import { getProjectImage, type ProjectItem } from "@/lib/images";
import { ProjectsAccordion } from "./ProjectsAccordion";
import { ProjectsStacked } from "./ProjectsStacked";
import { ProjectsStage } from "./ProjectsStage";

/**
 * 04 Projects. Three presentations of the same data, switched by CSS only (see globals.css):
 * - stage: desktop, one project per scroll step on a sticky stage
 * - accordion: below 768px
 * - stacked: reduced motion, plain blocks
 */
export function Projects() {
  const items: ProjectItem[] = projects.map((project) => ({
    project,
    image: getProjectImage(project.slug),
  }));

  return (
    <section id="projects" aria-labelledby="projects-title">
      <div className="px-6 pt-[clamp(96px,13vw,190px)] pb-[clamp(48px,6vw,96px)] md:px-12">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeader index="04" title={projectsCopy.title} id="projects-title" />
        </div>
      </div>

      <div className="pj-stage-wrap">
        <ProjectsStage items={items} />
      </div>

      <div className="pj-accordion px-6">
        <ProjectsAccordion items={items} />
      </div>

      <div className="pj-stacked px-6 md:px-12">
        <div className="mx-auto max-w-[1200px]">
          <ProjectsStacked items={items} />
        </div>
      </div>

      {/* Breathing room before the next section */}
      <div className="h-[clamp(48px,8vw,120px)]" aria-hidden />
    </section>
  );
}
