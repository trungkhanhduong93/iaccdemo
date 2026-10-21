import { useEffect, useMemo, useState, type FC } from 'react'
import { quayLaiMobile } from './quayLai'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { duongDan } from '../../app/registry'
import { cuaHangHienTai, useSession } from '../../app/session'
import { docSoTien, money } from '../format'
import { goSoVN, docSoVN } from '../OSoGo'
import { CUA_HANG, HOM_NAY, KHACH, LY_CHI_PHI, LY_DO, NCC, NHAN_VIEN, TK_NGAN_HANG } from '../../data/mock'
import { layChiNhanhNho } from '../ChonCuaHangTruoc'
import { soKeTiep, suaPhieu, themPhieu, ghiNhatKy } from '../generic/daXoa'
import { MAN_THU_CHI, QUY_TIEN, TEN_CT_TT, TIEN_TO_CT_TT } from '../generic/ChungTuForm'
import { doanLyDoThuChi, dongCua, tkTheoLyDo, ttNghiepVu } from '../generic/gen'
import { useDongChungTu } from '../generic/VoucherScreen'
import { theoLoai } from '../generic/nhom'
import { TAI_KHOAN } from '../../modules/danh-muc/data'
import { MChon } from './MChon'
import { MThemNhanh } from './MThemNhanh'
import { Icon } from '../Icon'
import { addCatalogRow, getAllCatalogRows, getDmMeta, sinhMaKeTiep, useAddedCatalogRows } from '../generic/danhMucStore'
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
  moi?: boolean   // dòng vừa bấm Thêm dòng, nền xanh nhạt để phân biệt dòng đã có
}

interface DoiTuongDm {
  ma: string
  ten: string
  loai: string
  mst: string
  diaChi?: string
}

/** Địa chỉ mẫu theo mã đối tượng để ô Địa chỉ tự điền; danh mục giả chưa có cột địa chỉ */
const DIA_CHI_DT: Record<string, string> = {
  NCC001: '12 Nguyễn Thị Định, An Phú, TP. Thủ Đức',
  NCC003: '158 Đinh Tiên Hoàng, Đa Kao, Quận 1, TP.HCM',
  NCC005: 'Ấp Chợ Cũ, An Nhơn Tây, Củ Chi, TP.HCM',
  NCC006: '228 Cộng Hoà, Phường 12, Tân Bình, TP.HCM',
  NCC007: '72 Hai Bà Trưng, Bến Nghé, Quận 1, TP.HCM',
  KL: 'Bán lẻ tại quầy',
  KH004: '88 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM',
  SPF: 'Tầng 17 Saigon Centre, 67 Lê Lợi, Quận 1',
  NV002: 'Bộ phận Kế toán',
  NV004: 'Cửa hàng trưởng Lê Lợi',
}

/** Danh sách chọn đối tượng đọc từ danh mục Đối tượng (1.5), gồm cả đối tượng vừa thêm trong phiên */
const dsDoiTuongDm = (): DoiTuongDm[] => getAllCatalogRows('1.5').map(d => {
  const ma = String(d.ma ?? '')
  const loai = String(d.loai ?? '')
  return { ma, ten: String(d.ten ?? ''), loai, mst: String(d.mst ?? ''), diaChi: d.diaChi ? String(d.diaChi) : DIA_CHI_DT[ma] }
})

