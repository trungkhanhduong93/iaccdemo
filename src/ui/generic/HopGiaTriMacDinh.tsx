// Hộp cấu hình giá trị mặc định chứng từ theo cửa hàng, gói Pro (T955).
import { useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { dsCuaHang, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { Popover, Select } from '../Dropdown'
import { Icon } from '../Icon'
import {
  TRUONG_MAC_DINH,
  docMacDinh,
  docODaChon,
  duocSuaMacDinh,
  luuMacDinh,
  luuODaChon,
  type GiaTriMacDinh,
  type NhomTruong,
} from './giaTriMacDinh'

const NHOM_THONG_TIN: { nhom: NhomTruong; tieuDe: string; ghiChu: string }[] = [
  { nhom: 'dau', tieuDe: 'Đầu phiếu', ghiChu: 'điền một lần cho cả phiếu' },
  { nhom: 'luoi', tieuDe: 'Dòng chi tiết', ghiChu: 'điền cho mỗi dòng hàng thêm vào' },
]

const demO = (m: Record<string, string> | undefined, hien: Set<string>) =>
  (m ? Object.entries(m).filter(([k, v]) => Boolean(v) && hien.has(k)).length : 0)

export function HopGiaTriMacDinh(p: { ma: string; tenPhieu: string; anTruong?: string[]; onDong: (daLuu: boolean) => void }) {
  const { s, toast } = useSession()
  const dsCh = dsCuaHang(s)
  const chiXem = !duocSuaMacDinh(s.role)
  const truong = TRUONG_MAC_DINH[p.ma] ?? []
  const an = p.anTruong ?? []

  // Mặc định chọn cửa hàng đang lọc trên thanh trên nếu nằm trong danh sách, không thì cửa hàng đầu (T955)
  const [chId, setChId] = useState<string>(() => (dsCh.some(c => c.id === s.cuaHang) ? s.cuaHang : dsCh[0]?.id ?? ''))
  const [gt, setGt] = useState<GiaTriMacDinh>(() => docMacDinh(s.donVi, p.ma))
  const [oChon, setOChon] = useState<string[]>(() => docODaChon(s.donVi, p.ma))
  const [chepMo, setChepMo] = useState(false)
  const [themMo, setThemMo] = useState<NhomTruong | null>(null)
  const [tich, setTich] = useState<Record<string, boolean>>({})
  const chepBtnRef = useRef<HTMLButtonElement>(null)
  const dauBtnRef = useRef<HTMLButtonElement>(null)
  const luoiBtnRef = useRef<HTMLButtonElement>(null)
  const themRefs: Record<NhomTruong, RefObject<HTMLButtonElement | null>> = { dau: dauBtnRef, luoi: luoiBtnRef }
  const onDongRef = useRef(p.onDong)
  onDongRef.current = p.onDong

  // Esc đóng hộp (menu con Popover chặn nổi bọt trước nên Esc sẽ đóng menu trước)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDongRef.current(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const dat = (khoa: string, val: string) => {
    setGt(prev => {
      const chMap = { ...(prev[chId] ?? {}) }
      if (val) chMap[khoa] = val
      else delete chMap[khoa]
      const next = { ...prev }
      if (Object.keys(chMap).length > 0) next[chId] = chMap
      else delete next[chId]
      return next
    })
  }

  const chHienTai = dsCh.find(c => c.id === chId)
  const tenNgan = CUA_HANG.find(x => x.id === chId)?.ngan ?? chHienTai?.ten ?? ''
  const dsChep = dsCh.filter(c => c.id !== chId)
  const gtCh = gt[chId] ?? {}
  const khoaHien = new Set(truong.map(t => `${t.nhom}:${t.k}`).filter(k => oChon.includes(k) && !an.includes(k)))
  const themO = (k: string) => {
    setOChon(prev => (prev.includes(k) ? prev : [...prev, k]))
    setThemMo(null)
  }
  const goO = (k: string) => setOChon(prev => prev.filter(x => x !== k))

  const chepSang = () => {
    const chon = dsChep.filter(c => tich[c.id]).map(c => c.id)
    if (!chon.length) {
      toast('Chưa chọn cửa hàng nào.', { loai: 'canhBao' })
      return
    }
    setGt(prev => {
      const next = { ...prev }
      for (const id of chon) {
        const moi: Record<string, string> = { ...(prev[chId] ?? {}) }
        // Đổi ô chọn theo cửa hàng nhận (T962): giá trị hợp lệ thì giữ; không có mà theoCn thì đổi theo vị trí; còn lại bỏ ô
        for (const tr of truong) {
          if (!tr.ds) continue
          const khoa = `${tr.nhom}:${tr.k}`
          const val = moi[khoa]
          if (!val) continue
          const dsDst = tr.ds(id)
          if (dsDst.some(([v]) => v === val)) continue
          if (tr.theoCn) {
            const idx = tr.ds(chId).findIndex(([v]) => v === val)
            const moiVal = (idx >= 0 ? dsDst[idx]?.[0] : undefined) ?? dsDst[0]?.[0]
            if (moiVal) moi[khoa] = moiVal
            else delete moi[khoa]
          } else {
            delete moi[khoa]
          }
        }
        if (Object.keys(moi).length > 0) next[id] = moi
        else delete next[id]
      }
      return next
    })
    setChepMo(false)
    setTich({})
    toast(`Đã chép sang ${chon.length} cửa hàng. Bấm Lưu để giữ lại.`)
  }

  const luu = () => {
    const sach: GiaTriMacDinh = {}
    for (const [id, m] of Object.entries(gt)) {
      const clean: Record<string, string> = {}
      for (const [k, v] of Object.entries(m)) {
        if (v) clean[k] = v
      }
      if (Object.keys(clean).length > 0) sach[id] = clean
    }
    luuODaChon(s.donVi, p.ma, oChon)
    luuMacDinh(s.donVi, p.ma, sach)
    toast('Đã lưu giá trị mặc định')
    p.onDong(true)
  }

  return createPortal(
    <div className="overlay gtmd-nen" onMouseDown={e => { if (e.target === e.currentTarget) p.onDong(false) }}>
      <section className="gtmd-hop" role="dialog" aria-modal="true" aria-labelledby="gtmd-tieu-de">
        <div className="pn-dau">
          <div>
            <h3 id="gtmd-tieu-de">Giá trị mặc định</h3>
            <div className="gtmd-phu">{p.tenPhieu} · tự điền vào ô trống khi lập phiếu mới</div>
          </div>
          <button type="button" className="icon-btn" onClick={() => p.onDong(false)} aria-label="Đóng">
            <Icon n="x" kieu="net" />
          </button>
        </div>

        <div className="pn-hai-cot">
          <nav className="pn-muc-doc" aria-label="Cửa hàng">
            <div className="gtmd-muc-tieu-de">Cửa hàng</div>
            {dsCh.map(c => {
              const dem = demO(gt[c.id], khoaHien)
              const dangChon = c.id === chId
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`pn-muc${dangChon ? ' on' : ''}`}
                  aria-current={dangChon ? 'true' : undefined}
                  onClick={() => { setChId(c.id); setChepMo(false); setThemMo(null); setTich({}) }}
                >
                  <Icon n="cuahang" className="ic" kieu="net" />
                  <span className="gtmd-ch-ten">{c.ten}</span>
                  <span className={`gtmd-dem${dem > 0 ? ' co' : ''}`} title={`${dem} ô đã đặt`}>{dem}</span>
                </button>
              )
            })}
          </nav>

          <div className="pn-than gtmd-than">
            {chiXem ? (
              <div className="gtmd-khoa">
                <Icon n="lock" className="ic" kieu="net" />
                <div>
                  <b>Bạn đang xem, không sửa được</b>
                  <span>Muốn đổi giá trị mặc định, nhờ Chủ doanh nghiệp hoặc Kế toán trưởng.</span>
                </div>
              </div>
            ) : (
              <p className="gtmd-mo-ta">Chọn cửa hàng bên trái rồi chọn giá trị cho ô muốn tự điền. Ô để trống thì phiếu không điền gì.</p>
            )}

            {NHOM_THONG_TIN.map(({ nhom, tieuDe, ghiChu }) => {
              const dsNhom = truong.filter(t => t.nhom === nhom && !an.includes(`${nhom}:${t.k}`))
              if (!dsNhom.length) return null
              const dsTruong = dsNhom.filter(t => oChon.includes(`${nhom}:${t.k}`))
              const dsCon = dsNhom.filter(t => !oChon.includes(`${nhom}:${t.k}`))
              const daDat = dsTruong.filter(t => Boolean(gtCh[`${nhom}:${t.k}`])).length
              return (
                <div key={nhom} className="pn-khoi">
                  <div className="pn-khoi-dau">
                    {tieuDe} <small>{ghiChu}</small>
                    <span className="gtmd-tc-dem">{daDat}/{dsTruong.length} ô đã đặt</span>
                    {!chiXem && dsCon.length > 0 && (
                      <>
                        <button
                          ref={themRefs[nhom]}
                          type="button"
                          className="btn ghost gtmd-them-nut"
                          onClick={() => { setChepMo(false); setThemMo(m => (m === nhom ? null : nhom)) }}
                        >
                          + Thêm ô
                        </button>
                        <Popover
                          anchor={themRefs[nhom]}
                          open={themMo === nhom}
                          onClose={() => setThemMo(null)}
                          align="end"
                          width={220}
                          className="gtmd-menu-them"
                          role="menu"
                        >
                          {dsCon.map(tr => {
                            const k = `${nhom}:${tr.k}`
                            return (
                              <button key={k} type="button" role="menuitem" className="gtmd-them-muc" onClick={() => themO(k)}>
                                {tr.ten}
                              </button>
                            )
                          })}
                        </Popover>
                      </>
                    )}
                  </div>
                  {dsTruong.length === 0 ? (
                    <div className="gtmd-the-trong">
                      {chiXem ? 'Chưa có ô nào.' : 'Chưa có ô nào. Bấm Thêm ô để chọn.'}
                    </div>
                  ) : dsTruong.map(tr => {
                    const khoa = `${nhom}:${tr.k}`
                    const v = gtCh[khoa] ?? ''
                    const inputId = `gtmd-${nhom}-${tr.k}`
                    const opts = tr.ds ? [{ v: '', t: 'Để trống' }, ...tr.ds(chId).map(([val, nhan]) => ({ v: val, t: nhan }))] : null
                    return (
                      <div key={khoa} className="gtmd-dong">
                        <label className="gtmd-ten" htmlFor={!opts ? inputId : undefined}>{tr.ten}</label>
                        {opts ? (
                          <Select
                            className={v ? 'inp' : 'inp gtmd-trong'}
                            value={v}
                            ds={opts}
                            tim={opts.length > 5}
                            popClass="gtmd-pop"
                            onChange={e => dat(khoa, e.target.value)}
                            disabled={chiXem}
                            aria-label={tr.ten}
                          />
                        ) : (
                          <input
                            id={inputId}
                            className={v ? 'inp' : 'inp gtmd-trong'}
                            value={v}
                            placeholder="Để trống"
                            onChange={e => dat(khoa, e.target.value)}
                            disabled={chiXem}
                          />
                        )}
                        {!chiXem && (
                          <button
                            type="button"
                            className="icon-btn"
                            aria-label={`Gỡ ô ${tr.ten}`}
                            title={`Gỡ ô ${tr.ten}`}
                            onClick={() => goO(khoa)}
                          >
                            <Icon n="x" className="ic sm" kieu="net" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        <div className="pn-chan">
          {!chiXem && (
            <>
              <button
                ref={chepBtnRef}
                type="button"
                className="btn ghost"
                onClick={() => { setThemMo(null); setChepMo(o => !o); setTich({}) }}
              >
                <Icon n="copy" className="ic sm" kieu="net" />
                Chép của {tenNgan} sang cửa hàng khác
              </button>
              <Popover
                anchor={chepBtnRef}
                open={chepMo}
                onClose={() => setChepMo(false)}
                align="start"
                width={280}
                className="gtmd-menu-chep"
                role="dialog"
              >
                <div className="gtmd-chep-dau">Chép sang</div>
                {dsChep.length === 0 ? (
                  <p className="gtmd-chep-ghi">Chưa có cửa hàng khác để chép.</p>
                ) : (
                  <>
                    {dsChep.map(c => (
                      <label key={c.id} className="gtmd-chep-muc">
                        <input
                          type="checkbox"
                          checked={Boolean(tich[c.id])}
                          onChange={e => setTich(prev => ({ ...prev, [c.id]: e.target.checked }))}
                        />
                        {c.ten}
                      </label>
                    ))}
                    <p className="gtmd-chep-ghi">Giá trị đang có ở cửa hàng nhận sẽ bị thay. Kho đổi theo kho của từng cửa hàng.</p>
                    <button type="button" className="btn pri gtmd-chep-nut" onClick={chepSang}>Chép</button>
                  </>
                )}
              </Popover>
            </>
          )}
          <div className="gtmd-chan-phai">
            {chiXem ? (
              <button type="button" className="btn" onClick={() => p.onDong(false)}>Đóng</button>
            ) : (
              <>
                <button type="button" className="btn" onClick={() => p.onDong(false)}>Huỷ</button>
                <button type="button" className="btn pri" onClick={luu}>Lưu</button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>,
    document.body,
  )
}
