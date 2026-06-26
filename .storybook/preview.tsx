import { Inter } from "next/font/google"
import type { Preview } from "@storybook/nextjs-vite"

import { ThemeProvider } from "../providers/theme"

import "@/styles/globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

//  <body className={`${inter.variable} font-regular`}>
//     <Providers></Providers></body>

const preview: Preview = {
  decorators: [
    (Story: any) => (
      <div className={`${inter.variable} font-regular`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Story />
        </ThemeProvider>
      </div>
    ),
  ],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
}

export default preview
