// Chia độ rộng cột và cỡ chữ theo khổ A4 dọc, A4 ngang (T72)
import type { Col, Row } from '../../modules/types'
import type { Kho } from './ToGiay'

export function coChuTheoKho(colsCount: number, kho: Kho): number {
  if (kho === 'doc') return 10.5
  if (colsCount <= 9) return 10.5
  if (colsCount <= 12) return 10
  return 9.5
}

export function paddingTheoMatDo(colsCount: number, kho: Kho): string {
  const nhieuCot = kho === 'doc' ? colsCount >= 8 : colsCount >= 10
  return nhieuCot ? '3px 5px' : '6px 8px'
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

  // 6. Mã, số chứng từ, số hiệu TK, chi nhánh
  if (k === 'cn' || /chi nhánh/i.test(t)) return 'ma_ct_tk'
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

export function chiaCot(cols: Col[], kho: Kho = 'doc', rows?: Row[]): number[] {
  if (!cols || cols.length === 0) return []
  if (cols.length === 1) return [100]

  const n = cols.length
  const tongPxVungIn = kho === 'doc' ? 700 : 1028
  const coChu = coChuTheoKho(n, kho)
  const nhieuCot = kho === 'doc' ? n >= 8 : n >= 10
  const padH = (nhieuCot ? 5 : 8) * 2

  // Độ rộng tối thiểu ước theo từ dài nhất trong tiêu đề và kiểu cột
  const minPcts: number[] = cols.map(c => {
    const loai = phanLoaiCot(c)
    const lenTu = tuDaiNhatTrongTieuDe(c.t)
    // Chữ in hoa đậm (font-weight: 800, text-transform: uppercase).
    // Các từ tiếng Việt in hoa đậm (vd NHÁNH 5 chữ ở font 10.5px đo ~39.6px).
    // Ước ~0.95 cỡ chữ mỗi ký tự + padding ngang + viền/dung sai
    const pxTu = lenTu * coChu * 0.95 + padH + 6
    let minPx = pxTu
    if (loai === 'tyle') {
      // Đủ chỗ cho số dạng 12,5% (5 ký tự số + padding) và tiêu đề ngắt dòng theo từ
      const pxSo = 5 * coChu * 0.75 + padH + 6
      minPx = Math.max(minPx, pxSo, kho === 'doc' ? 56 : 64)
    }
    return (minPx / tongPxVungIn) * 100
  })

  // 1. Phân loại và gán trọng số cơ bản
  const loais = cols.map(phanLoaiCot)
  const weights: number[] = loais.map((l, i) => {
    const base = trongSoMacDinh(l, kho)
    const c = cols[i]
    let w = base
    if (c.w && c.w > 0) {
      const wPct = (c.w / tongPxVungIn) * 100
      if (wPct > base) {
        w = Math.min(base * 2, wPct)
      }
    }
    return Math.max(w, minPcts[i])
  })

  // 2. Chia phần còn lại cho cột chữ dài theo độ dài trung bình thực tế
  const idxChuDai = loais.map((l, i) => l === 'chudai' ? i : -1).filter(i => i >= 0)
  const idxKhac = loais.map((l, i) => l !== 'chudai' ? i : -1).filter(i => i >= 0)

  if (idxChuDai.length > 0) {
    const tongKhac = idxKhac.reduce((sum, i) => sum + weights[i], 0)
    const minChuDai = kho === 'doc' ? Math.max(20, idxChuDai.length * 12) : Math.max(18, idxChuDai.length * 10)
    let rem = 100 - tongKhac

    if (rem < minChuDai) {
      const heSoCo = (100 - minChuDai) / (tongKhac || 1)
      for (const i of idxKhac) {
        weights[i] = Math.max(minPcts[i], weights[i] * heSoCo)
      }
      const tongKhacSauCo = idxKhac.reduce((sum, i) => sum + weights[i], 0)
      rem = Math.max(idxChuDai.length * 8, 100 - tongKhacSauCo)
    }

    const avgLens = idxChuDai.map(i => {
      const c = cols[i]
      let lenSum = 0
      let count = 0
      if (rows && rows.length > 0) {
        for (const r of rows) {
          if (r._b || r._t || r._nhom) continue
          const v = r[c.k]
          if (v !== null && v !== undefined) {
            const s = String(v).trim()
            if (s.length > 0) {
              lenSum += s.length
              count++
            }
          }
        }
      }
      return count > 0 ? (lenSum / count) : Math.max(12, c.t.length)
    })

    const tongLen = avgLens.reduce((a, b) => a + b, 0) || 1
    idxChuDai.forEach((colIdx, k) => {
      weights[colIdx] = Math.max(minPcts[colIdx], rem * (avgLens[k] / tongLen))
    })
  } else {
    const total = weights.reduce((a, b) => a + b, 0) || 1
    for (let i = 0; i < n; i++) {
      weights[i] = (weights[i] / total) * 100
    }
  }

  // 2.5 Đảm bảo tuyệt đối mọi cột đều >= minPcts[i]
  for (let i = 0; i < n; i++) {
    weights[i] = Math.max(weights[i], minPcts[i])
  }

  // 3. Chuẩn hoá tổng về đúng 100.0% mà KHÔNG BAO GIỜ làm tụt dưới minPcts
  const sumMin = minPcts.reduce((a, b) => a + b, 0)
  if (sumMin <= 100) {
    // Có đủ chỗ cho minPcts: phần dôi dư (100 - sumMin) chia theo tỷ lệ phần vượt trội (weights[i] - minPcts[i])
    const extras = weights.map((w, i) => Math.max(0, w - minPcts[i]))
    const sumExtras = extras.reduce((a, b) => a + b, 0)
    const rem = 100 - sumMin
    if (sumExtras > 0.001) {
      for (let i = 0; i < n; i++) {
        weights[i] = minPcts[i] + rem * (extras[i] / sumExtras)
      }
    } else {
      const targetIndices = idxChuDai.length > 0 ? idxChuDai : Array.from({ length: n }, (_, i) => i)
      for (const i of targetIndices) {
        weights[i] += rem / targetIndices.length
      }
    }
  } else {
    for (let i = 0; i < n; i++) {
      weights[i] = (minPcts[i] / sumMin) * 100
    }
  }

  // 4. Làm tròn 1 chữ số thập phân và đảm bảo tổng chính xác 100.0%
  const res = weights.map(w => Math.round(w * 10) / 10)
  const curSum = res.reduce((a, b) => a + b, 0)
  const diff = Math.round((100 - curSum) * 10) / 10

  if (diff !== 0) {
    let targetIdx = 0
    let maxVal = -1
    for (let i = 0; i < res.length; i++) {
      if (diff < 0 && res[i] + diff < minPcts[i] - 0.05) continue
      if (res[i] > maxVal) {
        maxVal = res[i]
        targetIdx = i
      }
    }
    res[targetIdx] = Math.round((res[targetIdx] + diff) * 10) / 10
  }

  return res
}
