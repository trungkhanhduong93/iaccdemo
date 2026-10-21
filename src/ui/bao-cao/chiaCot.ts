// Chia độ rộng cột và cỡ chữ theo khổ A4 dọc, A4 ngang (T72, T594)
import type { Col, Row } from '../../modules/types'
import { money } from '../format'
import type { Kho } from './ToGiay'

export function coChuTheoKho(colsCount: number, kho: Kho): number {
  if (kho === 'doc') {
    if (colsCount <= 6) return 10.5
    if (colsCount <= 8) return 10
    if (colsCount <= 11) return 9
    return 8.5
  }
  if (colsCount <= 9) return 10.5
  if (colsCount <= 12) return 10
  if (colsCount <= 16) return 9.5
  return 8.5
}

export function paddingTheoMatDo(colsCount: number, kho: Kho): string {
  if (colsCount >= 16 && kho === 'doc') return '1px 1.5px'
  if (colsCount >= 14 && kho === 'doc') return '1px 2px'
  if (colsCount >= 14 || (kho === 'doc' && colsCount >= 9)) return '2px 4px'
  if (colsCount >= 8 || (kho === 'doc' && colsCount >= 7)) return '3px 5px'
  return '6px 8px'
}

export type LoaiCot = 'stt' | 'ngay' | 'ma_ct_tk' | 'soluong_dongia' | 'tien' | 'chudai' | 'tyle'

export function phanLoaiCot(c: Col): LoaiCot {
  const k = c.k.toLowerCase()
  const t = c.t.toLowerCase().trim()

  // 1. STT
  if (k === 'stt' || /^stt\b/i.test(t)) return 'stt'

  // 2. Ngày
  if (!c.num && (k.includes('ngay') || /\bngày\b/i.test(t))) return 'ngay'

  // 3. Tỷ lệ, phần trăm, hệ số, thuế suất
  if (
    /tỷ lệ|%|hệ số|thuế suất/i.test(t) ||
    k.includes('tyle') ||
    k.includes('pct') ||
    k === 'tl' ||
    k.includes('heso') ||
    k.includes('thuesuat')
  ) {
    return 'tyle'
  }

  // 4. Số lượng, đơn giá, ĐVT
  if (c.num && (k.startsWith('sl') || k === 'gia' || k === 'dongia' || /số lượng|đơn giá/i.test(t))) {
    return 'soluong_dongia'
  }
  if (!c.num && (k === 'dvt' || /\bđvt\b/i.test(t))) {
    return 'soluong_dongia'
  }

  // 5. Cột số tiền (num)
  if (c.num) return 'tien'

  // Tiêu đề bắt đầu bằng Tên, Diễn giải… là cột chữ dài, kể cả khi có chữ "tài khoản" (vd Tên tài khoản)
  if (/^(tên|diễn giải|nội dung|lý do|ghi chú)/i.test(t)) return 'chudai'

  // 6. Mã, số chứng từ, số hiệu TK, cửa hàng
  if (k === 'cn' || /cửa hàng/i.test(t)) return 'ma_ct_tk'
  if (c.cls === 'code' || k.includes('ma') || /\bmã\b/i.test(t)) return 'ma_ct_tk'
  if (['so', 'thu', 'chi', 'soct', 'sophieu', 'shd', 'sohoadon'].includes(k) || /số\s+(chứng từ|phiếu|hoá đơn|hđ)/i.test(t)) {
    return 'ma_ct_tk'
  }
  if (['tk', 'sotk', 'tkno', 'tkco', 'tkdu', 'tkdoiung'].includes(k) || /tài khoản|số hiệu tk|tk đối ứng|tk nợ|tk có/i.test(t)) {
    return 'ma_ct_tk'
  }

  // 7. Cột chữ dài
  return 'chudai'
}

export function trongSoMacDinh(loai: LoaiCot, kho: Kho): number {
  switch (loai) {
    case 'stt':
      return kho === 'doc' ? 4.5 : 4
    case 'ngay':
      return kho === 'doc' ? 8.5 : 8
    case 'ma_ct_tk':
      return kho === 'doc' ? 9.5 : 8.5
    case 'soluong_dongia':
      return kho === 'doc' ? 7.5 : 7
    case 'tien':
      return kho === 'doc' ? 11 : 10
    case 'tyle':
      return kho === 'doc' ? 8 : 7.5
    case 'chudai':
      return 20
  }
}

export function tuDaiNhatTrongTieuDe(t: string): number {
  if (!t) return 0
  const tuCac = t.trim().split(/\s+/)
  let max = 0
  for (const w of tuCac) {
    if (w.length > max) max = w.length
  }
  return max
}

