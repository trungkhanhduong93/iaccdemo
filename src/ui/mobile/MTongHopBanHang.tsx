// Báo cáo Tổng hợp bán hàng điện thoại theo mẫu D (T606)
import { useEffect, useMemo, useState, type FC } from 'react'
import type { Row } from '../../modules/types'
import { money, soLuong } from '../format'

export interface MTongHopBanHangProps {
  rows: Row[]
  q?: string
}

interface HangBanItem {
  nhom: string
  ma: string
  ten: string
  dvt: string
  sl: number
  thanh: number
  giam: number
  ck: number
  dtTt: number
  thue: number
  tong: number
}

interface NhomHangBan {
  tenNhom: string
  tongTien: number
  tongSl: number
  items: HangBanItem[]
}

export const MTongHopBanHang: FC<MTongHopBanHangProps> = ({ rows, q }) => {
  const [itemMo, setItemMo] = useState<Record<string, boolean>>({})

  // Dòng tổng cộng từ dữ liệu gốc
  const rTong = useMemo(() => rows.find(r => r._t === 1), [rows])

  // Chuẩn hoá danh sách mặt hàng
  const dsHangChuan = useMemo<HangBanItem[]>(() => {
    return rows
      .filter(r => !r._t && !r._b)
      .map(r => ({
        nhom: String(r.nhom || 'Khác'),
        ma: String(r.ma || ''),
        ten: String(r.ten || ''),
        dvt: String(r.dvt || ''),
        sl: Number(r.sl) || 0,
        thanh: Number(r.thanh) || 0,
        giam: Number(r.giam) || 0,
        ck: Number(r.ck) || 0,
        dtTt: Number(r.dtTt ?? r.thanh) || 0,
        thue: Number(r.thue) || 0,
        tong: Number(r.tong ?? (r.thanh + (Number(r.thue) || 0) - (Number(r.giam) || 0))) || 0,
      }))
  }, [rows])

  // Gom theo Nhóm hàng
  const dsNhom = useMemo<NhomHangBan[]>(() => {
    const map = new Map<string, HangBanItem[]>()
    for (const d of dsHangChuan) {
      const list = map.get(d.nhom) ?? []
      list.push(d)
      map.set(d.nhom, list)
    }

    return Array.from(map.entries()).map(([tenNhom, items]) => ({
      tenNhom,
      tongTien: items.reduce((s, x) => s + x.tong, 0),
      tongSl: items.reduce((s, x) => s + x.sl, 0),
      items,
    }))
  }, [dsHangChuan])

  // Tổng ghim đáy màn hình khớp dòng Cộng trên web
  const tongSl = useMemo(() => {
    if (rTong?.sl !== undefined) return Number(rTong.sl)
    return dsHangChuan.reduce((s, x) => s + x.sl, 0)
  }, [rTong, dsHangChuan])

  const tongDt = useMemo(() => {
    if (rTong?.thanh !== undefined) return Number(rTong.thanh)
    return dsHangChuan.reduce((s, x) => s + x.thanh, 0)
  }, [rTong, dsHangChuan])

  const tongTien = useMemo(() => {
    if (rTong?.tong !== undefined) return Number(rTong.tong)
    return dsHangChuan.reduce((s, x) => s + x.tong, 0)
  }, [rTong, dsHangChuan])

  // Đặt tiêu đề thanh trên thành Tổng hợp bán hàng
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.m-thanh-tren-tieu-de')
    if (!el) return
    const textGoc = el.textContent
    el.textContent = 'Tổng hợp bán hàng'
    return () => {
      if (el && textGoc) el.textContent = textGoc
    }
  }, [])

  const toggleItem = (ma: string, macDinhMo: boolean) => {
    setItemMo(prev => {
      const hienTai = prev[ma] !== undefined ? prev[ma] : macDinhMo
      return { ...prev, [ma]: !hienTai }
    })
  }

  return (
    <div className="m-bkm-d m-bkm-327">
      {dsNhom.length === 0 ? (
        <div className="m-so-dong-trong">
          {q?.trim() ? 'Không tìm thấy mặt hàng phù hợp' : 'Không có dữ liệu trong kỳ'}
        </div>
      ) : (
        dsNhom.map((nhom, nIdx) => (
          <div key={nhom.tenNhom} className="m-bkm-nhom-ngay">
            {/* Tiêu đề nhóm: Nhóm hàng bên trái; n mặt hàng · tổng tiền nhóm bên phải */}
            <div className="m-bkm-ngay-head">
              <span className="m-bkm-ngay-ten">{nhom.tenNhom}</span>
              <span className="m-bkm-ngay-phai">
                {nhom.items.length} mặt hàng · <b className="m-bkm-ngay-tong num">{money(nhom.tongTien)}</b>
              </span>
            </div>

            {/* Các thẻ mặt hàng trong nhóm */}
            <div className="m-bkm-ds-phieu">
              {nhom.items.map((it, itIdx) => {
                const laMacDinhBung = nIdx === 0 && itIdx === 0
                const isBung = itemMo[it.ma] !== undefined ? itemMo[it.ma] : laMacDinhBung
                const giamCk = it.giam + it.ck

                return (
                  <div
                    key={it.ma}
                    className="m-bkm-card"
                    onClick={() => toggleItem(it.ma, laMacDinhBung)}
                  >
                    {/* Hàng 1: Mã hàng bên trái, Tổng tiền + Mũi tên bên phải */}
                    <div className="m-bkm-card-h1">
                      <span className="m-bkm-so-phieu">{it.ma}</span>
                      <div className="m-bkm-card-h1-phai">
                        <span className="m-bkm-card-tong num">{money(it.tong)}</span>
                        <span className="m-bkm-card-chev">
                          {isBung ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="18 15 12 9 6 15" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Hàng 2: Tên mặt hàng */}
                    <div className="m-bkm-ncc-ten">{it.ten}</div>

                    {/* Chi tiết khi bung */}
                    {isBung && (
                      <div className="m-bkm-chi-tiet">
                        <div className="m-bkm-ds-hang">
                          <div className="m-bkm-hang-item">
                            <div className="m-bkm-hang-top">
                              <span className="m-bkm-hang-ten">Số lượng bán</span>
                              <span className="m-bkm-hang-tien num">{soLuong(it.sl)} {it.dvt}</span>
                            </div>
                          </div>

                          <div className="m-bkm-hang-item">
                            <div className="m-bkm-hang-top">
                              <span className="m-bkm-hang-ten">Thành tiền</span>
                              <span className="m-bkm-hang-tien num">{money(it.thanh)}</span>
                            </div>
                          </div>

                          {giamCk > 0 && (
                            <div className="m-bkm-hang-item">
                              <div className="m-bkm-hang-top">
                                <span className="m-bkm-hang-ten">Giảm giá &amp; CK</span>
                                <span className="m-bkm-hang-tien num" style={{ color: 'var(--orange, #ea580c)' }}>−{money(giamCk)}</span>
                              </div>
                            </div>
                          )}

                          <div className="m-bkm-hang-item">
                            <div className="m-bkm-hang-top">
                              <span className="m-bkm-hang-ten">Doanh thu tính thuế</span>
                              <span className="m-bkm-hang-tien num">{money(it.dtTt)}</span>
                            </div>
                          </div>

                          {it.thue > 0 && (
                            <div className="m-bkm-hang-item">
                              <div className="m-bkm-hang-top">
                                <span className="m-bkm-hang-ten">Thuế GTGT</span>
                                <span className="m-bkm-hang-tien num">{money(it.thue)}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Cuối phần bung */}
                        <div className="m-bkm-ct-chan">
                          <div className="m-bkm-ct-chan-trai">
                            <span>ĐVT <b className="num">{it.dvt}</b></span>
                            <span>SL <b className="num">{soLuong(it.sl)}</b></span>
                          </div>
                          <div className="m-bkm-ct-chan-phai">
                            <span className="m-bkm-tt-badge da">
                              Tổng: {money(it.tong)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}

      {/* Tổng ghim đáy màn */}
      <div className="m-bkm-chan">
        <div className="m-bkm-chan-trai">
          <div className="m-bkm-chan-nhan">Tổng cộng bán hàng</div>
          <div className="m-bkm-chan-phu">SL {soLuong(tongSl)} · Doanh thu {money(tongDt)}</div>
        </div>
        <div className="m-bkm-chan-phai">
          <span className="m-bkm-chan-tien num">{money(tongTien)} đ</span>
        </div>
      </div>
    </div>
  )
}
