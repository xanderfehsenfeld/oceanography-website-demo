import { Paths } from "@/lib/pageroutes"

export const Documents: Paths[] = [
  {
    title: "Forecast movies",
    href: "/docs/forecastmovies",
    noLink: true,

    items: [
      {
        title: "Full Region Surface Salinity and Drifters",
        href: "/p5_Phab_full_salt_top",
      },

      {
        title: "Full Region Bottom Oxygen",
        href: "/p5_full_oxygen_bot",
      },

      {
        title: "Washington Shelf Bottom Oxygen (5 days)",
        href: "/p5_nshelf_oxygen_bot",
      },
      {
        title: "Puget Sound Surface Temperature",
        href: "/p5_PS_temp_top",
      },
      {
        title: "Puget Sound Surface Currents",
        href: "/p5_PS_speed_top",
      },
    ],
  },
  {
    spacer: true,
  },
  {
    title: "High-Resolution Submodels",
    href: "/docs/highresolutionsubmodels",
    noLink: true,

    items: [
      {
        title: "Willapa & Grays Surface Ocean Acidification",
        href: "/p5_willapa_ARAG_top",
      },
      {
        title: "Willapa & Grays Bottom Ocean Acidification",
        href: "/p5_willapa_ARAG_bot",
      },

      {
        title: "Willapa & Grays Surface Temperature",
        href: "/p5_willapa_temp_top",
      },
      {
        title: "Willapa & Grays Surface Salinity",
        href: "/p5_willapa_salt_top",
      },
      {
        title: "Willapa & Grays Surface Currents",
        href: "/p5_willapa_speed_top",
      },
      {
        title: "South Puget Sound Surface Temperature",
        href: "/p5_oly_temp_top",
      },
      {
        title: "South Puget Sound Surface Salinity",
        href: "/p5_oly_salt_top",
      },
    ],
  },
  {
    spacer: true,
  },

  {
    title: "Interactive Tools",
    href: "/interactive",
    noLink: true,

    items: [
      {
        title: "Drifters: Puget Sound",
        href: "/drifters/pugetsound",
      },
      {
        title: "Drifters: Willapa & Grays",
        href: "/drifters/willapaandgrays",
      },
      {
        title: "Drifters: Willapa 2025 Custom",
        href: "/drifters/custom",
      },
      // {
      //   title: "Observation Viewer",
      //   href: "/obs",
      // },
      // {
      //   title: "Model vs. Observations Viewer",
      //   href: "/obsmod",
      // },
    ],
  },
  {
    spacer: true,
  },

  {
    title: "Background",
    href: "/docs/background",
    noLink: true,

    items: [
      {
        title: "How Tides Work in Puget Sound",
        href: "/tides_background",
      },
      {
        title: "Observed Long-term Trends in Puget Sound Water Properties",
        href: "/long_term_trends",
      },
      {
        title: "The Estuarine Exchange Flow",
        href: "/exchange_flow",
      },
    ],
  },
  {
    spacer: true,
  },
  {
    title: "About the Model",
    href: "/docs/aboutthemodel",
    noLink: true,

    items: [
      {
        title: "Data Access",
        href: "/data_access",
      },
      {
        title: "How the Model Works",
        href: "/how_it_works",
      },
      {
        title: "How We Test the Model",
        href: "/how_we_test_it",
      },
      {
        title: "References",
        href: "/references",
      },
    ],
  },

  {
    spacer: true,
  },
  {
    title: "Gallery",
    href: "/docs/gallery",
    noLink: true,

    items: [
      {
        title: "A Year of Modeled Salinity",
        href: "/salinity_year",
      },
      {
        title: "A Year of Modeled Oxygen",
        href: "/oxygen_year",
      },
      {
        title: "A Year of Modeled Phytoplankton",
        href: "/phytoplankton_year",
      },
    ],
  },
]
