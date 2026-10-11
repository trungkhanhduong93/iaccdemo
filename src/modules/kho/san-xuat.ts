// Sản xuất theo iPOS Inventory (T152): phiếu xuất, nhập sơ chế và chế biến, công thức sơ chế, công thức chế biến.
// Sơ chế là tách: một nguyên liệu gốc ra nhiều nguyên liệu đích. Chế biến là gộp: nhiều nguyên liệu ra một thành phẩm.
// Hạch toán qua 154: phiếu xuất Nợ 154 / Có 152, phiếu nhập Nợ 152 / Có 154. Tổng tiền phiếu nhập luôn bằng phiếu xuất nó tham chiếu.
// File dữ liệu: không import index.ts (BAY.md, vòng import)
import type { Row, VoucherCfg } from '../types'
import type { Dong } from '../../ui/generic/gen'
import { HANG, HANG_SX, NCC, NVL } from '../../data/mock'

export type LoaiSx = NonNullable<VoucherCfg['sanXuat']>

/** Dòng phiếu sản xuất. ma, ten, dvt là hàng của dòng: NVL gốc (xuất sơ chế), NVL đích (nhập sơ chế), NVL thành phần (xuất chế biến), thành phẩm (nhập chế biến).
 *  sl là số thực xuất, thực nhận; slKh là số kế hoạch theo phiếu xuất và công thức */
export interface DongSx extends Dong {
  vaoMa?: string; vao?: string          // nhập sơ chế: NVL đầu vào (gốc)
  tpMa?: string; tp?: string; tpDvt?: string; tpSl?: number   // xuất chế biến: thành phẩm và số lượng thành phẩm định làm
  slKh?: number
  ncc?: string                          // xuất sơ chế: nhà cung cấp của lô nguyên liệu
  gtVao?: number                        // phiếu nhập: giá trị đầu vào chia cho dòng, giữ tổng nhập bằng tổng xuất
}

interface ThongTinSx { ten: string; man: string; nhap: boolean; soChe: boolean; doi?: LoaiSx; noCo: [string, string, string][] }
export const SX: Record<LoaiSx, ThongTinSx> = {
  xsc: { ten: 'Xuất sơ chế', man: 'kho/5-1-6', nhap: false, soChe: true, doi: 'nsc', noCo: [['154', '152', 'Xuất nguyên liệu đem sơ chế']] },
  nsc: { ten: 'Nhập sơ chế', man: 'kho/5-1-6-2', nhap: true, soChe: true, doi: 'xsc', noCo: [['152', '154', 'Nhập nguyên liệu sau sơ chế']] },
  xcb: { ten: 'Xuất chế biến', man: 'kho/5-1-3', nhap: false, soChe: false, doi: 'ncb', noCo: [['154', '152', 'Xuất nguyên liệu chế biến']] },
  // Bán thành phẩm bếp trung tâm dùng tiếp như nguyên liệu nên nhập 152. Danh mục chưa có hàng nào khai TK kho 155, có thì đổi theo tkKho của hàng
  ncb: { ten: 'Nhập chế biến', man: 'kho/5-1-3-2', nhap: true, soChe: false, doi: 'xcb', noCo: [['152', '154', 'Nhập bán thành phẩm chế biến']] },
}

/** Mọi hàng tra được theo mã: nguyên vật liệu, hàng sản xuất, món */
const TAT_CA = [...NVL.map(n => ({ ...n, tkKho: '152' })), ...HANG_SX, ...HANG.map(h => ({ ...h, tkKho: '' }))]
export const hangCua = (ma: string) => TAT_CA.find(h => h.ma === ma)
/** Tên hiện kiểu IVT: "tên - MÃ" */
export const tenMa = (ma: string) => `${hangCua(ma)?.ten ?? ma} - ${ma}`
/** Số lượng làm tròn 3 chữ số thập phân, hiện kiểu Việt Nam */
export const tron3 = (n: number) => Math.round(n * 1000) / 1000
export const soLuong = (n: number) => (Number(n) || 0).toLocaleString('vi-VN', { maximumFractionDigits: 3 })

// ── Công thức ──

export type TtCongThuc = 'on' | 'off' | 'nhap'
export const TT_CONG_THUC: [TtCongThuc, string, string][] = [['on', 'Đang hoạt động', 'var(--green)'], ['off', 'Không hoạt động', 'var(--red)'], ['nhap', 'Nháp', 'var(--muted)']]

