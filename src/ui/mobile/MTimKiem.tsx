import { useEffect, useMemo, useRef, useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { MODULES, duongDan, hienMan, hienPhanHe, moDuoc, tabCua, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import type { ModuleDef, ScreenDef } from '../../modules/types'
import { fold } from '../format'
import { Icon } from '../Icon'

export interface MTimKiemProps {
  mo: boolean
  onDong: () => void
}

interface MucTimKiem {
  id: string
  ten: string
  code?: string
  phanHe: string
  to: string
  icon: string
}

export const MTimKiem: FC<MTimKiemProps> = ({ mo, onDong }) => {
  const { s } = useSession()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mo) {
      setQ('')
      const t = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(t)
    }
  }, [mo])

  // Danh sách toàn bộ màn hình thoả mãn điều kiện hiển thị
  const dsMucs = useMemo<MucTimKiem[]>(() => {
    const res: MucTimKiem[] = []

    const dsPhanHe = MODULES.filter(
      m =>
        hienPhanHe(m, s.goi) &&
        m.key !== 'trang-chu' &&
        m.key !== 'bao-cao' &&
        m.key !== 'danh-muc' &&
        m.key !== 'he-thong',
    )

    for (const mod of dsPhanHe) {
      const screens = tabCua(mod).filter(
        sc =>
          hienMan(sc, s.goi, s.cheDo, s) &&
          (moDuoc(sc, 'F') || moDuoc(sc, 'S')) &&
          sc.kind !== 'quytrinh' &&
          !sc.slug.startsWith('nhom-'),
      )

      for (const sc of screens) {
        const link = duongDan(mod, sc)
        const t = tenMan(sc)
        res.push({
          id: `${mod.key}-${sc.slug}`,
          ten: t,
          code: sc.code,
          phanHe: mod.ten,
          to: link,
          icon: sc.icon ?? mod.icon,
        })

        // Bổ sung các loại chứng từ quen thuộc để tìm kiếm trực tiếp
        if (sc.code === '2.1.1' || sc.slug === '2-1-1') {
          res.push({
            id: `${mod.key}-${sc.slug}-chi`,
            ten: 'Phiếu chi',
            code: '2.1.1',
            phanHe: mod.ten,
            to: link,
            icon: 'cashout',
          })
          res.push({
            id: `${mod.key}-${sc.slug}-thu`,
            ten: 'Phiếu thu',
            code: '2.1.1',
            phanHe: mod.ten,
            to: link,
            icon: 'cashin',
          })
        }
      }
    }

    // Danh mục và Báo cáo nếu có
    const modDm = MODULES.find(m => m.key === 'danh-muc')
    if (modDm) {
      const dmScreens = tabCua(modDm).filter(
        sc =>
          hienMan(sc, s.goi, s.cheDo, s) &&
          (moDuoc(sc, 'F') || moDuoc(sc, 'S')) &&
          sc.kind !== 'quytrinh',
      )
      for (const sc of dmScreens) {
        res.push({
          id: `dm-${sc.slug}`,
          ten: tenMan(sc),
          code: sc.code,
          phanHe: 'Danh mục',
          to: duongDan(modDm, sc),
          icon: sc.icon ?? modDm.icon,
        })
      }
    }

    return res
  }, [s.goi, s.cheDo, s.ppGtgt, s.ppTndn])

  // Lọc theo từ khoá tìm kiếm không phân biệt dấu và hoa thường
  const ketQua = useMemo(() => {
    const tuKhoa = fold(q.trim())
    if (!tuKhoa) return []
    return dsMucs.filter(item => {
      const tenKhop = fold(item.ten).includes(tuKhoa)
      const maKhop = item.code ? fold(item.code).includes(tuKhoa) : false
      const phKhop = fold(item.phanHe).includes(tuKhoa)
      return tenKhop || maKhop || phKhop
    })
  }, [q, dsMucs])

  if (!mo) return null

  const handleChon = (to: string) => {
    onDong()
    nav(to)
  }

  return (
    <div className="m-tk-phu">
      <div className="m-tk-dau">
        <button
          type="button"
          className="m-tk-dong-btn"
          onClick={onDong}
          aria-label="Đóng tìm kiếm"
        >
          <Icon n="chevl" className="ic sm" />
        </button>
        <div className="m-tk-inp-wrap">
          <Icon n="search" className="ic sm m-tk-ic" />
          <input
            ref={inputRef}
            type="text"
            className="m-tk-inp"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Tìm theo tên hoặc mã màn hình..."
          />
          {q && (
            <button
              type="button"
              className="m-tk-x"
              onClick={() => setQ('')}
              aria-label="Xoá tìm kiếm"
            >
              <Icon n="x" className="ic sm" />
            </button>
          )}
        </div>
      </div>

      <div className="m-tk-than">
        {!q.trim() ? (
          <div className="m-tk-goi-y">Gõ tên hoặc mã màn hình</div>
        ) : ketQua.length === 0 ? (
          <div className="m-tk-trong">Không tìm thấy màn hình</div>
        ) : (
          <div className="m-tk-ds">
            {ketQua.map(item => (
              <div
                key={item.id}
                className="m-tk-dong"
                onClick={() => handleChon(item.to)}
                role="button"
                tabIndex={0}
              >
                <div className="m-tk-dong-ic">
                  <Icon n={item.icon} className="ic sm" />
                </div>
                <div className="m-tk-dong-nd">
                  <div className="m-tk-dong-ten">{item.ten}</div>
                  <div className="m-tk-dong-sub">
                    {item.code && <span className="m-tk-dong-ma">{item.code}</span>}
                    <span className="m-tk-dong-ph">{item.phanHe}</span>
                  </div>
                </div>
                <Icon n="chevr" className="ic sm m-tk-dong-mui-ten" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