export interface DoDaiCot {
  lenTieuDe: number
  lenData: number
  coDam: boolean
  loai: LoaiCot
  avgLen: number
}

/** Quét độ dài tối đa và trung bình của từng cột MỘT lần, độc lập với cỡ chữ (T594, BAY.md:46) */
export function trichDoDaiCot(cols: Col[], rows?: Row[]): DoDaiCot[] {
  if (!cols || cols.length === 0) return []
  return cols.map(c => {
    const loai = phanLoaiCot(c)
    const lenTieuDe = tuDaiNhatTrongTieuDe(c.t)
    let lenData = 0
    let coDam = false
    let avgLen = 0

    if (c.num) {
      if (rows && rows.length > 0) {
        for (const r of rows) {
          const v = r[c.k]
          if (typeof v === 'number' && !isNaN(v) && v !== 0) {
            const s = money(v)
            if (s.length > lenData) lenData = s.length
            if (r._t || r._b) coDam = true
          }
        }
      }
    } else if (loai === 'ngay' || c.k === 'ngay' || c.k.includes('ngay')) {
      lenData = 10
    } else if (c.cls === 'code' || loai === 'ma_ct_tk') {
      if (rows && rows.length > 0) {
        for (const r of rows) {
          if (r._t || r._nhom || r._b) continue
          const s = String(r[c.k] ?? '').trim()
          if (s.length > lenData) lenData = s.length
        }
      }
      if (lenData === 0) lenData = 8
    } else if (loai === 'stt') {
      lenData = 3
    } else if (loai === 'tyle') {
      lenData = 5
    } else {
      let lenSum = 0
      let count = 0
      if (rows && rows.length > 0) {
        for (const r of rows) {
          if (r._t || r._nhom || r._b) continue
          const s = String(r[c.k] ?? '').trim()
          const words = s.split(/\s+/)
          for (const w of words) {
            if (w.length > lenData) lenData = w.length
          }
          if (s.length > 0) {
            lenSum += s.length
            count++
          }
        }
      }
      if (lenData === 0) lenData = 4
      avgLen = count > 0 ? (lenSum / count) : Math.max(12, c.t.length)
    }

    return { lenTieuDe, lenData, coDam, loai, avgLen }
  })
}

/** Tính bề rộng tối thiểu (px) của một cột theo độ dài chuỗi đã trích trước (chỉ phép nhân, không quét rows) */
export function tinhMinPxTuDoDai(item: DoDaiCot, fs: number, padH: number, dungSai: number): number {
  const pxHeader = item.lenTieuDe * fs * 0.64 + padH + dungSai
  let pxData = 0

  if (item.loai === 'tien') {
    if (item.lenData === 0) {
      pxData = pxHeader
    } else {
      const charW = item.coDam ? fs * 0.57 : fs * 0.50
      pxData = item.lenData * charW + padH + dungSai
    }
  } else if (item.loai === 'soluong_dongia') {
    const charW = item.coDam ? fs * 0.54 : fs * 0.48
    const minNum = item.lenData > 4 ? 31 : 20
    pxData = Math.max(pxHeader, item.lenData * charW + padH + dungSai, minNum)
  } else if (item.loai === 'ngay') {
    pxData = 10 * fs * 0.56 + padH + dungSai
  } else if (item.loai === 'ma_ct_tk') {
    pxData = Math.max(pxHeader, item.lenData * fs * 0.69 + padH + dungSai)
  } else if (item.loai === 'stt') {
    pxData = 3 * fs * 0.50 + padH + dungSai
  } else if (item.loai === 'tyle') {
    pxData = 5 * fs * 0.52 + padH + dungSai
  } else {
    pxData = item.lenData * fs * 0.54 + padH + dungSai
  }

  const minSan = item.loai === 'stt' ? 20 : (padH + 10)
  return Math.max(pxHeader, pxData, minSan)
}

export function tinhMinPxCot(c: Col, kho: Kho, fs: number, padH: number, dungSai: number, rows?: Row[]): number {
  const d = trichDoDaiCot([c], rows)[0]
  return tinhMinPxTuDoDai(d, fs, padH, dungSai)
}