export interface NvlCongThuc { ma: string; sl: number; tang?: number; giam?: number }
export interface CongThucCb { id: string; ma: string; spMa: string; ngay: string; kenh: string[]; kho: string[]; moTa: string; tt: TtCongThuc; nvl: NvlCongThuc[] }
export interface CongThucSc { id: string; ma: string; gocMa: string; ngay: string; kho: string[]; moTa: string; tt: TtCongThuc; dich: NvlCongThuc[] }

/** Định lượng cho một đơn vị tính của sản phẩm */
export const CONG_THUC_CB: CongThucCb[] = [
  { id: 'cb1', ma: 'CTCB001', spMa: 'PHO01', ngay: '01/09/2026', kenh: ['Tại quán', 'Mang về', 'GrabFood'], kho: [], moTa: 'Tô tiêu chuẩn 650 ml', tt: 'on',
    nvl: [{ ma: 'NVL003', sl: 0.2, tang: 10, giam: 5 }, { ma: 'NVL001', sl: 0.08, tang: 5, giam: 5 }, { ma: 'BTP01', sl: 0.45, tang: 10, giam: 10 }, { ma: 'NVL007', sl: 0.02, tang: 20, giam: 20 }] },
  { id: 'cb2', ma: 'CTCB002', spMa: 'BUN02', ngay: '15/09/2026', kenh: ['Tại quán', 'Mang về'], kho: ['Kho bếp Thảo Điền'], moTa: 'Tạm ngưng chờ đổi nhà cung cấp mắm ruốc', tt: 'off',
    nvl: [{ ma: 'NVL025', sl: 0.2, tang: 10, giam: 5 }, { ma: 'NVL015', sl: 0.06, tang: 5, giam: 5 }, { ma: 'NVL014', sl: 0.04, tang: 5, giam: 5 }, { ma: 'BTP02', sl: 0.5, tang: 10, giam: 10 }, { ma: 'NVL007', sl: 0.02, tang: 20, giam: 20 }] },
  { id: 'cb3', ma: 'CTCB003', spMa: 'COM01', ngay: '10/10/2026', kenh: ['Tại quán', 'Mang về', 'ShopeeFood'], kho: [], moTa: 'Bản thử thêm trứng ốp la, chưa duyệt', tt: 'nhap',
    nvl: [{ ma: 'NVL005', sl: 0.18, tang: 10, giam: 5 }, { ma: 'BTP03', sl: 0.16, tang: 5, giam: 5 }, { ma: 'NVL032', sl: 1 }, { ma: 'NVL012', sl: 0.015, tang: 20, giam: 20 }] },
  { id: 'cb4', ma: 'CTCB004', spMa: 'BTP01', ngay: '01/08/2026', kenh: [], kho: ['Kho bếp Lê Lợi', 'Kho bếp Thảo Điền', 'Kho bếp Nguyễn Trãi'], moTa: 'Nấu nồi 200 lít, ninh xương 8 giờ', tt: 'on',
    nvl: [{ ma: 'NVL002', sl: 0.35, tang: 10, giam: 5 }, { ma: 'NVL015', sl: 0.05, tang: 10, giam: 5 }, { ma: 'NVL031', sl: 0.004 }, { ma: 'NVL027', sl: 0.01 }, { ma: 'NVL029', sl: 0.01 }, { ma: 'NVL030', sl: 0.005 }] },
  { id: 'cb5', ma: 'CTCB005', spMa: 'BTP02', ngay: '01/08/2026', kenh: [], kho: ['Kho bếp Thảo Điền'], moTa: 'Nấu nồi 120 lít', tt: 'on',
    nvl: [{ ma: 'NVL002', sl: 0.3, tang: 10, giam: 5 }, { ma: 'NVL026', sl: 0.03 }, { ma: 'NVL028', sl: 0.01 }, { ma: 'NVL027', sl: 0.01 }, { ma: 'NVL029', sl: 0.01 }, { ma: 'NVL030', sl: 0.006 }] },
  { id: 'cb6', ma: 'CTCB006', spMa: 'BTP03', ngay: '01/09/2026', kenh: [], kho: [], moTa: 'Ướp tối thiểu 4 giờ trước khi nướng', tt: 'on',
    nvl: [{ ma: 'NVL004', sl: 1, tang: 5, giam: 5 }, { ma: 'NVL027', sl: 0.04 }, { ma: 'NVL026', sl: 0.03 }, { ma: 'NVL029', sl: 0.05 }, { ma: 'NVL030', sl: 0.04 }, { ma: 'NVL012', sl: 0.02 }] },
]

