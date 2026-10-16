// Điều chuyển kho (T155): xuất điều chuyển sang cửa hàng khác, nhập điều chuyển từ cửa hàng khác, chuyển kho trong cùng cửa hàng.
// Xuất ghi Nợ 1368 / Có 152 theo giá xuất kho, nhập ghi Nợ 152 / Có 3368. Chuyển kho không hạch toán.
// Phiếu nhập tham chiếu phiếu xuất theo cơ chế của sản xuất (T152): trạng thái ttSx, phiếu xuất giữ _phieuNhap, phiếu nhập giữ _thamChieu*.
// File dữ liệu: không import index.ts (BAY.md, vòng import)
import type { Row, VoucherCfg } from '../types'
import type { Dong } from '../../ui/generic/gen'
import { CUA_HANG, NVL } from '../../data/mock'

export type LoaiDcn = NonNullable<VoucherCfg['dieuChuyen']>

/** Dòng phiếu điều chuyển. Phiếu nhập: slXuat là số trên phiếu xuất, sl là thực nhận. Chuyển kho: gcDong là ghi chú dòng */
export interface DongDcn extends Dong { slXuat?: number; gcDong?: string }

interface ThongTinDcn { ten: string; man: string; prefix: string; nhap: boolean; doi?: LoaiDcn; noCo: [string, string, string][] }
export const DCN: Record<LoaiDcn, ThongTinDcn> = {
  xdc: { ten: 'Xuất điều chuyển', man: 'kho/5-1-4', prefix: 'XDCK', nhap: false, doi: 'ndc', noCo: [['1368', '152', 'Xuất điều chuyển cho cửa hàng khác']] },
  ndc: { ten: 'Nhập điều chuyển', man: 'kho/5-1-4-2', prefix: 'NDCK', nhap: true, doi: 'xdc', noCo: [['152', '3368', 'Nhập điều chuyển từ cửa hàng khác']] },
  ck: { ten: 'Chuyển kho', man: 'kho/5-1-4-3', prefix: 'CK', nhap: false, noCo: [] },
}

/** Kho của một cửa hàng, cửa hàng của một kho */
export const khoCuaCn = (cn: string) => CUA_HANG.find(c => c.ten === cn)?.kho ?? []
const cnCuaKho = (kho: string) => CUA_HANG.find(c => c.kho.includes(kho))?.ten ?? ''

/** Dòng hàng theo mã nguyên vật liệu, giá xuất kho lấy giá danh mục */
export function dongDcn(ma: string, sl: number, coGia = true): DongDcn {
  const h = NVL.find(n => n.ma === ma), gia = coGia ? h?.gia ?? 0 : 0
  return { ma, ten: h?.ten ?? ma, dvt: h?.dvt ?? '', sl, gia, tien: Math.round(sl * gia), ts: 0, thue: 0 }
}

/** Phiếu nhập lấy dòng của phiếu xuất tham chiếu, thực nhận mặc định bằng số xuất */
export function dongNhapDc(px: Row | undefined): DongDcn[] {
  return ((px?._dong as DongDcn[] | undefined) ?? []).map(d => ({ ...d, slXuat: d.sl }))
}

/** Cấu hình form chứng từ cho từng tab */
export function cauHinhDcn(loai: LoaiDcn): VoucherCfg {
  const t = DCN[loai]
  return {
    prefix: t.prefix, doiTuong: 'none', dong: 'nvl', tien: [0, 0], thue: 0, nguon: 'IVT', dienGiai: [''], noCo: t.noCo,
    them: `Thêm phiếu ${t.ten.toLowerCase()}`, soTT58: 'Sổ chi tiết vật liệu, dụng cụ, hàng hoá', dieuChuyen: loai,
  }
}

// ── Phiếu mẫu tháng 9, 10/2026 ──

const NV = ['Võ Thanh Tùng', 'Phạm Ngọc Lan', 'Đặng Văn Hiếu', 'Trần Thu Hà']
interface Mau { so: number; ngay: string; kho: string; khoNhan: string; gc: string; tt?: 'cho' | 'da' | 'huy'; nv: number; dong: DongDcn[]; ref?: number; capNhat?: string }

