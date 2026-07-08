import { useCallback, useEffect, useRef } from "react"
import { Application, DisplayObject, IRenderer } from "pixi.js"

export default function PixiDecorator({
  width,
  height,
  child,
}: {
  width: number
  height: number
  child: (renderer: IRenderer) => DisplayObject
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const init = useCallback(() => {
    const container = containerRef.current
    if (!container) {
      throw "Uninitialized container"
    }

    const app = new Application({ width, height, backgroundColor: "gray" })

    // @ts-ignore
    container.appendChild(app.view)

    return app
  }, [])

  useEffect(() => {
    const app = init()

    app.stage.addChild(child(app.renderer))
    return () => app.destroy()
  }, [init])

  return <div ref={containerRef} />
}
