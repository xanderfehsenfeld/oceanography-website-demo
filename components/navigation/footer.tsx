"use client"

import { useContext } from "react"
import Link from "next/link"
import { MetadataContext } from "@/providers/metadata"

import { Settings } from "@/types/settings"

import { LastEdited } from "../ui/last-edited"

export function Footer() {
  const metadataContext = useContext(MetadataContext)

  return (
    <footer className="flex h-16 w-full flex-wrap items-center justify-center gap-4 border-t px-2 py-3 text-sm text-foreground sm:justify-between sm:gap-0 sm:px-4 sm:py-0 lg:px-8">
      <p className="items-center">
        &copy; {new Date().getFullYear()}{" "}
        <Link
          title={Settings.name}
          aria-label={Settings.name}
          className="font-semibold"
          href={Settings.link}
        >
          {Settings.name}
        </Link>
        .
      </p>
      {Settings.branding !== false && metadataContext.lastEdited && (
        <LastEdited
          lastEdited={metadataContext.lastEdited}
          className="text-sm"
        />
      )}
    </footer>
  )
}