/** Tỉ lệ ra cho một đơn vị NVL gốc; phần còn lại là hao hụt */
export const CONG_THUC_SC: CongThucSc[] = [
  { id: 'sc1', ma: 'CTSC001', gocMa: 'NVL013', ngay: '01/09/2026', kho: [], moTa: 'Lọc gân, mỡ; hao hụt khoảng 8%', tt: 'on',
    dich: [{ ma: 'NVL001', sl: 0.45 }, { ma: 'NVL014', sl: 0.2 }, { ma: 'NVL015', sl: 0.15 }, { ma: 'NVL002', sl: 0.12 }] },
  { id: 'sc2', ma: 'CTSC002', gocMa: 'NVL016', ngay: '01/09/2026', kho: ['Kho bếp Lê Lợi', 'Kho bếp Thảo Điền'], moTa: 'Bỏ đầu, bóc vỏ, rút chỉ', tt: 'on',
    dich: [{ ma: 'NVL017', sl: 0.6 }, { ma: 'NVL018', sl: 0.35 }] },
  { id: 'sc3', ma: 'CTSC003', gocMa: 'NVL019', ngay: '15/09/2026', kho: [], moTa: 'Chặt miếng 5 cm, tách sụn', tt: 'on',
    dich: [{ ma: 'NVL004', sl: 0.82 }, { ma: 'NVL020', sl: 0.12 }] },
  { id: 'sc4', ma: 'CTSC004', gocMa: 'NVL021', ngay: '01/10/2026', kho: ['Kho bếp Nguyễn Trãi'], moTa: 'Chờ bếp trưởng chốt tỉ lệ', tt: 'off',
    dich: [{ ma: 'NVL022', sl: 0.25 }, { ma: 'NVL023', sl: 0.35 }, { ma: 'NVL024', sl: 0.3 }] },
]

/** Công thức đang hoạt động của sản phẩm, NVL gốc */
export const ctCbCua = (spMa: string) => CONG_THUC_CB.find(c => c.spMa === spMa && c.tt === 'on')
export const ctScCua = (gocMa: string) => CONG_THUC_SC.find(c => c.gocMa === gocMa && c.tt === 'on')
/** Kho áp dụng: rỗng là mọi kho */
export const tenKhoAd = (kho: string[]) => !kho.length ? 'Tất cả các kho' : kho.length === 1 ? kho[0] : `${kho.length} kho`
export const apDungKho = (kho: string[], k: string) => !k || !kho.length || kho.includes(k)

// ── Dòng phiếu ──

const dongTrong = (ma: string): DongSx => {
  const h = hangCua(ma)
  return { ma, ten: h?.ten ?? ma, dvt: h?.dvt ?? '', sl: 0, gia: h?.gia ?? 0, tien: 0, ts: 0, thue: 0 }
}

/** Xuất sơ chế: một dòng NVL gốc, giá theo danh mục */
export function dongXuatSc(ma: string, sl: number, ncc = ''): DongSx {
  const d = dongTrong(ma)
  return { ...d, sl, tien: Math.round(sl * d.gia), ncc }
}

/** Xuất chế biến: chọn thành phẩm thì kéo NVL thành phần theo công thức, kế hoạch = định lượng × số thành phẩm, thực tế mặc định bằng kế hoạch */
export function keoNvlCb(tpMa: string, tpSl: number): DongSx[] {
  const ct = ctCbCua(tpMa), tp = hangCua(tpMa)
  if (!ct || !tp) return []
  return ct.nvl.map(n => {
    const d = dongTrong(n.ma), slKh = tron3(n.sl * tpSl)
    return { ...d, tpMa, tp: tp.ten, tpDvt: tp.dvt, tpSl, slKh, sl: slKh, tien: Math.round(slKh * d.gia) }
  })
}

