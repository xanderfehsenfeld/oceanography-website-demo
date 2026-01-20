import { Link } from "lib/transition"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"

import { getPreviousNext } from "@/lib/markdown"

export function Pagination({ pathname }: { pathname: string }) {
  const res = getPreviousNext(`docs/${pathname}`)
  return (
    <div className="flex justify-between py-5 sm:py-7 items-stretch gap-2">
      {res.prev && (
        <Link
          rel="prev"
          href={`${res.prev.href}`}
          title={`Previous: ${res.prev.title}`}
          className="inline-flex min-h-9 text-wrap items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium no-underline! shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          <LuChevronLeft className="mr-1 h-4 w-4" />
          <span>{res.prev.title}</span>
        </Link>
      )}
      {res.next && (
        <Link
          rel="next"
          href={`${res.next.href}`}
          title={`Next: ${res.next.title}`}
          className="ml-auto inline-flex min-h-9 text-wrap items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium no-underline! shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          <span>{res.next.title}</span>
          <LuChevronRight className="ml-1 h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
