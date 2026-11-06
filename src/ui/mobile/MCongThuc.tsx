import { useEffect, useMemo, useState, type FC } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { duongDan } from '../../app/registry'
import { useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../Icon'
import { fold } from '../format'
import { MTrong } from './MTrong'
import { MChon } from './MChon'
import { MChonKhoangNgay } from './MChonKhoangNgay'
import { LichDon, docNgay, trongKhoang, dmy, type KhoangNgay } from '../ChonNgay'
import { suaPhieu, themPhieu } from '../generic/daXoa'
import { quayLaiMobile } from './quayLai'
import {
  hangCua,
  soLuong,
  tenCuaHangAd,
  apDungCuaHang,
  TT_CONG_THUC,
  type TtCongThuc,
  type NvlCongThuc,
} from '../../modules/kho/san-xuat'
import {
  useDsCongThuc,
  nvlCua,
  DS_SP,
  DS_NVL,
  KENH,
} from '../../modules/kho/CongThuc'
import { quyDoiTuDanhMuc } from '../../modules/danh-muc/QuyDoiDvt'

type LoaiCt = 'cb' | 'sc'
const MAN: Record<LoaiCt, string> = { cb: 'kho/9-1-3', sc: 'kho/5-1-5' }

interface BoLocState {
  ngay: KhoangNgay | null
  sp: string
  nvl: string
  cuaHang: string
  kenh: string
}

// Lưu bộ lọc, từ khoá, tab trong phiên khi chuyển màn chi tiết rồi quay lại
const boNhoPhien: Record<LoaiCt, { tab: TtCongThuc; q: string; loc: BoLocState }> = {
  cb: { tab: 'on', q: '', loc: { ngay: null, sp: '', nvl: '', cuaHang: '', kenh: '' } },
  sc: { tab: 'on', q: '', loc: { ngay: null, sp: '', nvl: '', cuaHang: '', kenh: '' } },
}

export const MCongThuc: FC<ScreenProps> = ({ sc, mod }) => {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const viTri = useLocation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const laSua = searchParams.get('sua') === '1'

  const loai: LoaiCt = sc.code === '5.1.5' || sc.slug === '5-1-5' ? 'sc' : 'cb'
  const cb = loai === 'cb'
  const path = duongDan(mod, sc)
  const ds = useDsCongThuc(loai)

  const khoaSp = cb ? 'spMa' : 'gocMa'
  const nhanSp = cb ? 'Sản phẩm' : 'Nguyên vật liệu gốc'
  const nhanNvl = cb ? 'Nguyên vật liệu' : 'Nguyên vật liệu đích'

  // Slot nút phễu thanh trên MobileShell
  const [phaiEl, setPhaiEl] = useState<HTMLElement | null>(null)
  useEffect(() => {
    setPhaiEl(document.getElementById('m-thanh-tren-phai-slot'))
  }, [])

  // State danh sách
  const [tab, setTabState] = useState<TtCongThuc>(() => boNhoPhien[loai].tab)
  const [q, setQState] = useState(() => boNhoPhien[loai].q)
  const [loc, setLocState] = useState<BoLocState>(() => boNhoPhien[loai].loc)

  const setTab = (t: TtCongThuc) => {
    boNhoPhien[loai].tab = t
    setTabState(t)
  }
  const setQ = (val: string) => {
    boNhoPhien[loai].q = val
    setQState(val)
  }
  const setLoc = (l: BoLocState) => {
    boNhoPhien[loai].loc = l
    setLocState(l)
  }

  // State bộ lọc bottom sheet
  const [moLoc, setMoLoc] = useState(false)
  const [nhapLoc, setNhapLoc] = useState<BoLocState>(loc)
  const [moChonLoc, setMoChonLoc] = useState<'sp' | 'nvl' | 'cuaHang' | 'kenh' | null>(null)

  // Danh sách gợi ý lọc
  const dsLocSp = useMemo(() => {
    const cacMa = [...new Set(ds.map(c => String(c[khoaSp])))]
    return cacMa.map(ma => ({ k: ma, ten: hangCua(ma)?.ten ?? ma, moTa: ma }))
  }, [ds, khoaSp])

  const dsLocNvl = useMemo(() => {
    const cacMa = [...new Set(ds.flatMap(c => nvlCua(c).map(n => n.ma)))]
    return cacMa.map(ma => ({ k: ma, ten: hangCua(ma)?.ten ?? ma, moTa: ma }))
  }, [ds])

  // Lọc theo bộ lọc nâng cao
  const truocChip = useMemo(() => {
    return ds.filter(c => {
      if (loc.ngay && !trongKhoang(docNgay(String(c.ngay)), loc.ngay)) return false
      if (loc.sp && c[khoaSp] !== loc.sp) return false
      if (loc.nvl && !nvlCua(c).some(n => n.ma === loc.nvl)) return false
      if (loc.cuaHang && !apDungCuaHang(c.cuaHang as string[], loc.cuaHang)) return false
      if (cb && loc.kenh && ((c.kenh as string[] | undefined)?.length) && !(c.kenh as string[]).includes(loc.kenh)) {
        return false
      }
      return true
    })
  }, [ds, loc, khoaSp, cb])

  // Lọc theo từ khoá tìm kiếm
  const locTuKhoa = useMemo(() => {
    if (!q.trim()) return truocChip
    const f = fold(q.trim())
    return truocChip.filter(c => {
      const sp = String(c[khoaSp])
      const h = hangCua(sp)
      const tenSp = h?.ten ?? sp
      const nvl = nvlCua(c)
      const nvlTxt = nvl.map(n => `${hangCua(n.ma)?.ten ?? n.ma} ${n.ma}`).join(' ')
      return fold(`${tenSp} ${sp} ${c.ma} ${nvlTxt}`).includes(f)
    })
  }, [truocChip, q, khoaSp])

  // Số đếm cho các tab
  const soDemTab = useMemo(() => {
    const kq: Record<TtCongThuc, number> = { on: 0, off: 0, nhap: 0 }
    for (const c of locTuKhoa) {
      const ttKey = (c.tt as TtCongThuc) || 'on'
      if (kq[ttKey] !== undefined) {
        kq[ttKey]++
      }
    }
    return kq
  }, [locTuKhoa])

  // Danh sách hiển thị theo tab đang chọn
  const hienThi = useMemo(() => {
    return locTuKhoa.filter(c => c.tt === tab)
  }, [locTuKhoa, tab])

  // Bật / tắt công thức ở màn chi tiết
  const doiTt = (c: Row) => {
    const moi: TtCongThuc = c.tt === 'on' ? 'off' : 'on'
    suaPhieu(MAN[loai], String(c.id), { tt: moi })
    toast(`${moi === 'on' ? 'Đã bật' : 'Đã tắt'} công thức`)
  }

  // ── MÀN 4, 5: FORM THÊM / SỬA ──
  const dangXem = id && id !== 'moi' ? ds.find(c => String(c.id) === id || String(c.ma) === id) : null
  const laThemMoi = id === 'moi'
  const saoChepGoc = (viTri.state as { saoChep?: Row } | null)?.saoChep
  const ctForm = laThemMoi ? saoChepGoc : laSua ? dangXem : null

  // State các ô trong form
  const [formSp, setFormSp] = useState('')
  const [formDvt, setFormDvt] = useState('')
  const [formNgay, setFormNgay] = useState('07/10/2026')
  const [formCuaHang, setFormCuaHang] = useState<string[]>([])
  const [formKenh, setFormKenh] = useState<string[]>([])
  const [formMoTa, setFormMoTa] = useState('')
  const [formNvl, setFormNvl] = useState<NvlCongThuc[]>([])

  // Modal ô chọn trong form
  const [moChonSp, setMoChonSp] = useState(false)
  const [moChonDvt, setMoChonDvt] = useState(false)
  const [moLichForm, setMoLichForm] = useState(false)
  const [moChonNhieuForm, setMoChonNhieuForm] = useState<'cuaHang' | 'kenh' | null>(null)

  // Modal sửa NVL (Màn 5)
  const [moTamNvl, setMoTamNvl] = useState(false)
  const [dangSuaNvlIdx, setDangSuaNvlIdx] = useState<number | null>(null)
  const [nvlChonMa, setNvlChonMa] = useState('')
  const [nvlSl, setNvlSl] = useState('1')
  const [moChonNvlItem, setMoChonNvlItem] = useState(false)

  // Khởi tạo giá trị khi vào form thêm hoặc sửa
  useEffect(() => {
    if (laThemMoi || laSua) {
      if (ctForm) {
        const maSp = String(ctForm[khoaSp] ?? '')
        setFormSp(maSp)
        setFormDvt(String(ctForm.dvt ?? ''))
        setFormNgay(String(ctForm.ngay ?? '07/10/2026'))
        setFormCuaHang((ctForm.cuaHang as string[]) ?? [])
        setFormKenh((ctForm.kenh as string[]) ?? (cb ? ['Tại quán', 'Mang về'] : []))
        setFormMoTa(String(ctForm.moTa ?? ''))
        setFormNvl(nvlCua(ctForm).map(n => ({ ...n })))
      } else {
        setFormSp('')
        setFormDvt('')
        setFormNgay('07/10/2026')
        setFormCuaHang([])
        setFormKenh([])
        setFormMoTa('')
        setFormNvl([])
      }
    }
    // Không để ctForm vào phụ thuộc: dòng đã sửa ra object mới mỗi lần vẽ, effect sẽ lặp vô hạn và xoá chữ đang nhập.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laThemMoi, laSua, id, viTri.key, khoaSp, cb])

  const hSpForm = hangCua(formSp)
  const dsDvtForm = useMemo(() => {
    if (!hSpForm) return []
    return [hSpForm.dvt, ...quyDoiTuDanhMuc(hSpForm.ten, hSpForm.dvt).map(q => q.dv)]
  }, [hSpForm])
  const dvtHienForm = formDvt && dsDvtForm.includes(formDvt) ? formDvt : hSpForm?.dvt ?? ''

  // Mở màn 5 để thêm dòng NVL
  const batDauThemNvl = () => {
    setDangSuaNvlIdx(null)
    const nvlDau = DS_NVL.find(x => x.ma !== formSp)?.ma ?? ''
    setNvlChonMa(nvlDau)
    setNvlSl('1')
    setMoTamNvl(true)
  }

  // Mở màn 5 để sửa dòng NVL
  const batDauSuaNvl = (idx: number) => {
    const dong = formNvl[idx]
    if (!dong) return
    setDangSuaNvlIdx(idx)
    setNvlChonMa(dong.ma)
    setNvlSl(String(dong.sl).replace('.', ','))
    setMoTamNvl(true)
  }

  // Lưu dòng NVL từ màn 5
  const luuDongNvl = () => {
    if (!nvlChonMa) {
      toast('Vui lòng chọn nguyên vật liệu')
      return
    }
    const slSo = parseFloat(String(nvlSl).replace(',', '.'))
    if (!slSo || slSo <= 0) {
      toast('Số lượng phải lớn hơn 0')
      return
    }

    if (dangSuaNvlIdx !== null) {
      setFormNvl(cur =>
        cur.map((item, i) => (i === dangSuaNvlIdx ? { ...item, ma: nvlChonMa, sl: slSo } : item))
      )
    } else {
      setFormNvl(cur => [...cur, { ma: nvlChonMa, sl: slSo }])
    }
    setMoTamNvl(false)
  }

  // Lưu form thêm / sửa công thức
  const luuFormCongThuc = () => {
    const thieu = !formSp
      ? cb
        ? 'Chọn sản phẩm'
        : 'Chọn nguyên vật liệu gốc'
      : !formNgay
      ? 'Nhập ngày áp dụng'
      : !formNvl.length
      ? cb
        ? 'Thêm nguyên vật liệu thành phần'
        : 'Thêm nguyên vật liệu đích'
      : ''
    if (thieu) {
      toast(thieu)
      return
    }

    const maMoi = `${cb ? 'CTCB' : 'CTSC'}${String(ds.length + 1).padStart(3, '0')}`
    const ma = laThemMoi ? maMoi : String(dangXem?.ma ?? maMoi)
    const tt = laThemMoi ? 'on' : ((dangXem?.tt as TtCongThuc) ?? 'on')

    const nd: Row = cb
      ? {
          ma,
          spMa: formSp,
          dvt: dvtHienForm,
          ngay: formNgay,
          kenh: formKenh,
          cuaHang: formCuaHang,
          moTa: formMoTa,
          tt,
          nvl: formNvl,
        }
      : {
          ma,
          gocMa: formSp,
          dvt: dvtHienForm,
          ngay: formNgay,
          cuaHang: formCuaHang,
          moTa: formMoTa,
          tt,
          dich: formNvl,
        }

    if (laThemMoi) {
      themPhieu(MAN[loai], { id: `moi-${Date.now()}`, ...nd }, s.ten)
      toast(`Đã lưu công thức ${hSpForm?.ten ?? ''}`)
      nav(path, { replace: true })
    } else if (dangXem) {
      suaPhieu(MAN[loai], String(dangXem.id), nd)
      toast(`Đã lưu công thức ${hSpForm?.ten ?? ''}`)
      // Lùi về đúng mục chi tiết đã mở form; replace sẽ để lại 2 mục chi tiết, quay lại phải bấm 2 lần
      quayLaiMobile(nav, `${path}/${dangXem.id}`)
    }
  }

  // ── 1. MÀN 4: THÊM HOẶC SỬA ──
  if (laThemMoi || (id !== undefined && laSua)) {
    if (!laThemMoi && !dangXem) {
      return (
        <div className="m-ct-form m-tc-lap-man">
          <header className="m-ct-dau-giua">
            <button
              type="button"
              className="m-ct-nut-ic"
              onClick={() => quayLaiMobile(nav, path)}
              aria-label="Quay lại"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            </button>
            <h1>Không tìm thấy công thức</h1>
            <span style={{ width: 40 }} />
          </header>
          <div className="m-ct-cuon">
            <MTrong tieuDe="Không tìm thấy công thức" moTa="Công thức không tồn tại hoặc đã bị xoá" />
          </div>
        </div>
      )
    }

    const tieuDeForm = laThemMoi
      ? cb
        ? 'Thêm công thức chế biến'
        : 'Thêm công thức sơ chế'
      : cb
      ? 'Sửa công thức chế biến'
      : 'Sửa công thức sơ chế'

    return (
      <div className="m-ct-form m-tc-lap-man">
        <header className="m-ct-dau-giua">
          <button
            type="button"
            className="m-ct-nut-ic"
            onClick={() => {
              if (dangXem) quayLaiMobile(nav, `${path}/${dangXem.id}`)
              else quayLaiMobile(nav, path)
            }}
            aria-label="Quay lại"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1>{tieuDeForm}</h1>
          <span style={{ width: 40 }} />
        </header>

        <div className="m-ct-cuon">
          {/* Thông tin chung */}
          <div className="m-ct-the-khoi">
            <p className="m-ct-tieu-khoi">Thông tin chung</p>
            <div className="m-ct-o">
              <label>Mã công thức</label>
              <div className="gt m-ct-gt" data-truong="ma" style={{ color: 'var(--muted)' }}>
                {dangXem ? dangXem.ma : 'Mã sinh tự động'}
              </div>
            </div>

            <button
              type="button"
              className="m-ct-o m-ct-o-bam"
              data-o="sp"
              onClick={() => setMoChonSp(true)}
            >
              <label>
                {nhanSp} <em>*</em>
              </label>
              <div className={`gt m-ct-gt${!formSp ? ' trong' : ''}`}>
                {hSpForm ? hSpForm.ten : `Chọn ${nhanSp.toLowerCase()}`}
              </div>
              <Icon n="chevd" className="xuong" />
            </button>

            <div className="m-ct-hai">
              <button
                type="button"
                className="m-ct-o m-ct-o-bam"
                data-o="dvt"
                disabled={dsDvtForm.length <= 1}
                onClick={() => {
                  if (dsDvtForm.length > 1) setMoChonDvt(true)
                }}
              >
                <label>
                  Đơn vị tính chính <em>*</em>
                </label>
                <div className={`gt m-ct-gt${!dvtHienForm ? ' trong' : ''}`}>
                  {dvtHienForm || 'Theo hàng'}
                </div>
                {dsDvtForm.length > 1 && <Icon n="chevd" className="xuong" />}
              </button>

              <button
                type="button"
                className="m-ct-o m-ct-o-bam"
                data-o="ngay"
                onClick={() => setMoLichForm(true)}
              >
                <label>
                  Ngày áp dụng <em>*</em>
                </label>
                <div className="gt m-ct-gt">{formNgay}</div>
                <Icon n="calendar" className="xuong" />
              </button>
            </div>

            <button
              type="button"
              className="m-ct-o m-ct-o-bam"
              data-o="cuaHang"
              onClick={() => setMoChonNhieuForm('cuaHang')}
            >
              <label>Cửa hàng áp dụng</label>
              <div className={`gt m-ct-gt${!formCuaHang.length ? ' trong' : ''}`}>
                {formCuaHang.join(', ') || 'Để trống nếu áp dụng toàn bộ'}
              </div>
              <Icon n="chevd" className="xuong" />
            </button>

            {cb && (
              <button
                type="button"
                className="m-ct-o m-ct-o-bam"
                data-o="kenh"
                onClick={() => setMoChonNhieuForm('kenh')}
              >
                <label>Kênh áp dụng</label>
                <div className={`gt m-ct-gt${!formKenh.length ? ' trong' : ''}`}>
                  {formKenh.join(', ') || 'Để trống nếu áp dụng toàn bộ'}
                </div>
                <Icon n="chevd" className="xuong" />
              </button>
            )}

            <div className="m-ct-o" style={{ marginBottom: 0 }}>
              <label>Mô tả</label>
              <textarea
                rows={2}
                aria-label="Mô tả"
                placeholder="Nhập mô tả"
                value={formMoTa}
                onChange={e => setFormMoTa(e.target.value)}
              />
            </div>
          </div>

          {/* Danh sách nguyên vật liệu */}
          <div className="m-ct-the-khoi">
            <p className="m-ct-tieu-khoi">
              {cb ? 'Danh sách nguyên vật liệu' : 'Danh sách nguyên vật liệu đích'}
              <button
                type="button"
                className="m-ct-them"
                aria-label="Thêm nguyên vật liệu"
                onClick={batDauThemNvl}
              >
                <Icon n="plus" />
              </button>
            </p>

            {formNvl.length === 0 ? (
              <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                Chưa có nguyên vật liệu. Bấm + để thêm.
              </div>
            ) : (
              formNvl.map((n, i) => {
                const h = hangCua(n.ma)
                return (
                  <div key={i} className="m-ct-nvl-the">
                    <div className="ten">
                      <b>
                        {i + 1}. {h?.ten ?? n.ma}
                      </b>{' '}
                      <span className="mo">- {n.ma}</span>
                    </div>
                    <div className="tg">
                      <button
                        type="button"
                        className="sua"
                        aria-label="Sửa dòng"
                        onClick={() => batDauSuaNvl(i)}
                      >
                        <Icon n="edit" />
                      </button>
                      <button
                        type="button"
                        className="xoa"
                        aria-label="Xoá dòng"
                        onClick={() => setFormNvl(cur => cur.filter((_, idx) => idx !== i))}
                      >
                        <Icon n="trash" />
                      </button>
                    </div>
                    <div className="nvl-so">
                      <span>Số lượng:</span>
                      <span>
                        {soLuong(n.sl)} {h?.dvt ?? ''}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Nút lưu cố định dưới đáy */}
        <div className="m-ct-day">
          <button type="button" className="m-ct-btn pri" onClick={luuFormCongThuc}>
            Lưu lại
          </button>
        </div>

        {/* Modal chọn Sản phẩm / NVL gốc */}
        <MChon
          mo={moChonSp}
          onDong={() => setMoChonSp(false)}
          tieuDe={cb ? 'Chọn sản phẩm' : 'Chọn nguyên vật liệu gốc'}
          ds={(cb ? DS_SP : DS_NVL).map(h => ({ k: h.ma, ten: h.ten, moTa: h.ma }))}
          chon={formSp}
          tim={true}
          onChon={k => {
            setFormSp(k)
            const h = hangCua(k)
            setFormDvt(h?.dvt ?? '')
            setMoChonSp(false)
          }}
        />

        {/* Modal chọn ĐVT */}
        {dsDvtForm.length > 1 && (
          <MChon
            mo={moChonDvt}
            onDong={() => setMoChonDvt(false)}
            tieuDe="Chọn đơn vị tính"
            ds={dsDvtForm.map(d => ({ k: d, ten: d }))}
            chon={dvtHienForm}
            onChon={k => {
              setFormDvt(k)
              setMoChonDvt(false)
            }}
          />
        )}

        {/* DatePicker ngày áp dụng */}
        {moLichForm && (
          <LichDon
            value={formNgay}
            onChange={v => {
              setFormNgay(v)
              setMoLichForm(false)
            }}
            onDong={() => setMoLichForm(false)}
          />
        )}

        {/* Tấm chọn nhiều Cửa hàng / Kênh */}
        {moChonNhieuForm && (
          <div className="m-ct-phu-mo" onClick={() => setMoChonNhieuForm(null)}>
            <div className="m-ct-tam m-ct-chon-nhieu" onClick={e => e.stopPropagation()}>
              <div className="m-ct-keo" />
              <div className="m-ct-tam-dau">
                <h2>{moChonNhieuForm === 'cuaHang' ? 'Cửa hàng áp dụng' : 'Kênh áp dụng'}</h2>
                <button
                  type="button"
                  className="m-ct-nut-ic"
                  style={{ width: 28, height: 28 }}
                  onClick={() => setMoChonNhieuForm(null)}
                  aria-label="Đóng"
                >
                  <Icon n="x" />
                </button>
              </div>
              <div className="m-ct-tam-than">
                {(moChonNhieuForm === 'cuaHang' ? CUA_HANG.map(c => c.ten) : KENH).map(m => {
                  const daChon =
                    moChonNhieuForm === 'cuaHang' ? formCuaHang.includes(m) : formKenh.includes(m)
                  return (
                    <button
                      key={m}
                      type="button"
                      className={`m-ct-muc${daChon ? ' on' : ''}`}
                      onClick={() => {
                        if (moChonNhieuForm === 'cuaHang') {
                          setFormCuaHang(cur =>
                            cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m]
                          )
                        } else {
                          setFormKenh(cur =>
                            cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m]
                          )
                        }
                      }}
                    >
                      <span>{m}</span>
                      <span className="tich">✓</span>
                    </button>
                  )
                })}
              </div>
              <div className="m-ct-tam-day">
                <button
                  type="button"
                  className="m-ct-btn phu"
                  onClick={() => {
                    if (moChonNhieuForm === 'cuaHang') setFormCuaHang([])
                    else setFormKenh([])
                    setMoChonNhieuForm(null)
                  }}
                >
                  Áp dụng toàn bộ
                </button>
                <button
                  type="button"
                  className="m-ct-btn pri"
                  onClick={() => setMoChonNhieuForm(null)}
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MÀN 5: TẤM SỬA NGUYÊN VẬT LIỆU */}
        {moTamNvl && (
          <div className="m-ct-phu-mo" onClick={() => setMoTamNvl(false)}>
            <div className="m-ct-tam m-ct-tam-nvl" onClick={e => e.stopPropagation()}>
              <div className="m-ct-keo" />
              <div className="m-ct-tam-dau">
                <h2>{dangSuaNvlIdx !== null ? 'Sửa nguyên vật liệu' : 'Thêm nguyên vật liệu'}</h2>
                <button
                  type="button"
                  className="m-ct-nut-ic"
                  style={{ width: 28, height: 28 }}
                  onClick={() => setMoTamNvl(false)}
                  aria-label="Đóng"
                >
                  <Icon n="x" />
                </button>
              </div>
              <div className="m-ct-tam-than">
                <button
                  type="button"
                  className="m-ct-o m-ct-o-bam"
                  data-o="nvl"
                  onClick={() => setMoChonNvlItem(true)}
                >
                  <label>
                    Nguyên vật liệu <em>*</em>
                  </label>
                  <div className={`gt m-ct-gt${!nvlChonMa ? ' trong' : ''}`}>
                    {nvlChonMa
                      ? `${hangCua(nvlChonMa)?.ten ?? nvlChonMa} - ${nvlChonMa}`
                      : 'Chọn nguyên vật liệu'}
                  </div>
                  <Icon n="chevd" className="xuong" />
                </button>

                <div className="m-ct-hai">
                  <div className="m-ct-o">
                    <label>
                      Số lượng <em>*</em>
                    </label>
                    <input
                      value={nvlSl}
                      inputMode="decimal"
                      aria-label="Số lượng"
                      onChange={e => setNvlSl(e.target.value)}
                    />
                  </div>
                  <div className="m-ct-o">
                    <label>Đơn vị tính</label>
                    <div className="gt m-ct-gt" style={{ color: 'var(--ink)' }}>
                      {hangCua(nvlChonMa)?.dvt ?? ''}
                    </div>
                  </div>
                </div>
              </div>
              <div className="m-ct-tam-day">
                <button
                  type="button"
                  className="m-ct-btn phu"
                  onClick={() => setMoTamNvl(false)}
                >
                  Huỷ
                </button>
                <button type="button" className="m-ct-btn pri" onClick={luuDongNvl}>
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal chọn item NVL cho màn 5 */}
        <MChon
          mo={moChonNvlItem}
          onDong={() => setMoChonNvlItem(false)}
          tieuDe="Chọn nguyên vật liệu"
          ds={DS_NVL.filter(x => x.ma !== formSp).map(h => ({
            k: h.ma,
            ten: h.ten,
            moTa: h.ma,
          }))}
          chon={nvlChonMa}
          tim={true}
          onChon={k => {
            setNvlChonMa(k)
            setMoChonNvlItem(false)
          }}
        />
      </div>
    )
  }

  // ── 2. MÀN 3: CHI TIẾT CÔNG THỨC ──
  if (id !== undefined) {
    if (!dangXem) {
      return (
        <div className="m-ct-chi-tiet m-tc-lap-man">
          <header className="m-ct-dau-trai">
            <button
              type="button"
              className="m-ct-nut-ic"
              onClick={() => quayLaiMobile(nav, path)}
              aria-label="Quay lại"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            </button>
            <h1>Không tìm thấy công thức</h1>
          </header>
          <div className="m-ct-cuon">
            <MTrong tieuDe="Không tìm thấy công thức" moTa="Công thức không tồn tại hoặc đã bị xoá" />
          </div>
        </div>
      )
    }

    const spMa = String(dangXem[khoaSp])
    const hSp = hangCua(spMa)
    const nvlDs = nvlCua(dangXem)
    const dsDvt = hSp ? [hSp.dvt, ...quyDoiTuDanhMuc(hSp.ten, hSp.dvt).map(q => q.dv)] : []
    const dvtHien = dangXem.dvt && dsDvt.includes(String(dangXem.dvt)) ? String(dangXem.dvt) : hSp?.dvt ?? ''

    return (
      <div className="m-ct-chi-tiet m-tc-lap-man">
        {/* Đầu màn riêng */}
        <header className="m-ct-dau-trai">
          <button
            type="button"
            className="m-ct-nut-ic"
            onClick={() => quayLaiMobile(nav, path)}
            aria-label="Quay lại"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1>
            {hSp?.ten ?? spMa}
            <small>{spMa}</small>
          </h1>
        </header>

        <div className="m-ct-cuon">
          {/* Thẻ 1: Thông tin công thức */}
          <div className="m-ct-the-khoi">
            <div className="m-ct-tt-dong">
              <span>Mã</span>
              <b data-truong="ma">{dangXem.ma}</b>
            </div>
            <div className="m-ct-tt-dong">
              <span>Đơn vị tính chính</span>
              <b data-truong="dvt">{dvtHien}</b>
            </div>
            <div className="m-ct-tt-dong">
              <span>Ngày áp dụng</span>
              <b data-truong="ngay">{dangXem.ngay}</b>
            </div>
            {Boolean(dangXem.moTa) && (
              <div className="m-ct-tt-dong">
                <span>Mô tả</span>
                <b data-truong="moTa">{dangXem.moTa}</b>
              </div>
            )}
            <div className="m-ct-tt-dong">
              <span>
                <i
                  className="m-ct-cham"
                  style={{
                    background: dangXem.tt === 'on' ? 'var(--green)' : 'var(--red)',
                  }}
                />
                Trạng thái
              </span>
              <div
                className={`m-ct-tt-phai ${dangXem.tt === 'on' ? 'on' : 'off'}`}
                data-truong="tt"
              >
                <span style={{ color: 'inherit' }}>
                  {dangXem.tt === 'on' ? 'Đang hoạt động' : 'Không hoạt động'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={dangXem.tt === 'on'}
                  aria-label="Bật tắt công thức"
                  className={`m-ct-cong${dangXem.tt === 'on' ? ' on' : ''}`}
                  onClick={() => doiTt(dangXem)}
                >
                  <i />
                </button>
              </div>
            </div>
          </div>

          {/* Thẻ 2: Phạm vi áp dụng */}
          <div className="m-ct-the-khoi">
            <p className="m-ct-tieu-khoi">Phạm vi áp dụng</p>
            <div className="m-ct-pv">
              <span>Cửa hàng áp dụng:</span>
              <b data-truong="cuaHang">{tenCuaHangAd((dangXem.cuaHang as string[]) ?? [])}</b>
            </div>
            {cb && (
              <div className="m-ct-pv">
                <span>Kênh áp dụng:</span>
                <b data-truong="kenh">
                  {((dangXem.kenh as string[]) ?? []).join(', ') || 'Tất cả kênh'}
                </b>
              </div>
            )}
          </div>

          {/* Thẻ 3: Danh sách nguyên vật liệu */}
          <div className="m-ct-the-khoi">
            <p className="m-ct-tieu-khoi">
              {cb ? 'Danh sách nguyên vật liệu' : 'Danh sách nguyên vật liệu đích'}
            </p>
            {nvlDs.map((n, i) => {
              const h = hangCua(n.ma)
              return (
                <div key={i} className="m-ct-nvl-dong">
                  <div className="ten">
                    <b>
                      {i + 1}. {h?.ten ?? n.ma}
                    </b>{' '}
                    <span className="mo">- {n.ma}</span>
                  </div>
                  <div className="nvl-so">
                    <span>Số lượng:</span>
                    <span>
                      {soLuong(n.sl)} {h?.dvt ?? ''}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Đáy cố định: Sao chép & Sửa */}
        <div className="m-ct-day">
          <button
            type="button"
            className="m-ct-btn phu nho"
            onClick={() =>
              nav(`${path}/moi`, {
                state: {
                  saoChep: {
                    ...dangXem,
                    dvt: dvtHien,
                    cuaHang: dangXem.cuaHang,
                    kenh: dangXem.kenh,
                    moTa: dangXem.moTa,
                    ngay: dangXem.ngay,
                    nvl: nvlDs,
                    dich: nvlDs,
                  },
                },
              })
            }
          >
            Sao chép
          </button>
          <button
            type="button"
            className="m-ct-btn pri"
            onClick={() => nav(`${path}/${dangXem.id}?sua=1`)}
          >
            Sửa
          </button>
        </div>
      </div>
    )
  }

  // ── 3. MÀN 1: DANH SÁCH CÔNG THỨC ──
  return (
    <div className="m-ct-khung">
      {/* Nút phễu đưa vào #m-thanh-tren-phai-slot bằng createPortal */}
      {phaiEl &&
        createPortal(
          <button
            type="button"
            className="m-thanh-tren-nut-loc m-dm-nut-loc-pheu"
            aria-label="Bộ lọc"
            onClick={() => {
              setNhapLoc(loc)
              setMoLoc(true)
            }}
          >
            <Icon n="filter" className="ic sm" />
          </button>,
          phaiEl
        )}

      {/* Tabs trạng thái */}
      <div className="m-ct-tabs m-tc-tabs" role="tablist">
        {TT_CONG_THUC.map(([k, ten]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            className={`m-tc-tab-btn m-ct-tab-btn${tab === k ? ' on' : ''}`}
            onClick={() => setTab(k)}
          >
            {ten}
            <span className="m-ct-so">{soDemTab[k]}</span>
          </button>
        ))}
      </div>

      {/* Ô tìm kiếm */}
      <div className="m-ct-dau">
        <div className="m-ct-tim">
          <Icon n="search" className="m-ct-tim-ic ic sm" />
          <input
            type="text"
            className="m-ct-tim-inp"
            placeholder="Nhập từ khoá"
            value={q}
            onChange={e => setQ(e.target.value)}
            aria-label="Tìm kiếm công thức"
          />
          {q ? (
            <button
              type="button"
              className="m-ct-tim-x"
              onClick={() => setQ('')}
              aria-label="Xoá tìm kiếm"
            >
              <Icon n="x" className="ic sm" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Danh sách thẻ */}
      {hienThi.length === 0 ? (
        <MTrong tieuDe="Không tìm thấy công thức" moTa="Thử tìm theo từ khoá hoặc đổi bộ lọc khác" />
      ) : (
        <div className="m-ct-ds">
          {hienThi.map((c, i) => {
            const spMa = String(c[khoaSp])
            const h = hangCua(spMa)
            return (
              <button
                key={String(c.id)}
                type="button"
                className="m-ct-the"
                onClick={() => nav(`${path}/${c.id}`)}
              >
                <div className="ten">
                  <span className="mo" style={{ fontSize: 14 }}>
                    {i + 1}.{' '}
                  </span>
                  <b>{h?.ten ?? spMa}</b> <span className="mo">- {spMa}</span>
                </div>
                <div className="dong-phu">
                  Mã: <i>{c.ma}</i>
                </div>
                <div className="dong-phu">
                  Ngày áp dụng: <i>{c.ngay}</i>
                </div>
                <Icon n="chevr" className="chev" />
              </button>
            )
          })}
        </div>
      )}

      {/* Nút + tròn nổi góc dưới phải */}
      <button
        type="button"
        className="m-ct-fab m-nut-them-fab m-nut-fab-tron"
        aria-label="Thêm công thức"
        onClick={() => nav(`${path}/moi`)}
      >
        <Icon n="plus" />
      </button>

      {/* ── MÀN 2: BỘ LỌC TẤM TỪ ĐÁY ── */}
      {moLoc && (
        <div className="m-loc-overlay" onClick={() => setMoLoc(false)}>
          <div className="m-loc-tam m-ct-loc" onClick={e => e.stopPropagation()}>
            <div className="m-tam-keo" />
            <div className="m-loc-dau">
              <h2 className="m-loc-tieu-de">Bộ lọc</h2>
              <button
                type="button"
                className="m-loc-btn-dong"
                onClick={() => setMoLoc(false)}
                aria-label="Đóng"
              >
                <Icon n="x" className="ic sm" />
              </button>
            </div>

            <div className="m-loc-than">
              {/* Ngày áp dụng */}
              <MChonKhoangNgay
                value={nhapLoc.ngay ?? { tu: new Date(2026, 0, 1), den: new Date(2026, 11, 31) }}
                onChange={kn => setNhapLoc(cur => ({ ...cur, ngay: kn }))}
                nut={moLich => (
                  <button type="button" className="m-loc-dong" onClick={moLich}>
                    <div className="m-loc-dong-trai">
                      <span className="m-loc-dong-nhan">Ngày áp dụng</span>
                      <span className="m-loc-dong-tri">
                        {nhapLoc.ngay ? `${dmy(nhapLoc.ngay.tu)} - ${dmy(nhapLoc.ngay.den)}` : 'Tất cả'}
                      </span>
                    </div>
                    <Icon n="chevr" className="ic sm m-loc-dong-ic" />
                  </button>
                )}
              />

              {/* Sản phẩm / Nguyên vật liệu gốc */}
              <button
                type="button"
                className="m-loc-dong"
                onClick={() => setMoChonLoc('sp')}
              >
                <div className="m-loc-dong-trai">
                  <span className="m-loc-dong-nhan">{cb ? 'Sản phẩm' : 'Nguyên vật liệu gốc'}</span>
                  <span className="m-loc-dong-tri">
                    {nhapLoc.sp ? hangCua(nhapLoc.sp)?.ten ?? nhapLoc.sp : 'Tất cả'}
                  </span>
                </div>
                <Icon n="chevr" className="ic sm m-loc-dong-ic" />
              </button>

              {/* Nguyên vật liệu / Nguyên vật liệu đích */}
              <button
                type="button"
                className="m-loc-dong"
                onClick={() => setMoChonLoc('nvl')}
              >
                <div className="m-loc-dong-trai">
                  <span className="m-loc-dong-nhan">
                    {cb ? 'Nguyên vật liệu' : 'Nguyên vật liệu đích'}
                  </span>
                  <span className="m-loc-dong-tri">
                    {nhapLoc.nvl ? hangCua(nhapLoc.nvl)?.ten ?? nhapLoc.nvl : 'Tất cả'}
                  </span>
                </div>
                <Icon n="chevr" className="ic sm m-loc-dong-ic" />
              </button>

              {/* Cửa hàng áp dụng */}
              <button
                type="button"
                className="m-loc-dong"
                onClick={() => setMoChonLoc('cuaHang')}
              >
                <div className="m-loc-dong-trai">
                  <span className="m-loc-dong-nhan">Cửa hàng áp dụng</span>
                  <span className="m-loc-dong-tri">{nhapLoc.cuaHang || 'Tất cả'}</span>
                </div>
                <Icon n="chevr" className="ic sm m-loc-dong-ic" />
              </button>

              {/* Kênh áp dụng (chỉ cb) */}
              {cb && (
                <button
                  type="button"
                  className="m-loc-dong"
                  onClick={() => setMoChonLoc('kenh')}
                >
                  <div className="m-loc-dong-trai">
                    <span className="m-loc-dong-nhan">Kênh áp dụng</span>
                    <span className="m-loc-dong-tri">{nhapLoc.kenh || 'Tất cả'}</span>
                  </div>
                  <Icon n="chevr" className="ic sm m-loc-dong-ic" />
                </button>
              )}
            </div>

            <div className="m-loc-day">
              <button
                type="button"
                className="m-loc-btn-reset"
                onClick={() => {
                  setNhapLoc({ ngay: null, sp: '', nvl: '', cuaHang: '', kenh: '' })
                }}
              >
                Đặt lại
              </button>
              <button
                type="button"
                className="m-loc-btn-apply"
                onClick={() => {
                  setLoc(nhapLoc)
                  setMoLoc(false)
                }}
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chọn trong Bộ lọc */}
      {moChonLoc === 'sp' && (
        <MChon
          mo={true}
          onDong={() => setMoChonLoc(null)}
          tieuDe={cb ? 'Chọn sản phẩm' : 'Chọn nguyên vật liệu gốc'}
          ds={[{ k: '', ten: 'Tất cả' }, ...dsLocSp]}
          chon={nhapLoc.sp}
          tim={true}
          onChon={k => {
            setNhapLoc(cur => ({ ...cur, sp: k }))
            setMoChonLoc(null)
          }}
        />
      )}

      {moChonLoc === 'nvl' && (
        <MChon
          mo={true}
          onDong={() => setMoChonLoc(null)}
          tieuDe={cb ? 'Chọn nguyên vật liệu' : 'Chọn nguyên vật liệu đích'}
          ds={[{ k: '', ten: 'Tất cả' }, ...dsLocNvl]}
          chon={nhapLoc.nvl}
          tim={true}
          onChon={k => {
            setNhapLoc(cur => ({ ...cur, nvl: k }))
            setMoChonLoc(null)
          }}
        />
      )}

      {moChonLoc === 'cuaHang' && (
        <MChon
          mo={true}
          onDong={() => setMoChonLoc(null)}
          tieuDe="Chọn cửa hàng áp dụng"
          ds={[{ k: '', ten: 'Tất cả' }, ...CUA_HANG.map(c => ({ k: c.ten, ten: c.ten }))]}
          chon={nhapLoc.cuaHang}
          onChon={k => {
            setNhapLoc(cur => ({ ...cur, cuaHang: k }))
            setMoChonLoc(null)
          }}
        />
      )}

      {moChonLoc === 'kenh' && (
        <MChon
          mo={true}
          onDong={() => setMoChonLoc(null)}
          tieuDe="Chọn kênh áp dụng"
          ds={[{ k: '', ten: 'Tất cả' }, ...KENH.map(k => ({ k, ten: k }))]}
          chon={nhapLoc.kenh}
          onChon={k => {
            setNhapLoc(cur => ({ ...cur, kenh: k }))
            setMoChonLoc(null)
          }}
        />
      )}
    </div>
  )
}
