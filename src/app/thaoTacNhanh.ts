import { useEffect, useMemo, useState } from 'react'
import type { Session } from './session'
import type { Goi } from './plan'
import {
  MODULES,
  duongDan,
  hienMan,
  hienPhanHe,
  laBaoCao,
  maKhoa,
  moDuoc,
  tenMan,
  tenPhanHe,
  timMan,
} from './registry'

export interface ThaoTacUngVien {
  id: string
  ten: string
  icon: string
  to: string
  modKey: string
  slug: string
  tenMod?: string
}

export interface ThaoTacMuc extends ThaoTacUngVien {
  khoa: boolean
  ma?: string
}

export const THAO_TAC_UNG_VIEN: ThaoTacUngVien[] = [
  { id: 'thu', ten: 'Thu tiền', icon: 'cashin', to: '/app/tien/2-1-1/moi?loai=thu', modKey: 'tien', slug: '2-1-1' },
  { id: 'chi', ten: 'Chi tiền', icon: 'cashout', to: '/app/tien/2-1-1/moi?loai=chi', modKey: 'tien', slug: '2-1-1' },
  { id: 'nhap-kho', ten: 'Nhập kho', icon: 'nhapkho', to: '/app/kho/5-1-1/moi', modKey: 'kho', slug: '5-1-1' },
  { id: 'xuat-kho', ten: 'Xuất kho', icon: 'xuatkho', to: '/app/kho/5-1-2/moi', modKey: 'kho', slug: '5-1-2' },
  { id: 'so-quy', ten: 'Sổ quỹ', icon: 'wallet', to: '/app/tien/2-2-1', modKey: 'tien', slug: '2-2-1' },
  { id: 'nhap-mua', ten: 'Nhập mua', icon: 'truck', to: '/app/mua-hang/4-1-1/moi', modKey: 'mua-hang', slug: '4-1-1' },
  { id: 'kiem-ke', ten: 'Kiểm kê', icon: 'clipboard', to: '/app/kho/5-1-10/moi', modKey: 'kho', slug: '5-1-10' },
  { id: 'bao-co', ten: 'Thu ngân hàng', icon: 'bank', to: '/app/tien/2-1-1/moi?loai=bc', modKey: 'tien', slug: '2-1-1' },
  { id: 'unc', ten: 'Chi ngân hàng', icon: 'bank', to: '/app/tien/2-1-1/moi?loai=unc', modKey: 'tien', slug: '2-1-1' },
  { id: 'so-ngan-hang', ten: 'Sổ ngân hàng', icon: 'book', to: '/app/tien/2-2-3', modKey: 'tien', slug: '2-2-3' },
  { id: 'chuyen-quy', ten: 'Chuyển quỹ', icon: 'swap', to: '/app/tien/2-1-1/moi?loai=cq', modKey: 'tien', slug: '2-1-1' },
  { id: 'ke-khai-thue', ten: 'Kê khai thuế', icon: 'percent', to: '/app/thue/to-khai', modKey: 'thue', slug: 'to-khai' },
]

// Gói Free thay Sổ quỹ bằng Kê khai thuế (T627)
export const MAC_DINH_FREE = ['thu', 'chi', 'nhap-mua', 'kiem-ke', 'ke-khai-thue']
export const MAC_DINH_KHAC = ['thu', 'chi', 'nhap-kho', 'xuat-kho', 'so-quy']
export const STORAGE_KEY = 'iacc-thao-tac-nhanh'
export const SU_KIEN_THAY_DOI = 'iacc-thao-tac-nhanh-doi'
export const TOI_DA_THAO_TAC = 8

export function layMacDinhIds(goi?: string): string[] {
  return goi === 'F' ? [...MAC_DINH_FREE] : [...MAC_DINH_KHAC]
}

export function docThaoTacIds(goi?: string): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return layMacDinhIds(goi)
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return layMacDinhIds(goi)
    const hopLe = parsed.filter(id => typeof id === 'string' && id.trim().length > 0)
    return hopLe.length > 0 ? hopLe.slice(0, TOI_DA_THAO_TAC) : layMacDinhIds(goi)
  } catch {
    return layMacDinhIds(goi)
  }
}

export function ghiThaoTacIds(ids: string[]): void {
  try {
    const hopLe = ids.slice(0, TOI_DA_THAO_TAC)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hopLe))
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

function layGoc() {
  return new Map(
    MODULES.filter(m => m.key !== 'bao-cao').flatMap(m =>
      m.screens.filter(laBaoCao).map(sc => [sc.slug, m] as const)
    )
  )
}

