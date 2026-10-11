// Sinh cột bổ sung từ cấu hình trường form danh mục (T148)
import type { Col, Row } from '../../modules/types'
import type { CauHinhDM } from '../../modules/danh-muc/truong-dm'
import type { Goi } from '../../app/plan'
import type { CheDo } from '../../app/che-do'

/** Sinh các cột bổ sung từ trường form truong-dm, lọc theo gói và thông tư, mặc định ẩn (T148) */
export function sinhCotBoSung(cols: Col[], cauHinh: CauHinhDM | undefined, goi: Goi, cheDo: CheDo): Col[] {
  if (!cauHinh?.khoi) return []
  const daCo = new Set(cols.map(c => c.k))
  // Bỏ khối có goi/cheDo không khớp session
  const khoiHopLe = cauHinh.khoi.filter(kh => (!kh.goi || kh.goi.includes(goi)) && (!kh.cheDo || kh.cheDo.includes(cheDo)))
  // Bỏ trường có goi/cheDo không khớp session
  const truongHopLe = khoiHopLe.flatMap(kh => kh.truong).filter(tr => (!tr.goi || tr.goi.includes(goi)) && (!tr.cheDo || tr.cheDo.includes(cheDo)))

  const them: Col[] = []
  for (const tr of truongHopLe) {
    if (tr.k.startsWith('_') || daCo.has(tr.k)) continue
    daCo.add(tr.k)
    them.push({
      k: tr.k,
      t: tr.nhan,
      an: true, // Mặc định ẩn theo cơ chế của useCotDs (khoá iacc-cot-hien, T92)
      cls: tr.cot ? undefined : 'dim',
      num: tr.kieu === 'tien' || tr.kieu === 'so',
      c: tr.kieu === 'tich' || tr.kieu === 'ngay',
      r: (row: Row) => {
        const v = row[tr.k]
        if (v === undefined || v === null || v === '') return '—'
        if (tr.kieu === 'tien' && typeof v === 'number') return v.toLocaleString('vi-VN')
        if (tr.kieu === 'tich') return v ? 'Có' : 'Không'
        return String(v)
      },
    })
  }
  return them
}
