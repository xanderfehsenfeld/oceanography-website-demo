import {
  Container,
  Graphics,
  graphicsUtils,
  ILineStyleOptions,
  IPointData,
  IRenderer,
  Matrix,
  RenderTexture,
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

    const arrowHead = new Graphics()
    arrowHead.interactive = false
    arrowHead.beginFill(this.lineGraphic.line.color)
    arrowHead.drawPolygon(arrow)
    arrowHead.endFill()
    this.arrowTexture = renderer.generateTexture(arrowHead)

    arrowHead.destroy()
    this.addArrowHeads()
  }

  clear() {
    this.lineGraphic.clear()
  }

  lineStyle(style: ILineStyleOptions) {
    this.lineGraphic.lineStyle(style)

    const scale = (style.width || 3) / 3
    this.children.slice(1).forEach((v) => v.scale.set(scale))
  }

  setArrowHeadVisibility(visible: boolean) {
    this.children.slice(1).forEach((v) => (v.renderable = visible))
  }

  private addArrowHeads() {
    this.linePoints.forEach(({ x, y }, frame) => {
      if (frame % 2 !== 0) {
        const arrow = new Sprite(this.arrowTexture)
        arrow.eventMode = "none"
        const angle = this.arrowAngles[frame - 1]
        arrow.setTransform(x, y, 0.2, 0.2, angle)
        arrow.anchor.set(0.5)
        this.addChild(arrow)
      }
    })
  }

  drawVertices() {
    this.linePoints.forEach(({ x, y }, frame) => {
      if (frame === 0) {
        this.lineGraphic.moveTo(x, y)
      } else {
        this.lineGraphic.lineTo(x, y)
      }
    })
  }
}
