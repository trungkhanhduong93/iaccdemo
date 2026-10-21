import { useEffect, useMemo, useState, type FC, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { duongDan } from '../../app/registry'
import { cuaHangHienTai, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { docNgay, trongKhoang } from '../ChonNgay'
import { money, rutGonSo } from '../format'
import { dsChipTT, khopChipTT } from '../LocNangCao'
import { chieuTien } from './chieuTien'
import { TT_CT } from '../generic/gen'
import { boO, nhomCua, theoLoai } from '../generic/nhom'
import { lyMacDinh } from '../generic/ChungTuForm'
import { useDongChungTu } from '../generic/VoucherScreen'
import { MChon } from './MChon'
import { coLocKhacMacDinh, MAC_DINH_LOC_MOBILE, MLoc, tinhKhoangNgay, type GtLocMobile } from './MLoc'
import { MBaoCaoTheoDoi } from './MBaoCaoTheoDoi'
import { Icon } from '../Icon'
import { CUA_HANG } from '../../data/mock'
import { ChonCuaHangTruoc, layChiNhanhNho, luuChiNhanhNho } from '../ChonCuaHangTruoc'

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

export const MDtThuChiDs: FC<ScreenProps> = ({ sc, mod }) => {
  const { s, set } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const { cfg, rows: rowsGoc } = useDongChungTu(sc, mod)

  const rows = useMemo(() => {
    return rowsGoc.map((r): Row => {
      const loaiK = cfg.loai?.find(x => x.k === r.loai)?.k ?? cfg.loai?.[0]?.k
      const cfgDong = theoLoai(cfg, loaiK)
      const oLy = boO(nhomCua(mod.key, cfgDong, loaiK), cfgDong).a.find(o => o.k === 'ly')
      return {
        ...r,
        lyDo: !oLy ? '' : r._lyDo ? String(r._lyDo) : lyMacDinh(oLy.ds ?? [], String(r.dienGiai ?? '')),
      }
    })
  }, [rowsGoc, mod.key, cfg])

  const ghi = kieuGhiSo(s.goi) !== 'khong' && s.goi !== 'F'
  const cnChon = cuaHangHienTai(s)

  const [sp, setSearchParams] = useSearchParams()
  const [chipTT, setChipTT] = useState(() => sp.get('tt') ?? 'all')
  const [moChonCnTruoc, setMoChonCnTruoc] = useState(false)
  const [dichDenMoi, setDichDenMoi] = useState<string | null>(null)
  const [loaiChon, setLoaiChon] = useState<string>('')
  const [timMo, setTimMo] = useState(false)
  const [tuKhoa, setTuKhoa] = useState('')
  const [sortMoiNhat, setSortMoiNhat] = useState(true)

  // Sheets
  const [locMo, setLocMo] = useState(false)
  const [moChonLoaiThem, setMoChonLoaiThem] = useState(false)
  const [moTheoDoi, setMoTheoDoi] = useState(false)

  const [locVal, setLocVal] = useState<GtLocMobile>(() => ({
    ...MAC_DINH_LOC_MOBILE,
    chiNhanh: s.cuaHang || 'all',
    trangThai: sp.get('tt') ?? 'all',
  }))

  useEffect(() => {
    setLocVal(prev => ({ ...prev, chiNhanh: s.cuaHang || 'all' }))
  }, [s.cuaHang])

  useEffect(() => {
    const ttUrl = sp.get('tt') ?? 'all'
    setChipTT(ttUrl)
    setLocVal(prev => ({ ...prev, trangThai: ttUrl }))
  }, [sp])

  const dsChiNhanh = useMemo(
    () => [{ k: 'all', ten: 'Tất cả chi nhánh' }, ...CUA_HANG.map(c => ({ k: c.id, ten: c.ten }))],
    [],
  )

  const handleApDungLoc = (val: GtLocMobile) => {
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
  }

  const dsDoiTuong = useMemo(
    () => [...new Set(rows.map(r => String(r.doiTuong ?? '')).filter(Boolean))].sort(),
    [rows],
  )
  const dsNguon = useMemo(() => {
    const raw = [...new Set(rows.map(r => String(r.nguon ?? 'tay')))]
    return raw.map(k => ({ k, ten: k === 'tay' ? 'Thủ công' : k }))
  }, [rows])
  const dsLyDo = useMemo(
    () => [...new Set(rows.map(r => String(r.lyDo ?? '')).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi')),
    [rows],
  )

  const kn = tinhKhoangNgay(locVal.thoiGian, locVal.khoangNgay)
  const truocTT = useMemo(() => {
    return rows.filter(r => {
      if (kn) {
        const d = docNgay(String(r.ngay).split(' ')[0])
        if (!trongKhoang(d, kn)) return false
      }
      if (cnChon && r.cn !== cnChon.ten) return false

      if (loaiChon) {
        if (loaiChon === 'tien-mat') {
          if (r.loai !== 'thu' && r.loai !== 'chi') return false
        } else if (loaiChon === 'ngan-hang') {
          if (r.loai !== 'bc' && r.loai !== 'unc') return false
        } else if (loaiChon === 'cq') {
          if (r.loai !== 'cq') return false
        } else if (r.loai !== loaiChon) {
          return false
        }
      }

      if (locVal.doiTuong && locVal.doiTuong.length > 0) {
        if (!locVal.doiTuong.includes(String(r.doiTuong ?? ''))) return false
      }
      if (locVal.nguon && locVal.nguon.length > 0) {
        if (!locVal.nguon.includes(String(r.nguon ?? 'tay'))) return false
      }
      if (locVal.lyDo && locVal.lyDo.length > 0) {
        if (!locVal.lyDo.includes(String(r.lyDo ?? ''))) return false
      }
      return true
    })
  }, [rows, kn, cnChon, loaiChon, locVal])

  const chipsGoc = useMemo(() => dsChipTT(truocTT, ghi), [truocTT, ghi])
  const chips = useMemo(
    () => chipsGoc.map(c => ({ k: c.k, ten: c.ten, dem: c.so })),
    [chipsGoc],
  )

  const listSauLocTT = useMemo(() => {
    return truocTT.filter(r => khopChipTT(chipTT, r.tt, ghi))
  }, [truocTT, chipTT, ghi])

  const list = useMemo(() => {
    let res = listSauLocTT
    if (tuKhoa.trim()) {
      const q = tuKhoa.trim().toLowerCase()
      res = res.filter(r => {
        const text = `${r.so} ${r.doiTuong ?? ''} ${r.dienGiai ?? ''} ${r.cn ?? ''} ${r.lyDo ?? ''}`.toLowerCase()
        return text.includes(q)
      })
    }
    return res
  }, [listSauLocTT, tuKhoa])

  const dsChieu = useMemo(() => list.map(r => chieuTien(mod.key, cfg, r)), [list, mod.key, cfg])
  const { tongThu, tongChi, tongTien } = useMemo(() => {
    let thu = 0
    let chi = 0
    let tt = 0
    list.forEach((r, idx) => {
      const tien = Number(r.tong) || Number(r.tien) || 0
      tt += tien
      if (dsChieu[idx] === 'vao') thu += tien
      else if (dsChieu[idx] === 'ra') chi += tien
    })
    return { tongThu: thu, tongChi: chi, tongTien: tt }
  }, [list, dsChieu])

  // Nhóm theo ngày
  const nhomTheoNgay = useMemo(() => {
    const map = new Map<string, Row[]>()
    for (const r of list) {
      const ngayRaw = String(r.ngay ?? '').split(' ')[0]
      const cur = map.get(ngayRaw) ?? []
      cur.push(r)
      map.set(ngayRaw, cur)
    }
    const arr = Array.from(map.entries()).map(([ngayRaw, ds]) => ({
      ngayRaw,
      tieuDeNgay: dinhDangThuNgay(ngayRaw),
      ds,
    }))
    arr.sort((a, b) => {
      const da = docNgay(a.ngayRaw).getTime()
      const db = docNgay(b.ngayRaw).getTime()
      return sortMoiNhat ? db - da : da - db
    })
    return arr
  }, [list, sortMoiNhat])

  const pad = (n: number) => String(n).padStart(2, '0')
  const chuoiKhoangNgay = kn
    ? `${pad(kn.tu.getDate())}/${pad(kn.tu.getMonth() + 1)} – ${pad(kn.den.getDate())}/${pad(kn.den.getMonth() + 1)}/${kn.den.getFullYear()}`
    : '01/10 – 31/10/2026'

  const nhanCn = cnChon ? cnChon.ten : 'CN: Tất cả'
  const chipHienTai = chips.find(c => c.k === chipTT)
  const nhanTrangThai = chipHienTai ? `Trạng thái: ${chipHienTai.ten}` : 'Trạng thái: Tất cả'

  const tabsFree = [
    { k: '', ten: 'Tất cả' },
    { k: 'tien-mat', ten: 'Tiền mặt' },
    { k: 'ngan-hang', ten: 'Ngân hàng' },
    { k: 'cq', ten: 'Chuyển quỹ' },
  ]

  // Thêm mới chỉ hiện loại phiếu của tab đang chọn; tab Tất cả hiện đủ (T539)
  const dsLoaiThem = [
    { k: 'chi', ten: 'Chi tiền mặt' },
    { k: 'thu', ten: 'Thu tiền mặt' },
    { k: 'unc', ten: 'Chi ngân hàng' },
    { k: 'bc', ten: 'Thu ngân hàng' },
    { k: 'cq', ten: 'Chuyển quỹ' },
  ].filter(l => loaiChon === 'tien-mat' ? l.k === 'chi' || l.k === 'thu'
    : loaiChon === 'ngan-hang' ? l.k === 'unc' || l.k === 'bc'
    : loaiChon === 'cq' ? l.k === 'cq'
    : true)

  const moPhieuMoi = (k: string) => {
    const target = `${path}/moi?loai=${k}`
    if (s.cuaHang === 'all') {
      const cnNho = layChiNhanhNho()
      if (cnNho && CUA_HANG.some(c => c.id === cnNho)) {
        set({ cuaHang: cnNho })
        nav(target)
      } else {
        setDichDenMoi(target)
        setMoChonCnTruoc(true)
      }
      return
    }
    nav(target)
  }

  const quayLai = () => {
    if (window.history.state && window.history.state.idx > 0) {
      nav(-1)
    } else {
      nav('/app/nghiep-vu', { replace: true })
    }
  }

  return (
    <div className="m-tc-man m-ds-khung">
      {/* ── HEADER NAVIGATION THEO FIGMA MB03 ── */}
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
          <h1 className="m-tc-tieu-de">Thu, chi tiền</h1>
          <button
            type="button"
            className={`m-tc-btn-nav${timMo ? ' on' : ''}`}
            onClick={() => {
              setTimMo(v => !v)
              if (timMo) setTuKhoa('')
            }}
            aria-label="Tìm kiếm"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </div>

        {/* Ô tìm kiếm khi mở */}
        {timMo && (
          <div className="m-tc-tim-wrap">
            <svg className="m-tc-tim-ic" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              autoFocus
              className="m-tc-tim-inp"
              placeholder="Tìm mã chứng từ, đối tượng, diễn giải..."
              value={tuKhoa}
              onChange={e => setTuKhoa(e.target.value)}
              aria-label="Tìm kiếm chứng từ"
            />
            {tuKhoa && (
              <button
                type="button"
                className="m-tc-tim-x"
                onClick={() => setTuKhoa('')}
                aria-label="Xoá tìm kiếm"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* ── TABS CUỘN NGANG THEO FIGMA MB03 ── */}
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
      </header>

      {/* ── CONTENT THÂN CUỘN ── */}
      <main className="m-tc-content">
        {/* Hàng bộ lọc cuộn ngang */}
        <div className="m-tc-loc-bar">
          <button
            type="button"
            className={`m-tc-btn-loc-vuong m-ds-nut-loc-vuong m-ds-nut-loc${coLocKhacMacDinh(locVal) ? ' co-loc' : ''}`}
            onClick={() => setLocMo(true)}
            aria-label="Mở bộ lọc"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            {coLocKhacMacDinh(locVal) && <span className="m-tc-loc-cham" />}
          </button>

          <span className="m-chip-xem">{chuoiKhoangNgay}</span>
          <span className="m-chip-xem">{nhanCn}</span>
          <span className="m-chip-xem">{nhanTrangThai}</span>
          {locVal.doiTuong?.map(dt => (
            <span key={dt} className="m-chip-xem">Đối tượng: {dt}</span>
          ))}
          {locVal.nguon?.map(ng => (
            <span key={ng} className="m-chip-xem">Nguồn: {ng === 'tay' ? 'Thủ công' : ng}</span>
          ))}
          {locVal.lyDo?.map(ld => (
            <span key={ld} className="m-chip-xem">Lý do: {ld}</span>
          ))}
        </div>

        {/* Card Tổng hợp kỳ */}
        <div className="m-tc-card-tong-hop m-ds-dong-tom-tat">
          <div className="m-tc-th-trai">
            <span className="m-tc-th-dem">{list.length} chứng từ</span>
            <span className="m-tc-th-ngay">{chuoiKhoangNgay}</span>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: 2 }}>
              Thu: <b style={{ color: '#138a52' }}>+{rutGonSo(tongThu)}</b> · Chi: <b style={{ color: '#c2362b' }}>-{rutGonSo(tongChi)}</b>
            </div>
          </div>
          <div className="m-tc-th-phai">
            <span className="m-tc-th-nhan">Tổng cộng</span>
            <span className="m-tc-th-so">{money(tongTien)} đ</span>
          </div>
        </div>

        {/* Hàng Sắp xếp */}
        <div className="m-tc-hang-sap-xep">
          <span className="m-tc-sx-tieu-de">Danh sách chứng từ</span>
          <button
            type="button"
            className="m-tc-sx-btn"
            onClick={() => setSortMoiNhat(v => !v)}
            aria-label="Sắp xếp chứng từ"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M6 12h12m-9 6h6" />
            </svg>
            <span>{sortMoiNhat ? 'Mới nhất' : 'Cũ nhất'}</span>
          </button>
        </div>

        {/* Danh sách chứng từ nhóm theo ngày */}
        {list.length === 0 ? (
          <div className="m-tc-trong">
            <p>Không có chứng từ nào phù hợp</p>
          </div>
        ) : (
          <div className="m-tc-danh-sach">
            {nhomTheoNgay.map(nhom => (
              <section key={nhom.ngayRaw} className="m-tc-nhom-ngay">
                <div className="m-tc-ngay-header">
                  <span className="m-tc-ngay-chu">{nhom.tieuDeNgay}</span>
                  <span className="m-tc-ngay-so">{nhom.ds.length} chứng từ</span>
                </div>

                <div className="m-tc-card-ngay">
                  {nhom.ds.map((r, idx) => {
                    const isChi = r.loai === 'chi' || r.loai === 'unc'
                    const isThu = r.loai === 'thu' || r.loai === 'bc'
                    const isCq = r.loai === 'cq'
                    const tienNum = Math.abs(Number(r.tong) || Number(r.tien) || 0)
                    const tienStr = isChi
                      ? `−${money(tienNum)} đ`
                      : isThu
                      ? `+${money(tienNum)} đ`
                      : `${money(tienNum)} đ`

                    const clsIcon = isChi ? 'chi' : isThu ? 'thu' : 'cq'
                    const clsTien = isChi ? 'chi' : isThu ? 'thu' : 'cq'
                    const laFabi = r.nguon === 'FABi' || String(r.so ?? '').startsWith('FB')

                    return (
                      <div key={`${String(r.id)}_${idx}`}>
                        <div
                          className="t498-ct-item m-tc-item m-the-ct m-ds-ngay-dong"
                          onClick={() => nav(`${path}/${r.id}`)}
                          role="button"
                          tabIndex={0}
                        >
                          {/* Icon tròn mũi tên */}
                          <div className={`t498-ic-tron m-tc-ic-tron ${clsIcon}`}>
                            {isChi ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M7 17L17 7M7 7h10v10" />
                              </svg>
                            ) : isThu ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 7L7 17M17 17H7V7" />
                              </svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                            )}
                          </div>

                          {/* Thông tin chứng từ */}
                          <div className="t498-item-giua m-tc-item-giua">
                            <div className="t498-item-hang1 m-tc-item-hang1">
                              <span className="t498-item-so m-tc-item-so m-the-ct-so m-ds-ngay-so">{r.so}</span>
                              {laFabi && <span className="t498-badge-fabi m-tc-badge-fabi">FABi</span>}
                            </div>
                            <div className="t498-item-hang2 m-tc-item-hang2">
                              <span className="t498-item-dt m-tc-item-dt">
                                {r.doiTuong || r.dienGiai || r.lyDo || '—'}
                              </span>
                            </div>
                          </div>

                          {/* Số tiền */}
                          <div className={`t498-item-tien m-tc-item-tien ${clsTien}`}>
                            {tienStr}
                          </div>
                        </div>
                        {idx < nhom.ds.length - 1 && <div className="t498-item-vach m-tc-item-vach" />}
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* ── NÚT NỔI THÊM MỚI (FAB) ── */}
      <button
        type="button"
        className="m-tc-fab m-nut-them-fab m-ds-fab"
        onClick={() => dsLoaiThem.length === 1 ? moPhieuMoi(dsLoaiThem[0].k) : setMoChonLoaiThem(true)}
        aria-label="Thêm mới"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span>Thêm mới</span>
      </button>

      {/* Tấm chọn loại phiếu khi bấm FAB */}
      <MChon
        mo={moChonLoaiThem}
        onDong={() => setMoChonLoaiThem(false)}
        tieuDe="Chọn loại phiếu"
        ds={dsLoaiThem}
        onChon={k => {
          setMoChonLoaiThem(false)
          moPhieuMoi(k)
        }}
      />

      <ChonCuaHangTruoc
        mo={moChonCnTruoc}
        laMobile={true}
        onDong={() => {
          setMoChonCnTruoc(false)
          setDichDenMoi(null)
        }}
        onChon={idCuaHang => {
          luuChiNhanhNho(idCuaHang)
          set({ cuaHang: idCuaHang })
          setMoChonCnTruoc(false)
          if (dichDenMoi) {
            nav(dichDenMoi)
            setDichDenMoi(null)
          }
        }}
      />

      {/* Bộ lọc toàn màn */}
      <MLoc
        mo={locMo}
        onDong={() => setLocMo(false)}
        giaTri={locVal}
        onApDung={handleApDungLoc}
        dsDoiTuong={dsDoiTuong}
        nhanDoiTuong="Đối tượng"
        dsNguon={dsNguon}
        dsLyDo={dsLyDo}
        dsChiNhanh={dsChiNhanh}
        dsTrangThai={chips}
      />

      {/* Báo cáo theo dõi & Danh mục */}
      <MBaoCaoTheoDoi
        mo={moTheoDoi}
        onDong={() => setMoTheoDoi(false)}
        modKey={mod.key}
      />
    </div>
  )
}
