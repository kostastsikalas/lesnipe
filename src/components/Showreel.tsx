"use client";

import { useRef, useState } from "react";
import { site } from "@/content/site";

/**
 * Full-bleed muted showreel behind the hero. If the video file is missing or fails
 * to load, the animated gradient underneath stays visible instead.
 */
export function Showreel({ soundLabel }: { soundLabel: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(true);

  const toggleSound = () => {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,#3a1c14_0%,transparent_55%),radial-gradient(ellipse_at_80%_70%,#14222a_0%,transparent_55%)]"
      />
      <video
        ref={video}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
          ready ? "opacity-60" : "opacity-0"
        }`}
        src={site.reel.src}
        poster={site.reel.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onCanPlay={() => setReady(true)}
        onError={() => setReady(false)}
      />
      {/* Letterbox shading so text stays legible over any footage. */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/10 to-ink" />

      {ready && (
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={!muted}
          className="absolute right-4 bottom-6 z-10 flex items-center gap-2 rounded-full border border-paper/20 bg-ink/40 px-3 py-1.5 font-mono text-xs uppercase backdrop-blur transition-[transform,background-color] duration-150 hover:bg-ink/70 active:scale-[0.97] sm:right-8"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${muted ? "bg-dim" : "bg-signal"}`} />
          {soundLabel} {muted ? "off" : "on"}
        </button>
      )}
    </>
  );
}
