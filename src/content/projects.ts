import type { Localized } from "@/i18n/config";

export type VideoSource =
  | { provider: "vimeo"; id: string }
  | { provider: "youtube"; id: string }
  | { provider: "file"; src: string };

export type Project = {
  slug: string;
  title: string;
  client: string;
  year: number;
  category: Localized;
  role: Localized;
  summary: Localized;
  /** Still used on the grid and as the player poster. Optional until real stills exist. */
  cover?: string;
  /** Used as a fallback cover when there is no still yet. */
  tint: string;
  video?: VideoSource;
};

// Placeholder projects — swap in the real work, stills and video ids.
export const projects: Project[] = [
  {
    slug: "midnight-run",
    title: "Midnight Run",
    client: "Artist Name",
    year: 2026,
    category: { el: "Music video", en: "Music video" },
    role: { el: "Σκηνοθεσία, κάμερα, grading", en: "Direction, camera, grading" },
    summary: {
      el: "Νυχτερινό road movie σε ένα single take μέσα από την Αθήνα, γυρισμένο με anamorphic φακούς.",
      en: "A night-time road movie in a single take across Athens, shot on anamorphic lenses.",
    },
    tint: "#3b1d1a",
    video: { provider: "vimeo", id: "76979871" },
  },
  {
    slug: "salt-and-stone",
    title: "Salt & Stone",
    client: "Brand Name",
    year: 2026,
    category: { el: "Brand film", en: "Brand film" },
    role: { el: "Κάμερα, μοντάζ", en: "Camera, edit" },
    summary: {
      el: "Brand film για ελληνικό προϊόν, γυρισμένο σε τρία νησιά μέσα σε τέσσερις μέρες.",
      en: "A brand film for a Greek product, shot across three islands in four days.",
    },
    tint: "#1c2c33",
  },
  {
    slug: "open-air",
    title: "Open Air",
    client: "Festival Name",
    year: 2025,
    category: { el: "Aftermovie", en: "Aftermovie" },
    role: { el: "Multicam, μοντάζ", en: "Multicam, edit" },
    summary: {
      el: "Aftermovie τριήμερου festival με πέντε κάμερες και drone.",
      en: "Aftermovie for a three-day festival with five cameras and a drone.",
    },
    tint: "#2f2a17",
  },
  {
    slug: "concrete",
    title: "Concrete",
    client: "Artist Name",
    year: 2025,
    category: { el: "Music video", en: "Music video" },
    role: { el: "Σκηνοθεσία, κάμερα", en: "Direction, camera" },
    summary: {
      el: "Ασπρόμαυρο performance video σε εγκαταλελειμμένο εργοστάσιο.",
      en: "A black-and-white performance video in an abandoned factory.",
    },
    tint: "#222222",
  },
  {
    slug: "first-light",
    title: "First Light",
    client: "Brand Name",
    year: 2025,
    category: { el: "Διαφήμιση", en: "Commercial" },
    role: { el: "Κάμερα, grading", en: "Camera, grading" },
    summary: {
      el: "30'' spot για TV και social, γυρισμένο με την πρώτη πρωινή ώρα.",
      en: "A 30'' spot for TV and social, shot entirely at first light.",
    },
    tint: "#3a2616",
  },
  {
    slug: "backstage",
    title: "Backstage",
    client: "Venue Name",
    year: 2024,
    category: { el: "Live / event", en: "Live / event" },
    role: { el: "Κάμερα, μοντάζ", en: "Camera, edit" },
    summary: {
      el: "Σειρά από live sessions και backstage στιγμές για συναυλιακό χώρο.",
      en: "A series of live sessions and backstage moments for a concert venue.",
    },
    tint: "#1d1a2e",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
