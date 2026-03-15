import { Graphics, Matrix } from "pixi.js"

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

export class LineGraphic extends Graphics {
  isBackground: boolean

  arrowAngles: number[]

  constructor(_vertices: [number, number][], _isBackground?: boolean) {
    super()
    this.isBackground = _isBackground || false
    this.eventMode = "none"

    this.arrowAngles = _vertices.map((_, index): number => {
      const currentIndex = Math.min(index, _vertices.length - 2)
      const [x, y] = _vertices[currentIndex]
      const nextLocation = _vertices[currentIndex + 1]

      const dx = nextLocation[0] - x
      const dy = nextLocation[1] - y

      return Math.atan2(dy, dx)
    })

    this.lineStyle({
      width: 3,
      color: this.isBackground ? backgroundLineColor : defaultLineColor,
      alpha: this.isBackground ? 0.3 : 1,
    })

    this.visible = this.isBackground
  }

  setVertices(vertices: [number, number][]) {
    vertices.forEach(([x, y], frame) => {
      if (frame === 0) {
        this.moveTo(x, y)
      } else {
        this.lineTo(x, y)

        const arrow = getArrowHead(x, y, this.arrowAngles[frame])
        this.drawPolygon(arrow)
      }
    })
  }
}
