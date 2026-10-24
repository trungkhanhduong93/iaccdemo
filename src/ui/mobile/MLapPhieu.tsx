import { Fragment, useEffect, useMemo, useState, type FC } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { dongCua, tkTheoLyDo, ttNghiepVu, type Dong } from '../generic/gen'
import { duongDan, tenMan } from '../../app/registry'
import { cuaHangHienTai, ngayDauNam, truocDauNam, useSession } from '../../app/session'
import { anNgoaiGoi, type Goi, kieuGhiSoDv } from '../../app/plan'
import { CUA_HANG, HANG, KHACH, KHO, LY_CAN_DOI_TUONG, LY_DO, NCC, NHAN_VIEN, NVL, MA_LY_CHO_PHAN_BO, TK_NGAN_HANG } from '../../data/mock'
import { boO, nhomCua, theoLoai } from '../generic/nhom'
import { DS_DOI_TUONG } from '../generic/BangSua'
import { ghiNhatKy, soKeTiep, suaPhieu, themPhieu, soDaTra, dsTtCon, ttTienTheoTra, type PhieuTt } from '../generic/daXoa'
import { MLichSu } from './MLichSu'
import { MThanhCong, type DongTomTat } from './MThanhCong'
import { MThanhToanNgay, lapPhieuChiTraNcc, type ThongTinTt } from './MThanhToanNgay'
import { soLuong } from '../format'
import { MAN_THU_CHI, QUY_TIEN, TEN_CT_TT, TIEN_TO_CT_TT } from '../generic/ChungTuForm'
import { useDongChungTu } from '../generic/VoucherScreen'
import { chuanKyHieuHd, chuanSoHd, fold, money } from '../format'
import { Icon } from '../Icon'
import { LichDon } from '../ChonNgay'
import { MChon, MThanhThem } from './MChon'
import { MTrong } from './MTrong'
import { MLapPhieuKho } from './MLapPhieuKho'
import { MFormDm } from './MFormDm'
import { addCatalogRow, getAllCatalogRows, getDmMeta, sinhMaKeTiep, useAddedCatalogRows } from '../generic/danhMucStore'
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

const DIA_CHI_NCC: Record<string, string> = {
  'Công ty TNHH Thực phẩm Tươi An Phú': '12 Nguyễn Thị Định, An Phú, TP. Thủ Đức',
  'Cơ sở bánh phở Bà Tư': '45 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',
  'Công ty CP Cà phê Cao Nguyên Xanh': '158 Đinh Tiên Hoàng, Đa Kao, Quận 1, TP.HCM',
  'Công ty TNHH Nước giải khát Nam Bộ': '234 Phan Xích Long, Phường 2, Phú Nhuận, TP.HCM',
  'Hợp tác xã Rau sạch Củ Chi': 'Ấp Chợ Cũ, An Nhơn Tây, Củ Chi, TP.HCM',
  'Công ty TNHH Thiết bị bếp Gia Phát': '228 Cộng Hoà, Phường 12, Tân Bình, TP.HCM',
  'Công ty Điện lực Sài Gòn': '72 Hai Bà Trưng, Bến Nghé, Quận 1, TP.HCM',
}

const NGUOI_GD_NCC: Record<string, string> = {
  'Công ty TNHH Thực phẩm Tươi An Phú': 'Nguyễn Văn An',
  'Cơ sở bánh phở Bà Tư': 'Trần Thị Mai',
  'Công ty CP Cà phê Cao Nguyên Xanh': 'Lê Hoàng Nam',
  'Công ty TNHH Nước giải khát Nam Bộ': 'Phạm Minh Tuấn',
  'Hợp tác xã Rau sạch Củ Chi': 'Vũ Bích Ngọc',
  'Công ty TNHH Thiết bị bếp Gia Phát': 'Đỗ Thanh Tùng',
  'Công ty Điện lực Sài Gòn': 'Nguyễn Văn An',
}

