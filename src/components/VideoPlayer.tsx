"use client";

import { useState } from "react";
import type { VideoSource } from "@/content/projects";

/**
 * Shows a poster with a play button and only loads the Vimeo/YouTube iframe on click,
 * so project pages stay fast and don't set third-party cookies until asked.
 */
export function VideoPlayer({
  video,
  title,
  cover,
  tint,
  playLabel,
}: {
  video?: VideoSource;
  title: string;
  cover?: string;
  tint: string;
  playLabel: string;
}) {
  const [playing, setPlaying] = useState(false);

  const embed =
    video?.provider === "vimeo"
      ? `https://player.vimeo.com/video/${video.id}?autoplay=1&dnt=1`
      : video?.provider === "youtube"
        ? `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`
        : null;

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-line" style={{ backgroundColor: tint }}>
      {playing && embed && (
        <iframe
          src={embed}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      )}
      {playing && video?.provider === "file" && (
        <video src={video.src} controls autoPlay playsInline className="absolute inset-0 h-full w-full" />
      )}

      {!playing && (
        <button
          type="button"
          disabled={!video}
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 flex items-center justify-center disabled:cursor-default"
          aria-label={`${playLabel}: ${title}`}
        >
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <span aria-hidden className="absolute inset-0 bg-ink/20" />
          {video && (
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-paper/40 bg-ink/30 backdrop-blur transition-[transform,border-color] duration-200 ease-out group-hover:border-signal group-active:scale-[0.96]">
              <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-paper" aria-hidden>
                <path d="M7 4.5v15l12-7.5z" />
              </svg>
            </span>
          )}
        </button>
      )}
    </div>
  );
}
