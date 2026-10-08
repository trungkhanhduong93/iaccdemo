// Hệ số zoom CSS trên phần tử gốc html (T42)
export function heSoZoom(): number {
  if (typeof document === 'undefined') return 1
  const doc = document.documentElement as HTMLElement & { currentCSSZoom?: number }
  if (typeof doc.currentCSSZoom === 'number') {
    return doc.currentCSSZoom || 1
  }
  return parseFloat(getComputedStyle(doc).zoom) || 1
}
