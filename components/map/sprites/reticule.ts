"use client"

import { Container, Graphics, IRenderer, Sprite, Text, TextStyle } from "pixi.js"

// ─── colours ─────────────────────────────────────────────────────────────────
const lightTint = "lightgray"
const darkTint = "darkgray"

// The base radius of the reticule circle (same value used in the old Reticule
// and in pixi-overlay-component to compute the selection hit area).
export const RETICULE_BASE_RADIUS = 500

// Crosshair lines extend this far beyond the circle in each direction (in the
// same unscaled pixel space as the circle).
const CROSSHAIR_EXTEND = RETICULE_BASE_RADIUS * 1.05

// How far "above" the line the label sits (negative y = up in PIXI).
const LABEL_OFFSET = -10

// Font size for the lat/lng labels and the distance scale (matched to MapScale).
const LABEL_FONT_SIZE = 50

// ─── helpers ─────────────────────────────────────────────────────────────────
function makeTextStyle(color: string): TextStyle {
  return new TextStyle({
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: LABEL_FONT_SIZE,
    fill: color,
    fontWeight: "normal",
  })
}

/**
 * Format a latitude or longitude value to a readable string.
 *  - Latitude:  "47.6° N" / "47.6° S"
 *  - Longitude: "122.3° W" / "122.3° E"
 */
function fmtLat(v: number): string {
  const abs = Math.abs(v).toFixed(2)
  return `${abs}° ${v >= 0 ? "N" : "S"}`
}

function fmtLng(v: number): string {
  const abs = Math.abs(v).toFixed(2)
  return `${abs}° ${v >= 0 ? "E" : "W"}`
}

/**
 * Format a distance value.
 * Under 0.1 mi → show feet; otherwise show miles to 1 decimal place.
 */
function fmtDistance(miles: number): string {
  if (miles < 0.1) return `${Math.round(miles * 5280)} ft radius`
  return `${miles.toFixed(1)} mi radius`
}

// ─── Reticule ─────────────────────────────────────────────────────────────────
/**
 * A PIXI Container that renders:
 *   1. A semi-transparent selection circle.
 *   2. Thin crosshair lines (horizontal + vertical) extending beyond the circle.
 *   3. Lat/lng tick labels along the crosshair lines.
 *   4. A distance-scale label showing the radius in real-world units.
 *
 * All children are in unscaled PIXI pixel space (zoom-11 projection). The
 * parent `pixi-overlay-component` scales the whole container via
 * `scale.set(reticuleScale)` to match the map zoom, so the crosshair lines
 * and labels scale consistently with the circle.
 */
export class Reticule extends Container {
  private _isDark: boolean = false

  // ── circle sprite ──
  private circleSprite: Sprite

  // ── crosshair graphics ──
  private crosshair: Graphics

  // ── lat/lng labels ──
  // Horizontal arm → latitude labels (one per arm side, placed above the line)
  private latLabelLeft: Text
  // private latLabelRight: Text
  // Vertical arm → longitude labels (rotated –90° so text reads bottom-to-top)
  // private lngLabelTop: Text
  private lngLabelBottom: Text

  // ── distance scale label ──
  private distanceLabel: Text

