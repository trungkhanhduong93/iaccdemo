// Kho lưu trữ danh mục dùng chung giữa CatalogScreen, ChonDanhMuc và mobile (T347)
import { useSyncExternalStore } from 'react'
import type { Row, ScreenDef } from '../../modules/types'
import { CCDC_HANG, HANG, KHACH, KHO, LY_DO, NCC, NHAN_VIEN, NVL } from '../../data/mock'
import { DON_VI_TINH, DS_CONG_VIEC_17, DS_MUC_CHI_PHI_16, DS_QUY_TIEN_112 } from '../../modules/danh-muc/data'
import { TRUONG_DM, type CauHinhDM } from '../../modules/danh-muc/truong-dm'

const daThemRows = new Map<string, Row[]>()
const listeners = new Set<() => void>()
let version = 0

function emitChange() {
  version++
  listeners.forEach(l => l())
}

/** Chuẩn hoá mã danh mục về mã chuẩn (1.2, 1.3, 1.5, 1.6, 1.7, 1.8, 1.12, 1.16) */
export function chieuKhoa(dm: string): string {
  const k = dm.toLowerCase().trim()
  if (k === '1.5' || k === '1-5' || k === 'doituong' || k === 'kh' || k === 'ncc' || k === 'nv' || k.includes('đối tượng') || k.includes('doi-tuong')) return '1.5'
  if (k === '1.2' || k === '1-2' || k === 'hang' || k === 'nvl' || k === 'ccdc' || k.includes('hàng') || k.includes('nguyên vật liệu')) return '1.2'
  if (k === '1.6' || k === '1-6' || k === 'khoanmuc' || k.includes('mục chi phí') || k.includes('khoản mục')) return '1.6'
  if (k === '1.8' || k === '1-8' || k === 'kho' || k.includes('kho')) return '1.8'
  if (k === '1.12' || k === '1-12' || k === 'quy' || k === 'quytm' || k === 'tknh' || k.includes('quỹ')) return '1.12'
  if (k === '1.16' || k === '1-16' || k === 'lydo' || k.startsWith('ly:') || k.includes('lý do') || k.includes('nghiệp vụ')) return '1.16'
  if (k === '1.7' || k === '1-7' || k === 'congviec' || k.includes('công việc')) return '1.7'
  if (k === '1.3' || k === '1-3' || k === 'dvt' || k.includes('đơn vị tính')) return '1.3'
  return dm
}

/** Lấy các dòng dữ liệu mẫu cơ bản của danh mục */
export function getBaseCatalogRows(normKey: string): Row[] {
  if (normKey === '1.5') {
    return [
      ...KHACH.map(x => ({ ...x, loai: 'Khách hàng', dongY: true, _tt: 1 })),
      ...NCC.map(x => ({ ...x, loai: 'Nhà cung cấp', dongY: true, _tt: 1 })),
      ...NHAN_VIEN.map(x => ({ ...x, loai: 'Nhân viên', dongY: true, _tt: 1 })),
    ]
  }
  if (normKey === '1.2') {
    return [
      ...HANG.map(h => ({ ...h, _tt: 1 })),
      ...NVL.map(h => ({ ...h, _tt: 1 })),
      ...CCDC_HANG.map(h => ({ ...h, _tt: 1 })),
    ]
  }
  if (normKey === '1.8') {
    return KHO.map((ten, i) => ({ ma: 'K' + String(i + 1).padStart(2, '0'), ten, cn: 'Lê Lợi', _tt: 1 }))
  }
  if (normKey === '1.12') {
    return DS_QUY_TIEN_112.map(q => ({ ...q, _tt: 1 }))
  }
  if (normKey === '1.16') {
    return LY_DO.map(l => ({ ...l, _tt: 1 }))
  }
  if (normKey === '1.6') {
    return DS_MUC_CHI_PHI_16.map(m => ({ ...m, _tt: 1 }))
  }
  if (normKey === '1.7') {
    return DS_CONG_VIEC_17.map(c => ({ ...c, _tt: 1 }))
  }
  if (normKey === '1.3') {
    return DON_VI_TINH.map(([ma, ten, mota]) => ({ ma, ten, mota, _tt: 1 }))
  }
  return []
}

/** Lấy tất cả dòng (mẫu + đã thêm trong phiên) của danh mục */
export function getAllCatalogRows(dm: string): Row[] {
  const normKey = chieuKhoa(dm)
  const base = getBaseCatalogRows(normKey)
  const added = daThemRows.get(normKey) ?? []
  return [...base, ...added]
}

/** Hook lấy các dòng đã thêm của một danh mục trong phiên */
export function useAddedCatalogRows(dm: string): Row[] {
  useSyncExternalStore(cb => { listeners.add(cb); return () => { listeners.delete(cb) } }, () => version)
  return daThemRows.get(chieuKhoa(dm)) ?? []
}

/** Thêm một dòng mới vào danh mục trong phiên */
export function addCatalogRow(dm: string, row: Row) {
  const normKey = chieuKhoa(dm)
  const cur = daThemRows.get(normKey) ?? []
  daThemRows.set(normKey, [...cur, row])
  emitChange()
}

