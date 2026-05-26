// decodeURIComponent throws URIError on malformed percent-escapes
// (e.g. "/character/%E0%A4"). In a server component that throw escapes any
// promise .catch() and surfaces as a 500, so decode defensively and let the
// caller treat a failure as "not found".
export function safeDecode(value: string): string | null {
  try {
    return decodeURIComponent(value)
  } catch {
    return null
  }
}
