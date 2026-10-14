import { useMemo, useState, type ReactNode } from 'react'
import { fold } from '../format'
import { Icon } from '../Icon'
import { MTrong, type KieuMTrong } from './MTrong'

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
  onThem?: () => void
  nhanThem?: string
  hinhTrong?: string
  tieuDeTrong?: string
  moTaTrong?: string
  kieuTrong?: KieuMTrong
  tomTat?: ReactNode
  hangPhu?: ReactNode
  nhomTheo?: (r: T) => string
  tieuDeNhom?: (khoa: string, ds: T[]) => ReactNode
}

export function MDanhSach<T>({
  rows,
  the,
  timTheo,
  timPlaceholder = 'Tìm kiếm...',
  tim,
  onTimChange,
  chips,
  chipChon,
  onChipChon,
  onMoLoc,
  coLoc,
  onThem,
  nhanThem = 'Thêm mới',
  hinhTrong,
  tieuDeTrong,
  moTaTrong,
  kieuTrong = 'tim',
  tomTat,
  hangPhu,
  nhomTheo,
  tieuDeNhom,
}: MDanhSachProps<T>) {
  const [qLocal, setQLocal] = useState('')
  const q = tim !== undefined ? tim : qLocal
  const setQ = onTimChange ?? setQLocal

  const filteredRows = useMemo(() => {
    if (!q.trim()) return rows
    if (timTheo) {
      return rows.filter(r => timTheo(r, q.trim()))
    }
    const qFold = fold(q.trim())
    return rows.filter(r => {
      const text = Object.values(r as Record<string, unknown>)
        .map(v => (v && typeof v === 'object' ? '' : String(v ?? '')))
        .join(' ')
      return fold(text).includes(qFold)
    })
  }, [rows, q, timTheo])

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

  return (
    <div className="m-ds-khung">
      <div className="m-ds-dau">
        {hangPhu}
        <div className="m-ds-hang-tim">
          <div className="m-ds-tim">
            <Icon n="search" className="m-ds-tim-ic ic sm" />
            <input
              type="text"
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
          </div>
          {onMoLoc && (
            <button
              type="button"
              className="m-ds-nut-loc"
              onClick={onMoLoc}
              aria-label="Bộ lọc"
            >
              <Icon n="filter" className="ic sm" />
              {coLoc && <span className="m-ds-loc-cham" />}
            </button>
          )}
        </div>
        {chips && chips.length > 0 && (
          <div className="m-ds-chips">
            {chips.map(c => {
              const isChon = c.k === chipChon
              return (
                <button
                  key={c.k}
                  type="button"
                  className={`m-chip ${isChon ? 'on' : ''}`}
                  onClick={() => onChipChon?.(c.k)}
                >
                  <span>{c.ten}</span>
                  {c.dem !== undefined && <span className="m-chip-dem">({c.dem})</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {tomTat && <div className="m-ds-tom-tat">{tomTat}</div>}

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

      {onThem && (
        <button
          type="button"
          className="m-nut-them-fab"
          onClick={onThem}
          aria-label={nhanThem}
        >
          <Icon n="plus" className="ic sm" />
          <span>{nhanThem}</span>
        </button>
      )}
    </div>
  )
}
