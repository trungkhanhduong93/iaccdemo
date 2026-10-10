// Xuất báo cáo ra định dạng Excel (.xlsx) bằng exceljs, nạp động (T47)
import type { NguonXuat } from './xuat'
import type { Col } from '../../modules/types'
import { chiaCot } from './chiaCot'

function kyHieuCac(cols: Col[], kieu: 'chuSo' | 'so'): string[] {
  let chu = 0, so = 0
  return cols.map(c => c.kyHieu ? c.kyHieu : (kieu === 'chuSo' && !c.num ? String.fromCharCode(65 + chu++) : String(++so)))
}

export async function xuatXlsx(n: NguonXuat): Promise<Blob> {
  const ExcelJS = await import('exceljs')
  const Workbook = ExcelJS.Workbook ?? ExcelJS.default?.Workbook
  const wb = new Workbook()

  const sheetName = (n.ma || 'BaoCao').replace(/[\\/?*[\]:]/g, '_').slice(0, 31)
  const ws = wb.addWorksheet(sheetName, {
    pageSetup: {
      paperSize: 9, // A4
      orientation: n.kho === 'ngang' ? 'landscape' : 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.6,
        right: 0.4,
        top: 0.5,
        bottom: 0.5,
        header: 0.3,
        footer: 0.3,
      },
    },
  })

  const maxCols = Math.max(4, ...n.bang.map(b => b.cols.length))
  const colPhai = Math.max(2, maxCols - 2)

  // Khung mẫu: hàng 1-3
  // Hàng 1
  ws.getCell('A1').value = `Đơn vị: ${n.dv.ten}`
  ws.getCell('A1').font = { bold: true, size: 10 }
  if (n.kyHieu) {
    ws.mergeCells(1, colPhai, 1, maxCols)
    const oMau = ws.getCell(1, colPhai)
    oMau.value = `Mẫu số ${n.kyHieu}`
    oMau.font = { bold: true, size: 10 }
    oMau.alignment = { horizontal: 'center', vertical: 'middle' }
  }

  // Hàng 2
  ws.getCell('A2').value = `Địa chỉ: ${n.dv.diaChi}`
  ws.getCell('A2').font = { size: 10 }
  if (n.kyHieu && n.canCu) {
    ws.mergeCells(2, colPhai, 2, maxCols)
    const oCanCu = ws.getCell(2, colPhai)
    oCanCu.value = `(${n.canCu})`
    oCanCu.font = { italic: true, size: 9 }
    oCanCu.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  }

  // Hàng 3
  ws.getCell('A3').value = `MST: ${n.dv.mst}`
  ws.getCell('A3').font = { size: 10 }

  // Hàng 5: Tiêu đề báo cáo
  ws.mergeCells(5, 1, 5, maxCols)
  const oTieuDe = ws.getCell('A5')
  oTieuDe.value = n.tieuDe.toUpperCase()
  oTieuDe.font = { bold: true, size: 14 }
  oTieuDe.alignment = { horizontal: 'center', vertical: 'middle' }

  // Hàng 6: Dòng kỳ phụ
  ws.mergeCells(6, 1, 6, maxCols)
  const oPhu = ws.getCell('A6')
  oPhu.value = n.phu
  oPhu.font = { italic: true, size: 10 }
  oPhu.alignment = { horizontal: 'center', vertical: 'middle' }

  // Hàng 7: Đơn vị tính
  ws.mergeCells(7, 1, 7, maxCols)
  const oDvt = ws.getCell('A7')
  oDvt.value = 'Đơn vị tính: đồng'
  oDvt.font = { italic: true, size: 10 }
  oDvt.alignment = { horizontal: 'right', vertical: 'middle' }

  const borderThin = {
    top: { style: 'thin' as const, color: { argb: 'FFCFD8E4' } },
    left: { style: 'thin' as const, color: { argb: 'FFCFD8E4' } },
    bottom: { style: 'thin' as const, color: { argb: 'FFCFD8E4' } },
    right: { style: 'thin' as const, color: { argb: 'FFCFD8E4' } },
  }

  let curRow = 8
  let freezeDone = false

  // Vẽ các khối bảng
  for (let bIdx = 0; bIdx < n.bang.length; bIdx++) {
    const b = n.bang[bIdx]
    if (bIdx > 0) curRow++ // Hàng trống giữa các bảng

    const hangTieuDeBang = curRow
    const rHead = ws.getRow(curRow)
    b.cols.forEach((c, idx) => {
      const cell = rHead.getCell(idx + 1)
      cell.value = c.nhom ? `${c.nhom} - ${c.t}` : c.t
      cell.font = { bold: true, size: 10 }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EDF3' } }
      cell.border = borderThin
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    })
    curRow++

    let hangCuoiTieuDe = hangTieuDeBang
    if (b.kyHieuCot) {
      hangCuoiTieuDe = curRow
      const rKyHieu = ws.getRow(curRow)
      const dsKyHieu = kyHieuCac(b.cols, b.kyHieuCot)
      b.cols.forEach((_, idx) => {
        const cell = rKyHieu.getCell(idx + 1)
        cell.value = dsKyHieu[idx]
        cell.font = { italic: true, size: 9 }
        cell.border = borderThin
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
      })
      curRow++
    }

    if (!freezeDone) {
      ws.views = [{ state: 'frozen', xSplit: 0, ySplit: hangCuoiTieuDe }]
      ws.pageSetup.printTitlesRow = `${hangTieuDeBang}:${hangCuoiTieuDe}`
      freezeDone = true
    }

    // Các dòng dữ liệu
    for (const row of b.rows) {
      const rData = ws.getRow(curRow)
      b.cols.forEach((c, idx) => {
        const cell = rData.getCell(idx + 1)
        const v = row[c.k]
        cell.border = borderThin
        cell.font = { bold: !!(row._t || row._b), size: 10 }
        if (row._t) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }
        }

        if (c.num) {
          if (typeof v === 'number') {
            if (v === 0 && !row._z) cell.value = ''
            else cell.value = v
          } else if (v === null || v === undefined) {
            cell.value = ''
          } else {
            cell.value = v
          }
          cell.numFmt = '#,##0;-#,##0;""'
          cell.alignment = { horizontal: 'right', vertical: 'middle' }
        } else if (c.c) {
          cell.value = v === null || v === undefined ? '' : String(v)
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
        } else {
          cell.value = v === null || v === undefined ? '' : String(v)
          cell.alignment = {
            horizontal: 'left',
            vertical: 'middle',
            indent: row._i ? Number(row._i) : undefined,
          }
        }
      })
      curRow++
    }

    // Tính độ rộng cột theo % chiaCot (T72)
    const pt = chiaCot(b.cols, n.kho, b.rows)
    const tongKyTu = n.kho === 'ngang' ? 135 : 95
    b.cols.forEach((_, idx) => {
      const p = pt[idx] ?? (100 / b.cols.length)
      const w = Math.max(5, Math.round((p / 100) * tongKyTu * 10) / 10)
      const colObj = ws.getColumn(idx + 1)
      if (!colObj.width || w > colObj.width) {
        colObj.width = w
      }
    })
  }

  // Khối chân trang: ngày lập và ô ký
  curRow++
  if (n.ngayLap) {
    ws.mergeCells(curRow, colPhai, curRow, maxCols)
    const oNgayLap = ws.getCell(curRow, colPhai)
    oNgayLap.value = n.ngayLap
    oNgayLap.font = { italic: true, size: 10 }
    oNgayLap.alignment = { horizontal: 'right', vertical: 'middle' }
    curRow++
  }

  if (n.ky && n.ky.length > 0) {
    const kCount = n.ky.length
    const colSpans: [number, number][] = []
    const colsPerSign = Math.max(1, Math.floor(maxCols / kCount))
    for (let i = 0; i < kCount; i++) {
      const tu = i * colsPerSign + 1
      const den = i === kCount - 1 ? maxCols : (i + 1) * colsPerSign
      colSpans.push([tu, den])
    }

    const hangChucDanh = curRow
    const hangGoiY = curRow + 1
    const hangHoTen = curRow + 6 // cách 4 hàng trống

    n.ky.forEach((k, idx) => {
      const [tu, den] = colSpans[idx]
      if (tu < den) {
        ws.mergeCells(hangChucDanh, tu, hangChucDanh, den)
        ws.mergeCells(hangGoiY, tu, hangGoiY, den)
        ws.mergeCells(hangHoTen, tu, hangHoTen, den)
      }
      const oCd = ws.getCell(hangChucDanh, tu)
      oCd.value = k.chucDanh
      oCd.font = { bold: true, size: 10 }
      oCd.alignment = { horizontal: 'center', vertical: 'middle' }

      const oGy = ws.getCell(hangGoiY, tu)
      oGy.value = k.goiY
      oGy.font = { italic: true, size: 9 }
      oGy.alignment = { horizontal: 'center', vertical: 'middle' }

      const oHt = ws.getCell(hangHoTen, tu)
      oHt.value = k.hoTen
      oHt.font = { bold: true, size: 10 }
      oHt.alignment = { horizontal: 'center', vertical: 'middle' }
    })
    curRow = hangHoTen + 1
  }

  const buffer = await wb.xlsx.writeBuffer()
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}
