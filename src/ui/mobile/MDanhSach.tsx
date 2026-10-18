import { useMemo, useState, type FC, type ReactNode } from 'react'
import { fold } from '../format'
import { Icon } from '../Icon'
import { MTrong, type KieuMTrong } from './MTrong'
import { MChon } from './MChon'

export interface ChipItem {
  k: string
  ten: string
  dem?: number
}

export interface MDanhSachProps<T> {
  rows: T[]
  the: (r: T, i: number) => ReactNode
  timTheo?: (r: T, q: string) => boolean
  timPlaceholder?: string
  tim?: string
  onTimChange?: (q: string) => void
  chips?: ChipItem[]
  chipChon?: string
  onChipChon?: (k: string) => void
  onMoLoc?: () => void
  coLoc?: boolean
  soLoc?: number
  khoangNgayHienThi?: string | null
  onMoChonNgay?: () => void
  onThem?: () => void
  nhanThem?: string
  hinhTrong?: string
  tieuDeTrong?: string
  moTaTrong?: string
  kieuTrong?: KieuMTrong
  tomTat?: ReactNode
  hangTabs?: ReactNode
  hangPhu?: ReactNode
  nhomTheo?: (r: T) => string
  tieuDeNhom?: (khoa: string, ds: T[]) => ReactNode
  kieuDanhMuc?: boolean
  nutTrai?: ReactNode
}

