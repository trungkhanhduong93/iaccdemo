// Dòng nhập Tồn kho ban đầu ngay đầu danh sách, thay panel Thêm mới (T736): chọn kho, mặt hàng, gõ số lượng, đơn giá;
// Enter hoặc nút Lưu ghi dòng, giữ kho và đưa con trỏ về ô mặt hàng để nhập tiếp; Esc hoặc nút Huỷ đóng dòng nhập
import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import type { Row } from '../types'
import { HANG, KHO, NVL } from '../../data/mock'
import { ChonCoTim, type MucTim } from '../danh-muc/QuyDoiDvt'
import { Icon } from '../../ui/Icon'
import { money, nhapSoQT, soQT } from '../../ui/format'

// Mặt hàng có theo dõi tồn: nguyên vật liệu và hàng hoá có tồn kho
const MAT_HANG = [...NVL, ...HANG.filter(h => h.tonKho)]
const DS_KHO: MucTim[] = KHO.map(k => ({ v: k, t: k }))
const DS_HANG: MucTim[] = MAT_HANG.map(h => ({ v: h.ma, t: h.ten, phu: `${h.ma} · ${h.dvt}` }))

export function useONhapTonDau(luu: (r: Row) => void, huy: () => void): Record<string, ReactNode> {
  const [kho, setKho] = useState(KHO[0])
  const [ma, setMa] = useState('')
  const [sl, setSl] = useState('')
  const [gia, setGia] = useState('')
  const [loi, setLoi] = useState(false)
  const oSl = useRef<HTMLInputElement>(null)
  const khung = useRef<HTMLSpanElement>(null)
  const mh = MAT_HANG.find(x => x.ma === ma)
  const soSl = Number(sl) || 0
  const soGia = Number(gia) || 0

  const chonHang = (v: string) => {
    setMa(v)
    setGia(String(MAT_HANG.find(x => x.ma === v)?.gia ?? ''))
    setLoi(false)
    setTimeout(() => oSl.current?.focus(), 0)
  }
  const ghi = () => {
    if (!mh || soSl <= 0) { setLoi(true); return }
    luu({ _k: `${kho}|${mh.ma}|${Date.now()}`, kho, ma: mh.ma, ten: mh.ten, dvt: mh.dvt, sl: soSl, gia: soGia, tien: Math.round(soSl * soGia) })
    setMa(''); setSl(''); setGia(''); setLoi(false)
    // về ô mặt hàng (nút chọn trong ô Tên) để nhập dòng tiếp
    setTimeout(() => khung.current?.closest('tr')?.querySelector<HTMLButtonElement>('[aria-label="Mặt hàng"]')?.focus(), 0)
  }
  const phim = (e: KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); ghi() }
    if (e.key === 'Escape') { e.preventDefault(); huy() }
  }
  const oSo = (val: string, dat: (v: string) => void, nhan: string, ref?: typeof oSl) => (
    <input ref={ref} className={`inp tdn-so${loi && nhan === 'Số lượng' && soSl <= 0 ? ' tdn-loi' : ''}`} inputMode="decimal" aria-label={nhan}
      placeholder={nhan === 'Số lượng' ? '0' : undefined} value={soQT(val)} onChange={e => { dat(nhapSoQT(e.target.value)); setLoi(false) }} onKeyDown={phim} />
  )

  return {
    kho: <span ref={khung} className="tdn-o"><ChonCoTim ds={DS_KHO} value={kho} onChange={setKho} nhan="Kho" className="inp tdn-chon" /></span>,
    ma: <span className="code muted">{mh?.ma ?? ''}</span>,
    ten: (
      <span className={`tdn-o${loi && !mh ? ' tdn-loi' : ''}`}>
        <ChonCoTim ds={DS_HANG} value={ma} onChange={chonHang} nhan="Mặt hàng" className="inp tdn-chon" />
      </span>
    ),
    dvt: mh?.dvt ?? '',
    sl: oSo(sl, setSl, 'Số lượng', oSl),
    gia: oSo(gia, setGia, 'Đơn giá'),
    tien: soSl && soGia ? money(soSl * soGia) : '',
    _tt: (
      <span className="tdn-nut">
        <button type="button" className="icon-btn sm" title="Lưu dòng (Enter)" aria-label="Lưu dòng" onClick={ghi}><Icon n="check" className="ic sm" /></button>
        <button type="button" className="icon-btn sm" title="Huỷ (Esc)" aria-label="Huỷ" onClick={huy}><Icon n="x" className="ic sm" /></button>
      </span>
    ),
  }
}
