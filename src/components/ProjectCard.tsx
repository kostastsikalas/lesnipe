import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Project } from "@/content/projects";

export function ProjectCard({
  project,
  lang,
  index,
  viewLabel,
}: {
  project: Project;
  lang: Locale;
  index: number;
  viewLabel: string;
}) {
  return (
    <Link href={`/${lang}/work/${project.slug}`} className="group block">
      <div
        className="relative aspect-video overflow-hidden"
        style={{
          backgroundColor: project.tint,
          backgroundImage: `radial-gradient(ellipse at 70% 30%, ${project.tint}, #0b0b0a 90%)`,
        }}
      >
        {project.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.cover}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-strong)] group-hover:scale-[1.03]"
          />
        ) : (
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center text-[clamp(1.5rem,5vw,3.5rem)] font-semibold tracking-[-0.04em] text-paper/15 transition-transform duration-700 ease-[var(--ease-out-strong)] group-hover:scale-[1.03]"
          >
            {project.title}
          </span>
        )}
        <span className="absolute top-3 left-3 font-mono text-[11px] text-paper/60">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="absolute right-3 bottom-3 translate-y-1 font-mono text-[11px] uppercase text-paper opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {viewLabel} →
        </span>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-medium tracking-tight">{project.title}</h3>
        <p className="shrink-0 font-mono text-xs text-dim">
          {project.category[lang]} · {project.year}
        </p>
      </div>
    </Link>
  );
}
