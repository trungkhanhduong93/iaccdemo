// Bộ xuất dữ liệu báo cáo: Excel (.xlsx), CSV, HTML, XML (T47)
import type { Col, Row } from '../../modules/types'
import { fold } from '../format'

export interface NguonXuat {
  ma?: string                // mã báo cáo, vd '2.2.1'
  tieuDe: string             // tên in trên tờ
  phu: string                // dòng kỳ dưới tiêu đề (sub)
  kyHieu?: string            // 'S04a-DNN'
  canCu?: string             // 'Ban hành theo Thông tư số …'
  cheDo: string              // 'TT133'
  dv: { ten: string; diaChi: string; mst: string }
  kho: 'doc' | 'ngang'
  bang: { cols: Col[]; rows: Row[]; kyHieuCot?: 'chuSo' | 'so' }[]   // các khối bảng trên tờ, theo thứ tự
  ky: { chucDanh: string; goiY: string; hoTen: string }[]           // ô ký đang in
  ngayLap: string            // 'Ngày 07 tháng 10 năm 2026'
  layHtml: () => string      // HTML các trang đang vẽ (để xuất HTML)
}

let nguonHienTai: NguonXuat | null = null

export function datNguonXuat(n: NguonXuat | null): void {
  nguonHienTai = n
}

export function layNguonXuat(): NguonXuat | null {
  return nguonHienTai
}

export function taoTenFile(n: NguonXuat, ext: string): string {
  const ma = n.ma ? fold(n.ma).replace(/[^a-z0-9_]/g, '_') : 'bao-cao'
  const ten = fold(n.tieuDe).replace(/[^a-z0-9_]/g, '_')
  const phu = fold(n.phu).replace(/[^a-z0-9_]/g, '_')
  let tenGop = `${ma}_${ten}_${phu}`.replace(/_+/g, '_').replace(/^_+|_+$/g, '')
  if (tenGop.length > 120) tenGop = tenGop.slice(0, 120).replace(/_+$/, '')
  return `${tenGop}.${ext}`
}

