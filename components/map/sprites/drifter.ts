"use client"

import { Circle, Graphics, IPointData, IRenderer, Sprite } from "pixi.js"

const defaultCircle = new Graphics()

const defaultRadius = 30

const lightColor = "blue"
const darkColor = "lightskyblue"
const defaultAlpha = 0.3
const defaultScale = 0.5

defaultCircle.beginFill(0xffffff)
defaultCircle.drawShape(new Circle(0, 0, defaultRadius))
defaultCircle.endFill()

defaultCircle.beginFill("purple")
const arrow = [
  { x: -21, y: -21 },
  { x: 30, y: 0 },
  { x: -21, y: 21 },
  { x: -13, y: 0 },
]

defaultCircle.drawPolygon(arrow)

export class Drifter extends Sprite {
  line: Graphics
  isDark: boolean
  linePoints: IPointData[]
  arrowAngles: number[]
  constructor(
    renderer: IRenderer,
    _line: Graphics,
    _isDark: boolean,
    _linePoints: IPointData[]
  ) {
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

    this.linePoints = _linePoints

    this.arrowAngles = this.linePoints.map((_, index): number => {
      const currentIndex = Math.min(index, this.linePoints.length - 2)
      const { x, y } = this.linePoints[currentIndex]
      const nextLocation = this.linePoints[currentIndex + 1]

      const dx = nextLocation.x - x
      const dy = nextLocation.y - y

      return Math.atan2(dy, dx)
    })
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

  setLocation(x: number, y: number) {
    const currentLocationInLine = this.linePoints.findIndex(
      ({ x: pointX, y: pointY }) => x === pointX && y === pointY
    )
    const rotation = this.arrowAngles[currentLocationInLine]

    this.setTransform(
      x,
      y,

      this.scale.x,
      this.scale.y,
      rotation
    )
  }

  setIsDark(_isDark: boolean): void {
    this.isDark = _isDark
    if (this.tint !== "red") {
      this.tint = _isDark ? darkColor : lightColor
    }
  }
}
