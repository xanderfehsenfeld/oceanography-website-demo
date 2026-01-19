import * as React from "react"

function HorizontalLayout(props: React.ComponentProps<"div">) {
  const { children } = props
  const [firstChild, ...rest] = React.Children.toArray(children)

  return (
    <div className={"not-prose flex flex-col gap-4 md:flex-row"}>
      <div className={"w-full flex-2"}>{firstChild}</div>
      <div className={"w-full flex-3"}>{rest}</div>
    </div>
  )
}

export { HorizontalLayout }
