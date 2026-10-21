import { useCallback, useEffect, useMemo, useState, type FC } from 'react'
import { createPortal } from 'react-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { kyMacDinh, useSession } from '../../app/session'
import { fold, money } from '../format'
import { tenMan } from '../../app/registry'
import { TRUONG_DM } from '../../modules/danh-muc/truong-dm'
import { LY_DO } from '../../data/mock'
import { MDanhSach, type ChipItem } from './MDanhSach'
import { MFormDm } from './MFormDm'
import { Icon } from '../Icon'
import { useSearchParams } from 'react-router-dom'
import { GoiYLapPhieu } from '../generic/GoiYLapPhieu'
import { MChon } from './MChon'
import type { KieuMTrong } from './MTrong'

export const MDanhMuc: FC<ScreenProps> = ({ sc }) => {
  const { s, toast } = useSession()
  const cfg = sc.catalog ?? {
    cols: [
      { k: 'ma', t: 'Mã', cls: 'code' },
      { k: 'ten', t: 'Tên' },
    ],
    rows: () => [],
  }

  const laLyDo = sc.code === '1.16' || sc.slug === '1-16'
  const laPttt = sc.slug === 'phuong-thuc-thanh-toan'
  const laChiXem = laLyDo || laPttt

  const [ky] = useState(() => kyMacDinh(s))
  const cols0 = useMemo(
    () => (typeof cfg.cols === 'function' ? cfg.cols(s.goi, s.cheDo) : cfg.cols),
    [cfg.cols, s.goi, s.cheDo],
  )

  // Ghi đè trạng thái bật/tắt theo dòng khi người dùng đổi trong form (T181, T183)
  const [ttGhiDe, setTtGhiDe] = useState<Record<string, number>>({})
  // Ghi đè Là chi phí của Lý do nghiệp vụ (T353)
  const [chiPhiGhiDe, setChiPhiGhiDe] = useState<Record<string, boolean>>({})
  useEffect(() => {
    setTtGhiDe({})
    setChiPhiGhiDe({})
  }, [sc, s.cheDo])

  const khoaDong = useCallback(
    (r: Row) =>
      String(
        r._k ??
          r.ma ??
          r.so ??
          r.username ??
          r.id ??
          (cols0[0]?.k ? r[cols0[0].k] : undefined) ??
          r.ten ??
          '',
      ),
    [cols0],
  )

  const allGoc = useMemo(
    () => cfg.rows(s.cheDo, ky).filter(r => !cfg.locGoi || cfg.locGoi(s.goi, r)),
    [cfg, s.cheDo, ky, s.goi],
  )
  const all = useMemo((): Row[] => {
    return allGoc.map((r, i) => {
      const k = String(
        r.ma ??
          r.so ??
          r.username ??
          r.id ??
          (cols0[0]?.k ? r[cols0[0].k] : undefined) ??
          r.ten ??
          `_r_${i}`,
      )
      const _k = r._k ?? k
      const tt = ttGhiDe[_k] !== undefined ? ttGhiDe[_k] : r._tt
      const chiPhi = chiPhiGhiDe[_k] !== undefined ? chiPhiGhiDe[_k] : r.chiPhi
      return { ...r, _k, _tt: tt, chiPhi }
    })
  }, [allGoc, ttGhiDe, chiPhiGhiDe, cols0])

  // Điện thoại không tạo kho mới, kể cả ở danh mục và chứng từ; kho khai trên web (T539)
  const laKho = sc.code === '1.8' || sc.slug === '1-8'
  const choThem = !laChiXem && !laKho && !cfg.khongThem?.includes(s.goi)

  const nhoms = useMemo(() => {
    if (!cfg.nhomLoc) return []
    return Array.from(new Set(all.map(r => String(r[cfg.nhomLoc!] ?? '')).filter(Boolean))).sort()
  }, [all, cfg.nhomLoc])

  const laHangHoa = sc.code === '1.2' || sc.slug === 'hang-hoa' || sc.slug === '1-2'
  const CAC_DM_FABI = ['1.2', '1-2', 'hang-hoa', 'nhom-hang-hoa', 'cua-hang', 'phuong-thuc-thanh-toan']
  const hienFabi = CAC_DM_FABI.includes(sc.code ?? '') || CAC_DM_FABI.includes(sc.slug ?? '')

  const [locTrangThai, setLocTrangThai] = useState<'hd' | 'ngung' | 'all'>('hd')
  const [tabPhanLoai, setTabPhanLoai] = useState<'tat-ca' | 'da-phan-loai' | 'chua-phan-loai'>('tat-ca')
  const [boLocNangCao, setBoLocNangCao] = useState<Record<string, string>>({})
  const [moLoc, setMoLoc] = useState(false)
  const [draftTrangThai, setDraftTrangThai] = useState<'hd' | 'ngung' | 'all'>('hd')
  const [draftLoc, setDraftLoc] = useState<Record<string, string>>({})
  const [trangCon, setTrangCon] = useState<string | null>(null)
  const [timKiem, setTimKiem] = useState('')
  const [phaiEl, setPhaiEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPhaiEl(document.getElementById('m-thanh-tren-phai-slot'))
  }, [])

  useEffect(() => {
    setLocTrangThai('hd')
    setTabPhanLoai('tat-ca')
    setBoLocNangCao({})
  }, [sc])

  const allSauTrangThai = useMemo(() => {
    if (!locTrangThai || locTrangThai === 'all') return all
    if (locTrangThai === 'hd') return all.filter(r => r._tt !== 0)
    if (locTrangThai === 'ngung') return all.filter(r => r._tt === 0)
    return all
  }, [all, locTrangThai])

  const demTatCa = allSauTrangThai.length
  const demDaPhanLoai = useMemo(() => allSauTrangThai.filter(r => Boolean(r.loai)).length, [allSauTrangThai])
  const demChuaPhanLoai = useMemo(() => allSauTrangThai.filter(r => !r.loai).length, [allSauTrangThai])

  const demDangHd = useMemo(() => all.filter(r => r._tt !== 0).length, [all])
  const demKhongHd = useMemo(() => all.filter(r => r._tt === 0).length, [all])

  // Các cột lọc nâng cao của riêng từng danh mục
  const cacCotLoc = useMemo(() => {
    const bo = new Set(['_stt', 'ma', 'ten', 'so', '_tt', '_k', '_cn', 'stk', 'mst'])
    return cols0.filter(c => c.k && !bo.has(c.k))
  }, [cols0])

  const luaChonCot = useMemo(() => {
    const res: Record<string, string[]> = {}
    cacCotLoc.forEach(c => {
      const vals = Array.from(new Set(all.map(r => String(r[c.k] ?? '')).filter(Boolean))).sort()
      if (vals.length > 0) res[c.k] = vals
    })
    return res
  }, [cacCotLoc, all])

  // Số lượng điều kiện lọc đang bật: lọc trạng thái (mặc định Đang hoạt động được đếm) và các trường nâng cao
  const soLoc = (locTrangThai && locTrangThai !== 'all' ? 1 : 0) + Object.values(boLocNangCao).filter(Boolean).length

  const rows = useMemo(() => {
    return all.filter(r => {
      if (locTrangThai) {
        if (locTrangThai === 'hd' && r._tt === 0) return false
        if (locTrangThai === 'ngung' && r._tt !== 0) return false
      }
      if (laHangHoa) {
        if (tabPhanLoai === 'da-phan-loai' && !r.loai) return false
        if (tabPhanLoai === 'chua-phan-loai' && Boolean(r.loai)) return false
      }
      for (const [k, v] of Object.entries(boLocNangCao)) {
        if (!v) continue
        if (v === '__co__' && !r[k]) return false
        if (v === '__khong__' && Boolean(r[k])) return false
        if (v !== '__co__' && v !== '__khong__' && String(r[k] ?? '') !== v) return false
      }
      return true
    })
  }, [all, locTrangThai, laHangHoa, tabPhanLoai, boLocNangCao])

  const chips: ChipItem[] = useMemo(() => {
    if (laHangHoa) {
      return [
        { k: 'tat-ca', ten: 'Tất cả', dem: demTatCa },
        { k: 'da-phan-loai', ten: 'Đã phân loại', dem: demDaPhanLoai },
        { k: 'chua-phan-loai', ten: 'Chưa phân loại', dem: demChuaPhanLoai },
      ]
    }
    return [
      { k: 'hd', ten: 'Đang hoạt động', dem: demDangHd },
      { k: 'ngung', ten: 'Không hoạt động', dem: demKhongHd },
      { k: 'all', ten: 'Tất cả', dem: all.length },
    ]
  }, [laHangHoa, demTatCa, demDaPhanLoai, demChuaPhanLoai, demDangHd, demKhongHd, all.length])

  const cotSo = useMemo(() => cols0.find(c => c.num || c.k === 'gia'), [cols0])

  const kieuTrong: KieuMTrong =
    sc.slug === '1-2' ? 'hang' : sc.slug === '1-8' ? 'kho' : sc.slug === '1-5' ? 'ncc' : 'chung'

  const cauHinh = useMemo(
    () => cfg.truong ?? TRUONG_DM[sc.code ?? ''] ?? TRUONG_DM[sc.slug ?? ''],
    [cfg.truong, sc.code, sc.slug],
  )

  const [edit, setEdit] = useState<Row | null>(null)
  const [dienSan, setDienSan] = useState<Row | undefined>(undefined)
  const [xemLyDo, setXemLyDo] = useState<Row | null>(null)
  const [xemPttt, setXemPttt] = useState<Row | null>(null)

  const ten = tenMan(sc)

  // Tạo quỹ từ trang chủ (?moi=1&goiY=thuchi): mở thẳng form thêm, lưu quỹ mới xong gợi ý lập phiếu thu, chi (T250)
  const [thamSo, setThamSo] = useSearchParams()
  const [goiYThuChi, setGoiYThuChi] = useState(false)
  const [quyVuaTao, setQuyVuaTao] = useState<Row | null>(null)
  useEffect(() => {
    if (thamSo.get('moi') === null) return
    if (laChiXem || laKho) { setThamSo({}, { replace: true }); return }
    setGoiYThuChi(thamSo.get('goiY') === 'thuchi')
    setEdit({})
    setDienSan(undefined)
    setThamSo({}, { replace: true })
  }, [thamSo, laChiXem, laKho])   // eslint-disable-line react-hooks/exhaustive-deps

  const handleLuu = useCallback(
    (val: Record<string, any>, themTiep: boolean) => {
      if (val) {
        const k = khoaDong(val)
        if (val._tt !== undefined && k) {
          setTtGhiDe(prev => ({ ...prev, [k]: Number(val._tt) }))
        }
        if (val.chiPhi !== undefined && k) {
          setChiPhiGhiDe(prev => ({ ...prev, [k]: Boolean(val.chiPhi) }))
          const item = LY_DO.find(x => x.ma === val.ma)
          if (item) item.chiPhi = Boolean(val.chiPhi)
        }
      }
      toast('Đã lưu')
      if (goiYThuChi && val && !edit?.ma && !themTiep) { setQuyVuaTao(val); setGoiYThuChi(false) }
      if (!themTiep) setEdit(null)
    },
    [khoaDong, toast, goiYThuChi, edit],
  )

  return (
    <>
      {/* Nút lọc icon phễu trên header góc phải (T434) */}
      {phaiEl && createPortal(
        <button
          type="button"
          className="m-thanh-tren-nut-loc m-dm-nut-loc-pheu"
          onClick={() => {
            setDraftTrangThai(locTrangThai)
            setDraftLoc(boLocNangCao)
            setTrangCon(null)
            setTimKiem('')
            setMoLoc(true)
          }}
          title="Bộ lọc danh mục"
          aria-label="Bộ lọc danh mục"
        >
          <Icon n="filter" className="ic" />
          {soLoc > 0 && <span className="m-thanh-tren-loc-cham" />}
        </button>,
        phaiEl
      )}

      <MDanhSach
        kieuDanhMuc={true}
        rows={rows}
        timTheo={(r, qText) => {
          const text = Object.values(r)
            .map(v => (v && typeof v === 'object' ? '' : String(v ?? '')))
            .join(' ')
          return fold(text).includes(fold(qText))
        }}
        timPlaceholder="Nhập từ khóa"
        hangTabs={
          laHangHoa ? (
            <div className="m-dm-tabs-khoi">
              <div className="m-dm-chip-tt-wrap">
                <button
                  type="button"
                  className="m-dm-chip-tt"
                  onClick={() => {
                    setLocTrangThai(prev => prev === 'hd' ? 'ngung' : prev === 'ngung' ? 'all' : 'hd')
                  }}
                  title="Bấm để đổi trạng thái"
                >
                  <span>Trạng thái: {locTrangThai === 'hd' ? 'Đang hoạt động' : locTrangThai === 'ngung' ? 'Ngừng hoạt động' : 'Tất cả'}</span>
                </button>
              </div>
              <div className="m-dm-tabs">
                <button
                  type="button"
                  className={`m-dm-tab${tabPhanLoai === 'tat-ca' ? ' active' : ''}`}
                  onClick={() => setTabPhanLoai('tat-ca')}
                >
                  <span>Tất cả</span>
                  <span className="m-dm-tab-dem">{demTatCa}</span>
                </button>
                <button
                  type="button"
                  className={`m-dm-tab${tabPhanLoai === 'da-phan-loai' ? ' active' : ''}`}
                  onClick={() => setTabPhanLoai('da-phan-loai')}
                >
                  <span>Đã phân loại</span>
                  <span className="m-dm-tab-dem">{demDaPhanLoai}</span>
                </button>
                <button
                  type="button"
                  className={`m-dm-tab${tabPhanLoai === 'chua-phan-loai' ? ' active' : ''}`}
                  onClick={() => setTabPhanLoai('chua-phan-loai')}
                >
                  <span>Chưa phân loại</span>
                  {demChuaPhanLoai > 0 && <span className="m-dm-tab-dem">{demChuaPhanLoai}</span>}
                </button>
              </div>
            </div>
          ) : (
            <div className="m-dm-tabs">
              <button
                type="button"
                className={`m-dm-tab${locTrangThai === 'hd' ? ' active' : ''}`}
                onClick={() => setLocTrangThai('hd')}
              >
                <span>Đang hoạt động</span>
                <span className="m-dm-tab-dem">{demDangHd}</span>
              </button>
              <button
                type="button"
                className={`m-dm-tab${locTrangThai === 'ngung' ? ' active' : ''}`}
                onClick={() => setLocTrangThai('ngung')}
              >
                <span>Ngừng hoạt động</span>
                <span className="m-dm-tab-dem">{demKhongHd}</span>
              </button>
            </div>
          )
        }
        nutTrai={
          hienFabi ? (
            <button
              type="button"
              className="m-nut-fabi-fab"
              onClick={() => toast(cfg.nutPhu?.bao ?? 'Đã đồng bộ từ FABi')}
              aria-label="Đồng bộ FABi"
              title="Đồng bộ FABi"
            >
              <Icon n="refresh" className="ic sm" />
              <span>Đồng bộ FABi</span>
            </button>
          ) : undefined
        }
        onThem={choThem ? () => { setEdit({}); setDienSan(undefined) } : undefined}
        nhanThem={cfg.them ?? '+ Thêm mới'}
        kieuTrong={kieuTrong}
        the={(r, i) => (
          <div
            key={`${String(r.id ?? r.ma ?? r.ten ?? '')}_${i}`}
            className="m-the-trang m-the-dm-v2 m-the-dm"
            onClick={() => {
              if (laLyDo) setXemLyDo(r)
              else if (laPttt) setXemPttt(r)
              else { setEdit(r); setDienSan(undefined) }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="m-the-dm-v2-trai m-the-dm-trai">
              <div className="m-the-dm-v2-dong-chinh">
                <span className="m-the-dm-v2-stt">{i + 1}.</span>
                <div className="m-the-dm-v2-khoi-ten">
                  <b className="m-the-dm-v2-ten m-the-dm-ten">{r.ten || r.ma}</b>
                  {r.ma && <span className="m-the-dm-v2-ma m-the-dm-ma"> - {r.ma}</span>}
                </div>
              </div>
              <div className="m-the-dm-v2-dong-phu m-the-dm-phu">
                {laHangHoa
                  ? `Đơn vị tính chính: ${r.dvt || 'Cái'}`
                  : (r.nhom ? `Nhóm: ${r.nhom}` : r.dvt ? `ĐVT: ${r.dvt}` : (r.mst ? `MST: ${r.mst}` : ''))}
              </div>
            </div>
            <div className="m-the-dm-v2-phai m-the-dm-phai">
              {!laHangHoa && cotSo && r[cotSo.k] !== undefined && cotSo.k !== 'thueGtgt' && cotSo.k !== 'ts' && (
                <span className="m-the-dm-so">
                  {typeof r[cotSo.k] === 'number' ? `${money(r[cotSo.k])} đ` : String(r[cotSo.k])}
                </span>
              )}
              <Icon n="chevr" className="ic sm m-the-dm-v2-chevron" />
            </div>
          </div>
        )}
      />

      {/* ── BỘ LỌC DANH MỤC TRƯỢT TỪ ĐÁY (T440) ── */}
      {moLoc && (
        <div
          className="m-loc-overlay"
          onClick={() => {
            setMoLoc(false)
            setTrangCon(null)
          }}
        >
          <div className="m-loc-tam" onClick={e => e.stopPropagation()}>
            <div className="m-tam-keo" />
            <div className="m-loc-dau">
              <h2 className="m-loc-tieu-de">Bộ lọc</h2>
              <button
                type="button"
                className="m-loc-btn-dong"
                onClick={() => {
                  setMoLoc(false)
                  setTrangCon(null)
                }}
                aria-label="Đóng"
              >
                <Icon n="x" className="ic sm" />
              </button>
            </div>

            <div className="m-loc-than">
              {/* Dòng Trạng thái */}
              <div
                className="m-loc-dong"
                onClick={() => {
                  setTrangCon('trangThai')
                  setTimKiem('')
                }}
              >
                <div className="m-loc-dong-trai">
                  <span className="m-loc-dong-nhan">Trạng thái</span>
                  <span className="m-loc-dong-tri">
                    {draftTrangThai === 'hd'
                      ? 'Đang hoạt động'
                      : draftTrangThai === 'ngung'
                        ? 'Không hoạt động'
                        : 'Tất cả'}
                  </span>
                </div>
                <Icon n="chevr" className="ic sm m-loc-dong-ic" />
              </div>

              {/* Các dòng cột lọc nâng cao */}
              {cacCotLoc.map(col => {
                const val = draftLoc[col.k] ?? ''
                let moTa = 'Tất cả'
                if (val === '__co__') moTa = 'Có'
                else if (val === '__khong__') moTa = 'Không'
                else if (val) moTa = val

                return (
                  <div
                    key={col.k}
                    className="m-loc-dong"
                    onClick={() => {
                      setTrangCon(col.k)
                      setTimKiem('')
                    }}
                  >
                    <div className="m-loc-dong-trai">
                      <span className="m-loc-dong-nhan">{col.t}</span>
                      <span className="m-loc-dong-tri">{moTa}</span>
                    </div>
                    <Icon n="chevr" className="ic sm m-loc-dong-ic" />
                  </div>
                )
              })}
            </div>

            <div className="m-loc-day">
              <button
                type="button"
                className="m-loc-btn-reset"
                onClick={() => {
                  setDraftTrangThai('hd')
                  setDraftLoc({})
                }}
              >
                Đặt lại
              </button>
              <button
                type="button"
                className="m-loc-btn-apply"
                onClick={() => {
                  setLocTrangThai(draftTrangThai)
                  setBoLocNangCao(draftLoc)
                  setMoLoc(false)
                  setTrangCon(null)
                }}
              >
                Áp dụng
              </button>
            </div>
          </div>

          {/* ── TRANG CON CHỌN ĐIỀU KIỆN (T440) ── */}
          {trangCon && (
            <div className="m-loc-trang-con" onClick={e => e.stopPropagation()}>
              <div className="m-thanh-tren">
                <div className="m-thanh-tren-trai">
                  <button
                    type="button"
                    className="m-nut-back"
                    onClick={() => {
                      setTrangCon(null)
                      setTimKiem('')
                    }}
                    aria-label="Quay lại"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7" vectorEffect="non-scaling-stroke" />
                    </svg>
                  </button>
                </div>
                <h1 className="m-thanh-tren-tieu-de">
                  {trangCon === 'trangThai'
                    ? 'Trạng thái'
                    : (cacCotLoc.find(c => c.k === trangCon)?.t ?? 'Chọn')}
                </h1>
                <div className="m-thanh-tren-phai" style={{ width: 36 }} />
              </div>

              {(() => {
                let dsMuc: { k: string; ten: string }[] = []
                let chonK = ''
                if (trangCon === 'trangThai') {
                  dsMuc = [
                    { k: 'hd', ten: 'Đang hoạt động' },
                    { k: 'ngung', ten: 'Không hoạt động' },
                    { k: 'all', ten: 'Tất cả' },
                  ]
                  chonK = draftTrangThai
                } else {
                  const opts = luaChonCot[trangCon] ?? []
                  if (opts.length > 0) {
                    dsMuc = [{ k: '', ten: 'Tất cả' }, ...opts.map(o => ({ k: o, ten: o }))]
                  } else {
                    dsMuc = [
                      { k: '', ten: 'Tất cả' },
                      { k: '__co__', ten: 'Có' },
                      { k: '__khong__', ten: 'Không' },
                    ]
                  }
                  chonK = draftLoc[trangCon] ?? ''
                }

                const dsHienThi = dsMuc.filter(m => {
                  if (!timKiem.trim()) return true
                  return fold(m.ten).includes(fold(timKiem.trim()))
                })

                return (
                  <>
                    <div className="m-loc-con-than">
                      {dsMuc.length > 5 && (
                        <div className="m-loc-tim-hop">
                          <Icon n="search" className="ic sm m-loc-tim-ic" />
                          <input
                            type="search"
                            className="m-loc-tim-inp"
                            placeholder="Tìm kiếm..."
                            value={timKiem}
                            onChange={e => setTimKiem(e.target.value)}
                            autoFocus
                          />
                          {timKiem && (
                            <button
                              type="button"
                              className="m-loc-tim-x"
                              onClick={() => setTimKiem('')}
                              aria-label="Xoá tìm kiếm"
                            >
                              <Icon n="x" className="ic sm" />
                            </button>
                          )}
                        </div>
                      )}

                      <div className="m-loc-ds-muc">
                        {dsHienThi.length === 0 ? (
                          <div className="m-loc-muc-trong">Không có kết quả</div>
                        ) : (
                          dsHienThi.map(m => {
                            const isChon = m.k === chonK
                            return (
                              <div
                                key={m.k}
                                className={`m-loc-muc-dong ${isChon ? 'on' : ''}`}
                                onClick={() => {
                                  if (trangCon === 'trangThai') {
                                    setDraftTrangThai(m.k as any)
                                  } else {
                                    setDraftLoc(prev => ({ ...prev, [trangCon]: m.k }))
                                  }
                                }}
                              >
                                <span className="m-loc-muc-ten">{m.ten}</span>
                                {isChon && <Icon n="check" className="ic sm m-loc-muc-tick" />}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>

                    <div className="m-loc-day">
                      <button
                        type="button"
                        className="m-loc-btn-apply m-loc-con-btn-xong"
                        onClick={() => {
                          setTrangCon(null)
                          setTimKiem('')
                        }}
                      >
                        Xong
                      </button>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </div>
      )}
      {edit && (
        <MFormDm
          sc={sc}
          cauHinh={cauHinh}
          edit={edit}
          dienSan={dienSan}
          nhomLoc={cfg.nhomLoc}
          all={all}
          cols0={cols0}
          nhoms={nhoms}
          ten={ten}
          tenNgan={sc.ngan ?? ten}
          chiXem={sc.slug === 'phuong-thuc-thanh-toan'}
          onDong={() => setEdit(null)}
          onLuu={handleLuu}
        />
      )}
      {xemLyDo && (
        <div className="m-form-dm m-dm-ct-hop">
          <div className="overlay" onClick={() => setXemLyDo(null)} />
          <aside className="pn-hop" role="dialog" aria-modal="true" aria-label={`Chi tiết ${xemLyDo.ten || xemLyDo.ma}`}>
            <div className="pn-dau">
              <div>
                <h3>Chi tiết lý do nghiệp vụ</h3>
                <small className="muted">{xemLyDo.ten || xemLyDo.ma}</small>
              </div>
              <button
                type="button"
                className="btn ghost sm"
                title="Đóng"
                onClick={() => setXemLyDo(null)}
              >
                <Icon n="x" className="ic sm" />
              </button>
            </div>
            <div className="pn-than">
              <div className="m-the-trang m-dm-the-ct">
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Mã lý do:</span>
                  <span className="m-xp-tri code">{xemLyDo.ma}</span>
                </div>
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Lý do nghiệp vụ:</span>
                  <span className="m-xp-tri dam">{xemLyDo.ten}</span>
                </div>
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Dùng cho:</span>
                  <span className="m-xp-tri">{xemLyDo.dung}</span>
                </div>
                {xemLyDo.dung === 'Chi tiền' && (
                  <div className="m-xp-dong-tt">
                    <span className="m-xp-nhan">Là chi phí:</span>
                    <span className="m-xp-tri dam">
                      {xemLyDo.chiPhi ? 'Có' : 'Không'}
                    </span>
                  </div>
                )}
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Trạng thái:</span>
                  <span className="m-xp-tri">
                    <span className={`m-ct-chip ${xemLyDo._tt === 0 ? 'dim' : 'ok'}`}>
                      {xemLyDo._tt === 0 ? 'Ngừng dùng' : 'Đang dùng'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="pn-chan">
              <button
                type="button"
                className="btn m-dm-nut-dong-chan"
                onClick={() => setXemLyDo(null)}
              >
                Đóng
              </button>
            </div>
          </aside>
        </div>
      )}
      {xemPttt && (
        <div className="m-form-dm m-dm-ct-hop">
          <div className="overlay" onClick={() => setXemPttt(null)} />
          <aside className="pn-hop" role="dialog" aria-modal="true" aria-label={`Chi tiết ${xemPttt.ten || xemPttt.ma}`}>
            <div className="pn-dau">
              <div>
                <h3>Chi tiết phương thức thanh toán</h3>
                <small className="muted">{xemPttt.ten || xemPttt.ma}</small>
              </div>
              <button
                type="button"
                className="btn ghost sm"
                title="Đóng"
                onClick={() => setXemPttt(null)}
              >
                <Icon n="x" className="ic sm" />
              </button>
            </div>
            <div className="pn-than">
              <div className="m-the-trang m-dm-the-ct">
                {cols0.map(c => {
                  const val = xemPttt[c.k]
                  if (val === undefined || val === '') return null
                  return (
                    <div key={c.k} className="m-xp-dong-tt">
                      <span className="m-xp-nhan">{c.t}:</span>
                      <span className={`m-xp-tri${c.cls === 'code' ? ' code' : ''}${c.k === 'ten' ? ' dam' : ''}`}>
                        {String(val)}
                      </span>
                    </div>
                  )
                })}
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Trạng thái:</span>
                  <span className="m-xp-tri">
                    <span className={`m-ct-chip ${xemPttt._tt === 0 ? 'dim' : 'ok'}`}>
                      {xemPttt._tt === 0 ? 'Ngừng dùng' : 'Đang dùng'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="pn-chan">
              <button
                type="button"
                className="btn m-dm-nut-dong-chan"
                onClick={() => setXemPttt(null)}
              >
                Đóng
              </button>
            </div>
          </aside>
        </div>
      )}
      {quyVuaTao && <GoiYLapPhieu quy={quyVuaTao} onDong={() => setQuyVuaTao(null)} />}
    </>
  )
}


