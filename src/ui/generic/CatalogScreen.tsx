// Màn danh mục chung: bảng có tìm kiếm, lọc nhóm, ngăn kéo thêm và sửa (T70)
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../../modules/types'
import { tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { Icon } from '../Icon'
import { St, Table } from '../Table'
import { fold } from '../format'
import { Dropdown, MenuItem, Select } from '../Dropdown'
import { LocO, ThanhLoc } from '../ThanhLoc'
import { TRUONG_DM, type KhoiDM, type TruongDM, type KieuTruong } from '../../modules/danh-muc/truong-dm'
import { heThongTk } from '../../modules/danh-muc/he-thong-tk'

export function CatalogScreen({ sc }: ScreenProps) {
  const { s, toast } = useSession()
  const cfg = sc.catalog ?? { cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên' }], rows: () => [] }
  const all = useMemo(() => cfg.rows(s.cheDo), [sc, s.cheDo])
  const [q, setQ] = useState('')
  const [nhom, setNhom] = useState('')
  const [edit, setEdit] = useState<Row | null>(null)
  const [formVal, setFormVal] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [moKhoi, setMoKhoi] = useState<Record<string, boolean>>({})

  // Danh sách, cột và bảng ghi nhớ lại: mở panel hay gõ trong panel không vẽ lại cả bảng danh sách phía sau (T81)
  const nhoms = useMemo(() => cfg.nhomLoc ? [...new Set(all.map(r => r[cfg.nhomLoc!]))] : [], [all])
  const rows = useMemo(() => all.filter(r => (!nhom || r[cfg.nhomLoc!] === nhom) && (!q || fold(Object.values(r).join(' ')).includes(fold(q)))), [all, nhom, q])
  const cols0 = useMemo(() => typeof cfg.cols === 'function' ? cfg.cols(s.goi) : cfg.cols, [sc, s.goi])
  const cols: Col[] = useMemo(() => [
    ...cols0,
    { k: '_tt', t: 'Trạng thái', r: r => r._tt === 0 ? <St k="dim">Ngừng dùng</St> : <St k="ok">Đang dùng</St> },
    ...(cfg.chucNang ? [{
      k: '_cn',
      t: 'Chức năng',
      w: 150,
      dinh: 'phai' as const,
      r: (r: Row) => {
        const acts = cfg.chucNang!(r)
        if (!acts || acts.length === 0) return null
        const [dau, ...conLai] = acts
        return (
          <div className="row" style={{ gap: 4, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
            <Link to={`/app/${dau.di}`} className="btn sm ghost">{dau.nhan}</Link>
            {conLai.length > 0 && (
              <Dropdown
                btnClass="icon-btn sm"
                align="end"
                label={<Icon n="more" className="ic sm" />}
              >
                {conLai.map(m => (
                  <MenuItem key={m.di} to={`/app/${m.di}`} icon={m.icon}>{m.nhan}</MenuItem>
                ))}
              </Dropdown>
            )}
          </div>
        )
      },
    }] : []),
  ], [cols0, sc])
  // Bấm dòng: gán luôn giá trị form cùng lượt vẽ, không đợi useEffect vẽ lần hai
  const moSua = useCallback((r: Row | null) => {
    setEdit(r)
    setFormVal(r ? { ...r, _tt: r._tt === undefined ? 1 : r._tt } : {})
    setErrors({})
  }, [])
  const bang = useMemo(() => <Table cols={cols} rows={rows} motDong onRow={moSua} />, [cols, rows, moSua])
  const ten = tenMan(sc)
  const tenNgan = sc.ngan ?? ten
  const dangSua = Boolean(edit && (edit.ma || edit.ten || Object.keys(edit).length > 1))

  // Khối trường của danh mục theo cấu hình hoặc dự phòng từ cột
  const cauHinh = TRUONG_DM[sc.code ?? ''] ?? TRUONG_DM[sc.slug ?? '']
  const dsKhoi: KhoiDM[] = useMemo(() => {
    if (cauHinh?.khoi) return cauHinh.khoi
    const dsTuCot: TruongDM[] = cols0.map(c => ({
      k: c.k,
      nhan: c.t,
      kieu: (c.num ? 'so' : 'chu') as KieuTruong,
    }))
    dsTuCot.push({ k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true })
    return [{ ten: 'Thông tin chung', truong: dsTuCot }]
  }, [cauHinh, cols0])

  const dsTk = useMemo(() => heThongTk(s.cheDo), [s.cheDo])

  // Khung panel hiện ngay, thân nhiều trường vẽ ở khung hình sau để bấm mở không bị khựng (T81)
  const editThan = useDeferredValue(edit)

  // Đóng panel bằng phím Escape
  useEffect(() => {
    if (!edit) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEdit(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [edit])

  const dongPanel = () => setEdit(null)

  const isMo = (tenK: string) => moKhoi[tenK] !== false
  const toggleKhoi = (tenK: string) => setMoKhoi(m => ({ ...m, [tenK]: !isMo(tenK) }))

  const handleLuu = (themTiep: boolean) => {
    const errs: Record<string, string> = {}
    for (const kh of dsKhoi) {
      for (const tr of kh.truong) {
        if (tr.batBuoc) {
          const val = formVal[tr.k]
          if (val === undefined || val === null || String(val).trim() === '') {
            errs[tr.k] = `Vui lòng nhập ${tr.nhan.toLowerCase()}`
          }
        }
      }
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    toast('Đã lưu')
    if (themTiep) {
      setFormVal({ _tt: 1 })
      setErrors({})
    } else {
      setEdit(null)
    }
  }

  // Lựa chọn của ô chọn tính một lần theo khoá trường, dùng lại giữa các lần vẽ
  const dsTkChon = useMemo(() => dsTk.map(t => ({ v: t.so, t: `${t.so} - ${t.ten}` })), [dsTk])
  const boNho = useMemo(() => new Map<string, { v: string; t: string }[]>(), [dsTkChon, nhoms])
  const getOptions = (tr: TruongDM): { v: string; t: string }[] => {
    const daCo = boNho.get(tr.k)
    if (daCo) return daCo
    const dau = { v: '', t: `(Chọn ${tr.nhan.toLowerCase()})` }
    let ds: { v: string; t: string }[] = []
    // ô Nhóm lấy nhóm có trong dữ liệu trước, để dòng đang sửa luôn có nhóm của nó trong danh sách (T87)
    if (tr.k === 'nhom' && cfg.nhomLoc === 'nhom' && nhoms.length > 0) ds = nhoms.map(d => ({ v: d, t: d }))
    else if (tr.ds && tr.ds.length > 0) ds = tr.ds.map(d => ({ v: d, t: d }))
    else if (tr.k.toLowerCase().startsWith('tk')) ds = dsTkChon
    else if (tr.k === 'dvt') ds = ['Tô', 'Phần', 'Dĩa', 'Ly', 'Lon', 'Chai', 'kg', 'g', 'Lít', 'ml', 'Thùng', 'Hộp', 'Cái'].map(d => ({ v: d, t: d }))
    const kq = [dau, ...ds]
    boNho.set(tr.k, kq)
    return kq
  }

  const formatGiaTri = (tr: TruongDM, v: any) => {
    if (typeof v === 'number') {
      return tr.kieu === 'tien' ? v.toLocaleString('vi-VN') : String(v)
    }
    return v ?? ''
  }

  return (
    <div className="page">
      <h1 className="sr-only" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>{ten}</h1>
      {cfg.note && <div style={{ marginBottom: 12 }}>{cfg.note(s.goi)}</div>}
      <section className="card">
        <ThanhLoc
          tim={{
            value: q,
            onChange: setQ,
            placeholder: 'Tìm theo mã, tên',
          }}
          boLoc={
            nhoms.length > 1 ? (
              <LocO nhan={cfg.nhanLoc ?? 'Nhóm'}>
                <Select className="inp" value={nhom} onChange={e => setNhom(e.target.value)}>
                  <option value="">Tất cả</option>
                  {nhoms.map(n => <option key={n}>{n}</option>)}
                </Select>
              </LocO>
            ) : undefined
          }
          dangLoc={nhom !== ''}
          onLamMoi={() => setNhom('')}
          phai={
            <div className="row" style={{ gap: 8 }}>
              <span className="muted" style={{ fontSize: 12, marginRight: 4 }}>{rows.length}/{all.length} dòng</span>
              <button type="button" className="btn" onClick={() => toast('Nhập danh mục từ Excel')}><Icon n="upload" className="ic sm" />Nhập Excel</button>
              <button type="button" className="btn" onClick={() => toast(`Đã xuất ${rows.length} dòng ra Excel`)}><Icon n="download" className="ic sm" />Xuất Excel</button>
              <button type="button" className="btn pri" onClick={() => moSua({})}><Icon n="plus" className="ic sm" />{cfg.them ?? 'Thêm mới'}</button>
            </div>
          }
        />
        {rows.length ? bang : (
          all.length ? (
            <div className="empty">
              <b>Không có dòng khớp bộ lọc</b>
              <button type="button" className="btn sm empty-btn" onClick={() => { setQ(''); setNhom('') }}>Xoá bộ lọc</button>
            </div>
          ) : (
            <div className="empty">
              <b>Chưa có dữ liệu</b>
              <button type="button" className="btn sm pri empty-btn" onClick={() => moSua({})}>{cfg.them ?? 'Thêm mới'}</button>
            </div>
          )
        )}
      </section>

      {edit && (
        <>
          <div className="overlay" onClick={dongPanel} />
          <aside className="pn-hop">
            <div className="pn-dau">
              <div>
                <h3>{dangSua ? `Sửa ${tenNgan}` : `Thêm ${tenNgan}`}</h3>
                <small className="muted">
                  {dangSua ? ([edit.ma, edit.ten].filter(Boolean).join(' - ') || ten) : ten}
                </small>
              </div>
              <button type="button" className="icon-btn" onClick={dongPanel} aria-label="Đóng">
                <Icon n="x" />
              </button>
            </div>

            <div className="pn-than">
              {editThan && dsKhoi.map(kh => {
                const mo = isMo(kh.ten)
                return (
                  <div key={kh.ten} className={`pn-khoi${mo ? ' mo' : ''}`}>
                    <div className="pn-khoi-dau" onClick={() => toggleKhoi(kh.ten)}>
                      <span>{kh.ten}</span>
                      <Icon n={mo ? 'chevd' : 'chevr'} className="ic sm" />
                    </div>
                    {mo && (
                      <div className="pn-khoi-than">
                        <div className="pn-luoi">
                          {kh.truong.map(tr => {
                            if (tr.kieu === 'tich') {
                              return (
                                <div className="f pn-hang-dai" key={tr.k}>
                                  <label className="row pn-tich">
                                    <input
                                      type="checkbox"
                                      checked={formVal[tr.k] !== 0 && formVal[tr.k] !== false}
                                      onChange={e => {
                                        setFormVal(v => ({ ...v, [tr.k]: e.target.checked ? 1 : 0 }))
                                      }}
                                    />
                                    {tr.nhan}
                                  </label>
                                </div>
                              )
                            }

                            const chon = tr.kieu === 'chon' ? getOptions(tr) : []
                            // giá trị của dòng không có trong danh sách chọn thì thêm vào cuối, ô chọn khỏi bị trống
                            const gt = String(formVal[tr.k] ?? '')
                            const opts = gt && !chon.some(o => o.v === gt) ? [...chon, { v: gt, t: gt }] : chon
                            const hangDai = tr.caHang || tr.kieu === 'nhieuDong'

                            return (
                              <div className={`f${hangDai ? ' pn-hang-dai' : ''}`} key={tr.k}>
                                <label>
                                  {tr.nhan} {tr.batBuoc && <em>*</em>}
                                </label>
                                {tr.kieu === 'nhieuDong' ? (
                                  <textarea
                                    className="inp"
                                    rows={2}
                                    value={formVal[tr.k] ?? ''}
                                    onChange={e => {
                                      setFormVal(v => ({ ...v, [tr.k]: e.target.value }))
                                      setErrors(err => ({ ...err, [tr.k]: '' }))
                                    }}
                                  />
                                ) : tr.kieu === 'chon' ? (
                                  <Select
                                    className="inp"
                                    value={String(formVal[tr.k] ?? '')}
                                    ds={opts}
                                    aria-label={tr.nhan}
                                    onChange={e => {
                                      setFormVal(v => ({ ...v, [tr.k]: e.target.value }))
                                      setErrors(err => ({ ...err, [tr.k]: '' }))
                                    }}
                                  />
                                ) : (
                                  <input
                                    className={`inp${tr.kieu === 'tien' ? ' pn-tien' : tr.kieu === 'so' ? ' pn-so' : ''}`}
                                    placeholder={tr.kieu === 'ngay' ? 'dd/mm/yyyy' : undefined}
                                    value={formatGiaTri(tr, formVal[tr.k])}
                                    onChange={e => {
                                      setFormVal(v => ({ ...v, [tr.k]: e.target.value }))
                                      setErrors(err => ({ ...err, [tr.k]: '' }))
                                    }}
                                  />
                                )}
                                {errors[tr.k] && <span className="muted pn-loi">{errors[tr.k]}</span>}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="pn-chan">
              <button type="button" className="btn" onClick={dongPanel}>Huỷ</button>
              <button type="button" className="btn" onClick={() => handleLuu(true)}>Lưu và thêm</button>
              <button type="button" className="btn pri" onClick={() => handleLuu(false)}>Lưu</button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
