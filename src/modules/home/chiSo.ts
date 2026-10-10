// Tính toán chỉ số sức khoẻ tài chính và số liệu tổng quan F&B
import { CHI_NHANH, DAILY, HOM_NAY, kqkd, tongKy } from '../../data/mock'
import { du, soCai } from '../tong-hop/so-cai'
import type { CheDo } from '../../app/che-do'
import { pct, short } from '../../ui/format'

export type KyBaoCao = 'thang-nay' | 'thang-truoc' | 'quy-nay' | 'tu-dau-nam'
export type SoSanhKieu = 'ky-truoc' | 'ke-hoach'
export type DenStatus = 'xanh' | 'vang' | 'do' | 'info'

export interface BlockConfig {
  id: string
  ten: string
  an?: boolean
}

export const BLOCKS_MAC_DINH: BlockConfig[] = [
  { id: 'kpi', ten: 'Chỉ số cốt lõi' },
  { id: 'suc-khoe', ten: 'Chỉ số sức khoẻ tài chính' },
  { id: 'thac-nuoc', ten: 'Thác nước lợi nhuận' },
  { id: 'xu-huong', ten: 'Xu hướng kinh doanh' },
  { id: 'dong-tien', ten: 'Dòng tiền kỳ' },
  { id: 'chi-nhanh', ten: 'Hiệu quả chi nhánh' },
  { id: 'co-cau-cp', ten: 'Cơ cấu chi phí' },
  { id: 'canh-bao', ten: 'Cảnh báo rủi ro' },
  { id: 'ban-chay', ten: 'Món bán chạy' },
]

export function docBlocks(donVi?: string, email?: string): BlockConfig[] {
  try {
    const k = `iacc-tq-blocks-${donVi ?? 'default'}-${email ?? 'default'}`
    const raw = localStorage.getItem(k)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const ids = new Set(parsed.map((p: BlockConfig) => p.id))
        const res = [...parsed]
        for (const b of BLOCKS_MAC_DINH) {
          if (!ids.has(b.id)) res.push(b)
        }
        return res
      }
    }
  } catch {}
  return BLOCKS_MAC_DINH
}

export function luuBlocks(donVi: string | undefined, email: string | undefined, blocks: BlockConfig[]) {
  try {
    const k = `iacc-tq-blocks-${donVi ?? 'default'}-${email ?? 'default'}`
    localStorage.setItem(k, JSON.stringify(blocks))
  } catch {}
}

export function resetBlocks(donVi?: string, email?: string): BlockConfig[] {
  try {
    const k = `iacc-tq-blocks-${donVi ?? 'default'}-${email ?? 'default'}`
    localStorage.removeItem(k)
  } catch {}
  return BLOCKS_MAC_DINH
}

export interface ChiSoItem {
  id: string
  ten: string
  giaTri: string
  den: DenStatus
  giaiThich: string
  congThuc: string
  sub?: string
  maBc?: string
}

export interface WaterfallItem {
  l: string
  v: number
  isTotal?: boolean
  c?: string
}

export interface TrendItem {
  l: string
  dt: number
  ln: number
  bien: number
}

export interface BranchItem {
  id: string
  ten: string
  dt: number
  gv: number
  lnGop: number
  bienGop: number
}

export interface CostItem {
  l: string
  v: number
  c: string
}

export interface TongQuanSoLieu {
  kyLabel: string
  soSanhLabel: string
  isLocCn: boolean
  ghiChuCn: string
  ghiChuDongTien?: string

  // 4 KPIs
  dtThuan: number
  lnGop: number
  lnTruocThue: number
  tienKhaDung: number
  tienMat: number
  tienNganHang: number
  soNgayDuChi: number

  bienGop: number
  bienLNTT: number

  tangDT: number | null
  tangLG: number | null
  tangLNTT: number | null
  tangTien: number | null

  sparkDT: number[]
  sparkLG: number[]
  sparkLNTT: number[]
  sparkTien: number[]

  // Khối sức khoẻ (8 chỉ số)
  chiSo: ChiSoItem[]

  // Biểu đồ
  thacNuoc: WaterfallItem[]
  trend: TrendItem[]
  dongTien: { dau: number; thu: number; chi: number; cuoi: number }
  chiNhanh: BranchItem[]
  coCauCp: CostItem[]
  theoNgay: { l: string; v: number; v2: number }[]
  soDon: number
  aov: number
}

