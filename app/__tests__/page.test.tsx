import { describe } from "node:test"

import { render, screen } from "@testing-library/react"
import { expect, test } from "vitest"

import { PageRoutes } from "@/lib/pageroutes"
import Page from "@/app/page"

const existentLinks = PageRoutes.map(({ href }) => href)

describe("DriftersPugetSound", () => {
  render(<Page />)
  test("Only has internal links to pages which exist", () => {
    const internalLinks = screen
      .getAllByRole("link")
      .map((v) => v.getAttribute("href"))
      .filter((href) => href?.startsWith("/"))

    internalLinks.forEach((link) => {
      expect(existentLinks).toContain(link)
    })
  })
})