/** Chia giá trị đầu vào cho các dòng nhập cùng đầu vào theo số thực nhận nhân giá tham chiếu, dòng cuối nhận phần lẻ */
export function chiaGia(dong: DongSx[]): DongSx[] {
  const nhom = new Map<string, number[]>()
  dong.forEach((d, i) => { const k = `${d.vaoMa ?? d.ma}|${d.gtVao ?? 0}`; nhom.set(k, [...(nhom.get(k) ?? []), i]) })
  const ra = dong.map(d => ({ ...d }))
  for (const ds of nhom.values()) {
    const gt = ra[ds[0]].gtVao ?? 0
    const w = ds.map(i => (ra[i].sl || 0) * (hangCua(ra[i].ma)?.gia || 1))
    const tongW = w.reduce((a, x) => a + x, 0)
    let con = gt
    ds.forEach((i, j) => {
      const tien = j === ds.length - 1 ? con : Math.round(tongW ? gt * w[j] / tongW : 0)
      con -= tien
      ra[i].tien = tien
      ra[i].gia = ra[i].sl ? Math.round(tien / ra[i].sl) : 0
    })
  }
  return ra
}

/** Phiếu nhập lấy dòng từ phiếu xuất tham chiếu.
 *  Nhập sơ chế: mỗi NVL gốc ra các NVL đích theo công thức sơ chế, kế hoạch = số xuất × tỉ lệ.
 *  Nhập chế biến: mỗi thành phẩm một dòng, kế hoạch = số thành phẩm định làm. Thực nhận mặc định bằng kế hoạch */
export function dongNhapTuXuat(loai: LoaiSx, px: Row | undefined): DongSx[] {
  const ds = (px?._dong as DongSx[] | undefined) ?? []
  if (loai === 'nsc') {
    return chiaGia(ds.flatMap(g => (ctScCua(g.ma)?.dich ?? []).map(n => {
      const d = dongTrong(n.ma), slKh = tron3(n.sl * g.sl)
      return { ...d, vaoMa: g.ma, vao: g.ten, slKh, sl: slKh, gtVao: g.tien }
    })))
  }
  const tp = new Map<string, DongSx>()
  for (const n of ds) {
    if (!n.tpMa) continue
    const c = tp.get(n.tpMa)
    if (c) { c.gtVao = (c.gtVao ?? 0) + n.tien; continue }
    tp.set(n.tpMa, { ...dongTrong(n.tpMa), slKh: n.tpSl ?? 0, sl: n.tpSl ?? 0, gtVao: n.tien })
  }
  return chiaGia([...tp.values()])
}

/** Thực nhận khác kế hoạch theo tỉ lệ, giữ tổng giá trị */
const theoTiLe = (ds: DongSx[], tl: number[]) => chiaGia(ds.map((d, i) => ({ ...d, sl: tron3((d.slKh ?? d.sl) * (tl[i % tl.length] ?? 1)) })))

// ── Phiếu mẫu ──

const NV = ['Võ Thanh Tùng', 'Đặng Văn Hiếu', 'Phạm Ngọc Lan', 'Trần Thu Hà']
const CN_CUA_KHO: Record<string, string> = { 'Kho bếp Lê Lợi': 'Phố Mây Lê Lợi', 'Kho bếp Thảo Điền': 'Phố Mây Thảo Điền', 'Kho bếp Nguyễn Trãi': 'Phố Mây Nguyễn Trãi' }
const TIEN_TO: Record<LoaiSx, string> = { xsc: 'XSC', nsc: 'NSC', xcb: 'XCB', ncb: 'NCB' }
export const tienToSx = (loai: LoaiSx) => `${TIEN_TO[loai]}2610-`

interface Mau { so: number; ngay: string; kho: string; gc: string; tt: 'cho' | 'da' | 'huy'; dong: DongSx[]; ref?: number; nv: number; capNhat?: string }
const AN_PHU = NCC[0].ten

