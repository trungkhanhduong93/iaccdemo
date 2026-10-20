import { useEffect, useMemo, useRef, useState, type FC } from 'react'
import { createPortal } from 'react-dom'
import { dsCuaHang, useSession } from '../app/session'
import { CUA_HANG } from '../data/mock'
import { Icon } from './Icon'
import { fold } from './format'
import { timMan } from '../app/registry'

/** Kiểm tra đường dẫn có phải là màn tạo mới chứng từ/phiếu hay không */
export function laDuongDanTaoPhieu(pathname: string, search = ''): boolean {
  const cleanPath = pathname.replace(/\/+$/, '')
  const parts = cleanPath.split('/').filter(Boolean)
  // Đường dẫn dạng /app/:mod/:slug/:id hoặc /app/:mod/:slug
  const modKey = parts[1]
  const slug = parts[2]
  const id = parts[3]

  if (!modKey || ['danh-muc', 'he-thong', 'tien-ich', 'bao-cao', 'trang-chu'].includes(modKey)) {
    return false
  }

  const sp = new URLSearchParams(search)
  const coMoiParam = sp.get('moi') === '1' || sp.get('moi') === 'true'
  const laIdMoi = id === 'moi' || parts.includes('moi')

  if (!laIdMoi && !coMoiParam) {
    return false
  }

  // Danh mục trong các phân hệ khác (ví dụ kho/5-1-12, ccdc/8-1-1)
  if (slug) {
    const { sc } = timMan(modKey, slug)
    if (sc) {
      if (sc.kind === 'catalog' || Boolean(sc.catalog)) return false
      if (sc.kind === 'voucher' || Boolean(sc.voucher)) return true
      if (sc.kind !== 'quytrinh' && sc.kind !== 'baocao' && sc.kind !== 'report') return true
    }
  }

  const PHAN_HE_CHUNG_TU = ['tien', 'mua-hang', 'ban-hang', 'kho', 'tscd', 'ccdc', 'gia-thanh', 'tong-hop']
  return PHAN_HE_CHUNG_TU.includes(modKey)
}

const KEY_CN_NHO = 'iacc_cn_nho_lap_phieu'

/** Lấy chi nhánh đã nhớ trong phiên khi lập phiếu từ Tất cả chi nhánh (T526) */
export function layChiNhanhNho(): string | null {
  try {
    return sessionStorage.getItem(KEY_CN_NHO)
  } catch {
    return null
  }
}

/** Ghi nhớ chi nhánh đã chọn trong phiên (T526) */
export function luuChiNhanhNho(idCuaHang: string): void {
  try {
    sessionStorage.setItem(KEY_CN_NHO, idCuaHang)
  } catch {
    // bỏ qua
  }
}

export interface ChonCuaHangTruocProps {
  mo: boolean
  laMobile?: boolean
  onDong: () => void
  onChon: (idCuaHang: string) => void
}

