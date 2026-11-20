import { taiFile } from '../xuatBangExcel'
import { fold } from '../format'
import type { Row, CatalogCfg } from '../../modules/types'
import type { KetQuaKiem, KetQuaNhap, BaoTienDo, DongKiem, NhomCot, XuLyDong } from './nhapDmKieu'
import type { Session } from '../../app/session'
import { TRUONG_DM, hopPp, type TruongDM, type KhoiDM, type CauHinhDM, type KieuTruong } from '../../modules/danh-muc/truong-dm'
import { addCatalogRow, ghiDeCatalogRow, danhDauNhap, sinhMaKeTiep } from './danhMucStore'

export interface CotMau {
  k: string
  nhan: string
  nhanGoc: string
  batBuoc: boolean
  kieu: KieuTruong | 'kieuDt'
  ds?: string[]
  nhanDs?: (v: string) => string
  hien?: (v: Record<string, any>) => boolean
  rong: number
  so?: boolean
  chuThich?: string | null
  goiY?: string
}

export interface LoiDong {
  dong: number
  cot: string
  lyDo: string
}

export interface KetQuaDocFile {
  loiChung?: string
  soDongDat: number
  soDongLoi: number
  dongDat: Row[]
  loi: LoiDong[]
}

export const CAT_KEYS_NHAP_EXCEL = ['1.2', 'nhom-hang-hoa', '1.5', 'nhom-doi-tuong', '1.12', '1.16']

export function layCotMauDm(catKey: string, s: Session): CotMau[] {
  const cfg = TRUONG_DM[catKey]
  if (!cfg) return []

  const cot: CotMau[] = []
  const daThem = new Set<string>()

  // Đối tượng (1.5) có chọn đầu Tổ chức / Cá nhân (kieuDt)
  if (catKey === '1.5') {
    cot.push({
      k: 'kieuDt',
      nhan: 'Tổ chức / Cá nhân *',
      nhanGoc: 'Tổ chức / Cá nhân',
      batBuoc: true,
      kieu: 'kieuDt',
      ds: ['Tổ chức', 'Cá nhân'],
      rong: 24,
    })
    daThem.add('kieuDt')
  }

  for (const b of cfg.khoi) {
    if (b.bang || b.ve || b.chiKhiXem) continue
    if (b.goi && !b.goi.includes(s.goi)) continue
    if (b.cheDo && !b.cheDo.includes(s.cheDo)) continue
    if (b.pp && !hopPp(b.pp, s)) continue

    for (const t of b.truong) {
      if (t.goi && !t.goi.includes(s.goi)) continue
      if (t.cheDo && !t.cheDo.includes(s.cheDo)) continue
      if (t.pp && !hopPp(t.pp, s)) continue
      // chiDoc dạng hàm (vd Theo dõi tồn kho gói Standard tự đặt theo loại) xét với form trống như lúc Thêm mới
      if (t.chiDoc === true || (typeof t.chiDoc === 'function' && t.chiDoc({}, s))) continue
      if (['nhieuDong', 'khoangNgay', 'chonHaiCot', 'ngay'].includes(t.kieu)) continue
      if (daThem.has(t.k)) continue
      daThem.add(t.k)

      const nhanGoc = t.k === '_tt' ? 'Đang sử dụng' : t.nhan
      const batBuocDau = Boolean(t.batBuoc && !t.hien && t.k !== '_tt')
      const nhan = batBuocDau ? `${nhanGoc} *` : nhanGoc
      const laSo = t.kieu === 'tien' || t.kieu === 'so'
      const ds = t.dsGoi?.[s.goi] ?? t.ds
      const chuThich = typeof t.chuThich === 'function' ? t.chuThich({}, s) : t.chuThich

      cot.push({
        k: t.k,
        nhan,
        nhanGoc,
        batBuoc: Boolean(t.batBuoc),
        kieu: t.kieu,
        ds,
        nhanDs: t.nhanDs,
        hien: t.hien,
        rong: laSo ? 16 : 24,
        so: laSo,
        chuThich: chuThich ?? undefined,
        goiY: t.goiY,
      })
    }
  }

  return cot
}

/** Tính nhóm cột tiêu đề tầng 1 theo khối form (T892) */
export function layNhomCotDm(cotMau: CotMau[], catKey: string): NhomCot[] {
  const cfg = TRUONG_DM[catKey]
  if (!cfg || !cotMau.length) return []

  const khoiTenCuaCot = (c: CotMau): string => {
    if (c.k === 'kieuDt') return cfg.khoi[0]?.ten ?? 'Thông tin chung'
    for (const b of cfg.khoi) {
      if (b.truong.some(t => t.k === c.k)) return b.ten
    }
    return 'Thông tin chung'
  }

  const nhom: NhomCot[] = []
  for (const c of cotMau) {
    const tenKhoi = khoiTenCuaCot(c)
    if (nhom.length > 0 && nhom[nhom.length - 1].ten === tenKhoi) {
      nhom[nhom.length - 1].so++
    } else {
      nhom.push({ ten: tenKhoi, so: 1 })
    }
  }
  return nhom
}

function layTruongDmDef(catKey: string): Map<string, TruongDM> {
  const map = new Map<string, TruongDM>()
  const cfg = TRUONG_DM[catKey]
  if (!cfg) return map
  for (const b of cfg.khoi) {
    for (const t of b.truong) {
      if (!map.has(t.k)) map.set(t.k, t)
    }
  }
  return map
}

