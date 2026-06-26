import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"

import { HorizontalLayout } from "@/components/ui/horizontal-layout"
import TimeControls from "@/components/map/time-controls"

import "@radix-ui/themes/styles.css"

import { ThemeProvider } from "@/providers/theme"

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Components/TimeControls",
  component: TimeControls,

  parameters: {},
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],

  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#story-args
  args: {
    maxSliderValue: 100,
    onSliderChange: () => {},
    onPlaybackChange: () => {},

    value: 30,
    playbackSpeed: 2,
  },
} satisfies Meta<typeof TimeControls>

export default meta
type Story = StoryObj<typeof meta>

export const TimeControlsComponent: Story = {
  args: {
    maxSliderValue: 100,
    onSliderChange: () => {},
    onPlaybackChange: () => {},

    value: 30,
    playbackSpeed: 2,
    isLoading: false,
  },
}
