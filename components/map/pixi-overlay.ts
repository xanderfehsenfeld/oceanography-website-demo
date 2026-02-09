import {
  Bounds,
  Browser,
  DomUtil,
  LatLng,
  Layer,
  Map,
  Point,
  Util,
  version,
} from "leaflet"
import { Application, Container, Renderer } from "pixi.js"

// Leaflet.PixiOverlay
// version: 2.0.0
// author: Manuel Baclet <mbaclet@gmail.com>
// license: MIT

export interface Callback {
  getRenderer: () => Renderer
  getMap: () => Map
  getContainer: () => Container
  getScale: (zoom: number) => number
  layerPointToLatLng: (point: Point, zoom?: number) => LatLng
  latLngToLayerPoint: (latLng: LatLng, zoom?: number) => Point
}

interface PixiOverlayOptions {
  padding?: number
  forceCanvas?: boolean
  doubleBuffering?: boolean
  resolution?: number
  projectionZoom?: (map: Map) => number
  destroyInteractionManager?: boolean
  autoPreventDefault?: boolean
  preserveDrawingBuffer?: boolean
  clearBeforeRender?: boolean
  shouldRedrawOnMove?: (event: Event) => boolean
}

const round = Point.prototype._round
const no_round = function () {
  return this
}

function setEventSystem(
  renderer: Renderer,
  destroyInteractionManager: boolean,
  autoPreventDefault: boolean
) {
  const eventSystem = renderer.events
  if (destroyInteractionManager) {
    eventSystem.destroy()
  } else if (!autoPreventDefault) {
    eventSystem.autoPreventDefault = false
  }
}

function projectionZoom(map: Map) {
  const maxZoom = map.getMaxZoom()
  const minZoom = map.getMinZoom()
  if (maxZoom === Infinity) return minZoom + 8

  return (maxZoom + minZoom) / 2
}

