import Link from "next/link"
import { Separator } from "@radix-ui/react-dropdown-menu"

import { Typography } from "@/components/ui/typography"
import { ArticleBreadcrumb } from "@/components/article/breadcrumb"
import { Pagination } from "@/components/article/pagination"

import OberservationsViewer from "./ObservationsViewer"

export default function Pages() {
  return (
    <section className="flex-3">
      <ArticleBreadcrumb
        paths={["observationsviewer"]}
        prefix={"/interactive"}
      />
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Observations Viewer</h1>
        <p className="text-sm">
          This interactive tool plots observational bottle data throughout the
          Pacific Northwest coastal waters and the Salish Sea.
        </p>
        <Separator />
      </div>
      <Typography>
        <section>
          <OberservationsViewer />

          <h3>
            This interactive tool plots observational bottle data throughout the
            Pacific Northwest coastal waters and the Salish Sea.
          </h3>
          <h2>Directions:</h2>
          <ul>
            <li>
              Drag a rectange on the map to select a region. Those cast
              locations will turn BLUE.
            </li>
            <li>
              Click on the Time Slider to select a specific month to highlight.
              You can either drag the slider to a month or use the left-right
              arrow keys. If there are casts in the region for that month they
              will turn RED.
            </li>
            <li>
              Use the dropdown menu below the time slider to select the year.
            </li>
          </ul>
          <p>
            This data comes from a veriety of agencies: WA Department of
            Ecology, UW Washington Ocean Acidification Center cruises, NOAA West
            Coast Ocean Acidification cruise, Fisheries and Oceans Canada, etc.
            The complete reference for data sources is{" "}
            <Link href="https://github.com/parkermac/LO/blob/main/obs/README.md">
              here
            </Link>
            .
          </p>
          <p>
            The observations are plotted vs. depth (m) on the right. The
            properties are: CT = Potential Temperature (deg C), SA = Salinity
            (g/kg), Dissolved Oxygen, Nitrate, Dissolved Inorganic Carbon, and
            Total Alkalinity.
          </p>
        </section>
        <Pagination pathname={"observationsviewer"} prefix="interactive" />
      </Typography>
    </section>
  )
}
