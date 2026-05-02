import {
  SegmentedControl,
  Skeleton,
  Slider,
} from "@radix-ui/themes/dist/cjs/components"
import { FaFastForward, FaPause, FaPlay } from "react-icons/fa"

import "./time-controls.css"

const TimeControls = ({
  onPlaybackChange,
  playbackSpeed,
  onSliderChange,
  value,

  maxSliderValue,
  isLoading,
}: {
  onPlaybackChange: (playbackSpeed: number) => void
  playbackSpeed: number
  onSliderChange: (value: number) => void
  value: number
  maxSliderValue: number
  isLoading: boolean
}) => {
  return (
    <div
      className="flex w-full flex-col-reverse gap-4 lg:flex-row lg:items-center"
      onPointerMove={(e) => {
        e.stopPropagation()
      }}
    >
      <Skeleton loading={isLoading}>
        <SegmentedControl.Root
          className="cursor-pointer"
          defaultValue="1"
          value={playbackSpeed.toString()}
          size={"3"}
        >
          <SegmentedControl.Item
            className="h-9 w-9 cursor-pointer"
            onClick={() => onPlaybackChange(0)}
            value="0"
          >
            <FaPause />{" "}
          </SegmentedControl.Item>
          <SegmentedControl.Item
            className="h-9 w-9 cursor-pointer"
            onClick={() => {
              onPlaybackChange(1)
            }}
            value="1"
          >
            <FaPlay />
          </SegmentedControl.Item>
          <SegmentedControl.Item
            className="h-9 w-9 cursor-pointer"
            value="2"
            onClick={() => {
              onPlaybackChange(2)
            }}
          >
            <FaFastForward />
          </SegmentedControl.Item>
        </SegmentedControl.Root>
      </Skeleton>
      <Skeleton loading={isLoading}>
        <Slider
          size={"3"}
          className="cursor-grab"
          onValueChange={(v) => {
            const value = v[0]
            onSliderChange(value)
          }}
          value={[value]}
          min={0}
          max={maxSliderValue}
          id="myRange"
        />
      </Skeleton>
    </div>
  )
}

export default TimeControls