export function tinhCoChu(cols: Col[], kho: Kho = 'doc', rows?: Row[], coChuChonTay?: number, colLengths?: DoDaiCot[], vungInPx?: number): number {
  if (!cols || cols.length === 0) return 10.5
  const n = cols.length
  const tongPxVungIn = vungInPx ?? (kho === 'doc' ? (n >= 14 ? 726 : 700) : 1028)
  const tran = coChuChonTay ?? coChuTheoKho(n, kho)

  const lengths = colLengths ?? trichDoDaiCot(cols, rows)
  const padStr = paddingTheoMatDo(n, kho)
  const m = padStr.match(/\d+px\s+([\d.]+)px/)
  const padH = m ? Number(m[1]) * 2 : 12
  const dungSai = (n >= 16 && kho === 'doc') ? 0.5 : 1.5

  // Thử từ tran giảm dần mỗi bước 0.5px tới 8.0px (vòng lặp chỉ làm phép nhân, không quét rows)
  let fs = tran
  while (fs > 8.0) {
    let sumMin = 0
    for (const item of lengths) {
      sumMin += tinhMinPxTuDoDai(item, fs, padH, dungSai)
    }

    if (sumMin <= tongPxVungIn) {
      return fs
    }
    fs = Math.round((fs - 0.5) * 10) / 10
  }

  return 8.0
}

export function chiaCot(cols: Col[], kho: Kho = 'doc', rows?: Row[], coChuTuyChinh?: number, colLengths?: DoDaiCot[], vungInPx?: number): number[] {
  if (!cols || cols.length === 0) return []
  if (cols.length === 1) return [100]

  const n = cols.length
  const tongPxVungIn = vungInPx ?? (kho === 'doc' ? (n >= 14 ? 726 : 700) : 1028)
  const lengths = colLengths ?? trichDoDaiCot(cols, rows)
  const coChu = coChuTuyChinh ?? tinhCoChu(cols, kho, rows, undefined, lengths, tongPxVungIn)
  const padStr = paddingTheoMatDo(n, kho)
  const m = padStr.match(/\d+px\s+([\d.]+)px/)
  const padH = m ? Number(m[1]) * 2 : 12
  const dungSai = (n >= 16 && kho === 'doc') ? 0.5 : 1.5

  // Sàn tối thiểu của từng cột để số, ngày, mã không bị tràn
  const minPcts: number[] = lengths.map(item => {
    const minPx = tinhMinPxTuDoDai(item, coChu, padH, dungSai)
    return (minPx / tongPxVungIn) * 100
  })

  const loais = lengths.map(l => l.loai)
  const weights = [...minPcts]
  const sumMin = minPcts.reduce((a, b) => a + b, 0)

  if (sumMin <= 100) {
    const rem = 100 - sumMin
    // Tính phần mong muốn thêm của từng cột theo trọng số cơ bản
    const desired = cols.map((c, i) => {
      const base = trongSoMacDinh(loais[i], kho)
      let w = base
      if (c.w && c.w > 0) {
        const wPct = (c.w / tongPxVungIn) * 100
        if (wPct > base) w = Math.min(base * 2, wPct)
      }
      return Math.max(0, w - minPcts[i])
    })
    const sumDesired = desired.reduce((a, b) => a + b, 0)
    if (sumDesired > 0.001) {
      for (let i = 0; i < n; i++) {
        weights[i] += rem * (desired[i] / sumDesired)
      }
    } else {
      const idxChuDai = loais.map((l, i) => l === 'chudai' ? i : -1).filter(i => i >= 0)
      if (idxChuDai.length > 0) {
        const avgLens = idxChuDai.map(i => lengths[i].avgLen || Math.max(12, cols[i].t.length))
        const tongLen = avgLens.reduce((a, b) => a + b, 0) || 1
        idxChuDai.forEach((colIdx, k) => {
          weights[colIdx] += rem * (avgLens[k] / tongLen)
        })
      } else {
        for (let i = 0; i < n; i++) {
          weights[i] += rem / n
        }
      }
    }
  } else {
    // Trường hợp ép cỡ chữ tay quá lớn: co theo tỷ lệ minPcts
    for (let i = 0; i < n; i++) {
      weights[i] = (minPcts[i] / sumMin) * 100
    }
  }

  // Làm tròn 1 chữ số thập phân, đảm bảo tổng chính xác 100.0% và không làm cột nào tụt dưới minPcts
  const res = weights.map(w => Math.round(w * 10) / 10)
  const curSum = res.reduce((a, b) => a + b, 0)
  const diff = Math.round((100 - curSum) * 10) / 10

  if (diff !== 0) {
    let targetIdx = 0
    let maxExtra = -999
    for (let i = 0; i < res.length; i++) {
      const extra = res[i] - minPcts[i]
      if (extra > maxExtra) {
        maxExtra = extra
        targetIdx = i
      }
    }
    res[targetIdx] = Math.round((res[targetIdx] + diff) * 10) / 10
  }

  return res
}