const pixiOverlayClass = {
  options: {
    // @option padding: Number = 0.1
    // How much to extend the clip area around the map view (relative to its size)
    // e.g. 0.1 would be 10% of map view in each direction
    padding: 0.1,
    // @option doubleBuffering: Boolean = false
    // Help to prevent flicker when refreshing display on some devices (e.g. iOS devices)
    doubleBuffering: false,
    // @option resolution: Number = 1
    // Resolution of the renderer canvas
    resolution: Browser.retina ? 2 : 1,
    // @option projectionZoom(map: map): Number
    // return the layer projection zoom level
    projectionZoom: projectionZoom,
    // @option destroyInteractionManager:  Boolean = false
    // Destroy PIXI EventSystem
    destroyInteractionManager: false,
    // @option
    // Customize PIXI EventSystem autoPreventDefault property
    // This option is ignored if destroyInteractionManager is set
    autoPreventDefault: false,
    // @option preserveDrawingBuffer: Boolean = false
    // Enables drawing buffer preservation
    preserveDrawingBuffer: false,
    // @option clearBeforeRender: Boolean = true
    // Clear the canvas before the new render pass
    clearBeforeRender: true,
    // @option shouldRedrawOnMove(e: moveEvent): Boolean
    // filter move events that should trigger a layer redraw
    shouldRedrawOnMove: function () {
      return false
    },
  },

  initialize: function (
    drawCallback,
    pixiContainer,
    renderer,
    auxRenderer,
    options: PixiOverlayOptions
  ) {
    Util.setOptions(this, options)
    Util.stamp(this)
    this._drawCallback = drawCallback
    this._pixiContainer = pixiContainer
    this._renderer = renderer
    this._auxRenderer = auxRenderer
    this._doubleBuffering = !!auxRenderer && this.options.doubleBuffering
  },

  _setMap: function () {},

  _setContainerStyle: function () {},

  _addContainer: function () {
    this.getPane().appendChild(this._container)
  },

  _setEvents: function () {},

  onAdd: function (targetMap) {
    this._setMap(targetMap)
    if (!this._container) {
      const container = (this._container = DomUtil.create(
        "div",
        "leaflet-pixi-overlay"
      ))
      container.style.position = "absolute"

      setEventSystem(
        this._renderer,
        this.options.destroyInteractionManager,
        this.options.autoPreventDefault
      )
      container.appendChild(this._renderer.canvas)

      if (this._zoomAnimated) {
        container.classList.add("leaflet-zoom-animated")
        this._setContainerStyle()
      }

      if (this._doubleBuffering && this._auxRenderer) {
        setEventSystem(
          this._auxRenderer,
          this.options.destroyInteractionManager,
          this.options.autoPreventDefault
        )
        container.appendChild(this._auxRenderer.canvas)
        this._renderer.canvas.style.position = "absolute"
        this._auxRenderer.canvas.style.position = "absolute"
      }
    }
    this._addContainer()
    this._setEvents()

    const map = this._map
    this._initialZoom = this.options.projectionZoom(map)
    this._wgsOrigin = new LatLng(0, 0)
    this._wgsInitialShift = map.project(this._wgsOrigin, this._initialZoom)
    this._mapInitialZoom = map.getZoom()
    const _layer = this

    this.utils = {
      latLngToLayerPoint: function (latLng, zoom) {
        zoom = zoom === undefined ? _layer._initialZoom : zoom

        console.log("zoomnn used", zoom)
        const projectedPoint = map.project(latLng, zoom)

        return projectedPoint
      },
      layerPointToLatLng: function (point, zoom) {
        zoom = zoom === undefined ? _layer._initialZoom : zoom
        const projectedPoint = point(point)
        return map.unproject(projectedPoint, zoom)
      },
      getScale: function (zoom) {
        if (zoom === undefined)
          return map.getZoomScale(map.getZoom(), _layer._initialZoom)
        else return map.getZoomScale(zoom, _layer._initialZoom)
      },
      getRenderer: function () {
        return _layer._renderer
      },
      getContainer: function () {
        return _layer._pixiContainer
      },
      getMap: function () {
        return _layer._map
      },
    }
    this._update({ type: "add" })
  },

  onRemove: function () {
    DomUtil.remove(this._container)
  },

  _onAnimZoom: function (e) {
    // Store animation state
    this._animatingZoom = true
    this._animationCenter = e.center
    this._animationZoom = e.zoom

    this._updateTransform(e.center, e.zoom)
  },

  _onZoom: function () {
    // Clear animation state
    this._animatingZoom = false
    this._updateTransform(this._map.getCenter(), this._zoom)
  },

  getEvents: function () {
    const events = {
      zoom: this._onZoom,
      move: this._onMove,
      moveend: this._onMoveEnd,
      zoomstart: this._onZoomStart,
      zoomend: this._onZoomEnd,
    }
    if (this._zoomAnimated) {
      events.zoomanim = this._onAnimZoom
    }
    return events
  },

  _onZoomStart: function () {
    this._zooming = true
  },

  _onZoomEnd: function () {
    this._zooming = false
    this._animatingZoom = false
    this._update({ type: "zoomend" })
  },

  _onMoveEnd: function (e) {
    if (!this._zooming) {
      this._update(e)
    }
  },

  _onMove: function (e) {
    if (this.options.shouldRedrawOnMove(e)) {
      this._update(e)
    }
  },

  _updateTransform: function (center, zoom) {
    var scale = this._map.getZoomScale(zoom, this._zoom),
      viewHalf = this._map.getSize().multiplyBy(0.5 + this.options.padding),
      currentCenterPoint = this._map.project(this._center, zoom),
      topLeftOffset = viewHalf
        .multiplyBy(-scale)
        .add(currentCenterPoint)
        .subtract(this._map._getNewPixelOrigin(center, zoom))

    if (Browser.any3d || version >= "2") {
      DomUtil.setTransform(this._container, topLeftOffset, scale)
    } else {
      DomUtil.setPosition(this._container, topLeftOffset)
    }
  },

  _redraw: function (offset, e) {
    this._disableLeafletRounding()
    const scale = this._map.getZoomScale(this._zoom, this._initialZoom)
    const shift = this._map
      .latLngToLayerPoint(this._wgsOrigin)
      ._subtract(this._wgsInitialShift.multiplyBy(scale))
      ._subtract(offset)

    this._pixiContainer.scale.set(scale)
    this._pixiContainer.position.set(shift.x, shift.y)
    this._drawCallback(this.utils, e)
    this._enableLeafletRounding()
  },

  _update: function (e) {
    // is this really useful?
    if (this._map._animatingZoom && this._bounds) {
      return
    }

    // Update pixel bounds of renderer container
    const p = this.options.padding
    const mapSize = this._map.getSize()
    const min = this._map
      .containerPointToLayerPoint(mapSize.multiplyBy(-p))
      .round()

    this._bounds = new Bounds(
      min,
      min.add(mapSize.multiplyBy(1 + p * 2)).round()
    )
    // Store previous values for comparison
    const prevCenter = this._center
    const prevZoom = this._zoom

    this._center = this._map.getCenter()
    this._zoom = this._map.getZoom()

    // Only proceed with expensive operations if something actually changed
    if (prevCenter && prevZoom !== undefined) {
      const centerChanged = !prevCenter.equals(this._center)
      const zoomChanged = prevZoom !== this._zoom

      if (!centerChanged && !zoomChanged && e.type !== "add") {
        return
      }
    }

    if (this._doubleBuffering && this._auxRenderer) {
      const currentRenderer = this._renderer
      this._renderer = this._auxRenderer
      this._auxRenderer = currentRenderer
    }

    const canvas = this._renderer.canvas
    const b = this._bounds
    const container = this._container
    const size = b.getSize()

    if (
      !this._renderer.size ||
      this._renderer.size.x !== size.x ||
      this._renderer.size.y !== size.y
    ) {
      this._renderer.resize(size.x, size.y)
      canvas.style.width = size.x + "px"
      canvas.style.height = size.y + "px"
      this._renderer.size = size
    }

    if (this._doubleBuffering && this._auxRenderer) {
      const self = this
      requestAnimationFrame(function () {
        self._redraw(b.min, e)
        if (self._renderer.gl) {
          self._renderer.gl.finish()
        }
        canvas.style.visibility = "visible"
        self._auxRenderer.canvas.style.visibility = "hidden"
        DomUtil.setPosition(container, b.min)
      })
    } else {
      this._redraw(b.min, e)
      DomUtil.setPosition(container, b.min)
    }
  },

  _disableLeafletRounding: function () {
    Point.prototype._round = no_round
  },

  _enableLeafletRounding: function () {
    Point.prototype._round = round
  },

  redraw: function (data) {
    if (this._map) {
      this._disableLeafletRounding()
      this._drawCallback(this.utils, data)
      this._enableLeafletRounding()
    }
    return this
  },

  _destroy: function () {
    this._renderer.destroy()
    if (this._auxRenderer) {
      this._auxRenderer.destroy()
    }
  },

  destroy: function () {
    this.remove()
    this._destroy()
  },
}

// Extend based on Leaflet version
let PixiOverlay = Layer.extend(pixiOverlayClass)

// Factory function
export function pixiOverlay(
  drawCallback: (result: Callback) => void,
  pixiContainer,
  renderer,
  auxRenderer = null,
  options = {}
) {
  return new PixiOverlay(
    drawCallback,
    pixiContainer,
    renderer,
    auxRenderer,
    options
  ) as typeof pixiOverlayClass & Layer
}
