import { useMemo, useState, type FC, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { docNgay } from '../ChonNgay'
import { money } from '../format'

const CAC_THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

export function dinhDangThuNgay(chuoiNgay: string): string {
  const d = docNgay(chuoiNgay)
  if (isNaN(d.getTime())) return chuoiNgay
  const thu = CAC_THU[d.getDay()]
  const ngay = String(d.getDate()).padStart(2, '0')
  const thang = String(d.getMonth() + 1).padStart(2, '0')
  const nam = d.getFullYear()
  return `${thu}, ${ngay}/${thang}/${nam}`
}

export function HangTabsBanHang({
  sc,
  onMoTheoDoi,
}: {
  sc: ScreenProps['sc']
  onMoTheoDoi?: () => void
}) {
  const nav = useNavigate()
  const is311 = sc.code === '3.1.1' || sc.slug === '3-1-1'
  const is317 = sc.code === '3.1.7' || sc.slug === '3-1-7'
  const is312 = sc.code === '3.1.2' || sc.slug === '3-1-2'
  const is313 = sc.code === '3.1.3' || sc.slug === '3-1-3'
  const is314 = sc.code === '3.1.4' || sc.slug === '3-1-4'
  const is315 = sc.code === '3.1.5' || sc.slug === '3-1-5'
  const is316 = sc.code === '3.1.6' || sc.slug === '3-1-6'

  return (
    <div className="m-tc-tabs" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={is311}
        className={`m-tc-tab-btn${is311 ? ' on' : ''}`}
        onClick={() => nav('/app/ban-hang/3-1-1')}
      >
        Xuất bán POS
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={is317}
        className={`m-tc-tab-btn${is317 ? ' on' : ''}`}
        onClick={() => nav('/app/ban-hang/3-1-7')}
      >
        Bán hàng
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={is312}
        className={`m-tc-tab-btn${is312 ? ' on' : ''}`}
        onClick={() => nav('/app/ban-hang/3-1-2')}
      >
        Hoá đơn bán hàng
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={is313}
        className={`m-tc-tab-btn${is313 ? ' on' : ''}`}
        onClick={() => nav('/app/ban-hang/3-1-3')}
      >
        Bán nội bộ
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={is314}
        className={`m-tc-tab-btn${is314 ? ' on' : ''}`}
        onClick={() => nav('/app/ban-hang/3-1-4')}
      >
        Hàng bán trả lại
      </button>
      {is315 && (
        <button
          type="button"
          role="tab"
          aria-selected={true}
          className="m-tc-tab-btn on"
        >
          Hoá đơn điện tử
        </button>
      )}
      {is316 && (
        <button
          type="button"
          role="tab"
          aria-selected={true}
          className="m-tc-tab-btn on"
        >
          Điều chỉnh hoá đơn
        </button>
      )}
      {onMoTheoDoi && (
        <button
          type="button"
          role="tab"
          aria-selected={false}
          className="m-tc-tab-btn"
          onClick={onMoTheoDoi}
        >
          Báo cáo theo dõi
        </button>
      )}
    </div>
  )
}

export interface MDsDongPhieuProps {
  so: string
  soDongHang?: number
  dongPhu?: string
  tien?: number
  hienTien?: boolean
  onClick: () => void
}

export function MDsDongPhieu({
  so,
  soDongHang = 0,
  dongPhu,
  tien = 0,
  hienTien = true,
  onClick,
}: MDsDongPhieuProps) {
  return (
    <button
      type="button"
      className="m-mh-dong-phieu m-the-ct m-ds-ngay-dong"
      onClick={onClick}
    >
      <div className="m-mh-dong-trai">
        <div className="m-mh-dong-hang1">
          <span className="m-mh-dong-so">{so}</span>
          {soDongHang > 0 && <span className="m-mh-dong-hh">{soDongHang} hàng hoá</span>}
        </div>
        {dongPhu && <span className="m-mh-dong-ncc" title={dongPhu}>{dongPhu}</span>}
      </div>
      {hienTien && <span className="m-mh-dong-tien">{money(Math.abs(tien))} đ</span>}
    </button>
  )
}

export interface MDsChungTuChuanProps {
  tieuDe: string
  hangTabs?: ReactNode
  onQuayLai?: () => void

  // Tìm kiếm
  tuKhoa?: string
  onTuKhoaChange?: (val: string) => void
  timPlaceholder?: string
  timTheo?: (r: Row, q: string) => boolean

  // Bộ lọc
  onMoLoc?: () => void
  coLoc?: boolean
  chipsLoc?: ReactNode[]

  // Thẻ tổng & khoảng ngày
  chuoiKhoangNgay?: string
  hienTien?: boolean

  // Dữ liệu dòng
  rows: Row[]
  renderDong: (r: Row, index: number) => ReactNode

  // Sắp xếp
  sortMoiNhat?: boolean
  onToggleSort?: () => void

  // FAB thêm mới
  onThem?: () => void
  nhanThem?: string

  // Thông báo trống
  thongBaoTrong?: string
}

export const MDsChungTuChuan: FC<MDsChungTuChuanProps> = ({
  tieuDe,
  hangTabs,
  onQuayLai,
  tuKhoa: tuKhoaProp,
  onTuKhoaChange,
  timPlaceholder = 'Tìm mã chứng từ, đối tượng, diễn giải...',
  timTheo,
  onMoLoc,
  coLoc = false,
  chipsLoc = [],
  chuoiKhoangNgay,
  hienTien = true,
  rows,
  renderDong,
  sortMoiNhat: sortMoiNhatProp,
  onToggleSort,
  onThem,
  nhanThem = 'Thêm mới',
  thongBaoTrong = 'Không có chứng từ nào phù hợp',
}) => {
  const [timMo, setTimMo] = useState(false)
  const [tuKhoaNoiBo, setTuKhoaNoiBo] = useState('')
  const [sortMoiNhatNoiBo, setSortMoiNhatNoiBo] = useState(true)

  const tuKhoa = tuKhoaProp !== undefined ? tuKhoaProp : tuKhoaNoiBo
  const sortMoiNhat = sortMoiNhatProp !== undefined ? sortMoiNhatProp : sortMoiNhatNoiBo

  const setTuKhoa = (val: string) => {
    if (onTuKhoaChange) {
      onTuKhoaChange(val)
    } else {
      setTuKhoaNoiBo(val)
    }
  }

  const toggleSort = () => {
    if (onToggleSort) {
      onToggleSort()
    } else {
      setSortMoiNhatNoiBo(v => !v)
    }
  }

  const listSauTim = useMemo(() => {
    if (!tuKhoa.trim()) return rows
    const q = tuKhoa.trim().toLowerCase()
    if (timTheo) {
      return rows.filter(r => timTheo(r, q))
    }
    return rows.filter(r => {
      const text = `${r.so ?? ''} ${r.doiTuong ?? ''} ${r.dienGiai ?? ''} ${r.cn ?? ''} ${r.tenHang ?? ''}`.toLowerCase()
      return text.includes(q)
    })
  }, [rows, tuKhoa, timTheo])

  const tongTien = useMemo(
    () => listSauTim.reduce((a, r) => a + (Number(r.tong) || Number(r.tien) || 0), 0),
    [listSauTim],
  )

  const nhomTheoNgay = useMemo(() => {
    const map = new Map<string, Row[]>()
    for (const r of listSauTim) {
      const ngayRaw = String(r.ngay ?? '').split(' ')[0]
      const cur = map.get(ngayRaw) ?? []
      cur.push(r)
      map.set(ngayRaw, cur)
    }
    const arr = Array.from(map.entries()).map(([ngayRaw, ds]) => {
      const tongNgay = ds.reduce((sum, r) => sum + (Number(r.tong) || Number(r.tien) || 0), 0)
      return {
        ngayRaw,
        tieuDeNgay: dinhDangThuNgay(ngayRaw),
        tongNgay,
        ds,
      }
    })
    arr.sort((a, b) => {
      const da = docNgay(a.ngayRaw).getTime()
      const db = docNgay(b.ngayRaw).getTime()
      return sortMoiNhat ? db - da : da - db
    })
    return arr
  }, [listSauTim, sortMoiNhat])

  return (
    <div className="m-tc-man m-ds-khung">
      {/* Header */}
      <header className="m-tc-header">
        <div className="m-tc-nav">
          {onQuayLai && (
            <button
              type="button"
              className="m-tc-btn-nav"
              onClick={onQuayLai}
              aria-label="Quay lại"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          <h1 className="m-tc-tieu-de">{tieuDe}</h1>
          <button
            type="button"
            className={`m-tc-btn-nav${timMo ? ' on' : ''}`}
            onClick={() => {
              setTimMo(v => !v)
              if (timMo) setTuKhoa('')
            }}
            aria-label="Tìm kiếm"
          >
            <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </button>
        </div>

        {/* Ô tìm kiếm khi mở */}
        {timMo && (
          <div className="m-tc-tim-wrap">
            <svg className="m-tc-tim-ic" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              autoFocus
              className="m-tc-tim-inp m-ds-tim-inp"
              placeholder={timPlaceholder}
              value={tuKhoa}
              onChange={e => setTuKhoa(e.target.value)}
              aria-label="Tìm kiếm chứng từ"
            />
            {tuKhoa && (
              <button
                type="button"
                className="m-tc-tim-x"
                onClick={() => setTuKhoa('')}
                aria-label="Xoá tìm kiếm"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {hangTabs}
      </header>

      <main className="m-tc-content">
        {/* Hàng bộ lọc */}
        <div className="m-tc-loc-bar">
          {onMoLoc && (
            <button
              type="button"
              className={`m-tc-btn-loc-vuong m-ds-nut-loc-vuong m-ds-nut-loc${coLoc ? ' co-loc' : ''}`}
              onClick={onMoLoc}
              aria-label="Bộ lọc nâng cao"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              {coLoc && <span className="m-tc-loc-cham" />}
            </button>
          )}

          {chipsLoc.map((chip, idx) =>
            typeof chip === 'string' ? (
              <span key={idx} className="m-chip-xem">{chip}</span>
            ) : (
              chip
            ),
          )}
        </div>

        {/* Thẻ tổng */}
        <div className="m-mh-card-tong">
          <div className="m-mh-th-trai">
            <span className="m-mh-th-dem">{listSauTim.length} chứng từ</span>
            {chuoiKhoangNgay && <span className="m-mh-th-ngay">{chuoiKhoangNgay}</span>}
          </div>
          {hienTien && (
            <div className="m-mh-th-phai">
              <span className="m-mh-th-nhan">Tổng cộng</span>
              <span className="m-mh-th-so">{money(tongTien)} đ</span>
            </div>
          )}
        </div>

        {/* Hàng Sắp xếp */}
        <div className="m-mh-hang-sx">
          <span className="m-mh-sx-tieu-de">Danh sách chứng từ</span>
          <button
            type="button"
            className="m-mh-sx-btn"
            onClick={toggleSort}
            aria-label="Sắp xếp chứng từ"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h10M4 18h5" />
            </svg>
            <span>{sortMoiNhat ? 'Mới nhất' : 'Cũ nhất'}</span>
          </button>
        </div>

        {/* Danh sách nhóm theo ngày */}
        {listSauTim.length === 0 ? (
          <div className="m-trong m-mh-trong m-tc-trong">
            <p>{thongBaoTrong}</p>
          </div>
        ) : (
          <div className="m-mh-ds-nhom">
            {nhomTheoNgay.map(nhom => (
              <div key={nhom.ngayRaw} className="m-mh-nhom-item">
                <div className="m-mh-nhom-header">
                  <span className="m-mh-nhom-ngay">{nhom.tieuDeNgay}</span>
                  {hienTien && <span className="m-mh-nhom-tong">{money(nhom.tongNgay)} đ</span>}
                </div>
                <div className="m-mh-the-trang">
                  {nhom.ds.map((r, i) => renderDong(r, i))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Nút thêm mới FAB */}
      {onThem && (
        <button
          type="button"
          className="m-tc-fab m-nut-them-fab m-ds-fab"
          onClick={onThem}
          aria-label="Thêm mới"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>{nhanThem}</span>
        </button>
      )}
    </div>
  )
}