/** Cộng dồn dữ liệu từ ngày a đến ngày b */
function congDaily(a: Date, b: Date, cnList?: string[]) {
  const cns = cnList && cnList.length > 0 ? new Set(cnList) : null
  const ds = DAILY.filter(x => x.date >= a && x.date <= b && (!cns || cns.has(x.cn)))
  return {
    dt: ds.reduce((s, x) => s + x.dt, 0),
    gv: ds.reduce((s, x) => s + x.gv, 0),
    don: ds.reduce((s, x) => s + x.don, 0),
    vat: ds.reduce((s, x) => s + x.vat, 0),
    tm: ds.reduce((s, x) => s + x.tm, 0),
    ck: ds.reduce((s, x) => s + x.ck, 0),
    the: ds.reduce((s, x) => s + x.the, 0),
    app: ds.reduce((s, x) => s + x.app, 0),
    soNgay: new Set(ds.map(x => +x.date)).size,
  }
}

export function tinhToanTongQuan(
  ky: KyBaoCao,
  selCns: string[],
  cheDo: CheDo
): TongQuanSoLieu {
  const isLocCn = selCns.length > 0 && selCns.length < CHI_NHANH.length
  const cns = isLocCn ? selCns : CHI_NHANH.map(c => c.id)

  let kyLabel = ''
  let soSanhLabel = ''
  let thangCai = 10
  let ghiChuDongTien: string | undefined

  // 1. Dữ liệu kỳ hiện tại
  let dtThuan = 0
  let gv = 0
  let lnGop = 0
  let cpBh = 0
  let cpQl = 0
  let dtTc = 0
  let cpTc = 0
  let tnKhac = 0
  let cpKhac = 0
  let lnTruocThue = 0
  let cpLuong = 0
  let cpMatBang = 0
  let cpDienNuoc = 0
  let cpKhauHao = 0
  let cpCcdc = 0
  let cpChiPhiKhac = 0
  let soNgay = 7
  let soDon = 0

  // Dữ liệu so sánh
  let dtThuanTruoc = 0
  let lnGopTruoc = 0
  let lnTruocThueTruoc = 0
  let tienTruoc = 0
  let coSoSanh = true

  if (ky === 'thang-truoc') {
    // Tháng 9/2026
    thangCai = 9
    soNgay = 30
    kyLabel = 'Tháng 9/2026'
    soSanhLabel = 'so với tháng 8'

    const k9 = kqkd(9, 2026)
    const k8 = kqkd(8, 2026)

    if (!isLocCn) {
      dtThuan = k9.dtThuan
      gv = k9.gv
      lnGop = k9.lnGop
      cpBh = k9.cpBh
      cpQl = k9.cpQl
      dtTc = k9.dtTc
      cpTc = k9.cpTc
      tnKhac = k9.tnKhac
      cpKhac = k9.cpKhac
      lnTruocThue = k9.lnTruocThue
      cpLuong = k9.cp.luong
      cpMatBang = k9.cp.matBang
      cpDienNuoc = k9.cp.dienNuoc
      cpKhauHao = k9.cp.khauHao
      cpCcdc = k9.cp.ccdc
      cpChiPhiKhac = k9.cp.khac
      soDon = k9.t.don

      dtThuanTruoc = k8.dtThuan
      lnGopTruoc = k8.lnGop
      lnTruocThueTruoc = k8.lnTruocThue
    } else {
      let dtCn = 0, gvCn = 0, donCn = 0
      for (const cid of cns) {
        const tk = tongKy(9, 2026, cid)
        dtCn += tk.dt
        gvCn += tk.gv
        donCn += tk.don
      }
      const tyTrong = dtCn / (k9.t.dt || 1)
      dtThuan = dtCn - Math.round(k9.giamTru * tyTrong)
      gv = gvCn
      lnGop = dtThuan - gv
      cpBh = Math.round(k9.cpBh * tyTrong)
      cpQl = Math.round(k9.cpQl * tyTrong)
      dtTc = Math.round(k9.dtTc * tyTrong)
      cpTc = Math.round(k9.cpTc * tyTrong)
      tnKhac = Math.round(k9.tnKhac * tyTrong)
      cpKhac = Math.round(k9.cpKhac * tyTrong)
      lnTruocThue = lnGop + dtTc - cpTc - cpBh - cpQl + (tnKhac - cpKhac)

      cpLuong = Math.round(k9.cp.luong * tyTrong)
      cpMatBang = Math.round(k9.cp.matBang * tyTrong)
      cpDienNuoc = Math.round(k9.cp.dienNuoc * tyTrong)
      cpKhauHao = Math.round(k9.cp.khauHao * tyTrong)
      cpCcdc = Math.round(k9.cp.ccdc * tyTrong)
      cpChiPhiKhac = Math.round(k9.cp.khac * tyTrong)
      soDon = donCn

      let dtCn8 = 0, gvCn8 = 0
      for (const cid of cns) {
        const tk = tongKy(8, 2026, cid)
        dtCn8 += tk.dt
        gvCn8 += tk.gv
      }
      const tt8 = dtCn8 / (k8.t.dt || 1)
      dtThuanTruoc = dtCn8 - Math.round(k8.giamTru * tt8)
      lnGopTruoc = dtThuanTruoc - gvCn8
      lnTruocThueTruoc = Math.round(k8.lnTruocThue * tt8)
    }
    tienTruoc = du(soCai(8).cuoi, '1111', '1121')
  } else if (ky === 'thang-nay') {
    // Tháng 10/2026 (01/10 đến 07/10)
    thangCai = 10
    soNgay = 7
    kyLabel = 'Tháng 10/2026 (đến 07/10)'
    soSanhLabel = 'so với 01–07/09'

    const k10 = kqkd(10, 2026)
    const dTruoc = congDaily(new Date(2026, 8, 1), new Date(2026, 8, 7), isLocCn ? cns : undefined)

    if (!isLocCn) {
      dtThuan = k10.dtThuan
      gv = k10.gv
      lnGop = k10.lnGop
      cpBh = k10.cpBh
      cpQl = k10.cpQl
      dtTc = k10.dtTc
      cpTc = k10.cpTc
      tnKhac = k10.tnKhac
      cpKhac = k10.cpKhac
      lnTruocThue = k10.lnTruocThue
      cpLuong = k10.cp.luong
      cpMatBang = k10.cp.matBang
      cpDienNuoc = k10.cp.dienNuoc
      cpKhauHao = k10.cp.khauHao
      cpCcdc = k10.cp.ccdc
      cpChiPhiKhac = k10.cp.khac
      soDon = k10.t.don
    } else {
      let dtCn = 0, gvCn = 0, donCn = 0
      for (const cid of cns) {
        const tk = tongKy(10, 2026, cid)
        dtCn += tk.dt
        gvCn += tk.gv
        donCn += tk.don
      }
      const tyTrong = dtCn / (k10.t.dt || 1)
      dtThuan = dtCn - Math.round(k10.giamTru * tyTrong)
      gv = gvCn
      lnGop = dtThuan - gv
      cpBh = Math.round(k10.cpBh * tyTrong)
      cpQl = Math.round(k10.cpQl * tyTrong)
      dtTc = Math.round(k10.dtTc * tyTrong)
      cpTc = Math.round(k10.cpTc * tyTrong)
      tnKhac = Math.round(k10.tnKhac * tyTrong)
      cpKhac = Math.round(k10.cpKhac * tyTrong)
      lnTruocThue = lnGop + dtTc - cpTc - cpBh - cpQl + (tnKhac - cpKhac)

      cpLuong = Math.round(k10.cp.luong * tyTrong)
      cpMatBang = Math.round(k10.cp.matBang * tyTrong)
      cpDienNuoc = Math.round(k10.cp.dienNuoc * tyTrong)
      cpKhauHao = Math.round(k10.cp.khauHao * tyTrong)
      cpCcdc = Math.round(k10.cp.ccdc * tyTrong)
      cpChiPhiKhac = Math.round(k10.cp.khac * tyTrong)
      soDon = donCn
    }

    dtThuanTruoc = dTruoc.dt - Math.round(dTruoc.dt * 0.0035)
    lnGopTruoc = dtThuanTruoc - dTruoc.gv
    lnTruocThueTruoc = Math.round((kqkd(9, 2026).lnTruocThue * (7 / 30)) * (isLocCn ? (dTruoc.dt / (congDaily(new Date(2026, 8, 1), new Date(2026, 8, 7)).dt || 1)) : 1))
    tienTruoc = du(soCai(9).cuoi, '1111', '1121')
  } else if (ky === 'quy-nay') {
    // Quý 4/2026 (01/10 đến 07/10)
    thangCai = 10
    soNgay = 7
    kyLabel = 'Quý 4/2026 (đến 07/10)'
    soSanhLabel = 'so với 7 ngày đầu Q3'

    const k10 = kqkd(10, 2026)
    const dTruocQ3 = congDaily(new Date(2026, 6, 1), new Date(2026, 6, 7), isLocCn ? cns : undefined)

    if (!isLocCn) {
      dtThuan = k10.dtThuan
      gv = k10.gv
      lnGop = k10.lnGop
      cpBh = k10.cpBh
      cpQl = k10.cpQl
      dtTc = k10.dtTc
      cpTc = k10.cpTc
      tnKhac = k10.tnKhac
      cpKhac = k10.cpKhac
      lnTruocThue = k10.lnTruocThue
      cpLuong = k10.cp.luong
      cpMatBang = k10.cp.matBang
      cpDienNuoc = k10.cp.dienNuoc
      cpKhauHao = k10.cp.khauHao
      cpCcdc = k10.cp.ccdc
      cpChiPhiKhac = k10.cp.khac
      soDon = k10.t.don
    } else {
      let dtCn = 0, gvCn = 0, donCn = 0
      for (const cid of cns) {
        const tk = tongKy(10, 2026, cid)
        dtCn += tk.dt
        gvCn += tk.gv
        donCn += tk.don
      }
      const tyTrong = dtCn / (k10.t.dt || 1)
      dtThuan = dtCn - Math.round(k10.giamTru * tyTrong)
      gv = gvCn
      lnGop = dtThuan - gv
      cpBh = Math.round(k10.cpBh * tyTrong)
      cpQl = Math.round(k10.cpQl * tyTrong)
      dtTc = Math.round(k10.dtTc * tyTrong)
      cpTc = Math.round(k10.cpTc * tyTrong)
      tnKhac = Math.round(k10.tnKhac * tyTrong)
      cpKhac = Math.round(k10.cpKhac * tyTrong)
      lnTruocThue = lnGop + dtTc - cpTc - cpBh - cpQl + (tnKhac - cpKhac)

      cpLuong = Math.round(k10.cp.luong * tyTrong)
      cpMatBang = Math.round(k10.cp.matBang * tyTrong)
      cpDienNuoc = Math.round(k10.cp.dienNuoc * tyTrong)
      cpKhauHao = Math.round(k10.cp.khauHao * tyTrong)
      cpCcdc = Math.round(k10.cp.ccdc * tyTrong)
      cpChiPhiKhac = Math.round(k10.cp.khac * tyTrong)
      soDon = donCn
    }

    dtThuanTruoc = dTruocQ3.dt - Math.round(dTruocQ3.dt * 0.0035)
    lnGopTruoc = dtThuanTruoc - dTruocQ3.gv
    lnTruocThueTruoc = Math.round((kqkd(7, 2026).lnTruocThue * (7 / 31)) * (isLocCn ? (dTruocQ3.dt / (congDaily(new Date(2026, 6, 1), new Date(2026, 6, 7)).dt || 1)) : 1))
    tienTruoc = du(soCai(9).cuoi, '1111', '1121')
  } else {
    // Từ đầu năm (từ 01/07/2026 đến 07/10/2026)
    thangCai = 10
    soNgay = 99
    kyLabel = 'Từ đầu năm (từ 01/07/2026)'
    soSanhLabel = 'Chưa có kỳ so sánh'
    coSoSanh = false
    ghiChuDongTien = 'Dòng tiền từ 01/08/2026, sổ cái bắt đầu từ tháng 8'

    const kList = [kqkd(7, 2026), kqkd(8, 2026), kqkd(9, 2026), kqkd(10, 2026)]
    for (let m = 7; m <= 10; m++) {
      const km = kList[m - 7]
      if (!isLocCn) {
        dtThuan += km.dtThuan
        gv += km.gv
        lnGop += km.lnGop
        cpBh += km.cpBh
        cpQl += km.cpQl
        dtTc += km.dtTc
        cpTc += km.cpTc
        tnKhac += km.tnKhac
        cpKhac += km.cpKhac
        lnTruocThue += km.lnTruocThue
        cpLuong += km.cp.luong
        cpMatBang += km.cp.matBang
        cpDienNuoc += km.cp.dienNuoc
        cpKhauHao += km.cp.khauHao
        cpCcdc += km.cp.ccdc
        cpChiPhiKhac += km.cp.khac
        soDon += km.t.don
      } else {
        let dtCn = 0, gvCn = 0, donCn = 0
        for (const cid of cns) {
          const tk = tongKy(m, 2026, cid)
          dtCn += tk.dt
          gvCn += tk.gv
          donCn += tk.don
        }
        const tyTrong = dtCn / (km.t.dt || 1)
        const dtt = dtCn - Math.round(km.giamTru * tyTrong)
        const lg = dtt - gvCn
        const cb = Math.round(km.cpBh * tyTrong)
        const cq = Math.round(km.cpQl * tyTrong)
        const dtc = Math.round(km.dtTc * tyTrong)
        const ctc = Math.round(km.cpTc * tyTrong)
        const tnk = Math.round(km.tnKhac * tyTrong)
        const cpk = Math.round(km.cpKhac * tyTrong)

        dtThuan += dtt
        gv += gvCn
        lnGop += lg
        cpBh += cb
        cpQl += cq
        dtTc += dtc
        cpTc += ctc
        tnKhac += tnk
        cpKhac += cpk
        lnTruocThue += lg + dtc - ctc - cb - cq + (tnk - cpk)

        cpLuong += Math.round(km.cp.luong * tyTrong)
        cpMatBang += Math.round(km.cp.matBang * tyTrong)
        cpDienNuoc += Math.round(km.cp.dienNuoc * tyTrong)
        cpKhauHao += Math.round(km.cp.khauHao * tyTrong)
        cpCcdc += Math.round(km.cp.ccdc * tyTrong)
        cpChiPhiKhac += Math.round(km.cp.khac * tyTrong)
        soDon += donCn
      }
    }

    dtThuanTruoc = 0
    lnGopTruoc = 0
    lnTruocThueTruoc = 0
    tienTruoc = 0
  }

  // 2. Sổ cái & Dòng tiền
  const sc = soCai(thangCai)
  const tm = du(sc.cuoi, '1111')
  const nh = du(sc.cuoi, '1121')
  const tienKhaDung = tm + nh

  let dauTien = 0
  let thuTien = 0
  let chiTienKy = 0
  let cuoiTien = 0
  let soNgayTinhChi = soNgay

  if (ky === 'tu-dau-nam') {
    // Sổ cái bắt đầu từ tháng 8, cộng dồn tháng 8, 9, 10
    dauTien = du(soCai(8).mo, '1111', '1121')
    cuoiTien = du(soCai(10).cuoi, '1111', '1121')
    for (const m of [8, 9, 10]) {
      const scM = soCai(m)
      thuTien += scM.bt
        .filter(b => (b[0] === '1111' || b[0] === '1121') && !(b[1] === '1111' || b[1] === '1121'))
        .reduce((s, b) => s + b[2], 0)
      chiTienKy += scM.bt
        .filter(b => (b[1] === '1111' || b[1] === '1121') && !(b[0] === '1111' || b[0] === '1121'))
        .reduce((s, b) => s + b[2], 0)
    }
    // Số ngày tính chi bình quân: 31 (T8) + 30 (T9) + 7 (T10) = 68 ngày
    soNgayTinhChi = 68
  } else {
    dauTien = du(sc.mo, '1111', '1121')
    thuTien = sc.bt
      .filter(b => (b[0] === '1111' || b[0] === '1121') && !(b[1] === '1111' || b[1] === '1121'))
      .reduce((s, b) => s + b[2], 0)
    chiTienKy = sc.bt
      .filter(b => (b[1] === '1111' || b[1] === '1121') && !(b[0] === '1111' || b[0] === '1121'))
      .reduce((s, b) => s + b[2], 0)
    cuoiTien = du(sc.cuoi, '1111', '1121')
  }

  const chiBQNgay = chiTienKy / (soNgayTinhChi || 1)
  const soNgayDuChi = chiBQNgay > 0 ? Math.round(tienKhaDung / chiBQNgay) : 0

  // 3. Tỷ lệ tăng giảm % (Từ đầu năm không có kỳ so sánh -> null)
  const tinhTang = (ht: number, tr: number): number | null => {
    if (!coSoSanh || !tr) return null
    return (ht - tr) / tr
  }
  const tangDT = tinhTang(dtThuan, dtThuanTruoc)
  const tangLG = tinhTang(lnGop, lnGopTruoc)
  const tangLNTT = tinhTang(lnTruocThue, lnTruocThueTruoc)
  const tangTien = tinhTang(tienKhaDung, tienTruoc)

  // 4. Sparkline 4 tháng (T7 - T10)
  const sparkDT = [kqkd(7, 2026).dtThuan, kqkd(8, 2026).dtThuan, kqkd(9, 2026).dtThuan, kqkd(10, 2026).dtThuan]
  const sparkLG = [kqkd(7, 2026).lnGop, kqkd(8, 2026).lnGop, kqkd(9, 2026).lnGop, kqkd(10, 2026).lnGop]
  const sparkLNTT = [kqkd(7, 2026).lnTruocThue, kqkd(8, 2026).lnTruocThue, kqkd(9, 2026).lnTruocThue, kqkd(10, 2026).lnTruocThue]
  const sparkTien = [
    du(soCai(8).mo, '1111', '1121'),
    du(soCai(8).cuoi, '1111', '1121'),
    du(soCai(9).cuoi, '1111', '1121'),
    du(soCai(10).cuoi, '1111', '1121'),
  ]

  // 5. Thác nước lợi nhuận
  const tcKhac = (dtTc - cpTc) + (tnKhac - cpKhac)
  const thacNuoc: WaterfallItem[] = [
    { l: 'Doanh thu thuần', v: dtThuan, isTotal: true, c: '#0560a6' },
    { l: 'Giá vốn hàng bán', v: -gv, isTotal: false, c: '#f28020' },
    { l: 'Chi phí bán hàng', v: -cpBh, isTotal: false, c: '#c2362b' },
    { l: 'Chi phí quản lý', v: -cpQl, isTotal: false, c: '#a86a0c' },
    { l: 'Tài chính, khác', v: tcKhac, isTotal: false, c: tcKhac >= 0 ? '#138a52' : '#64748b' },
    { l: 'Lợi nhuận trước thuế', v: lnTruocThue, isTotal: true, c: '#138a52' },
  ]

  // 6. Xu hướng 4 tháng
  const trend: TrendItem[] = [7, 8, 9, 10].map(m => {
    const km = kqkd(m, 2026)
    return {
      l: m === 10 ? 'T10 (7 ngày)' : `T${m < 10 ? '0' + m : m}`,
      dt: km.dtThuan,
      ln: km.lnTruocThue,
      bien: km.dtThuan > 0 ? (km.lnTruocThue / km.dtThuan) * 100 : 0,
    }
  })

  // 7. Dòng tiền kỳ
  const dongTien = {
    dau: dauTien,
    thu: thuTien,
    chi: chiTienKy,
    cuoi: cuoiTien,
  }

  // 8. So sánh chi nhánh: cộng tongKy theo đúng các tháng của kỳ
  const monthsCn = ky === 'tu-dau-nam' ? [7, 8, 9, 10] : ky === 'thang-truoc' ? [9] : [10]
  const chiNhanh: BranchItem[] = CHI_NHANH.map(c => {
    let dtC = 0, gvC = 0
    for (const m of monthsCn) {
      const tk = tongKy(m, 2026, c.id)
      dtC += tk.dt
      gvC += tk.gv
    }
    const lg = dtC - gvC
    return {
      id: c.id,
      ten: c.ten,
      dt: dtC,
      gv: gvC,
      lnGop: lg,
      bienGop: dtC > 0 ? lg / dtC : 0,
    }
  }).sort((a, b) => b.dt - a.dt)

  // 9. Cơ cấu chi phí hoạt động
  const coCauCp: CostItem[] = [
    { l: 'Lương nhân sự', v: cpLuong, c: '#0b2c6b' },
    { l: 'Thuê mặt bằng', v: cpMatBang, c: '#0560a6' },
    { l: 'Điện, nước, gas', v: cpDienNuoc, c: '#0f8f84' },
    { l: 'Khấu hao TSCĐ', v: cpKhauHao, c: '#a86a0c' },
    { l: 'Phân bổ CCDC', v: cpCcdc, c: '#b1852b' },
    { l: 'Chi phí khác', v: cpChiPhiKhac, c: '#64748b' },
  ].filter(x => x.v > 0)

  // 10. Doanh thu 30 ngày gần nhất
  const denNgay = ky === 'thang-truoc' ? new Date(2026, 8, 30) : HOM_NAY
  const ngay30 = DAILY.filter(x => {
    const minD = new Date(denNgay.getFullYear(), denNgay.getMonth(), denNgay.getDate() - 30)
    return x.date > minD && x.date <= denNgay && (!isLocCn || cns.includes(x.cn))
  })
  const theoNgay = [...new Set(ngay30.map(x => +x.date))].map(d => {
    const ds = ngay30.filter(x => +x.date === d)
    return {
      l: `${new Date(d).getDate()}/${new Date(d).getMonth() + 1}`,
      v: ds.reduce((a, x) => a + x.dt, 0),
      v2: ds.reduce((a, x) => a + x.gv, 0),
    }
  })

  // 11. Tính 8 chỉ số sức khoẻ tài chính
  const chiSo: ChiSoItem[] = []

  // (1) Chi phí cốt lõi (Prime cost) = (giá vốn + lương) / doanh thu thuần
  const primeVal = dtThuan > 0 ? (gv + cpLuong) / dtThuan : 0
  chiSo.push({
    id: 'prime-cost',
    ten: 'Chi phí cốt lõi',
    giaTri: dtThuan > 0 ? pct(primeVal) : 'Chưa đủ dữ liệu',
    den: primeVal <= 0.60 ? 'xanh' : primeVal <= 0.65 ? 'vang' : 'do',
    giaiThich: primeVal <= 0.60
      ? 'Tổng chi phí nguyên vật liệu và nhân sự tối ưu'
      : primeVal <= 0.65
      ? 'Chi phí cốt lõi ở mức cảnh báo trung bình'
      : 'Chi phí NVL và nhân sự vượt ngưỡng an toàn',
    congThuc: 'Prime cost = (Giá vốn + Lương nhân sự) / Doanh thu thuần',
    sub: `Ngưỡng an toàn ≤ 60%`,
    maBc: '10.4.3',
  })

  // (2) Tỷ lệ giá vốn (Food cost) = giá vốn / doanh thu thuần
  const foodCostVal = dtThuan > 0 ? gv / dtThuan : 0
  chiSo.push({
    id: 'food-cost',
    ten: 'Tỷ lệ giá vốn',
    giaTri: dtThuan > 0 ? pct(foodCostVal) : 'Chưa đủ dữ liệu',
    den: foodCostVal <= 0.35 ? 'xanh' : foodCostVal <= 0.40 ? 'vang' : 'do',
    giaiThich: foodCostVal <= 0.35
      ? 'Định lượng và hao hụt nguyên vật liệu kiểm soát tốt'
      : foodCostVal <= 0.40
      ? 'Giá vốn hơi cao, cần rà soát hao hụt'
      : 'Giá vốn vượt ngưỡng 40%, nguy cơ xói mòn lãi',
    congThuc: 'Food cost = Giá vốn hàng bán / Doanh thu thuần',
    sub: `Ngưỡng an toàn ≤ 35%`,
    maBc: '3.2.5',
  })

  // (3) Tỷ lệ chi phí mặt bằng = mặt bằng / doanh thu
  const matBangVal = dtThuan > 0 ? cpMatBang / dtThuan : 0
  chiSo.push({
    id: 'mat-bang',
    ten: 'Tỷ lệ chi phí mặt bằng',
    giaTri: dtThuan > 0 ? pct(matBangVal) : 'Chưa đủ dữ liệu',
    den: matBangVal <= 0.10 ? 'xanh' : matBangVal <= 0.15 ? 'vang' : 'do',
    giaiThich: matBangVal <= 0.10
      ? 'Chi phí thuê điểm bán ở mức lý tưởng cho F&B'
      : matBangVal <= 0.15
      ? 'Tiền thuê trong giới hạn chịu đựng'
      : 'Gánh nặng tiền thuê cao trên doanh thu',
    congThuc: 'Chi phí thuê mặt bằng / Doanh thu thuần',
    sub: `Ngưỡng an toàn ≤ 10%`,
    maBc: '10.4.3',
  })

  // (4) Doanh thu hoà vốn của kỳ = định phí / biên lãi góp
  const dinhPhi = cpMatBang + cpKhauHao + cpCcdc + cpChiPhiKhac + Math.round(cpLuong * 0.38) + cpTc
  const bienPhi = gv + cpDienNuoc + Math.round(cpLuong * 0.62)
  const bienLaiGop = dtThuan > 0 ? (dtThuan - bienPhi) / dtThuan : 0
  const diemHoaVon = bienLaiGop > 0 ? Math.round(dinhPhi / bienLaiGop) : 0
  const pctHoaVon = diemHoaVon > 0 ? dtThuan / diemHoaVon : 0
  chiSo.push({
    id: 'hoa-von',
    ten: 'Doanh thu hoà vốn của kỳ',
    giaTri: diemHoaVon > 0 ? short(diemHoaVon) : 'Chưa đủ dữ liệu',
    den: pctHoaVon >= 1.0 ? 'xanh' : pctHoaVon >= 0.8 ? 'vang' : 'do',
    giaiThich: pctHoaVon >= 1.0
      ? `Doanh thu đạt ${Math.round(pctHoaVon * 100)}% mức hoà vốn (đã có lãi)`
      : `Doanh thu đạt ${Math.round(pctHoaVon * 100)}% điểm hoà vốn`,
    congThuc: 'Định phí / Tỷ lệ số dư đảm phí (Biên lãi góp)',
    sub: diemHoaVon > 0 ? `Đạt ${Math.round(pctHoaVon * 100)}% điểm hoà vốn` : undefined,
    maBc: '10.2.3',
  })

  // (5) Số ngày tồn kho (DIO) = tồn kho cuối kỳ (15x) / giá vốn bình quân ngày
  const tk152 = sc.cuoi['152'] || 0
  const gvBQNgay = gv / (soNgay || 1)
  const dio = gvBQNgay > 0 ? Math.round(tk152 / gvBQNgay) : 0
  chiSo.push({
    id: 'ton-kho',
    ten: 'Số ngày tồn kho',
    giaTri: dio > 0 ? `${dio} ngày` : 'Chưa đủ dữ liệu',
    den: dio <= 16 ? 'xanh' : dio <= 25 ? 'vang' : 'do',
    giaiThich: dio <= 16
      ? 'Vòng quay nguyên vật liệu tươi mới, ít ứ đọng'
      : dio <= 25
      ? 'Tồn kho mức trung bình, chú ý hạn dùng'
      : 'Tồn kho cao, nguy cơ quá hạn hoặc đọng vốn',
    congThuc: 'DIO = Tồn kho cuối kỳ (TK 15x) / Giá vốn bình quân ngày',
    sub: `Tồn kho ${short(tk152)}`,
    maBc: '5.2.3',
  })

  // (6) Số ngày thu tiền / trả tiền (DSO / DPO)
  const tk131 = Math.max(0, sc.cuoi['131'] || 0)
  const dtBQNgay = dtThuan / (soNgay || 1)
  const dsoNum = dtBQNgay > 0 ? tk131 / dtBQNgay : 0
  const tk331 = Math.abs(Math.min(0, sc.cuoi['331'] || 0))
  const dpoNum = gvBQNgay > 0 ? tk331 / gvBQNgay : 0

  const dsoStr = dsoNum.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  const dpoStr = dpoNum.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

  chiSo.push({
    id: 'dso-dpo',
    ten: 'Số ngày thu tiền / trả tiền',
    giaTri: `${dsoStr} / ${dpoStr} ngày`,
    den: dsoNum <= 3 ? 'xanh' : dsoNum <= 7 ? 'vang' : 'do',
    giaiThich: `Thu khách trung bình ${dsoStr} ngày, thanh toán NCC ${dpoStr} ngày`,
    congThuc: 'DSO = Phải thu 131 / DT ngày; DPO = Phải trả 331 / GV ngày',
    sub: `Phải thu ${short(tk131)} · Nợ NCC ${short(tk331)}`,
    maBc: '2.2.5',
  })

  // (7) Hệ số thanh toán hiện hành = tài sản ngắn hạn / nợ ngắn hạn (≥1.2 xanh, ≥1.0 vàng)
  const tsnh = (sc.cuoi['1111'] || 0) + (sc.cuoi['1121'] || 0) + Math.max(0, sc.cuoi['131'] || 0) + (sc.cuoi['1331'] || 0) + (sc.cuoi['152'] || 0)
  const nnh = Math.abs(Math.min(0, sc.cuoi['331'] || 0)) + Math.abs(Math.min(0, sc.cuoi['33311'] || 0)) + Math.abs(Math.min(0, sc.cuoi['3334'] || 0)) + Math.abs(Math.min(0, sc.cuoi['334'] || 0)) + Math.abs(Math.min(0, sc.cuoi['341'] || 0))
  const cr = nnh > 0 ? tsnh / nnh : 0
  chiSo.push({
    id: 'thanh-toan',
    ten: 'Hệ số thanh toán hiện hành',
    giaTri: cr > 0 ? cr.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Chưa đủ dữ liệu',
    den: cr >= 1.2 ? 'xanh' : cr >= 1.0 ? 'vang' : 'do',
    giaiThich: cr >= 1.2
      ? 'Tài sản ngắn hạn đủ bù đắp nợ đến hạn'
      : cr >= 1.0
      ? 'Khả năng thanh toán ở mức vừa đủ'
      : 'Tài sản ngắn hạn thấp hơn nợ, rủi ro thanh khoản',
    congThuc: 'Tài sản ngắn hạn (loại 1) / Nợ ngắn hạn (loại 3)',
    sub: `TSNH ${short(tsnh)} / Nợ ${short(nnh)}`,
    maBc: '10.2.2',
  })

  // (8) Thuế GTGT còn phải nộp = dư Có 3331 trừ 133 khả dụng
  const duCo3331 = Math.abs(Math.min(0, sc.cuoi['33311'] || 0))
  const duNo1331 = Math.max(0, sc.cuoi['1331'] || 0)
  const thuePhaiNop = Math.max(0, duCo3331 - duNo1331)
  chiSo.push({
    id: 'thue-gtgt',
    ten: 'Thuế GTGT còn phải nộp',
    giaTri: short(thuePhaiNop),
    den: 'info',
    giaiThich: thuePhaiNop > 0
      ? `Số dư phải nộp sau khi cấn trừ thuế đầu vào ${short(duNo1331)}`
      : 'Chưa phát sinh nghĩa vụ nộp thuế GTGT',
    congThuc: 'Dư Có 33311 - Dư Nợ 1331 khả dụng cuối kỳ',
    sub: duCo3331 > 0 ? `Đầu ra ${short(duCo3331)} · Khấu trừ ${short(duNo1331)}` : undefined,
    maBc: '6.2.3',
  })

  const ghiChuCn = isLocCn
    ? 'Chi phí phân bổ theo doanh thu · Số liệu sổ cái toàn doanh nghiệp'
    : ''

  return {
    kyLabel,
    soSanhLabel,
    isLocCn,
    ghiChuCn,
    ghiChuDongTien,

    dtThuan,
    lnGop,
    lnTruocThue,
    tienKhaDung,
    tienMat: tm,
    tienNganHang: nh,
    soNgayDuChi,

    bienGop: dtThuan > 0 ? lnGop / dtThuan : 0,
    bienLNTT: dtThuan > 0 ? lnTruocThue / dtThuan : 0,

    tangDT,
    tangLG,
    tangLNTT,
    tangTien,

    sparkDT,
    sparkLG,
    sparkLNTT,
    sparkTien,

    chiSo,
    thacNuoc,
    trend,
    dongTien,
    chiNhanh,
    coCauCp,
    theoNgay,
    soDon,
    aov: soDon > 0 ? Math.round(dtThuan / soDon) : 0,
  }
}
