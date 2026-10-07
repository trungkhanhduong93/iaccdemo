// Dữ liệu giả phân hệ Kho: công thức, sơ chế, tồn đầu, định mức tồn, thẻ kho, nhập xuất, tồn tức thời, xuất nhập tồn
import { createElement } from 'react'
import type { CatalogCfg, Col, Row } from '../types'
import { HANG, KHO, NVL } from '../../data/mock'
import { between, money, pad, rng } from '../../ui/format'

const g = (r: () => number, a: number, b: number) => Math.round(between(r, a, b))

export const congThuc: CatalogCfg = {
  them: 'Thêm công thức', nhomLoc: 'mon',
  cols: [{ k: 'mon', t: 'Món' }, { k: 'nvl', t: 'Nguyên vật liệu' }, { k: 'dl', t: 'Định lượng', num: true }, { k: 'dvt', t: 'ĐVT' }, { k: 'gv', t: 'Giá vốn ước tính', num: true }],
  rows: () => ([
    ['Phở bò tái', 'Bánh phở tươi', 200, 'g', 3600], ['Phở bò tái', 'Thịt bò thăn', 80, 'g', 25600], ['Phở bò tái', 'Xương ống bò (nước dùng)', 150, 'g', 9750], ['Phở bò tái', 'Rau thơm các loại', 20, 'g', 800],
    ['Cơm tấm sườn bì chả', 'Gạo tấm', 180, 'g', 3420], ['Cơm tấm sườn bì chả', 'Sườn heo', 160, 'g', 23200], ['Cơm tấm sườn bì chả', 'Dầu ăn', 15, 'ml', 720],
    ['Cà phê sữa đá', 'Cà phê hạt Robusta', 25, 'g', 5250], ['Cà phê sữa đá', 'Sữa đặc', 40, 'ml', 2400],
    ['Trà đào cam sả', 'Đào ngâm', 60, 'g', 3900], ['Gỏi cuốn tôm thịt', 'Tôm sú', 50, 'g', 14000],
  ] as [string, string, number, string, number][]).map(([mon, nvl, dl, dvt, gv]) => ({ mon, nvl, dl, dvt, gv })),
}

export const soChe: CatalogCfg = {
  them: 'Thêm công thức sơ chế',
  cols: [{ k: 'tho', t: 'Nguyên liệu thô' }, { k: 'tp', t: 'Sau sơ chế' }, { k: 'hh', t: 'Tỷ lệ hao hụt', num: true }, { k: 'gc', t: 'Ghi chú', cls: 'dim' }],
  rows: () => [['Thịt bò nguyên tảng', 'Thịt bò thăn thái lát', '18%', 'Lọc gân, mỡ'], ['Tôm sú nguyên con', 'Tôm sú bóc vỏ', '35%', 'Bỏ đầu, vỏ'], ['Sườn heo nguyên dẻ', 'Sườn cắt miếng ướp', '6%', 'Ướp 4 giờ'], ['Rau thơm', 'Rau đã nhặt rửa', '22%', 'Nhặt lá úa']]
    .map(([tho, tp, hh, gc]) => ({ tho, tp, hh, gc })),
}