export function MDanhSach<T>({
  rows,
  the,
  timTheo,
  timPlaceholder = 'Số chứng từ, đối tượng...',
  tim,
  onTimChange,
  chips,
  chipChon,
  onChipChon,
  onMoLoc,
  coLoc,
  soLoc,
  khoangNgayHienThi = '16/09/2026 - 15/11/2026',
  onMoChonNgay,
  onThem,
  nhanThem = '+ Thêm mới',
  hinhTrong,
  tieuDeTrong,
  moTaTrong,
  kieuTrong = 'tim',
  tomTat,
  hangTabs,
  hangPhu,
  nhomTheo,
  tieuDeNhom,
  kieuDanhMuc = false,
  nutTrai,
}: MDanhSachProps<T>) {
  const [qLocal, setQLocal] = useState('')
  const q = tim !== undefined ? tim : qLocal
  const setQ = onTimChange ?? setQLocal

  const [timMo, setTimMo] = useState(false)
  const [sortTang, setSortTang] = useState(false)
  const [moChonTT, setMoChonTT] = useState(false)

  const filteredRows = useMemo(() => {
    let res = rows
    if (q.trim()) {
      if (timTheo) {
        res = res.filter(r => timTheo(r, q.trim()))
      } else {
        const qFold = fold(q.trim())
        res = res.filter(r => {
          const text = Object.values(r as Record<string, unknown>)
            .map(v => (v && typeof v === 'object' ? '' : String(v ?? '')))
            .join(' ')
          return fold(text).includes(qFold)
        })
      }
    }
    if (sortTang) {
      return [...res].reverse()
    }
    return res
  }, [rows, q, timTheo, sortTang])

  const nhoms = useMemo(() => {
    if (!nhomTheo) return null
    const res: { khoa: string; ds: T[] }[] = []
    let hienTai: { khoa: string; ds: T[] } | null = null
    for (const r of filteredRows) {
      const k = nhomTheo(r)
      if (!hienTai || hienTai.khoa !== k) {
        hienTai = { khoa: k, ds: [r] }
        res.push(hienTai)
      } else {
        hienTai.ds.push(r)
      }
    }
    return res
  }, [filteredRows, nhomTheo])

  // Lấy nhãn chip trạng thái đang chọn
  const chipHienTai = chips?.find(c => c.k === chipChon)
  const nhanStatus = chipHienTai
    ? `${chipHienTai.ten}${chipHienTai.dem !== undefined ? ` ${chipHienTai.dem}` : ''}`
    : `Tất cả ${filteredRows.length}`

  return (
    <div className="m-ds-khung">
      {/* Màn danh mục (T434): Hàng tabs và ô tìm kiếm cố định */}
      {kieuDanhMuc ? (
        <div className="m-dm-dau-khung">
          {hangTabs}
          {hangPhu}
          <div className="m-dm-o-tim">
            <Icon n="search" className="m-dm-tim-ic ic sm" />
            <input
              type="text"
              className="m-dm-tim-inp"
              placeholder={timPlaceholder || 'Nhập từ khoá'}
              value={q}
              onChange={e => setQ(e.target.value)}
              aria-label="Tìm kiếm"
            />
            {q ? (
              <button
                type="button"
                className="m-dm-tim-x"
                onClick={() => setQ('')}
                aria-label="Xoá tìm kiếm"
              >
                <Icon n="x" className="ic sm" />
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          {/* Hàng tabs nếu có */}
          {hangTabs}
          {hangPhu}

          {/* Hàng lọc: nút icon lọc vuông, ô khoảng ngày có mũi tên, nút trạng thái "Tất cả n" nền xanh */}
          <div className="m-ds-hang-loc">
            <button
              type="button"
              className={`m-ds-nut-loc-vuong${coLoc || (soLoc !== undefined && soLoc > 0) ? ' co-loc' : ''}`}
              onClick={onMoLoc}
              aria-label="Bộ lọc"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14" vectorEffect="non-scaling-stroke" /><line x1="4" y1="10" x2="4" y2="3" vectorEffect="non-scaling-stroke" />
                <line x1="12" y1="21" x2="12" y2="12" vectorEffect="non-scaling-stroke" /><line x1="12" y1="8" x2="12" y2="3" vectorEffect="non-scaling-stroke" />
                <line x1="20" y1="21" x2="20" y2="16" vectorEffect="non-scaling-stroke" /><line x1="20" y1="12" x2="20" y2="3" vectorEffect="non-scaling-stroke" />
                <line x1="1" y1="14" x2="7" y2="14" vectorEffect="non-scaling-stroke" /><line x1="9" y1="8" x2="15" y2="8" vectorEffect="non-scaling-stroke" /><line x1="17" y1="16" x2="23" y2="16" vectorEffect="non-scaling-stroke" />
              </svg>
              {soLoc !== undefined && soLoc > 0 ? (
                <span className="ds-nut-badge">{soLoc}</span>
              ) : (
                coLoc && <span className="m-ds-loc-cham" />
              )}
            </button>

            {/* Ô ngày tháng chỉ để hiển thị: bấm không mở gì, không mũi tên (T299) */}
            {khoangNgayHienThi && (
              <div className="m-ds-o-ngay" aria-label="Khoảng ngày hiển thị">
                <span className="m-ds-o-ngay-chu">{khoangNgayHienThi}</span>
              </div>
            )}

            {chips && chips.length > 0 ? (
              <button
                type="button"
                className="m-ds-nut-trang-thai"
                onClick={() => setMoChonTT(true)}
                aria-label="Chọn trạng thái"
              >
                {nhanStatus}
              </button>
            ) : (
              <div className="m-ds-nut-trang-thai">{`Tất cả ${filteredRows.length}`}</div>
            )}
          </div>

          {/* Dòng tóm tắt: bình thường hiển thị "n chứng từ", khi bấm tìm kiếm thì input thế chỗ trực tiếp trên dòng này (T353) */}
          <div className={`m-ds-dong-tom-tat${timMo ? ' dang-tim' : ''}`}>
            {timMo ? (
              <div className="m-ds-tim m-ds-tim-the-cho">
                <Icon n="search" className="m-ds-tim-ic ic sm" />
                <input
                  type="text"
                  autoFocus
                  className="m-ds-tim-inp"
                  placeholder={timPlaceholder}
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  aria-label="Tìm kiếm"
                />
                {q ? (
                  <button
                    type="button"
                    className="m-ds-tim-x"
                    onClick={() => setQ('')}
                    aria-label="Xoá tìm kiếm"
                  >
                    <Icon n="x" className="ic sm" />
                  </button>
                ) : null}
                <button
                  type="button"
                  className="m-ds-btn-dong-tim"
                  onClick={() => { setTimMo(false); setQ(''); }}
                  title="Đóng tìm kiếm"
                  aria-label="Đóng tìm kiếm"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <>
                <div className="m-ds-tt-chu">
                  {tomTat ?? `${filteredRows.length} chứng từ`}
                </div>
                <div className="m-ds-tt-nut">
                  <button
                    type="button"
                    className={`m-ds-btn-ic${sortTang ? ' on' : ''}`}
                    onClick={() => setSortTang(s => !s)}
                    title="Sắp xếp"
                    aria-label="Sắp xếp"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M6 12h12m-9 6h6" vectorEffect="non-scaling-stroke" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="m-ds-btn-ic"
                    onClick={() => setTimMo(true)}
                    title="Tìm kiếm"
                    aria-label="Tìm kiếm"
                  >
                    <Icon n="search" className="ic sm" />
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Danh sách thẻ */}
      {filteredRows.length === 0 ? (
        <MTrong
          kieu={kieuTrong}
          hinh={hinhTrong}
          tieuDe={tieuDeTrong}
          moTa={moTaTrong}
        />
      ) : nhoms ? (
        <div className="m-ds-danh-sach">
          {nhoms.map((nhom, idxNhom) => (
            <div key={`${idxNhom}-${nhom.khoa}`} className="m-ds-ngay-nhom">
              <div className="m-ds-ngay-tieu-de">
                {tieuDeNhom ? tieuDeNhom(nhom.khoa, nhom.ds) : <span>{nhom.khoa}</span>}
              </div>
              <div className="m-ds-ngay-the">
                {nhom.ds.map((r, i) => the(r, i))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="m-ds-danh-sach">
          {filteredRows.map((r, i) => the(r, i))}
        </div>
      )}

      {/* Nút nổi góc dưới trái (Đồng bộ FABi) */}
      {nutTrai}

      {/* Nút nổi thêm mới góc dưới phải, bo tròn, nằm trên thanh dưới */}
      {onThem && (
        <button
          type="button"
          className={`m-nut-them-fab${kieuDanhMuc ? ' m-nut-fab-tron' : ''}`}
          onClick={onThem}
          aria-label={nhanThem}
          title={nhanThem}
        >
          {kieuDanhMuc ? (
            <Icon n="plus" className="ic" />
          ) : (
            <>
              {!nhanThem.startsWith('+') && <Icon n="plus" className="ic sm" />}
              <span>{nhanThem}</span>
            </>
          )}
        </button>
      )}

      {/* Sheet chọn trạng thái nếu bấm nút trạng thái */}
      {chips && chips.length > 0 && (
        <MChon
          mo={moChonTT}
          onDong={() => setMoChonTT(false)}
          tieuDe="Chọn trạng thái"
          ds={chips.map(c => ({
            k: c.k,
            ten: `${c.ten}${c.dem !== undefined ? ` (${c.dem})` : ''}`,
          }))}
          chon={chipChon}
          onChon={k => {
            onChipChon?.(k)
            setMoChonTT(false)
          }}
        />
      )}
    </div>
  )
}
