import { Graphics } from "pixi.js"

const defaultLineColor = "green"
const backgroundLineColor = "purple"
export class LineGraphic extends Graphics {
  isBackground: boolean

  constructor(_isBackground?: boolean) {
    super()

    this.isBackground = _isBackground || false
    this.eventMode = "none"
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
      }
    })
  }
}
