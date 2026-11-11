/** File PDF, XML của hoá đơn điện tử đã xuất, dùng cho nút Tải PDF, Tải XML, Chia sẻ PDF (T793).
 *  PDF: vẽ bản thể hiện lên canvas khổ A4 rồi gói ảnh vào file PDF một trang. XML: theo khung dữ liệu hoá đơn điện tử. */
import { docSoTien, money } from '../../ui/format'
import type { HdDaXuat, TtXem } from './hddt'

export const tenFileHd = (hd: HdDaXuat, duoi: 'pdf' | 'xml') => `HoaDon_${hd.mau}${hd.kyHieu}_${hd.so}.${duoi}`

// ── PDF ──
const W = 1240, H = 1754, LE = 70   // A4 ở 150 dpi

function veHd(hd: HdDaXuat, t: TtXem): HTMLCanvasElement {
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const g = cv.getContext('2d')!
  const font = `${getComputedStyle(document.body).fontFamily || 'Arial'}, Arial, sans-serif`
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H)
  const chu = (s: string, x: number, y: number, o: { co?: number; dam?: boolean; nghieng?: boolean; mau?: string; canh?: CanvasTextAlign; rong?: number } = {}) => {
    g.font = `${o.nghieng ? 'italic ' : ''}${o.dam ? '700 ' : ''}${o.co ?? 20}px ${font}`
    g.fillStyle = o.mau ?? '#1f2937'
    g.textAlign = o.canh ?? 'left'
    g.textBaseline = 'middle'
    let v = s
    if (o.rong) while (v.length > 1 && g.measureText(v).width > o.rong) v = v.slice(0, -2) + '…'
    g.fillText(v, x, y)
  }
  const ke = (x1: number, y1: number, x2: number, y2: number, mau = '#94a3b8') => { g.strokeStyle = mau; g.lineWidth = 1; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke() }
  const { k, dv, mau2, tien } = t
  const cty = k.loai === 'cty' && !t.khongLay
  const xanh = '#1e4f8a', do_ = '#c0392b'
  g.strokeStyle = xanh; g.lineWidth = 3; g.strokeRect(40, 40, W - 80, H - 80)

  // Người bán
  let y = 100
  chu(dv.ten, LE, y, { co: 24, dam: true, mau: xanh, rong: W - 2 * LE }); y += 34
  chu(`Mã số thuế: ${dv.mst.replace(/\s/g, '')}`, LE, y); y += 30
  chu(`Địa chỉ: ${dv.diaChi}`, LE, y, { rong: W - 2 * LE }); y += 26
  ke(LE, y, W - LE, y); y += 50

  // Tiêu đề, ký hiệu, số
  chu(t.tenMau.toUpperCase().replace('GTGT', 'GIÁ TRỊ GIA TĂNG'), W / 2, y, { co: 34, dam: true, mau: do_, canh: 'center' })
  chu(`Ký hiệu: ${hd.kyHieu}`, W - LE - 200, y, { co: 20 })
  y += 36
  chu('(Bản thể hiện của hoá đơn điện tử)', W / 2, y, { nghieng: true, canh: 'center' })
  chu('Số:', W - LE - 200, y); chu(hd.so, W - LE - 160, y, { co: 26, dam: true, mau: do_ })
  y += 30
  const [n, th, nam] = hd.ngay.split('/')
  chu(`Ngày ${n} tháng ${th} năm ${nam}`, W / 2, y, { nghieng: true, canh: 'center' }); y += 30
  if (hd.ma) { chu(`Mã của cơ quan thuế: ${hd.ma}`, W / 2, y, { canh: 'center', dam: true }); y += 30 }
  y += 20

  // Người mua
  const dongMua = (nhan: string, gt: string) => { chu(nhan, LE, y); chu(gt, LE + 260, y, { dam: true, rong: W - 2 * LE - 260 }); ke(LE + 250, y + 16, W - LE, y + 16, '#cbd5e1'); y += 38 }
  dongMua('Họ tên người mua hàng:', k.tenNm)
  if (cty) dongMua('Tên đơn vị:', k.tenDv.toUpperCase())
  dongMua('Mã số thuế:', cty ? k.mst : '')
  dongMua('Địa chỉ:', k.diaChi)
  dongMua('Hình thức thanh toán:', 'TM/CK      Đồng tiền: VND')
  y += 16

  // Bảng hàng
  const coTs = !mau2
  const cot = coTs ? [70, 380, 120, 110, 150, 90, 180] : [70, 470, 120, 110, 150, 180]
  const tieuCot = ['STT', 'Tên hàng hoá, dịch vụ', 'Đơn vị tính', 'Số lượng', 'Đơn giá', ...(coTs ? ['Thuế suất'] : []), 'Thành tiền']
  const xCot = cot.reduce<number[]>((a, w) => [...a, a[a.length - 1] + w], [LE])
  const dongBang = (o: string[], cao: number, ki: { dam?: boolean; nghieng?: boolean; nen?: string } = {}) => {
    if (ki.nen) { g.fillStyle = ki.nen; g.fillRect(LE, y, W - 2 * LE, cao) }
    o.forEach((s, i) => {
      if (!s) return
      const so = i >= 3 && i !== (coTs ? 5 : -1)
      const giua = i === 0 || i === 2 || (coTs && i === 5) || ki.dam
      chu(s, so && !ki.dam ? xCot[i + 1] - 10 : giua ? (xCot[i] + xCot[i + 1]) / 2 : xCot[i] + 10, y + cao / 2,
        { canh: so && !ki.dam ? 'right' : giua ? 'center' : 'left', dam: ki.dam, nghieng: ki.nghieng, rong: cot[i] - 16, co: 19 })
    })
    xCot.forEach(x => ke(x, y, x, y + cao, '#64748b'))
    ke(LE, y + cao, W - LE, y + cao, '#64748b')
    y += cao
  }
  ke(LE, y, W - LE, y, '#64748b')
  dongBang(tieuCot, 44, { dam: true, nen: '#eef2f7' })
  t.dong.forEach((d, i) => dongBang([String(i + 1), d.ten, d.dvt, money(d.sl), money(d.gia), ...(coTs ? [`${d.ts}%`] : []), money(d.tien)], 38))
  const them = (ten: string, tien: string) => dongBang([String(t.dong.length + 1), ten, '', '', '', ...(coTs ? [''] : []), tien], 38, {})
  if (t.giamCk > 0) them('Chiết khấu thương mại', `-${money(t.giamCk)}`)
  if (t.phiDv > 0) them('Phí dịch vụ', money(t.phiDv))

  // Tổng
  const tong = (nhan: string, gt: string, dam = false) => {
    chu(nhan, xCot[xCot.length - 2] - 14, y + 19, { canh: 'right', dam })
    chu(gt, W - LE - 10, y + 19, { canh: 'right', dam: true })
    ke(LE, y + 38, W - LE, y + 38, '#cbd5e1'); y += 38
  }
  y += 8
  tong('Cộng tiền hàng:', money(t.congHang))
  if (mau2) tong('Giảm trừ thuế (20% mức tỷ lệ % để tính thuế GTGT):', `-${money(t.giamTru)}`)
  else tong(`Thuế suất GTGT: ${t.ts}%    Tiền thuế GTGT:`, money(tien.thue))
  tong('Tổng tiền thanh toán:', money(tien.tong), true)
  y += 12
  chu(`Số tiền viết bằng chữ: ${docSoTien(tien.tong)}.`, LE, y, { nghieng: true, rong: W - 2 * LE }); y += 70

  // Chữ ký
  chu('NGƯỜI MUA HÀNG', LE + 180, y, { dam: true, canh: 'center' })
  chu('NGƯỜI BÁN HÀNG', W - LE - 220, y, { dam: true, canh: 'center' }); y += 28
  chu('(Chữ ký số (nếu có))', LE + 180, y, { nghieng: true, canh: 'center' })
  chu('(Chữ ký điện tử, chữ ký số)', W - LE - 220, y, { nghieng: true, canh: 'center' }); y += 30
  g.strokeStyle = '#16a34a'; g.lineWidth = 2; g.strokeRect(W - LE - 400, y, 360, 100)
  chu('Signature Valid', W - LE - 385, y + 24, { dam: true, mau: '#16a34a' })
  chu(`Ký bởi: ${dv.ten.toUpperCase()}`, W - LE - 385, y + 52, { co: 16, mau: '#16a34a', rong: 340 })
  chu(`Ký ngày: ${hd.ngay}`, W - LE - 385, y + 78, { co: 16, mau: '#16a34a' })

  chu(hd.traCuu ? `Mã tra cứu: ${hd.traCuu}` : '', W / 2, H - 110, { canh: 'center' })
  chu('(Cần kiểm tra, đối chiếu khi lập, giao, nhận hoá đơn)', W / 2, H - 80, { nghieng: true, canh: 'center', co: 17 })
  return cv
}

