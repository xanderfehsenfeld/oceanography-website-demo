
import { PageRoutes } from "@/lib/pageroutes"
import { Separator } from "@/components/ui/separator"
import { Typography } from "@/components/ui/typography"
import { ArticleBreadcrumb } from "@/components/article/breadcrumb"
import { Pagination } from "@/components/article/pagination"

import DriftersWillapaAndGrays from "./DriftersWillapaAndGrays"

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export default async function Pages({ params }: PageProps) {
  const { slug = [] } = await params
  const pathName = slug.join("/")

  return (
    <div className="flex items-start gap-10">
      <section className="flex-3">
        <ArticleBreadcrumb
          paths={["drifters", "willapaandgrays"]}
          prefix={"/interactive"}
        />
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold">
            Willapa Bay & Grays Harbor Drifter Tracks
          </h1>
          <p className="text-sm">
            The map plot shows tracks from simulated drifter tracks over three
            days from the most recent LiveOcean daily forecast.{" "}
          </p>
          <Separator />
        </div>
        <Typography>
          <section>
            <DriftersWillapaAndGrays />
          </section>
          <Pagination pathname={pathName} />
        </Typography>
      </section>
    </div>
  )
}

export function generateStaticParams() {
  return PageRoutes.filter((item) => item.href).map((item) => ({
    slug: item.href.split("/").slice(1),
  }))
}
