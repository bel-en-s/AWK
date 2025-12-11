import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://belenseoane.github.io",
  base: "/awk/",
  
  integrations: [react()],
});
