// Báo cáo Bảng kê mua hàng điện thoại mẫu D (T445, T477)
import React, { useEffect, useMemo, useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import type { Row } from '../../modules/types'
import { money, soLuong } from '../format'
import { CUA_HANG } from '../../data/mock'
import { PHIEU_MUA } from '../../modules/mua-hang/bao-cao'
import { chungTu, ttNghiepVu } from '../generic/gen'
import { duongPhieu } from '../generic/SoChungTu'

export interface MBangKeMuaProps {
  rows: Row[]
  q?: string
}

function layDuongDanPhieu(so: unknown): string | undefined {
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

const CAC_THU = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

function dinhDangThuNgay(chuoiNgay: string): string {
  const parts = chuoiNgay.split('/')
  if (parts.length !== 3) return chuoiNgay
  const d = Number(parts[0])
  const m = Number(parts[1]) - 1
  const y = Number(parts[2])
  const dt = new Date(y, m, d)
  if (isNaN(dt.getTime())) return chuoiNgay
  const thu = CAC_THU[dt.getDay()]
  const ngay = String(d).padStart(2, '0')
  const thang = String(m + 1).padStart(2, '0')
  return `${thu}, ${ngay}/${thang}/${y}`
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
  ck: number
  truocThue: number
  thue: number
  tong: number
}

interface PhieuMuaGroup {
  so: string
  ngay: string
  doiTuong: string
  tongTienHang: number
  tongGiamGia: number
  tongThue: number
  tongGomThue: number
  ttThanhToan: string
  dong: DongHangChuan[]
}

interface NhomNgay {
  ngay: string
  ngayThu: string
  ngayTs: number
  tongTien: number
  phieuList: PhieuMuaGroup[]
}

export const MBangKeMua: FC<MBangKeMuaProps> = ({ rows }) => {
  const [phieuMo, setPhieuMo] = useState<Record<string, boolean>>({})

  // Bảng tra cứu bổ sung thông tin phiếu
  const mapPhieuExtra = useMemo(() => {
    const map = new Map<string, { ttTien: 'chua' | 'mot' | 'da'; cn: string }>()
    try {
      const dsPhieu = chungTu(PHIEU_MUA, '4.1.1')
      for (const p of dsPhieu) {
        const so = String(p.so || '')
        const nv = ttNghiepVu(p)
        map.set(so, {
          ttTien: nv.ttTien,
          cn: String(p.cn || ''),
        })
      }
    } catch {
      // Bỏ qua lỗi tra cứu mẫu
    }
    return map
  }, [])

  // Chuẩn hoá các dòng hàng (bỏ dòng tổng cộng _t, _b)
  const dsDongChuan = useMemo<DongHangChuan[]>(() => {
    return rows
      .filter(r => !r._t && !r._b)
      .map(r => {
        const so = String(r.so || '')
        const ngay = String(r.ngay || '')
        const doiTuong = String(r.doiTuong || '')
        const ma = String(r.ma || '')
        const ten = String(r.ten || '')
        const dvt = String(r.dvt || '')
        const sl = Number(r.sl) || 0
        const gia = Number(r.gia) || 0
        const thanhTien = Number(r.thanhTien ?? sl * gia) || 0
        const ck = Number(r.ck) || 0
        const truocThue = Number(r.truocThue ?? (thanhTien - ck)) || 0
        const thue = Number(r.thue) || 0
        const tong = Number(r.tong ?? (truocThue + thue)) || 0

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
          ck,
          truocThue,
          thue,
          tong,
        }
      })
  }, [rows])

  // Gom theo Phiếu
  const dsPhieuGroup = useMemo<PhieuMuaGroup[]>(() => {
    const pMap = new Map<string, DongHangChuan[]>()
    for (const d of dsDongChuan) {
      const list = pMap.get(d.so) ?? []
      list.push(d)
      pMap.set(d.so, list)
    }

    return Array.from(pMap.entries()).map(([so, pDong]) => {
      const d0 = pDong[0]
      const pTien = pDong.reduce((s, x) => s + x.thanhTien, 0)
      const pGiam = pDong.reduce((s, x) => s + x.ck, 0)
      const pVat = pDong.reduce((s, x) => s + x.thue, 0)
      const pGom = pTien - pGiam + pVat
      const extra = mapPhieuExtra.get(so)
      const ttThanhToan = extra?.ttTien === 'da' ? 'Đã thanh toán' : 'Còn nợ'

      return {
        so,
        ngay: d0.ngay,
        doiTuong: d0.doiTuong,
        tongTienHang: pTien,
        tongGiamGia: pGiam,
        tongThue: pVat,
        tongGomThue: pGom,
        ttThanhToan,
        dong: pDong,
      }
    })
  }, [dsDongChuan, mapPhieuExtra])

  // Gom theo Ngày, ngày mới trước
  const dsNhomNgay = useMemo<NhomNgay[]>(() => {
    const map = new Map<string, PhieuMuaGroup[]>()
    for (const p of dsPhieuGroup) {
      const list = map.get(p.ngay) ?? []
      list.push(p)
      map.set(p.ngay, list)
    }

    const nhomList: NhomNgay[] = Array.from(map.entries()).map(([ngay, pList]) => {
      const tongTien = pList.reduce((s, x) => s + x.tongGomThue, 0)
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

  // Tổng tiền mọi phiếu
  const tongGomThue = useMemo(() => dsPhieuGroup.reduce((s, x) => s + x.tongGomThue, 0), [dsPhieuGroup])

  // Đặt tiêu đề thanh trên thành Bảng kê mua hàng (T477)
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.m-thanh-tren-tieu-de')
    if (!el) return
    const textGoc = el.textContent
    el.textContent = 'Bảng kê mua hàng'
    return () => {
      if (el && textGoc) el.textContent = textGoc
    }
  }, [])

  const togglePhieu = (so: string, macDinhMo: boolean) => {
    setPhieuMo(prev => {
      const hienTai = prev[so] !== undefined ? prev[so] : macDinhMo
      return { ...prev, [so]: !hienTai }
    })
  }

  return (
    <div className="m-bkm-d">
      {/* Danh sách gom theo ngày */}
      {dsNhomNgay.map((nhom, nIdx) => (
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

              return (
                <div
                  key={p.so}
                  className="m-bkm-card"
                  onClick={() => togglePhieu(p.so, laMacDinhBung)}
                >
                  {/* Hàng 1: Số phiếu bên trái, Tổng tiền + Mũi tên bên phải */}
                  <div className="m-bkm-card-h1">
                    <Link
                      to={layDuongDanPhieu(p.so) || '/app/mua-hang/4-1-1'}
                      className="m-bkm-so-phieu"
                      onClick={e => e.stopPropagation()}
                    >
                      {p.so}
                    </Link>
                    <div className="m-bkm-card-h1-phai">
                      <span className="m-bkm-card-tong num">{money(p.tongGomThue)}</span>
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

                  {/* Hàng 2: Tên nhà cung cấp hiện đủ, cho xuống dòng, không cắt "..." */}
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

                      {/* Cuối phần bung: Hàng ... VAT ... bên trái, Trạng thái thanh toán bên phải */}
                      <div className="m-bkm-ct-chan">
                        <div className="m-bkm-ct-chan-trai">
                          <span>Hàng <b className="num">{money(p.tongTienHang)}</b></span>
                          <span>VAT <b className="num">{money(p.tongThue)}</b></span>
                        </div>
                        <div className="m-bkm-ct-chan-phai">
                          <span className={`m-bkm-tt-badge ${p.ttThanhToan === 'Còn nợ' ? 'no' : 'da'}`}>
                            {p.ttThanhToan}
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
      ))}

      {/* Tổng ghim đáy màn */}
      <div className="m-bkm-chan">
        <div className="m-bkm-chan-trai">
          <div className="m-bkm-chan-nhan">Tổng tiền mua hàng</div>
          <div className="m-bkm-chan-phu">gồm thuế GTGT</div>
        </div>
        <div className="m-bkm-chan-phai">
          <span className="m-bkm-chan-tien num">{money(tongGomThue)} đ</span>
        </div>
      </div>
    </div>
  )
}
