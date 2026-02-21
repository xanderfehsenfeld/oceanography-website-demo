"use client"

import { Graphics, IRenderer, Sprite } from "pixi.js"

const lightcolor = "lightgray"
const darkcolor = "darkgray"

export class Reticule extends Sprite {
  constructor(renderer: IRenderer) {
    const circle = new Graphics()
    circle.beginFill(0xffffff)

    circle.lineStyle({
      color: "purple",
      width: 3,
    })

    circle.drawCircle(0, 0, 500)
    circle.endFill()

    super(renderer.generateTexture(circle))

    this.tint = lightcolor

    this.anchor.set(0.5)
    this.eventMode = "passive"
    this.alpha = 0.5
    this.visible = false
  }

  hide() {
    this.visible = false
  }

  show() {
    this.visible = true
  }

  setTranslate(x: number, y: number) {
    this.setTransform(
      x,
      y,

      this.scale.x,
      this.scale.y
    )
  }

  setIsDark(isDark: boolean) {
    this.tint = isDark ? darkcolor : lightcolor
  }
}
