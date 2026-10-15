import { useEffect, useMemo, useState } from 'react'
import type { Session } from './session'
import type { Goi } from './plan'
import { maKhoa, moDuoc, timMan } from './registry'

export interface ThaoTacUngVien {
  id: string
  ten: string
  icon: string
  to: string
  modKey: string
  slug: string
}

export interface ThaoTacMuc extends ThaoTacUngVien {
  khoa: boolean
  ma?: string
}

export const THAO_TAC_UNG_VIEN: ThaoTacUngVien[] = [
  { id: 'thu', ten: 'Thu tiền', icon: 'cashin', to: '/app/tien/2-1-1/moi?loai=thu', modKey: 'tien', slug: '2-1-1' },
  { id: 'chi', ten: 'Chi tiền', icon: 'cashout', to: '/app/tien/2-1-1/moi?loai=chi', modKey: 'tien', slug: '2-1-1' },
  { id: 'nhap-kho', ten: 'Nhập kho', icon: 'filein', to: '/app/kho/5-1-1/moi', modKey: 'kho', slug: '5-1-1' },
  { id: 'xuat-kho', ten: 'Xuất kho', icon: 'pos', to: '/app/kho/5-1-2/moi', modKey: 'kho', slug: '5-1-2' },
  { id: 'so-quy', ten: 'Sổ quỹ', icon: 'wallet', to: '/app/tien/2-2-1', modKey: 'tien', slug: '2-2-1' },
  { id: 'nhap-mua', ten: 'Nhập mua', icon: 'truck', to: '/app/mua-hang/4-1-1/moi', modKey: 'mua-hang', slug: '4-1-1' },
  { id: 'kiem-ke', ten: 'Kiểm kê', icon: 'clipboard', to: '/app/kho/5-1-10/moi', modKey: 'kho', slug: '5-1-10' },
  { id: 'bao-co', ten: 'Báo có', icon: 'bank', to: '/app/tien/2-1-1/moi?loai=bc', modKey: 'tien', slug: '2-1-1' },
  { id: 'unc', ten: 'Uỷ nhiệm chi', icon: 'bank', to: '/app/tien/2-1-1/moi?loai=unc', modKey: 'tien', slug: '2-1-1' },
  { id: 'so-ngan-hang', ten: 'Sổ ngân hàng', icon: 'book', to: '/app/tien/2-2-3', modKey: 'tien', slug: '2-2-3' },
  { id: 'chuyen-quy', ten: 'Chuyển quỹ', icon: 'swap', to: '/app/tien/2-1-1/moi?loai=cq', modKey: 'tien', slug: '2-1-1' },
]

export const MAC_DINH_FREE = ['thu', 'chi', 'nhap-mua', 'kiem-ke', 'so-quy']
export const MAC_DINH_KHAC = ['thu', 'chi', 'nhap-kho', 'xuat-kho', 'so-quy']
export const STORAGE_KEY = 'iacc-thao-tac-nhanh'
export const SU_KIEN_THAY_DOI = 'iacc-thao-tac-nhanh-doi'

export function layMacDinhIds(goi?: string): string[] {
  return goi === 'F' ? [...MAC_DINH_FREE] : [...MAC_DINH_KHAC]
}

export function docThaoTacIds(goi?: string): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return layMacDinhIds(goi)
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return layMacDinhIds(goi)
    const hopLe = parsed.filter(id => typeof id === 'string' && THAO_TAC_UNG_VIEN.some(c => c.id === id))
    return hopLe.length > 0 ? hopLe : layMacDinhIds(goi)
  } catch {
    return layMacDinhIds(goi)
  }
}

export function ghiThaoTacIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    window.dispatchEvent(new Event(SU_KIEN_THAY_DOI))
  } catch {
    // bỏ qua lỗi ghi localStorage (trình duyệt chặn bộ nhớ)
  }
}

export function layThaoTacMuc(uv: ThaoTacUngVien, goi: Goi): ThaoTacMuc {
  const { sc } = timMan(uv.modKey, uv.slug)
  const khoa = sc ? !moDuoc(sc, goi) : false
  const ma = sc ? maKhoa(sc) : undefined
  return {
    ...uv,
    to: khoa ? `/app/${uv.modKey}/${uv.slug}` : uv.to,
    khoa,
    ma,
  }
}

export function useThaoTacNhanh(s: Pick<Session, 'goi'>) {
  const isFree = s.goi === 'F'
  const [ids, setIds] = useState<string[]>(() => docThaoTacIds(s.goi))

  useEffect(() => {
    const capNhat = () => {
      setIds(docThaoTacIds(s.goi))
    }
    window.addEventListener('storage', capNhat)
    window.addEventListener(SU_KIEN_THAY_DOI, capNhat)
    return () => {
      window.removeEventListener('storage', capNhat)
      window.removeEventListener(SU_KIEN_THAY_DOI, capNhat)
    }
  }, [s.goi])

  const tatCaMuc = useMemo(() => {
    return THAO_TAC_UNG_VIEN.map(uv => layThaoTacMuc(uv, s.goi))
  }, [s.goi])

  // Danh mục ứng viên hiển thị cho hộp tuỳ chỉnh (gói Free không liệt kê thao tác ngoài gói)
  const ungVien = useMemo(() => {
    if (isFree) {
      return tatCaMuc.filter(m => !m.khoa)
    }
    return tatCaMuc
  }, [isFree, tatCaMuc])

  // Danh sách đã chọn theo thứ tự ids (gói Free lọc bỏ mục khoá)
  const ds = useMemo(() => {
    const map = new Map(tatCaMuc.map(m => [m.id, m]))
    const res: ThaoTacMuc[] = []
    for (const id of ids) {
      const item = map.get(id)
      if (item) {
        if (isFree && item.khoa) continue
        res.push(item)
      }
    }
    return res
  }, [ids, isFree, tatCaMuc])

  const luu = (nextIds: string[]) => {
    ghiThaoTacIds(nextIds)
    setIds(nextIds)
  }

  const veMacDinh = () => {
    const def = layMacDinhIds(s.goi)
    ghiThaoTacIds(def)
    setIds(def)
  }

  return {
    ds,
    ids,
    tatCa: ungVien,
    luu,
    veMacDinh,
    macDinhIds: layMacDinhIds(s.goi),
  }
}