  constructor(renderer: IRenderer) {
    super()

    // ── 1. Circle sprite (same shape as the original Reticule) ──────────────
    const circleGraphic = new Graphics()
    circleGraphic.beginFill(0xffffff)
    circleGraphic.lineStyle({ color: "purple", width: 3 })
    circleGraphic.drawCircle(0, 0, RETICULE_BASE_RADIUS)
    circleGraphic.endFill()

    this.circleSprite = new Sprite(renderer.generateTexture(circleGraphic))
    this.circleSprite.anchor.set(0.5)
    this.circleSprite.tint = lightTint
    this.circleSprite.alpha = 0.5
    this.circleSprite.eventMode = "passive"
    this.addChild(this.circleSprite)

    // ── 2. Crosshair lines ────────────────────────────────────────────────────
    // Draw inline here rather than calling _drawCrosshair() — TypeScript with
    // "target: esnext" uses defineProperty semantics, meaning all class fields
    // are set to undefined before the constructor body runs. Calling a method
    // that reads this.crosshair before the assignment below would crash.
    this.crosshair = new Graphics()
    this.crosshair.lineStyle({ width: 3, color: 0x666666, alpha: 0.8 })
    this.crosshair.moveTo(-CROSSHAIR_EXTEND, 0)
    this.crosshair.lineTo(CROSSHAIR_EXTEND, 0)
    this.crosshair.moveTo(0, -CROSSHAIR_EXTEND)
    this.crosshair.lineTo(0, CROSSHAIR_EXTEND)
    this.addChild(this.crosshair)

    // ── 3. Lat / Lng labels ──────────────────────────────────────────────────
    const style = makeTextStyle("#888888")

    // Latitude label: horizontal text, on the left arm, sitting above the line.
    // rotation = 0 (default) → text reads left-to-right.
    // anchor (0.5, 1) → horizontally centred on its x position, baseline touching y.
    // y = LABEL_OFFSET (negative) lifts the baseline above the horizontal arm.
    this.latLabelLeft = new Text("", style)
    this.latLabelLeft.anchor.set(0.5, 1)
    this.latLabelLeft.rotation = 0
    this.latLabelLeft.position.set(-CROSSHAIR_EXTEND * 0.7, LABEL_OFFSET)

    // Longitude label: vertical text, on the bottom arm, sitting to the left of
    // the line (which is "above" it given the rotation).
    // rotation = -π/2 → text reads bottom-to-top.
    // After rotation, the text's local +y axis points left in world space, so
    // anchor (0.5, 1) centres the text along the arm and puts its baseline to
    // the left of the vertical line.
    // x = LABEL_OFFSET (negative) nudges it further left of the vertical arm.
    this.lngLabelBottom = new Text("", style)
    this.lngLabelBottom.anchor.set(0.5, 1)
    this.lngLabelBottom.rotation = -Math.PI / 2
    this.lngLabelBottom.position.set(LABEL_OFFSET, CROSSHAIR_EXTEND * 0.7)

    this.addChild(this.latLabelLeft)
    this.addChild(this.lngLabelBottom)

    // ── 4. Distance scale label ──────────────────────────────────────────────
    this.distanceLabel = new Text("", style)
    // Sits just outside the circle on the right side, centred vertically
    this.distanceLabel.anchor.set(0, 0.5)
    this.distanceLabel.position.set(RETICULE_BASE_RADIUS + 20, 0)
    this.addChild(this.distanceLabel)

    // ── initial state ─────────────────────────────────────────────────────────
    this.visible = false
    this.eventMode = "passive"
  }

  // ── private helpers ────────────────────────────────────────────────────────

  private _drawCrosshair() {
    this.crosshair?.clear()
    const color = this._isDark ? 0xaaaaaa : 0x666666
    this.crosshair.lineStyle({ width: 1, color, alpha: 0.8 })
    // Horizontal line
    this.crosshair.moveTo(-CROSSHAIR_EXTEND, 0)
    this.crosshair.lineTo(CROSSHAIR_EXTEND, 0)
    // Vertical line
    this.crosshair.moveTo(0, -CROSSHAIR_EXTEND)
    this.crosshair.lineTo(0, CROSSHAIR_EXTEND)
  }

  private _updateTextColor() {
    const color = this._isDark ? "#cccccc" : "#555555"
    const style = makeTextStyle(color)
    for (const label of [this.latLabelLeft, this.lngLabelBottom, this.distanceLabel]) {
      label.style = style
    }
  }

  // ── public API ─────────────────────────────────────────────────────────────

  hide() {
    this.visible = false
  }

  show() {
    this.visible = true
  }

  setTranslate(x: number, y: number) {
    this.setTransform(x, y, this.scale.x, this.scale.y)
  }

  setIsDark(isDark: boolean) {
    this._isDark = isDark
    this.circleSprite.tint = isDark ? darkTint : lightTint
    this._drawCrosshair()
    this._updateTextColor()
  }

  /**
   * Update the lat/lng labels.
   * Called by `pixi-overlay-component` whenever the reticule moves.
   *
   * @param lat  Geographic latitude of the reticule centre
   * @param lng  Geographic longitude of the reticule centre
   */
  setLatLng(lat: number, lng: number) {
    this.latLabelLeft.text = fmtLat(lat)
    this.lngLabelBottom.text = fmtLng(lng)
  }

  /**
   * Update the distance scale label.
   * @param miles  Radius of the reticule in real-world miles
   */
  setRadiusInMiles(miles: number) {
    this.distanceLabel.text = fmtDistance(miles)
  }
}
