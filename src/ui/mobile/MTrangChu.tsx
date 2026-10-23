import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { donViHienTai, dsCuaHang, useSession } from '../../app/session'
import { CUA_HANG, DAILY, KHO, NVL, ROLE, kqkd } from '../../data/mock'
import { Icon, ONen } from '../Icon'
import { money, pct } from '../format'
import { tinhToanTongQuan } from '../../modules/home/chiSo'
import { soCai } from '../../modules/tong-hop/so-cai'
import { dinhMucTon } from '../../modules/kho/data'
import { MODULES, hienMan, moDuoc, timMan, tenPhanHe } from '../../app/registry'
import { anNgoaiGoi, minGoi } from '../../app/plan'
import { Pk } from '../Page'
import { chungTu, dongCua } from '../generic/gen'
import { mauDieuChinh } from '../../modules/kho/dieu-chinh'
import { useMoTuTrangChu } from '../../app/tuTrangChu'
import { useThaoTacNhanh, TOI_DA_THAO_TAC, type ThaoTacMuc } from '../../app/thaoTacNhanh'
import { fold } from '../format'
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
import { useChonLoaiTien } from './MChonLoaiTien'
import { MTrangChuFree } from './MTrangChuFree'

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
  const { s } = useSession()
  // Tách component để hook của từng nhánh không đổi số lượng khi đổi gói
  return s.goi === 'S' ? <MTrangChuFree {..._props} /> : <MTrangChuCoPhi />
}

