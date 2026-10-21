// Thẻ chi phí phân bổ 8.1.1: một thẻ dùng chung cho chi phí trả trước, CCDC, TSCĐ; hai kiểu thẻ: ghi tăng trong kỳ và dư đầu kỳ.
// Một thẻ có nhiều dòng (tab Chi tiết phân bổ), mỗi dòng phân bổ riêng ra các kỳ (tab Đã phân bổ).
// Mã từng dòng tự sinh theo loại thẻ (CPTT.0001, CCDC.0001, TSCD.0001), người dùng gõ lại được. Số trên thẻ theo kiểu quốc tế.
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import type { CauHinhDM } from '../danh-muc/truong-dm'
import type { Row } from '../types'
import type { Goi } from '../../app/plan'
import { St, Table } from '../../ui/Table'
import { ChonDanhMuc } from '../../ui/ChonDanhMuc'
import { CCDC_HANG, daKhoaSo, khoaSoDenCua } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { docSoQT, nhapSoQT, soQT } from '../../ui/format'
import { ONgay } from '../../ui/ChonNgay'
import { Popover } from '../../ui/Dropdown'

export const LOAI_THE: Record<string, { tienTo: string; muc: string }> = {
  'Chi phí trả trước': { tienTo: 'CPTT', muc: 'mục chi phí' },
  'Công cụ dụng cụ': { tienTo: 'CCDC', muc: 'CCDC' },
  'Tài sản cố định': { tienTo: 'TSCD', muc: 'TSCĐ' },
}

type V = Record<string, any>
/** Một dòng chi tiết phân bổ của thẻ */
export interface DongPb {
  ma?: string; ten?: string; dvt?: string; sl?: unknown; dg?: unknown; gt?: unknown
  da?: unknown; kyDa?: unknown; ky?: unknown; soHieu?: string; moTa?: string
  ngayPb?: string                   // ngày bắt đầu phân bổ của dòng (T159)
  ngung?: boolean; ngayNgung?: string   // ngừng phân bổ từng dòng; gói Free, Standard chọn tháng, lưu ngày cuối tháng (T159)
  _maTay?: boolean                  // mã người dùng tự gõ, không sinh lại
  _pbSua?: Record<number, string>   // số tiền gõ lại ở từng kỳ (tab Đã phân bổ)
}

const laCcdc = (v: V) => v.loai === 'Công cụ dụng cụ'
const laDau = (v: V) => v._kieu === 'dau'
const laTscd = (v: V) => v.loai === 'Tài sản cố định'
const muc = (v: V) => LOAI_THE[v.loai]?.muc ?? 'mục chi phí/CCDC/TSCĐ'

