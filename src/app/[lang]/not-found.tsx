import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center px-4 pt-24 sm:px-8">
      <p className="font-mono text-xs uppercase text-signal">404</p>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl">Missed the shot.</h1>
      <Link href="/" className="mt-8 font-mono text-sm text-dim hover:text-paper">
        ← Le Snipe
      </Link>
    </section>
  );
}
