// Dựng dữ liệu in từ một phiếu trong danh sách chứng từ (dữ liệu giả của gen.ts)
import type { Row, VoucherCfg, LoaiCT } from '../../modules/types'
import type { MauIn } from '../../app/mau-in'
import { dongCua, tongDong, ttNghiepVu, type Dong } from '../generic/gen'
import { docSoTien, money, pad, rng, k } from '../format'

export interface DuLieuIn {
  so: string
  ngay: string
  ngayChu: string
  tt: Record<string, string>
  dong: Record<string, string | number>[]
  tong: Record<string, number>
  bangChu: string
  no: string[]
  co: string[]
}

export interface DonViIn {
  ten: string
  diaChi: string
  mst: string
}

function dinhDangNgayChu(ngayStr: string | undefined): string {
  if (!ngayStr) return 'Ngày 07 tháng 10 năm 2026'
  const parts = String(ngayStr).split('/')
  if (parts.length === 3) {
    const d = parts[0].padStart(2, '0')
    const m = parts[1].padStart(2, '0')
    const y = parts[2]
    return `Ngày ${d} tháng ${m} năm ${y}`
  }
  return 'Ngày 07 tháng 10 năm 2026'
}

type NoCo = NonNullable<VoucherCfg['noCo']>
const dau = (tk: string, ...tien: string[]) => tien.some(t => tk.startsWith(t))
const duyNhat = (ds: string[]) => Array.from(new Set(ds.filter(Boolean)))

/**
 * Nợ, Có in trên phiếu: chỉ lấy bút toán của chính phiếu đó trong bút toán mẫu của chứng từ (T112).
 * Phiếu thu Nợ 111, phiếu chi Có 111, thu qua ngân hàng Nợ 112, nhập kho Nợ 15x, xuất kho Có 15x.
 * Chứng từ không có bút toán khớp (vd hàng bán trả lại chỉ có bút toán doanh thu) thì dùng cặp thông dụng của loại phiếu
 */
function noCoCuaMau(mauId: string, ds: NoCo): { no: string[]; co: string[] } {
  const loc = (f: (x: NoCo[number]) => boolean, thay: [string, string]) => {
    const kq = ds.filter(f)
    return kq.length ? { no: duyNhat(kq.map(x => x[0])), co: duyNhat(kq.map(x => x[1])) } : { no: [thay[0]], co: [thay[1]] }
  }
  const noKhac = (...tien: string[]) => ds.map(x => x[0]).find(t => !dau(t, ...tien))
  const coKhac = (...tien: string[]) => ds.map(x => x[1]).find(t => !dau(t, ...tien))
  switch (mauId) {
    case 'phieu-thu': return loc(x => dau(x[0], '111'), ['1111', noKhac('111') ?? '131'])
    case 'phieu-chi': return loc(x => dau(x[1], '111'), [coKhac('111') ?? '331', '1111'])
    case 'phieu-thu-nh': return loc(x => dau(x[0], '112'), ['1121', noKhac('112') ?? '131'])
    case 'uy-nhiem-chi': return loc(x => dau(x[1], '112'), [coKhac('112') ?? '331', '1121'])
    case 'phieu-nhap-kho': return loc(x => dau(x[0], '152', '153', '155', '156'), ['152', ds.some(x => dau(x[0], '511')) ? '632' : '331'])
    case 'phieu-xuat-kho': return loc(x => dau(x[1], '152', '153', '155', '156'), ['632', '152'])
    default: return { no: duyNhat(ds.map(x => x[0])), co: duyNhat(ds.map(x => x[1])) }
  }
}

