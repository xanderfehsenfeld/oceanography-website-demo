import { describe } from "node:test"

import { render, screen } from "@testing-library/react"
import { expect, test } from "vitest"

import DriftersPugetSound from "../DriftersPugetSound"

describe("DriftersPugetSound", () => {
  render(<DriftersPugetSound>test</DriftersPugetSound>)
  test("renders children", () => {
    expect(screen.getByText("test")).toBeDefined()
  })
})
