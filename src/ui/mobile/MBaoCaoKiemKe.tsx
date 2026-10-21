// Báo cáo kiểm kê điện thoại theo mẫu D (T606)
import { useEffect, useMemo, useState, type FC } from 'react'
import type { Row } from '../../modules/types'
import { money, soLuong } from '../format'
import { HANG, NVL } from '../../data/mock'

export interface MBaoCaoKiemKeProps {
  rows: Row[]
  q?: string
}

interface HangKiemKeItem {
  ma: string
  ten: string
  dvt: string
  kho: string
  gia: number
  thua: number
  thieu: number
  giaTriThua: number
  giaTriThieu: number
  giaTriChenh: number
  ton0?: number
  nhap?: number
  xuat?: number
  tonHt?: number
  tonTt?: number
}

interface NhomKhoKiemKe {
  tenKho: string
  tongThua: number
  tongThieu: number
  tongGiaTriChenh: number
  items: HangKiemKeItem[]
}

function layDonGiaHang(ma: string): number {
  const h = HANG.find(x => x.ma === ma)
  if (h && typeof h.gia === 'number') return h.gia
  const n = NVL.find(x => x.ma === ma)
  if (n && typeof n.gia === 'number') return n.gia
  return 0
}

export const MBaoCaoKiemKe: FC<MBaoCaoKiemKeProps> = ({ rows, q }) => {
  const [itemMo, setItemMo] = useState<Record<string, boolean>>({})

  // Chuẩn hoá danh sách mặt hàng kiểm kê
  const dsHangChuan = useMemo<HangKiemKeItem[]>(() => {
    return rows
      .filter(r => !r._t && !r._b)
      .map(r => {
        const ma = String(r.ma || '')
        const ten = String(r.ten || '')
        const dvt = String(r.dvt || '')
        const kho = String(r.kho || 'Kho chung')
        const gia = layDonGiaHang(ma)
        const thua = Number(r.thua) || 0
        const thieu = Number(r.thieu) || 0
        const giaTriThua = thua * gia
        const giaTriThieu = thieu * gia
        const giaTriChenh = (thua - thieu) * gia

        return {
          ma,
          ten,
          dvt,
          kho,
          gia,
          thua,
          thieu,
          giaTriThua,
          giaTriThieu,
          giaTriChenh,
          ton0: r.ton0 !== undefined ? Number(r.ton0) : undefined,
          nhap: r.nhap !== undefined ? Number(r.nhap) : undefined,
          xuat: r.xuat !== undefined ? Number(r.xuat) : undefined,
          tonHt: r.tonHt !== undefined ? Number(r.tonHt) : undefined,
          tonTt: r.tonTt !== undefined ? Number(r.tonTt) : undefined,
        }
      })
  }, [rows])

  // Gom theo Kho
  const dsNhom = useMemo<NhomKhoKiemKe[]>(() => {
    const map = new Map<string, HangKiemKeItem[]>()
    for (const d of dsHangChuan) {
      const list = map.get(d.kho) ?? []
      list.push(d)
      map.set(d.kho, list)
    }

    return Array.from(map.entries()).map(([tenKho, items]) => ({
      tenKho,
      tongThua: items.reduce((s, x) => s + x.thua, 0),
      tongThieu: items.reduce((s, x) => s + x.thieu, 0),
      tongGiaTriChenh: items.reduce((s, x) => s + x.giaTriChenh, 0),
      items,
    }))
  }, [dsHangChuan])

  // Tổng toàn bộ các kho
  const tongThua = useMemo(() => dsHangChuan.reduce((s, x) => s + x.thua, 0), [dsHangChuan])
  const tongThieu = useMemo(() => dsHangChuan.reduce((s, x) => s + x.thieu, 0), [dsHangChuan])
  const tongGiaTriThua = useMemo(() => dsHangChuan.reduce((s, x) => s + x.giaTriThua, 0), [dsHangChuan])
  const tongGiaTriThieu = useMemo(() => dsHangChuan.reduce((s, x) => s + x.giaTriThieu, 0), [dsHangChuan])
  const tongGiaTriChenh = useMemo(() => Math.abs(tongGiaTriThua - tongGiaTriThieu), [tongGiaTriThua, tongGiaTriThieu])

  // Đặt tiêu đề thanh trên thành Báo cáo kiểm kê
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.m-thanh-tren-tieu-de')
    if (!el) return
    const textGoc = el.textContent
    el.textContent = 'Báo cáo kiểm kê'
    return () => {
      if (el && textGoc) el.textContent = textGoc
    }
  }, [])

  const toggleItem = (khoa: string, macDinhMo: boolean) => {
    setItemMo(prev => {
      const hienTai = prev[khoa] !== undefined ? prev[khoa] : macDinhMo
      return { ...prev, [khoa]: !hienTai }
    })
  }

  return (
    <div className="m-bkm-d m-bkm-5215">
      {dsNhom.length === 0 ? (
        <div className="m-so-dong-trong">
          {q?.trim() ? 'Không tìm thấy mặt hàng phù hợp' : 'Không có dữ liệu trong kỳ'}
        </div>
      ) : (
        dsNhom.map((nhom, nIdx) => (
          <div key={nhom.tenKho} className="m-bkm-nhom-ngay">
            {/* Tiêu đề nhóm: Tên kho bên trái; Số mặt hàng · Thừa / Thiếu bên phải */}
            <div className="m-bkm-ngay-head">
              <span className="m-bkm-ngay-ten">{nhom.tenKho}</span>
              <span className="m-bkm-ngay-phai">
                {nhom.items.length} mặt hàng · Thừa <b className="m-bkm-ngay-tong num">{soLuong(nhom.tongThua)}</b> · Thiếu <b className="m-bkm-ngay-tong num">{soLuong(nhom.tongThieu)}</b>
              </span>
            </div>

            {/* Các thẻ mặt hàng trong kho */}
            <div className="m-bkm-ds-phieu">
              {nhom.items.map((it, itIdx) => {
                const khoaItem = `${it.kho}-${it.ma}`
                const laMacDinhBung = nIdx === 0 && itIdx === 0
                const isBung = itemMo[khoaItem] !== undefined ? itemMo[khoaItem] : laMacDinhBung

                return (
                  <div
                    key={khoaItem}
                    className="m-bkm-card"
                    onClick={() => toggleItem(khoaItem, laMacDinhBung)}
                  >
                    {/* Hàng 1: Mã hàng bên trái, Giá trị thừa/thiếu + Mũi tên bên phải */}
                    <div className="m-bkm-card-h1">
                      <span className="m-bkm-so-phieu">{it.ma}</span>
                      <div className="m-bkm-card-h1-phai">
                        <span className={`m-bkm-card-tong num ${it.thieu > 0 ? 'do' : it.thua > 0 ? 'xanh' : ''}`}>
                          {it.thua > 0 ? `+${money(it.giaTriThua)}` : it.thieu > 0 ? `−${money(it.giaTriThieu)}` : '0 đ'}
                        </span>
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
                          {it.thua > 0 && (
                            <div className="m-bkm-hang-item">
                              <div className="m-bkm-hang-top">
                                <span className="m-bkm-hang-ten">Số lượng thừa</span>
                                <span className="m-bkm-hang-tien num" style={{ color: 'var(--green, #107c41)' }}>+{soLuong(it.thua)} {it.dvt}</span>
                              </div>
                              <div className="m-bkm-hang-sub">Giá trị thừa: {money(it.giaTriThua)} đ ({soLuong(it.thua)} × {money(it.gia)})</div>
                            </div>
                          )}

                          {it.thieu > 0 && (
                            <div className="m-bkm-hang-item">
                              <div className="m-bkm-hang-top">
                                <span className="m-bkm-hang-ten">Số lượng thiếu</span>
                                <span className="m-bkm-hang-tien num" style={{ color: 'var(--orange, #ea580c)' }}>−{soLuong(it.thieu)} {it.dvt}</span>
                              </div>
                              <div className="m-bkm-hang-sub">Giá trị thiếu: {money(it.giaTriThieu)} đ ({soLuong(it.thieu)} × {money(it.gia)})</div>
                            </div>
                          )}

                          {it.thua === 0 && it.thieu === 0 && (
                            <div className="m-bkm-hang-item">
                              <div className="m-bkm-hang-top">
                                <span className="m-bkm-hang-ten">Chênh lệch</span>
                                <span className="m-bkm-hang-tien num">Khớp (0 {it.dvt})</span>
                              </div>
                            </div>
                          )}

                          {it.tonHt !== undefined && (
                            <div className="m-bkm-hang-item" style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed var(--line-2, #f1f5f9)' }}>
                              <div className="m-bkm-hang-top">
                                <span className="m-bkm-hang-ten">Tồn hệ thống</span>
                                <span className="m-bkm-hang-tien num">{soLuong(it.tonHt)} {it.dvt}</span>
                              </div>
                              <div className="m-bkm-hang-top">
                                <span className="m-bkm-hang-ten">Tồn thực tế</span>
                                <span className="m-bkm-hang-tien num">{soLuong(it.tonTt ?? 0)} {it.dvt}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Cuối phần bung */}
                        <div className="m-bkm-ct-chan">
                          <div className="m-bkm-ct-chan-trai">
                            <span>ĐVT <b className="num">{it.dvt}</b></span>
                            <span>Đơn giá <b className="num">{money(it.gia)}</b></span>
                          </div>
                          <div className="m-bkm-ct-chan-phai">
                            <span className={`m-bkm-tt-badge ${it.thieu > 0 ? 'no' : 'da'}`}>
                              {it.thua > 0 ? `Thừa ${soLuong(it.thua)}` : it.thieu > 0 ? `Thiếu ${soLuong(it.thieu)}` : 'Khớp'}
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
          <div className="m-bkm-chan-nhan">Tổng chênh lệch kiểm kê</div>
          <div className="m-bkm-chan-phu">Thừa <b className="num">{soLuong(tongThua)}</b> · Thiếu <b className="num">{soLuong(tongThieu)}</b></div>
        </div>
        <div className="m-bkm-chan-phai">
          <span className="m-bkm-chan-tien num">
            {money(tongGiaTriChenh)} đ
          </span>
        </div>
      </div>
    </div>
  )
}
