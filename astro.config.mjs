import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const site = process.env.PUBLIC_SITE_URL || "https://jamyfpv.com";
const basePath = process.env.PUBLIC_BASE_PATH || "";
const trimmedBasePath = basePath.replace(/^\/+|\/+$/g, "");
const normalizedBase = trimmedBasePath ? `/${trimmedBasePath}/` : "/";

export default defineConfig({
  site,
  base: normalizedBase,
  output: "static",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  },
  trailingSlash: "ignore"
});
