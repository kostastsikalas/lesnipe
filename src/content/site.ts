// Global contact details and media — replace the placeholders with the real ones.
export const site = {
  name: "Le Snipe",
  email: "hello@lesnipe.gr",
  phone: "+30 690 000 0000",
  socials: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "Vimeo", href: "https://vimeo.com/" },
    { label: "YouTube", href: "https://youtube.com/" },
  ],
  /** Required by the CC BY licence of the 3D camera in the intro. */
  credits: [
    {
      label: "3D camera: “NIKON Z30 with NIKKOR DX 16-50” by Metazeon (CC BY 4.0)",
      href: "https://sketchfab.com/3d-models/3bbe5fb198914d7e87e2644091a89c7e",
    },
  ],
  /** Muted, looping showreel for the hero. Put the file in public/media. */
  reel: {
    src: "/media/showreel.mp4",
    poster: "/media/showreel.jpg",
  },
};