const pad = (n: number, d = 2) => String(n).padStart(d, '0')
const so = docSoQT
const homNay = () => { const d = new Date(); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` }
const ngaySo = (d: string) => { const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); return m ? +m[3] * 10000 + +m[2] * 100 + +m[1] : NaN }
/** Ngày cuối tháng của năm, tháng; gói Free, Standard nhập ngừng phân bổ theo tháng */
const cuoiThang = (y: number, m: number) => `${pad(new Date(y, m, 0).getDate())}/${pad(m)}/${y}`
const theoThang = (goi: Goi) => goi === 'F' || goi === 'S'
/** Khống chế ngay khi chọn ngày (T296): ngày đủ dd/mm/yyyy mà sớm hơn mốc thì trả về mốc; gõ dở thì giữ nguyên */
const khongTruoc = (s: string, moc: string) => ngaySo(s) < ngaySo(moc) ? moc : s
/** Ngày cuối tháng của một ngày dd/mm/yyyy (mốc cho tháng ngừng phân bổ) */
const cuoiThangCua = (d: string) => { const [, m, y] = d.split('/').map(Number); return m && y ? cuoiThang(y, m) : '' }
/** Ngày bắt đầu phân bổ của dòng; thẻ cũ chưa có ở dòng thì lấy của thẻ */
const ngayBd = (v: V, d: DongPb) => String(d.ngayPb ?? v.ngayPb ?? '')

/** Lịch phân bổ đều: mỗi kỳ là ngày cuối tháng, từ tháng của ngày bắt đầu; kỳ cuối nhận phần lẻ do làm tròn */
function lichPhanBo(tong: number, ky: number, ngayBd: string): { ngay: string; tien: number }[] {
  const m = ngayBd.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m || tong <= 0 || ky <= 0 || ky > 600) return []
  const moiKy = Math.round(tong / ky)
  return Array.from({ length: ky }, (_, i) => {
    const cuoi = new Date(+m[3], +m[2] - 1 + i + 1, 0)
    return { ngay: `${pad(cuoi.getDate())}/${pad(cuoi.getMonth() + 1)}/${cuoi.getFullYear()}`, tien: i < ky - 1 ? moiKy : tong - moiKy * (ky - 1) }
  })
}

/** Tháng hiện tại theo ngày máy, dạng yyyymm: kỳ tới tháng này là Đã phân bổ, kỳ sau là Chờ phân bổ (T590) */
export const kyNay = () => { const n = new Date(); return n.getFullYear() * 100 + n.getMonth() + 1 }

/** Số tự tính của một dòng: cần phân bổ = số tiền (thẻ dư đầu kỳ trừ phần đã phân bổ), số tháng còn, số tiền mỗi kỳ */
export function tinhDong(v: V, d: DongPb) {
  const can = so(d.gt) - (laDau(v) ? so(d.da) : 0)
  const kyCon = laDau(v) ? Math.max(0, so(d.ky) - so(d.kyDa)) : so(d.ky)
  return { can, kyCon, tienKy: kyCon > 0 ? Math.round(can / kyCon) : 0 }
}

/** Lịch phân bổ đang dùng của một dòng: đè số tiền gõ lại, đánh dấu ngừng các kỳ từ ngày ngừng của dòng */
export function lichDong(v: V, d: DongPb) {
  const { can, kyCon } = tinhDong(v, d)
  const ngung = d.ngung ? ngaySo(String(d.ngayNgung ?? '')) : NaN
  const lich = lichPhanBo(can, kyCon, ngayBd(v, d)).map((k, j) => ({
    ...k,
    tien: d._pbSua?.[j] !== undefined ? so(d._pbSua[j]) : k.tien,
    nhap: d._pbSua?.[j] as string | undefined,
    ngung: ngaySo(k.ngay) >= ngung,
  }))
  // Ngừng phân bổ (T296): các kỳ từ tháng ngừng về 0; kỳ liền trước tháng ngừng nhận toàn bộ giá trị còn lại của dòng.
  // Ngừng ngay kỳ đầu (không có kỳ trước) thì kỳ đầu nhận hết, còn lại về 0
  const cuoi = lich.findIndex(k => k.ngung) - 1
  if (lich.some(k => k.ngung)) {
    const j = Math.max(0, cuoi)
    const truoc = lich.slice(0, j).reduce((t, k) => t + k.tien, 0)
    return lich.map((k, i) => i === j ? { ...k, tien: can - truoc, nhap: undefined, ngung: false, don: true }
      : i > j ? { ...k, tien: 0, nhap: undefined, ngung: true } : k)
  }
  return lich
}

/** Đã phân bổ tới hết kỳ (yyyymm): phần đã phân bổ trước (thẻ dư đầu kỳ) cộng các kỳ còn hiệu lực tới kỳ đó */
export function daPhanBoToiKy(the: V, ky: number, goi?: Goi): number {
  return (the.dong as DongPb[] ?? []).reduce((tong, d) => tong + (laDau(the) ? so(d.da) : 0)
    + lichDong(the, d).filter(k => { const t = Math.floor(ngaySo(k.ngay) / 100); return !k.ngung && t <= ky && kyTinh(the, goi, t) }).reduce((s, k) => s + k.tien, 0), 0)
}

// ── Kích hoạt phân bổ gói Plus, Pro (T438): bút toán từng kỳ của lịch phân bổ đã hạch toán sẵn, nút Phân bổ ở danh sách thẻ
// chỉ bật trạng thái Đã phân bổ cho kỳ đang xem (khoá soThe|yyyymm), giữ trong phiên. Gói Free, Standard: kỳ tới đâu tính tới đó như cũ
const daKichHoat = new Set<string>()
let banPb = 0
const ngePb = new Set<() => void>()
/** Gói có bước kích hoạt phân bổ (Plus, Pro) */
export const canKichHoat = (goi: Goi) => goi === 'PL' || goi === 'PR'
/** Kỳ yyyymm của thẻ đã kích hoạt phân bổ */
export const daPhanBoKy = (soThe: unknown, ky: number) => daKichHoat.has(`${soThe}|${ky}`)
/** Kích hoạt phân bổ kỳ yyyymm cho các thẻ; trả số thẻ mới kích hoạt */
export function kichHoatPhanBo(soThe: string[], ky: number): number {
  const moi = soThe.filter(x => !daPhanBoKy(x, ky))
  moi.forEach(x => daKichHoat.add(`${x}|${ky}`))
  if (moi.length) { banPb++; ngePb.forEach(f => f()) }
  return moi.length
}
/** Xoá phân bổ kỳ yyyymm của các thẻ: trạng thái kỳ đó về Chờ phân bổ; trả số thẻ đã bỏ kích hoạt */
export function boKichHoatPhanBo(soThe: string[], ky: number): number {
  const bo = soThe.filter(x => daPhanBoKy(x, ky))
  bo.forEach(x => daKichHoat.delete(`${x}|${ky}`))
  if (bo.length) { banPb++; ngePb.forEach(f => f()) }
  return bo.length
}
/** Số phiên bản trạng thái kích hoạt, để màn vẽ lại khi bấm Phân bổ */
export function useBanPhanBo() {
  return useSyncExternalStore(f => { ngePb.add(f); return () => { ngePb.delete(f) } }, () => banPb)
}
/** Kỳ tính vào đã phân bổ: gói Plus, Pro chỉ kỳ đã kích hoạt */
const kyTinh = (v: V, goi: Goi | undefined, ky: number) => !goi || !canKichHoat(goi) || daPhanBoKy(v.soThe, ky)

/** Đã phân bổ tới tháng hiện tại theo ngày máy và còn lại hiện tại của một dòng (T437); gói Plus, Pro chỉ cộng kỳ Đã phân bổ (T438) */
export function hienTaiDong(v: V, d: DongPb, goi?: Goi) {
  const n = new Date(), kyHt = n.getFullYear() * 100 + n.getMonth() + 1
  const daHt = (laDau(v) ? so(d.da) : 0) + lichDong(v, d).filter(k => { const t = Math.floor(ngaySo(k.ngay) / 100); return !k.ngung && t <= kyHt && kyTinh(v, goi, t) }).reduce((s, k) => s + k.tien, 0)
  return { daHt, conHt: so(d.gt) - daHt }
}

/** Thẻ xoá được khi kỳ khoá sổ còn trước tháng bắt đầu phân bổ đầu tiên của thẻ (T439); trả câu báo nếu không xoá được */
export function lyDoKhongXoaThe(v: V): string | null {
  const ngay = [...(v.dong as DongPb[] ?? []).map(d => ngayBd(v, d)), String(v.ngay ?? '')].filter(x => /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(x))
  if (!ngay.length) return null
  const dau = ngay.reduce((a, b) => ngaySo(a) <= ngaySo(b) ? a : b)
  if (!daKhoaSo(dau, v.cn)) return null
  const k = khoaSoDenCua(v.cn)   // mốc khoá của cửa hàng trên thẻ (T19)
  const t = dau.slice(3)
  return `Thẻ ${v.soThe} phân bổ từ tháng ${t}, thuộc kỳ đã khoá sổ (đến hết tháng ${k.thang}/${k.nam}). Mở khoá sổ về trước tháng ${t} rồi mới xoá được.`
}

/** Hậu xử lý dòng danh sách thẻ theo gói (T438): gói Plus, Pro cột Phân bổ trong kỳ chỉ có giá trị khi kỳ đang xem Đã phân bổ */
export function useKyNayTheoGoi(_ky: number, goi: Goi) {
  const ban = useBanPhanBo()
  // Đã phân bổ, Còn lại cũng chỉ cộng các kỳ đã kích hoạt tới kỳ đang xem, bấm Phân bổ xong thì tính lại
  return useCallback((r: Row): Row => {
    if (!canKichHoat(goi)) return r
    const ky = Number(r._ky), da = daPhanBoToiKy(r as V, ky, goi)
    return { ...r, _kyNayGoc: r.kyNay, kyNay: daPhanBoKy(r.soThe, ky) ? r.kyNay : 0, da, con: Number(r.gt) - da, _ban: ban }
  }, [goi, ban])
}

/** Bảng chi tiết phân bổ chi phí: mỗi dòng của thẻ một hàng, phân bổ trong kỳ (yyyymm), luỹ kế tới hết kỳ, còn lại */
export function bangPhanBo(the: V, ky: number): Row[] {
  return (the.dong as DongPb[] ?? []).map(d => {
    const lich = lichDong(the, d).filter(k => !k.ngung)
    const thang = (k: { ngay: string }) => Math.floor(ngaySo(k.ngay) / 100)
    const kyNay = lich.filter(k => thang(k) === ky).reduce((s, k) => s + k.tien, 0)
    const luyKe = (laDau(the) ? so(d.da) : 0) + lich.filter(k => thang(k) <= ky).reduce((s, k) => s + k.tien, 0)
    return { soThe: the.soThe, loai: the.loai, ma: d.ma, ten: d.ten, ngayPb: ngayBd(the, d), gt: so(d.gt), soKy: so(d.ky), kyNay, luyKe, con: so(d.gt) - luyKe }
  })
}

/** Khung xem nhanh ở danh sách thẻ: các dòng chi tiết phân bổ của thẻ, chỉ xem */
export function veChiTietThe(the: V) {
  const rows = (the.dong as DongPb[] ?? []).map((d, i) => ({ ...d, ...tinhDong(the, d), ngayPb: ngayBd(the, d), _stt: i + 1 }))
  const tong = (k: string) => rows.reduce((s, r) => s + so((r as Row)[k]), 0)
  return (
    <Table motDong rows={rows} sum={{ ten: 'Cộng', gt: tong('gt'), tienKy: tong('tienKy') }} cols={[
      { k: '_stt', t: 'STT', c: true, w: 50 },
      { k: 'ma', t: `Mã ${muc(the)}`, w: 120 },
      { k: 'ten', t: `Tên ${muc(the)}` },
      ...(laCcdc(the) ? [{ k: 'dvt', t: 'ĐVT', w: 70 }] : []),
      { k: 'gt', t: 'Số tiền', num: true, w: 150 },
      { k: 'ky', t: 'Số tháng phân bổ', num: true, w: 130 },
      { k: 'tienKy', t: 'Số tiền phân bổ hằng kỳ', num: true, w: 170 },
      { k: 'ngayPb', t: 'Ngày bắt đầu phân bổ', w: 150 },
    ]} />
  )
}

/** Sinh mã cho các dòng chưa gõ tay: nối tiếp số lớn nhất của các thẻ cùng loại */
function capMa(v: V, the: Row[]): DongPb[] {
  const tt = LOAI_THE[v.loai]
  const dong: DongPb[] = v.dong ?? []
  // CCDC chọn mã từ danh mục hàng hoá: bỏ mã tự sinh, giữ mã đã chọn
  if (laCcdc(v)) return dong.map(d => d._maTay ? d : { ...d, ma: undefined })
  if (!tt) return dong
  let n = Math.max(0, ...the.filter(t => t.loai === v.loai && t.soThe !== v.soThe)
    .flatMap(t => (t.dong as DongPb[] ?? []).map(d => Number(String(d.ma).match(/\d+$/)?.[0] ?? 0))))
  // Đổi từ CCDC sang loại khác: mã chọn từ danh mục hàng hoá cũng sinh lại
  return dong.map(d => d._maTay && !CCDC_HANG.some(h => h.ma === d.ma) ? d : { ...d, ma: `${tt.tienTo}.${pad(++n, 4)}`, dvt: undefined, _maTay: false })
}

/** Ô nhập trong lưới: số kiểu quốc tế hoặc chữ, ngày có lịch (T149) */
export function ONhap({ v, so: laSo, ten, onDoi, chiDoc }: { v: unknown; so?: boolean; ten: string; onDoi?: (s: string) => void; chiDoc?: boolean }) {
  if (ten.startsWith('Ngày')) {
    return (
      <ONgay
        className="pb-o"
        ariaLabel={ten}
        readOnly={chiDoc}
        value={String(v ?? '')}
        placeholder="dd/mm/yyyy"
        onChange={s => onDoi?.(s)}
      />
    )
  }
  return (
    <input className={`inp pb-o${laSo ? ' pn-tien' : ''}`} aria-label={ten} readOnly={chiDoc}
      value={laSo ? soQT(v) : String(v ?? '')}
      onChange={e => onDoi?.(laSo ? nhapSoQT(e.target.value) : e.target.value)} />
  )
}

/** Đánh số thẻ theo Cấu hình kế toán (T284): thẻ ghi tăng TPB{YY}{MM}-{0000}, thẻ dư đầu kỳ TPBDK{YY}{MM}-{0000};
 *  YY, MM theo ngày ghi tăng, số thứ tự nối tiếp số lớn nhất cùng tiền tố, cùng tháng */
export const TIEN_TO_THE = { the: 'TPB', dau: 'TPBDK' }
export function soTheKeTiep(daCo: unknown[], kieu: 'the' | 'dau', ngay: string): string {
  const [, mm, yy] = ngay.split('/')
  if (!mm || !yy) return ''
  const dau = `${TIEN_TO_THE[kieu]}${yy.slice(2)}${pad(+mm)}-`
  const n = Math.max(0, ...daCo.map(String).filter(s => s.startsWith(dau) && /^\d+$/.test(s.slice(dau.length))).map(s => +s.slice(dau.length)))
  return `${dau}${pad(n + 1, 4)}`
}

/** Ngày ngừng mặc định khi tích: hôm nay (gói Free, Standard: cuối tháng này), không sớm hơn ngày bắt đầu phân bổ */
function ngayNgungMd(bd: string, thang: boolean): string {
  const d = new Date(), hn = thang ? cuoiThang(d.getFullYear(), d.getMonth() + 1) : homNay()
  if (!(ngaySo(bd) > ngaySo(hn))) return hn
  const [, m, y] = bd.split('/').map(Number)
  return thang ? cuoiThang(y, m) : bd
}

/** Ô nhập tháng trong lưới: gõ mm/yyyy hoặc bấm mở bảng 12 tháng theo năm; lưu ngày cuối tháng dd/mm/yyyy, gõ dở thì lưu rỗng để báo lỗi khi lưu (T159, T165) */
function OThang({ v, ten, onDoi }: { v: unknown; ten: string; onDoi: (s: string) => void }) {
  const m = String(v ?? '').match(/^\d{1,2}\/(\d{1,2})\/(\d{4})$/)
  const [go, setGo] = useState(m ? `${pad(+m[1])}/${m[2]}` : '')
  // Giá trị bị khống chế đổi từ ngoài (vd về tháng bắt đầu phân bổ) thì ô hiện theo (T296)
  useEffect(() => { if (m) setGo(`${pad(+m[1])}/${m[2]}`) }, [String(v ?? '')])
  const [mo, setMo] = useState(false)
  const [nam, setNam] = useState(m ? +m[2] : new Date().getFullYear())
  const o = useRef<HTMLDivElement>(null)
  const chon = (t: number, y: number) => { setGo(`${pad(t)}/${y}`); onDoi(cuoiThang(y, t)); setMo(false) }
  return (
    <div className="ct-ngay" ref={o}>
      <input className="inp pb-o" aria-label={ten} placeholder="mm/yyyy" value={go} onClick={() => setMo(true)}
        onChange={e => {
          setGo(e.target.value)
          const t = e.target.value.match(/^(\d{1,2})\/(\d{4})$/)
          onDoi(t && +t[1] >= 1 && +t[1] <= 12 ? cuoiThang(+t[2], +t[1]) : '')
        }} />
      <button type="button" className="ct-ngay-nut" title="Chọn tháng" aria-label={`Chọn tháng ${ten}`} tabIndex={-1} onClick={() => setMo(x => !x)}>
        <Icon n="calendar" className="ic sm" />
      </button>
      {/* Bảng 12 tháng như chế độ chọn tháng của bộ lọc kỳ (kn-*) */}
      <Popover anchor={o} open={mo} onClose={() => setMo(false)} align="start" width={272} className="dp-pop">
        <div className="pb-thang-pop">
          <div className="kn-dau">
            <button type="button" className="kn-nav-btn" onClick={() => setNam(y => y - 1)} title="Lùi 1 năm">«</button>
            <span className="kn-dau-ten">Năm {nam}</span>
            <button type="button" className="kn-nav-btn" onClick={() => setNam(y => y + 1)} title="Tiến 1 năm">»</button>
          </div>
          <div className="kn-luoi-thang">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(t => (
              <button key={t} type="button" className={`kn-thang-btn${m && +m[1] === t && +m[2] === nam ? ' on' : ''}`} onClick={() => chon(t, nam)}>Thg {t}</button>
            ))}
          </div>
        </div>
      </Popover>
    </div>
  )
}

export const THE_PHAN_BO: CauHinhDM = {
  ten: 'thẻ chi phí phân bổ',
  moTa: 'Dùng cho các khoản chi phí cần phân bổ: Tài sản cố định, Công cụ dụng cụ, chi phí trả trước',
  toanMan: { icon: 'phanbo' },
  // Tiện ích (T297): thẻ ghi tăng, thẻ dư đầu kỳ đều xoá được; chỉ thẻ dư đầu kỳ sao chép (giữ dòng, bỏ ngừng phân bổ, số thẻ đánh mới)
  tienIch: {
    xoa: () => true,
    chanXoa: v => lyDoKhongXoaThe(v),   // kỳ đã khoá sổ chứa kỳ phân bổ của thẻ thì không xoá (T439)
    saoChep: v => !laDau(v) ? null : {
      loai: v.loai, ngayPb: v.ngayPb, soCt: v.soCt, ngayCt: v.ngayCt, ghiChuCt: v.ghiChuCt,
      dong: (v.dong as DongPb[] ?? []).map(d => ({ ...d, ngung: undefined, ngayNgung: undefined, _pbSua: undefined })),
    },
  },
  soQuocTe: true,
  // Hai kiểu thẻ: thẻ ghi tăng trong kỳ, thẻ dư đầu kỳ (khai phần đã phân bổ trước khi dùng phần mềm)
  bien: [
    // Gói Free: nút Ghi tăng mở form tạo thẻ mới (T421); gói trên: Ghi tăng mở danh sách khoản chờ ghi tăng (T436).
    // Thẻ từ phiếu chi chờ phân bổ vẫn tự mở khi lưu phiếu ở mọi gói (T419)
    { k: 'the', ten: 'thẻ chi phí phân bổ', nut: 'Ghi tăng', icon: 'grid', goi: ['F'] },
    { k: 'dau', ten: 'thẻ chi phí phân bổ dư đầu kỳ', nut: 'Ghi tăng dư đầu kỳ', icon: 'clock', menu: 'Ghi tăng đầu kỳ' },
  ],
  khoi: [{
    ten: 'Thông tin chung',
    anDau: true,   // bỏ thanh tiêu đề, nhường chỗ cho lưới chi tiết (T165)
    truong: [
      // Loại thẻ, Ngày ghi tăng, Số thẻ; thẻ thường ghi tăng từ ngày đầu năm, thẻ dư đầu kỳ trước ngày đầu năm.
      // Ngày bắt đầu phân bổ, ngừng phân bổ nhập theo từng dòng ở tab Chi tiết phân bổ (T159)
      { k: 'loai', nhan: 'Loại thẻ', kieu: 'chon', batBuoc: true, ds: Object.keys(LOAI_THE) },
      // Sửa thẻ ghi tăng có sẵn: ngày ghi tăng chỉ đọc (theo chứng từ gốc) (T165)
      { k: 'ngay', nhan: 'Ngày ghi tăng', kieu: 'ngay', batBuoc: true, dauNam: v => laDau(v) ? 'truoc' : 'tu', chiDoc: v => !laDau(v) && Boolean(v._sua) },
      { k: 'soThe', nhan: 'Số thẻ', kieu: 'chu', batBuoc: true, chiDoc: true },
    ],
  }, {
    ten: 'Chi tiết phân bổ',
    truong: [],
    bang: (v, doi, goi, xem) => {
      const dong: DongPb[] = v.dong ?? []
      const thang = theoThang(goi)
      // Đang xem: ô hiện chữ trơn như bảng chi tiết phiếu chi, bấm Sửa mới hiện ô nhập (T287)
      const SO = new Set(['sl', 'dg', 'gt', 'da', 'kyDa', 'ky', 'kyCon', 'can', 'tienKy', 'daHt', 'conHt'])
      const chu = (k: string, r: Row) => SO.has(k) ? soQT(r[k]) : String(r[k] ?? '')
      // Sửa thẻ ghi tăng có sẵn: số tiền chỉ đọc theo chứng từ gốc; CCDC sửa số lượng thì đơn giá = số tiền / số lượng (T165)
      // Thẻ tạo từ phiếu chi (_goc) cũng khoá số tiền theo chứng từ gốc (T296)
      const khoaTien = !laDau(v) && (Boolean(v._sua) || Boolean(v._goc))
      const sua = (i: number, p: Partial<DongPb>, giuLich = false) =>
        doi('dong', dong.map((d, j) => j === i ? { ...d, ...p, ...(giuLich ? {} : { _pbSua: undefined }) } : d))
      // CCDC khoá số tiền chưa có đơn giá (vd vừa tạo từ phiếu chi, số lượng 1): đơn giá = số tiền / số lượng (T296)
      const rows: Row[] = dong.map((d, i) => ({ ...d, ...(laCcdc(v) && khoaTien && (d.dg === undefined || d.dg === '') && so(d.sl) > 0 ? { dg: Math.round(so(d.gt) / so(d.sl)) } : {}), ...tinhDong(v, d), ...hienTaiDong(v, d, goi), _i: i }))
      // Dòng Cộng (không có _i) chỉ hiện chữ, không vẽ ô nhập
      const o = (k: keyof DongPb, ten: string, laSo = true, giuLich = false) => (r: Row) => r._i === undefined ? <b>{r[k]}</b> : xem ? chu(k, r) :
        <ONhap v={r[k]} so={laSo} ten={`${ten} dòng ${r._i + 1}`} onDoi={s => {
          const p: Partial<DongPb> = { [k]: s }
          // CCDC: số tiền = số lượng x đơn giá
          if (khoaTien && k === 'sl') p.dg = so(s) > 0 ? String(Math.round(so(r.gt) / so(s))) : ''
          else if (laCcdc(v) && (k === 'sl' || k === 'dg')) p.gt = String(Math.round(so(k === 'sl' ? s : r.sl) * so(k === 'dg' ? s : r.dg)))
          if (k === 'ma') p._maTay = true
          // Thẻ dư đầu kỳ, khống chế ngay khi gõ (T296): đã phân bổ không vượt số tiền, số tháng đã phân bổ không vượt số tháng phân bổ;
          // hạ số tiền, số tháng xuống dưới phần đã phân bổ thì phần đã phân bổ hạ theo
          if (laDau(v)) {
            const gt = so(p.gt ?? (k === 'gt' ? s : r.gt)), ky = so(k === 'ky' ? s : r.ky)
            const da = so(k === 'da' ? s : r.da), kyDa = so(k === 'kyDa' ? s : r.kyDa)
            if (gt > 0 && da > gt) p.da = String(gt)
            if (ky > 0 && kyDa > ky) p.kyDa = String(ky)
          }
          sua(r._i, p, giuLich)
        }} />
      const ro = (k: string) => (r: Row) => r._i === undefined ? <b>{r[k]}</b> : xem ? chu(k, r) : <ONhap v={r[k]} so ten={k} chiDoc />
      const tong = (k: string) => soQT(rows.reduce((s, r) => s + so(r[k]), 0))
      return {
        cols: [
          { k: '_stt', t: '#', c: true, w: 36, r: r => r._i + 1 },   // như bảng chi tiết phiếu chi
          // Thẻ CCDC: chọn mã như chọn hàng hoá ở phiếu mua (ô có tìm, thêm mới tại form) từ danh mục hàng hoá loại Công cụ dụng cụ;
          // tên, ĐVT lấy theo danh mục, tên vẫn sửa được như phiếu mua
          { k: 'ma', t: `Mã ${muc(v)}`, w: 96, wCung: true, r: laCcdc(v) ? (r: Row) => r._i === undefined ? null
            : xem ? r.ma : <ChonDanhMuc dm="ccdc" nhan="công cụ dụng cụ" coMa chiMa className="inp sm" trong="Chọn" value={r.ma ?? ''} gon
              ds={CCDC_HANG.map(h => ({ v: h.ma, t: `${h.ma} - ${h.ten}` }))}
              onChange={(ma, m) => {
                const h = CCDC_HANG.find(x => x.ma === ma)
                sua(r._i, { ma, ten: h?.ten ?? m?.t.split(' - ').slice(1).join(' - ') ?? r.ten, dvt: h?.dvt ?? m?.dvt ?? '', _maTay: Boolean(ma) }, true)
              }} />
            : o('ma', 'Mã', false, true) },
          { k: 'ten', t: `Tên ${muc(v)}`, w: 180, r: o('ten', 'Tên', false, true) },   // cột tên nhận phần rộng còn dư (T287)
          ...(laCcdc(v) ? [{ k: 'dvt', t: 'ĐVT', w: 64, wCung: true, r: (r: Row) => r._i === undefined ? null : xem ? r.dvt : <ONhap v={r.dvt} ten={`ĐVT dòng ${r._i + 1}`} chiDoc /> }] : []),
          ...(laCcdc(v) ? [{ k: 'sl', t: 'Số lượng', num: true, w: 84, wCung: true, r: o('sl', 'Số lượng') }, { k: 'dg', t: 'Đơn giá', num: true, w: 112, wCung: true, r: khoaTien ? ro('dg') : o('dg', 'Đơn giá') }] : []),
          { k: 'gt', t: 'Số tiền', num: true, w: 112, wCung: true, r: khoaTien ? ro('gt') : o('gt', 'Số tiền') },
          // Thẻ dư đầu kỳ: Số tháng phân bổ đứng trước Số tháng đã phân bổ (T284)
          ...(laDau(v) ? [{ k: 'da', t: 'Giá trị đã PB', num: true, w: 112, wCung: true, r: o('da', 'Giá trị đã phân bổ') }] : []),
          { k: 'ky', t: 'Số tháng PB', num: true, w: 84, wCung: true, r: o('ky', 'Số tháng phân bổ') },
          ...(laDau(v) ? [{ k: 'kyDa', t: 'Số tháng đã PB', num: true, w: 92, wCung: true, r: o('kyDa', 'Số tháng đã phân bổ') }] : []),
          ...(laDau(v) ? [{ k: 'kyCon', t: 'Số tháng còn PB', num: true, w: 92, wCung: true, r: ro('kyCon') }, { k: 'can', t: 'Giá trị cần PB', num: true, w: 112, wCung: true, r: ro('can') }] : []),
          { k: 'tienKy', t: 'Số tiền PB hằng kỳ', num: true, w: 112, wCung: true, r: ro('tienKy') },
          // Tới tháng hiện tại theo ngày máy: đã phân bổ, còn lại = số tiền trừ đã phân bổ (T437)
          { k: 'daHt', t: 'Đã PB tới hiện tại', num: true, w: 120, wCung: true, r: ro('daHt') },
          { k: 'conHt', t: 'Còn lại hiện tại', num: true, w: 120, wCung: true, r: ro('conHt') },
          // Tiêu đề cột viết tắt phân bổ thành PB cho lưới gọn (T287). Mỗi dòng một ngày bắt đầu phân bổ; đổi ngày thì lịch tính lại, bỏ số đã gõ lại ở các kỳ (T159)
          { k: 'ngayPb', t: 'Ngày bắt đầu PB', w: 132, wCung: true, r: (r: Row) => r._i === undefined ? null
            : xem ? ngayBd(v, r as DongPb) : <ONhap v={ngayBd(v, r as DongPb)} ten={`Ngày bắt đầu phân bổ dòng ${r._i + 1}`} onDoi={s => sua(r._i, { ngayPb: khongTruoc(s, String(v.ngay ?? '')) })} /> },
          // Chỉ có khi sửa thẻ: tích ngừng từng dòng; có dòng tích thì hiện cột ngày (gói Free, Standard: tháng) ngừng phân bổ
          // Đang xem mà không dòng nào ngừng thì ẩn cột cho lưới gọn (T287)
          ...(v._sua && (!xem || dong.some(d => d.ngung)) ? [{ k: 'ngung', t: 'Ngừng PB', w: 72, wCung: true, c: true, r: (r: Row) => r._i === undefined ? null
            : <input type="checkbox" aria-label={`Ngừng phân bổ dòng ${r._i + 1}`} checked={Boolean(r.ngung)}
              onChange={e => sua(r._i, { ngung: e.target.checked, ngayNgung: e.target.checked ? ngayNgungMd(ngayBd(v, r as DongPb), thang) : undefined }, true)} /> }] : []),
          ...(dong.some(d => d.ngung) ? [{ k: 'ngayNgung', t: thang ? 'Tháng ngừng PB' : 'Ngày ngừng PB', w: 132, wCung: true, r: (r: Row) => r._i === undefined || !r.ngung ? null
            : xem ? (thang ? String(r.ngayNgung ?? '').slice(3) : r.ngayNgung) : thang ? <OThang v={r.ngayNgung} ten={`Tháng ngừng phân bổ dòng ${r._i + 1}`} onDoi={s => sua(r._i, { ngayNgung: khongTruoc(s, cuoiThangCua(ngayBd(v, r as DongPb))) }, true)} />
            : <ONhap v={r.ngayNgung} ten={`Ngày ngừng phân bổ dòng ${r._i + 1}`} onDoi={s => sua(r._i, { ngayNgung: khongTruoc(s, ngayBd(v, r as DongPb)) }, true)} /> }] : []),
          // Thẻ TSCĐ: Số hiệu, Mô tả chi tiết là hai cột cuối
          ...(laTscd(v) ? [{ k: 'soHieu', t: 'Số hiệu', w: 110, wCung: true, r: o('soHieu', 'Số hiệu', false, true) }, { k: 'moTa', t: 'Mô tả chi tiết', w: 220, r: o('moTa', 'Mô tả chi tiết', false, true) }] : []),
          // Thẻ ghi tăng lấy dòng từ chứng từ gốc, không xoá dòng; chỉ thẻ dư đầu kỳ nhập tay có nút xoá dòng (T165)
          ...(laDau(v) ? [{ k: '_xoa', t: '', w: 44, c: true, r: (r: Row) => r._i === undefined ? null : (
            <button type="button" className="icon-btn sm" title="Xoá dòng" aria-label={`Xoá dòng ${r._i + 1}`}
              onClick={() => doi('dong', dong.filter((_, j) => j !== r._i))}><Icon n="trash" className="ic sm" /></button>
          ) }] : []),
        ],
        rows,
        sum: { ten: 'Cộng', gt: tong('gt'), ...(laDau(v) ? { da: tong('da'), can: tong('can') } : {}), tienKy: tong('tienKy'), daHt: tong('daHt'), conHt: tong('conHt') },
        // Nút dưới lưới như bảng chi tiết phiếu chi: Thêm dòng, Xoá hết; chỉ thẻ dư đầu kỳ (T165)
        chan: laDau(v) && (
          <div className="row pb-chan">
            <button type="button" className="btn sm ghost" onClick={() => doi('dong', [...dong, { sl: 1, ngayPb: dong.length ? ngayBd(v, dong[dong.length - 1]) : String(v.ngayPb ?? v.ngay ?? '') }])}>
              <Icon n="plus" className="ic sm" />Thêm dòng
            </button>
            {dong.length > 0 && (
              <button type="button" className="btn sm ghost" style={{ color: 'var(--red)' }} onClick={() => doi('dong', [])}>
                <Icon n="trash" className="ic sm" />Xoá hết
              </button>
            )}
          </div>
        ),
        trong: 'Chưa có dòng nào',
      }
    },
  }, {
    ten: 'Lịch phân bổ',   // trước là Đã phân bổ (T438)
    truong: [],
    bang: (v, doi, goi, xem) => {
      const kh = canKichHoat(goi)
      const thangK = (k: { ngay: string }) => Math.floor(ngaySo(k.ngay) / 100)
      const dong: DongPb[] = v.dong ?? []
      // Hết các kỳ của dòng 1 rồi tới dòng 2; sau mỗi dòng là dòng cộng của dòng đó
      let stt = 0
      const rows: Row[] = dong.flatMap((d, i): Row[] => {
        const lich = lichDong(v, d)
        if (!lich.length) return []
        const ten = d.ten || `Dòng ${i + 1}`
        return [
          ...lich.map((k, j) => ({ ...k, ten, _stt: ++stt, _i: i, _j: j })),
          { _cong: 1, ten: `Cộng ${ten}`, tien: lich.reduce((s, k) => s + k.tien, 0) },
        ]
      })
      const tong = rows.filter(r => !r._cong).reduce((s, r) => s + r.tien, 0)
      return {
        cols: [
          { k: '_stt', t: 'STT', c: true, w: 60 },
          { k: 'ten', t: `Tên ${muc(v)}`, r: r => r._cong ? <b>{r.ten}</b> : r.ten },
          { k: 'ngay', t: 'Ngày được phân bổ', w: 150 },
          // Gõ lại số tiền từng kỳ; kỳ đã ngừng và dòng cộng chỉ xem
          { k: 'tien', t: 'Số tiền phân bổ', num: true, w: 200, r: r => r._cong ? <b>{soQT(r.tien)}</b> : r._i === undefined ? <b>{r.tien}</b> : r.ngung || r.don || xem ? soQT(r.tien)
            : <ONhap v={r.nhap ?? r.tien} so ten={`Số tiền phân bổ ${r.ten} kỳ ${r._j + 1}`} onDoi={s =>
              doi('dong', dong.map((d, j) => j === r._i ? { ...d, _pbSua: { ...d._pbSua, [r._j]: s } } : d))} /> },
          // Kỳ trước tháng ngừng nhận phần còn lại, chỉ xem (T296)
          // Trạng thái (T438): kỳ ngừng là Ngừng phân bổ. Gói Free, Standard: kỳ tới hết tháng hiện tại là Đã phân bổ, kỳ sau là Chờ phân bổ (T590);
          // gói Plus, Pro: kỳ đã bấm Phân bổ ở danh sách thẻ là Đã phân bổ, chưa bấm là Chờ phân bổ
          { k: 'tt', t: 'Trạng thái', w: 160, r: r => {
            if (r._cong) return null
            if (r.ngung) return <St k="dim">Ngừng phân bổ</St>
            const t = thangK(r as { ngay: string })
            if (!kh) return t <= kyNay() ? <St k="ok">Đã phân bổ</St> : <St k="warn">Chờ phân bổ</St>
            return daPhanBoKy(v.soThe, t) ? <St k="ok">Đã phân bổ</St> : <St k="warn">Chờ phân bổ</St>
          } },
        ],
        rows,
        rowCls: r => r._cong ? 'pb-cong' : r.ngung ? 'pb-ngung' : '',
        sum: { ten: 'Tổng cộng', tien: soQT(tong) },
        trong: 'Nhập số tiền, số tháng phân bổ ở tab Chi tiết phân bổ và ngày bắt đầu phân bổ để xem các kỳ phân bổ',
      }
    },
  }, {
    // Thẻ dư đầu kỳ: gõ Số chứng từ, Ngày chứng từ, Ghi chú. Thẻ ghi tăng: lấy từ chứng từ gốc, chỉ xem, số chứng từ bấm được để mở chứng từ (T159)
    ten: 'Thông tin mua',
    truong: [],
    ve: (v, doi, xem) => {
      // Đang xem, hoặc thẻ ghi tăng (chỉ xem): dạng thông tin gọn như đầu phiếu Xuất bán POS, số chứng từ bấm mở chứng từ gốc (T284)
      if (xem || !laDau(v)) return (
        <div className="pos-dau tt-mua-xem">
          <div><small>Số chứng từ</small>{v._goc ? <Link className="ds-link-so" to={v._goc} title="Mở chứng từ gốc">{v.soCt}</Link> : <b>{v.soCt}</b>}</div>
          <div><small>Ngày chứng từ</small><b>{v.ngayCt}</b></div>
          <div className="c2"><small>Ghi chú</small><b title={v.ghiChuCt}>{v.ghiChuCt}</b></div>
        </div>
      )
      // Thẻ dư đầu kỳ đang thêm, sửa: gõ Số chứng từ, Ngày chứng từ, Ghi chú
      return (
        <div className="pn-luoi tt-mua">
          <div className="f"><label>Số chứng từ</label>
            <input className="inp" value={v.soCt ?? ''} onChange={e => doi('soCt', e.target.value)} /></div>
          <div className="f"><label>Ngày chứng từ</label>
            <ONgay value={v.ngayCt ?? ''} placeholder="dd/mm/yyyy" onChange={val => doi('ngayCt', val)} /></div>
          <div className="f tt-mua-gc"><label>Ghi chú</label>
            <input className="inp" value={v.ghiChuCt ?? ''} onChange={e => doi('ghiChuCt', e.target.value)} /></div>
        </div>
      )
    },
  }],
  moi: (rows, { kieu, ngayDauNam }) => {
    // Thẻ dư đầu kỳ: ghi tăng ngày cuối năm trước (trước ngày đầu năm), phân bổ tiếp từ ngày đầu năm
    const [dd, mm, yy] = ngayDauNam.split('/').map(Number)
    const truoc = new Date(yy, mm - 1, dd - 1)
    const ngay = kieu === 'dau' ? `${pad(truoc.getDate())}/${pad(truoc.getMonth() + 1)}/${truoc.getFullYear()}` : homNay()
    const v: V = {
      loai: 'Chi phí trả trước', ngay, ngayPb: kieu === 'dau' ? ngayDauNam : ngay, _kieu: kieu,
      soThe: soTheKeTiep(rows.map(r => r.soThe), kieu === 'dau' ? 'dau' : 'the', ngay),
      dong: [{ sl: 1, ngayPb: kieu === 'dau' ? ngayDauNam : ngay }],
    }
    return { ...v, dong: capMa(v, rows) }
  },
  doi: (k, v, rows) => {
    // Đổi loại thẻ hay thêm, xoá dòng: sinh lại mã các dòng chưa gõ tay
    if (k === 'loai' || k === 'dong') return { dong: capMa(v, rows) }
    if (k === 'ngay') {
      // Dòng có ngày bắt đầu phân bổ trước ngày ghi tăng mới thì dời bằng ngày ghi tăng (T296)
      const ng = String(v.ngay ?? '')
      const dong = Number.isNaN(ngaySo(ng)) ? v.dong : (v.dong ?? []).map((d: DongPb) => ngaySo(ngayBd(v, d)) < ngaySo(ng) ? { ...d, ngayPb: ng, _pbSua: undefined } : d)
      // Thẻ mới đổi ngày ghi tăng: số thẻ đánh lại theo tháng mới (T284)
      return { dong, ...(!v._sua ? { soThe: soTheKeTiep(rows.map(r => r.soThe), laDau(v) ? 'dau' : 'the', ng) || v.soThe } : {}) }
    }
    return {}
  },
  loi: v => {
    const dong: DongPb[] = v.dong ?? []
    if (!dong.length) return 'Thẻ cần ít nhất một dòng ở tab Chi tiết phân bổ'
    const c = laCcdc(v) ? dong.findIndex(d => !d.ma) : -1
    if (c >= 0) return `Dòng ${c + 1}: cần chọn mã CCDC từ danh mục hàng hoá`
    const i = dong.findIndex(d => !String(d.ten ?? '').trim() || so(d.gt) <= 0 || so(d.ky) <= 0)
    if (i >= 0) return `Dòng ${i + 1}: cần nhập tên, số tiền và số tháng phân bổ`
    // Thẻ dư đầu kỳ: phần đã phân bổ không vượt giá trị, số tháng ban đầu (T296)
    const g = laDau(v) ? dong.findIndex(d => so(d.da) > so(d.gt)) : -1
    if (g >= 0) return `Dòng ${g + 1}: giá trị đã phân bổ không được lớn hơn số tiền ${soQT(so(dong[g].gt))}`
    const j = laDau(v) ? dong.findIndex(d => so(d.kyDa) >= so(d.ky)) : -1
    if (j >= 0) return `Dòng ${j + 1}: số tháng đã phân bổ phải nhỏ hơn số tháng phân bổ`
    const b = dong.findIndex(d => Number.isNaN(ngaySo(ngayBd(v, d))))
    if (b >= 0) return `Dòng ${b + 1}: cần nhập ngày bắt đầu phân bổ dạng dd/mm/yyyy`
    // Ngày bắt đầu phân bổ bằng hoặc sau ngày ghi tăng, cả thẻ ghi tăng và thẻ dư đầu kỳ (T296)
    const t = dong.findIndex(d => ngaySo(ngayBd(v, d)) < ngaySo(String(v.ngay ?? '')))
    if (t >= 0) return `Dòng ${t + 1}: ngày bắt đầu phân bổ phải bằng hoặc sau ngày ghi tăng ${v.ngay}`
    const n = dong.findIndex(d => d.ngung && Number.isNaN(ngaySo(String(d.ngayNgung ?? ''))))
    if (n >= 0) return `Dòng ${n + 1}: cần nhập ngày (tháng) ngừng phân bổ`
    // Ngày ngừng (gói Free, Standard: ngày cuối tháng ngừng) sau hoặc bằng ngày bắt đầu phân bổ của dòng
    const s = dong.findIndex(d => d.ngung && ngaySo(String(d.ngayNgung)) < ngaySo(ngayBd(v, d)))
    if (s >= 0) return `Dòng ${s + 1}: ngày ngừng phân bổ phải sau hoặc bằng ngày bắt đầu phân bổ ${ngayBd(v, dong[s])}`
    return null
  },
  // Tổng các kỳ của từng dòng phải bằng giá trị cần phân bổ của dòng đó; lệch thì hỏi dồn phần lệch vào kỳ cuối của dòng
  kiemLuu: v => {
    const dong: DongPb[] = v.dong ?? []
    const lech = dong.map(d => {
      const lich = lichDong(v, d)
      return lich.length ? tinhDong(v, d).can - lich.reduce((s, k) => s + k.tien, 0) : 0
    })
    const ds = dong.map((d, i) => lech[i] !== 0 ? `${d.ten || `dòng ${i + 1}`} (lệch ${soQT(lech[i])} đ)` : '').filter(Boolean)
    if (!ds.length) return null
    return {
      tieuDe: 'Tổng tiền phân bổ không khớp',
      hoi: `Phát hiện tổng tiền phân bổ không khớp: ${ds.join(', ')}. Bạn có muốn tự điều chỉnh vào kỳ cuối của từng dòng cho khớp không?`,
      sua: { dong: dong.map((d, i) => {
        if (!lech[i]) return d
        const lich = lichDong(v, d), cuoi = lich.length - 1
        return { ...d, _pbSua: { ...d._pbSua, [cuoi]: String(lich[cuoi].tien + lech[i]) } }
      }) },
    }
  },
}
