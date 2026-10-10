// Thẻ chi phí phân bổ 8.1.1: một thẻ dùng chung cho chi phí trả trước, CCDC, TSCĐ; hai kiểu thẻ: ghi tăng trong kỳ và dư đầu kỳ.
// Mã tự sinh theo loại thẻ (CPTT.0001, CCDC.0001, TSCD.0001), người dùng gõ lại được; số tiền và số phân bổ hằng kỳ tự tính.
import { createElement } from 'react'
import type { CauHinhDM } from '../danh-muc/truong-dm'
import type { Row } from '../types'
import { St } from '../../ui/Table'
import { docSoQT, nhapSoQT, soQT } from '../../ui/format'

const LOAI_THE: Record<string, { tienTo: string; muc: string }> = {
  'Chi phí trả trước': { tienTo: 'CPTT', muc: 'mục chi phí' },
  'Công cụ dụng cụ': { tienTo: 'CCDC', muc: 'CCDC' },
  'Tài sản cố định': { tienTo: 'TSCD', muc: 'TSCĐ' },
}

const laCcdc = (v: Record<string, any>) => v.loai === 'Công cụ dụng cụ'
const laDau = (v: Record<string, any>) => v._kieu === 'dau'
const laTscd = (v: Record<string, any>) => v.loai === 'Tài sản cố định'

const pad = (n: number, d = 2) => String(n).padStart(d, '0')
/** Số trên thẻ theo kiểu quốc tế: phẩy ngăn nghìn, chấm thập phân */
const so = docSoQT

/** Mã kế tiếp của loại thẻ: lấy số cuối lớn nhất của các thẻ cùng loại rồi cộng 1 */
function maTiep(loai: string, rows: Row[]): string {
  const n = Math.max(0, ...rows.filter(r => r.loai === loai).map(r => Number(String(r.ma).match(/\d+$/)?.[0] ?? 0)))
  return `${LOAI_THE[loai].tienTo}.${pad(n + 1, 4)}`
}

/** Lịch phân bổ đều: mỗi kỳ là ngày cuối tháng, từ tháng của ngày bắt đầu; kỳ cuối nhận phần lẻ do làm tròn */
function lichPhanBo(tong: number, ky: number, ngayBd: string): { stt: number; ngay: string; tien: number }[] {
  const m = ngayBd.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m || tong <= 0 || ky <= 0 || ky > 600) return []
  const moiKy = Math.round(tong / ky)
  return Array.from({ length: ky }, (_, i) => {
    const cuoi = new Date(+m[3], +m[2] - 1 + i + 1, 0)
    return { stt: i + 1, ngay: `${pad(cuoi.getDate())}/${pad(cuoi.getMonth() + 1)}/${cuoi.getFullYear()}`, tien: i < ky - 1 ? moiKy : tong - moiKy * (ky - 1) }
  })
}

const ngaySo = (d: string) => { const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); return m ? +m[3] * 10000 + +m[2] * 100 + +m[1] : NaN }

/** Số tháng còn phải phân bổ: thẻ thường là số tháng phân bổ; thẻ dư đầu kỳ trừ số tháng đã phân bổ */
const kyConLai = (v: Record<string, any>) => laDau(v) ? Math.max(0, so(v.ky) - so(v.kyDa)) : so(v.ky)

/** Lịch phân bổ đang dùng: lịch đều, đè số tiền người dùng gõ lại (_pbSua), đánh dấu ngừng các dòng từ ngày ngừng phân bổ */
function lichThe(v: Record<string, any>) {
  const ngung = v._sua && v.ngung ? ngaySo(String(v.ngayNgung ?? '')) : NaN
  return lichPhanBo(so(v.canPb), kyConLai(v), String(v.ngayPb ?? '')).map((r, i) => ({
    ...r,
    tien: v._pbSua?.[i] !== undefined ? so(v._pbSua[i]) : r.tien,
    nhap: v._pbSua?.[i] as string | undefined,
    ngung: ngaySo(r.ngay) >= ngung,
  }))
}

/** Ô nào đổi thì lịch phân bổ tính lại từ đầu, bỏ các số đã gõ lại trên dòng */
const O_TINH_LICH = ['sl', 'dg', 'gt', 'da', 'canPb', 'ky', 'kyDa', 'ngayPb']

