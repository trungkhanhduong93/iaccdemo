// Xuất một bảng đơn giản ra Excel (.xlsx) cho các màn tự vẽ, vd màn chi tiết mở từ trang chủ gói Free (T232).
// Dòng 1 tiêu đề, dòng 2 dòng phụ (kỳ, chi nhánh), rồi tiêu đề cột, các dòng, dòng tổng. exceljs nạp động như xuất báo cáo.
import { fold } from './format'

export interface CotXuat { t: string; so?: boolean; rong?: number }
export type ODuLieu = string | number | null | undefined

/** Tên file không dấu từ tiêu đề, vd "Chi phí NVL tháng 9/2026" thành chi-phi-nvl-thang-9-2026.xlsx */
export const tenFileXuat = (tieuDe: string) => `${fold(tieuDe).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.xlsx`

/** Tải blob về máy theo tên file */
export function taiFile(blob: Blob, tenFile: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = tenFile
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function xuatBangExcel(tieuDe: string, phu: string, cot: CotXuat[], dong: ODuLieu[][], tong?: ODuLieu[]) {
  const ExcelJS = await import('exceljs')
  const Workbook = ExcelJS.Workbook ?? ExcelJS.default?.Workbook
  const wb = new Workbook()
  const ws = wb.addWorksheet('Du lieu')
  ws.addRow([tieuDe]).font = { bold: true, size: 13 }
  if (phu) ws.addRow([phu]).font = { italic: true, color: { argb: 'FF666666' } }
  const dau = ws.addRow(cot.map(c => c.t))
  dau.font = { bold: true }
  dau.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EEF7' } } })
  dong.forEach(d => ws.addRow(d.map(v => v ?? null)))
  if (tong) ws.addRow(tong.map(v => v ?? null)).font = { bold: true }
  cot.forEach((c, i) => {
    const col = ws.getColumn(i + 1)
    col.width = c.rong ?? (c.so ? 16 : 24)
    if (c.so) col.numFmt = '#,##0'
  })
  const buf = await wb.xlsx.writeBuffer()
  taiFile(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), tenFileXuat(tieuDe))
}
