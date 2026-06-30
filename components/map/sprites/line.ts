import * as d3 from "d3"
import {
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

const transformedArrow = arrow.map((point: IPointData) =>
  arrowTransform.apply(point)
)

export class DrifterPath extends Container {
  isBackground: boolean

  linePoints: IPointData[]
  lineGraphic: Graphics
  dottedLineGraphic: Graphics

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
  }

  clear() {
    this.lineGraphic.clear()
    this.dottedLineGraphic.clear()
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
    this.dottedLineGraphic.lineStyle({ ...style, color: "#A6A09B" })

    // const scale = (style.width || 3) / 3
    // this.children.slice(1).forEach((v) => v.scale.set(scale))
  }

  setDottedLineVisibility(visible: boolean) {
    // this.children.slice(1).forEach((v) => (v.renderable = visible))
    this.dottedLineGraphic.visible = visible
  }

  drawVertices() {
    this.linePoints.forEach(({ x, y }, frame) => {
      if (frame === 0) {
        this.lineGraphic.moveTo(x, y)

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
  }
}
