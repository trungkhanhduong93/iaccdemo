// 3 khuôn báo cáo dạng dòng kiểu app trên điện thoại (T241):
// Khuôn 1: Chi tiết theo ngày (nhóm ngày, mã phiếu, diễn giải, số tiền xanh/đỏ, SL/ĐVT)
// Khuôn 2: Tổng hợp theo đối tượng (thẻ 2 tầng: tên + số cuối; tầng 2: 3 ô Đầu kỳ | Tăng | Giảm)
// Khuôn 3: Chỉ tiêu phân cấp (danh sách dọc thụt lề theo cấp, đậm chỉ tiêu tổng, số kỳ này và kỳ trước)
import React, { useMemo, type FC } from 'react'
import { Link } from 'react-router-dom'
import type { Col, Row } from '../../modules/types'
import { money, rutGonSo } from '../format'
import { duongPhieu } from '../generic/SoChungTu'

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
  // 10.2.3: Doanh thu thuần, Lợi nhuận gộp, Lợi nhuận trước thuế
  '10.2.3': [
    {
      nhan: 'Doanh thu thuần',
      khop: r => {
        const t = String(r.ct || r.chiTieu || r.ten || r.dg || '')
        return t.includes('Doanh thu')
      },
    },
    {
      nhan: 'LN gộp',
      khop: r => {
        const t = String(r.ct || r.chiTieu || r.ten || r.dg || '')
        return t.includes('Lãi gộp') || t.includes('Lợi nhuận gộp')
      },
    },
    {
      nhan: 'LN trước thuế',
      khop: r => {
        const t = String(r.ct || r.chiTieu || r.ten || r.dg || '')
        return t.includes('trước thuế')
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
const Khuon1ChiTietNgay: FC<{ rows: Row[]; q?: string; xemTatCaCn?: boolean }> = ({ rows, q = '', xemTatCaCn }) => {
  // Tìm dòng tổng nếu có
  const rDau = rows.find(r => r._b === 1 || String(r.dg || r.dienGiai || '').toLowerCase().includes('đầu kỳ'))
  const rTong = rows.find(r => r._t === 1)

  // Gom các dòng phát sinh
  const dsPhatSinh = useMemo(() => {
    return rows.filter(r => !r._b && !r._t)
  }, [rows])

  // Gom theo ngày kèm tính tổng tiền của ngày (T343)
  const dsNhomNgay = useMemo(() => {
    const map = new Map<string, { ngay: string; ds: Row[]; tongTien: number }>()
    for (const r of dsPhatSinh) {
      const ngay = String(r.ngay || r.date || r.ngayCt || '') || 'Giao dịch trong kỳ'
      const tienDong = Number(r.tien ?? r.thanhTien ?? r.dtThuan ?? r.tong ?? r.tienHang ?? ((Number(r.no) || 0) + (Number(r.co) || 0)))   // cùng thứ tự cột tiền của dòng bên dưới
      const nhom = map.get(ngay)
      if (nhom) {
        nhom.ds.push(r)
        nhom.tongTien += tienDong
      } else {
        map.set(ngay, { ngay, ds: [r], tongTien: tienDong })
      }
    }
    return Array.from(map.values())
  }, [dsPhatSinh])

  return (
    <div className="m-bcd-khuon1">
      {/* Dòng tổng 3 ô đầu danh sách */}
      {rTong && (
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
              <span className="m-so-dong-ngay-ton m-so-dong-num">{money(nhom.tongTien)}</span>
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

  return (
    <div className="m-bcd-khuon2">
      {/* Dòng tổng 3 ô đầu danh sách */}
      {rTong && (
        <div className="m-so-dong-tong">
          <div className="m-so-dong-tong-o">
            <span className="m-so-dong-tong-nhan">
              {rTong.dau !== undefined || rTong.gt0 !== undefined ? 'Đầu kỳ' : 'Số đối tượng'}
            </span>
            <b className="m-so-dong-tong-so m-so-dong-num">
              {rTong.dau !== undefined || rTong.gt0 !== undefined
                ? rutGonSo(Number(rTong.dau ?? rTong.gt0 ?? 0))
                : `${dsDoiTuong.length}`}
            </b>
          </div>
          <div className="m-so-dong-tong-o">
            <span className="m-so-dong-tong-nhan">
              {rTong.thu !== undefined || rTong.gtn !== undefined || rTong.psNo !== undefined
                ? 'Tăng / Nhập'
                : 'Tiền hàng / PS'}
            </span>
            <b className="m-so-dong-tong-so m-so-dong-num">
              {rutGonSo(Number(rTong.thu ?? rTong.gtn ?? rTong.psNo ?? rTong.tienHang ?? rTong.ps ?? 0))}
            </b>
          </div>
          <div className="m-so-dong-tong-o">
            <span className="m-so-dong-tong-nhan">
              {rTong.cuoi !== undefined || rTong.gt1 !== undefined
                ? 'Cuối kỳ'
                : 'Tổng cộng'}
            </span>
            <b className="m-so-dong-tong-so m-so-dong-num">
              {rutGonSo(Number(rTong.cuoi ?? rTong.gt1 ?? rTong.tong ?? rTong.tien ?? rTong.dtThuan ?? 0))}
            </b>
          </div>
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

            return (
              <div key={r.ma || i} className="m-bcd-the m-bcd-item">
                {/* Tầng 1: Tên đối tượng và số cuối */}
                <div className="m-bcd-the-t1">
                  <div className="m-bcd-the-trai">
                    <div className="m-bcd-the-ten">{ten}</div>
                    {ma && <div className="m-bcd-the-ma">{ma}{r.dvt ? ` · ${r.dvt}` : ''}</div>}
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

  return (
    <div className="m-bcd-khuon3">
      {/* Dòng tổng 3 ô đầu danh sách */}
      {cacOTong.some(o => o.tonTai) && (
        <div className="m-so-dong-tong">
          {cacOTong.map((o, idx) => {
            const isAm = o.val < 0
            const soHienThi = isAm ? `−${rutGonSo(o.val)}` : rutGonSo(o.val)
            return (
              <div key={idx} className="m-so-dong-tong-o">
                <span className="m-so-dong-tong-nhan">{o.nhan}</span>
                <b className={`m-so-dong-tong-so m-so-dong-num ${isAm ? 'm-so-dong-am' : ''}`}>
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
        <div className="m-bcd-ct-ds">
          {dsHienThi.map((r, i) => {
            const ten = layTen(r)
            const ma = String(r.ma || '')
            const isDam = Boolean(r._b || r._t)
            const isNghieng = Boolean(r._i)
            const vNay = laySoNay(r)
            const vTruoc = laySoTruoc(r)

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
                  <div className={`m-bcd-ct-so ${vNay < 0 ? 'm-so-dong-am' : ''}`}>
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
          })}
        </div>
      )}
    </div>
  )
}

// ── COMPONENT ĐIỀU HƯỚNG 3 KHUÔN CHUNG ──
export const MBaoCaoDong: FC<Props> = ({ maBc, khuon, cols, rows, q = '', xemTatCaCn }) => {
  switch (khuon) {
    case 'chi-tiet-ngay':
      return <Khuon1ChiTietNgay rows={rows} q={q} xemTatCaCn={xemTatCaCn} />
    case 'tong-hop-doi-tuong':
      return <Khuon2TongHopDoiTuong rows={rows} q={q} />
    case 'chi-tieu-phan-cap':
      return <Khuon3ChiTieuPhanCap maBc={maBc} rows={rows} q={q} />
    default:
      return null
  }
}
