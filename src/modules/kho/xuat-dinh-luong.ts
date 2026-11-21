// Dữ liệu Xuất kho định lượng (T849): sinh phiếu từ chứng từ Xuất bán POS (FABi),
// kéo nguyên vật liệu theo công thức chế biến và giá vốn bình quân.
// File dữ liệu: không import index.ts (BAY.md, vòng import)
import { useMemo } from 'react'
import { DAILY, cnTen } from '../../data/mock'
import { dmy, pad } from '../../ui/format'
import { dongCuaPhieu, soXb, theoDon } from '../ban-hang/ChungTuBanHang'
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
}

export interface DongMonXdl {
  ma: string
  ten: string
  dvt: string
  sl: number
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
  ngayTao: string
  nguoiTao: string
  nguon: string
  tong: number
  dong: DongMonXdl[]
}

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

      const monList = dongCuaPhieu(p)
      const dong: DongMonXdl[] = monList.map(m => {
        const ct = CONG_THUC_CB.find(c => c.spMa === m.ma && c.tt === 'on')
        if (!ct || !ct.nvl || ct.nvl.length === 0) {
          return {
            ma: m.ma,
            ten: m.ten,
            dvt: m.dvt,
            sl: m.sl,
            coCongThuc: false,
            tienVon: 0,
            nvl: [],
          }
        }

        const nvl: DongNvlXdl[] = ct.nvl.map(n => {
          const h = hangCua(n.ma)
          const sl = tron3(n.sl * m.sl)
          const gia = giaVonBq(n.ma, p.date) ?? h?.gia ?? 0
          const tien = Math.round(gia * sl)
          return {
            ma: n.ma,
            ten: h?.ten ?? n.ma,
            dvt: n.dvt || h?.dvt || '',
            dinhLuong: n.sl,
            sl,
            gia,
            tien,
          }
        })

        const tienVon = nvl.reduce((sum, item) => sum + item.tien, 0)
        return {
          ma: m.ma,
          ten: m.ten,
          dvt: m.dvt,
          sl: m.sl,
          coCongThuc: true,
          tienVon,
          nvl,
        }
      })

      const tong = dong.reduce((sum, m) => sum + m.tienVon, 0)

      return {
        id: posId,
        so,
        ngay: dmy(p.date),
        date: p.date,
        thang: p.date.getMonth() + 1,
        cn: cnTen(p.cn),
        ghiChu: 'Xuất kho theo định lượng món bán',
        posSo,
        posId,
        ngayTao: `${dmy(p.date)} 23:30`,
        nguoiTao: 'Hệ thống',
        nguon: 'FABi',
        tong,
        dong,
      }
    })
  }, [verGiaVon])
}
