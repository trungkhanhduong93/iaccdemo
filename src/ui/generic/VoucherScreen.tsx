// Màn chứng từ chung: danh sách có lọc, bấm dòng mở form chi tiết toàn màn hình. Phần hạch toán đổi theo gói.
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps, VoucherCfg } from '../../modules/types'
import { duongDan, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { GOI, kieuGhiSo, coTrongGoi, type Goi } from '../../app/plan'
import { CHI_NHANH, KHO } from '../../data/mock'
import { Icon } from '../Icon'
import { Card, Note, PageHead } from '../Page'
import { FormToanMan, useDong } from '../FormToanMan'
import { St, Table } from '../Table'
import { fold, money, moneyD } from '../format'
import { NGUON, TT_CT, chungTu, dongCua, tongDong, type Dong } from './gen'

const MAC_DINH: VoucherCfg = { prefix: 'CT', doiTuong: 'none', dienGiai: ['Chứng từ'], tien: [1_000_000, 20_000_000] }

export function VoucherScreen({ sc, mod }: ScreenProps) {
  const { id } = useParams()
  const loc = useLocation()
  const cfg = sc.voucher ?? { ...MAC_DINH, dienGiai: [tenMan(sc)] }
  const rows = useMemo(() => (cfg.loai ? gopLoai(cfg, sc.code ?? sc.slug) : chungTu(cfg, sc.code ?? sc.slug)), [sc])
  if (id !== undefined) {
    const row = id === 'moi' ? undefined : rows.find(r => r.id === id)
    // key theo lượt điều hướng: "Lưu và thêm" mở lại form trắng
    return <VoucherDetail key={loc.key + loc.search} sc={sc} mod={mod} cfg={cfg} row={row} />
  }
  return <VoucherList sc={sc} mod={mod} cfg={cfg} rows={rows} />
}

/** Cấu hình của một loại phiếu: ghép phần riêng của loại vào cấu hình chung của màn */
export function theoLoai(cfg: VoucherCfg, k?: string | null): VoucherCfg {
  const v = cfg.loai?.find(x => x.k === k) ?? cfg.loai?.[0]
  return v ? { ...cfg, ...v } : cfg
}

/** Màn nhiều loại phiếu: mỗi loại lấy 9 phiếu gần nhất rồi xếp chung theo ngày */
function gopLoai(cfg: VoucherCfg, seed: string): Row[] {
  const ngay = (r: Row) => String(r.ngay).split('/').reverse().join('')
  return cfg.loai!.flatMap(v => chungTu(theoLoai(cfg, v.k), `${seed}-${v.k}`).slice(0, 9)
    .map((r): Row => ({ ...r, id: `${v.k}-${r.id}`, loai: v.k, tenLoai: v.ten })))
    .sort((a, b) => ngay(b).localeCompare(ngay(a)) || String(b.so).localeCompare(String(a.so)))
}

export function VoucherList({ sc, mod, cfg, rows, extra, title }: ScreenProps & { cfg: VoucherCfg; rows: Row[]; extra?: React.ReactNode; title?: string }) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const [ky, setKy] = useState('all')
  const [tt, setTt] = useState('all')
  const [q, setQ] = useState('')
  const ghi = kieuGhiSo(s.goi) !== 'khong'
  const list = rows.filter(r => (ky === 'all' || String(r.thang) === ky) && (tt === 'all' || r.tt === tt) &&
    (!q || fold(`${r.so} ${r.doiTuong} ${r.dienGiai}`).includes(fold(q))))
  const tong = list.reduce((a, r) => a + r.tong, 0)
  const cols: Col[] = [
    { k: 'chk', t: '', w: 34, r: () => <input type="checkbox" onClick={e => e.stopPropagation()} /> },
    { k: 'ngay', t: 'Ngày', w: 96 },
    { k: 'so', t: 'Số chứng từ', cls: 'code', w: 150 },
    ...(cfg.loai ? [{ k: 'tenLoai', t: 'Loại' } as Col] : []),
    { k: 'dienGiai', t: 'Diễn giải' },
    ...(cfg.doiTuong !== 'none' ? [{ k: 'doiTuong', t: cfg.nhan ?? 'Đối tượng' } as Col] : []),
    { k: 'cn', t: 'Chi nhánh', cls: 'dim' },
    ...(cfg.thue !== undefined || cfg.dong === 'hang' ? [{ k: 'thue', t: 'Tiền thuế', num: true } as Col] : []),
    { k: 'tong', t: 'Tổng tiền', num: true },
    { k: 'nguon', t: 'Nguồn', r: r => { const [c, t] = NGUON[r.nguon] ?? NGUON.tay; return <span className={`src ${c}`}>{t}</span> } },
    { k: 'tt', t: 'Trạng thái', r: r => { const [c, t] = TT_CT[r.tt]; return <St k={c}>{ghi ? t : r.tt === 'nhap' ? 'Nháp' : 'Đã lưu'}</St> } },
  ]
  const path = duongDan(mod, sc)
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={title ?? tenMan(sc)} code={sc.code}>
        {cfg.nguon && cfg.nguon !== 'tay' && (
          <button className="btn" onClick={() => toast(`Đã tải 14 chứng từ mới từ ${NGUON[cfg.nguon!][1]}`)}><Icon n="refresh" className="ic sm" />Tải từ {NGUON[cfg.nguon][1]}</button>
        )}
        <button className="btn"><Icon n="upload" className="ic sm" />Nhập Excel</button>
        <button className="btn"><Icon n="download" className="ic sm" />Xuất Excel</button>
        {cfg.loai ? <NutThemLoai cfg={cfg} path={path} /> : <Link className="btn pri" to={`${path}/moi`}><Icon n="plus" className="ic sm" />{cfg.them ?? 'Thêm chứng từ'}</Link>}
      </PageHead>
      {extra}
      <section className="card">
        <div className="filters">
          <label className="fld"><Icon n="calendar" className="ic sm" />Kỳ
            <select value={ky} onChange={e => setKy(e.target.value)}><option value="all">Tháng 9 và 10/2026</option><option value="10">Tháng 10/2026</option><option value="9">Tháng 9/2026</option></select>
          </label>
          <label className="fld">Chi nhánh<select><option>Tất cả</option>{CHI_NHANH.map(c => <option key={c.id}>{c.ten}</option>)}</select></label>
          <label className="fld">Trạng thái
            <select value={tt} onChange={e => setTt(e.target.value)}>
              <option value="all">Tất cả</option><option value="nhap">{ghi ? 'Chưa ghi sổ' : 'Nháp'}</option>
              <option value="ghi">{ghi ? 'Đã ghi sổ' : 'Đã lưu'}</option>{ghi && <option value="loi">Lỗi hạch toán</option>}
            </select>
          </label>
          <label className="fld"><Icon n="search" className="ic sm" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Số chứng từ, đối tượng, diễn giải" /></label>
          <span className="grow" />
          {ghi && <button className="btn sm" onClick={() => toast('Đã ghi sổ 3 chứng từ')}>Ghi sổ</button>}
          <button className="btn sm"><Icon n="printer" className="ic sm" />In</button>
        </div>
        {list.length ? (
          <Table cols={cols} rows={list} onRow={r => nav(`${path}/${r.id}`)} rowCls={r => r.tt === 'loi' && ghi ? 'bad' : ''}
            sum={{ ngay: `${list.length} chứng từ`, tong, thue: list.reduce((a, r) => a + r.thue, 0) }} />
        ) : (
          <div className="empty"><b>Không có chứng từ khớp bộ lọc</b><button className="btn sm" style={{ marginTop: 10 }} onClick={() => { setKy('all'); setTt('all'); setQ('') }}>Xoá bộ lọc</button></div>
        )}
      </section>
    </div>
  )
}

