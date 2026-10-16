// Số liệu ba khối Mua hàng, Công nợ phải trả NCC, Hao hụt kiểm kê ở trang chủ gói Free (T304).
// Gói Free: công nợ không có hạn thanh toán, kiểm kê chỉ theo dõi số lượng (không tính tiền thừa, thiếu).
import { timMan } from '../../app/registry'
import { chungTu, dongCua } from '../../ui/generic/gen'
import { PHIEU_MUA } from '../mua-hang/bao-cao'
import { rowsCongNo } from '../bao-cao/cong-no'
import { NVL } from '../../data/mock'

export interface CotThang { l: string; v: number; mau?: boolean }

const nhanThang = (t: number) => `T${t}/26`
const ngayCua = (r: Record<string, unknown>) => Number(String(r.ngay ?? '').split('/')[0]) || 0
const sau6Thang = (thang: number) => Array.from({ length: 6 }, (_, i) => thang - 5 + i).filter(t => t >= 1)

// Hệ số nhập mua các tháng chưa có phiếu mẫu so với trung bình các tháng có phiếu (T304)
const HE_SO_MUA = [0.92, 1.06, 0.97, 1.09, 0.95, 1.02]

/** Mua hàng trong tháng: tổng nhập (gồm thuế GTGT), số đơn, số NCC, so cùng kỳ tháng trước (cùng số ngày đã có),
 *  tỷ lệ trên doanh thu, 3 mặt hàng nhập nhiều tiền nhất, nhập mua 6 tháng (tháng chưa có phiếu là số mẫu) */
export function soLieuMua(thang: number, tenCn: Set<string>, doanhThu: number) {
  const tatCa = chungTu(PHIEU_MUA, '4.1.1').filter(r => tenCn.has(String(r.cn)))
  const cuaThang = (t: number) => tatCa.filter(r => Number(r.thang) === t)
  const tong = (ds: typeof tatCa) => ds.reduce((a, r) => a + (Number(r.tong) || 0), 0)
  const ds = cuaThang(thang)
  const nhap = tong(ds)
  // So cùng kỳ: tháng trước, chỉ lấy tới ngày lớn nhất đã có phiếu tháng này (tháng 10 mới có số đến 07/10)
  const denNgay = Math.max(0, ...ds.map(ngayCua))
  const truoc = cuaThang(thang - 1)
  const truocCungKy = tong(truoc.filter(r => ngayCua(r) <= denNgay))
  const caThangTruoc = denNgay >= 28
  const soSanh = truoc.length && truocCungKy > 0
    ? { pct: nhap / truocCungKy - 1, truoc: truocCungKy, nhan: caThangTruoc ? `tháng ${thang - 1}` : `cùng ${denNgay} ngày đầu tháng ${thang - 1}` }
    : null
  // Mặt hàng nhập nhiều tiền nhất
  const mh = new Map<string, { ma: string; ten: string; dvt: string; sl: number; tien: number }>()
  for (const r of ds) {
    for (const d of dongCua(PHIEU_MUA, `4.1.1-${r.id}`)) {
      const cu = mh.get(d.ma) ?? { ma: d.ma, ten: d.ten, dvt: String(d.dvt ?? ''), sl: 0, tien: 0 }
      cu.sl += Number(d.sl) || 0
      cu.tien += (Number(d.tien) || 0) + (Number(d.thue) || 0)
      mh.set(d.ma, cu)
    }
  }
  const topMh = [...mh.values()].sort((a, b) => b.tien - a.tien).slice(0, 3)
  const coSo = sau6Thang(thang).map(t => ({ t, v: tong(cuaThang(t)) }))
  const tb = coSo.filter(x => x.v > 0 && x.t !== thang).map(x => x.v)
  const tbThang = tb.length ? tb.reduce((a, v) => a + v, 0) / tb.length : nhap
  const bieuDo: CotThang[] = coSo.map((x, i) => x.v > 0 ? { l: nhanThang(x.t), v: x.v } : { l: nhanThang(x.t), v: Math.round(tbThang * HE_SO_MUA[i] / 1e5) * 1e5, mau: true })
  return {
    nhap, soDon: ds.length, soNcc: new Set(ds.map(r => String(r.doiTuong))).size,
    tyLeDt: doanhThu > 0 ? nhap / doanhThu : 0, soSanh, topMh, bieuDo, denNgay, coMau: bieuDo.some(x => x.mau),
  }
}