const homNay = () => { const d = new Date(); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` }

export const THE_PHAN_BO: CauHinhDM = {
  ten: 'thẻ chi phí phân bổ',
  moTa: 'Dùng cho các khoản chi phí cần phân bổ: Tài sản cố định, Công cụ dụng cụ, chi phí trả trước',
  toanMan: { icon: 'tool' },
  soQuocTe: true,
  // Hai kiểu thẻ: thẻ ghi tăng trong kỳ, thẻ dư đầu kỳ (khai phần đã phân bổ trước khi dùng phần mềm)
  bien: [
    { k: 'the', ten: 'thẻ chi phí phân bổ', nut: 'Ghi tăng' },
    { k: 'dau', ten: 'thẻ chi phí phân bổ dư đầu kỳ', nut: 'Ghi tăng dư đầu kỳ' },
  ],
  khoi: [{
    ten: 'Thông tin chung',
    truong: [
      { k: 'loai', nhan: 'Loại thẻ', kieu: 'chon', batBuoc: true, ds: Object.keys(LOAI_THE) },
      // Ngày ghi tăng, Số thẻ ở góc phải trên như Ngày chứng từ, Số phiếu của các chứng từ khác
      { k: 'ngay', nhan: 'Ngày ghi tăng', kieu: 'ngay', batBuoc: true, goc: 1, dauNam: v => laDau(v) ? 'truoc' : 'tu' },   // thẻ thường từ ngày đầu năm, thẻ dư đầu kỳ trước ngày đầu năm
      { k: 'soThe', nhan: 'Số thẻ', kieu: 'chu', batBuoc: true, goc: 2, chiDoc: true },
      { k: 'ma', nhan: 'Mã', kieu: 'chu', batBuoc: true },
      { k: 'ten', nhan: 'Tên', kieu: 'chu', batBuoc: true },
      // Số lượng, đơn giá chỉ có ở thẻ CCDC; đã phân bổ, cần phân bổ chỉ có ở thẻ dư đầu kỳ
      { k: 'sl', nhan: 'Số lượng', kieu: 'so', hien: laCcdc },
      { k: 'dg', nhan: 'Đơn giá', kieu: 'tien', hien: laCcdc },
      { k: 'gt', nhan: 'Số tiền', kieu: 'tien', batBuoc: true },
      { k: 'da', nhan: 'Giá trị đã phân bổ', kieu: 'tien', hien: laDau },
      { k: 'canPb', nhan: 'Giá trị cần phân bổ', kieu: 'tien', chiDoc: true, hien: laDau },   // = số tiền - đã phân bổ, không sửa tay
      { k: 'ky', nhan: 'Số tháng phân bổ', kieu: 'so', batBuoc: true },
      // Thẻ dư đầu kỳ: số tháng đã phân bổ trước ngày đầu năm, số tháng còn lại tự tính; lịch và số tiền mỗi kỳ theo số tháng còn phân bổ
      { k: 'kyDa', nhan: 'Số tháng đã phân bổ', kieu: 'so', hien: laDau },
      { k: 'kyCon', nhan: 'Số tháng còn phân bổ', kieu: 'so', chiDoc: true, hien: laDau },
      { k: 'ngayPb', nhan: 'Ngày bắt đầu phân bổ', kieu: 'ngay', batBuoc: true },
      // Tự tính = cần phân bổ / số tháng, làm tròn tới đồng; không sửa tay
      { k: 'tienKy', nhan: 'Số tiền phân bổ hằng kỳ', kieu: 'tien', chiDoc: true },
      // Chỉ có khi sửa thẻ: tích Ngừng phân bổ thì bắt nhập ngày, các dòng phân bổ từ ngày đó thôi hiệu lực
      { k: 'ngung', nhan: 'Ngừng phân bổ', kieu: 'tich', caHang: false, hien: v => Boolean(v._sua) },
      { k: 'ngayNgung', nhan: 'Ngày ngừng phân bổ', kieu: 'ngay', batBuoc: true, hien: v => Boolean(v._sua && v.ngung) },
    ],
  }, {
    ten: 'Nguồn gốc hình thành',
    truong: [
      // Thẻ tạo từ phiếu chi giữ đường dẫn phiếu gốc (_goc) để mở lại
      { k: 'soCt', nhan: 'Số chứng từ', kieu: 'chu', lien: v => v._goc },
      { k: 'ngayCt', nhan: 'Ngày chứng từ', kieu: 'ngay' },
      // Số hiệu, mô tả chi tiết chỉ có ở thẻ TSCĐ
      { k: 'soHieu', nhan: 'Số hiệu', kieu: 'chu', hien: laTscd },
      { k: 'ghiChu', nhan: 'Ghi chú', kieu: 'chu' },
      { k: 'moTa', nhan: 'Mô tả chi tiết', kieu: 'nhieuDong', hien: laTscd },
    ],
  }, {
    ten: 'Chi tiết phân bổ',
    truong: [],
    bang: (v, doi) => {
      const rows = lichThe(v)
      return {
        cols: [
          { k: 'stt', t: 'STT', c: true, w: 60 },
          { k: 'ngay', t: 'Ngày được phân bổ' },
          // Gõ lại số tiền từng dòng; dòng đã ngừng chỉ xem
          { k: 'tien', t: 'Số tiền phân bổ', num: true, w: 200, r: r => r.ngung ? soQT(r.tien) : createElement('input', {
            className: 'inp pn-tien pb-o', 'aria-label': `Số tiền phân bổ kỳ ${r.stt}`,
            value: soQT(r.nhap ?? r.tien),
            onChange: (e: { target: { value: string } }) => doi('_pbSua', { ...v._pbSua, [r.stt - 1]: nhapSoQT(e.target.value) }),
          }) },
          { k: 'tt', t: 'Trạng thái', w: 140, r: r => createElement(St, { k: r.ngung ? 'dim' : 'ok', children: r.ngung ? 'Ngừng phân bổ' : 'Phân bổ' }) },
        ],
        rows,
        rowCls: r => r.ngung ? 'pb-ngung' : '',
        sum: { ngay: 'Cộng', tien: soQT(rows.reduce((s, r) => s + r.tien, 0)) },
        trong: 'Nhập giá trị cần phân bổ, ngày bắt đầu phân bổ và số tháng phân bổ để xem lịch phân bổ',
      }
    },
  }],
  // Ô Mã, Tên đổi nhãn theo loại thẻ đang chọn
  nhan: (tr, v) => {
    if (tr.k !== 'ma' && tr.k !== 'ten') return undefined
    return `${tr.nhan} ${LOAI_THE[v.loai]?.muc ?? 'mục chi phí/CCDC/TSCĐ'}`
  },
  moi: (rows, { kieu, ngayDauNam }) => {
    const d = new Date()
    // Thẻ dư đầu kỳ: ghi tăng ngày cuối năm trước (trước ngày đầu năm), phân bổ tiếp từ ngày đầu năm
    const [dd, mm, yy] = ngayDauNam.split('/').map(Number)
    const truoc = new Date(yy, mm - 1, dd - 1)
    const ngay = kieu === 'dau' ? `${pad(truoc.getDate())}/${pad(truoc.getMonth() + 1)}/${truoc.getFullYear()}` : homNay()
    const ngayPb = kieu === 'dau' ? ngayDauNam : ngay
    // Mặc định loại Chi phí trả trước, mã sinh sẵn theo loại; người dùng đổi loại thì mã sinh lại
    const loai = 'Chi phí trả trước'
    return { loai, ma: maTiep(loai, rows), _maTuDong: 1, soThe: `TPB${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}-${pad(rows.length + 1, 4)}`, ngay, ngayPb, sl: 1 }
  },
  doi: (k, v, rows) => {
    const sua: Record<string, unknown> = {}
    // Mã tự sinh khi chọn loại thẻ, trừ khi người dùng đã tự gõ mã
    if (k === 'loai' && LOAI_THE[v.loai] && (!v.ma || v._maTuDong)) Object.assign(sua, { ma: maTiep(v.loai, rows), _maTuDong: 1 })
    if (k === 'ma') sua._maTuDong = 0
    // Tích Ngừng phân bổ: ngày ngừng mặc định là hôm nay
    if (k === 'ngung' && v.ngung && !v.ngayNgung) sua.ngayNgung = homNay()
    // CCDC: số tiền = SL x đơn giá. Cần phân bổ = số tiền (thẻ dư đầu kỳ trừ phần đã phân bổ). Mỗi kỳ = cần phân bổ / số tháng
    const gt = laCcdc(v) && (k === 'sl' || k === 'dg') ? Math.round(so(v.sl) * so(v.dg)) : so(v.gt)
    if (laCcdc(v) && (k === 'sl' || k === 'dg')) sua.gt = gt
    const tinhCan = ['sl', 'dg', 'gt', 'da'].includes(k)
    const can = tinhCan ? gt - (laDau(v) ? so(v.da) : 0) : so(v.canPb)
    if (tinhCan) sua.canPb = can
    if (k === 'ky' || k === 'kyDa') sua.kyCon = kyConLai(v)
    if (tinhCan || ['canPb', 'ky', 'kyDa'].includes(k)) sua.tienKy = kyConLai(v) > 0 ? Math.round(can / kyConLai(v)) : ''
    if (O_TINH_LICH.includes(k)) sua._pbSua = undefined
    return sua
  },
  // Tổng các dòng phân bổ phải bằng giá trị cần phân bổ; lệch thì hỏi dồn phần lệch vào kỳ cuối
  kiemLuu: v => {
    const rows = lichThe(v)
    const lech = so(v.canPb) - rows.reduce((s, r) => s + r.tien, 0)
    if (!rows.length || lech === 0) return null
    const cuoi = rows[rows.length - 1]
    return {
      tieuDe: 'Tổng tiền phân bổ không khớp',
      hoi: `Phát hiện tổng tiền phân bổ không khớp (lệch ${soQT(lech)} đ). Bạn có muốn tự điều chỉnh vào kỳ cuối cho khớp không?`,
      sua: { _pbSua: { ...v._pbSua, [rows.length - 1]: String(cuoi.tien + lech) } },
    }
  },
}
