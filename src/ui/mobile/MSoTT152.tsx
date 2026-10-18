// Sổ TT152 trên điện thoại dạng bảng dữ liệu (T406)
// Theo phần 2 của backup/mock-chot-T403-T406.html (Trum đã chốt)
import React, { useMemo, type FC } from 'react'
import { Link } from 'react-router-dom'
import type { Row } from '../../modules/types'
import { money, rutGonSo } from '../format'
import { duongPhieu, phieuTheoSo } from '../generic/SoChungTu'

const MA_SO_TT152 = new Set([
  '3.2.5', '10.4.1', '5.2.8', '2.2.7',
  's1a', 's2a', 's2b', 's2c', 's2d', 's2e',
  's1a-hkd', 's2a-hkd', 's2b-hkd', 's2c-hkd', 's2d-hkd', 's2e-hkd',
])

export function laSoTT152(maBc?: string): boolean {
  if (!maBc) return false
  const m = maBc.trim().toLowerCase().replace(/-/g, '.')
  return MA_SO_TT152.has(m) || /^s(1a|2[a-e])(\.hkd)?$/i.test(m) || /^s(1a|2[a-e])(-hkd)?$/i.test(maBc.trim().toLowerCase())
}

type LoaiSoTT152 = 's1a' | 's2a' | 's2b' | 's2c' | 's2d' | 's2e'

function doanLoaiSo(maBc: string, rows: Row[]): LoaiSoTT152 {
  const m = maBc.trim().toLowerCase().replace(/-/g, '.')
  if (m.includes('2.2.7') || m.includes('s2e')) return 's2e'
  if (m.includes('5.2.8') || m.includes('s2d')) return 's2d'
  if (m.includes('10.4.1') || m.includes('s2c')) return 's2c'
  if (m.includes('s1a')) return 's1a'
  if (m.includes('s2a')) return 's2a'
  if (m.includes('s2b')) return 's2b'

  if (rows.some(r => 'slNhap' in r || 'slTon' in r || 'ttNhap' in r || 'ttTon' in r)) return 's2d'
  if (rows.some(r => 'thu' in r || 'chi' in r)) return 's2e'
  if (rows.some(r => typeof r.dienGiai === 'string' && (r.dienGiai.includes('Chi phí hợp lý') || r.dienGiai.includes('Chênh lệch')))) return 's2c'
  if (rows.some(r => typeof r.dienGiai === 'string' && r.dienGiai.includes('Thuế TNCN'))) return 's2a'
  if (rows.some(r => r.so && r.nganh !== undefined)) return 's2b'
  if (rows.every(r => !r.so)) return 's1a'

  return 's2b'
}

function ngayNgan(ngay?: string): string {
  if (!ngay) return ''
  return ngay.replace(/\/\d{4}$/, '')
}

export const MSoTT152: FC<{ maBc: string; rows: Row[]; q?: string }> = ({ maBc, rows, q = '' }) => {
  const loaiSo = useMemo(() => doanLoaiSo(maBc, rows), [maBc, rows])
  const qStr = q.trim().toLowerCase()

  if (loaiSo === 's2d') {
    return <BangS2d rows={rows} qStr={qStr} />
  }

  if (loaiSo === 's2e') {
    return <BangS2e rows={rows} qStr={qStr} />
  }

  return <BangDoanhThu loaiSo={loaiSo} rows={rows} qStr={qStr} />
}

