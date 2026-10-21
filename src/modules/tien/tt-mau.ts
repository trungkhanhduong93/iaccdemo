// Phiếu thu, chi mẫu thanh toán cho phiếu mua, bán mẫu đã thanh toán, thanh toán một phần (T586).
// Phiếu gốc Đã thanh toán trả ngay: giữ _ctTt, hình thức tiền mặt hoặc chuyển khoản. Thanh toán một phần trả sau: giữ _dsTt,
// số tiền 40% như soDaTra tạm tính trước đây. Phiếu thu, chi trỏ về phiếu gốc qua _thamChieu, _thamChieuDi
import type { Row, VoucherCfg } from '../types'
import type { Session } from '../../app/session'
import { coTrongGoi } from '../../app/plan'
import { chungTu, ttNghiepVu } from '../../ui/generic/gen'
import { PHIEU_MUA } from '../mua-hang/bao-cao'
import { NGOAI_POS } from '../ban-hang/ChungTuBanHang'

interface NguonTt { cfg: () => VoucherCfg; seed: string; man: string; chi: boolean; viec: string; ly: string }
const NGUON: NguonTt[] = [
  { cfg: () => PHIEU_MUA, seed: '4.1.1', man: 'mua-hang/4-1-1', chi: true, viec: 'mua hàng', ly: 'Thanh toán tiền cho nhà cung cấp' },
  { cfg: () => NGOAI_POS, seed: '3.1.7', man: 'ban-hang/3-1-7', chi: false, viec: 'bán hàng', ly: 'Thu tiền bán hàng' },
]
const TIEN_TO: Record<string, string> = { thu: 'PT', chi: 'PC', bc: 'BC', unc: 'UNC' }
const TEN: Record<string, string> = { thu: 'Thu tiền mặt', chi: 'Chi tiền mặt', bc: 'Thu ngân hàng', unc: 'Chi ngân hàng' }
const p2 = (n: number) => String(n).padStart(2, '0')

interface Mau { goc: Map<string, Partial<Row>>; phieu: Row[] }
const daTinh = new Map<string, Mau>()

/** Ngày phiếu cộng thêm số ngày, không quá ngày làm việc của bản mẫu 07/10/2026 */
function congNgay(ngay: string, them: number): string {
  const [d, m, y] = ngay.split('/').map(Number)
  const t = new Date(y, m - 1, d + them)
  const ra = t > new Date(2026, 9, 7) ? new Date(2026, 9, 7) : t
  return `${p2(ra.getDate())}/${p2(ra.getMonth() + 1)}/${ra.getFullYear()}`
}

function tinh(n: NguonTt): Mau {
  const cu = daTinh.get(n.seed)
  if (cu) return cu
  const goc = new Map<string, Partial<Row>>()
  const tam: (Row & { _sx: string })[] = []
  for (const r of chungTu(n.cfg(), n.seed)) {
    const t = ttNghiepVu(r).ttTien
    const tong = Number(r.tong) || 0
    if (t === 'chua' || tong <= 0) continue
    const tien = t === 'da' ? tong : Math.round(tong * 0.4 / 1000) * 1000
    const nh = tong >= 10_000_000
    const loai = n.chi ? (nh ? 'unc' : 'chi') : (nh ? 'bc' : 'thu')
    const ngay = t === 'da' ? String(r.ngay) : congNgay(String(r.ngay), 2)
    const id = `tt-${n.seed.replace(/\./g, '-')}-${r.id}`
    const dg = `${n.chi ? 'Chi' : 'Thu'} tiền ${n.viec} theo ${r.so}`
    tam.push({
      id, so: '', _sx: `${ngay.split('/').reverse().join('')}|${r.so}`, loai, tenLoai: TEN[loai],
      ngay, gio: String(r.gio ?? ''), thang: Number(ngay.split('/')[1]), cn: r.cn, doiTuong: r.doiTuong, maDt: r.maDt,
      dienGiai: dg, tien, thue: 0, tong: tien, nguon: 'tay', tt: 'ghi',
      _lyDo: n.ly, _ghiChu: dg, _thamChieu: r.so, _thamChieuDi: `/app/${n.man}/${r.id}`,
      _dong: [{ ma: '', ten: dg, dvt: '', sl: 1, gia: tien, tien, ts: 0, thue: 0, ly: n.ly, dt: r.doiTuong, km: '', cv: '' }],
    })
    goc.set(String(r.id), t === 'da'
      ? { _httt: nh ? 'chuyenkhoan' : 'tienmat', _ctTt: { id, so: '', loai } }
      : { _httt: 'congno', _dsTt: [{ id, so: '', loai, tien }] })
  }
  // Đánh số theo ngày trong từng loại, từng tháng; từ 0001 để khỏi trùng phiếu mẫu Thu chi (số từ 0180 trở lên)
  const dem = new Map<string, number>()
  tam.sort((a, b) => a._sx.localeCompare(b._sx))
  const phieu: Row[] = tam.map(({ _sx, ...r }) => {
    const [, m, y] = String(r.ngay).split('/')
    const tienTo = `${TIEN_TO[String(r.loai)]}${y.slice(2)}${m}-`
    const k = (dem.get(tienTo) ?? 0) + 1
    dem.set(tienTo, k)
    return { ...r, so: `${tienTo}${String(k).padStart(4, '0')}` }
  })
  const soCua = new Map(phieu.map(r => [String(r.id), String(r.so)]))
  for (const g of goc.values()) {
    if (g._ctTt) g._ctTt = { ...(g._ctTt as object), so: soCua.get((g._ctTt as { id: string }).id) }
    if (g._dsTt) g._dsTt = (g._dsTt as { id: string }[]).map(c => ({ ...c, so: soCua.get(c.id) }))
  }
  const ra = { goc, phieu: phieu.reverse() }   // mới nhất lên đầu như danh sách Thu chi
  daTinh.set(n.seed, ra)
  return ra
}

/** Phiếu mua, bán mẫu kèm tham chiếu phiếu thu, chi thanh toán (dùng làm rowsMau của màn) */
export function phieuGocCoTt(seed: string): Row[] {
  const n = NGUON.find(x => x.seed === seed)!
  const { goc } = tinh(n)
  return chungTu(n.cfg(), seed).map(r => ({ ...r, ...goc.get(String(r.id)) }))
}

/** Phiếu thu, chi mẫu bên Thu chi 2.1.1, chỉ của màn mua, bán có trong gói đang dùng */
export function phieuTtMau(s?: Session): Row[] {
  return NGUON.filter(n => !s || coTrongGoi(n.seed, s.goi)).flatMap(n => tinh(n).phieu)
}
