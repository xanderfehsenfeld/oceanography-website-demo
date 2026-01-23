
import { PageRoutes } from "@/lib/pageroutes"
import { Typography } from "@/components/ui/typography"
import { ArticleBreadcrumb } from "@/components/article/breadcrumb"
import { Pagination } from "@/components/article/pagination"
import { Sidebar } from "@/components/sidebar"



export default function Pages({ children }: Readonly<{
  children: React.ReactNode
}>) {
  const slug:string[] = [] 
  const pathName = slug.join("/")

  return (
    <div className="flex items-start gap-10 pt-10">
      <Sidebar />
      <div className="flex-1 md:flex-6">
        <div className="flex items-start gap-10">
          <section className="flex-3">
            <ArticleBreadcrumb paths={slug} prefix={'/interactive'}/>
            {/* <div className="space-y-4">
          <h1 className="text-3xl font-semibold">{frontmatter.title}</h1>
          <p className="text-sm">{frontmatter.description}</p>
          <Separator />
        </div> */}
            <Typography>
              <section>{children}</section>
              <Pagination pathname={pathName} />
            </Typography>
          </section>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata() {
  return {}
}

export function generateStaticParams() {
  return PageRoutes.filter((item) => item.href).map((item) => ({
    slug: item.href.split("/").slice(1),
  }))
}
