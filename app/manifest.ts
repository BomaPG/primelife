import type { MetadataRoute } from "next";

// F10-AC1: a valid manifest + icons make the app installable on Android
// Chrome. Icons are placeholders — PRD Section 16 flags the real app icon,
// splash, and brand colours as a follow-up.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PrimeLife",
    short_name: "PrimeLife",
    description:
      "Daily habits, localised meal guidance, and light tracking for women 45 to 65.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2f6f6b",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
