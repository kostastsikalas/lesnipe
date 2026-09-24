import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { CameraStory } from "@/components/CameraStory";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Reveal";
import Image from "next/image";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <CameraStory story={dict.story} />

      {/* Work */}
      <section id="work" className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
        <SectionTitle index="01" title={dict.work.title} />
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 2) * 80}>
              <ProjectCard project={p} lang={lang} index={i} viewLabel={dict.work.view} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="border-y border-line">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
          <SectionTitle index="02" title={dict.services.title} />
          <ul className="divide-y divide-line border-t border-line">
            {dict.services.items.map((s, i) => (
              <li key={s.name}>
                <Reveal className="grid gap-2 py-8 sm:grid-cols-[4rem_1fr_1fr] sm:items-baseline sm:gap-8">
                  <span className="font-mono text-xs text-dim">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="text-2xl font-medium tracking-tight sm:text-3xl">{s.name}</h3>
                  <p className="text-dim">{s.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
        <SectionTitle index="03" title={dict.about.title} />
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <Reveal className="space-y-6 text-xl leading-relaxed text-paper/90 sm:text-2xl">
            {dict.about.text.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </Reveal>
          <Reveal delay={100}>
            <dl className="grid grid-cols-3 gap-4 border-t border-line pt-6 lg:grid-cols-1 lg:gap-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
              {dict.about.stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-mono text-xs uppercase text-dim">{s.label}</dt>
                  <dd className="text-4xl font-semibold tracking-tight sm:text-5xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-line">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-40">
          <Reveal>
            <Image src="/logo.png" alt="" width={640} height={554} className="mb-10 h-24 w-auto sm:h-32" />
            <h2 className="max-w-4xl text-[clamp(2.25rem,7vw,6rem)] leading-[0.95] font-semibold tracking-[-0.03em]">
              {dict.contact.title}
            </h2>
            <p className="mt-6 max-w-lg text-lg text-dim">{dict.contact.text}</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
              <a
                href={`mailto:${site.email}`}
                className="inline-flex w-fit items-center gap-3 rounded-full bg-signal px-6 py-3 font-medium text-ink transition-transform duration-150 ease-out active:scale-[0.97]"
              >
                {dict.contact.email} <span aria-hidden>→</span>
              </a>
              <a href={`mailto:${site.email}`} className="font-mono text-sm text-dim hover:text-paper">
                {site.email}
              </a>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="font-mono text-sm text-dim hover:text-paper">
                {site.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function SectionTitle({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-12 flex items-baseline gap-4 sm:mb-16">
      <span className="font-mono text-xs text-signal">{index}</span>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
    </div>
  );
}
