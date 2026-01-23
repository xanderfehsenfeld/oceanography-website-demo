import { Fragment } from "react"
import { toTitleCase } from "@/utils/toTitleCase"
import { Link } from "lib/transition"
import { LuHouse } from "react-icons/lu"

import { PageRoutes } from "@/lib/pageroutes"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function ArticleBreadcrumb({ paths, prefix }: { paths: string[], prefix: string }) {
  const currentPath = `/${paths.join("/").toLowerCase()}`
  const breadCrumb =
    PageRoutes.find(({ href }) => {
      return href.toLowerCase().includes(currentPath)
    })?.breadCrumb || []


  return (
    <div className="pb-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                title="Documentation Home"
                aria-label="Documentation Home"
                href={`/`}
              >
                <LuHouse className="h-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {paths.length > 2 ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    title={breadCrumb[0] || toTitleCase(paths[0])}
                    aria-label={toTitleCase(paths[0])}
                    href={`/${paths[0]}`}
                  >
                    {breadCrumb[0] || toTitleCase(paths[0])}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbEllipsis className="h-1" />
              </BreadcrumbItem>

              {paths.slice(-1).map((path, i) => {
                const index = paths.length - 1 + i
                const href = `${prefix}/${paths.slice(0, index + 1).join("/")}`

                return (
                  <Fragment key={path}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {index < paths.length - 1 ? (
                        <BreadcrumbLink asChild>
                          <Link
                            title={toTitleCase(path)}
                            aria-label={toTitleCase(path)}
                            href={href}
                          >
                            {toTitleCase(path)}
                          </Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="b">
                          {toTitleCase(path)}
                        </BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                )
              })}
            </>
          ) : (
            paths.map((path, index) => {
              const href = `${prefix}/${paths.slice(0, index + 1).join("/")}`
              const breadCrumbTitle = breadCrumb[index] || toTitleCase(path)
              return (
                <Fragment key={path}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {index < paths.length - 1 ? (
                      <BreadcrumbLink asChild>
              
                          <span>
                          {breadCrumbTitle}

                          </span>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="b">
                        {breadCrumbTitle}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              )
            })
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
