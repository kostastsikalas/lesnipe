import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "greek"] });
const mono = JetBrains_Mono({ variable: "--font-mono-face", subsets: ["latin", "greek"] });

export const generateStaticParams = () => locales.map((lang) => ({ lang }));

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: { default: dict.meta.title, template: "%s — Le Snipe" },
    description: dict.meta.description,
    alternates: { languages: { el: "/el", en: "/en" } },
    openGraph: { title: dict.meta.title, description: dict.meta.description, siteName: "Le Snipe" },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <html lang={lang} className={`${inter.variable} ${mono.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">
        <Header lang={lang} nav={dict.nav} />
        <main className="flex-1">{children}</main>
        <Footer rights={dict.footer.rights} />
      </body>
    </html>
  );
}
