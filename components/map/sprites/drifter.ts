"use client"

import { Circle, Graphics, IRenderer, Sprite } from "pixi.js"

const defaultCircle = new Graphics()

const defaultRadius = 30

const lightColor = "blue"
const darkColor = "lightskyblue"
const defaultAlpha = 0.3
const defaultScale = 0.5

defaultCircle.beginFill(0xffffff)
defaultCircle.drawShape(new Circle(0, 0, defaultRadius))
defaultCircle.endFill()

export class Drifter extends Sprite {
  line: Graphics
  isDark: boolean
  constructor(renderer: IRenderer, _line: Graphics, _isDark: boolean) {
    const defaultCircleTexture = renderer.generateTexture(defaultCircle)

    super(defaultCircleTexture)
    this.isDark = _isDark

    this.scale.set(defaultScale)

    this.alpha = defaultAlpha

    this.tint = _isDark ? darkColor : lightColor

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
    this.tint = this.isDark ? darkColor : lightColor
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

  setIsDark(_isDark: boolean): void {
    this.isDark = _isDark
    if (this.tint !== "red") {
      this.tint = _isDark ? darkColor : lightColor
    }
  }
}
