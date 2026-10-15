// Biểu tượng Solar nâng cao: nét mảnh cho thao tác, khối đặc cho phân hệ và đồ vật (T275)

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
  const nhom = NHOM[n] || 'ht'
  const mode = kieu || (DAC[n] ? 'khoi' : 'net')

  if (mode === 'hai') {
    const net = NET[n]
    const dac = DAC[n] || DAC.doc
    return (
      <>
        <svg
          className={`${className} ic-thuong`}
          viewBox={net ? net.vb : '0 0 24 24'}
          aria-hidden={title ? undefined : true}
          dangerouslySetInnerHTML={{
            __html: (title ? `<title>${title}</title>` : '') + (net ? net.body : (P[n] || ''))
          }}
        />
        <svg
          className={`${className} dac ic-chon k-${nhom}`}
          viewBox={dac.vb}
          aria-hidden={title ? undefined : true}
          dangerouslySetInnerHTML={{
            __html: (title ? `<title>${title}</title>` : '') + dac.body
          }}
        />
      </>
    )
  }

  if (mode === 'khoi') {
    const dac = DAC[n] || DAC.doc
    return (
      <svg
        className={`${className} dac k-${nhom}`}
        viewBox={dac.vb}
        aria-hidden={title ? undefined : true}
        dangerouslySetInnerHTML={{
          __html: (title ? `<title>${title}</title>` : '') + dac.body
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

  const def = DAC.doc
  return (
    <svg
      className={`${className} dac k-${nhom}`}
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
  const nhom = NHOM[n] || 'ht'
  const cls = ['o-nen', `o-${kieu}`, `o-${co}`, `k-${nhom}`, className].filter(Boolean).join(' ')
  return (
    <span className={cls} title={title}>
      <Icon n={n} kieu="khoi" />
    </span>
  )
}
