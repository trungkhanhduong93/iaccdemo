// Nhập và xuất Excel Tồn kho ban đầu theo từng kho (T896)
import type { Session } from '../../app/session'
import { GOI } from '../../app/plan'
import { HANG, NVL } from '../../data/mock'
import { maKho } from '../danh-muc/data'
import { fold } from '../../ui/format'
import { taiFileDm, ngayFile, type CotMau, type SheetDs, type ODm } from '../../ui/generic/mauNhapDm'
import type { BaoTienDo, DongKiem, KetQuaKiem, KetQuaNhap, NhomCot, XuLyDong } from '../../ui/generic/nhapDmKieu'
import { dsTonDau, dvtCuaHang, luuTonDau, xoaTonDau, type LyDoKhoa, type DongTonDau } from './ton-dau'

const MAT_HANG = [...NVL, ...HANG.filter(h => h.tonKho)]

/** Tên mã kho cho file: mã kho chuẩn (K01, K02…) hoặc tên kho bỏ dấu, bỏ khoảng trắng (T896) */
export function maKhoFile(tenKho: string): string {
  const m = maKho(tenKho)
  if (m) return m
  return fold(tenKho).replace(/[^a-z0-9]+/gi, '')
}

/** Chuyển lý do khoá kho thành thông báo chặn ở bước 1 (T896) */
export function moTaKhoaTonDau(l: LyDoKhoa | null): string | null {
  if (!l) return null
  if (l.loai === 'kiem-ke') return `Kho đã có phiếu kiểm kê ${l.so} ngày ${l.ngay}`
  return `Cửa hàng ${l.cuaHang} đã khoá sổ tới kỳ ${l.ky}`
}

/** Cột mẫu của file Excel Tồn kho ban đầu (T896) */
export function layCotMauTonDau(): CotMau[] {
  return [
    { k: 'ma', nhan: 'Mã hàng *', nhanGoc: 'Mã hàng', batBuoc: true, kieu: 'chu', rong: 16 },
    { k: 'ten', nhan: 'Tên hàng (chỉ xem)', nhanGoc: 'Tên hàng', batBuoc: false, kieu: 'chu', rong: 32, chuThich: 'Chỉ xem, bỏ qua khi nhập' },
    { k: 'dvtMa', nhan: 'Mã ĐVT *', nhanGoc: 'Mã ĐVT', batBuoc: true, kieu: 'chu', rong: 14 },
    { k: 'sl', nhan: 'Số lượng', nhanGoc: 'Số lượng', batBuoc: false, kieu: 'so', rong: 14, so: true, chuThich: 'Để trống giữ nguyên số cũ, 0 để xoá tồn đầu' },
    { k: 'gia', nhan: 'Đơn giá *', nhanGoc: 'Đơn giá', batBuoc: true, kieu: 'tien', rong: 16, so: true, chuThich: 'Bắt buộc, 0 hợp lệ' },
    { k: 'tien', nhan: 'Thành tiền (chỉ xem)', nhanGoc: 'Thành tiền', batBuoc: false, kieu: 'tien', rong: 18, so: true, chuThich: 'Chỉ xem, bỏ qua khi nhập' },
  ]
}

/** Tạo hai sheet DS: DS hàng hoá (mặt hàng theo dõi tồn) và DS đơn vị tính (gồm cả ĐVT quy đổi) (T896) */
function taoDsRieng(): Map<string, SheetDs> {
  const ds = new Map<string, SheetDs>()
  const shHh: SheetDs = {
    ten: 'DS hàng hoá',
    tieuDe: ['Mã hàng', 'Tên hàng hoá'],
    cot: 'A',
    dong: MAT_HANG.map(h => [h.ma, h.ten]),
  }
  const dongDvt: [string, string, string][] = []
  for (const h of MAT_HANG) {
    for (const d of dvtCuaHang(h.ma)) {
      dongDvt.push([h.ma, d.ma, d.ten])
    }
  }
  const shDvt: SheetDs = {
    ten: 'DS đơn vị tính',
    tieuDe: ['Mã hàng', 'Mã ĐVT', 'Tên ĐVT'],
    cot: 'B',
    dong: dongDvt,
  }
  ds.set('ma', shHh)
  ds.set('dvtMa', shDvt)
  return ds
}

