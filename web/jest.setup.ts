import '@testing-library/jest-dom'

// Polyfill Web APIs that Next route handlers rely on (TextEncoder/TextDecoder)
// when running under the jsdom test environment.
import { TextEncoder, TextDecoder } from 'util'

const g = globalThis as unknown as { TextEncoder?: unknown; TextDecoder?: unknown }
if (typeof g.TextEncoder === 'undefined') g.TextEncoder = TextEncoder
if (typeof g.TextDecoder === 'undefined') g.TextDecoder = TextDecoder