/** Công nợ phải trả NCC: nợ cuối kỳ, phát sinh, đã trả trong tháng, nợ cũ từ tháng trước chưa trả hết
 *  (gói Free không có hạn thanh toán nên tính theo tháng phát sinh), 3 NCC nợ nhiều nhất, nợ cuối 6 tháng */
export function soLieuCongNo(thang: number, motCn?: string) {
  const cua = (t: number) => rowsCongNo('ncc', t, motCn).filter(r => !r._t)
  const ds = cua(thang)
  const so = (r: Record<string, unknown>, k: string) => Number(r[k]) || 0
  const daTra = (r: Record<string, unknown>) => so(r, 'tra') + so(r, 'tt')
  const conNo = ds.filter(r => so(r, 'cuoi') > 0)
  const noCu = ds.map(r => ({ ten: String(r.ten), v: Math.max(0, so(r, 'dau') - daTra(r)) })).filter(x => x.v > 0)
  return {
    cuoi: conNo.reduce((a, r) => a + so(r, 'cuoi'), 0),
    soNcc: conNo.length,
    phatSinh: ds.reduce((a, r) => a + so(r, 'ps'), 0),
    daTra: ds.reduce((a, r) => a + daTra(r), 0),
    noCu: noCu.reduce((a, x) => a + x.v, 0), soNccNoCu: noCu.length,
    top: conNo.sort((a, b) => so(b, 'cuoi') - so(a, 'cuoi')).slice(0, 3).map(r => ({ ten: String(r.ten), v: so(r, 'cuoi') })),
    bieuDo: sau6Thang(thang).map((t): CotThang => ({ l: nhanThang(t), v: cua(t).reduce((a, r) => a + Math.max(0, so(r, 'cuoi')), 0) })),
  }
}

/** Hao hụt kiểm kê theo số lượng: so tồn sổ sách với tồn thực tế từng dòng phiếu kiểm kê trong tháng.
 *  Mặt hàng thiếu, thừa, tỷ lệ lệch trên số mặt hàng đã kiểm, 3 mặt hàng thiếu nhiều nhất (kèm ĐVT),
 *  số mặt hàng lệch theo cửa hàng, cửa hàng chưa kiểm kê tháng này */
export function soLieuKiemKe(thang: number, tenCn: Set<string>) {
  const cfg = timMan('kho', '5-1-10').sc?.voucher
  const phieu = cfg ? chungTu(cfg, '5.1.10').filter(r => Number(r.thang) === thang && tenCn.has(String(r.cn))) : []
  const dong = new Map<string, { cn: string; ma: string; ten: string; dvt: string; lech: number }>()
  for (const p of phieu) {
    for (const d of dongCua(cfg!, `5.1.10-${p.id}`)) {
      const k = `${p.cn}|${d.ma}`
      const cu = dong.get(k) ?? { cn: String(p.cn), ma: d.ma, ten: d.ten, dvt: String(d.dvt ?? ''), lech: 0 }
      cu.lech += (Number(d.tonTt) || 0) - (Number(d.tonHt) || 0)
      dong.set(k, cu)
    }
  }
  const ds = [...dong.values()]
  const thieu = ds.filter(x => x.lech < 0), thua = ds.filter(x => x.lech > 0)
  const theoCn = [...tenCn].map(cn => ({ cn, lech: ds.filter(x => x.cn === cn && x.lech !== 0).length, daKiem: phieu.some(p => p.cn === cn) }))
  return {
    soKiem: ds.length, thieu: thieu.length, thua: thua.length,
    tongMh: NVL.length * tenCn.size,   // mặt hàng cần kiểm: mỗi cửa hàng đang xem đủ danh mục nguyên vật liệu
    tyLe: ds.length ? (thieu.length + thua.length) / ds.length : 0,
    topThieu: thieu.sort((a, b) => a.lech - b.lech).slice(0, 3),
    chuaKiem: theoCn.filter(x => !x.daKiem).map(x => x.cn),
    bieuDo: theoCn.map((x): CotThang => ({ l: x.cn.replace(/^Phố Mây /, ''), v: x.lech })),
  }
}
