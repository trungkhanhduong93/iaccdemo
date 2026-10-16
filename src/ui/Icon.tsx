// Biểu tượng Solar nâng cao: nét 2 màu thương hiệu iPOS cho phân hệ và đồ vật, nét đơn cho thao tác (T301, T302)

import { DAC, NET, NHOM } from './icon-dac'

const P: Record<string, string> = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M7 7l10 10M17 7L7 17"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
}

export type IconName = keyof typeof P | keyof typeof NET | keyof typeof DAC

export interface IconProps {
  n: string
  className?: string
  title?: string
  kieu?: 'khoi' | 'net' | 'hai'
}

export function Icon({ n, className = 'ic', title, kieu }: IconProps) {
  const mode = kieu || (DAC[n] ? 'khoi' : 'net')

  if (mode === 'hai') {
    const net = NET[n] || NET.doc || DAC[n] || DAC.doc
    return (
      <>
        <svg
          className={`${className} ic-thuong`}
          viewBox={net.vb}
          aria-hidden={title ? undefined : true}
          dangerouslySetInnerHTML={{
            __html: (title ? `<title>${title}</title>` : '') + net.body
          }}
        />
        <svg
          className={`${className} ic-chon`}
          viewBox={net.vb}
          aria-hidden={title ? undefined : true}
          dangerouslySetInnerHTML={{
            __html: (title ? `<title>${title}</title>` : '') + net.body
          }}
        />
      </>
    )
  }

  if (mode === 'khoi') {
    const net = NET[n] || NET.doc || DAC[n] || DAC.doc
    return (
      <svg
        className={`${className} ic-2m`}
        viewBox={net.vb}
        aria-hidden={title ? undefined : true}
        dangerouslySetInnerHTML={{
          __html: (title ? `<title>${title}</title>` : '') + net.body
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
