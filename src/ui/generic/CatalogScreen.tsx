// Màn danh mục chung: bảng có tìm kiếm, lọc nhóm, ngăn kéo thêm và sửa (T70)
import { useEffect, useMemo, useState } from 'react'
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

  const nhoms = cfg.nhomLoc ? [...new Set(all.map(r => r[cfg.nhomLoc!]))] : []
  const rows = all.filter(r => (!nhom || r[cfg.nhomLoc!] === nhom) && (!q || fold(Object.values(r).join(' ')).includes(fold(q))))
  const cols0 = typeof cfg.cols === 'function' ? cfg.cols(s.goi) : cfg.cols
  const cols: Col[] = [
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
  ]
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

  // Đồng bộ giá trị khi mở panel
  useEffect(() => {
    if (!edit) {
      setFormVal({})
      setErrors({})
      return
    }
    const val: Record<string, any> = { ...edit }
    if (val._tt === undefined) val._tt = 1
    setFormVal(val)
    setErrors({})
  }, [edit])

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

  const getOptions = (tr: TruongDM): { val: string; nhan: string }[] => {
    if (tr.ds && tr.ds.length > 0) {
      return tr.ds.map(d => ({ val: d, nhan: d }))
    }
    if (tr.k.toLowerCase().startsWith('tk')) {
      return dsTk.map(t => ({ val: t.so, nhan: `${t.so} - ${t.ten}` }))
    }
    if (tr.k === 'dvt') {
      return ['Tô', 'Phần', 'Dĩa', 'Ly', 'Lon', 'Chai', 'kg', 'g', 'Lít', 'ml', 'Thùng', 'Hộp', 'Cái'].map(d => ({ val: d, nhan: d }))
    }
    if (tr.k === 'nhom' && nhoms.length > 0) {
      return nhoms.map(d => ({ val: d, nhan: d }))
    }
    return []
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
              <button type="button" className="btn pri" onClick={() => setEdit({})}><Icon n="plus" className="ic sm" />{cfg.them ?? 'Thêm mới'}</button>
            </div>
          }
        />
        {rows.length ? <Table cols={cols} rows={rows} motDong onRow={r => setEdit(r)} /> : (
          all.length ? (
            <div className="empty">
              <b>Không có dòng khớp bộ lọc</b>
              <button type="button" className="btn sm empty-btn" onClick={() => { setQ(''); setNhom('') }}>Xoá bộ lọc</button>
            </div>
          ) : (
            <div className="empty">
              <b>Chưa có dữ liệu</b>
              <button type="button" className="btn sm pri empty-btn" onClick={() => setEdit({})}>{cfg.them ?? 'Thêm mới'}</button>
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
              {dsKhoi.map(kh => {
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

                            const opts = tr.kieu === 'chon' ? getOptions(tr) : []
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
                                  <select
                                    className="inp"
                                    value={formVal[tr.k] ?? ''}
                                    onChange={e => {
                                      setFormVal(v => ({ ...v, [tr.k]: e.target.value }))
                                      setErrors(err => ({ ...err, [tr.k]: '' }))
                                    }}
                                  >
                                    <option value="">(Chọn {tr.nhan.toLowerCase()})</option>
                                    {opts.map(o => (
                                      <option key={o.val} value={o.val}>{o.nhan}</option>
                                    ))}
                                  </select>
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
