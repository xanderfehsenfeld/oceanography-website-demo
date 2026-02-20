"use client"

import { Circle, Graphics, IRenderer, Sprite } from "pixi.js"

const defaultCircle = new Graphics()

defaultCircle.beginFill(0xffffff)
defaultCircle.drawShape(new Circle(0, 0, 20))
defaultCircle.endFill()

const defaultColor = 0x3388ff
const defaultAlpha = 0.3
const defaultScale = 0.5

export class Drifter extends Sprite {
  line: Graphics
  constructor(renderer: IRenderer, _line: Graphics) {
    const defaultCircleTexture = renderer.generateTexture(defaultCircle)

    super(defaultCircleTexture)

    this.scale.set(defaultScale)

    this.alpha = defaultAlpha

    this.tint = defaultColor

    this.cursor = "pointer"

    this.eventMode = "dynamic"
    this.anchor.set(0.5)

    this.line = _line
  }

  setActive() {
    this.tint = "red"
    this.line.alpha = 0.3
    this.line.visible = true
  }

  setInactive() {
    this.resetState()
  }

  resetState() {
    this.tint = defaultColor
    this.alpha = defaultAlpha
    this.line.visible = false
  }

  setSelected() {
    this.tint = "red"
    this.alpha = 1
    this.line.alpha = 1

    this.line.visible = true
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
