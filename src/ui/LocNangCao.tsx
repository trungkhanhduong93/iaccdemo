// Danh sách chứng từ theo iFaster (T41): ô lọc nhãn trên viền, chip trạng thái, Bộ lọc nâng cao có cấu hình ô đưa ra ngoài,
// hộp Tuỳ chỉnh cột hiển thị, nút Thao tác hàng loạt. VoucherScreen và Bán hàng 3.1.1 chỉ ghép các phần ở đây.
import { useCallback, useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { Col, Row } from '../modules/types'
import { useSession } from '../app/session'
import { MenuHead, MenuItem, MenuSep, Popover } from './Dropdown'
import { Icon } from './Icon'
import { fold } from './format'
import { daKhoaSo } from '../data/mock'
import { ctTtCon } from './generic/daXoa'

/** Tối đa số ô lọc đưa ra thanh ngoài */
const TOI_DA_NGOAI = 4

// ── Bộ nhớ trình duyệt: khoá gồm đường dẫn màn, đọc ghi lỗi thì dùng mặc định ──

function docKho<T>(khoa: string, hop: (x: unknown) => x is T, mac: T): T {
  try {
    const raw = localStorage.getItem(khoa)
    if (!raw) return mac
    const v: unknown = JSON.parse(raw)
    return hop(v) ? v : mac
  } catch {
    return mac
  }
}

function ghiKho(khoa: string, v: unknown) {
  try {
    localStorage.setItem(khoa, JSON.stringify(v))
  } catch {
    // Bỏ qua lỗi nếu không ghi được localStorage
  }
}

const laMangChu = (x: unknown): x is string[] => Array.isArray(x) && x.every(y => typeof y === 'string')
const laBangSo = (x: unknown): x is Record<string, number> =>
  typeof x === 'object' && x !== null && !Array.isArray(x) && Object.values(x).every(y => typeof y === 'number')
const laCauHinh = (x: unknown): x is CauHinhLoc =>
  typeof x === 'object' && x !== null && laMangChu((x as CauHinhLoc).thuTu) && laMangChu((x as CauHinhLoc).ngoai)

// ── Ô lọc có nhãn nằm trên viền ──

export function ONhanVien({ nhan, children, className = '' }: { nhan: string; children: ReactNode; className?: string }) {
  return (
    <div className={`ds-o ${className}`.trim()}>
      <span className="ds-o-nhan">{nhan}</span>
      {children}
    </div>
  )
}

// ── Chip trạng thái ──

export interface Chip { k: string; ten: string; mau: string; so: number }

/** Chip theo trạng thái phiếu nhap, ghi, loi. Gói Free lưu là duyệt luôn nên không có chip, danh sách hiện tất cả (T48) */
export function dsChipTT(ds: Row[], ghi: boolean, tenLoi = 'Lỗi hạch toán'): Chip[] {
  const dem = (k: string) => ds.filter(r => khopChipTT(k, r.tt, ghi)).length
  const tatCa: Chip = { k: 'all', ten: 'Tất cả', mau: 'var(--blue)', so: ds.length }
  if (!ghi) return []
  return [
    tatCa,
    { k: 'nhap', ten: 'Chưa ghi sổ', mau: 'var(--amber)', so: dem('nhap') },
    { k: 'ghi', ten: 'Đã ghi sổ', mau: 'var(--green)', so: dem('ghi') },
    { k: 'loi', ten: tenLoi, mau: 'var(--red)', so: dem('loi') },
  ]
}

export function khopChipTT(chip: string, tt: unknown, ghi: boolean): boolean {
  if (chip === 'all') return true
  if (chip === 'nhap') return tt === 'nhap'
  if (!ghi || chip === 'luu') return tt !== 'nhap'
  return tt === chip
}

export function ChipTrangThai({ ds, chon, onChon }: { ds: Chip[]; chon: string; onChon: (k: string) => void }) {
  return (
    <div className="ds-chips">
      {ds.map(c => (
        <button
          key={c.k}
          type="button"
          className={`ds-chip ds-chip-${c.k}${chon === c.k ? ' on' : ''}`}
          aria-pressed={chon === c.k}
          onClick={() => onChon(c.k)}
        >
          <i className="ds-chip-cham" style={{ background: c.mau }} />
          <span>{c.ten}</span>
          <b className={`ds-chip-so${c.so === 0 ? ' so-khong' : ''}`}>{c.so}</b>
        </button>
      ))}
    </div>
  )
}

// ── Giá trị lọc nháp: gõ, chọn chưa lọc ngay, bấm Lọc mới áp dụng ──

const giongNhau = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

export function useLocNhap<T extends object>(macDinh: () => T) {
  const [ap, setAp] = useState<T>(macDinh)
  const [nhap, setNhap] = useState<T>(macDinh)
  const dat = <K extends keyof T>(k: K, v: T[K]) => setNhap(x => ({ ...x, [k]: v }))
  return {
    ap, nhap, dat,
    /** Áp dụng giá trị nháp */
    loc: () => setAp(nhap),
    /** Đưa nháp về mặc định, chưa áp dụng */
    xoaNhap: () => setNhap(macDinh()),
    /** Đưa cả nháp lẫn giá trị đang lọc về mặc định */
    xoaHet: () => { setNhap(macDinh()); setAp(macDinh()) },
    khacNhap: !giongNhau(ap, nhap),
    dangLoc: !giongNhau(ap, macDinh()),
  }
}

// ── Cấu hình ô lọc đưa ra ngoài ──

/** thuTu: thứ tự mọi ô; ngoai: các ô hiện trên thanh ngoài */
export interface CauHinhLoc { thuTu: string[]; ngoai: string[] }
/** Một ô lọc: o là control đã gắn giá trị nháp */
export interface OLocDef { k: string; ten: string; o: ReactNode }

export function useCauHinhLoc(path: string, ds: string[], macDinhNgoai: string[]) {
  const khoa = `iacc-loc-ngoai:${path}`
  const mac = (): CauHinhLoc => ({ thuTu: [], ngoai: macDinhNgoai })
  const [luu, setLuu] = useState<CauHinhLoc>(() => docKho(khoa, laCauHinh, mac()))
  useEffect(() => { setLuu(docKho(khoa, laCauHinh, mac())) }, [khoa])
  // Ô mới chưa có trong cấu hình đã lưu thì nối cuối; ô màn không còn thì bỏ
  const thuTu = [...luu.thuTu.filter(k => ds.includes(k)), ...ds.filter(k => !luu.thuTu.includes(k))]
  const cauHinh: CauHinhLoc = { thuTu, ngoai: thuTu.filter(k => luu.ngoai.includes(k)).slice(0, TOI_DA_NGOAI) }
  const dat = (moi: CauHinhLoc) => { setLuu(moi); ghiKho(khoa, moi) }
  return [cauHinh, dat] as const
}

// ── Kéo thả đổi thứ tự bằng HTML5 drag ──

function useKeoTha(ds: string[], doi: (moi: string[]) => void, khoa?: (k: string) => boolean) {
  const [keo, setKeo] = useState<string | null>(null)
  const [dich, setDich] = useState<string | null>(null)
  const xong = () => { setKeo(null); setDich(null) }
  const props = (k: string) => khoa?.(k) ? {} : {
    draggable: true,
    onDragStart: (e: DragEvent) => { setKeo(k); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', k) },
    onDragOver: (e: DragEvent) => { if (keo && keo !== k) { e.preventDefault(); setDich(k) } },
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      if (keo && keo !== k) {
        const moi = ds.filter(x => x !== keo)
        const i = moi.indexOf(k)
        // kéo xuống thì đặt sau ô đích, kéo lên thì đặt trước
        moi.splice(ds.indexOf(keo) < ds.indexOf(k) ? i + 1 : i, 0, keo)
        doi(moi)
      }
      xong()
    },
    onDragEnd: xong,
  }
  return { props, keo, dich }
}

function TayKeo() {
  return (
    <svg className="ic sm ds-tay-keo" viewBox="0 0 24 24" aria-hidden>
      <path d="M5 7h14M5 12h14M5 17h14" />
    </svg>
  )
}

function CongTac({ on, khoa, onDoi, nhan }: { on: boolean; khoa?: boolean; onDoi?: () => void; nhan: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={nhan} disabled={khoa}
      className={`ds-ct${on ? ' on' : ''}${khoa ? ' khoa' : ''}`} onClick={onDoi}>
      <i />
    </button>
  )
}

// ── Ô lọc ngoài, nút phễu mở Bộ lọc nâng cao, nút Lọc ──

export function BoLoc({ ds, cauHinh, datCauHinh, dangLoc, khacNhap, onLoc, onXoaHet }: {
  ds: OLocDef[]; cauHinh: CauHinhLoc; datCauHinh: (c: CauHinhLoc) => void
  dangLoc: boolean; khacNhap: boolean; onLoc: () => void; onXoaHet: () => void
}) {
  const { toast } = useSession()
  const [mo, setMo] = useState(false)
  const [moCauHinh, setMoCauHinh] = useState(true)
  const nut = useRef<HTMLButtonElement>(null)
  const dong = useCallback(() => setMo(false), [])
  const theoK = new Map(ds.map(o => [o.k, o]))
  const ngoai = cauHinh.ngoai.filter(k => theoK.has(k))
  const trong = cauHinh.thuTu.filter(k => !ngoai.includes(k) && theoK.has(k))
  const keo = useKeoTha(cauHinh.thuTu, thuTu => datCauHinh({ thuTu, ngoai: thuTu.filter(k => ngoai.includes(k)) }))

  const doiBat = (k: string) => {
    if (ngoai.includes(k)) datCauHinh({ ...cauHinh, ngoai: ngoai.filter(x => x !== k) })
    else if (ngoai.length >= TOI_DA_NGOAI) toast(`Chỉ đưa được tối đa ${TOI_DA_NGOAI} ô lọc ra ngoài`)
    else datCauHinh({ ...cauHinh, ngoai: cauHinh.thuTu.filter(x => x === k || ngoai.includes(x)) })
  }

  return (
    <>
      {ngoai.map(k => <ONhanVien key={k} nhan={theoK.get(k)!.ten} className={`ds-o-${k}`}>{theoK.get(k)!.o}</ONhanVien>)}
      <button ref={nut} type="button" className={`nut-vuong ds-nut-pheu${mo || dangLoc ? ' on' : ''}`} title="Bộ lọc nâng cao" aria-label="Bộ lọc nâng cao"
        aria-expanded={mo} onClick={() => setMo(o => !o)}>
        <Icon n="filter" className="ic sm" />
        {dangLoc && <span className="nut-vuong-dot" />}
      </button>
      <button type="button" className="btn pri ds-nut-loc" title={khacNhap ? 'Có điều kiện mới chưa lọc' : undefined} onClick={onLoc}>
        Lọc{khacNhap && <span className="ds-cham-nhap" />}
      </button>

      <Popover anchor={nut} open={mo} onClose={dong} align="end" width={720} role="dialog" className="ds-nc-pop">
        <div className="ds-nc-dau">
          <Icon n="filter" className="ic sm" />
          <b>Bộ lọc nâng cao</b>
          <span className="grow" />
          <button type="button" className="ds-link" onClick={onXoaHet}>Xoá tất cả</button>
          <button type="button" className="pheu-dong" title="Đóng" aria-label="Đóng" onClick={dong}><Icon n="x" className="ic sm" /></button>
        </div>
        {trong.length > 0 && (
          <div className="ds-nc-luoi">
            {trong.map(k => <ONhanVien key={k} nhan={theoK.get(k)!.ten} className={`ds-o-${k}`}>{theoK.get(k)!.o}</ONhanVien>)}
          </div>
        )}
        <div className="ds-nc-ch">
          <button type="button" className="ds-nc-ch-dau" aria-expanded={moCauHinh} onClick={() => setMoCauHinh(x => !x)}>
            <b>Cấu hình tham số lọc</b>
            <span className="ds-chip-so">{ngoai.length}</span>
            <small>tối đa chọn {TOI_DA_NGOAI} ô lọc để đưa ra bên ngoài</small>
            <span className="grow" />
            <Icon n="chevd" className={`ic sm ds-mui${moCauHinh ? ' len' : ''}`} />
          </button>
          {moCauHinh && (
            <>
              <div className="ds-goi-y">Bật để hiện ngoài, kéo để đổi thứ tự</div>
              <div className="ds-ds-keo">
                {cauHinh.thuTu.filter(k => theoK.has(k)).map(k => (
                  <div key={k} className={`ds-dong-keo${keo.keo === k ? ' dang-keo' : ''}${keo.dich === k ? ' dich' : ''}`} {...keo.props(k)}>
                    <TayKeo />
                    <span className="grow">{theoK.get(k)!.ten}</span>
                    <CongTac on={ngoai.includes(k)} nhan={`Hiện ô ${theoK.get(k)!.ten} ở ngoài`} onDoi={() => doiBat(k)} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="ds-chan">
          <button type="button" className="btn" onClick={dong}>Đóng</button>
          <button type="button" className="btn pri" onClick={() => { onLoc(); dong() }}>Lọc</button>
        </div>
      </Popover>
    </>
  )
}

// ── Cột của bảng: thứ tự, ẩn hiện, độ rộng lưu theo màn ──

/** Cột tick chọn nhiều, đứng yên bên trái */
export function cotChon(ds: Row[], chon: Set<string>, datChon: (s: Set<string>) => void, onChonTatCa?: () => void): Col {
  const tatCa = ds.length > 0 && ds.every(r => chon.has(r.id))
  return {
    k: 'chk', t: '', w: 34, dinh: 'trai',
    hd: <input type="checkbox" checked={tatCa} onChange={() => {
      const moi = tatCa ? new Set<string>() : new Set(ds.map(r => r.id))
      datChon(moi)
      if (!tatCa && ds.length > 0 && onChonTatCa) onChonTatCa()
    }} aria-label="Chọn tất cả" />,
    r: r => (
      <input type="checkbox" checked={chon.has(r.id)} onClick={e => e.stopPropagation()} aria-label={`Chọn chứng từ ${r.so}`}
        onChange={() => { const moi = new Set(chon); if (moi.has(r.id)) moi.delete(r.id); else moi.add(r.id); datChon(moi) }} />
    ),
  }
}

function IconCot() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="ic sm" style={{ color: '#0560a6' }}>
      <rect x="2" y="2" width="14" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 2v14M11.5 2v14" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function IconDongBangTrai({ on }: { on?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="ic-freeze">
      <rect x="2.5" y="3" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 3v12" stroke="currentColor" strokeWidth="1.4" />
      {on && <rect x="2.5" y="3" width="4.5" height="12" rx="1.5" fill="currentColor" />}
    </svg>
  )
}

function IconDongBangPhai({ on }: { on?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="ic-freeze">
      <rect x="2.5" y="3" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 3v12" stroke="currentColor" strokeWidth="1.4" />
      {on && <rect x="11" y="3" width="4.5" height="12" rx="1.5" fill="currentColor" />}
    </svg>
  )
}

const laBangDinh = (x: unknown): x is Record<string, 'trai' | 'phai'> =>
  typeof x === 'object' && x !== null && !Array.isArray(x) &&
  Object.values(x).every(y => y === 'trai' || y === 'phai')

/** Cột cố định nằm hai đầu theo khai báo; cột giữa theo thứ tự đã lưu, cột mới chưa lưu nối cuối */
function sapXepCot(cols: Col[], thuTu: string[], coDinh: Set<string>, dongBang: Record<string, 'trai' | 'phai'> = {}): Col[] {
  const colsDinh = cols.map(c => {
    const db = dongBang[c.k]
    if (db !== undefined) return { ...c, dinh: db }
    return c
  })
  const dauCoDinh = colsDinh.filter(c => coDinh.has(c.k) && c.dinh !== 'phai')
  const dauDinh = colsDinh.filter(c => !coDinh.has(c.k) && c.dinh === 'trai')
  const cuoiDinh = colsDinh.filter(c => c.dinh === 'phai')
  const giua = colsDinh.filter(c => !coDinh.has(c.k) && c.dinh !== 'trai' && c.dinh !== 'phai')

  const vi = (c: Col) => { const i = thuTu.indexOf(c.k); return i < 0 ? thuTu.length + cols.indexOf(c) : i }
  const dauDinhSap = [...dauDinh].sort((a, b) => vi(a) - vi(b))
  const giuaSap = [...giua].sort((a, b) => vi(a) - vi(b))
  const cuoiDinhSap = [...cuoiDinh].sort((a, b) => vi(a) - vi(b))

  return [...dauCoDinh, ...dauDinhSap, ...giuaSap, ...cuoiDinhSap]
}

export function useCotDs(path: string, cols: Col[], coDinh: Set<string>) {
  const kAn = `iacc-cot-an:${path}`, kThuTu = `iacc-cot-thu-tu:${path}`, kRong = `iacc-cot-rong:${path}`
  const kDongBang = `iacc-cot-dongbang:${path}`
  const [an, setAn] = useState<string[]>(() => docKho(kAn, laMangChu, []))
  const [thuTu, setThuTu] = useState<string[]>(() => docKho(kThuTu, laMangChu, []))
  const [rong, setRong] = useState<Record<string, number>>(() => docKho(kRong, laBangSo, {}))
  const [dongBang, setDongBang] = useState<Record<string, 'trai' | 'phai'>>(() => docKho(kDongBang, laBangDinh, {}))

  useEffect(() => {
    setAn(docKho(kAn, laMangChu, []))
    setThuTu(docKho(kThuTu, laMangChu, []))
    setRong(docKho(kRong, laBangSo, {}))
    setDongBang(docKho(kDongBang, laBangDinh, {}))
  }, [path])

  const du = sapXepCot(cols, thuTu, coDinh, dongBang)
  return {
    colsDu: du,
    colsHien: du.filter(c => coDinh.has(c.k) || !an.includes(c.k)),
    an: new Set(an),
    macDinh: cols.map(c => c.k),
    dongBang,
    /** Lưu từ hộp Tuỳ chỉnh cột. veMacDinh: đã bấm Mặc định, xoá luôn độ rộng đã kéo */
    luu: (thuTuMoi: string[], anMoi: string[], dongBangMoi: Record<string, 'trai' | 'phai'> = {}, veMacDinh = false) => {
      setThuTu(thuTuMoi); ghiKho(kThuTu, thuTuMoi)
      setAn(anMoi); ghiKho(kAn, anMoi)
      setDongBang(dongBangMoi); ghiKho(kDongBang, dongBangMoi)
      if (veMacDinh) { setRong({}); ghiKho(kRong, {}) }
    },
    datDoRongTuDong: () => {
      setRong({}); ghiKho(kRong, {})
    },
    doRong: {
      gt: rong,
      dat: (k: string, w: number) => setRong(x => { const moi = { ...x, [k]: w }; ghiKho(kRong, moi); return moi }),
    },
  }
}

// ── Hộp Tuỳ chỉnh cột hiển thị ──

const tenCot = (c: Col) => c.t || 'Ô chọn'

/** Nút thanh trượt mở hộp Tuỳ chỉnh cột hiển thị. cols: mọi cột theo thứ tự đang dùng, kể cả cột đang ẩn */
export function NutTuyChinhCot({ cols, an, coDinh, macDinh, dongBang = {}, onLuu, onDoRongTuDong }: {
  cols: Col[]; an: Set<string>; coDinh: Set<string>; macDinh: string[]
  dongBang?: Record<string, 'trai' | 'phai'>
  onLuu: (thuTu: string[], an: string[], dongBang: Record<string, 'trai' | 'phai'>, veMacDinh: boolean) => void
  onDoRongTuDong?: () => void
}) {
  const [mo, setMo] = useState(false)
  return (
    <>
      <button type="button" className={`nut-vuong ds-nut-cot${mo ? ' on' : ''}`} title="Tuỳ chỉnh cột hiển thị" aria-label="Tuỳ chỉnh cột hiển thị" onClick={() => setMo(true)}>
        <Icon n="chinh" className="ic sm" />
      </button>
      {mo && (
        <HopCot
          cols={cols}
          an={an}
          coDinh={coDinh}
          macDinh={macDinh}
          dongBang={dongBang}
          onLuu={onLuu}
          onDoRongTuDong={onDoRongTuDong}
          onDong={() => setMo(false)}
        />
      )}
    </>
  )
}

function HopCot({ cols, an, coDinh, macDinh, dongBang = {}, onLuu, onDoRongTuDong, onDong }: {
  cols: Col[]
  an: Set<string>
  coDinh: Set<string>
  macDinh: string[]
  dongBang?: Record<string, 'trai' | 'phai'>
  onLuu: (thuTu: string[], an: string[], dongBang: Record<string, 'trai' | 'phai'>, veMacDinh: boolean) => void
  onDoRongTuDong?: () => void
  onDong: () => void
}) {
  const { toast } = useSession()
  const [thuTu, setThuTu] = useState(() => cols.map(c => c.k))
  const [anNhap, setAnNhap] = useState(() => new Set(an))
  const [dongBangNhap, setDongBangNhap] = useState<Record<string, 'trai' | 'phai'>>(() => ({ ...dongBang }))
  const [veMacDinh, setVeMacDinh] = useState(false)
  const theoK = new Map(cols.map(c => [c.k, c]))
  const keo = useKeoTha(thuTu, setThuTu, k => coDinh.has(k))
  useDongEsc(onDong)

  const soHien = thuTu.filter(k => coDinh.has(k) || !anNhap.has(k)).length
  const doiAn = (k: string) => setAnNhap(x => { const moi = new Set(x); if (moi.has(k)) moi.delete(k); else moi.add(k); return moi })

  const doiDongBang = (k: string, huong: 'trai' | 'phai') => {
    setDongBangNhap(prev => {
      const next = { ...prev }
      if (next[k] === huong) {
        delete next[k]
      } else {
        next[k] = huong
      }
      return next
    })
  }

  const hienTatCa = () => {
    setAnNhap(new Set())
  }

  const khoiPhucMacDinh = () => {
    setThuTu(macDinh.filter(k => theoK.has(k)))
    setAnNhap(new Set())
    setDongBangNhap({})
    setVeMacDinh(true)
    toast('Đã khôi phục cài đặt cột mặc định')
  }

  const doRongTuDong = () => {
    onDoRongTuDong?.()
    toast('Đã đặt lại độ rộng tự động cho các cột')
  }

  const handleXong = () => {
    onLuu(thuTu, [...anNhap].filter(k => !coDinh.has(k)), dongBangNhap, veMacDinh)
    onDong()
  }

  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop ds-hop-cot" role="dialog" aria-modal="true" aria-label="Cột hiển thị">
        <div className="ds-hop-dau">
          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <IconCot />
            <b>Cột hiển thị</b>
            <span className="ds-dem-cot-badge">{soHien}/{thuTu.length}</span>
          </div>
          <span className="grow" />
          <button type="button" className="ds-link-hien-het" onClick={hienTatCa}>
            Hiện tất cả
          </button>
          <button type="button" className="pheu-dong" title="Đóng" aria-label="Đóng" onClick={onDong}>
            <Icon n="x" className="ic sm" />
          </button>
        </div>

        <div className="ds-hop-huong-dan">
          Bật để hiện cột, kéo để đổi thứ tự, bấm <span className="ds-freeze-demo"><IconDongBangTrai on /></span> / <span className="ds-freeze-demo"><IconDongBangPhai on /></span> để đóng băng cột bên trái / bên phải (cuộn ngang vẫn đứng yên). Đổi độ rộng: kéo mép phải tiêu đề cột trên bảng, bấm đúp mép để về tự động.
        </div>

        <div className="ds-ds-keo ds-hop-ds">
          {thuTu.map(k => {
            const c = theoK.get(k)
            if (!c) return null
            const khoa = coDinh.has(k)
            const dangDinhTrai = dongBangNhap[k] === 'trai' || (!dongBangNhap[k] && c.dinh === 'trai')
            const dangDinhPhai = dongBangNhap[k] === 'phai' || (!dongBangNhap[k] && c.dinh === 'phai')
            const dangBat = khoa || !anNhap.has(k)
            return (
              <div
                key={k}
                className={`ds-dong-keo${khoa ? ' co-dinh' : ''}${keo.keo === k ? ' dang-keo' : ''}${keo.dich === k ? ' dich' : ''}`}
                {...keo.props(k)}
              >
                <TayKeo />
                <span className="grow ds-ten-cot">{tenCot(c)}</span>
                <div className="ds-nhom-dong-bang">
                  <button
                    type="button"
                    className={`ds-btn-freeze${dangDinhTrai ? ' on' : ''}`}
                    title={dangDinhTrai ? 'Bỏ đóng băng bên trái' : 'Đóng băng bên trái'}
                    aria-label={`Đóng băng trái cột ${tenCot(c)}`}
                    onClick={() => doiDongBang(k, 'trai')}
                  >
                    <IconDongBangTrai on={dangDinhTrai} />
                  </button>
                  <button
                    type="button"
                    className={`ds-btn-freeze${dangDinhPhai ? ' on' : ''}`}
                    title={dangDinhPhai ? 'Bỏ đóng băng bên phải' : 'Đóng băng bên phải'}
                    aria-label={`Đóng băng phải cột ${tenCot(c)}`}
                    onClick={() => doiDongBang(k, 'phai')}
                  >
                    <IconDongBangPhai on={dangDinhPhai} />
                  </button>
                </div>
                <CongTac
                  on={dangBat}
                  khoa={khoa}
                  nhan={`Hiện cột ${tenCot(c)}`}
                  onDoi={() => doiAn(k)}
                />
              </div>
            )
          })}
        </div>

        <div className="ds-chan">
          <button type="button" className="btn" onClick={khoiPhucMacDinh}>
            Khôi phục mặc định
          </button>
          <button type="button" className="btn" onClick={doRongTuDong}>
            Độ rộng tự động
          </button>
          <span className="grow" />
          <button type="button" className="btn pri" onClick={handleXong}>
            Xong
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** Esc đóng hộp thoại. Nghe ở window, không ở pha capture, để menu đang mở được đóng trước (docs/BAY.md) */
function useDongEsc(onDong: () => void) {
  useEffect(() => {
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') onDong() }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [onDong])
}

// ── Thao tác hàng loạt ──

//** Nút biểu tượng thao tác hàng loạt (34x34) theo trạng thái các phiếu đã tick (T43) */
export function NutHangLoat({
  selectedRows,
  ghi,
  onBoChon,
  onXoa,
  open,
  onOpenChange,
  onIn,
}: {
  selectedRows: Row[]
  ghi: boolean
  onBoChon: () => void
  onXoa?: (ids: string[]) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onIn?: () => void       // mở khung xem trước bản in các phiếu đang chọn; không truyền thì chỉ báo
}) {
  const { toast } = useSession()
  const [moLocal, setMoLocal] = useState(false)
  const [hoiXoa, setHoiXoa] = useState(false)
  const nut = useRef<HTMLButtonElement>(null)

  const isControlled = open !== undefined && onOpenChange !== undefined
  const mo = isControlled ? open : moLocal
  const setMo = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    if (isControlled) {
      const next = typeof val === 'function' ? (val as (prev: boolean) => boolean)(open) : val
      onOpenChange(next)
    } else {
      setMoLocal(val)
    }
  }, [isControlled, open, onOpenChange])

  const so = selectedRows.length
  useEffect(() => {
    if (so === 0 && mo) setMo(false)
  }, [so, mo, setMo])

  const nhapRows = selectedRows.filter(r => r.tt === 'nhap')
  const ghiRows = selectedRows.filter(r => r.tt === 'ghi')
  const loiRows = selectedRows.filter(r => r.tt === 'loi')
  const nNhap = nhapRows.length
  const nGhi = ghiRows.length
  const nLoi = loiRows.length
  // Xoá: gói có ghi sổ chỉ xoá phiếu chưa ghi, gói Free xoá mọi phiếu; phiếu thuộc kỳ đã khoá sổ không xoá (T48)
  const nKhoa = selectedRows.filter(r => daKhoaSo(r.ngay)).length
  // Phiếu mua, bán còn phiếu thu, chi sinh kèm thì xoá phiếu thu, chi trước (T85)
  const nThamChieu = selectedRows.filter(r => ctTtCon(r)).length
  const dsXoa = selectedRows.filter(r => !daKhoaSo(r.ngay) && (!ghi || r.tt === 'nhap') && !ctTtCon(r))
  const nXoa = dsXoa.length
  const tenXoa = `Xoá ${nXoa} phiếu${ghi ? ' chưa ghi' : ''}`

  const lam = (m: string) => {
    toast(m)
    setMo(false)
    onBoChon()
  }

  return (
    <>
      <button
        ref={nut}
        type="button"
        className={`nut-vuong ds-nut-hang-loat${mo ? ' on' : ''}`}
        disabled={so === 0}
        title="Thao tác hàng loạt"
        aria-label="Thao tác hàng loạt"
        aria-haspopup="menu"
        aria-expanded={mo}
        onClick={() => setMo(o => !o)}
      >
        <Icon n="layers" className="ic sm" />
        {so > 0 && <span className="ds-nut-badge">{so}</span>}
      </button>
      <Popover anchor={nut} open={mo && so > 0} onClose={() => setMo(false)} align="end" width={240}>
        <MenuHead>Hàng loạt ({so} đã chọn)</MenuHead>
        {ghi && nNhap > 0 && (
          <MenuItem icon="check" onClick={() => lam(`Đã ghi sổ ${nNhap} phiếu`)}>
            Ghi sổ {nNhap} phiếu chưa ghi
          </MenuItem>
        )}
        {ghi && nGhi > 0 && (
          <MenuItem icon="back" onClick={() => lam(`Đã bỏ ghi sổ ${nGhi} phiếu`)}>
            Bỏ ghi sổ {nGhi} phiếu đã ghi
          </MenuItem>
        )}
        {nLoi > 0 && (
          <MenuItem icon="alert" onClick={() => lam(`Xem lỗi ${nLoi} phiếu`)}>
            Xem lỗi {nLoi} phiếu
          </MenuItem>
        )}
        <MenuItem icon="printer" onClick={() => { if (onIn) { setMo(false); onIn() } else lam(`In ${so} phiếu`) }}>
          In {so} phiếu
        </MenuItem>
        <MenuItem icon="download" onClick={() => lam(`Đã xuất ${so} phiếu ra Excel`)}>
          Xuất Excel {so} phiếu
        </MenuItem>
        {nXoa > 0 && (
          <MenuItem icon="trash" danger onClick={() => { setMo(false); setHoiXoa(true) }}>
            {tenXoa}
          </MenuItem>
        )}
        {nXoa === 0 && nKhoa === 0 && nThamChieu > 0 && (
          <MenuItem icon="trash" lock onClick={() => lam('Phiếu có phiếu thu, chi tham chiếu: xoá phiếu thu, chi trước')}>
            Không xoá: còn phiếu thu, chi tham chiếu
          </MenuItem>
        )}
        {nXoa === 0 && nKhoa > 0 && (
          <MenuItem icon="trash" lock onClick={() => lam(`Phiếu thuộc kỳ đã khoá sổ, không xoá được`)}>
            Không xoá: kỳ đã khoá sổ
          </MenuItem>
        )}
        <MenuSep />
        <MenuItem icon="x" onClick={() => { setMo(false); onBoChon() }}>
          Bỏ chọn
        </MenuItem>
      </Popover>
      {hoiXoa && (
        <HopXacNhan
          tieuDe={`${tenXoa}?`}
          nut={tenXoa}
          onDong={() => setHoiXoa(false)}
          onDongY={() => {
            setHoiXoa(false)
            onXoa?.(dsXoa.map(r => String(r.id)))
            lam(`Đã xoá ${nXoa} phiếu`)
          }}
        >
          Phiếu đã xoá không lấy lại được.{ghi && ' Phiếu đã ghi sổ không xoá được.'}{nKhoa > 0 && ` ${nKhoa} phiếu thuộc kỳ đã khoá sổ, giữ nguyên.`}{nThamChieu > 0 && ` ${nThamChieu} phiếu còn phiếu thu, chi tham chiếu, giữ nguyên; xoá phiếu thu, chi trước.`}
        </HopXacNhan>
      )}
    </>
  )
}

export function HopXacNhan({ tieuDe, nut, children, onDong, onDongY }: { tieuDe: string; nut: string; children: ReactNode; onDong: () => void; onDongY: () => void }) {
  useDongEsc(onDong)
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop ds-hop-nho" role="alertdialog" aria-modal="true" aria-label={tieuDe}>
        <div className="ds-hop-dau"><b>{tieuDe}</b></div>
        <p className="ds-hop-than">{children}</p>
        <div className="ds-chan">
          <span className="grow" />
          <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          <button type="button" className="btn pri ds-nut-xoa" autoFocus onClick={onDongY}>{nut}</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
