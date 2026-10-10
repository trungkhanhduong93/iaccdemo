// Màn danh mục chung: bảng có tìm kiếm, lọc nhóm, ngăn kéo thêm và sửa (T70)
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../../modules/types'
import { tenMan } from '../../app/registry'
import { chiNhanhHienTai, ngayDauNam, truocDauNam, useSession } from '../../app/session'
import { CHI_NHANH } from '../../data/mock'
import { Icon } from '../Icon'
import { St, Table } from '../Table'
import { fold, nhapSoQT, soQT } from '../format'
import { Dropdown, MenuItem, Select } from '../Dropdown'
import { LocO, ThanhLoc } from '../ThanhLoc'
import { TRUONG_DM, type KhoiDM, type TruongDM, type KieuTruong } from '../../modules/danh-muc/truong-dm'
import { heThongTk } from '../../modules/danh-muc/he-thong-tk'
import { FormToanMan } from '../FormToanMan'
import { LichSu } from './ChungTuForm'
import { HopXacNhan } from '../LocNangCao'
import { TEN_DVT } from '../../modules/danh-muc/data'

export function CatalogScreen({ sc }: ScreenProps) {
  const { s, set, toast } = useSession()
  const cnChon = chiNhanhHienTai(s)
  const cfg = sc.catalog ?? { cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên' }], rows: () => [] }
  const all = useMemo(() => cfg.rows(s.cheDo), [sc, s.cheDo])
  const [q, setQ] = useState('')
  const [nhom, setNhom] = useState('')
  const [edit, setEdit] = useState<Row | null>(null)
  const [formVal, setFormVal] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [moKhoi, setMoKhoi] = useState<Record<string, boolean>>({})
  const [tab, setTab] = useState('')
  const [hoi, setHoi] = useState<{ tieuDe: string; hoi: string; sua: Record<string, any>; themTiep: boolean } | null>(null)

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
  // Khối trường của danh mục: cấu hình riêng của màn, theo mã màn, hoặc dự phòng từ cột
  const cauHinh = cfg.truong ?? TRUONG_DM[sc.code ?? ''] ?? TRUONG_DM[sc.slug ?? '']
  // Bấm dòng: gán luôn giá trị form cùng lượt vẽ, không đợi useEffect vẽ lần hai
  const moSua = useCallback((r: Row | null, kieu?: string, them?: Row) => {
    setEdit(r)
    // Thêm mới: giá trị sẵn của cấu hình, kèm kiểu thêm mới (_kieu) khi màn có nhiều kiểu
    const moi = r && Object.keys(r).length === 0
      ? (k => ({ ...cauHinh?.moi?.(all, { kieu: k, ngayDauNam: ngayDauNam(s) }), ...(k ? { _kieu: k } : {}) }))(kieu ?? cauHinh?.bien?.[0].k)
      : undefined
    let v: Record<string, any> = r ? { ...r, ...moi, _sua: moi ? 0 : 1, _tt: r._tt === undefined ? 1 : r._tt } : {}   // _sua: đang sửa dòng có sẵn
    // Giá trị điền sẵn từ màn khác (vd tạo thẻ từ phiếu chi): ghi đè rồi cho cấu hình tự tính các ô phụ thuộc
    for (const [k, val] of Object.entries(them ?? {})) {
      v = { ...v, [k]: val }
      if (cauHinh?.doi) v = { ...v, ...cauHinh.doi(k, v, all) }
    }
    setFormVal(v)
    setErrors({})
    setTab('')
  }, [cauHinh, all, s])
  // Gõ một ô: ghi giá trị rồi cho cấu hình tự tính các ô phụ thuộc
  const doiO = (k: string, val: unknown) => setFormVal(v => {
    const m = { ...v, [k]: val }
    return cauHinh?.doi ? { ...m, ...cauHinh.doi(k, m, all) } : m
  })
  const bang = useMemo(() => <Table cols={cols} rows={rows} motDong onRow={moSua} />, [cols, rows, moSua])
  const ten = tenMan(sc)
  const tenNgan = cauHinh?.bien?.find(b => b.k === formVal._kieu)?.ten ?? cauHinh?.ten ?? sc.ngan ?? ten
  const hienO = (tr: TruongDM) => !tr.hien || tr.hien(formVal)

  // Mở thẳng form thêm mới từ sơ đồ Quy trình: ?moi=<kiểu>, mở xong bỏ tham số khỏi đường dẫn
  const [thamSo, setThamSo] = useSearchParams()
  const viTri = useLocation()
  useEffect(() => {
    const k = thamSo.get('moi')
    if (k === null) return
    moSua({}, cauHinh?.bien?.some(b => b.k === k) ? k : undefined, (viTri.state as { tuPhieu?: Row } | null)?.tuPhieu)
    setThamSo({}, { replace: true })
  }, [thamSo])
  const dangSua = Boolean(edit && (edit.ma || edit.ten || Object.keys(edit).length > 1))

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
      if (e.key === 'Escape' && !document.querySelector('.ds-hop-nen')) setEdit(null)   // đang mở hộp hỏi thì Esc chỉ đóng hộp
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
        // Thêm mới: ngày so với ngày đầu năm của đơn vị (chứng từ phát sinh từ ngày đầu năm, số dư trước ngày đầu năm)
        const dn = !dangSua && hienO(tr) && formVal[tr.k] ? tr.dauNam?.(formVal) : undefined
        if (dn) {
          const truoc = truocDauNam(s, String(formVal[tr.k]))
          if (dn === 'tu' && truoc) errs[tr.k] = `Phải từ ngày đầu năm ${ngayDauNam(s)} trở đi`
          if (dn === 'truoc' && !truoc) errs[tr.k] = `Thẻ dư đầu kỳ phải có ngày trước ngày đầu năm ${ngayDauNam(s)}`
        }
        if (tr.batBuoc && hienO(tr)) {
          const val = formVal[tr.k]
          if (val === undefined || val === null || String(val).trim() === '') {
            errs[tr.k] = `Vui lòng nhập ${(cauHinh?.nhan?.(tr, formVal) ?? tr.nhan).toLowerCase()}`
          }
        }
      }
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    // Lỗi cần người dùng chọn cách xử lý (vd tổng phân bổ lệch): hỏi trước, không lưu khi chưa khớp
    const loi = cauHinh?.kiemLuu?.(formVal)
    if (loi) {
      setHoi({ ...loi, themTiep })
      return
    }
    luuXong(themTiep)
  }

  const luuXong = (themTiep: boolean) => {
    toast('Đã lưu')
    if (themTiep) {
      setFormVal({ ...cauHinh?.moi?.(all, { kieu: formVal._kieu, ngayDauNam: ngayDauNam(s) }), _kieu: formVal._kieu, _tt: 1 })
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
    else if (tr.k === 'dvt') ds = TEN_DVT.map(d => ({ v: d, t: d }))
    const kq = [dau, ...ds]
    boNho.set(tr.k, kq)
    return kq
  }

  const laSo = (tr: TruongDM) => tr.kieu === 'tien' || tr.kieu === 'so'
  const formatGiaTri = (tr: TruongDM, v: any) => {
    // Số kiểu quốc tế: phẩy ngăn nghìn, chấm thập phân, chèn phẩy cả khi đang gõ
    if (cauHinh?.soQuocTe && laSo(tr)) return soQT(v)
    if (typeof v === 'number') {
      return tr.kieu === 'tien' ? v.toLocaleString('vi-VN') : String(v)
    }
    return v ?? ''
  }

  const veBang = (kh: KhoiDM, maxH = 280) => {
    const b = kh.bang!(formVal, doiO)
    return b.rows.length ? <Table cols={b.cols} rows={b.rows} sum={b.sum} rowCls={b.rowCls} maxH={maxH || undefined} /> : <div className="muted">{b.trong}</div>
  }
  // Tab đang mở ở form toàn màn hình: mặc định khối lưới đầu tiên
  const tabTm = tab || dsKhoi.find(kh => kh.bang)?.ten || 'Lịch sử'

  // Một khối của panel: ô nhập theo lưới, hoặc lưới tự tính (kh.bang)
  const veKhoi = (kh: KhoiDM) => {
    const mo = isMo(kh.ten)
    return (
      <div key={kh.ten} className={`pn-khoi${mo ? ' mo' : ''}`}>
        <div className="pn-khoi-dau" onClick={() => toggleKhoi(kh.ten)}>
          {/* Form toàn màn hình: mô tả nằm cạnh tên khối đầu, đầu form chỉ có nhãn chi nhánh như phiếu chi */}
          <span>{kh.ten}{cauHinh?.toanMan && cauHinh.moTa && kh === dsKhoi[0] && <small className="muted"> · {cauHinh.moTa}</small>}</span>
          <Icon n={mo ? 'chevd' : 'chevr'} className="ic sm" />
        </div>
        {mo && kh.bang && <div className="pn-khoi-than">{veBang(kh)}</div>}
        {mo && !kh.bang && (
          <div className="pn-khoi-than">
            <div className="pn-luoi">
              {kh.truong.filter(hienO).map(tr => {
                if (tr.kieu === 'tich') {
                  // Ô tích mặc định chiếm cả hàng; caHang: false thì nằm cùng hàng với ô khác
                  return (
                    <div className={tr.caHang === false ? 'f pn-tich-o' : 'f pn-hang-dai'} key={tr.k}>
                      <label className="row pn-tich">
                        <input
                          type="checkbox"
                          checked={formVal[tr.k] !== 0 && formVal[tr.k] !== false}
                          onChange={e => {
                            doiO(tr.k, e.target.checked ? 1 : 0)
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
                  <div className={`f${hangDai ? ' pn-hang-dai' : ''}`} key={tr.k} style={tr.goc ? { gridColumn: '-2 / -1', gridRow: tr.goc } : undefined}>
                    <label>
                      {cauHinh?.nhan?.(tr, formVal) ?? tr.nhan} {tr.batBuoc && <em>*</em>}
                      {tr.lien?.(formVal) && <Link className="pn-lien" to={tr.lien(formVal)!}>Xem phiếu gốc</Link>}
                    </label>
                    {tr.kieu === 'nhieuDong' ? (
                      <textarea
                        className="inp"
                        rows={2}
                        value={formVal[tr.k] ?? ''}
                        onChange={e => {
                          doiO(tr.k, e.target.value)
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
                          doiO(tr.k, e.target.value)
                          setErrors(err => ({ ...err, [tr.k]: '' }))
                        }}
                      />
                    ) : (
                      <input
                        className={`inp${tr.kieu === 'tien' ? ' pn-tien' : tr.kieu === 'so' ? ' pn-so' : ''}`}
                        readOnly={tr.chiDoc}
                        placeholder={tr.kieu === 'ngay' ? 'dd/mm/yyyy' : undefined}
                        value={formatGiaTri(tr, formVal[tr.k])}
                        onChange={e => {
                          doiO(tr.k, cauHinh?.soQuocTe && laSo(tr) ? nhapSoQT(e.target.value) : e.target.value)
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
              {cauHinh?.bien
                ? cauHinh.bien.slice().reverse().map((b, i, ds) => (
                  <button key={b.k} type="button" className={`btn${i === ds.length - 1 ? ' pri' : ''}`} onClick={() => moSua({}, b.k)}><Icon n="plus" className="ic sm" />{b.nut}</button>
                ))
                : <button type="button" className="btn pri" onClick={() => moSua({})}><Icon n="plus" className="ic sm" />{cfg.them ?? 'Thêm mới'}</button>}
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

      {/* Đang xem tất cả chi nhánh thì chọn chi nhánh trước khi thêm, như form chứng từ */}
      {edit && cauHinh?.toanMan && !dangSua && !cnChon && (
        <FormToanMan icon={cauHinh.toanMan.icon} onClose={dongPanel} title={`Thêm ${tenNgan}`}
          foot={<button type="button" className="btn" onClick={dongPanel}>Huỷ</button>}>
          <section className="card chon-cn">
            <b>Chọn chi nhánh lập {tenNgan}</b>
            <p className="muted">Bạn đang xem tất cả chi nhánh. {tenNgan.charAt(0).toUpperCase() + tenNgan.slice(1)} mới lập cho một chi nhánh và không đổi được sau khi lập.</p>
            <div className="chon-cn-ds">
              {CHI_NHANH.map(c => (
                <button key={c.id} type="button" className="btn" onClick={() => set({ chiNhanh: c.id })}>
                  <Icon n="store" className="ic sm" />{c.ten}
                </button>
              ))}
            </div>
          </section>
        </FormToanMan>
      )}

      {edit && cauHinh?.toanMan && (dangSua || cnChon) && (
        <FormToanMan
          icon={cauHinh.toanMan.icon}
          onClose={dongPanel}
          title={dangSua ? `Sửa ${tenNgan}` : `Thêm ${tenNgan}`}
          meta={(
            <>
              {(edit.cn ?? cnChon?.ten) && (
                <span className="chip info" title={dangSua ? 'Chi nhánh lập thẻ, không sửa được' : 'Theo chi nhánh chọn trên thanh trên, không sửa được'}>
                  <Icon n="store" className="ic sm" />{edit.cn ?? cnChon?.ten}
                </span>
              )}
            </>
          )}
          giua={dangSua ? <span className="fsf-tt sua">Đang chỉnh sửa <b>{edit.soThe ?? edit.ma}</b></span> : <span className="fsf-tt moi">Thêm mới</span>}
          foot={(
            <>
              <button type="button" className="btn" onClick={dongPanel}>Huỷ</button>
              <span className="grow" />
              <button type="button" className="btn" onClick={() => handleLuu(false)}>Lưu</button>
              <button type="button" className="btn pri" onClick={() => handleLuu(true)}>Lưu và thêm</button>
            </>
          )}
        >
          <div className="pn-hop pn-trong">
            <div className="pn-than">
              {/* 2/3 trên: các khối ô nhập; 1/3 dưới: khối lưới thành tab cạnh tab Lịch sử, như phiếu chi */}
              <div className="pn-tren">{editThan && dsKhoi.filter(kh => !kh.bang).map(veKhoi)}</div>
              {editThan && (
                <div className="pn-khoi mo pn-duoi">
                  <div className="tabs">
                    {[...dsKhoi.filter(kh => kh.bang).map(kh => kh.ten), 'Lịch sử'].map(t => (
                      <button key={t} type="button" className={t === tabTm ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
                    ))}
                  </div>
                  <div className="pn-khoi-than">
                    {tabTm === 'Lịch sử'
                      ? <LichSu goi={s.goi} moi={!dangSua} man={`${sc.slug}`} id={String(edit.ma ?? '')} />
                      : (() => { const kh = dsKhoi.find(k => k.ten === tabTm); return kh && veBang(kh, 0) })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </FormToanMan>
      )}

      {edit && !cauHinh?.toanMan && (
        <>
          <div className="overlay" onClick={dongPanel} />
          <aside className="pn-hop">
            <div className="pn-dau">
              <div>
                <h3>{dangSua ? `Sửa ${tenNgan}` : `Thêm ${tenNgan}`}</h3>
                <small className="muted">
                  {dangSua ? ([edit.ma, edit.ten].filter(Boolean).join(' - ') || ten) : cauHinh?.moTa ?? ten}
                </small>
              </div>
              <button type="button" className="icon-btn" onClick={dongPanel} aria-label="Đóng">
                <Icon n="x" />
              </button>
            </div>

            <div className="pn-than">
              {editThan && dsKhoi.map(veKhoi)}
            </div>

            <div className="pn-chan">
              <button type="button" className="btn" onClick={dongPanel}>Huỷ</button>
              <button type="button" className="btn" onClick={() => handleLuu(true)}>Lưu và thêm</button>
              <button type="button" className="btn pri" onClick={() => handleLuu(false)}>Lưu</button>
            </div>
          </aside>
        </>
      )}
      {hoi && (
        <HopXacNhan tieuDe={hoi.tieuDe} nut="Đồng ý" nutHuy="Không" onDong={() => setHoi(null)} onDongY={() => {
          // Đồng ý: áp phần sửa (vd dồn phần lệch vào kỳ cuối) rồi lưu; Không: về form để người dùng tự sửa
          setFormVal(v => ({ ...v, ...hoi.sua }))
          setHoi(null)
          luuXong(hoi.themTiep)
        }}>
          {hoi.hoi}
        </HopXacNhan>
      )}
    </div>
  )
}
