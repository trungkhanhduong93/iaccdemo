import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { donViHienTai, dsChiNhanh, useSession } from '../../app/session'
import { CHI_NHANH, DAILY, KHO, NVL, ROLE, kqkd } from '../../data/mock'
import { Icon } from '../Icon'
import { money, moneyD, pct, short } from '../format'
import { type KyBaoCao, tinhToanTongQuan } from '../../modules/home/chiSo'
import { tonQuyTheoSo } from '../../modules/home/LichSuQuy'
import { PHIEU_MUA } from '../../modules/mua-hang/bao-cao'
import { rowsCongNo } from '../../modules/bao-cao/cong-no'
import { soCai } from '../../modules/tong-hop/so-cai'
import { dinhMucTon } from '../../modules/kho/data'
import { MODULES, hienMan, moDuoc, timMan } from '../../app/registry'
import { anNgoaiGoi } from '../../app/plan'
import { chungTu, dongCua } from '../generic/gen'
import { mauDieuChinh } from '../../modules/kho/dieu-chinh'
import { datLocDaXem } from '../bao-cao/tuyChinhBC'
import { moTaCach, nvlKy } from '../../modules/home/chi-phi-nvl'
import { useMoTuTrangChu } from '../../app/tuTrangChu'
import { Select } from '../Dropdown'
import { HopLaiLo13, laiLo13Thang } from '../../modules/home/BaBaiToanFree'
import {
  BranchBarChart,
  CashFlowChart,
  CostStructureChart,
  HBars,
  Spark,
  TrendChart,
  WaterfallChart,
} from '../Charts'
import { MTimKiem } from './MTimKiem'
import { MChon } from './MChon'

function SoSanhDong({ tang, label }: { tang: number | null; label?: string }) {
  if (tang === null) {
    return <div className="m-tc-ss neutral">— Chưa có kỳ so sánh</div>
  }
  const tot = tang >= 0
  const dau = tang > 0 ? '▲ +' : tang < 0 ? '▼ -' : ''
  return (
    <div className={`m-tc-ss ${tot ? 'tot' : 'xau'}`}>
      <span className="m-tc-ss-val">{dau}{pct(Math.abs(tang))}</span>
      {label && <span className="m-tc-ss-lbl"> {label}</span>}
    </div>
  )
}

