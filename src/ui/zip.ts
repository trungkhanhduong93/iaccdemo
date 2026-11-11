/** Gói nhiều file thành một file .zip, không nén (kiểu lưu trữ), mở được bằng Windows, WinRAR, 7-Zip (T793) */

const BANG_CRC = (() => {
  const b = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    b[n] = c >>> 0
  }
  return b
})()

function crc32(u: Uint8Array) {
  let c = 0xffffffff
  for (let i = 0; i < u.length; i++) c = BANG_CRC[(c ^ u[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

export async function taoZip(ds: { ten: string; blob: Blob }[]): Promise<Blob> {
  const ma = new TextEncoder()
  const phan: Uint8Array[] = []
  const muc: Uint8Array[] = []
  let viTri = 0
  const bay = new Date()
  const gio = (bay.getHours() << 11) | (bay.getMinutes() << 5) | (bay.getSeconds() >> 1)
  const ngay = ((bay.getFullYear() - 1980) << 9) | ((bay.getMonth() + 1) << 5) | bay.getDate()
  for (const f of ds) {
    const ten = ma.encode(f.ten)
    const du = new Uint8Array(await f.blob.arrayBuffer())
    const crc = crc32(du)
    const dau = new Uint8Array(30 + ten.length)
    const v = new DataView(dau.buffer)
    v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x0800, true)   // cờ 0x0800: tên file UTF-8
    v.setUint16(8, 0, true); v.setUint16(10, gio, true); v.setUint16(12, ngay, true)
    v.setUint32(14, crc, true); v.setUint32(18, du.length, true); v.setUint32(22, du.length, true)
    v.setUint16(26, ten.length, true); v.setUint16(28, 0, true)
    dau.set(ten, 30)
    const tt = new Uint8Array(46 + ten.length)
    const w = new DataView(tt.buffer)
    w.setUint32(0, 0x02014b50, true); w.setUint16(4, 20, true); w.setUint16(6, 20, true); w.setUint16(8, 0x0800, true)
    w.setUint16(10, 0, true); w.setUint16(12, gio, true); w.setUint16(14, ngay, true)
    w.setUint32(16, crc, true); w.setUint32(20, du.length, true); w.setUint32(24, du.length, true)
    w.setUint16(28, ten.length, true); w.setUint32(42, viTri, true)
    tt.set(ten, 46)
    phan.push(dau, du)
    muc.push(tt)
    viTri += dau.length + du.length
  }
  const coMuc = muc.reduce((a, m) => a + m.length, 0)
  const cuoi = new Uint8Array(22)
  const c = new DataView(cuoi.buffer)
  c.setUint32(0, 0x06054b50, true); c.setUint16(8, ds.length, true); c.setUint16(10, ds.length, true)
  c.setUint32(12, coMuc, true); c.setUint32(16, viTri, true)
  return new Blob([...phan, ...muc, cuoi] as BlobPart[], { type: 'application/zip' })
}
