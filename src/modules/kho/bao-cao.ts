// Báo cáo tổng hợp, chi tiết nhập kho, xuất kho, hàng trả lại (T157). Lấy đúng các phiếu trong danh sách chứng từ
// (cùng hạt giống, cùng dòng hàng) nên số phiếu bấm mở được phiếu và tổng hợp khớp chi tiết. File dữ liệu: không import index.ts nào
import { createElement } from 'react'
import { Link } from 'react-router-dom'
import type { Col, Row, VoucherCfg } from '../types'
import { CUA_HANG } from '../../data/mock'
import { chungTu, dongCua, type Dong } from '../../ui/generic/gen'
import { KHOA_LOC_NGUON, docLocNguon, quaLocDong } from '../bao-cao/loc-nguon'
import { datLocDaXem } from '../../ui/bao-cao/tuyChinhBC'
import { mauDieuChinh } from './dieu-chinh'
import { xnt } from './data'

/** Một loại phiếu nguồn: cấu hình chứng từ, hạt giống (mã màn) và đường dẫn màn chứng từ sau /app/.
 *  ds: phiếu mẫu riêng có sẵn dòng hàng ở _dong, thay phiếu sinh theo hạt giống (điều chuyển, T155) */
export interface NguonPhieu { loai: string; cfg: VoucherCfg; seed: string; di: string; ds?: () => Row[] }

interface DongKho {
  d: number; ngay: string; so: string; loai: string; kho: string; doiTuong: string; ma: string; ten: string; dvt: string
  sl: number; gia: number; tien: number; _di: string
}

/** Dòng hàng các phiếu trong tháng; cn là tên cửa hàng chọn trên thanh trên. Kho lấy như form phiếu: kho ghi trên phiếu, không có thì kho đầu của cửa hàng.
 *  Bộ lọc kho, hàng hoá, nhóm hàng hoá lọc dòng hàng trước khi cộng (T207) */
function dongKho(nguon: NguonPhieu[], thang: number, cn?: string, loc?: Record<string, string[]>): DongKho[] {
  const f = docLocNguon(loc)
  return nguon.flatMap(n => (n.ds ? n.ds() : chungTu(n.cfg, n.seed))
    .filter(r => r.thang === thang && (!cn || r.cn === cn) && r.ttSx !== 'huy')   // phiếu điều chuyển đã huỷ không vào báo cáo (T155)
    .flatMap(r => (n.ds ? (r._dong as Dong[] | undefined) ?? [] : dongCua(n.cfg, `${n.seed}-${r.id}`)).map((x): DongKho => ({
      d: Number(String(r.ngay).slice(0, 2)), ngay: r.ngay, so: r.so, loai: n.loai,
      kho: String(r._kho || CUA_HANG.find(c => c.ten === r.cn)?.kho[0] || ''), doiTuong: r.doiTuong,
      ma: x.ma, ten: x.ten, dvt: x.dvt, sl: x.sl, gia: x.gia, tien: x.tien, _di: `${n.di}/${r.id}`,
    }))))
    .filter(x => quaLocDong(f, x))
    .sort((a, b) => a.d - b.d || a.so.localeCompare(b.so))
}
const cong = (ds: Row[], k: string) => ds.reduce((a, x) => a + (Number(x[k]) || 0), 0)

/** Số phiếu là liên kết mở phiếu; dòng tổng không có liên kết */
const cotSo: Col = { k: 'so', t: 'Số phiếu', cls: 'code', w: 120,
  r: x => x._di ? createElement(Link, { to: `/app/${x._di}`, className: 'ds-link-so', style: { fontSize: 'inherit' } }, x.so) : x.so }

