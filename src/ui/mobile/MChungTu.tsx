import { useEffect, useMemo, useState, type FC, type ReactNode } from 'react'
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { duongDan } from '../../app/registry'
import { cuaHangHienTai, useSession } from '../../app/session'
import { anNgoaiGoi, kieuGhiSo } from '../../app/plan'
import { docNgay, khoangThang, trongKhoang } from '../ChonNgay'
import { money, rutGonSo } from '../format'
import { dsChipTT, khopChipTT } from '../LocNangCao'
import { chieuTien, dauTien, lopChieu } from './chieuTien'
import { TT_CT, dongCua } from '../generic/gen'
import { ttTienTheoTra } from '../generic/daXoa'
import { boO, nhomCua, theoLoai, TT_TIEN } from '../generic/nhom'
import { ChungTuForm, lyMacDinh } from '../generic/ChungTuForm'
import { useDongChungTu } from '../generic/VoucherScreen'
import { useDsPhieuDcn } from '../../modules/kho/BangDieuChuyen'
import { useDsPhieuSx } from '../../modules/kho/BangSanXuat'
import { MChon } from './MChon'
import { MDanhSach } from './MDanhSach'
import { MLapPhieu } from './MLapPhieu'
import { MDtThuChiDs } from './MDtThuChiDs'
import { MDtThuChiLap } from './MDtThuChiLap'
import { coLocKhacMacDinh, MAC_DINH_LOC_MOBILE, MLoc, tinhKhoangNgay, type GtLocMobile } from './MLoc'
import { MXemPhieu } from './MXemPhieu'
import { MBaoCaoTheoDoi } from './MBaoCaoTheoDoi'
import { CUA_HANG } from '../../data/mock'
import { ChonCuaHangTruoc, layChiNhanhNho, luuChiNhanhNho } from '../ChonCuaHangTruoc'

// Tách lớp ngoài để danh sách luôn gọi đủ hook, không trả sớm theo id
export const MChungTu: FC<ScreenProps> = ({ sc, mod }) => {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const sua = sp.get('sua') === '1'
  const { cfg } = useDongChungTu(sc, mod)

  // T353 điểm 13b: Điều chỉnh kho trên điện thoại chỉ xem, chặn lối lập phiếu mới
  if (cfg.dieuChinh && id === 'moi') {
    return <Navigate to={duongDan(mod, sc)} replace />
  }

  if (id === 'moi' || sua) {
    if (sp.get('full') === '1' || sp.get('form') === 'full') {
      return <ChungTuMoiForm sc={sc} mod={mod} id={id} />
    }
    if (mod.key === 'tien') {
      return <MDtThuChiLap key={id ?? 'moi'} sc={sc} mod={mod} id={id} />
    }
    return <MLapPhieu sc={sc} mod={mod} id={id} />
  }
  if (id !== undefined) {
    return <MXemPhieu sc={sc} mod={mod} id={id} />
  }
  if (mod.key === 'tien') {
    return <MDtThuChiDs sc={sc} mod={mod} />
  }
  return <DsChungTu sc={sc} mod={mod} />
}

const ChungTuMoiForm: FC<{ sc: ScreenProps['sc']; mod: ScreenProps['mod']; id?: string }> = ({ sc, mod, id }) => {
  const loc = useLocation()
  const { cfg, rows } = useDongChungTu(sc, mod)
  const row = id === 'moi' ? undefined : rows.find(r => String(r.id) === String(id))
  return <ChungTuForm key={loc.key + loc.search} sc={sc} mod={mod} cfg={cfg} row={row} rows={rows} anIn />
}

const CAC_THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

function dinhDangThuNgay(chuoiNgay: string): string {
  const d = docNgay(chuoiNgay)
  if (isNaN(d.getTime())) return chuoiNgay
  const thu = CAC_THU[d.getDay()]
  const ngay = String(d.getDate()).padStart(2, '0')
  const thang = String(d.getMonth() + 1).padStart(2, '0')
  const nam = d.getFullYear()
  return `${thu}, ${ngay}/${thang}/${nam}`
}