/** dongThay: dòng thật của phiếu (vd chứng từ bán hàng 3.1.1) thay cho dòng sinh từ cfg; tổng và số bằng chữ tính từ chính các dòng này */
export function duLieuIn(
  mau: MauIn,
  cfg: VoucherCfg,
  row: Row,
  loai?: LoaiCT,
  dv?: DonViIn,
  seedPrefix?: string,
  dongThay?: Record<string, string | number>[],
): DuLieuIn {
  const nv = ttNghiepVu(row)
  const donVi = dv ?? {
    ten: 'Công ty TNHH F&B Cloud Việt Nam',
    diaChi: 'Tầng 5, Toà nhà Starlight, 68 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM',
    mst: '0316889988',
  }

  const so = String(row.so ?? '')
  const ngay = String(row.ngay ?? '07/10/2026')
  const ngayChu = dinhDangNgayChu(ngay)

  const idSeed = `${seedPrefix ?? cfg.prefix ?? 'ct'}-${row.id ?? '0'}`
  // Dòng chi tiết: dòng đã lưu của phiếu nếu có, không thì sinh theo cùng hạt giống với form chứng từ
  const dsGoc = Array.isArray(row._dong) ? row._dong as Dong[] : dongCua(cfg, idSeed)
  const cong = (k: string) => (dongThay ?? []).reduce((a, d) => a + (Number(d[k]) || 0), 0)
  const td = dongThay ? { tien: cong('tien'), thue: cong('thue'), tong: cong('tien') + cong('thue') } : tongDong(dsGoc)
  const thueSuat = Number(dongThay?.[0]?.ts ?? dsGoc[0]?.ts ?? cfg.thue ?? 0)
  // Một nguồn cho số tiền in trên phiếu: mẫu có bảng lấy đúng tổng các dòng in ra (cột Thành tiền, hoặc Tổng thanh toán khi mẫu có dòng tổng),
  // mẫu không bảng (phiếu thu, chi) lấy tổng của phiếu. Số tiền, số bằng chữ, dòng tổng cùng đọc từ đây
  const coBang = !!mau.bang && mau.id !== 'bien-ban-doi-chieu'
  const tongSoTien = coBang
    ? (mau.tongCong?.some(t => t.k === 'tong') ? td.tong : td.tien)
    : row.tong != null ? Number(row.tong) : td.tong

  // Bút toán Nợ / Có
  const noCoList = loai?.noCo ?? cfg.noCo ?? []
  const capTien = noCoList[0] ?? ['1111', '131']
  const { no, co } = noCoCuaMau(mau.id, noCoList)

  // Bảng chi tiết
  let dong: Record<string, string | number>[] = []
  if (mau.id === 'bien-ban-doi-chieu') {
    const r = rng(row.so ?? 'dccn')
    const soDong = 3 + Math.floor(r() * 3)
    dong = Array.from({ length: soDong }, (_, i) => {
      const soHd = `HĐ${pad(Math.floor(r() * 90000) + 10000, 6)}`
      const ngayHd = `${pad(1 + Math.floor(r() * 28))}/09/2026`
      const tangVal = i % 2 === 0 ? k(10_000_000 + r() * 40_000_000) : 0
      const giamVal = tangVal === 0 ? k(10_000_000 + r() * 40_000_000) : 0
      return {
        stt: i + 1,
        so: soHd,
        ngay: ngayHd,
        dienGiai: tangVal > 0 ? 'Mua hàng theo hoá đơn' : 'Thanh toán tiền hàng qua ngân hàng',
        tang: tangVal,
        giam: giamVal,
      }
    })
  } else if (dongThay) {
    dong = dongThay
  } else if (mau.bang) {
    dong = dsGoc.map((d, i) => ({
      stt: i + 1,
      ma: d.ma ?? '',
      ten: d.ten ?? '',
      dienGiai: d.ten ?? '',
      dvt: d.dvt ?? '',
      sl: d.sl ?? 0,
      slCt: d.sl ?? 0,
      gia: d.gia ?? 0,
      tien: d.tien ?? 0,
      thue: d.thue ?? 0,
      ts: d.ts ?? thueSuat,
      slXuat: d.sl ?? 0,
      slNhap: d.sl ?? 0,
      slSo: d.sl ?? 0,
      tienSo: d.tien ?? 0,
      slThua: 0,
      slThieu: 0,
      tienThua: 0,
      tienThieu: 0,
      pcTot: d.sl ?? 0,
      pcKem: 0,
      pcMat: 0,
      tkNo: capTien[0],
      tkCo: capTien[1],
      nuocSx: 'Việt Nam',
      namSx: '2025',
      namSd: '2026',
      congSuat: '',
      giaMua: d.tien ?? 0,
      cpVc: 0,
      cpChayThu: 0,
      tyLeHm: '20',
      taiLieu: '',
      ngayMua: ngay,
      tenBan: String(row.doiTuong ?? nv.nguoi),
      diaChiBan: nv.dc,
    }))
  }

  const bangChu = docSoTien(tongSoTien)

  // Khối thông tin chung
  const tt: Record<string, string> = {
    nguoi: nv.nguoi,
    doiTuong: String(row.doiTuong ?? nv.nguoi),
    diaChi: nv.dc,
    mst: nv.mst,
    lyDo: String(row.dienGiai ?? 'Thu chi theo chứng từ'),
    soTien: money(tongSoTien) + ' đ',
    bangChu,
    kemTheo: '01 chứng từ gốc',
    kho: row.cn ? `Kho ${row.cn}` : 'Kho tổng',
    khoXuat: row.cn ? `Kho ${row.cn}` : 'Kho tổng',
    khoNhap: 'Kho tổng TP.HCM',
    theoCt: `Hoá đơn số ${nv.soHd} ngày ${nv.ngayHd}`,
    kyHieuHd: nv.kyHieuHd,
    soHd: nv.soHd,
    ngayHd: nv.ngayHd,
    hinhThucTt: 'Tiền mặt/Chuyển khoản',
    donViTra: donVi.ten,
    tkTra: '0071001234567',
    nhTra: 'Vietcombank - CN TP.HCM',
    donViNhan: String(row.doiTuong ?? 'Công ty đối tác'),
    tkNhan: '19034567890123',
    nhNhan: 'Techcombank - CN Sài Gòn',
    nganHang: 'Vietcombank - CN TP.HCM (0071001234567)',
    boPhan: String(row.cn ?? 'Bộ phận kinh doanh'),
    cn: String(row.cn ?? 'Chi nhánh 1'),
    ngayBan: ngay,
    nguon: String(row.nguon ?? 'FABi POS'),
    thoiDiem: `${ngay} 18:00`,
    banKiemKe: 'Ông Nguyễn Văn An (Trưởng ban), Bà Trần Thị Mai (Thủ kho)',
    canCu: 'Quyết định số 26/QĐ-TGĐ ngày 01/10/2026',
    benGiao: donVi.ten,
    benNhan: String(row.doiTuong ?? 'Chi nhánh TP.HCM'),
    diaDiem: nv.dc,
    phuongTien: 'Xe tải 29H-123.45',
    lenhDieuDong: 'LĐĐ-2026/09/28',
    banThanhLy: 'Hội đồng thanh lý theo QĐ 26/QĐ-TGĐ',
    ten: String(row.dienGiai ?? 'Tài sản cố định'),
    soHieuTs: 'TS0012',
    soThe: '12',
    nuocSx: 'Việt Nam',
    namSx: '2023',
    namSd: '2024',
    chiPhiTl: money(1_500_000) + ' đ',
    thuHoi: money(Math.round((tongSoTien || 50_000_000) * 0.1)) + ' đ',
    ngayGhiGiam: ngay,
    nguyenGia: money(tongSoTien || 50_000_000) + ' đ',
    haoMon: money(Math.round((tongSoTien || 50_000_000) * 0.8)) + ' đ',
    conLai: money(Math.round((tongSoTien || 50_000_000) * 0.2)) + ' đ',
    ketLuan: 'Đồng ý thanh lý theo hình thức bán phế liệu thu hồi',
    benA: donVi.ten,
    benB: String(row.doiTuong ?? 'Khách hàng / Nhà cung cấp'),
    kyDoiChieu: 'Từ ngày 01/09/2026 đến ngày 30/09/2026',
  }

  // Điền bù các trường thông tin trong mẫu nếu còn thiếu để không để trống trường bắt buộc
  for (const tr of mau.thongTin) {
    if (!tt[tr.k]) {
      tt[tr.k] = `Thông tin ${tr.nhan.toLowerCase()}`
    }
  }

  const tong: Record<string, number> = coBang
    ? { tien: td.tien, thue: td.thue, tong: td.tong, thueSuat }
    : {
        tien: row.tien != null ? Number(row.tien) : td.tien,
        thue: row.thue != null ? Number(row.thue) : td.thue,
        tong: tongSoTien,
        thueSuat,
      }

  return {
    so,
    ngay,
    ngayChu,
    tt,
    dong,
    tong,
    bangChu,
    no,
    co,
  }
}
