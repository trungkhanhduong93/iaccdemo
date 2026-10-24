import { useMemo, useState, type FC, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { coTrongGoi } from '../../app/plan'
import { useSession } from '../../app/session'
import { docNgay } from '../ChonNgay'
import { money, soLuong } from '../format'
import { KHACH } from '../../data/mock'

/** Lấy mã khách hàng, nếu là khách lẻ không mã thì ghi 'Khách lẻ' (T628) */
export function layMaKh(doiTuong?: unknown, kh?: unknown): string {
  const dt = String(kh || doiTuong || '').trim()
  if (!dt || dt === 'KL' || dt.toLowerCase().includes('khách lẻ') || dt.toLowerCase().includes('khach le')) {
    return 'Khách lẻ'
  }
  const timKh = KHACH.find(k => k.ma === dt || k.ten === dt)
  if (timKh) {
    return timKh.ma === 'KL' ? 'Khách lẻ' : timKh.ma
  }
  if (!dt.includes(' ') && dt.length <= 15) {
    return dt
  }
  return 'Khách lẻ'
}

function parseDateTimeTs(s?: unknown): number {
  if (!s || typeof s !== 'string') return 0
  const parts = s.trim().split(' ')
  const d = docNgay(parts[0]).getTime()
  if (isNaN(d)) return 0
  if (parts.length > 1 && parts[1].includes(':')) {
    const [hh, mm] = parts[1].split(':').map(Number)
    return d + (hh || 0) * 3600000 + (mm || 0) * 60000
  }
  return d
}


export function dinhDangThuNgay(chuoiNgay: string): string {
  const d = docNgay(chuoiNgay)
  if (isNaN(d.getTime())) return chuoiNgay
  const ngay = String(d.getDate()).padStart(2, '0')
  const thang = String(d.getMonth() + 1).padStart(2, '0')
  const nam = d.getFullYear()
  return `${ngay}/${thang}/${nam}`
}

export function HangTabsBanHang({
  sc,
  onMoTheoDoi,
}: {
  sc: ScreenProps['sc']
  onMoTheoDoi?: () => void
}) {
  const nav = useNavigate()
  const { s } = useSession()
  const is311 = sc.code === '3.1.1' || sc.slug === '3-1-1'
  const is317 = sc.code === '3.1.7' || sc.slug === '3-1-7'
  const is312 = sc.code === '3.1.2' || sc.slug === '3-1-2'
  const is313 = sc.code === '3.1.3' || sc.slug === '3-1-3'
  const is314 = sc.code === '3.1.4' || sc.slug === '3-1-4'
  const is315 = sc.code === '3.1.5' || sc.slug === '3-1-5'
  const is316 = sc.code === '3.1.6' || sc.slug === '3-1-6'

  return (
    <div className="m-tc-tabs" role="tablist">
      {/* Phiếu ngoài gói ẩn như web, gói Free chỉ còn Xuất bán POS (T622) */}
      {([['3.1.1', is311, 'Xuất bán POS'], ['3.1.7', is317, 'Bán hàng'], ['3.1.2', is312, 'Hoá đơn bán hàng'],
        ['3.1.3', is313, 'Bán nội bộ'], ['3.1.4', is314, 'Hàng bán trả lại']] as const)
        .filter(([ma]) => coTrongGoi(ma, s.goi))
        .map(([ma, on, nhan]) => (
          <button
            key={ma}
            type="button"
            role="tab"
            aria-selected={on}
            className={`m-tc-tab-btn${on ? ' on' : ''}`}
            onClick={() => nav(`/app/ban-hang/${ma.replace(/\./g, '-')}`)}
          >
            {nhan}
          </button>
        ))}
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
  tieuDe?: string
  soLuong?: number
  dvt?: string
}

export function MDsDongPhieu({
  so,
  soDongHang = 0,
  dongPhu,
  tien = 0,
  hienTien = true,
  onClick,
  tieuDe,
  soLuong: slProp,
  dvt,
}: MDsDongPhieuProps) {
  const coSl = slProp !== undefined
  return (
    <button
      type="button"
      className="m-mh-dong-phieu m-the-ct m-ds-ngay-dong"
      onClick={onClick}
    >
      <div className="m-mh-dong-trai">
        <div className="m-mh-dong-hang1">
          <span className="m-mh-dong-so">{tieuDe ?? so}</span>
          {soDongHang > 0 && <span className="m-mh-dong-hh">{soDongHang} hàng hoá</span>}
        </div>
        {dongPhu && <span className="m-mh-dong-ncc" title={dongPhu}>{dongPhu}</span>}
      </div>
      {coSl ? (
        <div className="m-the-hang-phai">
          <span className="m-the-hang-sl num">{soLuong(slProp)}{dvt ? ` ${dvt}` : ''}</span>
          {hienTien && <span className="m-mh-dong-tien">{money(Math.abs(tien))} đ</span>}
        </div>
      ) : (
        hienTien && <span className="m-mh-dong-tien">{money(Math.abs(tien))} đ</span>
      )}
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
  chuoiKhoangNgay?: string                 // không còn hiện ở thẻ tổng, hàng lọc đã ghi (T653)
  hienTien?: boolean
  nhanDem?: string                          // đơn vị đếm, mặc định chứng từ (T645)
  nhanTong?: string                         // nhãn số tổng, mặc định Tổng cộng (T645)
  theTongThem?: (rows: Row[]) => ReactNode  // hàng thêm dưới thẻ tổng, tính trên danh sách sau tìm (T645)

  // Dữ liệu dòng
  rows: Row[]
  renderDong: (r: Row, index: number) => ReactNode

  // Sắp xếp
  sortMoiNhat?: boolean
  onToggleSort?: () => void

  // Nhóm theo ngày (mặc định true, tắt nhóm ngày nếu false) (T625)
  nhomTheoNgay?: boolean

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
  hienTien = true,
  nhanDem = 'chứng từ',
  nhanTong = 'Tổng cộng',
  theTongThem,
  rows,
  renderDong,
  sortMoiNhat: sortMoiNhatProp,
  onToggleSort,
  nhomTheoNgay: coNhomTheoNgay = true,
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

  const listKhongNhom = useMemo(() => {
    if (coNhomTheoNgay) return []
    const arr = [...listSauTim]
    arr.sort((a, b) => {
      const timeA = parseDateTimeTs(a.ngay)
      const timeB = parseDateTimeTs(b.ngay)
      return sortMoiNhat ? timeB - timeA : timeA - timeB
    })
    return arr
  }, [listSauTim, sortMoiNhat, coNhomTheoNgay])

  const nhomTheoNgay = useMemo(() => {
    if (!coNhomTheoNgay) return []
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
  }, [listSauTim, sortMoiNhat, coNhomTheoNgay])

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
        <div className={`m-mh-card-tong${theTongThem ? ' m-mh-card-tong-them' : ''}`}>
          <div className="m-mh-th-trai">
            <span className="m-mh-th-dem">{listSauTim.length} {nhanDem}</span>
          </div>
          {hienTien && (
            <div className="m-mh-th-phai">
              <span className="m-mh-th-nhan">{nhanTong}</span>
              <span className="m-mh-th-so">{money(tongTien)} đ</span>
            </div>
          )}
          {theTongThem?.(listSauTim)}
        </div>

        {/* Hàng Sắp xếp */}
        <div className="m-mh-hang-sx">
          <span className="m-mh-sx-tieu-de">Danh sách {nhanDem}</span>
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
        ) : coNhomTheoNgay ? (
          <div className="m-mh-ds-nhom m-t653-ds">
            {nhomTheoNgay.map(nhom => (
              // Ngày nằm trong thẻ: đầu thẻ nền xám ghi ngày, tổng tiền hoặc số chứng từ (T653)
              <div key={nhom.ngayRaw} className="m-mh-nhom-item m-t653-ngay">
                <div className="m-mh-nhom-header m-t653-ngay-dau">
                  <span className="m-mh-nhom-ngay">{nhom.tieuDeNgay}</span>
                  {hienTien
                    ? <span className="m-mh-nhom-tong">{money(nhom.tongNgay)} đ</span>
                    : <span className="m-t653-ngay-dem">{nhom.ds.length} {nhanDem}</span>}
                </div>
                <div className="m-mh-the-trang">
                  {nhom.ds.map((r, i) => renderDong(r, i))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="m-mh-ds-nhom">
            <div className="m-mh-the-trang">
              {listKhongNhom.map((r, i) => renderDong(r, i))}
            </div>
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