/** Tải file mẫu Tồn kho ban đầu theo gói hiện tại (T896) */
export async function taiMauTonDau(s: Session, kho: string) {
  const cotMau = layCotMauTonDau()
  const ds = dsTonDau(kho)
  const coTon = ds.filter(d => d.co && d.sl != null && d.gia != null)
  const viDuSource = coTon.length >= 2 ? coTon.slice(0, 2) : ds.slice(0, 2)
  const viDu: ODm[][] = viDuSource.map(d => [
    d.ma,
    d.ten,
    d.dvtMa,
    d.sl ?? 10,
    d.gia ?? 100000,
    (d.sl ?? 10) * (d.gia ?? 100000),
  ])
  const dsRieng = taoDsRieng()
  await taiFileDm(s, 'Tồn kho ban đầu', cotMau, [], `Mau_nhap_Ton_kho_ban_dau_${GOI[s.goi].ten}.xlsx`, {
    viDu,
    dsRieng,
    tieuDeHd: `Mẫu nhập Tồn kho ban đầu. Dùng cho màn Kho > Tồn kho ban đầu, gói ${GOI[s.goi].ten}.`,
  })
}

/** Tải dữ liệu tồn đầu kho đang xem ra file Excel (T896) */
export async function taiDuLieuTonDau(s: Session, kho: string) {
  const cotMau = layCotMauTonDau()
  const ds = dsTonDau(kho)
  const coTon = ds.filter(d => d.co)
  const dong: ODm[][] = coTon.map(d => [
    d.ma,
    d.ten,
    d.dvtMa,
    d.sl,
    d.gia,
    d.tien,
  ])
  const dsRieng = taoDsRieng()
  const tenFile = `Du_lieu_Ton_kho_ban_dau_${maKhoFile(kho)}_${ngayFile()}.xlsx`
  await taiFileDm(s, 'Tồn kho ban đầu', cotMau, dong, tenFile, {
    dsRieng,
    tieuDeHd: `Mẫu nhập Tồn kho ban đầu. Dùng cho màn Kho > Tồn kho ban đầu, gói ${GOI[s.goi].ten}.`,
  })
}

/** Tải file danh sách dòng lỗi khi kiểm file tồn đầu (T896) */
export async function taiFileLoiTonDau(s: Session, kq: KetQuaKiem) {
  const dongLoi = kq.dong.filter(d => d.xuLy === 'loi')
  if (!dongLoi.length) return
  const cotMau = layCotMauTonDau()
  const cacDong: ODm[][] = dongLoi.map(d => [
    d.chu['ma'] || d.gt.ma,
    d.chu['ten'] || d.gt.ten,
    d.chu['dvtMa'] || d.gt.dvtMa,
    d.chu['sl'] ? Number(d.chu['sl']) : (d.gt.sl ?? null),
    d.chu['gia'] ? Number(d.chu['gia']) : (d.gt.gia ?? null),
    d.chu['tien'] ? Number(d.chu['tien']) : (d.gt.tien ?? null),
    d.lyDo.join('; '),
  ])
  const dsRieng = taoDsRieng()
  await taiFileDm(s, 'Tồn kho ban đầu', cotMau, cacDong, `Loi_nhap_Ton_kho_ban_dau_${ngayFile()}.xlsx`, {
    cotLoi: true,
    dsRieng,
    tieuDeHd: `Mẫu nhập Tồn kho ban đầu. Dùng cho màn Kho > Tồn kho ban đầu, gói ${GOI[s.goi].ten}.`,
  })
}