export const MDtThuChiLap: FC<MDtThuChiLapProps> = ({ sc, mod, id, row: rowProp }) => {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const [sp] = useSearchParams()

  const { rows, cfg } = useDongChungTu(sc, mod)
  const manKey = `${mod.key}/${sc.slug}`
  const row = rowProp ?? (id && id !== 'moi' ? rows.find(r => String(r.id) === String(id)) : undefined)
  const dangSua = Boolean(id && id !== 'moi' && row)
  // Sao chép từ màn xem (T539): phiếu mới mang nội dung phiếu gốc, trừ số phiếu, ngày, thẻ chi phí
  const loc = useLocation()
  const saoChep = !row ? (loc.state as { saoChep?: Row } | null)?.saoChep : undefined
  const dienSan = !row ? (loc.state as {
    dienSan?: {
      loai: string
      quy: string
      ngay: string
      soTien: number
      doiTuong: string
      diaChi?: string
      nguoiGiaoDich?: string
      lyDo?: string
      dienGiai?: string
      thamChieuSo?: string
      thamChieuDi?: string
      veGoc?: string
      manMua?: string
      idMua?: string
      soMua?: string
      dsTtCu?: { id: string; so: string; loai: string; tien: number; ngay?: string; quy?: string }[]
    }
  } | null)?.dienSan : undefined
  const goc = row ?? saoChep
  const dongHoacHuy = () => {
    if (dienSan?.veGoc) {
      nav(dienSan.veGoc, { replace: true })
      return
    }
    quayLaiMobile(nav, dangSua ? `${path}/${id}` : path)
  }
  // Lý do, người giao dịch đoán như màn xem phiếu để sửa, sao chép không bị trống
  // Dòng chi tiết của phiếu như màn xem: phiếu mẫu chưa có _dong thì sinh theo số phiếu
  const dongGoc = (r: Row) => (r._dong as DongChiTiet[] | undefined) ?? dongCua(theoLoai(cfg, String(r.loai ?? '')), `${sc.code ?? sc.slug}-${r.id}`) as DongChiTiet[]
  const lyDoGoc = (r?: Row) => !r ? '' : String(r._lyDo ?? dongGoc(r)[0]?.ly ?? doanLyDoThuChi(String(r.loai ?? ''), String(r.dienGiai || '')) ?? '')
  const nguoiGoc = (r?: Row) => !r ? '' : String(r._nguoiGiao ?? r._nguoi ?? ttNghiepVu(r).nguoi ?? '')
  const loaiUrl = sp.get('loai') || 'chi'
  const [loai, setLoai] = useState<string>(() => dienSan?.loai ?? (goc?.loai ? String(goc.loai) : loaiUrl))

  const isChi = loai === 'chi' || loai === 'unc'
  const isThu = loai === 'thu' || loai === 'bc'
  const isCq = loai === 'cq'
  const isFreeThuChi = s.goi === 'F' && !isCq

  const cnNhoId = layChiNhanhNho()
  const cnNhoTen = CUA_HANG.find(c => c.id === cnNhoId)?.ten
  const [cuaHang, setCuaHang] = useState<string>(() =>
    row?.cn ? String(row.cn) : (dangSua && goc?.cn ? String(goc.cn) : (cuaHangHienTai(s)?.ten || cnNhoTen || CUA_HANG[0].ten))
  )
  const [moChonCn, setMoChonCn] = useState(false)

  const [soTien, setSoTien] = useState<number>(() => {
    if (dienSan?.soTien) return Number(dienSan.soTien)
    if (goc) return Number(goc.tong) || Number(goc.tien) || 0
    return 0
  })
  const [strTien, setStrTien] = useState<string>(() => (soTien > 0 ? money(soTien) : (dienSan?.soTien ? money(dienSan.soTien) : '')))

  const [quy, setQuy] = useState<string>(() => {
    if (dienSan?.quy) return dienSan.quy
    if (goc?._quy) return String(goc._quy)
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
  const [ngay, setNgay] = useState<string>(() => dienSan?.ngay ?? (row?.ngay ? String(row.ngay) : ngayHomNay))
  const [soCt, setSoCt] = useState<string>(() => {
    if (row?.so) return String(row.so)
    const pfx = isChi ? (loai === 'unc' ? 'UNC' : 'PC') : isThu ? (loai === 'bc' ? 'BC' : 'PT') : 'CQ'
    return soKeTiep(manKey, `${pfx}2610-`)
  })

  // T526: Lập phiếu mới để trống các trường, chỉ giữ mặc định bắt buộc
  const [doiTuong, setDoiTuong] = useState<string>(() => dienSan?.doiTuong ?? (goc?.doiTuong ? String(goc.doiTuong) : ''))
  const [diaChi, setDiaChi] = useState<string>(() => dienSan?.diaChi ?? (goc?._diaChi || goc?.diaChi ? String(goc._diaChi || goc?.diaChi) : ''))
  const [nguoiGiaoDich, setNguoiGiaoDich] = useState<string>(() => dienSan?.nguoiGiaoDich ?? nguoiGoc(goc))

  const [lyDo, setLyDo] = useState<string>(() => {
    if (dienSan?.lyDo) return dienSan.lyDo
    return lyDoGoc(goc)
  })
  const [thangChiPhi, setThangChiPhi] = useState<string>(() => `Tháng ${goc?.thang || 10}/2026`)
  const [ghiChu, setGhiChu] = useState<string>(() => {
    if (dienSan?.dienGiai) return dienSan.dienGiai
    if (goc?._ghiChu) return String(goc._ghiChu)
    if (goc?.dienGiai) return String(goc.dienGiai)
    const ds = goc ? dongGoc(goc) : []
    return ds[0]?.ten ? String(ds[0].ten) : ''
  })
  const theCpDs = Array.isArray(row?._theCp) ? (row?._theCp as string[]) : []

  // Dòng chi tiết
  const [dsDong, setDsDong] = useState<DongChiTiet[]>(() => {
    if (dienSan) {
      const tien = dienSan.soTien || 0
      const dg = dienSan.dienGiai || 'Chi tiền mua hàng'
      const ly = dienSan.lyDo || 'Thanh Toán Công Nợ Nhà Cung Cấp'
      const isUnc = dienSan.loai === 'unc'
      return [{
        ten: dg,
        sl: 1,
        gia: tien,
        tien,
        ly,
        dt: dienSan.doiTuong || '',
        km: '',
        cv: '',
        tkNo: '331',
        tkCo: isUnc ? '1121' : '1111',
      }]
    }
    const ds = goc ? dongGoc(goc) : []
    if (ds.length > 0) {
      return ds.map(d => ({
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
      setNguoiGiaoDich(nguoiGoc(row))
      if (row._quy) setQuy(String(row._quy))
      setLyDo(lyDoGoc(row))
      if (row.thang) setThangChiPhi(`Tháng ${row.thang}/2026`)
      const ds = dongGoc(row)
      if (row._ghiChu || row.dienGiai) {
        setGhiChu(String(row._ghiChu || row.dienGiai))
      } else if (ds[0]?.ten) {
        setGhiChu(String(ds[0].ten))
      }
      if (ds.length > 0) {
        setDsDong(ds.map(d => ({
          ten: d.ten || 'Chi tiết',
          sl: d.sl || 1,
          gia: d.gia || t,
          tien: d.tien || t,
          ly: d.ly || lyDoGoc(row),
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
  const [dangTaiDt, setDangTaiDt] = useState(false)
  const [moThemDt, setMoThemDt] = useState(false)
  const dtDaThem = useAddedCatalogRows('1.5')
  const lyDaThem = useAddedCatalogRows('1.16')
  const [moThemLy, setMoThemLy] = useState(false)
  const [tabLoaiDt, setTabLoaiDt] = useState<'all' | 'ncc' | 'nv' | 'kh'>('all')

  const dsDoiTuongLoc = useMemo(() => {
    let list = dsDoiTuongDm()
    if (tabLoaiDt === 'ncc') list = list.filter(d => d.loai === 'Nhà cung cấp')
    else if (tabLoaiDt === 'nv') list = list.filter(d => d.loai === 'Nhân viên')
    else if (tabLoaiDt === 'kh') list = list.filter(d => d.loai === 'Khách hàng')

    if (timDt.trim()) {
      const q = timDt.trim().toLowerCase()
      list = list.filter(d => d.ten.toLowerCase().includes(q) || d.ma.toLowerCase().includes(q) || d.mst.replace(/\s/g, '').includes(q.replace(/\s/g, '')) || (d.diaChi && d.diaChi.toLowerCase().includes(q)))
    }
    return list
  }, [tabLoaiDt, timDt, dtDaThem])

  const chonLyDo = (k: string) => {
    setLyDo(k)
    setDaSua(true)
    const tk = tkTheoLyDo(isChi ? 'chi' : isThu ? 'thu' : 'cq', k)
    if (tk.tkNo || tk.tkCo) {
      setDsDong(prev => prev.map((d, i) => i === 0 ? {
        ...d,
        tkNo: tk.tkNo ?? d.tkNo,
        tkCo: tk.tkCo ?? d.tkCo,
      } : d))
    }
  }

  const handleSuaTien = (valStr: string) => {
    const formatted = goSoVN(valStr, false)
    setStrTien(formatted ? money(docSoVN(formatted)) : '')
    const num = docSoVN(formatted)
    setSoTien(num)
    setDaSua(true)

    // Đồng bộ vào dòng chi tiết đầu tiên
    if (dsDong.length <= 1) {
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
        moi: true,
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
      dienGiai: isFreeThuChi && dsDong.length <= 1
        ? (ghiChu.trim() || (isChi ? 'Chi tiền' : 'Thu tiền'))
        : (dsDong[0]?.ten || ghiChu || (isChi ? 'Chi tiền' : 'Thu tiền')),
      tien: soTien,
      tong: soTien,
      _dong: isCq
        ? undefined
        : (isFreeThuChi && dsDong.length <= 1)
          ? [{
              ten: ghiChu.trim() || (isChi ? 'Chi tiền' : 'Thu tiền'),
              sl: 1,
              gia: soTien,
              tien: soTien,
              ly: lyDo,
              dt: doiTuong,
              km: dsDong[0]?.km || '',
              cv: dsDong[0]?.cv || '',
            }]
          : dsDong.map(({ moi, ...d }) => ({
              ...d,
              ten: d.ten || ghiChu || (isChi ? 'Chi tiền' : 'Thu tiền'),
              tien: d.tien,
              gia: d.gia ?? d.tien,
              ...(s.goi !== 'F' ? {
                tkNo: d.tkNo || (lyDo.includes('lương') ? '334' : '6422'),
                tkCo: d.tkCo || '1111',
              } : {}),
            })),
      _theCp: theCpDs,
      tt: row?.tt ?? (s.goi === 'F' ? 'ghi' : 'nhap'),
      nguon: row?.nguon ?? 'tay',
    }
    const targetId = dangSua && row ? String(row.id) : `phieu-${Date.now()}`
    if (dienSan) {
      const duLieuMoi: Partial<Row> = {
        ...duLieuPhieu,
        _thamChieu: dienSan.soMua ?? dienSan.thamChieuSo,
        _thamChieuDi: dienSan.thamChieuDi,
      }
      themPhieu(manKey, { id: targetId, ...duLieuMoi }, s.ten)
      ghiNhatKy(manKey, targetId, soCt, s.ten, `Lập mới chứng từ ${soCt}`)

      if (dienSan.manMua && dienSan.idMua) {
        const dsTtMoi = [...(dienSan.dsTtCu ?? []), { id: targetId, so: soCt, loai, tien: soTien, ngay, quy }]
        suaPhieu(dienSan.manMua, dienSan.idMua, { _dsTt: dsTtMoi, _httt: 'congno' })
        ghiNhatKy(dienSan.manMua, dienSan.idMua, dienSan.soMua ?? '', s.ten, `Thanh toán ngay ${money(soTien)} bằng ${soCt}`)
      }
      toast(`Đã lưu phiếu ${soCt}`)
      // Thanh toán ngay từ phiếu mua (T610): lưu xong mở phiếu chi vừa lập, nút quay lại về phiếu mua
      if (dienSan.veGoc) {
        nav(`${path}/${targetId}`, { replace: true })
        return
      }
      setPhieuVuaLuu({ id: targetId, so: soCt })
      setDaLuu(true)
      return
    }
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

  // Phiếu chi có lý do thuộc nhóm Chi phí mới cần tháng ghi nhận chi phí; phiếu thu, phiếu chi khác thì ẩn
  const laChiPhi = isChi && LY_CHI_PHI.includes(lyDo)

  // Lý do thu, chi lấy từ danh mục Lý do nghiệp vụ, gồm cả lý do vừa thêm trong phiên (như web)
  const dsLyDoOptions = useMemo(() => {
    const dung = isChi ? 'Chi tiền' : 'Thu tiền'
    const ds = [...LY_DO.filter(l => l.dung === dung).map(l => ({ ma: String(l.ma ?? ''), ten: l.ten })), ...lyDaThem.filter(l => l.dung === dung).map(l => ({ ma: String(l.ma ?? ''), ten: String(l.ten ?? '').trim() }))]
    const daCo = new Set<string>()
    return ds.filter(l => l.ten && !daCo.has(l.ten) && daCo.add(l.ten)).map(l => ({ k: l.ten, ten: l.ten, ma: l.ma }))
  }, [isChi, lyDaThem])
  const [timLy, setTimLy] = useState('')
  const dsLyDoLoc = useMemo(() => {
    const q = timLy.trim().toLowerCase()
    return q ? dsLyDoOptions.filter(l => l.ten.toLowerCase().includes(q) || l.ma.toLowerCase().includes(q)) : dsLyDoOptions
  }, [dsLyDoOptions, timLy])

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
          onClick={dongHoacHuy}
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
        {dienSan && (
          <div className="m-t600-dai-dien-san">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>Điền sẵn từ phiếu mua <b>{dienSan.soMua ?? dienSan.thamChieuSo}</b>. Kiểm lại rồi bấm Lưu phiếu.</span>
          </div>
        )}
        {/* 1. Card Số tiền (sửa trực tiếp) */}
        <section className="m-tc-card-so-tien">
          <div className="m-tc-hang-loai-ch">
            <div
              className={`m-tc-pill-loai ${isChi ? 'chi' : isThu ? 'thu' : 'cq'}`}
              aria-label="Loại phiếu"
            >
              <span>{tenLoaiHienTai}</span>
            </div>

            <div
              className="m-tc-dong-ch"
              aria-label="Chi nhánh"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>{cuaHang}</span>
            </div>
          </div>

          <label className="m-tc-nhan-tien" htmlFor="tc-nhap-tien">
            {isChi ? 'Số tiền chi' : isThu ? 'Số tiền thu' : 'Số tiền'} <span className="sao">*</span>
          </label>

          <label className="m-tc-o-so-tien-wrap" htmlFor="tc-nhap-tien">
            <input
              id="tc-nhap-tien"
              type="text"
              inputMode="numeric"
              disabled={!isCq && dsDong.length >= 2}
              className={`m-tc-inp-tien m-lp-tien-inp ${isChi ? 'chi' : isThu ? 'thu' : 'cq'}`}
              value={strTien}
              onChange={e => handleSuaTien(e.target.value)}
              placeholder="0"
            />
            <span className={`m-tc-don-vi ${isChi ? 'chi' : isThu ? 'thu' : 'cq'}`}>đ</span>
          </label>

          <label className="m-tc-doc-tien" htmlFor="tc-nhap-tien">
            {docSoTien(soTien)}
          </label>

          {isFreeThuChi ? (
            <div className="m-tc-lap-field">
              <label className="nhan" htmlFor="tc-nhap-dien-giai">Diễn giải</label>
              <input
                id="tc-nhap-dien-giai"
                type="text"
                className="m-tc-lap-inp"
                value={ghiChu}
                onChange={e => {
                  const val = e.target.value
                  setGhiChu(val)
                  setDaSua(true)
                  if (dsDong.length <= 1) {
                    setDsDong(ds => {
                      const n = [...ds]
                      if (n[0]) n[0] = { ...n[0], ten: val }
                      return n
                    })
                  }
                }}
                placeholder="Nhập diễn giải"
              />
            </div>
          ) : (
            !isCq && (
              <div className="m-tc-goi-y-dong-bo">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Phiếu 1 dòng: sửa số tiền ngay tại đây, dòng chi tiết tự cập nhật. Từ 2 dòng trở lên, số tiền = tổng các dòng ở mục Chi tiết.</span>
              </div>
            )
          )}
        </section>

        {/* 2. Group THÔNG TIN CHUNG: ngày, số phiếu, quỹ, lý do (T539) */}
        <div className="m-tc-nhom-chu">THÔNG TIN CHUNG</div>
        <section className="m-tc-lap-card">
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

          <div
            className="m-tc-lap-field m-lp-sua-o"
            onClick={() => setMoChonLyDo(true)}
            style={{ cursor: 'pointer' }}
          >
            <label className="nhan">{isChi ? 'Lý do chi' : 'Lý do thu'} <span className="sao">*</span></label>
            <div className="m-tc-lap-select">
              <div className="m-tc-lydo-val-wrap">
                <span className={`ten${!lyDo ? ' trong' : ''}`}>{lyDo || (isChi ? 'Chọn lý do chi' : 'Chọn lý do thu')}</span>
                {laChiPhi && <span className="m-tc-badge-nhom-cp">Chi phí</span>}
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          {laChiPhi && (
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
          </div>
          )}

          {theCpDs.length > 0 && (
            <div className="m-tc-lap-the-cp-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0560a6" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <div className="thong-tin">
                <span className="nhan">Tham chiếu</span>
                <span className="ma">{theCpDs[0]}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0560a6" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          )}

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

        {/* 3. Group ĐỐI TƯỢNG: đối tượng, địa chỉ, người giao dịch, ghi chú */}
        <div className="m-tc-nhom-chu">ĐỐI TƯỢNG</div>
        <section className="m-tc-lap-card">
          <div className="m-tc-lap-field">
            <label className="nhan">Đối tượng</label>
            <div
              className="m-tc-lap-dt-box"
              onClick={() => setMoChonDt(true)}
            >
              <div className="m-tc-lap-avatar" style={{ background: '#f3f4f6', color: '#9ca3af' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className={`ten${!doiTuong ? ' trong' : ''}`}>{doiTuong || 'Chọn đối tượng'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          <div className="m-tc-lap-field">
            <label className="nhan">Địa chỉ</label>
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
            <span className="m-tc-subtext">Lấy từ danh mục đối tượng, vẫn sửa được nếu cần</span>
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

          {!isFreeThuChi && (
            <div className="m-tc-lap-field">
              <label className="nhan">Ghi chú</label>
              <textarea
                className="m-tc-lap-textarea"
                rows={2}
                value={ghiChu}
                onChange={e => {
                  const val = e.target.value
                  setGhiChu(val)
                  setDaSua(true)
                  if (dsDong.length <= 1) {
                    setDsDong(ds => {
                      const n = [...ds]
                      if (n[0]) n[0] = { ...n[0], ten: val }
                      return n
                    })
                  }
                }}
                placeholder="Nhập ghi chú"
              />
            </div>
          )}
        </section>

        {/* 5. Group CHI TIẾT (hiện cho mọi gói, trừ chuyển quỹ T555; gói F chỉ hiện khi >= 2 dòng T608) */}
        {!isCq && (!isFreeThuChi || dsDong.length >= 2) && (
          <>
            <div className="m-tc-nhom-chu">
              CHI TIẾT <span className="so-dong">{dsDong.length} dòng</span>
            </div>
            <section className="m-tc-lap-card">
              {dsDong.map((d, idx) => {
                const moRong = dongMoRong[idx] ?? false
                return (
                  <div key={idx} className={`m-tc-lap-dong-item${d.moi ? ' moi' : ''}`}>
                    <div className="m-tc-dong-item-dau">
                      <div className="m-tc-stt-tron">{idx + 1}</div>
                      <span className="ten">{d.ten?.trim() ? d.ten : 'Dòng mới'}</span>
                      {dsDong.length > 1 && (
                        <button
                          type="button"
                          className="m-tc-btn-xoa-dong"
                          onClick={() => handleXoaDong(idx)}
                          aria-label="Xoá dòng"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                        placeholder="Nhập diễn giải"
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
                      </div>
                      {dsDong.length === 1 && (
                        <span className="m-tc-subtext">
                          Đồng bộ với Số tiền {isThu ? 'thu' : 'chi'} ở đầu phiếu
                        </span>
                      )}
                    </div>

                    {/* Nút toggle mở rộng thông tin dòng (chỉ gói có phí QD18) */}
                    {s.goi !== 'F' && (
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
                                onChange={e => handleSuaDong(idx, { km: e.target.value.toUpperCase() })}
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
                    )}
                  </div>
                )
              })}

              {/* Nút Thêm dòng viền nét đứt */}
              {!isFreeThuChi && (
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
              )}

              {/* Dòng tổng cộng (chỉ hiện khi từ 2 dòng trở lên) */}
              {dsDong.length >= 2 && (
                <div className="m-tc-dong-tong-cong">
                  <div className="m-tc-tong-trai">
                    <span className="nhan">Tổng cộng</span>
                    <span className="phu">{dsDong.length} dòng</span>
                  </div>
                  <span className={`so ${isChi ? 'chi' : isThu ? 'thu' : 'cq'}`}>
                    {money(soTien)} đ
                  </span>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* ── FOOTER CỐ ĐỊNH ĐÁY ── */}
      <footer className="m-tc-lap-footer m-lp-day">
        <button
          type="button"
          className="m-tc-btn-huy"
          onClick={dongHoacHuy}
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

      {/* ── SHEET CHỌN ĐỐI TƯỢNG: cùng bố cục sheet Chọn nhà cung cấp của phiếu mua (T604) ── */}
      {moChonDt && (
        <div className="m-tam-overlay" onClick={() => setMoChonDt(false)}>
          <div className="m-tam-hop m-t600-sheet-85" onClick={e => e.stopPropagation()}>
            <div className="m-tam-dau">
              <h2 className="m-tam-tieu">Chọn đối tượng</h2>
              <button type="button" className="m-tam-dong-btn" onClick={() => setMoChonDt(false)} aria-label="Đóng">
                <Icon n="x" className="ic sm" kieu="net" />
              </button>
            </div>

            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
              <div className="m-lp-tim-hang-wrap" style={{ width: '100%' }}>
                <Icon n="search" className="ic sm m-lp-tim-ic" kieu="net" />
                <input
                  type="text"
                  className="m-lp-tim-hang-inp"
                  placeholder="Tìm tên, mã, MST, SĐT..."
                  value={timDt}
                  onChange={e => setTimDt(e.target.value)}
                />
                {timDt && (
                  <button type="button" className="m-lp-tim-hang-x" onClick={() => setTimDt('')}>
                    <Icon n="x" className="ic sm" kieu="net" />
                  </button>
                )}
              </div>
              {/* Lọc loại đối tượng: thu chi chọn được cả nhà cung cấp, nhân viên, khách hàng */}
              <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
                {([['all', 'Tất cả'], ['ncc', 'Nhà cung cấp'], ['nv', 'Nhân viên'], ['kh', 'Khách hàng']] as const).map(([k, nhan]) => (
                  <button
                    key={k}
                    type="button"
                    className={`btn ${tabLoaiDt === k ? 'pri' : 'sub'} sm`}
                    style={{ height: 28, borderRadius: 14, fontSize: 12, padding: '0 12px', whiteSpace: 'nowrap', flexShrink: 0 }}
                    onClick={() => setTabLoaiDt(k)}
                  >
                    {nhan}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn sub sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, height: 32, borderRadius: 6, fontSize: 12, fontWeight: 600 }}
                  onClick={() => {
                    setMoChonDt(false)
                    setMoThemDt(true)
                  }}
                >
                  <span>⊕</span> Thêm mới
                </button>
                <button
                  type="button"
                  className="btn sub sm"
                  style={{ height: 32, width: 32, padding: 0, borderRadius: 6 }}
                  onClick={() => {
                    setDangTaiDt(true)
                    setTimeout(() => setDangTaiDt(false), 600)
                  }}
                  title="Tải lại"
                >
                  ↻
                </button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                {dsDoiTuongLoc.length} đối tượng
              </div>
            </div>

            <div className="m-t600-sheet-than" style={{ padding: '8px 16px' }}>
              {dangTaiDt ? <div className="m-tc-dt-dang-tai">Đang tải dữ liệu</div> : dsDoiTuongLoc.map(d => {
                const isChon = d.ten === doiTuong
                const vietTat = d.ten.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
                return (
                  <div
                    key={d.ma}
                    className={`m-t600-hang-ncc ${isChon ? 'on' : ''}`}
                    onClick={() => {
                      setDoiTuong(d.ten)
                      if (d.diaChi) setDiaChi(d.diaChi)
                      setMoChonDt(false)
                      setDaSua(true)
                    }}
                  >
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 6,
                      background: 'var(--tint, #10b981)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                      flexShrink: 0
                    }}>
                      {vietTat}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--fg)' }}>{d.ten}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        {d.ma} · {d.loai}{d.mst ? ` · MST ${d.mst}` : ''}
                      </div>
                    </div>
                    {isChon && <span style={{ color: 'var(--tint)' }}><Icon n="check" className="ic sm" kieu="net" /></span>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* cùng bố cục sheet Thêm nhà cung cấp của phiếu mua (T604) */}
      {moThemDt && (
        <MThemNhanh
          tieuDe="Thêm đối tượng"
          dau={{
            ten: timDt.trim(),
            loai: tabLoaiDt === 'ncc' ? 'Nhà cung cấp' : tabLoaiDt === 'nv' ? 'Nhân viên' : tabLoaiDt === 'kh' ? 'Khách hàng' : isChi ? 'Nhà cung cấp' : 'Khách hàng',
          }}
          truong={[
            { k: 'loai', nhan: 'Loại đối tượng', kieu: 'chip', ds: ['Nhà cung cấp', 'Nhân viên', 'Khách hàng'], batBuoc: true },
            { k: 'mst', nhan: 'Mã số thuế', goiY: 'Mã số thuế doanh nghiệp / hộ KD', hien: v => v.loai !== 'Nhân viên' },
            { k: 'ma', nhan: 'Mã đối tượng', batBuoc: true, ngan: true, goiY: 'Tự sinh' },
            { k: 'ten', nhan: 'Tên đối tượng', batBuoc: true, goiY: 'Tên công ty hoặc người nộp, người nhận' },
            { k: 'diaChi', nhan: 'Địa chỉ', goiY: 'Số nhà, đường, phường, quận...' },
            { k: 'email', nhan: 'Email', kieu: 'email', goiY: 'email@congty.com' },
            { k: 'sdt', nhan: 'Số điện thoại', kieu: 'tel', goiY: '0901234567' },
          ]}
          chuThich="Mã đối tượng tự sinh, sửa được. Thông tin khác bổ sung ở Danh mục đối tượng."
          onQuayLai={() => { setMoThemDt(false); setMoChonDt(true) }}
          onDong={() => setMoThemDt(false)}
          onLuu={val => {
            const ten = String(val.ten ?? '').trim()
            const ma = String(val.ma ?? '').trim() || sinhMaKeTiep('1.5', { ...val, ten }, getAllCatalogRows('1.5'))
            addCatalogRow('1.5', { ...val, ma, ten, dongY: 1 })
            setDoiTuong(ten)
            setDiaChi(String(val.diaChi ?? '').trim())
            setDaSua(true)
            setMoThemDt(false)
          }}
        />
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

      {/* Sheet chọn Lý do thu/chi: cùng bố cục sheet Chọn nhà cung cấp của phiếu mua (T604) */}
      {moChonLyDo && (
        <div className="m-tam-overlay" onClick={() => setMoChonLyDo(false)}>
          <div className="m-tam-hop m-t600-sheet-85" onClick={e => e.stopPropagation()}>
            <div className="m-tam-dau">
              <h2 className="m-tam-tieu">{isChi ? 'Chọn lý do chi' : 'Chọn lý do thu'}</h2>
              <button type="button" className="m-tam-dong-btn" onClick={() => setMoChonLyDo(false)} aria-label="Đóng">
                <Icon n="x" className="ic sm" kieu="net" />
              </button>
            </div>

            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
              <div className="m-lp-tim-hang-wrap" style={{ width: '100%' }}>
                <Icon n="search" className="ic sm m-lp-tim-ic" kieu="net" />
                <input
                  type="text"
                  className="m-lp-tim-hang-inp"
                  placeholder="Tìm tên, mã lý do..."
                  value={timLy}
                  onChange={e => setTimLy(e.target.value)}
                />
                {timLy && (
                  <button type="button" className="m-lp-tim-hang-x" onClick={() => setTimLy('')}>
                    <Icon n="x" className="ic sm" kieu="net" />
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn sub sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, height: 32, borderRadius: 6, fontSize: 12, fontWeight: 600 }}
                  onClick={() => {
                    setMoChonLyDo(false)
                    setMoThemLy(true)
                  }}
                >
                  <span>⊕</span> Thêm mới
                </button>
                <button
                  type="button"
                  className="btn sub sm"
                  style={{ height: 32, width: 32, padding: 0, borderRadius: 6 }}
                  onClick={() => {}}
                  title="Tải lại"
                >
                  ↻
                </button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                {dsLyDoLoc.length} lý do
              </div>
            </div>

            <div className="m-t600-sheet-than" style={{ padding: '8px 16px' }}>
              {dsLyDoLoc.length === 0 ? <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Không tìm thấy kết quả phù hợp</div> : dsLyDoLoc.map(l => {
                const isChon = l.ten === lyDo
                const vietTat = l.ten.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
                return (
                  <div
                    key={l.ten}
                    className={`m-t600-hang-ncc ${isChon ? 'on' : ''}`}
                    onClick={() => {
                      chonLyDo(l.ten)
                      setMoChonLyDo(false)
                    }}
                  >
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 6,
                      background: 'var(--tint, #10b981)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                      flexShrink: 0
                    }}>
                      {vietTat}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--fg)' }}>{l.ten}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        {l.ma ? `${l.ma} · ` : ''}{isChi ? 'Chi tiền' : 'Thu tiền'}
                      </div>
                    </div>
                    {isChon && <span style={{ color: 'var(--tint)' }}><Icon n="check" className="ic sm" kieu="net" /></span>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Form thêm lý do vào danh mục Lý do nghiệp vụ ngay từ phiếu, như web; lưu xong chọn luôn */}
      {moThemLy && (() => {
        const meta = getDmMeta(isChi ? 'ly:chi' : 'ly:thu')
        return (
          <MThemNhanh
            tieuDe={isChi ? 'Thêm lý do chi' : 'Thêm lý do thu'}
            dau={meta.dienSan}
            truong={[
              { k: 'ma', nhan: 'Mã lý do', batBuoc: true, ngan: true, goiY: 'Tự sinh' },
              { k: 'ten', nhan: 'Lý do nghiệp vụ', batBuoc: true, goiY: isChi ? 'Vd: Chi tiền điện' : 'Vd: Thu tiền thanh lý' },
              { k: 'chiPhi', nhan: 'Là chi phí', kieu: 'tich', hien: () => isChi },
            ]}
            chuThich="Mã lý do tự sinh, sửa được. Thông tin khác bổ sung ở Danh mục lý do nghiệp vụ."
            onQuayLai={() => { setMoThemLy(false); setMoChonLyDo(true) }}
            onDong={() => setMoThemLy(false)}
            onLuu={val => {
              const ten = String(val.ten ?? '').trim()
              const ma = String(val.ma ?? '').trim() || sinhMaKeTiep(meta.catKey, { ...val, ten }, meta.all)
              const dong = { ...val, ma, ten }
              addCatalogRow(meta.catKey, { ...dong, ...meta.cauHinh?.doi?.('chiPhi', dong, meta.all) })
              chonLyDo(ten)
              setMoThemLy(false)
            }}
          />
        )
      })()}

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