export function layTatCaThaoTac(s: Pick<Session, 'goi'> & Partial<Session>): ThaoTacMuc[] {
  const isFree = s.goi === 'F'
  const kq: ThaoTacMuc[] = []
  const daCoDuongDan = new Set<string>()
  const GOC = layGoc()

  // 1. Thêm 11 mục cũ
  for (const uv of THAO_TAC_UNG_VIEN) {
    const mod = MODULES.find(m => m.key === uv.modKey)
    const { sc } = timMan(uv.modKey, uv.slug)
    // Màn không có ở gói này (vd Kê khai thuế hộ kinh doanh ở gói Plus) thì bỏ, T627
    if (sc && !hienMan(sc, s.goi, s.cheDo, s as Pick<Session, 'ppGtgt' | 'ppTndn'> | undefined)) continue
    const khoa = sc ? !moDuoc(sc, s.goi) : false
    const ma = sc ? maKhoa(sc) : undefined
    const tenMod = mod ? tenPhanHe(mod, s.goi).ngan : uv.modKey
    const muc: ThaoTacMuc = {
      ...uv,
      to: khoa ? `/app/${uv.modKey}/${uv.slug}` : uv.to,
      khoa,
      ma,
      tenMod,
    }
    // Gói Free ẩn mục ngoài gói
    if (isFree && khoa) continue
    kq.push(muc)
    daCoDuongDan.add(uv.to)
  }

  // 2. Thêm các màn trong MODULES
  for (const m of MODULES) {
    if (m.key === 'thao-tac-nhanh') continue
    if (!hienPhanHe(m, s.goi)) continue

    for (const sc of m.screens) {
      if (m.key !== 'bao-cao' && laBaoCao(sc)) continue
      if (sc.slug.startsWith('nhom-')) continue
      if (!hienMan(sc, s.goi, s.cheDo, s as Pick<Session, 'ppGtgt' | 'ppTndn'> | undefined)) continue

      const goc = (m.key === 'bao-cao' && GOC.get(sc.slug)) || m
      const tenMod =
        m === goc
          ? tenPhanHe(m, s.goi).ngan
          : `${tenPhanHe(m, s.goi).ngan} · ${tenPhanHe(goc, s.goi).ngan}`
      const icon =
        sc.icon ??
        (sc.kind === 'voucher'
          ? 'doc'
          : sc.kind === 'catalog'
          ? 'folder'
          : sc.kind === 'tool'
          ? 'play'
          : m.icon)
      const khoa = !moDuoc(sc, s.goi)
      const ma = maKhoa(sc)

      // Gói Free ẩn mục ngoài gói
      if (isFree && khoa) continue

      // a. Màn danh sách
      const toMan = duongDan(m, sc)
      if (!daCoDuongDan.has(toMan)) {
        daCoDuongDan.add(toMan)
        kq.push({
          id: `man:${m.key}/${sc.slug}`,
          ten: tenMan(sc),
          icon,
          to: toMan,
          modKey: m.key,
          slug: sc.slug,
          khoa,
          ma,
          tenMod,
        })
      }

      // b. Màn chứng từ mới (kind === 'voucher')
      if (sc.kind === 'voucher') {
        const toMoi = `${toMan}/moi`
        if (!daCoDuongDan.has(toMoi)) {
          daCoDuongDan.add(toMoi)
          kq.push({
            id: `moi:${m.key}/${sc.slug}`,
            ten: `Lập ${tenMan(sc).toLowerCase()}`,
            icon,
            to: toMoi,
            modKey: m.key,
            slug: sc.slug,
            khoa,
            ma,
            tenMod,
          })
        }
      }
    }
  }

  return kq
}

export function useThaoTacNhanh(s: Pick<Session, 'goi'> & Partial<Session>) {
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

  const tatCa = useMemo(() => {
    return layTatCaThaoTac(s)
  }, [s.goi, s.cheDo, s.ppGtgt, s.ppTndn])

  // Danh sách đã chọn theo thứ tự ids (gói Free lọc bỏ mục khoá)
  const ds = useMemo(() => {
    const map = new Map(tatCa.map(m => [m.id, m]))
    const res: ThaoTacMuc[] = []
    for (const id of ids) {
      const item = map.get(id)
      if (item) {
        if (isFree && item.khoa) continue
        res.push(item)
      }
    }
    return res
  }, [ids, isFree, tatCa])

  const luu = (nextIds: string[]) => {
    ghiThaoTacIds(nextIds)
    setIds(nextIds.slice(0, TOI_DA_THAO_TAC))
  }

  const veMacDinh = () => {
    const def = layMacDinhIds(s.goi)
    ghiThaoTacIds(def)
    setIds(def)
  }

  return {
    ds,
    ids,
    tatCa,
    luu,
    veMacDinh,
    macDinhIds: layMacDinhIds(s.goi),
  }
}
