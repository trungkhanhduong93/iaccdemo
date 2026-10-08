// Nét mảnh cho biểu tượng thao tác, khối đặc cho phân hệ và đồ vật theo iFaster (QD23)

import { DAC } from './icon-dac'

const P: Record<string, string> = {
  chevd: '<path d="M7 10l5 5 5-5"/>',
  chevr: '<path d="M10 7l5 5-5 5"/>',
  chevl: '<path d="M14 7l-5 5 5 5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M7 7l10 10M17 7L7 17"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M9 15l-5-5 5-5"/><path d="M4 10h10a6 6 0 0 1 0 12h-3"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4"/>',
  filter: '<path d="M4 5h16l-6 7.5V19l-4 1.5v-8z"/>',
  download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19h14"/>',
  upload: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 19h14"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  swap: '<path d="M4 8h14l-4-4M20 16H6l4 4"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  chinh: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
}
export type IconName = keyof typeof P | keyof typeof DAC

export function Icon({ n, className = 'ic', title }: { n: string; className?: string; title?: string }) {
  const dac = DAC[n]
  if (dac) {
    return (
      <svg className={`${className} dac`} viewBox={dac.vb} aria-hidden={title ? undefined : true}
        dangerouslySetInnerHTML={{ __html: (title ? `<title>${title}</title>` : '') + dac.body }} />
    )
  }
  const body = P[n]
  if (body) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden={title ? undefined : true}
        dangerouslySetInnerHTML={{ __html: (title ? `<title>${title}</title>` : '') + body }} />
    )
  }
  const def = DAC.doc
  return (
    <svg className={`${className} dac`} viewBox={def.vb} aria-hidden={title ? undefined : true}
      dangerouslySetInnerHTML={{ __html: (title ? `<title>${title}</title>` : '') + def.body }} />
  )
}
