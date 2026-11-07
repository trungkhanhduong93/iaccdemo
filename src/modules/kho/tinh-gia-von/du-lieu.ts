export interface Thang {
  t: number
  n: number
}

export interface Kho {
  ma: string
  ten: string
}

export interface HangHoa {
  ma: string
  ten: string
  nhom: string
  dvt: string
}

export const KHO: Kho[] = [
  { ma: 'NK01', ten: 'Kho tổng' },
  { ma: 'NK02', ten: 'Kho bếp Lê Lợi' },
  { ma: 'NK03', ten: 'Kho bar Lê Lợi' },
  { ma: 'NK04', ten: 'Kho bếp chi nhánh Thảo Điền, khu B tầng hầm 2, TP. Thủ Đức' },
]

export const NHOM: { ma: string; ten: string }[] = [
  { ma: 'TH', ten: 'Thịt' },
  { ma: 'HS', ten: 'Hải sản' },
  { ma: 'RC', ten: 'Rau củ' },
  { ma: 'GV', ten: 'Gia vị' },
  { ma: 'DU', ten: 'Đồ uống' },
]

export const HANG: HangHoa[] = [
  { ma: '100012', ten: 'Thăn bò Úc', nhom: 'Thịt', dvt: 'kg' },
  { ma: '100013', ten: 'Ba chỉ heo rút sườn loại 1 cắt lát 3 mm đóng khay 500 g giao lạnh', nhom: 'Thịt', dvt: 'kg' },
  { ma: '100014', ten: 'Đùi gà góc tư', nhom: 'Thịt', dvt: 'kg' },
  { ma: '100015', ten: 'Sườn non heo', nhom: 'Thịt', dvt: 'kg' },
  { ma: '100021', ten: 'Tôm sú', nhom: 'Hải sản', dvt: 'kg' },
  { ma: '100022', ten: 'Mực ống', nhom: 'Hải sản', dvt: 'kg' },
  { ma: '100023', ten: 'Cá hồi phi lê', nhom: 'Hải sản', dvt: 'kg' },
  { ma: '100031', ten: 'Xà lách lô lô', nhom: 'Rau củ', dvt: 'kg' },
  { ma: '100032', ten: 'Cà chua', nhom: 'Rau củ', dvt: 'kg' },
  { ma: '100033', ten: 'Hành tây', nhom: 'Rau củ', dvt: 'kg' },
  { ma: '100034', ten: 'Khoai tây', nhom: 'Rau củ', dvt: 'kg' },
  { ma: '100041', ten: 'Nước mắm', nhom: 'Gia vị', dvt: 'chai' },
  { ma: '100042', ten: 'Dầu ăn', nhom: 'Gia vị', dvt: 'can' },
  { ma: '100043', ten: 'Đường cát', nhom: 'Gia vị', dvt: 'kg' },
  { ma: '100051', ten: 'Cà phê hạt', nhom: 'Đồ uống', dvt: 'kg' },
  { ma: '100052', ten: 'Sữa tươi', nhom: 'Đồ uống', dvt: 'hộp' },
  { ma: '100053', ten: 'Trà đen', nhom: 'Đồ uống', dvt: 'gói' },
  { ma: '100054', ten: 'Si rô đào', nhom: 'Đồ uống', dvt: 'chai' },
]

const LY_DO: ((h: HangHoa, i: number) => string)[] = [
  (h, i) => `Âm kho: xuất ${4 + (i % 9)} ${h.dvt}, tồn trước khi xuất ${1 + (i % 3)} ${h.dvt}`,
  () => 'Chưa có đơn giá: tồn đầu kỳ bằng 0, trong tháng không có phiếu nhập',
  (h, i) => `Phiếu xuất PX${String(900 + i * 7).padStart(5, '0')} dùng đơn vị tính chưa khai báo quy đổi sang ${h.dvt}`,
  (h, i) => `Phiếu nhập PN${String(400 + i * 3).padStart(5, '0')} có số lượng âm`,
]