const XSC: Mau[] = [
  { so: 255, ngay: '01/10/2026 07:30', kho: 'Kho bếp Lê Lợi', gc: 'Sơ chế thịt bò nguyên tảng đầu tuần', tt: 'da', nv: 0, dong: [dongXuatSc('NVL013', 25, AN_PHU)] },
  { so: 256, ngay: '02/10/2026 08:00', kho: 'Kho bếp Thảo Điền', gc: 'Sơ chế tôm sú cho gỏi cuốn', tt: 'da', nv: 1, dong: [dongXuatSc('NVL016', 12, AN_PHU)] },
  { so: 257, ngay: '03/10/2026 07:45', kho: 'Kho bếp Nguyễn Trãi', gc: 'Chặt sườn heo nguyên dẻ', tt: 'da', nv: 0, dong: [dongXuatSc('NVL019', 30, AN_PHU)] },
  { so: 260, ngay: '04/10/2026 10:20', kho: 'Kho bếp Lê Lợi', gc: 'Lập nhầm kho, đã huỷ', tt: 'huy', nv: 2, dong: [dongXuatSc('NVL013', 10, AN_PHU)], capNhat: '04/10/2026 10:35' },
  { so: 258, ngay: '05/10/2026 07:15', kho: 'Kho bếp Lê Lợi', gc: 'Sơ chế bò và tôm cho cuối tuần', tt: 'cho', nv: 1, dong: [dongXuatSc('NVL013', 20, AN_PHU), dongXuatSc('NVL016', 8, AN_PHU)] },
  { so: 259, ngay: '06/10/2026 09:10', kho: 'Kho bếp Thảo Điền', gc: 'Chặt sườn cho món sườn nướng', tt: 'cho', nv: 3, dong: [dongXuatSc('NVL019', 18, AN_PHU)] },
]

const XCB: Mau[] = [
  { so: 255, ngay: '01/10/2026 06:00', kho: 'Kho bếp Lê Lợi', gc: 'Nấu nước dùng phở nồi 200 lít', tt: 'da', nv: 1, dong: keoNvlCb('BTP01', 200) },
  { so: 256, ngay: '02/10/2026 06:30', kho: 'Kho bếp Thảo Điền', gc: 'Nấu nước dùng bún bò', tt: 'da', nv: 1, dong: keoNvlCb('BTP02', 120) },
  { so: 257, ngay: '03/10/2026 14:00', kho: 'Kho bếp Nguyễn Trãi', gc: 'Ướp sườn nướng 40 kg', tt: 'da', nv: 0, dong: keoNvlCb('BTP03', 40) },
  { so: 260, ngay: '04/10/2026 06:10', kho: 'Kho bếp Lê Lợi', gc: 'Trùng phiếu, đã huỷ', tt: 'huy', nv: 2, dong: keoNvlCb('BTP01', 200), capNhat: '04/10/2026 07:00' },
  { so: 258, ngay: '06/10/2026 06:00', kho: 'Kho bếp Lê Lợi', gc: 'Nấu nước dùng phở và ướp sườn', tt: 'cho', nv: 1, dong: [...keoNvlCb('BTP01', 180), ...keoNvlCb('BTP03', 25)] },
  { so: 259, ngay: '07/10/2026 06:15', kho: 'Kho bếp Thảo Điền', gc: 'Nấu nước dùng phở nồi 150 lít', tt: 'cho', nv: 3, dong: keoNvlCb('BTP01', 150) },
]

/** Phiếu nhập: tham chiếu phiếu xuất cùng loại, thực nhận lệch kế hoạch chút ít */
const NSC: Mau[] = [
  { so: 257, ngay: '01/10/2026 11:30', kho: 'Kho bếp Lê Lợi', gc: 'Nhập thịt bò sau sơ chế', tt: 'da', nv: 0, ref: 255, dong: [] },
  { so: 258, ngay: '02/10/2026 10:40', kho: 'Kho bếp Thảo Điền', gc: 'Nhập tôm bóc vỏ', tt: 'da', nv: 1, ref: 256, dong: [] },
  { so: 259, ngay: '03/10/2026 11:00', kho: 'Kho bếp Nguyễn Trãi', gc: 'Nhập sườn cắt miếng', tt: 'da', nv: 0, ref: 257, dong: [] },
  { so: 260, ngay: '05/10/2026 10:00', kho: 'Kho bếp Lê Lợi', gc: 'Nhập sai số lượng, lập lại phiếu khác', tt: 'huy', nv: 1, ref: 258, dong: [], capNhat: '05/10/2026 10:20' },
]
const NCB: Mau[] = [
  { so: 257, ngay: '01/10/2026 15:00', kho: 'Kho bếp Lê Lợi', gc: 'Nhập nước dùng phở', tt: 'da', nv: 1, ref: 255, dong: [] },
  { so: 258, ngay: '02/10/2026 14:30', kho: 'Kho bếp Thảo Điền', gc: 'Nhập nước dùng bún bò', tt: 'da', nv: 1, ref: 256, dong: [] },
  { so: 259, ngay: '03/10/2026 19:00', kho: 'Kho bếp Nguyễn Trãi', gc: 'Nhập sườn đã ướp', tt: 'da', nv: 0, ref: 257, dong: [] },
  { so: 260, ngay: '06/10/2026 15:30', kho: 'Kho bếp Lê Lợi', gc: 'Thiếu nồi, lập lại sau', tt: 'huy', nv: 3, ref: 258, dong: [], capNhat: '06/10/2026 15:40' },
]
const TL_NHAP = [0.98, 1, 0.97, 1.01]

