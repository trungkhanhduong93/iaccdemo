import { useCallback, useEffect, useMemo, useState, type FC } from 'react'
import type { Row, ScreenProps } from '../../modules/types'
import { kyMacDinh, useSession } from '../../app/session'
import { fold, money } from '../format'
import { tenMan } from '../../app/registry'
import { TRUONG_DM } from '../../modules/danh-muc/truong-dm'
import { LY_DO } from '../../data/mock'
import { MDanhSach } from './MDanhSach'
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

  const choThem = !laChiXem && !cfg.khongThem?.includes(s.goi)

  const nhoms = useMemo(() => {
    if (!cfg.nhomLoc) return []
    return Array.from(new Set(all.map(r => String(r[cfg.nhomLoc!] ?? '')).filter(Boolean))).sort()
  }, [all, cfg.nhomLoc])

  const laHangHoa = sc.code === '1.2' || sc.slug === 'hang-hoa' || sc.slug === '1-2'
  const [locTrangThai, setLocTrangThai] = useState<'hd' | 'ngung' | ''>('hd')
  const [tabPhanLoai, setTabPhanLoai] = useState<'tat-ca' | 'da-phan-loai' | 'chua-phan-loai'>('tat-ca')
  const [moChonTrangThai, setMoChonTrangThai] = useState(false)
  const [q, setQ] = useState('')

  useEffect(() => {
    setLocTrangThai('hd')
    setTabPhanLoai('tat-ca')
    setQ('')
  }, [sc])

  const allSauTrangThai = useMemo(() => {
    if (!locTrangThai) return all
    if (locTrangThai === 'hd') return all.filter(r => r._tt !== 0)
    if (locTrangThai === 'ngung') return all.filter(r => r._tt === 0)
    return all
  }, [all, locTrangThai])

  const demTatCa = allSauTrangThai.length
  const demDaPhanLoai = useMemo(() => allSauTrangThai.filter(r => Boolean(r.loai)).length, [allSauTrangThai])
  const demChuaPhanLoai = useMemo(() => allSauTrangThai.filter(r => !r.loai).length, [allSauTrangThai])

  const demDangHd = useMemo(() => all.filter(r => r._tt !== 0).length, [all])
  const demKhongHd = useMemo(() => all.filter(r => r._tt === 0).length, [all])

  const rows = useMemo(() => {
    return all.filter(r => {
      if (q.trim()) {
        const text = Object.values(r)
          .map(v => (v && typeof v === 'object' ? '' : String(v ?? '')))
          .join(' ')
        if (!fold(text).includes(fold(q.trim()))) return false
      }
      if (locTrangThai) {
        if (locTrangThai === 'hd' && r._tt === 0) return false
        if (locTrangThai === 'ngung' && r._tt !== 0) return false
      }
      if (laHangHoa) {
        if (tabPhanLoai === 'da-phan-loai' && !r.loai) return false
        if (tabPhanLoai === 'chua-phan-loai' && Boolean(r.loai)) return false
      }
      return true
    })
  }, [all, q, locTrangThai, laHangHoa, tabPhanLoai])

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

  const doiChiPhi = useCallback(
    (r: Row, checked: boolean) => {
      const k = khoaDong(r)
      if (k) setChiPhiGhiDe(prev => ({ ...prev, [k]: checked }))
      const item = LY_DO.find(x => x.ma === r.ma)
      if (item) item.chiPhi = checked
      toast('Đã lưu')
    },
    [khoaDong, toast],
  )

  // Tạo quỹ từ trang chủ (?moi=1&goiY=thuchi): mở thẳng form thêm, lưu quỹ mới xong gợi ý lập phiếu thu, chi (T250)
  const [thamSo, setThamSo] = useSearchParams()
  const [goiYThuChi, setGoiYThuChi] = useState(false)
  const [quyVuaTao, setQuyVuaTao] = useState<Row | null>(null)
  useEffect(() => {
    if (thamSo.get('moi') === null) return
    if (laChiXem) { setThamSo({}, { replace: true }); return }
    setGoiYThuChi(thamSo.get('goiY') === 'thuchi')
    setEdit({})
    setDienSan(undefined)
    setThamSo({}, { replace: true })
  }, [thamSo, laChiXem])   // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="m-dm-khung-v2">
        {/* Hàng chip lọc Trạng thái */}
        <div className="m-dm-hang-chip-loc">
          <button
            type="button"
            className="m-dm-chip-loc"
            onClick={() => setMoChonTrangThai(true)}
          >
            <span>Trạng thái: {locTrangThai === 'hd' ? 'Đang hoạt động' : locTrangThai === 'ngung' ? 'Không hoạt động' : 'Tất cả'}</span>
            <Icon n="chevd" className="ic sm" />
          </button>
        </div>

        {/* Tab gạch chân cuộn ngang với viên thuốc số */}
        <div className="m-dm-tab-cuon">
          {laHangHoa ? (
            <>
              <button
                type="button"
                className={`m-dm-tab-item${tabPhanLoai === 'tat-ca' ? ' on' : ''}`}
                onClick={() => setTabPhanLoai('tat-ca')}
              >
                <span>Tất cả</span>
                <span className="m-tab-pill">{demTatCa}</span>
              </button>
              <button
                type="button"
                className={`m-dm-tab-item${tabPhanLoai === 'da-phan-loai' ? ' on' : ''}`}
                onClick={() => setTabPhanLoai('da-phan-loai')}
              >
                <span>Đã phân loại</span>
                <span className="m-tab-pill">{demDaPhanLoai}</span>
              </button>
              <button
                type="button"
                className={`m-dm-tab-item${tabPhanLoai === 'chua-phan-loai' ? ' on' : ''}`}
                onClick={() => setTabPhanLoai('chua-phan-loai')}
              >
                <span>Chưa phân loại</span>
                <span className="m-tab-pill">{demChuaPhanLoai}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`m-dm-tab-item${locTrangThai === '' ? ' on' : ''}`}
                onClick={() => setLocTrangThai('')}
              >
                <span>Tất cả</span>
                <span className="m-tab-pill">{all.length}</span>
              </button>
              <button
                type="button"
                className={`m-dm-tab-item${locTrangThai === 'hd' ? ' on' : ''}`}
                onClick={() => setLocTrangThai('hd')}
              >
                <span>Đang hoạt động</span>
                <span className="m-tab-pill">{demDangHd}</span>
              </button>
              <button
                type="button"
                className={`m-dm-tab-item${locTrangThai === 'ngung' ? ' on' : ''}`}
                onClick={() => setLocTrangThai('ngung')}
              >
                <span>Không hoạt động</span>
                <span className="m-tab-pill">{demKhongHd}</span>
              </button>
            </>
          )}
        </div>

        {/* Ô tìm kiếm: Nhập từ khoá */}
        <div className="m-dm-o-tim-v2">
          <Icon n="search" className="ic sm m-dm-tim-ic" />
          <input
            type="text"
            className="m-dm-tim-inp-v2"
            placeholder="Nhập từ khoá"
            value={q}
            onChange={e => setQ(e.target.value)}
            aria-label="Nhập từ khoá"
          />
          {q && (
            <button
              type="button"
              className="m-dm-tim-x-v2"
              onClick={() => setQ('')}
              aria-label="Xoá tìm kiếm"
            >
              <Icon n="x" className="ic sm" />
            </button>
          )}
        </div>

        {/* Danh sách thẻ trắng */}
        <div className="m-dm-ds-v2">
          {rows.length === 0 ? (
            <div className="m-the-trang m-ch-trong" style={{ textAlign: 'center', padding: '32px 16px' }}>
              <p className="muted">Không có bản ghi phù hợp</p>
            </div>
          ) : (
            rows.map((r, i) => (
              <div
                key={`${String(r.id ?? r.ma ?? r.ten ?? '')}_${i}`}
                className="m-the-trang m-the-dm-v2"
                onClick={() => {
                  if (laLyDo) setXemLyDo(r)
                  else if (laPttt) setXemPttt(r)
                  else { setEdit(r); setDienSan(undefined) }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="m-the-dm-v2-trai">
                  <div className="m-the-dm-v2-dong-chinh">
                    <span className="m-the-dm-v2-stt">{i + 1}. </span>
                    <b className="m-the-dm-v2-ten">{r.ten || r.ma}</b>
                    {r.ma && <span className="m-the-dm-v2-ma"> - {r.ma}</span>}
                  </div>
                  <div className="m-the-dm-v2-dong-phu">
                    {laHangHoa
                      ? `Đơn vị tính chính: ${r.dvt || 'Cái'}`
                      : (r.nhom ? `Nhóm: ${r.nhom}` : r.dvt ? `ĐVT: ${r.dvt}` : (r.mst ? `MST: ${r.mst}` : ''))}
                  </div>
                </div>
                <div className="m-the-dm-v2-phai">
                  <Icon n="chevr" className="ic sm m-the-dm-v2-chevron" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Nút nổi góc dưới: Đồng bộ FABi (trái) và + (phải) */}
        <div className="m-dm-noi-day">
          <button
            type="button"
            className="m-btn-fabi-float"
            onClick={() => toast(cfg.nutPhu?.bao ?? 'Đã đồng bộ từ FABi')}
          >
            <img src="/logo-fabi.png" alt="FABi" className="logo-fabi-btn" />
            <span>Đồng bộ FABi</span>
          </button>

          {choThem && (
            <button
              type="button"
              className="m-btn-plus-float"
              onClick={() => { setEdit({}); setDienSan(undefined) }}
              aria-label={cfg.them ?? 'Thêm mới'}
            >
              <Icon n="plus" className="ic" />
            </button>
          )}
        </div>

        {/* Sheet chọn trạng thái */}
        {moChonTrangThai && (
          <MChon
            mo={moChonTrangThai}
            onDong={() => setMoChonTrangThai(false)}
            tieuDe="Chọn trạng thái"
            ds={[
              { k: 'hd', ten: 'Đang hoạt động' },
              { k: 'ngung', ten: 'Không hoạt động' },
              { k: '', ten: 'Tất cả' },
            ]}
            chon={locTrangThai}
            onChon={k => {
              setLocTrangThai(k as 'hd' | 'ngung' | '')
              setMoChonTrangThai(false)
            }}
          />
        )}
      </div>
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
          chiXem={laChiXem}
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
                    <span className="m-xp-tri">
                      <label className="m-dm-tich-cp">
                        <input
                          type="checkbox"
                          checked={Boolean(xemLyDo.chiPhi)}
                          aria-label={`Là chi phí ${xemLyDo.ten}`}
                          onChange={e => {
                            const moi = e.target.checked
                            doiChiPhi(xemLyDo, moi)
                            setXemLyDo(prev => (prev ? { ...prev, chiPhi: moi } : null))
                          }}
                        />
                        <span>Là chi phí</span>
                      </label>
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
              <span className="grow" />
              <button type="button" className="btn" onClick={() => setXemLyDo(null)}>
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
              <span className="grow" />
              <button type="button" className="btn" onClick={() => setXemPttt(null)}>
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


