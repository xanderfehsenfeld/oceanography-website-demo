"use client"

import { useContext, useEffect, useState } from "react"
import { MetadataContext } from "@/providers/metadata"

import { cn } from "@/lib/utils"

const lastEditedFormat = new Intl.DateTimeFormat("en-US", {
  timeStyle: "short",
  dateStyle: "medium",
})

export const LastEdited = ({
  lastEdited,
  className,
}: {
  className?: string
  lastEdited: string
}) => {
  const metadataContext = useContext(MetadataContext)
  useEffect(() => {
    if (!metadataContext.lastEdited) {
      metadataContext.setLastEdited(lastEdited)
    }
  }, [lastEdited])

  return (
    <div
      className={cn(
        "items-center text-xs text-nowrap text-ellipsis italic",
        className
      )}
    >
      Last edited {lastEditedFormat.format(new Date(lastEdited))}
    </div>
  )
}