function taiBlob(blob: Blob, tenFile: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = tenFile
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function layGiaTriTho(row: Row, col: Col): string {
  const v = row[col.k]
  if (v === null || v === undefined) return ''
  if (typeof v === 'number') {
    if (v === 0 && !row._z) return ''
    return String(v)
  }
  return String(v)
}

function escapeCsv(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function xuatCsv(n: NguonXuat): Blob {
  const lines: string[] = []
  n.bang.forEach((b, bIdx) => {
    if (bIdx > 0) lines.push('')
    lines.push(b.cols.map(c => escapeCsv(c.t)).join(','))
    for (const r of b.rows) {
      lines.push(b.cols.map(c => escapeCsv(layGiaTriTho(r, c))).join(','))
    }
  })
  const content = '\uFEFF' + lines.join('\r\n')
  return new Blob([content], { type: 'text/csv;charset=utf-8;' })
}

const CSS_HTML = `*, *:before, *:after { box-sizing: border-box; }
body {
  margin: 0;
  padding: 24px;
  background: #e9edf2;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #334155;
  -webkit-font-smoothing: antialiased;
}
.bc-trang {
  position: relative;
  background: #fff;
  margin: 0 auto 20px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, .12), 0 0 0 1px rgba(15, 23, 42, .06);
  box-sizing: border-box;
  overflow: hidden;
}
.paper { max-width: none; }
.paper-h { display: flex; justify-content: space-between; gap: 20px; font-size: 12px; color: #334155; }
.paper-h b { color: #0f172a; }
.bc-mau { max-width: 48%; text-align: center; font-size: 12px; }
.bc-cho-duyet { display: inline-block; margin-top: 4px; padding: 1px 8px; border-radius: 999px; background: #f1f5f9; color: #64748b; font-size: 10.5px; }
h2 { text-align: center; font-size: 19px; font-weight: 800; color: #0f172a; margin: 22px 0 4px; text-transform: uppercase; letter-spacing: .2px; }
.sub { text-align: center; color: #64748b; font-size: 12.5px; }
.unit { text-align: right; font-size: 12px; color: #64748b; font-style: italic; margin: 10px 0 6px; }
.bc-khoi { display: flow-root; }
.rpt { width: 100%; font-size: 11.5px; border-collapse: collapse; border: 1px solid #cfd8e4; margin-top: 4px; }
.rpt th { background: #e8edf3; font-weight: 700; color: #0f172a; padding: 5px 6px; border: 1px solid #cfd8e4; font-size: 11px; text-align: center; }
.rpt td { padding: 4px 6px; border-left: 1px solid #cfd8e4; border-right: 1px solid #cfd8e4; border-bottom: 1px solid #edf1f6; font-size: 11.5px; }
.rpt .rpt-ky-hieu th { padding: 2px 6px; font-size: 11px; font-weight: 600; font-style: italic; }
.rpt tr.b td { font-weight: 700; color: #0f172a; }
.rpt tr.t td { font-weight: 800; color: #0f172a; background: #f8fafc; border-top: 1px solid #cfd8e4; }
.rpt td.c { text-align: center; }
.rpt td.num { text-align: right; white-space: nowrap; }
.rpt td.code { white-space: nowrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
.rpt td.i1 { padding-left: 20px; }
.rpt td.i2 { padding-left: 36px; }
.bc-so-ghi { margin-top: 14px; font-size: 12.5px; line-height: 1.6; }
.bc-ngay-lap { margin-top: 14px; padding-right: 4%; text-align: right; font-size: 12.5px; font-style: italic; }
.sign { display: grid; text-align: center; margin-top: 8px; font-size: 12.5px; }
.sign b { display: block; color: #0f172a; font-weight: 700; }
.sign i { display: block; color: #64748b; font-size: 11.5px; margin-bottom: 48px; }
.bc-so-trang { position: absolute; right: 10mm; bottom: 5mm; font-size: 11px; color: #64748b; }
@media print {
  body { background: transparent; padding: 0; margin: 0; }
  .bc-trang { margin: 0 auto; box-shadow: none; break-after: page; page-break-after: always; }
  .bc-trang:last-child { break-after: auto; page-break-after: auto; }
  .chip, .bc-cho-duyet { display: none; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}`

function xuatHtml(n: NguonXuat): Blob {
  const pagesHtml = n.layHtml()
  const doc = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>${escapeXml(n.tieuDe)}${n.phu ? ` - ${escapeXml(n.phu)}` : ''}</title>
  <style>
    ${CSS_HTML}
    @page { size: A4 ${n.kho === 'ngang' ? 'landscape' : 'portrait'}; margin: 0; }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`
  return new Blob([doc], { type: 'text/html;charset=utf-8;' })
}

function xuatXml(n: NguonXuat): Blob {
  const lines: string[] = ['<?xml version="1.0" encoding="UTF-8"?>']
  const maAttr = n.ma ? ` ma="${escapeXml(n.ma)}"` : ''
  const kyHieuAttr = n.kyHieu ? ` kyHieu="${escapeXml(n.kyHieu)}"` : ''
  lines.push(`<BaoCao${maAttr} ten="${escapeXml(n.tieuDe)}" ky="${escapeXml(n.phu)}" cheDo="${escapeXml(n.cheDo)}"${kyHieuAttr}>`)
  lines.push(`  <DonVi ten="${escapeXml(n.dv.ten)}" mst="${escapeXml(n.dv.mst)}" diaChi="${escapeXml(n.dv.diaChi)}"/>`)

  n.bang.forEach((b, idx) => {
    lines.push(`  <Bang stt="${idx + 1}">`)
    b.cols.forEach(c => {
      lines.push(`    <Cot k="${escapeXml(c.k)}" ten="${escapeXml(c.t)}" kieu="${c.num ? 'so' : 'chu'}"/>`)
    })
    b.rows.forEach(r => {
      const loai = r._t ? 'tong' : r._b ? 'dam' : 'chiTiet'
      const cells = b.cols.map(c => `<O k="${escapeXml(c.k)}">${escapeXml(layGiaTriTho(r, c))}</O>`).join('')
      lines.push(`    <Dong loai="${loai}">${cells}</Dong>`)
    })
    lines.push('  </Bang>')
  })

  if (n.ky) {
    n.ky.forEach(k => {
      lines.push(`  <NguoiKy chucDanh="${escapeXml(k.chucDanh)}" hoTen="${escapeXml(k.hoTen)}"/>`)
    })
  }

  lines.push('</BaoCao>')
  return new Blob([lines.join('\n')], { type: 'application/xml;charset=utf-8;' })
}

export async function xuatFile(dinhDang: 'xlsx' | 'csv' | 'html' | 'xml', n: NguonXuat): Promise<void> {
  if (dinhDang === 'xlsx') {
    const { xuatXlsx } = await import('./xuatXlsx')
    const blob = await xuatXlsx(n)
    taiBlob(blob, taoTenFile(n, 'xlsx'))
    return
  }
  if (dinhDang === 'csv') {
    taiBlob(xuatCsv(n), taoTenFile(n, 'csv'))
    return
  }
  if (dinhDang === 'html') {
    taiBlob(xuatHtml(n), taoTenFile(n, 'html'))
    return
  }
  if (dinhDang === 'xml') {
    taiBlob(xuatXml(n), taoTenFile(n, 'xml'))
    return
  }
}
