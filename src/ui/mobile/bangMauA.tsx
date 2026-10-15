import React, { useLayoutEffect, useState } from 'react'
import type { Col, Row } from '../../modules/types'
import { money } from '../format'

/**
 * Bọc các cột:
 * - Cột số: hiển thị '–' khi bằng 0 hoặc rỗng, dùng money() (T258)
 * - Cột chữ (tên, diễn giải): bọc div để giới hạn tối đa 2 dòng (T273)
 */
export function cotMobile(cols: Col[]): Col[] {
  return cols.map(c => {
    // Điều chỉnh độ rộng cột trên điện thoại (T273)
    let w = c.w
    const isMa = c.k === 'ma' || c.cls === 'code' || c.k === 'stt'
    const isDvt = c.k === 'dvt' || c.c
    const isTen = !c.num && !isMa && !isDvt
    if (isMa) {
      w = typeof w === 'number' ? Math.min(w, 75) : 75
    } else if (isDvt) {
      w = typeof w === 'number' ? Math.min(w, 50) : 50
    } else if (isTen) {
      w = typeof w === 'number' ? Math.min(w, 160) : 160
    }

    if (c.num) {
      const prevR = c.r
      return {
        ...c,
        w,
        r: (x: Row) => {
          const v = prevR ? prevR(x) : x[c.k]
          if (v === 0 || v === '0' || v === '' || v == null) {
            return <span className="m-o-rong">–</span>
          }
          return typeof v === 'number' ? money(v) : v
        },
      }
    }
    // Cột chữ (tên, diễn giải): bọc m-cot-chu-2-dong xuống dòng tối đa 2 dòng (T273)
    if (!c.c && c.k !== 'stt' && c.k !== 'ma') {
      const prevR = c.r
      return {
        ...c,
        w,
        r: (x: Row) => {
          const v = prevR ? prevR(x) : x[c.k]
          if (v == null || v === '') return ''
          return <div className="m-cot-chu-2-dong">{v as React.ReactNode}</div>
        },
      }
    }
    return { ...c, w }
  })
}

/**
 * Hook đo cuộn ngang bảng báo cáo (T273):
 * - Không còn ghim cột nào theo chiều ngang
 * - Trả về trạng thái coCuonNgang để hiện thanh chỉ dẫn vuốt ngang
 */
export function useBangMauA(
  ref: React.RefObject<HTMLDivElement | null>,
  deps: React.DependencyList = []
): boolean {
  const [coCuonNgang, setCoCuonNgang] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    // Dọn các thuộc tính ghim cột cũ nếu còn (T273)
    el.classList.remove('m-ghim-2-cot')
    el.style.removeProperty('--m-cot1-w')

    const doCuon = () => {
      setCoCuonNgang(el.scrollWidth > el.clientWidth + 2)
    }

    doCuon()
    const ro = new ResizeObserver(doCuon)
    ro.observe(el)
    window.addEventListener('resize', doCuon)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', doCuon)
    }
  }, deps)

  return coCuonNgang
}
