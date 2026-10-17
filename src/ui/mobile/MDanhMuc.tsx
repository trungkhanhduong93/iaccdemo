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

  const nhoms = useMemo(
    () =>
      cfg.nhomLoc
        ? [...new Set(all.map(r => String(r[cfg.nhomLoc!] ?? '')).filter(Boolean))].sort()
        : [],
    [all, cfg.nhomLoc],
  )
  const [nhomChon, setNhomChon] = useState('')

  const chips = useMemo(() => {
    if (nhoms.length === 0) return []
    return [
      { k: '', ten: 'Tất cả', dem: all.length },
      ...nhoms.map(n => ({
        k: n,
        ten: n,
        dem: all.filter(r => String(r[cfg.nhomLoc!] ?? '') === n).length,
      })),
    ]
  }, [nhoms, all, cfg.nhomLoc])

  const rows = useMemo(() => {
    return all.filter(r => {
      if (nhomChon && String(r[cfg.nhomLoc!] ?? '') !== nhomChon) return false
      return true
    })
  }, [all, nhomChon, cfg.nhomLoc])

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
      <MDanhSach
        rows={rows}
        timTheo={(r, q) => {
          const text = Object.values(r)
            .map(v => (v && typeof v === 'object' ? '' : String(v ?? '')))
            .join(' ')
          return fold(text).includes(fold(q))
        }}
        timPlaceholder="Tìm theo mã, tên..."
        chips={chips}
        chipChon={nhomChon}
        onChipChon={setNhomChon}
        onThem={choThem ? () => { setEdit({}); setDienSan(undefined) } : undefined}
        nhanThem={cfg.them ?? '+ Thêm mới'}
        kieuTrong={kieuTrong}
        tomTat={
          <span>
            Tổng <b>{rows.length}</b> bản ghi
          </span>
        }
        the={(r, i) => {
          const giaTriSo =
            cotSo && r[cotSo.k] !== undefined && r[cotSo.k] !== '' ? r[cotSo.k] : undefined
          return (
            <div
              key={`${String(r.id ?? r.ma ?? r.ten ?? '')}_${i}`}
              className="m-the-dm"
              onClick={() => {
                if (laLyDo) setXemLyDo(r)
                else if (laPttt) setXemPttt(r)
                else { setEdit(r); setDienSan(undefined) }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="m-the-dm-trai">
                <span className="m-the-dm-ten">{r.ten || r.ma}</span>
                {r.ma && <span className="m-the-dm-ma">Mã: {r.ma}</span>}
              </div>
              <div className="m-the-dm-phai">
                {giaTriSo !== undefined && (
                  <span className="m-the-dm-so">
                    {typeof giaTriSo === 'number'
                      ? `${money(giaTriSo)} đ`
                      : String(giaTriSo)}
                  </span>
                )}
                {laLyDo && r.dung === 'Chi tiền' ? (
                  <label
                    className="m-dm-tich-cp"
                    onClick={e => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(r.chiPhi)}
                      aria-label={`Là chi phí ${r.ten}`}
                      onChange={e => {
                        e.stopPropagation()
                        doiChiPhi(r, e.target.checked)
                      }}
                    />
                    <span>Là chi phí</span>
                  </label>
                ) : (
                  !cfg.dsChungTu && (
                    <span className={`m-ct-chip ${r._tt === 0 ? 'dim' : 'ok'}`}>
                      {r._tt === 0 ? 'Ngừng dùng' : 'Đang dùng'}
                    </span>
                  )
                )}
              </div>
            </div>
          )
        }}
      />
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