export function lyDoLoi(hang: HangHoa, kho: Kho): string {
  const hangI = HANG.findIndex(h => h.ma === hang.ma)
  const khoI = KHO.findIndex(k => k.ma === kho.ma)
  if (hangI === -1 || khoI === -1) return ''
  const i = hangI * KHO.length + khoI
  return (i * 7 + 3) % 11 === 0 ? LY_DO[i % LY_DO.length](hang, i) : ''
}

export interface DongGiaVon {
  kho: Kho
  hang: HangHoa
  slDau: number
  dgDau: number
  gtDau: number
  slNhap: number
  gtNhap: number
  giaVon: number
  loi: string
  capNhat: Date
}

const GIA: Record<string, number> = {
  'Thịt': 185000,
  'Hải sản': 265000,
  'Rau củ': 26000,
  'Gia vị': 42000,
  'Đồ uống': 118000,
}

export function taoDsGiaVon(th: Thang): DongGiaVon[] {
  let hat = th.t * 31 + th.n
  const r = () => {
    hat = (hat * 9301 + 49297) % 233280
    return hat / 233280
  }
  const nay = new Date()
  const thangNay = nay.getMonth() + 1
  const namNay = nay.getFullYear()
  const laThangNay = th.t === thangNay && th.n === namNay
  const tgT = laThangNay ? th.t : (th.t % 12) + 1
  const tgN = laThangNay ? th.n : th.n + (th.t === 12 ? 1 : 0)
  const rows: DongGiaVon[] = []

  KHO.forEach((k, ki) => {
    HANG.forEach(h => {
      if (ki === 2 && h.nhom !== 'Đồ uống' && h.ten !== 'Đường cát') return
      if ((ki === 1 || ki === 3) && h.nhom === 'Đồ uống') return
      const loi = lyDoLoi(h, k)
      const gia = GIA[h.nhom] * (0.7 + r() * 0.8)
      const le = h.dvt === 'kg' ? 2 : 0
      let slDau = +(r() * 40).toFixed(le)
      let dgDau = Math.round(gia * (0.92 + r() * 0.1) * 100) / 100
      let slNhap = +(5 + r() * 80).toFixed(le)
      let gtNhap = Math.round(slNhap * gia)
      if (r() < 0.12) {
        slDau = 0
        dgDau = 0
      }
      if (loi.startsWith('Chưa có đơn giá')) {
        slDau = 0
        dgDau = 0
        slNhap = 0
        gtNhap = 0
      }
      const gtDau = Math.round(slDau * dgDau)
      const mau = slDau + slNhap
      const ngay = 1 + Math.floor(r() * (laThangNay ? Math.min(6, nay.getDate()) : 5))
      const cn = new Date(tgN, tgT - 1, ngay, 8 + Math.floor(r() * 10), Math.floor(r() * 60))
      rows.push({
        kho: k,
        hang: h,
        slDau,
        dgDau,
        gtDau,
        slNhap,
        gtNhap,
        giaVon: mau ? (gtDau + gtNhap) / mau : 0,
        loi,
        capNhat: cn,
      })
    })
  })
  return rows
}

export interface DieuKienTinh {
  thang: Thang
  kho: string[]
  nhom: string[]
  hang: string[]
}

export interface DongLoi {
  ma: string
  hang: string
  kho: string
  loi: string
}

export interface KetQuaTinh {
  dieuKien: DieuKienTinh
  tong: number
  loi: DongLoi[]
  thanhCong: { ma: string; kho: string }[]
  luc: Date
}

export function lapViecTinh(dk: DieuKienTinh): { hang: HangHoa; kho: Kho; loi: string }[] {
  const dsKho = dk.kho.length > 0 ? KHO.filter(k => dk.kho.includes(k.ten)) : KHO
  const hangTheoNhom = dk.nhom.length > 0 ? HANG.filter(h => dk.nhom.includes(h.nhom)) : HANG
  const dsHang = dk.hang.length > 0 ? hangTheoNhom.filter(h => dk.hang.includes(h.ten)) : hangTheoNhom
  return dsHang.flatMap(h => dsKho.map(k => ({ hang: h, kho: k, loi: lyDoLoi(h, k) })))
}
