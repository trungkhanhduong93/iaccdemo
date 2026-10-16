// Danh mục cửa hàng (T142): cửa hàng của đơn vị và cửa hàng lên sổ thêm từ cửa hàng FABi.
// Thêm cửa hàng từ FABi: chỉ chọn cửa hàng chưa dùng kế toán, lên sổ từ ngày bắt đầu năm tài chính của đơn vị, có thể mở ngay màn Số dư ban đầu để khai quỹ tiền của cửa hàng mới.
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { donViHienTai, ngayDauNam, useSession, type CnThem, type Session } from '../../app/session'
import { CUA_HANG, DON_VI } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Note, PageHead } from '../../ui/Page'
import { Table } from '../../ui/Table'
import { CO_TRANG_DM, PhanTrang } from '../../ui/PhanTrang'
import { NutTuyChinhCot, useCotDs } from '../../ui/LocNangCao'
import { cuaHangChuaDung } from '../onboarding/cua-hang-fabi'
import { DsCuaHang } from '../onboarding/OnboardFabi'
import { Select } from '../../ui/Dropdown'
import { HopXacNhan, useDongEsc } from '../../ui/LocNangCao'
import { CACH_NVL, DS_CACH_NVL, cachNvlHienTai, datCachNvl, kyDauChuaKhoa, tenKy, type CachNvl } from '../home/chi-phi-nvl'
import { batDongBoThuChi, datDongBoThuChi, phieuThuChiFabi } from '../tien/dong-bo-fabi'

/** Cột luôn hiện, không ẩn được ở Tuỳ chỉnh cột (T148) */
const COT_CO_DINH = new Set(['ma', 'ten'])

