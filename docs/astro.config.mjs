// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  vite: {
    ssr: {
      noExternal: ["zod"],
    },
  },
  site: "https://kodalabs-io.github.io",
  base: "/eqo",
  integrations: [
    starlight({
      title: "Eqo",
      logo: {
        light: "./public/eqo/light/primary.svg",
        dark: "./public/eqo/dark/primary.svg",
        replacesTitle: true,
      },
      description:
        "RGAA v4.1.2 accessibility compliance analyzer for Next.js — automated, honest, CI-ready.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/kodalabs-io/eqo",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/kodalabs-io/eqo/edit/main/docs/",
      },
      sidebar: [
        {
          label: "Start Here",
          items: [
            { label: "Introduction", link: "/introduction/" },
            { label: "Getting Started", link: "/getting-started/" },
          ],
        },
        {
          label: "Configuration",
          link: "/configuration/",
        },
        {
          label: "Guides",
          items: [
            {
              label: "Accessibility Page (Next.js)",
              link: "/guides/accessibility-page/",
            },
            {
              label: "CI/CD Integration",
              link: "/guides/ci-cd/",
            },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "CLI Commands", link: "/reference/cli/" },
            { label: "Programmatic API", link: "/reference/api/" },
          ],
        },
      ],
      lastUpdated: true,
      pagination: true,
    }),
  ],
});
