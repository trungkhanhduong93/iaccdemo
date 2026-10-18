import { useMemo, useState, type FC } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { duongDan, tenMan } from '../../app/registry'
import { cuaHangHienTai, ngayDauNam, truocDauNam, useSession } from '../../app/session'
import { anNgoaiGoi, type Goi } from '../../app/plan'
import { CUA_HANG, HANG, KHO, NVL } from '../../data/mock'
import { fold, money } from '../format'
import { Icon } from '../Icon'
import { LichDon } from '../ChonNgay'
import { MChon } from './MChon'
import { MTrong } from './MTrong'
import { bayGio, dsDcCon, ghiNhatKy, soKeTiep, suaPhieu, themPhieu, xoaPhieu, type CtTt } from '../generic/daXoa'
import { useDongChungTu } from '../generic/VoucherScreen'
import { useDsPhieuDcn } from '../../modules/kho/BangDieuChuyen'
import { useDsPhieuSx } from '../../modules/kho/BangSanXuat'
import { MAN_DC, phieuDieuChinh, type LoaiDc } from '../../modules/kho/dieu-chinh'
import {
  CONG_THUC_CB, keoNvlCb, SX, soLuong, tienToSx, hangCua,
  type DongSx, type LoaiSx,
} from '../../modules/kho/san-xuat'
import { DCN, khoCuaCn, type LoaiDcn } from '../../modules/kho/dieu-chuyen'
import type { Dong } from '../generic/gen'
import { quyDoiTuDanhMuc } from '../../modules/danh-muc/QuyDoiDvt'
import { goSoVN, docSoVN } from '../OSoGo'
import { MFormDm } from './MFormDm'
import { addCatalogRow, getDmMeta, useAddedCatalogRows } from '../generic/danhMucStore'

export interface MLapPhieuKhoProps extends ScreenProps {
  id?: string
}

export const MLapPhieuKho: FC<MLapPhieuKhoProps> = ({ sc, mod, id }) => {
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const dangSua = Boolean(id && id !== 'moi')
  const cfgMan = sc.voucher ?? { prefix: 'CT', doiTuong: 'none', dienGiai: [tenMan(sc)], tien: [0, 0] }

  const laDcn = Boolean(cfgMan.dieuChuyen)
  const laSx = Boolean(cfgMan.sanXuat)

  const { rows: rowsGoc } = useDongChungTu(sc, mod)
  const rowsDcn = useDsPhieuDcn(cfgMan.dieuChuyen ?? 'xdc')
  const rowsSx = useDsPhieuSx(cfgMan.sanXuat ?? 'xsc')
  const rows = laDcn ? rowsDcn : laSx ? rowsSx : rowsGoc

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

  return <ThanLapPhieuKho key={id ?? 'moi'} sc={sc} mod={mod} id={id} row={row} />
}

// ── Thẻ mặt hàng phiếu kho điện thoại (T300) ──
type DongM = Dong & { giaGoc?: number; dvtChinh?: string; strTonTt?: string; tonHtGoc?: number }

const HANG_KK_MAC_DINH: DongM[] = [
  { ma: 'NVL002', ten: 'Xương ống bò', dvt: 'kg', dvtChinh: 'kg', tonHt: 31, tonTt: undefined, sl: 31, gia: 65000, tien: 0, ts: 0, thue: 0 },
  { ma: 'NVL008', ten: 'Cà phê hạt Robusta', dvt: 'kg', dvtChinh: 'kg', tonHt: 10, tonTt: undefined, sl: 10, gia: 210000, tien: 0, ts: 0, thue: 0 },
  { ma: 'NVL005', ten: 'Gạo tấm thơm', dvt: 'kg', dvtChinh: 'kg', tonHt: 50, tonTt: undefined, sl: 50, gia: 19000, tien: 0, ts: 0, thue: 0 },
  { ma: 'NVL004', ten: 'Sườn heo', dvt: 'kg', dvtChinh: 'kg', tonHt: 12, tonTt: undefined, sl: 12, gia: 145000, tien: 0, ts: 0, thue: 0 },
  { ma: 'NVL012', ten: 'Dầu ăn', dvt: 'Lít', dvtChinh: 'Lít', tonHt: 20, tonTt: undefined, sl: 20, gia: 48000, tien: 0, ts: 0, thue: 0 },
]

interface TheHangKhoProps {
  idx: number
  d: DongM
  laKk: boolean
  dcn?: string
  goi: Goi
  onDoi: (patch: Partial<DongM>) => void
  onNhanBan: () => void
  onXoa: () => void
  onMoChonDvt: () => void
  onSuaTong: (tong: number) => void
}

