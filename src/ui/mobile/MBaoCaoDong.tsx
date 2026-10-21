// 3 khuôn báo cáo dạng dòng kiểu app trên điện thoại (T241):
// Khuôn 1: Chi tiết theo ngày (nhóm ngày, mã phiếu, diễn giải, số tiền xanh/đỏ, SL/ĐVT)
// Khuôn 2: Tổng hợp theo đối tượng (thẻ 2 tầng: tên + số cuối; tầng 2: 3 ô Đầu kỳ | Tăng | Giảm)
// Khuôn 3: Chỉ tiêu phân cấp (danh sách dọc thụt lề theo cấp, đậm chỉ tiêu tổng, số kỳ này và kỳ trước)
import React, { useMemo, useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import type { Col, Row } from '../../modules/types'
import { money, rutGonSo } from '../format'
import { duongPhieu } from '../generic/SoChungTu'
import { useSession } from '../../app/session'
import { MBangKeMua } from './MBangKeMua'
import { MSoTT152, laSoTT152 } from './MSoTT152'

export type LoaiKhuonDong = 'chi-tiet-ngay' | 'tong-hop-doi-tuong' | 'chi-tieu-phan-cap'

/** Bảng ánh xạ mã màn sang 3 khuôn dùng chung (T241) */
export const BANG_KHUON_DONG: Record<string, LoaiKhuonDong> = {
  // Khuôn 1: Chi tiết theo ngày (8 màn mới + 2.2.1, 2.2.3, 2.2.5)
  '2.2.1': 'chi-tiet-ngay',
  '2.2.3': 'chi-tiet-ngay',
  '2.2.5': 'chi-tiet-ngay',
  '3.2.6': 'chi-tiet-ngay',
  '3.2.8': 'chi-tiet-ngay',
  '4.2.1': 'chi-tiet-ngay',
  '4.2.6': 'chi-tiet-ngay',
  '4.2.7': 'chi-tiet-ngay',
  '5.2.1': 'chi-tiet-ngay',
  '5.2.10': 'chi-tiet-ngay',
  '5.2.12': 'chi-tiet-ngay',

  // Khuôn 2: Tổng hợp theo đối tượng (9 màn)
  '2.2.8': 'tong-hop-doi-tuong',
  '3.2.7': 'tong-hop-doi-tuong',
  '3.2.9': 'tong-hop-doi-tuong',
  '4.2.2': 'tong-hop-doi-tuong',
  '4.2.3': 'tong-hop-doi-tuong',
  '5.2.3': 'tong-hop-doi-tuong',
  '5.2.9': 'tong-hop-doi-tuong',
  '5.2.11': 'tong-hop-doi-tuong',
  '10.4.3': 'tong-hop-doi-tuong',

  // Khuôn 3: Chỉ tiêu phân cấp (2 màn)
  '2.2.9': 'chi-tieu-phan-cap',
  '10.2.3': 'chi-tieu-phan-cap',
}

export interface ChiTieuTongKhuon3 {
  /** Nhãn ô rút gọn (bỏ số La Mã, bỏ ngoặc) */
  nhan: string
  /** Khớp dòng trong dữ liệu */
  khop: (r: Row) => boolean
  /** Tính giá trị trực tiếp từ danh sách dòng (ghi đè khop nếu có) */
  tinh?: (rows: Row[]) => { val: number; tonTai: boolean }
}

/** Cấu hình 3 chỉ tiêu dòng tổng cho các màn khuôn 3 (T241) */
export const BANG_TONG_KHUON_3: Record<string, [ChiTieuTongKhuon3, ChiTieuTongKhuon3, ChiTieuTongKhuon3]> = {
  // 2.2.9: I. Tiền đầu kỳ, IV. Dòng tiền thuần, V. Tiền cuối kỳ
  '2.2.9': [
    {
      nhan: 'Đầu kỳ',
      khop: r => {
        const t = String(r.ct || r.chiTieu || r.ten || r.dg || '')
        return t.includes('Tiền đầu kỳ') || t.includes('đầu kỳ')
      },
    },
    {
      nhan: 'Dòng thuần',
      khop: r => {
        const t = String(r.ct || r.chiTieu || r.ten || r.dg || '')
        return t.includes('Dòng tiền thuần') || t.includes('thuần')
      },
    },
    {
      nhan: 'Cuối kỳ',
      khop: r => {
        const t = String(r.ct || r.chiTieu || r.ten || r.dg || '')
        return t.includes('Tiền cuối kỳ') || (Boolean(r._t) && t.includes('cuối kỳ'))
      },
    },
  ],
  // 10.2.3: Tổng doanh thu, Tổng chi phí, Lợi nhuận (T378)
  '10.2.3': [
    {
      nhan: 'Tổng doanh thu',
      khop: r => {
        const ma = String(r.ma || '')
        const t = String(r.ct || r.chiTieu || r.ten || r.dg || '').toLowerCase()
        return t.includes('doanh thu bán hàng') || ma === '01' || ma === '10' || t.includes('doanh thu và thu nhập thuần') || t.includes('doanh thu thuần')
      },
      tinh: rows => {
        const row = rows.find(r => {
          const ma = String(r.ma || '')
          const t = String(r.ct || r.chiTieu || r.ten || r.dg || '').toLowerCase()
          return t.includes('doanh thu bán hàng') || ma === '01' || ma === '10' || t.includes('doanh thu và thu nhập thuần') || t.includes('doanh thu thuần')
        })
        const val = Number(row?.v ?? row?.nay ?? row?.tongNay ?? row?.tien ?? 0)
        return { val, tonTai: Boolean(row) }
      },
    },
    {
      nhan: 'Tổng chi phí',
      khop: r => {
        if (r._con || r._t) return false
        const t = String(r.ct || r.chiTieu || r.ten || r.dg || '').toLowerCase()
        if (t.includes('doanh thu') || t.includes('lãi') || t.includes('lợi nhuận')) return false
        const ma = String(r.ma || '')
        return t.includes('chi phí') || ma === '02' || ma === '11' || ma === '22' || ma === '24' || ma === '25' || ma === '26' || ma === '32' || ma === '51' || t.includes('giá vốn')
      },
      tinh: rows => {
        // Tổng mọi dòng chi phí cấp 1 của báo cáo (!r._con, !r._t, tên có 'chi phí' hoặc nhóm chi phí cấp 1)
        const dsCp = rows.filter(r => {
          if (r._con || r._t) return false
          const t = String(r.ct || r.chiTieu || r.ten || r.dg || '').toLowerCase()
          if (t.includes('doanh thu') || t.includes('lãi') || t.includes('lợi nhuận')) return false
          const ma = String(r.ma || '')
          return t.includes('chi phí') || ma === '02' || ma === '11' || ma === '22' || ma === '24' || ma === '25' || ma === '26' || ma === '32' || ma === '51' || t.includes('giá vốn')
        })
        const val = dsCp.reduce((tong, r) => tong + Number(r.v ?? r.nay ?? r.tongNay ?? r.tien ?? 0), 0)
        return { val, tonTai: dsCp.length > 0 }
      },
    },
    {
      nhan: 'Lợi nhuận',
      khop: r => {
        if (r._con) return false
        const t = String(r.ct || r.chiTieu || r.ten || r.dg || '').toLowerCase()
        return Boolean(r._t) || t.includes('lợi nhuận sau thuế') || t.includes('lợi nhuận trước thuế') || t.includes('lợi nhuận')
      },
      tinh: rows => {
        // Dòng lợi nhuận cuối cùng của chính báo cáo này
        const row = [...rows].reverse().find(r => {
          if (r._con) return false
          const t = String(r.ct || r.chiTieu || r.ten || r.dg || '').toLowerCase()
          return Boolean(r._t) || t.includes('lợi nhuận sau thuế') || t.includes('lợi nhuận trước thuế') || t.includes('lợi nhuận')
        }) || rows.find(r => r._t === 1) || rows.at(-1)
        const val = Number(row?.v ?? row?.nay ?? row?.tongNay ?? row?.tien ?? 0)
        return { val, tonTai: Boolean(row) }
      },
    },
  ],
}

export function layTongKhuon3(maBc?: string): [ChiTieuTongKhuon3, ChiTieuTongKhuon3, ChiTieuTongKhuon3] | undefined {
  if (!maBc) return undefined
  const ma = maBc.replace(/-/g, '.').split('/').pop() || ''
  return BANG_TONG_KHUON_3[ma] || BANG_TONG_KHUON_3[maBc]
}

export function layKhuonDong(maOrSc: string | { code?: string; slug?: string }): LoaiKhuonDong | undefined {
  if (typeof maOrSc === 'string') {
    const k = maOrSc.replace(/-/g, '.')
    return BANG_KHUON_DONG[maOrSc] || BANG_KHUON_DONG[k]
  }
  const code = maOrSc.code ? maOrSc.code.replace(/-/g, '.') : ''
  const slug = maOrSc.slug ? maOrSc.slug.replace(/-/g, '.') : ''
  return BANG_KHUON_DONG[code] || BANG_KHUON_DONG[slug]
}

function layDuongDan(so: unknown): string | undefined {
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

interface Props {
  maBc: string
  khuon: LoaiKhuonDong
  cols?: Col[]
  rows: Row[]
  q?: string
  xemTatCaCn?: boolean
}

// ── KHUÔN 1: CHI TIẾT THEO NGÀY ──
const Khuon1ChiTietNgay: FC<{ maBc?: string; rows: Row[]; q?: string; xemTatCaCn?: boolean }> = ({ maBc, rows, q = '', xemTatCaCn }) => {
  // Tìm dòng tổng nếu có
  const rDau = rows.find(r => r._b === 1 || String(r.dg || r.dienGiai || '').toLowerCase().includes('đầu kỳ'))
  const rTong = rows.find(r => r._t === 1)
  // thẻ kho (5.2.1) ghi số lượng nhập, xuất, tồn, không có cột tiền (T355)
  const laTheKho = rows.some(r => r.nhap !== undefined || r.xuat !== undefined)
  const rCuoi = rows.find(r => r._t === 1 && r.ton !== undefined)

  // Gom các dòng phát sinh
  const dsPhatSinh = useMemo(() => {
    return rows.filter(r => !r._b && !r._t)
  }, [rows])

  // Phân loại báo cáo bán hàng (T476)
  const maNorm = (maBc || '').replace(/-/g, '.').split('/').pop() || ''
  const coDongHang = useMemo(() => {
    return dsPhatSinh.some(r => r.sl !== undefined && (r.so !== undefined || r.soCt !== undefined || r.soHieu !== undefined))
  }, [dsPhatSinh])
  const laBanHangChiTiet = (maNorm === '3.2.8' || (maNorm.startsWith('3.2.') && coDongHang)) && !laTheKho
  const laBanHangTheoNgay = maNorm === '3.2.6' && !laTheKho

  // Thẻ tổng cho Bảng kê chi tiết bán hàng (4 ô: Số đơn, SL bán, Doanh thu, TB/đơn)
  const soDon328 = useMemo(() => {
    const set = new Set(dsPhatSinh.map(r => String(r.so || r.soCt || r.soHieu || '')).filter(Boolean))
    return set.size
  }, [dsPhatSinh])
  const tongSl328 = useMemo(() => {
    return dsPhatSinh.reduce((acc, r) => acc + (Number(r.sl) || 0), 0)
  }, [dsPhatSinh])
  const doanhThu328 = useMemo(() => {
    return dsPhatSinh.reduce((acc, r) => acc + Number(r.tien ?? r.thanhTien ?? r.dtThuan ?? r.tong ?? r.tienHang ?? 0), 0)
  }, [dsPhatSinh])
  const tbDon328 = soDon328 > 0 ? Math.round(doanhThu328 / soDon328) : 0

  // Thẻ tổng cho Bán hàng theo ngày (3 ô: Số đơn, Doanh thu, TB/đơn)
  const soDon326 = useMemo(() => {
    return dsPhatSinh.reduce((acc, r) => acc + (Number(r.don) || 0), 0)
  }, [dsPhatSinh])
  const doanhThu326 = useMemo(() => {
    return dsPhatSinh.reduce((acc, r) => acc + Number(r.tien ?? r.thanhTien ?? r.dtThuan ?? r.tong ?? r.tienHang ?? 0), 0)
  }, [dsPhatSinh])
  const tbDon326 = soDon326 > 0 ? Math.round(doanhThu326 / soDon326) : 0

  // Gom theo ngày kèm tính tổng tiền của ngày (T343)
  const dsNhomNgay = useMemo(() => {
    const map = new Map<string, { ngay: string; ds: Row[]; tongTien: number }>()
    for (const r of dsPhatSinh) {
      const ngay = String(r.ngay || r.date || r.ngayCt || '') || 'Giao dịch trong kỳ'
      const tienDong = Number(r.tien ?? r.thanhTien ?? r.dtThuan ?? r.tong ?? r.tienHang ?? ((Number(r.no) || 0) + (Number(r.co) || 0)))   // cùng thứ tự cột tiền của dòng bên dưới
      const nhom = map.get(ngay)
      if (nhom) {
        nhom.ds.push(r)
        nhom.tongTien = laTheKho ? Number(r.ton ?? 0) : nhom.tongTien + tienDong
      } else {
        map.set(ngay, { ngay, ds: [r], tongTien: laTheKho ? Number(r.ton ?? 0) : tienDong })
      }
    }
    return Array.from(map.values())
  }, [dsPhatSinh, laTheKho])

  return (
    <div className="m-bcd-khuon1">
      {/* Thẻ kho: 4 ô số lượng Tồn đầu, Nhập, Xuất, Tồn cuối (T355) */}
      {laTheKho && rTong && (
        <div className="m-so-dong-tong bon-o">
          {[
            ['Tồn đầu', rDau?.ton], ['Nhập', rTong.nhap], ['Xuất', rTong.xuat], ['Tồn cuối', rCuoi?.ton],
          ].map(([nhan, v]) => (
            <div key={String(nhan)} className="m-so-dong-tong-o">
              <span className="m-so-dong-tong-nhan">{String(nhan)}</span>
              <b className="m-so-dong-tong-so m-so-dong-num">{money(Number(v ?? 0))}</b>
            </div>
          ))}
        </div>
      )}
      {/* Thẻ tổng 4 ô cho Bảng kê chi tiết bán hàng (T476) */}
      {!laTheKho && rTong && laBanHangChiTiet && (
        <div className="m-so-dong-tong bon-o m-t476-tong-ban-hang">
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
      {/* Thẻ tổng 3 ô cho Bán hàng theo ngày (T476) */}
      {!laTheKho && rTong && laBanHangTheoNgay && (
        <div className="m-so-dong-tong m-t476-tong-ban-hang">
          <div className="m-so-dong-tong-o">
            <span className="m-so-dong-tong-nhan">Số đơn</span>
            <b className="m-so-dong-tong-so m-so-dong-num">{money(soDon326)} đơn</b>
          </div>
          <div className="m-so-dong-tong-o">
            <span className="m-so-dong-tong-nhan">Doanh thu</span>
            <b className="m-so-dong-tong-so m-so-dong-num m-t476-doanh-thu">{rutGonSo(doanhThu326)}</b>
          </div>
          <div className="m-so-dong-tong-o">
            <span className="m-so-dong-tong-nhan">TB/đơn</span>
            <b className="m-so-dong-tong-so m-so-dong-num">{soDon326 > 0 ? rutGonSo(tbDon326) : '0'}</b>
          </div>
        </div>
      )}
      {/* Dòng tổng 3 ô đầu danh sách cho các báo cáo khác */}
      {!laTheKho && rTong && !laBanHangChiTiet && !laBanHangTheoNgay && (
        <div className="m-so-dong-tong">
          <div className="m-so-dong-tong-o">
            <span className="m-so-dong-tong-nhan">
              {rDau ? 'Tồn đầu' : 'Số đơn / Dòng'}
            </span>
            <b className="m-so-dong-tong-so m-so-dong-num">
              {rDau
                ? rutGonSo(Number(rDau.du ?? rDau.gt0 ?? 0))
                : rTong.soDon
                ? `${rTong.soDon} đơn`
                : `${dsPhatSinh.length} dòng`}
            </b>
          </div>
          <div className="m-so-dong-tong-o">
            <span className="m-so-dong-tong-nhan">
              {rTong.no !== undefined || rTong.co !== undefined
                ? 'Thu / Chi'
                : 'Tiền hàng / Nhập'}
            </span>
            <b className="m-so-dong-tong-so m-so-dong-num">
              {rTong.no !== undefined || rTong.co !== undefined ? (
                <>
                  <span className="m-so-dong-duong">{rutGonSo(Number(rTong.no ?? 0))}</span>{' '}
                  <span className="m-so-dong-am">{rutGonSo(Number(rTong.co ?? 0))}</span>
                </>
              ) : (
                rutGonSo(Number(rTong.tienHang ?? rTong.tien ?? rTong.sln ?? 0))
              )}
            </b>
          </div>
          <div className="m-so-dong-tong-o">
            <span className="m-so-dong-tong-nhan">
              {rTong.du !== undefined || rTong.cuoi !== undefined
                ? 'Tồn cuối'
                : 'Tổng tiền'}
            </span>
            <b className="m-so-dong-tong-so m-so-dong-num">
              {rutGonSo(Number(rTong.du ?? rTong.cuoi ?? rTong.dtThuan ?? rTong.tong ?? rTong.tien ?? 0))}
            </b>
          </div>
        </div>
      )}

      {/* Danh sách theo ngày */}
      {dsNhomNgay.length === 0 ? (
        <div className="m-so-dong-trong">
          {q.trim() ? 'Không tìm thấy dòng phù hợp' : 'Không có phát sinh trong kỳ'}
        </div>
      ) : (
        dsNhomNgay.map(nhom => (
          <div key={nhom.ngay} className="m-bcd-ngay-khoi">
            <div className="m-so-dong-ngay">
              <span className="m-so-dong-ngay-chu">{nhom.ngay}</span>
              <span className="m-so-dong-ngay-ton m-so-dong-num">{laTheKho ? `Tồn ${money(nhom.tongTien)}` : money(nhom.tongTien)}</span>
            </div>
            <div className="m-so-dong-the">
              {nhom.ds.map((r, i) => {
                const soCt = String(r.so || r.soCt || r.soHieu || r.thu || r.chi || '')
                const dg = String(r.dg || r.dienGiai || r.ten || r.tenHang || r.ncc || r.kh || 'Giao dịch')
                const to = layDuongDan(soCt)

                // Chiều tiền và số tiền
                const tienThu = Number(r.no ?? (r.thu ? r.no : undefined) ?? 0)
                const tienChi = Number(r.co ?? (r.chi ? r.co : undefined) ?? 0)
                const tienChinh = Number(r.tien ?? r.thanhTien ?? r.dtThuan ?? r.tong ?? r.tienHang ?? 0)

                // Dòng phụ: SL, ĐVT, cửa hàng, đối tác
                const slStr = r.sl !== undefined ? `${money(Number(r.sl))} ${r.dvt || ''}` : ''
                const phuArr = [
                  soCt || null,
                  slStr || null,
                  xemTatCaCn && r.cn ? String(r.cn) : null,
                  r.ncc ? String(r.ncc) : null,
                  r.kh ? String(r.kh) : null,
                ].filter(Boolean)
                const phu = phuArr.join(' · ')

                const noiDung = (
                  <div className="m-bcd-dong m-bcd-item" key={i}>
                    <div className="m-so-dong-trai">
                      <div className="m-so-dong-dg">{dg}</div>
                      {phu && <div className="m-so-dong-phu">{phu}</div>}
                    </div>
                    <div className="m-so-dong-phai">
                      {tienThu > 0 && (
                        <div className="m-so-dong-tien m-so-dong-duong m-so-dong-num">
                          {money(tienThu)}
                        </div>
                      )}
                      {tienChi > 0 && (
                        <div className="m-so-dong-tien m-so-dong-am m-so-dong-num">
                          {money(tienChi)}
                        </div>
                      )}
                      {!tienThu && !tienChi && tienChinh !== 0 && (
                        <div className="m-so-dong-tien m-so-dong-num">
                          {money(tienChinh)}
                        </div>
                      )}
                      {laTheKho && r.nhap !== undefined && (
                        <div className="m-so-dong-tien m-so-dong-duong m-so-dong-num">+{money(Number(r.nhap))}</div>
                      )}
                      {laTheKho && r.xuat !== undefined && (
                        <div className="m-so-dong-tien m-so-dong-am m-so-dong-num">−{money(Number(r.xuat))}</div>
                      )}
                      {laTheKho && r.ton !== undefined && (
                        <div className="m-so-dong-phu" style={{ fontSize: 11 }}>Tồn {money(Number(r.ton))}</div>
                      )}
                      {r.du !== undefined && (
                        <div className="m-so-dong-phu" style={{ fontSize: 11 }}>
                          Tồn {money(Number(r.du))}
                        </div>
                      )}
                    </div>
                  </div>
                )

                return to ? (
                  <Link key={i} to={to} className="m-bcd-link-wrap" title="Xem chứng từ">
                    {noiDung}
                  </Link>
                ) : (
                  <React.Fragment key={i}>{noiDung}</React.Fragment>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ── KHUÔN 2: TỔNG HỢP THEO ĐỐI TƯỢNG ──
const Khuon2TongHopDoiTuong: FC<{ rows: Row[]; q?: string }> = ({ rows, q = '' }) => {
  const rTong = rows.find(r => r._t === 1)
  const dsDoiTuong = useMemo(() => rows.filter(r => !r._t && !r._b && !r._con), [rows])   // bỏ dòng cửa hàng con của 4.2.3 (T308)


  // Tính các ô tóm tắt đầu danh sách (Điểm 19: tách thành 4 ô khi có cả phát sinh tăng và giảm)
  const cacOTong = useMemo(() => {
    if (!rTong) return []
    // 1. Trường hợp Xuất Nhập Tồn: Đầu kỳ, Nhập, Xuất, Cuối kỳ
    if (rTong.gtn !== undefined || rTong.gtx !== undefined) {
      return [
        { nhan: 'Đầu kỳ', val: Number(rTong.gt0 ?? rTong.dau ?? 0) },
        { nhan: 'Nhập', val: Number(rTong.gtn ?? 0) },
        { nhan: 'Xuất', val: Number(rTong.gtx ?? 0) },
        { nhan: 'Cuối kỳ', val: Number(rTong.gt1 ?? rTong.cuoi ?? 0) },
      ]
    }
    // 2. Trường hợp Tiền / Thu Chi: Đầu kỳ, Thu, Chi, Cuối kỳ
    if (rTong.thu !== undefined && rTong.chi !== undefined) {
      return [
        { nhan: 'Đầu kỳ', val: Number(rTong.dau ?? 0) },
        { nhan: 'Thu', val: Number(rTong.thu ?? 0) },
        { nhan: 'Chi', val: Number(rTong.chi ?? 0) },
        { nhan: 'Cuối kỳ', val: Number(rTong.cuoi ?? 0) },
      ]
    }
    // 3. Trường hợp Công nợ / CCDC / TSCĐ có cả nợ và có / phát sinh và thanh toán
    const coTangGiam = (rTong.psNo !== undefined && rTong.psCo !== undefined) ||
      ((rTong.ps !== undefined || rTong.tienHang !== undefined) && (rTong.tra !== undefined || rTong.tt !== undefined))
    if (coTangGiam) {
      const vTang = Number(rTong.psNo ?? rTong.ps ?? rTong.tienHang ?? 0)
      const vGiam = Number(rTong.psCo ?? rTong.tra ?? rTong.tt ?? 0)
      return [
        { nhan: 'Đầu kỳ', val: Number(rTong.dau ?? 0) },
        { nhan: rTong.psNo !== undefined ? 'Phát sinh Nợ' : 'Mua nợ/Tăng', val: vTang },
        { nhan: rTong.psCo !== undefined ? 'Phát sinh Có' : 'Đã trả/Giảm', val: vGiam },
        { nhan: 'Cuối kỳ', val: Number(rTong.cuoi ?? 0) },
      ]
    }

    // Mặc định 3 ô nếu không có tăng/giảm tách biệt
    return [
      {
        nhan: rTong.dau !== undefined || rTong.gt0 !== undefined ? 'Đầu kỳ' : 'Số đối tượng',
        val: rTong.dau !== undefined || rTong.gt0 !== undefined ? Number(rTong.dau ?? rTong.gt0 ?? 0) : dsDoiTuong.length,
        laSoDem: rTong.dau === undefined && rTong.gt0 === undefined,
      },
      {
        nhan: rTong.thu !== undefined || rTong.gtn !== undefined || rTong.psNo !== undefined ? 'Tăng / Nhập' : 'Tiền hàng / PS',
        val: Number(rTong.thu ?? rTong.gtn ?? rTong.psNo ?? rTong.tienHang ?? rTong.ps ?? 0),
      },
      {
        nhan: rTong.cuoi !== undefined || rTong.gt1 !== undefined ? 'Cuối kỳ' : 'Tổng cộng',
        val: Number(rTong.cuoi ?? rTong.gt1 ?? rTong.tong ?? rTong.tien ?? rTong.dtThuan ?? 0),
      },
    ]
  }, [rTong, dsDoiTuong.length])

  return (
    <div className="m-bcd-khuon2">
      {/* Dòng tổng đầu danh sách (Điểm 19) */}
      {rTong && (
        <div className={`m-so-dong-tong ${cacOTong.length === 4 ? 'bon-o' : ''}`}>
          {cacOTong.map((o, idx) => (
            <div key={idx} className="m-so-dong-tong-o">
              <span className="m-so-dong-tong-nhan">{o.nhan}</span>
              <b className="m-so-dong-tong-so m-so-dong-num">
                {o.laSoDem ? `${o.val}` : rutGonSo(o.val)}
              </b>
            </div>
          ))}
        </div>
      )}

      {/* Danh sách thẻ 2 tầng */}
      {dsDoiTuong.length === 0 ? (
        <div className="m-so-dong-trong">
          {q.trim() ? 'Không tìm thấy đối tượng phù hợp' : 'Không có dữ liệu trong kỳ'}
        </div>
      ) : (
        <div className="m-bcd-the-ds">
          {dsDoiTuong.map((r, i) => {
            const ten = String(r.ten || r.tenHang || r.doiTuong || r.quy || r.ncc || r.kh || r.khoanMuc || r.nhom || r.kho || 'Đối tượng')
            const ma = String(r.ma || '')
            const soCuoi = Number(r.cuoi ?? r.gt1 ?? r.tong ?? r.dtThuan ?? r.tien ?? 0)

            // 3 ô tầng 2: Đầu kỳ | Tăng | Giảm (tự thích ứng theo cột)
            const o1Nhan = r.dau !== undefined || r.gt0 !== undefined ? 'Đầu kỳ' : r.sl !== undefined ? 'Số lượng' : 'Kỳ trước'
            const o1Val = r.dau !== undefined || r.gt0 !== undefined
              ? money(Number(r.dau ?? r.gt0 ?? 0))
              : r.sl !== undefined
              ? `${money(Number(r.sl))} ${r.dvt || ''}`
              : money(Number(r.truoc ?? r.cu ?? 0))

            const o2Nhan = r.thu !== undefined ? 'Thu' : r.gtn !== undefined ? 'Nhập' : r.psNo !== undefined ? 'Tăng/Nợ' : 'Phát sinh'
            const o2Val = Number(r.thu ?? r.gtn ?? r.psNo ?? r.no ?? r.tienHang ?? r.ps ?? 0)

            const o3Nhan = r.chi !== undefined ? 'Chi' : r.gtx !== undefined ? 'Xuất' : r.psCo !== undefined ? 'Giảm/Có' : 'Giảm giá'
            const o3Val = Number(r.chi ?? r.gtx ?? r.psCo ?? r.co ?? r.tra ?? r.giamGia ?? 0)

            const isXnt = Boolean(r.gt0 !== undefined || r.gtn !== undefined || r.gtx !== undefined)
            const khoThe = r._kho ? (Array.isArray(r._kho) ? r._kho[0] : String(r._kho)) : 'Kho bếp Lê Lợi'
            const kyThe = r._ky ? String(r._ky) : '9'
            const linkTheKho = isXnt && ma ? `/app/bao-cao/5-2-1?ma=${ma}&kho=${encodeURIComponent(khoThe)}&ky=${kyThe}` : undefined

            return (
              <div key={r.ma || i} className="m-bcd-the m-bcd-item">
                {/* Tầng 1: Tên đối tượng và số cuối */}
                <div className="m-bcd-the-t1">
                  <div className="m-bcd-the-trai">
                    <div className="m-bcd-the-ten">
                      {linkTheKho ? (
                        <Link to={linkTheKho} className="m-bcd-the-ten-link" title="Xem thẻ kho">
                          {ten}
                        </Link>
                      ) : (
                        ten
                      )}
                    </div>
                    {ma && (
                      <div className="m-bcd-the-ma">
                        {linkTheKho ? (
                          <Link to={linkTheKho} className="m-bcd-the-ma-link" title="Xem thẻ kho">
                            {ma}
                          </Link>
                        ) : (
                          ma
                        )}
                        {r.dvt ? ` · ${r.dvt}` : ''}
                      </div>
                    )}
                  </div>
                  <div className="m-bcd-the-phai">
                    <div className="m-bcd-the-so-cuoi">{money(soCuoi)}</div>
                    <div className="m-bcd-the-nhan-cuoi">
                      {r.cuoi !== undefined || r.gt1 !== undefined ? 'Cuối kỳ' : 'Tổng'}
                    </div>
                  </div>
                </div>

                {/* Tầng 2: 3 ô nhỏ */}
                <div className="m-bcd-the-t2">
                  <div className="m-bcd-t2-o">
                    <span className="m-bcd-t2-nhan">{o1Nhan}</span>
                    <b className="m-bcd-t2-val">{o1Val}</b>
                  </div>
                  <div className="m-bcd-t2-o">
                    <span className="m-bcd-t2-nhan">{o2Nhan}</span>
                    <b className="m-bcd-t2-val m-so-dong-duong">{money(o2Val)}</b>
                  </div>
                  <div className="m-bcd-t2-o">
                    <span className="m-bcd-t2-nhan">{o3Nhan}</span>
                    <b className="m-bcd-t2-val m-so-dong-am">{money(o3Val)}</b>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Tô màu số tiền dòng tổng cho KQKD (T378): Doanh thu bán hàng xanh dương, tổng chi phí cam, lợi nhuận xanh lá/đỏ; dòng con không tô */
function layMauSoKqkd(r: Row, vNay: number): string | undefined {
  const isDam = Boolean(r._b || r._t)
  if (!isDam || r._con) return undefined
  const t = String(r.ct || r.chiTieu || r.ten || r.dg || '').toLowerCase()
  const ma = String(r.ma || '')

  // 1. Dòng tổng doanh thu: xanh dương
  if (t.includes('doanh thu bán hàng') || ma === '01' || ma === '10' || t.includes('doanh thu và thu nhập thuần') || t.includes('doanh thu thuần')) {
    return 'var(--blue)'
  }

  // 2. Dòng lợi nhuận (Lãi gộp, lợi nhuận trước/sau thuế): xanh lá nếu >= 0, đỏ nếu < 0
  if (t.includes('lãi') || t.includes('lợi nhuận') || Boolean(r._t) || ma === '20' || ma === '50' || ma === '60') {
    return vNay < 0 ? 'var(--red)' : 'var(--green)'
  }

  // 3. Dòng tổng chi phí cấp 1 (Chi phí NVL, Chi phí trong tháng, Chi phí phân bổ hàng tháng...): cam
  if (t.includes('chi phí') || ma === '02' || ma === '11' || ma === '22' || ma === '24' || ma === '25' || ma === '26' || ma === '32' || ma === '51' || t.includes('giá vốn')) {
    return 'var(--orange)'
  }

  return undefined
}

// ── KHUÔN 3: CHỈ TIÊU PHÂN CẤP ──
const Khuon3ChiTieuPhanCap: FC<{ maBc?: string; rows: Row[]; q?: string }> = ({ maBc, rows, q = '' }) => {
  // Tìm các chỉ tiêu nổi bật cho dòng tổng 3 ô
  const layTen = (r: Row) => String(r.ct || r.chiTieu || r.ten || r.dg || 'Chỉ tiêu')
  const laySoNay = (r?: Row) => Number(r?.v ?? r?.nay ?? r?.tongNay ?? r?.tien ?? 0)
  const laySoTruoc = (r?: Row) =>
    r?.cu !== undefined || r?.truoc !== undefined || r?.kyTruoc !== undefined
      ? Number(r?.cu ?? r?.truoc ?? r?.kyTruoc)
      : undefined

  const cfgTong = layTongKhuon3(maBc)

  const cacOTong = useMemo(() => {
    if (cfgTong) {
      return cfgTong.map(item => {
        if (item.tinh) {
          const res = item.tinh(rows)
          return {
            nhan: item.nhan,
            val: res.val,
            tonTai: res.tonTai,
          }
        }
        const row = rows.find(item.khop)
        const val = laySoNay(row)
        return {
          nhan: item.nhan,
          val,
          tonTai: Boolean(row),
        }
      })
    }
    // Dự phòng nếu có màn khuôn 3 mới chưa khai trong bảng: không đoán chữ ghép "/"
    const rDau = rows.find(r => {
      const t = layTen(r).toLowerCase()
      return t.includes('đầu kỳ') || t.includes('doanh thu')
    })
    const rGiua = rows.find(r => {
      const t = layTen(r).toLowerCase()
      return (
        t.includes('dòng tiền thuần') ||
        t.includes('lưu chuyển thuần') ||
        t.includes('lãi gộp') ||
        t.includes('lợi nhuận gộp')
      )
    })
    const rCuoi = rows.find(r => r._t === 1) || rows.at(-1)

    const rutGonNhan = (ten: string, macDinh: string) => {
      const sach = ten.replace(/^[IVXLCDM]+\.\s*/i, '').replace(/\s*\([^)]*\)/g, '').trim()
      return sach || macDinh
    }

    return [
      { nhan: rDau ? rutGonNhan(layTen(rDau), 'Đầu kỳ') : 'Đầu kỳ', val: laySoNay(rDau), tonTai: Boolean(rDau) },
      { nhan: rGiua ? rutGonNhan(layTen(rGiua), 'Phát sinh') : 'Phát sinh', val: laySoNay(rGiua), tonTai: Boolean(rGiua) },
      { nhan: rCuoi ? rutGonNhan(layTen(rCuoi), 'Tổng cộng') : 'Tổng cộng', val: laySoNay(rCuoi), tonTai: Boolean(rCuoi) },
    ]
  }, [cfgTong, rows])

  const dsHienThi = useMemo(() => {
    if (!q.trim()) return rows
    const qFold = q.trim().toLowerCase()
    return rows.filter(r => layTen(r).toLowerCase().includes(qFold))
  }, [rows, q])

  const is1023 = Boolean(
    maBc === '10.2.3' ||
    maBc === '10-2-3' ||
    maBc?.includes('10.2.3') ||
    maBc?.includes('10-2-3')
  )

  const [daMo, setDaMo] = useState<Set<string>>(() => new Set())
  const toggleMo = (khoa: string) => {
    setDaMo(prev => {
      const next = new Set(prev)
      if (next.has(khoa)) {
        next.delete(khoa)
      } else {
        next.add(khoa)
      }
      return next
    })
  }

  const cacNhom = useMemo(() => {
    if (!is1023) {
      return [{ tieuDe: '', rows: dsHienThi }]
    }
    const dinhNghia = [
      { tieuDe: 'Doanh thu & Lợi nhuận gộp', mas: ['01', '02', '03', '10', '11', '20'] },
      { tieuDe: 'Hoạt động kinh doanh', mas: ['21', '22', '23', '24', '25', '26', '30'] },
      { tieuDe: 'Hoạt động khác', mas: ['31', '32', '40'] },
      { tieuDe: 'Kết quả kinh doanh & Thuế', mas: ['50', '51', '52', '60'] },
    ]
    const ketQua: { tieuDe: string; rows: Row[] }[] = []
    const daChon = new Set<Row>()
    for (const d of dinhNghia) {
      const rs = dsHienThi.filter(r => d.mas.includes(String(r.ma || '')))
      if (rs.length > 0) {
        rs.forEach(r => daChon.add(r))
        ketQua.push({ tieuDe: d.tieuDe, rows: rs })
      }
    }
    const conLai = dsHienThi.filter(r => !daChon.has(r))
    if (conLai.length > 0) {
      ketQua.push({ tieuDe: ketQua.length ? 'Chỉ tiêu khác' : '', rows: conLai })
    }
    return ketQua.length > 0 ? ketQua : [{ tieuDe: '', rows: dsHienThi }]
  }, [dsHienThi, is1023])

  return (
    <div className={`m-bcd-khuon3${is1023 ? " m-bcd-1023" : ""}`}>
      {/* Dòng tổng 3 ô đầu danh sách */}
      {cacOTong.some(o => o.tonTai) && (
        <div className="m-so-dong-tong">
          {cacOTong.map((o, idx) => {
            const isAm = o.val < 0
            const soHienThi = isAm ? `−${rutGonSo(o.val)}` : rutGonSo(o.val)
            let mauO: string | undefined = undefined
            if (is1023) {
              if (idx === 0 || o.nhan.includes('doanh thu')) {
                mauO = 'var(--blue)'
              } else if (idx === 1 || o.nhan.includes('chi phí')) {
                mauO = 'var(--orange)'
              } else if (idx === 2 || o.nhan.includes('nhuận')) {
                mauO = isAm ? 'var(--red)' : 'var(--green)'
              }
            }
            return (
              <div key={idx} className="m-so-dong-tong-o">
                <span className="m-so-dong-tong-nhan">{o.nhan}</span>
                <b
                  className={`m-so-dong-tong-so m-so-dong-num ${!mauO && isAm ? 'm-so-dong-am' : ''}`}
                  style={mauO ? { color: mauO } : undefined}
                >
                  {soHienThi}
                </b>
              </div>
            )
          })}
        </div>
      )}

      {/* Danh sách chỉ tiêu dọc theo cấp */}
      {dsHienThi.length === 0 ? (
        <div className="m-so-dong-trong">
          {q.trim() ? 'Không tìm thấy chỉ tiêu phù hợp' : 'Không có dữ liệu trong kỳ'}
        </div>
      ) : (
        <div className="m-bcd-ct-danh-sach">
          {cacNhom.map((nhom, idxNhom) => (
            <div key={idxNhom} className="m-bcd-ct-the">
              {nhom.tieuDe && (
                <div className="m-bcd-ct-nhom-tieu">{nhom.tieuDe}</div>
              )}
              {!is1023 ? (
                nhom.rows.map((r, i) => {
                  const ten = layTen(r)
                  const ma = String(r.ma || '')
                  const isDam = Boolean(r._b || r._t)
                  const isNghieng = Boolean(r._i)
                  const vNay = laySoNay(r)
                  const vTruoc = laySoTruoc(r)
                  const isLoiNhuan = isDam && (ten.includes('Lợi nhuận') || ten.includes('Lãi') || ten.includes('Doanh thu'))
                  const lopMau = vNay < 0
                    ? 'm-so-dong-am'
                    : isLoiNhuan && vNay > 0
                    ? 'm-so-dong-duong'
                    : ''

                  return (
                    <div
                      key={i}
                      className={`m-bcd-ct-dong m-bcd-item ${isDam ? 'dam' : ''} ${isNghieng ? 'thut' : ''}`}
                    >
                      <div className="m-bcd-ct-trai">
                        {ma && <span className="m-bcd-ct-ma">{ma}</span>}
                        <span className="m-bcd-ct-ten">{ten}</span>
                      </div>
                      <div className="m-bcd-ct-phai">
                        <div className={`m-bcd-ct-so ${lopMau}`}>
                          {money(vNay)}
                        </div>
                        {vTruoc !== undefined && (
                          <div className="m-bcd-ct-truoc">
                            Kỳ trước: {money(vTruoc)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                (() => {
                  const cacMuc: { cha: Row; con: Row[]; khoa: string }[] = []
                  let mucHienTai: { cha: Row; con: Row[]; khoa: string } | null = null
                  for (const r of nhom.rows) {
                    if (r._con) {
                      if (mucHienTai) {
                        mucHienTai.con.push(r)
                      } else {
                        cacMuc.push({ cha: r, con: [], khoa: layTen(r) })
                      }
                    } else {
                      mucHienTai = { cha: r, con: [], khoa: layTen(r) }
                      cacMuc.push(mucHienTai)
                    }
                  }

                  return cacMuc.map((muc, i) => {
                    const { cha, con, khoa } = muc
                    const coCon = con.length > 0
                    const daBung = daMo.has(khoa) || Boolean(q.trim())

                    const ten = layTen(cha)
                    const ma = String(cha.ma || '')
                    const isDam = Boolean(cha._b || cha._t)
                    const isNghieng = Boolean(cha._i)
                    const vNay = laySoNay(cha)
                    const vTruoc = laySoTruoc(cha)

                    const mauKqkd = layMauSoKqkd(cha, vNay)
                    const isLoiNhuan = isDam && (ten.includes('Lợi nhuận') || ten.includes('Lãi') || ten.includes('Doanh thu'))
                    const lopMau = mauKqkd
                      ? ''
                      : vNay < 0
                      ? 'm-so-dong-am'
                      : isLoiNhuan && vNay > 0
                      ? 'm-so-dong-duong'
                      : ''

                    return (
                      <React.Fragment key={khoa || i}>
                        <div
                          className={`m-bcd-ct-dong m-bcd-item ${isDam ? 'dam' : ''} ${isNghieng ? 'thut' : ''} ${coCon ? 'm-bcd-ct-cha' : ''}`}
                          onClick={coCon ? () => toggleMo(khoa) : undefined}
                        >
                          <div className="m-bcd-ct-trai">
                            {coCon && (
                              <span className={`m-bcd-ct-mui-ten ${daBung ? 'bung' : ''}`}>›</span>
                            )}
                            {ma && <span className="m-bcd-ct-ma">{ma}</span>}
                            <span className="m-bcd-ct-ten">{ten}</span>
                          </div>
                          <div className="m-bcd-ct-phai">
                            <div
                              className={`m-bcd-ct-so ${lopMau}`}
                              style={mauKqkd ? { color: mauKqkd } : undefined}
                            >
                              {money(vNay)}
                            </div>
                            {vTruoc !== undefined && (
                              <div className="m-bcd-ct-truoc">
                                Kỳ trước: {money(vTruoc)}
                              </div>
                            )}
                          </div>
                        </div>

                        {coCon && daBung && con.map((c, cIdx) => {
                          const cTen = layTen(c)
                          const cMa = String(c.ma || '')
                          const cVNay = laySoNay(c)
                          const cVTruoc = laySoTruoc(c)
                          const cLopMau = cVNay < 0 ? 'm-so-dong-am' : ''
                          return (
                            <div
                              key={`${khoa}-con-${cIdx}`}
                              className="m-bcd-ct-dong m-bcd-item m-bcd-ct-con"
                            >
                              <div className="m-bcd-ct-trai">
                                {cMa && <span className="m-bcd-ct-ma">{cMa}</span>}
                                <span className="m-bcd-ct-ten">{cTen}</span>
                              </div>
                              <div className="m-bcd-ct-phai">
                                <div className={`m-bcd-ct-so ${cLopMau}`}>
                                  {money(cVNay)}
                                </div>
                                {cVTruoc !== undefined && (
                                  <div className="m-bcd-ct-truoc">
                                    Kỳ trước: {money(cVTruoc)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </React.Fragment>
                    )
                  })
                })()
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── COMPONENT ĐIỀU HƯỚNG 3 KHUÔN CHUNG ──
export const MBaoCaoDong: FC<Props> = ({ maBc, khuon, cols, rows, q = '', xemTatCaCn }) => {
  const { s } = useSession()
  const maNorm = (maBc || '').replace(/-/g, '.')
  const la427 = maNorm === '4.2.7' || maNorm.endsWith('.4.2.7') || maNorm.endsWith('/4.2.7')

  if (la427) {
    return <MBangKeMua rows={rows} q={q} />
  }

  if (s.cheDo === 'TT152' && laSoTT152(maBc)) {
    return <MSoTT152 maBc={maBc} rows={rows} q={q} />
  }

  switch (khuon) {
    case 'chi-tiet-ngay':
      return <Khuon1ChiTietNgay maBc={maBc} rows={rows} q={q} xemTatCaCn={xemTatCaCn} />
    case 'tong-hop-doi-tuong':
      return <Khuon2TongHopDoiTuong rows={rows} q={q} />
    case 'chi-tieu-phan-cap':
      return <Khuon3ChiTieuPhanCap maBc={maBc} rows={rows} q={q} />
    default:
      return null
  }
}
