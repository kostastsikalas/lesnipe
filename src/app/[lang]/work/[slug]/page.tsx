import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getProject, projects } from "@/content/projects";
import { VideoPlayer } from "@/components/VideoPlayer";

export const generateStaticParams = () =>
  locales.flatMap((lang) => projects.map((p) => ({ lang, slug: p.slug })));

export async function generateMetadata({ params }: PageProps<"/[lang]/work/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!project || !hasLocale(lang)) return {};
  return { title: project.title, description: project.summary[lang] };
}

export default async function ProjectPage({ params }: PageProps<"/[lang]/work/[slug]">) {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!hasLocale(lang) || !project) notFound();
  const dict = getDictionary(lang);

  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-8 sm:pt-36">
      <Link href={`/${lang}#work`} className="font-mono text-xs uppercase text-dim transition-colors hover:text-paper">
        ← {dict.work.back}
      </Link>

      <header className="mt-8 mb-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="mb-3 font-mono text-xs uppercase text-signal">{project.category[lang]}</p>
          <h1 className="text-[clamp(2.5rem,8vw,7rem)] leading-[0.92] font-semibold tracking-[-0.04em]">
            {project.title}
          </h1>
        </div>
        <dl className="grid grid-cols-3 gap-6 font-mono text-xs lg:text-right">
          <Meta label={dict.work.client} value={project.client} />
          <Meta label={dict.work.role} value={project.role[lang]} />
          <Meta label={dict.work.year} value={String(project.year)} />
        </dl>
      </header>

      <VideoPlayer
        video={project.video}
        title={project.title}
        cover={project.cover}
        tint={project.tint}
        playLabel={dict.work.play}
      />

      <p className="mt-10 max-w-3xl text-xl leading-relaxed text-paper/90 sm:text-2xl">{project.summary[lang]}</p>

      <Link
        href={`/${lang}/work/${next.slug}`}
        className="group mt-24 flex items-end justify-between gap-6 border-t border-line pt-8"
      >
        <div>
          <p className="font-mono text-xs uppercase text-dim">{dict.work.next}</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight transition-colors group-hover:text-signal sm:text-6xl">
            {next.title}
          </p>
        </div>
        <span aria-hidden className="text-4xl transition-transform duration-300 group-hover:translate-x-2 sm:text-6xl">
          →
        </span>
      </Link>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="uppercase text-dim">{label}</dt>
      <dd className="mt-1 text-paper">{value}</dd>
    </div>
  );
}
