import clsx from "clsx"

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
}) => (
  <div
    className={clsx(
      "items-center text-xs text-nowrap text-ellipsis italic",
      className
    )}
  >
    Last edited {lastEditedFormat.format(new Date(lastEdited))}
  </div>
)
