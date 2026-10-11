// Màn danh mục chung: bảng có tìm kiếm, lọc nhóm, ngăn kéo thêm và sửa (T70)
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../../modules/types'
import { tenMan } from '../../app/registry'
import { chiNhanhHienTai, dsKyNam, kyMacDinh, ngayDauNam, truocDauNam, useSession } from '../../app/session'
import { CHI_NHANH } from '../../data/mock'
import { Icon } from '../Icon'
import { St, Table } from '../Table'
import { PhanTrang } from '../PhanTrang'
import { fold, nhapSoQT, soQT } from '../format'
import { Dropdown, MenuItem, Select } from '../Dropdown'
import { LocO, ThanhLoc } from '../ThanhLoc'
import { TRUONG_DM, type CauHinhDM, type KhoiDM, type TruongDM, type KieuTruong } from '../../modules/danh-muc/truong-dm'
import { heThongTk } from '../../modules/danh-muc/he-thong-tk'
import { FormToanMan } from '../FormToanMan'
import { LichSu } from './ChungTuForm'
import { HopXacNhan, NutTuyChinhCot, ONhanVien, useCotDs } from '../LocNangCao'
import { NutExcel, NutThemMoiSplit } from '../CongCuDs'

/** Mã mở form thêm hàng loạt trên đường dẫn: ?moi=hang-loat */
const HANG_LOAT = 'hang-loat'

/** Cột luôn hiện, không ẩn được ở Tuỳ chỉnh cột */
const COT_CO_DINH = new Set(['_stt'])
import { TEN_DVT, demHangTheoNhom } from '../../modules/danh-muc/data'