const XDC: Mau[] = [
  { so: 251, ngay: '15/09/2026 08:30', kho: 'Kho bếp Lê Lợi', khoNhan: 'Kho bếp Thảo Điền', gc: 'Chuyển thịt bò, xương ống cho Thảo Điền cuối tuần', tt: 'da', nv: 0,
    dong: [dongDcn('NVL001', 8), dongDcn('NVL002', 25)] },
  { so: 252, ngay: '28/09/2026 09:15', kho: 'Kho bar Thảo Điền', khoNhan: 'Kho bar Lê Lợi', gc: 'Chuyển bớt cà phê hạt, sữa đặc sang Lê Lợi', tt: 'da', nv: 1,
    dong: [dongDcn('NVL008', 6), dongDcn('NVL009', 24)] },
  { so: 253, ngay: '03/10/2026 07:45', kho: 'Kho bếp Lê Lợi', khoNhan: 'Kho bếp Nguyễn Trãi', gc: 'Hỗ trợ bánh phở, rau thơm cho Nguyễn Trãi', tt: 'da', nv: 0,
    dong: [dongDcn('NVL003', 30), dongDcn('NVL007', 5)] },
  { so: 254, ngay: '05/10/2026 10:20', kho: 'Kho bếp Nguyễn Trãi', khoNhan: 'Kho bếp Lê Lợi', gc: 'Lập nhầm cửa hàng nhận, đã huỷ', tt: 'huy', nv: 2,
    dong: [dongDcn('NVL004', 10)], capNhat: '05/10/2026 10:40' },
  { so: 255, ngay: '06/10/2026 14:00', kho: 'Kho bếp Lê Lợi', khoNhan: 'Kho bếp Thảo Điền', gc: 'Chuyển sườn heo, gạo tấm cho Thảo Điền', tt: 'cho', nv: 0,
    dong: [dongDcn('NVL004', 15), dongDcn('NVL005', 50)] },
  { so: 256, ngay: '07/10/2026 08:10', kho: 'Kho bếp Thảo Điền', khoNhan: 'Kho bếp Lê Lợi', gc: 'Trả lại tôm sú dư cho Lê Lợi', tt: 'cho', nv: 1,
    dong: [dongDcn('NVL006', 4)] },
]

/** Phiếu nhập: tham chiếu phiếu xuất, thực nhận lệch số xuất ở dòng có hao hụt */
const NDC: (Omit<Mau, 'kho' | 'khoNhan' | 'dong'> & { kho: string; hao?: [number, number] })[] = [
  { so: 251, ngay: '15/09/2026 15:30', kho: 'Kho bếp Thảo Điền', gc: 'Nhận thịt bò, xương ống từ Lê Lợi', tt: 'da', nv: 1, ref: 251, hao: [1, 24.5] },
  { so: 252, ngay: '28/09/2026 16:00', kho: 'Kho bar Lê Lợi', gc: 'Nhận cà phê hạt, sữa đặc từ Thảo Điền', tt: 'da', nv: 0, ref: 252 },
  { so: 253, ngay: '03/10/2026 11:20', kho: 'Kho bếp Nguyễn Trãi', gc: 'Nhận bánh phở, rau thơm từ Lê Lợi', tt: 'da', nv: 2, ref: 253, hao: [1, 4.8] },
  { so: 254, ngay: '06/10/2026 17:30', kho: 'Kho bếp Thảo Điền', gc: 'Nhập sai kho, lập lại sau', tt: 'huy', nv: 1, ref: 255, capNhat: '06/10/2026 17:45' },
]

const CK: Mau[] = [
  { so: 251, ngay: '12/09/2026 09:00', kho: 'Kho bếp Lê Lợi', khoNhan: 'Kho bar Lê Lợi', gc: 'Chuyển sữa đặc sang quầy bar', nv: 0,
    dong: [{ ...dongDcn('NVL009', 12, false), gcDong: 'Pha cà phê sữa' }] },
  { so: 252, ngay: '26/09/2026 14:30', kho: 'Kho bar Thảo Điền', khoNhan: 'Kho bếp Thảo Điền', gc: 'Trả đường cát, đào ngâm dư về bếp', nv: 1,
    dong: [{ ...dongDcn('NVL030', 5, false), gcDong: '' }, { ...dongDcn('NVL010', 3, false), gcDong: 'Hộp chưa mở' }] },
  { so: 253, ngay: '02/10/2026 08:00', kho: 'Kho bếp Lê Lợi', khoNhan: 'Kho bar Lê Lợi', gc: 'Bổ sung nguyên liệu pha chế đầu tuần', nv: 0,
    dong: [{ ...dongDcn('NVL008', 3, false), gcDong: '' }, { ...dongDcn('NVL010', 10, false), gcDong: '' }] },
  { so: 254, ngay: '04/10/2026 15:10', kho: 'Kho bếp Thảo Điền', khoNhan: 'Kho bar Thảo Điền', gc: 'Chuyển bia, đường cát cho quầy bar', nv: 1,
    dong: [{ ...dongDcn('NVL011', 4, false), gcDong: '' }, { ...dongDcn('NVL030', 6, false), gcDong: '' }] },
  { so: 255, ngay: '07/10/2026 07:30', kho: 'Kho bar Lê Lợi', khoNhan: 'Kho bếp Lê Lợi', gc: 'Trả cà phê hạt dư về bếp', nv: 3,
    dong: [{ ...dongDcn('NVL008', 1.5, false), gcDong: 'Gói đã mở' }] },
]