function tinhSoNgayCon(hanTtStr?: string) {
  if (!hanTtStr) return ''
  const [d, m, y] = hanTtStr.split('/').map(Number)
  if (!d || !m || !y) return ''
  const han = new Date(y, m - 1, d)
  const homNay = new Date()
  homNay.setHours(0, 0, 0, 0)
  const diff = Math.ceil((han.getTime() - homNay.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return `quá hạn ${Math.abs(diff)} ngày`
  if (diff === 0) return 'đến hạn hôm nay'
  return `còn ${diff} ngày`
}

// ── Bảng số dư quỹ tham khảo ──
const BANG_SO_DU_QUY: Record<string, number> = {
  'Quỹ tiền mặt Nguyễn Trãi': 12450000,
  'Quỹ tiền mặt Lê Lợi': 8200000,
  'Quỹ tiền mặt văn phòng': 3100000,
  'Quỹ tiền mặt Thảo Điền': 32500000,
  'Techcombank 1903 4455 6677 88': 319850000,
  'Vietcombank 0071 0012 34567': 144800000,
  'Vietcombank · 0071 0012 3456': 186300000,
  'VPBank, chi nhánh Quận 1': 3320000,
}

const soDuQuy = (tenQuy: string): number => {
  if (BANG_SO_DU_QUY[tenQuy] !== undefined) return BANG_SO_DU_QUY[tenQuy]
  if (tenQuy.includes('VPBank')) return 3320000
  if (tenQuy.includes('Techcombank')) return 319850000
  if (tenQuy.includes('Vietcombank')) return 186300000
  if (tenQuy.includes('văn phòng')) return 3100000
  if (tenQuy.includes('Lê Lợi')) return 8200000
  if (tenQuy.startsWith('Quỹ tiền mặt')) return 12450000
  return 15000000
}

const vietTatTenNcc = (ten: string) => {
  const words = ten.replace(/^(Công ty|Cơ sở|Hợp tác xã|HTX|Đại lý|Doanh nghiệp)\s+(TNHH|CP|Cổ phần)?\s*/i, '').trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return ten.slice(0, 2).toUpperCase()
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
  id?: string
  moi?: boolean
  kieuGiam?: '%' | 'đ'
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

// ── T528: Chuẩn hoá chuỗi phần trăm (bỏ số 0 đứng đầu, giữ 0, 0., 0.5, ô trống) ──
function chuanHoaPhanTram(val: string): string {
  let s = val.replace(/[^\d.]/g, '')
  const parts = s.split('.')
  if (parts.length > 2) {
    s = parts[0] + '.' + parts.slice(1).join('')
  }
  return s.replace(/^0+(?=\d)/, '')
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
                  const valStr = chuanHoaPhanTram(e.target.value)
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

// ── Thẻ mặt hàng điền nhanh phiếu mua hàng (T528) ──
interface TheHangMuaProps {
  stt: number
  dong: DongM
  onDoiDong: (patch: Partial<DongM>) => void
  onDoiDvt: (dvMoi: string) => void
  onNhanBan: () => void
  onXoa: () => void
  autoFocusSl?: boolean
}

function TheHangMua({
  stt,
  dong,
  onDoiDong,
  onDoiDvt,
  onNhanBan,
  onXoa,
  autoFocusSl,
}: TheHangMuaProps) {
  const kieuGiam = dong.kieuGiam ?? (dong?.ck && !dong?.ptCk ? 'đ' : '%')

  // Chế độ sửa bút
  const [suaGiamTien, setSuaGiamTien] = useState(false)
  const [suaThueTien, setSuaThueTien] = useState(false)
  const [suaTongTien, setSuaTongTien] = useState(false)

  // Focus & local strings
  const [focusSl, setFocusSl] = useState(false)
  const [strSl, setStrSl] = useState('')
  const [focusGia, setFocusGia] = useState(false)
  const [strGia, setStrGia] = useState('')
  const [focusGiam, setFocusGiam] = useState(false)
  const [strGiam, setStrGiam] = useState('')
  const [strTienGiam, setStrTienGiam] = useState('')
  const [focusTs, setFocusTs] = useState(false)
  const [strTs, setStrTs] = useState('')
  const [strTienThue, setStrTienThue] = useState('')
  const [strTong, setStrTong] = useState('')

  const sl = dong.sl ?? 1
  const dvt = dong.dvt || 'Cái'
  const gia = dong.gia ?? 0
  const ptCk = dong.ptCk ?? 0
  const ck = dong.ck ?? 0
  const ts = dong.ts ?? 0
  const thue = dong.thue ?? 0
  const tuChia = Boolean(dong.tuChia)
  const tongNhap = dong.tongNhap
  const tienHang = Math.round(sl * gia)
  const tongHienTai = tongNhap !== undefined ? tongNhap : (tienHang - ck + thue)

  // ĐVT quy đổi
  const dvtChinh = dong.dvtChinh || HANG.find(h => h.ma === dong.ma || h.ten === dong.ten)?.dvt || NVL.find(n => n.ma === dong.ma || n.ten === dong.ten)?.dvt || dvt
  const dsQd = useMemo(() => quyDoiTuDanhMuc(dong.ten || '', dvtChinh), [dong.ten, dvtChinh])
  const dsDvt = useMemo(() => [dvtChinh, ...dsQd.map(q => q.dv)].filter(Boolean), [dvtChinh, dsQd])

  const handleChuyenDvt = () => {
    if (dsDvt.length <= 1) return
    const curIdx = dsDvt.indexOf(dvt)
    const nextIdx = (curIdx + 1) % dsDvt.length
    onDoiDvt(dsDvt[nextIdx])
  }

  const handleDoiSl = (v: number) => {
    const newTien = Math.round(v * gia)
    let newCk = ck
    if (kieuGiam === '%') {
      newCk = Math.round((newTien * ptCk) / 100)
    }
    const newThue = Math.round(((newTien - newCk) * ts) / 100)
    if (tuChia && tongNhap !== undefined) {
      const g = v > 0 ? Math.round((tongNhap - newThue + newCk) / v) : 0
      onDoiDong({ sl: v, gia: g, tien: Math.round(v * g), ck: newCk, thue: newThue, tongNhap, tuChia: true })
    } else {
      onDoiDong({ sl: v, tien: newTien, ck: newCk, thue: newThue })
    }
  }

  const handleDoiGia = (g: number) => {
    const newTien = Math.round(sl * g)
    let newCk = ck
    if (kieuGiam === '%') {
      newCk = Math.round((newTien * ptCk) / 100)
    }
    const newThue = Math.round(((newTien - newCk) * ts) / 100)
    onDoiDong({ gia: g, tuChia: false, tongNhap: undefined, tien: newTien, ck: newCk, thue: newThue })
  }

  const handleDoiGiamVal = (valStr: string) => {
    if (kieuGiam === '%') {
      const val = Number(valStr) || 0
      const newCk = Math.round((tienHang * val) / 100)
      const newThue = Math.round(((tienHang - newCk) * ts) / 100)
      onDoiDong({ ptCk: val, ck: newCk, thue: newThue })
    } else {
      const c = docSoVN(valStr)
      const pt = tienHang > 0 ? Math.round((c / tienHang) * 10000) / 100 : 0
      const newThue = Math.round(((tienHang - c) * ts) / 100)
      onDoiDong({ ptCk: pt, ck: c, thue: newThue })
    }
  }

  const handleSuaTienGiamTrucTiep = (valStr: string) => {
    const tienG = docSoVN(valStr)
    const pt = tienHang > 0 ? Math.round((tienG / tienHang) * 10000) / 100 : 0
    const newThue = Math.round(((tienHang - tienG) * ts) / 100)
    onDoiDong({ ck: tienG, ptCk: pt, thue: newThue })
  }

  const handleDoiTsVal = (valStr: string) => {
    const val = Number(valStr) || 0
    const newThue = Math.round(((tienHang - ck) * val) / 100)
    onDoiDong({ ts: val, thue: newThue })
  }

  const handleSuaThueTrucTiep = (valStr: string) => {
    const thueVal = docSoVN(valStr)
    onDoiDong({ thue: thueVal })
  }

  const handleSuaTongTrucTiep = (valStr: string) => {
    const tVal = docSoVN(valStr)
    const g = sl > 0 ? Math.round((tVal - thue + ck) / sl) : 0
    onDoiDong({ tongNhap: tVal, tuChia: true, gia: g, tien: Math.round(sl * g) })
  }

  const tenClean = dong.ten.replace(/^\d+\.\s*/, '')

  return (
    <div id={`m-hang-${dong.id ?? stt}`} className={`m-t601-hang-row ${dong.moi ? 'moi' : ''}`}>
      <div className="m-t601-hang-row-dau">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
            {stt}. {tenClean} {dong.ma && <span style={{ fontSize: 12, fontWeight: 400, color: '#9ca3af' }}>{dong.ma}</span>}
          </span>
          {dong.moi && <span className="m-t600-chip-moi">Mới</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            aria-label="Nhân bản dòng"
            className="m-t601-btn-nhan-ban"
            onClick={onNhanBan}
            title="Nhân bản dòng"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0560a6" strokeWidth="2" aria-hidden="true">
              <rect x="9" y="9" width="12" height="12" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h8" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Xoá dòng"
            className="m-t601-btn-xoa"
            onClick={onXoa}
            title="Xoá dòng"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c2362b" strokeWidth="2" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="m-t601-grid">
        {/* Hàng Số lượng */}
        <span className="m-t601-grid-lbl">Số lượng</span>
        <input
          type="text"
          inputMode="decimal"
          autoFocus={autoFocusSl}
          aria-label={`Số lượng mặt hàng ${stt}`}
          className={`m-t601-box ${dong.moi && autoFocusSl ? 'focus-moi' : ''}`}
          value={focusSl ? strSl : String(sl)}
          onFocus={() => {
            setFocusSl(true)
            setStrSl(String(sl))
          }}
          onChange={e => {
            const s = goSoVN(e.target.value, true)
            setStrSl(s)
            handleDoiSl(docSoVN(s))
          }}
          onBlur={() => setFocusSl(false)}
        />
        <button type="button" className="m-t601-box sel" onClick={handleChuyenDvt} aria-label={`Đơn vị tính mặt hàng ${stt}`}>
          <span>{dvt}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0560a6" strokeWidth="2.5" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {/* Hàng Đơn giá */}
        <span className="m-t601-grid-lbl">Đơn giá</span>
        <div className="m-t601-box" style={{ gridColumn: '2 / -1', position: 'relative', paddingRight: 28 }}>
          <input
            type="text"
            inputMode="numeric"
            aria-label={`Đơn giá mặt hàng ${stt}`}
            style={{ border: 0, outline: 0, width: '100%', font: 'inherit', color: 'inherit', background: 'transparent' }}
            value={focusGia ? strGia : money(gia)}
            onFocus={() => {
              setFocusGia(true)
              setStrGia(money(gia))
            }}
            onChange={e => {
              const s = goSoVN(e.target.value, false)
              setStrGia(s)
              handleDoiGia(docSoVN(s))
            }}
            onBlur={() => setFocusGia(false)}
          />
          <span style={{ position: 'absolute', right: 10, fontSize: 12, fontWeight: 500, color: '#9ca3af', pointerEvents: 'none' }}>đ</span>
        </div>

        {/* Hàng Chiết khấu */}
        <span className="m-t601-grid-lbl">Chiết khấu</span>
        <div className="m-t601-box" style={{ position: 'relative', paddingRight: 34 }}>
          <input
            type="text"
            inputMode={kieuGiam === '%' ? 'decimal' : 'numeric'}
            aria-label={`Chiết khấu mặt hàng ${stt}`}
            style={{ border: 0, outline: 0, width: '100%', font: 'inherit', color: 'inherit', background: 'transparent' }}
            value={focusGiam ? strGiam : (kieuGiam === '%' ? String(dong.ptCk ?? 0) : money(ck))}
            onFocus={() => {
              setFocusGiam(true)
              setStrGiam(kieuGiam === '%' ? String(dong.ptCk ?? 0) : money(ck))
            }}
            onChange={e => {
              if (kieuGiam === '%') {
                const s = chuanHoaPhanTram(e.target.value)
                setStrGiam(s)
                handleDoiGiamVal(s)
              } else {
                const s = goSoVN(e.target.value, false)
                setStrGiam(s)
                handleDoiGiamVal(s)
              }
            }}
            onBlur={() => setFocusGiam(false)}
          />
          <button
            type="button"
            className="m-t601-btn-kieu-giam"
            aria-label="Đổi kiểu chiết khấu"
            onClick={() => {
              const moi = kieuGiam === '%' ? 'đ' : '%'
              onDoiDong({ kieuGiam: moi })
              setFocusGiam(false)
            }}
            style={{ position: 'absolute', right: 4, top: 4, bottom: 4, border: 0, background: 'none', color: '#0560a6', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', padding: '0 4px' }}
          >
            {kieuGiam}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
          </button>
        </div>
        {suaGiamTien ? (
          <div className="m-t601-box" style={{ position: 'relative', paddingRight: 24 }}>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              aria-label={`Sửa tiền chiết khấu mặt hàng ${stt}`}
              style={{ border: 0, outline: 0, width: '100%', font: 'inherit', color: 'inherit', background: 'transparent', textAlign: 'right' }}
              value={strTienGiam}
              onChange={e => {
                const s = goSoVN(e.target.value, false)
                setStrTienGiam(s)
                handleSuaTienGiamTrucTiep(s)
              }}
              onBlur={() => setSuaGiamTien(false)}
            />
            <span style={{ position: 'absolute', right: 6, fontSize: 12, color: '#9ca3af', pointerEvents: 'none' }}>đ</span>
          </div>
        ) : (
          <div className="m-t601-amt">
            <span>{money(ck)} đ</span>
            <button
              type="button"
              className="m-t601-pen"
              aria-label={`Sửa tiền chiết khấu mặt hàng ${stt}`}
              onClick={() => {
                setSuaGiamTien(true)
                setStrTienGiam(money(ck))
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z" /></svg>
            </button>
          </div>
        )}

        {/* Hàng VAT */}
        <span className="m-t601-grid-lbl">VAT</span>
        <div className="m-t601-box" style={{ position: 'relative', paddingRight: 24 }}>
          <input
            type="text"
            inputMode="decimal"
            aria-label={`Thuế suất VAT mặt hàng ${stt}`}
            style={{ border: 0, outline: 0, width: '100%', font: 'inherit', color: 'inherit', background: 'transparent' }}
            value={focusTs ? strTs : String(ts)}
            onFocus={() => {
              setFocusTs(true)
              setStrTs(String(ts))
            }}
            onChange={e => {
              const s = chuanHoaPhanTram(e.target.value)
              setStrTs(s)
              handleDoiTsVal(s)
            }}
            onBlur={() => setFocusTs(false)}
          />
          <span style={{ position: 'absolute', right: 8, fontSize: 12, color: '#9ca3af', pointerEvents: 'none' }}>%</span>
        </div>
        {suaThueTien ? (
          <div className="m-t601-box" style={{ position: 'relative', paddingRight: 24 }}>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              aria-label={`Sửa tiền VAT mặt hàng ${stt}`}
              style={{ border: 0, outline: 0, width: '100%', font: 'inherit', color: 'inherit', background: 'transparent', textAlign: 'right' }}
              value={strTienThue}
              onChange={e => {
                const s = goSoVN(e.target.value, false)
                setStrTienThue(s)
                handleSuaThueTrucTiep(s)
              }}
              onBlur={() => setSuaThueTien(false)}
            />
            <span style={{ position: 'absolute', right: 6, fontSize: 12, color: '#9ca3af', pointerEvents: 'none' }}>đ</span>
          </div>
        ) : (
          <div className="m-t601-amt">
            <span>{money(thue)} đ</span>
            <button
              type="button"
              className="m-t601-pen"
              aria-label={`Sửa tiền VAT mặt hàng ${stt}`}
              onClick={() => {
                setSuaThueTien(true)
                setStrTienThue(money(thue))
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z" /></svg>
            </button>
          </div>
        )}

        {/* Hàng Tổng tiền */}
        <span className="m-t601-grid-lbl tg">Tổng tiền</span>
        {suaTongTien ? (
          <div className="m-t601-box" style={{ gridColumn: '2 / -1', position: 'relative', paddingRight: 24, marginTop: 4 }}>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              aria-label={`Sửa tổng tiền mặt hàng ${stt}`}
              style={{ border: 0, outline: 0, width: '100%', font: 'inherit', color: 'inherit', background: 'transparent', textAlign: 'right' }}
              value={strTong}
              onChange={e => {
                const s = goSoVN(e.target.value, false)
                setStrTong(s)
                handleSuaTongTrucTiep(s)
              }}
              onBlur={() => setSuaTongTien(false)}
            />
            <span style={{ position: 'absolute', right: 6, fontSize: 12, color: '#9ca3af', pointerEvents: 'none' }}>đ</span>
          </div>
        ) : (
          <div className="m-t601-amt tg" style={{ gridColumn: '2 / -1' }}>
            <span>{money(tongHienTai)} đ</span>
            <button
              type="button"
              className="m-t601-pen"
              aria-label={`Sửa tổng tiền mặt hàng ${stt}`}
              onClick={() => {
                setSuaTongTien(true)
                setStrTong(money(tongHienTai))
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z" /></svg>
            </button>
          </div>
        )}

        {/* Hàng Ghi chú */}
        <input
          type="text"
          aria-label={`Ghi chú mặt hàng ${stt}`}
          className="m-t601-box ghi-chu"
          placeholder="Nhập ghi chú nếu có"
          value={dong.ghiChu ?? ''}
          onChange={e => onDoiDong({ ghiChu: e.target.value })}
        />
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
  const man = `${mod.key}/${sc.slug}`
  const soCtDuKien = dangSua ? String(row?.so ?? gocData?.so ?? '') : soKeTiep(man, `${cfg.prefix}2610-`)

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
  const quyTmCh = useMemo(() => {
    const tim = CUA_HANG.find(c => c.ten === cuaHang || c.ngan === cuaHang || c.id === cuaHang)
      ?? CUA_HANG.find(c => cuaHang.includes(c.ngan))
    return tim ? `Quỹ tiền mặt ${tim.ngan}` : quyTm
  }, [cuaHang, quyTm])

  const dsQuyMau = useMemo(() => [
    ...CUA_HANG.map(c => ({
      k: `Quỹ tiền mặt ${c.ngan}`,
      ten: `Quỹ tiền mặt ${c.ngan}`,
      loai: 'tm' as const,
      soDu: soDuQuy(`Quỹ tiền mặt ${c.ngan}`),
    })),
    { k: 'Vietcombank 0071 0012 34567', ten: 'Vietcombank 0071 0012 34567', loai: 'nh' as const, soDu: 144800000 },
    { k: 'Techcombank 1903 4455 6677 88', ten: 'Techcombank 1903 4455 6677 88', loai: 'nh' as const, soDu: 319850000 },
    { k: 'VPBank, chi nhánh Quận 1', ten: 'VPBank, chi nhánh Quận 1', loai: 'nh', soDu: 3320000 },
  ], [])

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
    return nhom === 'mua' ? quyTmCh : quyTm
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

  // Hoá đơn & Thông tin bổ sung phiếu mua
  const nvGoc = gocData ? ttNghiepVu(gocData) : undefined
  const [soHd, setSoHd] = useState(() => String(gocData?._soHd ?? nvGoc?.soHd ?? ''))
  const [kyHieuHd, setKyHieuHd] = useState(() => String(gocData?._kyHieuHd ?? nvGoc?.kyHieuHd ?? ''))
  const [ngayHd, setNgayHd] = useState(() => {
    if (gocData?._ngayHd) return String(gocData._ngayHd)
    if (nvGoc?.ngayHd) return String(nvGoc.ngayHd)
    return gocData?.ngay ? String(gocData.ngay) : thoiGian.slice(0, 10)
  })
  const [moLichHd, setMoLichHd] = useState(false)
  const [nhanKemHd, setNhanKemHd] = useState(() => {
    if (gocData?._nhanKemHd !== undefined) return Boolean(gocData._nhanKemHd)
    if (gocData?._soHd || nvGoc?.soHd) return true
    return false
  })

  // Địa chỉ, MST, Người giao dịch của phiếu mua
  const [diaChi, setDiaChi] = useState(() => String(gocData?._diaChi ?? DIA_CHI_NCC[gocData?.doiTuong ? String(gocData.doiTuong) : ''] ?? nvGoc?.dc ?? ''))
  const [mst, setMst] = useState(() => String(gocData?._mst ?? NCC.find(x => x.ten === gocData?.doiTuong)?.mst ?? nvGoc?.mst ?? ''))
  const [nguoiGiaoDich, setNguoiGiaoDich] = useState(() => String(gocData?._nguoiGiao ?? gocData?._nguoi ?? NGUOI_GD_NCC[gocData?.doiTuong ? String(gocData.doiTuong) : ''] ?? nvGoc?.nguoi ?? ''))
  const [hanTt, setHanTt] = useState(() => String(gocData?._hanTt ?? nvGoc?.hanTt ?? ''))

  // Tab phiếu mua
  const [tabMua, setTabMua] = useState<'phieu' | 'buttoan' | 'lichsu'>('phieu')

  // Thanh toán ngay trên phiếu mua (T600)
  const [hinhThucTt, setHinhThucTt] = useState<'congno' | 'tienmat' | 'chuyenkhoan'>(() => {
    if (gocData?._httt) return gocData._httt as 'congno' | 'tienmat' | 'chuyenkhoan'
    return 'congno'
  })
  const daTra = gocData ? soDaTra(gocData) : 0

  // Sheet Thanh toán ngay dùng chung MThanhToanNgay (T610, T630)
  const [moThanhToan, setMoThanhToan] = useState(() => sp.get('thanhtoan') === '1')



  // Sheet chọn / thêm NCC
  const [moThemNcc, setMoThemNcc] = useState(false)
  const [timNcc, setTimNcc] = useState('')
  const [dangTaiNcc, setDangTaiNcc] = useState(false)
  const [formMst, setFormMst] = useState('')
  const [formMaNcc, setFormMaNcc] = useState('')
  const [formTenNcc, setFormTenNcc] = useState('')
  const [formDiaChiNcc, setFormDiaChiNcc] = useState('')
  const [formEmailNcc, setFormEmailNcc] = useState('')
  const [formSdtNcc, setFormSdtNcc] = useState('')
  const [loiNcc, setLoiNcc] = useState('')

  // Danh sách hàng chọn mới trong sheet B8
  const [hangDaChonMoi, setHangDaChonMoi] = useState<Set<string>>(new Set())
  const [soTienTra, setSoTienTra] = useState<number>(() => {
    if (gocData?._soTienTra) return Number(gocData._soTienTra)
    return gocData?.tong ? Number(gocData.tong) : 0
  })

  // Sheet chọn quỹ trượt lên khi Thanh toán ngay
  const [moBangChonQuy, setMoBangChonQuy] = useState(false)
  const [timQuy, setTimQuy] = useState('')
  const [quyTam, setQuyTam] = useState(quy)

  // Khối Hạch toán thu gọn mặc định; gói Standard, Plus hộ kinh doanh không có khối, tab Hạch toán (QD81)
  const coHachToan = kieuGhiSoDv(s) !== 'khong'
  const [moHt, setMoHt] = useState(false)
  const [chonTk, setChonTk] = useState<{ dong: number; kieu: 'no' | 'co' } | null>(null)

  // Danh sách dòng
  const [dsDong, setDsDong] = useState<DongM[]>(() => {
    if (gocData) {
      const rows = (gocData._dong as Dong[] | undefined) ?? dongCua(cfg, `${sc.code ?? sc.slug}-${gocData.id}`)
      const rowsCoId: DongM[] = rows.map((d, i) => ({
        ...d,
        id: (d as DongM).id ?? `dong-${i}-${Math.random().toString(36).slice(2, 7)}`,
        kieuGiam: (d as DongM).kieuGiam ?? (d.ck && !d.ptCk ? 'đ' : '%'),
      }))
      if (laTien) {
        return rowsCoId.map(d => {
          if (d.tkNo && d.tkCo) return d
          const lyMacDinh = d.ly || dsLyDo[0] || (nhom === 'chi' ? 'Chi tiền' : 'Thu tiền')
          const tk = tkTheoLyDo(loai?.k ?? nhom, lyMacDinh)
          return { ...d, tkNo: d.tkNo || tk.tkNo, tkCo: d.tkCo || tk.tkCo }
        })
      }
      return rowsCoId
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
  const [dangTaiHang, setDangTaiHang] = useState(false)
  const [nhomHangChon, setNhomHangChon] = useState('Tất cả')
  const [timHang, setTimHang] = useState('')
  const [moChonNhomHang, setMoChonNhomHang] = useState(false)

  // Sheet chọn VAT
  const [moChonVatIdx, setMoChonVatIdx] = useState<number | null>(null)

  // Sheet sửa mặt hàng phiếu mua (T449)

  // Báo lỗi theo ô
  const [loiO, setLoiO] = useState<Record<string, string>>({})

  // Hộp hỏi tạo thẻ chi phí phân bổ sau lưu
  const [hoiThe, setHoiThe] = useState<{ soCt: string; idMoi: string } | null>(null)

  // Sau khi lưu
  const [daLuu, setDaLuu] = useState(false)
  const [soPhieuMoi, setSoPhieuMoi] = useState('')
  const [idPhieuMoi, setIdPhieuMoi] = useState('')
  const [soPhieuChiMoi, setSoPhieuChiMoi] = useState<string | undefined>()
  const [tongTienDaLuu, setTongTienDaLuu] = useState(0)
  const [doiTuongDaLuu, setDoiTuongDaLuu] = useState('')

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
    if (s.goi === 'S') {
      setSoTienTra(tongThanhToan)
    } else if (!soTienTra || soTienTra > tongThanhToan) {
      setSoTienTra(tongThanhToan)
    }
  }, [tongThanhToan, s.goi])

  const ttMua = gocData ? ttTienTheoTra(gocData) : (hinhThucTt !== 'congno' ? 'da' : 'chua')
  const dsNccLoc = useMemo(() => {
    const allNcc = getAllCatalogRows('1.5').filter((x: any) => x.loai === 'Nhà cung cấp' || !x.loai)
    if (!timNcc.trim()) return allNcc
    const q = fold(timNcc)
    return allNcc.filter((x: any) =>
      fold(String(x.ten ?? '')).includes(q) ||
      fold(String(x.ma ?? '')).includes(q) ||
      fold(String(x.mst ?? '')).includes(q) ||
      fold(String(x.sdt ?? '')).includes(q)
    )
  }, [timNcc])



  const dsQuyPhieuMua = (ht: 'tienmat' | 'chuyenkhoan', ch: string): string[] => {
    if (ht === 'tienmat') {
      const tim = CUA_HANG.find(c => c.ten === ch || c.ngan === ch || c.id === ch)
        ?? CUA_HANG.find(c => ch.includes(c.ngan))
      const q = tim ? `Quỹ tiền mặt ${tim.ngan}` : `Quỹ tiền mặt ${CUA_HANG[0]?.ngan ?? 'Nguyễn Trãi'}`
      return [q]
    }
    return dsQuyMau.filter(q => q.loai === 'nh').map(q => q.ten)
  }

  // Đổi hình thức thanh toán trên phiếu mua (T629, T630)
  const doiHinhThucTtMua = (ht: 'congno' | 'tienmat' | 'chuyenkhoan') => {
    setHinhThucTt(ht)
    if (dangSua) {
      if (ht !== 'congno') {
        setMoThanhToan(true)
      }
      return
    }
    if (ht === 'congno') {
      setQuy('')
      return
    }
    const ds = dsQuyPhieuMua(ht, cuaHang)
    if (ds.length === 1) {
      setQuy(ds[0] ?? '')
    } else {
      setQuy('')
    }
  }

  // Dựng nội dung phiếu mua dùng chung cho Lưu phiếu (T600, T629)
  const dungNoiDungPhieuMua = () => {
    const ngayChiTiet = thoiGian.split(' ')[0]
    return {
      ngay: ngayChiTiet,
      gio: thoiGian.split(' ')[1] || '10:00',
      thang: Number(ngayChiTiet.split('/')[1]) || 10,
      doiTuong,
      dienGiai: ghiChu || cfg.dienGiai?.[0] || 'Chứng từ mua hàng',
      tien: tongTien - tongCk,
      thue: tongThue,
      tong: tongThanhToan,
      _dong: dsDong,
      _ghiChu: ghiChu,
      _nguoiGiao: nguoiGiaoDich,
      _nguoi: nguoiGiaoDich,
      _diaChi: diaChi,
      _mst: mst,
      _kho: kho,
      _nhanKemHd: nhanKemHd,
      _soHd: nhanKemHd ? soHd : '',
      _kyHieuHd: nhanKemHd ? kyHieuHd : '',
      _ngayHd: nhanKemHd ? ngayHd : '',
      _httt: dangSua ? (gocData?._httt ?? 'congno') : hinhThucTt,
      _soTienTra: dangSua ? gocData?._soTienTra : (hinhThucTt !== 'congno' ? tongThanhToan : undefined),
      _ctTt: dangSua ? gocData?._ctTt : undefined,
      _dsTt: dangSua ? ((gocData?._dsTt as PhieuTt[] | undefined) ?? []) : [],
      _quy: dangSua ? gocData?._quy : (hinhThucTt !== 'congno' ? quy : undefined),
      ...(gocData?._hanTt || hanTt ? { _hanTt: hanTt || gocData?._hanTt } : {}),
    }
  }

  // Lập thanh toán từ sheet MThanhToanNgay sang màn lập phiếu chi điền sẵn (T610, T630)
  // Thanh toán ở màn sửa: lưu thay đổi, lập luôn phiếu chi rồi về màn xem phiếu mua (T655, thay T610)
  const handleLapPhieuChiTuMThanhToan = (tt: ThongTinTt) => {
    setMoThanhToan(false)
    if (!dangSua || !row) return
    const man = `${mod.key}/${sc.slug}`
    const idLuu = String(row.id)
    const soCtLuu = String(row.so)
    suaPhieu(man, idLuu, dungNoiDungPhieuMua())
    ghiNhatKy(man, idLuu, soCtLuu, s.ten, 'Sửa chứng từ')
    const soMoi = lapPhieuChiTraNcc(tt, {
      man,
      id: idLuu,
      so: soCtLuu,
      di: `${path}/${idLuu}`,
      dsTtCu: (gocData?._dsTt as PhieuTt[] | undefined) ?? [],
      cn: cuaHang,
      doiTuong,
      diaChi,
      nguoiGiaoDich,
      goi: s.goi,
      ai: s.ten,
    })
    toast(`Đã lập ${soMoi}, trả ${money(tt.soTien)} đ`)
    nav(`${path}/${idLuu}`, { replace: true })
  }

  // Bút toán hạch toán
  const dsButToan = useMemo(() => {
    const htttCalc = nhom === 'mua' ? hinhThucTt : 'congno'
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
  }, [cfg, dsDong, tongTien, tongCk, tongThue, doiTuong, cuaHang, s.cheDo, s.goi, nhom, hinhThucTt])

  const capButToan = useMemo(() => {
    const caps: { no: { so: string; ten: string }; co: { so: string; ten: string }; dg: string; tien: number }[] = []
    for (let i = 0; i < dsButToan.length; i += 2) {
      const no = dsButToan[i]
      const co = dsButToan[i + 1]
      if (no && co) {
        const dg = no.so.startsWith('133') ? 'Thuế GTGT mua vào' : 'Tiền mua hàng'
        caps.push({ no, co, dg, tien: no.tien })
      }
    }
    return caps
  }, [dsButToan])
  const tongNoCo = useMemo(() => capButToan.reduce((a, c) => a + c.tien, 0), [capButToan])
  const tongSl = useMemo(() => dsDong.reduce((a, d) => a + (Number(d.sl) || 0), 0), [dsDong])
  const conLaiTt = Math.max(0, tongThanhToan - daTra)

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

  const nhanBanDong = (idx: number) => {
    setDsDong(ds => {
      if (!ds[idx]) return ds
      const banSao: DongM = {
        ...ds[idx],
        id: `dong-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        moi: false,
      }
      const moi = [...ds]
      moi.splice(idx + 1, 0, banSao)
      return moi
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

  const dsQuyTmLoc = useMemo(() => {
    const list = dsQuyMau.filter(q => q.loai === 'tm' && q.ten === quyTmCh)
    const ds = list.length > 0 ? list : [{ k: quyTmCh, ten: quyTmCh, loai: 'tm' as const, soDu: soDuQuy(quyTmCh) }]
    return ds.filter(q => !timQuy.trim() || fold(q.ten).includes(fold(timQuy.trim())))
  }, [dsQuyMau, quyTmCh, timQuy])

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

  const tatCaDaChonHienThi = useMemo(() => {
    if (dsHangHienThi.length === 0) return false
    return dsHangHienThi.every(h => hangDaChonMoi.has(h.ma))
  }, [dsHangHienThi, hangDaChonMoi])

  const motPhanDaChonHienThi = useMemo(() => {
    if (dsHangHienThi.length === 0) return false
    const some = dsHangHienThi.some(h => hangDaChonMoi.has(h.ma))
    return some && !tatCaDaChonHienThi
  }, [dsHangHienThi, hangDaChonMoi, tatCaDaChonHienThi])

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
      if (hinhThucTt !== 'congno' && !quy.trim()) {
        loiMoi.quy = 'Vui lòng chọn quỹ'
      }
      if (nhanKemHd) {
        if (!soHd.trim()) loiMoi.soHd = 'Vui lòng nhập số hoá đơn'
        if (!kyHieuHd.trim()) loiMoi.kyHieuHd = 'Vui lòng nhập ký hiệu'
        if (!ngayHd.trim()) loiMoi.ngayHd = 'Vui lòng chọn ngày hoá đơn'
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

    const kieu = kieuGhiSoDv(s)
    const ttLuu = kieu === 'khong' ? 'ghi' : 'nhap'

    const man = `${mod.key}/${sc.slug}`
    const idLuu = dangSua ? String(row!.id) : `moi-${Date.now()}`
    const soCt = dangSua ? String(row!.so) : soKeTiep(man, `${cfg.prefix}2610-`)

    const noiDung = nhom === 'mua' ? dungNoiDungPhieuMua() : {
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
      _quy: quy,
      _denQuy: laCq ? denQuy : undefined,
      _kho: kho,
      _soHd: soHd,
      _kyHieuHd: kyHieuHd,
      _ngayHd: ngayHd,
      _httt: 'congno',
      _soTienTra: undefined,
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

    // Lưu phiếu mua kèm tự động tạo phiếu chi nếu thanh toán ngay (T629)
    if (nhom === 'mua' && hinhThucTt !== 'congno') {
      const MAN_THU_CHI = 'tien/2-1-1'
      const loaiChi = hinhThucTt === 'tienmat' ? 'chi' : 'unc'
      const prefixChi = loaiChi === 'chi' ? 'PC' : 'UNC'
      const soPhieuChi = soKeTiep(MAN_THU_CHI, `${prefixChi}2610-`)
      const idChi = `moi-${Date.now()}-chi`
      const tenLoaiChi = loaiChi === 'chi' ? 'Chi tiền mặt' : 'Chi ngân hàng'
      const lyDoChi = 'Thanh Toán Công Nợ Nhà Cung Cấp'
      const dienGiaiChi = `Chi tiền mua hàng theo ${soCt}`

      const phieuChiMoi: Row = {
        id: idChi,
        so: soPhieuChi,
        cn: cuaHang,
        nguon: 'tay',
        loai: loaiChi,
        tenLoai: tenLoaiChi,
        tt: ttLuu,
        ngay: ngayChiTiet,
        gio: thoiGian.split(' ')[1] || '10:00',
        thang: Number(ngayChiTiet.split('/')[1]) || 10,
        doiTuong: doiTuong,
        dienGiai: dienGiaiChi,
        tien: tongThanhToan,
        tong: tongThanhToan,
        _dong: [{
          ten: dienGiaiChi,
          sl: 1,
          gia: tongThanhToan,
          tien: tongThanhToan,
          ly: lyDoChi,
          dt: doiTuong,
          ...(s.goi !== 'S' ? {
            tkNo: '331',
            tkCo: hinhThucTt === 'tienmat' ? '1111' : '1121',
          } : {}),
        }],
        _lyDo: lyDoChi,
        _quy: quy,
        _nguoiGiao: nguoiGiaoDich,
        _diaChi: diaChi,
        _thamChieu: soCt,
        _thamChieuDi: `${path}/${idLuu}`,
      }

      // Trừ số dư quỹ (T629)
      BANG_SO_DU_QUY[quy] = soDuQuy(quy) - tongThanhToan

      // Lưu phiếu chi vào danh sách Thu chi (T629)
      themPhieu(MAN_THU_CHI, phieuChiMoi, s.ten)
      ghiNhatKy(MAN_THU_CHI, idChi, soPhieuChi, s.ten, 'Thêm mới chứng từ')

      // Gán tham chiếu hai chiều và thông tin thanh toán vào phiếu mua (T629)
      const noiDungMuaTt = {
        ...noiDung,
        _ctTt: { id: idChi, so: soPhieuChi, loai: loaiChi },
        _dsTt: [{ id: idChi, so: soPhieuChi, loai: loaiChi, tien: tongThanhToan, ngay: ngayChiTiet, quy }],
        _thamChieu: soPhieuChi,
        _thamChieuDi: `/app/tien/2-1-1/${idChi}`,
      }

      themPhieu(man, {
        id: idLuu,
        so: soCt,
        cn: cuaHang,
        nguon: 'tay',
        loai: loai?.k,
        tenLoai: loai?.ten ?? tenMan(sc),
        tt: ttLuu,
        ...noiDungMuaTt,
      }, s.ten)
      ghiNhatKy(man, idLuu, soCt, s.ten, 'Thêm mới chứng từ')
      toast(`Đã lưu ${soCt}`)

      setSoPhieuMoi(soCt)
      setIdPhieuMoi(idLuu)
      setSoPhieuChiMoi(soPhieuChi)
      setTongTienDaLuu(tongThanhToan)
      setDoiTuongDaLuu(doiTuong)
      setDaLuu(true)
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
      setSoPhieuChiMoi(undefined)
      setTongTienDaLuu(tongThanhToan)
      setDoiTuongDaLuu(doiTuong)
      setDaLuu(true)
    }
  }

  const handleLapMoi = () => {
    setDaLuu(false)
    setSoPhieuMoi('')
    setIdPhieuMoi('')
    setSoPhieuChiMoi(undefined)
    setTongTienDaLuu(0)
    setDoiTuongDaLuu('')
    setGhiChu('')
    setSoHd('')
    setKyHieuHd('')
    setNgayHd('')
    setTimHang('')
    setTimHangTrongPhieu('')
    setDoiTuong('')
    setMst('')
    setDiaChi('')
    setNguoiGiaoDich('')
    setDsDong([])
    setHinhThucTt('congno')
    setQuy('')
    setLoiO({})
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

  // ── MÀN HÌNH THÀNH CÔNG (T552, T629) ──
  if (daLuu) {
    if (nhom === 'mua') {
      const dsTomTatMua: DongTomTat[] = [
        { nhan: 'Số phiếu', giaTri: <b>{soPhieuMoi}</b> },
        { nhan: 'Số tiền', giaTri: `${money(tongTienDaLuu)} đ`, noiBat: true },
        { nhan: 'Nhà cung cấp', giaTri: doiTuongDaLuu || 'Chưa chọn' },
        ...(soPhieuChiMoi ? [{ nhan: 'Số phiếu chi', giaTri: <b>{soPhieuChiMoi}</b> }] : []),
      ]
      return (
        <MThanhCong
          tieuDe="Lưu phiếu thành công"
          dsTomTat={dsTomTatMua}
          xemUrl={`${path}/${idPhieuMoi}`}
          onLapMoi={handleLapMoi}
          onDong={() => nav(path, { replace: true })}
        />
      )
    }

    const dsTomTatChung: DongTomTat[] = [
      { nhan: 'Số phiếu', giaTri: <b>{soPhieuMoi}</b> },
      { nhan: 'Số tiền', giaTri: `${money(tongTienDaLuu || tongThanhToan)} đ`, noiBat: true },
      ...(doiTuongDaLuu || doiTuong ? [{ nhan: nhom === 'ban' ? 'Khách hàng' : 'Đối tượng', giaTri: doiTuongDaLuu || doiTuong }] : []),
    ]
    return (
      <MThanhCong
        tieuDe="Lưu phiếu thành công"
        dsTomTat={dsTomTatChung}
        xemUrl={`${path}/${idPhieuMoi}`}
        onLapMoi={handleLapMoi}
        onDong={() => nav(path, { replace: true })}
      />
    )
  }

  const lyDoHienTai = dsDong[0]?.ly || dsLyDo[0] || (nhom === 'chi' ? 'Chi tiền' : 'Thu tiền')
  const tieuDe = nhom === 'mua'
    ? (dangSua ? `Sửa phiếu ${row?.so ?? gocData?.so ?? soCtDuKien}` : 'Lập phiếu mua hàng')
    : dangSua
    ? `Sửa ${row?.so ?? ''}`.trim()
    : (nhom === 'chi' ? 'Lập phiếu chi' : nhom === 'thu' ? 'Lập phiếu thu' : nhom === 'cq' ? 'Lập phiếu chuyển quỹ' : `Lập ${tenLoai.toLowerCase()}`)

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
        {/* ════ PHIẾU MUA HÀNG (T600 / T601) ════ */}
        {nhom === 'mua' ? (
          <>
            {/* 1. Thẻ đầu tổng quan (màn sửa; tạo mới dùng thẻ T655 trong tab Phiếu nhập) */}
            {dangSua && (
            <div className="m-t600-the-dau">
                  {/* Hàng chip */}
                  <div className="m-t600-chip-hang">
                    <span className={`m-t600-chip-tt ${dangSua ? (ttMua === 'da' ? 'da' : ttMua === 'mot' ? 'mot' : 'chua') : (hinhThucTt !== 'congno' ? 'da' : 'chua')}`}>
                      {dangSua ? (ttMua === 'da' ? 'Đã thanh toán' : ttMua === 'mot' ? 'Thanh toán một phần' : 'Chưa thanh toán') : (hinhThucTt !== 'congno' ? 'Đã thanh toán' : 'Chưa thanh toán')}
                    </span>
                    <span className="m-t600-chip-nguon">
                      {gocData?.nguon === 'excel' || gocData?.nguon === 'HĐ' ? 'Excel' : 'Thủ công'}
                    </span>
                  </div>

                  {/* Tên NCC */}
                  <div className="m-t600-ncc-ten">
                    {doiTuong || 'Chưa chọn nhà cung cấp'}
                  </div>

                  {/* Dòng cửa hàng */}
                  <div className="m-t600-cua-hang-dong" onClick={() => setMoChonCn(true)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="1.8" fill="none">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span>{cuaHang || 'Chọn cửa hàng'}</span>
                  </div>

                  {/* Nhãn Tổng tiền + Số tiền 30px */}
                  <div>
                    <div className="m-t600-tong-tien-nhan">Tổng tiền</div>
                    <div className={`m-t600-tong-tien-so ${(dangSua ? ttMua === 'da' : hinhThucTt !== 'congno') ? 'xanh' : 'cam'}`}>
                      {money(tongThanhToan)} đ
                    </div>
                  </div>

                  {/* Khung xám Thanh toán (T600, T629, T630) */}
                  <div className="m-t600-khung-tt">
                    <div className="m-t601-tt-tieu">Thanh toán</div>
                    <div className="m-t600-tt-radios">
                      <label className="m-t601-radio-item" onClick={() => doiHinhThucTtMua('congno')}>
                        <span className={`m-t601-radio-ring ${hinhThucTt === 'congno' ? 'on' : ''}`}>
                          {hinhThucTt === 'congno' && <span className="m-t601-radio-dot" />}
                        </span>
                        <span>Chưa thanh toán</span>
                      </label>
                      <label className="m-t601-radio-item" onClick={() => doiHinhThucTtMua('tienmat')}>
                        <span className={`m-t601-radio-ring ${hinhThucTt === 'tienmat' ? 'on' : ''}`}>
                          {hinhThucTt === 'tienmat' && <span className="m-t601-radio-dot" />}
                        </span>
                        <span>Tiền mặt ngay</span>
                      </label>
                      <label className="m-t601-radio-item" onClick={() => doiHinhThucTtMua('chuyenkhoan')}>
                        <span className={`m-t601-radio-ring ${hinhThucTt === 'chuyenkhoan' ? 'on' : ''}`}>
                          {hinhThucTt === 'chuyenkhoan' && <span className="m-t601-radio-dot" />}
                        </span>
                        <span>Chuyển khoản ngay</span>
                      </label>
                    </div>

                    {/* Dòng ô Quỹ tiền cho phiếu mua khi thanh toán ngay (T629) */}
                    {!dangSua && hinhThucTt !== 'congno' && (
                      <div className="m-t600-o-nhap-f" style={{ marginTop: 10 }}>
                        <label className="m-t600-lbl">
                          {hinhThucTt === 'tienmat' ? 'Quỹ tiền mặt' : 'Quỹ ngân hàng'} <em>*</em>
                        </label>
                        <div
                          className="m-t600-o-chon"
                          id="m-lp-o-quy"
                          onClick={() => setMoBangChonQuy(true)}
                          style={{ cursor: 'pointer', background: '#fff' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                            <div className={`m-t600-quy-ic ${hinhThucTt === 'tienmat' ? 'tm' : 'nh'}`} style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon n={hinhThucTt === 'tienmat' ? 'dollar' : 'bank'} className="ic sm" kieu="net" />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 13.5, color: quy ? 'var(--ink)' : 'var(--muted)' }}>
                                {quy || (hinhThucTt === 'tienmat' ? 'Chọn quỹ tiền mặt' : 'Chọn quỹ ngân hàng')}
                              </div>
                              {quy && (
                                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                                  Số dư {money(soDuQuy(quy))} đ
                                </div>
                              )}
                            </div>
                          </div>
                          <span style={{ color: 'var(--muted)', fontSize: 13 }}>▾</span>
                        </div>
                        {loiO.quy && <div className="m-lp-loi-o" style={{ marginTop: 4 }}>{loiO.quy}</div>}
                      </div>
                    )}

                    {/* Dòng Đã trả và thanh tiến độ */}
                    <div className="m-t600-tt-tien-do-khu" style={{ marginTop: 8 }}>
                      <div className="m-t600-tt-tien-do-hang">
                        <span style={{ color: 'var(--muted)' }}>Đã trả</span>
                        <b style={{ color: 'var(--ink)' }}>{money(daTra)} / {money(tongThanhToan)} đ</b>
                      </div>
                      <div className="m-t600-thanh-tien-do" style={{ marginTop: 6 }}>
                        <div
                          className="m-t600-tien-do-fill"
                          style={{ width: `${tongThanhToan > 0 ? Math.min(100, Math.round((daTra / tongThanhToan) * 100)) : 0}%` }}
                        />
                      </div>
                      {s.goi !== 'S' && hanTt && (
                        <div className="m-t600-han-tt-dong" style={{ marginTop: 6 }}>
                          Hạn {hanTt}{tinhSoNgayCon(hanTt) ? ` · ${tinhSoNgayCon(hanTt)}` : ''}
                        </div>
                      )}
                    </div>

                    {/* Màn sửa: nút Thanh toán ngay dùng chung MThanhToanNgay (T630) */}
                    {dangSua && conLaiTt > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <button
                          type="button"
                          className="btn pri"
                          style={{ width: '100%', height: 38, borderRadius: 8, fontSize: 13.5, fontWeight: 600 }}
                          onClick={() => setMoThanhToan(true)}
                        >
                          Thanh toán ngay ({money(conLaiTt)} đ)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
            )}

            {/* ── TABS CHO PHIẾU MUA HÀNG (T600 B3, T609-1, T609-2; T639: chỉ hiện khi sửa) ── */}
            {dangSua && (
              <div
                className="m-t601-tabs"
                style={{
                  gridTemplateColumns: `repeat(${1 + (coHachToan ? 1 : 0) + 1}, minmax(0, 1fr))`,
                }}
              >
                <button
                  type="button"
                  className={`m-t601-tab-btn ${tabMua === 'phieu' ? 'on' : ''}`}
                  onClick={() => setTabMua('phieu')}
                >
                  Phiếu nhập
                </button>
                {coHachToan && (
                  <button
                    type="button"
                    className={`m-t601-tab-btn ${tabMua === 'buttoan' ? 'on' : ''}`}
                    onClick={() => setTabMua('buttoan')}
                  >
                    Hạch toán
                  </button>
                )}
                <button
                  type="button"
                  className={`m-t601-tab-btn ${tabMua === 'lichsu' ? 'on' : ''}`}
                  onClick={() => setTabMua('lichsu')}
                >
                  Lịch sử
                </button>
              </div>
            )}

            {tabMua === 'phieu' && (
              <>
                {dangSua ? (
                <>
                {/* 2. Khối NHÀ CUNG CẤP */}
                <div className="m-t600-nhom-tieu">NHÀ CUNG CẤP</div>
                <div className="m-t600-card-nhap">
                  <div className="m-t600-o-nhap-f">
                    <label className="m-t600-lbl">Nhà cung cấp <em>*</em></label>
                    <div
                      className="m-t600-o-chon"
                      id="m-lp-o-doiTuong"
                      onClick={() => setMoChonDt(true)}
                    >
                      <span>{doiTuong || 'Chọn nhà cung cấp'}</span>
                      <span style={{ color: 'var(--muted)', fontSize: 13 }}>▾</span>
                    </div>
                    {loiO.doiTuong && <div className="m-lp-loi-o">{loiO.doiTuong}</div>}
                  </div>

                  <div className="m-t600-o-nhap-f">
                    <label className="m-t600-lbl">Địa chỉ</label>
                    <textarea
                      className="m-t600-textarea"
                      placeholder="Địa chỉ nhà cung cấp"
                      value={diaChi}
                      onChange={e => setDiaChi(e.target.value)}
                    />
                  </div>

                  <div className="m-t600-o-nhap-f">
                    <label className="m-t600-lbl">Mã số thuế</label>
                    <input
                      type="text"
                      className="m-t600-inp"
                      placeholder="Mã số thuế"
                      value={mst}
                      onChange={e => setMst(e.target.value)}
                    />
                  </div>

                  <div className="m-t600-o-nhap-f">
                    <label className="m-t600-lbl">Người giao dịch</label>
                    <input
                      type="text"
                      className="m-t600-inp"
                      placeholder="Họ và tên người giao dịch"
                      value={nguoiGiaoDich}
                      onChange={e => setNguoiGiaoDich(e.target.value)}
                    />
                  </div>
                </div>

                {/* 3. Khối HOÁ ĐƠN & NHẬP KHO */}
                <div className="m-t600-nhom-tieu">HOÁ ĐƠN & NHẬP KHO</div>
                <div className="m-t600-card-nhap">
                  <div className="m-t600-cong-tac-hang">
                    <div className="m-t600-cong-tac-trai">
                      <span className="m-t600-cong-tac-ten">Nhận kèm hoá đơn</span>
                      <span className="m-t600-cong-tac-phu">Bật khi NCC giao hàng kèm hoá đơn GTGT</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={nhanKemHd}
                      className={`m-t601-sw ${nhanKemHd ? 'on' : ''}`}
                      onClick={() => setNhanKemHd(v => !v)}
                    >
                      <span className="m-t601-sw-dot" />
                    </button>
                  </div>

                  {nhanKemHd && (
                    <>
                      <div className="m-t600-o-nhap-f">
                        <label className="m-t600-lbl">Số hoá đơn <em>*</em></label>
                        <input
                          type="text"
                          aria-label="Số hoá đơn"
                          className="m-t600-inp"
                          placeholder="Nhập số hoá đơn"
                          inputMode="numeric"
                          value={soHd}
                          onChange={e => setSoHd(chuanSoHd(e.target.value))}
                        />
                        {loiO.soHd && <div className="m-lp-loi-o">{loiO.soHd}</div>}
                      </div>

                      <div className="m-t600-o-nhap-f">
                        <label className="m-t600-lbl">Ký hiệu <em>*</em></label>
                        <input
                          type="text"
                          aria-label="Ký hiệu hoá đơn"
                          className="m-t600-inp"
                          placeholder="Ký hiệu mẫu (vd 1C26TBB)"
                          maxLength={7}
                          value={kyHieuHd}
                          onChange={e => setKyHieuHd(chuanKyHieuHd(e.target.value))}
                        />
                        {loiO.kyHieuHd && <div className="m-lp-loi-o">{loiO.kyHieuHd}</div>}
                      </div>

                      <div className="m-t600-o-nhap-f">
                        <label className="m-t600-lbl">Ngày hoá đơn <em>*</em></label>
                        <div className="m-t600-o-chon" onClick={() => setMoLichHd(true)}>
                          <span>{ngayHd || thoiGian.slice(0, 10)}</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="5" width="18" height="16" rx="2" />
                            <path d="M3 10h18M8 3v4M16 3v4" />
                          </svg>
                        </div>
                        {loiO.ngayHd && <div className="m-lp-loi-o">{loiO.ngayHd}</div>}
                      </div>
                    </>
                  )}

                  <div className="m-t600-o-nhap-f">
                    <label className="m-t600-lbl">Ngày chứng từ <em>*</em></label>
                    <div className="m-t600-o-chon" id="m-lp-o-thoiGian" onClick={() => setMoLich(true)}>
                      <span>{thoiGian.slice(0, 10)}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M3 10h18M8 3v4M16 3v4" />
                      </svg>
                    </div>
                  </div>

                  <div className="m-t600-o-nhap-f">
                    <label className="m-t600-lbl">Số phiếu nhập</label>
                    <div className="m-t600-o-chon disabled" style={{ background: '#f5f5f5', cursor: 'not-allowed' }}>
                      <span>{gocData?.so ?? soCtDuKien}</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" aria-hidden="true">
                        <rect x="5" y="11" width="14" height="10" rx="2" />
                        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                      </svg>
                    </div>
                  </div>

                  <div className="m-t600-o-nhap-f">
                    <label className="m-t600-lbl">Kho nhập <em>*</em></label>
                    <div className="m-t600-o-chon" id="m-lp-o-kho" onClick={() => setMoChonKho(true)}>
                      <span>{kho || 'Chọn kho nhận'}</span>
                      <span style={{ color: 'var(--muted)', fontSize: 13 }}>▾</span>
                    </div>
                    {loiO.kho && <div className="m-lp-loi-o">{loiO.kho}</div>}
                  </div>

                  <div className="m-t600-o-nhap-f">
                    <label className="m-t600-lbl">Ghi chú</label>
                    <input
                      type="text"
                      className="m-t600-inp"
                      placeholder="Ghi chú chứng từ"
                      value={ghiChu}
                      onChange={e => setGhiChu(e.target.value)}
                    />
                  </div>
                </div>
                </>
                ) : (
                  /* Thẻ đầu tạo mới phiếu mua: nhãn trái, ô chọn phải, tích Đã thanh toán (T655) */
                  <div className="m-t655-the">
                    <div className="m-t655-chip-hang">
                      <span className={`m-t600-chip-tt ${hinhThucTt !== 'congno' ? 'da' : 'chua'}`}>
                        {hinhThucTt !== 'congno' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                      <span className="m-t600-chip-nguon">
                        {gocData?.nguon === 'excel' || gocData?.nguon === 'HĐ' ? 'Excel' : 'Thủ công'}
                      </span>
                      <button type="button" className="m-t655-cua-hang" onClick={() => setMoChonCn(true)}>
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        <span>{cuaHang || 'Chọn cửa hàng'}</span>
                      </button>
                    </div>
                    <div className="m-t655-ke" />

                    <div className="m-t655-hang">
                      <span className="m-t655-nhan">Nhà cung cấp <em>*</em></span>
                      <button type="button" className="m-t655-o" id="m-lp-o-doiTuong" onClick={() => setMoChonDt(true)}>
                        <span className={doiTuong ? 'chu' : 'goi'}>{doiTuong || 'Chọn nhà cung cấp'}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                      </button>
                    </div>
                    {loiO.doiTuong && <div className="m-lp-loi-o m-t655-loi">{loiO.doiTuong}</div>}

                    <div className="m-t655-hang">
                      <span className="m-t655-nhan">Kho nhập <em>*</em></span>
                      <button type="button" className="m-t655-o" id="m-lp-o-kho" onClick={() => setMoChonKho(true)}>
                        <span className={kho ? 'chu' : 'goi'}>{kho || 'Chọn kho nhận'}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                      </button>
                    </div>
                    {loiO.kho && <div className="m-lp-loi-o m-t655-loi">{loiO.kho}</div>}

                    <div className="m-t655-hang">
                      <span className="m-t655-nhan">Ngày chứng từ <em>*</em></span>
                      <button type="button" className="m-t655-o" id="m-lp-o-thoiGian" onClick={() => setMoLich(true)}>
                        <span className="chu">{thoiGian.slice(0, 10)}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                      </button>
                    </div>

                    <textarea
                      className="m-t655-ghi-chu"
                      aria-label="Ghi chú"
                      rows={1}
                      placeholder="Ghi chú"
                      value={ghiChu}
                      onChange={e => setGhiChu(e.target.value)}
                    />
                    <div className="m-t655-ke" />

                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={hinhThucTt !== 'congno'}
                      className={`m-t655-tich ${hinhThucTt !== 'congno' ? 'on' : ''}`}
                      onClick={() => doiHinhThucTtMua(hinhThucTt !== 'congno' ? 'congno' : 'tienmat')}
                    >
                      <span className="hop">
                        {hinhThucTt !== 'congno' && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
                        )}
                      </span>
                      Đã thanh toán
                    </button>

                    {hinhThucTt !== 'congno' && (
                      <>
                        <div className="m-t655-hang">
                          <span className="m-t655-nhan">Quỹ thanh toán <em>*</em></span>
                          <button type="button" className="m-t655-o" id="m-lp-o-quy" onClick={() => setMoBangChonQuy(true)}>
                            <span className={quy ? 'chu' : 'goi'}>{quy || 'Chọn quỹ'}</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                          </button>
                        </div>
                        {quy && <div className="m-t655-so-du">Số dư {money(soDuQuy(quy))} đ</div>}
                        {loiO.quy && <div className="m-lp-loi-o m-t655-loi">{loiO.quy}</div>}
                      </>
                    )}
                  </div>
                )}

                {/* 4. HÀNG HOÁ, DỊCH VỤ */}
                <div className="sec" style={{ padding: '20px 20px 8px', fontSize: 12, fontWeight: 600, letterSpacing: '.04em', color: '#6b7280', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Hàng hoá, dịch vụ</span>
                  <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: '#9ca3af' }}>{dsDong.length} dòng</span>
                </div>

                <div className="m-t601-hang-card">
                  {/* Tìm hàng hoá */}
                  <div className="m-t601-hang-tim-wrap">
                    <label className="m-t601-hang-tim-box">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
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
                    </label>
                  </div>

                  <div id="m-lp-o-hang">
                    {dsDongHienThiTrongPhieu.map(({ d, originalIdx }, index) => (
                      <TheHangMua
                        key={d.id ?? originalIdx}
                        stt={index + 1}
                        dong={d}
                        onDoiDong={patch => doiDong(originalIdx, patch)}
                        onDoiDvt={dvMoi => doiDvt(originalIdx, dvMoi)}
                        onNhanBan={() => nhanBanDong(originalIdx)}
                        onXoa={() => xoaDong(originalIdx)}
                        autoFocusSl={d.moi && index === dsDongHienThiTrongPhieu.length - 1}
                      />
                    ))}

                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #eeeeee' }}>
                      <button
                        type="button"
                        className="m-t601-btn-them-dong"
                        onClick={() => {
                          setHangDaChonMoi(new Set())
                          setMoChonHang(true)
                        }}
                      >
                        + Thêm dòng
                      </button>
                    </div>
                    {loiO.hang && <div className="m-lp-loi-o" style={{ padding: '0 16px 8px' }}>{loiO.hang}</div>}

                    {/* Khối Tổng cộng 5 dòng (B9) */}
                    <div className="m-t601-tong-khu">
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--ink)' }}>
                        Tổng cộng ({dsDong.length} dòng)
                      </div>
                      <div className="m-t601-tong-dong">
                        <span className="lb">Số lượng</span>
                        <span>{soLuong(tongSl)}</span>
                      </div>
                      <div className="m-t601-tong-dong">
                        <span className="lb">Thành tiền</span>
                        <span>{money(tongTien)}</span>
                      </div>
                      <div className="m-t601-tong-dong">
                        <span className="lb">Tiền chiết khấu</span>
                        <span>{money(tongCk)}</span>
                      </div>
                      <div className="m-t601-tong-dong">
                        <span className="lb">Tiền thuế</span>
                        <span>{money(tongThue)}</span>
                      </div>
                      <div className="m-t601-tong-dong chinh">
                        <span>Tổng tiền</span>
                        <span>{money(tongThanhToan)} đ</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Thông tin hoá đơn VAT khi tạo mới: công tắc nhận kèm hoá đơn (T655) */}
                {!dangSua && (
                  <div className="m-t655-the">
                    <div className="m-t655-vat-dau">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="m-t655-tieu">Thông tin hoá đơn VAT</div>
                        <div className="m-t655-phu">Bật khi nhà cung cấp giao kèm hoá đơn</div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={nhanKemHd}
                        aria-label="Nhận kèm hoá đơn"
                        className={`m-t601-sw ${nhanKemHd ? 'on' : ''}`}
                        onClick={() => setNhanKemHd(v => !v)}
                      >
                        <span className="m-t601-sw-dot" />
                      </button>
                    </div>
                    {nhanKemHd && (
                      <>
                        <div className="m-t655-ke" />
                        <div className="m-t655-hang">
                          <span className="m-t655-nhan">Số hoá đơn <em>*</em></span>
                          <input
                            type="text"
                            aria-label="Số hoá đơn"
                            className="m-t655-o go"
                            placeholder="Nhập số hoá đơn"
                            inputMode="numeric"
                            value={soHd}
                            onChange={e => setSoHd(chuanSoHd(e.target.value))}
                          />
                        </div>
                        {loiO.soHd && <div className="m-lp-loi-o m-t655-loi">{loiO.soHd}</div>}
                        <div className="m-t655-hang">
                          <span className="m-t655-nhan">Ký hiệu <em>*</em></span>
                          <input
                            type="text"
                            aria-label="Ký hiệu hoá đơn"
                            className="m-t655-o go"
                            placeholder="Vd 1C26TBB"
                            maxLength={7}
                            value={kyHieuHd}
                            onChange={e => setKyHieuHd(chuanKyHieuHd(e.target.value))}
                          />
                        </div>
                        {loiO.kyHieuHd && <div className="m-lp-loi-o m-t655-loi">{loiO.kyHieuHd}</div>}
                        <div className="m-t655-hang">
                          <span className="m-t655-nhan">Ngày hoá đơn <em>*</em></span>
                          <button type="button" className="m-t655-o" onClick={() => setMoLichHd(true)}>
                            <span className="chu">{ngayHd || thoiGian.slice(0, 10)}</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <rect x="3" y="5" width="18" height="16" rx="2" />
                              <path d="M3 10h18M8 3v4M16 3v4" />
                            </svg>
                          </button>
                        </div>
                        {loiO.ngayHd && <div className="m-lp-loi-o m-t655-loi">{loiO.ngayHd}</div>}
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Tab Hạch toán */}
            {tabMua === 'buttoan' && (
              <div style={{ padding: '0 4px' }}>
                <div className="m-t600-nhom-tieu" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>BÚT TOÁN</span>
                  <span style={{ color: 'var(--muted)', fontWeight: 'normal', textTransform: 'none' }}>
                    {capButToan.length} cặp · tự sinh khi lưu
                  </span>
                </div>
                {capButToan.length === 0 ? (
                  <div className="m-card" style={{ padding: 16, textAlign: 'center', color: 'var(--muted)', background: '#fff', borderRadius: 10 }}>
                    Chưa có bút toán hạch toán
                  </div>
                ) : (
                  capButToan.map((cap, i) => (
                    <div key={i} className="m-t600-bt-the">
                      <div className="m-t600-bt-hang-dau">
                        <span>{cap.dg}</span>
                        <b className="num">{money(cap.tien)} đ</b>
                      </div>
                      <div className="m-t600-bt-dong-tk">
                        <span className="m-t600-chip-no">Nợ</span>
                        <b>{cap.no.so}</b>
                        <span className="m-t600-ten-tk">{cap.no.ten}</span>
                      </div>
                      <div className="m-t600-bt-dong-tk">
                        <span className="m-t600-chip-co">Có</span>
                        <b>{cap.co.so}</b>
                        <span className="m-t600-ten-tk">{cap.co.ten}</span>
                      </div>
                    </div>
                  ))
                )}
                {capButToan.length > 0 && (
                  <div className="m-t600-tong-but-toan">
                    Tổng Nợ = Tổng Có <b className="num">{money(tongNoCo)} đ</b>
                  </div>
                )}
              </div>
            )}

            {/* Tab Lịch sử */}
            {tabMua === 'lichsu' && dangSua && (
              <MLichSu goi={s.goi} man={man} id={String(row?.id)} />
            )}
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
        {coHachToan && nhom !== 'mua' && dsButToan.length > 0 && (
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
      <div className={nhom === 'mua' ? 'm-t600-chan-day' : 'm-pb-day'}>
        <button
          type="button"
          className={nhom === 'mua' ? 'm-t600-btn-huy' : 'm-pb-btn-phu'}
          onClick={handleQuayLai}
        >
          {nhom === 'mua' ? (dangSua ? 'Huỷ thay đổi' : 'Huỷ') : 'Huỷ'}
        </button>
        <button
          type="button"
          className={nhom === 'mua' ? 'm-t600-btn-luu' : 'm-pb-btn-sua'}
          onClick={() => thucHienLuu(false)}
        >
          {nhom === 'mua' ? 'Lưu phiếu' : (dangSua ? 'Lưu thay đổi' : 'Lưu phiếu')}
        </button>
      </div>

      {/* ── BẢNG CHỌN QUỸ THANH TOÁN (THANH TOÁN NGAY TRƯỢT LÊN) ── */}
      {nhom !== 'mua' && moBangChonQuy && (
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
          setMoThemDm(nhom === 'thu' || nhom === 'nhthu' ? 'ly:thu' : 'ly:chi')
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
          if (nhom === 'mua' && hinhThucTt !== 'congno') {
            const ds = dsQuyPhieuMua(hinhThucTt, v)
            if (ds.length === 1) {
              setQuy(ds[0] ?? '')
            } else {
              setQuy('')
            }
          }
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

      {/* ── SHEET CHỌN ĐỐI TƯỢNG CHO NON-MUA ── */}
      {nhom !== 'mua' && (
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
      )}

      {/* ── B4: SHEET CHỌN NHÀ CUNG CẤP (85dvh) ── */}
      {nhom === 'mua' && moChonDt && (
        <div className="m-tam-overlay" onClick={() => setMoChonDt(false)}>
          <div className="m-tam-hop m-t600-sheet-85" onClick={e => e.stopPropagation()}>
            <div className="m-tam-dau">
              <h2 className="m-tam-tieu">Chọn nhà cung cấp</h2>
              <button type="button" className="m-tam-dong-btn" onClick={() => setMoChonDt(false)}>
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
                  value={timNcc}
                  onChange={e => setTimNcc(e.target.value)}
                />
                {timNcc && (
                  <button type="button" className="m-lp-tim-hang-x" onClick={() => setTimNcc('')}>
                    <Icon n="x" className="ic sm" kieu="net" />
                  </button>
                )}
              </div>
            </div>

            <div className="m-t601-thanh-cong-cu">
              <button
                type="button"
                className="m-t601-btn-ib"
                aria-label="Thêm nhà cung cấp mới"
                onClick={() => {
                  const allNcc = getAllCatalogRows('1.5')
                  setFormMaNcc(sinhMaKeTiep('1.5', { ten: '' }, allNcc))
                  setFormTenNcc('')
                  setFormMst('')
                  setFormDiaChiNcc('')
                  setFormEmailNcc('')
                  setFormSdtNcc('')
                  setMoThemNcc(true)
                }}
              >
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </button>
              <button
                type="button"
                className="m-t601-btn-ib"
                aria-label="Tải lại danh sách"
                onClick={() => {
                  setDangTaiNcc(true)
                  setTimeout(() => setDangTaiNcc(false), 300)
                }}
                title="Tải lại danh sách"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 12a8 8 0 1 1-2.34-5.66" />
                  <path d="M20 4v5h-5" />
                </svg>
              </button>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center' }}>
                {dsNccLoc.length} nhà cung cấp
              </span>
            </div>

            <div className="m-t600-sheet-than" style={{ padding: '8px 16px' }}>
              {dsNccLoc.map((ncc: any) => {
                const tenNcc = String(ncc.ten ?? '')
                const maNcc = String(ncc.ma ?? '')
                const mstNcc = String(ncc.mst ?? '')
                const isChon = doiTuong === tenNcc
                const vietTat = vietTatTenNcc(tenNcc)

                return (
                  <div
                    key={maNcc || tenNcc}
                    className={`m-t600-hang-ncc ${isChon ? 'on' : ''}`}
                    onClick={() => {
                      setDoiTuong(tenNcc)
                      const dc = String(ncc.diaChi ?? DIA_CHI_NCC[tenNcc] ?? '')
                      setDiaChi(dc)
                      setMst(mstNcc)
                      const ngd = String(ncc.nguoiGiaoDich ?? NGUOI_GD_NCC[tenNcc] ?? '')
                      if (ngd) setNguoiGiaoDich(ngd)
                      setMoChonDt(false)
                    }}
                  >
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'var(--tint)',
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
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--fg)' }}>{tenNcc}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        {maNcc}{mstNcc ? ` · MST ${mstNcc}` : ''}
                      </div>
                    </div>
                    {isChon && <span style={{ color: 'var(--blue)' }}><Icon n="check" className="ic sm" kieu="net" /></span>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── B4: SUB-SHEET THÊM NHÀ CUNG CẤP (chồng lên sheet Chọn NCC, thấp hơn 60px) ── */}
      {nhom === 'mua' && moThemNcc && (
        <div className="m-tam-overlay m-t609-sub-overlay" onClick={() => setMoThemNcc(false)}>
          <div className="m-tam-hop m-t609-sub-sheet" onClick={e => e.stopPropagation()}>
            <div className="m-tam-dau">
              <h2 className="m-tam-tieu">Thêm nhà cung cấp</h2>
              <button type="button" className="m-tam-dong-btn" onClick={() => setMoThemNcc(false)} aria-label="Đóng">
                <Icon n="x" className="ic sm" kieu="net" />
              </button>
            </div>

            <div className="m-t600-sheet-than" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="m-t600-o-nhap-f">
                <label className="m-t600-lbl">Mã số thuế</label>
                <input
                  type="text"
                  className="m-t600-inp"
                  value={formMst}
                  onChange={e => setFormMst(e.target.value)}
                  placeholder="Nhập mã số thuế"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
                <div className="m-t600-o-nhap-f">
                  <label className="m-t600-lbl">Mã NCC <em>*</em></label>
                  <input
                    type="text"
                    className="m-t600-inp"
                    value={formMaNcc}
                    onChange={e => setFormMaNcc(e.target.value)}
                  />
                </div>
                <div className="m-t600-o-nhap-f">
                  <label className="m-t600-lbl">Tên nhà cung cấp <em>*</em></label>
                  <input
                    type="text"
                    className="m-t600-inp"
                    value={formTenNcc}
                    onChange={e => setFormTenNcc(e.target.value)}
                    placeholder="Nhập tên"
                  />
                </div>
              </div>

              <div className="m-t600-o-nhap-f">
                <label className="m-t600-lbl">Địa chỉ</label>
                <input
                  type="text"
                  className="m-t600-inp"
                  value={formDiaChiNcc}
                  onChange={e => setFormDiaChiNcc(e.target.value)}
                  placeholder="Số nhà, đường, phường, tỉnh/thành"
                />
              </div>

              <div className="m-t600-o-nhap-f">
                <label className="m-t600-lbl">Email</label>
                <input
                  type="email"
                  className="m-t600-inp"
                  value={formEmailNcc}
                  onChange={e => setFormEmailNcc(e.target.value)}
                  placeholder="vd: ketoan@congty.vn"
                />
              </div>

              <div className="m-t600-o-nhap-f">
                <label className="m-t600-lbl">Số điện thoại</label>
                <input
                  type="tel"
                  className="m-t600-inp"
                  value={formSdtNcc}
                  onChange={e => setFormSdtNcc(e.target.value)}
                  placeholder="vd: 0903 123 456"
                />
              </div>

              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                Mã NCC tự sinh, sửa được. Thông tin khác bổ sung ở Danh mục nhà cung cấp.
              </div>
              {loiNcc && <div className="m-t601-loi">{loiNcc}</div>}
            </div>

            <div className="m-t600-sheet-day">
              <button
                type="button"
                className="m-t601-btn-foot-huy"
                onClick={() => setMoThemNcc(false)}
              >
                Huỷ
              </button>
              <button
                type="button"
                className="m-t601-btn-foot-pri"
                disabled={!formTenNcc.trim()}
                onClick={() => {
                  const allNcc = getAllCatalogRows('1.5')
                  const tenTrim = formTenNcc.trim()
                  if (!tenTrim) {
                    setLoiNcc('Vui lòng nhập tên nhà cung cấp')
                    return
                  }
                  const maFinal = formMaNcc.trim() || sinhMaKeTiep('1.5', { ten: tenTrim }, allNcc)
                  if (allNcc.some((x: any) => x.ma && x.ma.trim().toLowerCase() === maFinal.toLowerCase())) {
                    setLoiNcc(`Mã NCC ${maFinal} đã tồn tại`)
                    return
                  }
                  const mstTrim = formMst.trim()
                  if (mstTrim && allNcc.some((x: any) => x.mst && x.mst.trim().replace(/\s/g, '') === mstTrim.replace(/\s/g, ''))) {
                    setLoiNcc(`Mã số thuế ${mstTrim} đã tồn tại`)
                    return
                  }
                  const nccMoi = {
                    ma: maFinal,
                    ten: tenTrim,
                    mst: mstTrim,
                    diaChi: formDiaChiNcc.trim(),
                    email: formEmailNcc.trim(),
                    sdt: formSdtNcc.trim(),
                    loai: 'Nhà cung cấp'
                  }
                  addCatalogRow('1.5', nccMoi)
                  setDoiTuong(nccMoi.ten)
                  setDiaChi(nccMoi.diaChi)
                  setMst(nccMoi.mst)
                  setLoiNcc('')
                  if (loiO.doiTuong) setLoiO(l => { const n = { ...l }; delete n.doiTuong; return n })
                  setMoThemNcc(false)
                  setMoChonDt(false)
                }}
              >
                Lưu và chọn
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* ── B2: SHEET THANH TOÁN NGAY CHO PHIẾU MUA (T610, T630) ── */}
      {nhom === 'mua' && (
        <MThanhToanNgay
          mo={moThanhToan}
          onDong={() => setMoThanhToan(false)}
          soPhieu={dangSua ? String(row?.so ?? gocData?.so ?? '') : soCtDuKien}
          nccTen={doiTuong || 'Nhà cung cấp'}
          conNo={conLaiTt}
          cuaHang={cuaHang}
          onLapPhieuChi={handleLapPhieuChiTuMThanhToan}
        />
      )}

      {/* ── BẢNG CHỌN QUỸ ĐÈ LÊN CHO PHIẾU MUA (70dvh) (T600, T629) ── */}
      {nhom === 'mua' && moBangChonQuy && (
        <div className="m-tam-overlay" style={{ zIndex: 1200 }} onClick={() => setMoBangChonQuy(false)}>
          <div className="m-tam-hop m-t600-sheet-70" onClick={e => e.stopPropagation()}>
            <div className="m-tam-dau">
              <div>
                <h2 className="m-tam-tieu">Chọn quỹ thanh toán</h2>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                  Cửa hàng {cuaHang || 'Phố Mây Nguyễn Trãi'} · cần trả <b style={{ color: 'var(--ink)' }}>{money(tongThanhToan)} đ</b>
                </div>
              </div>
              <button type="button" className="m-tam-dong-btn" onClick={() => setMoBangChonQuy(false)} aria-label="Đóng">
                <Icon n="x" className="ic sm" kieu="net" />
              </button>
            </div>

            <div className="m-t600-sheet-than" style={{ padding: '8px 16px' }}>
              <div style={{ padding: '0 0 10px' }}>
                <div className="m-t601-o-tim">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-4-4" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Tìm quỹ…"
                    value={timQuy}
                    onChange={e => setTimQuy(e.target.value)}
                  />
                </div>
              </div>
              {/* Tích Đã thanh toán: hiện cả quỹ tiền mặt và ngân hàng, chọn quỹ nào thì đổi hình thức theo quỹ đó (T655) */}
              {([['TIỀN MẶT', dsQuyTmLoc], ['NGÂN HÀNG', dsQuyNhLoc]] as const).map(([nhanNhom, dsNhom]) => dsNhom.length > 0 && (
              <Fragment key={nhanNhom}>
              <div className="m-t601-nhom-chu" style={{ margin: '0 -16px 8px', padding: '4px 16px 6px' }}>
                {nhanNhom}
              </div>
              {dsNhom.map(q => {
                const sd = soDuQuy(q.ten)
                const khongDu = sd < tongThanhToan
                const isChon = quy === q.ten
                return (
                  <div
                    key={q.ten}
                    className={`m-t600-hang-quy ${isChon ? 'on' : ''}`}
                    onClick={() => {
                      setQuy(q.ten)
                      setHinhThucTt(q.loai === 'tm' ? 'tienmat' : 'chuyenkhoan')
                      setMoBangChonQuy(false)
                      if (loiO.quy) {
                        setLoiO(l => { const n = { ...l }; delete n.quy; return n })
                      }
                    }}
                  >
                    <span className={`m-t601-quy-ic ${q.loai}`}>
                      {q.loai === 'tm' ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#138a52" strokeWidth="1.8">
                          <rect x="2" y="6" width="20" height="13" rx="2" />
                          <circle cx="12" cy="12.5" r="2.5" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0560a6" strokeWidth="1.8">
                          <path d="M3 10l9-6 9 6M5 10v8M19 10v8M9 10v8M15 10v8M3 20h18" />
                        </svg>
                      )}
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{q.ten}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        Số dư {money(sd)} đ
                        {khongDu && <span style={{ color: 'var(--orange-d)', marginLeft: 6 }}> · không đủ trả {money(tongThanhToan)} đ</span>}
                      </div>
                    </div>
                    {isChon && <span style={{ color: 'var(--blue)' }}><Icon n="check" className="ic sm" kieu="net" /></span>}
                  </div>
                )
              })}
              </Fragment>
              ))}
            </div>

            <div className="m-t600-sheet-day">
              <button
                type="button"
                className="btn pri"
                style={{ width: '100%', height: 48, borderRadius: 10, fontSize: 15, fontWeight: 600 }}
                onClick={() => setMoBangChonQuy(false)}
              >
                Chọn quỹ này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── B8: SHEET CHỌN HÀNG HOÁ CHO PHIẾU MUA (85dvh) ── */}
      {nhom === 'mua' && moChonHang && (
        <div className="m-tam-overlay" onClick={() => setMoChonHang(false)}>
          <div className="m-tam-hop m-t600-sheet-85" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px 8px 16px' }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>Chọn hàng hoá</div>
              <button
                type="button"
                className="m-t601-btn-ib"
                onClick={() => setMoChonHang(false)}
                aria-label="Đóng"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Hàng 1: nhóm hàng + tìm kiếm */}
            <div style={{ display: 'flex', gap: 8, padding: '0 16px 8px' }}>
              <span
                style={{ flex: 'none', boxSizing: 'border-box', height: 40, border: '1px solid #e5e7eb', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', fontSize: 14, fontWeight: 500, cursor: 'pointer', background: '#fff' }}
                onClick={() => setMoChonNhomHang(true)}
                aria-label="Lọc theo nhóm hàng hoá"
              >
                <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 400 }}>Nhóm</span>
                {nhomHangChon}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1f2225" strokeWidth="2.2" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
              <label style={{ flex: 1, boxSizing: 'border-box', height: 40, border: '1.5px solid #0560a6', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', fontSize: 14, color: '#9ca3af', minWidth: 0, background: '#fff' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-4-4" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm tên, mã hàng..."
                  value={timHang}
                  onChange={e => setTimHang(e.target.value)}
                  style={{ border: 0, outline: 0, width: '100%', font: 'inherit', color: 'var(--ink)', background: 'transparent' }}
                />
              </label>
            </div>

            {/* Hàng 2: Toolbar thêm mới + reload + Chọn tất cả */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px 6px 10px', borderBottom: '1px solid #eeeeee' }}>
              <button
                type="button"
                className="m-t601-btn-ib"
                aria-label="Thêm hàng hoá mới"
                onClick={() => {
                  setMoChonHang(false)
                  setMoThemDm('hang')
                }}
              >
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0560a6" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </button>
              <button
                type="button"
                className="m-t601-btn-ib"
                aria-label="Tải lại danh sách"
                onClick={() => {
                  setDangTaiHang(true)
                  setTimeout(() => setDangTaiHang(false), 300)
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0560a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 12a8 8 0 1 1-2.34-5.66" />
                  <path d="M20 4v5h-5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tatCaDaChonHienThi) {
                    setHangDaChonMoi(new Set())
                  } else {
                    setHangDaChonMoi(new Set(dsHangHienThi.map(h => h.ma)))
                  }
                }}
                aria-pressed={tatCaDaChonHienThi}
                style={{ marginLeft: 'auto', border: 0, background: 'none', padding: '6px 0', display: 'flex', alignItems: 'center', gap: 10, font: "500 13px 'Be Vietnam Pro',sans-serif", color: '#363636', cursor: 'pointer' }}
              >
                <span>Chọn tất cả <span style={{ color: '#9ca3af' }}>({dsHangHienThi.length})</span></span>
                <span className={`m-t601-cb ${tatCaDaChonHienThi || motPhanDaChonHienThi ? 'on' : ''}`}>
                  {tatCaDaChonHienThi && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  )}
                  {motPhanDaChonHienThi && <span style={{ width: 10, height: 2.5, borderRadius: 2, background: '#fff' }} />}
                </span>
              </button>
            </div>

            {/* Danh sách hàng */}
            <div className="m-t600-sheet-than" style={{ padding: '0' }}>
              {dangTaiHang ? (
                <div className="m-tc-dt-dang-tai">Đang tải dữ liệu...</div>
              ) : (
                dsHangHienThi.map(h => {
                  const daChonMoi = hangDaChonMoi.has(h.ma)
                  const daCoTrongPhieu = dsDong.some(d => d.ma === h.ma)

                  return (
                    <button
                      key={h.ma}
                      type="button"
                      onClick={() => {
                        setHangDaChonMoi(prev => {
                          const next = new Set(prev)
                          if (next.has(h.ma)) next.delete(h.ma)
                          else next.add(h.ma)
                          return next
                        })
                      }}
                      aria-pressed={daChonMoi}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '12px 14px',
                        border: 0,
                        borderBottom: '1px solid #eeeeee',
                        background: daChonMoi ? '#f2f7fc' : '#fff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontFamily: 'inherit'
                      }}
                    >
                      <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#1f2225' }}>{h.ten}</span>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>
                          Mã: {h.ma} · {h.dvt} · {money(h.gia)} đ
                          {daCoTrongPhieu && (
                            <span style={{ color: '#a86a0c' }}> · đã có trong phiếu</span>
                          )}
                        </span>
                      </span>
                      <span className={`m-t601-cb ${daChonMoi ? 'on' : ''}`}>
                        {daChonMoi && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12l5 5 9-10" />
                          </svg>
                        )}
                      </span>
                    </button>
                  )
                })
              )}
            </div>

            {/* Chân ghim đáy */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px 20px', borderTop: '1px solid #e5e7eb', background: '#fff' }}>
              <span style={{ fontSize: 14, color: '#6b7280', flex: 'none' }}>
                Đã chọn: <b style={{ color: '#1f2225' }}>{hangDaChonMoi.size}</b>
              </span>
              <button
                type="button"
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 10,
                  background: '#0560a6',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 600,
                  border: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => {
                  if (hangDaChonMoi.size > 0) {
                    const itemsThem = danhMucHang.filter(h => hangDaChonMoi.has(h.ma))
                    const cacDongMoi: DongM[] = itemsThem.map(h => {
                      const gia = h.gia || 0
                      const sl = 1
                      const tien = sl * gia
                      const ts = cfg.thue === 0 ? 0 : (h.ts ?? 0)
                      const thue = Math.round(tien * ts / 100)
                      return {
                        id: `dong-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                        moi: true,
                        ma: h.ma,
                        ten: h.ten,
                        dvt: h.dvt,
                        sl,
                        gia,
                        tien,
                        ts,
                        thue,
                        ck: 0,
                        ptCk: 0,
                        ghiChu: '',
                        kieuGiam: '%',
                      }
                    })
                    const firstNewId = cacDongMoi[0]?.id
                    setDsDong(ds => [...ds, ...cacDongMoi])
                    setHangDaChonMoi(new Set())
                    setMoChonHang(false)
                    setTimeout(() => {
                      if (firstNewId) {
                        const el = document.getElementById(`m-hang-${firstNewId}`)
                        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        const inp = el?.querySelector<HTMLInputElement>('input.m-t601-box')
                        inp?.focus()
                        inp?.select()
                      }
                    }, 150)
                  } else {
                    setMoChonHang(false)
                  }
                }}
              >
                {hangDaChonMoi.size > 0 ? `Thêm ${hangDaChonMoi.size} dòng` : 'Xong'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SHEET CHỌN HÀNG HOÁ CHO NON-MUA ── */}
      {nhom !== 'mua' && moChonHang && (
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

            <MThanhThem
              nhan="Thêm hàng hoá"
              onThem={() => {
                setMoChonHang(false)
                setMoThemDm('hang')
              }}
              onTaiLai={() => {
                setDangTaiHang(true)
                setTimeout(() => setDangTaiHang(false), 600)
              }}
            />

            <div className="m-lp-than m-lp-ds-hang" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
              {dangTaiHang ? <div className="m-tc-dt-dang-tai">Đang tải dữ liệu</div> : dsHangHienThi.map(h => {
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

      {/* ── SHEET CHỌN NHÓM HÀNG (T609-5) ── */}
      <div className="m-t609-wrap-sheet-con">
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
      </div>



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

    </div>
  )
}
