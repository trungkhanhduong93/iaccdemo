// Bộ ô của form chứng từ theo nhóm nghiệp vụ. Học cách AMIS xếp ô: cột mã, cột tên và diễn giải, cột ngày và số.
import type { VoucherCfg } from '../../modules/types'

/** Cấu hình của một loại phiếu: ghép phần riêng của loại vào cấu hình chung của màn */
export function theoLoai(cfg: VoucherCfg, k?: string | null): VoucherCfg {
  const v = cfg.loai?.find(x => x.k === k) ?? cfg.loai?.[0]
  return v ? { ...cfg, ...v } : cfg
}

export type Nhom = 'mua' | 'ban' | 'thu' | 'chi' | 'nop' | 'nhthu' | 'nhchi' | 'nhap' | 'xuat' | 'dc' | 'kk' | 'cb' | 'ts' | 'thue' | 'th' | 'khac'

/** Một ô trên form. k quyết định cách vẽ: dt mã đối tượng, ten tên đối tượng, nv chọn nhân viên, ly chọn lý do, kem số chứng từ gốc, tknh tài khoản ngân hàng, kho chọn kho; còn lại là ô chữ */
export interface O { k: string; nhan: string; ds?: string[] }

export interface BoO {
  a: O[]; b: O[]                 // cột hẹp, cột rộng, ghép theo hàng
  so: string                     // nhãn ô số chứng từ
  tt?: 'mua' | 'ban'             // có hàng chọn thanh toán, hoá đơn và điều khoản thanh toán
  hd?: boolean                   // có tab Hoá đơn
  tabDau?: string                // tên tab đầu khi có tab Hoá đơn
  ck?: boolean                   // có chiết khấu theo mặt hàng
  kho?: 'dong' | 'dc'            // kho trên từng dòng; dc là kho xuất và kho nhập
  tongNhap?: boolean             // khối tổng có giá trị nhập kho
  coDt?: boolean                 // dòng có cột đối tượng (chứng từ tổng hợp)
  tk: [string, string]           // nhãn hai cột tài khoản trên dòng
  inMau: string[]                // mẫu in
}

export const LY_THU = ['Thu tiền khách hàng', 'Thu hoàn ứng', 'Rút tiền gửi về nộp quỹ', 'Thu khác']
export const LY_CHI = ['Trả tiền nhà cung cấp', 'Tạm ứng cho nhân viên', 'Chi phí khác', 'Nộp tiền vào ngân hàng']
export const LY_XUAT = ['Xuất bán', 'Xuất huỷ', 'Xuất dùng nội bộ', 'Xuất khác']

export function nhomCua(mod: string, cfg: VoucherCfg, loai?: string): Nhom {
  const p = cfg.prefix
  if (mod === 'tien') return ({ thu: 'thu', chi: 'chi', nop: 'nop', bc: 'nhthu', unc: 'nhchi' } as Record<string, Nhom>)[loai ?? ''] ?? 'khac'
  if (mod === 'mua-hang') return 'mua'
  if (mod === 'ban-hang') return 'ban'
  if (mod === 'kho') {
    if (p === 'NK' || p === 'BSG') return 'nhap'
    if (p === 'DCK') return 'dc'
    if (p === 'KK') return 'kk'
    if (p === 'QCB' || p === 'QSC') return 'cb'
    return 'xuat'
  }
  if (mod === 'tscd' || mod === 'ccdc') return p === 'KKCC' ? 'kk' : 'ts'
  if (mod === 'thue') return 'thue'
  if (mod === 'tong-hop') return 'th'
  return 'khac'
}

const thuong = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