const soCua = (loai: LoaiSx, n: number) => `${tienToSx(loai)}${String(n).padStart(4, '0')}`
const idCua = (loai: LoaiSx, n: number) => `${loai}-${n}`
/** Giờ tạo vài phút sau giờ phiếu */
const sauPhut = (ngay: string, p: number) => {
  const [d, g = '08:00'] = ngay.split(' '), [h, m] = g.split(':').map(Number), t = h * 60 + m + p
  return `${d} ${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

function phieuTuMau(loai: LoaiSx, m: Mau, dong: DongSx[]): Row {
  const tong = dong.reduce((a, d) => a + (d.tien || 0), 0)
  const doi = SX[loai].doi!
  return {
    id: idCua(loai, m.so), so: soCua(loai, m.so), ngay: m.ngay, thang: 10, cn: CN_CUA_KHO[m.kho], nguon: 'IVT', tt: m.tt === 'da' ? 'ghi' : 'nhap',
    ttSx: m.tt, dienGiai: m.gc, doiTuong: '', tien: tong, thue: 0, tong,
    _dong: dong, _kho: m.kho, _ghiChu: m.gc, _nhanVien: NV[m.nv],
    _ngayTao: sauPhut(m.ngay, 4), _nguoiTao: NV[m.nv],
    _ngayCapNhat: m.capNhat ?? (m.tt === 'da' ? sauPhut(m.ngay, 9) : ''), _nguoiCapNhat: m.capNhat || m.tt === 'da' ? NV[(m.nv + 3) % NV.length] : '',
    ...(m.ref ? { _thamChieu: soCua(doi, m.ref), _thamChieuId: idCua(doi, m.ref), _thamChieuDi: `/app/${SX[doi].man}/${idCua(doi, m.ref)}` } : {}),
  }
}

/** Phiếu mẫu của một tab. Phiếu xuất đã nhập ghi tham chiếu về phiếu nhập không huỷ */
export function phieuMauSx(loai: LoaiSx): Row[] {
  const xuat = loai === 'xsc' || loai === 'nsc' ? XSC : XCB
  const nhap = loai === 'xsc' || loai === 'nsc' ? NSC : NCB
  const lx: LoaiSx = SX[loai].soChe ? 'xsc' : 'xcb', ln: LoaiSx = SX[loai].soChe ? 'nsc' : 'ncb'
  if (!SX[loai].nhap) {
    return xuat.map(m => {
      const pn = nhap.find(n => n.ref === m.so && n.tt !== 'huy')
      return { ...phieuTuMau(lx, m, m.dong), ...(pn ? { _phieuNhap: { id: idCua(ln, pn.so), so: soCua(ln, pn.so) } } : {}) }
    })
  }
  return nhap.map((m, i) => {
    const px = xuat.find(x => x.so === m.ref)
    const dong = theoTiLe(dongNhapTuXuat(ln, px ? { _dong: px.dong } : undefined), [TL_NHAP[i % TL_NHAP.length]])
    return phieuTuMau(ln, m, dong)
  })
}

/** Cấu hình form chứng từ cho từng tab */
export function cauHinhSx(loai: LoaiSx): VoucherCfg {
  const t = SX[loai]
  return {
    prefix: TIEN_TO[loai], doiTuong: 'none', dong: 'nvl', tien: [0, 0], thue: 0, nguon: 'IVT', dienGiai: [''], noCo: t.noCo,
    them: `Thêm phiếu ${t.ten.toLowerCase()}`, soTT58: 'Sổ chi tiết vật liệu, dụng cụ, hàng hoá', sanXuat: loai,
  }
}

/** Trạng thái phiếu sản xuất: lớp màu, nhãn */
export const TT_SX: Record<string, [string, string]> = { cho: ['warn', 'Chờ nhập'], da: ['ok', 'Đã nhập'], huy: ['err', 'Đã huỷ'] }
