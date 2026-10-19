import { useEffect, useMemo, useState, type FC } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { dongCua, tkTheoLyDo, type Dong } from '../generic/gen'
import { duongDan, tenMan } from '../../app/registry'
import { cuaHangHienTai, ngayDauNam, truocDauNam, useSession } from '../../app/session'
import { anNgoaiGoi, kieuGhiSo, type Goi } from '../../app/plan'
import { CUA_HANG, HANG, KHACH, KHO, LY_CAN_DOI_TUONG, LY_DO, NCC, NHAN_VIEN, NVL, MA_LY_CHO_PHAN_BO } from '../../data/mock'
import { boO, nhomCua, theoLoai } from '../generic/nhom'
import { DS_DOI_TUONG } from '../generic/BangSua'
import { ghiNhatKy, soKeTiep, suaPhieu, themPhieu } from '../generic/daXoa'
import { MAN_THU_CHI, QUY_TIEN, TEN_CT_TT, TIEN_TO_CT_TT } from '../generic/ChungTuForm'
import { useDongChungTu } from '../generic/VoucherScreen'
import { fold, money } from '../format'
import { Icon } from '../Icon'
import { LichDon } from '../ChonNgay'
import { MChon } from './MChon'
import { MTrong } from './MTrong'
import { MLapPhieuKho } from './MLapPhieuKho'
import { MFormDm } from './MFormDm'
import { addCatalogRow, getDmMeta, useAddedCatalogRows } from '../generic/danhMucStore'
import { TAI_KHOAN } from '../../modules/danh-muc/data'
import { tinhButToan } from './butToan'
import { quyDoiTuDanhMuc } from '../../modules/danh-muc/QuyDoiDvt'
import { goSoVN, docSoVN } from '../OSoGo'

const DS_TK_CHI_TIET = TAI_KHOAN.filter(
  t => !TAI_KHOAN.some(other => other.so !== t.so && other.so.startsWith(t.so))
)

const TEN_LY_CHO_PHAN_BO = 'Chi phí chờ phân bổ'

export interface MLapPhieuProps extends ScreenProps {
  id?: string
}

export const MLapPhieu: FC<MLapPhieuProps> = ({ sc, mod, id }) => {
  const cfgMan = sc.voucher
  const laPhieuKho = Boolean(
    cfgMan?.kiemKe ||
    cfgMan?.dieuChinh ||
    cfgMan?.sanXuat ||
    cfgMan?.dieuChuyen
  )

  if (laPhieuKho) {
    return <MLapPhieuKho key={id ?? 'moi'} sc={sc} mod={mod} id={id} />
  }

  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const dangSua = Boolean(id && id !== 'moi')
  const { rows } = useDongChungTu(sc, mod)
  const row = useMemo(() => (dangSua ? rows.find(r => String(r.id) === String(id)) : undefined), [rows, id, dangSua])

  if (dangSua && !row) {
    return (
      <div className="m-xp-trong">
        <MTrong tieuDe="Không tìm thấy chứng từ" moTa="Chứng từ không tồn tại hoặc đã bị xoá" />
        <div className="m-xp-trong-nut">
          <button type="button" className="btn pri" onClick={() => nav(path, { replace: true })}>
            Về danh sách
          </button>
        </div>
      </div>
    )
  }

  return <ThanLapPhieu key={id ?? 'moi'} sc={sc} mod={mod} id={id} row={row} />
}

// ── Bảng số dư quỹ tham khảo ──
const BANG_SO_DU_QUY: Record<string, number> = {
  'Quỹ tiền mặt Nguyễn Trãi': 18393500,
  'Quỹ tiền mặt Lê Lợi': 25140000,
  'Quỹ tiền mặt Thảo Điền': 32500000,
  'Techcombank 1903 4455 6677 88': 319850000,
  'Vietcombank 0071 0012 34567': 144800000,
  'VPBank, chi nhánh Quận 1': 3320000,
}

const soDuQuy = (tenQuy: string): number => {
  if (BANG_SO_DU_QUY[tenQuy] !== undefined) return BANG_SO_DU_QUY[tenQuy]
  if (tenQuy.includes('VPBank')) return 3320000
  if (tenQuy.includes('Techcombank')) return 319850000
  if (tenQuy.includes('Vietcombank')) return 144800000
  if (tenQuy.startsWith('Quỹ tiền mặt')) return 18393500
  return 15000000
}

const isQuyTienMat = (tenQuy: string) => {
  return tenQuy.toLowerCase().includes('tiền mặt') || tenQuy.startsWith('TM')
}

const nhanVat = (ts: number | undefined) => {
  if (ts === undefined || ts === 0) return 'KCT'
  return `${ts}%`
}

// ── Thẻ mặt hàng phiếu điện thoại (T300, T414) ──
type DongM = Dong & {
  giaGoc?: number
  dvtChinh?: string
  tongNhap?: number
  tuChia?: boolean
}

interface TheHangMoiProps {
  idx: number
  d: DongM
  goi: Goi
  dangSua: boolean
  kieuGiam: '%' | 'đ'
  onDoiKieuGiam: (kieu: '%' | 'đ') => void
  onBatSua: () => void
  onXoa: () => void
  onMoChonDvt: () => void
  onMoChonVat: () => void
  onSuaSl: (sl: number) => void
  onSuaGia: (gia: number) => void
  onSuaGiamPt: (pt: number) => void
  onSuaGiamTien: (ck: number) => void
  onSuaTong: (tong: number) => void
}

const dongCongThuc = (d: DongM, kieu: '%' | 'đ') => {
  const sl = Number(d.sl) || 0
  const gia = Number(d.gia) || 0
  const tienHang = Math.round(sl * gia)
  const ck = Number(d.ck) || 0
  const thue = Number(d.thue) || 0
  const tongDong = d.tongNhap !== undefined ? d.tongNhap : (tienHang - ck + thue)

  if (d.tuChia && d.tongNhap !== undefined) {
    return ck > 0 || thue > 0
      ? `Bạn nhập Tổng tiền ${money(d.tongNhap)} → Đơn giá tự chia ${money(gia)} (đã trừ VAT, cộng lại giảm giá)`
      : `Bạn nhập Tổng tiền ${money(d.tongNhap)} → Đơn giá = ${money(d.tongNhap)} ÷ ${sl} = ${money(gia)}`
  }
  if (ck > 0 || thue > 0) {
    const phanGiam = ck > 0 ? ` − giảm ${money(ck)}` : ''
    const phanThue = thue > 0 ? ` + VAT ${money(thue)}` : ''
    return (
      <>
        {money(tienHang)}{phanGiam}{phanThue} = <b>{money(tongDong)}</b>
      </>
    )
  }
  return (
    <>
      {money(tienHang)} = <b>{money(tongDong)}</b>
    </>
  )
}

const TheHangMoi: FC<TheHangMoiProps> = ({
  idx,
  d,
  goi,
  dangSua,
  kieuGiam,
  onDoiKieuGiam,
  onBatSua,
  onXoa,
  onMoChonDvt,
  onMoChonVat,
  onSuaSl,
  onSuaGia,
  onSuaGiamPt,
  onSuaGiamTien,
  onSuaTong,
}) => {
  const [focusSl, setFocusSl] = useState(false)
  const [strSl, setStrSl] = useState('')
  const [focusGia, setFocusGia] = useState(false)
  const [strGia, setStrGia] = useState('')
  const [focusGiam, setFocusGiam] = useState(false)
  const [strGiam, setStrGiam] = useState('')
  const [focusTong, setFocusTong] = useState(false)
  const [strTong, setStrTong] = useState('')

  const dvtChinh = d.dvtChinh || HANG.find(h => h.ma === d.ma || h.ten === d.ten)?.dvt || NVL.find(n => n.ma === d.ma || n.ten === d.ten)?.dvt || d.dvt
  const dsQd = useMemo(() => quyDoiTuDanhMuc(d.ten, dvtChinh), [d.ten, dvtChinh])
  const coQuyDoi = !anNgoaiGoi(goi) && dsQd.length > 0
  const tongDong = d.tongNhap !== undefined ? d.tongNhap : ((Number(d.tien) || 0) - (Number(d.ck) || 0) + (Number(d.thue) || 0))

  if (!dangSua) {
    return (
      <div className="m-pb-the m-pb-muc-dong mh-gon" onClick={onBatSua}>
        <div className="m-pb-muc-hang1">
          <span className="m-pb-muc-ten">
            {d.ma && <span className="m-pb-muc-ma">{d.ma}</span>}
            {d.ten}
          </span>
          <b className="m-pb-muc-tong">{money(tongDong)} đ</b>
        </div>
        <div className="m-pb-muc-hang2">
          <span>
            {d.sl ?? 1} {d.dvt || 'Cái'} × {money(d.gia || 0)} · {Number(d.ck || 0) > 0 ? (d.ptCk ? `giảm ${d.ptCk}%` : `giảm ${money(d.ck || 0)} đ`) : 'không giảm'} · VAT {nhanVat(d.ts)}
          </span>
          <span className="mh-mo">Sửa ›</span>
        </div>
      </div>
    )
  }

  return (
    <div className="m-pb-the mh-sua">
      <div className="mh-dau">
        <span className="m-pb-muc-ten">
          {d.ma && <span className="m-pb-muc-ma">{d.ma}</span>}
          {d.ten}
        </span>
        <button type="button" className="mh-xoa" aria-label="Xoá dòng" onClick={onXoa}>✕</button>
      </div>
      <div className="mh-luoi">
        {/* 1. Số lượng */}
        <label className="mh-o">
          <small>Số lượng *</small>
          <input
            type="text"
            inputMode="decimal"
            value={focusSl ? strSl : (d.sl ?? 1)}
            onFocus={() => { setFocusSl(true); setStrSl(String(d.sl ?? 1)); }}
            onChange={e => {
              const str = goSoVN(e.target.value, true)
              setStrSl(str)
              const v = docSoVN(str)
              onSuaSl(v)
            }}
            onBlur={() => setFocusSl(false)}
          />
        </label>

        {/* 2. ĐVT */}
        <div className="mh-o">
          <small>ĐVT</small>
          {anNgoaiGoi(goi) || !coQuyDoi ? (
            <span className="mh-dvt khoa">{d.dvt || 'Cái'}</span>
          ) : (
            <span className="mh-chon" onClick={onMoChonDvt}>{d.dvt || 'Cái'} ▾</span>
          )}
        </div>

        {/* 3. Đơn giá */}
        <label className={`mh-o ${d.tuChia ? 'tu' : ''}`}>
          <small>Đơn giá {d.tuChia && <em>tự chia</em>}</small>
          <input
            type="text"
            inputMode="numeric"
            readOnly={Boolean(d.tuChia)}
            value={focusGia ? strGia : money(d.gia || 0)}
            onFocus={() => { setFocusGia(true); setStrGia(money(d.gia || 0)); }}
            onChange={e => {
              const str = goSoVN(e.target.value, false)
              setStrGia(str)
              const v = docSoVN(str)
              onSuaGia(v)
            }}
            onBlur={() => setFocusGia(false)}
          />
        </label>

        {/* 4. Giảm giá */}
        <div className="mh-o">
          <small>Giảm giá</small>
          <span className="mh-giam">
            <span className="seg">
              <b className={kieuGiam === '%' ? 'on' : ''} onClick={() => onDoiKieuGiam('%')}>%</b>
              <b className={kieuGiam === 'đ' ? 'on' : ''} onClick={() => onDoiKieuGiam('đ')}>đ</b>
            </span>
            <input
              type="text"
              inputMode={kieuGiam === '%' ? 'decimal' : 'numeric'}
              value={focusGiam ? strGiam : (kieuGiam === '%' ? (d.ptCk ?? 0) : money(d.ck || 0))}
              onFocus={() => {
                setFocusGiam(true)
                setStrGiam(kieuGiam === '%' ? String(d.ptCk ?? 0) : money(d.ck || 0))
              }}
              onChange={e => {
                if (kieuGiam === '%') {
                  const valStr = e.target.value.replace(/[^\d.]/g, '')
                  setStrGiam(valStr)
                  onSuaGiamPt(Number(valStr) || 0)
                } else {
                  const str = goSoVN(e.target.value, false)
                  setStrGiam(str)
                  onSuaGiamTien(docSoVN(str))
                }
              }}
              onBlur={() => setFocusGiam(false)}
            />
          </span>
        </div>

        {/* 5. VAT */}
        <label className="mh-o">
          <small>VAT</small>
          <span className="mh-chon" onClick={onMoChonVat}>{nhanVat(d.ts)} ▾</span>
        </label>

        {/* 6. Tổng tiền */}
        <label className={`mh-o tong ${d.tuChia ? 'dang' : ''}`}>
          <small>Tổng tiền</small>
          <input
            type="text"
            inputMode="numeric"
            value={focusTong ? strTong : money(tongDong)}
            onFocus={() => { setFocusTong(true); setStrTong(money(tongDong)); }}
            onChange={e => {
              const str = goSoVN(e.target.value, false)
              setStrTong(str)
              const v = docSoVN(str)
              onSuaTong(v)
            }}
            onBlur={() => setFocusTong(false)}
          />
        </label>
      </div>
      <div className="mh-cong">{dongCongThuc(d, kieuGiam)}</div>
    </div>
  )
}

