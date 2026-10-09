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

type LoaiCot = 'stt' | 'ngay' | 'ma_ct_tk' | 'soluong_dongia' | 'tien' | 'chudai'

function phanLoaiCot(c: Col): LoaiCot {
  const k = c.k.toLowerCase()
  const t = c.t.toLowerCase().trim()

  // 1. STT
  if (k === 'stt' || /^stt\b/i.test(t)) return 'stt'

  // 2. Ngày
  if (!c.num && (k.includes('ngay') || /\bngày\b/i.test(t))) return 'ngay'

  // 3. Số lượng, đơn giá, ĐVT
  if (c.num && (k.startsWith('sl') || k === 'gia' || k === 'dongia' || /số lượng|đơn giá/i.test(t))) {
    return 'soluong_dongia'
  }
  if (!c.num && (k === 'dvt' || /\bđvt\b/i.test(t))) {
    return 'soluong_dongia'
  }

  // 4. Cột số tiền (num)
  if (c.num) return 'tien'

  // Tiêu đề bắt đầu bằng Tên, Diễn giải… là cột chữ dài, kể cả khi có chữ "tài khoản" (vd Tên tài khoản)
  if (/^(tên|diễn giải|nội dung|lý do|ghi chú)/i.test(t)) return 'chudai'

  // 5. Mã, số chứng từ, số hiệu TK
  if (c.cls === 'code' || k.includes('ma') || /\bmã\b/i.test(t)) return 'ma_ct_tk'
  if (['so', 'thu', 'chi', 'soct', 'sophieu', 'shd', 'sohoadon'].includes(k) || /số\s+(chứng từ|phiếu|hoá đơn|hđ)/i.test(t)) {
    return 'ma_ct_tk'
  }
  if (['tk', 'sotk', 'tkno', 'tkco', 'tkdu', 'tkdoiung'].includes(k) || /tài khoản|số hiệu tk|tk đối ứng|tk nợ|tk có/i.test(t)) {
    return 'ma_ct_tk'
  }

  // 6. Cột chữ dài
  return 'chudai'
}

function trongSoMacDinh(loai: LoaiCot, kho: Kho): number {
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
    case 'chudai':
      return 20
  }
}

export function chiaCot(cols: Col[], kho: Kho = 'doc', rows?: Row[]): number[] {
  if (!cols || cols.length === 0) return []
  if (cols.length === 1) return [100]

  const n = cols.length
  const tongPxVungIn = kho === 'doc' ? 700 : 1028

  // 1. Phân loại và gán trọng số cơ bản
  const loais = cols.map(phanLoaiCot)
  const weights: number[] = loais.map((l, i) => {
    const base = trongSoMacDinh(l, kho)
    const c = cols[i]
    if (c.w && c.w > 0) {
      const wPct = (c.w / tongPxVungIn) * 100
      if (wPct > base) {
        return Math.min(base * 2, wPct)
      }
    }
    return base
  })

  // 2. Chia phần còn lại cho cột chữ dài theo độ dài trung bình thực tế
  const idxChuDai = loais.map((l, i) => l === 'chudai' ? i : -1).filter(i => i >= 0)
  const idxKhac = loais.map((l, i) => l !== 'chudai' ? i : -1).filter(i => i >= 0)

  if (idxChuDai.length > 0) {
    const tongKhac = idxKhac.reduce((sum, i) => sum + weights[i], 0)
    const minChuDai = kho === 'doc' ? Math.max(20, idxChuDai.length * 12) : Math.max(18, idxChuDai.length * 10)
    let rem = 100 - tongKhac

    if (rem < minChuDai) {
      const heSoCo = (100 - minChuDai) / tongKhac
      for (const i of idxKhac) {
        weights[i] = weights[i] * heSoCo
      }
      rem = minChuDai
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
      weights[colIdx] = rem * (avgLens[k] / tongLen)
    })
  } else {
    const total = weights.reduce((a, b) => a + b, 0) || 1
    for (let i = 0; i < n; i++) {
      weights[i] = (weights[i] / total) * 100
    }
  }

  // 3. Làm tròn 1 chữ số thập phân và đảm bảo tổng chính xác 100.0%
  const res = weights.map(w => Math.round(w * 10) / 10)
  const curSum = res.reduce((a, b) => a + b, 0)
  const diff = Math.round((100 - curSum) * 10) / 10

  if (diff !== 0) {
    let maxIdx = 0
    for (let i = 1; i < res.length; i++) {
      if (res[i] > res[maxIdx]) maxIdx = i
    }
    res[maxIdx] = Math.round((res[maxIdx] + diff) * 10) / 10
  }

  return res
}
