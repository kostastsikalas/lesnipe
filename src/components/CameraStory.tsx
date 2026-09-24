"use client";

import { useEffect, useRef } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { Crosshair } from "./Header";
import type { CameraScene } from "./cameraScene";

type Story = Dictionary["story"];
type Rect = { cx: number; cy: number; w: number; h: number };
type Key = [progress: number, rect: Rect];

/*
 * Scroll-driven intro. The section is tall and its stage is sticky, so scroll position
 * becomes a 0→1 progress value that scrubs the whole story:
 *
 *   0.00–0.36  3D camera turns to face us, iris opens, we dolly through the lens
 *   0.36–0.52  viewfinder, 16:9 frame        (step 1: shoot)
 *   0.52–0.66  frame turns 9:16 and back      (step 2: both formats)
 *   0.66–0.84  frame becomes a monitor over an edit timeline (step 3: edit & VFX)
 *   0.84–1.00  a 16:9 screen and a 9:16 phone (step 4: delivery)
 *
 * Everything is written straight to the DOM from a rAF so scrolling never re-renders React.
 */

/** Iris opening at rest, as a fraction of the lens radius. */
const IRIS_CLOSED = 0;
const STEPS: [number, number][] = [
  [0.38, 0.52],
  [0.52, 0.66],
  [0.66, 0.84],
  [0.84, 1.01],
];
const TRACK_V2 = [
  { s: 16, l: 12 },
  { s: 60, l: 14 },
];
const TRACK_V1 = [
  { s: 0, l: 21, n: "TATTOO" },
  { s: 21, l: 17, n: "GYM" },
  { s: 38, l: 25, n: "TATTOO" },
  { s: 63, l: 19, n: "GYM" },
  { s: 82, l: 18, n: "LE SNIPE" },
];
// Deterministic waveform so server and client render the same bars.
const WAVE = Array.from({ length: 72 }, (_, i) =>
  Math.round(25 + 75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.43))),
);

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const out = (t: number) => 1 - (1 - t) ** 3;

function fit(aspect: number, maxW: number, maxH: number) {
  let w = maxW;
  let h = w / aspect;
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  return { w, h };
}

/** Desktop layout = wide viewport; keep in sync with the `wide:` variant in globals.css. */
const isWide = (vw: number, vh: number) => vw >= 1024 && vw > vh;

function frameKeys(vw: number, vh: number): Key[] {
  const full: Rect = { cx: 0.5, cy: 0.5, w: vw, h: vh };
  const r = (aspect: number, mw: number, mh: number, cx: number, cy: number): Rect => ({
    cx,
    cy,
    ...fit(aspect, mw * vw, mh * vh),
  });
  const W = 16 / 9;
  const T = 9 / 16;

  if (isWide(vw, vh)) {
    return [
      [0.38, full],
      [0.46, r(W, 0.6, 0.66, 0.62, 0.5)],
      [0.53, r(W, 0.6, 0.66, 0.62, 0.5)],
      [0.58, r(T, 0.6, 0.66, 0.62, 0.5)],
      [0.63, r(T, 0.6, 0.66, 0.62, 0.5)],
      [0.69, r(W, 0.4, 0.42, 0.66, 0.3)],
      [0.84, r(W, 0.4, 0.42, 0.66, 0.3)],
      [0.9, r(W, 0.4, 0.5, 0.52, 0.48)],
    ];
  }
  return [
    [0.38, full],
    [0.46, r(W, 0.9, 0.5, 0.5, 0.4)],
    [0.53, r(W, 0.9, 0.5, 0.5, 0.4)],
    [0.58, r(T, 0.9, 0.52, 0.5, 0.4)],
    [0.63, r(T, 0.9, 0.52, 0.5, 0.4)],
    [0.69, r(W, 0.92, 0.28, 0.5, 0.28)],
    [0.84, r(W, 0.92, 0.28, 0.5, 0.28)],
    [0.9, r(W, 0.86, 0.22, 0.5, 0.22)],
  ];
}

function phoneRect(vw: number, vh: number): Rect {
  return isWide(vw, vh)
    ? { cx: 0.84, cy: 0.48, h: 0.5 * vh, w: 0.5 * vh * (9 / 16) }
    : { cx: 0.5, cy: 0.53, h: 0.3 * vh, w: 0.3 * vh * (9 / 16) };
}

