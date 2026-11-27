import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { useGiuManDongBo } from './giuManDongBo'

export function ThanhDongBo({ ten, onXong, onHuy }: { ten: string; onXong: () => void; onHuy: () => void }) {
  const [giay, setGiay] = useState(0)
  const onXongRef = useRef(onXong)
  onXongRef.current = onXong

  useEffect(() => {
    const batDau = Date.now()
    const iv = window.setInterval(() => {
      setGiay(Math.floor((Date.now() - batDau) / 1000))
    }, 1000)
    const tm = window.setTimeout(() => {
      window.clearInterval(iv)
      onXongRef.current()
    }, 4000)
    return () => {
      window.clearInterval(iv)
      window.clearTimeout(tm)
    }
  }, [])

  const hopGiuMan = useGiuManDongBo(true, onHuy)
  const dongHo = `${Math.floor(giay / 60)}:${String(giay % 60).padStart(2, '0')}`

  return (
    <>
      <div className="tdb" role="status" aria-live="polite">
        <div className="tdb-dau">
          <span className="tdb-trai">
            <Icon n="refresh" className="ic sm hdb-spin tdb-ic" />
            <b>Đang đồng bộ {ten}…</b>
          </span>
          <span className="tdb-gio">{dongHo}</span>
        </div>
        <div className="tdb-thanh">
          <div className="tdb-muc" />
        </div>
        <div className="tdb-chu">Giữ nguyên màn hình này tới khi xong. Lưới vẫn xem được.</div>
      </div>
      {hopGiuMan}
    </>
  )
}
