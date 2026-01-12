import { ComponentProps } from "react"
import Image from "next/image"
import { Link } from "lib/transition"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/markdown/card"

const BlueLink = (props: ComponentProps<typeof Link>) => (
  <Link
    {...props}
    className="text-blue-600 underline visited:text-purple-600 hover:text-blue-800"
  />
)

export default function Home() {
  return (
    <section className="flex min-h-[86.5vh] flex-col items-center justify-center px-2 py-8 text-center">
      <h1 className="mb-4 text-4xl font-bold sm:text-7xl">LiveOcean</h1>

      <div className="my-2 grid w-full gap-4 sm:grid-cols-2 md:grid-cols-4 max-w-6xl">
        <div className="flex flex-col gap-2">
          <h2 className="font-bold">See Today's Forecast at NANOOS</h2>

          <Card
            title="NANOOS NVS"
            variant="small"
            className="bg-pink-300"
            external={true}
            href="http://nvs.nanoos.org/Explorer?action=overlay:liveocean_temp"
          />

          <h2 className="font-bold">Forecast Movies</h2>

          <Card
            variant="small"
                      className="bg-teal-200"

            href="../LO/p5_Phab_full_salt_top.html"
            title="Full Region Surface Salinity and Drifters"
          />
          <Card
            variant="small"
                      className="bg-teal-200"

            href="../LO/p5_full_oxygen_bot.html"
            title="Full Region Bottom Oxygen"
          />
          <Card
            variant="small"
                      className="bg-teal-200"

            href="../LO/p5_nshelf_oxygen_bot.html"
            title="Washington Shelf Bottom Oxygen (5 days)"
          />
          <Card
            variant="small"
                      className="bg-teal-200"

            href="../LO/p5_PS_temp_top.html"
            title="Puget Sound Surface Temperature"
          />
          <Card
            variant="small"
                      className="bg-teal-200"

            href="../LO/p5_PS_speed_top.html"
            title="Puget Sound Surface Currents"
          />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-bold">High-Resolution Submodels</h3>
          <Card
          className="bg-teal-200"
            variant="small"
            href="../LO/p5_willapa_ARAG_top.html"
            title="Willapa &amp; Grays Surface Ocean Acidification"
          />
          <Card
            variant="small"
                      className="bg-teal-200"

            href="../LO/p5_willapa_ARAG_bot.html"
            title="Willapa &amp; Grays Bottom Ocean Acidification"
          />
          <Card
            variant="small"
                      className="bg-teal-200"

            href="../LO/p5_willapa_temp_top.html"
            title="Willapa &amp; Grays Surface Temperature"
          />
          <Card
            variant="small"
                      className="bg-teal-200"

            href="../LO/p5_willapa_salt_top.html"
            title="Willapa &amp; Grays Surface Salinity"
          />
          <Card
            variant="small"
                      className="bg-teal-200"

            href="../LO/p5_willapa_speed_top.html"
            title="Willapa &amp; Grays Surface Currents"
          />
          <Card
            variant="small"
                      className="bg-teal-200"

            href="../LO/p5_oly_temp_top.html"
            title="South Puget Sound Surface Temperature"
          />
          <Card
            variant="small"
                      className="bg-teal-200"

            href="../LO/p5_oly_salt_top.html"
            title="South Puget Sound Surface Salinity"
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-bold">Interactive Tools</h2>
          <Card
            variant="small"
            className="bg-sky-200"
            href="../LO/tracks2_PS.html"
            title="Drifters: Puget Sound"
          />
          <Card
            variant="small"
                        className="bg-sky-200"

            href="../LO/tracks2_wgh.html"
            title="Drifters: Willapa &amp; Grays"
          />
          <Card
            variant="small"
                        className="bg-sky-200"

            href="../LO/tracks2_willapa25.html"
            title="Drifters: Willapa 2025 Custom"
          />
          <Card
            variant="small"
                        className="bg-sky-200"

            href="../LO/obs.html"
            title="Observation Viewer"
          />
          <Card
            variant="small"
                        className="bg-sky-200"

            href="../LO/obsmod.html"
            title="Model vs. Observations Viewer"
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-bold">Background</h2>
          <Card
            variant="small"
                        className="bg-sky-200"

            href="../LO/tides_background.html"
            title="How Tides Work in Puget Sound"
          />
          <Card
            variant="small"
                        className="bg-sky-200"

            href="../LO/long_term_trends.html"
            title="Observed Long-term Trends in Puget Sound Water
            Properties"
          />
          <Card
            variant="small"
                        className="bg-sky-200"

            href="../LO/exchange_flow.html"
            title="The Estuarine Exchange Flow"
          />

          <h2 className="font-bold">About the Model</h2>
          <Card
            variant="small"
                        className="bg-sky-200"

            href="../LO/data_access.html"
            title="Data Access"
          />
          <Card
            variant="small"
                        className="bg-sky-200"

            href="../LO/how_it_works.html"
            title="How the Model Works"
          />
          <Card
            variant="small"
                        className="bg-sky-200"

            href="../LO/how_we_test_it.html"
            title="How We Test the Model"
          />
          <Card
            variant="small"
                        className="bg-sky-200"

            href="../LO/references.html"
            title="References"
          />
        </div>
      </div>
      <hr className="my-4 w-full border border-y" />
      <div className="max-w-6xl items-center gap-5 md:flex">
        <div className="flex-1 text-left">
          <h3 className="my-2 font-bold">
            LiveOcean is a computer model simulating ocean water properties. It
            makes 3-day forecasts of currents, temperature, salinity and many
            biogeochemical fields including harmful algal blooms.
          </h3>
          <p className="my-2">
            LiveOcean is an ongoing project of the UW Coastal Modeling Group:{" "}
            <BlueLink href="../index.html">Dr. Parker MacCready</BlueLink> (UW
            Oceanography, lead),{" "}
            <BlueLink href="https://samanthasiedlecki.wixsite.com/coastalbiogeodynlab">
              Dr. Samantha Siedlecki
            </BlueLink>{" "}
            (U. Connecticut, oxygen and carbon chemistry), Dr. Jilian Xiong (UW
            Oceanography), Dr. Kate Hewett (UW Oceanography), Erin Broatch (UW
            Ocean grad student), Dakota Mascarenas (UW CEE grad student), Aurora
            Leeson (UW CEE grad student), and David Darr (computational
            systems).
          </p>
          <p className="my-2">
            The model output presented here is part of ongoing research into the
            realistic simulation of ocean biology and chemistry. This is an
            experimental product and intended for research use only. Our goal in
            making it publicly available is to facilitate communication between
            resource users, managers, and scientists, and to improve the quality
            and utility of the forecasts. Any use of these forecasts is done at
            the risk of the user.
          </p>
          <p className="my-2">
            {`Questions or comments? Please email Parker MacCready: `}

            <BlueLink
              href="mailto:pmacc@uw.edu"
              rel="nofollow noopener"
              target="_blank"
            >
              pmacc@uw.edu
            </BlueLink>
          </p>
        </div>
        <div className="flex-1">
          <Image
            width={1200}
            height={900}
            src={"/images/splash.png"}
            alt="Surface Salinity"
          />
        </div>
      </div>
            <hr className="my-4 w-full border border-y" />
<div>
  <Image 
  width={400}
  height={120}
  src={"/images/WOAC_logo.png"}
  alt="Coastal Modeling Group Logo"
  />
</div>
    </section>
  )
}