interface MSuaHangSheetProps {
  mo: boolean
  idx: number
  dong: DongM
  onDong: () => void
  onCapNhat: (patch: Partial<DongM>) => void
}

function MSuaHangSheet({
  mo,
  idx,
  dong,
  onDong,
  onCapNhat,
}: MSuaHangSheetProps) {
  const [sl, setSl] = useState(dong?.sl ?? 1)
  const [dvt, setDvt] = useState(dong?.dvt || 'Cái')
  const [gia, setGia] = useState(dong?.gia ?? 0)
  const [kieuGiam, setKieuGiam] = useState<'%' | 'đ'>(dong?.ck && !dong?.ptCk ? 'đ' : '%')
  const [ptCk, setPtCk] = useState(dong?.ptCk ?? 0)
  const [ck, setCk] = useState(dong?.ck ?? 0)
  const [ts, setTs] = useState(dong?.ts ?? 0)
  const [thue, setThue] = useState(dong?.thue ?? 0)
  const [tongNhap, setTongNhap] = useState<number | undefined>(dong?.tongNhap)
  const [tuChia, setTuChia] = useState(Boolean(dong?.tuChia))
  const [ghiChu, setGhiChu] = useState(dong?.ghiChu ?? '')

  // Chế độ sửa bút
  const [suaGiamTien, setSuaGiamTien] = useState(false)
  const [suaThueTien, setSuaThueTien] = useState(false)
  const [suaTongTien, setSuaTongTien] = useState(false)

  // Input chuỗi để gõ tự nhiên
  const [strSl, setStrSl] = useState(String(dong?.sl ?? 1))
  const [strGia, setStrGia] = useState(money(dong?.gia ?? 0))
  const [strGiam, setStrGiam] = useState(String(dong?.ptCk ?? 0))
  const [strTienGiam, setStrTienGiam] = useState(money(dong?.ck ?? 0))
  const [strTs, setStrTs] = useState(String(dong?.ts ?? 0))
  const [strTienThue, setStrTienThue] = useState(money(dong?.thue ?? 0))
  const [strTong, setStrTong] = useState('')

  // ĐVT quy đổi
  const dvtChinh = dong?.dvtChinh || HANG.find(h => h.ma === dong?.ma || h.ten === dong?.ten)?.dvt || NVL.find(n => n.ma === dong?.ma || n.ten === dong?.ten)?.dvt || dong?.dvt || 'Cái'
  const dsQd = useMemo(() => quyDoiTuDanhMuc(dong?.ten || '', dvtChinh), [dong?.ten, dvtChinh])
  const dsDvt = useMemo(() => [dvtChinh, ...dsQd.map(q => q.dv)].filter(Boolean), [dvtChinh, dsQd])

  useEffect(() => {
    if (dong && mo) {
      setSl(dong.sl ?? 1)
      setDvt(dong.dvt || 'Cái')
      setGia(dong.gia ?? 0)
      const kg = dong.ck && !dong.ptCk ? 'đ' : '%'
      setKieuGiam(kg)
      setPtCk(dong.ptCk ?? 0)
      setCk(dong.ck ?? 0)
      setTs(dong.ts ?? 0)
      setThue(dong.thue ?? 0)
      setTongNhap(dong.tongNhap)
      setTuChia(Boolean(dong.tuChia))
      setGhiChu(dong.ghiChu ?? '')

      setSuaGiamTien(false)
      setSuaThueTien(false)
      setSuaTongTien(false)

      setStrSl(String(dong.sl ?? 1))
      setStrGia(money(dong.gia ?? 0))
      setStrGiam(kg === '%' ? String(dong.ptCk ?? 0) : money(dong.ck ?? 0))
      setStrTienGiam(money(dong.ck ?? 0))
      setStrTs(String(dong.ts ?? 0))
      setStrTienThue(money(dong.thue ?? 0))
      const tongHienTai = dong.tongNhap !== undefined ? dong.tongNhap : (Math.round((dong.sl ?? 1) * (dong.gia ?? 0)) - (dong.ck ?? 0) + (dong.thue ?? 0))
      setStrTong(money(tongHienTai))
    }
  }, [dong, mo])

  if (!mo || !dong) return null

  const tienHang = Math.round(sl * gia)
  const tienGiamHienTai = ck
  const tienThueHienTai = thue
  const tongHienTai = tongNhap !== undefined ? tongNhap : (tienHang - tienGiamHienTai + tienThueHienTai)

  const handleDoiSl = (v: number) => {
    setSl(v)
    const newTien = Math.round(v * gia)
    let newCk = ck
    if (kieuGiam === '%') {
      newCk = Math.round((newTien * ptCk) / 100)
      setCk(newCk)
      setStrTienGiam(money(newCk))
    }
    const newThue = Math.round(((newTien - newCk) * ts) / 100)
    setThue(newThue)
    setStrTienThue(money(newThue))
    if (tuChia && tongNhap !== undefined) {
      const g = v > 0 ? Math.round((tongNhap - newThue + newCk) / v) : 0
      setGia(g)
      setStrGia(money(g))
    } else {
      setStrTong(money(newTien - newCk + newThue))
    }
  }

  const handleDoiGia = (g: number) => {
    setGia(g)
    setTuChia(false)
    setTongNhap(undefined)
    const newTien = Math.round(sl * g)
    let newCk = ck
    if (kieuGiam === '%') {
      newCk = Math.round((newTien * ptCk) / 100)
      setCk(newCk)
      setStrTienGiam(money(newCk))
    }
    const newThue = Math.round(((newTien - newCk) * ts) / 100)
    setThue(newThue)
    setStrTienThue(money(newThue))
    setStrTong(money(newTien - newCk + newThue))
  }

  const handleDoiGiamVal = (valStr: string) => {
    if (kieuGiam === '%') {
      const val = Number(valStr.replace(/[^\d.]/g, '')) || 0
      setStrGiam(valStr)
      setPtCk(val)
      const c = Math.round((tienHang * val) / 100)
      setCk(c)
      setStrTienGiam(money(c))
      const newThue = Math.round(((tienHang - c) * ts) / 100)
      setThue(newThue)
      setStrTienThue(money(newThue))
      setStrTong(money(tienHang - c + newThue))
    } else {
      const formatted = goSoVN(valStr, false)
      setStrGiam(formatted)
      const c = docSoVN(formatted)
      setCk(c)
      setStrTienGiam(money(c))
      const pt = tienHang > 0 ? Math.round((c / tienHang) * 10000) / 100 : 0
      setPtCk(pt)
      const newThue = Math.round(((tienHang - c) * ts) / 100)
      setThue(newThue)
      setStrTienThue(money(newThue))
      setStrTong(money(tienHang - c + newThue))
    }
  }

  const handleSuaTienGiamTrucTiep = (valStr: string) => {
    const formatted = goSoVN(valStr, false)
    setStrTienGiam(formatted)
    const tienG = docSoVN(formatted)
    setCk(tienG)
    const pt = tienHang > 0 ? Math.round((tienG / tienHang) * 10000) / 100 : 0
    setPtCk(pt)
    if (kieuGiam === '%') setStrGiam(String(pt))
    else setStrGiam(formatted)
    const newThue = Math.round(((tienHang - tienG) * ts) / 100)
    setThue(newThue)
    setStrTienThue(money(newThue))
    setStrTong(money(tienHang - tienG + newThue))
  }

  const handleDoiTsVal = (valStr: string) => {
    const val = Number(valStr.replace(/[^\d.]/g, '')) || 0
    setStrTs(valStr)
    setTs(val)
    const newThue = Math.round(((tienHang - ck) * val) / 100)
    setThue(newThue)
    setStrTienThue(money(newThue))
    setStrTong(money(tienHang - ck + newThue))
  }

  const handleSuaThueTrucTiep = (valStr: string) => {
    const formatted = goSoVN(valStr, false)
    setStrTienThue(formatted)
    const thueVal = docSoVN(formatted)
    setThue(thueVal)
    setStrTong(money(tienHang - ck + thueVal))
  }

  const handleSuaTongTrucTiep = (valStr: string) => {
    const formatted = goSoVN(valStr, false)
    setStrTong(formatted)
    const tVal = docSoVN(formatted)
    setTongNhap(tVal)
    setTuChia(true)
    const g = sl > 0 ? Math.round((tVal - thue + ck) / sl) : 0
    setGia(g)
    setStrGia(money(g))
  }

  const handleChuyenDvt = () => {
    if (dsDvt.length <= 1) return
    const curIdx = dsDvt.indexOf(dvt)
    const nextIdx = (curIdx + 1) % dsDvt.length
    setDvt(dsDvt[nextIdx])
  }

  const handleCapNhat = () => {
    onCapNhat({
      sl,
      dvt,
      gia,
      tien: Math.round(sl * gia),
      ptCk,
      ck,
      ts,
      thue,
      tongNhap,
      tuChia,
      ghiChu: ghiChu.trim() || undefined,
    })
  }

  return (
    <div className="m-t449-sheet-nen">
      <div className="m-t449-sheet-mo" onClick={onDong} />
      <div className="m-t449-sheet-hop" onClick={e => e.stopPropagation()}>
        <div className="m-t449-sheet-keo" />

        <div className="m-t449-sheet-dau">
          <div className="m-t449-sheet-tieu-de">{idx + 1}. {dong.ten}</div>
          <div className="m-t449-sheet-phu">Mã: {dong.ma || 'NVL001'}</div>
        </div>

        <div className="m-t449-sheet-than">
          {/* Số lượng */}
          <div className="m-t449-sheet-dong">
            <span className="lbl m-t449-lbl-100">Số lượng:</span>
            <div className="m-t449-sheet-inp-wrap">
              <input
                type="text"
                aria-label="Số lượng"
                value={strSl}
                onChange={e => {
                  const s = goSoVN(e.target.value, true)
                  setStrSl(s)
                  handleDoiSl(docSoVN(s))
                }}
              />
              <span className="m-t449-sheet-don-vi" onClick={handleChuyenDvt}>
                <span>{dvt}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>

          {/* Đơn giá */}
          <div className="m-t449-sheet-dong">
            <span className="lbl m-t449-lbl-100">Đơn giá:</span>
            <div className="m-t449-sheet-inp-wrap">
              <input
                type="text"
                aria-label="Đơn giá"
                value={strGia}
                onChange={e => {
                  const s = goSoVN(e.target.value, false)
                  setStrGia(s)
                  handleDoiGia(docSoVN(s))
                }}
              />
              <span className="m-t449-sheet-don-vi vnd">đ</span>
            </div>
          </div>

          {/* Giảm giá */}
          <div className="m-t449-sheet-dong">
            <span className="lbl m-t449-lbl-100">Giảm giá:</span>
            <div className="m-t449-sheet-inp-wrap">
              <input
                type="text"
                aria-label="Phần trăm giảm"
                value={strGiam}
                onChange={e => handleDoiGiamVal(e.target.value)}
              />
              <span
                className="m-t449-sheet-don-vi"
                onClick={() => {
                  const moi = kieuGiam === '%' ? 'đ' : '%'
                  setKieuGiam(moi)
                  setStrGiam(moi === '%' ? String(ptCk) : money(ck))
                }}
              >
                <span>{kieuGiam}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>

          {/* Tiền giảm giá */}
          <div className="m-t449-sheet-dong">
            <span className="lbl">Tiền giảm giá:</span>
            <div className="m-t449-sheet-phai-hop">
              {suaGiamTien ? (
                <div className="m-t449-sheet-inp-wrap m-t449-inp-w140">
                  <input
                    type="text"
                    autoFocus
                    aria-label="Sửa tiền giảm giá"
                    value={strTienGiam}
                    onChange={e => handleSuaTienGiamTrucTiep(e.target.value)}
                    onBlur={() => setSuaGiamTien(false)}
                  />
                  <span className="m-t449-sheet-don-vi vnd">đ</span>
                </div>
              ) : (
                <>
                  <span className="m-t449-val-bold">{money(ck)} đ</span>
                  <button
                    type="button"
                    aria-label="Sửa tiền giảm giá"
                    className="m-t449-sheet-but"
                    onClick={() => {
                      setSuaGiamTien(true)
                      setStrTienGiam(String(ck))
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* VAT */}
          <div className="m-t449-sheet-dong">
            <span className="lbl">VAT:</span>
            <div className="m-t449-sheet-phai-hop">
              <div className="m-t449-vat-hop">
                <input
                  type="text"
                  aria-label="Thuế suất VAT"
                  value={strTs}
                  onChange={e => handleDoiTsVal(e.target.value)}
                  className="m-t449-vat-inp"
                />
                <span className="m-t449-vat-phan-tram">%</span>
              </div>
              {suaThueTien ? (
                <div className="m-t449-sheet-inp-wrap m-t449-inp-w120">
                  <input
                    type="text"
                    autoFocus
                    aria-label="Sửa tiền VAT"
                    value={strTienThue}
                    onChange={e => handleSuaThueTrucTiep(e.target.value)}
                    onBlur={() => setSuaThueTien(false)}
                  />
                  <span className="m-t449-sheet-don-vi vnd">đ</span>
                </div>
              ) : (
                <>
                  <span className="m-t449-val-bold">{money(thue)} đ</span>
                  <button
                    type="button"
                    aria-label="Sửa tiền VAT"
                    className="m-t449-sheet-but"
                    onClick={() => {
                      setSuaThueTien(true)
                      setStrTienThue(String(thue))
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tổng tiền */}
          <div className="m-t449-sheet-dong">
            <span className="lbl val bold">Tổng tiền:</span>
            <div className="m-t449-sheet-phai-hop">
              {suaTongTien ? (
                <div className="m-t449-sheet-inp-wrap m-t449-inp-w160">
                  <input
                    type="text"
                    autoFocus
                    aria-label="Sửa tổng tiền"
                    value={strTong}
                    onChange={e => handleSuaTongTrucTiep(e.target.value)}
                    onBlur={() => setSuaTongTien(false)}
                  />
                  <span className="m-t449-sheet-don-vi vnd">đ</span>
                </div>
              ) : (
                <>
                  <span className="m-t449-val-tong">{money(tongHienTai)} đ</span>
                  <button
                    type="button"
                    aria-label="Sửa tổng tiền"
                    className="m-t449-sheet-but"
                    onClick={() => {
                      setSuaTongTien(true)
                      setStrTong(String(tongHienTai))
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Ghi chú nếu có */}
          <div className="m-t449-ghi-chu-wrap">
            <input
              type="text"
              aria-label="Ghi chú mặt hàng"
              className="m-t449-ghi-chu-inp"
              placeholder="Nhập ghi chú nếu có"
              value={ghiChu}
              onChange={e => setGhiChu(e.target.value)}
            />
          </div>
        </div>

        {/* Chân bảng trượt */}
        <div className="m-t449-sheet-chan">
          <button type="button" className="m-t449-btn-huy" onClick={onDong}>
            Huỷ
          </button>
          <button type="button" className="m-t449-btn-luu" onClick={handleCapNhat}>
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  )
}

interface ThanLapPhieuProps extends ScreenProps {
  id?: string
  row?: Row
}

const ThanLapPhieu: FC<ThanLapPhieuProps> = ({ sc, mod, id, row }) => {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const loc = useLocation()
  const [sp] = useSearchParams()
  const path = duongDan(mod, sc)

  const cfgMan = sc.voucher ?? { prefix: 'CT', doiTuong: 'none', dienGiai: [tenMan(sc)], tien: [0, 0] }
  const saoChep = (loc.state as { saoChep?: Row } | null)?.saoChep
  const gocData = row ?? saoChep
  const dangSua = Boolean(row)

  const loaiKey = gocData?.loai ?? sp.get('loai') ?? cfgMan.loai?.[0]?.k
  const loai = cfgMan.loai?.find(x => x.k === loaiKey) ?? cfgMan.loai?.[0]
  const cfg = theoLoai(cfgMan, loai?.k)
  const nhom = nhomCua(mod.key, cfg, loai?.k)
  const bo = boO(nhom, cfg)
  const laTien = mod.key === 'tien' || cfg.dong === 'tien'
  const laCq = nhom === 'cq' || loai?.k === 'cq'
  const cnChon = cuaHangHienTai(s)
  const [cuaHang, setCuaHang] = useState(() => (gocData?.cn ? String(gocData.cn) : cnChon?.ten ?? ''))
  const tenLoai = loai?.ten ?? (gocData?.tenLoai ? String(gocData.tenLoai) : tenMan(sc))

  const addedDt = useAddedCatalogRows('1.5')
  const addedHang = useAddedCatalogRows('1.2')
  const addedKho = useAddedCatalogRows('1.8')
  const addedLy = useAddedCatalogRows('1.16')
  const [moThemDm, setMoThemDm] = useState<string | null>(null)

  // Nguồn hàng
  const danhMucHang = useMemo(() => {
    const base = cfg.dong === 'nvl' ? NVL : HANG
    const added = addedHang.map(h => ({
      ma: String(h.ma ?? ''),
      ten: String(h.ten ?? ''),
      nhom: String(h.nhom ?? ''),
      dvt: String(h.dvt ?? 'Cái'),
      gia: Number(h.gia) || Number(h.giaMua) || 0,
      ts: Number(h.ts) || 0,
    }))
    return [...base, ...added]
  }, [cfg.dong, addedHang])

  const dsNhomHang = useMemo(() => {
    const set = new Set<string>()
    danhMucHang.forEach(h => {
      if (h.nhom) set.add(h.nhom)
    })
    return ['Tất cả', ...Array.from(set)]
  }, [danhMucHang])

  // Đối tượng
  const nhanDoiTuong = laTien
    ? 'Đối tượng'
    : cfg.nhan ?? (cfg.doiTuong === 'ncc' ? 'Nhà cung cấp' : cfg.doiTuong === 'kh' ? 'Khách hàng' : 'Đối tượng')

  const dsDoiTuong = useMemo(() => {
    let base: string[] = []
    if (laTien) base = DS_DOI_TUONG
    else if (cfg.doiTuong === 'ncc') base = NCC.map(x => x.ten)
    else if (cfg.doiTuong === 'kh') base = KHACH.map(x => x.ten)
    else if (cfg.doiTuong === 'nv') base = NHAN_VIEN.map(x => x.ten)
    else base = DS_DOI_TUONG
    const added = addedDt.map(x => String(x.ten ?? '')).filter(Boolean)
    return [...base, ...added]
  }, [laTien, cfg.doiTuong, addedDt])

  // Kho
  const dsKho = useMemo(() => {
    const khoCn = CUA_HANG.find(c => c.ten === cuaHang)?.kho
    const base = khoCn && khoCn.length ? khoCn : KHO
    const added = addedKho.map(x => String(x.ten ?? '')).filter(Boolean)
    return [...base, ...added]
  }, [cuaHang, addedKho])

  // Quỹ
  const quyTm = `Quỹ tiền mặt ${CUA_HANG.find(c => c.ten === cuaHang)?.ngan ?? 'Nguyễn Trãi'}`
  const dsQuy = useMemo(() => {
    if (nhom === 'thu' || nhom === 'chi') return [quyTm]
    if (nhom === 'nhthu' || nhom === 'nhchi') return QUY_TIEN.slice(CUA_HANG.length)
    return QUY_TIEN
  }, [nhom, quyTm])

  // Lý do thu chi
  const dsLyDo = useMemo(() => {
    const dungMuc = nhom === 'thu' || nhom === 'nhthu' ? 'Thu tiền' : 'Chi tiền'
    const base = LY_DO.filter(x => x.dung === dungMuc).map(x => x.ten)
    const them = addedLy.filter(x => !x.dung || x.dung === dungMuc).map(x => String(x.ten ?? '')).filter(Boolean)
    return [...base, ...them]
  }, [nhom, addedLy])

  // Thời gian
  const [moLich, setMoLich] = useState(false)
  const [thoiGian, setThoiGian] = useState(() => {
    if (gocData?.ngay) return [gocData.ngay, gocData.gio || '10:00'].filter(Boolean).join(' ')
    const now = new Date()
    const d = String(now.getDate()).padStart(2, '0')
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const y = now.getFullYear()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    return `${d}/${m}/${y} ${hh}:${mm}`
  })

  // Kho
  const [kho, setKho] = useState(() => {
    if (gocData?._kho || gocData?.kho) return String(gocData._kho ?? gocData.kho)
    return cuaHang ? (dsKho[0] ?? 'Kho trung tâm') : 'Kho trung tâm'
  })

  // Đối tượng
  const [doiTuong, setDoiTuong] = useState(() => {
    if (gocData?.doiTuong) return String(gocData.doiTuong)
    return dsDoiTuong[0] ?? ''
  })

  // Quỹ
  const [quy, setQuy] = useState(() => {
    if (gocData?._quy) return String(gocData._quy)
    return quyTm
  })

  // Quỹ nhận (Chuyển quỹ)
  const [denQuy, setDenQuy] = useState(() => {
    if (gocData?._denQuy) return String(gocData._denQuy)
    const khac = QUY_TIEN.find(q => q !== (gocData?._quy ?? dsQuy[0]))
    return khac ?? QUY_TIEN[1] ?? ''
  })

  // Diễn giải / Ghi chú
  const [ghiChu, setGhiChu] = useState(() => {
    return String(gocData?._ghiChu ?? gocData?.dienGiai ?? cfg.dienGiai?.[0] ?? '')
  })

  // Người nhận / nộp
  const [nguoiNhanNop, setNguoiNhanNop] = useState(() => {
    return String(gocData?._nguoiGiao ?? gocData?._nguoi ?? '')
  })

  // Hoá đơn
  const [soHd, setSoHd] = useState(() => String(gocData?._soHd ?? ''))
  const [kyHieuHd, setKyHieuHd] = useState(() => String(gocData?._kyHieuHd ?? ''))
  const [ngayHd, setNgayHd] = useState(() => {
    if (gocData?._ngayHd) return String(gocData._ngayHd)
    return gocData?.ngay ? String(gocData.ngay) : thoiGian.slice(0, 10)
  })
  const [moLichHd, setMoLichHd] = useState(false)

  // Thanh toán ngay trên phiếu mua
  const [thanhToanNgay, setThanhToanNgay] = useState(() => {
    if (gocData?._httt) return gocData._httt !== 'congno'
    return false
  })
  const [soTienTra, setSoTienTra] = useState<number>(() => {
    if (gocData?._soTienTra) return Number(gocData._soTienTra)
    return gocData?.tong ? Number(gocData.tong) : 0
  })

  // Sheet chọn quỹ trượt lên khi Thanh toán ngay
  const [moBangChonQuy, setMoBangChonQuy] = useState(false)
  const [timQuy, setTimQuy] = useState('')
  const [quyTam, setQuyTam] = useState(quy)

  // Khối Hạch toán thu gọn mặc định
  const [moHt, setMoHt] = useState(false)
  const [chonTk, setChonTk] = useState<{ dong: number; kieu: 'no' | 'co' } | null>(null)

  // Danh sách dòng
  const [dsDong, setDsDong] = useState<DongM[]>(() => {
    if (gocData) {
      const rows = (gocData._dong as Dong[] | undefined) ?? dongCua(cfg, `${sc.code ?? sc.slug}-${gocData.id}`)
      if (laTien) {
        return rows.map(d => {
          if (d.tkNo && d.tkCo) return d
          const lyMacDinh = d.ly || dsLyDo[0] || (nhom === 'chi' ? 'Chi tiền' : 'Thu tiền')
          const tk = tkTheoLyDo(loai?.k ?? nhom, lyMacDinh)
          return { ...d, tkNo: d.tkNo || tk.tkNo, tkCo: d.tkCo || tk.tkCo }
        })
      }
      return rows
    }
    if (laTien) {
      const lyTuUrl = sp.get('ly')
      let lyMacDinh = dsLyDo[0] ?? (nhom === 'chi' ? 'Chi tiền' : 'Thu tiền')
      if (lyTuUrl === MA_LY_CHO_PHAN_BO || lyTuUrl === TEN_LY_CHO_PHAN_BO) {
        lyMacDinh = TEN_LY_CHO_PHAN_BO
      }
      const tk = tkTheoLyDo(loai?.k ?? nhom, lyMacDinh)
      return [{
        ma: '',
        ten: cfg.dienGiai?.[0] ?? (nhom === 'chi' ? 'Chi tiền mặt' : 'Thu tiền mặt'),
        dvt: '',
        sl: 1,
        gia: 0,
        tien: 0,
        ts: 0,
        thue: 0,
        ptCk: 0,
        ck: 0,
        ly: lyMacDinh,
        dt: dsDoiTuong[0] ?? '',
        ghiChu: '',
        tkNo: tk.tkNo,
        tkCo: tk.tkCo,
      }]
    }
    return []
  })

  // Phiếu thu, chi chỉ bắt buộc đối tượng khi có dòng lý do thu nợ, đi vay, chi công nợ, cho vay (T330)
  const canDt = laTien && dsDong.some(d => LY_CAN_DOI_TUONG.includes(d.ly ?? ''))

  // Quản lý hiển thị dòng hàng (thu gọn / mở rộng)
  const [dongMoRong, setDongMoRong] = useState<Set<number>>(() => new Set([0, 1]))
  const [kieuGiam, setKieuGiam] = useState<Record<number, '%' | 'đ'>>({})
  const [timHangTrongPhieu, setTimHangTrongPhieu] = useState('')

  // Sheets chọn
  const [moChonLyDo, setMoChonLyDo] = useState(false)
  const [moChonCn, setMoChonCn] = useState(false)
  const [moChonQuy, setMoChonQuy] = useState(false)
  const [moChonDenQuy, setMoChonDenQuy] = useState(false)
  const [moChonDt, setMoChonDt] = useState(false)
  const [moChonKho, setMoChonKho] = useState(false)
  const [moChonLoai, setMoChonLoai] = useState(false)

  // Sheet chọn hàng hoá
  const [moChonHang, setMoChonHang] = useState(false)
  const [nhomHangChon, setNhomHangChon] = useState('Tất cả')
  const [timHang, setTimHang] = useState('')
  const [moChonNhomHang, setMoChonNhomHang] = useState(false)

  // Sheet chọn VAT
  const [moChonVatIdx, setMoChonVatIdx] = useState<number | null>(null)

  // Sheet sửa mặt hàng phiếu mua (T449)
  const [dongDangSuaIdx, setDongDangSuaIdx] = useState<number | null>(null)

  // Báo lỗi theo ô
  const [loiO, setLoiO] = useState<Record<string, string>>({})

  // Hộp hỏi tạo thẻ chi phí phân bổ sau lưu
  const [hoiThe, setHoiThe] = useState<{ soCt: string; idMoi: string } | null>(null)

  // Sau khi lưu
  const [daLuu, setDaLuu] = useState(false)
  const [soPhieuMoi, setSoPhieuMoi] = useState('')
  const [idPhieuMoi, setIdPhieuMoi] = useState('')

  // Tính tổng
  const tongTien = useMemo(() => dsDong.reduce((a, d) => a + (Number(d.tien) || 0), 0), [dsDong])
  const tongCk = useMemo(() => dsDong.reduce((a, d) => a + (Number(d.ck) || 0), 0), [dsDong])
  const tongThue = useMemo(() => dsDong.reduce((a, d) => a + (Number(d.thue) || 0), 0), [dsDong])
  const tongThanhToan = useMemo(() => {
    return dsDong.reduce((a, d) => {
      if (d.tongNhap !== undefined) return a + d.tongNhap
      return a + (Number(d.tien) || 0) - (Number(d.ck) || 0) + (Number(d.thue) || 0)
    }, 0)
  }, [dsDong])

  // Cập nhật số tiền trả khi tổng thanh toán đổi
  useEffect(() => {
    if (s.goi === 'F') {
      setSoTienTra(tongThanhToan)
    } else if (!soTienTra || soTienTra > tongThanhToan) {
      setSoTienTra(tongThanhToan)
    }
  }, [tongThanhToan, s.goi])

  // Bút toán hạch toán
  const dsButToan = useMemo(() => {
    const htttCalc = nhom === 'mua' ? (thanhToanNgay ? (isQuyTienMat(quy) ? 'tienmat' : 'chuyenkhoan') : 'congno') : 'congno'
    return tinhButToan(
      cfg,
      dsDong,
      tongTien,
      tongCk,
      tongThue,
      doiTuong,
      cuaHang,
      s.cheDo || s.goi,
      nhom,
      htttCalc,
    )
  }, [cfg, dsDong, tongTien, tongCk, tongThue, doiTuong, cuaHang, s.cheDo, s.goi, nhom, thanhToanNgay, quy])

  // Đổi đơn vị tính quy đổi
  const [dvtSheet, setDvtSheet] = useState<{ idx: number; ten: string; ds: { k: string; ten: string }[] } | null>(null)

  const doiDong = (idx: number, patch: Partial<DongM>) => {
    setDsDong(ds => ds.map((d, i) => {
      if (i !== idx) return d
      const hopNhat = { ...d, ...patch }
      if (patch.sl !== undefined || patch.gia !== undefined) {
        if (patch.tongNhap === undefined) {
          delete hopNhat.tongNhap
        }
      }
      const sl = hopNhat.sl !== undefined ? Number(hopNhat.sl) : 0
      const gia = hopNhat.gia !== undefined ? Number(hopNhat.gia) : 0
      const tien = patch.tien !== undefined ? Number(patch.tien) : Math.round(sl * gia)
      const ptCk = hopNhat.ptCk !== undefined ? Number(hopNhat.ptCk) : 0
      const ck = patch.ck !== undefined ? Number(patch.ck) : (hopNhat.ptCk ? Math.round(tien * ptCk / 100) : (hopNhat.ck ?? 0))
      const ts = hopNhat.ts !== undefined ? Number(hopNhat.ts) : 0
      const thue = patch.thue !== undefined ? Number(patch.thue) : Math.round((tien - ck) * ts / 100)
      return { ...hopNhat, sl, gia, tien, ptCk, ck, ts, thue }
    }))
  }

  const xoaDong = (idx: number) => {
    setDsDong(ds => ds.filter((_, i) => i !== idx))
    setDongMoRong(s => {
      const next = new Set<number>()
      for (const v of s) {
        if (v < idx) next.add(v)
        else if (v > idx) next.add(v - 1)
      }
      return next
    })
  }

  const doiDvt = (idx: number, dvMoi: string) => {
    const d = dsDong[idx]
    if (!d) return
    const dvtChinh = d.dvtChinh || HANG.find(h => h.ma === d.ma || h.ten === d.ten)?.dvt || NVL.find(n => n.ma === d.ma || n.ten === d.ten)?.dvt || d.dvt
    const giaGoc = d.giaGoc ?? (HANG.find(h => h.ma === d.ma || h.ten === d.ten)?.gia || d.gia || 0)
    let giaMoi = giaGoc
    if (dvMoi !== dvtChinh) {
      const dsQd = quyDoiTuDanhMuc(d.ten, dvtChinh)
      const q = dsQd.find(x => x.dv === dvMoi)
      if (q) {
        giaMoi = q.nguoc ? Math.round(giaGoc * q.tl) : Math.round(giaGoc / q.tl)
      }
    }
    doiDong(idx, { dvt: dvMoi, gia: giaMoi, giaGoc, dvtChinh })
  }

  const moChonDvt = (idx: number) => {
    const d = dsDong[idx]
    if (!d) return
    const dvtChinh = d.dvtChinh || HANG.find(h => h.ma === d.ma || h.ten === d.ten)?.dvt || NVL.find(n => n.ma === d.ma || n.ten === d.ten)?.dvt || d.dvt
    const dsQd = quyDoiTuDanhMuc(d.ten, dvtChinh)
    if (dsQd.length === 0) return
    const ds = [
      { k: dvtChinh, ten: `${dvtChinh} (ĐVT chính)` },
      ...dsQd.map(q => ({
        k: q.dv,
        ten: `${q.dv} (${q.nguoc ? `1 ${q.dv} = ${q.tl} ${dvtChinh}` : `1 ${dvtChinh} = ${q.tl} ${q.dv}`})`,
      })),
    ]
    setDvtSheet({ idx, ten: d.ten, ds })
  }

  // Sửa số lượng
  const suaSl = (idx: number, sl: number) => {
    setDsDong(ds => ds.map((d, i) => {
      if (i !== idx) return d
      const gia = Number(d.gia) || 0
      const tien = Math.round(sl * gia)
      const kg = kieuGiam[idx] ?? '%'
      const ck = kg === '%' ? Math.round(tien * (Number(d.ptCk) || 0) / 100) : (Number(d.ck) || 0)
      const ptCk = kg === '%' ? (Number(d.ptCk) || 0) : (tien > 0 ? Number(((ck / tien) * 100).toFixed(2)) : 0)
      const ts = Number(d.ts) || 0
      const thue = Math.round((tien - ck) * ts / 100)
      return { ...d, sl, gia, tien, ck, ptCk, ts, thue, tuChia: false, tongNhap: undefined }
    }))
  }

  // Sửa đơn giá
  const suaGia = (idx: number, gia: number) => {
    setDsDong(ds => ds.map((d, i) => {
      if (i !== idx) return d
      const sl = Number(d.sl) || 0
      const tien = Math.round(sl * gia)
      const kg = kieuGiam[idx] ?? '%'
      const ck = kg === '%' ? Math.round(tien * (Number(d.ptCk) || 0) / 100) : (Number(d.ck) || 0)
      const ptCk = kg === '%' ? (Number(d.ptCk) || 0) : (tien > 0 ? Number(((ck / tien) * 100).toFixed(2)) : 0)
      const ts = Number(d.ts) || 0
      const thue = Math.round((tien - ck) * ts / 100)
      return { ...d, gia, giaGoc: gia, tien, ck, ptCk, ts, thue, tuChia: false, tongNhap: undefined }
    }))
  }

  // Sửa giảm giá theo %
  const suaGiamPt = (idx: number, pt: number) => {
    setDsDong(ds => ds.map((d, i) => {
      if (i !== idx) return d
      const tien = Number(d.tien) || 0
      const ck = Math.round(tien * pt / 100)
      const ts = Number(d.ts) || 0
      const thue = Math.round((tien - ck) * ts / 100)
      return { ...d, ptCk: pt, ck, thue, tuChia: false, tongNhap: undefined }
    }))
  }

  // Sửa giảm giá theo tiền (đ)
  const suaGiamTien = (idx: number, ck: number) => {
    setDsDong(ds => ds.map((d, i) => {
      if (i !== idx) return d
      const tien = Number(d.tien) || 0
      const ptCk = tien > 0 ? Number(((ck / tien) * 100).toFixed(2)) : 0
      const ts = Number(d.ts) || 0
      const thue = Math.round((tien - ck) * ts / 100)
      return { ...d, ck, ptCk, thue, tuChia: false, tongNhap: undefined }
    }))
  }

  // Sửa thuế suất VAT
  const suaVat = (idx: number, ts: number) => {
    setDsDong(ds => ds.map((d, i) => {
      if (i !== idx) return d
      const tien = Number(d.tien) || 0
      const ck = Number(d.ck) || 0
      const thue = Math.round((tien - ck) * ts / 100)
      return { ...d, ts, thue, tuChia: false, tongNhap: undefined }
    }))
  }

  // Sửa tổng tiền tính ngược lại đơn giá
  const suaTongTien = (idx: number, tongMoi: number) => {
    setDsDong(ds => ds.map((d, i) => {
      if (i !== idx) return d
      const sl = Number(d.sl) || 0
      if (sl <= 0) return d
      const ts = Number(d.ts) || 0
      const thanhTienSauGiam = ts > 0 ? (tongMoi / (1 + ts / 100)) : tongMoi
      const kg = kieuGiam[idx] ?? '%'
      let dg = 0
      if (kg === '%') {
        const g = Number(d.ptCk) || 0
        const heSoGiam = 1 - g / 100
        dg = heSoGiam > 0 ? (thanhTienSauGiam / heSoGiam / sl) : (thanhTienSauGiam / sl)
      } else {
        const ck = Number(d.ck) || 0
        dg = (thanhTienSauGiam + ck) / sl
      }
      const dgTron = Math.round(dg)
      const tien = Math.round(sl * dgTron)
      let ck = 0
      if (kg === '%') {
        ck = Math.round(tien * (Number(d.ptCk) || 0) / 100)
      } else {
        ck = Number(d.ck) || 0
      }
      const thue = Math.round((tien - ck) * ts / 100)
      return {
        ...d,
        gia: dgTron,
        giaGoc: dgTron,
        tien,
        ck,
        thue,
        tongNhap: tongMoi,
        tuChia: true,
      }
    }))
  }

  // Danh sách dòng trong phiếu sau khi lọc theo ô tìm hàng trong phiếu
  const dsDongHienThiTrongPhieu = useMemo(() => {
    return dsDong
      .map((d, originalIdx) => ({ d, originalIdx }))
      .filter(({ d }) => {
        if (!timHangTrongPhieu.trim()) return true
        const q = fold(timHangTrongPhieu.trim())
        return fold(d.ten).includes(q) || fold(d.ma ?? '').includes(q)
      })
  }, [dsDong, timHangTrongPhieu])

  // Danh sách quỹ trong bảng chọn quỹ thanh toán
  const dsQuyMau = useMemo(() => [
    { k: quyTm, ten: quyTm, loai: 'tm', soDu: soDuQuy(quyTm) },
    { k: 'Techcombank 1903 4455 6677 88', ten: 'Techcombank 1903 4455 6677 88', loai: 'nh', soDu: 319850000 },
    { k: 'Vietcombank 0071 0012 34567', ten: 'Vietcombank 0071 0012 34567', loai: 'nh', soDu: 144800000 },
    { k: 'VPBank, chi nhánh Quận 1', ten: 'VPBank, chi nhánh Quận 1', loai: 'nh', soDu: 3320000 },
  ], [quyTm])

  const dsQuyTmLoc = useMemo(() => {
    return dsQuyMau
      .filter(q => q.loai === 'tm')
      .filter(q => !timQuy.trim() || fold(q.ten).includes(fold(timQuy.trim())))
  }, [dsQuyMau, timQuy])

  const dsQuyNhLoc = useMemo(() => {
    return dsQuyMau
      .filter(q => q.loai === 'nh')
      .filter(q => !timQuy.trim() || fold(q.ten).includes(fold(timQuy.trim())))
  }, [dsQuyMau, timQuy])

  // Danh sách hàng hiển thị trong sheet chọn hàng
  const dsHangHienThi = useMemo(() => {
    let list = danhMucHang
    if (nhomHangChon && nhomHangChon !== 'Tất cả') {
      list = list.filter(h => h.nhom === nhomHangChon)
    }
    if (timHang.trim()) {
      const q = fold(timHang.trim())
      list = list.filter(h => fold(h.ten).includes(q) || fold(h.ma).includes(q))
    }
    return list
  }, [danhMucHang, nhomHangChon, timHang])

  const tatCaDaChon = dsHangHienThi.length > 0 && dsHangHienThi.every(h => dsDong.some(d => d.ma === h.ma))

  const toggleHang = (h: (typeof danhMucHang)[0]) => {
    const daCo = dsDong.some(d => d.ma === h.ma)
    if (daCo) {
      setDsDong(ds => ds.filter(d => d.ma !== h.ma))
    } else {
      const gia = h.gia || 0
      const sl = 1
      const tien = sl * gia
      const ts = cfg.thue === 0 ? 0 : (h.ts ?? 0)
      const thue = Math.round(tien * ts / 100)
      setDsDong(ds => {
        const next = [
          ...ds,
          {
            ma: h.ma,
            ten: h.ten,
            dvt: h.dvt,
            dvtChinh: h.dvt,
            giaGoc: gia,
            sl,
            gia,
            tien,
            ptCk: 0,
            ck: 0,
            ts,
            thue,
            kho,
            ghiChu: '',
          },
        ]
        setDongMoRong(s => new Set(s).add(next.length - 1))
        return next
      })
      if (loiO.hang) {
        setLoiO(l => { const n = { ...l }; delete n.hang; return n })
      }
    }
  }

  const toggleTatCa = () => {
    if (tatCaDaChon) {
      const maSet = new Set(dsHangHienThi.map(h => h.ma))
      setDsDong(ds => ds.filter(d => !maSet.has(d.ma ?? '')))
    } else {
      const dongMoi = [...dsDong]
      for (const h of dsHangHienThi) {
        if (!dongMoi.some(d => d.ma === h.ma)) {
          const gia = h.gia || 0
          const sl = 1
          const tien = sl * gia
          const ts = cfg.thue === 0 ? 0 : (h.ts ?? 0)
          const thue = Math.round(tien * ts / 100)
          dongMoi.push({
            ma: h.ma,
            ten: h.ten,
            dvt: h.dvt,
            dvtChinh: h.dvt,
            giaGoc: gia,
            sl,
            gia,
            tien,
            ptCk: 0,
            ck: 0,
            ts,
            thue,
            kho,
            ghiChu: '',
          })
        }
      }
      setDsDong(dongMoi)
      setDongMoRong(new Set(dongMoi.map((_, i) => i)))
      if (loiO.hang) {
        setLoiO(l => { const n = { ...l }; delete n.hang; return n })
      }
    }
  }

  // Cuộn tới ô lỗi
  const cuonDenO = (idO: string) => {
    setTimeout(() => {
      const el = document.getElementById(idO)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  // Thực hiện lưu chứng từ
  const thucHienLuu = (moMoi = false) => {
    const loiMoi: Record<string, string> = {}

    if (!cuaHang) {
      loiMoi.cuaHang = 'Vui lòng chọn cửa hàng'
    }

    if (laTien) {
      if (!ghiChu.trim()) {
        loiMoi.dienGiai = 'Vui lòng nhập diễn giải'
      }
      const tienHienTai = dsDong[0]?.tien ?? 0
      if (tienHienTai <= 0) {
        loiMoi.tien = 'Vui lòng nhập số tiền lớn hơn 0'
      }
      if (!quy.trim()) {
        loiMoi.quy = 'Vui lòng chọn quỹ / tài khoản'
      }
      if (laCq && (!denQuy.trim() || denQuy === quy)) {
        loiMoi.denQuy = 'Vui lòng chọn quỹ nhận khác quỹ xuất'
      }
      if (!laCq && cfg.doiTuong !== 'none' && canDt && !doiTuong.trim()) {
        loiMoi.doiTuong = `Vui lòng chọn ${nhanDoiTuong.toLowerCase()}`
      }
    } else if (nhom === 'mua') {
      if (!doiTuong.trim()) {
        loiMoi.doiTuong = 'Vui lòng chọn nhà cung cấp'
      }
      if (!kho.trim()) {
        loiMoi.kho = 'Vui lòng chọn kho nhận'
      }
      if (thanhToanNgay && !quy.trim()) {
        loiMoi.quy = 'Vui lòng chọn quỹ thanh toán'
      }
      if (dsDong.length === 0) {
        loiMoi.hang = 'Vui lòng chọn ít nhất một mặt hàng'
      }
    } else {
      if (bo.kho && !kho.trim()) {
        loiMoi.kho = 'Vui lòng chọn kho'
      }
      if (cfg.doiTuong !== 'none' && !doiTuong.trim()) {
        loiMoi.doiTuong = `Vui lòng chọn ${nhanDoiTuong.toLowerCase()}`
      }
      if (dsDong.length === 0) {
        loiMoi.hang = 'Vui lòng chọn ít nhất một mặt hàng'
      }
    }

    if (!thoiGian.trim()) {
      loiMoi.thoiGian = 'Vui lòng chọn thời gian'
    }

    if (Object.keys(loiMoi).length > 0) {
      setLoiO(loiMoi)
      const dauTienKey = Object.keys(loiMoi)[0]
      cuonDenO(`m-lp-o-${dauTienKey}`)
      const thongBao = Object.values(loiMoi)[0]
      toast(thongBao)
      return
    }

    setLoiO({})

    const ngayChiTiet = thoiGian.split(' ')[0]
    if (!dangSua && truocDauNam(s, ngayChiTiet)) {
      toast(`Ngày chứng từ phải từ ngày đầu năm ${ngayDauNam(s)} trở đi`)
      return
    }

    const kieu = kieuGhiSo(s.goi)
    const ttLuu = kieu === 'khong' ? 'ghi' : 'nhap'

    const man = `${mod.key}/${sc.slug}`
    const idLuu = dangSua ? String(row!.id) : `moi-${Date.now()}`
    const soCt = dangSua ? String(row!.so) : soKeTiep(man, `${cfg.prefix}2610-`)

    let ctTt = undefined
    if (nhom === 'mua' && thanhToanNgay) {
      const tienTraThucTe = s.goi === 'F' ? tongThanhToan : (soTienTra || tongThanhToan)
      const loaiTt = isQuyTienMat(quy) ? 'chi' : 'unc'
      const soTt = soKeTiep(MAN_THU_CHI, `${TIEN_TO_CT_TT[loaiTt]}2610-`)
      const idTt = `moi-${Date.now()}-tt`
      const dgTt = `Chi tiền mua hàng theo ${soCt}`
      const lyTt = 'Thanh toán tiền cho nhà cung cấp'
      themPhieu(MAN_THU_CHI, {
        id: idTt,
        so: soTt,
        cn: cuaHang,
        nguon: 'tay',
        tt: ttLuu,
        loai: loaiTt,
        tenLoai: TEN_CT_TT[loaiTt],
        ngay: ngayChiTiet,
        thang: Number(ngayChiTiet.split('/')[1]) || 10,
        doiTuong,
        dienGiai: dgTt,
        tien: tienTraThucTe,
        thue: 0,
        tong: tienTraThucTe,
        _quy: quy,
        _lyDo: lyTt,
        _ghiChu: dgTt,
        _thamChieu: soCt,
        _thamChieuDi: `${path}/${idLuu}`,
        _dong: [{ ma: '', ten: dgTt, dvt: '', sl: 1, gia: tienTraThucTe, tien: tienTraThucTe, ts: 0, thue: 0, ly: lyTt, dt: doiTuong, km: '', cv: '' }],
      }, s.ten)
      ghiNhatKy(MAN_THU_CHI, idTt, soTt, s.ten, `Thêm mới chứng từ, sinh từ ${soCt}`)
      ctTt = { id: idTt, so: soTt, loai: loaiTt }
    }

    const noiDung = {
      ngay: ngayChiTiet,
      gio: thoiGian.split(' ')[1] || '10:00',
      thang: Number(ngayChiTiet.split('/')[1]) || 10,
      doiTuong: laCq ? 'Chuyển quỹ nội bộ' : doiTuong,
      dienGiai: ghiChu || cfg.dienGiai?.[0] || 'Chứng từ',
      tien: tongTien - tongCk,
      thue: tongThue,
      tong: tongThanhToan,
      _dong: dsDong,
      _lyDo: laTien ? (dsDong[0]?.ly || dsLyDo[0] || 'Chi tiền') : undefined,
      _ghiChu: ghiChu,
      _nguoiGiao: nguoiNhanNop,
      _nguoi: nguoiNhanNop,
      _quy: (nhom === 'mua' && !thanhToanNgay) ? undefined : quy,
      _denQuy: laCq ? denQuy : undefined,
      _kho: kho,
      _soHd: soHd,
      _kyHieuHd: kyHieuHd,
      _ngayHd: ngayHd,
      _httt: nhom === 'mua' ? (thanhToanNgay ? (isQuyTienMat(quy) ? 'tienmat' : 'chuyenkhoan') : 'congno') : 'congno',
      _soTienTra: nhom === 'mua' && thanhToanNgay ? (s.goi === 'F' ? tongThanhToan : soTienTra) : undefined,
      ...(ctTt ? { _ctTt: ctTt } : {}),
    }

    if (dangSua) {
      suaPhieu(man, String(row!.id), noiDung)
      ghiNhatKy(man, String(row!.id), soCt, s.ten, 'Sửa chứng từ')
      toast(`Đã lưu thay đổi ${soCt}`)
      if (window.history.state && window.history.state.idx > 0) {
        nav(-1)
      } else {
        nav(`${path}/${row!.id}`, { replace: true })
      }
      return
    }

    themPhieu(man, {
      id: idLuu,
      so: soCt,
      cn: cuaHang,
      nguon: 'tay',
      loai: loai?.k,
      tenLoai: loai?.ten ?? tenMan(sc),
      tt: ttLuu,
      ...noiDung,
    }, s.ten)
    ghiNhatKy(man, idLuu, soCt, s.ten, 'Thêm mới chứng từ')
    toast(`Đã lưu ${soCt}`)

    // Phiếu chi có lý do Chi phí chờ phân bổ: báo rồi mở tạo thẻ chi phí phân bổ (Mục 4 spec; T419: thông báo, không hỏi)
    const laLyChoPb = laTien && (
      (dsDong[0]?.ly === TEN_LY_CHO_PHAN_BO) ||
      (dsDong[0]?.ly === MA_LY_CHO_PHAN_BO)
    )

    if (laLyChoPb) {
      setHoiThe({ soCt, idMoi: idLuu })
      return
    }

    if (moMoi) {
      setGhiChu('')
      setSoHd('')
      setKyHieuHd('')
      setTimHang('')
      setTimHangTrongPhieu('')
      if (laTien) {
        const lyMacDinh = dsLyDo[0] ?? (nhom === 'chi' ? 'Chi tiền' : 'Thu tiền')
        const tk = tkTheoLyDo(loai?.k ?? nhom, lyMacDinh)
        setDsDong([{
          ma: '',
          ten: cfg.dienGiai?.[0] ?? (nhom === 'chi' ? 'Chi tiền mặt' : 'Thu tiền mặt'),
          dvt: '',
          sl: 1,
          gia: 0,
          tien: 0,
          ts: 0,
          thue: 0,
          ptCk: 0,
          ck: 0,
          ly: lyMacDinh,
          dt: dsDoiTuong[0] ?? '',
          ghiChu: '',
          tkNo: tk.tkNo,
          tkCo: tk.tkCo,
        }])
      } else {
        setDsDong([])
      }
    } else {
      setSoPhieuMoi(soCt)
      setIdPhieuMoi(idLuu)
      setDaLuu(true)
    }
  }

  const handleQuayLai = () => {
    if (window.history.state && window.history.state.idx > 0) {
      nav(-1)
    } else if (dangSua) {
      nav(`${path}/${id}`, { replace: true })
    } else {
      nav(path, { replace: true })
    }
  }

  // ── MÀN HÌNH THÀNH CÔNG ──
  if (daLuu) {
    return (
      <div className="m-pb-man">
        <div className="m-lp-buoc m-lp-buoc-thanh-cong">
          <div className="m-lp-dau-thanh-cong">
            <button type="button" className="m-lp-btn-home" onClick={() => nav(path, { replace: true })} aria-label="Về trang danh sách">
              <Icon n="home" className="ic sm" kieu="net" />
            </button>
          </div>

          <div className="m-lp-thanh-cong-than">
            <div className="m-lp-thanh-cong-vong">
              <Icon n="check" className="ic lg m-lp-thanh-cong-tich" kieu="net" />
            </div>
            <h2 className="m-lp-thanh-cong-tieu">Tạo chứng từ thành công</h2>
            <p className="m-lp-thanh-cong-mota">
              Bạn vừa tạo thành công phiếu {tenLoai} <b>{soPhieuMoi}</b>.
            </p>

            <div className="m-lp-thanh-cong-nut-hang">
              <button type="button" className="m-pb-btn-phu" onClick={() => nav(path, { replace: true })}>
                Đóng
              </button>
              <button
                type="button"
                className="m-pb-btn-sua"
                onClick={() => nav(`${path}/${idPhieuMoi}`, { replace: true })}
              >
                Xem phiếu
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const lyDoHienTai = dsDong[0]?.ly || dsLyDo[0] || (nhom === 'chi' ? 'Chi tiền' : 'Thu tiền')
  const tieuDe = dangSua
    ? `Sửa ${row?.so ?? ''}`.trim()
    : (nhom === 'chi' ? 'Lập phiếu chi' : nhom === 'thu' ? 'Lập phiếu thu' : nhom === 'cq' ? 'Lập phiếu chuyển quỹ' : nhom === 'mua' ? 'Lập phiếu mua hàng' : `Lập ${tenLoai.toLowerCase()}`)

  const laLyChoPb = laTien && (
    (dsDong[0]?.ly === TEN_LY_CHO_PHAN_BO) ||
    (dsDong[0]?.ly === MA_LY_CHO_PHAN_BO)
  )

  return (
    <div className="m-pb-man">
      {/* ── THANH ĐẦU MÀN HÌNH ── */}
      <header className="m-pb-thanh-dau">
        <button type="button" className="m-pb-btn-back" onClick={handleQuayLai} aria-label="Quay lại">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="m-pb-tieu-de">{tieuDe}</h2>
        <span className="m-pb-thanh-dau-phai" />
      </header>

      {/* ── THÂN NỘI DUNG CUỘN ── */}
      <div className="m-pb-noi-dung">
        {/* ════ PHIẾU THU / CHI TIỀN ════ */}
        {laTien ? (
          <>
            {/* Thẻ tổng quan */}
            <div className="m-pb-the m-pb-the-tong-quan" id="m-lp-o-tien">
              <div className="m-pb-hang-chip">
                <button
                  type="button"
                  className="f-chon-chip"
                  onClick={() => (cfgMan.loai && cfgMan.loai.length > 1 ? setMoChonLoai(true) : undefined)}
                >
                  {tenLoai}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <span className="m-pb-chip-tt cho">{dangSua ? 'Đang sửa' : 'Phiếu mới'}</span>
              </div>

              <label className="f-nhan" htmlFor="f1-dg">Diễn giải <i>*</i></label>
              <input
                id="f1-dg"
                className="f-o-lon"
                placeholder="Nhập diễn giải"
                value={ghiChu}
                onChange={e => {
                  setGhiChu(e.target.value)
                  if (loiO.dienGiai) setLoiO(l => { const n = { ...l }; delete n.dienGiai; return n })
                }}
              />
              {loiO.dienGiai && <div className="m-lp-loi-o">{loiO.dienGiai}</div>}

              <div
                className="m-pb-dong-cn"
                id="m-lp-o-cuaHang"
                onClick={() => setMoChonCn(true)}
                style={{ cursor: 'pointer' }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="1.8" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                <span>{cuaHang || 'Chọn cửa hàng'}</span>
              </div>
              {loiO.cuaHang && <div className="m-lp-loi-o">{loiO.cuaHang}</div>}

              <div>
                <label className="m-pb-nhan-gt" htmlFor="f1-tien">
                  {nhom === 'chi' ? 'Số tiền chi' : nhom === 'thu' ? 'Số tiền thu' : 'Số tiền'} <i className="f-sao">*</i>
                </label>
                <div className="f-tien-wrap">
                  <input
                    id="f1-tien"
                    className={`f-o-tien ${nhom === 'chi' ? 'cam' : ''}`}
                    inputMode="numeric"
                    placeholder="0"
                    value={dsDong[0]?.tien ? money(dsDong[0].tien) : ''}
                    onChange={e => {
                      const val = Number(e.target.value.replace(/\D/g, '')) || 0
                      doiDong(0, { tien: val, gia: val })
                      if (val > 0 && loiO.tien) {
                        setLoiO(l => { const n = { ...l }; delete n.tien; return n })
                      }
                    }}
                  />
                  <span>đ</span>
                </div>
                {loiO.tien && <div className="m-lp-loi-o">{loiO.tien}</div>}
              </div>
            </div>

            {/* Nhóm Thông tin phiếu */}
            <div className="m-pb-nhom">
              {nhom === 'chi' ? 'THÔNG TIN PHIẾU CHI' : nhom === 'thu' ? 'THÔNG TIN PHIẾU THU' : 'THÔNG TIN PHIẾU'}
            </div>
            <div className="m-pb-the m-pb-the-gon">
              {/* Ngày chứng từ */}
              <div
                className="m-pb-dong"
                id="m-lp-o-thoiGian"
                onClick={() => setMoLich(true)}
                style={{ cursor: 'pointer' }}
              >
                <span className="n">Ngày chứng từ <i className="f-sao">*</i></span>
                <span className="f-gt f-chon">
                  {thoiGian.slice(0, 10)}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 10h18M8 3v4M16 3v4" />
                  </svg>
                </span>
              </div>

              {/* Quỹ chi / Quỹ thu */}
              <div
                className="m-pb-dong"
                id="m-lp-o-quy"
                onClick={() => setMoChonQuy(true)}
                style={{ cursor: 'pointer' }}
              >
                <span className="n">{nhom === 'chi' ? 'Quỹ chi' : nhom === 'thu' ? 'Quỹ thu' : 'Quỹ'} <i className="f-sao">*</i></span>
                <span className="f-gt f-chon">{quy || 'Chọn quỹ'} ›</span>
              </div>
              {loiO.quy && <div className="m-lp-loi-o">{loiO.quy}</div>}

              {/* Đến quỹ (chuyển quỹ) */}
              {laCq && (
                <div
                  className="m-pb-dong"
                  id="m-lp-o-denQuy"
                  onClick={() => setMoChonDenQuy(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="n">Đến quỹ <i className="f-sao">*</i></span>
                  <span className="f-gt f-chon">{denQuy || 'Chọn quỹ nhận'} ›</span>
                </div>
              )}
              {loiO.denQuy && <div className="m-lp-loi-o">{loiO.denQuy}</div>}

              {/* Lý do chi / Lý do thu */}
              <div
                className="m-pb-dong"
                id="m-lp-o-lyDo"
                onClick={() => setMoChonLyDo(true)}
                style={{ cursor: 'pointer' }}
              >
                <span className="n">{nhom === 'chi' ? 'Lý do chi' : nhom === 'thu' ? 'Lý do thu' : 'Lý do'} <i className="f-sao">*</i></span>
                <span className="f-gt f-chon">{lyDoHienTai} ›</span>
              </div>

              {/* Đối tượng */}
              {!laCq && cfg.doiTuong !== 'none' && (
                <div
                  className="m-pb-dong"
                  id="m-lp-o-doiTuong"
                  onClick={() => setMoChonDt(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="n">{nhanDoiTuong}{canDt && <i className="f-sao"> *</i>}</span>
                  <span className={`f-gt f-chon ${!doiTuong ? 'trong' : ''}`}>
                    {doiTuong ? `${doiTuong} ›` : `Chọn ${nhanDoiTuong.toLowerCase()} ›`}
                  </span>
                </div>
              )}
              {loiO.doiTuong && <div className="m-lp-loi-o">{loiO.doiTuong}</div>}

              {/* Người nhận / Người nộp */}
              <div className="m-pb-dong">
                <span className="n">{laCq ? 'Người thực hiện' : (nhom === 'chi' ? 'Người nhận' : 'Người nộp')}</span>
                <input
                  className="f-gt f-input"
                  placeholder="Nhập tên"
                  value={nguoiNhanNop}
                  onChange={e => setNguoiNhanNop(e.target.value)}
                />
              </div>
            </div>
            {laLyChoPb && (
              <div className="f-goi-y">Lý do "Chi phí chờ phân bổ": lưu xong mở thẻ chi phí để phân bổ.</div>
            )}
          </>
        ) : nhom === 'mua' ? (
          /* ════ PHIẾU MUA HÀNG (T449 THEO PHƯƠNG ÁN D) ════ */
          <>
            {/* 1. Đầu phiếu */}
            <div className="m-pb-the m-pb-the-tong-quan">
              <div className="m-pb-hang-chip">
                <span className="m-pb-chip-loai">{tenLoai}</span>
                <span className="m-pb-chip-tt cho">{dangSua ? 'Đang sửa' : 'Phiếu mới'}</span>
              </div>

              <div>
                <label className="m-t449-nhan-ncc">Nhà cung cấp <span className="sao">*</span></label>
                <div
                  className="m-t449-o-ncc"
                  id="m-lp-o-doiTuong"
                  onClick={() => setMoChonDt(true)}
                >
                  <span className="m-t449-ten-ncc">{doiTuong || 'Chọn nhà cung cấp'}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
              {loiO.doiTuong && <div className="m-lp-loi-o">{loiO.doiTuong}</div>}

              <div
                className="m-pb-dong-cn"
                id="m-lp-o-cuaHang"
                onClick={() => setMoChonCn(true)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="1.8" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>{cuaHang || 'Chọn cửa hàng'}</span>
              </div>
              {loiO.cuaHang && <div className="m-lp-loi-o">{loiO.cuaHang}</div>}

              <div>
                <div className="m-pb-nhan-gt">Tổng thanh toán (tự tính)</div>
                <div className="m-pb-so-gt cam">{money(tongThanhToan)} đ</div>
              </div>

              {/* Khối Thanh toán ngay */}
              <div className="m-t449-thanh-toan-ngay-khu">
                <label className="m-t449-tick-tt" onClick={() => setThanhToanNgay(v => !v)}>
                  <input type="checkbox" checked={thanhToanNgay} onChange={e => setThanhToanNgay(e.target.checked)} />
                  <span>Thanh toán ngay</span>
                </label>
                {thanhToanNgay && (
                  <>
                    <div className="f-tt-quy" id="m-lp-o-quy" onClick={() => setMoBangChonQuy(true)}>
                      <span className="f-tt-ic">
                        {isQuyTienMat(quy) ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="2" y="6" width="20" height="13" rx="2" />
                            <circle cx="12" cy="12.5" r="2.5" />
                            <path d="M6 9.5h.01M18 15.5h.01" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M3 10l9-6 9 6M5 10v8M19 10v8M9 10v8M15 10v8M3 20h18" />
                          </svg>
                        )}
                      </span>
                      <span className="f-tt-ten">
                        <b>{quy}</b>
                        <small>Số dư {money(soDuQuy(quy))} đ</small>
                      </span>
                      <span className="f-tt-doi">Đổi ›</span>
                    </div>

                    <div className="m-pb-dong f-tt-so">
                      <span className="n">Số tiền trả</span>
                      {s.goi === 'F' ? (
                        <span className="g cam">{money(tongThanhToan)} đ</span>
                      ) : (
                        <input
                          type="text"
                          className="f-gt f-input"
                          inputMode="numeric"
                          value={money(soTienTra)}
                          onChange={e => {
                            const str = goSoVN(e.target.value, false)
                            const v = docSoVN(str)
                            setSoTienTra(Math.min(v, tongThanhToan))
                          }}
                        />
                      )}
                    </div>
                    {s.goi !== 'F' && (
                      <div className="f-goi-y">Gói khác được trả một phần, không vượt tổng thanh toán.</div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 2. Thông tin hoá đơn */}
            <div className="m-pb-nhom">THÔNG TIN HOÁ ĐƠN</div>
            <div className="m-pb-the m-pb-the-gon">
              <div
                className="m-pb-dong"
                id="m-lp-o-kho"
                onClick={() => setMoChonKho(true)}
              >
                <span className="n">Kho nhận <i className="f-sao">*</i></span>
                <span className="f-gt f-chon">{kho || 'Chọn kho'} ›</span>
              </div>
              {loiO.kho && <div className="m-lp-loi-o">{loiO.kho}</div>}

              <div
                className="m-pb-dong"
                id="m-lp-o-thoiGian"
                onClick={() => setMoLich(true)}
              >
                <span className="n">Ngày chứng từ <i className="f-sao">*</i></span>
                <span className="f-gt f-chon">
                  {thoiGian.slice(0, 10)}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 10h18M8 3v4M16 3v4" />
                  </svg>
                </span>
              </div>

              <div className="m-pb-dong">
                <span className="n">Số hoá đơn</span>
                <input
                  type="text"
                  aria-label="Số hoá đơn"
                  className="f-gt f-input m-t449-input-phai"
                  placeholder="Số hoá đơn"
                  value={soHd}
                  onChange={e => setSoHd(e.target.value)}
                />
              </div>

              <div className="m-pb-dong">
                <span className="n">Ký hiệu</span>
                <input
                  type="text"
                  aria-label="Ký hiệu hoá đơn"
                  className="f-gt f-input m-t449-input-phai"
                  placeholder="Ký hiệu mẫu"
                  value={kyHieuHd}
                  onChange={e => setKyHieuHd(e.target.value)}
                />
              </div>

              <div className="m-pb-dong" onClick={() => setMoLichHd(true)}>
                <span className="n">Ngày hoá đơn</span>
                <span className="f-gt f-chon">
                  {ngayHd || thoiGian.slice(0, 10)}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 10h18M8 3v4M16 3v4" />
                  </svg>
                </span>
              </div>
            </div>

            {/* 3. Danh sách hàng hoá */}
            <div className="m-pb-nhom">DANH SÁCH HÀNG HOÁ</div>
            <div className="m-t449-tim">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
              <input
                type="text"
                aria-label="Tìm hàng hoá"
                placeholder="Nhập tên, mã hàng hoá"
                value={timHangTrongPhieu}
                onChange={e => setTimHangTrongPhieu(e.target.value)}
              />
            </div>

            <div id="m-lp-o-hang" className="m-t449-hang-ds">
              {dsDongHienThiTrongPhieu.map(({ d, originalIdx }, index) => {
                const lineTotal = d.tongNhap !== undefined ? d.tongNhap : (d.tien ?? (d.sl * d.gia)) - (d.ck ?? 0) + (d.thue ?? 0)
                return (
                  <div key={originalIdx} className="m-t449-hang-the">
                    <div className="m-t449-hang-dau">
                      <div className="m-t449-hang-ten">
                        {index + 1}. {d.ten}
                        {d.ma && <span className="m-t449-hang-ma">-{d.ma}</span>}
                      </div>
                      <div className="m-t449-hang-actions">
                        <button
                          type="button"
                          aria-label={`Sửa mặt hàng ${index + 1}`}
                          className="m-t449-btn-sua-hang"
                          onClick={() => setDongDangSuaIdx(originalIdx)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          aria-label={`Xoá mặt hàng ${index + 1}`}
                          className="m-t449-btn-xoa-hang"
                          onClick={() => xoaDong(originalIdx)}
                          title="Xoá mặt hàng"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6" />
                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="m-t449-hang-than">
                      <div className="m-t449-hang-dong">
                        <span className="lbl">Số lượng:</span>
                        <span className="val bold">{d.sl} {d.dvt || 'Cái'}</span>
                      </div>
                      <div className="m-t449-hang-dong">
                        <span className="lbl">Đơn giá:</span>
                        <span className="val">{money(d.gia)} đ</span>
                      </div>
                      <div className="m-t449-hang-dong">
                        <span className="lbl">Giảm giá ({d.ptCk ?? 0}%):</span>
                        <span className="val">{money(d.ck ?? 0)} đ</span>
                      </div>
                      <div className="m-t449-hang-dong">
                        <span className="lbl">VAT ({d.ts ?? 0}%):</span>
                        <span className="val">{money(d.thue ?? 0)} đ</span>
                      </div>
                      <div className="m-t449-hang-dong">
                        <span className="lbl">Tổng tiền:</span>
                        <span className="val bold">{money(lineTotal)} đ</span>
                      </div>
                    </div>
                  </div>
                )
              })}

              <button
                type="button"
                className="m-t449-btn-them-hang"
                onClick={() => setMoChonHang(true)}
              >
                + Thêm mặt hàng
              </button>
              {loiO.hang && <div className="m-lp-loi-o">{loiO.hang}</div>}

              {/* Thẻ tổng theo mẫu C */}
              <div className="m-t449-the-tong">
                <div className="m-t449-tong-dong">
                  <span>Thành tiền mặt hàng:</span>
                  <span className="bold">{money(tongTien)} đ</span>
                </div>
                <div className="m-t449-gach" />
                <div className="m-t449-tong-dong">
                  <span>Tổng tiền giảm giá:</span>
                  <span className="bold">{money(tongCk)} đ</span>
                </div>
                <div className="m-t449-gach" />
                <div className="m-t449-tong-dong">
                  <span>Tổng tiền thuế:</span>
                  <span className="bold">{money(tongThue)} đ</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ════ PHIẾU HÀNG HOÁ KHÁC (BÁN HÀNG, KHO...) ════ */
          <>
            <div className="m-pb-the m-pb-the-tong-quan">
              <div className="m-pb-hang-chip">
                <span className="m-pb-chip-loai">{tenLoai}</span>
                <span className="m-pb-chip-tt cho">{dangSua ? 'Đang sửa' : 'Phiếu mới'}</span>
              </div>

              {cfg.doiTuong !== 'none' && (
                <>
                  <label className="f-nhan">{nhanDoiTuong} <i>*</i></label>
                  <span className="f-o-lon f-chon-lon" onClick={() => setMoChonDt(true)}>
                    <span>{doiTuong || `Chọn ${nhanDoiTuong.toLowerCase()}`}</span> <b>›</b>
                  </span>
                  {loiO.doiTuong && <div className="m-lp-loi-o">{loiO.doiTuong}</div>}
                </>
              )}

              <div className="m-pb-dong-cn" onClick={() => setMoChonCn(true)} style={{ cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="1.8" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                <span>{cuaHang || 'Chọn cửa hàng'}</span>
              </div>
              {loiO.cuaHang && <div className="m-lp-loi-o">{loiO.cuaHang}</div>}

              <div>
                <div className="m-pb-nhan-gt">Tổng thanh toán (tự tính)</div>
                <div className="m-pb-so-gt cam">{money(tongThanhToan)} đ</div>
              </div>
            </div>

            <div className="m-pb-nhom">THÔNG TIN CHỨNG TỪ</div>
            <div className="m-pb-the m-pb-the-gon">
              {bo.kho && (
                <div className="m-pb-dong" onClick={() => setMoChonKho(true)} style={{ cursor: 'pointer' }}>
                  <span className="n">Kho <i className="f-sao">*</i></span>
                  <span className="f-gt f-chon">{kho || 'Chọn kho'} ›</span>
                </div>
              )}
              <div className="m-pb-dong" onClick={() => setMoLich(true)} style={{ cursor: 'pointer' }}>
                <span className="n">Ngày chứng từ <i className="f-sao">*</i></span>
                <span className="f-gt f-chon">
                  {thoiGian.slice(0, 10)}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 10h18M8 3v4M16 3v4" />
                  </svg>
                </span>
              </div>
              <div className="m-pb-dong">
                <span className="n">Diễn giải</span>
                <input
                  type="text"
                  className="f-gt f-input"
                  placeholder="Ghi chú diễn giải"
                  value={ghiChu}
                  onChange={e => setGhiChu(e.target.value)}
                />
              </div>
            </div>

            <div className="m-pb-nhom">MẶT HÀNG ({dsDong.length})</div>
            <div id="m-lp-o-hang">
              {dsDong.map((d, i) => (
                <TheHangMoi
                  key={i}
                  idx={i}
                  d={d}
                  goi={s.goi}
                  dangSua={dongMoRong.has(i)}
                  kieuGiam={kieuGiam[i] ?? '%'}
                  onDoiKieuGiam={kg => setKieuGiam(prev => ({ ...prev, [i]: kg }))}
                  onBatSua={() => setDongMoRong(s => new Set(s).add(i))}
                  onXoa={() => xoaDong(i)}
                  onMoChonDvt={() => moChonDvt(i)}
                  onMoChonVat={() => setMoChonVatIdx(i)}
                  onSuaSl={sl => suaSl(i, sl)}
                  onSuaGia={gia => suaGia(i, gia)}
                  onSuaGiamPt={pt => suaGiamPt(i, pt)}
                  onSuaGiamTien={ck => suaGiamTien(i, ck)}
                  onSuaTong={tong => suaTongTien(i, tong)}
                />
              ))}
            </div>

            <button type="button" className="f-them" onClick={() => setMoChonHang(true)}>
              + Thêm mặt hàng
            </button>
            {loiO.hang && <div className="m-lp-loi-o">{loiO.hang}</div>}
          </>
        )}

        {/* ════ KHỐI HẠCH TOÁN (GÓI KHÁC FREE) ════ */}
        {s.goi !== 'F' && dsButToan.length > 0 && (
          <div className="m-lp-khoi-ht" style={{ marginTop: 8 }}>
            <div
              className="m-pb-the m-lp-the-ht-tieu"
              onClick={() => setMoHt(v => !v)}
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div className="m-lp-ht-tieu-trai" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon n="bill" className="ic sm" kieu="net" />
                <span style={{ fontWeight: 600 }}>Hạch toán</span>
              </div>
              <div className="m-lp-ht-tieu-phai" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="m-lp-ht-tom-tat">{dsButToan.length / 2} cặp</span>
                <Icon n={moHt ? 'chevu' : 'chevd'} className="ic sm" kieu="net" />
              </div>
            </div>

            {moHt && (
              <div className="m-pb-the m-pb-the-gon" style={{ marginTop: 6 }}>
                {dsButToan.map((bt, idx) => (
                  <div
                    key={idx}
                    className="m-pb-dong"
                    onClick={() => {
                      if (laTien) {
                        setChonTk({ dong: 0, kieu: bt.kieu })
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="m-ht-tk">
                      {bt.kieu === 'no' ? 'Nợ ' : 'Có '}
                      <b>{bt.so}</b>
                      <i className="m-ht-ten"> - {bt.ten}</i>
                    </span>
                    <span className="m-ht-so">{money(bt.tien)} đ</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CHÂN GHIM ĐÁY ── */}
      <div className="m-pb-day">
        <button type="button" className="m-pb-btn-phu" onClick={handleQuayLai}>
          Huỷ
        </button>
        <button type="button" className="m-pb-btn-sua" onClick={() => thucHienLuu(false)}>
          {dangSua ? 'Lưu thay đổi' : 'Lưu phiếu'}
        </button>
      </div>

      {/* ── BẢNG CHỌN QUỸ THANH TOÁN (THANH TOÁN NGAY TRƯỢT LÊN) ── */}
      {moBangChonQuy && (
        <div className="q-nen" onClick={() => setMoBangChonQuy(false)}>
          <div className="q-mo" />
          <div className="q-sheet" onClick={e => e.stopPropagation()}>
            <div className="q-keo" />
            <div className="q-dau">
              <b>Chọn quỹ thanh toán</b>
              <span>Cửa hàng {cuaHang || 'Tất cả cửa hàng'}</span>
            </div>
            <div className="q-tim">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
              <input
                placeholder="Tìm quỹ…"
                value={timQuy}
                onChange={e => setTimQuy(e.target.value)}
              />
            </div>

            <div className="q-nhom">TIỀN MẶT</div>
            {dsQuyTmLoc.map(q => {
              const isSelected = quyTam === q.ten
              const thieuTien = q.soDu < tongThanhToan
              return (
                <label
                  key={q.k}
                  className={`q-dong ${isSelected ? 'on' : ''} ${thieuTien ? 'thieu' : ''}`}
                  onClick={() => setQuyTam(q.ten)}
                >
                  <span className="q-ic tm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="6" width="20" height="13" rx="2" />
                      <circle cx="12" cy="12.5" r="2.5" />
                      <path d="M6 9.5h.01M18 15.5h.01" />
                    </svg>
                  </span>
                  <span className="q-ten">
                    <b>{q.ten}</b>
                    <small>
                      Số dư {money(q.soDu)} đ{thieuTien && ` · không đủ trả ${money(tongThanhToan)} đ`}
                    </small>
                  </span>
                  <span className="q-radio" />
                </label>
              )
            })}

            <div className="q-nhom">NGÂN HÀNG</div>
            {dsQuyNhLoc.map(q => {
              const isSelected = quyTam === q.ten
              const thieuTien = q.soDu < tongThanhToan
              return (
                <label
                  key={q.k}
                  className={`q-dong ${isSelected ? 'on' : ''} ${thieuTien ? 'thieu' : ''}`}
                  onClick={() => setQuyTam(q.ten)}
                >
                  <span className="q-ic nh">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 10l9-6 9 6M5 10v8M19 10v8M9 10v8M15 10v8M3 20h18" />
                    </svg>
                  </span>
                  <span className="q-ten">
                    <b>{q.ten}</b>
                    <small>
                      Số dư {money(q.soDu)} đ{thieuTien && ` · không đủ trả ${money(tongThanhToan)} đ`}
                    </small>
                  </span>
                  <span className="q-radio" />
                </label>
              )
            })}

            <button
              type="button"
              className="f-them"
              onClick={() => {
                setMoBangChonQuy(false)
                setMoThemDm('quy')
              }}
            >
              + Tạo quỹ mới
            </button>

            <div className="m-pb-day q-chan">
              <button
                type="button"
                className="m-pb-btn-sua"
                onClick={() => {
                  setQuy(quyTam)
                  setMoBangChonQuy(false)
                }}
              >
                Chọn quỹ này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SHEET CHỌN LÝ DO ── */}
      <MChon
        mo={moChonLyDo}
        onDong={() => setMoChonLyDo(false)}
        tieuDe="Chọn nghiệp vụ"
        ds={dsLyDo.map(l => ({ k: l, ten: l }))}
        chon={lyDoHienTai}
        onChon={ly => {
          const tk = tkTheoLyDo(loai?.k ?? nhom, ly)
          doiDong(0, { ly, tkNo: tk.tkNo, tkCo: tk.tkCo })
        }}
        onThem={() => {
          setMoChonLyDo(false)
          setMoThemDm('lyDo')
        }}
        nhanThem="Thêm lý do nghiệp vụ"
        apDung
        tim
      />

      {/* ── SHEET CHỌN CỬA HÀNG ── */}
      <MChon
        mo={moChonCn}
        onDong={() => setMoChonCn(false)}
        tieuDe="Chọn cửa hàng"
        ds={CUA_HANG.map(c => ({ k: c.ten, ten: c.ten }))}
        chon={cuaHang}
        onChon={v => {
          setCuaHang(v)
          setLoiO(l => { const n = { ...l }; delete n.cuaHang; return n })
          const khoMoi = CUA_HANG.find(c => c.ten === v)?.kho?.[0] || 'Kho trung tâm'
          setKho(khoMoi)
        }}
        apDung
        tim
      />

      {/* ── SHEET CHỌN QUỸ (THU CHI) ── */}
      <MChon
        mo={moChonQuy}
        onDong={() => setMoChonQuy(false)}
        tieuDe="Chọn quỹ / tài khoản"
        ds={dsQuy.map(q => ({ k: q, ten: q }))}
        chon={quy}
        onChon={v => {
          setQuy(v)
          if (loiO.quy) setLoiO(l => { const n = { ...l }; delete n.quy; return n })
        }}
        apDung
        tim
      />

      {/* ── SHEET CHỌN ĐẾN QUỸ (CHUYỂN QUỸ) ── */}
      <MChon
        mo={moChonDenQuy}
        onDong={() => setMoChonDenQuy(false)}
        tieuDe="Chọn quỹ nhận"
        ds={QUY_TIEN.filter(q => q !== quy).map(q => ({ k: q, ten: q }))}
        chon={denQuy}
        onChon={v => {
          setDenQuy(v)
          if (loiO.denQuy) setLoiO(l => { const n = { ...l }; delete n.denQuy; return n })
        }}
        apDung
        tim
      />

      {/* ── SHEET CHỌN ĐỐI TƯỢNG ── */}
      <MChon
        mo={moChonDt}
        onDong={() => setMoChonDt(false)}
        tieuDe={`Chọn ${nhanDoiTuong.toLowerCase()}`}
        ds={dsDoiTuong.map(d => ({ k: d, ten: d }))}
        chon={doiTuong}
        onChon={v => {
          setDoiTuong(v)
          if (loiO.doiTuong) setLoiO(l => { const n = { ...l }; delete n.doiTuong; return n })
        }}
        onThem={() => {
          setMoChonDt(false)
          setMoThemDm('doiTuong')
        }}
        nhanThem={`Thêm ${nhanDoiTuong.toLowerCase()}`}
        apDung
        tim
      />

      {/* ── SHEET CHỌN KHO ── */}
      <MChon
        mo={moChonKho}
        onDong={() => setMoChonKho(false)}
        tieuDe="Chọn kho nhận"
        ds={dsKho.map(k => ({ k, ten: k }))}
        chon={kho}
        onChon={v => {
          setKho(v)
          if (loiO.kho) setLoiO(l => { const n = { ...l }; delete n.kho; return n })
        }}
        onThem={() => {
          setMoChonKho(false)
          setMoThemDm('kho')
        }}
        nhanThem="Thêm kho"
        apDung
        tim
      />

      {/* ── SHEET CHỌN LOẠI CHỨNG TỪ ── */}
      {moChonLoai && cfgMan.loai && (
        <MChon
          mo={moChonLoai}
          onDong={() => setMoChonLoai(false)}
          tieuDe="Chọn loại chứng từ"
          ds={cfgMan.loai.map(x => ({ k: x.k, ten: x.ten }))}
          chon={loai?.k}
          onChon={k => {
            sp.set('loai', k)
            nav({ search: sp.toString() }, { replace: true })
            setMoChonLoai(false)
          }}
        />
      )}

      {/* ── SHEET CHỌN VAT ── */}
      {moChonVatIdx !== null && (
        <MChon
          mo={moChonVatIdx !== null}
          onDong={() => setMoChonVatIdx(null)}
          tieuDe="Chọn thuế suất VAT"
          ds={[
            { k: '0-kct', ten: 'KCT (Không chịu thuế)' },
            { k: '0', ten: '0%' },
            { k: '5', ten: '5%' },
            { k: '8', ten: '8%' },
            { k: '10', ten: '10%' },
          ]}
          chon={dsDong[moChonVatIdx]?.ts === 0 ? '0-kct' : String(dsDong[moChonVatIdx]?.ts ?? 0)}
          onChon={k => {
            const ts = k === '0-kct' ? 0 : Number(k)
            suaVat(moChonVatIdx, ts)
            setMoChonVatIdx(null)
          }}
        />
      )}

      {/* ── SHEET CHỌN TÀI KHOẢN NỢ / CÓ ── */}
      {chonTk !== null && (
        <MChon
          mo={chonTk !== null}
          onDong={() => setChonTk(null)}
          tieuDe={chonTk.kieu === 'no' ? 'Chọn tài khoản Nợ' : 'Chọn tài khoản Có'}
          ds={DS_TK_CHI_TIET.map(t => ({ k: t.so, ten: `${t.so} - ${t.ten}` }))}
          chon={chonTk.kieu === 'no' ? dsDong[chonTk.dong]?.tkNo : dsDong[chonTk.dong]?.tkCo}
          onChon={soTk => {
            if (chonTk !== null) {
              if (chonTk.kieu === 'no') {
                doiDong(chonTk.dong, { tkNo: soTk })
              } else {
                doiDong(chonTk.dong, { tkCo: soTk })
              }
            }
          }}
          tim
        />
      )}

      {/* ── SHEET CHỌN HÀNG HOÁ ── */}
      {moChonHang && (
        <div className="m-tam-overlay" onClick={() => setMoChonHang(false)}>
          <div className="m-tam-hop m-tam-hop-apdung m-lp-sheet-hang" onClick={e => e.stopPropagation()}>
            <div className="m-tam-dau m-tam-dau-apdung">
              <h2 className="m-tam-tieu">Chọn hàng hoá</h2>
              <button
                type="button"
                className="m-tam-dong-btn"
                onClick={() => setMoChonHang(false)}
                aria-label="Đóng"
              >
                <Icon n="x" className="ic sm" kieu="net" />
              </button>
            </div>

            <div className="m-tam-them-wrap">
              <button
                type="button"
                className="btn pri m-tam-btn-them"
                onClick={() => {
                  setMoChonHang(false)
                  setMoThemDm('hang')
                }}
              >
                <Icon n="plus" className="ic sm" />
                <span>Thêm hàng hoá</span>
              </button>
            </div>

            <div className="m-lp-loc-hang">
              <button
                type="button"
                className="m-lp-btn-nhom"
                onClick={() => setMoChonNhomHang(true)}
              >
                <span>{nhomHangChon}</span>
                <Icon n="chevd" className="ic sm" kieu="net" />
              </button>
              <div className="m-lp-tim-hang-wrap">
                <Icon n="search" className="ic sm m-lp-tim-ic" kieu="net" />
                <input
                  type="text"
                  className="m-lp-tim-hang-inp"
                  placeholder="Tìm tên, mã hàng..."
                  value={timHang}
                  onChange={e => setTimHang(e.target.value)}
                />
                {timHang && (
                  <button type="button" className="m-lp-tim-hang-x" onClick={() => setTimHang('')}>
                    <Icon n="x" className="ic sm" kieu="net" />
                  </button>
                )}
              </div>
              <button
                type="button"
                className={`m-lp-cb-tat-ca ${tatCaDaChon ? 'on' : ''}`}
                onClick={toggleTatCa}
                title="Chọn tất cả"
              >
                {tatCaDaChon && <Icon n="check" className="ic sm" kieu="net" />}
              </button>
            </div>

            <div className="m-lp-than m-lp-ds-hang" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
              {dsHangHienThi.map(h => {
                const daChon = dsDong.some(d => d.ma === h.ma)
                return (
                  <div
                    key={h.ma}
                    className={`m-the-trang m-lp-the-hang ${daChon ? 'on' : ''}`}
                    onClick={() => toggleHang(h)}
                  >
                    <div className="m-lp-hang-trai">
                      <div className="m-lp-hang-ten">{h.ten}</div>
                      <div className="m-lp-hang-phu">
                        Mã: {h.ma} · {h.dvt} · {money(h.gia)} đ
                      </div>
                    </div>
                    <div className={`m-lp-cb-hang ${daChon ? 'on' : ''}`}>
                      {daChon && <Icon n="check" className="ic sm" kieu="net" />}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="m-tam-day">
              <div className="m-lp-day-trai">
                <span className="m-lp-day-dem">Đã chọn: <b>{dsDong.length}</b></span>
              </div>
              <button
                type="button"
                className="m-tam-btn-apdung"
                onClick={() => setMoChonHang(false)}
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SHEET CHỌN NHÓM HÀNG ── */}
      <MChon
        mo={moChonNhomHang}
        onDong={() => setMoChonNhomHang(false)}
        tieuDe="Chọn nhóm hàng"
        ds={dsNhomHang.map(nh => ({ k: nh, ten: nh }))}
        chon={nhomHangChon}
        onChon={setNhomHangChon}
        apDung
        tim
      />

      {/* ── LỊCH ĐƠN NGÀY CHỨNG TỪ ── */}
      {moLich && (
        <LichDon
          value={thoiGian.slice(0, 10)}
          onChange={v => {
            setThoiGian(v + thoiGian.slice(10))
            setMoLich(false)
          }}
          onDong={() => setMoLich(false)}
        />
      )}

      {/* ── LỊCH ĐƠN NGÀY HOÁ ĐƠN ── */}
      {moLichHd && (
        <LichDon
          value={ngayHd.slice(0, 10)}
          onChange={v => {
            setNgayHd(v)
            setMoLichHd(false)
          }}
          onDong={() => setMoLichHd(false)}
        />
      )}

      {/* ── HỘP THÔNG BÁO TẠO THẺ CHI PHÍ PHÂN BỔ (T419: một nút Tiếp tục) ── */}
      {hoiThe && (
        <div className="m-tam-overlay" style={{ zIndex: 1200 }}>
          <div className="m-tam-hop m-lp-hop-hoi-the">
            <div className="m-tam-dau">
              <h3 className="m-tam-tieu" style={{ fontSize: 16 }}>Tạo thẻ chi phí phân bổ</h3>
            </div>
            <div className="m-lp-hop-nd" style={{ padding: '14px 16px', fontSize: 14, color: 'var(--ink)' }}>
              <b>{hoiThe.soCt}</b> có khoản Chi phí chờ phân bổ. Phần mềm mở màn Tạo thẻ chi phí phân bổ, điền sẵn tên, số tiền, ngày, chứng từ gốc từ phiếu. Bạn vẫn sửa lại được.
            </div>
            <div className="m-tam-day" style={{ padding: '10px 16px' }}>
              <button
                type="button"
                className="m-tam-btn-apdung"
                onClick={() => {
                  const h = hoiThe
                  setHoiThe(null)
                  nav('/app/ccdc/8-1-1?moi=the', {
                    state: {
                      tuPhieu: {
                        cn: cuaHang,
                        gt: tongThanhToan,
                        tien: tongThanhToan,
                        ngay: thoiGian.split(' ')[0],
                        ngayCt: thoiGian.split(' ')[0],
                        ngayPb: thoiGian.split(' ')[0],
                        ten: ghiChu || dsDong[0]?.ten || 'Chi phí chờ phân bổ',
                        ghiChuCt: ghiChu,
                        soCt: h.soCt,
                        idMoi: h.idMoi,
                        _goc: `${path}/${h.idMoi}`,
                        dong: [{
                          ten: ghiChu || dsDong[0]?.ten || 'Chi phí chờ phân bổ',
                          gt: tongThanhToan,
                        }],
                      },
                    },
                  })
                }}
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SHEET CHỌN ĐƠN VỊ TÍNH QUY ĐỔI ── */}
      {dvtSheet && (
        <MChon
          mo={Boolean(dvtSheet)}
          onDong={() => setDvtSheet(null)}
          tieuDe={`Đơn vị tính: ${dvtSheet.ten}`}
          ds={dvtSheet.ds}
          chon={dsDong[dvtSheet.idx]?.dvt}
          onChon={dv => {
            doiDvt(dvtSheet.idx, dv)
            setDvtSheet(null)
          }}
        />
      )}

      {/* ── FORM THÊM MỚI DANH MỤC TRÊN ĐIỆN THOẠI ── */}
      {moThemDm && (() => {
        const meta = getDmMeta(moThemDm, undefined)
        return (
          <MFormDm
            sc={meta.sc}
            cauHinh={meta.cauHinh}
            edit={{}}
            dienSan={meta.dienSan}
            all={meta.all}
            ten={meta.ten}
            tenNgan={meta.tenNgan}
            onDong={() => setMoThemDm(null)}
            onLuu={(val) => {
              addCatalogRow(meta.catKey, val)
              const ma = String(val.ma ?? '').trim()
              const ten = String(val.ten ?? '').trim()
              if (meta.catKey === '1.5') {
                setDoiTuong(ten)
                if (loiO.doiTuong) setLoiO(l => { const n = { ...l }; delete n.doiTuong; return n })
              } else if (meta.catKey === '1.16') {
                const tk = tkTheoLyDo(loai?.k ?? nhom, ten)
                doiDong(0, { ly: ten, tkNo: tk.tkNo, tkCo: tk.tkCo })
              } else if (meta.catKey === '1.8') {
                setKho(ten)
                if (loiO.kho) setLoiO(l => { const n = { ...l }; delete n.kho; return n })
              } else if (meta.catKey === '1.2') {
                const gia = Number(val.gia) || Number(val.giaMua) || 0
                const sl = 1
                const tien = sl * gia
                const ts = cfg.thue === 0 ? 0 : (Number(val.ts) || 0)
                const thue = Math.round(tien * ts / 100)
                setDsDong(ds => {
                  const next = [...ds, {
                    ma,
                    ten,
                    dvt: String(val.dvt ?? 'Cái'),
                    sl,
                    gia,
                    tien,
                    ts,
                    thue,
                    tkNo: '156',
                    tkCo: '331',
                  }]
                  setDongMoRong(s => new Set(s).add(next.length - 1))
                  return next
                })
              }
              setMoThemDm(null)
            }}
          />
        )
      })()}

      {/* ── BẢNG TRƯỢT SỬA MẶT HÀNG PHIẾU MUA (T449) ── */}
      {dongDangSuaIdx !== null && dsDong[dongDangSuaIdx] && (
        <MSuaHangSheet
          mo={dongDangSuaIdx !== null}
          idx={dongDangSuaIdx}
          dong={dsDong[dongDangSuaIdx]}
          onDong={() => setDongDangSuaIdx(null)}
          onCapNhat={(patch) => {
            doiDong(dongDangSuaIdx, patch)
            setDongDangSuaIdx(null)
          }}
        />
      )}
    </div>
  )
}
