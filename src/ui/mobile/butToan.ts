import { createElement, type FC } from 'react'
import type { VoucherCfg } from '../../modules/types'
import type { Dong } from '../generic/gen'
import { money } from '../format'
import { kieuGhiSo } from '../../app/plan'
import { tkTheoCheDo } from '../../modules/tong-hop/so-cai'
import { TAI_KHOAN } from '../../modules/danh-muc/data'
import { layButToan } from '../generic/ChungTuForm'

export interface ButToanDong {
  kieu: 'no' | 'co'
  so: string
  ten: string
  tien: number
}

// Bảng tên tài khoản của sổ cái thiếu vài tài khoản (141, 153): lấy tên trong danh mục tài khoản
export const tenTk = (so: string, cd: Parameters<typeof tkTheoCheDo>[1]) => {
  const t = tkTheoCheDo(so, cd)
  return { so: t.so, ten: t.ten || (TAI_KHOAN.find(x => x.so === t.so)?.ten ?? '') }
}

/** Tính danh sách bút toán hạch toán Nợ/Có (T233) */
export function tinhButToan(
  cfg: VoucherCfg,
  dsDong: Dong[],
  tongTien: number,
  tongCk: number,
  tongThue: number,
  doiTuong: string,
  chiNhanh: string,
  cheDo: Parameters<typeof tkTheoCheDo>[1],
  nhom: string,
  hinhThucTt?: 'congno' | 'tienmat' | 'chuyenkhoan' | string,
): ButToanDong[] {
  const kieu = kieuGhiSo(cheDo)
  const laKk = Boolean(cfg.kiemKe)
  const dcn = cfg.dieuChuyen
  const coButToan = kieu !== 'khong' && !laKk && dcn !== 'ck'
  if (!coButToan) return []

  const btDong = dsDong.filter(d => Boolean(d.tkNo && d.tkCo))
  if (btDong.length > 0) {
    return btDong.flatMap(d => {
      const soNo = String(d.tkNo)
      const soCo = String(d.tkCo)
      const tenNo = TAI_KHOAN.find(x => x.so === soNo)?.ten ?? tenTk(soNo, cheDo).ten
      const tenCo = TAI_KHOAN.find(x => x.so === soCo)?.ten ?? tenTk(soCo, cheDo).ten
      const soTien = Number(d.tien) || 0
      return [
        { kieu: 'no' as const, so: soNo, ten: tenNo, tien: soTien },
        { kieu: 'co' as const, so: soCo, ten: tenCo, tien: soTien },
      ]
    })
  }

  const tkDoiUng = hinhThucTt === 'tienmat' ? '1111' : hinhThucTt === 'chuyenkhoan' ? '1121' : (nhom === 'mua' ? '331' : '131')
  const bts = layButToan(
    cfg,
    tongTien - tongCk,
    tongThue,
    doiTuong,
    chiNhanh,
    cheDo,
    tkDoiUng,
  )
  return bts.flatMap(b => {
    const tNo = tenTk(b.no, cheDo)
    const tCo = tenTk(b.co, cheDo)
    return [
      { kieu: 'no' as const, so: tNo.so, ten: tNo.ten, tien: b.tien },
      { kieu: 'co' as const, so: tCo.so, ten: tCo.ten, tien: b.tien },
    ]
  })
}

/** Khối giao diện hiển thị Hạch toán trên điện thoại */
export const KhoiHachToan: FC<{ dsButToan: ButToanDong[] }> = ({ dsButToan }) => {
  if (dsButToan.length === 0) return null
  return createElement(
    'div',
    { className: 'm-xp-khoi-ht' },
    createElement('div', { className: 'm-xp-tieu-khoi' }, 'Hạch toán'),
    createElement(
      'div',
      { className: 'm-the-trang m-xp-the-ht' },
      createElement(
        'div',
        { className: 'm-xp-ht-ds' },
        dsButToan.map((bt, idx) =>
          createElement(
            'div',
            { key: idx, className: 'm-xp-ht-dong' },
            createElement(
              'span',
              { className: 'm-xp-ht-tk' },
              bt.kieu === 'no' ? 'Nợ ' : 'Có ',
              bt.so,
              ' ',
              createElement('i', { className: 'm-xp-ht-ten' }, bt.ten),
            ),
            createElement('span', { className: 'm-xp-ht-tien num' }, money(bt.tien)),
          ),
        ),
      ),
    ),
  )
}