export function MTrangChu(_props?: Partial<ScreenProps>) {
  const { s, set } = useSession()
  const nav = useNavigate()
  const dv = donViHienTai(s)

  const dsCnRaw = dsChiNhanh(s)
  const dsCn = dsCnRaw.length ? dsCnRaw : CHI_NHANH
  const cn = dsCn.find(c => c.id === s.chiNhanh)
  // dsChiNhanh chỉ có id, ten: tên ngắn lấy từ CHI_NHANH
  const tenNgan = (id: string) => CHI_NHANH.find(x => x.id === id)?.ngan
  const nhanCn = cn ? (tenNgan(cn.id) ?? cn.ten) : 'Tất cả'

  const [tabActive, setTabActive] = useState<0 | 1>(0)
  const [moTimKiem, setMoTimKiem] = useState(false)
  const [moChonCn, setMoChonCn] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const thangUrl = Number(searchParams.get('thang'))
  const [thangF, setThangFState] = useState(thangUrl >= 7 && thangUrl <= 10 ? thangUrl : 10)
  const setThangF = (t: number) => {
    setThangFState(t)
    setSearchParams(
      prev => {
        const n = new URLSearchParams(prev)
        n.set('thang', String(t))
        return n
      },
      { replace: true }
    )
  }
  useEffect(() => {
    const t = Number(searchParams.get('thang'))
    if (t >= 7 && t <= 10 && t !== thangF) setThangFState(t)
  }, [searchParams, thangF])
  const [khoChon] = useState<string>('Tất cả')
  const snapRef = useRef<HTMLDivElement>(null)
  const thacNuocRef = useRef<HTMLDivElement>(null)
  const isFree = s.goi === 'F'
  const moTuTrangChu = useMoTuTrangChu()

  // Kiểm tra liên kết báo cáo theo gói và chế độ hiện tại (QD45)
  const layLinkBaoCao = (code?: string): string | null => {
    if (!code) return null
    for (const m of MODULES) {
      const scDef = m.screens.find(x => x.code === code)
      if (scDef) {
        if (hienMan(scDef, s.goi, s.cheDo, s)) {
          return `/app/bao-cao/${scDef.slug}`
        }
        return null
      }
    }
    return null
  }

  const linkKQ = layLinkBaoCao('10.2.3')
  const linkDTien = layLinkBaoCao('2.2.9')
  const linkCP = layLinkBaoCao('10.4.3')

  const dsChonCn = useMemo(() => {
    return [
      { k: 'all', ten: 'Tất cả chi nhánh', moTa: 'Chỉ xem gộp, chưa lập chứng từ' },
      ...dsCn.map(c => ({ k: c.id, ten: c.ten, moTa: tenNgan(c.id) })),
    ]
  }, [dsCn])

  // Nhãn gói thuê bao (PRO, PLUS, STD, FREE)
  const nhanGoi = s.goi === 'PR' ? 'PRO' : s.goi === 'PL' ? 'PLUS' : s.goi === 'S' ? 'STD' : 'FREE'

  const selCns = useMemo(() => {
    if (!s.chiNhanh || s.chiNhanh === 'all') {
      return dsCn.map(c => c.id)
    }
    return [s.chiNhanh]
  }, [s.chiNhanh, dsCn])

  const d = useMemo(() => tinhToanTongQuan('thang-nay', selCns, s.cheDo), [selCns, s.cheDo])

  // Gói Free xem theo chi nhánh trên chip CN điện thoại (selCns) và tháng chọn (thangF)
  const kyXemFree: KyBaoCao = isFree ? (thangF === 10 ? 'thang-nay' : 'thang-truoc') : 'thang-nay'
  const dFree = useMemo(() => {
    if (!isFree) return d
    return tinhToanTongQuan(kyXemFree, selCns, s.cheDo, thangF)
  }, [isFree, kyXemFree, selCns, s.cheDo, thangF, d])

  // 1. Lãi lỗ gói Free: chi phí trong tháng không gồm phân bổ; lợi nhuận bỏ thu nhập, chi phí khác (T220, T230)
  // Chi phí NVL theo cách tính từng chi nhánh (T232), thay giá vốn món bán
  const nvlFree = useMemo(() => {
    if (!isFree) return { tien: 0, ds: [] }
    return nvlKy(s, selCns, thangF)
  }, [isFree, s, selCns, thangF])
  const cpThangFree = dFree.cpHoatDong - dFree.cpPhanBo
  const loiNhuanFree = dFree.dtThuan - nvlFree.tien - cpThangFree - dFree.cpPhanBo
  const bienFree = dFree.dtThuan > 0 ? loiNhuanFree / dFree.dtThuan : 0
  const chiLonFree = useMemo(() => [...dFree.coCauCp].sort((a, b) => b.v - a.v)[0], [dFree.coCauCp])
  const laiLo13 = useMemo(() => (isFree ? laiLo13Thang(s, selCns) : []), [isFree, s, selCns])
  const [moBieuDo, setMoBieuDo] = useState(false)

  // 2. Thu chi gói Free: số dư, thu, chi cộng từ Sổ quỹ tiền mặt, Sổ ngân hàng (T230)
  const quyFree = useMemo(() => {
    if (!isFree) return []
    return tonQuyTheoSo(thangF, selCns)
  }, [isFree, thangF, selCns])

  const tongQuyFree = useMemo(() => {
    return {
      cuoi: quyFree.reduce((a, r) => a + r.cuoi, 0),
      thu: quyFree.reduce((a, r) => a + r.thu, 0),
      chi: quyFree.reduce((a, r) => a + r.chi, 0),
    }
  }, [quyFree])

  // 3. Kho gói Free: mua hàng, công nợ, hao hụt trong tháng (T230)
  const tenCnSet = useMemo(() => new Set(CHI_NHANH.filter(c => selCns.includes(c.id)).map(c => c.ten)), [selCns])
  const khoFree = useMemo(() => {
    if (!isFree) return { nhapMua: 0, soDon: 0, congNo: 0, soNcc: 0, matHH: 0 }
    const thangArr = [thangF]
    const mua = chungTu(PHIEU_MUA, '4.1.1').filter(r => thangArr.includes(Number(r.thang)) && tenCnSet.has(String(r.cn)))
    const nhapMua = mua.reduce((a, r) => a + (Number(r.tong) || 0), 0)
    const motCn = selCns.length === 1 ? CHI_NHANH.find(c => c.id === selCns[0])?.ten : undefined
    const ncc = rowsCongNo('ncc', thangF, motCn).filter(r => !r._t)
    const congNo = ncc.reduce((a, r) => a + Math.max(0, Number(r.cuoi) || 0), 0)
    const cfgKK = timMan('kho', '5-1-10').sc?.voucher
    const xdc = cfgKK ? mauDieuChinh(cfgKK).filter(r => r.loai === 'xdc' && thangArr.includes(Number(r.thang)) && tenCnSet.has(String(r.cn))) : []
    const matHH = new Set(xdc.flatMap(r => ((r._dong as { ma: string }[] | undefined) ?? []).map(d => d.ma))).size
    return { nhapMua, soDon: mua.length, congNo, soNcc: ncc.filter(r => Number(r.cuoi) > 0).length, matHH }
  }, [isFree, selCns, tenCnSet, thangF])

  // Phải thu khách hàng (TK 131)
  const sc10 = soCai(10)
  const sc9 = soCai(9)
  const phaiThuNay = Math.max(0, sc10.cuoi['131'] || 0)
  const phaiThuTruoc = Math.max(0, sc9.cuoi['131'] || 0)
  const tangPhaiThu = phaiThuTruoc > 0 ? (phaiThuNay - phaiThuTruoc) / phaiThuTruoc : null

  // 1. Thao tác nhanh (5 ô biểu tượng tròn nền nhạt chữ dưới)
  const { sc: scThu } = timMan('tien', '2-1-1')
  const { sc: scChi } = timMan('tien', '2-1-1')
  const { sc: scNhap } = timMan('kho', '5-1-1')
  const { sc: scXuat } = timMan('kho', '5-1-2')
  const { sc: scSoQuy } = timMan('tien', '2-2-1')
  const { sc: scNhapMua } = timMan('mua-hang', '4-1-1')
  const { sc: scKiemKe } = timMan('kho', '5-1-10')

  const thaoTac5 = [
    {
      ten: 'Thu tiền',
      icon: 'cashin',
      to: '/app/tien/2-1-1/moi?loai=thu',
      khoa: scThu ? !moDuoc(scThu, s.goi) : false,
    },
    {
      ten: 'Chi tiền',
      icon: 'cashout',
      to: '/app/tien/2-1-1/moi?loai=chi',
      khoa: scChi ? !moDuoc(scChi, s.goi) : false,
    },
    {
      ten: 'Nhập kho',
      icon: 'filein',
      to: '/app/kho/5-1-1/moi',
      khoa: scNhap ? !moDuoc(scNhap, s.goi) : false,
    },
    {
      ten: 'Xuất kho',
      icon: 'pos',
      to: '/app/kho/5-1-2/moi',
      khoa: scXuat ? !moDuoc(scXuat, s.goi) : false,
    },
    {
      ten: 'Sổ quỹ',
      icon: 'wallet',
      to: '/app/tien/2-2-1',
      khoa: scSoQuy ? !moDuoc(scSoQuy, s.goi) : false,
    },
  ]

  // Thao tác nhanh riêng cho gói Free (T259): thêm Nhập mua và Kiểm kê
  const thaoTacFree = [
    thaoTac5[0],
    thaoTac5[1],
    {
      ten: 'Nhập mua',
      icon: 'truck',
      to: '/app/mua-hang/4-1-1/moi',
      khoa: scNhapMua ? !moDuoc(scNhapMua, s.goi) : false,
    },
    {
      ten: 'Kiểm kê',
      icon: 'clipboard',
      to: '/app/kho/5-1-10/moi',
      khoa: scKiemKe ? !moDuoc(scKiemKe, s.goi) : false,
    },
    thaoTac5[4],
  ]

  // 3. Dữ liệu tổng tồn kho
  const rowsDm = useMemo(() => dinhMucTon.rows(s.cheDo, 202610), [s.cheDo])
  const rowsDmLoc = useMemo(() => {
    if (khoChon === 'Tất cả') return rowsDm
    return rowsDm.filter(r => r.kho === khoChon)
  }, [rowsDm, khoChon])

  const nvlGia = useMemo(() => new Map(NVL.map(n => [n.ten, n.gia])), [])

  const { tongTienTon, soHetHang, soDuoiNgau, soVuotNgau } = useMemo(() => {
    let tong = 0, het = 0, duoi = 0, vuot = 0
    for (const r of rowsDmLoc) {
      const ton = Number(r.ton) || 0
      const min = Number(r.min) || 0
      const max = Number(r.max) || 0
      const gia = nvlGia.get(String(r.ten)) ?? 30000
      tong += Math.max(0, ton) * gia
      if (ton <= 0) het++
      else if (ton < min) duoi++
      else if (ton > max) vuot++
    }
    return {
      tongTienTon: tong,
      soHetHang: het,
      soDuoiNgau: duoi,
      soVuotNgau: vuot,
    }
  }, [rowsDmLoc, nvlGia])

  // 4. Chi phí nguyên vật liệu T10/2026
  const k10 = useMemo(() => kqkd(10, 2026), [])
  const pctGv10 = k10.dtThuan > 0 ? (k10.gv / k10.dtThuan) * 100 : 0

  // So sánh cùng kỳ tháng trước (01-07/10 so với 01-07/09)
  const gv9CungKy = useMemo(() => {
    const ds9 = DAILY.filter(d => d.date.getMonth() === 8 && d.date.getDate() <= 7)
    return ds9.reduce((a, b) => a + b.gv, 0)
  }, [])
  const tangGvThang = gv9CungKy > 0 ? (k10.gv - gv9CungKy) / gv9CungKy : 0
  const tangGvNam = 0.086 // So với cùng kỳ năm trước (+8,6%)

  // 5. Tỷ lệ chi phí nguyên vật liệu (các tháng 5 đến 10)
  const dataTrendNvl = useMemo(() => {
    return [5, 6, 7, 8, 9, 10].map(th => {
      const k = kqkd(th, 2026)
      const bien = k.dtThuan > 0 ? (k.gv / k.dtThuan) * 100 : 0
      return {
        l: 'T' + th,
        dt: k.gv,
        ln: k.gv,
        bien,
      }
    })
  }, [])

  // 7. Tỷ lệ tồn tại các kho
  const thongKeKho = useMemo(() => {
    const danhSachKho = Array.from(new Set(rowsDm.map(r => String(r.kho))))
    return danhSachKho.map(tenKho => {
      const cacDong = rowsDm.filter(r => r.kho === tenKho)
      const tong = cacDong.length || 1
      let het = 0, duoi = 0, vuot = 0, trong = 0
      for (const r of cacDong) {
        const ton = Number(r.ton) || 0
        const min = Number(r.min) || 0
        const max = Number(r.max) || 0
        if (ton <= 0) het++
        else if (ton < min) duoi++
        else if (ton > max) vuot++
        else trong++
      }
      return {
        tenKho,
        tong,
        het,
        duoi,
        vuot,
        trong,
        pctHet: (het / tong) * 100,
        pctDuoi: (duoi / tong) * 100,
        pctVuot: (vuot / tong) * 100,
        pctTrong: (trong / tong) * 100,
      }
    })
  }, [rowsDm])

  const thongKeTong = useMemo(() => {
    const rows = khoChon === 'Tất cả' ? rowsDm : rowsDm.filter(r => r.kho === khoChon)
    const tong = rows.length || 1
    let het = 0, duoi = 0, vuot = 0, trong = 0
    for (const r of rows) {
      const ton = Number(r.ton) || 0
      const min = Number(r.min) || 0
      const max = Number(r.max) || 0
      if (ton <= 0) het++
      else if (ton < min) duoi++
      else if (ton > max) vuot++
      else trong++
    }
    return {
      pctHet: Math.round((het / tong) * 100),
      pctDuoi: Math.round((duoi / tong) * 100),
      pctVuot: Math.round((vuot / tong) * 100),
      pctTrong: Math.round((trong / tong) * 100),
    }
  }, [rowsDm, khoChon])

  // 6. Hao hụt nguyên vật liệu (T222)
  const scXH = useMemo(() => timMan('kho', '5-1-2-3').sc, [])
  const scKK = useMemo(() => timMan('kho', '5-1-10').sc, [])

  const { tongTienHaoHut, pctHaoHut, top3HaoHut } = useMemo(() => {
    const cfgXH = scXH?.voucher
    const cfgKK = scKK?.voucher
    if (!cfgXH) return { tongTienHaoHut: 0, pctHaoHut: 0, top3HaoHut: [] }

    const rowsXH = chungTu(cfgXH, '5.1.2-3').filter(r => r.thang === 10)
    const rowsXDC = cfgKK ? mauDieuChinh(cfgKK).filter(r => r.thang === 10 && r.loai === 'xdc') : []

    const tenCnLoc = cn ? cn.ten : undefined
    const xhLoc = tenCnLoc ? rowsXH.filter(r => r.cn === tenCnLoc) : rowsXH
    const xdcLoc = tenCnLoc ? rowsXDC.filter(r => r.cn === tenCnLoc) : rowsXDC

    let tong = 0
    const itemMap = new Map<string, { ten: string; ma: string; tien: number }>()

    for (const r of xhLoc) {
      tong += Number(r.tien) || 0
      const lines = dongCua(cfgXH, '5.1.2-3-' + r.id)
      for (const l of lines) {
        const item = itemMap.get(l.ten) ?? { ten: l.ten, ma: l.ma, tien: 0 }
        item.tien += Number(l.tien) || 0
        itemMap.set(l.ten, item)
      }
    }

    for (const r of xdcLoc) {
      tong += Number(r.tien) || 0
      const lines = (r._dong as { ten: string; ma: string; tien: number }[] | undefined) ?? []
      for (const l of lines) {
        const item = itemMap.get(l.ten) ?? { ten: l.ten, ma: l.ma, tien: 0 }
        item.tien += Number(l.tien) || 0
        itemMap.set(l.ten, item)
      }
    }

    const top3 = [...itemMap.values()].sort((a, b) => b.tien - a.tien).slice(0, 3)
    const pctHh = k10.gv > 0 ? (tong / k10.gv) * 100 : 0

    return {
      tongTienHaoHut: tong,
      pctHaoHut: pctHh,
      top3HaoHut: top3,
    }
  }, [scXH, scKK, cn, k10.gv])

  // Thống kê chứng từ chưa ghi sổ (T222)
  const thongKeChungTuChuaGhi = useMemo(() => {
    let tongDem = 0
    let soMan = 0
    let topScreen: { to: string; scKey: [string, string]; dem: number } | null = null

    for (const m of MODULES) {
      for (const sc of m.screens) {
        if (!((sc.kind === 'voucher' || sc.voucher) && sc.voucher)) continue
        if (!hienMan(sc, s.goi, s.cheDo, s) || !moDuoc(sc, s.goi)) continue

        const cfg = sc.voucher
        const rows = cfg.rowsMau ? cfg.rowsMau() : chungTu(cfg, sc.code ?? sc.slug)
        const chuaGhi = rows.filter(r => r.tt === 'nhap' && (!cn || r.cn === cn.ten))
        if (chuaGhi.length === 0) continue

        tongDem += chuaGhi.length
        soMan += 1

        if (!topScreen || chuaGhi.length > topScreen.dem) {
          topScreen = {
            to: `/app/${m.key}/${sc.slug}?tt=nhap`,
            scKey: [m.key, sc.slug],
            dem: chuaGhi.length,
          }
        }
      }
    }

    return { tongDem, soMan, topScreen }
  }, [s.goi, s.cheDo, s, cn])

  // Danh sách việc cần theo dõi (Tab 2)
  const dsTheoDoi = useMemo(() => {
    const viecs: {
      id: string
      ten: string
      chiTiet: string
      icon: string
      to: string
      scKey: [string, string]
    }[] = []

    // 1. Công nợ phải thu quá hạn
    viecs.push({
      id: 'cong-no-qua-han',
      ten: 'Công nợ phải thu quá hạn',
      chiTiet: '4 khách hàng · 86.400.000 đ',
      icon: 'wallet',
      to: '/app/tien/2-2-5',
      scKey: ['tien', '2-2-5'],
    })

    // 2. Hàng tồn dưới định mức (tính từ dinhMucTon)
    const dsDuoi = rowsDm.filter(r => Number(r.ton) < Number(r.min))
    if (dsDuoi.length > 0) {
      viecs.push({
        id: 'hang-ton-duoi-dm',
        ten: 'Hàng tồn dưới định mức',
        chiTiet: `${dsDuoi.length} mặt hàng`,
        icon: 'box',
        to: '/app/kho/5-1-13',
        scKey: ['kho', '5-1-13'],
      })
    }

    // 3. Hạn nộp tờ khai thuế kế tiếp
    viecs.push({
      id: 'han-to-khai-thue',
      ten: 'Hạn nộp tờ khai thuế GTGT',
      chiTiet: 'Hạn 30/10/2026 (còn 23 ngày)',
      icon: 'percent',
      to: '/app/thue/6-2-3',
      scKey: ['thue', '6-2-3'],
    })

    // 4. Chứng từ chưa ghi sổ (T222)
    if (thongKeChungTuChuaGhi.tongDem > 0 && thongKeChungTuChuaGhi.topScreen) {
      viecs.push({
        id: 'chung-tu-chua-ghi',
        ten: 'Chứng từ chưa ghi sổ',
        chiTiet: `${thongKeChungTuChuaGhi.tongDem} chứng từ ở ${thongKeChungTuChuaGhi.soMan} màn`,
        icon: 'doc',
        to: thongKeChungTuChuaGhi.topScreen.to,
        scKey: thongKeChungTuChuaGhi.topScreen.scKey,
      })
    }

    // Lọc theo quyền gói: dòng nào màn gói không mở được thì ẩn
    return viecs.filter(v => {
      const { sc } = timMan(v.scKey[0], v.scKey[1])
      if (!sc) return true
      return moDuoc(sc, s.goi)
    })
  }, [rowsDm, s.goi, thongKeChungTuChuaGhi])

  // Danh sách chọn kho
  const dsChonKho = useMemo(() => {
    return [
      { k: 'Tất cả', ten: 'Tất cả kho' },
      ...KHO.map(k => ({ k, ten: k })),
    ]
  }, [])

  // Điều khiển chuyển tab bằng click và cuộn vuốt ngang
  const handleChuyenTab = (idx: 0 | 1) => {
    setTabActive(idx)
    if (snapRef.current) {
      const w = snapRef.current.clientWidth
      snapRef.current.scrollTo({ left: idx * w, behavior: 'smooth' })
    }
  }

  const handleScroll = () => {
    if (snapRef.current) {
      const { scrollLeft, clientWidth } = snapRef.current
      if (clientWidth > 0) {
        const idx = (Math.round(scrollLeft / clientWidth) as number) >= 1 ? 1 : 0
        if (idx !== tabActive) {
          setTabActive(idx)
        }
      }
    }
  }

  return (
    <div className="m-trang-chu" onClickCapture={moTuTrangChu}>
      {/* Đầu trang IVT: nền vàng kem chuyển trắng, logo vuông đè nhãn gói, cụm tìm kiếm & chuông bo tròn */}
      <section className="m-tc-dau">
        <div className="m-tc-dau-trai">
          <div className="m-tc-logo-hop">
            <span className="m-tc-goi-badge">{nhanGoi}</span>
            <div className="m-tc-logo-av">{dv.viettat}</div>
          </div>
          <div className="m-tc-don-vi">
            <h2 className="m-tc-dv-ten">{dv.ten}</h2>
            <div className="m-tc-dv-vai-tro">{ROLE[s.role]}</div>
          </div>
        </div>
        <div className="m-tc-dau-phai">
          <div className="m-tc-cum-phai">
            <button
              type="button"
              className="m-tc-nut-tron"
              onClick={() => setMoTimKiem(true)}
              title="Tìm kiếm"
              aria-label="Tìm kiếm màn hình"
            >
              <Icon n="search" className="ic sm" />
            </button>
            <button
              type="button"
              className="m-tc-nut-tron"
              title="Thông báo"
            >
              <Icon n="bell" className="ic sm" />
              {dsTheoDoi.length > 0 && <span className="m-tc-badge-so">{dsTheoDoi.length}</span>}
            </button>
          </div>
        </div>
      </section>

      {/* Hàng điều hướng đầu trang chủ: gói Free 1 hàng gọn, gói khác tab một hàng, chip chi nhánh hàng dưới (T257 phần D) */}
      {isFree ? (
        <div className="m-tc-thanh-dieu-huong m-tc-thanh-dieu-huong--free">
          <div className="m-free-ky-wrap">
            <Select
              className="sel-mini m-free-sel-nam"
              value="2026"
              aria-label="Năm"
              disabled
            >
              <option value="2026">Năm 2026</option>
            </Select>
            <Select
              className="sel-mini m-free-sel-thang"
              value={String(thangF)}
              aria-label="Tháng"
              onChange={e => setThangF(Number(e.target.value))}
            >
              {[10, 9, 8, 7].map(t => (
                <option key={t} value={t}>
                  Tháng {t}
                </option>
              ))}
            </Select>
          </div>

          <button
            type="button"
            className="m-tc-chip-cn m-tc-chip-kho"
            onClick={() => setMoChonCn(true)}
            title="Chọn chi nhánh hiển thị"
          >
            <span className="m-tc-chip-cn-nhan m-tc-chip-kho-nhan">CN: {nhanCn}</span>
            <Icon n="chevd" className="ic xs" />
          </button>
        </div>
      ) : (
        <div className="m-tc-thanh-dieu-huong m-tc-thanh-dieu-huong--goi-khac">
          <div className="m-tc-hang-tab">
            <div className="m-tc-vien-thuoc">
              <button
                type="button"
                className={`m-tc-tab ${tabActive === 0 ? 'on' : ''}`}
                onClick={() => handleChuyenTab(0)}
              >
                Quản trị
              </button>
              <button
                type="button"
                className={`m-tc-tab ${tabActive === 1 ? 'on' : ''}`}
                onClick={() => handleChuyenTab(1)}
              >
                Cần theo dõi
                {dsTheoDoi.length > 0 && <span className="m-tc-tab-dem">{dsTheoDoi.length}</span>}
              </button>
            </div>
          </div>

          <div className="m-tc-hang-chip">
            <button
              type="button"
              className="m-tc-chip-cn m-tc-chip-kho"
              onClick={() => setMoChonCn(true)}
              title="Chọn chi nhánh hiển thị"
            >
              <span className="m-tc-chip-cn-nhan m-tc-chip-kho-nhan">CN: {nhanCn}</span>
              <Icon n="chevd" className="ic xs" />
            </button>
          </div>
        </div>
      )}

      {/* Khung chứa 2 trang vuốt ngang bằng scroll-snap */}
      <div className="m-tc-snap-wrap" ref={snapRef} onScroll={handleScroll}>
        {/* TRANG 1: QUẢN TRỊ (CÁC THẺ THEO BỐ CỤC IVT) */}
        <div className="m-tc-snap-trang">
          {/* Thao tác nhanh cho các gói khác (giữ ở đầu) */}
          {!isFree && (
            <div className="m-tc-the-ivt">
              <div className="m-tc-the-head">
                <div className="m-tc-the-tieu-hop">
                  <h3 className="m-tc-the-tieu">Thao tác nhanh</h3>
                  <span className="m-tc-the-info" title="Các thao tác nhanh thường dùng">
                    <Icon n="info" className="ic xs" />
                  </span>
                </div>
                <button
                  type="button"
                  className="m-tc-the-link"
                  onClick={() => nav('/app/trang-chu/tong-quan')}
                >
                  Tuỳ chỉnh
                </button>
              </div>
              <div className="m-tc-nhanh-5">
                {thaoTac5.map(item => (
                  <Link
                    key={item.ten}
                    to={item.to}
                    className={`m-tc-nhanh-o5${item.khoa ? ' khoa' : ''}`}
                  >
                    <div className="m-tc-nhanh-ic-tron">
                      <Icon n={item.icon} className="ic sm" />
                      {item.khoa && (
                        <span className="m-tc-nhanh-lk">
                          <Icon n="lock" className="ic xs" />
                        </span>
                      )}
                    </div>
                    <span className="m-tc-nhanh-ten5">{item.ten}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {isFree ? (
            <>
              {/* Thao tác nhanh cho gói Free (đặt trên thẻ Quản lý lãi lỗ, ẩn các thao tác bị khoá (T259)) */}
              {thaoTacFree.filter(i => !i.khoa).length > 0 && (
                <div className="m-tc-the-ivt">
                  <div className="m-tc-the-head">
                    <div className="m-tc-the-tieu-hop">
                      <h3 className="m-tc-the-tieu">Thao tác nhanh</h3>
                      <span className="m-tc-the-info" title="Các thao tác nhanh thường dùng">
                        <Icon n="info" className="ic xs" />
                      </span>
                    </div>
                  </div>
                  <div className="m-tc-nhanh-5">
                    {thaoTacFree.filter(i => !i.khoa).map(item => (
                      <Link
                        key={item.ten}
                        to={item.to}
                        className="m-tc-nhanh-o5"
                      >
                        <div className="m-tc-nhanh-ic-tron">
                          <Icon n={item.icon} className="ic sm" />
                        </div>
                        <span className="m-tc-nhanh-ten5">{item.ten}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 1. Quản lý lãi lỗ */}
              <div className="m-tc-the-ivt m-free-the">
                <div className="m-tc-the-head">
                  <div className="m-tc-the-tieu-hop">
                    <h3 className="m-tc-the-tieu">
                      <Icon n="chart" className="ic sm" /> 1. Quản lý lãi lỗ
                    </h3>
                  </div>
                </div>
                <div className="m-free-hoi">
                  {thangF === 10 ? 'Tháng này' : `Tháng ${thangF}`} lãi bao nhiêu?
                </div>
                <div className={`m-tc-so-lon m-free-tra ${loiNhuanFree >= 0 ? 'lai' : 'lo'}`}>
                  {loiNhuanFree >= 0 ? '+' : '−'}{short(Math.abs(loiNhuanFree))}
                </div>
                <div className="m-free-phu">Biên lãi {pct(bienFree)} trên doanh thu</div>

                <div className="bbt-chan" style={{ marginTop: 8 }}>
                  <button type="button" className="bbt-nut" onClick={() => setMoBieuDo(true)}>
                    Xem biểu đồ lãi lỗ 13 tháng
                    <Icon n="chevr" className="ic sm" />
                  </button>
                </div>

                {/* Báo cáo lãi lỗ tháng */}
                <div className="tll" style={{ marginTop: 14 }}>
                  <div className="tll-dau"><b>Báo cáo lãi lỗ tháng</b></div>
                  <div className="tll-the dt">
                    <div className="tll-trai">
                      <b>Doanh thu</b>
                    </div>
                    <div className="tll-phai">
                      <b>{moneyD(dFree.dtThuan)}</b>
                    </div>
                  </div>

                  <Link
                    to={`/app/trang-chu/chi-phi-nvl?thang=${thangF}`}
                    className="tll-the cp tll-link"
                    title="Xem chi phí nguyên vật liệu"
                  >
                    <div className="tll-trai">
                      <b>Chi phí nguyên vật liệu</b>
                      <span>{moTaCach(nvlFree.ds)}</span>
                    </div>
                    <div className="tll-phai">
                      <b>{moneyD(nvlFree.tien)}</b>
                      <span>{pct(dFree.dtThuan > 0 ? nvlFree.tien / dFree.dtThuan : 0)}</span>
                    </div>
                    <Icon n="chevr" className="ic sm tll-mui" />
                  </Link>

                  <Link
                    to={`/app/trang-chu/chi-phi-thang?thang=${thangF}`}
                    className="tll-the cp tll-link"
                    title="Xem chi phí trong tháng"
                  >
                    <div className="tll-trai">
                      <b>Chi phí trong tháng</b>
                      <span>
                        {chiLonFree
                          ? `Nhiều nhất: ${chiLonFree.l} ${short(chiLonFree.v)}`
                          : 'Lương, mặt bằng, điện nước, chi khác'}
                      </span>
                    </div>
                    <div className="tll-phai">
                      <b>{moneyD(cpThangFree)}</b>
                      <span>{pct(dFree.dtThuan > 0 ? cpThangFree / dFree.dtThuan : 0)}</span>
                    </div>
                    <Icon n="chevr" className="ic sm tll-mui" />
                  </Link>

                  <Link
                    to="/app/ccdc/8-1-1"
                    className="tll-the cp tll-link"
                    title="Xem chi phí phân bổ hàng tháng"
                  >
                    <div className="tll-trai">
                      <b>Chi phí phân bổ hàng tháng</b>
                      <span>Phân bổ công cụ dụng cụ, khấu hao</span>
                    </div>
                    <div className="tll-phai">
                      <b>{moneyD(dFree.cpPhanBo)}</b>
                      <span>{pct(dFree.dtThuan > 0 ? dFree.cpPhanBo / dFree.dtThuan : 0)}</span>
                    </div>
                    <Icon n="chevr" className="ic sm tll-mui" />
                  </Link>

                  <div className={`tll-the ${loiNhuanFree >= 0 ? 'lai' : 'lo'}`}>
                    <div className="tll-trai">
                      <b>Lợi nhuận</b>
                    </div>
                    <div className="tll-phai">
                      <b>
                        {loiNhuanFree < 0 ? '−' : ''}
                        {moneyD(Math.abs(loiNhuanFree))}
                      </b>
                      <span>{pct(dFree.dtThuan > 0 ? loiNhuanFree / dFree.dtThuan : 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Quản lý thu chi */}
              <div className="m-tc-the-ivt m-free-the">
                <div className="m-tc-the-head">
                  <div className="m-tc-the-tieu-hop">
                    <h3 className="m-tc-the-tieu">
                      <Icon n="wallet" className="ic sm" /> 2. Quản lý thu chi
                    </h3>
                  </div>
                </div>
                <div className="m-free-hoi">
                  {thangF === 10 ? 'Tồn quỹ hiện tại' : `Tồn quỹ cuối tháng ${thangF}/2026`}
                </div>
                <div className="m-tc-so-lon m-free-tra">
                  {short(tongQuyFree.cuoi)}
                </div>
                <div className="m-free-phu">
                  Thu +{short(tongQuyFree.thu)} · Chi −{short(tongQuyFree.chi)}
                </div>

                <div className="bbt-chan" style={{ marginTop: 8 }}>
                  <Link to="/app/danh-muc/1-12?moi=1&goiY=thuchi" className="bbt-nut">
                    Tạo quỹ
                    <Icon n="chevr" className="ic sm" />
                  </Link>
                  <span className="bbt-goiy">Bấm vào quỹ bên dưới để xem lịch sử thu chi</span>
                </div>

                {/* Tồn quỹ hiện tại */}
                <div className="tll" style={{ marginTop: 14 }}>
                  <div className="tll-dau">
                    <b>
                      {thangF === 10
                        ? 'Tồn quỹ hiện tại'
                        : `Tồn quỹ cuối tháng ${thangF}/2026`}
                    </b>
                  </div>
                  <div className="tll-the dt">
                    <div className="tll-trai">
                      <b>Tổng tồn quỹ</b>
                    </div>
                    <div className="tll-phai">
                      <b>{moneyD(tongQuyFree.cuoi)}</b>
                    </div>
                  </div>
                  {quyFree.map(r => (
                    <Link
                      key={r.quy}
                      to={`/app/trang-chu/lich-su-quy?quy=${encodeURIComponent(r.quy)}&thang=${thangF}`}
                      className="tll-the quy tll-link"
                      title={`Xem lịch sử thu chi ${r.quy}`}
                    >
                      <div className="tll-trai">
                        <b>{r.quy}</b>
                        <span>{r.tienMat ? 'Tiền mặt' : 'Ngân hàng'}</span>
                      </div>
                      <div className="tll-phai">
                        <b>{moneyD(r.cuoi)}</b>
                        <span>{pct(tongQuyFree.cuoi ? r.cuoi / tongQuyFree.cuoi : 0)}</span>
                      </div>
                      <Icon n="chevr" className="ic sm tll-mui" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* 3. Quản lý kho */}
              <div className="m-tc-the-ivt m-free-the">
                <div className="m-tc-the-head">
                  <div className="m-tc-the-tieu-hop">
                    <h3 className="m-tc-the-tieu">
                      <Icon n="khohang" className="ic sm" /> 3. Quản lý kho
                    </h3>
                  </div>
                </div>
                <div className="m-free-hoi">Quản lý mua hàng, công nợ, hao hụt hàng bán thẳng</div>
                <div className="m-free-phu" style={{ marginTop: 6 }}>
                  Mua {khoFree.soDon} đơn · Công nợ {short(khoFree.congNo)} · {khoFree.matHH} mặt hàng hao hụt
                </div>

                {/* Mua hàng, công nợ, hao hụt tháng X */}
                <div className="tll" style={{ marginTop: 14 }}>
                  <div className="tll-dau"><b>Mua hàng, công nợ, hao hụt tháng {thangF}</b></div>
                  <Link to="/app/mua-hang/4-1-1" className="tll-the quy tll-link" title="Xem nhập mua">
                    <div className="tll-trai">
                      <b>Nhập mua</b>
                      <span>{khoFree.soDon} đơn mua hàng</span>
                    </div>
                    <div className="tll-phai">
                      <b>{moneyD(khoFree.nhapMua)}</b>
                    </div>
                    <Icon n="chevr" className="ic sm tll-mui" />
                  </Link>

                  <Link
                    to="/app/bao-cao/4-2-3"
                    className="tll-the cp tll-link"
                    title="Xem công nợ phải trả"
                    onClick={() => datLocDaXem('/app/bao-cao/4-2-3', {}, String(thangF))}
                  >
                    <div className="tll-trai">
                      <b>Công nợ phải trả</b>
                      <span>{khoFree.soNcc} nhà cung cấp còn nợ</span>
                    </div>
                    <div className="tll-phai">
                      <b>{moneyD(khoFree.congNo)}</b>
                    </div>
                    <Icon n="chevr" className="ic sm tll-mui" />
                  </Link>

                  <Link
                    to="/app/bao-cao/5-2-15"
                    className="tll-the hh tll-link"
                    title="Xem hao hụt kiểm kê"
                    onClick={() => datLocDaXem('/app/bao-cao/5-2-15', {}, String(thangF))}
                  >
                    <div className="tll-trai">
                      <b>Hao hụt kiểm kê</b>
                      <span>
                        Các mặt hàng thừa thiếu trong kỳ
                      </span>
                    </div>
                    <div className="tll-phai">
                      <b>{khoFree.matHH} mặt hàng</b>
                    </div>
                    <Icon n="chevr" className="ic sm tll-mui" />
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Thẻ 2: Doanh thu, lợi nhuận, tiền hiện có (lưới 2 cột) */}
              <div className="m-tc-the-ivt">
            <div className="m-tc-the-head">
              <div className="m-tc-the-tieu-hop">
                <h3 className="m-tc-the-tieu">Tổng quan tài chính</h3>
                <span className="m-tc-the-info" title="Doanh thu, lợi nhuận và tiền">
                  <Icon n="info" className="ic xs" />
                </span>
              </div>
              {isFree ? (
                <Link to="/app/trang-chu/tong-quan" className="m-tc-the-link">
                  Chi tiết
                </Link>
              ) : (
                <button
                  type="button"
                  className="m-tc-the-link"
                  onClick={() => {
                    thacNuocRef.current?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Chi tiết
                </button>
              )}
            </div>
            <div className="m-tc-kpi-luoi">
              <div className="m-tc-kpi-muc">
                <div className="m-tc-kpi-nhan">Doanh thu thuần</div>
                <div className="m-tc-kpi-so">{money(d.dtThuan)} đ</div>
                <SoSanhDong tang={d.tangDT} label={d.tangDT !== null ? d.soSanhLabel : ''} />
                {!isFree && d.sparkDT && d.sparkDT.length > 1 && (
                  <div className="m-tc-kpi-spark">
                    <Spark values={d.sparkDT} w={86} h={24} color="#0560a6" />
                  </div>
                )}
              </div>
              <div className="m-tc-kpi-muc">
                <div className="m-tc-kpi-nhan">Lợi nhuận trước thuế</div>
                <div className="m-tc-kpi-so">{money(d.lnTruocThue)} đ</div>
                <SoSanhDong tang={d.tangLNTT} label={`· Biên ${pct(d.bienLNTT)}`} />
                {!isFree && d.sparkLNTT && d.sparkLNTT.length > 1 && (
                  <div className="m-tc-kpi-spark">
                    <Spark values={d.sparkLNTT} w={86} h={24} color="#138a52" />
                  </div>
                )}
              </div>
              <div className="m-tc-kpi-muc">
                <div className="m-tc-kpi-nhan">Tiền hiện có</div>
                <div className="m-tc-kpi-so">{money(d.tienKhaDung)} đ</div>
                <SoSanhDong tang={d.tangTien} label={`· Đủ chi ${d.soNgayDuChi} ngày`} />
                {!isFree && d.sparkTien && d.sparkTien.length > 1 && (
                  <div className="m-tc-kpi-spark">
                    <Spark values={d.sparkTien} w={86} h={24} color="#0b2c6b" />
                  </div>
                )}
              </div>
              <div className="m-tc-kpi-muc">
                <div className="m-tc-kpi-nhan">Phải thu khách hàng</div>
                <div className="m-tc-kpi-so">{money(phaiThuNay)} đ</div>
                <SoSanhDong tang={tangPhaiThu} label={tangPhaiThu !== null ? 'so với T9' : ''} />
              </div>
            </div>
          </div>

          {!isFree && (
            <>
              {/* Thẻ: Thác nước lợi nhuận */}
              <div className="m-tc-the-ivt" ref={thacNuocRef} id="m-the-thac-nuoc">
                <div className="m-tc-the-head">
                  <div className="m-tc-the-tieu-hop">
                    <h3 className="m-tc-the-tieu">Thác nước lợi nhuận</h3>
                    <span className="m-tc-the-info" title="Doanh thu thuần → Giá vốn → Chi phí → Lợi nhuận trước thuế">
                      <Icon n="info" className="ic xs" />
                    </span>
                  </div>
                  {linkKQ && (
                    <Link to={linkKQ} className="m-tc-the-link">
                      Chi tiết
                    </Link>
                  )}
                </div>
                <div className="chart-legend-row">
                  <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#0560a6' }} /> Doanh thu</span>
                  <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#f28020' }} /> Giá vốn</span>
                  <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#c2362b' }} /> Bán hàng</span>
                  <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#a86a0c' }} /> Quản lý</span>
                  <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#138a52' }} /> Lợi nhuận</span>
                </div>
                <WaterfallChart data={d.thacNuoc} h={230} compact />
              </div>

              {/* Thẻ: Xu hướng kinh doanh 4 tháng */}
              <div className="m-tc-the-ivt">
                <div className="m-tc-the-head">
                  <div className="m-tc-the-tieu-hop">
                    <h3 className="m-tc-the-tieu">Xu hướng kinh doanh 4 tháng</h3>
                    <span className="m-tc-the-info" title="Doanh thu (cột), lợi nhuận trước thuế và biên lãi (%) qua các tháng">
                      <Icon n="info" className="ic xs" />
                    </span>
                  </div>
                </div>
                <div className="chart-legend-row">
                  <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#0560a6' }} /> Doanh thu thuần</span>
                  <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#138a52' }} /> LNTT</span>
                  <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#f28020' }} /> Biên lãi %</span>
                </div>
                <TrendChart data={d.trend} h={230} />
              </div>

              {/* Thẻ: Dòng tiền kỳ */}
              <div className="m-tc-the-ivt">
                <div className="m-tc-the-head">
                  <div className="m-tc-the-tieu-hop">
                    <h3 className="m-tc-the-tieu">Dòng tiền kỳ</h3>
                    <span className="m-tc-the-info" title={d.ghiChuDongTien ?? "Số dư đầu kỳ, dòng tiền thu, chi và tiền cuối kỳ khớp sổ cái"}>
                      <Icon n="info" className="ic xs" />
                    </span>
                  </div>
                  {linkDTien && (
                    <Link to={linkDTien} className="m-tc-the-link">
                      Chi tiết
                    </Link>
                  )}
                </div>
                <div className="chart-legend-row">
                  <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#0b2c6b' }} /> Đầu kỳ</span>
                  <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#138a52' }} /> Thu tiền</span>
                  <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#c2362b' }} /> Chi tiền</span>
                  <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#0560a6' }} /> Cuối kỳ</span>
                </div>
                <CashFlowChart
                  dau={d.dongTien.dau}
                  thu={d.dongTien.thu}
                  chi={d.dongTien.chi}
                  cuoi={d.dongTien.cuoi}
                  h={210}
                />
                <div className="row" style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--line-2)', fontSize: 13 }}>
                  <span className="muted">Dòng tiền thuần trong kỳ:</span>
                  <span className="grow" />
                  <b className={d.dongTien.thu >= d.dongTien.chi ? 'up' : 'down'}>
                    {d.dongTien.thu >= d.dongTien.chi ? '+' : ''}{money(d.dongTien.thu - d.dongTien.chi)} đ
                  </b>
                </div>
              </div>

              {/* Thẻ: Hiệu quả theo chi nhánh */}
              <div className="m-tc-the-ivt">
                <div className="m-tc-the-head">
                  <div className="m-tc-the-tieu-hop">
                    <h3 className="m-tc-the-tieu">Hiệu quả theo chi nhánh</h3>
                    <span className="m-tc-the-info" title={`Doanh thu và biên lãi gộp từng điểm bán · ${d.kyLabel}`}>
                      <Icon n="info" className="ic xs" />
                    </span>
                  </div>
                </div>
                <BranchBarChart data={d.chiNhanh} />
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line-2)' }} className="row">
                  <span className="muted">Số đơn hàng</span>
                  <span className="grow" />
                  <b className="num" style={{ color: 'var(--ink)' }}>{money(d.soDon)}</b>
                </div>
                <div className="row" style={{ marginTop: 4 }}>
                  <span className="muted">Giá trị trung bình một đơn (AOV)</span>
                  <span className="grow" />
                  <b className="num" style={{ color: 'var(--ink)' }}>{money(d.aov)} đ</b>
                </div>
              </div>

              {/* Thẻ: Cơ cấu chi phí */}
              <div className="m-tc-the-ivt">
                <div className="m-tc-the-head">
                  <div className="m-tc-the-tieu-hop">
                    <h3 className="m-tc-the-tieu">Cơ cấu chi phí</h3>
                    <span className="m-tc-the-info" title={d.isLocCn ? 'Chi phí phân bổ theo doanh thu' : `Chi phí hoạt động · ${d.kyLabel}`}>
                      <Icon n="info" className="ic xs" />
                    </span>
                  </div>
                  {linkCP && (
                    <Link to={linkCP} className="m-tc-the-link">
                      Chi tiết
                    </Link>
                  )}
                </div>
                <CostStructureChart parts={d.coCauCp} compact />
              </div>

              {/* Thẻ: Món bán chạy */}
              <div className="m-tc-the-ivt">
                <div className="m-tc-the-head">
                  <div className="m-tc-the-tieu-hop">
                    <h3 className="m-tc-the-tieu">Món bán chạy</h3>
                    <span className="m-tc-the-info" title={d.kyLabel}>
                      <Icon n="info" className="ic xs" />
                    </span>
                  </div>
                </div>
                <HBars
                  color="#f28020"
                  fmt={n => money(n) + ' phần'}
                  data={[
                    { l: 'Phở bò tái', v: Math.round(d.soDon * 0.42) },
                    { l: 'Cà phê sữa đá', v: Math.round(d.soDon * 0.38) },
                    { l: 'Cơm tấm sườn bì chả', v: Math.round(d.soDon * 0.27) },
                    { l: 'Trà đào cam sả', v: Math.round(d.soDon * 0.22) },
                    { l: 'Bún chả Hà Nội', v: Math.round(d.soDon * 0.18) },
                  ]}
                />
              </div>
            </>
          )}

          {/* Thẻ 3: Tổng tồn kho */}
          <div className="m-tc-the-ivt">
            <div className="m-tc-the-head">
              <div className="m-tc-the-tieu-hop">
                <h3 className="m-tc-the-tieu">Tổng tồn kho</h3>
                <span className="m-tc-the-info" title="Tổng giá trị tồn kho và tình trạng định mức">
                  <Icon n="info" className="ic xs" />
                </span>
              </div>
              <Link to="/app/kho/5-1-13" className="m-tc-the-link">
                Chi tiết
              </Link>
            </div>
            <div className="m-tc-so-lon">{money(tongTienTon)} đ</div>
            <hr className="m-tc-ke" />
            <div className="m-tc-3cot">
              <div className="m-tc-cot-muc">
                <div className="m-tc-cot-nhan">Hết hàng</div>
                <div className="m-tc-cot-so do">{soHetHang} HH</div>
              </div>
              <div className="m-tc-cot-muc">
                <div className="m-tc-cot-nhan">Dưới ngưỡng</div>
                <div className="m-tc-cot-so cam">{soDuoiNgau} HH</div>
              </div>
              <div className="m-tc-cot-muc">
                <div className="m-tc-cot-nhan">Vượt ngưỡng</div>
                <div className="m-tc-cot-so cam">{soVuotNgau} HH</div>
              </div>
            </div>
          </div>

          {/* Thẻ 4: Chi phí nguyên vật liệu T10/2026 */}
          <div className="m-tc-the-ivt">
            <div className="m-tc-the-head">
              <div className="m-tc-the-tieu-hop">
                <h3 className="m-tc-the-tieu">Chi phí nguyên vật liệu T10/2026</h3>
                <span className="m-tc-the-info" title="Chi phí giá vốn nguyên vật liệu trong tháng">
                  <Icon n="info" className="ic xs" />
                </span>
              </div>
              <Link to="/app/bao-cao/nhom-kho" className="m-tc-the-link">
                Chi tiết
              </Link>
            </div>
            <div className="m-tc-nvl-hang-so">
              <span className="m-tc-so-lon">{money(k10.gv)} đ</span>
              <span className="m-tc-nvl-cam">({pctGv10.toFixed(1)}% doanh thu)</span>
            </div>
            <hr className="m-tc-ke" />
            <div className="m-tc-2cot">
              <div className="m-tc-cot-muc">
                <div className={`m-tc-ss-ivt ${tangGvThang >= 0 ? 'tang' : 'giam'}`}>
                  <span className="m-tc-ss-mui-ten">{tangGvThang >= 0 ? '▲ +' : '▼ -'}{pct(Math.abs(tangGvThang))}</span>
                </div>
                <div className="m-tc-ss-chu">so với cùng kỳ tháng trước</div>
              </div>
              <div className="m-tc-cot-muc">
                <div className={`m-tc-ss-ivt ${tangGvNam >= 0 ? 'tang' : 'giam'}`}>
                  <span className="m-tc-ss-mui-ten">{tangGvNam >= 0 ? '▲ +' : '▼ -'}{pct(Math.abs(tangGvNam))}</span>
                </div>
                <div className="m-tc-ss-chu">so với cùng kỳ năm trước</div>
              </div>
            </div>
          </div>

          {/* Thẻ 5: Tỷ lệ chi phí nguyên vật liệu */}
          <div className="m-tc-the-ivt">
            <div className="m-tc-the-head">
              <div className="m-tc-the-tieu-hop">
                <h3 className="m-tc-the-tieu">Tỷ lệ chi phí nguyên vật liệu</h3>
                <span className="m-tc-the-info" title="Diễn biến chi phí và tỷ lệ nguyên vật liệu qua các tháng">
                  <Icon n="info" className="ic xs" />
                </span>
              </div>
              <div className="m-tc-bd-head-chon">
                Năm 2026 <Icon n="chevd" className="ic xs" />
              </div>
            </div>
            <div className="m-tc-bd-wrap">
              <TrendChart data={dataTrendNvl} h={210} />
            </div>
          </div>

          {/* Thẻ 6: Hao hụt nguyên vật liệu (T222) */}
          <div className="m-tc-the-ivt m-tc-the">
            <div className="m-tc-the-head">
              <div className="m-tc-the-tieu-hop">
                <h3 className="m-tc-the-tieu">Hao hụt nguyên vật liệu</h3>
                <span className="m-tc-the-info" title="Hao hụt nguyên vật liệu trong tháng">
                  <Icon n="info" className="ic xs" />
                </span>
              </div>
              <Link to="/app/kho/5-1-2-3" className="m-tc-the-link">
                Chi tiết
              </Link>
            </div>
            <div className="m-tc-nvl-hang-so">
              <span className="m-tc-so-lon">{money(tongTienHaoHut)} đ</span>
              <span className="m-tc-nvl-cam">({pctHaoHut.toFixed(1)}% chi phí NVL)</span>
            </div>
            <hr className="m-tc-ke" />
            <div className="m-tc-hh-top3">
              <div className="m-tc-hh-top3-tieu">Mặt hàng hao hụt nhiều nhất</div>
              <div className="m-tc-hh-ds">
                {top3HaoHut.map((item, idx) => (
                  <div key={item.ma || idx} className="m-tc-hh-dong">
                    <div className="m-tc-hh-dong-trai">
                      <span className="m-tc-hh-rank">{idx + 1}</span>
                      <span className="m-tc-hh-ten" title={item.ten}>{item.ten}</span>
                    </div>
                    <span className="m-tc-hh-tien">{money(item.tien)} đ</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Thẻ 7: Tỷ lệ tồn tại các kho */}
          <div className="m-tc-the-ivt">
            <div className="m-tc-the-head">
              <div className="m-tc-the-tieu-hop">
                <h3 className="m-tc-the-tieu">Tỷ lệ tồn tại các kho</h3>
                <span className="m-tc-the-info" title="Phân bổ trạng thái tồn định mức của từng kho">
                  <Icon n="info" className="ic xs" />
                </span>
              </div>
              <Link to="/app/kho/5-1-13" className="m-tc-the-link">
                Chi tiết
              </Link>
            </div>

            <div className="m-tc-kho-khung-xam">
              <div className="m-tc-kho-ten">{khoChon === 'Tất cả' ? 'Tất cả kho' : khoChon}</div>
              <div className="m-tc-kho-chu-thich">
                <span className="m-tc-ct-muc">
                  <i className="m-tc-ct-cham do" /> Hết hàng {thongKeTong.pctHet}%
                </span>
                <span className="m-tc-ct-muc">
                  <i className="m-tc-ct-cham cam" /> Dưới ngưỡng {thongKeTong.pctDuoi}%
                </span>
                <span className="m-tc-ct-muc">
                  <i className="m-tc-ct-cham tim" /> Vượt ngưỡng {thongKeTong.pctVuot}%
                </span>
                <span className="m-tc-ct-muc">
                  <i className="m-tc-ct-cham xanh" /> Trong ngưỡng {thongKeTong.pctTrong}%
                </span>
                <span className="m-tc-ct-muc">
                  <i className="m-tc-ct-cham xam" /> Khác 0%
                </span>
              </div>
            </div>

            <div className="m-tc-kho-ds-dong">
              {thongKeKho.map(k => (
                <div key={k.tenKho} className="m-tc-kho-dong">
                  <div className="m-tc-kho-dong-ten">{k.tenKho}</div>
                  <div className="m-tc-kho-thanh-wrap">
                    {k.pctHet > 0 && (
                      <div
                        className="m-tc-kho-phan do"
                        style={{ width: `${k.pctHet}%` }}
                        title={`Hết hàng: ${k.pctHet.toFixed(0)}%`}
                      />
                    )}
                    {k.pctDuoi > 0 && (
                      <div
                        className="m-tc-kho-phan cam"
                        style={{ width: `${k.pctDuoi}%` }}
                        title={`Dưới ngưỡng: ${k.pctDuoi.toFixed(0)}%`}
                      />
                    )}
                    {k.pctVuot > 0 && (
                      <div
                        className="m-tc-kho-phan tim"
                        style={{ width: `${k.pctVuot}%` }}
                        title={`Vượt ngưỡng: ${k.pctVuot.toFixed(0)}%`}
                      />
                    )}
                    {k.pctTrong > 0 && (
                      <div
                        className="m-tc-kho-phan xanh"
                        style={{ width: `${k.pctTrong}%` }}
                        title={`Trong ngưỡng: ${k.pctTrong.toFixed(0)}%`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
            </>
          )}
        </div>

        {/* TRANG 2: CẦN THEO DÕI (chỉ các gói khác) */}
        {!isFree && (
          <div className="m-tc-snap-trang">
            <section className="m-tc-ds-theo-doi">
              {dsTheoDoi.length === 0 ? (
                <div className="m-tc-ctd-trong">Không có việc cần theo dõi</div>
              ) : (
                <div className="m-tc-ctd-ds">
                  {dsTheoDoi.map(v => (
                    <div
                      key={v.id}
                      className="m-tc-ctd-dong"
                      onClick={() => nav(v.to)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="m-tc-ctd-ic">
                        <Icon n={v.icon} className="ic sm" />
                      </div>
                      <div className="m-tc-ctd-nd">
                        <div className="m-tc-ctd-ten">{v.ten}</div>
                        <div className="m-tc-ctd-sub">{v.chiTiet}</div>
                      </div>
                      <Icon n="chevr" className="ic sm m-tc-theo-doi-mui-ten" />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Lớp phủ tìm kiếm màn hình */}
      <MTimKiem mo={moTimKiem} onDong={() => setMoTimKiem(false)} />

      {/* Sheet chọn chi nhánh */}
      <MChon
        mo={moChonCn}
        onDong={() => setMoChonCn(false)}
        tieuDe="Chọn chi nhánh làm việc"
        ds={dsChonCn}
        chon={s.chiNhanh || 'all'}
        onChon={k => set({ chiNhanh: k })}
      />

      {/* Hộp biểu đồ lãi lỗ 13 tháng cho gói Free */}
      {moBieuDo && <HopLaiLo13 ds={laiLo13} onDong={() => setMoBieuDo(false)} />}
    </div>
  )
}