export function VoucherDetail({ sc, mod, cfg: cfgMan, row, children }: ScreenProps & { cfg: VoucherCfg; row?: Row; children?: React.ReactNode }) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const [sp, setSp] = useSearchParams()
  const [tab, setTab] = useState('ct')
  const moi = !row
  const loai = cfgMan.loai?.find(x => x.k === (row?.loai ?? sp.get('loai'))) ?? cfgMan.loai?.[0]
  const cfg = theoLoai(cfgMan, loai?.k)
  const id = row ? `${sc.code ?? sc.slug}-${row.id}` : 'moi'
  const dong = useMemo(() => (moi ? dongCua(cfg, `mau-${loai?.k ?? ''}`).slice(0, 1) : dongCua(cfg, id)), [id, loai?.k])
  const t = tongDong(dong)
  const kieu = kieuGhiSo(s.goi)
  const path = duongDan(mod, sc)
  const dongForm = useDong(path)
  const tabs: [string, string][] = [['ct', 'Chi tiết'], ['ht', kieu === 'noco' ? 'Hạch toán' : 'Ghi sổ'], ['dk', 'Đính kèm'], ['ls', 'Lịch sử']]
  const so = row?.so ?? `${cfg.prefix}2610-0261`
  const ten = loai?.ten ?? tenMan(sc)

  return (
    <FormToanMan icon={mod.icon} onClose={dongForm} tong={t.tong}
      title={moi ? (loai ? `${loai.ten} mới` : cfg.them ?? 'Thêm chứng từ') : `${ten} ${so}`}
      meta={row ? <>{(() => { const [c, tx] = TT_CT[row.tt]; return <St k={c}>{tx}</St> })()}
        <span className={`src ${NGUON[row.nguon]?.[0] ?? 'tay'}`}>{NGUON[row.nguon]?.[1] ?? 'Thủ công'}</span><span className="chip">{tenMan(sc)}</span></>
        : <><span className="chip info">Chưa lưu</span><span className="chip">Số {so}</span><span className="chip">{tenMan(sc)}</span></>}
      loai={moi && cfgMan.loai && (
        <label className="fsf-loai">Loại phiếu
          <select value={loai!.k} onChange={e => setSp({ loai: e.target.value }, { replace: true })}>
            {cfgMan.loai.map(x => <option key={x.k} value={x.k}>{x.ten}</option>)}
          </select>
        </label>
      )}
      foot={<>
        <button className="btn" onClick={dongForm}>Huỷ</button>
        <span className="grow" />
        {!moi && <button className="btn"><Icon n="copy" className="ic sm" />Sao chép</button>}
        {!moi && <button className="btn"><Icon n="printer" className="ic sm" />In</button>}
        {kieu !== 'khong' && !moi && <button className="btn" onClick={() => toast(row!.tt === 'ghi' ? 'Đã bỏ ghi sổ' : 'Đã ghi sổ')}>{row!.tt === 'ghi' ? 'Bỏ ghi sổ' : 'Ghi sổ'}</button>}
        <button className="btn" onClick={() => { toast(moi ? `Đã lưu ${ten.toLowerCase()} ${so}` : 'Đã lưu thay đổi'); dongForm() }}>Lưu</button>
        <button className="btn pri" onClick={() => { toast(`Đã lưu ${ten.toLowerCase()} ${so}, mở form mới`); nav(`${path}/moi${loai ? `?loai=${loai.k}` : ''}`, { replace: true }) }}>Lưu và thêm</button>
      </>}>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 300px', alignItems: 'start' }}>
        <div className="stack">
          <Card title="Thông tin chung">
            <div className="form-grid">
              <div className="f"><label>Ngày chứng từ <em>*</em></label><input className="inp" defaultValue={row?.ngay ?? '07/10/2026'} /></div>
              <div className="f"><label>Số chứng từ</label><input className="inp" readOnly defaultValue={row?.so ?? `${cfg.prefix}2610-0261`} /></div>
              {cfg.doiTuong !== 'none' ? (
                <div className="f c2"><label>{cfg.nhan ?? 'Đối tượng'} <em>*</em></label><input className="inp" defaultValue={row?.doiTuong ?? ''} placeholder="Gõ mã hoặc tên để tìm" /></div>
              ) : <div className="f c2"><label>Người lập</label><input className="inp" readOnly defaultValue={s.ten} /></div>}
              <div className="f"><label>Chi nhánh</label><select className="inp" defaultValue={row?.cn}>{CHI_NHANH.map(c => <option key={c.id}>{c.ten}</option>)}</select></div>
              {(cfg.dong === 'hang' || cfg.dong === 'nvl') && <div className="f"><label>Kho</label><select className="inp">{KHO.map(x => <option key={x}>{x}</option>)}</select></div>}
              <div className={`f ${cfg.dong === 'hang' || cfg.dong === 'nvl' ? 'c2' : 'c2'}`}><label>Diễn giải</label><input className="inp" defaultValue={row?.dienGiai ?? cfg.dienGiai[0]} /></div>
            </div>
          </Card>

          <section className="card">
            <div className="tabs">{tabs.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
            {tab === 'ct' && <BangDong cfg={cfg} dong={dong} />}
            {tab === 'ht' && <div style={{ padding: 14 }}><HachToan cfg={cfg} goi={s.goi} tien={t.tien} thue={t.thue} dt={row?.doiTuong ?? ''} cn={row?.cn ?? CHI_NHANH[0].ten} /></div>}
            {tab === 'dk' && <div className="empty"><b>Chưa có tệp đính kèm</b>Kéo thả hoá đơn, ảnh chứng từ vào đây (PDF, JPG, XML)</div>}
            {tab === 'ls' && <LichSu goi={s.goi} moi={moi} />}
            <div className="tot">
              <span>Tiền hàng</span><b>{moneyD(t.tien)}</b>
              {t.thue > 0 && <><span>Tiền thuế GTGT</span><b>{moneyD(t.thue)}</b></>}
              <span>Tổng thanh toán</span><b className="big">{moneyD(t.tong)}</b>
            </div>
          </section>
          {children}
        </div>

        <div className="stack">
          <Card title="Thanh toán">
            <div className="stack" style={{ gap: 10 }}>
              <div className="f"><label>Hình thức</label><select className="inp"><option>Tiền mặt</option><option>Chuyển khoản</option><option>Ghi công nợ</option></select></div>
              <div className="f"><label>Hạn thanh toán</label><input className="inp" defaultValue="06/11/2026" /></div>
            </div>
          </Card>
          {row?.nguon && row.nguon !== 'tay' && (
            <Card title="Nguồn dữ liệu">
              <div className="stack" style={{ gap: 8, fontSize: 12.5 }}>
                <div className="row"><span className={`src ${NGUON[row.nguon][0]}`}>{NGUON[row.nguon][1]}</span><span className="muted">tự đồng bộ</span></div>
                <div>Chứng từ sinh từ dữ liệu đồng bộ lúc 23:30 cùng ngày. Sửa ở nguồn thì lần đồng bộ sau điều chỉnh lại, không tạo chứng từ trùng.</div>
                <button className="btn sm" style={{ alignSelf: 'flex-start' }}><Icon n="link" className="ic sm" />Xem dữ liệu gốc</button>
              </div>
            </Card>
          )}
          {row?.tt === 'loi' && kieu !== 'khong' && (
            <Note kind="err" icon="alert">Thiếu tài khoản doanh thu cho nhóm hàng "Món mới tháng 10". Gắn tài khoản ở Danh mục hàng hoá rồi bấm Ghi sổ lại.</Note>
          )}
        </div>
      </div>
    </FormToanMan>
  )
}

