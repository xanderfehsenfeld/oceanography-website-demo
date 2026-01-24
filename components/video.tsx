import * as React from "react"
import Player from "next-video/player"
import Instaplay from "player.style/instaplay/react"

function Video({
  src,
  ...props
}: React.ComponentProps<"video"> & { width: number; height: number }) {
  return (
    <Player
      controls
      loop
      autoPlay
      className="not-prose"
      muted
      {...props}
      height={props.height}
      type="video/mp4"
      src={src as string}
      theme={Instaplay}
    />
  )
}

export { Video }
