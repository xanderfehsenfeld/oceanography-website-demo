import { Link, Skeleton } from "@radix-ui/themes"
import { LuArrowUpRight, LuHouse } from "react-icons/lu"

import { Settings } from "@/types/settings"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { HorizontalLayout } from "@/components/ui/horizontal-layout"
import { Separator } from "@/components/ui/separator"
import { Typography } from "@/components/ui/typography"
import { Pagination } from "@/components/article/pagination"
import { BackToTop } from "@/components/toc/backtotop"

export default function LoadingArticle() {
  return (
    <div className="flex items-start gap-10">
      <section className="flex-3">
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
                    <Skeleton>
                      <LuHouse className="h-4" />
                    </Skeleton>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />
              <BreadcrumbLink asChild>
                <span>
                  <Skeleton>{"Forecast movies"}</Skeleton>
                </span>
              </BreadcrumbLink>
              <BreadcrumbSeparator />
              <BreadcrumbPage className="b">
                <Skeleton>
                  {"Full Region Surface Salinity and Drifters"}
                </Skeleton>
              </BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-semibold">
            <Skeleton>{"Full Region Surface Salinity and Drifters"}</Skeleton>
          </h1>
          <p className="text-sm">
            <Skeleton>
              {
                "This is a movie made from the most recent LiveOcean three-day forecast."
              }
            </Skeleton>
          </p>
          <Separator />
        </div>
        <Typography>
          <section>
            <HorizontalLayout className="mt-4">
              <Skeleton width={"100%"} height={"100%"} />
              <div>
                <Skeleton>
                  {
                    'The movie has a panel at the bottom that shows time. The tide is evident in the twice-a-day variation of the sea surface height. Daytimes are shown as the thick yellow lines on the horizontal axis. Winds are shown by an arrow in the middle of the map, with the scale given by the circle. The black line off the coast on the map is the 200 m depth line, which marks the "shelf break" separating the coastal region from the deeper ocean beyond.'
                  }
                </Skeleton>
              </div>
            </HorizontalLayout>
          </section>
          <Pagination pathname={"loading"} />
        </Typography>
      </section>

      {Settings.rightbar && (
        <aside
          className="toc sticky top-16 hidden h-screen min-w-[230px] flex-1 gap-3 xl:flex xl:flex-col"
          aria-label="Table of contents"
        >
          {Settings.toc && (
            <div className="flex w-full flex-col gap-3 pl-2">
              <h3 className="text-sm font-semibold">
                <Skeleton className="pl-0">On this page</Skeleton>
              </h3>
              <div className="flex flex-col gap-2.5 text-sm text-foreground">
                <Skeleton className="pl-0">{"Link 1"}</Skeleton>
                <Skeleton className="pl-0">{"Link 2"}</Skeleton>
                <Skeleton className="pl-3">{"Link 3"}</Skeleton>
              </div>
            </div>
          )}
          {Settings.feedback && (
            <div className="flex flex-col gap-3 pl-2">
              <h3 className="text-sm font-semibold">
                <Skeleton>Content</Skeleton>
              </h3>
              <div className="flex flex-col gap-2">
                <Link
                  href={""}
                  title="Give Feedback"
                  aria-label="Give Feedback"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={"flex items-center text-sm text-foreground"}
                >
                  <span>
                    <Skeleton>
                      <LuArrowUpRight className="mr-1 inline-block h-4 w-4" />
                      {"Feedback"}
                    </Skeleton>
                  </span>
                </Link>
                <Link
                  href={""}
                  title="Edit this page"
                  aria-label="Edit this page"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={"flex items-center text-sm text-foreground"}
                >
                  <span>
                    <Skeleton>
                      <LuArrowUpRight className="mr-1 inline-block h-4 w-4" />
                      {"Edit page"}
                    </Skeleton>
                  </span>
                </Link>
              </div>
            </div>
          )}
          {Settings.totop && <BackToTop />}
        </aside>
      )}
    </div>
  )
}
