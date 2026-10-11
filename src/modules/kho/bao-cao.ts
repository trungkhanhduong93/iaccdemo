// Báo cáo tổng hợp, chi tiết nhập kho, xuất kho, hàng trả lại (T157). Lấy đúng các phiếu trong danh sách chứng từ
// (cùng hạt giống, cùng dòng hàng) nên số phiếu bấm mở được phiếu và tổng hợp khớp chi tiết. File dữ liệu: không import index.ts nào
import { createElement } from 'react'
import { Link } from 'react-router-dom'
import type { Col, Row, VoucherCfg } from '../types'
import { CHI_NHANH } from '../../data/mock'
import { chungTu, dongCua } from '../../ui/generic/gen'

/** Một loại phiếu nguồn: cấu hình chứng từ, hạt giống (mã màn) và đường dẫn màn chứng từ sau /app/ */
export interface NguonPhieu { loai: string; cfg: VoucherCfg; seed: string; di: string }

interface DongKho {
  d: number; ngay: string; so: string; loai: string; kho: string; doiTuong: string; ma: string; ten: string; dvt: string
  sl: number; gia: number; tien: number; _di: string
}

/** Dòng hàng các phiếu trong tháng; cn là tên chi nhánh chọn trên thanh trên. Kho lấy như form phiếu: kho ghi trên phiếu, không có thì kho đầu của chi nhánh */
function dongKho(nguon: NguonPhieu[], thang: number, cn?: string): DongKho[] {
  return nguon.flatMap(n => chungTu(n.cfg, n.seed)
    .filter(r => r.thang === thang && (!cn || r.cn === cn))
    .flatMap(r => dongCua(n.cfg, `${n.seed}-${r.id}`).map((x): DongKho => ({
      d: Number(String(r.ngay).slice(0, 2)), ngay: r.ngay, so: r.so, loai: n.loai,
      kho: String(r._kho || CHI_NHANH.find(c => c.ten === r.cn)?.kho[0] || ''), doiTuong: r.doiTuong,
      ma: x.ma, ten: x.ten, dvt: x.dvt, sl: x.sl, gia: x.gia, tien: x.tien, _di: `${n.di}/${r.id}`,
    }))))
    .sort((a, b) => a.d - b.d || a.so.localeCompare(b.so))
}
const cong = (ds: Row[], k: string) => ds.reduce((a, x) => a + (Number(x[k]) || 0), 0)

/** Số phiếu là liên kết mở phiếu; dòng tổng không có liên kết */
const cotSo: Col = { k: 'so', t: 'Số phiếu', cls: 'code', w: 120,
  r: x => x._di ? createElement(Link, { to: `/app/${x._di}`, className: 'ds-link-so', style: { fontSize: 'inherit' } }, x.so) : x.so }

/** Chi tiết: mỗi dòng hàng của phiếu một dòng */
export const chiTietKho = (nguon: () => NguonPhieu[]) => ({
  cols: [{ k: 'ngay', t: 'Ngày', w: 88 }, cotSo, { k: 'loai', t: 'Loại phiếu', w: 120 }, { k: 'kho', t: 'Kho', w: 130 }, { k: 'doiTuong', t: 'Đối tượng' },
    { k: 'ma', t: 'Mã hàng', cls: 'code', w: 70 }, { k: 'ten', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT', c: true, w: 50 },
    { k: 'sl', t: 'Số lượng', num: true }, { k: 'gia', t: 'Đơn giá', num: true }, { k: 'tien', t: 'Thành tiền', num: true }] as Col[],
  rows: (thang: number, cn?: string): Row[] => {
    const ds: Row[] = dongKho(nguon(), thang, cn).map(({ d: _, ...x }) => x)
    return [...ds, { ten: 'Tổng cộng', tien: cong(ds, 'tien'), _t: 1 }]
  },
})

/** Tổng hợp theo mặt hàng: số lượng, giá trị, kèm giá trị theo từng loại phiếu */
export const tongHopKho = (nguon: () => NguonPhieu[], dsLoai: string[]) => {
  const kLoai = (i: number) => `l${i}`
  return {
    cols: [{ k: 'ma', t: 'Mã hàng', cls: 'code', w: 80 }, { k: 'ten', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT', c: true, w: 55 },
      { k: 'sl', t: 'Số lượng', num: true }, { k: 'tien', t: 'Giá trị', num: true },
      ...dsLoai.map((l, i) => ({ k: kLoai(i), t: l, num: true, nhom: 'Giá trị theo loại phiếu' }))] as Col[],
    rows: (thang: number, cn?: string): Row[] => {
      const nhom = new Map<string, Row>()
      for (const x of dongKho(nguon(), thang, cn)) {
        const g = nhom.get(x.ma) ?? { ma: x.ma, ten: x.ten, dvt: x.dvt, sl: 0, tien: 0, ...Object.fromEntries(dsLoai.map((_, i) => [kLoai(i), 0])) }
        g.sl += x.sl; g.tien += x.tien
        g[kLoai(dsLoai.indexOf(x.loai))] += x.tien
        nhom.set(x.ma, g)
      }
      const ds = [...nhom.values()].sort((a, b) => a.ma.localeCompare(b.ma))
      return [...ds, { ten: 'Tổng cộng', tien: cong(ds, 'tien'), ...Object.fromEntries(dsLoai.map((_, i) => [kLoai(i), cong(ds, kLoai(i))])), _t: 1 }]
    },
  }
}

/** Tổng hợp hàng trả lại: mỗi loại (khách trả lại, trả nhà cung cấp) và mặt hàng một dòng */
export const tongHopTra = (nguon: () => NguonPhieu[]) => ({
  cols: [{ k: 'loai', t: 'Loại', w: 150 }, { k: 'ma', t: 'Mã hàng', cls: 'code', w: 80 }, { k: 'ten', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT', c: true, w: 55 },
    { k: 'soPhieu', t: 'Số phiếu', num: true, w: 80 }, { k: 'sl', t: 'Số lượng', num: true }, { k: 'tien', t: 'Giá trị', num: true }] as Col[],
  rows: (thang: number, cn?: string): Row[] => {
    const nhom = new Map<string, Row & { _so: Set<string> }>()
    for (const x of dongKho(nguon(), thang, cn)) {
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