export function DanhMucCuaHang({ sc, mod }: ScreenProps) {
  const { s, set, toast } = useSession()
  const nav = useNavigate()
  const [q] = useSearchParams()
  const [mo, setMo] = useState(q.get('them') === '1')
  const [doiNvl, setDoiNvl] = useState<{ cn: string; ten: string; cach: CachNvl } | null>(null)   // Bàn làm việc mở thẳng hộp thêm (?them=1)
  const [xem, setXem] = useState<Row | null>(null)   // hộp chi tiết cửa hàng (T285)
  const dv = donViHienTai(s)   // cửa hàng thuộc công ty của đơn vị đang mở (T285)
  const them = s.cnThem?.[s.donVi] ?? []
  // đơn vị mẫu có sẵn cửa hàng mẫu; đơn vị mới tạo từ FABi chỉ có cửa hàng đã lên sổ
  const coSan = DON_VI.some(d => d.id === s.donVi)
  // Gói Free: mỗi cửa hàng tự có một kho mặc định, lấy kho đầu tiên của cửa hàng trên iPOS Inventory (T143)
  const free = s.goi === 'F' || s.goi === 'S'   // gói Free, Standard: dữ liệu mẫu một kho mỗi cửa hàng
  const khoCua = (id: string, ten: string) => CUA_HANG.find(c => c.id === id)?.kho ?? [`Kho ${ten.replace(/^Phố Mây /, '')}`]
  const kho = (id: string, ten: string) => free ? khoCua(id, ten)[0] : khoCua(id, ten).join(', ')
  const rows: Row[] = useMemo(() => [
    ...(coSan ? CUA_HANG.map(c => ({ id: c.id, ma: c.id.toUpperCase(), posId: c.posId, ten: c.ten, kv: 'TP.HCM', kho: kho(c.id, c.ten), nguon: 'FABi' })) : []),
    ...them.map((c, i) => ({ id: c.id, ma: c.id.toUpperCase(), posId: `2000${i + 1}`, ten: c.ten, kv: c.khuVuc, kho: kho(c.id, c.ten), nguon: 'FABi', moi: !c.banDau })),
  ], [coSan, them, free])   // eslint-disable-line react-hooks/exhaustive-deps

  const colsGoc: Col[] = useMemo(() => [
    { k: 'ma', t: 'Mã', cls: 'code', w: 100 },
    { k: 'posId', t: 'POS ID', cls: 'code' },
    { k: 'ten', t: 'Tên cửa hàng', w: 220, r: r => <>
      <button type="button" className="ds-link-so" title="Xem chi tiết cửa hàng" onClick={e => { e.stopPropagation(); setXem(r) }}>{r.ten}</button>
      {r.moi && <span className="chip info" style={{ marginLeft: 8 }}>Mới lên sổ</span>}</> },
    // Công ty của cửa hàng: tên, MST của đơn vị đang mở (T285)
    { k: 'cty', t: 'Công ty', w: 300, r: () => <span className="dmcn-cty"><span>{dv.ten}</span>{dv.mst && <small>MST {dv.mst}</small>}</span> },
    { k: 'kv', t: 'Khu vực', cls: 'dim' },
    { k: 'kho', t: 'Kho', cls: 'dim', r: r => <>{r.kho}{free && <span className="chip" style={{ marginLeft: 8 }}>Mặc định</span>}</> },
    { k: 'nguon', t: 'Nguồn', cls: 'dim' },
    // Gói Free: mỗi cửa hàng chọn cách tính chi phí NVL (T232)
    ...(s.goi === 'F' ? [{ k: 'cachNvl', t: 'Cách tính chi phí NVL', w: 250, r: (r: Row) => (
      <Select className="inp dmcn-nvl" value={cachNvlHienTai(s, String(r.id))} ds={DS_CACH_NVL} aria-label={`Cách tính chi phí NVL ${r.ten}`}
        onChange={e => { const cach = e.target.value as CachNvl; if (cach !== cachNvlHienTai(s, String(r.id))) setDoiNvl({ cn: String(r.id), ten: String(r.ten), cach }) }} />
    ) }] : []),
    // Mọi gói: bật, tắt tự động đồng bộ phiếu thu, chi lập trên FABi theo cửa hàng, cùng chỗ với cách tính chi phí NVL (T264)
    { k: 'dongBo', t: 'Đồng bộ thu chi FABi', w: 210, r: (r: Row) => {
      const bat = batDongBoThuChi(s, String(r.id))
      return (
        <span className="dmcn-db">
          <button type="button" role="switch" aria-checked={bat} aria-label={`Tự động đồng bộ thu chi FABi ${r.ten}`} className={`ds-ct${bat ? ' on' : ''}`}
            onClick={e => { e.stopPropagation(); set(datDongBoThuChi(s, String(r.id), !bat)); toast(`${bat ? 'Đã tắt' : 'Đã bật'} đồng bộ thu chi từ FABi cho ${r.ten}`) }}><i /></button>
          <small>{bat ? 'Tự động' : 'Không đồng bộ'}</small>
        </span>
      )
    } },
  ], [free, s, dv])   // eslint-disable-line react-hooks/exhaustive-deps
  // Phiếu thu, chi FABi của cửa hàng đang bật mà PTTT chưa map quỹ: chờ, không vào sổ (T264)
  const cho = phieuThuChiFabi(s).cho

  const cot = useCotDs('/danh-muc/cua-hang', colsGoc, COT_CO_DINH)
  // Phân trang như danh mục khác: mặc định 50 dòng/trang (T153)
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(50)
  const trangHt = Math.min(trang, Math.max(1, Math.ceil(rows.length / coTrang)))
  const rowsTrang = rows.slice((trangHt - 1) * coTrang, trangHt * coTrang)

  const lenSo = (ds: CnThem[], khaiSoDu: boolean, caiDat: Partial<Session>) => {
    set({ cnThem: { ...s.cnThem, [s.donVi]: [...them, ...ds] }, ...caiDat })   // cấu hình đồng bộ thu chi, cách tính NVL chọn lúc thêm (T264)
    setMo(false)
    toast(`Đã lên sổ ${ds.length} cửa hàng từ FABi`)
    if (khaiSoDu) nav(s.goi === 'F' ? '/app/danh-muc/1-12' : `/app/tong-hop/10-1-3?cnMoi=${ds.map(c => c.id).join(',')}`)   // gói Free khai số dư ở Danh mục Quỹ tiền (T245)
  }

  return (
    <div className="page page-voucher page-dm">
      <PageHead crumb={[mod.ten]} title={tenMan(sc)}>
        <NutTuyChinhCot cols={cot.colsDu} an={cot.an} coDinh={COT_CO_DINH} macDinh={cot.macDinh} dongBang={cot.dongBang}
          onLuu={cot.luu} onDoRongTuDong={cot.datDoRongTuDong} />
        <button
          type="button"
          className="nut-vuong"
          title="Đồng bộ theo POS"
          aria-label="Đồng bộ theo POS"
          onClick={() => toast(`Đã đồng bộ ${rows.length} cửa hàng theo POS`)}
        >
          <Icon n="refresh" className="ic sm" />
        </button>
        <button type="button" className="btn pri" onClick={() => setMo(true)}><Icon n="plus" className="ic sm" />Thêm cửa hàng từ FABi</button>
      </PageHead>
      {s.goi === 'F' && <Note icon="info">Gói Free: mỗi cửa hàng tự có một kho mặc định theo iPOS Inventory, không cần khai báo kho.
        Cột Cách tính chi phí NVL quyết định số Chi phí NVL trên trang chủ và Báo cáo kết quả kinh doanh của cửa hàng.</Note>}
      {cho.length > 0 && <Note kind="warn" icon="alert">{cho.length} phiếu thu, chi từ FABi đang chờ vì phương thức thanh toán chưa map quỹ
        ({[...new Set(cho.map(x => `${x.pttt} · ${x.cn}`))].join('; ')}). <Link to="/app/danh-muc/1-12">Map ở Danh mục Quỹ tiền</Link></Note>}
      <section className="card dm-bang">
        <Table cols={cot.colsHien} doRong={cot.doRong} rows={rowsTrang} />
        <PhanTrang tong={rows.length} trang={trangHt} coTrang={coTrang} dsCoTrang={CO_TRANG_DM}
          onTrang={setTrang} onCoTrang={ct => { setCoTrang(ct); setTrang(1) }} />
      </section>
      {mo && <HopThemCuaHang onDong={() => setMo(false)} onLenSo={lenSo} />}
      {xem && <HopChiTietCn r={xem} onDong={() => setXem(null)} />}
      {doiNvl && (
        <HopXacNhan tieuDe="Đổi cách tính chi phí NVL" nut="Đồng ý" onDong={() => setDoiNvl(null)} onDongY={() => {
          set(datCachNvl(s, doiNvl.cn, doiNvl.cach))
          setDoiNvl(null)
          toast(`Đã đổi cách tính chi phí NVL của ${doiNvl.ten}`)
        }}>
          {doiNvl.ten} tính chi phí NVL {CACH_NVL[doiNvl.cach].theo}: {CACH_NVL[doiNvl.cach].mota[0].toLowerCase() + CACH_NVL[doiNvl.cach].mota.slice(1)}.
          Tính lại từ tháng {tenKy(kyDauChuaKhoa())}, tháng đầu chưa khoá sổ. Các tháng đã khoá sổ giữ nguyên số.
          {doiNvl.cach === 'tay' ? ' Nhập giá thành món ở màn Chi phí NVL, món chưa có giá thành tính bằng 0.' : ''}
        </HopXacNhan>
      )}
    </div>
  )
}