const TheHangKho: FC<TheHangKhoProps> = ({
  idx,
  d,
  laKk,
  dcn,
  goi,
  onDoi,
  onNhanBan,
  onXoa,
  onMoChonDvt,
  onSuaTong,
}) => {
  const [dangSuaTong, setDangSuaTong] = useState(false)
  const [strSuaTong, setStrSuaTong] = useState('')
  const [focusSl, setFocusSl] = useState(false)
  const [strSl, setStrSl] = useState('')
  const [focusGia, setFocusGia] = useState(false)
  const [strGia, setStrGia] = useState('')

  const dvtChinh = d.dvtChinh || NVL.find(n => n.ma === d.ma || n.ten === d.ten)?.dvt || HANG.find(h => h.ma === d.ma || h.ten === d.ten)?.dvt || d.dvt
  const dsQd = useMemo(() => quyDoiTuDanhMuc(d.ten, dvtChinh), [d.ten, dvtChinh])
  const coQuyDoi = !anNgoaiGoi(goi) && dsQd.length > 0

  if (laKk) {
    const tonHt = Number(d.tonHt ?? 0)
    const tonTt = Number(d.tonTt ?? tonHt)
    const chenh = Math.round((tonTt - tonHt) * 100) / 100   // làm tròn 2 số lẻ, tránh 9.5 - 10 thành số dài (T359)
    return (
      <div className="m-th-the">
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

        {/* Số thực tế */}
        <div className="m-th-hang">
          <span className="m-th-nhan dam">Số thực tế:</span>
          <div className="m-th-o-nhap">
            <input
              type="text"
              className="m-th-inp num"
              inputMode="decimal"
              value={focusSl ? strSl : (d.tonTt ?? tonHt)}
              onFocus={() => {
                setFocusSl(true)
                setStrSl(String(d.tonTt ?? tonHt))
              }}
              onChange={e => {
                const str = goSoVN(e.target.value, true)
                setStrSl(str)
                const v = docSoVN(str)
                onDoi({ tonTt: v, sl: v })
              }}
              onBlur={() => setFocusSl(false)}
            />
            <span className="m-th-don-vi">{d.dvt || 'Cái'}</span>
          </div>
        </div>

        {/* Tồn sổ sách */}
        <div className="m-th-hang">
          <span className="m-th-nhan">Tồn sổ sách:</span>
          <div className="m-th-o-nhap khong-khung">
            <span className="m-th-so-tien" style={{ color: 'var(--ink)' }}>
              {soLuong(tonHt)} {d.dvt || 'Cái'}
            </span>
          </div>
        </div>

        {/* Chênh lệch */}
        <div className="m-th-hang">
          <span className="m-th-nhan dam">Chênh lệch:</span>
          <div className="m-th-o-nhap khong-khung" style={{ gap: 6 }}>
            <span className={`dam ${chenh < 0 ? 'do' : chenh > 0 ? 'xanh' : ''}`}>
              {chenh > 0 ? `+${soLuong(chenh)}` : soLuong(chenh)} {d.dvt}
            </span>
            {chenh < 0 && <span className="m-ct-chip err">Thiếu</span>}
            {chenh > 0 && <span className="m-ct-chip ok">Thừa</span>}
            {chenh === 0 && <span className="m-ct-chip dim">Khớp</span>}
          </div>
        </div>

        {/* Ghi chú lý do chênh lệch */}
        <textarea
          className="m-th-ghi-chu"
          placeholder="Lý do chênh lệch nếu có"
          value={d.ghiChu || ''}
          onChange={e => onDoi({ ghiChu: e.target.value })}
          rows={2}
        />
      </div>
    )
  }

  const dongSx = d as DongSx
  return (
    <div className="m-th-the">
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

      {dongSx.tp && (
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: -4 }}>
          Thành phẩm: {dongSx.tp}
        </div>
      )}

      {/* Dòng 1: Số lượng */}
      <div className="m-th-hang">
        <span className="m-th-nhan">
          Số lượng:
          {dongSx.slKh !== undefined && (
            <small style={{ color: 'var(--muted)', marginLeft: 4 }}>
              (KH: {soLuong(dongSx.slKh)})
            </small>
          )}
        </span>
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

      {/* Dòng 2: Đơn giá (nếu không phải chuyển kho ck) */}
      {dcn !== 'ck' && (
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
      )}

      {/* Dòng 3: Tổng tiền (nếu không phải chuyển kho ck) */}
      {dcn !== 'ck' && (
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
                <span className="m-th-so-tien dam cam">{money(d.tien || 0)} đ</span>
                <button
                  type="button"
                  className="m-th-btn-but-chi"
                  onClick={() => {
                    setDangSuaTong(true)
                    setStrSuaTong(money(d.tien || 0))
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
      )}

      {/* Cuối thẻ: Ô ghi chú */}
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

interface ThanLapPhieuKhoProps extends ScreenProps {
  id?: string
  row?: Row
}

const ThanLapPhieuKho: FC<ThanLapPhieuKhoProps> = ({ sc, mod, id, row }) => {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const loc = useLocation()
  const [sp] = useSearchParams()
  const path = duongDan(mod, sc)

  const cfgMan = sc.voucher ?? { prefix: 'CT', doiTuong: 'none', dienGiai: [tenMan(sc)], tien: [0, 0] }
  const saoChep = (loc.state as { saoChep?: Row } | null)?.saoChep
  const gocData = row ?? saoChep
  const dangSua = Boolean(row)

  const laKk = Boolean(cfgMan.kiemKe)
  const laDc = Boolean(cfgMan.dieuChinh)
  const sx = cfgMan.sanXuat as LoaiSx | undefined
  const laSx = Boolean(sx)
  const dcn = cfgMan.dieuChuyen as LoaiDcn | undefined
  const laDcn = Boolean(dcn)

  // Loại tab điều chỉnh
  const loaiKey = (gocData?.loai ?? sp.get('loai') ?? cfgMan.loai?.[0]?.k ?? 'xdc') as LoaiDc
  const loai = cfgMan.loai?.find(x => x.k === loaiKey) ?? cfgMan.loai?.[0]

  // Tên loại phiếu hiển thị
  const tenLoai = useMemo(() => {
    if (laKk) return 'Kiểm kê kho'
    if (laDc) return loaiKey === 'ndc' ? 'Nhập điều chỉnh' : 'Xuất điều chỉnh'
    if (laSx && sx) return SX[sx].ten
    if (laDcn && dcn) return DCN[dcn].ten
    return tenMan(sc)
  }, [laKk, laDc, loaiKey, laSx, sx, laDcn, dcn, sc])

  const cnChon = cuaHangHienTai(s)
  const [cuaHang, setCuaHang] = useState(() => {
    if (gocData?.cn) return String(gocData.cn)
    if (cnChon?.ten) return cnChon.ten
    if (laKk) return 'Phố Mây Lê Lợi'
    return ''
  })
  const [moChonCn, setMoChonCn] = useState(false)

  const addedKho = useAddedCatalogRows('1.8')
  const addedHang = useAddedCatalogRows('1.2')
  const [moThemDm, setMoThemDm] = useState<string | null>(null)

  // Danh sách kho theo cửa hàng
  const dsKhoCn = useMemo(() => {
    const k = khoCuaCn(cuaHang)
    const base = k.length ? k : KHO
    const added = addedKho.map(x => String(x.ten ?? '')).filter(Boolean)
    return [...base, ...added]
  }, [cuaHang, addedKho])

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

  // Kho chính
  const [kho, setKho] = useState(() => {
    if (gocData?._kho || gocData?.kho) return String(gocData._kho ?? gocData.kho)
    return cuaHang ? (dsKhoCn[0] ?? 'Kho bếp Lê Lợi') : ''
  })

  // Kho nhận
  const [khoNhan, setKhoNhan] = useState(() => {
    if (gocData?._khoNhan) return String(gocData._khoNhan)
    if (laDcn && dcn === 'ck') {
      const khoKhac = dsKhoCn.find(k => k !== (gocData?._kho ?? dsKhoCn[0]))
      return khoKhac ?? ''
    }
    return ''
  })

  // Cửa hàng nhận
  const dsCnNhan = useMemo(() => CUA_HANG.filter(c => c.ten !== cuaHang), [cuaHang])
  const [cnNhan, setCnNhan] = useState(() => {
    if (gocData?._cnNhan || gocData?.doiTuong) return String(gocData._cnNhan ?? gocData.doiTuong)
    return dsCnNhan[0]?.ten ?? 'Phố Mây Thảo Điền'
  })

  const dsKhoNhanXdc = useMemo(() => khoCuaCn(cnNhan), [cnNhan])

  // Người kiểm kê
  const [nguoiKiem, setNguoiKiem] = useState(() => {
    return String(gocData?._nguoiKiem ?? gocData?.nguoiKiem ?? s.ten ?? 'Trần Thu Hà')
  })

  // Tìm kiếm hàng trong kho (Kiểm kê)
  const [timKiemKho, setTimKiemKho] = useState('')

  // Ghi chú / Diễn giải
  const [ghiChu, setGhiChu] = useState(() => {
    return String(gocData?._ghiChu ?? gocData?.dienGiai ?? (laKk ? 'Kiểm kê cuối tháng' : cfgMan.dienGiai?.[0] ?? ''))
  })

  // Danh sách dòng
  const [dsDong, setDsDong] = useState<DongM[]>(() => {
    if (gocData?._dong && Array.isArray(gocData._dong) && gocData._dong.length > 0) return gocData._dong as DongM[]
    if (laKk) return HANG_KK_MAC_DINH
    return []
  })

  // Thành phẩm chọn ở sản xuất chế biến
  const dsTpCoCongThuc = useMemo(() => CONG_THUC_CB.filter(c => c.tt === 'on'), [])
  const [tpChonMa, setTpChonMa] = useState<string>(() => dsTpCoCongThuc[0]?.spMa ?? 'PHO01')
  const [tpSoLuong, setTpSoLuong] = useState<number>(10)

  // Nguồn hàng hoá
  const danhMucHang = useMemo(() => {
    const added = addedHang.map(h => ({
      ma: String(h.ma ?? ''),
      ten: String(h.ten ?? ''),
      nhom: String(h.nhom ?? ''),
      dvt: String(h.dvt ?? 'Cái'),
      gia: Number(h.gia) || Number(h.giaMua) || 0,
      ts: Number(h.ts) || 0,
    }))
    return [...NVL, ...added]
  }, [addedHang])

  const dsNhomHang = useMemo(() => {
    const set = new Set<string>()
    danhMucHang.forEach(h => {
      if (h.nhom) set.add(h.nhom)
    })
    return ['Tất cả', ...Array.from(set)]
  }, [danhMucHang])

  // Sheets chọn
  const [moChonKho, setMoChonKho] = useState(false)
  const [moChonKhoNhan, setMoChonKhoNhan] = useState(false)
  const [moChonCnNhan, setMoChonCnNhan] = useState(false)

  // Sheet chọn hàng
  const [moChonHang, setMoChonHang] = useState(false)
  const [nhomHangChon, setNhomHangChon] = useState('Tất cả')
  const [timHang, setTimHang] = useState('')
  const [moChonNhomHang, setMoChonNhomHang] = useState(false)

  // Báo lỗi theo ô
  const [loiO, setLoiO] = useState<Record<string, string>>({})

  // Sau khi lưu
  const [daLuu, setDaLuu] = useState(false)
  const [soPhieuMoi, setSoPhieuMoi] = useState('')
  const [idPhieuMoi, setIdPhieuMoi] = useState('')

  // Tính tổng
  const tongTien = useMemo(() => {
    if (laKk) return 0
    return dsDong.reduce((a, d) => a + (Number(d.tien) || 0), 0)
  }, [dsDong, laKk])

  // Thừa, thiếu và tiến độ đếm cho kiểm kê
  const { tongThua, tongThieu, soDaDem, dvtThua, dvtThieu } = useMemo(() => {
    let thua = 0
    let thieu = 0
    let dem = 0
    let lastDvtThua = ''
    let lastDvtThieu = ''

    for (const d of dsDong) {
      const daDem = d.tonTt !== undefined && d.tonTt !== null && (d.tonTt as unknown) !== '' && !isNaN(Number(d.tonTt))
      if (daDem) {
        dem++
        const tonHt = Number(d.tonHt ?? 0)
        const tonTt = Number(d.tonTt)
        const chenh = Math.round((tonTt - tonHt) * 100) / 100
        if (chenh > 0) {
          thua += chenh
          lastDvtThua = d.dvt || 'kg'
        } else if (chenh < 0) {
          thieu += Math.abs(chenh)
          lastDvtThieu = d.dvt || 'kg'
        }
      }
    }

    return {
      tongThua: Math.round(thua * 100) / 100,
      tongThieu: Math.round(thieu * 100) / 100,
      soDaDem: dem,
      dvtThua: lastDvtThua || 'kg',
      dvtThieu: lastDvtThieu || 'kg',
    }
  }, [dsDong])

  const tongThuaTxt = tongThua > 0 ? `+${soLuong(tongThua)} ${dvtThua}` : `0 ${dvtThua}`
  const tongThieuTxt = tongThieu > 0 ? `-${soLuong(tongThieu)} ${dvtThieu}` : `0 ${dvtThieu}`

  const dsChuaDem = useMemo(() => {
    return dsDong.filter(d => d.tonTt === undefined || d.tonTt === null || (d.tonTt as unknown) === '' || isNaN(Number(d.tonTt)))
  }, [dsDong])
  const soChuaDem = dsChuaDem.length
  const dsTenChuaDem = dsChuaDem.length > 0 ? dsChuaDem.map(d => d.ten).slice(0, 3).join(', ') : ''

  const dsDongKkHienThi = useMemo(() => {
    if (!timKiemKho.trim()) return dsDong.map((d, idx) => ({ d, originalIndex: idx }))
    const q = fold(timKiemKho.trim())
    return dsDong
      .map((d, idx) => ({ d, originalIndex: idx }))
      .filter(({ d }) => fold(d.ten).includes(q) || (d.ma && fold(d.ma).includes(q)))
  }, [dsDong, timKiemKho])

  const handleTonTtChange = (idx: number, val: string) => {
    const raw = goSoVN(val, true)
    setDsDong(ds => ds.map((item, i) => {
      if (i !== idx) return item
      if (!raw) {
        return { ...item, tonTt: undefined, strTonTt: '' }
      }
      const num = docSoVN(raw)
      return { ...item, tonTt: num, strTonTt: raw }
    }))
  }

  // Cập nhật dòng (T300)
  const [dvtSheet, setDvtSheet] = useState<{ idx: number; ten: string; ds: { k: string; ten: string }[] } | null>(null)

  const doiDong = (idx: number, patch: Partial<DongM>) => {
    setDsDong(ds => ds.map((d, i) => {
      if (i !== idx) return d
      const hopNhat = { ...d, ...patch }
      if (laKk) {
        const tonHt = hopNhat.tonHt !== undefined ? Number(hopNhat.tonHt) : 0
        const daDem = hopNhat.tonTt !== undefined && hopNhat.tonTt !== null && (hopNhat.tonTt as unknown) !== '' && !isNaN(Number(hopNhat.tonTt))
        const tonTt = daDem ? Number(hopNhat.tonTt) : undefined
        return { ...hopNhat, tonHt, tonTt, sl: tonTt ?? tonHt }
      }
      const sl = hopNhat.sl !== undefined ? Number(hopNhat.sl) : 0
      const gia = hopNhat.gia !== undefined ? Number(hopNhat.gia) : 0
      const tien = patch.tien !== undefined ? Number(patch.tien) : Math.round(sl * gia)
      return { ...hopNhat, sl, gia, tien }
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

  // Đổi đơn vị tính theo quy đổi (T300, T414)
  const doiDvt = (idx: number, dvMoi: string) => {
    const d = dsDong[idx]
    if (!d) return
    const dvtChinh = d.dvtChinh || NVL.find(n => n.ma === d.ma || n.ten === d.ten)?.dvt || HANG.find(h => h.ma === d.ma || h.ten === d.ten)?.dvt || d.dvt || 'kg'

    if (laKk) {
      const dsQd = quyDoiTuDanhMuc(d.ten, dvtChinh)
      const tonHtGoc = d.tonHtGoc !== undefined ? d.tonHtGoc : Number(d.tonHt ?? 0)

      let tonHtMoi = tonHtGoc
      if (dvMoi !== dvtChinh) {
        const q = dsQd.find(x => x.dv === dvMoi)
        if (q) {
          tonHtMoi = q.nguoc ? Math.round((tonHtGoc / q.tl) * 10000) / 10000 : Math.round(tonHtGoc * q.tl * 10000) / 10000
        }
      }

      let tonTtMoi = d.tonTt
      let strTonTtMoi = d.strTonTt
      const daDem = d.tonTt !== undefined && d.tonTt !== null && (d.tonTt as unknown) !== '' && !isNaN(Number(d.tonTt))
      if (daDem) {
        let tonTtChinh = Number(d.tonTt)
        const dvHienTai = d.dvt || dvtChinh
        if (dvHienTai !== dvtChinh) {
          const qCu = dsQd.find(x => x.dv === dvHienTai)
          if (qCu) {
            tonTtChinh = qCu.nguoc ? tonTtChinh * qCu.tl : tonTtChinh / qCu.tl
          }
        }
        if (dvMoi === dvtChinh) {
          tonTtMoi = Math.round(tonTtChinh * 10000) / 10000
        } else {
          const qMoi = dsQd.find(x => x.dv === dvMoi)
          if (qMoi) {
            tonTtMoi = qMoi.nguoc ? Math.round((tonTtChinh / qMoi.tl) * 10000) / 10000 : Math.round(tonTtChinh * qMoi.tl * 10000) / 10000
          }
        }
        strTonTtMoi = String(tonTtMoi)
      }

      doiDong(idx, { dvt: dvMoi, dvtChinh, tonHt: tonHtMoi, tonHtGoc, tonTt: tonTtMoi, strTonTt: strTonTtMoi, sl: tonTtMoi })
      return
    }

    const giaGoc = d.giaGoc ?? (NVL.find(n => n.ma === d.ma || n.ten === d.ten)?.gia || d.gia || 0)
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
    const dvtChinh = d.dvtChinh || NVL.find(n => n.ma === d.ma || n.ten === d.ten)?.dvt || HANG.find(h => h.ma === d.ma || h.ten === d.ten)?.dvt || d.dvt
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
    const giaMoi = Math.round(tongMoi / sl)
    const tien = Math.round(sl * giaMoi)
    doiDong(idx, { gia: giaMoi, tien, giaGoc: giaMoi })
  }

  // Chọn thành phẩm trong sản xuất
  const apDungCongThucSx = (spMa: string, slTp: number) => {
    setTpChonMa(spMa)
    setTpSoLuong(slTp)
    const nvlDong = keoNvlCb(spMa, slTp)
    setDsDong(nvlDong)
    if (loiO.hang) setLoiO(l => { const n = { ...l }; delete n.hang; return n })
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
      if (laKk) {
        setDsDong(ds => [
          ...ds,
          {
            ma: h.ma,
            ten: h.ten,
            dvt: h.dvt,
            dvtChinh: h.dvt,
            giaGoc: 0,
            sl: 0,
            gia: 0,
            tien: 0,
            ts: 0,
            thue: 0,
            tonHt: 0,
            tonTt: undefined,
            kho,
            ghiChu: '',
          },
        ])
      } else {
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
            ts: 0,
            thue: 0,
            kho,
            ghiChu: '',
          },
        ])
      }
      if (loiO.hang) setLoiO(l => { const n = { ...l }; delete n.hang; return n })
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
          if (laKk) {
            dongMoi.push({
              ma: h.ma,
              ten: h.ten,
              dvt: h.dvt,
              dvtChinh: h.dvt,
              giaGoc: 0,
              sl: 0,
              gia: 0,
              tien: 0,
              ts: 0,
              thue: 0,
              tonHt: 0,
              tonTt: undefined,
              kho,
              ghiChu: '',
            })
          } else {
            dongMoi.push({
              ma: h.ma,
              ten: h.ten,
              dvt: h.dvt,
              dvtChinh: h.dvt,
              giaGoc: gia,
              sl,
              gia,
              tien,
              ts: 0,
              thue: 0,
              kho,
              ghiChu: '',
            })
          }
        }
      }
      setDsDong(dongMoi)
      if (loiO.hang) setLoiO(l => { const n = { ...l }; delete n.hang; return n })
    }
  }

  const cuonDenO = (idO: string) => {
    setTimeout(() => {
      const el = document.getElementById(idO)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  // Thực hiện lưu chứng từ
  const thucHienLuu = (moMoi = false) => {
    const loiMoi: Record<string, string> = {}

    let cnLuu = cuaHang
    if (!cnLuu) {
      if (laKk) {
        cnLuu = CUA_HANG.find(c => khoCuaCn(c.ten).includes(kho))?.ten || CUA_HANG[0]?.ten || 'Phố Mây Lê Lợi'
        setCuaHang(cnLuu)
      } else {
        loiMoi.cuaHang = 'Vui lòng chọn cửa hàng'
      }
    }

    if (!kho.trim()) {
      loiMoi.kho = 'Vui lòng chọn kho'
    }

    if (laDcn) {
      if (dcn === 'ck') {
        if (!khoNhan.trim()) {
          loiMoi.khoNhan = 'Vui lòng chọn kho nhận'
        } else if (khoNhan === kho) {
          loiMoi.khoNhan = 'Kho nhận phải khác kho xuất'
        }
      } else if (dcn === 'xdc') {
        if (!cnNhan.trim()) {
          loiMoi.cnNhan = 'Vui lòng chọn cửa hàng nhận'
        }
        if (!khoNhan.trim()) {
          loiMoi.khoNhan = 'Vui lòng chọn kho nhận'
        } else if (khoNhan === kho) {
          loiMoi.khoNhan = 'Kho nhận phải khác kho xuất'
        }
      }
    }

    if (dsDong.length === 0) {
      loiMoi.hang = 'Vui lòng chọn ít nhất một mặt hàng'
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

    const man = `${mod.key}/${sc.slug}`
    const idLuu = dangSua ? String(row!.id) : `moi-${Date.now()}`
    let soCt = ''

    if (dangSua) {
      soCt = String(row!.so)
    } else {
      if (laKk) {
        soCt = soKeTiep(man, `${cfgMan.prefix || 'KK'}2610-`)
      } else if (laDc) {
        const prefix = loaiKey === 'ndc' ? 'NDC2610-' : 'XDC2610-'
        soCt = soKeTiep(man, prefix)
      } else if (laSx && sx) {
        soCt = soKeTiep(man, tienToSx(sx))
      } else if (laDcn && dcn) {
        soCt = soKeTiep(man, `${DCN[dcn].prefix}2610-`)
      } else {
        soCt = soKeTiep(man, `${cfgMan.prefix || 'CT'}2610-`)
      }
    }

    // Chuẩn hoá dòng cho kiểm kê: hàng chưa đếm giữ nguyên tồn sổ (tonTt = tonHt), quy về ĐVT chính nếu đang chọn ĐVT quy đổi (T414)
    const dsDongLuu = laKk
      ? dsDong.map(d => {
          const dvtChinh = d.dvtChinh || NVL.find(n => n.ma === d.ma || n.ten === d.ten)?.dvt || HANG.find(h => h.ma === d.ma || h.ten === d.ten)?.dvt || d.dvt || 'kg'
          const dsQd = quyDoiTuDanhMuc(d.ten, dvtChinh)
          const q = (d.dvt && d.dvt !== dvtChinh) ? dsQd.find(x => x.dv === d.dvt) : undefined

          const tonHtLuu = d.tonHtGoc !== undefined
            ? d.tonHtGoc
            : (q ? (q.nguoc ? Math.round(Number(d.tonHt ?? 0) * q.tl * 10000) / 10000 : Math.round((Number(d.tonHt ?? 0) / q.tl) * 10000) / 10000) : Number(d.tonHt ?? 0))

          let tonTtLuu: number
          const daDem = d.tonTt !== undefined && d.tonTt !== null && (d.tonTt as unknown) !== '' && !isNaN(Number(d.tonTt))
          if (daDem) {
            let num = Number(d.tonTt)
            if (q) {
              num = q.nguoc ? num * q.tl : num / q.tl
            }
            tonTtLuu = Math.round(num * 10000) / 10000
          } else {
            tonTtLuu = tonHtLuu
          }

          return {
            ...d,
            dvt: dvtChinh,
            dvtChinh,
            tonHt: tonHtLuu,
            tonTt: tonTtLuu,
            sl: tonTtLuu,
          }
        })
      : dsDong

    // Đồng bộ phiếu điều chỉnh cho Kiểm kê
    let dsDc: CtTt[] | undefined = undefined
    if (laKk) {
      const cu = dsDcCon(row)
      const kk = { id: idLuu, so: soCt, ngay: ngayChiTiet, cn: cuaHang, kho }
      const ra: CtTt[] = []
      for (const l of ['xdc', 'ndc'] as LoaiDc[]) {
        const c = cu.find(x => x.loai === l)
        const p = phieuDieuChinh(kk, dsDongLuu, l, c?.id ?? `moi-${Date.now()}-${l}`)
        if (!p) {
          if (c) xoaPhieu(MAN_DC, [{ id: c.id, so: c.so }], s.ten)
          continue
        }
        if (c) suaPhieu(MAN_DC, c.id, p)
        else {
          themPhieu(MAN_DC, p, s.ten)
          ghiNhatKy(MAN_DC, String(p.id), String(p.so), s.ten, `Thêm mới chứng từ, sinh từ ${soCt}`)
        }
        ra.push({ id: String(p.id), so: String(p.so), loai: l })
      }
      dsDc = ra
    }

    const noiDung: Record<string, unknown> = {
      ngay: ngayChiTiet,
      gio: thoiGian.split(' ')[1] || '10:00',
      thang: Number(ngayChiTiet.split('/')[1]) || 10,
      doiTuong: laDcn && dcn === 'xdc' ? cnNhan : '',
      dienGiai: ghiChu || (laKk ? 'Kiểm kê cuối tháng' : laDc ? (loaiKey === 'ndc' ? 'Nhập điều chỉnh' : 'Xuất điều chỉnh') : tenLoai),
      tien: tongTien,
      thue: 0,
      tong: tongTien,
      _dong: dsDongLuu,
      _kho: kho,
      _ghiChu: ghiChu,
      ...(laKk ? { _nguoiKiem: nguoiKiem, nguoiKiem } : {}),
      ...(dsDc ? { _dsDc: dsDc } : {}),
      ...(laSx ? {
        ttSx: row?.ttSx ?? (SX[sx!].nhap ? 'da' : 'cho'),
        _ngayCapNhat: bayGio(),
        _nguoiCapNhat: s.ten,
      } : {}),
      ...(laDcn ? {
        ...(dcn !== 'ck' ? { ttSx: row?.ttSx ?? (dcn === 'ndc' ? 'da' : 'cho') } : {}),
        _ngayCapNhat: bayGio(),
        _nguoiCapNhat: s.ten,
        _khoNhan: khoNhan,
        ...(dcn === 'xdc' ? { _cnNhan: cnNhan } : {}),
      } : {}),
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
      cn: cnLuu || cuaHang,
      nguon: 'tay',
      loai: laDc ? loaiKey : loai?.k,
      tenLoai,
      tt: laKk || (laDcn && dcn === 'ck') ? 'ghi' : 'nhap',
      ...noiDung,
    }, s.ten)
    ghiNhatKy(man, idLuu, soCt, s.ten, 'Thêm mới chứng từ')
    toast(`Đã lưu ${soCt}`)

    if (laKk) {
      nav(`${path}/${idLuu}`)
      return
    }

    if (moMoi) {
      setGhiChu('')
      setNhomHangChon('Tất cả')
      setTimHang('')
      setDsDong([])
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

  const tenThuong = tenLoai.toLowerCase().startsWith('phiếu ') ? tenLoai.slice(6).toLowerCase() : tenLoai.toLowerCase()
  const tieuDe = dangSua ? `${tenLoai} ${row?.so ?? ''}`.trim() : `Phiếu ${tenThuong} mới`

  const renderCacBangChon = () => (
    <>
      {/* ── SHEET CHỌN KHO ── */}
      <MChon
        mo={moChonKho}
        onDong={() => setMoChonKho(false)}
        tieuDe={laKk ? 'Chọn kho kiểm kê' : 'Chọn kho'}
        ds={dsKhoCn.map(k => ({ k, ten: k }))}
        chon={kho}
        onChon={v => {
          setKho(v)
          if (loiO.kho) setLoiO(l => { const n = { ...l }; delete n.kho; return n })
          if (laDcn && dcn === 'ck' && v === khoNhan) setKhoNhan('')
          if (laKk) {
            const cn = CUA_HANG.find(c => khoCuaCn(c.ten).includes(v))?.ten
            if (cn) setCuaHang(cn)
          }
        }}
        onThem={() => {
          setMoChonKho(false)
          setMoThemDm('kho')
        }}
        nhanThem="Thêm kho"
        apDung
        tim
      />

      {/* ── SHEET CHỌN CỬA HÀNG NHẬN (XDC) ── */}
      {laDcn && dcn === 'xdc' && (
        <MChon
          mo={moChonCnNhan}
          onDong={() => setMoChonCnNhan(false)}
          tieuDe="Chọn cửa hàng nhận"
          ds={dsCnNhan.map(c => ({ k: c.ten, ten: c.ten }))}
          chon={cnNhan}
          onChon={v => {
            setCnNhan(v)
            if (loiO.cnNhan) setLoiO(l => { const n = { ...l }; delete n.cnNhan; return n })
            const k = khoCuaCn(v)
            setKhoNhan(k.length === 1 ? k[0] : '')
          }}
          apDung
          tim
        />
      )}

      {/* ── SHEET CHỌN KHO NHẬN ── */}
      {laDcn && (dcn === 'ck' || dcn === 'xdc') && (
        <MChon
          mo={moChonKhoNhan}
          onDong={() => setMoChonKhoNhan(false)}
          tieuDe="Chọn kho nhận"
          ds={(dcn === 'xdc' ? dsKhoNhanXdc : dsKhoCn).map(k => ({ k, ten: k }))}
          chon={khoNhan}
          onChon={v => {
            if (v === kho) {
              toast('Kho nhận phải khác kho xuất')
              return
            }
            setKhoNhan(v)
            if (loiO.khoNhan) setLoiO(l => { const n = { ...l }; delete n.khoNhan; return n })
          }}
          apDung
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
                        Mã: {h.ma} · {h.dvt} {!laKk && `· ${money(h.gia)} đ`}
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

      {/* ── SHEET CHỌN CỬA HÀNG (T357) ── */}
      <MChon
        mo={moChonCn}
        onDong={() => setMoChonCn(false)}
        tieuDe="Chọn cửa hàng"
        ds={CUA_HANG.map(c => ({ k: c.ten, ten: c.ten }))}
        chon={cuaHang}
        onChon={v => {
          setCuaHang(v)
          setKho(khoCuaCn(v)[0] ?? '')
          setLoiO(l => { const n = { ...l }; delete n.cuaHang; delete n.kho; return n })
        }}
        apDung
        tim
      />

      {/* ── LỊCH ĐƠN ── */}
      {moLich && (
        <LichDon
          value={thoiGian.slice(0, 10)}
          onChange={v => {
            if (!laKk) { setThoiGian(v + thoiGian.slice(10)); return }
            // kiểm kê chỉ chọn ngày: hôm nay lấy giờ lúc chọn, ngày trước lấy 23:59 (T358)
            const now = new Date()
            const homNay = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
            const gio = v === homNay ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}` : '23:59'
            setThoiGian(`${v} ${gio}`)
          }}
          onDong={() => setMoLich(false)}
        />
      )}

      {/* ── SHEET CHỌN ĐƠN VỊ TÍNH (T300) ── */}
      {dvtSheet && (
        <MChon
          mo={Boolean(dvtSheet)}
          onDong={() => setDvtSheet(null)}
          tieuDe={`Chọn đơn vị: ${dvtSheet.ten}`}
          ds={dvtSheet.ds}
          chon={dsDong[dvtSheet.idx]?.dvt || ''}
          onChon={v => {
            doiDvt(dvtSheet.idx, v)
            setDvtSheet(null)
          }}
          apDung
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
              if (meta.catKey === '1.8') {
                setKho(ten)
                if (loiO.kho) setLoiO(l => { const n = { ...l }; delete n.kho; return n })
              } else if (meta.catKey === '1.2') {
                const gia = Number(val.gia) || Number(val.giaMua) || 0
                setDsDong(ds => [...ds, {
                  ma,
                  ten,
                  dvt: String(val.dvt ?? 'Cái'),
                  dvtChinh: String(val.dvt ?? 'Cái'),
                  giaGoc: gia,
                  sl: laKk ? 0 : 1,
                  gia: laKk ? 0 : gia,
                  tien: laKk ? 0 : gia,
                  ts: 0,
                  thue: 0,
                  tonHt: 0,
                  tonTt: undefined,
                  kho,
                  ghiChu: '',
                }])
              }
              setMoThemDm(null)
            }}
          />
        )
      })()}
    </>
  )

  if (laKk) {
    return (
      <div className="m-kk-form-man">
        {/* Thanh đầu */}
        <header className="m-pb-thanh-dau">
          <button type="button" className="m-pb-btn-back" onClick={handleQuayLai} aria-label="Quay lại">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="m-pb-tieu-de">{dangSua ? `Sửa ${row?.so ?? ''}` : 'Lập phiếu kiểm kê'}</h2>
          <span className="m-pb-thanh-dau-phai" />
        </header>

        {/* Thân cuộn */}
        <div className="m-pb-noi-dung">
          {/* Thẻ tổng quan */}
          <div className="m-pb-the m-pb-the-tong-quan">
            <div className="m-pb-hang-chip">
              <span className="m-pb-chip-loai">Kiểm kê định kỳ</span>
              <span className={`m-pb-chip-tt ${soDaDem === dsDong.length && dsDong.length > 0 ? 'dang' : 'cho'}`}>
                Đã đếm {soDaDem}/{dsDong.length}
              </span>
            </div>
            <label className="f-nhan">Kho kiểm kê <i>*</i></label>
            <span
              className="f-o-lon f-chon-lon"
              id="m-lp-o-kho"
              onClick={() => (cuaHang ? setMoChonKho(true) : setMoChonCn(true))}
            >
              <span>{kho || 'Chọn kho'}</span>
              <b>›</b>
            </span>
            {loiO.kho && <div className="m-lp-loi-o" style={{ color: 'var(--red)' }}>{loiO.kho}</div>}

            <div className="m-pb-dong-cn" onClick={() => setMoLich(true)} style={{ cursor: 'pointer' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="1.8" fill="none">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span>Giờ kiểm tự lấy: {thoiGian}</span>
            </div>

            <div className="m-pb-luoi-stat">
              <div className="m-pb-o-stat xanh">
                <div className="m-pb-o-stat-nhan">Thừa</div>
                <div className="m-pb-o-stat-so xanh">{tongThuaTxt}</div>
              </div>
              <div className="m-pb-o-stat do">
                <div className="m-pb-o-stat-nhan">Thiếu</div>
                <div className="m-pb-o-stat-so do">{tongThieuTxt}</div>
              </div>
            </div>
          </div>

          {/* Nhóm Thông tin kiểm kê */}
          <div className="m-pb-nhom">THÔNG TIN KIỂM KÊ</div>
          <div className="m-pb-the m-pb-the-gon">
            <div className="m-pb-dong">
              <span className="n">Người kiểm</span>
              <input
                className="f-gt f-input"
                value={nguoiKiem}
                onChange={e => setNguoiKiem(e.target.value)}
                placeholder="Nhập người kiểm"
              />
            </div>
            <div className="m-pb-dong">
              <span className="n">Diễn giải</span>
              <input
                className="f-gt f-input"
                value={ghiChu}
                onChange={e => setGhiChu(e.target.value)}
                placeholder="Nhập diễn giải"
              />
            </div>
          </div>

          {/* Nhóm Đếm thực tế */}
          <div className="m-pb-nhom">ĐẾM THỰC TẾ ({dsDong.length})</div>
          <div className="f-tim">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <input
              type="text"
              placeholder="Tìm hàng trong kho…"
              value={timKiemKho}
              onChange={e => setTimKiemKho(e.target.value)}
            />
            {timKiemKho && (
              <button type="button" className="f-tim-x" onClick={() => setTimKiemKho('')} aria-label="Xoá tìm kiếm">
                ✕
              </button>
            )}
          </div>

          {dsDongKkHienThi.map(({ d, originalIndex }) => {
            const tonHt = Number(d.tonHt ?? 0)
            const chuaDem = d.tonTt === undefined || d.tonTt === null || (d.tonTt as unknown) === ''
            let chipClass = 'khop'
            let chipTxt = 'Chưa đếm'
            let chenhClass = ''
            let chenhTxt = '–'

            const dvtChinh = d.dvtChinh || NVL.find(n => n.ma === d.ma || n.ten === d.ten)?.dvt || HANG.find(h => h.ma === d.ma || h.ten === d.ten)?.dvt || d.dvt || 'kg'
            const dsQd = quyDoiTuDanhMuc(d.ten, dvtChinh)
            const coQd = s.goi !== 'F' && dsQd.length > 0
            const dvtHienThi = d.dvt || dvtChinh

            if (!chuaDem) {
              const tonTt = Number(d.tonTt)
              const chenh = Math.round((tonTt - tonHt) * 100) / 100
              if (chenh < 0) {
                chipClass = 'xuat'
                chipTxt = `${chenh} ${dvtHienThi}`
                chenhClass = 'do'
                chenhTxt = `${chenh}`
              } else if (chenh > 0) {
                chipClass = 'nhap'
                chipTxt = `+${chenh} ${dvtHienThi}`
                chenhClass = 'xanh'
                chenhTxt = `+${chenh}`
              } else {
                chipClass = 'khop'
                chipTxt = 'Khớp'
                chenhClass = ''
                chenhTxt = '0'
              }
            }

            const strVal = d.strTonTt !== undefined ? d.strTonTt : (chuaDem ? '' : String(d.tonTt))

            return (
              <div
                key={d.ma || originalIndex}
                className={`m-pb-the m-pb-muc-dong ${chuaDem ? 'f-chua-dem' : ''}`}
              >
                <div className="m-pb-muc-hang1">
                  <span className="m-pb-muc-ten kk-ten">
                    <b>{d.ten}</b>
                    {d.ma && <small>{d.ma}</small>}
                  </span>
                  <span className={`chip-kk ${chipClass}`}>{chipTxt}</span>
                </div>
                <div className="m-kk-o3 kk4">
                  <div className="m-kk-o3-item kk-o-dvt">
                    <span className="m-kk-o3-nhan">ĐVT</span>
                    {coQd ? (
                      <button
                        type="button"
                        className="kk-dvt-btn chon"
                        onClick={() => moChonDvt(originalIndex)}
                      >
                        {dvtHienThi} ▾
                      </button>
                    ) : (
                      <span className="kk-dvt-btn">{dvtHienThi}</span>
                    )}
                  </div>
                  <div className="m-kk-o3-item">
                    <span className="m-kk-o3-nhan">Tồn sổ</span>
                    <span className="m-kk-o3-so">{soLuong(tonHt)}</span>
                  </div>
                  <div className="m-kk-o3-item">
                    <span className="m-kk-o3-nhan">Thực tế *</span>
                    <input
                      className="f-o-dem"
                      value={strVal}
                      placeholder="Nhập"
                      inputMode="decimal"
                      onChange={e => handleTonTtChange(originalIndex, e.target.value)}
                    />
                  </div>
                  <div className="m-kk-o3-item">
                    <span className="m-kk-o3-nhan">Chênh lệch</span>
                    <span className={`m-kk-o3-so ${chenhClass}`}>{chenhTxt}</span>
                  </div>
                </div>
              </div>
            )
          })}

          <button
            type="button"
            className="f-them"
            onClick={() => setMoChonHang(true)}
          >
            + Thêm hàng kiểm kê
          </button>

          <p className="f-goi-y">
            Danh sách lấy sẵn hàng có tồn trong kho. Thêm hàng: chọn hàng chưa có trong danh sách (tồn sổ 0), nhập số đếm thực tế.
            {soChuaDem > 0
              ? ` Còn ${soChuaDem} mặt hàng chưa đếm${dsTenChuaDem ? ` (${dsTenChuaDem})` : ''}, lưu vẫn được, hàng chưa đếm giữ nguyên tồn sổ.`
              : ' Đã đếm xong tất cả mặt hàng trong danh sách.'}
          </p>
        </div>

        {/* Chân ghim đáy */}
        <div className="m-pb-day">
          <button type="button" className="m-pb-btn-phu" onClick={handleQuayLai}>
            Huỷ
          </button>
          <button
            type="button"
            className="m-pb-btn-sua"
            onClick={() => thucHienLuu(false)}
          >
            Lưu phiếu kiểm kê
          </button>
        </div>

        {renderCacBangChon()}
      </div>
    )
  }

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
        {/* ════ THÔNG TIN CHUNG: KHO, KHO NHẬN, THỜI GIAN, GHI CHÚ (T300) ════ */}
        <div className="m-the-trang m-lp-nhom-dong">
          {/* Cửa hàng: chỉ hiện khi đang xem Tất cả cửa hàng (T357) */}
          {!cnChon && (
            <>
              <div
                className="m-lp-dong-o"
                id="m-lp-o-cuaHang"
                onClick={() => { if (!gocData?.cn) setMoChonCn(true) }}
              >
                <div className="m-lp-dong-trai">
                  <Icon n="cuahang" className="ic sm m-lp-dong-ic" kieu="net" />
                  <div className="m-lp-dong-nd">
                    <span className="m-lp-dong-nhan">Cửa hàng <b className="m-lp-sao">*</b></span>
                    <span className={`m-lp-dong-tri ${!cuaHang ? 'mo' : ''}`}>{cuaHang || 'Chọn cửa hàng'}</span>
                  </div>
                </div>
                {!gocData?.cn && <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" kieu="net" />}
              </div>
              {loiO.cuaHang && <div className="m-lp-loi-o">{loiO.cuaHang}</div>}
            </>
          )}

          {/* Kho chính */}
          <div
            className="m-lp-dong-o"
            id="m-lp-o-kho"
            onClick={() => (cuaHang ? setMoChonKho(true) : setMoChonCn(true))}
          >
            <div className="m-lp-dong-trai">
              <Icon n="cuahang" className="ic sm m-lp-dong-ic" kieu="net" />
              <div className="m-lp-dong-nd">
                <span className="m-lp-dong-nhan">
                  {laKk
                    ? 'Kho kiểm kê'
                    : laDcn
                    ? (dcn === 'ndc' ? 'Kho nhận' : 'Kho xuất')
                    : laSx
                    ? (SX[sx!].nhap ? 'Kho nhập' : 'Kho xuất')
                    : 'Kho'} <b className="m-lp-sao">*</b>
                </span>
                <span className={`m-lp-dong-tri ${!kho ? 'mo' : ''}`}>{kho || 'Chọn kho'}</span>
              </div>
            </div>
            <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" kieu="net" />
          </div>
          {loiO.kho && <div className="m-lp-loi-o">{loiO.kho}</div>}

          {/* Cửa hàng nhận (xdc) */}
          {laDcn && dcn === 'xdc' && (
            <>
              <div
                className="m-lp-dong-o"
                id="m-lp-o-cnNhan"
                onClick={() => setMoChonCnNhan(true)}
              >
                <div className="m-lp-dong-trai">
                  <Icon n="cuahang" className="ic sm m-lp-dong-ic" kieu="net" />
                  <div className="m-lp-dong-nd">
                    <span className="m-lp-dong-nhan">Cửa hàng nhận <b className="m-lp-sao">*</b></span>
                    <span className={`m-lp-dong-tri ${!cnNhan ? 'mo' : ''}`}>{cnNhan || 'Chọn cửa hàng nhận'}</span>
                  </div>
                </div>
                <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" kieu="net" />
              </div>
              {loiO.cnNhan && <div className="m-lp-loi-o">{loiO.cnNhan}</div>}
            </>
          )}

          {/* Kho nhận (điều chuyển) */}
          {laDcn && (dcn === 'ck' || dcn === 'xdc') && (
            <>
              <div
                className="m-lp-dong-o m-lp-kho-nhan-wrap"
                id="m-lp-o-khoNhan"
                onClick={() => setMoChonKhoNhan(true)}
              >
                <div className="m-lp-dong-trai">
                  <Icon n="cuahang" className="ic sm m-lp-dong-ic" kieu="net" />
                  <div className="m-lp-dong-nd">
                    <span className="m-lp-dong-nhan">Kho nhận <b className="m-lp-sao">*</b></span>
                    <span className={`m-lp-dong-tri ${!khoNhan ? 'mo' : ''}`}>{khoNhan || 'Chọn kho nhận'}</span>
                  </div>
                </div>
                <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" kieu="net" />
              </div>
              {loiO.khoNhan && <div className="m-lp-loi-o">{loiO.khoNhan}</div>}
            </>
          )}

          {/* Thời gian */}
          <div
            className="m-lp-dong-o m-lp-the-truong"
            id="m-lp-o-thoiGian"
            onClick={() => setMoLich(true)}
          >
            <div className="m-lp-dong-trai">
              <Icon n="clock" className="ic sm m-lp-dong-ic" kieu="net" />
              <div className="m-lp-dong-nd">
                <span className="m-lp-dong-nhan">Thời gian <b className="m-lp-sao">*</b></span>
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

          {/* Ghi chú / Diễn giải */}
          <div className="m-lp-dong-o m-lp-dong-nhap">
            <div className="m-lp-dong-trai" style={{ width: '100%' }}>
              <Icon n="file" className="ic sm m-lp-dong-ic" kieu="net" />
              <input
                type="text"
                className="m-lp-dong-inp"
                placeholder={laDc ? 'Lý do điều chỉnh' : 'Ghi chú'}
                value={ghiChu}
                onChange={e => setGhiChu(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ════ NHÓM 2: DANH SÁCH HÀNG HOÁ / KIỂM KÊ / SẢN XUẤT ════ */}
        {/* Với sản xuất chế biến: Khối chọn thành phẩm */}
        {laSx && sx === 'xcb' && (
          <div className="m-lp-tp-hop">
            <div className="m-lp-hang-man-tieu-hang">
              <span className="m-lp-hang-man-tieu-chu">THÀNH PHẨM CHẾ BIẾN ({dsTpCoCongThuc.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dsTpCoCongThuc.map(c => {
                const tp = hangCua(c.spMa)
                const dangChon = tpChonMa === c.spMa && dsDong.length > 0
                return (
                  <div
                    key={c.id}
                    className={`m-the-trang m-lp-tp-the ${dangChon ? 'on' : ''}`}
                    onClick={() => apDungCongThucSx(c.spMa, tpSoLuong)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{tp?.ten ?? c.spMa}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        Mã: {c.spMa} · {c.moTa || 'Công thức chuẩn'}
                      </div>
                    </div>
                    <div className={`m-lp-cb-hang ${dangChon ? 'on' : ''}`}>
                      {dangChon && <Icon n="check" className="ic sm" kieu="net" />}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="m-lp-tp-sl" style={{ marginTop: 10 }}>
              <span className="m-lp-sua-nhan">Số lượng làm:</span>
              <input
                type="text"
                className="m-lp-sua-inp num"
                style={{ width: 80 }}
                value={tpSoLuong}
                onChange={e => {
                  const n = Number(e.target.value.replace(/\D/g, '')) || 1
                  apDungCongThucSx(tpChonMa, n)
                }}
              />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{hangCua(tpChonMa)?.dvt ?? 'Tô'}</span>
            </div>
          </div>
        )}

        {/* Danh sách hàng hoá */}
        <div className="m-lp-khoi-hang-man" id="m-lp-o-hang">
          <div className="m-lp-hang-man-tieu-hang">
            <span className="m-lp-hang-man-tieu-chu">
              {laKk ? 'CHI TIẾT KIỂM KÊ' : 'DANH SÁCH HÀNG HOÁ'} ({dsDong.length})
            </span>
            {(!laSx || sx !== 'xcb') && (
              <button
                type="button"
                className="m-lp-btn-them-nhanh"
                onClick={() => setMoChonHang(true)}
              >
                <Icon n="plus" className="ic sm" kieu="net" /> Thêm hàng
              </button>
            )}
          </div>

          {dsDong.length === 0 ? (
            <div
              className="m-the-trang m-lp-hang-trong-hop"
              onClick={() => {
                if (!laSx || sx !== 'xcb') setMoChonHang(true)
              }}
            >
              <div style={{ color: 'var(--muted)', marginBottom: 6 }}><Icon n="box" className="ic md" kieu="net" /></div>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Chưa có mặt hàng nào</span>
              {(!laSx || sx !== 'xcb') && (
                <span className="m-lp-btn-them-chu">+ Chọn mặt hàng</span>
              )}
            </div>
          ) : (
            <div className="m-th-danh-sach">
              {dsDong.map((d, i) => (
                <TheHangKho
                  key={i}
                  d={d}
                  idx={i}
                  laKk={laKk}
                  dcn={dcn}
                  goi={s.goi}
                  onDoi={patch => doiDong(i, patch)}
                  onXoa={() => xoaDong(i)}
                  onNhanBan={() => nhanBanDong(i)}
                  onMoChonDvt={() => moChonDvt(i)}
                  onSuaTong={tien => suaTongTien(i, tien)}
                />
              ))}
            </div>
          )}
          {loiO.hang && <div className="m-lp-loi-o">{loiO.hang}</div>}
        </div>
      </div>

      {/* ── THANH CỐ ĐỊNH Ở ĐÁY: TỔNG TIỀN / MẶT HÀNG & NÚT LƯU LẠI ── */}
      <div className="m-lp-day m-lp-day-mot-man">
        <div className="m-lp-day-hang-tong">
          {laKk ? (
            <>
              <span className="m-lp-day-nhan">Mặt hàng:</span>
              <span className="m-lp-day-tong dam">{dsDong.length}</span>
            </>
          ) : (
            <>
              <span className="m-lp-day-nhan">Tổng tiền:</span>
              <span className="m-lp-day-tong dam cam">{money(tongTien)} đ</span>
            </>
          )}
        </div>
        <button
          type="button"
          className="m-lp-nut-chinh m-lp-nut-luu"
          onClick={() => thucHienLuu(false)}
        >
          Lưu lại
        </button>
      </div>

      {/* ── BẢNG CHỌN ── */}
      {renderCacBangChon()}


    </div>
  )
}
