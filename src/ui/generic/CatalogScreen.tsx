// Màn danh mục chung: bảng có tìm kiếm, lọc nhóm, ngăn kéo thêm và sửa (T70)
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../../modules/types'
import { tenMan } from '../../app/registry'
import { cuaHangHienTai, dsKyNam, kyMacDinh, ngayDauNam, truocDauNam, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../Icon'
import { DaiCanhBao } from '../DaiCanhBao'
import { Table } from '../Table'
import { ChamTrangThai } from '../ChamTrangThai'
import { CO_TRANG_DM, PhanTrang } from '../PhanTrang'
import { fold, nhapSoQT, soQT } from '../format'
import { Dropdown, MenuItem, Select } from '../Dropdown'
import { LocO, ThanhLoc } from '../ThanhLoc'
import { TRUONG_DM, type CauHinhDM, type KhoiDM, type TruongDM, type KieuTruong } from '../../modules/danh-muc/truong-dm'
import { heThongTk } from '../../modules/danh-muc/he-thong-tk'
import { FormToanMan } from '../FormToanMan'
import { LichSu } from './ChungTuForm'
import { HopCotPhieu } from './BangSua'
import { NutPhimTat, phimDong } from '../BangPhimTat'
import { HopXacNhan, NutTuyChinhCot, ONhanVien, useCotDs } from '../LocNangCao'
import { NutExcel, NutThemMoiSplit } from '../CongCuDs'
import { sinhCotBoSung } from './TuyChonCotDM'
import { ChonKhoangNgay, ONgay, docNgay } from '../ChonNgay'
import { ChonCoTim, ChonNhieu as ChonNhieuIf } from '../../modules/danh-muc/QuyDoiDvt'

/** Mã mở form thêm hàng loạt trên đường dẫn: ?moi=hang-loat */
const HANG_LOAT = 'hang-loat'

/** Cột luôn hiện, không ẩn được ở Tuỳ chỉnh cột (T148) */
const COT_CO_DINH = new Set(['_stt', 'ma', 'ten', 'so'])
import { TEN_DVT } from '../../modules/danh-muc/data'
import { GoiYLapPhieu } from './GoiYLapPhieu'
import { HOM_NAY } from '../../data/mock'
import { dmy } from '../format'

export function CatalogScreen({ sc }: ScreenProps) {
  const { s, set, toast } = useSession()
  const cfg = sc.catalog ?? { cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên' }], rows: () => [] }
  // Kỳ số liệu (yyyymm): màn có kySoLieu tính số liệu tới hết kỳ đang chọn
  const [ky, setKy] = useState(() => kyMacDinh(s))
  // Cảnh báo trên bảng theo kỳ số liệu, vd khoản chờ phân bổ chưa tạo thẻ (T287); màn đổi thì CatalogScreen vẽ lại từ đầu nên gọi hook có điều kiện vẫn đúng thứ tự
  const canhBao = cfg.useCanhBao?.(ky) ?? null
  const cols0 = useMemo(() => typeof cfg.cols === 'function' ? cfg.cols(s.goi, s.cheDo) : cfg.cols, [sc, s.goi, s.cheDo])
  // Ghi đè trạng thái bật/tắt theo dòng khi người dùng bấm chấm tròn (T181)
  const [ttGhiDe, setTtGhiDe] = useState<Record<string, number>>({})
  // Dòng xoá qua Tiện ích ở form toàn màn (T297): ẩn trong phiên, theo số chứng từ (vd số thẻ) hoặc khoá dòng
  const [daXoaDm, setDaXoaDm] = useState<Set<string>>(new Set())
  useEffect(() => {
    setTtGhiDe({})
  }, [sc, s.cheDo])
  const khoaDong = useCallback((r: Row) => String(r._k ?? r.ma ?? r.so ?? r.username ?? r.id ?? (cols0[0]?.k ? r[cols0[0].k] : undefined) ?? r.ten ?? ''), [cols0])
  const doiTrangThai = useCallback((r: Row) => {
    const k = khoaDong(r)
    if (!k) return
    const ttMoi = r._tt === 0 ? 1 : 0
    setTtGhiDe(prev => ({ ...prev, [k]: ttMoi }))
  }, [khoaDong])

  const allGoc = useMemo(() => cfg.rows(s.cheDo, ky).filter(r => !cfg.locGoi || cfg.locGoi(s.goi, r)).map(r => cfg.phien ? cfg.phien.gan(r, s) : r),
    [sc, s.cheDo, ky, s.goi, cfg.phien ? s : null])   // eslint-disable-line react-hooks/exhaustive-deps
  const all = useMemo((): Row[] => {
    return allGoc.map((r, i) => {
      const k = String(r.ma ?? r.so ?? r.username ?? r.id ?? (cols0[0]?.k ? r[cols0[0].k] : undefined) ?? r.ten ?? `_r_${i}`)
      const _k = r._k ?? k
      const tt = ttGhiDe[_k] !== undefined ? ttGhiDe[_k] : r._tt
      return { ...r, _k, _tt: tt }
    })
  }, [allGoc, ttGhiDe, cols0])
  const choThem = !cfg.khongThem?.includes(s.goi)
  const [q, setQ] = useState('')
  const [nhom, setNhom] = useState('')
  const [edit, setEdit] = useState<Row | null>(null)

  // Danh sách, cột và bảng ghi nhớ lại: mở panel hay gõ trong panel không vẽ lại cả bảng danh sách phía sau (T81)
  const nhoms = useMemo(() => cfg.nhomLoc ? [...new Set(all.map(r => r[cfg.nhomLoc!]))] : [], [all])
  const [thamDau] = useSearchParams()   // ?tich=1 mở màn với ô tích lọc nhanh đã bật, vd Khoá sổ mở Quỹ tiền chưa map PTTT (T317)
  const [tichLoc, setTichLoc] = useState(thamDau.get('tich') === '1' || (cfg.tich?.macDinh ?? false))
  const [moHangLoat, setMoHangLoat] = useState(false)
  const khoaXoa = (r: Row) => String(cfg.dsChungTu?.cotSo ? r[cfg.dsChungTu.cotSo] : khoaDong(r))
  const rows = useMemo(() => all.filter(r => !daXoaDm.has(khoaXoa(r)) && (!nhom || r[cfg.nhomLoc!] === nhom) && (!q || fold(Object.values(r).join(' ')).includes(fold(q))) && (!tichLoc || !cfg.tich || cfg.tich.loc(r))), [all, nhom, q, tichLoc, daXoaDm])
  const cols: Col[] = useMemo(() => [
    ...(cfg.stt ? [{ k: '_stt', t: 'STT', w: 60, c: true }] : []),
    ...cols0.map(c => {
      if (c.k === 'ma' && !c.w) return { ...c, w: 100 }
      if (c.k === 'ten' && !c.w) return { ...c, w: 220 }
      return c
    }),
    // Danh sách kiểu chứng từ (dsChungTu, vd thẻ chi phí) không có cột Trạng thái như danh sách thu chi (T165)
    ...(cfg.dsChungTu ? [] : [{
      k: '_tt',
      t: 'Trạng thái',
      w: 100,
      c: true,
      r: (r: Row) => <ChamTrangThai bat={r._tt !== 0} onToggle={() => doiTrangThai(r)} />,
    }]),
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
  ], [cols0, sc, cfg.stt, cfg.chucNang])
  // Khối trường của danh mục: cấu hình riêng của màn, theo mã màn, hoặc dự phòng từ cột
  const cauHinh = cfg.truong ?? TRUONG_DM[sc.code ?? ''] ?? TRUONG_DM[sc.slug ?? '']
  const cotBoSung = useMemo(() => sinhCotBoSung(cols, cauHinh, s.goi, s.cheDo), [cols, cauHinh, s.goi, s.cheDo])
  const tatCaCols = useMemo(() => [...cols, ...cotBoSung], [cols, cotBoSung])
  // Thứ tự, ẩn hiện, độ rộng cột lưu theo màn dùng chung useCotDs (T148)
  const cot = useCotDs(`/danh-muc/${sc.slug ?? sc.code ?? 'chung'}`, tatCaCols, COT_CO_DINH)
  const [dienSan, setDienSan] = useState<Row | undefined>(undefined)
  // Bấm dòng: gán luôn giá trị form cùng lượt vẽ, không đợi useEffect vẽ lần hai
  const moSua = useCallback((r: Row | null, kieu?: string, them?: Row) => {
    setEdit(r ? (kieu ? { ...r, _kieu: kieu } : r) : {})
    setDienSan(them)
  }, [])
  // STT đánh lại theo dòng đang hiện sau tìm, lọc
  const rowsHien = useMemo((): Row[] => cfg.stt ? rows.map((r, i) => ({ ...r, _stt: i + 1 })) : rows, [rows, cfg.stt])
  // Kiểu danh sách chứng từ (dsChungTu): phân trang, dòng Tổng, chọn dòng xem chi tiết ở khung dưới như danh sách thu chi
  const dsct = cfg.dsChungTu
  // Kiểu thêm mới hiện theo gói đang dùng
  const bienHien = cauHinh?.bien?.filter(b => !b.goi || b.goi.includes(s.goi)) ?? []
  // Nút thêm: kiểu thêm từng dòng đầu tiên (nếu gói có), rồi Thêm hàng loạt, rồi các kiểu còn lại; gói không có kiểu đầu tiên thì Thêm hàng loạt là nút chính
  const hl = cfg.hangLoat ? [{ k: HANG_LOAT, ten: cfg.hangLoat.nhan, nut: cfg.hangLoat.nhan, icon: 'layers' }] : []
  const tung = bienHien.map(b => ({ k: b.k, ten: b.menu ?? b.ten.charAt(0).toUpperCase() + b.ten.slice(1), nut: b.nut, icon: b.icon }))
  const nutThem = bienHien[0] === cauHinh?.bien?.[0] ? [tung[0], ...hl, ...tung.slice(1)] : [...hl, ...tung]
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(dsct ? 20 : 50)   // danh mục thường mặc định 50 dòng/trang (T153)
  const [chon, setChon] = useState<Row | null>(null)
  const [moCt, setMoCt] = useState(false)
  const trangHt = Math.min(trang, Math.max(1, Math.ceil(rowsHien.length / coTrang)))
  const rowsTrang = useMemo(() => rowsHien.slice((trangHt - 1) * coTrang, trangHt * coTrang), [rowsHien, trangHt, coTrang])
  // Đổi danh mục, tìm, lọc thì về trang 1 (T153)
  useEffect(() => { setTrang(1) }, [sc, q, nhom, tichLoc])
  const cong = (ds: Row[]) => Object.fromEntries((dsct?.cotCong ?? []).map(k => [k, ds.reduce((a, r) => a + (Number(r[k]) || 0), 0)]))
  // Dòng đang xem ở khung dưới: dòng đã chọn nếu còn trong danh sách, không thì dòng đầu
  const dangChon = (chon && rowsHien.find(r => r[cols0[0].k] === chon[cols0[0].k])) ?? rowsHien[0]
  const bang = useMemo(() => dsct
    ? <Table cols={cot.colsHien.map(c => c.k === dsct.cotSo ? { ...c, r: (r: Row) => (
          <button type="button" className="ds-link-so" title={String(r[c.k] ?? '')} onClick={e => { e.stopPropagation(); moSua(r) }}>{r[c.k]}</button>
        ) } : c)} doRong={cot.doRong} rows={rowsTrang} motDong keDoc onRow={setChon} onDbl={moSua}
        rowCls={r => dangChon && r[cols0[0].k] === dangChon[cols0[0].k] ? 'dang-chon' : ''}
        sum={{ [cols[0].k]: `Tổng: ${rowsTrang.length}`, ...cong(rowsTrang) }} />
    : <Table cols={cot.colsHien} doRong={cot.doRong} rows={rowsTrang} motDong onRow={moSua} />, [dsct, cot.colsHien, cot.doRong, rowsTrang, dangChon, cols0, cols, moSua])
  const ten = tenMan(sc)


  // Mở thẳng form thêm mới từ sơ đồ Quy trình: ?moi=<kiểu>, mở xong bỏ tham số khỏi đường dẫn
  const [thamSo, setThamSo] = useSearchParams()
  const viTri = useLocation()
  // ?goiY=thuchi: tạo quỹ từ trang chủ, lưu quỹ mới xong gợi ý lập phiếu thu, chi (T250)
  const [goiYThuChi, setGoiYThuChi] = useState(false)
  const [quyVuaTao, setQuyVuaTao] = useState<Row | null>(null)
  useEffect(() => {
    // ?mo=<số>: mở thẳng một dòng có sẵn, vd bấm số thẻ chi phí ở phiếu chi (T168)
    const mo = thamSo.get('mo')
    if (mo !== null) {
      const r = all.find(x => String(x[dsct?.cotSo ?? cols0[0].k]) === mo)
      if (r) moSua(r)
      setThamSo({}, { replace: true })
      return
    }
    const k = thamSo.get('moi') ?? thamSo.get('loai')   // ?loai= từ menu Thêm theo loại của nút thêm
    if (k === null) return
    setGoiYThuChi(thamSo.get('goiY') === 'thuchi')
    if (k === HANG_LOAT) { setMoHangLoat(true); setThamSo({}, { replace: true }); return }
    moSua({}, cauHinh?.bien?.some(b => b.k === k) ? k : undefined, (viTri.state as { tuPhieu?: Row } | null)?.tuPhieu)
    setThamSo({}, { replace: true })
  }, [thamSo])




  return (
    <div className={dsct ? 'page page-voucher' : 'page page-voucher page-dm'}>
      <h1 className="sr-only" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>{ten}</h1>
      {cfg.note && <div style={{ marginBottom: 12 }}>{cfg.note(s.goi)}</div>}
      <div className={dsct ? `voucher-split${moCt ? '' : ' gon-ct'}` : 'dm-khung'}>
      <section className={dsct ? 'card voucher-top' : 'card dm-bang'}>
        {/* Danh sách kiểu chứng từ: thanh công cụ như danh sách thu chi (ô lọc nhãn trên viền, Tuỳ chỉnh cột, Excel, nút thêm có danh sách loại) */}
        {dsct ? (
          <div className="ds-thanh">
            {/* Bên trái thanh: lọc theo trạng thái, đúng chỗ chip trạng thái của danh sách thu chi */}
            {cfg.tich && (
              <label className="row ky-so-lieu">
                <input type="checkbox" className="bat-tat" checked={tichLoc} onChange={e => setTichLoc(e.target.checked)} />
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
                  so={nutThem[0].k === HANG_LOAT && canhBao?.so ? canhBao.so : undefined}
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
                {/* Ô tích lọc nhanh ở danh mục thường, vd Quỹ tiền chưa map PTTT (T317) */}
                {cfg.tich && (
                  <label className="row ky-so-lieu">
                    <input type="checkbox" className="bat-tat" checked={tichLoc} onChange={e => setTichLoc(e.target.checked)} />
                    <span>{cfg.tich.nhan}</span>
                  </label>
                )}
                <span className="muted" style={{ fontSize: 12, marginRight: 4 }}>{rows.length}/{all.length} dòng</span>
                <NutTuyChinhCot cols={cot.colsDu} an={cot.an} coDinh={COT_CO_DINH} macDinh={cot.macDinh} dongBang={cot.dongBang}
                  onLuu={cot.luu} onDoRongTuDong={cot.datDoRongTuDong} />
                {!cfg.khongExcel?.includes(s.goi) && <>
                  <button type="button" className="btn" onClick={() => toast('Nhập danh mục từ Excel')}><Icon n="upload" className="ic sm" />Nhập Excel</button>
                  <button type="button" className="btn" onClick={() => toast(`Đã xuất ${rows.length} dòng ra Excel`)}><Icon n="download" className="ic sm" />Xuất Excel</button>
                </>}
                {cfg.nutPhu && (
                  cfg.nutPhu.chiIcon ? (
                    <button
                      type="button"
                      className="nut-vuong"
                      title={cfg.nutPhu.nhan}
                      aria-label={cfg.nutPhu.nhan}
                      onClick={() => toast(cfg.nutPhu!.bao)}
                    >
                      <Icon n={cfg.nutPhu.icon} className="ic sm" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`btn${choThem ? '' : ' pri'}`}
                      onClick={() => toast(cfg.nutPhu!.bao)}
                    >
                      <Icon n={cfg.nutPhu.icon} className="ic sm" />{cfg.nutPhu.nhan}
                    </button>
                  )
                )}
                {choThem && <button type="button" className="btn pri" onClick={() => moSua({})}><Icon n="plus" className="ic sm" />{cfg.them ?? 'Thêm mới'}</button>}
              </div>
            }
          />
        )}
        {/* Dải cảnh báo trên bảng; không có nút riêng, chỉ sang nút thêm hàng loạt đang có số đếm ngay phía trên (T287) */}
        {canhBao && <DaiCanhBao cb={canhBao} />}
        {rows.length ? bang : (
          all.length ? (
            <div className="empty">
              <b>Không có dòng khớp bộ lọc</b>
              <button type="button" className="btn sm empty-btn" onClick={() => { setQ(''); setNhom('') }}>Xoá bộ lọc</button>
            </div>
          ) : (
            <div className="empty">
              <b>Chưa có dữ liệu</b>
              {choThem && <button type="button" className="btn sm pri empty-btn" onClick={() => moSua({})}>{cfg.them ?? 'Thêm mới'}</button>}
            </div>
          )
        )}
        {rows.length > 0 && (dsct
          ? <PhanTrang tong={rowsHien.length} tongCong={cong(rowsHien)} trang={trangHt} coTrang={coTrang}
              onTrang={setTrang} onCoTrang={ct => { setCoTrang(ct); setTrang(1) }} />
          // Danh mục thường: chỉ đếm dòng, không cộng tiền (T153)
          : <PhanTrang tong={rowsHien.length} trang={trangHt} coTrang={coTrang} dsCoTrang={CO_TRANG_DM}
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
          onDong={() => setEdit(null)}
          onXoa={val => { setDaXoaDm(x => new Set(x).add(khoaXoa(val))); setEdit(null); toast(`Đã xoá ${val.soThe ?? val.ma ?? ''}`) }}
          onSaoChep={(kieu, d) => { setEdit(null); setTimeout(() => moSua({}, kieu, d), 0) }}
          onLuu={(val, themTiep) => {
            if (val && val._tt !== undefined) {
              const k = khoaDong(val)
              if (k) setTtGhiDe(prev => ({ ...prev, [k]: Number(val._tt) }))
            }
            if (val && cfg.phien) set(cfg.phien.luu(val, s))   // T245
            toast('Đã lưu')
            if (goiYThuChi && val && !edit.ma && !themTiep) { setQuyVuaTao(val); setGoiYThuChi(false) }
            if (!themTiep) setEdit(null)
          }}
        />
      )}
      {quyVuaTao && <GoiYLapPhieu quy={quyVuaTao} onDong={() => setQuyVuaTao(null)} />}
      {moHangLoat && cfg.hangLoat && <cfg.hangLoat.Form soDong={all.length} rows={all} onDong={() => setMoHangLoat(false)} />}
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
  onXoa?: (formVal: Record<string, any>) => void            // Tiện ích Xoá (T297)
  onSaoChep?: (kieu: string | undefined, dienSan: Record<string, any>) => void   // Tiện ích Sao chép: mở form thêm mới điền sẵn
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
  onXoa,
  onSaoChep,
}: CatalogPanelProps) {
  const { s, set, toast } = useSession()
  const cnChon = cuaHangHienTai(s)

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
  // Tuỳ chỉnh giao diện form toàn màn có lưới (T297): cột ẩn theo tab, khoá "tab|cột", nhớ theo màn trên máy
  const khoaCot = `iacc-cot-dm:${scSlug}`
  const [anCot, setAnCot] = useState<string[]>(() => {
    try { const v = JSON.parse(localStorage.getItem(khoaCot) ?? '[]'); return Array.isArray(v) ? v : [] } catch { return [] }
  })
  const [hopCot, setHopCot] = useState(false)
  const doiAnCot = (an: string[]) => {
    setAnCot(an)
    try { localStorage.setItem(khoaCot, JSON.stringify(an)) } catch { /* trình duyệt chặn lưu thì chỉ giữ trong phiên */ }
  }
  // Cột luôn hiện: cột hệ thống (_stt, _xoa), Mã, Tên
  const cotKhoa = (k: string) => k.startsWith('_') || k === 'ma' || k === 'ten'
  // Form toàn màn hình mở dòng có sẵn: chỉ xem như phiếu chi, bấm Sửa (Ctrl+E) mới sửa; Huỷ khi đang sửa thì về xem, bỏ thay đổi
  const [xem, setXem] = useState(Boolean(cauHinh?.toanMan && dangSua))
  const goc = useRef(formVal)
  useEffect(() => {
    if (!xem) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') { e.preventDefault(); setXem(false) }
      // Ctrl+O sao chép như Tiện ích Sao chép (T297)
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') { e.preventDefault(); saoChepRef.current() }
      // Ctrl+Delete xoá như Tiện ích Xoá, hỏi lại trước (T297)
      else if ((e.ctrlKey || e.metaKey) && e.key === 'Delete' && cauHinhRef.current?.tienIch?.xoa?.(formValRef.current)) { e.preventDefault(); setHoiXoa(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [xem])
  const huySua = () => { setFormVal(goc.current); setErrors({}); setXem(true) }
  // Tiện ích (T297): sao chép mở form thêm mới điền sẵn; xoá hỏi lại trước
  const [hoiXoa, setHoiXoa] = useState(false)
  const saoChep = () => { const d = cauHinh?.tienIch?.saoChep?.(formVal); if (d) onSaoChep?.(formVal._kieu, d) }
  const saoChepRef = useRef(saoChep)
  saoChepRef.current = saoChep
  const cauHinhRef = useRef(cauHinh)
  cauHinhRef.current = cauHinh
  const formValRef = useRef(formVal)
  formValRef.current = formVal
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
    if (cauHinh?.khoi) return cauHinh.khoi.filter(kh => (!kh.goi || kh.goi.includes(s.goi)) && (!kh.cheDo || kh.cheDo.includes(s.cheDo)))
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
  }, [cauHinh, cols0, s.goi, s.cheDo])

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
    else if (tr.ds && tr.ds.length > 0) ds = tr.ds.map(d => ({ v: d, t: tr.nhanDs ? tr.nhanDs(d) : d }))
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

  const hienO = (tr: TruongDM) => (!tr.goi || tr.goi.includes(s.goi)) && (!tr.cheDo || tr.cheDo.includes(s.cheDo)) && (!tr.hien || tr.hien(formVal))
  // Nút phụ ở chân panel theo màn (vd Áp cho hàng hoá trong nhóm, T136)
  const nutPhu = typeof nutChanPhu === 'function' ? nutChanPhu(formVal) : nutChanPhu
  const isMo = (tenK: string) => moKhoi[tenK] !== false
  const toggleKhoi = (tenK: string) => setMoKhoi(m => ({ ...m, [tenK]: !isMo(tenK) }))

  // Gõ một ô: ghi giá trị rồi cho cấu hình tự tính các ô phụ thuộc
  const doiO = (k: string, val: unknown) => {
    let m = { ...formVal, [k]: val }
    if (cauHinh?.doi) m = { ...m, ...cauHinh.doi(k, m, all) }
    if (cauHinh?.hoiDoi && (!cauHinh.goiHoiDoi || cauHinh.goiHoiDoi.includes(s.goi))) {
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
  // Form toàn màn đang thêm, sửa: Ctrl+S lưu, Ctrl+Shift+S lưu và thêm như phiếu chứng từ (T297)
  const luuRef = useRef(handleLuu)
  luuRef.current = handleLuu
  const huySuaRef = useRef(huySua)
  huySuaRef.current = huySua
  useEffect(() => {
    if (!edit || !cauHinh?.toanMan || xem) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); luuRef.current(e.shiftKey && !anNutThemTiep) }
      // Ctrl+Q huỷ thay đổi như nút Huỷ: đang sửa thì về xem, thêm mới thì đóng
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'q') { e.preventDefault(); if (dangSua) huySuaRef.current(); else onDong() }
      else phimDong(e)   // Ctrl+Insert, Alt+Delete ở bảng có nút Thêm dòng, Xoá dòng
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [edit, xem, anNutThemTiep, dangSua, onDong])

  const luuXong = (themTiep: boolean) => {
    onLuu?.(formVal, themTiep)
    if (themTiep) {
      const resetVal = cauHinh?.moi?.(all, { kieu: formVal._kieu, ngayDauNam: ngayDauNam(s) }) ?? {}
      setFormVal({ ...resetVal, _kieu: formVal._kieu, _tt: 1, _sua: 0 })
      setErrors({})
    }
  }

  const veBang = (kh: KhoiDM, maxH = 280) => {
    const b = kh.bang!(formVal, doiO, s.goi, xem)
    // Cột người dùng tắt ở Tuỳ chỉnh giao diện (T297)
    const cols = b.cols.filter(c => cotKhoa(c.k) || !anCot.includes(`${kh.ten}|${c.k}`))
    // Lưới có ô nhập dùng chung kiểu bảng chi tiết phiếu (bang-sua): ô cao 30px, chữ 12.5px
    return (
      <div className="bang-sua">
        {/* Chế độ xem: ẩn cột xoá dòng (_xoa) và nút dưới lưới (Thêm dòng, Xoá hết) (T165) */}
        {b.rows.length ? <Table cols={xem ? cols.filter(c => c.k !== '_xoa') : cols} rows={b.rows} sum={b.sum} rowCls={b.rowCls} maxH={maxH || undefined} /> : <div className="muted">{b.trong}</div>}
        {!xem && b.chan}
      </div>
    )
  }

  // Tab đang mở ở form toàn màn hình: mặc định khối lưới đầu tiên
  const tabTm = tab || dsKhoi.find(kh => kh.bang)?.ten || 'Lịch sử'

  // Một khối của panel: ô nhập theo lưới, hoặc lưới tự tính (kh.bang)
  const veKhoi = (kh: KhoiDM) => {
    const mo = kh.anDau || isMo(kh.ten)
    return (
      <div key={kh.ten} className={`pn-khoi${mo ? ' mo' : ''}${kh.anDau ? ' pn-an-dau' : ''}`}>
        {!kh.anDau && <div className="pn-khoi-dau" onClick={() => toggleKhoi(kh.ten)}>
          {/* Form toàn màn hình: mô tả nằm cạnh tên khối đầu, đầu form chỉ có nhãn cửa hàng như phiếu chi */}
          <span>{kh.ten}{cauHinh?.toanMan && cauHinh.moTa && kh === dsKhoi[0] && <small className="muted"> · {cauHinh.moTa}</small>}</span>
          {kh.congTac && (() => {
            // Trạng thái dạng công tắc ở đầu khối như iFaster (T154)
            const bat = formVal[kh.congTac] !== 0 && formVal[kh.congTac] !== false
            return (
              <button type="button" role="switch" aria-checked={bat} aria-label={bat ? 'Đang sử dụng' : 'Ngừng sử dụng'} title={bat ? 'Đang sử dụng' : 'Ngừng sử dụng'}
                className={`ds-ct pn-cong-tac${bat ? ' on' : ''}`} onClick={e => { e.stopPropagation(); doiO(kh.congTac!, bat ? 0 : 1) }}><i /></button>
            )
          })()}
          <Icon n={mo ? 'chevd' : 'chevr'} className="ic sm" />
        </div>}
        {mo && kh.bang && <div className="pn-khoi-than">{veBang(kh)}</div>}
        {mo && kh.ve && <div className="pn-khoi-than">{kh.ve(formVal, doiO, xem)}</div>}
        {mo && !kh.bang && !kh.ve && (
          <div className="pn-khoi-than">
            <div className={`pn-luoi${cauHinh?.haiCot ? ' pn-luoi-2' : ''}`}>
              {kh.truong.filter(hienO).map(tr => {
                if (tr.kieu === 'tich') {
                  // Ô tích mặc định chiếm cả hàng; caHang: false thì nằm cùng hàng với ô khác
                  return (
                    <div className={tr.caHang === false ? 'f pn-tich-o' : 'f pn-hang-dai'} key={tr.k}>
                      <label className="row pn-tich">
                        <input
                          type="checkbox"
                          className="bat-tat"
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
                    ) : tr.kieu === 'chonNhieu' ? (
                      <ChonNhieu ds={tr.ds ?? []} maDs={tr.maDs} giaTri={String(formVal[tr.k] ?? '')} nhan={tr.nhan} goiY={tr.goiY}
                        onDoi={v => { doiO(tr.k, v); setErrors(err => ({ ...err, [tr.k]: '' })) }} />
                    ) : tr.kieu === 'chonTim' ? (
                      // Ô chọn có tìm, mỗi dòng tên và mã; ô đã chọn hiện "mã · tên" (T151), có maDs thì "Tên (MÃ)" (T154)
                      <ChonCoTim nhan={tr.nhan} value={String(formVal[tr.k] ?? '')}
                        ds={(tr.ds ?? []).map(v => ({ v, t: tr.nhanDs ? tr.nhanDs(v) : v, phu: tr.maDs ? (tr.maDs(v) && `Mã: ${tr.maDs(v)}`) : `Mã: ${v}` }))}
                        hienChon={m => tr.maDs ? (tr.maDs(m.v) ? `${m.t} (${tr.maDs(m.v)})` : m.t) : `${m.v} · ${m.t}`}
                        onChange={v => { doiO(tr.k, v); setErrors(err => ({ ...err, [tr.k]: '' })) }} />
                    ) : tr.kieu === 'khoangNgay' ? (
                      // Khoảng ngày lưu "dd/mm/yyyy - dd/mm/yyyy", dùng khung chọn khoảng ngày chung (T154)
                      <ChonKhoangNgay value={docKhoang(String(formVal[tr.k] ?? ''))}
                        onChange={k => { doiO(tr.k, `${dmy(k.tu)} - ${dmy(k.den)}`); setErrors(err => ({ ...err, [tr.k]: '' })) }} />
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
                    ) : tr.kieu === 'ngay' ? (
                      <ONgay
                        value={String(formVal[tr.k] ?? '')}
                        readOnly={typeof tr.chiDoc === 'function' ? tr.chiDoc(formVal) : tr.chiDoc}
                        placeholder="dd/mm/yyyy"
                        ariaLabel={tr.nhan}
                        onChange={v => {
                          doiO(tr.k, v)
                          setErrors(err => ({ ...err, [tr.k]: '' }))
                        }}
                      />
                    ) : (
                      <input
                        className={`inp${tr.kieu === 'tien' ? ' pn-tien' : tr.kieu === 'so' ? ' pn-so' : ''}`}
                        readOnly={typeof tr.chiDoc === 'function' ? tr.chiDoc(formVal) : tr.chiDoc}
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
      {/* Đang xem tất cả cửa hàng thì chọn cửa hàng trước khi thêm, như form chứng từ */}
      {cauHinh?.toanMan && !dangSua && !cnChon && (
        <FormToanMan icon={cauHinh.toanMan.icon} onClose={onDong} title={`Thêm ${tenNganHien}`}
          foot={<button type="button" className="btn" onClick={onDong}>Huỷ</button>}>
          <section className="card chon-cn">
            <b>Chọn cửa hàng lập {tenNganHien}</b>
            <p className="muted">Bạn đang xem tất cả cửa hàng. {tenNganHien.charAt(0).toUpperCase() + tenNganHien.slice(1)} mới lập cho một cửa hàng và không đổi được sau khi lập.</p>
            <div className="chon-cn-ds">
              {CUA_HANG.map(c => (
                <button key={c.id} type="button" className="btn" onClick={() => set({ cuaHang: c.id })}>
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
          title={tenNganHien.charAt(0).toUpperCase() + tenNganHien.slice(1)}
          // Tuỳ chỉnh giao diện: nút vuông nhỏ ở góc trên phải như form chứng từ (T297); chỉ form có lưới
          phai={<>
            {dsKhoi.some(kh => kh.bang) && (
              <button type="button" className={`nut-vuong ds-nut-cot${hopCot ? ' on' : ''}`} onClick={() => setHopCot(true)}
                title="Tuỳ chỉnh giao diện: bật tắt cột bảng chi tiết" aria-label="Tuỳ chỉnh giao diện"><Icon n="chinh" className="ic sm" /></button>
            )}
            {/* Hướng dẫn phím tắt như phiếu thu chi (T297) */}
            <NutPhimTat ds={[['Lưu', 'Ctrl + S'], ...(!anNutThemTiep ? [['Lưu và thêm mới', 'Ctrl + Shift + S'] as [string, string]] : []),
              ['Sửa ' + tenNganHien.split(' ')[0], 'Ctrl + E'], ['Huỷ thay đổi', 'Ctrl + Q'],
              // Thêm, xoá dòng chỉ khi lưới có nút dưới lưới (vd thẻ dư đầu kỳ)
              ...(dsKhoi.some(kh => kh.bang && kh.bang(formVal, doiO, s.goi, false).chan) ? [['Thêm dòng chi tiết', 'Ctrl + Insert'], ['Xoá dòng chi tiết', 'Alt + Delete']] as [string, string][] : []),
              ...(cauHinh?.tienIch?.saoChep?.(formVal) ? [['Sao chép ' + tenNganHien.split(' ')[0], 'Ctrl + O'] as [string, string]] : []),
              ...(cauHinh?.tienIch?.xoa?.(formVal) ? [['Xoá ' + tenNganHien.split(' ')[0], 'Ctrl + Delete'] as [string, string]] : []),
              ['Đóng form', 'Esc']]} />
          </>}
          meta={(
            <>
              {(edit.cn ?? cnChon?.ten) && (
                <span className="chip info" title={dangSua ? 'Cửa hàng lập thẻ, không sửa được' : 'Theo cửa hàng chọn trên thanh trên, không sửa được'}>
                  <Icon n="store" className="ic sm" />{edit.cn ?? cnChon?.ten}
                </span>
              )}
            </>
          )}
          giua={!dangSua ? <span className="fsf-tt moi">Thêm mới</span>
            : xem ? <span className="fsf-tt xem">Chi tiết {tenNganHien} <b>{edit.soThe ?? edit.ma}</b></span>
              : <span className="fsf-tt sua">Đang chỉnh sửa <b>{edit.soThe ?? edit.ma}</b></span>}
          foot={xem ? (
            <>
              {nutPhu}
              <span className="grow" />
              {/* Tiện ích như phiếu thu chi: Sao chép, Xoá (T297) */}
              {(cauHinh?.tienIch?.saoChep?.(formVal) || cauHinh?.tienIch?.xoa?.(formVal)) && (
                <Dropdown btnClass="btn sm" align="end" width={180} label={<><Icon n="more" className="ic sm" />Tiện ích</>}>
                  {dongMenu => <>
                    {cauHinh?.tienIch?.saoChep?.(formVal) && (
                      <MenuItem icon="copy" onClick={() => { dongMenu(); saoChep() }}>Sao chép</MenuItem>
                    )}
                    {cauHinh?.tienIch?.xoa?.(formVal) && (
                      <MenuItem icon="trash" onClick={() => { dongMenu(); setHoiXoa(true) }}>Xoá</MenuItem>
                    )}
                  </>}
                </Dropdown>
              )}
              <button type="button" className="btn sm pri" onClick={() => setXem(false)}><Icon n="edit" className="ic sm" />Sửa (Ctrl+E)</button>
              <button type="button" className="btn sm" onClick={onDong}>Đóng (Esc)</button>
            </>
          ) : (
            <>
              {nutPhu}
              <button type="button" className="btn" onClick={dangSua ? huySua : onDong}>Huỷ</button>
              <span className="grow" />
              <button type="button" className="btn" onClick={() => handleLuu(false)}>Lưu</button>
              {!anNutThemTiep && <button type="button" className="btn pri" onClick={() => handleLuu(true)}>Lưu và thêm</button>}
            </>
          )}
        >
          <div className="pn-hop pn-trong">
            <div className="pn-than">
              {/* Các khối theo thứ tự khai báo; các khối lưới liền nhau gộp thành một khung tab, thêm tab Lịch sử, như phiếu chi */}
              {/* Chế độ xem: fieldset disabled khoá mọi ô nhập, nút trong khối; tab, thu gọn khối vẫn bấm được */}
              {editThan && dsKhoi.map((kh, i) => !kh.bang ? <fieldset key={kh.ten} className="pn-fs" disabled={xem}>{veKhoi(kh)}</fieldset> : dsKhoi.findIndex(k => k.bang) === i && (
                <div key="tab" className="pn-khoi mo pn-duoi">
                  <div className="tabs">
                    {[...dsKhoi.filter(kh => kh.bang).map(kh => kh.ten), 'Lịch sử'].map(t => (
                      <button key={t} type="button" className={t === tabTm ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
                    ))}
                  </div>
                  <div className="pn-khoi-than">
                    {tabTm === 'Lịch sử'
                      ? <LichSu goi={s.goi} moi={!dangSua} man={`${scSlug}`} id={String(edit.ma ?? '')} />
                      : (() => { const kh = dsKhoi.find(k => k.ten === tabTm); return kh && <fieldset className="pn-fs" disabled={xem}>{veBang(kh, 0)}</fieldset> })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {hopCot && (() => {
            // Cột của tab đang mở (tab Lịch sử thì lấy tab lưới đầu), bỏ cột luôn hiện
            const kh = dsKhoi.find(k => k.bang && k.ten === tabTm) ?? dsKhoi.find(k => k.bang)!
            const ds = kh.bang!(formVal, doiO, s.goi, xem).cols.filter(c => !cotKhoa(c.k) && c.t).map((c): [string, string] => [`${kh.ten}|${c.k}`, c.t])
            return <HopCotPhieu ds={ds} an={anCot} onDoi={doiAnCot} onDong={() => setHopCot(false)} />
          })()}
          {hoiXoa && (
            <HopXacNhan tieuDe={`Xoá ${tenNganHien}`} nut="Xoá" nutHuy="Không"
              onDong={() => setHoiXoa(false)} onDongY={() => { setHoiXoa(false); onXoa?.(formVal) }}>
              Bạn có chắc chắn muốn xoá {tenNganHien} <b>{edit.soThe ?? edit.ma}</b> không?
            </HopXacNhan>
          )}
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

/** Đọc khoảng ngày "dd/mm/yyyy - dd/mm/yyyy"; thiếu hay sai thì lấy hôm nay (T154) */
function docKhoang(v: string) {
  const [tu, den] = v.split(' - ').map(docNgay)
  const hn = new Date(HOM_NAY.getFullYear(), HOM_NAY.getMonth(), HOM_NAY.getDate())
  const tuOk = tu && !isNaN(tu.getTime()) ? tu : hn
  return { tu: tuOk, den: den && !isNaN(den.getTime()) ? den : tuOk }
}

/** Ô chọn nhiều của form danh mục: lưu dạng "A, B"; chọn đủ lưu "Tất cả", bỏ hết cũng hiểu là tất cả (T144)
 *  Có goiY thì chọn đủ hay bỏ hết đều lưu rỗng, ô hiện chữ gợi ý mờ (T151). Giao diện kiểu iFaster dùng chung ChonNhieu (T154) */
function ChonNhieu({ ds, maDs, giaTri, nhan, goiY, onDoi }: { ds: string[]; maDs?: (v: string) => string; giaTri: string; nhan: string; goiY?: string; onDoi: (v: string) => void }) {
  const chon = !giaTri || giaTri === 'Tất cả' ? [] : giaTri.split(', ').filter(x => ds.includes(x))
  return (
    <ChonNhieuIf nhan={nhan} goiY={goiY ?? 'Tất cả'} value={chon}
      ds={ds.map(v => ({ v, t: v, phu: maDs?.(v) ? `Mã: ${maDs(v)}` : undefined }))}
      onChange={moi => onDoi(moi.length === 0 ? (goiY ? '' : 'Tất cả') : moi.join(', '))} />
  )
}
