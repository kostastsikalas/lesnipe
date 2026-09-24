import { site } from "@/content/site";

export function Footer({ rights }: { rights: string }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 font-mono text-xs text-dim sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="space-y-1">
          <p>
            © {new Date().getFullYear()} {site.name}. {rights}
          </p>
          {site.credits.map((c) => (
            <a key={c.href} href={c.href} target="_blank" rel="noreferrer" className="block text-dim/70 hover:text-paper">
              {c.label}
            </a>
          ))}
        </div>
        <ul className="flex gap-6">
          {site.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-paper">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
