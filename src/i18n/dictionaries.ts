import type { Locale } from "./config";

const el = {
  meta: {
    title: "Le Snipe — Video & VFX",
    description:
      "Le Snipe: γύρισμα, μοντάζ και VFX για τατουατζίδικα, γυμναστήρια και brands. Κάθετα και οριζόντια βίντεο από το Ηράκλειο Κρήτης.",
  },
  nav: { work: "Δουλειές", services: "Υπηρεσίες", about: "Σχετικά", contact: "Επικοινωνία" },
  story: {
    label: "Πώς δουλεύω",
    eyebrow: "Video & VFX · Ηράκλειο, Κρήτη",
    title: ["Κάθε πλάνο,", "εύστοχο."],
    scroll: "Σκρόλαρε",
    steps: [
      {
        tag: "Γύρισμα",
        title: "Γυρίζουμε εκεί που γίνεται η δουλειά.",
        text: "Στο τατουατζίδικο, στο γυμναστήριο, στον χώρο σου. Φως, κίνηση, λεπτομέρεια.",
      },
      {
        tag: "Κάθετο & οριζόντιο",
        title: "Ένα γύρισμα, δύο formats.",
        text: "Κάθε πλάνο στήνεται για 9:16 και 16:9, για να δουλεύει σε Reels, TikTok και YouTube.",
      },
      {
        tag: "Μοντάζ & VFX",
        title: "Ρυθμός, χρώμα, effects.",
        text: "Μοντάζ και VFX από το 2012. Το υλικό σου αποκτά χαρακτήρα.",
      },
      {
        tag: "Παράδοση",
        title: "Έτοιμο να ανέβει.",
        text: "Αρχεία στις σωστές διαστάσεις για κάθε πλατφόρμα, χωρίς καθυστερήσεις.",
      },
    ],
    formats: { wide: "16:9 · YouTube · Ads", tall: "9:16 · Reels · TikTok" },
  },
  work: {
    title: "Επιλεγμένες δουλειές",
    view: "Προβολή",
    back: "Όλες οι δουλειές",
    client: "Πελάτης",
    role: "Ρόλος",
    year: "Έτος",
    next: "Επόμενο project",
    play: "Αναπαραγωγή",
  },
  services: {
    title: "Τι κάνω",
    items: [
      { name: "Tattoo studios", text: "Process videos, before/after και reels που δείχνουν τη δουλειά του artist." },
      { name: "Γυμναστήρια", text: "Προπονήσεις, coaches και ατμόσφαιρα, σε βίντεο που φέρνουν μέλη." },
      { name: "Reels & social", text: "Κάθετα formats, γρήγορα και έτοιμα για Reels, TikTok και Shorts." },
      { name: "VFX & music videos", text: "Visual effects, μοντάζ και σκηνοθεσία για καλλιτέχνες." },
    ],
  },
  about: {
    title: "Σχετικά",
    text: [
      "Είμαι ο Μύρων Σφυράκης, video editor και VFX artist από το Ηράκλειο Κρήτης. Κάνω μοντάζ και VFX από το 2012.",
      "Δουλεύω με τατουατζίδικα, γυμναστήρια, brands και καλλιτέχνες που θέλουν εικόνα με χαρακτήρα. Μικρό συνεργείο, γρήγορες αποφάσεις, καμία σπατάλη κάδρου.",
    ],
    stats: [
      { value: "2012", label: "από το" },
      { value: "9:16", label: "& 16:9" },
      { value: "VFX", label: "in-house" },
    ],
  },
  contact: {
    title: "Ας γυρίσουμε κάτι μαζί.",
    text: "Πες μου για τον χώρο σου και τι θέλεις να δείξεις. Απαντάω μέσα σε 24 ώρες.",
    email: "Στείλε email",
  },
  footer: { rights: "Με επιφύλαξη παντός δικαιώματος." },
};

export type Dictionary = typeof el;

const en: Dictionary = {
  meta: {
    title: "Le Snipe — Video & VFX",
    description:
      "Le Snipe: shooting, editing and VFX for tattoo studios, gyms and brands. Vertical and horizontal video from Heraklion, Crete.",
  },
  nav: { work: "Work", services: "Services", about: "About", contact: "Contact" },
  story: {
    label: "How I work",
    eyebrow: "Video & VFX · Heraklion, Crete",
    title: ["Every frame,", "on target."],
    scroll: "Scroll",
    steps: [
      {
        tag: "Shoot",
        title: "We shoot where the work happens.",
        text: "In the tattoo studio, the gym, your space. Light, motion, detail.",
      },
      {
        tag: "Vertical & horizontal",
        title: "One shoot, two formats.",
        text: "Every shot is framed for 9:16 and 16:9, so it works on Reels, TikTok and YouTube.",
      },
      {
        tag: "Edit & VFX",
        title: "Rhythm, colour, effects.",
        text: "Editing and VFX since 2012. Your footage gets a character of its own.",
      },
      {
        tag: "Delivery",
        title: "Ready to post.",
        text: "Files in the right size for every platform, without the wait.",
      },
    ],
    formats: { wide: "16:9 · YouTube · Ads", tall: "9:16 · Reels · TikTok" },
  },
  work: {
    title: "Selected work",
    view: "View",
    back: "All work",
    client: "Client",
    role: "Role",
    year: "Year",
    next: "Next project",
    play: "Play",
  },
  services: {
    title: "What I do",
    items: [
      { name: "Tattoo studios", text: "Process videos, before/afters and reels that show the artist's craft." },
      { name: "Gyms", text: "Training, coaches and atmosphere, in videos that bring in members." },
      { name: "Reels & social", text: "Vertical formats, fast turnaround, ready for Reels, TikTok and Shorts." },
      { name: "VFX & music videos", text: "Visual effects, editing and direction for artists." },
    ],
  },
  about: {
    title: "About",
    text: [
      "I'm Myron Sfyrakis, a video editor and VFX artist from Heraklion, Crete. I've been editing and doing VFX since 2012.",
      "I work with tattoo studios, gyms, brands and artists who want images with character. Small crew, quick decisions, no wasted frames.",
    ],
    stats: [
      { value: "2012", label: "since" },
      { value: "9:16", label: "& 16:9" },
      { value: "VFX", label: "in-house" },
    ],
  },
  contact: {
    title: "Let's shoot something together.",
    text: "Tell me about your space and what you want to show. I reply within 24 hours.",
    email: "Send an email",
  },
  footer: { rights: "All rights reserved." },
};

const dictionaries: Record<Locale, Dictionary> = { el, en };

export const getDictionary = (locale: Locale) => dictionaries[locale];