// ── SỔ S2d-HKD: CHI TIẾT HÀNG HOÁ ──
function BangS2d({ rows, qStr }: { rows: Row[]; qStr: string }) {
  const rowDau = rows.find(r => typeof r.dienGiai === 'string' && r.dienGiai.includes('đầu kỳ'))
  const slTonDau = Number(rowDau?.slTon ?? 0)
  const ttTonDau = Number(rowDau?.ttTon ?? 0)
  const dvt = String(rowDau?.dvt ?? rows.find(r => r.dvt)?.dvt ?? 'kg')

  const dataRows = useMemo(() => {
    return rows.filter(r => {
      if (!r.so) return false
      if (!qStr) return true
      const soStr = String(r.so ?? '').toLowerCase()
      const phieuSo = (phieuTheoSo(r.so)?.so ?? '').toLowerCase()
      const dg = String(r.dienGiai ?? '').toLowerCase()
      const ng = String(r.ngay ?? '').toLowerCase()
      return soStr.includes(qStr) || phieuSo.includes(qStr) || dg.includes(qStr) || ng.includes(qStr)
    })
  }, [rows, qStr])

  const { tongSlNhap, tongTtNhap, tongSlXuat, tongTtXuat, slTonCuoi, ttTonCuoi, gia } = useMemo(() => {
    let nhapSl = 0, nhapTt = 0, xuatSl = 0, xuatTt = 0
    for (const r of dataRows) {
      nhapSl += Number(r.slNhap ?? 0)
      nhapTt += Number(r.ttNhap ?? 0)
      xuatSl += Number(r.slXuat ?? 0)
      xuatTt += Number(r.ttXuat ?? 0)
    }
    const cuoiSl = slTonDau + nhapSl - xuatSl
    const cuoiTt = ttTonDau + nhapTt - xuatTt
    const g = Number(rows.find(r => r.gia)?.gia ?? (nhapSl > 0 ? Math.round(nhapTt / nhapSl) : 0))
    return {
      tongSlNhap: nhapSl,
      tongTtNhap: nhapTt,
      tongSlXuat: xuatSl,
      tongTtXuat: xuatTt,
      slTonCuoi: cuoiSl,
      ttTonCuoi: cuoiTt,
      gia: g,
    }
  }, [dataRows, slTonDau, ttTonDau, rows])

  return (
    <div className="m-so-tt152">
      <div className="tom">
        <div>
          <small>Tồn đầu</small>
          <b className="num">{slTonDau} · {money(ttTonDau)}</b>
        </div>
        <div>
          <small>Nhập / Xuất</small>
          <b className="num">
            <span className="vao">+{tongSlNhap}</span> / <span className="ra">-{tongSlXuat}</span>
          </b>
        </div>
        <div>
          <small>Tồn cuối</small>
          <b className="num">{slTonCuoi} · {money(ttTonCuoi)}</b>
        </div>
      </div>

      <div className="bang">
        <table className="m-so-cot-4">
          <thead>
            <tr>
              <th>Chứng từ</th>
              <th className="r">Nhập</th>
              <th className="r">Xuất</th>
              <th className="r">Tồn</th>
            </tr>
          </thead>
          <tbody>
            <tr className="du">
              <td>Tồn đầu kỳ</td>
              <td></td>
              <td></td>
              <td className="r num"><s>{slTonDau}</s>{money(ttTonDau)}</td>
            </tr>

            {dataRows.map((r, i) => {
              const to = duongPhieu(r.so)
              const soHien = phieuTheoSo(r.so)?.so ?? r.so
              const coNhap = Number(r.slNhap ?? 0) > 0 || Number(r.ttNhap ?? 0) > 0
              const coXuat = Number(r.slXuat ?? 0) > 0 || Number(r.ttXuat ?? 0) > 0
              return (
                <tr key={i}>
                  <td>
                    {to ? (
                      <Link to={to} onClick={e => e.stopPropagation()}>
                        {soHien}
                      </Link>
                    ) : (
                      <span className="m-so-so-khong-link">{soHien}</span>
                    )}
                    <i>{ngayNgan(r.ngay)}{r.dienGiai ? ` · ${r.dienGiai}` : ''}</i>
                  </td>
                  <td className="r num vao">
                    {coNhap ? (
                      <>
                        <s>{r.slNhap}</s>{money(r.ttNhap)}
                      </>
                    ) : null}
                  </td>
                  <td className="r num ra">
                    {coXuat ? (
                      <>
                        <s>{r.slXuat}</s>{money(r.ttXuat)}
                      </>
                    ) : null}
                  </td>
                  <td className="r num">
                    <s>{r.slTon}</s>{money(r.ttTon)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>Cộng kỳ</td>
              <td className="r num"><s>{tongSlNhap}</s>{money(tongTtNhap)}</td>
              <td className="r num"><s>{tongSlXuat}</s>{money(tongTtXuat)}</td>
              <td className="r num"><s>{slTonCuoi}</s>{money(ttTonCuoi)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="ghi-bang">
        Mỗi ô: số lượng (dòng trên{dvt ? `, ${dvt}` : ''}) và thành tiền.{gia > 0 ? ` Đơn giá ${money(gia)}/${dvt}.` : ''}
      </p>
    </div>
  )
}

// ── SỔ S2e-HKD: CHI TIẾT TIỀN ──
function BangS2e({ rows, qStr }: { rows: Row[]; qStr: string }) {
  const rowDau = rows.find(r => typeof r.dienGiai === 'string' && r.dienGiai.includes('đầu kỳ'))
  const tonDau = Number(rowDau?.thu ?? 0)

  const dataRows = useMemo(() => {
    return rows.filter(r => {
      if (!r.so) return false
      if (!qStr) return true
      const soStr = String(r.so ?? '').toLowerCase()
      const phieuSo = (phieuTheoSo(r.so)?.so ?? '').toLowerCase()
      const dg = String(r.dienGiai ?? '').toLowerCase()
      const ng = String(r.ngay ?? '').toLowerCase()
      return soStr.includes(qStr) || phieuSo.includes(qStr) || dg.includes(qStr) || ng.includes(qStr)
    })
  }, [rows, qStr])

  const { tongThu, tongChi, tonCuoi } = useMemo(() => {
    let thu = 0, chi = 0
    for (const r of dataRows) {
      thu += Number(r.thu ?? 0)
      chi += Number(r.chi ?? 0)
    }
    return {
      tongThu: thu,
      tongChi: chi,
      tonCuoi: tonDau + thu - chi,
    }
  }, [dataRows, tonDau])

  let runningTon = tonDau

  return (
    <div className="m-so-tt152">
      <div className="tom">
        <div>
          <small>Tồn đầu</small>
          <b className="num">{money(tonDau)}</b>
        </div>
        <div>
          <small>Thu / Chi</small>
          <b className="num">
            <span className="vao">{rutGonSo(tongThu)}</span> / <span className="ra">{rutGonSo(tongChi)}</span>
          </b>
        </div>
        <div>
          <small>Tồn cuối</small>
          <b className="num">{money(tonCuoi)}</b>
        </div>
      </div>

      <div className="bang">
        <table className="m-so-cot-4">
          <thead>
            <tr>
              <th>Chứng từ</th>
              <th className="r">Thu</th>
              <th className="r">Chi</th>
              <th className="r">Tồn</th>
            </tr>
          </thead>
          <tbody>
            <tr className="du">
              <td>Tồn đầu kỳ</td>
              <td></td>
              <td></td>
              <td className="r num">{money(tonDau)}</td>
            </tr>

            {dataRows.map((r, i) => {
              const thu = Number(r.thu ?? 0)
              const chi = Number(r.chi ?? 0)
              runningTon = runningTon + thu - chi
              const to = duongPhieu(r.so)
              const soHien = phieuTheoSo(r.so)?.so ?? r.so

              return (
                <tr key={i}>
                  <td>
                    {to ? (
                      <Link to={to} onClick={e => e.stopPropagation()}>
                        {soHien}
                      </Link>
                    ) : (
                      <span className="m-so-so-khong-link">{soHien}</span>
                    )}
                    <i>{ngayNgan(r.ngay)}{r.dienGiai ? ` · ${r.dienGiai}` : ''}</i>
                  </td>
                  <td className="r num vao">{thu > 0 ? money(thu) : ''}</td>
                  <td className="r num ra">{chi > 0 ? money(chi) : ''}</td>
                  <td className="r num">{money(runningTon)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>Cộng kỳ</td>
              <td className="r num">{money(tongThu)}</td>
              <td className="r num">{money(tongChi)}</td>
              <td className="r num">{money(tonCuoi)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ── SỔ DOANH THU & CHI PHÍ: S1a, S2a, S2b, S2c ──
function BangDoanhThu({ loaiSo, rows, qStr }: { loaiSo: LoaiSoTT152; rows: Row[]; qStr: string }) {
  // Lọc dòng theo q
  const rowsLoc = useMemo(() => {
    if (!qStr) return rows
    return rows.filter(r => {
      if (r._nhom || r._t) return true
      const soStr = String(r.so ?? '').toLowerCase()
      const phieuSo = (phieuTheoSo(r.so)?.so ?? '').toLowerCase()
      const dg = String(r.dienGiai ?? '').toLowerCase()
      const ng = String(r.ngay ?? '').toLowerCase()
      return soStr.includes(qStr) || phieuSo.includes(qStr) || dg.includes(qStr) || ng.includes(qStr)
    })
  }, [rows, qStr])

  // Tính 3 ô tóm tắt
  const { tongTien, soNgay, soDong, rowCuoi } = useMemo(() => {
    let t = 0
    const ngSet = new Set<string>()
    let dongCount = 0

    for (const r of rowsLoc) {
      if (r._nhom || r._b || r._t) continue
      if (r.tien) t += Number(r.tien)
      if (r.ngay) ngSet.add(r.ngay)
      dongCount++
    }

    // Nếu là S1a mà không có dòng thường riêng thì lấy tổng cộng
    if (t === 0) {
      const rTong = rowsLoc.find(r => r._t || (typeof r.dienGiai === 'string' && r.dienGiai.includes('Tổng cộng')))
      if (rTong?.tien) t = Number(rTong.tien)
    }

    const cuoi = rowsLoc.filter(r => Boolean(r._t))
    return {
      tongTien: t,
      soNgay: ngSet.size || 30,
      soDong: dongCount || rowsLoc.length,
      rowCuoi: cuoi,
    }
  }, [rowsLoc])

  return (
    <div className="m-so-tt152">
      <div className="tom">
        <div>
          <small>{loaiSo === 's2c' ? 'Tổng doanh thu' : 'Tổng doanh thu'}</small>
          <b className="num">{money(tongTien)}</b>
        </div>
        <div>
          <small>Số ngày</small>
          <b className="num">{soNgay}</b>
        </div>
        <div>
          <small>Số dòng</small>
          <b className="num">{soDong}</b>
        </div>
      </div>

      <div className="bang">
        <table>
          <thead>
            <tr>
              <th>Chứng từ</th>
              <th>Diễn giải</th>
              <th className="r">Số tiền</th>
            </tr>
          </thead>
          <tbody>
            {rowsLoc.map((r, i) => {
              if (r._t) return null // Đưa xuống tfoot

              if (r._nhom) {
                return (
                  <tr key={i} className="nhom-dong">
                    <td colSpan={3}>{r.dienGiai}</td>
                  </tr>
                )
              }

              if (r._b && !r.so) {
                return (
                  <tr key={i} className="du">
                    <td colSpan={2}>{r.dienGiai}</td>
                    <td className="r num">{r.tien ? money(r.tien) : ''}</td>
                  </tr>
                )
              }

              const to = duongPhieu(r.so)
              const soHien = phieuTheoSo(r.so)?.so ?? r.so

              return (
                <tr key={i}>
                  <td>
                    {r.so ? (
                      to ? (
                        <Link to={to} onClick={e => e.stopPropagation()}>
                          {soHien}
                        </Link>
                      ) : (
                        <span className="m-so-so-khong-link">{soHien}</span>
                      )
                    ) : null}
                    {r.ngay && <i>{ngayNgan(r.ngay)}</i>}
                  </td>
                  <td>{r.dienGiai}</td>
                  <td className="r num">{r.tien ? money(r.tien) : ''}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>Tổng cộng</td>
              <td className="r num">{money(tongTien)}</td>
            </tr>
            {rowCuoi.map((r, i) => (
              <tr key={`t-${i}`}>
                <td colSpan={2}>{r.dienGiai}</td>
                <td className="r num">{r.tien ? money(r.tien) : ''}</td>
              </tr>
            ))}
          </tfoot>
        </table>
      </div>
    </div>
  )
}
