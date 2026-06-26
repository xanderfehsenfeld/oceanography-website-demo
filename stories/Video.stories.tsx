import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"

import { HorizontalLayout } from "@/components/ui/horizontal-layout"
import { Video } from "@/components/video"

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Components/Video",
  component: Video,

  parameters: {
    width: 100,
    height: 200,
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],

  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#story-args
  args: { width: 100, height: 200 },

  decorators: [
    (Story) => (
      <HorizontalLayout>
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
        <div>test</div>
      </HorizontalLayout>
    ),
  ],
} satisfies Meta<typeof Video>

export default meta
type Story = StoryObj<typeof meta>

export const VideoPlayerComponent: Story = {
  args: {
    width: 700,
    height: 400,
    src: "/videos/global_M2_movie.mp4",
  },
}

export const Portrait: Story = {
  args: {
    width: 200,
    height: 700,
    src: "/videos/P1_PS_temp_top.mp4",
  },
}