function rectAt(keys: Key[], p: number): Rect {
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [p0, a] = keys[i];
    const [p1, b] = keys[i + 1];
    if (p < p1) {
      const t = inOut(seg(p, p0, p1));
      return { cx: lerp(a.cx, b.cx, t), cy: lerp(a.cy, b.cy, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) };
    }
  }
  return keys[keys.length - 1][1];
}

function place(el: HTMLElement, r: Rect, vw: number, vh: number) {
  el.style.left = `${r.cx * vw - r.w / 2}px`;
  el.style.top = `${r.cy * vh - r.h / 2}px`;
  el.style.width = `${r.w}px`;
  el.style.height = `${r.h}px`;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function CameraStory({ story }: { story: Story }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const $ = <T extends Element = HTMLElement>(s: string) => section.querySelector<T>(`[data-s="${s}"]`)!;
    const $$ = (s: string) => Array.from(section.querySelectorAll<HTMLElement>(`[data-s="${s}"]`));

    const intro = $("intro");
    const cam = $("cam");
    const hud = $("hud");
    const overlay = $("overlay");
    const frame = $("frame");
    const word = $("word");
    const aspect = $("aspect");
    const tc = $("tc");
    const captions = $$("caption");
    const timeline = $("timeline");
    const clips = $$("clip");
    const playhead = $("playhead");
    const phone = $("phone");
    const labelWide = $("label-wide");
    const labelTall = $("label-tall");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let scene3d: CameraScene | null = null;
    let disposed = false;
    let vw = 0;
    let vh = 0;
    let keys: Key[] = [];
    let raf = 0;

    const measure = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      keys = frameKeys(vw, vh);
    };

    const render = () => {
      raf = 0;
      const box = section.getBoundingClientRect();
      const range = box.height - vh;
      const p = range > 0 ? clamp(-box.top / range) : 0;
      const still = reduce.matches;

      // Intro copy leaves first.
      const introOut = seg(p, 0.02, 0.12);
      intro.style.opacity = String(1 - introOut);
      intro.style.transform = `translateY(${-introOut * 40}px)`;

      // The 3D camera turns to face us, the iris opens, then we dolly through the lens.
      const open = out(seg(p, 0.1, 0.26));
      const aperture = lerp(IRIS_CLOSED, 1, open);
      const diag = Math.hypot(vw, vh);
      const turn = inOut(seg(p, 0, 0.16));
      const dolly = still ? 0 : seg(p, 0.18, 0.36) ** 1.4;
      const lens =
        scene3d && p < 0.4 ? scene3d.render({ turn, dolly, aperture, twist: (1 - open) * 0.6 }) : null;

      // Footage is only visible through the iris hole until the hole covers the screen.
      if (still) {
        const show = seg(p, 0.2, 0.34);
        hud.style.clipPath = "none";
        hud.style.opacity = String(show);
        cam.style.opacity = String(1 - show);
      } else if (p >= 0.4 || (lens && aperture * lens.r > diag)) {
        hud.style.clipPath = "none";
        hud.style.opacity = "1";
        cam.style.opacity = "0";
      } else if (!lens) {
        hud.style.clipPath = "circle(0)";
        cam.style.opacity = "1";
      } else {
        hud.style.clipPath = `polygon(${lens.hole.map(([x, y]) => `${x}px ${y}px`).join(",")})`;
        hud.style.opacity = "1";
        cam.style.opacity = "1";
      }

      overlay.style.opacity = String(seg(p, 0.36, 0.42) * (1 - seg(p, 0.86, 0.9)));
      const f = Math.floor(p * 60 * 25);
      tc.textContent = `00:${pad(Math.floor(f / 1500))}:${pad(Math.floor(f / 25) % 60)}:${pad(f % 25)}`;

      // Frame
      const r = rectAt(keys, p);
      place(frame, r, vw, vh);
      aspect.textContent = r.w >= r.h ? "16:9" : "9:16";

      // Edit timeline
      const tlIn = seg(p, 0.66, 0.71) * (1 - seg(p, 0.84, 0.88));
      timeline.style.opacity = String(tlIn);
      clips.forEach((c, i) => {
        const t = out(seg(p, 0.665 + i * 0.006, 0.71 + i * 0.006));
        c.style.transform = `translateX(${(1 - t) * 40}vw)`;
        c.style.opacity = String(t);
      });
      const head = seg(p, 0.69, 0.84) * 100;
      playhead.style.left = `${head}%`;

      let scene = "TATTOO";
      if (p >= 0.52 && p < 0.66) scene = "GYM";
      else if (p >= 0.66 && p < 0.845) scene = (TRACK_V1.find((c) => head < c.s + c.l) ?? TRACK_V1[0]).n;
      if (word.textContent !== scene) word.textContent = scene;

      // Delivery
      const pr = phoneRect(vw, vh);
      place(phone, pr, vw, vh);
      const phoneIn = out(seg(p, 0.86, 0.91));
      phone.style.opacity = String(phoneIn);
      phone.style.transform = `translateY(${(1 - phoneIn) * 40}px)`;
      const labels = seg(p, 0.89, 0.93);
      labelWide.style.opacity = String(labels);
      labelWide.style.left = `${r.cx * vw - r.w / 2}px`;
      labelWide.style.top = `${r.cy * vh + r.h / 2 + 12}px`;
      labelTall.style.opacity = String(labels);
      labelTall.style.left = `${pr.cx * vw - pr.w / 2}px`;
      labelTall.style.top = `${pr.cy * vh + pr.h / 2 + 12}px`;

      // Step captions
      captions.forEach((c, i) => {
        const [s, e] = STEPS[i];
        const inT = seg(p, s, s + 0.03);
        const outT = seg(p, e - 0.03, e);
        c.style.opacity = String(inT * (1 - outT));
        c.style.transform = `translateY(${(1 - inT) * 24 - outT * 24}px)`;
        c.style.visibility = inT * (1 - outT) > 0 ? "visible" : "hidden";
      });
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };
    const onResize = () => {
      measure();
      scene3d?.resize();
      schedule();
    };

    measure();
    render();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    reduce.addEventListener("change", schedule);

    // three.js is loaded on demand so it stays out of the initial bundle.
    import("./cameraScene")
      .then(({ createCameraScene }) => createCameraScene(cam))
      .then((s) => {
        if (disposed) return s.dispose();
        scene3d = s;
        cam.dataset.ready = "";
        onResize();
      })
      .catch((err) => console.error("Camera model failed to load", err));

    return () => {
      disposed = true;
      scene3d?.dispose();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      reduce.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <section ref={root} aria-label={story.label} className="relative h-[700svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Camera */}
        <div
          data-s="cam"
          className="absolute inset-0 opacity-0 transition-opacity duration-700 data-ready:opacity-100"
        />

        {/* Intro copy */}
        <div
          data-s="intro"
          className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-[6svh] sm:px-8"
        >
          <p className="mb-5 flex items-center gap-2 font-mono text-xs uppercase text-dim">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
            {story.eyebrow}
          </p>
          <div className="flex items-end justify-between gap-6">
            <h1 className="text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.92] font-semibold tracking-[-0.04em]">
              {story.title[0]}
              <br />
              <span className="text-signal">{story.title[1]}</span>
            </h1>
            <p className="hidden shrink-0 items-center gap-2 font-mono text-xs uppercase text-dim sm:flex">
              {story.scroll} <span aria-hidden className="animate-bounce">↓</span>
            </p>
          </div>
        </div>

        {/* Everything seen through the lens */}
        <div data-s="hud" className="absolute inset-0 bg-ink" style={{ clipPath: "circle(0)" }}>
          <div data-s="frame" className="absolute inset-0 overflow-hidden border border-paper/15">
            <div className="footage">
              <span data-s="word" className="footage-word">
                TATTOO
              </span>
            </div>
            <Crosshair className="absolute top-1/2 left-1/2 h-6 w-6 -translate-1/2 text-signal/70" />
            <span
              data-s="aspect"
              className="absolute top-3 left-3 bg-ink/60 px-1.5 py-0.5 font-mono text-[11px] text-paper/80"
            >
              16:9
            </span>
            <FrameCorners />
          </div>

          <div
            data-s="phone"
            className="absolute overflow-hidden rounded-[1.75rem] border-[5px] border-[#1d1d1d] opacity-0 shadow-[0_0_0_1px_rgb(255_255_255/0.12)]"
          >
            <div className="footage">
              <span className="footage-word">GYM</span>
            </div>
            <span className="absolute top-2 left-1/2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-[#1d1d1d]" />
          </div>
          <p data-s="label-wide" className="absolute font-mono text-[11px] uppercase text-paper/70 opacity-0">
            {story.formats.wide}
          </p>
          <p data-s="label-tall" className="absolute font-mono text-[11px] uppercase text-paper/70 opacity-0">
            {story.formats.tall}
          </p>

          <Timeline />

          {/* Viewfinder overlay */}
          <div data-s="overlay" aria-hidden className="pointer-events-none absolute inset-0 font-mono text-[11px] text-paper/80 opacity-0">
            <div className="absolute top-20 left-4 flex items-center gap-3 sm:left-8">
              <span className="flex items-center gap-1.5 text-signal">
                <span className="rec-blink h-2 w-2 rounded-full bg-signal" />
                REC
              </span>
              <span data-s="tc" className="tabular-nums">
                00:00:00:00
              </span>
            </div>
            <div className="absolute top-20 right-4 flex items-center gap-3 sm:right-8">
              <span>4K · 25P</span>
              <span className="flex h-2.5 w-6 items-stretch border border-paper/70 p-px">
                <span className="w-3/4 bg-paper/80" />
              </span>
            </div>
            <div className="absolute right-4 bottom-4 hidden gap-4 sm:right-8 wide:flex">
              <span>ISO 800</span>
              <span>1/50</span>
              <span>f/2.8</span>
            </div>
          </div>

          {/* Step captions */}
          {story.steps.map((s, i) => (
            <div
              key={s.tag}
              data-s="caption"
              className="invisible absolute inset-x-4 bottom-[4svh] opacity-0 sm:inset-x-8 wide:inset-x-auto wide:bottom-auto wide:left-[4vw] wide:top-1/2 wide:w-[26vw] wide:-translate-y-1/2"
            >
              <p className="mb-3 font-mono text-xs uppercase text-signal">
                {pad(i + 1)} — {s.tag}
              </p>
              <h2 className="text-2xl leading-tight font-semibold tracking-tight sm:text-4xl">{s.title}</h2>
              <p className="mt-3 max-w-sm text-sm text-paper/70 sm:text-base">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FrameCorners() {
  const c = "absolute h-4 w-4 border-paper/80";
  return (
    <>
      <span className={`${c} top-2 right-2 border-t border-r`} />
      <span className={`${c} bottom-2 left-2 border-b border-l`} />
      <span className={`${c} right-2 bottom-2 border-r border-b`} />
    </>
  );
}

function Timeline() {
  return (
    <div
      data-s="timeline"
      aria-hidden
      className="absolute top-[48svh] right-[4vw] left-[4vw] flex h-[20svh] flex-col gap-1.5 border border-line bg-[#0f0f0e] p-2 font-mono text-[10px] text-paper/60 opacity-0 wide:top-[60svh] wide:left-[34vw] wide:h-[26svh]"
    >
      <div className="relative flex-1 overflow-hidden">
        <Track label="V2">
          {TRACK_V2.map((c) => (
            <span
              key={c.s}
              data-s="clip"
              className="absolute inset-y-0 bg-signal/80"
              style={{ left: `${c.s}%`, width: `${c.l}%` }}
            />
          ))}
        </Track>
        <Track label="V1">
          {TRACK_V1.map((c) => (
            <span
              key={c.s}
              data-s="clip"
              className="absolute inset-y-0 truncate border border-paper/25 bg-paper/10 px-1 pt-0.5 text-paper/70"
              style={{ left: `${c.s}%`, width: `${c.l}%` }}
            >
              {c.n}
            </span>
          ))}
        </Track>
        <Track label="A1">
          <span data-s="clip" className="absolute inset-0 flex items-center gap-px">
            {WAVE.map((h, i) => (
              <span key={i} className="flex-1 bg-paper/35" style={{ height: `${h}%` }} />
            ))}
          </span>
        </Track>
        <span data-s="playhead" className="absolute inset-y-0 left-0 ml-6 w-px bg-signal">
          <span className="absolute -top-px -left-1 h-2 w-2 bg-signal" />
        </span>
      </div>
    </div>
  );
}

function Track({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex h-1/3 items-stretch gap-2 py-0.5">
      <span className="w-4 shrink-0 self-center">{label}</span>
      <div className="relative flex-1">{children}</div>
    </div>
  );
}
