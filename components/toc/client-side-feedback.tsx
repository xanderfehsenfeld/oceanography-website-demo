"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GitHubLink } from "@/settings/navigation"
import { LuArrowUpRight } from "react-icons/lu"

export default function ClientSideFeedback() {
  const pathNameFromClient = usePathname()

  const editUrl = `${GitHubLink.href}/tree/main/app${pathNameFromClient}/`

  return (
    <Link
      href={editUrl}
      title="View source code for this page"
      aria-label="View source code for this page"
      target="_blank"
      rel="noopener noreferrer"
      className={"flex items-center text-sm text-foreground"}
    >
      <LuArrowUpRight className="mr-1 inline-block h-4 w-4" />
      <span>View Source Code</span>
    </Link>
  )
}