const DsChungTu: FC<ScreenProps> = ({ sc, mod }) => {
  const { s, set } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const { cfg, rows: rowsGoc } = useDongChungTu(sc, mod)
  const rowsDcn = useDsPhieuDcn(cfg.dieuChuyen ?? 'xdc')
  const rowsSx = useDsPhieuSx(cfg.sanXuat ?? 'xsc')
  const rowsGocChung = cfg.dieuChuyen ? rowsDcn : cfg.sanXuat ? rowsSx : rowsGoc
  const rows = useMemo(() => {
    if (mod.key !== 'tien') return rowsGocChung
    return rowsGocChung.map((r): Row => {
      const loaiK = cfg.loai?.find(x => x.k === r.loai)?.k ?? cfg.loai?.[0]?.k
      const cfgDong = theoLoai(cfg, loaiK)
      const oLy = boO(nhomCua(mod.key, cfgDong, loaiK), cfgDong).a.find(o => o.k === 'ly')
      return { ...r, lyDo: !oLy ? '' : r._lyDo ? String(r._lyDo) : lyMacDinh(oLy.ds ?? [], String(r.dienGiai ?? '')) }
    })
  }, [rowsGocChung, mod.key, cfg])

  const ghi = kieuGhiSo(s.goi) !== 'khong' && s.goi !== 'F'
  const cnChon = cuaHangHienTai(s)

  // Chip trạng thái
  // ?tt=nhap từ mục Chứng từ chưa ghi sổ ở trang chủ thì bật sẵn chip đó
  const [sp, setSearchParams] = useSearchParams()
  const [chipTT, setChipTT] = useState(() => sp.get('tt') ?? 'all')

  // Bộ lọc nâng cao (T394: đọc tham số ?lyDo= và ?thang=)
  const [locMo, setLocMo] = useState(false)
  const [locVal, setLocVal] = useState<GtLocMobile>(() => {
    const khoiTao: GtLocMobile = {
      ...MAC_DINH_LOC_MOBILE,
      chiNhanh: s.cuaHang || 'all',
      trangThai: sp.get('tt') ?? 'all',
    }
    const thangUrl = sp.get('thang')
    if (thangUrl) {
      const [namStr, thangStr] = thangUrl.split('-')
      const nam = Number(namStr)
      const th = Number(thangStr)
      if (nam && th >= 1 && th <= 12) {
        khoiTao.thoiGian = 'tuy-chon'
        khoiTao.khoangNgay = khoangThang(th, nam)
      }
    }
    const lyDoUrl = sp.get('lyDo')
    if (lyDoUrl) {
      khoiTao.lyDo = [lyDoUrl]
    }
    return khoiTao
  })

  const dsChiNhanh = useMemo(
    () => [{ k: 'all', ten: 'Tất cả chi nhánh' }, ...CUA_HANG.map(c => ({ k: c.id, ten: c.ten }))],
    [],
  )

  useEffect(() => {
    setLocVal(prev => ({ ...prev, chiNhanh: s.cuaHang || 'all' }))
  }, [s.cuaHang])

  useEffect(() => {
    const ttUrl = sp.get('tt') ?? 'all'
    setChipTT(ttUrl)
    setLocVal(prev => ({ ...prev, trangThai: ttUrl }))
  }, [sp])

  // Loại chứng từ (với màn nhiều loại)
  const [loaiChon, setLoaiChon] = useState<string>(() => (cfg.dieuChinh ? (cfg.loai?.[0]?.k ?? '') : ''))

  // Chọn loại khi bấm thêm mới
  const [moChonLoai, setMoChonLoai] = useState(false)

  // Danh sách đối tượng, nguồn, kho, lý do cho bộ lọc
  const dsDoiTuong = useMemo(
    () => [...new Set(rows.map(r => String(r.doiTuong ?? '')).filter(Boolean))].sort(),
    [rows],
  )
  const dsNguon = useMemo(() => {
    const raw = [...new Set(rows.map(r => String(r.nguon ?? 'tay')))]
    return raw.map(k => ({ k, ten: k }))
  }, [rows])
  const dsKho = useMemo(() => {
    const raw = [...new Set(rows.flatMap(r => ((r._khoDs as string[] | undefined) ?? (r.kho ? [String(r.kho)] : []))))]
    return raw.filter(Boolean).sort()
  }, [rows])
  const dsLyDo = useMemo(
    () => mod.key === 'tien' ? [...new Set(rows.map(r => String(r.lyDo ?? '')).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi')) : [],
    [rows, mod.key],
  )

  // Lọc sơ bộ (thời gian, cửa hàng, loại, bộ lọc nâng cao)
  const kn = tinhKhoangNgay(locVal.thoiGian, locVal.khoangNgay)
  const truocTT = useMemo(() => {
    return rows.filter(r => {
      // 1. Thời gian
      if (kn) {
        const d = docNgay(String(r.ngay).split(' ')[0])
        if (!trongKhoang(d, kn)) return false
      }
      // 2. Cửa hàng
      if (cnChon && r.cn !== cnChon.ten) return false
      // 3. Loại chứng từ (tab con) (T299: Thu chi gói Free gộp Tiền mặt và Ngân hàng)
      if (loaiChon) {
        if (mod.key === 'tien' && s.goi === 'F') {
          if (loaiChon === 'tien-mat') {
            if (r.loai !== 'thu' && r.loai !== 'chi') return false
          } else if (loaiChon === 'ngan-hang') {
            if (r.loai !== 'bc' && r.loai !== 'unc') return false
          } else if (loaiChon === 'cq') {
            if (r.loai !== 'cq') return false
          }
        } else {
          if (r.loai !== loaiChon) return false
        }
      }
      // 4. Đối tượng từ bộ lọc
      if (locVal.doiTuong && locVal.doiTuong.length > 0) {
        if (!locVal.doiTuong.includes(String(r.doiTuong ?? ''))) return false
      }
      // 5. Nguồn từ bộ lọc
      if (locVal.nguon && locVal.nguon.length > 0) {
        if (!locVal.nguon.includes(String(r.nguon ?? 'tay'))) return false
      }
      // 6. Kho từ bộ lọc
      if (locVal.kho && locVal.kho.length > 0) {
        const khoDs = (r._khoDs as string[] | undefined) ?? (r.kho ? [String(r.kho)] : [])
        if (!khoDs.some(k => locVal.kho.includes(k))) return false
      }
      // 7. Lý do nghiệp vụ từ bộ lọc (T394)
      if (locVal.lyDo && locVal.lyDo.length > 0) {
        if (!locVal.lyDo.includes(String(r.lyDo ?? ''))) return false
      }
      return true
    })
  }, [rows, kn, cnChon, loaiChon, locVal])

  // Chip trạng thái tính trên truocTT
  const chipsGoc = useMemo(() => dsChipTT(truocTT, ghi), [truocTT, ghi])
  const chips = useMemo(
    () => chipsGoc.map(c => ({ k: c.k, ten: c.ten, dem: c.so })),
    [chipsGoc],
  )

  // Danh sách cuối cùng sau chip trạng thái
  const list = useMemo(() => {
    return truocTT.filter(r => khopChipTT(chipTT, r.tt, ghi))
  }, [truocTT, chipTT, ghi])

  const tongTien = useMemo(() => list.reduce((a, r) => a + (Number(r.tong) || 0), 0), [list])

  // Chiều tiền của từng chứng từ, phục vụ tính tổng thu chi và màu sắc (mục 2.1, 2.2, 2.3)
  const dsChieu = useMemo(() => list.map(r => chieuTien(mod.key, cfg, r)), [list, mod.key, cfg])
  const coVao = dsChieu.includes('vao')
  const coRa = dsChieu.includes('ra')
  const coCaHaiChieu = coVao && coRa
  const coChieu = coVao || coRa

  const { tongThu, tongChi, chenhLech } = useMemo(() => {
    let thu = 0
    let chi = 0
    list.forEach((r, idx) => {
      const tien = Number(r.tong) || 0
      if (dsChieu[idx] === 'vao') thu += tien
      else if (dsChieu[idx] === 'ra') chi += tien
    })
    return { tongThu: thu, tongChi: chi, chenhLech: thu - chi }
  }, [list, dsChieu])

  const [moChonCnTruoc, setMoChonCnTruoc] = useState(false)
  const [dichDenThem, setDichDenThem] = useState<string | null>(null)

  const thucHienThem = (dich: string) => {
    if (s.cuaHang === 'all') {
      const cnNho = layChiNhanhNho()
      if (cnNho && CUA_HANG.some(c => c.id === cnNho)) {
        set({ cuaHang: cnNho })
        nav(dich)
      } else {
        setDichDenThem(dich)
        setMoChonCnTruoc(true)
      }
      return
    }
    nav(dich)
  }

  // Thêm mới (T299: gói Free ở tab Chuyển quỹ mở thẳng, tab Tiền mặt/Ngân hàng mở 2 loại; T353 điểm 13b: Điều chỉnh kho trên điện thoại chỉ xem)
  const khongThem = Boolean(cfg.khongThem || cfg.dieuChinh)
  const handleThem = khongThem
    ? undefined
    : () => {
        if (mod.key === 'tien' && s.goi === 'F') {
          if (loaiChon === 'cq') {
            thucHienThem(`${path}/moi?loai=cq`)
          } else {
            setMoChonLoai(true)
          }
          return
        }
        if (cfg.loai && cfg.loai.length > 0) {
          setMoChonLoai(true)
        } else {
          thucHienThem(`${path}/moi`)
        }
      }

  // Danh sách loại phiếu khi thêm mới (T299: gói Free lọc theo tab Tiền mặt / Ngân hàng)
  const dsLoaiThemMoi = useMemo(() => {
    if (!cfg.loai) return []
    if (mod.key === 'tien' && s.goi === 'F') {
      if (loaiChon === 'tien-mat') {
        return cfg.loai.filter(l => l.k === 'thu' || l.k === 'chi')
      }
      if (loaiChon === 'ngan-hang') {
        return cfg.loai.filter(l => l.k === 'bc' || l.k === 'unc')
      }
    }
    return cfg.loai
  }, [cfg.loai, mod.key, s.goi, loaiChon])

  const [moTheoDoi, setMoTheoDoi] = useState(false)

  // Hàng tabs ngang: các loại phiếu / màn chứng từ trong phân hệ + tab Báo cáo theo dõi
  const hangTabs = useMemo(() => {
    // T299: Phân hệ Thu chi gói Free đúng 5 tab: Tất cả, Tiền mặt, Ngân hàng, Chuyển quỹ, Báo cáo theo dõi
    if (mod.key === 'tien' && s.goi === 'F') {
      const tabsFree = [
        { k: '', ten: 'Tất cả' },
        { k: 'tien-mat', ten: 'Tiền mặt' },
        { k: 'ngan-hang', ten: 'Ngân hàng' },
        { k: 'cq', ten: 'Chuyển quỹ' },
      ]
      return (
        <div className="m-ds-hang-tabs" role="tablist">
          {tabsFree.map(t => (
            <button
              key={t.k}
              type="button"
              role="tab"
              aria-selected={loaiChon === t.k}
              className={`m-tab-chu${loaiChon === t.k ? ' on' : ''}`}
              onClick={() => setLoaiChon(t.k)}
            >
              {t.ten}
            </button>
          ))}
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="m-tab-chu"
            onClick={() => setMoTheoDoi(true)}
          >
            Báo cáo theo dõi
          </button>
        </div>
      )
    }

    if (mod.key === 'kho') {
      if (anNgoaiGoi(s.goi)) {
        return (
          <div className="m-ds-hang-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={true}
              className="m-tab-chu on"
            >
              {sc.ngan ?? sc.ten}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={false}
              className="m-tab-chu"
              onClick={() => setMoTheoDoi(true)}
            >
              Báo cáo theo dõi
            </button>
          </div>
        )
      }
      const isNk = sc.code === '5.1.1' || sc.slug === '5-1-1'
      const isXk = sc.code === '5.1.2-4' || sc.slug === '5-1-2-4'
      const isXh = sc.code === '5.1.2-3' || sc.slug === '5-1-2-3'
      return (
        <div className="m-ds-hang-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={isNk}
            className={`m-tab-chu${isNk ? ' on' : ''}`}
            onClick={() => nav('/app/kho/5-1-1')}
          >
            Nhập khác
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isXk}
            className={`m-tab-chu${isXk ? ' on' : ''}`}
            onClick={() => nav('/app/kho/5-1-2-4')}
          >
            Xuất khác
          </button>
          {isXh && (
            <button
              type="button"
              role="tab"
              aria-selected={true}
              className="m-tab-chu on"
            >
              Xuất huỷ
            </button>
          )}
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="m-tab-chu"
            onClick={() => setMoTheoDoi(true)}
          >
            Báo cáo theo dõi
          </button>
        </div>
      )
    }

    if (mod.key === 'ccdc') {
      const is812 = sc.code === '8.1.2' || sc.slug === '8-1-2'
      const is813 = sc.code === '8.1.3' || sc.slug === '8-1-3'
      return (
        <div className="m-ds-hang-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="m-tab-chu"
            onClick={() => nav('/app/ccdc/8-1-1')}
          >
            Thẻ chi phí
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={is812}
            className={`m-tab-chu${is812 ? ' on' : ''}`}
            onClick={() => nav('/app/ccdc/8-1-2')}
          >
            Tăng, giảm CCDC
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={is813}
            className={`m-tab-chu${is813 ? ' on' : ''}`}
            onClick={() => nav('/app/ccdc/8-1-3')}
          >
            Kiểm kê CCDC
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="m-tab-chu"
            onClick={() => setMoTheoDoi(true)}
          >
            Báo cáo theo dõi
          </button>
        </div>
      )
    }

    if (mod.key === 'mua-hang') {
      if (anNgoaiGoi(s.goi)) {
        return (
          <div className="m-ds-hang-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={true}
              className="m-tab-chu on"
            >
              Chứng từ mua hàng
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={false}
              className="m-tab-chu"
              onClick={() => setMoTheoDoi(true)}
            >
              Báo cáo theo dõi
            </button>
          </div>
        )
      }
      const is411 = sc.code === '4.1.1' || sc.slug === '4-1-1'
      const is412 = sc.code === '4.1.2' || sc.slug === '4-1-2'
      const is414 = sc.code === '4.1.4' || sc.slug === '4-1-4'
      const is415 = sc.code === '4.1.5' || sc.slug === '4-1-5'
      return (
        <div className="m-ds-hang-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={is411}
            className={`m-tab-chu${is411 ? ' on' : ''}`}
            onClick={() => nav('/app/mua-hang/4-1-1')}
          >
            Chứng từ mua hàng
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={is412}
            className={`m-tab-chu${is412 ? ' on' : ''}`}
            onClick={() => nav('/app/mua-hang/4-1-2')}
          >
            Hoá đơn mua hàng
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={is414}
            className={`m-tab-chu${is414 ? ' on' : ''}`}
            onClick={() => nav('/app/mua-hang/4-1-4')}
          >
            Trả lại hàng mua
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={is415}
            className={`m-tab-chu${is415 ? ' on' : ''}`}
            onClick={() => nav('/app/mua-hang/4-1-5')}
          >
            Chi phí mua hàng
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="m-tab-chu"
            onClick={() => setMoTheoDoi(true)}
          >
            Báo cáo theo dõi
          </button>
        </div>
      )
    }

    if (cfg.loai && cfg.loai.length > 0) {
      return (
        <div className="m-ds-hang-tabs" role="tablist">
          {!cfg.dieuChinh && (
            <button
              type="button"
              role="tab"
              aria-selected={loaiChon === ''}
              className={`m-tab-chu${loaiChon === '' ? ' on' : ''}`}
              onClick={() => setLoaiChon('')}
            >
              Tất cả
            </button>
          )}
          {cfg.loai.map(l => (
            <button
              key={l.k}
              type="button"
              role="tab"
              aria-selected={loaiChon === l.k}
              className={`m-tab-chu${loaiChon === l.k ? ' on' : ''}`}
              onClick={() => setLoaiChon(l.k)}
            >
              {l.ten}
            </button>
          ))}
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="m-tab-chu"
            onClick={() => setMoTheoDoi(true)}
          >
            Báo cáo theo dõi
          </button>
        </div>
      )
    }

    // Các phân hệ khác có 1 màn chính: hiện tab chính và tab Báo cáo theo dõi
    return (
      <div className="m-ds-hang-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={true}
          className="m-tab-chu on"
        >
          {sc.ngan ?? sc.ten}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={false}
          className="m-tab-chu"
          onClick={() => setMoTheoDoi(true)}
        >
          Báo cáo theo dõi
        </button>
      </div>
    )
  }, [mod.key, sc, cfg.loai, cfg.dieuChinh, loaiChon, nav, s.goi])

  const pad = (n: number) => String(n).padStart(2, '0')
  const khoangNgayHienThi = kn
    ? `${pad(kn.tu.getDate())}/${pad(kn.tu.getMonth() + 1)}/${kn.tu.getFullYear()} - ${pad(kn.den.getDate())}/${pad(kn.den.getMonth() + 1)}/${kn.den.getFullYear()}`
    : '16/09/2026 - 15/11/2026'

  const isMan411 = mod.key === 'mua-hang' && (sc.code === '4.1.1' || sc.slug === '4-1-1')
  const [timMo411, setTimMo411] = useState(false)
  const [tuKhoa411, setTuKhoa411] = useState('')
  const [sortMoiNhat411, setSortMoiNhat411] = useState(true)

  const list411 = useMemo(() => {
    let res = list
    if (tuKhoa411.trim()) {
      const q = tuKhoa411.trim().toLowerCase()
      res = res.filter(r => {
        const text = `${r.so} ${r.doiTuong ?? ''} ${r.dienGiai ?? ''} ${r.cn ?? ''}`.toLowerCase()
        return text.includes(q)
      })
    }
    return res
  }, [list, tuKhoa411])

  const tongTien411 = useMemo(() => list411.reduce((a, r) => a + (Number(r.tong) || Number(r.tien) || 0), 0), [list411])

  const nhomTheoNgay411 = useMemo(() => {
    const map = new Map<string, Row[]>()
    for (const r of list411) {
      const ngayRaw = String(r.ngay ?? '').split(' ')[0]
      const cur = map.get(ngayRaw) ?? []
      cur.push(r)
      map.set(ngayRaw, cur)
    }
    const arr = Array.from(map.entries()).map(([ngayRaw, ds]) => {
      const tongNgay = ds.reduce((sum, r) => sum + (Number(r.tong) || Number(r.tien) || 0), 0)
      return {
        ngayRaw,
        tieuDeNgay: dinhDangThuNgay(ngayRaw),
        tongNgay,
        ds,
      }
    })
    arr.sort((a, b) => {
      const da = docNgay(a.ngayRaw).getTime()
      const db = docNgay(b.ngayRaw).getTime()
      return sortMoiNhat411 ? db - da : da - db
    })
    return arr
  }, [list411, sortMoiNhat411])

  const chuoiKhoangNgay411 = kn
    ? `${pad(kn.tu.getDate())}/${pad(kn.tu.getMonth() + 1)} – ${pad(kn.den.getDate())}/${pad(kn.den.getMonth() + 1)}/${kn.den.getFullYear()}`
    : ''

  const nhanCn = cnChon ? cnChon.ten : 'CN: Tất cả'
  const chipHienTai = chips.find(c => c.k === chipTT)
  const nhanTrangThai = chipHienTai ? `Trạng thái: ${chipHienTai.ten}` : 'Trạng thái'

  const quayLai = () => {
    if (window.history.state && window.history.state.idx > 0) {
      nav(-1)
    } else {
      nav('/app/nghiep-vu', { replace: true })
    }
  }

  return (
    <>
      {isMan411 ? (
        <div className="m-tc-man m-ds-khung">
          {/* Header */}
          <header className="m-tc-header">
            <div className="m-tc-nav">
              <button
                type="button"
                className="m-tc-btn-nav"
                onClick={quayLai}
                aria-label="Quay lại"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <h1 className="m-tc-tieu-de">Mua hàng</h1>
              <button
                type="button"
                className={`m-tc-btn-nav${timMo411 ? ' on' : ''}`}
                onClick={() => {
                  setTimMo411(v => !v)
                  if (timMo411) setTuKhoa411('')
                }}
                aria-label="Tìm kiếm"
              >
                <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
              </button>
            </div>

            {/* Ô tìm kiếm khi mở */}
            {timMo411 && (
              <div className="m-tc-tim-wrap">
                <svg className="m-tc-tim-ic" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  autoFocus
                  className="m-tc-tim-inp m-ds-tim-inp"
                  placeholder="Tìm mã chứng từ, đối tượng, diễn giải..."
                  value={tuKhoa411}
                  onChange={e => setTuKhoa411(e.target.value)}
                  aria-label="Tìm kiếm chứng từ"
                />
                {tuKhoa411 && (
                  <button
                    type="button"
                    className="m-tc-tim-x"
                    onClick={() => setTuKhoa411('')}
                    aria-label="Xoá tìm kiếm"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {hangTabs}
          </header>

          <main className="m-tc-content">
            {/* Hàng bộ lọc */}
            <div className="m-tc-loc-bar">
              <button
                type="button"
                className={`m-tc-btn-loc-vuong m-ds-nut-loc-vuong m-ds-nut-loc${coLocKhacMacDinh(locVal) ? ' co-loc' : ''}`}
                onClick={() => setLocMo(true)}
                aria-label="Bộ lọc nâng cao"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                {coLocKhacMacDinh(locVal) && <span className="m-tc-loc-cham" />}
              </button>

              {chuoiKhoangNgay411 && <span className="m-chip-xem">{chuoiKhoangNgay411}</span>}
              <span className="m-chip-xem">{nhanCn}</span>
              <span className="m-chip-xem">{nhanTrangThai}</span>
              {locVal.doiTuong?.map(dt => (
                <span key={dt} className="m-chip-xem">Đối tượng: {dt}</span>
              ))}
              {locVal.kho?.map(kh => (
                <span key={kh} className="m-chip-xem">Kho: {kh}</span>
              ))}
            </div>

            {/* Thẻ tổng */}
            <div className="m-mh-card-tong">
              <div className="m-mh-th-trai">
                <span className="m-mh-th-dem">{list411.length} chứng từ</span>
                {chuoiKhoangNgay411 && <span className="m-mh-th-ngay">{chuoiKhoangNgay411}</span>}
              </div>
              <div className="m-mh-th-phai">
                <span className="m-mh-th-nhan">Tổng cộng</span>
                <span className="m-mh-th-so">{money(tongTien411)} đ</span>
              </div>
            </div>

            {/* Hàng Sắp xếp */}
            <div className="m-mh-hang-sx">
              <span className="m-mh-sx-tieu-de">Danh sách chứng từ</span>
              <button
                type="button"
                className="m-mh-sx-btn"
                onClick={() => setSortMoiNhat411(v => !v)}
                aria-label="Sắp xếp chứng từ"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16M4 12h10M4 18h5" />
                </svg>
                <span>{sortMoiNhat411 ? 'Mới nhất' : 'Cũ nhất'}</span>
              </button>
            </div>

            {/* Danh sách nhóm theo ngày */}
            {list411.length === 0 ? (
              <div className="m-trong m-mh-trong m-tc-trong">
                <p>Không có chứng từ nào phù hợp</p>
              </div>
            ) : (
              <div className="m-mh-ds-nhom">
                {nhomTheoNgay411.map(nhom => (
                  <div key={nhom.ngayRaw} className="m-mh-nhom-item">
                    <div className="m-mh-nhom-header">
                      <span className="m-mh-nhom-ngay">{nhom.tieuDeNgay}</span>
                      <span className="m-mh-nhom-tong">{money(nhom.tongNgay)} đ</span>
                    </div>
                    <div className="m-mh-the-trang">
                      {nhom.ds.map((r, i) => {
                        const cfgLoai = theoLoai(cfg, r.loai)
                        const laHang = cfgLoai.dong === 'hang' || cfgLoai.dong === 'nvl'
                        let soDongHang = 0
                        if (laHang) {
                          if (Array.isArray(r._dong)) {
                            soDongHang = r._dong.length
                          } else {
                            const idSeed = `${sc.code ?? sc.slug}-${r.id}`
                            soDongHang = dongCua(cfgLoai, idSeed).length
                          }
                        }
                        const ncc = r.doiTuong || r.ncc || r.dienGiai || '—'
                        const tien = Number(r.tong ?? r.tien ?? 0)

                        return (
                          <button
                            type="button"
                            key={String(r.id ?? r.so ?? i)}
                            className="m-mh-dong-phieu m-the-ct m-ds-ngay-dong"
                            onClick={() => nav(`${path}/${r.id}`)}
                          >
                            <div className="m-mh-dong-trai">
                              <div className="m-mh-dong-hang1">
                                <span className="m-mh-dong-so">{r.so}</span>
                                {soDongHang > 0 && <span className="m-mh-dong-hh">{soDongHang} hàng hoá</span>}
                              </div>
                              <span className="m-mh-dong-ncc" title={ncc}>{ncc}</span>
                            </div>
                            <span className="m-mh-dong-tien">{money(tien)} đ</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Nút thêm mới FAB */}
          <button
            type="button"
            className="m-tc-fab-btn"
            onClick={handleThem}
            aria-label="Thêm mới chứng từ"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      ) : (
        <MDanhSach
        rows={list}
        timTheo={(r, q) => {
          const text = `${r.so} ${r.doiTuong ?? ''} ${r.dienGiai ?? ''} ${r.cn ?? ''}`.toLowerCase()
          return text.includes(q.toLowerCase())
        }}
        timPlaceholder="Số chứng từ, đối tượng, diễn giải..."
        chips={ghi ? chips : []}
        chipChon={chipTT}
        onChipChon={setChipTT}
        onMoLoc={() => setLocMo(true)}
        coLoc={coLocKhacMacDinh(locVal)}
        khoangNgayHienThi={khoangNgayHienThi}
        onThem={handleThem}
        nhanThem={cfg.them ?? '+ Thêm mới'}
        hangTabs={hangTabs}
        tomTat={
          coCaHaiChieu ? (
            <span>
              {list.length} chứng từ · Thu {rutGonSo(tongThu)} / Chi {rutGonSo(tongChi)}
            </span>
          ) : (
            <span>
              {list.length} chứng từ · {money(tongTien)} đ
            </span>
          )
        }
        the={(r, i) => {
          const ttInfo = TT_CT[r.tt] ?? ['dim', r.tt]
          const anTien = Boolean(cfg.kiemKe || cfg.dieuChuyen === 'ck' || sc.code === '5.1.10' || sc.code === '5.1.4.3')
          const tienHienThi = anTien ? null : `${money(Math.abs(r.tong ?? 0))} đ`

          const cfgLoai = theoLoai(cfg, r.loai)
          const laHang = cfgLoai.dong === 'hang' || cfgLoai.dong === 'nvl'
          let soDongHang = 0
          if (laHang) {
            if (Array.isArray(r._dong)) {
              soDongHang = r._dong.length
            } else {
              const idSeed = `${sc.code ?? sc.slug}-${r.id}`
              soDongHang = dongCua(cfgLoai, idSeed).length
            }
          }

          const doiTuongOrCn = r.doiTuong || r.cn || r.dienGiai || '—'
          const ngayHienThi = String(r.ngay ?? '').split(' ')[0]
          const thongTinHang = soDongHang > 0 ? `${ngayHienThi} · ${soDongHang} hàng hoá` : ngayHienThi
          const ttNhan = (r.tt === 1 || r.tt === 'ok' || r.tt === '1' || r.tt === 2) ? 'Hoàn thành' : (r.tt === 0 ? 'Chưa ghi sổ' : (ttInfo[1] || 'Hoàn thành'))
          const ttCls = (r.tt === 1 || r.tt === 'ok' || r.tt === '1' || r.tt === 2) ? 'ok' : (r.tt === 0 ? 'cho' : 'ok')

          return (
            <div
              key={`${String(r.id ?? r.so ?? '')}_${i}`}
              className="m-the-ct"
              onClick={() => nav(`${path}/${r.id}`)}
              role="button"
              tabIndex={0}
            >
              <div className="m-the-ct-hang1">
                <span className="m-the-ct-so">{r.so}</span>
                {ghi && <span className={`m-the-ct-tag ${ttCls}`}>{ttNhan}</span>}
              </div>
              <div className="m-the-ct-hang2">
                <span className="m-the-ct-dt">{doiTuongOrCn}</span>
              </div>
              <div className="m-the-ct-vach" />
              <div className="m-the-ct-hang3">
                <span className="m-the-ct-ngay-hang">{thongTinHang}</span>
                {tienHienThi !== null && (
                  <span className="m-the-ct-tien">{tienHienThi}</span>
                )}
              </div>
            </div>
          )
        }}
      />
      )}

      {/* Màn lọc toàn màn (T521) */}
      <MLoc
        mo={locMo}
        onDong={() => setLocMo(false)}
        giaTri={locVal}
        onApDung={val => {
          setLocVal(val)
          if (val.chiNhanh !== undefined) {
            const ch = CUA_HANG.find(c => c.id === val.chiNhanh || c.ten === val.chiNhanh)
            const chId = ch ? ch.id : (val.chiNhanh === 'all' || !val.chiNhanh ? 'all' : val.chiNhanh)
            set({ cuaHang: chId })
          }
          if (val.trangThai !== undefined) {
            const nextTT = val.trangThai || 'all'
            setChipTT(nextTT)
            setSearchParams(prev => {
              const next = new URLSearchParams(prev)
              if (nextTT && nextTT !== 'all') {
                next.set('tt', nextTT)
              } else {
                next.delete('tt')
              }
              return next
            }, { replace: true })
          }
        }}
        dsDoiTuong={dsDoiTuong}
        nhanDoiTuong={cfg.nhan ?? 'Đối tượng'}
        dsNguon={dsNguon}
        dsKho={dsKho}
        dsLyDo={dsLyDo}
        dsChiNhanh={dsChiNhanh}
        dsTrangThai={ghi ? chips : undefined}
      />

      {/* Tấm trượt chọn loại phiếu khi thêm mới */}
      {cfg.loai && (
        <MChon
          mo={moChonLoai}
          onDong={() => setMoChonLoai(false)}
          tieuDe="Chọn loại phiếu"
          ds={dsLoaiThemMoi.map(l => ({ k: l.k, ten: l.ten }))}
          onChon={k => thucHienThem(`${path}/moi?loai=${k}`)}
        />
      )}

      {/* Tấm Báo cáo theo dõi & Danh mục */}
      <MBaoCaoTheoDoi
        mo={moTheoDoi}
        onDong={() => setMoTheoDoi(false)}
        modKey={mod.key}
      />

      <ChonCuaHangTruoc
        mo={moChonCnTruoc}
        laMobile={true}
        onDong={() => {
          setMoChonCnTruoc(false)
          setDichDenThem(null)
        }}
        onChon={idCuaHang => {
          luuChiNhanhNho(idCuaHang)
          set({ cuaHang: idCuaHang })
          setMoChonCnTruoc(false)
          if (dichDenThem) {
            nav(dichDenThem)
            setDichDenThem(null)
          }
        }}
      />
    </>
  )
}