function MTrangChuCoPhi() {
  const { s, set, toast } = useSession()
  const nav = useNavigate()
  const dv = donViHienTai(s)

  const dsCnRaw = dsCuaHang(s)
  const dsCn = dsCnRaw.length ? dsCnRaw : CUA_HANG
  const cn = dsCn.find(c => c.id === s.cuaHang)
  // dsCuaHang chỉ có id, ten: tên ngắn lấy từ CUA_HANG
  const tenNgan = (id: string) => CUA_HANG.find(x => x.id === id)?.ngan
  const nhanCn = cn ? (tenNgan(cn.id) ?? cn.ten) : 'Tất cả'

  const [searchParams] = useSearchParams()
  const tabUrl = searchParams.get('tab')
  const [tabActive, setTabActive] = useState<0 | 1>(tabUrl === 'theo-doi' ? 1 : 0)
  const [moTimKiem, setMoTimKiem] = useState(false)
  const [moChonCn, setMoChonCn] = useState(false)
  const [khoChon] = useState<string>('Tất cả')
  const snapRef = useRef<HTMLDivElement>(null)
  const thacNuocRef = useRef<HTMLDivElement>(null)
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
      { k: 'all', ten: 'Tất cả cửa hàng', moTa: 'Chỉ xem gộp, chưa lập chứng từ' },
      ...dsCn.map(c => ({ k: c.id, ten: c.ten, moTa: tenNgan(c.id) })),
    ]
  }, [dsCn])

  // Nhãn gói thuê bao (PRO, PLUS, STD, FREE)
  const nhanGoi = s.goi === 'PR' ? 'PRO' : s.goi === 'PL' ? 'PLUS' : 'STD'

  const selCns = useMemo(() => {
    if (!s.cuaHang || s.cuaHang === 'all') {
      return dsCn.map(c => c.id)
    }
    return [s.cuaHang]
  }, [s.cuaHang, dsCn])

  const d = useMemo(() => tinhToanTongQuan('thang-nay', selCns, s.cheDo), [selCns, s.cheDo])

  // Phải thu khách hàng (TK 131)
  const sc10 = soCai(10)
  const sc9 = soCai(9)
  const phaiThuNay = Math.max(0, sc10.cuoi['131'] || 0)
  const phaiThuTruoc = Math.max(0, sc9.cuoi['131'] || 0)
  const tangPhaiThu = phaiThuTruoc > 0 ? (phaiThuNay - phaiThuTruoc) / phaiThuTruoc : null

  // 1. Thao tác nhanh (dùng chung web và điện thoại, T266, T280)
  const {
    ds: thaoTacNhanhDs,
    tatCa: thaoTacTatCa,
    ids: thaoTacIds,
    luu: luuThaoTac,
    macDinhIds: thaoTacMacDinhIds,
  } = useThaoTacNhanh(s)
  const [moTuyChinhThaoTac, setMoTuyChinhThaoTac] = useState(false)
  const chonLoaiTien = useChonLoaiTien()
  const [chonThaoTacIds, setChonThaoTacIds] = useState<string[]>([])
  const [timThaoTac, setTimThaoTac] = useState('')

  useEffect(() => {
    if (!moTuyChinhThaoTac) return
    setChonThaoTacIds([...thaoTacIds])
    setTimThaoTac('')
  }, [moTuyChinhThaoTac, thaoTacIds])

  const mapThaoTac = useMemo(
    () => new Map(thaoTacTatCa.map(m => [m.id, m])),
    [thaoTacTatCa]
  )
  const chonThaoTacItems = useMemo(
    () => chonThaoTacIds.map(id => mapThaoTac.get(id)).filter((x): x is ThaoTacMuc => x !== undefined && (!anNgoaiGoi(s.goi) || !x.khoa)),
    [chonThaoTacIds, mapThaoTac, s.goi]
  )

  const handleLenThaoTac = (idx: number) => {
    if (idx <= 0) return
    setChonThaoTacIds(prev => {
      const next = [...prev]
      const tam = next[idx - 1]
      next[idx - 1] = next[idx]
      next[idx] = tam
      return next
    })
  }

  const handleXuongThaoTac = (idx: number) => {
    if (idx >= chonThaoTacIds.length - 1) return
    setChonThaoTacIds(prev => {
      const next = [...prev]
      const tam = next[idx + 1]
      next[idx + 1] = next[idx]
      next[idx] = tam
      return next
    })
  }

  const handleBoChonThaoTac = (id: string) => {
    setChonThaoTacIds(prev => prev.filter(x => x !== id))
  }

  const handleToggleThaoTac = (id: string) => {
    setChonThaoTacIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id)
      }
      if (prev.length >= TOI_DA_THAO_TAC) {
        toast('Tối đa 8 thao tác')
        return prev
      }
      return [...prev, id]
    })
  }

  const handleKhoiPhucThaoTac = () => {
    setChonThaoTacIds([...thaoTacMacDinhIds])
    toast('Đã khôi phục thao tác mặc định')
  }

  const handleLuuThaoTac = () => {
    luuThaoTac(chonThaoTacIds)
    toast('Đã lưu thao tác nhanh')
    setMoTuyChinhThaoTac(false)
  }

  const wordsThaoTac = useMemo(() => fold(timThaoTac).split(/\s+/).filter(Boolean), [timThaoTac])
  const mucThaoTac = useMemo(() => {
    if (wordsThaoTac.length) {
      const cum = wordsThaoTac.join(' ')
      const hang = (x: ThaoTacMuc) => {
        const tf = fold(x.ten)
        return tf.startsWith(cum) ? 0 : tf.includes(' ' + cum) ? 1 : 2
      }
      const kq = thaoTacTatCa
        .filter(x => {
          if (anNgoaiGoi(s.goi) && x.khoa) return false
          const tf = fold(x.ten) + ' ' + fold(x.tenMod ?? '')
          return wordsThaoTac.every(w => tf.includes(w))
        })
        .map(x => [hang(x), x] as const)
        .sort((a, b) => a[0] - b[0])
        .map(([, x]) => x)
      return [{ ten: 'Kết quả', ds: kq }]
    }

    const theoMod = new Map<string, ThaoTacMuc[]>()
    for (const item of thaoTacTatCa) {
      if (anNgoaiGoi(s.goi) && item.khoa) continue
      const k = item.modKey
      const list = theoMod.get(k) ?? []
      list.push(item)
      theoMod.set(k, list)
    }

    const res: { ten: string; ds: ThaoTacMuc[] }[] = []
    for (const m of MODULES) {
      const ds = theoMod.get(m.key)
      if (ds && ds.length > 0) {
        res.push({
          ten: tenPhanHe(m, s.goi).ten,
          ds,
        })
      }
    }
    return res
  }, [thaoTacTatCa, wordsThaoTac, s.goi])

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

  // Điều khiển chuyển tab bằng click và cuộn vuốt ngang (T274)
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
              {dsTheoDoi.length > 0 && (
                <span className="m-tc-badge-so">
                  {dsTheoDoi.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Hàng điều hướng đầu trang chủ: tab một hàng, chip cửa hàng hàng dưới (T257 phần D) */}
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
            title="Chọn cửa hàng hiển thị"
          >
            <span className="m-tc-chip-cn-nhan m-tc-chip-kho-nhan">CH: {nhanCn}</span>
            <Icon n="chevd" className="ic sm" />
          </button>
        </div>
      </div>

      {/* Khung chứa 2 trang vuốt ngang bằng scroll-snap */}
      <div className="m-tc-snap-wrap" ref={snapRef} onScroll={handleScroll}>
        {/* TRANG 1: QUẢN TRỊ (CÁC THẺ THEO BỐ CỤC IVT) */}
        <div className="m-tc-snap-trang">
          {/* Thao tác nhanh cho các gói khác (giữ ở đầu) */}
          <div className="m-tc-the-ivt">
            <div className="m-tc-the-head">
              <div className="m-tc-the-tieu-hop">
                <h3 className="m-tc-the-tieu">Thao tác nhanh</h3>
                <span className="m-tc-the-info" title="Các thao tác nhanh thường dùng">
                  <Icon n="info" className="ic sm" />
                </span>
              </div>
              <button
                type="button"
                className="m-tc-the-link"
                onClick={() => setMoTuyChinhThaoTac(true)}
              >
                Tuỳ chỉnh
              </button>
            </div>
            <div className="m-tc-nhanh-5">
              {thaoTacNhanhDs.map(item => (
                <Link
                  key={item.id}
                  to={item.to}
                  {...chonLoaiTien.bam(item)}
                  className={`m-tc-nhanh-o5${item.khoa ? ' khoa' : ''}`}
                >
                  <div className="m-tc-nhanh-ic-tron">
                    <ONen n={item.icon} kieu="nhat" co="sm" />
                    {item.khoa && item.ma && (
                      <span className="m-tc-nhanh-lk">
                        <Pk g={minGoi(item.ma)} o />
                      </span>
                    )}
                  </div>
                  <span className="m-tc-nhanh-ten5">{item.ten}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Thẻ 2: Doanh thu, lợi nhuận, tiền hiện có (lưới 2 cột) */}
          <div className="m-tc-the-ivt">
            <div className="m-tc-the-head">
              <div className="m-tc-the-tieu-hop">
                <h3 className="m-tc-the-tieu">Tổng quan tài chính</h3>
                <span className="m-tc-the-info" title="Doanh thu, lợi nhuận và tiền">
                  <Icon n="info" className="ic sm" />
                </span>
              </div>
              <button
                type="button"
                className="m-tc-the-link"
                onClick={() => {
                  thacNuocRef.current?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Chi tiết
              </button>
            </div>
            <div className="m-tc-kpi-luoi">
              <div className="m-tc-kpi-muc">
                <div className="m-tc-kpi-nhan">Doanh thu thuần</div>
                <div className="m-tc-kpi-so">{money(d.dtThuan)} đ</div>
                <SoSanhDong tang={d.tangDT} label={d.tangDT !== null ? d.soSanhLabel : ''} />
                {d.sparkDT && d.sparkDT.length > 1 && (
                  <div className="m-tc-kpi-spark">
                    <Spark values={d.sparkDT} w={86} h={24} color="#0560a6" />
                  </div>
                )}
              </div>
              <div className="m-tc-kpi-muc">
                <div className="m-tc-kpi-nhan">Lợi nhuận trước thuế</div>
                <div className="m-tc-kpi-so">{money(d.lnTruocThue)} đ</div>
                <SoSanhDong tang={d.tangLNTT} label={`· Biên ${pct(d.bienLNTT)}`} />
                {d.sparkLNTT && d.sparkLNTT.length > 1 && (
                  <div className="m-tc-kpi-spark">
                    <Spark values={d.sparkLNTT} w={86} h={24} color="#138a52" />
                  </div>
                )}
              </div>
              <div className="m-tc-kpi-muc">
                <div className="m-tc-kpi-nhan">Tiền hiện có</div>
                <div className="m-tc-kpi-so">{money(d.tienKhaDung)} đ</div>
                <SoSanhDong tang={d.tangTien} label={`· Đủ chi ${d.soNgayDuChi} ngày`} />
                {d.sparkTien && d.sparkTien.length > 1 && (
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

          {/* Thẻ: Thác nước lợi nhuận */}
          <div className="m-tc-the-ivt" ref={thacNuocRef} id="m-the-thac-nuoc">
                <div className="m-tc-the-head">
                  <div className="m-tc-the-tieu-hop">
                    <h3 className="m-tc-the-tieu">Thác nước lợi nhuận</h3>
                    <span className="m-tc-the-info" title="Doanh thu thuần → Giá vốn → Chi phí → Lợi nhuận trước thuế">
                      <Icon n="info" className="ic sm" />
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
                      <Icon n="info" className="ic sm" />
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
                      <Icon n="info" className="ic sm" />
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
                    {money(Math.abs(d.dongTien.thu - d.dongTien.chi))} đ
                  </b>
                </div>
              </div>

              {/* Thẻ: Hiệu quả theo cửa hàng */}
              <div className="m-tc-the-ivt">
                <div className="m-tc-the-head">
                  <div className="m-tc-the-tieu-hop">
                    <h3 className="m-tc-the-tieu">Hiệu quả theo cửa hàng</h3>
                    <span className="m-tc-the-info" title={`Doanh thu và biên lãi gộp từng điểm bán · ${d.kyLabel}`}>
                      <Icon n="info" className="ic sm" />
                    </span>
                  </div>
                </div>
                <BranchBarChart data={d.cuaHang} />
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
                      <Icon n="info" className="ic sm" />
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
                      <Icon n="info" className="ic sm" />
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

          {/* Thẻ 3: Tổng tồn kho */}
          <div className="m-tc-the-ivt">
            <div className="m-tc-the-head">
              <div className="m-tc-the-tieu-hop">
                <h3 className="m-tc-the-tieu">Tổng tồn kho</h3>
                <span className="m-tc-the-info" title="Tổng giá trị tồn kho và tình trạng định mức">
                  <Icon n="info" className="ic sm" />
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
                  <Icon n="info" className="ic sm" />
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
                  <Icon n="info" className="ic sm" />
                </span>
              </div>
              <div className="m-tc-bd-head-chon">
                Năm 2026 <Icon n="chevd" className="ic sm" />
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
                  <Icon n="info" className="ic sm" />
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
                  <Icon n="info" className="ic sm" />
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
        </div>

        {/* TRANG 2: CẦN THEO DÕI */}
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
      </div>

      {/* Lớp phủ tìm kiếm màn hình */}
      <MTimKiem mo={moTimKiem} onDong={() => setMoTimKiem(false)} />

      {/* Sheet chọn cửa hàng */}
      {chonLoaiTien.sheet}

      <MChon
        mo={moChonCn}
        onDong={() => setMoChonCn(false)}
        tieuDe="Chọn cửa hàng làm việc"
        ds={dsChonCn}
        chon={s.cuaHang || 'all'}
        onChon={k => set({ cuaHang: k })}
      />

      {/* Tấm trượt tuỳ chỉnh thao tác nhanh (T266, T280) */}
      {moTuyChinhThaoTac && (
        <div className="m-tam-overlay" onClick={() => setMoTuyChinhThaoTac(false)}>
          <div className="m-tam-hop m-tam-hop-apdung" style={{ height: '94vh', maxHeight: '94vh' }} onClick={e => e.stopPropagation()}>
            <div className="m-tam-dau m-tam-dau-apdung">
              <h2 className="m-tam-tieu">Tuỳ chỉnh thao tác nhanh</h2>
              <button
                type="button"
                className="m-tam-dong-btn"
                onClick={() => setMoTuyChinhThaoTac(false)}
                aria-label="Đóng"
              >
                <Icon n="x" className="ic sm" />
              </button>
            </div>

            <div className="m-tam-tim-wrap">
              <Icon n="search" className="m-tam-tim-ic ic sm" />
              <input
                className="m-tam-tim-inp"
                placeholder="Tìm thao tác hoặc màn hình..."
                value={timThaoTac}
                onChange={e => setTimThaoTac(e.target.value)}
              />
              {timThaoTac && (
                <button
                  type="button"
                  className="m-tam-tim-x"
                  onClick={() => setTimThaoTac('')}
                  aria-label="Xoá tìm kiếm"
                >
                  <Icon n="x" className="ic sm" />
                </button>
              )}
            </div>

            {/* Hàng đã chọn */}
            <div className="ttn-m-da-chon-khung" style={{ padding: '10px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                <span>Đã chọn ({chonThaoTacIds.length}/{TOI_DA_THAO_TAC})</span>
                {chonThaoTacIds.length >= TOI_DA_THAO_TAC && (
                  <span style={{ color: 'var(--orange-d)', fontSize: 11.5 }}>Tối đa {TOI_DA_THAO_TAC} thao tác</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                {chonThaoTacItems.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      background: '#fff',
                      borderRadius: 8,
                      border: '1px solid var(--line-2)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <ONen n={item.icon} kieu="nhat" co="sm" />
                      <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.ten}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 'none' }}>
                      <button
                        type="button"
                        className="ttn-btn-mui-ten"
                        title="Lên trên"
                        disabled={idx === 0}
                        onClick={() => handleLenThaoTac(idx)}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="ttn-btn-mui-ten"
                        title="Xuống dưới"
                        disabled={idx === chonThaoTacItems.length - 1}
                        onClick={() => handleXuongThaoTac(idx)}
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        className="ttn-btn-mui-ten"
                        style={{ color: 'var(--red)' }}
                        title={`Bỏ ${item.ten}`}
                        onClick={() => handleBoChonThaoTac(item.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danh sách ứng viên gom phân hệ */}
            <div className="m-tam-ds" style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
              {mucThaoTac.length === 0 && (
                <div className="m-tam-trong" style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
                  Không tìm thấy thao tác nào
                </div>
              )}
              {mucThaoTac.map(g => (
                <div key={g.ten} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '10px 0 4px' }}>
                    {g.ten}
                  </div>
                  {g.ds.map(x => {
                    const isChon = chonThaoTacIds.includes(x.id)
                    const atLimit = chonThaoTacIds.length >= TOI_DA_THAO_TAC && !isChon
                    return (
                      <div
                        key={x.id}
                        className="m-tam-dong"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          padding: '8px 0',
                          borderBottom: '1px solid var(--line-2)',
                          opacity: atLimit ? 0.5 : 1,
                        }}
                      >
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            flex: 1,
                            minWidth: 0,
                            cursor: x.khoa ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChon}
                            disabled={x.khoa || atLimit}
                            onChange={() => !x.khoa && handleToggleThaoTac(x.id)}
                            style={{ width: 18, height: 18, accentColor: 'var(--blue)' }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <ONen n={x.icon} kieu="nhat" co="sm" />
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{x.ten}</span>
                              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{x.tenMod}</span>
                            </div>
                            {x.khoa && x.ma && <Pk g={minGoi(x.ma)} o />}
                          </div>
                        </label>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="m-tam-day ttn-m-day">
              <button
                type="button"
                className="btn sm ghost ttn-m-btn-khoiphuc"
                onClick={handleKhoiPhucThaoTac}
              >
                Khôi phục
              </button>
              <div className="ttn-m-day-phai">
                <button
                  type="button"
                  className="m-tam-btn-huy"
                  onClick={() => setMoTuyChinhThaoTac(false)}
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  className="m-tam-btn-apdung"
                  onClick={handleLuuThaoTac}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
