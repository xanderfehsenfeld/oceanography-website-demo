import { DashLine } from "pixi-dashed-line"
import {
  Container,
  Graphics,
  ILineStyleOptions,
  IPointData,
  IRenderer,
  LINE_JOIN,
} from "pixi.js"

const defaultLineColor = "chartreuse"
const backgroundLineColor = "magenta"

// Dash pattern: [dash px, gap px]
export const DASH_PATTERN = [4, 3]
// Total cycle length for wrapping the animation offset
const DASH_CYCLE = DASH_PATTERN[0] + DASH_PATTERN[1]

export class DrifterPath extends Container {
  isBackground: boolean

  linePoints: IPointData[]
  lineGraphic: Graphics
  dottedLineGraphic: Graphics

  // Current dash animation offset (advances each ticker frame when visible)
  dashOffset: number = 0

  // Whether the dotted overlay is zoom-enabled
  private _dottedVisible: boolean = false
  // Whether animation is currently active (paused + zoomed in)
  private _isAnimating: boolean = false

  // Cached line style so drawDottedVertices can reconstruct DashLine correctly
  private _lineWidth: number = 3
  private _lineAlpha: number = 1

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
    // dottedLineGraphic deliberately has no tint — DashLine draws geometry in
    // white (0xffffff) and tinting it the same color as lineGraphic would make
    // the dashes invisible against the solid background line. White dashes are
    // visible over any tint color.
    this.dottedLineGraphic.visible = false

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
    } else {
      this.lineGraphic.tint = isDark ? "lime" : "darkgreen"
    }
  }

  lineStyle(style: Pick<ILineStyleOptions, "alpha" | "width">) {
    this._lineWidth = style.width ?? 3
    this._lineAlpha = style.alpha ?? 1
    this.lineGraphic.lineStyle({ ...style, color: "white" })
  }

  /**
   * Called by the overlay when zoom or play state changes.
   * Controls whether the animated dashed overlay is active.
   */
  setAnimating(animating: boolean) {
    this._isAnimating = animating
    this._syncLayers()
  }

  /**
   * Called by the overlay when the zoom threshold is crossed.
   */
  setDottedLineVisibility(visible: boolean) {
    this._dottedVisible = visible
    this._syncLayers()
    if (this._isAnimating && visible) this.drawDottedVertices()
  }

  /**
   * Called when the drifter is hovered (semi-transparent).
   */
  setHovered() {
    this._syncLayers()
    if (this._isAnimating && this._dottedVisible) this.drawDottedVertices()
  }

  /**
   * Called when the drifter is selected (opaque).
   */
  setSelectedStyle() {
    this._syncLayers()
    if (this._isAnimating && this._dottedVisible) this.drawDottedVertices()
  }

  /**
   * Restores both layers to resting defaults.
   */
  resetStyle() {
    this._syncLayers()
  }

  /**
   * Reconciles layer visibility from the three independent flags.
   *
   * The solid lineGraphic always stays visible — it acts as the background
   * that fills the gaps in the animated dashes.
   * dottedLineGraphic is shown only when zoom-enabled AND animating.
   */
  private _syncLayers() {
    const showDots = this._dottedVisible && this._isAnimating
    this.lineGraphic.visible = true
    this.dottedLineGraphic.visible = showDots
  }

  drawVertices() {
    if (this.linePoints.length === 0) return

    const { x: x0, y: y0 } = this.linePoints[0]
    this.lineGraphic.moveTo(x0, y0)
    this.lineGraphic.drawCircle(x0, y0, this._lineWidth * 2)
    // Reset cursor after drawCircle so the line continues from the start point
    this.lineGraphic.moveTo(x0, y0)

    for (let i = 1; i < this.linePoints.length; i++) {
      const { x, y } = this.linePoints[i]
      this.lineGraphic.lineTo(x, y)
    }
  }

  /**
   * Redraws the animated dashed overlay at the current dashOffset.
   *
   * Pre-positioning the Graphics cursor before constructing DashLine prevents
   * a stray diagonal segment from origin → first point.
   */
  drawDottedVertices() {
    this.dottedLineGraphic.clear()

    if (this.linePoints.length < 2) return

    const { x: x0, y: y0 } = this.linePoints[0]

    // Pre-position Pixi's cursor before DashLine construction
    this.dottedLineGraphic.moveTo(x0, y0)

    const dash = new DashLine(this.dottedLineGraphic, {
      dash: DASH_PATTERN,
      width: this._lineWidth,
      color: 0xffffff, // no tint on dottedLineGraphic — white stays white
      alpha: this._lineAlpha,
      join: LINE_JOIN.ROUND,
    })

    // moveTo resets lineLength → seed the phase offset after it
    dash.moveTo(x0, y0)
    dash.lineLength = -this.dashOffset

    for (let i = 1; i < this.linePoints.length; i++) {
      const { x, y } = this.linePoints[i]
      dash.lineTo(x, y)
    }
  }
}
