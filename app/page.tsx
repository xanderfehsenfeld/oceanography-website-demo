import { Link } from "lib/transition"

import { PageRoutes } from "@/lib/pageroutes"
import { buttonVariants } from "@/components/ui/button"
import { ComponentProps } from "react"
import Image from "next/image"


const BlueLink = (props: ComponentProps<typeof Link>) => <Link {...props}

className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
/>



export default function Home() {
  return (
    <section className="flex min-h-[86.5vh] flex-col items-center justify-center px-2 py-8 text-center">
      <h1 className="mb-4 text-4xl font-bold sm:text-7xl">LiveOcean</h1>


      <div className="md:flex max-w-6xl items-center gap-5">
        <div className="flex-1 text-left">
          <h3 className="my-2 font-bold">
            LiveOcean is a computer model simulating ocean water properties. It
            makes 3-day forecasts of currents, temperature, salinity and many
            biogeochemical fields including harmful algal blooms.
          </h3>
          <p className="my-2">
            LiveOcean is an ongoing project of the UW Coastal Modeling Group:{" "}
            <BlueLink href="../index.html">Dr. Parker MacCready</BlueLink> (UW Oceanography,
            lead),{" "}
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

         
            <BlueLink href="mailto:pmacc@uw.edu" rel="nofollow noopener" target="_blank">pmacc@uw.edu</BlueLink>
          </p>
        </div>
        <div className="flex-1">

<Image width={1200} height={900} src={'/images/splash.png'} alt="Surface Salinity" />



        </div>
      </div>
    </section>
  )
}
