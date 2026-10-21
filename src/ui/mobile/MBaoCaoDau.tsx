import { useState, type FC, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ModuleDef, ScreenDef } from '../../modules/types'
import { useSession } from '../../app/session'
import { tenBC } from '../../modules/bao-cao/danh-sach'
import { tenMan } from '../../app/registry'
import { Icon } from '../Icon'

export interface MBaoCaoDauProps {
  sc: ScreenDef
  mod?: ModuleDef
  hienTim: boolean
  onToggleTim: () => void
  q: string
  onDoiQ: (val: string) => void
  timPlaceholder?: string
  soLuongLoc: number
  onMoLoc: () => void
  tenKy: string
  tenCn?: string
  chipsKhac?: { k?: string; nhan?: string; giaTri: string }[]
  extraRight?: ReactNode
  onBack?: () => void
}

/** Đầu trang báo cáo điện thoại dùng chung (T529): header .m-sq-header và hàng lọc .m-tc-loc-bar.m-t500-chip-hang */
export const MBaoCaoDau: FC<MBaoCaoDauProps> = ({
  sc,
  mod,
  hienTim,
  onToggleTim,
  q,
  onDoiQ,
  timPlaceholder,
  soLuongLoc,
  onMoLoc,
  tenKy,
  tenCn,
  chipsKhac,
  extraRight,
  onBack,
}) => {
  const nav = useNavigate()
  const { s } = useSession()

  const [daGhim, setDaGhim] = useState(() => {
    try {
      const g = JSON.parse(localStorage.getItem('bc-ghim') || '[]')
      return Array.isArray(g) && g.includes(sc.slug)
    } catch {
      return false
    }
  })

  const toggleGhim = () => {
    try {
      const raw = localStorage.getItem('bc-ghim')
      const g: string[] = raw ? JSON.parse(raw) : []
      const exists = g.includes(sc.slug)
      const moi = exists ? g.filter(x => x !== sc.slug) : [...g, sc.slug]
      localStorage.setItem('bc-ghim', JSON.stringify(moi))
      setDaGhim(!exists)
    } catch {
      // Bỏ qua lỗi localStorage
    }
  }

  const quayLai = () => {
    if (onBack) {
      onBack()
      return
    }
    if (window.history.state && window.history.state.idx > 0) {
      nav(-1)
    } else {
      nav('/app/bao-cao/tat-ca', { replace: true })
    }
  }

  const isSoQuy = sc.code === '2.2.1' || sc.slug === '2-2-1'
  const isSoTienGui = sc.code === '2.2.3' || sc.slug === '2-2-3'
  const tieuDe = isSoQuy ? 'Sổ quỹ tiền mặt' : isSoTienGui ? 'Sổ ngân hàng' : (tenBC(sc.code, s.cheDo, s) || tenMan(sc))
  const maBc = sc.code ?? (sc.slug?.includes('-') ? sc.slug.replace(/-/g, '.') : sc.slug)
  const tenPhanHe = mod?.ngan || mod?.ten || 'Báo cáo'

  return (
    <div className="m-t500-dau-dinh">
      <header className="m-sq-header">
        <button
          type="button"
          className="m-sq-back"
          onClick={quayLai}
          aria-label="Quay lại"
        >
          <Icon n="chevl" className="ic" />
        </button>
        <div className="m-sq-tieu-de-wrap">
          <h1 className="m-sq-tieu-de">{tieuDe}</h1>
          <div className="m-sq-phu">Báo cáo · {tenPhanHe} · {maBc}</div>
        </div>
        <div className="m-sq-tac-vu">
          <button
            type="button"
            className={`m-sq-btn-ic${hienTim ? ' on' : ''}`}
            onClick={onToggleTim}
            aria-label="Tìm kiếm"
          >
            <Icon n="search" className="ic sm" />
          </button>
          <button
            type="button"
            className={`m-sq-btn-ic${daGhim ? ' active' : ''}`}
            onClick={toggleGhim}
            aria-label="Ghim báo cáo"
          >
            <Icon n={daGhim ? 'star-fill' : 'star'} className="ic sm" />
          </button>
        </div>
      </header>

      {hienTim && (
        <div className="m-sq-tim-hang">
          <div className="m-ds-tim">
            <Icon n="search" className="m-ds-tim-ic ic sm" />
            <input
              type="text"
              className="m-ds-tim-inp"
              placeholder={timPlaceholder || 'Nhập diễn giải, số chứng từ…'}
              value={q}
              onChange={e => onDoiQ(e.target.value)}
              aria-label="Tìm kiếm phát sinh"
              autoFocus
            />
            {q && (
              <button
                type="button"
                className="m-ds-tim-x"
                onClick={() => onDoiQ('')}
                aria-label="Xoá tìm kiếm"
              >
                <Icon n="x" className="ic sm" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="m-tc-loc-bar m-t500-chip-hang">
        <button
          type="button"
          className={`m-tc-btn-loc-vuong m-ds-nut-loc-vuong m-ds-nut-loc${soLuongLoc > 0 ? ' co-loc' : ''}`}
          onClick={onMoLoc}
          aria-label="Bộ lọc"
        >
          <Icon n="filter" className="ic sm" />
          {soLuongLoc > 0 && <span className="m-tc-loc-cham" />}
        </button>

        <span className="m-chip-xem">{tenKy}</span>
        {tenCn && (
          <span className="m-chip-xem">
            {tenCn.startsWith('CN:') || tenCn.startsWith('Kho:') || tenCn.startsWith('Kho/CN:') ? tenCn : `CN: ${tenCn}`}
          </span>
        )}
        {chipsKhac?.map((c, idx) => (
          <span key={c.k || idx} className="m-chip-xem">
            {c.nhan ? `${c.nhan}: ${c.giaTri}` : c.giaTri}
          </span>
        ))}
        {extraRight}
      </div>
    </div>
  )
}
