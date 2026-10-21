import { useEffect, useMemo, useState, type FC, type ReactNode } from 'react'
import { quayLaiMobile } from './quayLai'
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
import { MDsChungTuChuan, MDsDongPhieu, HangTabsBanHang } from './MDsChungTuChuan'
import { MLapPhieu } from './MLapPhieu'
import { MDtThuChiDs } from './MDtThuChiDs'
import { MDtThuChiLap } from './MDtThuChiLap'
import { coLocKhacMacDinh, MAC_DINH_LOC_MOBILE, MLoc, tinhKhoangNgay, type GtLocMobile } from './MLoc'
import { MXemPhieu } from './MXemPhieu'
import { MBaoCaoTheoDoi } from './MBaoCaoTheoDoi'
import { MAN_DC, MAN_KK } from '../../modules/kho/dieu-chinh'
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
  const [loaiChon, setLoaiChon] = useState<string>(() => (cfg.dieuChinh ? (sp.get('loai') ?? cfg.loai?.[0]?.k ?? '') : ''))

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
        <div className="m-tc-tabs" role="tablist">
          {tabsFree.map(t => (
            <button
              key={t.k}
              type="button"
              role="tab"
              aria-selected={loaiChon === t.k}
              className={`m-tc-tab-btn${loaiChon === t.k ? ' on' : ''}`}
              onClick={() => setLoaiChon(t.k)}
            >
              {t.ten}
            </button>
          ))}
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="m-tc-tab-btn"
            onClick={() => setMoTheoDoi(true)}
          >
            Báo cáo theo dõi
          </button>
        </div>
      )
    }

    if (mod.key === 'ban-hang') {
      return <HangTabsBanHang sc={sc} onMoTheoDoi={() => setMoTheoDoi(true)} />
    }

    if (mod.key === 'kho') {
      // T588: màn Kiểm kê và Xuất, Nhập điều chỉnh chung một hàng 4 tab; Điều chỉnh kho không còn mục riêng ở Nghiệp vụ
      if (cfg.kiemKe || cfg.dieuChinh) {
        const tabsKk = [
          { k: 'kk', ten: 'Kiểm kê', on: Boolean(cfg.kiemKe), di: () => nav(`/app/${MAN_KK}`) },
          { k: 'xdc', ten: 'Xuất điều chỉnh', on: Boolean(cfg.dieuChinh) && loaiChon === 'xdc', di: () => (cfg.dieuChinh ? setLoaiChon('xdc') : nav(`/app/${MAN_DC}?loai=xdc`)) },
          { k: 'ndc', ten: 'Nhập điều chỉnh', on: Boolean(cfg.dieuChinh) && loaiChon === 'ndc', di: () => (cfg.dieuChinh ? setLoaiChon('ndc') : nav(`/app/${MAN_DC}?loai=ndc`)) },
        ]
        return (
          <div className="m-tc-tabs" role="tablist">
            {tabsKk.map(t => (
              <button
                key={t.k}
                type="button"
                role="tab"
                aria-selected={t.on}
                className={`m-tc-tab-btn${t.on ? ' on' : ''}`}
                onClick={t.di}
              >
                {t.ten}
              </button>
            ))}
            <button
              type="button"
              role="tab"
              aria-selected={false}
              className="m-tc-tab-btn"
              onClick={() => setMoTheoDoi(true)}
            >
              Báo cáo
            </button>
          </div>
        )
      }
      if (anNgoaiGoi(s.goi)) {
        return (
          <div className="m-tc-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={true}
              className="m-tc-tab-btn on"
            >
              {sc.ngan ?? sc.ten}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={false}
              className="m-tc-tab-btn"
              onClick={() => setMoTheoDoi(true)}
            >
              Báo cáo theo dõi
            </button>
          </div>
        )
      }
      if (cfg.dieuChuyen || sc.code === '5.1.4' || sc.slug === '5-1-4' || sc.slug === '5-1-4-2' || sc.slug === '5-1-4-3') {
        const isXdc = sc.code === '5.1.4' || sc.slug === '5-1-4' || cfg.dieuChuyen === 'xdc'
        const isNdc = sc.slug === '5-1-4-2' || cfg.dieuChuyen === 'ndc'
        const isCk = sc.slug === '5-1-4-3' || cfg.dieuChuyen === 'ck'
        return (
          <div className="m-tc-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={isXdc}
              className={`m-tc-tab-btn${isXdc ? ' on' : ''}`}
              onClick={() => nav('/app/kho/5-1-4')}
            >
              Xuất điều chuyển
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isNdc}
              className={`m-tc-tab-btn${isNdc ? ' on' : ''}`}
              onClick={() => nav('/app/kho/5-1-4-2')}
            >
              Nhập điều chuyển
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isCk}
              className={`m-tc-tab-btn${isCk ? ' on' : ''}`}
              onClick={() => nav('/app/kho/5-1-4-3')}
            >
              Chuyển kho
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={false}
              className="m-tc-tab-btn"
              onClick={() => setMoTheoDoi(true)}
            >
              Báo cáo theo dõi
            </button>
          </div>
        )
      }
      if (cfg.sanXuat || ['5-1-6', '5-1-6-2', '5-1-3', '5-1-3-2'].includes(sc.slug)) {
        const isXsc = sc.slug === '5-1-6' || cfg.sanXuat === 'xsc'
        const isNsc = sc.slug === '5-1-6-2' || cfg.sanXuat === 'nsc'
        const isXcb = sc.slug === '5-1-3' || cfg.sanXuat === 'xcb'
        const isNcb = sc.slug === '5-1-3-2' || cfg.sanXuat === 'ncb'
        return (
          <div className="m-tc-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={isXsc}
              className={`m-tc-tab-btn${isXsc ? ' on' : ''}`}
              onClick={() => nav('/app/kho/5-1-6')}
            >
              Xuất sơ chế
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isNsc}
              className={`m-tc-tab-btn${isNsc ? ' on' : ''}`}
              onClick={() => nav('/app/kho/5-1-6-2')}
            >
              Nhập sơ chế
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isXcb}
              className={`m-tc-tab-btn${isXcb ? ' on' : ''}`}
              onClick={() => nav('/app/kho/5-1-3')}
            >
              Xuất chế biến
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isNcb}
              className={`m-tc-tab-btn${isNcb ? ' on' : ''}`}
              onClick={() => nav('/app/kho/5-1-3-2')}
            >
              Nhập chế biến
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={false}
              className="m-tc-tab-btn"
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
        <div className="m-tc-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={isNk}
            className={`m-tc-tab-btn${isNk ? ' on' : ''}`}
            onClick={() => nav('/app/kho/5-1-1')}
          >
            Nhập khác
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isXk}
            className={`m-tc-tab-btn${isXk ? ' on' : ''}`}
            onClick={() => nav('/app/kho/5-1-2-4')}
          >
            Xuất khác
          </button>
          {isXh && (
            <button
              type="button"
              role="tab"
              aria-selected={true}
              className="m-tc-tab-btn on"
            >
              Xuất huỷ
            </button>
          )}
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="m-tc-tab-btn"
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
        <div className="m-tc-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="m-tc-tab-btn"
            onClick={() => nav('/app/ccdc/8-1-1')}
          >
            Thẻ chi phí
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={is812}
            className={`m-tc-tab-btn${is812 ? ' on' : ''}`}
            onClick={() => nav('/app/ccdc/8-1-2')}
          >
            Tăng, giảm CCDC
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={is813}
            className={`m-tc-tab-btn${is813 ? ' on' : ''}`}
            onClick={() => nav('/app/ccdc/8-1-3')}
          >
            Kiểm kê CCDC
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="m-tc-tab-btn"
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
          <div className="m-tc-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={true}
              className="m-tc-tab-btn on"
            >
              Chứng từ mua hàng
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={false}
              className="m-tc-tab-btn"
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
        <div className="m-tc-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={is411}
            className={`m-tc-tab-btn${is411 ? ' on' : ''}`}
            onClick={() => nav('/app/mua-hang/4-1-1')}
          >
            Chứng từ mua hàng
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={is412}
            className={`m-tc-tab-btn${is412 ? ' on' : ''}`}
            onClick={() => nav('/app/mua-hang/4-1-2')}
          >
            Hoá đơn mua hàng
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={is414}
            className={`m-tc-tab-btn${is414 ? ' on' : ''}`}
            onClick={() => nav('/app/mua-hang/4-1-4')}
          >
            Trả lại hàng mua
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={is415}
            className={`m-tc-tab-btn${is415 ? ' on' : ''}`}
            onClick={() => nav('/app/mua-hang/4-1-5')}
          >
            Chi phí mua hàng
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="m-tc-tab-btn"
            onClick={() => setMoTheoDoi(true)}
          >
            Báo cáo theo dõi
          </button>
        </div>
      )
    }

    if (cfg.loai && cfg.loai.length > 0) {
      return (
        <div className="m-tc-tabs" role="tablist">
          {!cfg.dieuChinh && (
            <button
              type="button"
              role="tab"
              aria-selected={loaiChon === ''}
              className={`m-tc-tab-btn${loaiChon === '' ? ' on' : ''}`}
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
              className={`m-tc-tab-btn${loaiChon === l.k ? ' on' : ''}`}
              onClick={() => setLoaiChon(l.k)}
            >
              {l.ten}
            </button>
          ))}
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="m-tc-tab-btn"
            onClick={() => setMoTheoDoi(true)}
          >
            Báo cáo theo dõi
          </button>
        </div>
      )
    }

    // Các phân hệ khác có 1 màn chính: hiện tab chính và tab Báo cáo theo dõi
    return (
      <div className="m-tc-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={true}
          className="m-tc-tab-btn on"
        >
          {sc.ngan ?? sc.ten}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={false}
          className="m-tc-tab-btn"
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

  const chuoiKhoangNgay411 = kn
    ? `${pad(kn.tu.getDate())}/${pad(kn.tu.getMonth() + 1)} – ${pad(kn.den.getDate())}/${pad(kn.den.getMonth() + 1)}/${kn.den.getFullYear()}`
    : ''

  const nhanCn = cnChon ? cnChon.ten : 'CN: Tất cả'
  const chipHienTai = chips.find(c => c.k === chipTT)
  const nhanTrangThai = chipHienTai ? `Trạng thái: ${chipHienTai.ten}` : 'Trạng thái'

  const quayLai = () => quayLaiMobile(nav, '/app/nghiep-vu')

  const dungKhungChuan = mod.key === 'mua-hang' || mod.key === 'ban-hang' || mod.key === 'kho'

  const chipsLoc = useMemo(() => {
    const arr: ReactNode[] = []
    if (chuoiKhoangNgay411) {
      arr.push(<span key="kn" className="m-chip-xem">{chuoiKhoangNgay411}</span>)
    }
    arr.push(<span key="cn" className="m-chip-xem">{nhanCn}</span>)
    if (ghi) {
      arr.push(<span key="tt" className="m-chip-xem">{nhanTrangThai}</span>)
    }
    if (locVal.doiTuong?.length) {
      locVal.doiTuong.forEach(dt => {
        arr.push(<span key={`dt-${dt}`} className="m-chip-xem">{cfg.nhan ?? 'Đối tượng'}: {dt}</span>)
      })
    }
    if (locVal.kho?.length) {
      locVal.kho.forEach(kh => {
        arr.push(<span key={`kh-${kh}`} className="m-chip-xem">Kho: {kh}</span>)
      })
    }
    if (locVal.nguon?.length) {
      locVal.nguon.forEach(ng => {
        arr.push(<span key={`ng-${ng}`} className="m-chip-xem">Nguồn: {ng}</span>)
      })
    }
    if (locVal.lyDo?.length) {
      locVal.lyDo.forEach(ly => {
        arr.push(<span key={`ly-${ly}`} className="m-chip-xem">Lý do: {ly}</span>)
      })
    }
    if (locVal.loaiPhieu?.length) {
      locVal.loaiPhieu.forEach(lp => {
        arr.push(<span key={`lp-${lp}`} className="m-chip-xem">Loại: {lp}</span>)
      })
    }
    return arr
  }, [chuoiKhoangNgay411, nhanCn, ghi, nhanTrangThai, locVal, cfg.nhan])

  return (
    <>
      {dungKhungChuan ? (
        <MDsChungTuChuan
          tieuDe={mod.ngan ?? mod.ten}
          hangTabs={hangTabs}
          onQuayLai={quayLai}
          onMoLoc={() => setLocMo(true)}
          coLoc={coLocKhacMacDinh(locVal)}
          chipsLoc={chipsLoc}
          chuoiKhoangNgay={chuoiKhoangNgay411}
          hienTien={mod.key !== 'kho'}
          rows={list}
          renderDong={(r, i) => {
            const cfgLoai = theoLoai(cfg, r.loai)
            const laHang = cfgLoai.dong === 'hang' || cfgLoai.dong === 'nvl'
            let soDongHang = 0
            if (laHang || cfg.dieuChuyen || cfg.sanXuat || cfg.kiemKe) {
              if (Array.isArray(r._dong)) {
                soDongHang = r._dong.length
              } else {
                const idSeed = `${sc.code ?? sc.slug}-${r.id}`
                soDongHang = dongCua(cfgLoai, idSeed).length
              }
            }

            let dongPhu = '—'
            if (mod.key === 'kho') {
              if (cfg.dieuChuyen) {
                if (r.kho && r.khoNhan) dongPhu = `${r.kho} → ${r.khoNhan}`
                else if (r.khoXuat && r.kho) dongPhu = `${r.khoXuat} → ${r.kho}`
                else if (r.khoNhan) dongPhu = `${r.kho || r.khoXuat || ''} → ${r.khoNhan}`
                else dongPhu = String(r.kho || r.khoXuat || r.dienGiai || '—')
              } else {
                dongPhu = String(r.kho || (r._khoDs as string[])?.[0] || r.dienGiai || '—')
              }
            } else if (mod.key === 'ban-hang') {
              dongPhu = String(r.doiTuong || r.kh || r.dienGiai || '—')
            } else {
              dongPhu = String(r.doiTuong || r.ncc || r.dienGiai || '—')
            }

            const tien = Number(r.tong ?? r.tien ?? 0)
            const hienTien = mod.key !== 'kho'

            return (
              <MDsDongPhieu
                key={String(r.id ?? r.so ?? i)}
                so={String(r.so ?? '')}
                soDongHang={soDongHang}
                dongPhu={dongPhu}
                tien={tien}
                hienTien={hienTien}
                onClick={() => nav(`${path}/${r.id}`)}
              />
            )
          }}
          onThem={handleThem}
          nhanThem={cfg.them ?? 'Thêm mới'}
        />
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
        dsDoiTuong={cfg.doiTuong !== 'none' && dsDoiTuong.length > 0 ? dsDoiTuong : undefined}
        nhanDoiTuong={cfg.nhan ?? 'Đối tượng'}
        dsNguon={dsNguon}
        dsKho={dsKho.length > 0 ? dsKho : undefined}
        dsLyDo={dsLyDo.length > 0 ? dsLyDo : undefined}
        dsLoaiPhieu={cfg.loai && !cfg.dieuChinh ? cfg.loai.map(l => ({ k: l.k, ten: l.ten })) : undefined}
        dsChiNhanh={dsChiNhanh}
        dsTrangThai={ghi && chips.length > 0 ? chips : undefined}
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
