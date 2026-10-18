// Dữ liệu giả phân hệ Kho (công thức, phiếu sản xuất ở san-xuat.ts, T152): tồn đầu, định mức tồn, thẻ kho, nhập xuất, tồn tức thời, xuất nhập tồn
import { createElement } from 'react'
import type { CatalogCfg, Col, Row } from '../types'
import { CUA_HANG, HANG, KHO, NVL } from '../../data/mock'
import { between, pad, rng } from '../../ui/format'

const g = (r: () => number, a: number, b: number) => Math.round(between(r, a, b))

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

/** Thẻ kho một mặt hàng, một kho trong tháng (T157): tồn đầu, tổng nhập, tổng xuất lấy đúng dòng của báo cáo xuất nhập tồn,
 *  chia ra phiếu nhập mua ba ngày một lần và phiếu xuất bán POS mỗi ngày */
export function theKho(thang: number, kho: string, ma: string) {
  const x = xnt(thang, kho).find(h => h.ma === ma) ?? xnt(thang, kho)[0]
  const r = rng('thekho' + thang + kho + x.ma)
  const dim = thang === 10 ? 7 : new Date(2026, thang, 0).getDate()
  const ngayNhap = Array.from({ length: dim }, (_, i) => i + 1).filter(d => d % 3 === 1)
  const nhap = chiaSo(x.sln, ngayNhap.map(() => 0.6 + r()))
  const xuat = chiaSo(x.slx, Array.from({ length: dim }, () => 0.6 + r()))
  const cols: Col[] = [{ k: 'ngay', t: 'Ngày', w: 90 }, { k: 'so', t: 'Số phiếu', cls: 'code', w: 120 }, { k: 'dg', t: 'Diễn giải' }, { k: 'nhap', t: 'Nhập', num: true }, { k: 'xuat', t: 'Xuất', num: true }, { k: 'ton', t: 'Tồn', num: true }]
  let ton = x.sl0
  const rows: Row[] = [{ dg: 'Tồn đầu kỳ', ton, _b: 1, _z: 1 }]
  for (let d = 1; d <= dim; d++) {
    const ngay = `${pad(d)}/${pad(thang)}/2026`
    const iN = ngayNhap.indexOf(d)
    if (iN >= 0 && nhap[iN] > 0) { ton += nhap[iN]; rows.push({ ngay, so: `MH26${pad(thang)}-${pad(d * 7, 4)}`, dg: 'Nhập mua từ Thực phẩm Tươi An Phú', nhap: nhap[iN], ton, _z: 1 }) }
    if (xuat[d - 1] > 0) { ton -= xuat[d - 1]; rows.push({ ngay, so: `XB26${pad(thang)}-${pad(d)}`, dg: 'Xuất bán POS theo định lượng', xuat: xuat[d - 1], ton, _z: 1 }) }
  }
  rows.push({ dg: 'Cộng phát sinh', nhap: x.sln, xuat: x.slx, _t: 1 }, { dg: 'Tồn cuối kỳ', ton: x.sl1, _t: 1, _z: 1 })
  return { hang: x, cols, rows }
}
/** Chia số nguyên theo tỷ lệ, phần cuối nhận số dư để cộng lại đúng tổng */
function chiaSo(tong: number, ty: number[]) {
  const s = ty.reduce((a, b) => a + b, 0)
  let con = tong
  return ty.map((t, i) => { const v = i === ty.length - 1 ? con : Math.min(con, Math.round(tong * t / s)); con -= v; return v })
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

/** Hàng có trên báo cáo xuất nhập tồn, thẻ kho: nguyên vật liệu và bia (T157) */
export const HANG_XNT = [...NVL, ...HANG.filter(h => h.nhom === 'Bia, rượu').map(h => ({ ...h, gia: 14800 }))]

/** Xuất nhập tồn theo kỳ: số lượng và giá trị (hỗ trợ một kho, nhiều kho, hoặc tất cả kho, T412) */
export function xnt(thang: number, kho?: string | string[], dsKhoTatCa?: string[]) {
  if (typeof kho === 'string' && kho && kho !== 'all' && kho !== 'tat-ca') {
    const r = rng('xnt' + thang + kho)
    return HANG_XNT.map(n => {
      const sl0 = g(r, 8, 60), n1 = g(r, 40, 260), x1 = Math.min(sl0 + n1 - 2, g(r, 35, 250))
      const gia = n.gia
      return { ma: n.ma, ten: n.ten, dvt: n.dvt, sl0, gt0: sl0 * gia, sln: n1, gtn: n1 * gia, slx: x1, gtx: x1 * gia, sl1: sl0 + n1 - x1, gt1: (sl0 + n1 - x1) * gia }
    })
  }

  const dsKho = Array.isArray(kho) && kho.length > 0
    ? kho
    : (dsKhoTatCa && dsKhoTatCa.length > 0 ? dsKhoTatCa : CUA_HANG.flatMap(c => c.kho))

  if (dsKho.length === 1) {
    return xnt(thang, dsKho[0])
  }

  const dsBanGhi = dsKho.map(k => xnt(thang, k))
  return HANG_XNT.map((n, idx) => {
    let sl0 = 0, sln = 0, slx = 0, sl1 = 0
    for (const bang of dsBanGhi) {
      const item = bang[idx]
      if (item) {
        sl0 += item.sl0
        sln += item.sln
        slx += item.slx
        sl1 += item.sl1
      }
    }
    const gia = n.gia
    return {
      ma: n.ma,
      ten: n.ten,
      dvt: n.dvt,
      sl0,
      gt0: sl0 * gia,
      sln,
      gtn: sln * gia,
      slx,
      gtx: slx * gia,
      sl1,
      gt1: sl1 * gia,
    }
  })
}
