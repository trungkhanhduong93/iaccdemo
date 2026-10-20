import { useEffect, useMemo, useState, type FC } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { duongDan } from '../../app/registry'
import { cuaHangHienTai, useSession } from '../../app/session'
import { docSoTien, money } from '../format'
import { goSoVN, docSoVN } from '../OSoGo'
import { CUA_HANG, HOM_NAY, KHACH, LY_DO, NCC, NHAN_VIEN, TK_NGAN_HANG } from '../../data/mock'
import { layChiNhanhNho } from '../ChonCuaHangTruoc'
import { soKeTiep, suaPhieu, themPhieu, ghiNhatKy } from '../generic/daXoa'
import { MAN_THU_CHI, QUY_TIEN, TEN_CT_TT, TIEN_TO_CT_TT } from '../generic/ChungTuForm'
import { tkTheoLyDo } from '../generic/gen'
import { useDongChungTu } from '../generic/VoucherScreen'
import { TAI_KHOAN } from '../../modules/danh-muc/data'
import { MChon } from './MChon'
import { LichDon } from '../ChonNgay'

export interface MDtThuChiLapProps extends ScreenProps {
  id?: string
  row?: Row
}

interface DongChiTiet {
  ma?: string
  ten: string
  sl: number
  gia: number
  tien: number
  ly?: string
  dt?: string
  km?: string
  cv?: string
  tkNo?: string
  tkCo?: string
}

interface DoiTuongMau {
  ma: string
  ten: string
  loai: 'Cá nhân' | 'Nhà cung cấp' | 'Nhân viên' | 'Khách hàng'
  avatar: string
  diaChi?: string
  bg: string
  color: string
}

const DS_DOI_TUONG_FIGMA: DoiTuongMau[] = [
  { ma: 'DT01', ten: 'Bà Nguyễn Thị Hạnh', loai: 'Cá nhân', avatar: 'NH', diaChi: '128 Hai Bà Trưng, Đa Kao, Quận 1, TP.HCM', bg: '#f3e8ff', color: '#7e22ce' },
  { ma: 'DT02', ten: 'Ông Trần Văn Lộc', loai: 'Cá nhân', avatar: 'TL', diaChi: '45 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM', bg: '#e0e7ff', color: '#4338ca' },
  { ma: 'NCC005', ten: 'Hợp tác xã Rau sạch Củ Chi', loai: 'Nhà cung cấp', avatar: 'RS', diaChi: 'Ấp Chợ Cũ, An Nhơn Tây, Củ Chi, TP.HCM', bg: '#dcfce7', color: '#15803d' },
  { ma: 'NCC006', ten: 'Công ty TNHH Thiết bị bếp Gia Phát', loai: 'Nhà cung cấp', avatar: 'GP', diaChi: '228 Cộng Hoà, Phường 12, Tân Bình, TP.HCM', bg: '#dbeafe', color: '#1d4ed8' },
  { ma: 'NCC007', ten: 'Công ty Điện lực Sài Gòn', loai: 'Nhà cung cấp', avatar: 'ĐL', diaChi: '72 Hai Bà Trưng, Bến Nghé, Quận 1, TP.HCM', bg: '#ccfbf1', color: '#0f766e' },
  { ma: 'NCC001', ten: 'Công ty TNHH Thực phẩm Tươi An Phú', loai: 'Nhà cung cấp', avatar: 'AP', diaChi: '12 Nguyễn Thị Định, An Phú, TP. Thủ Đức', bg: '#ffedd5', color: '#c2410c' },
  { ma: 'NCC003', ten: 'Công ty CP Cà phê Cao Nguyên Xanh', loai: 'Nhà cung cấp', avatar: 'CN', diaChi: '158 Đinh Tiên Hoàng, Đa Kao, Quận 1, TP.HCM', bg: '#fef3c7', color: '#b45309' },
  { ma: 'KH001', ten: 'Công ty TNHH Sự kiện Ánh Dương', loai: 'Khách hàng', avatar: 'AD', diaChi: '88 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM', bg: '#e0f2fe', color: '#0369a1' },
  { ma: 'KH002', ten: 'Khách lẻ POS', loai: 'Khách hàng', avatar: 'KL', diaChi: 'Bán lẻ tại quầy', bg: '#f1f5f9', color: '#475569' },
  { ma: 'KH003', ten: 'ShopeeFood', loai: 'Khách hàng', avatar: 'SF', diaChi: 'Tầng 17 Saigon Centre, 67 Lê Lợi, Quận 1', bg: '#ffe4e6', color: '#e11d48' },
  { ma: 'NV002', ten: 'Trần Thu Hà', loai: 'Nhân viên', avatar: 'TH', diaChi: 'Bộ phận Kế toán', bg: '#fae8ff', color: '#a21caf' },
  { ma: 'NV004', ten: 'Phạm Ngọc Lan', loai: 'Nhân viên', avatar: 'NL', diaChi: 'Cửa hàng trưởng Lê Lợi', bg: '#f0fdf4', color: '#166534' },
]

