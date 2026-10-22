// Báo cáo chi tiết theo mẫu D trên điện thoại cho 3.2.8 và 5.2.10 (T624)
import React, { useEffect, useMemo, useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import type { Row } from '../../modules/types'
import { money, rutGonSo, soLuong } from '../format'
import { duongPhieu } from '../generic/SoChungTu'

export interface MBaoCaoChiTietMauDProps {
  maBc: string
  rows: Row[]
  q?: string
}

function layDuongDanPhieu(so: unknown, di?: string): string | undefined {
  if (di) return di.startsWith('/') ? di : `/app/${di}`
  if (!so || typeof so !== 'string') return undefined
  let to = duongPhieu(so)
  if (!to) {
    const m = /^([A-Z]+)(\d{2})-(\d+)$/.exec(so)
    if (m) {
      to = duongPhieu(`${m[1]}26${m[2]}-${m[3].padStart(4, '0')}`)
    }
  }
  return to
}

function dinhDangThuNgay(chuoiNgay: string): string {
  const parts = chuoiNgay.split('/')
  if (parts.length !== 3) return chuoiNgay
  const d = Number(parts[0])
  const m = Number(parts[1]) - 1
  const y = Number(parts[2])
  const dt = new Date(y, m, d)
  if (isNaN(dt.getTime())) return chuoiNgay
  const ngay = String(d).padStart(2, '0')
  const thang = String(m + 1).padStart(2, '0')
  return `${ngay}/${thang}/${y}`
}

function parseNgayTs(chuoiNgay: string): number {
  const parts = chuoiNgay.split('/')
  if (parts.length !== 3) return 0
  const d = Number(parts[0])
  const m = Number(parts[1]) - 1
  const y = Number(parts[2])
  return new Date(y, m, d).getTime()
}

interface DongHangChuan {
  so: string
  ngay: string
  doiTuong: string
  ma: string
  ten: string
  dvt: string
  sl: number
  gia: number
  thanhTien: number
  thue: number
  tong: number
  di?: string
  kho?: string
}

interface PhieuGroup {
  so: string
  ngay: string
  doiTuong: string
  tongTienHang: number
  tongThue: number
  tongTien: number
  tongSl: number
  kho?: string
  di?: string
  dong: DongHangChuan[]
}

interface NhomNgay {
  ngay: string
  ngayThu: string
  ngayTs: number
  tongTien: number
  phieuList: PhieuGroup[]
}

export const MBaoCaoChiTietMauD: FC<MBaoCaoChiTietMauDProps> = ({ maBc, rows, q = '' }) => {
  const [phieuMo, setPhieuMo] = useState<Record<string, boolean>>({})
  const maNorm = (maBc || '').replace(/-/g, '.').split('/').pop() || ''
  const is328 = maNorm === '3.2.8'
  const is5210 = maNorm === '5.2.10'

  // Đặt tiêu đề thanh trên
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.m-thanh-tren-tieu-de')
    if (!el) return
    const textGoc = el.textContent
    el.textContent = is328 ? 'Bảng kê chi tiết bán hàng' : 'Chi tiết nhập kho'
    return () => {
      if (el && textGoc) el.textContent = textGoc
    }
  }, [is328])

  // Lọc tìm kiếm và chuẩn hoá các dòng hàng (bỏ dòng tổng _t, _b)
  const dsDongChuan = useMemo<DongHangChuan[]>(() => {
    const qTrim = q.trim().toLowerCase()
    return rows
      .filter(r => !r._t && !r._b)
      .filter(r => {
        if (!qTrim) return true
        const text = `${r.so || ''} ${r.soCt || ''} ${r.soHieu || ''} ${r.ma || ''} ${r.ten || ''} ${r.doiTuong || ''} ${r.kh || ''} ${r.kho || ''}`.toLowerCase()
        return text.includes(qTrim)
      })
      .map(r => {
        const so = String(r.so || r.soCt || r.soHieu || '')
        const ngay = String(r.ngay || r.ngayCt || r.date || '')
        const doiTuong = is328
          ? String(r.kh || (r.kenh ? `Khách lẻ POS · ${r.kenh}` : 'Khách lẻ POS'))
          : String(r.doiTuong || (r.loai ? `${r.loai}${r.kho ? ` - ${r.kho}` : ''}` : 'Nhập kho'))
        const ma = String(r.ma || '')
        const ten = String(r.ten || r.tenHang || '')
        const dvt = String(r.dvt || '')
        const sl = Number(r.sl) || 0
        const gia = Number(r.gia) || 0
        const thanhTien = Number(r.tien ?? r.thanhTien ?? r.thanh ?? sl * gia) || 0
        const thue = Number(r.thue) || 0
        const tong = Number(r.tong ?? (thanhTien + thue)) || 0
        const di = r._di ? String(r._di) : undefined
        const kho = r.kho ? String(r.kho) : undefined

        return {
          so,
          ngay,
          doiTuong,
          ma,
          ten,
          dvt,
          sl,
          gia,
          thanhTien,
          thue,
          tong,
          di,
          kho,
        }
      })
  }, [rows, q, is328])

  // Gom theo Phiếu
  const dsPhieuGroup = useMemo<PhieuGroup[]>(() => {
    const pMap = new Map<string, DongHangChuan[]>()
    for (const d of dsDongChuan) {
      const key = d.so || `${d.ngay}-${d.doiTuong}`
      const list = pMap.get(key) ?? []
      list.push(d)
      pMap.set(key, list)
    }

    return Array.from(pMap.entries()).map(([soKey, pDong]) => {
      const d0 = pDong[0]
      const pTienHang = pDong.reduce((s, x) => s + x.thanhTien, 0)
      const pThue = pDong.reduce((s, x) => s + x.thue, 0)
      const pTong = pDong.reduce((s, x) => s + x.tong, 0)
      const pSl = pDong.reduce((s, x) => s + x.sl, 0)

      return {
        so: d0.so || soKey,
        ngay: d0.ngay,
        doiTuong: d0.doiTuong,
        tongTienHang: pTienHang,
        tongThue: pThue,
        tongTien: pTong > 0 ? pTong : pTienHang,
        tongSl: pSl,
        kho: d0.kho,
        di: d0.di,
        dong: pDong,
      }
    })
  }, [dsDongChuan])

  // Gom theo Ngày, ngày mới trước
  const dsNhomNgay = useMemo<NhomNgay[]>(() => {
    const map = new Map<string, PhieuGroup[]>()
    for (const p of dsPhieuGroup) {
      const list = map.get(p.ngay) ?? []
      list.push(p)
      map.set(p.ngay, list)
    }

    const nhomList: NhomNgay[] = Array.from(map.entries()).map(([ngay, pList]) => {
      const tongTien = pList.reduce((s, x) => s + x.tongTien, 0)
      return {
        ngay,
        ngayThu: dinhDangThuNgay(ngay),
        ngayTs: parseNgayTs(ngay),
        tongTien,
        phieuList: pList,
      }
    })

    nhomList.sort((a, b) => b.ngayTs - a.ngayTs)
    return nhomList
  }, [dsPhieuGroup])

  // 4 chỉ tiêu thẻ tổng cho 3.2.8
  const soDon328 = dsPhieuGroup.length
  const tongSl328 = useMemo(() => dsDongChuan.reduce((s, x) => s + x.sl, 0), [dsDongChuan])
  const doanhThu328 = useMemo(() => dsPhieuGroup.reduce((s, x) => s + x.tongTien, 0), [dsPhieuGroup])
  const tbDon328 = soDon328 > 0 ? Math.round(doanhThu328 / soDon328) : 0

  // Tổng ghim đáy màn
  const tongTienTatCa = useMemo(() => dsPhieuGroup.reduce((s, x) => s + x.tongTien, 0), [dsPhieuGroup])

  const togglePhieu = (so: string, macDinhMo: boolean) => {
    setPhieuMo(prev => {
      const hienTai = prev[so] !== undefined ? prev[so] : macDinhMo
      return { ...prev, [so]: !hienTai }
    })
  }

  return (
    <div className="m-bkm-d">
      {/* Thẻ tổng 4 ô cho Bảng kê chi tiết bán hàng 3.2.8 (T476, T624) */}
      {is328 && dsPhieuGroup.length > 0 && (
        <div className="m-so-dong-tong bon-o m-t476-tong-ban-hang" style={{ margin: '0 0 12px 0' }}>
          <div className="m-so-dong-tong-o">
            <span className="m-so-dong-tong-nhan">Số đơn</span>
            <b className="m-so-dong-tong-so m-so-dong-num">{soDon328} đơn</b>
          </div>
          <div className="m-so-dong-tong-o">
            <span className="m-so-dong-tong-nhan">SL bán</span>
            <b className="m-so-dong-tong-so m-so-dong-num">{rutGonSo(tongSl328)}</b>
          </div>
          <div className="m-so-dong-tong-o">
            <span className="m-so-dong-tong-nhan">Doanh thu</span>
            <b className="m-so-dong-tong-so m-so-dong-num m-t476-doanh-thu">{rutGonSo(doanhThu328)}</b>
          </div>
          <div className="m-so-dong-tong-o">
            <span className="m-so-dong-tong-nhan">TB/đơn</span>
            <b className="m-so-dong-tong-so m-so-dong-num">{soDon328 > 0 ? rutGonSo(tbDon328) : '0'}</b>
          </div>
        </div>
      )}

      {dsNhomNgay.length === 0 ? (
        <div className="m-so-dong-trong">
          {q.trim() ? 'Không tìm thấy dòng phù hợp' : 'Không có phát sinh trong kỳ'}
        </div>
      ) : (
        dsNhomNgay.map((nhom, nIdx) => (
          <div key={nhom.ngay} className="m-bkm-nhom-ngay">
            {/* Đầu nhóm: Thứ, ngày tháng bên trái; n phiếu · tổng tiền ngày bên phải */}
            <div className="m-bkm-ngay-head">
              <span className="m-bkm-ngay-ten">{nhom.ngayThu}</span>
              <span className="m-bkm-ngay-phai">
                {nhom.phieuList.length} phiếu · <b className="m-bkm-ngay-tong num">{money(nhom.tongTien)}</b>
              </span>
            </div>

            {/* Các thẻ phiếu trong ngày */}
            <div className="m-bkm-ds-phieu">
              {nhom.phieuList.map((p, pIdx) => {
                const laMacDinhBung = nIdx === 0 && pIdx === 0
                const isBung = phieuMo[p.so] !== undefined ? phieuMo[p.so] : laMacDinhBung
                const linkTo = layDuongDanPhieu(p.so, p.di) || (is328 ? '/app/ban-hang/3-1-1' : '/app/kho/5-1-1')

                return (
                  <div
                    key={p.so}
                    className="m-bkm-card m-bcd-item"
                    onClick={() => togglePhieu(p.so, laMacDinhBung)}
                  >
                    {/* Hàng 1: Số phiếu bên trái, Tổng tiền + Mũi tên bên phải */}
                    <div className="m-bkm-card-h1">
                      <Link
                        to={linkTo}
                        className="m-bkm-so-phieu"
                        onClick={e => e.stopPropagation()}
                      >
                        {p.so}
                      </Link>
                      <div className="m-bkm-card-h1-phai">
                        <span className="m-bkm-card-tong num">{money(p.tongTien)}</span>
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

                    {/* Hàng 2: Đối tượng / Khách hàng / Nhà cung cấp */}
                    <div className="m-bkm-ncc-ten">
                      {p.doiTuong}
                    </div>

                    {/* Chi tiết từng mặt hàng khi bung */}
                    {isBung && (
                      <div className="m-bkm-chi-tiet">
                        <div className="m-bkm-ds-hang">
                          {p.dong.map((d, dIdx) => (
                            <div key={`${p.so}-${d.ma || dIdx}`} className="m-bkm-hang-item">
                              <div className="m-bkm-hang-top">
                                <span className="m-bkm-hang-ten">{d.ten}</span>
                                <span className="m-bkm-hang-tien num">{money(d.thanhTien)}</span>
                              </div>
                              <div className="m-bkm-hang-sub">
                                {soLuong(d.sl)} {d.dvt} × {money(d.gia)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Cuối phần bung */}
                        <div className="m-bkm-ct-chan">
                          <div className="m-bkm-ct-chan-trai">
                            <span>Tổng SL <b className="num">{soLuong(p.tongSl)}</b></span>
                            {p.tongThue > 0 && <span>VAT <b className="num">{money(p.tongThue)}</b></span>}
                            {p.kho && <span>Kho <b className="num">{p.kho}</b></span>}
                          </div>
                          <div className="m-bkm-ct-chan-phai">
                            <span className="m-bkm-tt-badge da">
                              Tổng: {money(p.tongTien)}
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
          <div className="m-bkm-chan-nhan">{is328 ? 'Tổng doanh thu bán hàng' : 'Tổng tiền nhập kho'}</div>
          <div className="m-bkm-chan-phu">{is328 ? 'gồm thuế GTGT' : 'giá vốn hàng nhập'}</div>
        </div>
        <div className="m-bkm-chan-phai">
          <span className="m-bkm-chan-tien num">{money(tongTienTatCa)} đ</span>
        </div>
      </div>
    </div>
  )
}
