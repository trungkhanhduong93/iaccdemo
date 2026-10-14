import { useEffect, useMemo, useRef, useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { MODULES, duongDan, hienMan, hienPhanHe, moDuoc, tabCua, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import type { ModuleDef, ScreenDef } from '../../modules/types'
import { layNhomBaoCao } from '../../modules/bao-cao/TrungTam'
import { kyHieuBC } from '../../modules/bao-cao/danh-sach'
import { fold } from '../format'
import { Icon } from '../Icon'

export interface MTimKiemProps {
  mo: boolean
  onDong: () => void
}

interface MucTimKiem {
  id: string
  ten: string
  alias?: string
  code?: string
  phanHe: string
  to: string
  icon: string
  loai: 'man-hinh' | 'bao-cao'
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

  // Danh sách toàn bộ màn hình và báo cáo thoả mãn điều kiện hiển thị
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
          loai: 'man-hinh',
        })

        // Bổ sung so khớp thêm tên các tab loại phiếu nếu màn có loại (sc.voucher?.loai)
        if (sc.voucher?.loai) {
          for (const l of sc.voucher.loai) {
            const tenLoai = l.nhan ?? l.ten
            const tenPhieu = l.ten.startsWith('Phiếu') ? l.ten : `Phiếu ${l.ten.toLowerCase()}`
            res.push({
              id: `${mod.key}-${sc.slug}-${l.k}`,
              ten: tenLoai,
              alias: `${tenPhieu} ${l.k === 'thu' ? 'Phiếu thu' : l.k === 'chi' ? 'Phiếu chi' : ''}`,
              code: sc.code,
              phanHe: mod.ten,
              to: link,
              icon: l.icon ?? sc.icon ?? mod.icon,
              loai: 'man-hinh',
            })
          }
        }
      }
    }

    // Danh mục
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
          loai: 'man-hinh',
        })
      }
    }

    // Bổ sung các báo cáo từ TrungTamBaoCao (cách MBaoCao.tsx đang lấy)
    const nhomBaoCao = layNhomBaoCao(s)
    const tatCaBcHienMap = new Map<string, ScreenDef>()
    for (const g of nhomBaoCao) {
      for (const item of g.screens) {
        if (hienMan(item, s.goi, s.cheDo, s)) {
          tatCaBcHienMap.set(item.slug, item)
        }
      }
    }
    for (const bc of tatCaBcHienMap.values()) {
      const ma = kyHieuBC(bc.code, s.cheDo, s) ?? bc.code
      const ten = tenMan(bc)
      res.push({
        id: `bc-${bc.slug}`,
        ten,
        code: ma,
        phanHe: 'Báo cáo',
        to: `/app/bao-cao/${bc.slug}`,
        icon: bc.icon ?? 'chart',
        loai: 'bao-cao',
      })
    }

    return res
  }, [s])

  // Lọc theo từ khoá tìm kiếm không phân biệt dấu và hoa thường
  const ketQua = useMemo(() => {
    const tuKhoa = fold(q.trim())
    if (!tuKhoa) return []
    return dsMucs.filter(item => {
      const tenKhop = fold(item.ten).includes(tuKhoa)
      const aliasKhop = item.alias ? fold(item.alias).includes(tuKhoa) : false
      const maKhop = item.code ? fold(item.code).includes(tuKhoa) : false
      const phKhop = fold(item.phanHe).includes(tuKhoa)
      return tenKhop || aliasKhop || maKhop || phKhop
    })
  }, [q, dsMucs])

  const kqManHinh = useMemo(() => ketQua.filter(item => item.loai === 'man-hinh'), [ketQua])
  const kqBaoCao = useMemo(() => ketQua.filter(item => item.loai === 'bao-cao'), [ketQua])

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
          <div className="m-tk-goi-y">Gõ tên hoặc mã màn hình, báo cáo</div>
        ) : ketQua.length === 0 ? (
          <div className="m-tk-trong">Không tìm thấy kết quả phù hợp</div>
        ) : (
          <div className="m-tk-ket-qua-wrap">
            {kqManHinh.length > 0 && (
              <div className="m-tk-nhom">
                <div className="m-tk-nhom-tieu-de">Màn hình ({kqManHinh.length})</div>
                <div className="m-tk-ds">
                  {kqManHinh.map(item => (
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
              </div>
            )}

            {kqBaoCao.length > 0 && (
              <div className="m-tk-nhom">
                <div className="m-tk-nhom-tieu-de">Báo cáo ({kqBaoCao.length})</div>
                <div className="m-tk-ds">
                  {kqBaoCao.map(item => (
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