export function CatalogScreen({ sc }: ScreenProps) {
  const { s, set, toast } = useSession()
  const cfg = sc.catalog ?? { cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên' }], rows: () => [] }
  // Kỳ số liệu (yyyymm): màn có kySoLieu tính số liệu tới hết kỳ đang chọn
  const [ky, setKy] = useState(() => kyMacDinh(s))
  const all = useMemo(() => cfg.rows(s.cheDo, ky), [sc, s.cheDo, ky])
  const [q, setQ] = useState('')
  const [nhom, setNhom] = useState('')
  const [edit, setEdit] = useState<Row | null>(null)
  const [xacNhanAp, setXacNhanAp] = useState<{ n: number; ten: string } | null>(null)

  // Danh sách, cột và bảng ghi nhớ lại: mở panel hay gõ trong panel không vẽ lại cả bảng danh sách phía sau (T81)
  const nhoms = useMemo(() => cfg.nhomLoc ? [...new Set(all.map(r => r[cfg.nhomLoc!]))] : [], [all])
  const [tichLoc, setTichLoc] = useState(cfg.tich?.macDinh ?? false)
  const [moHangLoat, setMoHangLoat] = useState(false)
  const rows = useMemo(() => all.filter(r => (!nhom || r[cfg.nhomLoc!] === nhom) && (!q || fold(Object.values(r).join(' ')).includes(fold(q))) && (!tichLoc || !cfg.tich || cfg.tich.loc(r))), [all, nhom, q, tichLoc])
  const cols0 = useMemo(() => typeof cfg.cols === 'function' ? cfg.cols(s.goi) : cfg.cols, [sc, s.goi])
  const cols: Col[] = useMemo(() => [
    ...(cfg.stt ? [{ k: '_stt', t: 'STT', w: 60, c: true }] : []),
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
  const [dienSan, setDienSan] = useState<Row | undefined>(undefined)
  // Bấm dòng: gán luôn giá trị form cùng lượt vẽ, không đợi useEffect vẽ lần hai
  const moSua = useCallback((r: Row | null, kieu?: string, them?: Row) => {
    setEdit(r ? (kieu ? { ...r, _kieu: kieu } : r) : {})
    setDienSan(them)
  }, [])
  // STT đánh lại theo dòng đang hiện sau tìm, lọc
  const rowsHien = useMemo((): Row[] => cfg.stt ? rows.map((r, i) => ({ ...r, _stt: i + 1 })) : rows, [rows])
  // Kiểu danh sách chứng từ (dsChungTu): phân trang, dòng Tổng, chọn dòng xem chi tiết ở khung dưới như danh sách thu chi
  const dsct = cfg.dsChungTu
  // Kiểu thêm mới hiện theo gói đang dùng
  const bienHien = cauHinh?.bien?.filter(b => !b.goi || b.goi.includes(s.goi)) ?? []
  // Nút thêm: kiểu thêm từng dòng đầu tiên (nếu gói có), rồi Thêm hàng loạt, rồi các kiểu còn lại; gói không có kiểu đầu tiên thì Thêm hàng loạt là nút chính
  const hl = cfg.hangLoat ? [{ k: HANG_LOAT, ten: cfg.hangLoat.nhan, nut: cfg.hangLoat.nhan, icon: 'layers' }] : []
  const tung = bienHien.map(b => ({ k: b.k, ten: b.ten.charAt(0).toUpperCase() + b.ten.slice(1), nut: b.nut, icon: b.icon }))
  const nutThem = bienHien[0] === cauHinh?.bien?.[0] ? [tung[0], ...hl, ...tung.slice(1)] : [...hl, ...tung]
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(20)
  const [chon, setChon] = useState<Row | null>(null)
  const [moCt, setMoCt] = useState(false)
  const trangHt = Math.min(trang, Math.max(1, Math.ceil(rowsHien.length / coTrang)))
  const rowsTrang = useMemo(() => dsct ? rowsHien.slice((trangHt - 1) * coTrang, trangHt * coTrang) : rowsHien, [rowsHien, trangHt, coTrang])
  const cong = (ds: Row[]) => Object.fromEntries((dsct?.cotCong ?? []).map(k => [k, ds.reduce((a, r) => a + (Number(r[k]) || 0), 0)]))
  // Dòng đang xem ở khung dưới: dòng đã chọn nếu còn trong danh sách, không thì dòng đầu
  const dangChon = (chon && rowsHien.find(r => r[cols0[0].k] === chon[cols0[0].k])) ?? rowsHien[0]
  // Thứ tự, ẩn hiện, độ rộng cột lưu theo màn như danh sách chứng từ
  const cot = useCotDs(`/danh-muc/${sc.slug}`, cols, COT_CO_DINH)
  const bang = useMemo(() => dsct
    ? <Table cols={cot.colsHien} doRong={cot.doRong} rows={rowsTrang} motDong keDoc onRow={setChon} onDbl={moSua}
        rowCls={r => dangChon && r[cols0[0].k] === dangChon[cols0[0].k] ? 'dang-chon' : ''}
        sum={{ [cols[0].k]: `Tổng: ${rowsTrang.length}`, ...cong(rowsTrang) }} />
    : <Table cols={cols} rows={rowsHien} motDong onRow={moSua} />, [cols, cot.colsHien, cot.doRong, rowsHien, rowsTrang, moSua, dangChon])
  const ten = tenMan(sc)


  // Mở thẳng form thêm mới từ sơ đồ Quy trình: ?moi=<kiểu>, mở xong bỏ tham số khỏi đường dẫn
  const [thamSo, setThamSo] = useSearchParams()
  const viTri = useLocation()
  useEffect(() => {
    const k = thamSo.get('moi') ?? thamSo.get('loai')   // ?loai= từ menu Thêm theo loại của nút thêm
    if (k === null) return
    if (k === HANG_LOAT) { setMoHangLoat(true); setThamSo({}, { replace: true }); return }
    moSua({}, cauHinh?.bien?.some(b => b.k === k) ? k : undefined, (viTri.state as { tuPhieu?: Row } | null)?.tuPhieu)
    setThamSo({}, { replace: true })
  }, [thamSo])




  return (
    <div className={dsct ? 'page page-voucher' : 'page'}>
      <h1 className="sr-only" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>{ten}</h1>
      {cfg.note && <div style={{ marginBottom: 12 }}>{cfg.note(s.goi)}</div>}
      <div className={dsct ? `voucher-split${moCt ? '' : ' gon-ct'}` : undefined}>
      <section className={dsct ? 'card voucher-top' : 'card'}>
        {/* Danh sách kiểu chứng từ: thanh công cụ như danh sách thu chi (ô lọc nhãn trên viền, Tuỳ chỉnh cột, Excel, nút thêm có danh sách loại) */}
        {dsct ? (
          <div className="ds-thanh">
            {/* Bên trái thanh: lọc theo trạng thái, đúng chỗ chip trạng thái của danh sách thu chi */}
            {cfg.tich && (
              <label className="row ky-so-lieu">
                <input type="checkbox" checked={tichLoc} onChange={e => setTichLoc(e.target.checked)} />
                <span>{cfg.tich.nhan}</span>
              </label>
            )}
            <div className="ds-thanh-phai">
              {cfg.kySoLieu && (
                <ONhanVien nhan="Kỳ số liệu">
                  <Select className="inp" value={String(ky)} aria-label="Kỳ số liệu" onChange={e => setKy(Number(e.target.value))}
                    ds={dsKyNam(s).map(k => ({ v: String(k.so), t: k.nhan }))} />
                </ONhanVien>
              )}
              <ONhanVien nhan="Tìm kiếm">
                <input className="inp" value={q} placeholder="Số thẻ, mã, tên" onChange={e => setQ(e.target.value)} />
              </ONhanVien>
              {nhoms.length > 1 && (
                <ONhanVien nhan={cfg.nhanLoc ?? 'Nhóm'}>
                  <Select className="inp" value={nhom} aria-label={cfg.nhanLoc ?? 'Nhóm'} onChange={e => setNhom(e.target.value)}
                    ds={[{ v: '', t: 'Tất cả' }, ...nhoms.map(n => ({ v: String(n), t: String(n) }))]} />
                </ONhanVien>
              )}
              <NutTuyChinhCot cols={cot.colsDu} an={cot.an} coDinh={COT_CO_DINH} macDinh={cot.macDinh} dongBang={cot.dongBang}
                onLuu={cot.luu} onDoRongTuDong={cot.datDoRongTuDong} />
              <NutExcel onNhap={() => toast('Nhập danh sách từ Excel')} onXuat={() => toast(`Đã xuất ${rows.length} dòng ra Excel`)} />
              {nutThem.length > 0 && (
                <NutThemMoiSplit nhan={nutThem[0].nut} toMoi={`${viTri.pathname}?moi=${nutThem[0].k}`}
                  loai={nutThem.length > 1 ? nutThem.map(b => ({ k: b.k, ten: b.ten, icon: b.icon })) : undefined} />
              )}
            </div>
          </div>
        ) : (
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
        )}
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
        {dsct && rows.length > 0 && (
          <PhanTrang tong={rowsHien.length} tongCong={cong(rowsHien)} trang={trangHt} coTrang={coTrang}
            onTrang={setTrang} onCoTrang={ct => { setCoTrang(ct); setTrang(1) }} />
        )}
      </section>

      {/* Khung dưới: chi tiết dòng đang chọn, thu gọn / mở rộng như danh sách chứng từ */}
      {dsct && (
        <section className={`card ct-panel voucher-bottom${moCt ? '' : ' gon'}`}>
          {dangChon ? (
            <>
              <div className="voucher-bottom-h" onClick={moCt ? undefined : () => setMoCt(true)} style={moCt ? undefined : { cursor: 'pointer' }}>
                <div className="row" style={{ gap: 8, minWidth: 0, flex: '1 1 auto' }}>
                  <Icon n="doc" className="ic sm" />
                  <b style={{ whiteSpace: 'nowrap' }}>Chi tiết {dsct.so(dangChon)}</b>
                  <span className="dim" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dsct.moTa(dangChon)}</span>
                </div>
                {moCt && (
                  <button type="button" className="btn sm" style={{ flex: 'none' }} onClick={() => moSua(dangChon)} title="Mở form toàn màn hình (hoặc đúp chuột vào dòng)">
                    <Icon n="eye" className="ic sm" />Xem chi tiết
                  </button>
                )}
                <button type="button" className="btn sm ghost" style={{ flex: 'none', marginLeft: 4 }}
                  onClick={e => { e.stopPropagation(); setMoCt(!moCt) }}>
                  <Icon n={moCt ? 'chevd' : 'chevu'} className="ic sm" />{moCt ? 'Thu gọn' : 'Mở chi tiết'}
                </button>
              </div>
              {moCt && <div className="voucher-bottom-b">{dsct.chiTiet(dangChon)}</div>}
            </>
          ) : (
            <div className="empty"><b>Chọn một dòng ở bảng trên để xem chi tiết</b></div>
          )}
        </section>
      )}
      </div>

      {edit && (
        <CatalogPanel
          key={String(edit.ma ?? edit.username ?? (edit.ten ? edit.ten : 'moi'))}
          cauHinh={cauHinh}
          edit={edit}
          dienSan={dienSan}
          nhomLoc={cfg.nhomLoc}
          all={all}
          cols0={cols0}
          nhoms={nhoms}
          ten={ten}
          tenNgan={sc.ngan ?? ten}
          scSlug={sc.slug}
          nutChanPhu={val => (
            Boolean(edit.ma || edit.ten) && sc.slug === 'nhom-hang-hoa' ? (
              <button
                type="button"
                className="btn"
                onClick={() => setXacNhanAp({ n: val.ten ? demHangTheoNhom(val.ten) : 0, ten: val.ten || '' })}
              >
                Áp cho {val.ten ? demHangTheoNhom(val.ten) : 0} hàng hoá trong nhóm
              </button>
            ) : null
          )}
          onDong={() => setEdit(null)}
          onLuu={(_val, themTiep) => {
            toast('Đã lưu')
            if (!themTiep) setEdit(null)
          }}
        />
      )}
      {moHangLoat && cfg.hangLoat && <cfg.hangLoat.Form soDong={all.length} onDong={() => setMoHangLoat(false)} />}
      {xacNhanAp && (
        <HopXacNhan
          tieuDe="Áp thông tin ngầm định"
          nut="Đồng ý"
          nutHuy="Không"
          onDong={() => setXacNhanAp(null)}
          onDongY={() => {
            toast(`Đã áp thông tin ngầm định cho ${xacNhanAp.n} hàng hoá`)
            setXacNhanAp(null)
          }}
        >
          Áp thông tin ngầm định của nhóm {xacNhanAp.ten} cho {xacNhanAp.n} hàng hoá trong nhóm?
        </HopXacNhan>
      )}
    </div>
  )
}

export interface CatalogPanelProps {
  cauHinh?: CauHinhDM
  edit: Row | null
  dienSan?: Row
  nhomLoc?: string
  all?: Row[]
  cols0?: Col[]
  nhoms?: string[]
  ten?: string
  tenNgan?: string
  scSlug?: string
  anNutThemTiep?: boolean
  nutChanPhu?: React.ReactNode | ((formVal: Record<string, any>) => React.ReactNode)
  onDong: () => void
  onLuu?: (formVal: Record<string, any>, themTiep: boolean) => void
}

export function CatalogPanel({
  cauHinh,
  edit,
  dienSan,
  nhomLoc,
  all = [],
  cols0 = [],
  nhoms = [],
  ten = '',
  tenNgan,
  scSlug = '',
  anNutThemTiep = false,
  nutChanPhu,
  onDong,
  onLuu,
}: CatalogPanelProps) {
  const { s, set, toast } = useSession()
  const cnChon = chiNhanhHienTai(s)

  const dangSua = Boolean(edit && (edit.ma || edit.ten || edit.username || Object.keys(edit).length > 1))

  const [formVal, setFormVal] = useState<Record<string, any>>(() => {
    if (!edit) return {}
    const kieu = edit._kieu ?? cauHinh?.bien?.[0]?.k
    // Thêm mới: giá trị sẵn của cấu hình, kèm kiểu thêm mới (_kieu) khi màn có nhiều kiểu
    const moi = !dangSua ? (cauHinh?.moi?.(all, { kieu, ngayDauNam: ngayDauNam(s) }) ?? {}) : {}
    let v: Record<string, any> = dangSua
      ? { ...edit, _sua: 1, _tt: edit._tt === undefined ? 1 : edit._tt } // _sua: đang sửa dòng có sẵn
      : { ...moi, ...(kieu ? { _kieu: kieu } : {}), _tt: 1, _sua: 0 }
    // Giá trị điền sẵn từ màn khác (vd tạo thẻ từ phiếu chi): ghi đè rồi cho cấu hình tự tính các ô phụ thuộc
    if (!dangSua && dienSan) {
      for (const [k, val] of Object.entries(dienSan)) {
        v[k] = val
        if (cauHinh?.doi) v = { ...v, ...cauHinh.doi(k, v, all) }
      }
    }
    return v
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [moKhoi, setMoKhoi] = useState<Record<string, boolean>>({})
  const [tab, setTab] = useState('')
  const [hoi, setHoi] = useState<{ tieuDe: string; hoi: string; sua: Record<string, any>; themTiep: boolean; luu?: boolean } | null>(null)

  // Khung panel hiện ngay, thân nhiều trường vẽ ở khung hình sau để bấm mở không bị khựng (T81)
  const editThan = useDeferredValue(edit)

  // Đóng panel bằng phím Escape
  useEffect(() => {
    if (!edit) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('.ds-hop-nen')) onDong()   // đang mở hộp hỏi thì Esc chỉ đóng hộp
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [edit, onDong])

  const dsKhoi: KhoiDM[] = useMemo(() => {
    if (cauHinh?.khoi) return cauHinh.khoi
    if (cols0.length > 0) {
      const dsTuCot: TruongDM[] = cols0.map(c => ({
        k: c.k,
        nhan: c.t,
        kieu: (c.num ? 'so' : 'chu') as KieuTruong,
      }))
      dsTuCot.push({ k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true })
      return [{ ten: 'Thông tin chung', truong: dsTuCot }]
    }
    return []
  }, [cauHinh, cols0])

  const dsTk = useMemo(() => heThongTk(s.cheDo), [s.cheDo])
  // Lựa chọn của ô chọn tính một lần theo khoá trường, dùng lại giữa các lần vẽ
  const dsTkChon = useMemo(() => dsTk.map(t => ({ v: t.so, t: `${t.so} - ${t.ten}` })), [dsTk])
  const boNho = useMemo(() => new Map<string, { v: string; t: string }[]>(), [dsTkChon, nhoms, nhomLoc])

  const getOptions = (tr: TruongDM): { v: string; t: string }[] => {
    const daCo = boNho.get(tr.k)
    if (daCo) return daCo
    const dau = { v: '', t: `(Chọn ${tr.nhan.toLowerCase()})` }
    let ds: { v: string; t: string }[] = []
    // ô Nhóm lấy nhóm có trong dữ liệu trước, để dòng đang sửa luôn có nhóm của nó trong danh sách (T87)
    if (tr.k === 'nhom' && nhomLoc === 'nhom' && nhoms.length > 0) ds = nhoms.map(d => ({ v: d, t: d }))
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

  const hienO = (tr: TruongDM) => !tr.hien || tr.hien(formVal)
  // Nút phụ ở chân panel theo màn (vd Áp cho hàng hoá trong nhóm, T136)
  const nutPhu = typeof nutChanPhu === 'function' ? nutChanPhu(formVal) : nutChanPhu
  const isMo = (tenK: string) => moKhoi[tenK] !== false
  const toggleKhoi = (tenK: string) => setMoKhoi(m => ({ ...m, [tenK]: !isMo(tenK) }))

  // Gõ một ô: ghi giá trị rồi cho cấu hình tự tính các ô phụ thuộc
  const doiO = (k: string, val: unknown) => {
    let m = { ...formVal, [k]: val }
    if (cauHinh?.doi) m = { ...m, ...cauHinh.doi(k, m, all) }
    if (cauHinh?.hoiDoi) {
      const hd = cauHinh.hoiDoi(k, m, all)
      if (hd) {
        if (hd.dien) m = { ...m, ...hd.dien }
        if (hd.sua && Object.keys(hd.sua).length > 0) {
          setHoi({ tieuDe: hd.tieuDe, hoi: hd.hoi, sua: hd.sua, themTiep: false, luu: false })
        }
      }
    }
    setFormVal(m)
  }

  const handleLuu = (themTiep: boolean) => {
    const errs: Record<string, string> = {}
    for (const kh of dsKhoi) {
      for (const tr of kh.truong) {
        if (!hienO(tr)) continue
        // Thêm mới: ngày so với ngày đầu năm của đơn vị (chứng từ phát sinh từ ngày đầu năm, số dư trước ngày đầu năm)
        const dn = !dangSua && formVal[tr.k] ? tr.dauNam?.(formVal) : undefined
        if (dn) {
          const truoc = truocDauNam(s, String(formVal[tr.k]))
          if (dn === 'tu' && truoc) errs[tr.k] = `Phải từ ngày đầu năm ${ngayDauNam(s)} trở đi`
          if (dn === 'truoc' && !truoc) errs[tr.k] = `Thẻ dư đầu kỳ phải có ngày trước ngày đầu năm ${ngayDauNam(s)}`
        }
        if (tr.batBuoc) {
          const val = formVal[tr.k]
          if (tr.kieu === 'tich') {
            if (val === 0 || val === '0' || val === false || val === 'false') {
              errs[tr.k] = tr.k === 'dongY'
                ? 'Cần tích xác nhận đã đồng ý chia sẻ thông tin cá nhân'
                : `Cần tích ${tr.nhan.toLowerCase()}`
            }
          } else {
            if (val === undefined || val === null || String(val).trim() === '') {
              errs[tr.k] = `Vui lòng nhập ${tr.nhan.toLowerCase()}`
            }
          }
        }
      }
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    // Lỗi cần người dùng chọn cách xử lý (vd tổng phân bổ lệch): hỏi trước, không lưu khi chưa khớp
    const chan = cauHinh?.loi?.(formVal)
    if (chan) {
      toast(chan)
      return
    }
    const loi = cauHinh?.kiemLuu?.(formVal)
    if (loi) {
      setHoi({ ...loi, themTiep, luu: true })
      return
    }
    luuXong(themTiep)
  }

  const luuXong = (themTiep: boolean) => {
    onLuu?.(formVal, themTiep)
    if (themTiep) {
      const resetVal = cauHinh?.moi?.(all, { kieu: formVal._kieu, ngayDauNam: ngayDauNam(s) }) ?? {}
      setFormVal({ ...resetVal, _kieu: formVal._kieu, _tt: 1, _sua: 0 })
      setErrors({})
    }
  }

  const veBang = (kh: KhoiDM, maxH = 280) => {
    const b = kh.bang!(formVal, doiO)
    // Lưới có ô nhập dùng chung kiểu bảng chi tiết phiếu (bang-sua): ô cao 30px, chữ 12.5px
    return (
      <div className="bang-sua">
        {b.rows.length ? <Table cols={b.cols} rows={b.rows} sum={b.sum} rowCls={b.rowCls} maxH={maxH || undefined} /> : <div className="muted">{b.trong}</div>}
        {b.chan}
      </div>
    )
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
        {mo && kh.ve && <div className="pn-khoi-than">{kh.ve(formVal, doiO)}</div>}
        {mo && !kh.bang && !kh.ve && (
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
                            setErrors(err => ({ ...err, [tr.k]: '' }))
                          }}
                        />
                        <span>{tr.nhan}{tr.batBuoc && <em>*</em>}</span>
                      </label>
                      {errors[tr.k] && <span className="pn-loi pn-tich-loi">{errors[tr.k]}</span>}
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

  if (!edit) return null

  const tenNganHien = cauHinh?.bien?.find(b => b.k === formVal._kieu)?.ten ?? cauHinh?.ten ?? tenNgan ?? ten ?? 'danh mục'

  return (
    <>
      {/* Đang xem tất cả chi nhánh thì chọn chi nhánh trước khi thêm, như form chứng từ */}
      {cauHinh?.toanMan && !dangSua && !cnChon && (
        <FormToanMan icon={cauHinh.toanMan.icon} onClose={onDong} title={`Thêm ${tenNganHien}`}
          foot={<button type="button" className="btn" onClick={onDong}>Huỷ</button>}>
          <section className="card chon-cn">
            <b>Chọn chi nhánh lập {tenNganHien}</b>
            <p className="muted">Bạn đang xem tất cả chi nhánh. {tenNganHien.charAt(0).toUpperCase() + tenNganHien.slice(1)} mới lập cho một chi nhánh và không đổi được sau khi lập.</p>
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

      {cauHinh?.toanMan && (dangSua || cnChon) && (
        <FormToanMan
          icon={cauHinh.toanMan.icon}
          onClose={onDong}
          title={dangSua ? `Sửa ${tenNganHien}` : `Thêm ${tenNganHien}`}
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
              {nutPhu}
              <button type="button" className="btn" onClick={onDong}>Huỷ</button>
              <span className="grow" />
              <button type="button" className="btn" onClick={() => handleLuu(false)}>Lưu</button>
              {!anNutThemTiep && <button type="button" className="btn pri" onClick={() => handleLuu(true)}>Lưu và thêm</button>}
            </>
          )}
        >
          <div className="pn-hop pn-trong">
            <div className="pn-than">
              {/* Các khối theo thứ tự khai báo; các khối lưới liền nhau gộp thành một khung tab, thêm tab Lịch sử, như phiếu chi */}
              {editThan && dsKhoi.map((kh, i) => !kh.bang ? veKhoi(kh) : dsKhoi.findIndex(k => k.bang) === i && (
                <div key="tab" className="pn-khoi mo pn-duoi">
                  <div className="tabs">
                    {[...dsKhoi.filter(kh => kh.bang).map(kh => kh.ten), 'Lịch sử'].map(t => (
                      <button key={t} type="button" className={t === tabTm ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
                    ))}
                  </div>
                  <div className="pn-khoi-than">
                    {tabTm === 'Lịch sử'
                      ? <LichSu goi={s.goi} moi={!dangSua} man={`${scSlug}`} id={String(edit.ma ?? '')} />
                      : (() => { const kh = dsKhoi.find(k => k.ten === tabTm); return kh && veBang(kh, 0) })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FormToanMan>
      )}

      {!cauHinh?.toanMan && (
        <>
          <div className="overlay" onClick={onDong} />
          <aside className="pn-hop">
            <div className="pn-dau">
              <div>
                <h3>{dangSua ? `Sửa ${tenNganHien}` : `Thêm ${tenNganHien}`}</h3>
                <small className="muted">
                  {dangSua
                    ? ([formVal.ma ?? formVal.username, formVal.ten].filter(Boolean).join(' - ') || tenNganHien)
                    : (cauHinh?.moTa ?? tenNganHien)}
                </small>
              </div>
              <button type="button" className="icon-btn" onClick={onDong} aria-label="Đóng">
                <Icon n="x" />
              </button>
            </div>

            <div className="pn-than">
              {editThan && dsKhoi.map(veKhoi)}
            </div>

            <div className="pn-chan">
              {nutPhu}
              {nutPhu && <span className="grow" />}
              <button type="button" className="btn" onClick={onDong}>Huỷ</button>
              {!anNutThemTiep && <button type="button" className="btn" onClick={() => handleLuu(true)}>Lưu và thêm</button>}
              <button type="button" className="btn pri" onClick={() => handleLuu(false)}>Lưu</button>
            </div>
          </aside>
        </>
      )}

      {hoi && (
        <HopXacNhan tieuDe={hoi.tieuDe} nut="Đồng ý" nutHuy="Không" onDong={() => setHoi(null)} onDongY={() => {
          // Đồng ý: áp phần sửa (vd dồn phần lệch vào kỳ cuối) rồi lưu; Không: về form để người dùng tự sửa
          setFormVal(v => ({ ...v, ...hoi.sua }))
          const isSave = Boolean(hoi.luu || hoi.themTiep)
          const themTiep = hoi.themTiep
          setHoi(null)
          if (isSave) luuXong(themTiep)
        }}>
          {hoi.hoi}
        </HopXacNhan>
      )}
    </>
  )
}
