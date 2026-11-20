import { taiFile } from '../xuatBangExcel'
import { fold } from '../format'
import type { Row, CatalogCfg } from '../../modules/types'
import type { KetQuaKiem, KetQuaNhap, BaoTienDo } from './nhapDmKieu'
import type { Session } from '../../app/session'
import { TRUONG_DM, hopPp, type TruongDM, type KhoiDM, type CauHinhDM, type KieuTruong } from '../../modules/danh-muc/truong-dm'
import { addCatalogRow } from './danhMucStore'

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
    if (b.goi && !b.goi.includes('S')) continue
    if (b.cheDo && !b.cheDo.includes(s.cheDo)) continue
    if (b.pp && !hopPp(b.pp, s)) continue

    for (const t of b.truong) {
      if (t.goi && !t.goi.includes('S')) continue
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
      const ds = t.dsGoi?.S ?? t.ds

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
      })
    }
  }

  return cot
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

  // Sheet 1 "Du lieu"
  const wsDuLieu = wb.addWorksheet('Du lieu')
  const tieuDeCacCot = cotMau.map(c => c.nhan)
  const hangTieuDe = wsDuLieu.addRow(tieuDeCacCot)
  hangTieuDe.font = { bold: true }
  hangTieuDe.eachCell(c => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EEF7' } }
  })
  wsDuLieu.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

  // 2 dòng ví dụ: 2 dòng đầu danh sách đang hiện (đã lọc gói, đã gắn phien)
  for (const r of rowsViDu) {
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
    const hangViDu = wsDuLieu.addRow(dongViDu)
    hangViDu.font = { italic: true, color: { argb: 'FF888888' } }
  }

  // Độ rộng cột & định dạng số Sheet 1
  cotMau.forEach((c, idx) => {
    const col = wsDuLieu.getColumn(idx + 1)
    col.width = c.rong
    if (c.so) col.numFmt = '#,##0'
  })

  // Sheet 3 "Danh sach" (ẩn)
  let wsDs: any = null
  let cotDsIndex = 1

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

      for (let r = 2; r <= 200; r++) {
        wsDuLieu.getCell(r, idx + 1).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [formula],
        }
      }
    }
  })

  // Sheet 2 "Huong dan"
  const wsHd = wb.addWorksheet('Huong dan')
  const hangTieuDeHd = wsHd.addRow(['Cột', 'Bắt buộc', 'Kiểu', 'Giá trị hợp lệ'])
  hangTieuDeHd.font = { bold: true }
  hangTieuDeHd.eachCell(c => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EEF7' } }
  })

  const kieuHienThi = (c: CotMau) => {
    if (c.k === 'kieuDt') return 'Chọn một'
    if (c.kieu === 'chu') return 'Chữ'
    if (c.kieu === 'so') return 'Số'
    if (c.kieu === 'tien') return 'Tiền'
    if (c.kieu === 'tich') return 'Có/Không'
    if (c.kieu === 'chon' || c.kieu === 'chonTim') return 'Chọn một'
    if (c.kieu === 'chonNhieu') return 'Chọn nhiều'
    return 'Chữ'
  }

  const giaTriHopLe = (c: CotMau) => {
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

// ── Hợp đồng T892: gói 1 viết thân các hàm dưới ──

/** Tải dữ liệu đang có (cùng cột file mẫu) để sửa hàng loạt rồi nhập lại (T892) */
export async function taiDuLieuDm(_catKey: string, _tenNgan: string, _s: Session, _rows: Row[]): Promise<void> {
  throw new Error('T892: chưa làm')
}

/** Đọc, kiểm file: xếp từng dòng vào thêm mới, cập nhật, lỗi (T892) */
export async function kiemFileNhapDm(_file: File, _catKey: string, _s: Session, _all: Row[]): Promise<KetQuaKiem> {
  throw new Error('T892: chưa làm')
}

/** Tải file chỉ gồm dòng lỗi, thêm cột Lý do lỗi cuối (T892) */
export async function taiFileLoi(_catKey: string, _tenNgan: string, _s: Session, _kq: KetQuaKiem): Promise<void> {
  throw new Error('T892: chưa làm')
}

/** Ghi dòng thêm mới, cập nhật theo lô, báo tiến độ từng lô (T892) */
export async function nhapDm(
  _catKey: string, _kq: KetQuaKiem, _s: Session, _set: (p: Partial<Session>) => void,
  _cfgPhien: CatalogCfg['phien'], _baoTienDo: BaoTienDo
): Promise<KetQuaNhap> {
  throw new Error('T892: chưa làm')
}