function layCotLetter(colIdx: number): string {
  let temp = ''
  let n = colIdx
  while (n > 0) {
    const rem = (n - 1) % 26
    temp = String.fromCharCode(65 + rem) + temp
    n = Math.floor((n - 1) / 26)
  }
  return temp
}

function kieuHienThi(c: CotMau): string {
  if (c.k === 'kieuDt') return 'Chọn một'
  if (c.kieu === 'chu') return 'Chữ'
  if (c.kieu === 'so') return 'Số'
  if (c.kieu === 'tien') return 'Tiền'
  if (c.kieu === 'tich') return 'Có/Không'
  if (c.kieu === 'chon' || c.kieu === 'chonTim') return 'Chọn một'
  if (c.kieu === 'chonNhieu') return 'Chọn nhiều'
  return 'Chữ'
}

function giaTriHopLe(c: CotMau): string {
  if (c.k === 'kieuDt') return 'Tổ chức, Cá nhân'
  if (c.k === '_tt') return 'Để trống là đang sử dụng; 0 hoặc Không là ngừng sử dụng'
  if (c.kieu === 'tich') return 'x, Có hoặc 1'
  if (c.kieu === 'tien' || c.kieu === 'so') return 'Số nguyên hoặc số thập phân'
  if (c.ds && c.ds.length > 0) {
    const hien = c.nhanDs ? c.ds.map(v => c.nhanDs!(v)) : c.ds
    return hien.slice(0, 10).join(', ') + (hien.length > 10 ? ', ...' : '')
  }
  return ''
}

function taoGhiChuCot(c: CotMau): string {
  const ghiChu: string[] = []
  ghiChu.push(c.batBuoc ? 'Bắt buộc' : 'Không bắt buộc')
  ghiChu.push(`Kiểu: ${kieuHienThi(c)}`)
  const hopLe = giaTriHopLe(c)
  if (hopLe) ghiChu.push(`Giá trị hợp lệ: ${hopLe}`)
  if (c.chuThich) ghiChu.push(`Chú thích: ${c.chuThich}`)
  if (c.goiY) ghiChu.push(`Gợi ý: ${c.goiY}`)
  if (c.k === 'ma') ghiChu.push('Để trống thì tự sinh mã')
  return ghiChu.join('\n')
}

function themSheetHuongDan(wb: any, cotMau: CotMau[]): void {
  const wsHd = wb.addWorksheet('Huong dan')
  const hangTieuDeHd = wsHd.addRow(['Cột', 'Bắt buộc', 'Kiểu', 'Giá trị hợp lệ'])
  hangTieuDeHd.font = { bold: true }
  hangTieuDeHd.eachCell((c: any) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EEF7' } }
  })

  cotMau.forEach(c => {
    wsHd.addRow([
      c.nhan,
      c.batBuoc ? 'Có' : '',
      kieuHienThi(c),
      giaTriHopLe(c),
    ])
  })

  wsHd.addRow([])
  wsHd.addRow(['Quy ước ô Có/Không: gõ x, Có hoặc 1 là có, để trống là không.'])

  wsHd.getColumn(1).width = 28
  wsHd.getColumn(2).width = 14
  wsHd.getColumn(3).width = 16
  wsHd.getColumn(4).width = 45
}

function themValidationChoSheet(wb: any, ws: any, cotMau: CotMau[], soDong: number = 200): void {
  let wsDs: any = wb.getWorksheet('Danh sach')
  let cotDsIndex = wsDs ? wsDs.columnCount + 1 : 1

  cotMau.forEach((c, idx) => {
    if (c.ds && c.ds.length > 0) {
      const dsGiaTri = c.nhanDs ? c.ds.map(v => c.nhanDs!(v)) : c.ds
      const chuoiDs = dsGiaTri.join(',')
      let formula = ''

      if (chuoiDs.length <= 255) {
        formula = `"${chuoiDs.replace(/"/g, '""')}"`
      } else {
        if (!wsDs) {
          wsDs = wb.addWorksheet('Danh sach')
          wsDs.state = 'hidden'
        }
        const dsColLetter = layCotLetter(cotDsIndex)
        dsGiaTri.forEach((val, valIdx) => {
          wsDs.getCell(valIdx + 1, cotDsIndex).value = val
        })
        formula = `'Danh sach'!$${dsColLetter}$1:$${dsColLetter}$${dsGiaTri.length}`
        cotDsIndex++
      }

      for (let r = 2; r <= soDong; r++) {
        ws.getCell(r, idx + 1).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [formula],
        }
      }
    }
  })
}