/** Nút thêm của màn nhiều loại phiếu: bấm thẳng ra loại đầu, mũi tên mở danh sách loại */
function NutThemLoai({ cfg, path }: { cfg: VoucherCfg; path: string }) {
  const [mo, setMo] = useState(false)
  const ds = cfg.loai!
  return (
    <div className="dd split" onMouseLeave={() => setMo(false)}>
      <Link className="btn pri" to={`${path}/moi?loai=${ds[0].k}`}><Icon n="plus" className="ic sm" />{cfg.them ?? `Thêm ${ds[0].ten.toLowerCase()}`}</Link>
      <button className="btn pri" onClick={() => setMo(!mo)} aria-expanded={mo} title="Chọn loại phiếu"><Icon n="chevd" className="ic sm" /></button>
      <div className="dd-pop" hidden={!mo} style={{ right: 0, top: 'calc(100% + 4px)' }}>
        {ds.map(v => <Link key={v.k} to={`${path}/moi?loai=${v.k}`}><Icon n="plus" className="ic sm" />{v.ten}</Link>)}
      </div>
    </div>
  )
}

function BangDong({ cfg, dong }: { cfg: VoucherCfg; dong: Dong[] }) {
  const hang = cfg.dong === 'hang' || cfg.dong === 'nvl'
  const cols: Col[] = hang ? [
    { k: 'stt', t: '#', w: 40, cls: 'dim' }, { k: 'ma', t: 'Mã hàng', cls: 'code' }, { k: 'ten', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT' },
    { k: 'sl', t: 'Số lượng', num: true }, { k: 'gia', t: 'Đơn giá', num: true }, { k: 'tien', t: 'Thành tiền', num: true },
    { k: 'ts', t: 'Thuế suất', num: true, r: r => r.ts ? `${r.ts}%` : 'KCT' }, { k: 'thue', t: 'Tiền thuế', num: true },
  ] : [
    { k: 'stt', t: '#', w: 40, cls: 'dim' }, { k: 'ten', t: 'Diễn giải' }, { k: 'tien', t: 'Số tiền', num: true },
    ...(cfg.thue ? [{ k: 'ts', t: 'Thuế suất', num: true, r: (r: Row) => `${r.ts}%` } as Col, { k: 'thue', t: 'Tiền thuế', num: true } as Col] : []),
  ]
  return (
    <>
      <Table cols={cols} rows={dong.map((d, i) => ({ ...d, stt: i + 1 }))} />
      <div style={{ padding: '8px 12px' }}><button className="btn sm ghost"><Icon n="plus" className="ic sm" />Thêm dòng</button></div>
    </>
  )
}

/** Hạch toán theo gói: Free không hạch toán, Starter ghi sổ TT58, Medium/Advance Nợ/Có */
export function HachToan({ cfg, goi, tien, thue, dt, cn }: { cfg: VoucherCfg; goi: Goi; tien: number; thue: number; dt: string; cn: string }) {
  const kieu = kieuGhiSo(goi)
  if (kieu === 'khong') return (
    <Note kind="gray" icon="info">
      Gói Free chưa áp chế độ kế toán nên phiếu không sinh bút toán. Số tiền vẫn vào sổ quỹ và sổ công nợ.{' '}
      <Link to="/app/he-thong/goi-thue-bao">So sánh gói</Link>
    </Note>
  )
  if (kieu === 'so') return (
    <div className="stack" style={{ gap: 10 }}>
      <Note icon="book">Gói Starter theo {GOI.S.cheDo}: không dùng tài khoản Nợ/Có. Phiếu ghi thẳng vào sổ.</Note>
      <Table cols={[{ k: 'so', t: 'Ghi vào sổ' }, { k: 'cot', t: 'Cột' }, { k: 'tien', t: 'Số tiền', num: true }]}
        rows={[{ so: cfg.soTT58 ?? 'Sổ chi phí sản xuất, kinh doanh', cot: 'Phát sinh', tien }, ...(thue ? [{ so: 'Sổ theo dõi thuế', cot: 'Thuế GTGT', tien: thue }] : []),
          { so: 'Sổ tiền', cot: 'Thu, chi', tien: tien + thue }]} />
    </div>
  )
  const mau = cfg.noCo ?? [['642', '111', 'Chi phí']]
  const rows = mau.map(([no, co, dg]) => {
    const l = fold(dg)
    const v = l.includes('thue') ? thue : l.includes('gia von') ? Math.round(tien * 0.35) : l.includes('thanh toan') ? tien + thue : tien
    return { no, co, dg, tien: v, dt, cn }
  }).filter(r => r.tien > 0)
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="row" style={{ fontSize: 12.5 }}><Icon n="book" className="ic sm" />Định khoản theo bộ mặc định ngành F&B, chế độ {GOI[goi].cheDo}. Sửa được trước khi ghi sổ.</div>
      <Table cols={[{ k: 'dg', t: 'Diễn giải' }, { k: 'no', t: 'TK Nợ', cls: 'code', w: 80 }, { k: 'co', t: 'TK Có', cls: 'code', w: 80 },
        { k: 'tien', t: 'Số tiền', num: true }, { k: 'dt', t: 'Đối tượng', cls: 'dim' }, { k: 'cn', t: 'Chi nhánh', cls: 'dim' }]} rows={rows}
        sum={{ dg: 'Cộng', tien: rows.reduce((a, r) => a + r.tien, 0) }} />
    </div>
  )
}

function LichSu({ goi, moi }: { goi: Goi; moi: boolean }) {
  if (moi) return <div className="empty"><b>Chứng từ chưa lưu</b></div>
  if (!coTrongGoi('X2', goi)) return <div style={{ padding: 14 }}><Note kind="gray" icon="lock">Nhật ký thao tác có từ gói Starter. <Link to="/app/he-thong/goi-thue-bao">So sánh gói</Link></Note></div>
  return <Table cols={[{ k: 'luc', t: 'Thời điểm', w: 140 }, { k: 'ai', t: 'Người làm' }, { k: 'viec', t: 'Thao tác' }]} rows={[
    { luc: '07/10/2026 10:05', ai: 'Lê Quốc Bảo', viec: 'Ghi sổ' },
    { luc: '07/10/2026 09:58', ai: 'Lê Quốc Bảo', viec: 'Sửa diễn giải' },
    { luc: '06/10/2026 23:30', ai: 'Đồng bộ tự động', viec: 'Tạo chứng từ từ dữ liệu đồng bộ' },
  ]} />
}

export const tienStr = money
