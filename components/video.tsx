import * as React from "react"

function Video({ src, ...props }: React.ComponentProps<"video">) {
  return (
    <video controls loop autoPlay {...props}>
      <source src={src as string} type="video/mp4" />
    </video>
  )
}

export { Video }