/** Đọc và kiểm tra file Excel nhập tồn kho ban đầu cho một kho (T896) */
export async function kiemFileNhapTonDau(file: File, kho: string): Promise<KetQuaKiem> {
  const cotMau = layCotMauTonDau()
  const nhomCot: NhomCot[] = []

  if (file.name.toLowerCase().endsWith('.xls')) {
    return {
      loiChung: 'File .xls chưa đọc được. Mở bằng Excel, lưu lại dạng .xlsx rồi chọn lại.',
      tenFile: file.name,
      cot: cotMau,
      nhomCot,
      dong: [],
      dem: { tat: 0, moi: 0, sua: 0, loi: 0 },
    }
  }

  const ExcelJS = await import('exceljs')
  const Workbook = ExcelJS.Workbook ?? ExcelJS.default?.Workbook
  const wb = new Workbook()

  try {
    const arrayBuf = await file.arrayBuffer()
    await wb.xlsx.load(arrayBuf)
  } catch {
    return {
      loiChung: 'Không đọc được file. Chọn file .xlsx tải từ nút Tải file mẫu.',
      tenFile: file.name,
      cot: cotMau,
      nhomCot,
      dong: [],
      dem: { tat: 0, moi: 0, sua: 0, loi: 0 },
    }
  }

  const ws = wb.getWorksheet('Dữ liệu nhập') ?? wb.getWorksheet('Du lieu')
    ?? wb.worksheets.find(w => !/^(DS |Hướng dẫn$|Huong dan$|Dữ liệu mẫu$|Du lieu mau$|Danh sach$)/i.test(w.name))
  if (!ws || ws.rowCount < 1) {
    return {
      loiChung: 'Không đọc được file. Chọn file .xlsx tải từ nút Tải file mẫu.',
      tenFile: file.name,
      cot: cotMau,
      nhomCot,
      dong: [],
      dem: { tat: 0, moi: 0, sua: 0, loi: 0 },
    }
  }

  const hang1 = ws.getRow(1)
  const mapCotTheoColIdx = new Map<number, CotMau>()
  const cotDaCo = new Set<string>()

  hang1.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const val = String(cell.value ?? '').trim().replace(/\s*\*+$/, '').trim().toLowerCase()
    const match = cotMau.find(c => {
      const nGoc = c.nhanGoc.trim().toLowerCase()
      const nFull = c.nhan.trim().replace(/\s*\*+$/, '').trim().toLowerCase()
      return nGoc === val || nFull === val
    })
    if (match) {
      mapCotTheoColIdx.set(colNumber, match)
      cotDaCo.add(match.k)
    }
  })

  // Thiếu cột bắt buộc (ma, dvtMa, gia)
  for (const c of cotMau) {
    if (c.batBuoc && !cotDaCo.has(c.k)) {
      return {
        loiChung: `Thiếu cột ${c.nhanGoc}`,
        tenFile: file.name,
        cot: cotMau,
        nhomCot,
        dong: [],
        dem: { tat: 0, moi: 0, sua: 0, loi: 0 },
      }
    }
  }

  interface HangDoc { rNum: number; hang: any }
  const hangCoDuLieu: HangDoc[] = []
  for (let rNum = 2; rNum <= ws.rowCount; rNum++) {
    const hang = ws.getRow(rNum)
    let coDuLieu = false
    mapCotTheoColIdx.forEach((_, colNumber) => {
      const cellVal = hang.getCell(colNumber).value
      if (cellVal !== null && cellVal !== undefined && String(cellVal).trim() !== '') {
        coDuLieu = true
      }
    })
    if (coDuLieu) hangCoDuLieu.push({ rNum, hang })
  }

  if (hangCoDuLieu.length === 0) {
    return {
      loiChung: 'File không có dòng dữ liệu nào.',
      tenFile: file.name,
      cot: cotMau,
      nhomCot,
      dong: [],
      dem: { tat: 0, moi: 0, sua: 0, loi: 0 },
    }
  }

  if (hangCoDuLieu.length > 3000) {
    return {
      loiChung: `File có ${hangCoDuLieu.length} dòng, mỗi lần nhập tối đa 3.000 dòng.`,
      tenFile: file.name,
      cot: cotMau,
      nhomCot,
      dong: [],
      dem: { tat: 0, moi: 0, sua: 0, loi: 0 },
    }
  }

  const dsKho = dsTonDau(kho)
  const mapTonDauCu = new Map<string, DongTonDau>()
  for (const d of dsKho) mapTonDauCu.set(d.ma.toLowerCase(), d)

  const mapMatHang = new Map<string, { ma: string; ten: string; dvt: string }>()
  for (const h of MAT_HANG) mapMatHang.set(h.ma.toLowerCase(), h)

  const seenMaInFile = new Map<string, number>()
  const dsDongKiem: DongKiem[] = []

  for (const { rNum, hang } of hangCoDuLieu) {
    const chu: Record<string, string> = {}
    for (const c of cotMau) chu[c.k] = ''

    mapCotTheoColIdx.forEach((c, colNumber) => {
      const raw = hang.getCell(colNumber).value
      let strVal = ''
      if (raw !== null && raw !== undefined) {
        if (typeof raw === 'object') {
          if ('result' in raw && raw.result !== undefined && raw.result !== null) {
            strVal = String(raw.result).trim()
          } else if ('text' in raw && typeof raw.text === 'string') {
            strVal = raw.text.trim()
          } else if ('richText' in raw && Array.isArray(raw.richText)) {
            strVal = raw.richText.map((t: any) => t.text ?? '').join('').trim()
          } else {
            strVal = String(raw).trim()
          }
        } else {
          strVal = String(raw).trim()
        }
      }
      chu[c.k] = strVal
    })

    const oLoi: string[] = []
    const oDoi: string[] = []
    const lyDo: string[] = []

    const maRaw = chu['ma'].trim()
    let hangInfo: { ma: string; ten: string; dvt: string } | undefined = undefined

    if (!maRaw) {
      lyDo.push('Mã hàng bắt buộc')
      oLoi.push('ma')
    } else {
      const maLower = maRaw.toLowerCase()
      hangInfo = mapMatHang.get(maLower)
      if (!hangInfo) {
        lyDo.push(`Mặt hàng ${maRaw} không có trong danh sách theo dõi tồn`)
        oLoi.push('ma')
      } else if (seenMaInFile.has(maLower)) {
        const dongTruoc = seenMaInFile.get(maLower)!
        lyDo.push(`Mã hàng trùng dòng ${dongTruoc} trong file`)
        oLoi.push('ma')
      } else {
        seenMaInFile.set(maLower, rNum)
      }
    }

    const maChot = hangInfo ? hangInfo.ma : maRaw
    const dongCu = mapTonDauCu.get(maChot.toLowerCase())
    const laDongSua = Boolean(dongCu?.co)

    // Kiểm tra Mã ĐVT
    const dvtMaRaw = chu['dvtMa'].trim()
    let dvtChot = ''
    let tenDvtChot = ''
    if (!dvtMaRaw) {
      lyDo.push('Mã ĐVT bắt buộc')
      oLoi.push('dvtMa')
    } else if (hangInfo) {
      const dsDvt = dvtCuaHang(hangInfo.ma)
      const khop = dsDvt.find(d => d.ma.toLowerCase() === dvtMaRaw.toLowerCase() || d.ten.toLowerCase() === dvtMaRaw.toLowerCase())
      if (!khop) {
        lyDo.push(`Mã ĐVT "${dvtMaRaw}" không thuộc mặt hàng ${hangInfo.ma}`)
        oLoi.push('dvtMa')
      } else {
        dvtChot = khop.ma
        tenDvtChot = khop.ten
      }
    } else {
      dvtChot = dvtMaRaw
    }

    // Kiểm tra Đơn giá
    const giaRaw = chu['gia'].trim()
    let giaChot: number | null = null
    if (!giaRaw) {
      lyDo.push('Đơn giá bắt buộc')
      oLoi.push('gia')
    } else {
      const numGia = Number(giaRaw.replace(/,/g, ''))
      if (isNaN(numGia) || numGia < 0) {
        lyDo.push('Đơn giá không hợp lệ')
        oLoi.push('gia')
      } else {
        giaChot = numGia
      }
    }

    // Kiểm tra Số lượng
    const slRaw = chu['sl'].trim()
    let slChot: number | null = null
    if (!slRaw) {
      // Số lượng trống: giữ số lượng cũ
      slChot = dongCu?.sl ?? null
    } else {
      const numSl = Number(slRaw.replace(/,/g, ''))
      if (isNaN(numSl) || numSl < 0) {
        lyDo.push('Số lượng không hợp lệ')
        oLoi.push('sl')
      } else {
        slChot = numSl
      }
    }

    const tienChot = (slChot != null && giaChot != null) ? slChot * giaChot : null
    const tenChot = hangInfo ? hangInfo.ten : chu['ten'].trim()

    let xuLy: XuLyDong = 'loi'
    if (lyDo.length === 0) {
      xuLy = laDongSua ? 'sua' : 'moi'
    }

    if (xuLy === 'sua' && dongCu) {
      if (slChot !== dongCu.sl) oDoi.push('sl')
      if (giaChot !== dongCu.gia) oDoi.push('gia')
      if (dvtChot !== dongCu.dvtMa) oDoi.push('dvtMa')
      if (tienChot !== dongCu.tien) oDoi.push('tien')
    }

    const gt: Record<string, any> = {
      ma: maChot,
      ten: tenChot,
      dvtMa: dvtChot,
      dvt: tenDvtChot || (hangInfo?.dvt ?? ''),
      sl: slChot,
      gia: giaChot,
      tien: tienChot,
    }

    dsDongKiem.push({
      dong: rNum,
      xuLy,
      gt,
      chu,
      oLoi,
      oDoi,
      lyDo,
    })
  }

  const dem = {
    tat: dsDongKiem.length,
    moi: dsDongKiem.filter(d => d.xuLy === 'moi').length,
    sua: dsDongKiem.filter(d => d.xuLy === 'sua').length,
    loi: dsDongKiem.filter(d => d.xuLy === 'loi').length,
  }

  return {
    tenFile: file.name,
    cot: cotMau,
    nhomCot,
    dong: dsDongKiem,
    dem,
  }
}

