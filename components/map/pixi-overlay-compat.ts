/**
 * Compatibility shim — exposes the PixiOverlayComponent props type under a
 * stable name so that map-view.tsx keeps a clean interface without depending
 * on the now-removed pixi-overlay-component.tsx file.
 */
import { IFeature, IPoints } from "@/app/interactive/fetchData"

export interface PixiOverlayComponentProps {
  circles: IFeature[]
  allPoints?: IPoints[]
  showAllLines?: boolean
  onLoadData?: () => void
  frame?: number
  timeDeltaMS?: number
  isPlaying?: boolean
}