/** Hộp chi tiết một cửa hàng, gồm công ty (tên, MST) của đơn vị đang mở (T285) */
function HopChiTietCn({ r, onDong }: { r: Row; onDong: () => void }) {
  const { s } = useSession()
  const dv = donViHienTai(s)
  useDongEsc(onDong)
  const dong: [string, React.ReactNode][] = [
    ['Mã', <span className="code">{r.ma}</span>],
    ['POS ID', <span className="code">{r.posId}</span>],
    ['Tên cửa hàng', r.ten],
    ['Công ty', dv.ten],
    ['Mã số thuế', dv.mst ? <span className="code">{dv.mst}</span> : '—'],
    ['Khu vực', r.kv],
    ['Kho', r.kho],
    ['Nguồn', r.nguon],
    ...(s.goi === 'F' ? [['Cách tính chi phí NVL', DS_CACH_NVL.find(x => x.v === cachNvlHienTai(s, String(r.id)))?.t ?? '']] as [string, string][] : []),
    ['Đồng bộ thu chi FABi', batDongBoThuChi(s, String(r.id)) ? 'Tự động' : 'Không đồng bộ'],
  ]
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop dmcn-hop-ct" role="dialog" aria-modal="true" aria-label={`Chi tiết ${r.ten}`}>
        <div className="ds-hop-dau"><b>Chi tiết cửa hàng</b><span className="grow" />
          <button type="button" className="btn ghost sm" title="Đóng" onClick={onDong}><Icon n="x" className="ic sm" /></button></div>
        <dl className="dmcn-ct">
          {dong.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
        <div className="ds-chan"><button type="button" className="btn" onClick={onDong}>Đóng</button></div>
      </div>
    </div>,
    document.body,
  )
}