/** Ghi dữ liệu kiểm vào kho: cập nhật tồn đầu hoặc xoá tồn đầu (khi số lượng = 0) (T896) */
export async function ghiTonDau(
  kho: string,
  kq: KetQuaKiem,
  baoTienDo: BaoTienDo
): Promise<KetQuaNhap> {
  const hopLe = kq.dong.filter(d => d.xuLy === 'moi' || d.xuLy === 'sua')
  const tong = hopLe.length
  const moi: DongKiem[] = []
  const sua: DongKiem[] = []

  const xoaMa: string[] = []
  const luuDs: { ma: string; dvt: string; sl: number | null; gia: number | null }[] = []

  for (let i = 0; i < hopLe.length; i++) {
    const d = hopLe[i]
    if (d.gt.sl === 0) {
      xoaMa.push(d.gt.ma)
    } else {
      luuDs.push({
        ma: d.gt.ma,
        dvt: String(d.gt.dvt || d.gt.dvtMa),
        sl: d.gt.sl != null ? Number(d.gt.sl) : null,
        gia: d.gt.gia != null ? Number(d.gt.gia) : null,
      })
    }
    if (d.xuLy === 'moi') moi.push(d)
    else sua.push(d)

    baoTienDo(i + 1, tong, d)
  }

  if (xoaMa.length) xoaTonDau(kho, xoaMa)
  if (luuDs.length) luuTonDau(kho, luuDs)

  return {
    luc: new Date(),
    moi,
    sua,
    boQua: kq.dong.filter(d => d.xuLy === 'loi'),
  }
}