export const MDtThuChiLap: FC<MDtThuChiLapProps> = ({ sc, mod, id, row: rowProp }) => {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const [sp] = useSearchParams()

  const { rows } = useDongChungTu(sc, mod)
  const manKey = `${mod.key}/${sc.slug}`
  const row = rowProp ?? (id && id !== 'moi' ? rows.find(r => String(r.id) === String(id)) : undefined)
  const dangSua = Boolean(id && id !== 'moi' && row)
  const loaiUrl = sp.get('loai') || 'chi'
  const [loai, setLoai] = useState<string>(() => row?.loai ? String(row.loai) : loaiUrl)

  const isChi = loai === 'chi' || loai === 'unc'
  const isThu = loai === 'thu' || loai === 'bc'
  const isCq = loai === 'cq'

  const cnNhoId = layChiNhanhNho()
  const cnNhoTen = CUA_HANG.find(c => c.id === cnNhoId)?.ten
  const [cuaHang, setCuaHang] = useState<string>(() =>
    row?.cn ? String(row.cn) : cuaHangHienTai(s)?.ten || cnNhoTen || CUA_HANG[0].ten
  )
  const [moChonCn, setMoChonCn] = useState(false)

  const [soTien, setSoTien] = useState<number>(() => {
    if (row) return Number(row.tong) || Number(row.tien) || 0
    return 0
  })
  const [strTien, setStrTien] = useState<string>(() => (soTien > 0 ? money(soTien) : ''))

  const [quy, setQuy] = useState<string>(() => {
    if (row?._quy) return String(row._quy)
    if (loai === 'unc' || loai === 'bc') {
      return TK_NGAN_HANG[0] ? `${TK_NGAN_HANG[0].nh.split(',')[0]} ${TK_NGAN_HANG[0].so}` : ''
    }
    if (loai === 'chi' || loai === 'thu') {
      const ch = CUA_HANG.find(c => c.ten === cuaHang || c.id === cuaHang) ?? CUA_HANG[0]
      return ch ? `Quỹ tiền mặt ${ch.ngan}` : ''
    }
    return ''
  })

  const ngayHomNay = `${String(HOM_NAY.getDate()).padStart(2, '0')}/${String(HOM_NAY.getMonth() + 1).padStart(2, '0')}/${HOM_NAY.getFullYear()}`
  const [ngay, setNgay] = useState<string>(() => row?.ngay ? String(row.ngay) : ngayHomNay)
  const [soCt, setSoCt] = useState<string>(() => {
    if (row?.so) return String(row.so)
    const pfx = isChi ? (loai === 'unc' ? 'UNC' : 'PC') : isThu ? (loai === 'bc' ? 'BC' : 'PT') : 'CQ'
    return soKeTiep(manKey, `${pfx}2610-`)
  })

  // T526: Lập phiếu mới để trống các trường, chỉ giữ mặc định bắt buộc
  const [doiTuong, setDoiTuong] = useState<string>(() => row?.doiTuong ? String(row.doiTuong) : '')
  const [diaChi, setDiaChi] = useState<string>(() => row?._diaChi || row?.diaChi ? String(row._diaChi || row?.diaChi) : '')
  const [nguoiGiaoDich, setNguoiGiaoDich] = useState<string>(() => row?._nguoiGiao || row?._nguoi ? String(row._nguoiGiao || row?._nguoi) : '')

  const [lyDo, setLyDo] = useState<string>(() => row?._lyDo ? String(row._lyDo) : '')
  const [thangChiPhi, setThangChiPhi] = useState<string>(() => `Tháng ${row?.thang || 10}/2026`)
  const [ghiChu, setGhiChu] = useState<string>(() => row?._ghiChu || row?.dienGiai ? String(row._ghiChu || row?.dienGiai) : '')
  const theCpDs = Array.isArray(row?._theCp) ? (row?._theCp as string[]) : []

  // Dòng chi tiết
  const [dsDong, setDsDong] = useState<DongChiTiet[]>(() => {
    if (Array.isArray(row?._dong) && row._dong.length > 0) {
      return (row._dong as DongChiTiet[]).map(d => ({
        ten: d.ten || '',
        sl: d.sl || 1,
        gia: d.gia || soTien,
        tien: d.tien || soTien,
        ly: d.ly || lyDo,
        dt: d.dt || doiTuong,
        km: d.km || '',
        cv: d.cv || '',
        tkNo: d.tkNo || (isChi ? '242' : '1111'),
        tkCo: d.tkCo || (isChi ? '1111' : '131'),
      }))
    }
    return [{
      ten: '',
      sl: 1,
      gia: soTien,
      tien: soTien,
      ly: lyDo,
      dt: doiTuong,
      km: '',
      cv: '',
      tkNo: isChi ? '242' : '1111',
      tkCo: isChi ? '1111' : '131',
    }]
  })

  const [dongMoRong, setDongMoRong] = useState<Record<number, boolean>>({})
  const [daSua, setDaSua] = useState(false)
  const [daLuu, setDaLuu] = useState(false)
  const [phieuVuaLuu, setPhieuVuaLuu] = useState<{ id: string; so: string } | null>(null)

  useEffect(() => {
    if (row) {
      if (row.loai) setLoai(String(row.loai))
      if (row.cn) setCuaHang(String(row.cn))
      const t = Number(row.tong) || Number(row.tien) || 0
      if (t) {
        setSoTien(t)
        setStrTien(money(t))
      }
      if (row.so) setSoCt(String(row.so))
      if (row.ngay) setNgay(String(row.ngay))
      if (row.doiTuong) setDoiTuong(String(row.doiTuong))
      if (row._diaChi || row.diaChi) setDiaChi(String(row._diaChi || row.diaChi))
      if (row._nguoiGiao || row._nguoi) setNguoiGiaoDich(String(row._nguoiGiao || row._nguoi))
      if (row._quy) setQuy(String(row._quy))
      if (row._lyDo) setLyDo(String(row._lyDo))
      if (row.thang) setThangChiPhi(`Tháng ${row.thang}/2026`)
      if (row._ghiChu || row.dienGiai) setGhiChu(String(row._ghiChu || row.dienGiai))
      if (Array.isArray(row._dong) && row._dong.length > 0) {
        setDsDong((row._dong as DongChiTiet[]).map(d => ({
          ten: d.ten || 'Chi tiết',
          sl: d.sl || 1,
          gia: d.gia || t,
          tien: d.tien || t,
          ly: d.ly || String(row._lyDo || ''),
          dt: d.dt || String(row.doiTuong || ''),
          km: d.km || '',
          cv: d.cv || '',
          tkNo: d.tkNo || '242',
          tkCo: d.tkCo || '1111',
        })))
      }
    }
  }, [row])

  // Sheets modal
  const [moChonDt, setMoChonDt] = useState(false)
  const [moChonLoai, setMoChonLoai] = useState(false)
  const [moChonQuy, setMoChonQuy] = useState(false)
  const [moChonLyDo, setMoChonLyDo] = useState(false)
  const [moLich, setMoLich] = useState(false)
  const [moChonThangCp, setMoChonThangCp] = useState(false)
  const [moChonTk, setMoChonTk] = useState(false)

  // Sheet Đối tượng state
  const [timDt, setTimDt] = useState('')
  const [tabLoaiDt, setTabLoaiDt] = useState<'all' | 'ncc' | 'nv' | 'kh'>('all')

  const doiTuongObj = useMemo(() => {
    if (!doiTuong) {
      return {
        ma: '',
        ten: '',
        loai: 'Cá nhân' as const,
        avatar: '',
        bg: '#f3f4f6',
        color: '#9ca3af',
      }
    }
    return DS_DOI_TUONG_FIGMA.find(d => d.ten === doiTuong) || {
      ma: 'DT',
      ten: doiTuong,
      loai: 'Cá nhân' as const,
      avatar: doiTuong.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      bg: '#e0e7ff',
      color: '#4338ca',
    }
  }, [doiTuong])

  const dsDoiTuongLoc = useMemo(() => {
    let list = DS_DOI_TUONG_FIGMA
    if (tabLoaiDt === 'ncc') list = list.filter(d => d.loai === 'Nhà cung cấp')
    else if (tabLoaiDt === 'nv') list = list.filter(d => d.loai === 'Nhân viên')
    else if (tabLoaiDt === 'kh') list = list.filter(d => d.loai === 'Khách hàng' || d.loai === 'Cá nhân')

    if (timDt.trim()) {
      const q = timDt.trim().toLowerCase()
      list = list.filter(d => d.ten.toLowerCase().includes(q) || d.ma.toLowerCase().includes(q) || (d.diaChi && d.diaChi.toLowerCase().includes(q)))
    }
    return list
  }, [tabLoaiDt, timDt])

  const handleSuaTien = (valStr: string) => {
    const formatted = goSoVN(valStr, false)
    setStrTien(formatted ? money(docSoVN(formatted)) : '')
    const num = docSoVN(formatted)
    setSoTien(num)
    setDaSua(true)

    // Đồng bộ vào dòng chi tiết đầu tiên
    if (dsDong.length <= 1 || s.goi === 'F') {
      setDsDong(ds => {
        const n = [...ds]
        if (n[0]) n[0] = { ...n[0], gia: num, tien: num }
        return n
      })
    }
  }

  const handleThemDong = () => {
    setDsDong(prev => [
      ...prev,
      {
        ten: `Dòng chi tiết ${prev.length + 1}`,
        sl: 1,
        gia: 0,
        tien: 0,
        ly: lyDo,
        dt: doiTuong,
        tkNo: '242',
        tkCo: '1111',
      },
    ])
    setDaSua(true)
  }

  const handleXoaDong = (idx: number) => {
    if (dsDong.length <= 1) {
      toast('Phiếu phải có ít nhất 1 dòng chi tiết')
      return
    }
    const next = dsDong.filter((_, i) => i !== idx)
    setDsDong(next)
    const tongMoi = next.reduce((a, b) => a + (Number(b.tien) || 0), 0)
    setSoTien(tongMoi)
    setStrTien(money(tongMoi))
    setDaSua(true)
  }

  const handleSuaDong = (idx: number, patch: Partial<DongChiTiet>) => {
    const next = dsDong.map((d, i) => i === idx ? { ...d, ...patch } : d)
    setDsDong(next)
    if (patch.tien !== undefined) {
      const tongMoi = next.reduce((a, b) => a + (Number(b.tien) || 0), 0)
      setSoTien(tongMoi)
      setStrTien(money(tongMoi))
    }
    setDaSua(true)
  }

  const handleLuu = () => {
    if (soTien <= 0) {
      toast('Vui lòng nhập số tiền lớn hơn 0')
      return
    }
    const thangNum = Number(ngay.split('/')[1]) || 10
    if (!quy) {
      toast('Vui lòng chọn quỹ tiền')
      return
    }
    const duLieuPhieu: Partial<Row> = {
      so: soCt,
      loai,
      tenLoai: TEN_CT_TT[loai] || (isChi ? 'Chi tiền mặt' : 'Thu tiền mặt'),
      ngay,
      thang: thangNum,
      cn: cuaHang,
      doiTuong,
      _diaChi: diaChi,
      _nguoiGiao: nguoiGiaoDich,
      _quy: quy,
      _lyDo: lyDo,
      _ghiChu: ghiChu,
      dienGiai: (s.goi === 'F' ? ghiChu : dsDong[0]?.ten) || ghiChu || (isChi ? 'Chi tiền' : 'Thu tiền'),
      tien: soTien,
      tong: soTien,
      _dong: dsDong.map(d => ({
        ...d,
        ten: (s.goi === 'F' ? ghiChu : d.ten) || ghiChu || d.ten,
        tien: s.goi === 'F' ? soTien : d.tien,
        gia: s.goi === 'F' ? soTien : d.gia,
        tkNo: d.tkNo || (lyDo.includes('lương') ? '334' : '6422'),
        tkCo: d.tkCo || '1111',
      })),
      _theCp: theCpDs,
      tt: row?.tt ?? (s.goi === 'F' ? 'ghi' : 'nhap'),
      nguon: row?.nguon ?? 'tay',
    }
    const targetId = dangSua && row ? String(row.id) : `phieu-${Date.now()}`
    if (dangSua && row) {
      suaPhieu(manKey, targetId, duLieuPhieu)
      ghiNhatKy(manKey, targetId, soCt, s.ten, `Sửa chứng từ ${soCt}`)
      toast(`Đã lưu thay đổi ${soCt}`)
      nav(`${path}/${targetId}`, { replace: true })
    } else {
      themPhieu(manKey, { id: targetId, ...duLieuPhieu }, s.ten)
      ghiNhatKy(manKey, targetId, soCt, s.ten, `Lập mới chứng từ ${soCt}`)
      toast(`Đã lưu phiếu ${soCt}`)
      setPhieuVuaLuu({ id: targetId, so: soCt })
      setDaLuu(true)
    }
  }

  const dsLoaiOptions = [
    { k: 'chi', ten: 'Chi tiền mặt' },
    { k: 'thu', ten: 'Thu tiền mặt' },
    { k: 'unc', ten: 'Chi ngân hàng' },
    { k: 'bc', ten: 'Thu ngân hàng' },
    { k: 'cq', ten: 'Chuyển quỹ' },
  ]

  const dsLyDoOptions = useMemo(() => {
    return LY_DO.filter(l => isChi ? l.dung === 'Chi tiền' : l.dung === 'Thu tiền').map(l => ({
      k: l.ten,
      ten: l.ten,
    }))
  }, [isChi])

  // T526: Quỹ lọc theo loại phiếu và chi nhánh
  const dsQuyOptions = useMemo(() => {
    const ch = CUA_HANG.find(c => c.ten === cuaHang || c.id === cuaHang)
    const listTm = ch ? [`Quỹ tiền mặt ${ch.ngan}`] : CUA_HANG.map(c => `Quỹ tiền mặt ${c.ngan}`)
    const listNh = TK_NGAN_HANG.map(t => `${t.nh.split(',')[0]} ${t.so}`)
    if (loai === 'thu' || loai === 'chi') {
      return listTm.map(q => ({ k: q, ten: q }))
    }
    if (loai === 'bc' || loai === 'unc') {
      return listNh.map(q => ({ k: q, ten: q }))
    }
    return [...listTm, ...listNh].map(q => ({ k: q, ten: q }))
  }, [cuaHang, loai])

  const handleChonCn = (tenCn: string) => {
    setMoChonCn(false)
    setCuaHang(tenCn)
    setDaSua(true)
    const chMoi = CUA_HANG.find(c => c.ten === tenCn || c.id === tenCn)
    if (loai === 'thu' || loai === 'chi') {
      const quyHopLe = chMoi ? `Quỹ tiền mặt ${chMoi.ngan}` : ''
      if (quy !== quyHopLe) {
        setQuy('')
      }
    }
  }

  const dsThangOptions = [
    { k: 'Tháng 10/2026', ten: 'Tháng 10/2026' },
    { k: 'Tháng 11/2026', ten: 'Tháng 11/2026' },
    { k: 'Tháng 12/2026', ten: 'Tháng 12/2026' },
  ]

  const dsTkOptions = useMemo(() => {
    return TAI_KHOAN.map(t => ({
      k: t.so,
      ten: `${t.so} - ${t.ten}`,
    }))
  }, [])

  const tenLoaiHienTai = dsLoaiOptions.find(o => o.k === loai)?.ten || 'Chi tiền mặt'

  if (daLuu && phieuVuaLuu) {
    return (
      <div className="m-pb-man m-lp">
        <div className="m-lp-buoc m-lp-buoc-thanh-cong">
          <div className="m-lp-dau-thanh-cong">
            <button
              type="button"
              className="m-lp-btn-home"
              onClick={() => nav(path, { replace: true })}
              aria-label="Về trang danh sách"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>
          </div>

          <div className="m-lp-thanh-cong-than">
            <div className="m-lp-thanh-cong-vong">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#138a52" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="m-lp-thanh-cong-tieu">Tạo chứng từ thành công</h2>
            <p className="m-lp-thanh-cong-mota">
              Bạn vừa tạo thành công phiếu {tenLoaiHienTai} <b>{phieuVuaLuu.so}</b>.
            </p>

            <div className="m-lp-thanh-cong-nut-hang">
              <button
                type="button"
                className="m-pb-btn-phu"
                onClick={() => nav(path, { replace: true })}
              >
                Đóng
              </button>
              <button
                type="button"
                className="m-pb-btn-sua m-lp-btn-xem-vua-lap"
                onClick={() => nav(`${path}/${phieuVuaLuu.id}`, { replace: true })}
              >
                Xem phiếu
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="m-tc-lap-man m-lp">
      {/* ── HEADER NAVIGATION THEO FIGMA MB05 ── */}
      <header className="m-tc-lap-header">
        <button
          type="button"
          className="m-tc-btn-nav"
          onClick={() => nav(path)}
          aria-label="Đóng"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="m-tc-lap-tieu-de-khu">
          <span className="dong1">{dangSua ? `Sửa ${isChi ? 'phiếu chi' : isThu ? 'phiếu thu' : 'phiếu'}` : `Lập ${isChi ? 'phiếu chi' : isThu ? 'phiếu thu' : 'phiếu'}`}</span>
          {dangSua && <span className="dong2">{soCt}</span>}
        </div>
        <div className="m-tc-nav-khoang-trong" />
      </header>

      {/* Dòng trạng thái chỉnh sửa */}
      {daSua && (
        <div className="m-tc-trang-thai-sua">
          <span className="cham" />
          <span>Đang chỉnh sửa · 1 thay đổi chưa lưu</span>
        </div>
      )}

      {/* ── CONTENT THÂN CUỘN ── */}
      <main className="m-tc-lap-content">
        {/* 1. Card Số tiền (sửa trực tiếp) */}
        <section className="m-tc-card-so-tien">
          <div className="m-tc-hang-loai-ch">
            <button
              type="button"
              className={`m-tc-pill-loai ${isChi ? 'chi' : isThu ? 'thu' : 'cq'}`}
              onClick={() => setMoChonLoai(true)}
              aria-label="Chọn loại phiếu"
            >
              <span>{tenLoaiHienTai}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            <button
              type="button"
              className="m-tc-dong-ch"
              onClick={() => setMoChonCn(true)}
              aria-label="Chọn chi nhánh"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>{cuaHang}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          <label className="m-tc-nhan-tien" htmlFor="tc-nhap-tien">
            {isChi ? 'Số tiền chi' : isThu ? 'Số tiền thu' : 'Số tiền'} <span className="sao">*</span>
          </label>

          <div className="m-tc-o-so-tien-wrap">
            <input
              id="tc-nhap-tien"
              type="text"
              inputMode="numeric"
              className={`m-tc-inp-tien m-lp-tien-inp ${isChi ? 'chi' : isThu ? 'thu' : 'cq'}`}
              value={strTien}
              onChange={e => handleSuaTien(e.target.value)}
              placeholder="0"
            />
            <span className={`m-tc-don-vi ${isChi ? 'chi' : isThu ? 'thu' : 'cq'}`}>đ</span>
          </div>

          <div className="m-tc-doc-tien">
            {docSoTien(soTien)}
          </div>

          {s.goi !== 'F' && (
            <div className="m-tc-goi-y-dong-bo">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Phiếu 1 dòng: sửa số tiền ngay tại đây, dòng chi tiết tự cập nhật. Từ 2 dòng trở lên, số tiền = tổng các dòng ở mục Chi tiết.</span>
            </div>
          )}
        </section>

        {/* 2. Group THÔNG TIN CHUNG */}
        <div className="m-tc-nhom-chu">THÔNG TIN CHUNG</div>
        <section className="m-tc-lap-card">
          <div className="m-tc-lap-field">
            <label className="nhan">
              {isChi ? 'Quỹ tiền mặt' : isThu ? 'Quỹ thu tiền' : 'Quỹ'} <span className="sao">*</span>
            </label>
            <div
              className="m-tc-lap-select"
              onClick={() => setMoChonQuy(true)}
            >
              <span className={!quy ? 'trong' : ''}>{quy || 'Chọn quỹ tiền'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          <div className="m-tc-lap-hang-2col">
            <div
              className="m-tc-lap-field col"
              id="m-lp-o-thoiGian"
              onClick={() => setMoLich(true)}
              style={{ cursor: 'pointer' }}
            >
              <label className="nhan">Ngày chứng từ <span className="sao">*</span></label>
              <div className="m-tc-lap-select">
                <span className="m-lp-dong-tri">{ngay}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </div>

            <div className="m-tc-lap-field col">
              <label className="nhan">Số phiếu {isChi ? 'chi' : isThu ? 'thu' : ''}</label>
              <div className="m-tc-lap-inp-khoa">
                <span>{soCt}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Group ĐỐI TƯỢNG */}
        <div className="m-tc-nhom-chu">ĐỐI TƯỢNG</div>
        <section className="m-tc-lap-card">
          <div className="m-tc-lap-field">
            <label className="nhan">Đối tượng</label>
            <div
              className="m-tc-lap-dt-box"
              onClick={() => setMoChonDt(true)}
            >
              {doiTuong ? (
                <div className="m-tc-lap-avatar" style={{ background: doiTuongObj.bg, color: doiTuongObj.color }}>
                  {doiTuongObj.avatar}
                </div>
              ) : (
                <div className="m-tc-lap-avatar" style={{ background: '#f3f4f6', color: '#9ca3af' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
              <span className={`ten${!doiTuong ? ' trong' : ''}`}>{doiTuong || 'Chọn đối tượng'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          <div className="m-tc-lap-field">
            <div className="nhan-wrap">
              <label className="nhan">Địa chỉ</label>
              <span className="m-tc-tag-tu-dien">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.2L12 16.8 5.7 21.2 8 14 2 9.4h7.6z" />
                </svg>
                <span>Tự điền</span>
              </span>
            </div>
            <textarea
              className="m-tc-lap-textarea"
              rows={2}
              value={diaChi}
              onChange={e => {
                setDiaChi(e.target.value)
                setDaSua(true)
              }}
              placeholder="Nhập địa chỉ"
            />
            <span className="m-tc-subtext">Lấy từ hồ sơ đối tượng, vẫn sửa được nếu cần</span>
          </div>

          <div className="m-tc-lap-field">
            <label className="nhan">Người giao dịch</label>
            <input
              type="text"
              className="m-tc-lap-inp"
              value={nguoiGiaoDich}
              onChange={e => {
                setNguoiGiaoDich(e.target.value)
                setDaSua(true)
              }}
              placeholder="Họ và tên người giao dịch"
            />
          </div>
        </section>

        {/* 4. Group HẠCH TOÁN */}
        <div className="m-tc-nhom-chu">HẠCH TOÁN</div>
        <section className="m-tc-lap-card">
          <div
            className="m-tc-lap-field m-lp-sua-o"
            onClick={() => setMoChonLyDo(true)}
            style={{ cursor: 'pointer' }}
          >
            <label className="nhan">{isChi ? 'Lý do chi' : 'Lý do thu'} <span className="sao">*</span></label>
            <div className="m-tc-lap-select">
              <div className="m-tc-lydo-val-wrap">
                <span className={`ten${!lyDo ? ' trong' : ''}`}>{lyDo || (isChi ? 'Chọn lý do chi' : 'Chọn lý do thu')}</span>
                {lyDo && <span className="m-tc-badge-nhom-cp">Chi phí</span>}
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          <div className="m-tc-lap-field">
            <label className="nhan">Tháng ghi nhận chi phí</label>
            <div
              className="m-tc-lap-select"
              onClick={() => setMoChonThangCp(true)}
            >
              <span>{thangChiPhi}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            <span className="m-tc-subtext">Hiện khi lý do chi thuộc nhóm Chi phí</span>
          </div>

          {theCpDs.length > 0 && (
            <div className="m-tc-lap-the-cp-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0560a6" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <div className="thong-tin">
                <span className="nhan">Thẻ chi phí</span>
                <span className="ma">{theCpDs[0]}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0560a6" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          )}

          <div className="m-tc-lap-field">
            <label className="nhan">{s.goi === 'F' ? 'Diễn giải' : 'Ghi chú'}</label>
            <textarea
              className="m-tc-lap-textarea"
              rows={2}
              value={ghiChu}
              onChange={e => {
                const val = e.target.value
                setGhiChu(val)
                setDaSua(true)
                if (s.goi === 'F') {
                  setDsDong(ds => {
                    const n = [...ds]
                    if (n[0]) n[0] = { ...n[0], ten: val }
                    return n
                  })
                }
              }}
              placeholder={s.goi === 'F' ? 'Nhập diễn giải phiếu' : 'Nhập ghi chú hoặc diễn giải chi tiết'}
            />
          </div>

          {/* Khối hạch toán cho kiểm tra test 17A */}
          {s.goi !== 'F' && (
            <div className="m-tc-ht-test m-xp-the-ht" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '10px', marginTop: '10px' }}>
              <div
                className="m-lp-the-ht-tieu m-lp-hang-tk"
                onClick={() => setMoChonTk(true)}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#1f2225', padding: '4px 0' }}
              >
                <span>Nợ {dsDong[0]?.tkNo || (lyDo.includes('lương') ? '334' : '242')}</span>
                <span>Có {dsDong[0]?.tkCo || '1111'}</span>
              </div>
            </div>
          )}
        </section>

        {/* 5. Group CHI TIẾT (chỉ hiện ở gói có phí, gói Free ẩn theo T526) */}
        {s.goi !== 'F' && (
          <>
            <div className="m-tc-nhom-chu">
              CHI TIẾT <span className="so-dong">{dsDong.length} dòng</span>
            </div>
            <section className="m-tc-lap-card">
              {dsDong.map((d, idx) => {
            const moRong = dongMoRong[idx] ?? false
            return (
              <div key={idx} className="m-tc-lap-dong-item">
                <div className="m-tc-dong-item-dau">
                  <div className="m-tc-stt-tron">{idx + 1}</div>
                  <span className="ten">Dòng chi tiết</span>
                  {dsDong.length > 1 && (
                    <button
                      type="button"
                      className="m-tc-btn-xoa-dong"
                      onClick={() => handleXoaDong(idx)}
                      aria-label="Xoá dòng"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="m-tc-lap-field">
                  <label className="nhan">Diễn giải</label>
                  <input
                    type="text"
                    className="m-tc-lap-inp"
                    value={d.ten}
                    onChange={e => handleSuaDong(idx, { ten: e.target.value })}
                    placeholder="Diễn giải dòng"
                  />
                </div>

                <div className="m-tc-lap-field">
                  <label className="nhan">Thành tiền</label>
                  <div className="m-tc-lap-inp-tien-wrap">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="m-tc-lap-inp"
                      value={money(d.tien)}
                      onChange={e => {
                        const num = docSoVN(goSoVN(e.target.value, false))
                        handleSuaDong(idx, { tien: num, gia: num })
                      }}
                    />
                    <span className="don-vi">đ</span>
                    <svg className="ic-link" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <span className="m-tc-subtext">Đồng bộ với Số tiền chi ở đầu phiếu</span>
                </div>

                {/* Nút toggle mở rộng thông tin dòng */}
                <div className="m-tc-lap-mo-rong">
                  <button
                    type="button"
                    className="m-tc-btn-toggle-mo-rong"
                    onClick={() => setDongMoRong(m => ({ ...m, [idx]: !moRong }))}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: moRong ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                    <span>Thêm thông tin dòng</span>
                  </button>
                  <span className="m-tc-subtext">Lý do chi, Đối tượng, Khoản mục, Công việc</span>

                  {moRong && (
                    <div className="m-tc-lap-cac-truong-mo-rong">
                      <div className="m-tc-lap-field">
                        <label className="nhan">Khoản mục</label>
                        <input
                          type="text"
                          className="m-tc-lap-inp"
                          value={d.km || ''}
                          onChange={e => handleSuaDong(idx, { km: e.target.value })}
                          placeholder="Mã khoản mục chi phí"
                        />
                      </div>
                      <div className="m-tc-lap-field">
                        <label className="nhan">Công việc</label>
                        <input
                          type="text"
                          className="m-tc-lap-inp"
                          value={d.cv || ''}
                          onChange={e => handleSuaDong(idx, { cv: e.target.value })}
                          placeholder="Công việc hoặc sự kiện"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Nút Thêm dòng viền nét đứt */}
          <button
            type="button"
            className="m-tc-btn-them-dong-dashed"
            onClick={handleThemDong}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Thêm dòng</span>
          </button>

              {/* Dòng tổng cộng */}
              <div className="m-tc-dong-tong-cong">
                <span className="nhan">Tổng cộng ({dsDong.length} dòng)</span>
                <span className={`so ${isChi ? 'chi' : isThu ? 'thu' : 'cq'}`}>{money(soTien)} đ</span>
              </div>
            </section>
          </>
        )}
      </main>

      {/* ── FOOTER CỐ ĐỊNH ĐÁY ── */}
      <footer className="m-tc-lap-footer m-lp-day">
        <button
          type="button"
          className="m-tc-btn-huy"
          onClick={() => nav(path)}
        >
          Huỷ thay đổi
        </button>

        <button
          type="button"
          className="m-tc-btn-luu m-lp-nut-chinh m-lp-nut-luu"
          onClick={handleLuu}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Lưu phiếu</span>
        </button>
      </footer>

      {/* ── SHEET CHỌN ĐỐI TƯỢNG THEO FIGMA MB05.1 ── */}
      {moChonDt && (
        <div className="m-tc-sheet-overlay" onClick={() => setMoChonDt(false)}>
          <div className="m-tc-sheet-tam m-tc-dt-sheet" onClick={e => e.stopPropagation()}>
            <div className="m-tc-sheet-handle" />
            <div className="m-tc-dt-dau">
              <h2 className="m-tc-dt-tieu-de">Chọn đối tượng</h2>
              <button
                type="button"
                className="m-tc-btn-dong-x"
                onClick={() => setMoChonDt(false)}
                aria-label="Đóng"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Ô tìm kiếm */}
            <div className="m-tc-dt-tim-wrap">
              <svg className="m-tc-dt-tim-ic" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                autoFocus
                className="m-tc-dt-tim-inp"
                placeholder="Tìm tên, mã, số điện thoại…"
                value={timDt}
                onChange={e => setTimDt(e.target.value)}
              />
            </div>

            {/* Chip lọc loại đối tượng */}
            <div className="m-tc-dt-chips">
              <button
                type="button"
                className={`m-tc-dt-chip${tabLoaiDt === 'all' ? ' on' : ''}`}
                onClick={() => setTabLoaiDt('all')}
              >
                Tất cả
              </button>
              <button
                type="button"
                className={`m-tc-dt-chip${tabLoaiDt === 'ncc' ? ' on' : ''}`}
                onClick={() => setTabLoaiDt('ncc')}
              >
                Nhà cung cấp
              </button>
              <button
                type="button"
                className={`m-tc-dt-chip${tabLoaiDt === 'nv' ? ' on' : ''}`}
                onClick={() => setTabLoaiDt('nv')}
              >
                Nhân viên
              </button>
              <button
                type="button"
                className={`m-tc-dt-chip${tabLoaiDt === 'kh' ? ' on' : ''}`}
                onClick={() => setTabLoaiDt('kh')}
              >
                Khách hàng
              </button>
            </div>

            {/* Nhóm GẦN ĐÂY */}
            <div className="m-tc-dt-nhom">GẦN ĐÂY</div>

            {/* Danh sách đối tượng */}
            <div className="m-tc-dt-ds">
              {dsDoiTuongLoc.map(d => {
                const isSelected = d.ten === doiTuong
                return (
                  <div
                    key={d.ma}
                    className="m-tc-dt-item"
                    onClick={() => {
                      setDoiTuong(d.ten)
                      if (d.diaChi) setDiaChi(d.diaChi)
                      setMoChonDt(false)
                      setDaSua(true)
                    }}
                  >
                    <div className="m-tc-dt-avatar" style={{ background: d.bg, color: d.color }}>
                      {d.avatar}
                    </div>
                    <div className="m-tc-dt-info">
                      <span className="ten">{d.ten}</span>
                      <span className="loai">{d.loai}</span>
                    </div>
                    {isSelected && (
                      <svg className="m-tc-dt-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0560a6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Nút Thêm đối tượng mới */}
            <button
              type="button"
              className="m-tc-dt-btn-them-moi"
              onClick={() => {
                toast('Mở form tạo đối tượng mới')
                setMoChonDt(false)
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Thêm đối tượng mới</span>
            </button>
          </div>
        </div>
      )}

      {/* Sheet chọn chi nhánh */}
      <MChon
        mo={moChonCn}
        onDong={() => setMoChonCn(false)}
        tieuDe="Chọn chi nhánh"
        ds={CUA_HANG.map(c => ({ k: c.ten, ten: c.ten }))}
        chon={cuaHang}
        onChon={handleChonCn}
      />

      {/* Sheet chọn loại phiếu */}
      <MChon
        mo={moChonLoai}
        onDong={() => setMoChonLoai(false)}
        tieuDe="Chọn loại phiếu"
        ds={dsLoaiOptions}
        chon={loai}
        onChon={k => {
          setLoai(k)
          const pfx = (k === 'chi' ? 'PC' : k === 'unc' ? 'UNC' : k === 'thu' ? 'PT' : k === 'bc' ? 'BC' : 'CQ')
          if (!dangSua) setSoCt(soKeTiep(manKey, `${pfx}2610-`))
          setMoChonLoai(false)
          setDaSua(true)
          // Đổi loại phiếu: kiểm tra quỹ có còn hợp lệ không
          const ch = CUA_HANG.find(c => c.ten === cuaHang || c.id === cuaHang)
          if (k === 'thu' || k === 'chi') {
            const quyTm = ch ? `Quỹ tiền mặt ${ch.ngan}` : ''
            if (quy !== quyTm) setQuy('')
          } else if (k === 'bc' || k === 'unc') {
            const listNh = TK_NGAN_HANG.map(t => `${t.nh.split(',')[0]} ${t.so}`)
            if (!listNh.includes(quy)) setQuy('')
          }
        }}
      />

      {/* Sheet chọn Quỹ */}
      <MChon
        mo={moChonQuy}
        onDong={() => setMoChonQuy(false)}
        tieuDe="Chọn quỹ tiền"
        ds={dsQuyOptions}
        chon={quy}
        onChon={k => {
          setQuy(k)
          setMoChonQuy(false)
          setDaSua(true)
        }}
      />

      {/* Sheet chọn Lý do thu/chi */}
      <MChon
        mo={moChonLyDo}
        onDong={() => setMoChonLyDo(false)}
        tieuDe={isChi ? 'Chọn lý do chi' : 'Chọn lý do thu'}
        ds={dsLyDoOptions}
        chon={lyDo}
        onChon={k => {
          setLyDo(k)
          setMoChonLyDo(false)
          setDaSua(true)
          const tk = tkTheoLyDo(isChi ? 'chi' : isThu ? 'thu' : 'cq', k)
          if (tk.tkNo || tk.tkCo) {
            setDsDong(prev => prev.map((d, i) => i === 0 ? {
              ...d,
              tkNo: tk.tkNo ?? d.tkNo,
              tkCo: tk.tkCo ?? d.tkCo,
            } : d))
          }
        }}
      />

      {/* Sheet chọn Tài khoản Nợ */}
      <MChon
        mo={moChonTk}
        onDong={() => setMoChonTk(false)}
        tieuDe="Chọn tài khoản"
        tim
        ds={dsTkOptions}
        chon={dsDong[0]?.tkNo ?? '6422'}
        onChon={k => {
          setDsDong(prev => prev.map((d, i) => i === 0 ? { ...d, tkNo: k } : d))
          setMoChonTk(false)
          setDaSua(true)
        }}
      />

      {/* Sheet chọn Tháng chi phí */}
      <MChon
        mo={moChonThangCp}
        onDong={() => setMoChonThangCp(false)}
        tieuDe="Chọn tháng ghi nhận"
        ds={dsThangOptions}
        chon={thangChiPhi}
        onChon={k => {
          setThangChiPhi(k)
          setMoChonThangCp(false)
          setDaSua(true)
        }}
      />

      {/* Sheet chọn Ngày */}
      {moLich && (
        <LichDon
          value={ngay}
          onChange={(val: string) => {
            setNgay(val)
            setMoLich(false)
            setDaSua(true)
          }}
          onDong={() => setMoLich(false)}
        />
      )}
    </div>
  )
}
