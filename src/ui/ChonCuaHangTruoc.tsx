import { useEffect, useMemo, useRef, useState, type FC } from 'react'
import { dsCuaHang, useSession } from '../app/session'
import { CUA_HANG } from '../data/mock'
import { Icon } from './Icon'
import { ThongBao } from './ThongBao'
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

  // Công thức sơ chế, chế biến là danh mục, có ô Cửa hàng áp dụng riêng, không phải phiếu (T756)
  if (modKey === 'kho' && (slug === '5-1-5' || slug === '9-1-3')) return false

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

export const ChonCuaHangTruoc: FC<ChonCuaHangTruocProps> = ({ mo, onDong, onChon }) => {
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

  const dsLoc = useMemo(() => {
    if (!tuKhoa.trim()) return dsCn
    const q = fold(tuKhoa.trim())
    return dsCn.filter(c => fold(c.ten).includes(q) || (('ngan' in c && c.ngan) ? fold(String(c.ngan)).includes(q) : false))
  }, [dsCn, tuKhoa])

  if (!mo) return null

  // Máy tính là hộp giữa màn, điện thoại là tấm trượt từ đáy: ThongBao tự đổi theo khổ màn (T889)
  return (
    <ThongBao loai="hoi" hinh="cuaHang" nhan="Chọn trước" tieuDe="Lập phiếu cho cửa hàng nào?"
      moTa="Thanh trên đang chọn Tất cả cửa hàng. Phiếu cần một cửa hàng."
      onDong={onDong}>
      {coTim && (
        <div className="ds-tim-cot ccht-tb-tim">
          <Icon n="search" className="ic sm" />
          <input ref={inputRef} type="text" placeholder="Tìm cửa hàng" aria-label="Tìm cửa hàng" value={tuKhoa} onChange={e => setTuKhoa(e.target.value)} />
          {tuKhoa && (
            <button type="button" className="icon-btn sm" onClick={() => setTuKhoa('')} aria-label="Xoá tìm kiếm">
              <Icon n="x" className="ic sm" />
            </button>
          )}
        </div>
      )}
      <div className="ccht-tb-ds">
        {dsLoc.map(c => (
          <button key={c.id} type="button" className="ccht-tb-dong" onClick={() => onChon(c.id)}>
            <span>{c.ten}</span>
            <Icon n="chevr" className="ic sm" />
          </button>
        ))}
        {dsLoc.length === 0 && <div className="ccht-trong">Không tìm thấy cửa hàng</div>}
      </div>
    </ThongBao>
  )
}