const thangCua = (ngay: string) => Number(ngay.split('/')[1]) || 10
const soCua = (loai: LoaiDcn, m: { so: number; ngay: string }) => `${DCN[loai].prefix}26${String(thangCua(m.ngay)).padStart(2, '0')}-${String(m.so).padStart(4, '0')}`
const idCua = (loai: LoaiDcn, so: number) => `${loai}-${so}`
/** Giờ tạo vài phút sau giờ phiếu */
const sauPhut = (ngay: string, p: number) => {
  const [d, g = '08:00'] = ngay.split(' '), [h, m] = g.split(':').map(Number), t = h * 60 + m + p
  return `${d} ${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

function phieuTuMau(loai: LoaiDcn, m: Omit<Mau, 'khoNhan' | 'dong'>, dong: DongDcn[], rieng: Row): Row {
  const tong = dong.reduce((a, d) => a + (d.tien || 0), 0)
  return {
    id: idCua(loai, m.so), so: soCua(loai, m), ngay: m.ngay, thang: thangCua(m.ngay), nguon: 'IVT', tt: m.tt === 'huy' || m.tt === 'cho' ? 'nhap' : 'ghi',
    ...(m.tt ? { ttSx: m.tt } : {}), dienGiai: m.gc, doiTuong: '', tien: tong, thue: 0, tong,
    _dong: dong, _kho: m.kho, _ghiChu: m.gc, _ngayTao: sauPhut(m.ngay, 4), _nguoiTao: NV[m.nv],
    _ngayCapNhat: m.capNhat ?? '', _nguoiCapNhat: m.capNhat ? NV[(m.nv + 3) % NV.length] : '',
    ...rieng,
  }
}

/** Phiếu mẫu của một tab. Phiếu xuất đã nhập ghi tham chiếu về phiếu nhập không huỷ */
export function phieuMauDcn(loai: LoaiDcn): Row[] {
  if (loai === 'ck') return CK.map(m => phieuTuMau('ck', m, m.dong, { cn: cnCuaKho(m.kho), _khoNhan: m.khoNhan }))
  if (loai === 'xdc') {
    return XDC.map(m => {
      const pn = NDC.find(n => n.ref === m.so && n.tt !== 'huy'), cnNhan = cnCuaKho(m.khoNhan)
      return phieuTuMau('xdc', m, m.dong, {
        cn: cnCuaKho(m.kho), doiTuong: cnNhan, _cnNhan: cnNhan, _khoNhan: m.khoNhan,
        ...(pn ? { _phieuNhap: { id: idCua('ndc', pn.so), so: soCua('ndc', pn) } } : {}),
      })
    })
  }
  return NDC.map(m => {
    const px = XDC.find(x => x.so === m.ref)!, cnXuat = cnCuaKho(px.kho)
    const dong = dongNhapDc({ _dong: px.dong }).map((d, i) => (m.hao && m.hao[0] === i ? { ...d, sl: m.hao[1], tien: Math.round(m.hao[1] * d.gia) } : d))
    return phieuTuMau('ndc', m, dong, {
      cn: cnCuaKho(m.kho), doiTuong: cnXuat, _cnXuat: cnXuat, _khoXuat: px.kho,
      _thamChieu: soCua('xdc', px), _thamChieuId: idCua('xdc', px.so), _thamChieuDi: `/app/${DCN.xdc.man}/${idCua('xdc', px.so)}`,
    })
  })
}