export async function taiMauNhapDm(
  catKey: string,
  tenDm: string,
  s: Session,
  rowsViDu: Row[]
) {
  const cotMau = layCotMauDm(catKey, s)
  if (!cotMau.length) return

  const ExcelJS = await import('exceljs')
  const Workbook = ExcelJS.Workbook ?? ExcelJS.default?.Workbook
  const wb = new Workbook()

  // Sheet 1 "Du lieu": chỉ tiêu đề (không dòng ví dụ), có ghi chú Excel (T892)
  const wsDuLieu = wb.addWorksheet('Du lieu')
  const tieuDeCacCot = cotMau.map(c => c.nhan)
  const hangTieuDe = wsDuLieu.addRow(tieuDeCacCot)
  hangTieuDe.font = { bold: true }
  hangTieuDe.eachCell((c, colNumber) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EEF7' } }
    const cotDef = cotMau[colNumber - 1]
    if (cotDef) {
      c.note = taoGhiChuCot(cotDef)
    }
  })
  wsDuLieu.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

  cotMau.forEach((c, idx) => {
    const col = wsDuLieu.getColumn(idx + 1)
    col.width = c.rong
    if (c.so) col.numFmt = '#,##0'
  })

  themValidationChoSheet(wb, wsDuLieu, cotMau, 200)

  // Sheet 2 "Du lieu mau": cùng tiêu đề + 2 dòng ví dụ (T892)
  const wsMau = wb.addWorksheet('Du lieu mau')
  const hangTieuDeMau = wsMau.addRow(tieuDeCacCot)
  hangTieuDeMau.font = { bold: true }
  hangTieuDeMau.eachCell(c => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EEF7' } }
  })
  wsMau.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

  for (const r of rowsViDu.slice(0, 2)) {
    const dongViDu: (string | number | null)[] = []
    for (const c of cotMau) {
      if (c.k === 'kieuDt') {
        dongViDu.push(r.kieuDt ?? (r.mst ? 'Tổ chức' : 'Cá nhân'))
      } else if (c.k === '_tt') {
        dongViDu.push(r._tt === 0 ? 'Không' : 'Có')
      } else if (c.kieu === 'tich') {
        dongViDu.push(r[c.k] ? 'Có' : 'Không')
      } else if (c.kieu === 'tien' || c.kieu === 'so') {
        const num = Number(r[c.k])
        dongViDu.push(isNaN(num) ? null : num)
      } else if (c.kieu === 'chonTim' && c.nhanDs) {
        dongViDu.push(r[c.k] ? c.nhanDs(String(r[c.k])) : null)
      } else {
        dongViDu.push(r[c.k] !== undefined && r[c.k] !== null ? r[c.k] : null)
      }
    }
    const hangViDu = wsMau.addRow(dongViDu)
    hangViDu.font = { italic: true, color: { argb: 'FF888888' } }
  }

  cotMau.forEach((c, idx) => {
    const col = wsMau.getColumn(idx + 1)
    col.width = c.rong
    if (c.so) col.numFmt = '#,##0'
  })

  // Sheet 3 "Huong dan"
  themSheetHuongDan(wb, cotMau)

  const tenFile = `mau-nhap-${fold(tenDm).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.xlsx`
  const buf = await wb.xlsx.writeBuffer()
  taiFile(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), tenFile)
}