export function boO(nhom: Nhom, cfg: VoucherCfg): BoO {
  const hang = cfg.dong === 'hang' || cfg.dong === 'nvl'
  const coDt = cfg.doiTuong !== 'none'
  const ten = thuong(cfg.nhan ?? 'Đối tượng')
  const dt: O[] = coDt ? [{ k: 'dt', nhan: `Mã ${ten}` }] : []
  const tenDt: O[] = coDt ? [{ k: 'ten', nhan: `Tên ${ten}` }] : []
  const dg: O = { k: 'dg', nhan: 'Diễn giải' }
  const kem: O = { k: 'kem', nhan: 'Kèm theo' }
  const tc: O = { k: 'tc', nhan: 'Tham chiếu' }
  const tkNo: [string, string] = ['TK Nợ', 'TK Có']
  switch (nhom) {
    case 'mua': return {
      a: [...dt, { k: 'nguoi', nhan: 'Người giao hàng' }, { k: 'nv', nhan: 'Nhân viên mua hàng' }, kem],
      b: [...tenDt, { k: 'dc', nhan: 'Địa chỉ' }, dg, tc],
      so: cfg.prefix === 'TLN' ? 'Số phiếu xuất' : hang ? 'Số phiếu nhập' : 'Số chứng từ',
      tt: 'mua', hd: true, tabDau: cfg.prefix === 'TLN' ? 'Phiếu xuất trả' : hang ? 'Phiếu nhập' : 'Chứng từ',
      ck: hang, kho: hang ? 'dong' : undefined, tongNhap: hang && cfg.prefix !== 'TLN',
      tk: hang ? ['TK kho', 'TK công nợ'] : ['TK chi phí', 'TK công nợ'], inMau: ['Phiếu nhập kho', 'Biên bản giao nhận hàng'],
    }
    case 'ban': return {
      a: [...dt, { k: 'mst', nhan: 'Mã số thuế' }, { k: 'nv', nhan: 'Nhân viên bán hàng' }, kem],
      b: [...tenDt, { k: 'dc', nhan: 'Địa chỉ' }, dg, tc],
      so: 'Số chứng từ', tt: 'ban', hd: true, tabDau: 'Chứng từ', ck: hang, kho: cfg.dong === 'nvl' ? 'dong' : undefined,
      tk: ['TK nợ', 'TK doanh thu'], inMau: ['Chứng từ bán hàng', 'Phiếu xuất kho'],
    }
    case 'thu': return {
      a: [{ k: 'dt', nhan: 'Mã đối tượng' }, { k: 'nguoi', nhan: 'Người nộp' }, { k: 'ly', nhan: 'Lý do thu', ds: LY_THU }, { k: 'nv', nhan: 'Nhân viên thu' }],
      b: [{ k: 'ten', nhan: 'Tên đối tượng' }, { k: 'dc', nhan: 'Địa chỉ' }, dg, kem], so: 'Số phiếu thu', tk: tkNo, inMau: ['Phiếu thu', 'Phiếu thu 2 liên'],
    }
    case 'chi': return {
      a: [{ k: 'dt', nhan: 'Mã đối tượng' }, { k: 'nguoi', nhan: 'Người nhận' }, { k: 'ly', nhan: 'Lý do chi', ds: LY_CHI }, { k: 'nv', nhan: 'Nhân viên chi' }],
      b: [{ k: 'ten', nhan: 'Tên đối tượng' }, { k: 'dc', nhan: 'Địa chỉ' }, dg, kem], so: 'Số phiếu chi', tk: tkNo, inMau: ['Phiếu chi', 'Phiếu chi 2 liên'],
    }
    case 'nop': return {
      a: [{ k: 'tknh', nhan: 'Nộp vào tài khoản' }, ...dt, { k: 'nguoi', nhan: 'Người nộp' }],
      b: [{ k: 'tennh', nhan: 'Tên ngân hàng' }, ...tenDt, dg], so: 'Số chứng từ', tk: tkNo, inMau: ['Giấy nộp tiền'],
    }
    case 'nhthu': return {
      a: [{ k: 'dt', nhan: 'Mã đối tượng' }, { k: 'tknh', nhan: 'Nộp vào tài khoản' }, { k: 'ly', nhan: 'Lý do thu', ds: LY_THU }, { k: 'nv', nhan: 'Nhân viên thu' }],
      b: [{ k: 'ten', nhan: 'Tên đối tượng' }, { k: 'tennh', nhan: 'Tên ngân hàng' }, dg, kem], so: 'Số chứng từ', tk: tkNo, inMau: ['Giấy báo có'],
    }
    case 'nhchi': return {
      a: [{ k: 'tknh', nhan: 'Tài khoản chi' }, { k: 'dt', nhan: 'Mã đối tượng' }, { k: 'tknhan', nhan: 'Tài khoản nhận' }, { k: 'ly', nhan: 'Lý do chi', ds: LY_CHI }],
      b: [{ k: 'tennh', nhan: 'Tên ngân hàng' }, { k: 'ten', nhan: 'Tên đối tượng' }, { k: 'nhnhan', nhan: 'Ngân hàng nhận' }, { k: 'dg', nhan: 'Nội dung thanh toán' }],
      so: 'Số uỷ nhiệm chi', tk: tkNo, inMau: ['Uỷ nhiệm chi'],
    }
    case 'nhap': return {
      a: [...dt, { k: 'nguoi', nhan: 'Người giao hàng' }, { k: 'nv', nhan: 'Nhân viên' }, kem],
      b: [...tenDt, dg, tc], so: 'Số phiếu nhập', kho: 'dong', tk: tkNo, inMau: ['Phiếu nhập kho'],
    }
    case 'xuat': return {
      a: [...dt, { k: 'nguoi', nhan: 'Người nhận' }, { k: 'ly', nhan: 'Lý do xuất', ds: LY_XUAT }, kem],
      b: [...tenDt, dg, tc], so: 'Số phiếu xuất', kho: 'dong', tk: tkNo, inMau: ['Phiếu xuất kho'],
    }
    case 'dc': return {
      a: [{ k: 'nguoi', nhan: 'Người vận chuyển' }, { k: 'lenh', nhan: 'Lệnh điều động số' }, kem],
      b: [dg, tc], so: 'Số phiếu điều chuyển', kho: 'dc', tk: tkNo, inMau: ['Phiếu xuất kho kiêm vận chuyển nội bộ'],
    }
    case 'kk': return {
      a: [{ k: 'kho', nhan: 'Kho kiểm kê' }, { k: 'nv', nhan: 'Người kiểm kê' }],
      b: [dg, kem], so: 'Số biên bản', kho: hang ? 'dong' : undefined, tk: tkNo, inMau: ['Biên bản kiểm kê'],
    }
    case 'cb': return {
      a: [{ k: 'nv', nhan: 'Người thực hiện' }, kem], b: [dg, tc], so: 'Số lệnh', kho: 'dong', tk: tkNo, inMau: ['Lệnh sản xuất'],
    }
    case 'ts': return {
      a: [...dt, { k: 'nv', nhan: 'Người lập' }, kem], b: [...tenDt, dg, tc], so: 'Số chứng từ', tk: tkNo, inMau: ['Biên bản giao nhận tài sản'],
    }
    case 'thue': return {
      a: [...dt, { k: 'mst', nhan: 'Mã số thuế' }, kem], b: [...tenDt, { k: 'dc', nhan: 'Địa chỉ' }, dg],
      so: 'Số chứng từ', hd: true, tabDau: 'Chứng từ', tk: tkNo, inMau: ['Bảng kê hoá đơn'],
    }
    case 'th': return {
      a: [{ k: 'nv', nhan: 'Người lập' }, kem], b: [dg, tc], so: 'Số chứng từ', coDt: true, tk: tkNo, inMau: ['Chứng từ kế toán'],
    }
    default: return {
      a: [...dt, { k: 'nv', nhan: 'Người lập' }, kem], b: [...tenDt, dg, tc], so: 'Số chứng từ', tk: tkNo, inMau: ['Chứng từ kế toán'],
    }
  }
}

/** Nhãn trạng thái thanh toán, hoá đơn trên danh sách và form */
export const TT_TIEN: Record<'mua' | 'ban', Record<string, [string, string]>> = {
  mua: { chua: ['warn', 'Chưa thanh toán'], mot: ['info', 'Thanh toán một phần'], da: ['ok', 'Đã thanh toán'] },
  ban: { chua: ['warn', 'Chưa thu tiền'], mot: ['info', 'Thu một phần'], da: ['ok', 'Đã thu tiền'] },
}
export const TT_HD: Record<'mua' | 'ban', Record<string, [string, string]>> = {
  mua: { chua: ['dim', 'Chưa nhận hoá đơn'], da: ['ok', 'Đã nhận hoá đơn'] },
  ban: { chua: ['dim', 'Chưa xuất hoá đơn'], da: ['ok', 'Đã xuất hoá đơn'] },
}
