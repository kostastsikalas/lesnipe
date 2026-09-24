"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type Props = { lang: Locale; nav: Dictionary["nav"] };

export function Header({ lang, nav }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: `/${lang}#work`, label: nav.work },
    { href: `/${lang}#services`, label: nav.services },
    { href: `/${lang}#about`, label: nav.about },
    { href: `/${lang}#contact`, label: nav.contact },
  ];

  const switchTo = (target: Locale) => pathname.replace(/^\/(el|en)(?=\/|$)/, `/${target}`);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
        scrolled || open
          ? "border-b border-line bg-ink/85 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link href={`/${lang}`} className="-my-1 block">
          <Image src="/logo.png" alt="Le Snipe Visuals" width={640} height={554} priority className="h-12 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-dim transition-colors hover:text-paper">
              {l.label}
            </a>
          ))}
          <LangSwitch lang={lang} switchTo={switchTo} />
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Menu"
          className="-mr-2 flex h-10 w-10 items-center justify-center md:hidden"
        >
          <span className="relative block h-3 w-5">
            <span
              className={`absolute left-0 h-px w-5 bg-paper transition-transform duration-300 ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 h-px w-5 bg-paper transition-transform duration-300 ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-line px-4 pt-2 pb-6 md:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 text-2xl font-medium">
              {l.label}
            </a>
          ))}
          <div className="pt-4" onClick={() => setOpen(false)}>
            <LangSwitch lang={lang} switchTo={switchTo} />
          </div>
        </nav>
      )}
    </header>
  );
}

function LangSwitch({ lang, switchTo }: { lang: Locale; switchTo: (l: Locale) => string }) {
  return (
    <div className="flex items-center gap-1 font-mono text-xs">
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-line">/</span>}
          <Link
            href={switchTo(l)}
            hrefLang={l}
            aria-current={l === lang ? "true" : undefined}
            className={`uppercase transition-colors ${l === lang ? "text-paper" : "text-dim hover:text-paper"}`}
          >
            {l}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function Crosshair({ className = "h-4 w-4 text-signal" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 2v5M12 17v5M2 12h5M17 12h5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