/** Chi tiết: mỗi dòng hàng của phiếu một dòng; đơn giá, thành tiền ghi là Giá vốn, Tiền vốn (T213) */
export const chiTietKho = (nguon: () => NguonPhieu[]) => ({
  cols: [{ k: 'ngay', t: 'Ngày', w: 88 }, cotSo, { k: 'loai', t: 'Loại phiếu', w: 120 }, { k: 'kho', t: 'Kho', w: 130 }, { k: 'doiTuong', t: 'Đối tượng' },
    { k: 'ma', t: 'Mã hàng', cls: 'code', w: 70 }, { k: 'ten', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT', c: true, w: 50 },
    { k: 'sl', t: 'Số lượng', num: true }, { k: 'gia', t: 'Giá vốn', num: true }, { k: 'tien', t: 'Tiền vốn', num: true }] as Col[],
  rows: (thang: number, cn?: string, loc?: Record<string, string[]>): Row[] => {
    const ds: Row[] = dongKho(nguon(), thang, cn, loc).map(({ d: _, ...x }) => x)
    return [...ds, { ten: 'Tổng cộng', tien: cong(ds, 'tien'), _t: 1 }]
  },
})

/** Tổng hợp theo mặt hàng: số lượng, giá trị, kèm số lượng, giá trị theo từng loại phiếu (T212).
 *  Dòng tổng không cộng số lượng vì các mặt hàng khác đơn vị tính */
export const tongHopKho = (nguon: () => NguonPhieu[], dsLoai: string[], chiTiet: string) => {
  const kLoai = (i: number) => `l${i}`
  const kSlLoai = (i: number) => `sl${i}`
  // Bấm mã, tên hàng mở báo cáo chi tiết (slug chiTiet) lọc sẵn hàng đó, cùng kỳ, giữ bộ lọc đang xem (T215)
  const moChiTiet = (x: Row, chu: string) => x._t ? chu : createElement(Link, {
    to: `/app/bao-cao/${chiTiet}`, className: 'bc-mo-so', title: 'Xem chi tiết',
    onClick: () => datLocDaXem(`/app/bao-cao/${chiTiet}`, { ...x._loc, [KHOA_LOC_NGUON.hang]: [x.ten] }, String(x._ky)),
  }, chu)
  return {
    cols: [{ k: 'ma', t: 'Mã hàng', cls: 'code', w: 80, r: x => moChiTiet(x, x.ma) }, { k: 'ten', t: 'Tên hàng', r: x => moChiTiet(x, x.ten) }, { k: 'dvt', t: 'ĐVT', c: true, w: 55 },
      { k: 'sl', t: 'Số lượng', num: true, nhom: 'Tổng' }, { k: 'tien', t: 'Giá trị', num: true, nhom: 'Tổng' },
      ...dsLoai.flatMap((l, i) => [{ k: kSlLoai(i), t: 'Số lượng', num: true, nhom: l }, { k: kLoai(i), t: 'Giá trị', num: true, nhom: l }])] as Col[],
    rows: (thang: number, cn?: string, loc?: Record<string, string[]>): Row[] => {
      const nhom = new Map<string, Row>()
      for (const x of dongKho(nguon(), thang, cn, loc)) {
        const g = nhom.get(x.ma) ?? { ma: x.ma, ten: x.ten, dvt: x.dvt, sl: 0, tien: 0, _ky: thang, _loc: loc, ...Object.fromEntries(dsLoai.flatMap((_, i) => [[kSlLoai(i), 0], [kLoai(i), 0]])) }
        g.sl += x.sl; g.tien += x.tien
        g[kSlLoai(dsLoai.indexOf(x.loai))] += x.sl
        g[kLoai(dsLoai.indexOf(x.loai))] += x.tien
        nhom.set(x.ma, g)
      }
      const ds = [...nhom.values()].sort((a, b) => a.ma.localeCompare(b.ma))
      return [...ds, { ten: 'Tổng cộng', tien: cong(ds, 'tien'), ...Object.fromEntries(dsLoai.map((_, i) => [kLoai(i), cong(ds, kLoai(i))])), _t: 1 }]
    },
  }
}

/** Báo cáo kiểm kê (T244): mỗi mặt hàng, kho một dòng; số lượng thừa, thiếu cộng từ phiếu kiểm kê trong tháng
 *  (thừa là phiếu nhập điều chỉnh, thiếu là phiếu xuất điều chỉnh sinh từ kiểm kê). Không có dòng tổng vì các mặt hàng khác đơn vị tính.
 *  Tồn đầu, nhập, xuất, tồn cuối hệ thống lấy từ xuất nhập tồn cùng kỳ, cùng kho; tồn thực tế = tồn hệ thống + thừa − thiếu (T345) */
export const baoCaoKiemKe = (cfgKk: () => VoucherCfg) => ({
  cols: [{ k: 'ma', t: 'Mã hàng', cls: 'code', w: 80 }, { k: 'ten', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT', c: true, w: 55 }, { k: 'kho', t: 'Kho', w: 150 },
    // gói Free chỉ Thừa, Thiếu, PhuongXT 20/10/2026 (T502)
    { k: 'ton0', t: 'Tồn đầu', num: true, w: 80, wCung: true, nhom: 'Số lượng', goi: ['S', 'PL', 'PR'] }, { k: 'nhap', t: 'Nhập trong kỳ', num: true, w: 90, wCung: true, nhom: 'Số lượng', goi: ['S', 'PL', 'PR'] },
    { k: 'xuat', t: 'Xuất trong kỳ', num: true, w: 90, wCung: true, nhom: 'Số lượng', goi: ['S', 'PL', 'PR'] }, { k: 'tonHt', t: 'Tồn cuối hệ thống', num: true, w: 100, wCung: true, nhom: 'Số lượng', goi: ['S', 'PL', 'PR'] },
    { k: 'tonTt', t: 'Tồn cuối thực tế', num: true, w: 100, wCung: true, nhom: 'Số lượng', goi: ['S', 'PL', 'PR'] },
    { k: 'thua', t: 'Thừa', num: true, w: 70, wCung: true, nhom: 'Số lượng' }, { k: 'thieu', t: 'Thiếu', num: true, w: 70, wCung: true, nhom: 'Số lượng' }] as Col[],
  rows: (thang: number, cn?: string, loc?: Record<string, string[]>): Row[] => {
    const f = docLocNguon(loc)
    const nhom = new Map<string, Row>()
    for (const r of mauDieuChinh(cfgKk()).filter(x => Number(x.thang) === thang && (!cn || x.cn === cn))) {
      const kho = String(r._kho || CUA_HANG.find(c => c.ten === r.cn)?.kho[0] || '')
      for (const d of (r._dong as Dong[] | undefined) ?? []) {
        if (!quaLocDong(f, { ...d, kho })) continue
        const key = `${d.ma}|${kho}`
        const g = nhom.get(key) ?? { ma: d.ma, ten: d.ten, dvt: d.dvt, kho, thua: 0, thieu: 0 }
        if (r.loai === 'ndc') g.thua += d.sl
        else g.thieu += d.sl
        nhom.set(key, g)
      }
    }
    return [...nhom.values()].map(g => {
      const x = xnt(thang, g.kho).find(h => h.ma === g.ma)
      return x ? { ...g, ton0: x.sl0, nhap: x.sln, xuat: x.slx, tonHt: x.sl1, tonTt: x.sl1 + g.thua - g.thieu } : g
    }).sort((a, b) => a.ma.localeCompare(b.ma) || a.kho.localeCompare(b.kho))
  },
})

/** Tổng hợp hàng trả lại: mỗi loại (khách trả lại, trả nhà cung cấp) và mặt hàng một dòng */
export const tongHopTra = (nguon: () => NguonPhieu[]) => ({
  cols: [{ k: 'loai', t: 'Loại', w: 150 }, { k: 'ma', t: 'Mã hàng', cls: 'code', w: 80 }, { k: 'ten', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT', c: true, w: 55 },
    { k: 'soPhieu', t: 'Số phiếu', num: true, w: 80 }, { k: 'sl', t: 'Số lượng', num: true }, { k: 'tien', t: 'Giá trị', num: true }] as Col[],
  rows: (thang: number, cn?: string, loc?: Record<string, string[]>): Row[] => {
    const nhom = new Map<string, Row & { _so: Set<string> }>()
    for (const x of dongKho(nguon(), thang, cn, loc)) {
      const key = `${x.loai}|${x.ma}`
      const g = nhom.get(key) ?? { loai: x.loai, ma: x.ma, ten: x.ten, dvt: x.dvt, sl: 0, tien: 0, _so: new Set<string>() }
      g.sl += x.sl; g.tien += x.tien; g._so.add(x.so)
      nhom.set(key, g)
    }
    const thuTu = nguon().map(n => n.loai)
    const ds: Row[] = [...nhom.values()].sort((a, b) => thuTu.indexOf(a.loai) - thuTu.indexOf(b.loai) || a.ma.localeCompare(b.ma))
      .map(({ _so, ...g }) => ({ ...g, soPhieu: _so.size }))
    return [...ds, { ten: 'Tổng cộng', tien: cong(ds, 'tien'), _t: 1 }]
  },
})
