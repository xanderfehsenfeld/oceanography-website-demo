import * as d3 from "d3"
import {
  BLEND_MODES,
  Container,
  Graphics,
  ILineStyleOptions,
  IPointData,
  IRenderer,
  Matrix,
  RenderTexture,
  Sprite,
} from "pixi.js"

const defaultLineColor = "chartreuse"
const backgroundLineColor = "magenta"

const arrow = [
  { x: -10, y: -10 },
  { x: 12, y: 0 },
  { x: -10, y: 10 },
  { x: -6, y: 0 },
]

const arrowTransform = new Matrix()
  // .translate(defaultRadius - 5, 0)
  .scale(1, 1)

export class DrifterPath extends Container {
  isBackground: boolean

  linePoints: IPointData[]
  lineGraphic: Graphics
  dottedLineGraphic: Graphics

  visibleLineSegment: Graphics

  constructor(
    _linePoints: IPointData[],
    renderer: IRenderer,
    _isBackground?: boolean
  ) {
    super()
    this.isBackground = _isBackground || false
    this.eventMode = "none"
    this.interactiveChildren = false

    this.linePoints = _linePoints
    this.lineGraphic = new Graphics()

    this.lineGraphic.lineStyle({
      width: 3,
      color: "white",
      alpha: this.isBackground ? 0.3 : 1,
    })
    this.lineGraphic.tint = this.isBackground
      ? backgroundLineColor
      : defaultLineColor

    this.dottedLineGraphic = new Graphics()
    this.dottedLineGraphic.lineStyle({
      width: 3,
      color: "#A6A09B",
    })

    this.dottedLineGraphic.lineTextureStyle

    this.visible = this.isBackground

    this.addChild(this.lineGraphic)
    this.addChild(this.dottedLineGraphic)

    // // Create a graphics object to define our mask
    this.visibleLineSegment = new Graphics()
    this.visibleLineSegment.lineStyle({
      width: 3,
      color: "#A6A09B",
    })
    // Add container that wi
    this.mask = this.visibleLineSegment
    this.addChild(this.visibleLineSegment)
  }

  clear() {
    this.lineGraphic.clear()
    this.dottedLineGraphic.clear()
    this.visibleLineSegment.clear()
  }

  setIsDark(isDark: boolean): void {
    if (this.isBackground) {
      this.lineGraphic.tint = isDark ? "magenta" : "purple"
      this.dottedLineGraphic.tint = isDark ? "magenta" : "purple"
    } else {
      this.lineGraphic.tint = isDark ? "lime" : "darkgreen"
      this.dottedLineGraphic.tint = isDark ? "lime" : "darkgreen"
    }
  }

  lineStyle(style: Pick<ILineStyleOptions, "alpha" | "width">) {
    this.lineGraphic.lineStyle({ ...style, color: "white" })
    this.visibleLineSegment.lineStyle({ ...style, color: "white" })
    this.dottedLineGraphic.lineStyle({ ...style, color: "#A6A09B" })
  }

  setDottedLineVisibility(visible: boolean) {
    this.dottedLineGraphic.visible = visible
  }

  // drawMask(currentFrameNumber: number) {
  //   this.visibleLineSegment.clear()
  // }

  drawVertices(currentFrameNumber: number) {
    this.linePoints.forEach(({ x, y }, frame) => {
      if (frame === 0) {
        this.lineGraphic.moveTo(x, y)

        if (frame === 0)
          this.lineGraphic.drawCircle(x, y, this.lineGraphic.line.width * 2)

        this.dottedLineGraphic.moveTo(x, y)
      } else {
        this.lineGraphic.lineTo(x, y)
        if (frame % 2 === 1) {
          this.dottedLineGraphic.lineTo(x, y)
        } else {
          this.dottedLineGraphic.moveTo(x, y)
        }
      }
    })

    this.linePoints.slice(currentFrameNumber).forEach(({ x, y }, frame) => {
      if (frame === 0) {
        this.visibleLineSegment.moveTo(x, y)

        this.visibleLineSegment.drawCircle(
          x,
          y,
          this.lineGraphic.line.width * 2
        )
      } else {
        this.visibleLineSegment.lineTo(x, y)
      }
    })
  }
}
