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
const backgroundLineColorLight = "purple"

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

const chevronSize = 1 // half-width of the chevron "wings"
const chevronGap = 1 // gap (in px along the path) between chevrons

export class DrifterPath extends Container {
  isBackground: boolean

  linePoints: IPointData[]
  arrowAngles: number[]
  lineGraphic: Graphics
  arrowTexture: RenderTexture

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

    this.visible = this.isBackground

    this.addChild(this.lineGraphic)

    this.arrowAngles = this.linePoints.map((_, index): number => {
      const currentIndex = Math.min(index, this.linePoints.length - 2)
      const { x, y } = this.linePoints[currentIndex]
      const nextLocation = this.linePoints[currentIndex + 1]

      const dx = nextLocation.x - x
      const dy = nextLocation.y - y

      return Math.atan2(dy, dx)
    })

    const arrowHead = new Graphics()
    arrowHead.interactive = false
    arrowHead.beginFill(this.lineGraphic.line.color)
    arrowHead.drawPolygon(transformedArrow)
    arrowHead.endFill()
    this.arrowTexture = renderer.generateTexture(arrowHead)

    arrowHead.destroy()

    if (!this.isBackground) this.addArrowHeads()
  }

  clear() {
    this.lineGraphic.clear()
  }

  setIsDark(isDark: boolean): void {
    if (this.isBackground) {
      this.lineGraphic.tint = isDark
        ? backgroundLineColor
        : backgroundLineColorLight
    } else {
      this.lineGraphic.tint = isDark ? "lime" : "darkgreen"
    }
  }

  lineStyle(style: Pick<ILineStyleOptions, "alpha" | "width">) {
    this.lineGraphic.lineStyle({ ...style, color: "white" })

    const scale = (style.width || 3) / 3
    this.children.slice(1).forEach((v) => v.scale.set(scale))
  }

  setArrowHeadVisibility(visible: boolean) {
    this.children.slice(1).forEach((v) => (v.renderable = visible))
  }

  private addArrowHeads() {
    this.linePoints.forEach(({ x, y }, frame) => {
      if (frame % 5 === 0) {
        const arrow = new Sprite(this.arrowTexture)
        arrow.eventMode = "none"
        const angle = this.arrowAngles[frame - 1]
        arrow.setTransform(x, y, 0.05, 0.05, angle)
        arrow.anchor.set(0.5)

        this.addChild(arrow)
      }
    })
  }

  private drawChevron(x: number, y: number, angle: number) {
    const size = this.lineGraphic.line.width
      ? chevronSize * (this.lineGraphic.line.width / 3)
      : chevronSize

    const tipX = x + Math.cos(angle) * size
    const tipY = y + Math.sin(angle) * size

    const wingAngleOffset = (35 * Math.PI) / 180
    const backAngle = angle + Math.PI

    const wing1X = x + Math.cos(backAngle - wingAngleOffset) * size
    const wing1Y = y + Math.sin(backAngle - wingAngleOffset) * size
    const wing2X = x + Math.cos(backAngle + wingAngleOffset) * size
    const wing2Y = y + Math.sin(backAngle + wingAngleOffset) * size

    this.lineGraphic.moveTo(wing1X, wing1Y)
    this.lineGraphic.lineTo(tipX, tipY)
    this.lineGraphic.moveTo(wing2X, wing2Y)
    this.lineGraphic.lineTo(tipX, tipY)
  }

  drawVertices() {
    if (this.linePoints.length < 2) {
      if (this.linePoints.length === 1) {
        const { x, y } = this.linePoints[0]
        this.lineGraphic.moveTo(x, y)
        this.lineGraphic.drawCircle(x, y, this.lineGraphic.line.width * 2)
      }
      return
    }

    const { x: startX, y: startY } = this.linePoints[0]
    this.lineGraphic.moveTo(startX, startY)
    this.lineGraphic.drawCircle(startX, startY, this.lineGraphic.line.width * 2)

    let distanceUntilNextChevron = 0

    for (let i = 0; i < this.linePoints.length - 1; i++) {
      const a = this.linePoints[i]
      const b = this.linePoints[i + 1]

      const dx = b.x - a.x
      const dy = b.y - a.y
      const segmentLength = Math.hypot(dx, dy)
      if (segmentLength === 0) continue

      const angle = Math.atan2(dy, dx)
      let traveled = 0

      while (distanceUntilNextChevron <= segmentLength - traveled) {
        traveled += distanceUntilNextChevron
        const t = traveled / segmentLength
        const x = a.x + dx * t
        const y = a.y + dy * t

        this.drawChevron(x, y, angle)
        distanceUntilNextChevron = chevronGap
      }

      distanceUntilNextChevron -= segmentLength - traveled
    }
  }
}
