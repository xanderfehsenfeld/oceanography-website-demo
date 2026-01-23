import { notFound } from "next/navigation"

import { Settings } from "@/types/settings"
import { getDocument } from "@/lib/markdown"
import { PageRoutes } from "@/lib/pageroutes"
import { Separator } from "@/components/ui/separator"
import { Typography } from "@/components/ui/typography"
import { ArticleBreadcrumb } from "@/components/article/breadcrumb"
import { Pagination } from "@/components/article/pagination"
import { TableOfContents } from "@/components/toc"
import DriftersPugetSound from "./DriftersPugetSound"

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export default async function Pages({ params }: PageProps) {
  const { slug = [] } = await params
  const result = await params
  const pathName = slug.join("/")

  console.log('pathname', result)


  return (
    <div className="flex items-start gap-10">
      <section className="flex-3">
        <ArticleBreadcrumb paths={['drifters','pugetsound']} prefix={'/interactive'} />
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold">Puget Sound: Drifter Tracks</h1>
          <p className="text-sm">The map plot shows tracks from simulated surface drifter tracks over three days from the most recent LiveOcean daily forecast.</p>
          <Separator />
        </div>


        <Typography>
          <section><DriftersPugetSound/></section>
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
