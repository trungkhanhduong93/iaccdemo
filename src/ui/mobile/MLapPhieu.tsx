import { useMemo, useState, type FC } from 'react'
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
import { QUY_TIEN } from '../generic/ChungTuForm'
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
          <button type="button" className="btn pri" onClick={() => nav(path)}>
            Về danh sách
          </button>
        </div>
      </div>
    )
  }

  return <ThanLapPhieu key={id ?? 'moi'} sc={sc} mod={mod} id={id} row={row} />
}

// ── Thẻ mặt hàng phiếu điện thoại (T300) ──
type DongM = Dong & { giaGoc?: number; dvtChinh?: string }

interface TheHangMoiProps {
  idx: number
  d: DongM
  laMuaHang: boolean
  laKhoKhac: boolean
  anThue: boolean
  goi: Goi
  onDoi: (patch: Partial<DongM>) => void
  onNhanBan: () => void
  onXoa: () => void
  onMoChonDvt: () => void
  onSuaTong: (tong: number) => void
  onSuaTienGiam: (ck: number) => void
  onSuaTienThue: (thue: number) => void
}

const TheHangMoi: FC<TheHangMoiProps> = ({
  idx,
  d,
  laMuaHang,
  anThue,
  goi,
  onDoi,
  onNhanBan,
  onXoa,
  onMoChonDvt,
  onSuaTong,
  onSuaTienGiam,
  onSuaTienThue,
}) => {
  const [kieuGiam, setKieuGiam] = useState<'%' | 'đ'>('%')
  const [dangSuaTong, setDangSuaTong] = useState(false)
  const [strSuaTong, setStrSuaTong] = useState('')
  const [dangSuaCk, setDangSuaCk] = useState(false)
  const [strSuaCk, setStrSuaCk] = useState('')
  const [dangSuaThue, setDangSuaThue] = useState(false)
  const [strSuaThue, setStrSuaThue] = useState('')

  const [focusSl, setFocusSl] = useState(false)
  const [strSl, setStrSl] = useState('')
  const [focusGia, setFocusGia] = useState(false)
  const [strGia, setStrGia] = useState('')
  const [focusGiam, setFocusGiam] = useState(false)
  const [strGiam, setStrGiam] = useState('')

  const dvtChinh = d.dvtChinh || HANG.find(h => h.ma === d.ma || h.ten === d.ten)?.dvt || NVL.find(n => n.ma === d.ma || n.ten === d.ten)?.dvt || d.dvt
  const dsQd = useMemo(() => quyDoiTuDanhMuc(d.ten, dvtChinh), [d.ten, dvtChinh])
  const coQuyDoi = !anNgoaiGoi(goi) && dsQd.length > 0
  const tongDong = (Number(d.tien) || 0) - (Number(d.ck) || 0) + (Number(d.thue) || 0)

  return (
    <div className="m-th-the">
      {/* Dòng đầu: Tên hàng, mã, nút nhân bản, nút xoá */}
      <div className="m-th-dau">
        <div className="m-th-ten-hang">
          <b>{idx + 1}. {d.ten}</b>
          {d.ma && <span className="m-th-ma"> -{d.ma}</span>}
        </div>
        <div className="m-th-nut-nhom">
          <button
            type="button"
            className="m-th-btn-nhan-ban"
            onClick={onNhanBan}
            title="Nhân bản dòng"
            aria-label="Nhân bản dòng"
          >
            <Icon n="copy" className="ic sm" kieu="net" />
          </button>
          <button
            type="button"
            className="m-th-btn-xoa"
            onClick={onXoa}
            title="Xoá dòng"
            aria-label="Xoá dòng"
          >
            <Icon n="x" className="ic sm" kieu="net" />
          </button>
        </div>
      </div>

      {/* Dòng 1: Số lượng */}
      <div className="m-th-hang">
        <span className="m-th-nhan">Số lượng:</span>
        <div className="m-th-o-nhap">
          <input
            type="text"
            className="m-th-inp num"
            inputMode="decimal"
            value={focusSl ? strSl : (d.sl ?? 1)}
            onFocus={() => {
              setFocusSl(true)
              setStrSl(String(d.sl ?? 1))
            }}
            onChange={e => {
              const str = goSoVN(e.target.value, true)
              setStrSl(str)
              const v = docSoVN(str)
              onDoi({ sl: v })
            }}
            onBlur={() => setFocusSl(false)}
          />
          {coQuyDoi ? (
            <button
              type="button"
              className="m-th-btn-dvt"
              onClick={onMoChonDvt}
              title="Đổi đơn vị tính"
            >
              <span>{d.dvt || 'Cái'}</span>
              <Icon n="chevd" className="ic sm" kieu="net" />
            </button>
          ) : (
            <span className="m-th-don-vi">{d.dvt || 'Cái'}</span>
          )}
        </div>
      </div>

      {/* Dòng 2: Đơn giá */}
      <div className="m-th-hang">
        <span className="m-th-nhan">Đơn giá:</span>
        <div className="m-th-o-nhap">
          <input
            type="text"
            className="m-th-inp num"
            inputMode="numeric"
            value={focusGia ? strGia : money(d.gia || 0)}
            onFocus={() => {
              setFocusGia(true)
              setStrGia(money(d.gia || 0))
            }}
            onChange={e => {
              const str = goSoVN(e.target.value, false)
              setStrGia(str)
              const v = docSoVN(str)
              onDoi({ gia: v, giaGoc: v })
            }}
            onBlur={() => setFocusGia(false)}
          />
          <span className="m-th-don-vi">đ</span>
        </div>
      </div>

      {/* Dòng 3: Giảm giá (chỉ hiện ở Mua hàng) */}
      {laMuaHang && (
        <div className="m-th-hang">
          <span className="m-th-nhan">Giảm giá:</span>
          <div className="m-th-o-nhap">
            {kieuGiam === '%' ? (
              <input
                type="text"
                className="m-th-inp num"
                inputMode="decimal"
                value={focusGiam ? strGiam : (d.ptCk ?? 0)}
                onFocus={() => {
                  setFocusGiam(true)
                  setStrGiam(String(d.ptCk ?? 0))
                }}
                onChange={e => {
                  const valStr = e.target.value.replace(/[^\d.]/g, '')
                  setStrGiam(valStr)
                  const v = Number(valStr) || 0
                  const ck = Math.round((Number(d.tien) || 0) * v / 100)
                  onDoi({ ptCk: v, ck })
                }}
                onBlur={() => setFocusGiam(false)}
              />
            ) : (
              <input
                type="text"
                className="m-th-inp num"
                inputMode="numeric"
                value={focusGiam ? strGiam : money(d.ck || 0)}
                onFocus={() => {
                  setFocusGiam(true)
                  setStrGiam(money(d.ck || 0))
                }}
                onChange={e => {
                  const str = goSoVN(e.target.value, false)
                  setStrGiam(str)
                  const v = docSoVN(str)
                  const tien = Number(d.tien) || 0
                  const pt = tien > 0 ? Number((v / tien * 100).toFixed(2)) : 0
                  onDoi({ ck: v, ptCk: pt })
                }}
                onBlur={() => setFocusGiam(false)}
              />
            )}
            <button
              type="button"
              className="m-th-btn-loai-giam"
              onClick={() => setKieuGiam(k => (k === '%' ? 'đ' : '%'))}
              title="Đổi kiểu giảm giá (% hoặc đ)"
            >
              <span>{kieuGiam}</span>
              <Icon n="chevd" className="ic sm" kieu="net" />
            </button>
          </div>
        </div>
      )}

      {/* Dòng 4: Tiền giảm giá (chỉ hiện ở Mua hàng) */}
      {laMuaHang && (
        <div className="m-th-hang">
          <span className="m-th-nhan">Tiền giảm giá:</span>
          <div className="m-th-o-nhap khong-khung">
            {dangSuaCk ? (
              <div className="m-th-o-nhap" style={{ flex: 1, maxWidth: '100%' }}>
                <input
                  autoFocus
                  type="text"
                  className="m-th-inp num"
                  inputMode="numeric"
                  value={strSuaCk}
                  onChange={e => {
                    const str = goSoVN(e.target.value, false)
                    setStrSuaCk(str)
                    onSuaTienGiam(docSoVN(str))
                  }}
                  onBlur={() => setDangSuaCk(false)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') setDangSuaCk(false)
                  }}
                />
                <span className="m-th-don-vi">đ</span>
              </div>
            ) : (
              <>
                <span className="m-th-so-tien">{money(d.ck || 0)} đ</span>
                <button
                  type="button"
                  className="m-th-btn-but-chi"
                  onClick={() => {
                    setDangSuaCk(true)
                    setStrSuaCk(money(d.ck || 0))
                  }}
                  title="Sửa số tiền giảm"
                  aria-label="Sửa số tiền giảm"
                >
                  <Icon n="edit" className="ic sm" kieu="net" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Dòng 5: VAT (chỉ hiện ở Mua hàng và khi không ẩn thuế) */}
      {laMuaHang && !anThue && (
        <div className="m-th-hang">
          <span className="m-th-nhan">VAT:</span>
          <div className="m-th-vat-wrap">
            <div className="m-th-vat-pt-hop">
              <input
                type="text"
                className="m-th-vat-pt-inp num"
                inputMode="numeric"
                value={d.ts ?? 0}
                onChange={e => {
                  const ts = Number(e.target.value.replace(/\D/g, '')) || 0
                  const tien = Number(d.tien) || 0
                  const ck = Number(d.ck) || 0
                  const thue = Math.round((tien - ck) * ts / 100)
                  onDoi({ ts, thue })
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--muted)', marginRight: 2 }}>%</span>
            </div>
            <div className="m-th-vat-tien-hop">
              {dangSuaThue ? (
                <div className="m-th-o-nhap" style={{ flex: 1, maxWidth: '100%' }}>
                  <input
                    autoFocus
                    type="text"
                    className="m-th-inp num"
                    inputMode="numeric"
                    value={strSuaThue}
                    onChange={e => {
                      const str = goSoVN(e.target.value, false)
                      setStrSuaThue(str)
                      onSuaTienThue(docSoVN(str))
                    }}
                    onBlur={() => setDangSuaThue(false)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') setDangSuaThue(false)
                    }}
                  />
                  <span className="m-th-don-vi">đ</span>
                </div>
              ) : (
                <>
                  <span className="m-th-so-tien">{money(d.thue || 0)} đ</span>
                  <button
                    type="button"
                    className="m-th-btn-but-chi"
                    onClick={() => {
                      setDangSuaThue(true)
                      setStrSuaThue(money(d.thue || 0))
                    }}
                    title="Sửa tiền thuế"
                    aria-label="Sửa tiền thuế"
                  >
                    <Icon n="edit" className="ic sm" kieu="net" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dòng 6: Tổng tiền */}
      <div className="m-th-hang">
        <span className="m-th-nhan dam">Tổng tiền:</span>
        <div className="m-th-o-nhap khong-khung">
          {dangSuaTong ? (
            <div className="m-th-o-nhap" style={{ flex: 1, maxWidth: '100%' }}>
              <input
                autoFocus
                type="text"
                className="m-th-inp num"
                inputMode="numeric"
                value={strSuaTong}
                onChange={e => {
                  const str = goSoVN(e.target.value, false)
                  setStrSuaTong(str)
                  onSuaTong(docSoVN(str))
                }}
                onBlur={() => setDangSuaTong(false)}
                onKeyDown={e => {
                  if (e.key === 'Enter') setDangSuaTong(false)
                }}
              />
              <span className="m-th-don-vi">đ</span>
            </div>
          ) : (
            <>
              <span className="m-th-so-tien dam cam">{money(tongDong)} đ</span>
              <button
                type="button"
                className="m-th-btn-but-chi"
                onClick={() => {
                  setDangSuaTong(true)
                  setStrSuaTong(money(tongDong))
                }}
                title="Sửa tổng tiền"
                aria-label="Sửa tổng tiền"
              >
                <Icon n="edit" className="ic sm" kieu="net" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cuối thẻ: Ô ghi chú nhiều dòng */}
      <textarea
        className="m-th-ghi-chu"
        placeholder="Nhập ghi chú nếu có"
        value={d.ghiChu || ''}
        onChange={e => onDoi({ ghiChu: e.target.value })}
        rows={2}
      />
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
  const [cuaHang, setCuaHang] = useState(() => (gocData?.cn ? String(gocData.cn) : cnChon?.ten ?? 'Phố Mây Lê Lợi'))
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

  // Nhãn kho
  const nhanKho = (nhom === 'mua' || nhom === 'nhap' || cfg.prefix === 'TL' || loai?.k === 'ndc')
    ? 'Kho nhập'
    : (nhom === 'ban' || nhom === 'xuat' || cfg.prefix === 'TLN' || loai?.k === 'xdc')
    ? 'Kho xuất'
    : 'Kho'

  // Quỹ
  const quyTm = `Quỹ tiền mặt ${CUA_HANG.find(c => c.ten === cuaHang)?.ngan ?? CUA_HANG[0].ngan}`
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
    return dsKho[0] ?? 'Kho tổng'
  })

  // Đối tượng
  const [doiTuong, setDoiTuong] = useState(() => {
    if (gocData?.doiTuong) return String(gocData.doiTuong)
    return dsDoiTuong[0] ?? ''
  })

  // Quỹ
  const [quy, setQuy] = useState(() => {
    if (gocData?._quy) return String(gocData._quy)
    return dsQuy[0] ?? quyTm
  })

  // Quỹ nhận (Chuyển quỹ)
  const [denQuy, setDenQuy] = useState(() => {
    if (gocData?._denQuy) return String(gocData._denQuy)
    const khac = QUY_TIEN.find(q => q !== (gocData?._quy ?? dsQuy[0]))
    return khac ?? QUY_TIEN[1] ?? ''
  })

  // Ghi chú
  const [ghiChu, setGhiChu] = useState(() => {
    return String(gocData?._ghiChu ?? gocData?.dienGiai ?? cfg.dienGiai?.[0] ?? '')
  })

  // Hoá đơn
  const [soHd, setSoHd] = useState(() => String(gocData?._soHd ?? ''))
  const [kyHieuHd, setKyHieuHd] = useState(() => String(gocData?._kyHieuHd ?? ''))

  // Hình thức thanh toán (phiếu bán hàng, mua hàng)
  const [httt, setHttt] = useState<'congno' | 'tienmat' | 'chuyenkhoan'>(() => {
    return (gocData?._httt as 'congno' | 'tienmat' | 'chuyenkhoan') ?? 'congno'
  })

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

  // Sheets chọn
  const [moChonLyDo, setMoChonLyDo] = useState(false)
  const [moChonCn, setMoChonCn] = useState(false)
  const [moChonQuy, setMoChonQuy] = useState(false)
  const [moChonDenQuy, setMoChonDenQuy] = useState(false)
  const [moChonDt, setMoChonDt] = useState(false)
  const [moChonKho, setMoChonKho] = useState(false)
  const [moChonHttt, setMoChonHttt] = useState(false)

  // Sheet chọn hàng hoá
  const [moChonHang, setMoChonHang] = useState(false)
  const [nhomHangChon, setNhomHangChon] = useState('Tất cả')
  const [timHang, setTimHang] = useState('')
  const [moChonNhomHang, setMoChonNhomHang] = useState(false)

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
  const tongThanhToan = useMemo(() => tongTien - tongCk + tongThue, [tongTien, tongCk, tongThue])

  // Bút toán hạch toán
  const dsButToan = useMemo(() => {
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
      httt,
    )
  }, [cfg, dsDong, tongTien, tongCk, tongThue, doiTuong, cuaHang, s.cheDo, s.goi, nhom, httt])

  // Cập nhật dòng (T300)
  const [dvtSheet, setDvtSheet] = useState<{ idx: number; ten: string; ds: { k: string; ten: string }[] } | null>(null)

  const doiDong = (idx: number, patch: Partial<DongM>) => {
    setDsDong(ds => ds.map((d, i) => {
      if (i !== idx) return d
      const hopNhat = { ...d, ...patch }
      const sl = hopNhat.sl !== undefined ? Number(hopNhat.sl) : 0
      const gia = hopNhat.gia !== undefined ? Number(hopNhat.gia) : 0
      const tien = patch.tien !== undefined ? Number(patch.tien) : Math.round(sl * gia)
      const ptCk = hopNhat.ptCk !== undefined ? Number(hopNhat.ptCk) : 0
      const ck = patch.ck !== undefined ? Number(patch.ck) : Math.round(tien * ptCk / 100)
      const ts = hopNhat.ts !== undefined ? Number(hopNhat.ts) : 0
      const thue = patch.thue !== undefined ? Number(patch.thue) : Math.round((tien - ck) * ts / 100)
      return { ...hopNhat, sl, gia, tien, ptCk, ck, ts, thue }
    }))
  }

  const xoaDong = (idx: number) => {
    setDsDong(ds => ds.filter((_, i) => i !== idx))
  }

  // Nhân bản dòng (T300)
  const nhanBanDong = (idx: number) => {
    setDsDong(ds => {
      const banSao = { ...ds[idx] }
      const moi = [...ds]
      moi.splice(idx + 1, 0, banSao)
      return moi
    })
  }

  // Đổi đơn vị tính theo quy đổi (T300)
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
        // Tính lại đơn giá theo hệ số quy đổi (T300). Luôn tính từ đơn giá theo ĐVT chính
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

  // Sửa tổng tiền tính ngược lại đơn giá (T300)
  const suaTongTien = (idx: number, tongMoi: number) => {
    const d = dsDong[idx]
    if (!d) return
    const sl = Number(d.sl) || 1
    const pt = (Number(d.ptCk) || 0) / 100
    const vat = (Number(d.ts) || 0) / 100
    const heSo = (1 - pt) * (1 + vat)
    const tienMoi = heSo > 0 ? Math.round(tongMoi / heSo) : tongMoi
    const giaMoi = Math.round(tienMoi / sl)
    const tien = Math.round(sl * giaMoi)
    const ck = Math.round(tien * pt)
    const thue = Math.round((tien - ck) * vat)
    doiDong(idx, { gia: giaMoi, tien, ck, thue, giaGoc: giaMoi })
  }

  // Sửa tiền giảm tính ngược lại % giảm (T300)
  const suaTienGiam = (idx: number, ckMoi: number) => {
    const d = dsDong[idx]
    if (!d) return
    const tien = Number(d.tien) || 0
    const ptMoi = tien > 0 ? Number((ckMoi / tien * 100).toFixed(2)) : 0
    const ts = Number(d.ts) || 0
    const thue = Math.round((tien - ckMoi) * ts / 100)
    doiDong(idx, { ck: ckMoi, ptCk: ptMoi, thue })
  }

  // Sửa tiền thuế (T300)
  const suaTienThue = (idx: number, thueMoi: number) => {
    doiDong(idx, { thue: thueMoi })
  }

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
      setDsDong(ds => [
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
      ])
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

  // Thực hiện lưu chứng từ một màn
  const thucHienLuu = (moMoi = false) => {
    const loiMoi: Record<string, string> = {}

    if (laTien) {
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
      // chỉ bắt buộc đối tượng khi lý do là thu nợ, đi vay, chi công nợ, cho vay (T330)
      if (!laCq && cfg.doiTuong !== 'none' && canDt && !doiTuong.trim()) {
        loiMoi.doiTuong = `Vui lòng chọn ${nhanDoiTuong.toLowerCase()}`
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
      _quy: quy,
      _denQuy: laCq ? denQuy : undefined,
      _kho: kho,
      _soHd: soHd,
      _kyHieuHd: kyHieuHd,
      _httt: httt,
    }

    if (dangSua) {
      suaPhieu(man, String(row!.id), noiDung)
      ghiNhatKy(man, String(row!.id), soCt, s.ten, 'Sửa chứng từ')
      toast(`Đã lưu thay đổi ${soCt}`)
      nav(`${path}/${row!.id}`)
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

    // Phiếu chi có lý do Chi phí chờ phân bổ: hỏi tạo thẻ chi phí phân bổ (Mục 4 spec)
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
      <div className="m-lp">
        <div className="m-lp-buoc m-lp-buoc-thanh-cong">
          <div className="m-lp-dau-thanh-cong">
            <button type="button" className="m-lp-btn-home" onClick={() => nav(path)} aria-label="Về trang danh sách">
              <Icon n="home" className="ic sm" kieu="net" />
            </button>
          </div>

          <div className="m-lp-thanh-cong-than">
            <div className="m-lp-thanh-cong-vong">
              <Icon n="check" className="ic lg m-lp-thanh-cong-tich" kieu="net" />
            </div>
            <h2 className="m-lp-thanh-cong-tieu">Tạo chứng từ thành công</h2>
            <p className="m-lp-thanh-cong-mota">
              Bạn vừa tạo thành công phiếu {tenLoai} <b>{soPhieuMoi}</b>. Bấm Xem phiếu để kiểm tra chi tiết hoặc bấm Đóng để quay lại danh sách phiếu.
            </p>

            <div className="m-lp-thanh-cong-nut-hang">
              <button type="button" className="m-lp-btn-dong" onClick={() => nav(path)}>
                Đóng
              </button>
              <button
                type="button"
                className="m-lp-btn-xem"
                onClick={() => nav(`${path}/${idPhieuMoi}`)}
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
  const tenThuong = tenLoai.toLowerCase().startsWith('phiếu ') ? tenLoai.slice(6).toLowerCase() : tenLoai.toLowerCase()
  const tieuDe = dangSua ? `${tenLoai} ${row?.so ?? ''}`.trim() : `Phiếu ${tenThuong} mới`

  return (
    <div className="m-lp m-lp-mot-man">
      {/* ── THANH ĐẦU ── */}
      <div className="m-lp-dau">
        <button type="button" className="m-nut-back" onClick={handleQuayLai} aria-label="Quay lại" title="Quay lại">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" vectorEffect="non-scaling-stroke" />
          </svg>
        </button>
        <h2 className="m-lp-tieu-de">{tieuDe}</h2>
        <div className="m-lp-dau-phu" />
      </div>

      <div className="m-lp-than m-lp-than-cuon">
        {/* ════ PHIẾU TIỀN ════ */}
        {laTien ? (
          <>
            {/* Nhóm 1: Ô số tiền lớn có nhãn VND */}
            <div className="m-the-trang m-lp-nhom-tien" id="m-lp-o-tien">
              <div className="m-lp-tien-hang">
                <div className="m-lp-vnd-badge">VND</div>
                <div className="m-lp-tien-nd">
                  <span className="m-lp-tien-nhan">Số tiền <b className="m-lp-sao">*</b></span>
                  <input
                    type="text"
                    className="m-lp-tien-inp m-lp-sua-inp num"
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
                </div>
              </div>
              {loiO.tien && <div className="m-lp-loi-o">{loiO.tien}</div>}
            </div>

            {/* Nhóm 2: Lý do, Cửa hàng, Quỹ / TK, Đối tượng */}
            <div className="m-the-trang m-lp-nhom-dong">
              {/* Lý do (nghiệp vụ) */}
              <div
                className="m-lp-dong-o"
                id="m-lp-o-lyDo"
                onClick={() => setMoChonLyDo(true)}
              >
                <div className="m-lp-dong-trai">
                  <Icon n="receipt" className="ic sm m-lp-dong-ic" kieu="net" />
                  <div className="m-lp-dong-nd">
                    <span className="m-lp-dong-nhan">Nghiệp vụ</span>
                    <span className="m-lp-dong-tri">{lyDoHienTai}</span>
                  </div>
                </div>
                <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" kieu="net" />
              </div>

              {/* Cửa hàng (Cửa hàng) */}
              <div
                className="m-lp-dong-o"
                id="m-lp-o-cuaHang"
                onClick={() => setMoChonCn(true)}
              >
                <div className="m-lp-dong-trai">
                  <Icon n="cuahang" className="ic sm m-lp-dong-ic" kieu="net" />
                  <div className="m-lp-dong-nd">
                    <span className="m-lp-dong-nhan">Cửa hàng</span>
                    <span className="m-lp-dong-tri">{cuaHang}</span>
                  </div>
                </div>
                <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" kieu="net" />
              </div>

              {/* Quỹ / Tài khoản */}
              <div
                className="m-lp-dong-o"
                id="m-lp-o-quy"
                onClick={() => setMoChonQuy(true)}
              >
                <div className="m-lp-dong-trai">
                  <Icon n="wallet" className="ic sm m-lp-dong-ic" kieu="net" />
                  <div className="m-lp-dong-nd">
                    <span className="m-lp-dong-nhan">{laCq ? 'Từ quỹ' : 'Chọn quỹ'} <b className="m-lp-sao">*</b></span>
                    <span className={`m-lp-dong-tri ${!quy ? 'mo' : ''}`}>{quy || 'Chọn quỹ'}</span>
                  </div>
                </div>
                <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" kieu="net" />
              </div>
              {loiO.quy && <div className="m-lp-loi-o">{loiO.quy}</div>}

              {/* Đến quỹ (chuyển quỹ) */}
              {laCq && (
                <>
                  <div
                    className="m-lp-dong-o"
                    id="m-lp-o-denQuy"
                    onClick={() => setMoChonDenQuy(true)}
                  >
                    <div className="m-lp-dong-trai">
                      <Icon n="wallet" className="ic sm m-lp-dong-ic" kieu="net" />
                      <div className="m-lp-dong-nd">
                        <span className="m-lp-dong-nhan">Đến quỹ <b className="m-lp-sao">*</b></span>
                        <span className={`m-lp-dong-tri ${!denQuy ? 'mo' : ''}`}>{denQuy || 'Chọn quỹ nhận'}</span>
                      </div>
                    </div>
                    <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" kieu="net" />
                  </div>
                  {loiO.denQuy && <div className="m-lp-loi-o">{loiO.denQuy}</div>}
                </>
              )}

              {/* Đối tượng */}
              {!laCq && cfg.doiTuong !== 'none' && (
                <>
                  <div
                    className="m-lp-dong-o"
                    id="m-lp-o-doiTuong"
                    onClick={() => setMoChonDt(true)}
                  >
                    <div className="m-lp-dong-trai">
                      <Icon n="user" className="ic sm m-lp-dong-ic" kieu="net" />
                      <div className="m-lp-dong-nd">
                        <span className="m-lp-dong-nhan">{nhanDoiTuong} {canDt && <b className="m-lp-sao">*</b>}</span>
                        <span className={`m-lp-dong-tri ${!doiTuong ? 'mo' : ''}`}>
                          {doiTuong || `Chọn ${nhanDoiTuong.toLowerCase()}`}
                        </span>
                      </div>
                    </div>
                    <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" kieu="net" />
                  </div>
                  {loiO.doiTuong && <div className="m-lp-loi-o">{loiO.doiTuong}</div>}
                </>
              )}
            </div>

            {/* Nhóm 3: Ngày, Ghi chú */}
            <div className="m-the-trang m-lp-nhom-dong">
              {/* Ngày giao dịch */}
              <div
                className="m-lp-dong-o m-lp-the-truong"
                id="m-lp-o-thoiGian"
                onClick={() => setMoLich(true)}
              >
                <div className="m-lp-dong-trai">
                  <Icon n="clock" className="ic sm m-lp-dong-ic" kieu="net" />
                  <div className="m-lp-dong-nd">
                    <span className="m-lp-dong-nhan">Ngày giao dịch <b className="m-lp-sao">*</b></span>
                    <span className="m-lp-dong-tri m-lp-tri-xanh">{thoiGian}</span>
                    <input
                      type="text"
                      className="m-lp-inp-tri"
                      value={thoiGian}
                      readOnly
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" kieu="net" />
              </div>

              {/* Ghi chú */}
              <div className="m-lp-dong-o m-lp-dong-nhap">
                <div className="m-lp-dong-trai" style={{ width: '100%' }}>
                  <Icon n="file" className="ic sm m-lp-dong-ic" kieu="net" />
                  <input
                    type="text"
                    className="m-lp-dong-inp"
                    placeholder="Ghi chú"
                    value={ghiChu}
                    onChange={e => setGhiChu(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ════ PHIẾU CÓ DÒNG HÀNG (MUA, BÁN, KHO...) (T300) ════ */
          <>
            {/* Nhóm 1: Thông tin chung đưa lên trên cùng (T300) */}
            <div className="m-the-trang m-lp-nhom-dong">
              {/* Đối tượng */}
              {cfg.doiTuong !== 'none' && (
                <>
                  <div
                    className="m-lp-dong-o"
                    id="m-lp-o-doiTuong"
                    onClick={() => setMoChonDt(true)}
                  >
                    <div className="m-lp-dong-trai">
                      <Icon n="user" className="ic sm m-lp-dong-ic" kieu="net" />
                      <div className="m-lp-dong-nd">
                        <span className="m-lp-dong-nhan">{nhanDoiTuong} <b className="m-lp-sao">*</b></span>
                        <span className={`m-lp-dong-tri ${!doiTuong ? 'mo' : ''}`}>
                          {doiTuong || `Chọn ${nhanDoiTuong.toLowerCase()}`}
                        </span>
                      </div>
                    </div>
                    <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" kieu="net" />
                  </div>
                  {loiO.doiTuong && <div className="m-lp-loi-o">{loiO.doiTuong}</div>}
                </>
              )}

              {/* Cửa hàng */}
              <div
                className="m-lp-dong-o"
                id="m-lp-o-cuaHang"
                onClick={() => setMoChonCn(true)}
              >
                <div className="m-lp-dong-trai">
                  <Icon n="cuahang" className="ic sm m-lp-dong-ic" kieu="net" />
                  <div className="m-lp-dong-nd">
                    <span className="m-lp-dong-nhan">Cửa hàng</span>
                    <span className="m-lp-dong-tri">{cuaHang}</span>
                  </div>
                </div>
                <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" kieu="net" />
              </div>

              {/* Kho */}
              {bo.kho && (
                <>
                  <div
                    className="m-lp-dong-o"
                    id="m-lp-o-kho"
                    onClick={() => setMoChonKho(true)}
                  >
                    <div className="m-lp-dong-trai">
                      <Icon n="cuahang" className="ic sm m-lp-dong-ic" kieu="net" />
                      <div className="m-lp-dong-nd">
                        <span className="m-lp-dong-nhan">{nhanKho} <b className="m-lp-sao">*</b></span>
                        <span className={`m-lp-dong-tri ${!kho ? 'mo' : ''}`}>{kho || 'Chọn kho'}</span>
                      </div>
                    </div>
                    <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" kieu="net" />
                  </div>
                  {loiO.kho && <div className="m-lp-loi-o">{loiO.kho}</div>}
                </>
              )}

              {/* Hình thức thanh toán */}
              <div
                className="m-lp-dong-o"
                id="m-lp-o-httt"
                onClick={() => setMoChonHttt(true)}
              >
                <div className="m-lp-dong-trai">
                  <Icon n="card" className="ic sm m-lp-dong-ic" kieu="net" />
                  <div className="m-lp-dong-nd">
                    <span className="m-lp-dong-nhan">Hình thức thanh toán</span>
                    <span className="m-lp-dong-tri">
                      {httt === 'tienmat' ? 'Tiền mặt' : httt === 'chuyenkhoan' ? 'Chuyển khoản' : 'Ghi nợ'}
                    </span>
                  </div>
                </div>
                <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" kieu="net" />
              </div>

              {/* Ngày */}
              <div
                className="m-lp-dong-o m-lp-the-truong"
                id="m-lp-o-thoiGian"
                onClick={() => setMoLich(true)}
              >
                <div className="m-lp-dong-trai">
                  <Icon n="clock" className="ic sm m-lp-dong-ic" kieu="net" />
                  <div className="m-lp-dong-nd">
                    <span className="m-lp-dong-nhan">Ngày giao dịch <b className="m-lp-sao">*</b></span>
                    <span className="m-lp-dong-tri m-lp-tri-xanh">{thoiGian}</span>
                    <input
                      type="text"
                      className="m-lp-inp-tri"
                      value={thoiGian}
                      readOnly
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" kieu="net" />
              </div>

              {/* Ghi chú */}
              <div className="m-lp-dong-o m-lp-dong-nhap">
                <div className="m-lp-dong-trai" style={{ width: '100%' }}>
                  <Icon n="file" className="ic sm m-lp-dong-ic" kieu="net" />
                  <input
                    type="text"
                    className="m-lp-dong-inp"
                    placeholder="Ghi chú"
                    value={ghiChu}
                    onChange={e => setGhiChu(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Hoá đơn VAT (nếu có) */}
            {Boolean(bo.hd) && (
              <div className="m-the-trang m-lp-nhom-dong">
                <div className="m-lp-dong-o m-lp-dong-nhap">
                  <div className="m-lp-dong-trai" style={{ width: '100%' }}>
                    <span className="m-lp-dong-nhan-tinh">Số hoá đơn:</span>
                    <input
                      type="text"
                      className="m-lp-dong-inp"
                      placeholder="Số hoá đơn"
                      value={soHd}
                      onChange={e => setSoHd(e.target.value)}
                    />
                  </div>
                </div>
                <div className="m-lp-dong-o m-lp-dong-nhap">
                  <div className="m-lp-dong-trai" style={{ width: '100%' }}>
                    <span className="m-lp-dong-nhan-tinh">Ký hiệu:</span>
                    <input
                      type="text"
                      className="m-lp-dong-inp"
                      placeholder="Ký hiệu hoá đơn"
                      value={kyHieuHd}
                      onChange={e => setKyHieuHd(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Nhóm 2: Danh sách hàng hoá (T300) */}
            <div className="m-lp-khoi-hang-man" id="m-lp-o-hang">
              <div className="m-lp-hang-man-tieu-hang">
                <span className="m-lp-hang-man-tieu-chu">DANH SÁCH HÀNG HOÁ ({dsDong.length})</span>
                <button
                  type="button"
                  className="m-lp-btn-them-nhanh m-lp-btn-them-hang"
                  onClick={() => setMoChonHang(true)}
                >
                  <Icon n="plus" className="ic sm" kieu="net" /> Thêm hàng
                </button>
              </div>

              {dsDong.length === 0 ? (
                <div
                  className="m-the-trang m-lp-hang-trong-hop"
                  onClick={() => setMoChonHang(true)}
                >
                  <div style={{ color: 'var(--muted)', marginBottom: 6 }}><Icon n="box" className="ic md" kieu="net" /></div>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>Chưa có mặt hàng nào</span>
                  <span className="m-lp-btn-them-chu">+ Chọn mặt hàng</span>
                </div>
              ) : (
                <div className="m-lp-ds-hang-the">
                  {dsDong.map((d, i) => (
                    <TheHangMoi
                      key={i}
                      idx={i}
                      d={d}
                      laMuaHang={nhom === 'mua'}
                      laKhoKhac={nhom === 'nhap' || nhom === 'xuat' || mod.key === 'kho'}
                      anThue={cfg.thue === 0}
                      goi={s.goi}
                      onDoi={patch => doiDong(i, patch)}
                      onNhanBan={() => nhanBanDong(i)}
                      onXoa={() => xoaDong(i)}
                      onMoChonDvt={() => moChonDvt(i)}
                      onSuaTong={val => suaTongTien(i, val)}
                      onSuaTienGiam={val => suaTienGiam(i, val)}
                      onSuaTienThue={val => suaTienThue(i, val)}
                    />
                  ))}
                </div>
              )}
              {loiO.hang && <div className="m-lp-loi-o">{loiO.hang}</div>}
            </div>
          </>
        )}

        {/* ════ KHỐI HẠCH TOÁN (GÓI KHÁC FREE) ════ */}
        {s.goi !== 'F' && dsButToan.length > 0 && (
          <div className="m-lp-khoi-ht">
            <div
              className="m-the-trang m-lp-the-ht-tieu"
              onClick={() => setMoHt(v => !v)}
            >
              <div className="m-lp-ht-tieu-trai">
                <Icon n="bill" className="ic sm m-lp-dong-ic" kieu="net" />
                <span className="m-lp-ht-tieu-chu">Hạch toán</span>
              </div>
              <div className="m-lp-ht-tieu-phai">
                <span className="m-lp-ht-tom-tat">{dsButToan.length / 2} cặp</span>
                <Icon n={moHt ? 'chevu' : 'chevd'} className="ic sm" kieu="net" />
              </div>
            </div>

            {moHt && (
              <div className="m-the-trang m-xp-the-ht m-lp-the-ht-nd">
                <div className="m-xp-ht-ds">
                  {dsButToan.map((bt, idx) => (
                    <div
                      key={idx}
                      className="m-xp-ht-dong m-lp-hang-tk"
                      onClick={() => {
                        if (laTien) {
                          setChonTk({ dong: 0, kieu: bt.kieu })
                        }
                      }}
                    >
                      <span className="m-xp-ht-tk">
                        <span className="m-lp-tk-nut">
                          {bt.kieu === 'no' ? 'Nợ ' : 'Có '}
                          <b>{bt.so}</b>
                        </span>{' '}
                        <i className="m-xp-ht-ten">{bt.ten}</i>
                      </span>
                      <span className="m-xp-ht-tien num">{money(bt.tien)} đ</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── THANH CỐ ĐỊNH Ở ĐÁY: TỔNG TIỀN & NÚT LƯU LẠI ── */}
      <div className="m-lp-day m-lp-day-mot-man">
        {!laTien && (
          <div className="m-lp-day-hang-tong">
            <span className="m-lp-day-nhan">Tổng tiền:</span>
            <span className="m-lp-day-tong dam cam">{money(tongThanhToan)} đ</span>
          </div>
        )}
        <button
          type="button"
          className="m-lp-nut-chinh m-lp-nut-luu"
          onClick={() => thucHienLuu(false)}
        >
          Lưu lại
        </button>
      </div>

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
          const khoMoi = CUA_HANG.find(c => c.ten === v)?.kho?.[0] || 'Kho tổng'
          setKho(khoMoi)
        }}
        apDung
        tim
      />

      {/* ── SHEET CHỌN QUÝ ── */}
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
        tieuDe="Chọn kho"
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

      {/* ── SHEET CHỌN HÌNH THỨC THANH TOÁN ── */}
      <MChon
        mo={moChonHttt}
        onDong={() => setMoChonHttt(false)}
        tieuDe="Hình thức thanh toán"
        ds={[
          { k: 'congno', ten: 'Ghi nợ' },
          { k: 'tienmat', ten: 'Tiền mặt' },
          { k: 'chuyenkhoan', ten: 'Chuyển khoản' },
        ]}
        chon={httt}
        onChon={v => setHttt(v as 'congno' | 'tienmat' | 'chuyenkhoan')}
      />

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

      {/* ── SHEET TẤM CHỌN HÀNG HOÁ ── */}
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

      {/* ── LỊCH ĐƠN ── */}
      {moLich && (
        <LichDon
          value={thoiGian.slice(0, 10)}
          onChange={v => setThoiGian(v + thoiGian.slice(10))}
          onDong={() => setMoLich(false)}
        />
      )}

      {/* ── HỘP HỎI TẠO THẺ CHI PHÍ PHÂN BỔ (MỤC 4 SPEC) ── */}
      {hoiThe && (
        <div className="m-tam-overlay" style={{ zIndex: 1200 }}>
          <div className="m-tam-hop m-lp-hop-hoi-the">
            <div className="m-tam-dau">
              <h3 className="m-tam-tieu" style={{ fontSize: 16 }}>Tạo thẻ chi phí phân bổ</h3>
            </div>
            <div className="m-lp-hop-nd" style={{ padding: '14px 16px', fontSize: 14, color: 'var(--ink)' }}>
              Bạn có muốn tạo Thẻ chi phí phân bổ ngay không? Tên mục chi phí, số tiền, ngày và chứng từ gốc lấy sẵn từ <b>{hoiThe.soCt}</b>, bạn vẫn sửa lại được.
            </div>
            <div className="m-tam-day" style={{ padding: '10px 16px' }}>
              <button
                type="button"
                className="m-tam-btn-huy"
                onClick={() => {
                  setHoiThe(null)
                  setSoPhieuMoi(hoiThe.soCt)
                  setIdPhieuMoi(hoiThe.idMoi)
                  setDaLuu(true)
                }}
              >
                Không
              </button>
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
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── SHEET CHỌN ĐƠN VỊ TÍNH QUY ĐỔI (T300) ── */}
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

      {/* ── FORM THÊM MỚI DANH MỤC TRÊN ĐIỆN THOẠI (T347) ── */}
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
                setDsDong(ds => [...ds, {
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
                }])
              }
              setMoThemDm(null)
            }}
          />
        )
      })()}
    </div>
  )
}