export const tonBanDau: CatalogCfg = {
  them: 'Thêm dòng tồn đầu', nhomLoc: 'kho',
  cols: [{ k: 'kho', t: 'Kho' }, { k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên' }, { k: 'dvt', t: 'ĐVT' }, { k: 'sl', t: 'Số lượng', num: true }, { k: 'gia', t: 'Đơn giá', num: true }, { k: 'tien', t: 'Thành tiền', num: true }],
  rows: () => {
    const r = rng('tondau')
    return KHO.slice(0, 3).flatMap(kho => NVL.slice(0, 6).map(n => { const sl = g(r, 5, 60); return { kho, ma: n.ma, ten: n.ten, dvt: n.dvt, sl, gia: n.gia, tien: sl * n.gia } }))
  },
}

export const dinhMucTon: CatalogCfg = {
  them: 'Thêm định mức', nhomLoc: 'kho',
  cols: [{ k: 'kho', t: 'Kho' }, { k: 'ten', t: 'Nguyên vật liệu' }, { k: 'dvt', t: 'ĐVT' }, { k: 'min', t: 'Tồn tối thiểu', num: true }, { k: 'max', t: 'Tồn tối đa', num: true },
    { k: 'ton', t: 'Tồn hiện tại', num: true }, { k: 'tt', t: 'Cảnh báo', r: (x: Row) => createElement('span', { className: `stt ${x.ton < x.min ? 'err' : x.ton > x.max ? 'warn' : 'ok'}` }, x.ton < x.min ? 'Dưới mức tối thiểu' : x.ton > x.max ? 'Vượt mức tối đa' : 'Trong định mức') }],
  rows: () => {
    const r = rng('dinhmuc')
    return KHO.slice(1, 3).flatMap(kho => NVL.slice(0, 7).map(n => { const min = g(r, 5, 20); return { kho, ten: n.ten, dvt: n.dvt, min, max: min * 4, ton: g(r, 2, min * 4.6) } }))
  },
}

export const theKho = {
  cols: [{ k: 'ngay', t: 'Ngày', w: 90 }, { k: 'so', t: 'Số phiếu', cls: 'code' }, { k: 'dg', t: 'Diễn giải' }, { k: 'nhap', t: 'Nhập', num: true }, { k: 'xuat', t: 'Xuất', num: true }, { k: 'ton', t: 'Tồn', num: true }] as Col[],
  rows: (thang: number): Row[] => {
    const r = rng('thekho' + thang)
    let ton = 18.5
    const out: Row[] = [{ dg: 'Thịt bò thăn · Kho bếp Lê Lợi · Tồn đầu kỳ (kg)', ton, _b: 1 }]
    const dim = thang === 10 ? 7 : 30
    for (let d = 1; d <= dim; d++) {
      if (d % 3 === 1) { const n = g(r, 20, 30); ton += n; out.push({ ngay: `${pad(d)}/${pad(thang)}/2026`, so: `MH26${pad(thang)}-${pad(d * 7, 4)}`, dg: 'Nhập mua từ Thực phẩm Tươi An Phú', nhap: n, ton }) }
      const x = Math.round(between(r, 6.5, 9.8) * 10) / 10; ton = Math.round((ton - x) * 10) / 10
      out.push({ ngay: `${pad(d)}/${pad(thang)}/2026`, so: `XB26${pad(thang)}-Q1-${pad(d)}`, dg: 'Xuất bán POS theo định lượng', xuat: x, ton })
    }
    return out.map(o => ({ ...o, nhap: o.nhap ? money(o.nhap) : '', xuat: o.xuat ? o.xuat.toLocaleString('vi-VN') : '', ton: o.ton.toLocaleString('vi-VN') }))
  },
}

export const nhapXuat = {
  cols: [{ k: 'ngay', t: 'Ngày', w: 90 }, { k: 'so', t: 'Số phiếu', cls: 'code' }, { k: 'loai', t: 'Loại phiếu' }, { k: 'kho', t: 'Kho' }, { k: 'mh', t: 'Số mặt hàng', num: true }, { k: 'gt', t: 'Giá trị', num: true }] as Col[],
  rows: (thang: number): Row[] => {
    const r = rng('nhapxuat' + thang)
    const loai: [string, string][] = [['MH', 'Nhập mua'], ['XB', 'Xuất bán POS'], ['XH', 'Xuất huỷ'], ['DCK', 'Điều chuyển'], ['NK', 'Nhập khác'], ['XK', 'Xuất khác']]
    const out: Row[] = Array.from({ length: 24 }, (_, i) => {
      const [p, l] = loai[Math.floor(r() * loai.length)]
      const d = 1 + Math.floor(r() * (thang === 10 ? 7 : 30))
      return { d, ngay: `${pad(d)}/${pad(thang)}/2026`, so: `${p}26${pad(thang)}-${pad(i + 11, 4)}`, loai: l, kho: KHO[Math.floor(r() * KHO.length)], mh: g(r, 2, 14), gt: g(r, 1.2e6, 46e6) }
    }).sort((a, b) => a.d - b.d)
    return [...out, { loai: 'Tổng cộng', gt: out.reduce((a, x) => a + x.gt, 0), _t: 1 }]
  },
}

export const tonTucThoi = {
  cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên' }, { k: 'kho', t: 'Kho' }, { k: 'dvt', t: 'ĐVT' }, { k: 'ton', t: 'Tồn hiện tại', num: true, r: (x: Row) => createElement('b', { style: { color: x.ton < 0 ? 'var(--red)' : 'var(--ink)' } }, x.ton.toLocaleString('vi-VN')) },
    { k: 'gt', t: 'Giá trị', num: true }, { k: 'luc', t: 'Cập nhật', cls: 'dim' }] as Col[],
  rows: (): Row[] => {
    const r = rng('tontucthoi')
    const out: Row[] = NVL.slice(0, 9).map(n => {
      const kho = 'Kho bếp Lê Lợi'
      const ton = n.ma === 'NVL001' ? -2.4 : n.ma === 'NVL003' ? -6 : Math.round(between(r, 3, 40) * 10) / 10
      return { ma: n.ma, ten: n.ten, kho, dvt: n.dvt, ton, gt: Math.max(0, Math.round(ton * n.gia)), luc: '07/10 14:20' }
    })
    return out
  },
}

/** Xuất nhập tồn theo kỳ: số lượng và giá trị */
export function xnt(thang: number, kho: string) {
  const r = rng('xnt' + thang + kho)
  return [...NVL, ...HANG.filter(h => h.nhom === 'Bia, rượu').map(h => ({ ...h, gia: 14800 }))].map(n => {
    const sl0 = g(r, 8, 60), n1 = g(r, 40, 260), x1 = Math.min(sl0 + n1 - 2, g(r, 35, 250))
    const gia = n.gia
    return { ma: n.ma, ten: n.ten, dvt: n.dvt, sl0, gt0: sl0 * gia, sln: n1, gtn: n1 * gia, slx: x1, gtx: x1 * gia, sl1: sl0 + n1 - x1, gt1: (sl0 + n1 - x1) * gia }
  })
}
