import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://bel-en-s.github.io",
  base: "/AWK/",
  integrations: [react()],
  vite: {
    ssr: {
      noExternal: ["gsap"],
    },
  },
});
