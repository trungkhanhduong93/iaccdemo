import React, { useLayoutEffect, useRef, useState, type FC } from 'react'
import type { ScreenProps } from '../../modules/types'

const RONG_MAY_TINH = 900

export const MToGiay: FC<ScreenProps> = ({ sc, mod }) => {
  const Comp = sc.comp
  const [phongTo, setPhongTo] = useState(false)
  const khungRef = useRef<HTMLDivElement>(null)
  const noiDungRef = useRef<HTMLDivElement>(null)
  const [heSo, setHeSo] = useState(1)
  const [rongThuc, setRongThuc] = useState(RONG_MAY_TINH)
  const [chieuCaoScale, setChieuCaoScale] = useState<number | undefined>(undefined)

  useLayoutEffect(() => {
    if (phongTo) {
      setHeSo(1)
      setChieuCaoScale(undefined)
      return
    }

    const tinhToan = () => {
      if (!khungRef.current || !noiDungRef.current) return
      const rongKhung = khungRef.current.clientWidth
      if (rongKhung > 0) {
        let w = RONG_MAY_TINH
        const tables = noiDungRef.current.querySelectorAll('table')
        tables.forEach(t => {
          const offPhai = (t as HTMLElement).offsetLeft + (t as HTMLElement).offsetWidth
          if (offPhai > w) w = offPhai
          if (t.scrollWidth > w) w = t.scrollWidth
        })
        const scale = Math.max(0.1, (rongKhung - 4) / w)
        setRongThuc(w)
        setHeSo(scale)
        const cao = noiDungRef.current.offsetHeight || noiDungRef.current.scrollHeight
        setChieuCaoScale(Math.ceil(cao * scale))
      } else {
        setHeSo(1)
        setChieuCaoScale(undefined)
      }
    }

    tinhToan()
    const timer = setTimeout(tinhToan, 150)
    window.addEventListener('resize', tinhToan)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', tinhToan)
    }
  }, [phongTo, sc.slug])

  if (!Comp) return null

  const onChamGiay = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.target as HTMLElement
    // Bỏ qua tương tác với các công cụ chọn kỳ, bộ lọc, form điều khiển
    if (
      el.closest(
        'button, input, select, textarea, a, .pop, .dropdown, .thanh-loc, .bc-thanh-cong-cu, .kn-pop, .bc-loc-pop'
      )
    ) {
      return
    }
    setPhongTo(p => !p)
  }

  return (
    <div
      ref={khungRef}
      className={`m-to-giay ${phongTo ? 'phong-to' : 'thu-nho'}`}
      onClick={onChamGiay}
      style={!phongTo && chieuCaoScale ? { height: chieuCaoScale } : undefined}
    >
      <div
        ref={noiDungRef}
        className="m-to-giay-noi-dung"
        style={
          !phongTo
            ? {
                width: rongThuc,
                minWidth: rongThuc,
                transform: `scale(${heSo})`,
                transformOrigin: 'top left',
              }
            : {
                width: rongThuc,
                minWidth: rongThuc,
              }
        }
      >
        <Comp sc={sc} mod={mod} />
      </div>
    </div>
  )
}