/** Tự sinh mã kế tiếp nếu ô Mã để trống (T347) */
export function sinhMaKeTiep(dm: string, formVal: Row, allRows: Row[]): string {
  const normKey = chieuKhoa(dm)
  let prefix = ''
  if (normKey === '1.5') {
    const loai = formVal.loai ?? ''
    if (loai === 'Khách hàng') prefix = 'KH'
    else if (loai === 'Nhà cung cấp') prefix = 'NCC'
    else if (loai === 'Nhân viên') prefix = 'NV'
    else prefix = 'KH'
  } else if (normKey === '1.2') {
    const loai = formVal.loai ?? ''
    if (loai === 'Nguyên vật liệu') prefix = 'NVL'
    else if (String(loai).includes('Công cụ')) prefix = 'CCDC'
    else prefix = 'HH'
  } else if (normKey === '1.8') {
    prefix = 'K'
  } else if (normKey === '1.12') {
    const loai = formVal.loai ?? ''
    if (loai === 'Tiền mặt') prefix = 'TM'
    else if (loai === 'Ngân hàng') prefix = 'NH'
    else prefix = 'TM'
  } else if (normKey === '1.16') {
    prefix = 'LD'
  } else if (normKey === '1.6') {
    prefix = 'CP'
  } else if (normKey === '1.7') {
    prefix = 'CV'
  } else if (normKey === '1.3') {
    prefix = 'DVT'
  } else {
    prefix = 'M'
  }

  const re = new RegExp(`^${prefix}(\\d+)$`, 'i')
  let maxNum = 0
  let padLen = 2
  let found = false

  for (const r of allRows) {
    const m = String(r.ma ?? '').trim().match(re)
    if (m) {
      found = true
      const num = parseInt(m[1], 10)
      if (num > maxNum) {
        maxNum = num
        padLen = Math.max(padLen, m[1].length)
      }
    }
  }

  if (!found) {
    if (prefix === 'KH') padLen = 3
    else if (prefix === 'NCC') padLen = 2
    else if (prefix === 'NV') padLen = 2
    else if (prefix === 'K') padLen = 2
    else padLen = 2
  }

  const nextNum = maxNum + 1
  return `${prefix}${String(nextNum).padStart(padLen, '0')}`
}

export interface DmMeta {
  catKey: string
  scSlug: string
  cauHinh?: CauHinhDM
  dienSan: Row
  ten: string
  tenNgan: string
  all: Row[]
  sc: ScreenDef
}

/** Lấy thông tin cấu hình form đầy đủ cho mã danh mục dm */
export function getDmMeta(dm: string, nhan?: string, tenGoc?: string): DmMeta {
  const normKey = chieuKhoa(dm)
  const all = getAllCatalogRows(normKey)
  const cauHinh = TRUONG_DM[normKey]

  let dienSan: Row = tenGoc ? { ten: tenGoc } : {}
  let ten = nhan ?? 'danh mục'
  let tenNgan = nhan ?? 'danh mục'
  let scSlug = normKey.replace('.', '-')

  if (normKey === '1.5') {
    ten = 'đối tượng'
    tenNgan = 'đối tượng'
    scSlug = '1-5'
    const loai = dm === 'kh' ? 'Khách hàng' : dm === 'ncc' ? 'Nhà cung cấp' : dm === 'nv' ? 'Nhân viên' : 'Khách hàng'
    dienSan = { loai, dongY: 1, ...dienSan }
  } else if (normKey === '1.2') {
    ten = 'hàng hoá'
    tenNgan = 'hàng hoá'
    scSlug = '1-2'
    const loai = dm === 'nvl' ? 'Nguyên vật liệu' : dm === 'ccdc' ? 'Khác (Công cụ dụng cụ)' : 'Hàng bán thẳng'
    dienSan = { loai, tonKho: dm === 'ccdc' ? 0 : 1, ...dienSan }
  } else if (normKey === '1.8') {
    ten = 'kho'
    tenNgan = 'kho'
    scSlug = '1-8'
    dienSan = { cn: 'Lê Lợi', ...dienSan }
  } else if (normKey === '1.12') {
    ten = 'quỹ'
    tenNgan = 'quỹ'
    scSlug = '1-12'
    const loai = dm === 'tkNh' ? 'Ngân hàng' : 'Tiền mặt'
    dienSan = { loai, ...dienSan }
  } else if (normKey === '1.16') {
    ten = 'lý do nghiệp vụ'
    tenNgan = 'lý do'
    scSlug = '1-16'
    const dung = (dm.includes('thu') || nhan?.includes('thu')) ? 'Thu tiền'
      : (dm.includes('chi') || nhan?.includes('chi')) ? 'Chi tiền'
      : (dm.includes('nhập') || nhan?.includes('nhập')) ? 'Nhập kho'
      : (dm.includes('xuất') || nhan?.includes('xuất')) ? 'Xuất kho'
      : 'Chi tiền'
    dienSan = { dung, ...(dung === 'Chi tiền' ? { chiPhi: 1 } : {}), ...dienSan }
  } else if (normKey === '1.6') {
    ten = 'mục chi phí'
    tenNgan = 'mục chi phí'
    scSlug = '1-6'
  } else if (normKey === '1.7') {
    ten = 'công việc'
    tenNgan = 'công việc'
    scSlug = '1-7'
  } else if (normKey === '1.3') {
    ten = 'đơn vị tính'
    tenNgan = 'đơn vị tính'
    scSlug = '1-3'
  }

  const sc: ScreenDef = {
    slug: scSlug,
    code: normKey,
    ten: `Danh mục ${ten}`,
    ngan: tenNgan,
    nhom: 'Danh mục',
    kind: 'catalog',
    catalog: {
      cols: [{ k: 'ma', t: 'Mã' }, { k: 'ten', t: 'Tên' }],
      rows: () => all,
    },
  }

  return { catKey: normKey, scSlug, cauHinh, dienSan, ten, tenNgan, all, sc }
}