export async function docFileNhapDm(
  file: File,
  catKey: string,
  s: Session,
  allHienTai: Row[]
): Promise<KetQuaDocFile> {
  const cotMau = layCotMauDm(catKey, s)
  const cfgDm = TRUONG_DM[catKey]

  const ExcelJS = await import('exceljs')
  const Workbook = ExcelJS.Workbook ?? ExcelJS.default?.Workbook
  const wb = new Workbook()

  try {
    const arrayBuf = await file.arrayBuffer()
    await wb.xlsx.load(arrayBuf)
  } catch {
    return {
      loiChung: 'Không đọc được file. Chọn file .xlsx tải từ nút Tải file mẫu.',
      soDongDat: 0,
      soDongLoi: 0,
      dongDat: [],
      loi: [],
    }
  }

  const ws = wb.worksheets[0]
  if (!ws || ws.rowCount < 1) {
    return {
      loiChung: 'Không đọc được file. Chọn file .xlsx tải từ nút Tải file mẫu.',
      soDongDat: 0,
      soDongLoi: 0,
      dongDat: [],
      loi: [],
    }
  }

  const hang1 = ws.getRow(1)
  const mapCotTheoColIdx = new Map<number, CotMau>()
  const cotDaCo = new Set<string>()

  hang1.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const val = String(cell.value ?? '').trim().replace(/\s*\*$/, '').trim().toLowerCase()
    const match = cotMau.find(c => c.nhanGoc.trim().toLowerCase() === val)
    if (match) {
      mapCotTheoColIdx.set(colNumber, match)
      cotDaCo.add(match.k)
    }
  })

  // Thiếu cột bắt buộc thì báo một lỗi chung
  for (const c of cotMau) {
    const batBuocCoDinh = c.batBuoc && !c.hien && c.k !== '_tt'
    if (batBuocCoDinh && !cotDaCo.has(c.k)) {
      return {
        loiChung: `Thiếu cột ${c.nhanGoc}`,
        soDongDat: 0,
        soDongLoi: 0,
        dongDat: [],
        loi: [],
      }
    }
  }

  const existingMa = new Set(allHienTai.map(r => String(r.ma ?? '').trim().toLowerCase()).filter(Boolean))
  const seenMaInFile = new Set<string>()
  const dongDat: Row[] = []
  const allLoi: LoiDong[] = []
  let soDongLoi = 0

  const colMa = cotMau.find(c => c.k === 'ma')

  for (let rNum = 2; rNum <= ws.rowCount; rNum++) {
    const hang = ws.getRow(rNum)
    let coDuLieu = false
    mapCotTheoColIdx.forEach((_, colNumber) => {
      const cellVal = hang.getCell(colNumber).value
      if (cellVal !== null && cellVal !== undefined && String(cellVal).trim() !== '') {
        coDuLieu = true
      }
    })

    if (!coDuLieu) continue

    const rowVal: Record<string, any> = {}
    const rowLoi: LoiDong[] = []

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

      if (c.k === 'kieuDt') {
        if (!strVal) {
          rowLoi.push({ dong: rNum, cot: c.nhanGoc, lyDo: 'Chưa nhập' })
        } else if (strVal !== 'Tổ chức' && strVal !== 'Cá nhân') {
          rowLoi.push({ dong: rNum, cot: c.nhanGoc, lyDo: 'Giá trị không có trong danh sách' })
        } else {
          rowVal.kieuDt = strVal
        }
        return
      }

      if (c.k === '_tt') {
        if (!strVal) {
          rowVal._tt = 1
        } else {
          const lower = strVal.toLowerCase()
          if (['x', 'có', '1', 'true'].includes(lower)) rowVal._tt = 1
          else if (['không', '0', 'false'].includes(lower)) rowVal._tt = 0
          else rowVal._tt = 1
        }
        return
      }

      if (c.kieu === 'tich') {
        const lower = strVal.toLowerCase()
        const isTrue = ['x', 'có', '1', 'true'].includes(lower)
        rowVal[c.k] = isTrue
        return
      }

      if (c.kieu === 'tien' || c.kieu === 'so') {
        if (!strVal) {
          rowVal[c.k] = undefined
        } else {
          if (typeof raw === 'number') {
            rowVal[c.k] = raw
          } else {
            const clean = strVal.replace(/\./g, '').replace(',', '.')
            const num = Number(clean)
            if (isNaN(num)) {
              rowLoi.push({ dong: rNum, cot: c.nhanGoc, lyDo: 'Không phải số' })
            } else {
              rowVal[c.k] = num
            }
          }
        }
        return
      }

      if (c.kieu === 'chon' || c.kieu === 'chonTim') {
        if (!strVal) {
          rowVal[c.k] = ''
        } else {
          if (c.ds && c.ds.length > 0) {
            const matched = c.ds.find(item => {
              if (item.toLowerCase() === strVal.toLowerCase()) return true
              if (c.nhanDs && c.nhanDs(item).toLowerCase() === strVal.toLowerCase()) return true
              return false
            })
            if (!matched) {
              rowLoi.push({ dong: rNum, cot: c.nhanGoc, lyDo: 'Giá trị không có trong danh sách' })
            } else {
              rowVal[c.k] = matched
            }
          } else {
            rowVal[c.k] = strVal
          }
        }
        return
      }

      if (c.kieu === 'chonNhieu') {
        if (!strVal) {
          rowVal[c.k] = ''
        } else {
          const parts = strVal.split(',').map(p => p.trim()).filter(Boolean)
          if (c.ds && c.ds.length > 0) {
            const hasInvalid = parts.some(p => !c.ds!.includes(p))
            if (hasInvalid) {
              rowLoi.push({ dong: rNum, cot: c.nhanGoc, lyDo: 'Giá trị không có trong danh sách' })
            } else {
              rowVal[c.k] = parts.join(', ')
            }
          } else {
            rowVal[c.k] = parts.join(', ')
          }
        }
        return
      }

      rowVal[c.k] = strVal
    })

    // Tự điền ô phụ thuộc như form Thêm mới (nhóm ngành, tỷ lệ thuế theo ngành nghề, tồn kho theo loại)
    if (cfgDm?.doi) {
      for (const c of cotMau) {
        if (rowVal[c.k] !== undefined && rowVal[c.k] !== '') Object.assign(rowVal, cfgDm.doi(c.k, rowVal, allHienTai, s))
      }
    }

    // Kiểm tra trường bắt buộc
    for (const c of cotMau) {
      let laBatBuoc = c.batBuoc
      if (laBatBuoc && c.hien) {
        laBatBuoc = Boolean(c.hien(rowVal))
      }
      if (laBatBuoc) {
        const v = rowVal[c.k]
        if (v === undefined || v === null || v === '' || (c.kieu === 'tich' && !v)) {
          if (!rowLoi.some(l => l.cot === c.nhanGoc)) {
            rowLoi.push({ dong: rNum, cot: c.nhanGoc, lyDo: 'Chưa nhập' })
          }
        }
      }
    }

    // Kiểm tra trùng mã
    const ma = String(rowVal.ma ?? '').trim()
    if (ma) {
      const maLower = ma.toLowerCase()
      if (existingMa.has(maLower) || seenMaInFile.has(maLower)) {
        rowLoi.push({ dong: rNum, cot: colMa?.nhanGoc ?? 'Mã', lyDo: `Trùng mã ${ma}` })
      } else {
        seenMaInFile.add(maLower)
      }
    }

    // Kiểm tra lỗi riêng của danh mục
    if (cfgDm?.loi) {
      const loiRieng = cfgDm.loi(rowVal)
      if (loiRieng) {
        rowLoi.push({ dong: rNum, cot: colMa?.nhanGoc ?? 'Mã', lyDo: loiRieng })
      }
    }

    if (rowLoi.length > 0) {
      allLoi.push(...rowLoi)
      soDongLoi++
    } else {
      dongDat.push(rowVal)
    }
  }

  return {
    soDongDat: dongDat.length,
    soDongLoi,
    dongDat,
    loi: allLoi,
  }
}

