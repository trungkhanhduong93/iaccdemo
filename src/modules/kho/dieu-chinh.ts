// Phiếu xuất, nhập điều chỉnh sinh từ phiếu kiểm kê (T126): thiếu thì xuất điều chỉnh, thừa thì nhập điều chỉnh phần chênh lệch.
// Phiếu kiểm kê giữ danh sách phiếu đã sinh ở _dsDc; phiếu điều chỉnh giữ số, id phiếu kiểm kê ở _thamChieu, _kkId
import type { Row, VoucherCfg } from '../types'
import { NVL } from '../../data/mock'
import { chungTu, dongCua, type Dong } from '../../ui/generic/gen'

export const MAN_DC = 'kho/dieu-chinh'
export type LoaiDc = 'xdc' | 'ndc'
export const TEN_DC: Record<LoaiDc, string> = { xdc: 'Xuất điều chỉnh', ndc: 'Nhập điều chỉnh' }

/** Dòng phiếu điều chỉnh từ dòng kiểm kê: số lượng là phần chênh, đơn giá theo danh mục nguyên vật liệu */
export function dongDieuChinh(dong: Dong[], loai: LoaiDc): Dong[] {
  return dong
    .map(d => ({ d, c: (d.tonTt ?? 0) - (d.tonHt ?? 0) }))
    .filter(({ c }) => (loai === 'xdc' ? c < 0 : c > 0))
    .map(({ d, c }) => {
      const sl = Math.abs(c), gia = NVL.find(h => h.ma === d.ma)?.gia ?? d.gia
      return { ma: d.ma, ten: d.ten, dvt: d.dvt, sl, gia, tien: sl * gia, ts: 0, thue: 0, ghiChu: d.ghiChu ?? '' }
    })
}

/** Số phiếu điều chỉnh theo số phiếu kiểm kê: KK2610-0256 thành XDC2610-0256, NDC2610-0256 */
export const soDc = (soKk: string, loai: LoaiDc) => `${loai.toUpperCase()}${soKk.replace(/^KK/, '')}`

/** Phiếu điều chỉnh của một loại sinh từ phiếu kiểm kê; không có dòng chênh của loại đó thì không sinh */
export function phieuDieuChinh(kk: { id: string; so: string; ngay: string; cn: string; kho: string }, dong: Dong[], loai: LoaiDc, id: string): Row | null {
  const ds = dongDieuChinh(dong, loai)
  if (!ds.length) return null
  const tien = ds.reduce((a, d) => a + d.tien, 0)
  const dg = `${TEN_DC[loai]} theo kiểm kê ${kk.so}`
  return {
    id, so: soDc(kk.so, loai), ngay: kk.ngay, thang: Number(kk.ngay.split('/')[1]) || 10, cn: kk.cn, nguon: 'tay', tt: 'ghi',
    loai, tenLoai: TEN_DC[loai], doiTuong: '', dienGiai: dg, tien, thue: 0, tong: tien,
    _dong: ds, _kho: kk.kho, _ghiChu: dg, _thamChieu: kk.so, _thamChieuDi: `/app/kho/5-1-10/${kk.id}`, _kkId: kk.id,
  }
}

// ── Dữ liệu mẫu: phiếu kiểm kê mẫu kèm phiếu điều chỉnh đã sinh, cùng hạt giống với màn 5.1.10 ──
const mauKk = (cfg: VoucherCfg) => chungTu(cfg, '5.1.10').map(r => ({ r, dong: dongCua(cfg, `5.1.10-${r.id}`) }))
const thongTinKk = (r: Row) => ({ id: String(r.id), so: String(r.so), ngay: String(r.ngay), cn: String(r.cn), kho: String(r._kho ?? '') })

/** Phiếu kiểm kê mẫu, mỗi phiếu ghi sẵn các phiếu điều chỉnh đã sinh */
export function mauKiemKe(cfg: VoucherCfg): Row[] {
  return mauKk(cfg).map(({ r, dong }) => ({
    ...r,
    _dsDc: (['xdc', 'ndc'] as LoaiDc[]).filter(l => dongDieuChinh(dong, l).length).map(l => ({ id: `kk${r.id}-${l}`, so: soDc(String(r.so), l), loai: l })),
  }))
}

/** Phiếu điều chỉnh mẫu sinh từ phiếu kiểm kê mẫu */
export function mauDieuChinh(cfg: VoucherCfg): Row[] {
  return mauKk(cfg).flatMap(({ r, dong }) => (['xdc', 'ndc'] as LoaiDc[])
    .map(l => phieuDieuChinh(thongTinKk(r), dong, l, `kk${r.id}-${l}`))
    .filter((x): x is Row => x !== null))
}
