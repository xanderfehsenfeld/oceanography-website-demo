import { useEffect } from "react"
import { autoDetectRenderer, Container } from "pixi.js"
import { useMap } from "react-leaflet"

import { pixiOverlay } from "./pixi-overlay"

export const PixiOverlayComponent = () => {
  const map = useMap()

  useEffect(() => {
    const draw = () => {
      console.log("draw")
    }

    const overlay = autoDetectRenderer({
      preference: "webgpu", // or 'webgl'
    }).then((renderer) => {
      const pixi = pixiOverlay(draw, new Container(), renderer)

      pixi.addTo(map)

      return pixi
    })

    return () => overlay.then((pixi) => pixi.destroy())
  }, [])

  return <></>
}
