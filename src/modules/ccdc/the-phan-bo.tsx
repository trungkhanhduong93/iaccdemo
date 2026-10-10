// Thẻ chi phí phân bổ 8.1.1: một thẻ dùng chung cho chi phí trả trước, CCDC, TSCĐ; hai kiểu thẻ: ghi tăng trong kỳ và dư đầu kỳ.
// Một thẻ có nhiều dòng (tab Chi tiết phân bổ), mỗi dòng phân bổ riêng ra các kỳ (tab Đã phân bổ).
// Mã từng dòng tự sinh theo loại thẻ (CPTT.0001, CCDC.0001, TSCD.0001), người dùng gõ lại được. Số trên thẻ theo kiểu quốc tế.
import { Link } from 'react-router-dom'
import type { CauHinhDM } from '../danh-muc/truong-dm'
import type { Row } from '../types'
import { St, Table } from '../../ui/Table'
import { ChonDanhMuc } from '../../ui/ChonDanhMuc'
import { CCDC_HANG } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { docSoQT, nhapSoQT, soQT } from '../../ui/format'

export const LOAI_THE: Record<string, { tienTo: string; muc: string }> = {
  'Chi phí trả trước': { tienTo: 'CPTT', muc: 'mục chi phí' },
  'Công cụ dụng cụ': { tienTo: 'CCDC', muc: 'CCDC' },
  'Tài sản cố định': { tienTo: 'TSCD', muc: 'TSCĐ' },
}