export function nhapCacDongDat(
  catKey: string,
  dongDat: Row[],
  s: Session,
  set: (p: Partial<Session>) => void,
  cfgPhien?: { luu: (v: Row, s: Session) => Partial<Session> }
) {
  let curSession = { ...s }
  let accumulatedPatch: Partial<Session> = {}

  for (const dong of dongDat) {
    const rowData: Row = { ...dong }
    if (catKey === '1.16') {
      rowData.nguon = 'Thủ công'
    }
    if (catKey === '1.5' && dong.kieuDt) {
      rowData.kieuDt = dong.kieuDt
    }
    if (catKey === '1.2') {
      if (rowData.tonKho === undefined && s.goi === 'S') {
        rowData.tonKho = rowData.loai === 'Thành phẩm' ? 0 : 1
      }
    }

    addCatalogRow(catKey, rowData)

    // luu dựng patch từ session truyền vào, nên chuyền curSession qua từng dòng để patch sau giữ phần dòng trước
    if (cfgPhien?.luu) {
      const patch = cfgPhien.luu(rowData, curSession)
      accumulatedPatch = { ...accumulatedPatch, ...patch }
      curSession = { ...curSession, ...patch }
    }
  }

  if (Object.keys(accumulatedPatch).length > 0) {
    set(accumulatedPatch)
  }
}

// ── Hợp đồng T892: logic đọc, kiểm, ghi của hộp Nhập Excel danh mục ──

/** Tải dữ liệu đang có (cùng cột file mẫu) để sửa hàng loạt rồi nhập lại (T892) */
export async function taiDuLieuDm(catKey: string, tenNgan: string, s: Session, rows: Row[]): Promise<void> {
  const cotMau = layCotMauDm(catKey, s)
  if (!cotMau.length) return

  const ExcelJS = await import('exceljs')
  const Workbook = ExcelJS.Workbook ?? ExcelJS.default?.Workbook
  const wb = new Workbook()

  // Sheet 1 "Du lieu": dòng dữ liệu từ rows, không có sheet Du lieu mau (T892)
  const wsDuLieu = wb.addWorksheet('Du lieu')
  const tieuDeCacCot = cotMau.map(c => c.nhan)
  const hangTieuDe = wsDuLieu.addRow(tieuDeCacCot)
  hangTieuDe.font = { bold: true }
  hangTieuDe.eachCell((c, colNumber) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EEF7' } }
    const cotDef = cotMau[colNumber - 1]
    if (cotDef) {
      c.note = taoGhiChuCot(cotDef)
    }
  })
  wsDuLieu.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

  for (const r of rows) {
    const dongDuLieu: (string | number | null)[] = []
    for (const c of cotMau) {
      if (c.k === 'kieuDt') {
        dongDuLieu.push(r.kieuDt ?? (r.mst ? 'Tổ chức' : 'Cá nhân'))
      } else if (c.k === '_tt') {
        dongDuLieu.push(r._tt === 0 ? 'Không' : 'Có')
      } else if (c.kieu === 'tich') {
        dongDuLieu.push(r[c.k] ? 'Có' : 'Không')
      } else if (c.kieu === 'tien' || c.kieu === 'so') {
        const num = Number(r[c.k])
        dongDuLieu.push(isNaN(num) ? null : num)
      } else if (c.kieu === 'chonTim' && c.nhanDs) {
        dongDuLieu.push(r[c.k] ? c.nhanDs(String(r[c.k])) : null)
      } else {
        dongDuLieu.push(r[c.k] !== undefined && r[c.k] !== null ? r[c.k] : null)
      }
    }
    wsDuLieu.addRow(dongDuLieu)
  }

  cotMau.forEach((c, idx) => {
    const col = wsDuLieu.getColumn(idx + 1)
    col.width = c.rong
    if (c.so) col.numFmt = '#,##0'
  })

  themValidationChoSheet(wb, wsDuLieu, cotMau, Math.max(200, rows.length + 50))

  // Sheet "Huong dan"
  themSheetHuongDan(wb, cotMau)

  const tenFile = `du-lieu-${fold(tenNgan).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.xlsx`
  const buf = await wb.xlsx.writeBuffer()
  taiFile(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), tenFile)
}

function parseVaKiemTraGiaTri(
  c: CotMau,
  strVal: string,
  gt: Row,
  lyDo: string[],
  oLoi: string[]
): void {
  if (c.kieu === 'tich') {
    const lower = strVal.toLowerCase()
    gt[c.k] = ['x', 'có', '1', 'true'].includes(lower)
    return
  }

  if (c.kieu === 'tien' || c.kieu === 'so') {
    const clean = strVal.replace(/\./g, '').replace(',', '.')
    const num = Number(clean)
    if (isNaN(num)) {
      lyDo.push(`${c.nhanGoc} không phải số`)
      if (!oLoi.includes(c.k)) oLoi.push(c.k)
    } else {
      gt[c.k] = num
    }
    return
  }

  if (c.kieu === 'kieuDt') {
    if (strVal !== 'Tổ chức' && strVal !== 'Cá nhân') {
      lyDo.push(`${c.nhanGoc} "${strVal}" không có trong danh sách`)
      if (!oLoi.includes(c.k)) oLoi.push(c.k)
    } else {
      gt.kieuDt = strVal
    }
    return
  }

  if (c.kieu === 'chon' || c.kieu === 'chonTim') {
    if (c.ds && c.ds.length > 0) {
      const matched = c.ds.find(item => {
        if (item.toLowerCase() === strVal.toLowerCase()) return true
        if (c.nhanDs && c.nhanDs(item).toLowerCase() === strVal.toLowerCase()) return true
        return false
      })
      if (!matched) {
        lyDo.push(`${c.nhanGoc} "${strVal}" không có trong danh sách`)
        if (!oLoi.includes(c.k)) oLoi.push(c.k)
      } else {
        gt[c.k] = matched
      }
    } else {
      gt[c.k] = strVal
    }
    return
  }

  if (c.kieu === 'chonNhieu') {
    const parts = strVal.split(',').map(p => p.trim()).filter(Boolean)
    // Chọn đủ danh sách thì form lưu "Tất cả" (T144)
    if (strVal.trim().toLowerCase() === 'tất cả') {
      gt[c.k] = 'Tất cả'
    } else if (c.ds && c.ds.length > 0) {
      const invalid = parts.filter(p => !c.ds!.some(item => {
        if (item.toLowerCase() === p.toLowerCase()) return true
        if (c.nhanDs && c.nhanDs(item).toLowerCase() === p.toLowerCase()) return true
        return false
      }))
      if (invalid.length > 0) {
        for (const inv of invalid) {
          lyDo.push(`${c.nhanGoc} "${inv}" không có trong danh sách`)
        }
        if (!oLoi.includes(c.k)) oLoi.push(c.k)
      } else {
        gt[c.k] = parts.join(', ')
      }
    } else {
      gt[c.k] = parts.join(', ')
    }
    return
  }

  gt[c.k] = strVal
}