export const ChonCuaHangTruoc: FC<ChonCuaHangTruocProps> = ({ mo, laMobile = false, onDong, onChon }) => {
  const { s } = useSession()
  const [tuKhoa, setTuKhoa] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const dsCnRaw = dsCuaHang(s)
  const dsCn = dsCnRaw.length ? dsCnRaw : CUA_HANG
  const coTim = dsCn.length > 3

  useEffect(() => {
    if (mo) {
      setTuKhoa('')
      if (coTim) {
        setTimeout(() => inputRef.current?.focus(), 80)
      }
    }
  }, [mo, coTim])

  useEffect(() => {
    if (!mo) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onDong()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mo, onDong])

  const dsLoc = useMemo(() => {
    if (!tuKhoa.trim()) return dsCn
    const q = fold(tuKhoa.trim())
    return dsCn.filter(c => fold(c.ten).includes(q) || (('ngan' in c && c.ngan) ? fold(String(c.ngan)).includes(q) : false))
  }, [dsCn, tuKhoa])

  if (!mo) return null

  // Giao diện điện thoại: bảng trượt từ dưới lên (bottom sheet)
  if (laMobile) {
    return createPortal(
      <div className="m-tam-overlay ccht-m-overlay" onClick={onDong}>
        <div className="m-tam-hop ccht-m-hop" onClick={e => e.stopPropagation()}>
          <div className="m-tam-keo" />
          <div className="m-tam-dau">
            <div className="ccht-m-dau-chu">
              <h2 className="m-tam-tieu">Chọn cửa hàng</h2>
              <p className="ccht-m-phu">Chọn cửa hàng để tiếp tục lập phiếu</p>
            </div>
            <button type="button" className="m-tam-dong-btn" onClick={onDong} aria-label="Đóng">
              <Icon n="x" className="ic sm" />
            </button>
          </div>
          {coTim && (
            <div className="m-tam-tim-wrap">
              <Icon n="search" className="ic sm m-tam-tim-ic" />
              <input
                ref={inputRef}
                type="text"
                className="m-tam-tim-inp"
                placeholder="Tìm cửa hàng"
                value={tuKhoa}
                onChange={e => setTuKhoa(e.target.value)}
              />
              {tuKhoa && (
                <button type="button" className="m-tam-tim-x" onClick={() => setTuKhoa('')} aria-label="Xoá tìm kiếm">
                  <Icon n="x" className="ic sm" />
                </button>
              )}
            </div>
          )}
          <div className="m-tam-ds ccht-m-ds">
            {dsLoc.map(c => (
              <div
                key={c.id}
                className="m-tam-dong ccht-m-dong"
                onClick={() => onChon(c.id)}
              >
                <div className="ccht-m-dong-ic">
                  <Icon n="cuahang" className="ic sm" />
                </div>
                <div className="m-tam-dong-nd">
                  <div className="m-tam-dong-ten">{c.ten}</div>
                </div>
                <Icon n="chevr" className="ic sm ccht-muc-mui-ten" />
              </div>
            ))}
            {dsLoc.length === 0 && (
              <div className="ccht-trong">Không tìm thấy cửa hàng</div>
            )}
          </div>
          <div className="m-tam-day ccht-m-day">
            <button type="button" className="m-tam-btn-huy" onClick={onDong}>
              Huỷ
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // Giao diện web: hộp thoại nhỏ giữa màn
  return createPortal(
    <div
      className="overlay ccht-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Chọn cửa hàng"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onDong()
      }}
    >
      <div className="ccht-hop chon-cn">
        <div className="ccht-dau">
          <div className="ccht-dau-chu">
            <h3 className="ccht-tieu-de">Chọn cửa hàng</h3>
            <p className="ccht-mo-ta">Chọn cửa hàng trước khi lập chứng từ mới</p>
          </div>
          <button type="button" className="ccht-nut-dong" onClick={onDong} title="Đóng (Esc)" aria-label="Đóng">
            <Icon n="x" className="ic sm" />
          </button>
        </div>
        {coTim && (
          <div className="ccht-tim-wrap">
            <Icon n="search" className="ic sm ccht-tim-ic" />
            <input
              ref={inputRef}
              type="text"
              className="ccht-tim-inp"
              placeholder="Tìm cửa hàng…"
              value={tuKhoa}
              onChange={e => setTuKhoa(e.target.value)}
            />
            {tuKhoa && (
              <button type="button" className="ccht-tim-x" onClick={() => setTuKhoa('')} aria-label="Xoá tìm kiếm">
                <Icon n="x" className="ic sm" />
              </button>
            )}
          </div>
        )}
        <div className="ccht-ds chon-cn-ds">
          {dsLoc.map(c => (
            <button
              key={c.id}
              type="button"
              className="btn ccht-muc"
              onClick={() => onChon(c.id)}
            >
              <div className="ccht-muc-ic">
                <Icon n="cuahang" className="ic sm" />
              </div>
              <span className="ccht-muc-ten">{c.ten}</span>
              <Icon n="chevr" className="ic sm ccht-muc-mui-ten" />
            </button>
          ))}
          {dsLoc.length === 0 && (
            <div className="ccht-trong">Không tìm thấy cửa hàng</div>
          )}
        </div>
        <div className="ccht-chan">
          <button type="button" className="btn ccht-btn-huy" onClick={onDong}>
            Huỷ
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
