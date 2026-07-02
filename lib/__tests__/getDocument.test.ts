import { describe } from "node:test"

import { act, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, expect, test, vi } from "vitest"

import { PageRoutes } from "@/lib/pageroutes"
import { generateStaticParams } from "@/app/docs/[[...slug]]/page"

import { getDocument } from "../markdown"

const existentLinks = PageRoutes.map(({ href }) => href)

const staticParams = generateStaticParams()

const mockFetch = vi.fn()
global.fetch = mockFetch

vi.mock(import("@/components/video"), () => ({
  Video: vi.fn().mockReturnValue(null),
}))

describe("markdown documents", async () => {
  beforeEach(() => {
    // Clear mocks between tests to prevent state leakage
    mockFetch.mockClear()
  })
  // Configure mock to return a resolved Response object
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  })

  const promises = staticParams.map(async (param) => {
    const pathName = param.slug.join("/")
    test(`Document ${pathName}`, async () => {
      const res = await getDocument(
        `/docs/${pathName}`.replace("/docs/docs", "/docs")
      )

      //render the doc
      await act(() => render(res?.content))

      const internalLinksOnPage = screen
        .queryAllByRole("link")

        .map((v) => v.getAttribute("href"))
        .filter((href) => href?.startsWith("/") && href.length > 1)

      internalLinksOnPage.forEach((link) => {
        expect(
          existentLinks,
          `${param.slug.join("/")} contains invalid link to ${link}`
        ).toContain(link)
      })
    })
  })
  await Promise.all(promises)
})
