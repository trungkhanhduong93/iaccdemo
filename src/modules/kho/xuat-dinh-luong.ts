// Dữ liệu Xuất kho định lượng (T849): sinh phiếu từ chứng từ Xuất bán POS (FABi),
// kéo nguyên vật liệu theo công thức chế biến và giá vốn bình quân.
// File dữ liệu: không import index.ts (BAY.md, vòng import)
import { useMemo } from 'react'
import { DAILY, cnTen } from '../../data/mock'
import { dmy, pad } from '../../ui/format'
import { docNgay } from '../../ui/ChonNgay'
import { donPosCua, dongCuaPhieu, soFabi, soXb, theoDon } from '../ban-hang/ChungTuBanHang'
import { CONG_THUC_CB, hangCua, tron3 } from './san-xuat'
import { giaVonBq, useGiaVonBq } from './tinh-gia-von/giaVonBq'

export interface DongNvlXdl {
  ma: string
  ten: string
  dvt: string
  dinhLuong: number
  sl: number
  gia: number
  tien: number
  lyDo?: LyDoXdl   // chỉ lý do 5 (thiếu giá vốn): vẫn trừ NVL
}

/** Lý do món không xuất kho định lượng được (T907): 1 chưa có công thức, 2 chưa khớp mã hàng, 3 thiếu ĐVT, 4 công thức ngừng áp dụng, 5 thiếu giá vốn */
export interface LyDoXdl { loai: 1 | 2 | 3 | 4 | 5; text: string }

export interface DongMonXdl {
  ma: string
  ten: string
  dvt: string
  sl: number
  gia: number        // đơn giá bán trên phiếu POS
  tien: number       // thành tiền bán
  maCt?: string      // mã công thức chế biến đã dùng
  maFabi?: string    // mã món FABi khi khác mã danh mục
  lyDo?: LyDoXdl     // món không trừ được NVL
  coCongThuc: boolean
  tienVon: number
  nvl: DongNvlXdl[]
}

export interface PhieuXdl {
  id: string
  so: string
  ngay: string
  date: Date
  thang: number
  cn: string
  ghiChu: string
  posSo: string
  posId: string
  maHd: string
  soDon: string
  kenh: string
  ngayTao: string
  nguoiTao: string
  nguon: string
  tong: number
  dong: DongMonXdl[]
}

/** Dữ liệu mẫu (T907): FABi gửi mã món riêng chưa khớp danh mục hàng, để thấy lý do "chưa khớp mã hàng" */
const MA_FABI: Record<string, string> = { GOI01: 'GOICUON-TT' }

/** Sinh danh sách phiếu Xuất kho định lượng từ Xuất bán POS */
export function useDsPhieuXdl(): PhieuXdl[] {
  const verGiaVon = useGiaVonBq()   // tự động vẽ lại khi vừa tính giá vốn xong (5.1.7)

  return useMemo(() => {
    const posList = DAILY.filter(x => x.date.getMonth() >= 8).slice().reverse().flatMap(x => theoDon(x).reverse())

    return posList.map((p, idx): PhieuXdl => {
      const posId = String(idx)
      const posSo = soXb(p.seed)   // tham chiếu ghi số chứng từ XB của phiếu bán (T897)
      const yy = String(p.date.getFullYear()).slice(2)
      const mm = pad(p.date.getMonth() + 1)
      const so = `XDL${yy}${mm}-${pad(idx + 1, 4)}`

      const cn = cnTen(p.cn)
      const dong: DongMonXdl[] = dongCuaPhieu(p).map(m => {
        const maFabi = MA_FABI[m.ma]
        const chung = { ma: m.ma, ten: m.ten, dvt: m.dvt, sl: m.sl, gia: m.gia, tien: m.tien, maFabi }
        const loi = (lyDo: LyDoXdl, maCt?: string): DongMonXdl => ({ ...chung, maCt, lyDo, coCongThuc: false, tienVon: 0, nvl: [] })
        if (maFabi && !hangCua(maFabi)) return loi({ loai: 2, text: 'Món trên FABi chưa khớp mã hàng trong danh mục' })
        const dsCt = CONG_THUC_CB.filter(c => c.spMa === m.ma && c.nvl.length)
        if (!dsCt.length) return loi({ loai: 1, text: 'Chưa có công thức chế biến' })
        const ct = dsCt.find(c => c.tt === 'on' && docNgay(c.ngay) <= p.date && (!c.cuaHang.length || c.cuaHang.includes(cn)))
        if (!ct) {
          const c = dsCt[0]
          return loi({ loai: 4, text: c.tt !== 'on' ? `Công thức ${c.ma} đang ngừng áp dụng`
            : docNgay(c.ngay) > p.date ? `Công thức ${c.ma} áp dụng từ ${c.ngay}` : `Công thức ${c.ma} không áp dụng cho cửa hàng này` }, c.ma)
        }
        if (ct.dvt && ct.dvt !== m.dvt) return loi({ loai: 3, text: `Công thức chỉ có ĐVT ${ct.dvt}, chưa có ${m.dvt}` }, ct.ma)

        const nvl: DongNvlXdl[] = ct.nvl.map(n => {
          const h = hangCua(n.ma)
          const sl = tron3(n.sl * m.sl)
          const gia = giaVonBq(n.ma, p.date) ?? h?.gia ?? 0
          return {
            ma: n.ma,
            ten: h?.ten ?? n.ma,
            dvt: n.dvt || h?.dvt || '',
            dinhLuong: n.sl,
            sl,
            gia,
            tien: Math.round(gia * sl),
            lyDo: gia ? undefined : { loai: 5, text: 'NVL chưa có giá vốn, tiền vốn tạm ghi 0' },
          }
        })
        return { ...chung, maCt: ct.ma, coCongThuc: true, tienVon: nvl.reduce((sum, item) => sum + item.tien, 0), nvl }
      })

      const tong = dong.reduce((sum, m) => sum + m.tienVon, 0)

      return {
        id: posId,
        so,
        ngay: dmy(p.date),
        date: p.date,
        thang: p.date.getMonth() + 1,
        cn,
        ghiChu: 'Xuất kho theo định lượng món bán',
        posSo,
        posId,
        maHd: soFabi(`fabi-${p.seed}`),   // cùng mã hoá đơn với phiếu Xuất bán POS (QD114)
        soDon: donPosCua(p).soDon,
        kenh: p.kenh,
        ngayTao: `${dmy(p.date)} 23:30`,
        nguoiTao: 'Hệ thống',
        nguon: 'FABi',
        tong,
        dong,
      }
    })
  }, [verGiaVon])
}
