// Xuất, nhập Excel bảng giá thành món nhập tay (T232). exceljs nạp động như xuất báo cáo.
// File xuất dùng làm mẫu nhập: điền cột Giá thành rồi nhập lại; dòng nhận theo cột Mã món.
import { taiFile } from '../../ui/xuatBangExcel'

export interface DongGiaThanh { ma: string; ten: string; dvt: string; sl: number; gia?: number }

async function soBang() {
  const ExcelJS = await import('exceljs')
  return ExcelJS.Workbook ?? ExcelJS.default?.Workbook
}

const COT = ['Mã món', 'Tên món', 'ĐVT', 'Số lượng bán', 'Giá thành', 'Thành tiền']

export async function xuatGiaThanh(tenFile: string, tieuDe: string, ds: DongGiaThanh[]) {
  const Workbook = await soBang()
  const wb = new Workbook()
  const ws = wb.addWorksheet('Gia thanh')
  ws.addRow([tieuDe]).font = { bold: true, size: 13 }
  ws.addRow(['Điền cột Giá thành rồi nhập lại file này. Không đổi cột Mã món.']).font = { italic: true, color: { argb: 'FF666666' } }
  const dau = ws.addRow(COT)
  dau.font = { bold: true }
  dau.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EEF7' } } })
  ds.forEach((m, i) => {
    const r = ws.addRow([m.ma, m.ten, m.dvt, m.sl, m.gia ?? null, null])
    const so = 4 + i
    r.getCell(6).value = { formula: `D${so}*E${so}`, result: m.gia === undefined ? 0 : m.sl * m.gia }
  })
  ws.columns.forEach((c, i) => { c.width = [12, 30, 8, 14, 14, 16][i] })
  ;[4, 5, 6].forEach(k => { ws.getColumn(k).numFmt = '#,##0' })
  const buf = await wb.xlsx.writeBuffer()
  taiFile(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), tenFile)
}

/** Đọc file Excel: tìm dòng tiêu đề có cột Mã món và Giá thành, trả về giá thành theo mã món (ô trống bỏ qua) */
export async function docGiaThanh(file: File): Promise<Map<string, number>> {
  const Workbook = await soBang()
  const wb = new Workbook()
  await wb.xlsx.load(await file.arrayBuffer())
  const ws = wb.worksheets[0]
  const kq = new Map<string, number>()
  if (!ws) return kq
  const giaTri = (v: unknown): unknown => (v && typeof v === 'object' && 'result' in v) ? (v as { result: unknown }).result : v
  let cotMa = 0, cotGia = 0
  ws.eachRow(row => {
    if (!cotMa) {
      row.eachCell((c, i) => {
        const t = String(giaTri(c.value) ?? '').trim().toLowerCase()
        if (t === 'mã món') cotMa = i
        if (t === 'giá thành') cotGia = i
      })
      if (!cotGia) cotMa = 0
      return
    }
    const ma = String(giaTri(row.getCell(cotMa).value) ?? '').trim()
    const g = giaTri(row.getCell(cotGia).value)
    const so = typeof g === 'number' ? g : Number(String(g ?? '').replace(/[^\d]/g, ''))
    if (ma && g !== null && g !== undefined && String(g).trim() !== '' && Number.isFinite(so) && so >= 0) kq.set(ma, Math.round(so))
  })
  return kq
}