/** Đọc, kiểm file: xếp từng dòng vào thêm mới, cập nhật, lỗi (T892) */
export async function kiemFileNhapDm(
  file: File,
  catKey: string,
  s: Session,
  all: Row[]
): Promise<KetQuaKiem> {
  const cotMau = layCotMauDm(catKey, s)
  const nhomCot = layNhomCotDm(cotMau, catKey)
  const cfgDm = TRUONG_DM[catKey]
  const truongMap = layTruongDmDef(catKey)

  // File .xls chưa đọc được (T892)
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

  const ws = wb.worksheets[0]
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
    const match = cotMau.find(c => c.nhanGoc.trim().toLowerCase() === val)
    if (match) {
      mapCotTheoColIdx.set(colNumber, match)
      cotDaCo.add(match.k)
    }
  })

  // Thiếu cột bắt buộc thì báo một lỗi chung (T892)
  for (const c of cotMau) {
    const batBuocCoDinh = c.batBuoc && !c.hien && c.k !== '_tt'
    if (batBuocCoDinh && !cotDaCo.has(c.k)) {
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

  interface HangDoc {
    rNum: number
    hang: any
  }
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
    if (coDuLieu) {
      hangCoDuLieu.push({ rNum, hang })
    }
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

  const allMap = new Map<string, Row>()
  for (const r of all) {
    if (r.ma) {
      allMap.set(String(r.ma).trim().toLowerCase(), r)
    }
  }

  const seenMaInFile = new Map<string, number>()
  const cacDongDaSinhTruoc: Row[] = []
  const dsDongKiem: DongKiem[] = []

  for (const { rNum, hang } of hangCoDuLieu) {
    const chu: Record<string, string> = {}
    for (const c of cotMau) {
      chu[c.k] = ''
    }

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
    let maSinh = false

    const maRaw = (chu['ma'] ?? '').trim()
    let dongCu: Row | undefined = undefined
    let maChot = ''

    if (!maRaw) {
      // Mã trống: tự sinh mã kế tiếp, luôn là thêm mới (T892)
      maSinh = true
      const formValTam: Row = {}
      for (const c of cotMau) {
        if (chu[c.k]) formValTam[c.k] = chu[c.k]
      }
      maChot = sinhMaKeTiep(catKey, formValTam, [...all, ...cacDongDaSinhTruoc])
      cacDongDaSinhTruoc.push({ ma: maChot, ...formValTam })
    } else {
      const maLower = maRaw.toLowerCase()
      dongCu = allMap.get(maLower)
      maChot = maRaw

      // Mã trùng giữa 2 dòng trong file: dòng sau lỗi (T892)
      if (seenMaInFile.has(maLower)) {
        const dongTruoc = seenMaInFile.get(maLower)!
        lyDo.push(`Mã trùng dòng ${dongTruoc} trong file`)
        if (!oLoi.includes('ma')) oLoi.push('ma')
      } else {
        seenMaInFile.set(maLower, rNum)
      }
    }

    const laDongSua = Boolean(dongCu)
    const gt: Row = { ma: maChot }

    for (const c of cotMau) {
      if (c.k === 'ma') continue

      const strVal = chu[c.k] ?? ''
      const coGiaTri = strVal !== ''
      const tDef = truongMap.get(c.k)

      // Ô bị khoá ở dòng sửa (T892)
      let biKhoa = false
      if (laDongSua && dongCu) {
        if (tDef) {
          if (tDef.chiDoc === true) {
            biKhoa = true
          } else if (typeof tDef.chiDoc === 'function' && tDef.chiDoc(dongCu, s)) {
            biKhoa = true
          }
        }
        if (cfgDm?.chiSua) {
          const apDung = !cfgDm.chiSuaKhi || cfgDm.chiSuaKhi(dongCu)
          if (apDung && !cfgDm.chiSua.includes(c.k)) {
            biKhoa = true
          }
        }
      }

      if (laDongSua && dongCu) {
        if (biKhoa) {
          // Ô khoá: giữ cũ; có giá trị khác cũ: lỗi "<Nhãn> không sửa được" (T892)
          if (!coGiaTri) {
            gt[c.k] = dongCu[c.k]
          } else {
            let khac = false
            if (c.kieu === 'tien' || c.kieu === 'so') {
              const numParsed = Number(strVal.replace(/\./g, '').replace(',', '.'))
              khac = isNaN(numParsed) || numParsed !== Number(dongCu[c.k])
            } else if (c.k === '_tt') {
              // _tt kiểu tích nhưng thiếu giá trị là đang sử dụng, nên xét trước nhánh tích
              const ttParsed = ['không', '0', 'false'].includes(strVal.toLowerCase()) ? 0 : 1
              khac = ttParsed !== (dongCu._tt === 0 ? 0 : 1)
            } else if (c.kieu === 'tich') {
              const boolParsed = ['x', 'có', '1', 'true'].includes(strVal.toLowerCase())
              khac = boolParsed !== Boolean(dongCu[c.k])
            } else {
              khac = strVal.trim() !== String(dongCu[c.k] ?? '').trim()
            }

            if (khac) {
              lyDo.push(`${c.nhanGoc} không sửa được`)
              if (!oLoi.includes(c.k)) oLoi.push(c.k)
            }
            gt[c.k] = dongCu[c.k]
          }
        } else {
          // Ô không bị khoá ở dòng sửa
          if (c.k === '_tt') {
            if (!coGiaTri) {
              gt._tt = dongCu._tt
            } else {
              const lower = strVal.toLowerCase()
              gt._tt = ['không', '0', 'false'].includes(lower) ? 0 : 1
            }
          } else if (c.batBuoc && !coGiaTri) {
            // Ô bắt buộc giữ cũ khi để trống ở dòng sửa (T892)
            gt[c.k] = dongCu[c.k]
          } else if (!coGiaTri) {
            // Ô cho phép trống xoá trắng, tích trống bỏ tích (T892)
            if (c.kieu === 'tich') {
              gt[c.k] = false
            } else if (c.kieu === 'tien' || c.kieu === 'so') {
              gt[c.k] = undefined
            } else {
              gt[c.k] = ''
            }
          } else {
            parseVaKiemTraGiaTri(c, strVal, gt, lyDo, oLoi)
          }
        }
      } else {
        // Dòng thêm mới
        if (c.k === '_tt') {
          if (!coGiaTri) {
            gt._tt = 1
          } else {
            const lower = strVal.toLowerCase()
            gt._tt = ['không', '0', 'false'].includes(lower) ? 0 : 1
          }
        } else if (c.k === 'kieuDt') {
          if (!coGiaTri) {
            lyDo.push(`${c.nhanGoc} chưa nhập`)
            if (!oLoi.includes(c.k)) oLoi.push(c.k)
          } else if (strVal !== 'Tổ chức' && strVal !== 'Cá nhân') {
            lyDo.push(`${c.nhanGoc} "${strVal}" không có trong danh sách`)
            if (!oLoi.includes(c.k)) oLoi.push(c.k)
          } else {
            gt.kieuDt = strVal
          }
        } else {
          let laBatBuoc = c.batBuoc
          if (laBatBuoc && c.hien) {
            laBatBuoc = Boolean(c.hien(gt))
          }

          if (laBatBuoc && !coGiaTri) {
            lyDo.push(`${c.nhanGoc} chưa nhập`)
            if (!oLoi.includes(c.k)) oLoi.push(c.k)
          } else if (!coGiaTri) {
            if (c.kieu === 'tich') {
              gt[c.k] = false
            } else if (c.kieu === 'tien' || c.kieu === 'so') {
              gt[c.k] = undefined
            } else {
              gt[c.k] = ''
            }
          } else {
            parseVaKiemTraGiaTri(c, strVal, gt, lyDo, oLoi)
          }
        }
      }
    }

    // Tự điền ô phụ thuộc (T892)
    if (cfgDm?.doi) {
      for (const c of cotMau) {
        if (gt[c.k] !== undefined && gt[c.k] !== '') {
          Object.assign(gt, cfgDm.doi(c.k, gt, all, s))
        }
      }
    }

    // Kiểm tra lỗi riêng của danh mục
    if (cfgDm?.loi) {
      const loiRieng = cfgDm.loi(gt)
      if (loiRieng) {
        lyDo.push(loiRieng)
        if (!oLoi.includes('ma')) oLoi.push('ma')
      }
    }

    // Tính oDoi và gộp gt cho dòng sửa (T892)
    if (laDongSua && dongCu) {
      for (const c of cotMau) {
        const vMoi = gt[c.k]
        const vCu = dongCu[c.k]
        let khac = false
        if (c.kieu === 'tien' || c.kieu === 'so') {
          const nMoi = vMoi === undefined || vMoi === null || vMoi === '' ? null : Number(vMoi)
          const nCu = vCu === undefined || vCu === null || vCu === '' ? null : Number(vCu)
          khac = nMoi !== nCu
        } else if (c.kieu === 'tich') {
          khac = Boolean(vMoi) !== Boolean(vCu)
        } else if (c.k === '_tt') {
          const tMoi = vMoi === 0 || vMoi === '0' || vMoi === false ? 0 : 1
          const tCu = vCu === 0 || vCu === '0' || vCu === false ? 0 : 1
          khac = tMoi !== tCu
        } else {
          const sMoi = vMoi === undefined || vMoi === null ? '' : String(vMoi).trim()
          const sCu = vCu === undefined || vCu === null ? '' : String(vCu).trim()
          khac = sMoi !== sCu
        }
        if (khac) {
          oDoi.push(c.k)
        }
      }
      Object.assign(gt, { ...dongCu, ...gt })
    }

    let xuLy: XuLyDong
    if (lyDo.length > 0) {
      xuLy = 'loi'
    } else {
      xuLy = laDongSua ? 'sua' : 'moi'
    }

    dsDongKiem.push({
      dong: rNum,
      xuLy,
      gt,
      chu,
      oLoi,
      oDoi,
      lyDo,
      ...(maSinh ? { maSinh: true } : {}),
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

/** Tải file chỉ gồm dòng lỗi, thêm cột Lý do lỗi cuối (T892) */
export async function taiFileLoi(catKey: string, tenNgan: string, s: Session, kq: KetQuaKiem): Promise<void> {
  const cotMau = kq.cot.length > 0 ? kq.cot : layCotMauDm(catKey, s)
  const dongLoi = kq.dong.filter(d => d.xuLy === 'loi')

  const ExcelJS = await import('exceljs')
  const Workbook = ExcelJS.Workbook ?? ExcelJS.default?.Workbook
  const wb = new Workbook()

  // Sheet 1 "Du lieu": chữ gốc chu, cột "Lý do lỗi" cuối (T892)
  const wsDuLieu = wb.addWorksheet('Du lieu')
  const tieuDeCacCot = [...cotMau.map(c => c.nhan), 'Lý do lỗi']
  const hangTieuDe = wsDuLieu.addRow(tieuDeCacCot)
  hangTieuDe.font = { bold: true }
  hangTieuDe.eachCell((c, colNumber) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EEF7' } }
    if (colNumber <= cotMau.length) {
      const cotDef = cotMau[colNumber - 1]
      if (cotDef) {
        c.note = taoGhiChuCot(cotDef)
      }
    }
  })
  wsDuLieu.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

  for (const d of dongLoi) {
    const hangLoi: string[] = []
    for (const c of cotMau) {
      hangLoi.push(d.chu[c.k] ?? '')
    }
    hangLoi.push(d.lyDo.join('. '))
    wsDuLieu.addRow(hangLoi)
  }

  cotMau.forEach((c, idx) => {
    const col = wsDuLieu.getColumn(idx + 1)
    col.width = c.rong
    if (c.so) col.numFmt = '#,##0'
  })
  wsDuLieu.getColumn(cotMau.length + 1).width = 40

  themValidationChoSheet(wb, wsDuLieu, cotMau, Math.max(200, dongLoi.length + 50))

  // Sheet "Huong dan"
  themSheetHuongDan(wb, cotMau)

  const tenFile = `loi-nhap-${fold(tenNgan).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.xlsx`
  const buf = await wb.xlsx.writeBuffer()
  taiFile(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), tenFile)
}

/** Ghi dòng thêm mới, cập nhật theo lô, báo tiến độ từng lô (T892) */
export async function nhapDm(
  catKey: string,
  kq: KetQuaKiem,
  s: Session,
  set: (p: Partial<Session>) => void,
  cfgPhien: CatalogCfg['phien'],
  baoTienDo: BaoTienDo
): Promise<KetQuaNhap> {
  const batDau = Date.now()
  const moi: DongKiem[] = []
  const sua: DongKiem[] = []
  const boQua: DongKiem[] = []

  for (const d of kq.dong) {
    if (d.xuLy === 'moi') moi.push(d)
    else if (d.xuLy === 'sua') sua.push(d)
    else boQua.push(d)
  }

  const cacDongCanGhi = [...moi, ...sua]
  const tong = cacDongCanGhi.length

  let curSession = { ...s }
  let accumulatedPatch: Partial<Session> = {}
  let daGhi = 0

  const KICH_THUOC_LO = 100
  for (let i = 0; i < tong; i += KICH_THUOC_LO) {
    const lo = cacDongCanGhi.slice(i, i + KICH_THUOC_LO)
    for (const d of lo) {
      if (d.xuLy === 'moi') {
        const rowData: Row = { ...d.gt }
        if (catKey === '1.16') {
          rowData.nguon = 'Thủ công'
        }
        if (catKey === '1.5' && d.gt.kieuDt) {
          rowData.kieuDt = d.gt.kieuDt
        }
        if (catKey === '1.2') {
          if (rowData.tonKho === undefined && s.goi === 'S') {
            rowData.tonKho = rowData.loai === 'Thành phẩm' ? 0 : 1
          }
        }
        addCatalogRow(catKey, rowData)
        if (cfgPhien?.luu) {
          const patch = cfgPhien.luu(rowData, curSession)
          accumulatedPatch = { ...accumulatedPatch, ...patch }
          curSession = { ...curSession, ...patch }
        }
      } else if (d.xuLy === 'sua') {
        ghiDeCatalogRow(catKey, String(d.gt.ma), d.gt)
        if (cfgPhien?.luu) {
          const patch = cfgPhien.luu(d.gt, curSession)
          accumulatedPatch = { ...accumulatedPatch, ...patch }
          curSession = { ...curSession, ...patch }
        }
      }
      daGhi++
      baoTienDo(daGhi, tong, d)
    }
    // Mỗi lô await 40ms để thanh tiến trình mượt (T892)
    await new Promise(r => setTimeout(r, 40))
  }

  // Tối thiểu 800ms tổng (T892)
  const thoiGianTroiQua = Date.now() - batDau
  if (thoiGianTroiQua < 800) {
    await new Promise(r => setTimeout(r, 800 - thoiGianTroiQua))
  }

  if (Object.keys(accumulatedPatch).length > 0) {
    set(accumulatedPatch)
  }

  const dsMaMoi = moi.map(d => String(d.gt.ma))
  const dsMaSua = sua.map(d => String(d.gt.ma))
  danhDauNhap(catKey, dsMaMoi, dsMaSua)

  baoTienDo(tong, tong)

  return {
    luc: new Date(),
    moi,
    sua,
    boQua,
  }
}
