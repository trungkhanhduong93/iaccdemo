// Biểu tượng Solar nâng cao: nét 2 màu thương hiệu iPOS cho phân hệ và đồ vật, nét đơn cho thao tác (T301, T302, T340)

import { DAC, NET, NHOM, THAO_TAC } from './icon-dac'

const THAO_TAC_SET = new Set<string>(THAO_TAC)

const P: Record<string, string> = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M7 7l10 10M17 7L7 17"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  // Nét gọn cho nút In, menu Xuất báo cáo: printer của Solar nhiều nét, nhìn rối ở 16px (T348)
  'in-gon': '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  'tep-bang': '<path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3v5h5"/><path d="M8.5 12.5h7v5h-7zM12 12.5v5M8.5 15h7"/>',
  'tep-chu': '<path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3v5h5"/><path d="M8.5 13h7M8.5 16.5h4.5"/>',
  'tep-ma': '<path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3v5h5"/><path d="M10 12.5L7.8 15l2.2 2.5M14 12.5l2.2 2.5-2.2 2.5"/>',
}

export type IconName = keyof typeof P | keyof typeof NET | keyof typeof DAC

export interface IconProps {
  n: string
  className?: string
  title?: string
  kieu?: 'khoi' | 'net' | 'hai'
}

// Đổi thành 'net' để quay về bộ Solar nét T301
export const BO_ICON: 'khoi' | 'net' = 'khoi'
if (typeof document !== 'undefined') {
  document.documentElement.dataset.ic = BO_ICON
}

export function Icon({ n, className = 'ic', title, kieu }: IconProps) {
  const mode = kieu || (THAO_TAC_SET.has(n) ? 'net' : (DAC[n] ? 'khoi' : 'net'))

  if (mode === 'hai') {
    const iconData = BO_ICON === 'khoi'
      ? (DAC[n] || NET[n] || DAC.doc)
      : (NET[n] || DAC[n] || NET.doc)
    return (
      <>
        <svg
          className={`${className} ic-thuong ic-hai`}
          viewBox={iconData.vb}
          aria-hidden={title ? undefined : true}
          dangerouslySetInnerHTML={{
            __html: (title ? `<title>${title}</title>` : '') + iconData.body
          }}
        />
        <svg
          className={`${className} ic-chon ic-hai`}
          viewBox={iconData.vb}
          aria-hidden={title ? undefined : true}
          dangerouslySetInnerHTML={{
            __html: (title ? `<title>${title}</title>` : '') + iconData.body
          }}
        />
      </>
    )
  }

  if (mode === 'khoi') {
    const iconData = BO_ICON === 'khoi'
      ? (DAC[n] || NET[n] || DAC.doc)
      : (NET[n] || DAC[n] || NET.doc)
    return (
      <svg
        className={`${className} ic-2m`}
        viewBox={iconData.vb}
        aria-hidden={title ? undefined : true}
        dangerouslySetInnerHTML={{
          __html: (title ? `<title>${title}</title>` : '') + iconData.body
        }}
      />
    )
  }

  // mode === 'net'
  const pBody = P[n]
  if (pBody) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        aria-hidden={title ? undefined : true}
        dangerouslySetInnerHTML={{
          __html: (title ? `<title>${title}</title>` : '') + pBody
        }}
      />
    )
  }

  const net = NET[n]
  if (net) {
    return (
      <svg
        className={className}
        viewBox={net.vb}
        aria-hidden={title ? undefined : true}
        dangerouslySetInnerHTML={{
          __html: (title ? `<title>${title}</title>` : '') + net.body
        }}
      />
    )
  }

  const def = NET.doc || DAC.doc
  return (
    <svg
      className={`${className} ic-2m`}
      viewBox={def.vb}
      aria-hidden={title ? undefined : true}
      dangerouslySetInnerHTML={{
        __html: (title ? `<title>${title}</title>` : '') + def.body
      }}
    />
  )
}

export interface ONenProps {
  n: string
  kieu: 'nhat' | 'dac'
  co?: 'sm' | 'md' | 'lg'
  className?: string
  title?: string
}

export function ONen({ n, kieu, co = 'sm', className = '', title }: ONenProps) {
  const cls = ['o-nen', `o-${kieu}`, `o-${co}`, className].filter(Boolean).join(' ')
  return (
    <span className={cls} title={title}>
      <Icon n={n} kieu="khoi" />
    </span>
  )
}
