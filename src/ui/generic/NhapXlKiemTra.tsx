import { useState, useMemo } from 'react'
import type { KetQuaKiem, DongKiem } from './nhapDmKieu'
import { OLoc, dangLoc, khopLoc, type LocCot, type GiaTriLoc, type KieuLoc } from '../LocCot'

export interface NhapXlKiemTraProps {
  kq: KetQuaKiem
  onTaiLoi: () => void
}

type TabKiem = 'tat' | 'moi' | 'sua' | 'loi'

const MAU_XU_LY: Record<string, { ten: string; mau: string }> = {
  moi: { ten: 'Thêm mới', mau: '#6b7280' },
  sua: { ten: 'Cập nhật', mau: '#0560a6' },
  loi: { ten: 'Bỏ qua', mau: '#c2362b' },
}

/** Bước 2 Kiểm tra dữ liệu, phần bên phải cột bước (T892, gói 4) */
export function NhapXlKiemTra({ kq, onTaiLoi }: NhapXlKiemTraProps) {
  const [tab, setTab] = useState<TabKiem>('tat')
  const [gtLoc, setGtLoc] = useState<Record<string, GiaTriLoc>>({})
  const [coTrang, setCoTrang] = useState<number>(100)
  const [trang, setTrang] = useState<number>(1)

  // Danh sách các tab và số đếm (T892)
  const tabs: { k: TabKiem; nhan: string; dem: number; mau: string }[] = [
    { k: 'tat', nhan: 'Tất cả', dem: kq.dem.tat, mau: '#64748b' },
    { k: 'moi', nhan: 'Thêm mới', dem: kq.dem.moi, mau: '#138a52' },
    { k: 'sua', nhan: 'Cập nhật', dem: kq.dem.sua, mau: '#0560a6' },
    { k: 'loi', nhan: 'Lỗi', dem: kq.dem.loi, mau: '#c2362b' },
  ]

  const chonTab = (k: TabKiem) => {
    setTab(k)
    setTrang(1)
  }

  // Cấu hình đối tượng lọc từng cột cho OLoc (T892)
  const kieuLocCua = (k: string): KieuLoc => {
    const c = kq.cot.find(x => x.k === k)
    if (c && (c.so || c.kieu === 'so' || c.kieu === 'tien')) return 'so'
    return 'chu'
  }

  const loc: LocCot = {
    gt: gtLoc,
    dat: (k, g) => {
      setGtLoc(t => ({ ...t, [k]: g }))
      setTrang(1)
    },
    kieu: c => kieuLocCua(c.k),
  }

  // Lọc theo tab trước (T892)
  const dongTab = useMemo(() => {
    if (tab === 'tat') return kq.dong
    return kq.dong.filter(d => d.xuLy === tab)
  }, [kq.dong, tab])

  // Lọc theo các điều kiện OLoc (T892)
  const dongLoc = useMemo(() => {
    return dongTab.filter(d => {
      for (const c of kq.cot) {
        const g = gtLoc[c.k]
        if (!dangLoc(g)) continue
        const kieu = kieuLocCua(c.k)
        const chu = d.chu?.[c.k] ?? (d.gt?.[c.k] != null ? String(d.gt[c.k]) : '')
        const so = typeof d.gt?.[c.k] === 'number' ? d.gt[c.k] : undefined
        if (!khopLoc(kieu, g, chu, so)) return false
      }
      const gLyDo = gtLoc['__lyDo']
      if (dangLoc(gLyDo)) {
        const chuLyDo = d.lyDo?.join('. ') || ''
        if (!khopLoc('chu', gLyDo, chuLyDo)) return false
      }
      return true
    })
  }, [dongTab, kq.cot, gtLoc])

  // Phân trang danh sách (T892)
  const tongTrang = Math.max(1, Math.ceil(dongLoc.length / coTrang))
  const trangHienTai = Math.min(trang, tongTrang)
  const dongHien = useMemo(() => {
    const batDau = (trangHienTai - 1) * coTrang
    return dongLoc.slice(batDau, batDau + coTrang)
  }, [dongLoc, trangHienTai, coTrang])

  const coLoi = kq.dem.loi > 0

  return (
    <div className="nxk-wrap">
      {/* Dòng cảnh báo và các tab (T892) */}
      <div className="nxk-top">
        {coLoi ? (
          <>
            <div className="nxk-canh-bao">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flex: 'none' }}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v6M12 16.5h.01" />
              </svg>
              <span className="nxk-canh-bao-txt">{kq.dem.loi} dòng lỗi sẽ bỏ qua, xem lý do ở cột cuối.</span>
            </div>
            <button type="button" className="nxk-btn-loi" onClick={onTaiLoi}>
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14" />
              </svg>
              Tải file lỗi
            </button>
          </>
        ) : (
          <div style={{ flex: 1 }} />
        )}
        <div role="tablist" aria-label="Lọc dòng" className="nxk-tabs">
          {tabs.map(t => (
            <button
              key={t.k}
              type="button"
              role="tab"
              className={`nxk-tab${tab === t.k ? ' on' : ''}`}
              aria-selected={tab === t.k}
              onClick={() => chonTab(t.k)}
            >
              {t.nhan}
              <span className="nxk-dem" style={{ background: t.mau }}>{t.dem}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bảng 2 tầng tiêu đề và hàng lọc (T892) */}
      <div className="nxk-tbl-wrap">
        <table className="nxk-tbl">
          <thead>
            <tr>
              <th rowSpan={2} style={{ textAlign: 'center' }}>Dòng</th>
              {kq.nhomCot && kq.nhomCot.length > 0 ? (
                kq.nhomCot.map((nhom, idx) => (
                  <th key={idx} colSpan={nhom.so} style={{ textAlign: 'center' }}>{nhom.ten}</th>
                ))
              ) : (
                <th colSpan={kq.cot.length} style={{ textAlign: 'center' }}>Dữ liệu</th>
              )}
              <th rowSpan={2} className="nxk-ld" style={{ borderRight: 0 }}>Lý do lỗi</th>
            </tr>
            <tr>
              {kq.cot.map(c => (
                <th key={c.k}>{c.nhanGoc || c.nhan}</th>
              ))}
            </tr>
            <tr className="loc-hang">
              <th />
              {kq.cot.map(c => (
                <th key={c.k}>
                  <OLoc c={{ k: c.k, t: c.nhanGoc || c.nhan }} loc={loc} />
                </th>
              ))}
              <th style={{ borderRight: 0 }}>
                <OLoc c={{ k: '__lyDo', t: 'Lý do lỗi' }} loc={loc} />
              </th>
            </tr>
          </thead>
          <tbody>
            {dongHien.map((d: DongKiem) => {
              const thongTin = MAU_XU_LY[d.xuLy] || MAU_XU_LY.moi
              const lyDoTxt = d.lyDo && d.lyDo.length > 0 ? d.lyDo.join('. ') : ''

              return (
                <tr key={d.dong}>
                  <td
                    title={thongTin.ten}
                    style={{
                      color: thongTin.mau,
                      fontWeight: 600,
                      textAlign: 'center',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {d.dong}
                  </td>
                  {kq.cot.map(c => {
                    const laLoi = Boolean(d.oLoi && d.oLoi.includes(c.k))
                    const laDoi = Boolean(!laLoi && d.xuLy === 'sua' && d.oDoi && d.oDoi.includes(c.k))
                    let val = d.chu?.[c.k] ?? (d.gt?.[c.k] != null ? String(d.gt[c.k]) : '')
                    if (laLoi && (!val || val.trim() === '')) {
                      val = '—'
                    }

                    const laMaSinh = Boolean(c.k === 'ma' && d.maSinh)
                    const tieuDe = laMaSinh ? 'Mã tự sinh' : val
                    const nen = laLoi ? '#fcebea' : laDoi ? '#eef5fb' : 'transparent'
                    const mau = laLoi ? '#c2362b' : laDoi ? '#0560a6' : '#363636'
                    const canPhai = Boolean(c.so || c.kieu === 'so' || c.kieu === 'tien')

                    return (
                      <td
                        key={c.k}
                        title={tieuDe}
                        style={{
                          background: nen,
                          color: mau,
                          textAlign: canPhai ? 'right' : undefined,
                          fontStyle: laMaSinh ? 'italic' : undefined,
                        }}
                      >
                        {val}
                      </td>
                    )
                  })}
                  <td
                    className="nxk-ld"
                    title={lyDoTxt}
                    style={{ color: '#c2362b', borderRight: 0 }}
                  >
                    {lyDoTxt}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Chân phân trang (T892) */}
      <div className="nxk-foot">
        <span>Mỗi trang</span>
        <select
          aria-label="Số dòng mỗi trang"
          value={coTrang}
          onChange={e => {
            setCoTrang(Number(e.target.value))
            setTrang(1)
          }}
        >
          <option value={100}>100</option>
          <option value={50}>50</option>
        </select>
        <span style={{ flex: 1 }}>{`Hiện ${dongHien.length} trong ${dongLoc.length} dòng`}</span>
        <div className="nxk-trang-nav">
          {tongTrang > 1 && (
            <button
              type="button"
              className="nxk-btn-trang"
              disabled={trangHienTai <= 1}
              onClick={() => setTrang(t => Math.max(1, t - 1))}
              title="Trang trước"
              aria-label="Trang trước"
            >
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          <span>{`Trang ${trangHienTai} / ${tongTrang}`}</span>
          {tongTrang > 1 && (
            <button
              type="button"
              className="nxk-btn-trang"
              disabled={trangHienTai >= tongTrang}
              onClick={() => setTrang(t => Math.min(tongTrang, t + 1))}
              title="Trang sau"
              aria-label="Trang sau"
            >
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
