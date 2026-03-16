import {
  Container,
  Graphics,
  ILineStyleOptions,
  IPointData,
  Matrix,
  Sprite,
} from "pixi.js"

const defaultLineColor = "green"
const backgroundLineColor = "purple"

const arrow = [
  { x: -10, y: -10 },
  { x: 12, y: 0 },
  { x: -10, y: 10 },
  { x: -6, y: 0 },
]

const getArrowHead = (
  translateX: number,
  translateY: number,
  angle: number
) => {
  const transform = new Matrix()
  transform.scale(0.1, 0.1)
  transform.rotate(angle)
  transform.translate(translateX, translateY)
  return arrow.map((v) => transform.apply(v))
}

export class DrifterPath extends Container {
  isBackground: boolean

  linePoints: IPointData[]
  arrowAngles: number[]
  lineGraphic: Graphics

  constructor(_linePoints: IPointData[], _isBackground?: boolean) {
    super()
    this.isBackground = _isBackground || false
    this.eventMode = "none"

    this.linePoints = _linePoints
    this.lineGraphic = new Graphics()

    this.lineGraphic.lineStyle({
      width: 3,
      color: this.isBackground ? backgroundLineColor : defaultLineColor,
      alpha: this.isBackground ? 0.3 : 1,
    })

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
  }

  clear() {
    this.lineGraphic.clear()
  }

  lineStyle(style: ILineStyleOptions) {
    this.lineGraphic.lineStyle(style)
  }

  drawVertices() {
    this.linePoints.forEach(({ x, y }, frame) => {
      if (frame === 0) {
        this.lineGraphic.moveTo(x, y)
      } else {
        this.lineGraphic.lineTo(x, y)

        const arrow = getArrowHead(x, y, this.arrowAngles[frame - 1])

        this.lineGraphic.drawPolygon(arrow)
      }
    })
  }
}
