"use client"

import { Graphics, IRenderer, Sprite } from "pixi.js"

export class Reticule extends Sprite {
  constructor(renderer: IRenderer) {
    const circle = new Graphics()
    circle.beginFill("lightgray")

    circle.lineStyle({
      color: "purple",
      width: 3,
    })

    circle.drawCircle(0, 0, 500)
    circle.endFill()

    super(renderer.generateTexture(circle))

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
}