/** Hộp chọn cửa hàng FABi chưa dùng kế toán để lên sổ thành cửa hàng */
export function HopThemCuaHang({ onDong, onLenSo }: { onDong: () => void; onLenSo: (ds: CnThem[], khaiSoDu: boolean, caiDat: Partial<Session>) => void }) {
  const { s } = useSession()
  const ds = cuaHangChuaDung(s)
  const [chon, setChon] = useState<string[]>(() => ds.map(c => c.id))
  // Cấu hình từng cửa hàng chọn ngay lúc thêm, như cột ở Danh mục cửa hàng (T264): đồng bộ thu chi FABi mọi gói, cách tính chi phí NVL gói Free
  const [cauHinh, setCauHinh] = useState<Record<string, { dongBo: boolean; cach: CachNvl }>>({})
  const chCua = (id: string) => cauHinh[id] ?? { dongBo: true, cach: cachNvlHienTai(s, id) }
  const doiCh = (id: string, p: Partial<{ dongBo: boolean; cach: CachNvl }>) => setCauHinh(x => ({ ...x, [id]: { ...chCua(id), ...p } }))
  // Gộp cấu hình đã chọn thành phần phiên cần lưu khi lên sổ
  const caiDat = () => chon.reduce<Partial<Session>>((p, id) => {
    const ch = chCua(id)
    const p2 = { ...p, ...datDongBoThuChi({ ...s, ...p }, id, ch.dongBo) }
    return s.goi === 'F' ? { ...p2, ...datCachNvl({ ...s, ...p2 }, id, ch.cach) } : p2
  }, {})
  const tuNgay = ngayDauNam(s)   // cửa hàng mới lên sổ từ ngày bắt đầu năm tài chính của đơn vị
  const [khaiSoDu, setKhaiSoDu] = useState(true)
  const ok = chon.length > 0
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop dmcn-hop" role="dialog" aria-modal="true" aria-label="Thêm cửa hàng từ FABi">
        <div className="ds-hop-dau"><b>Thêm cửa hàng từ FABi</b><span className="grow" />
          <button type="button" className="btn ghost sm" title="Đóng" onClick={onDong}><Icon n="x" className="ic sm" /></button></div>
        <div className="dmcn-than">
          {ds.length ? <>
            <p className="muted">Chỉ hiện cửa hàng FABi chưa dùng kế toán ở đơn vị nào. Tích cửa hàng muốn lên sổ.</p>
            <DsCuaHang ds={ds} chon={chon} chinh="" doi={moi => setChon(moi)} coChinh={false} />
            {chon.length > 0 && (
              <div className="dmcn-ch">
                <div className="dmcn-ch-dau">Cấu hình cửa hàng lên sổ</div>
                <div className={`dmcn-ch-dong dmcn-ch-tieu${s.goi === 'F' ? ' co-nvl' : ''}`}><span>Cửa hàng</span>{s.goi === 'F' && <span>Cách tính chi phí NVL</span>}<span>Đồng bộ thu chi FABi</span></div>
                {ds.filter(c => chon.includes(c.id)).map(c => {
                  const ch = chCua(c.id)
                  return (
                    <div key={c.id} className={`dmcn-ch-dong${s.goi === 'F' ? ' co-nvl' : ''}`}>
                      <span className="dmcn-ch-ten">{c.ten}</span>
                      {s.goi === 'F' && <Select className="inp dmcn-nvl" value={ch.cach} ds={DS_CACH_NVL} aria-label={`Cách tính chi phí NVL ${c.ten}`} onChange={e => doiCh(c.id, { cach: e.target.value as CachNvl })} />}
                      <span className="dmcn-db">
                        <button type="button" role="switch" aria-checked={ch.dongBo} aria-label={`Tự động đồng bộ thu chi FABi ${c.ten}`} className={`ds-ct${ch.dongBo ? ' on' : ''}`}
                          onClick={() => doiCh(c.id, { dongBo: !ch.dongBo })}><i /></button>
                        <small>{ch.dongBo ? 'Tự động' : 'Không đồng bộ'}</small>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
            <label className="row dmcn-tich"><input type="checkbox" className="bat-tat" checked={khaiSoDu} onChange={e => setKhaiSoDu(e.target.checked)} />
              <span>Khai số dư ban đầu cho cửa hàng mới ngay sau khi lên sổ</span></label>
          </> : <Note kind="ok" icon="check">Mọi cửa hàng trên FABi đã lên sổ kế toán.</Note>}
        </div>
        <div className="ds-chan">
          <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          {ds.length > 0 && <button type="button" className="btn pri" disabled={!ok}
            onClick={() => onLenSo(ds.filter(c => chon.includes(c.id)).map(c => ({ id: c.id, ten: c.ten, khuVuc: c.khuVuc, tuNgay })), khaiSoDu, caiDat())}>
            Lên sổ {chon.length} cửa hàng</button>}
        </div>
      </div>
    </div>,
    document.body,
  )
}
