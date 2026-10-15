import React, { useLayoutEffect, useState } from 'react'
import type { Col, Row } from '../../modules/types'
import { money } from '../format'

/**
 * Bọc các cột số: hiển thị '–' khi giá trị bằng 0, rỗng hoặc null (Mẫu A T258)
 */
export function cotMobile(cols: Col[]): Col[] {
  return cols.map(c => {
    if (!c.num) return c
    const prevR = c.r
    return {
      ...c,
      r: (x: Row) => {
        const v = prevR ? prevR(x) : x[c.k]
        if (v === 0 || v === '0' || v === '' || v == null) {
          return <span className="m-o-rong">–</span>
        }
        return typeof v === 'number' ? money(v) : v
      },
    }
  })
}

/**
 * Hook đo cuộn ngang và quản lý ghim cột (Mẫu A T258):
 * - Nếu cột 1 hẹp (<= 96px) và bảng có từ 3 cột: ghim cả cột 1 và cột 2, đặt --m-cot1-w
 * - Nếu cột 1 rộng: ghim 1 cột
 * - Trả về trạng thái coCuonNgang để hiện thanh chỉ dẫn
 */
export function useBangMauA(
  ref: React.RefObject<HTMLDivElement | null>,
  deps: React.DependencyList = []
): boolean {
  const [coCuonNgang, setCoCuonNgang] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const doCuon = () => {
      setCoCuonNgang(el.scrollWidth > el.clientWidth + 2)

      const th1 = el.querySelector<HTMLTableCellElement>('table thead tr:first-child > th:first-child')
      const ths = el.querySelectorAll('table thead tr:first-child > th')
      const firstRowTds = el.querySelector('table tbody tr')?.children
      const colCount = firstRowTds ? firstRowTds.length : ths.length

      if (th1) {
        const td1 = el.querySelector<HTMLTableCellElement>('table tbody tr:not(.t):not(.nhom) > td:first-child')
        const t1 = (th1.innerText || '').trim().toLowerCase()
        const wTh = th1.getBoundingClientRect().width
        const wTd = td1 ? td1.getBoundingClientRect().width : 0
        const isNarrow =
          (Math.max(wTh, wTd) <= 96 || ['#', 'stt', 'ngày', 'mã', 'số ct', 'số phiếu', 'số hoá đơn'].some(k => t1 === k || t1.startsWith(k))) &&
          colCount >= 3 &&
          !t1.includes('chỉ tiêu') &&
          !t1.includes('tên')

        if (isNarrow) {
          el.classList.add('m-ghim-2-cot')
          const wThAfter = th1.getBoundingClientRect().width
          const td1After = el.querySelector<HTMLTableCellElement>('table tbody tr:not(.t):not(.nhom) > td:first-child')
          const wTdAfter = td1After ? td1After.getBoundingClientRect().width : 0
          const finalW = Math.max(wThAfter, wTdAfter)
          if (finalW > 0) {
            el.style.setProperty('--m-cot1-w', `${Math.round(finalW)}px`)
          }
        } else {
          el.style.removeProperty('--m-cot1-w')
          el.classList.remove('m-ghim-2-cot')
        }
      }
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
