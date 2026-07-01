// vitest.setup.ts
import { afterAll, afterEach, beforeAll } from "vitest"

import { server } from "./app/mocks/node.js"

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