/** Gói một ảnh JPEG thành file PDF một trang A4 */
function pdfTuJpeg(jpeg: Uint8Array, rong: number, cao: number): Blob {
  const ma = new TextEncoder()
  const phan: Uint8Array[] = []
  const viTri: number[] = []
  let dai = 0
  const them = (b: Uint8Array | string) => { const u = typeof b === 'string' ? ma.encode(b) : b; phan.push(u); dai += u.length }
  const noiDung = 'q 595.28 0 0 841.89 0 0 cm /Im0 Do Q'
  them('%PDF-1.4\n')
  const doiTuong = (so: number, than: string) => { viTri[so] = dai; them(`${so} 0 obj\n${than}\nendobj\n`) }
  doiTuong(1, '<< /Type /Catalog /Pages 2 0 R >>')
  doiTuong(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  doiTuong(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>')
  viTri[4] = dai
  them(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${rong} /Height ${cao} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`)
  them(jpeg)
  them('\nendstream\nendobj\n')
  doiTuong(5, `<< /Length ${noiDung.length} >>\nstream\n${noiDung}\nendstream`)
  const xref = dai
  them(`xref\n0 6\n0000000000 65535 f \n${viTri.slice(1).map(v => `${String(v).padStart(10, '0')} 00000 n \n`).join('')}`)
  them(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`)
  return new Blob(phan as BlobPart[], { type: 'application/pdf' })
}

export function pdfHd(hd: HdDaXuat, t: TtXem): Blob {
  const cv = veHd(hd, t)
  const b64 = cv.toDataURL('image/jpeg', 0.9).split(',')[1]
  const nhi = atob(b64)
  const jpeg = new Uint8Array(nhi.length)
  for (let i = 0; i < nhi.length; i++) jpeg[i] = nhi.charCodeAt(i)
  return pdfTuJpeg(jpeg, W, H)
}

// ── XML ──
const xa = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const the = (ten: string, v: unknown) => `<${ten}>${xa(v)}</${ten}>`

export function xmlHd(hd: HdDaXuat, t: TtXem): Blob {
  const { k, dv, mau2, tien } = t
  const cty = k.loai === 'cty' && !t.khongLay
  const [n, th, nam] = hd.ngay.split('/')
  const hang = t.dong.map((d, i) => `      <HHDVu>${the('TChat', 1)}${the('STT', i + 1)}${the('THHDVu', d.ten)}${the('DVTinh', d.dvt)}${the('SLuong', d.sl)}${the('DGia', d.gia)}${mau2 ? '' : the('TSuat', `${d.ts}%`)}${the('ThTien', d.tien)}</HHDVu>`)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<HDon>
  <DLHDon Id="data">
    <TTChung>${the('PBan', '2.1.0')}${the('THDon', t.tenMau)}${the('KHMSHDon', hd.mau)}${the('KHHDon', hd.kyHieu)}${the('SHDon', hd.so)}${the('NLap', `${nam}-${th}-${n}`)}${the('DVTTe', 'VND')}${the('HTTToan', 'TM/CK')}</TTChung>
    <NDHDon>
      <NBan>${the('Ten', dv.ten)}${the('MST', dv.mst.replace(/\s/g, ''))}${the('DChi', dv.diaChi)}</NBan>
      <NMua>${the('Ten', cty ? k.tenDv : '')}${the('MST', cty ? k.mst : '')}${the('DChi', k.diaChi)}${the('HVTNMHang', k.tenNm)}${cty ? the('MDVQHNSach', k.maQhns) : the('CCCDan', k.cccd)}</NMua>
      <DSHHDVu>
${hang.join('\n')}
      </DSHHDVu>
      <TToan>${the('TgTCThue', t.congHang)}${the('TgTThue', mau2 ? 0 : tien.thue)}${mau2 ? the('TGTTGiam', t.giamTru) : ''}${the('TTCKTMai', t.giamCk)}${the('TgTTTBSo', tien.tong)}${the('TgTTTBChu', docSoTien(tien.tong))}</TToan>
    </NDHDon>
  </DLHDon>
${hd.ma ? `  ${the('MCCQT', hd.ma)}\n` : ''}</HDon>
`
  return new Blob([xml], { type: 'application/xml' })
}