type V = Record<string, any>
/** Một dòng chi tiết phân bổ của thẻ */
export interface DongPb {
  ma?: string; ten?: string; dvt?: string; sl?: unknown; dg?: unknown; gt?: unknown
  da?: unknown; kyDa?: unknown; ky?: unknown; ngayNgung?: string; soHieu?: string; moTa?: string
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

/** Số tự tính của một dòng: cần phân bổ = số tiền (thẻ dư đầu kỳ trừ phần đã phân bổ), số tháng còn, số tiền mỗi kỳ */
function tinhDong(v: V, d: DongPb) {
  const can = so(d.gt) - (laDau(v) ? so(d.da) : 0)
  const kyCon = laDau(v) ? Math.max(0, so(d.ky) - so(d.kyDa)) : so(d.ky)
  return { can, kyCon, tienKy: kyCon > 0 ? Math.round(can / kyCon) : 0 }
}

/** Lịch phân bổ đang dùng của một dòng: đè số tiền gõ lại, đánh dấu ngừng các kỳ từ ngày ngừng của dòng */
function lichDong(v: V, d: DongPb) {
  const { can, kyCon } = tinhDong(v, d)
  const ngung = v.ngung ? ngaySo(String(d.ngayNgung ?? '')) : NaN
  return lichPhanBo(can, kyCon, String(v.ngayPb ?? '')).map((k, j) => ({
    ...k,
    tien: d._pbSua?.[j] !== undefined ? so(d._pbSua[j]) : k.tien,
    nhap: d._pbSua?.[j],
    ngung: ngaySo(k.ngay) >= ngung,
  }))
}

/** Đã phân bổ tới hết kỳ (yyyymm): phần đã phân bổ trước (thẻ dư đầu kỳ) cộng các kỳ còn hiệu lực tới kỳ đó */
export function daPhanBoToiKy(the: V, ky: number): number {
  return (the.dong as DongPb[] ?? []).reduce((tong, d) => tong + (laDau(the) ? so(d.da) : 0)
    + lichDong(the, d).filter(k => !k.ngung && Math.floor(ngaySo(k.ngay) / 100) <= ky).reduce((s, k) => s + k.tien, 0), 0)
}

/** Bảng chi tiết phân bổ chi phí: mỗi dòng của thẻ một hàng, phân bổ trong kỳ (yyyymm), luỹ kế tới hết kỳ, còn lại */
export function bangPhanBo(the: V, ky: number): Row[] {
  return (the.dong as DongPb[] ?? []).map(d => {
    const lich = lichDong(the, d).filter(k => !k.ngung)
    const thang = (k: { ngay: string }) => Math.floor(ngaySo(k.ngay) / 100)
    const kyNay = lich.filter(k => thang(k) === ky).reduce((s, k) => s + k.tien, 0)
    const luyKe = (laDau(the) ? so(d.da) : 0) + lich.filter(k => thang(k) <= ky).reduce((s, k) => s + k.tien, 0)
    return { soThe: the.soThe, loai: the.loai, ma: d.ma, ten: d.ten, ngayPb: the.ngayPb, gt: so(d.gt), soKy: so(d.ky), kyNay, luyKe, con: so(d.gt) - luyKe }
  })
}

/** Khung xem nhanh ở danh sách thẻ: các dòng chi tiết phân bổ của thẻ, chỉ xem */
export function veChiTietThe(the: V) {
  const rows = (the.dong as DongPb[] ?? []).map((d, i) => ({ ...d, ...tinhDong(the, d), _stt: i + 1 }))
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

/** Ô nhập trong lưới: số kiểu quốc tế hoặc chữ */
export function ONhap({ v, so: laSo, ten, onDoi, chiDoc }: { v: unknown; so?: boolean; ten: string; onDoi?: (s: string) => void; chiDoc?: boolean }) {
  return (
    <input className={`inp pb-o${laSo ? ' pn-tien' : ''}`} aria-label={ten} readOnly={chiDoc}
      value={laSo ? soQT(v) : String(v ?? '')} placeholder={ten.startsWith('Ngày') ? 'dd/mm/yyyy' : undefined}
      onChange={e => onDoi?.(laSo ? nhapSoQT(e.target.value) : e.target.value)} />
  )
}

export const THE_PHAN_BO: CauHinhDM = {
  ten: 'thẻ chi phí phân bổ',
  moTa: 'Dùng cho các khoản chi phí cần phân bổ: Tài sản cố định, Công cụ dụng cụ, chi phí trả trước',
  toanMan: { icon: 'tool' },
  soQuocTe: true,
  // Hai kiểu thẻ: thẻ ghi tăng trong kỳ, thẻ dư đầu kỳ (khai phần đã phân bổ trước khi dùng phần mềm)
  bien: [
    // Ghi tăng từng thẻ chỉ ở gói Free, Standard; gói Plus, Pro ghi tăng hàng loạt từ phiếu chi
    { k: 'the', ten: 'thẻ chi phí phân bổ', nut: 'Ghi tăng', icon: 'grid', goi: ['F', 'S'] },
    { k: 'dau', ten: 'thẻ chi phí phân bổ dư đầu kỳ', nut: 'Ghi tăng dư đầu kỳ', icon: 'clock' },
  ],
  khoi: [{
    ten: 'Thông tin chung',
    truong: [
      // Một hàng: Loại thẻ, Ngày ghi tăng, Số thẻ, Ngày bắt đầu phân bổ; thẻ thường ghi tăng từ ngày đầu năm, thẻ dư đầu kỳ trước ngày đầu năm
      { k: 'loai', nhan: 'Loại thẻ', kieu: 'chon', batBuoc: true, ds: Object.keys(LOAI_THE) },
      { k: 'ngay', nhan: 'Ngày ghi tăng', kieu: 'ngay', batBuoc: true, dauNam: v => laDau(v) ? 'truoc' : 'tu' },
      { k: 'soThe', nhan: 'Số thẻ', kieu: 'chu', batBuoc: true, chiDoc: true },
      { k: 'ngayPb', nhan: 'Ngày bắt đầu phân bổ', kieu: 'ngay', batBuoc: true },
      // Chỉ có khi sửa thẻ: ngừng cả thẻ, ngày ngừng nhập theo từng dòng ở tab Chi tiết phân bổ
      { k: 'ngung', nhan: 'Ngừng phân bổ', kieu: 'tich', caHang: false, hien: v => Boolean(v._sua) },
    ],
  }, {
    ten: 'Chi tiết phân bổ',
    truong: [],
    bang: (v, doi) => {
      const dong: DongPb[] = v.dong ?? []
      const sua = (i: number, p: Partial<DongPb>, giuLich = false) =>
        doi('dong', dong.map((d, j) => j === i ? { ...d, ...p, ...(giuLich ? {} : { _pbSua: undefined }) } : d))
      const rows: Row[] = dong.map((d, i) => ({ ...d, ...tinhDong(v, d), _i: i }))
      // Dòng Cộng (không có _i) chỉ hiện chữ, không vẽ ô nhập
      const o = (k: keyof DongPb, ten: string, laSo = true, giuLich = false) => (r: Row) => r._i === undefined ? <b>{r[k]}</b> :
        <ONhap v={r[k]} so={laSo} ten={`${ten} dòng ${r._i + 1}`} onDoi={s => {
          const p: Partial<DongPb> = { [k]: s }
          // CCDC: số tiền = số lượng x đơn giá
          if (laCcdc(v) && (k === 'sl' || k === 'dg')) p.gt = String(Math.round(so(k === 'sl' ? s : r.sl) * so(k === 'dg' ? s : r.dg)))
          if (k === 'ma') p._maTay = true
          sua(r._i, p, giuLich)
        }} />
      const ro = (k: string) => (r: Row) => r._i === undefined ? <b>{r[k]}</b> : <ONhap v={r[k]} so ten={k} chiDoc />
      const tong = (k: string) => soQT(rows.reduce((s, r) => s + so(r[k]), 0))
      return {
        cols: [
          { k: '_stt', t: '#', c: true, w: 36, r: r => r._i + 1 },   // như bảng chi tiết phiếu chi
          // Thẻ CCDC: chọn mã như chọn hàng hoá ở phiếu mua (ô có tìm, thêm mới tại form) từ danh mục hàng hoá loại Công cụ dụng cụ;
          // tên, ĐVT lấy theo danh mục, tên vẫn sửa được như phiếu mua
          { k: 'ma', t: `Mã ${muc(v)}`, w: 120, r: laCcdc(v) ? (r: Row) => r._i === undefined ? null
            : <ChonDanhMuc dm="ccdc" nhan="công cụ dụng cụ" coMa chiMa className="inp sm" trong="Chọn" value={r.ma ?? ''}
              ds={CCDC_HANG.map(h => ({ v: h.ma, t: `${h.ma} - ${h.ten}` }))}
              onChange={(ma, m) => {
                const h = CCDC_HANG.find(x => x.ma === ma)
                sua(r._i, { ma, ten: h?.ten ?? m?.t.split(' - ').slice(1).join(' - ') ?? r.ten, dvt: h?.dvt ?? '', _maTay: Boolean(ma) }, true)
              }} />
            : o('ma', 'Mã', false, true) },
          { k: 'ten', t: `Tên ${muc(v)}`, w: 240, r: o('ten', 'Tên', false, true) },
          ...(laCcdc(v) ? [{ k: 'dvt', t: 'ĐVT', w: 70, r: (r: Row) => r._i === undefined ? null : <ONhap v={r.dvt} ten={`ĐVT dòng ${r._i + 1}`} chiDoc /> }] : []),
          ...(laCcdc(v) ? [{ k: 'sl', t: 'Số lượng', num: true, w: 90, r: o('sl', 'Số lượng') }, { k: 'dg', t: 'Đơn giá', num: true, w: 130, r: o('dg', 'Đơn giá') }] : []),
          { k: 'gt', t: 'Số tiền', num: true, w: 140, r: o('gt', 'Số tiền') },
          ...(laDau(v) ? [{ k: 'da', t: 'Giá trị đã phân bổ', num: true, w: 140, r: o('da', 'Giá trị đã phân bổ') }, { k: 'kyDa', t: 'Số tháng đã phân bổ', num: true, w: 100, r: o('kyDa', 'Số tháng đã phân bổ') }] : []),
          { k: 'ky', t: 'Số tháng phân bổ', num: true, w: 100, r: o('ky', 'Số tháng phân bổ') },
          ...(laDau(v) ? [{ k: 'kyCon', t: 'Số tháng còn phân bổ', num: true, w: 100, r: ro('kyCon') }, { k: 'can', t: 'Giá trị cần phân bổ', num: true, w: 140, r: ro('can') }] : []),
          { k: 'tienKy', t: 'Số tiền phân bổ hằng kỳ', num: true, w: 140, r: ro('tienKy') },
          ...(v.ngung ? [{ k: 'ngayNgung', t: 'Ngày ngừng phân bổ', w: 130, r: o('ngayNgung', 'Ngày ngừng phân bổ', false) }] : []),
          // Thẻ TSCĐ: Số hiệu, Mô tả chi tiết là hai cột cuối
          ...(laTscd(v) ? [{ k: 'soHieu', t: 'Số hiệu', w: 120, r: o('soHieu', 'Số hiệu', false, true) }, { k: 'moTa', t: 'Mô tả chi tiết', w: 220, r: o('moTa', 'Mô tả chi tiết', false, true) }] : []),
          { k: '_xoa', t: '', w: 44, c: true, r: r => (
            <button type="button" className="icon-btn sm" title="Xoá dòng" aria-label={`Xoá dòng ${r._i + 1}`}
              onClick={() => doi('dong', dong.filter((_, j) => j !== r._i))}><Icon n="trash" className="ic sm" /></button>
          ) },
        ],
        rows,
        sum: { ten: 'Cộng', gt: tong('gt'), ...(laDau(v) ? { da: tong('da'), can: tong('can') } : {}), tienKy: tong('tienKy') },
        // Nút dưới lưới như bảng chi tiết phiếu chi: Thêm dòng, Xoá hết
        chan: (
          <div className="row pb-chan">
            <button type="button" className="btn sm ghost" onClick={() => doi('dong', [...dong, { sl: 1, ...(v.ngung ? { ngayNgung: homNay() } : {}) }])}>
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
    ten: 'Đã phân bổ',
    truong: [],
    bang: (v, doi) => {
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
          { k: 'tien', t: 'Số tiền phân bổ', num: true, w: 200, r: r => r._cong ? <b>{soQT(r.tien)}</b> : r._i === undefined ? <b>{r.tien}</b> : r.ngung ? soQT(r.tien)
            : <ONhap v={r.nhap ?? r.tien} so ten={`Số tiền phân bổ ${r.ten} kỳ ${r._j + 1}`} onDoi={s =>
              doi('dong', dong.map((d, j) => j === r._i ? { ...d, _pbSua: { ...d._pbSua, [r._j]: s } } : d))} /> },
          { k: 'tt', t: 'Trạng thái', w: 140, r: r => r._cong ? null : <St k={r.ngung ? 'dim' : 'ok'}>{r.ngung ? 'Ngừng phân bổ' : 'Phân bổ'}</St> },
        ],
        rows,
        rowCls: r => r._cong ? 'pb-cong' : r.ngung ? 'pb-ngung' : '',
        sum: { ten: 'Tổng cộng', tien: soQT(tong) },
        trong: 'Nhập số tiền, số tháng phân bổ ở tab Chi tiết phân bổ và ngày bắt đầu phân bổ để xem các kỳ phân bổ',
      }
    },
  }, {
    // Thẻ nhập tay: gõ Số chứng từ, Ngày chứng từ, Ghi chú. Thẻ tạo từ phiếu chi: lấy từ phiếu gốc, chỉ xem, số chứng từ bấm được để mở phiếu
    ten: 'Thông tin mua',
    truong: [],
    ve: (v, doi) => (
      <div className="pn-luoi tt-mua">
        <div className="f"><label>Số chứng từ</label>
          {v._goc ? <Link className="inp tt-mua-so" to={v._goc} title="Mở phiếu chi gốc">{v.soCt}</Link>
            : <input className="inp" value={v.soCt ?? ''} onChange={e => doi('soCt', e.target.value)} />}</div>
        <div className="f"><label>Ngày chứng từ</label>
          <input className="inp" value={v.ngayCt ?? ''} placeholder="dd/mm/yyyy" readOnly={Boolean(v._goc)} onChange={e => doi('ngayCt', e.target.value)} /></div>
        <div className="f tt-mua-gc"><label>Ghi chú</label>
          <input className="inp" value={v.ghiChuCt ?? ''} readOnly={Boolean(v._goc)} onChange={e => doi('ghiChuCt', e.target.value)} /></div>
      </div>
    ),
  }],
  moi: (rows, { kieu, ngayDauNam }) => {
    const d = new Date()
    // Thẻ dư đầu kỳ: ghi tăng ngày cuối năm trước (trước ngày đầu năm), phân bổ tiếp từ ngày đầu năm
    const [dd, mm, yy] = ngayDauNam.split('/').map(Number)
    const truoc = new Date(yy, mm - 1, dd - 1)
    const ngay = kieu === 'dau' ? `${pad(truoc.getDate())}/${pad(truoc.getMonth() + 1)}/${truoc.getFullYear()}` : homNay()
    const v: V = {
      loai: 'Chi phí trả trước', ngay, ngayPb: kieu === 'dau' ? ngayDauNam : ngay, _kieu: kieu,
      soThe: `TPB${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}-${pad(rows.length + 1, 4)}`,
      dong: [{ sl: 1 }],
    }
    return { ...v, dong: capMa(v, rows) }
  },
  doi: (k, v, rows) => {
    // Đổi loại thẻ hay thêm, xoá dòng: sinh lại mã các dòng chưa gõ tay
    if (k === 'loai' || k === 'dong') return { dong: capMa(v, rows) }
    // Đổi ngày bắt đầu: lịch tính lại, bỏ số đã gõ lại ở các kỳ
    if (k === 'ngayPb') return { dong: (v.dong ?? []).map((d: DongPb) => ({ ...d, _pbSua: undefined })) }
    // Tích Ngừng phân bổ: ngày ngừng các dòng mặc định là hôm nay
    if (k === 'ngung' && v.ngung) return { dong: (v.dong ?? []).map((d: DongPb) => ({ ...d, ngayNgung: d.ngayNgung || homNay() })) }
    return {}
  },
  loi: v => {
    const dong: DongPb[] = v.dong ?? []
    if (!dong.length) return 'Thẻ cần ít nhất một dòng ở tab Chi tiết phân bổ'
    const c = laCcdc(v) ? dong.findIndex(d => !d.ma) : -1
    if (c >= 0) return `Dòng ${c + 1}: cần chọn mã CCDC từ danh mục hàng hoá`
    const i = dong.findIndex(d => !String(d.ten ?? '').trim() || so(d.gt) <= 0 || so(d.ky) <= 0)
    if (i >= 0) return `Dòng ${i + 1}: cần nhập tên, số tiền và số tháng phân bổ`
    const j = laDau(v) ? dong.findIndex(d => so(d.kyDa) >= so(d.ky)) : -1
    if (j >= 0) return `Dòng ${j + 1}: số tháng đã phân bổ phải nhỏ hơn số tháng phân bổ`
    const n = v.ngung ? dong.findIndex(d => Number.isNaN(ngaySo(String(d.ngayNgung ?? '')))) : -1
    if (n >= 0) return `Dòng ${n + 1}: cần nhập ngày ngừng phân bổ dạng dd/mm/yyyy`
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
