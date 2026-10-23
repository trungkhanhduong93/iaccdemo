// Màn Số dư ban đầu (10.1.3, T141): lưới thẻ theo loại số dư, bảng số dư chi tiết có dòng tổng.
// Loại số dư theo gói và chế độ: gói Free chỉ số dư tiền (mở ở Thu chi); TT58, TT152 khai tiền, công nợ, tồn kho, không có tài khoản;
// TT133, TT99 thêm số dư tài khoản và cột Số hiệu TK, Dư Nợ, Dư Có.
import { useMemo, useState, type ChangeEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { kieuGhiSo } from '../../app/plan'
import { ngayDauNam, useSession, type CnThem, type Session } from '../../app/session'
import { Icon } from '../../ui/Icon'
import { PageHead } from '../../ui/Page'
import { Table } from '../../ui/Table'
import { fold, k, money } from '../../ui/format'
import { ThanhLoc } from '../../ui/ThanhLoc'
import { Select } from '../../ui/Dropdown'
import { HopXacNhan } from '../../ui/LocNangCao'
import { CUA_HANG, DON_VI, KHACH, NCC, NVL } from '../../data/mock'
import { TEN_TK, soCai } from './so-cai'

export type TabKey = 'tk' | 'tien' | 'kh' | 'ncc' | 'kho'

function tach(tong: number, tyLe: number[]) {
  let con = tong
  return tyLe.map((tl, i) => {
    if (i === tyLe.length - 1) return con
    const v = k(tong * tl)
    con -= v
    return v
  })
}

/** Quỹ tiền theo danh mục quỹ tiền 1.12 */
export const QUY: Row[] = [
  ...CUA_HANG.map((c, i) => ({ ma: `TM0${i + 1}`, ct: `Quỹ tiền mặt ${c.ngan}`, kieu: 'Tiền mặt', cn: c.ten, tk: '1111' })),
  { ma: 'NH01', ct: 'Vietcombank, chi nhánh Sài Gòn', kieu: 'Ngân hàng', cn: 'Tất cả', tk: '1121' },
  { ma: 'NH02', ct: 'Techcombank, nhận tiền QR', kieu: 'Ngân hàng', cn: 'Tất cả', tk: '1121' },
]

let soDuMau: Record<string, number> | null = null
/** Số dư ban đầu một quỹ: số đã lưu (Danh mục Quỹ tiền gói Free, màn Số dư ban đầu), không có thì số dư mẫu của đơn vị mẫu, đơn vị mới là 0 (T245) */
export function soDuQuyBanDau(s: Pick<Session, 'donVi' | 'soDuQuy'>, ma: string): number {
  const luu = s.soDuQuy?.[s.donVi]?.[ma]
  if (luu) return luu.no - luu.co
  if (!DON_VI.some(d => d.id === s.donVi)) return 0
  const mau = soDuMau ??= Object.fromEntries(soDuRows().filter(r => r.loai === 'tien').map(r => [r.ma, Number(r.du) || 0]))
  return mau[ma] ?? 0
}
/** Ghi số dư ban đầu một quỹ vào phiên, cùng chỗ với màn Số dư ban đầu (T245) */
export const datSoDuQuy = (s: Pick<Session, 'donVi' | 'soDuQuy'>, ma: string, du: number): Pick<Session, 'soDuQuy'> =>
  ({ soDuQuy: { ...s.soDuQuy, [s.donVi]: { ...s.soDuQuy?.[s.donVi], [ma]: { no: Math.max(0, du), co: Math.max(0, -du) } } } })

/** Đối tượng chọn được ở dòng thêm mới theo loại số dư; khoá trùng là ma (tài khoản là tk) */
/** Quỹ tiền mặt của cửa hàng lên sổ thêm từ FABi (T142) */
export const quyCua = (c: CnThem): Row => ({ ma: `TM-${c.id.toUpperCase()}`, ct: `Quỹ tiền mặt ${c.ten.replace(/^Phố Mây /, '')}`, kieu: 'Tiền mặt', cn: c.ten, tk: '1111' })

export function luaChon(tab: TabKey, quyThem: Row[] = []): Row[] {
  if (tab === 'tien') return [...QUY, ...quyThem]
  if (tab === 'kh') return KHACH.filter(x => x.ma !== 'KL').map(x => ({ ma: x.ma, ct: x.ten, tk: '131', ten: TEN_TK['131'] }))
  if (tab === 'ncc') return NCC.map(x => ({ ma: x.ma, ct: x.ten, tk: '331', ten: TEN_TK['331'] }))
  if (tab === 'kho') return NVL.map(x => ({ ma: x.ma, ct: x.ten, dvt: x.dvt, kho: 'Kho tổng', tk: '152', ten: TEN_TK['152'], sl: 0 }))
  // tài khoản loại 5 đến 9 (doanh thu, chi phí, xác định kết quả) không có số dư cuối kỳ nên không khai số dư ban đầu
  return Object.keys(TEN_TK).filter(tk => !/^[5-9]/.test(tk)).map(tk => ({ ma: tk, tk, ten: TEN_TK[tk] }))
}
const khoa = (r: Row) => r.loai === 'tk' ? r.tk : r.ma

/** Dòng số dư mẫu lấy từ số dư đầu kỳ sổ cái: tài khoản, tiền theo quỹ (danh mục quỹ tiền 1.12), công nợ, tồn kho */
export function soDuRows(): Row[] {
  const m = soCai(8).mo
  const du = (tk: string, ct: string, v: number, them: Row = {}) => ({ tk, ten: TEN_TK[tk], ct, no: Math.max(0, v), co: Math.max(0, -v), du: v, ...them })
  const tkRows = Object.keys(m).map(tk => ({ loai: 'tk', ...du(tk, '', m[tk]) }))
  const tm = tach(m['1111'] ?? 0, CUA_HANG.map((_, i, a) => i === a.length - 1 ? 1 : 1 / a.length))
  const nh = tach(m['1121'] ?? 0, [0.7, 0.3])
  const soTien = [...tm, ...nh]
  const tien = QUY.map((q, i) => ({ loai: 'tien', ...du(q.tk, q.ct, soTien[i], q) }))
  const khach3 = KHACH.filter(x => x.ma !== 'KL').slice(0, 3)
  const kh = tach(m['131'] ?? 0, [0.45, 0.35, 0.2]).map((v, i) => ({ loai: 'kh', ...du('131', khach3[i].ten, v, { ma: khach3[i].ma }) }))
  const ncc3 = NCC.slice(0, 3)
  const ncc = tach(m['331'] ?? 0, [0.5, 0.3, 0.2]).map((v, i) => ({ loai: 'ncc', ...du('331', ncc3[i].ten, v, { ma: ncc3[i].ma }) }))
  const nvl4 = NVL.slice(0, 4)
  const kho = tach(m['152'] ?? 0, [0.45, 0.25, 0.15, 0.15]).map((v, i) => ({
    loai: 'kho', ...du('152', nvl4[i].ten, v, { ma: nvl4[i].ma, kho: 'Kho tổng', dvt: nvl4[i].dvt, sl: Math.round(v / nvl4[i].gia) }),
  }))
  return [...tkRows, ...tien, ...kh, ...ncc, ...kho]
}

export const THES: { k: TabKey; ten: string; icon: string }[] = [
  { k: 'tk', ten: 'Số dư tài khoản', icon: 'book' },
  { k: 'tien', ten: 'Số dư tiền', icon: 'wallet' },
  { k: 'kh', ten: 'Công nợ khách hàng', icon: 'users' },
  { k: 'ncc', ten: 'Công nợ nhà cung cấp', icon: 'truck' },
  { k: 'kho', ten: 'Tồn kho vật tư, hàng hoá', icon: 'box' },
]

/** Loại số dư khai được: gói Free chỉ tiền; chế độ Nợ/Có thêm số dư tài khoản */
export function loaiTheo(goi: string, noCo: boolean): TabKey[] {
  if (goi === 'S') return ['tien']
  return noCo ? ['tk', 'tien', 'kh', 'ncc', 'kho'] : ['tien', 'kh', 'ncc', 'kho']
}

export function SoDuBanDau({ sc, mod }: ScreenProps) {
  const { s, set, toast } = useSession()   // toast báo đã xoá dòng, đã lưu
  const noCo = kieuGhiSo(s.cheDo) === 'noco'
  // Số dư khai trực tiếp trên bảng: Thêm mới chèn dòng trống chọn đối tượng, ô số tiền gõ thẳng, xoá dòng có hỏi lại (T141)
  const [q0] = useSearchParams()
  const cnThem = s.cnThem?.[s.donVi] ?? []
  const quyThem = cnThem.map(quyCua)
  // Mở từ Thêm cửa hàng từ FABi (?cnMoi=id,id): chèn sẵn dòng quỹ tiền mặt của cửa hàng mới để gõ số dư (T142)
  const cnMoi = (q0.get('cnMoi') ?? '').split(',').filter(Boolean)
  // Tab tiền hiện đủ mọi quỹ của đơn vị, quỹ nào có số dư thì gõ rồi Lưu (T160): đơn vị mẫu có quỹ mẫu kèm số dư mẫu;
  // đơn vị mới (dùng thử, thêm đơn vị) có quỹ tiền mặt của cửa hàng đã lên sổ và các tài khoản ngân hàng, số dư 0
  const coSan = DON_VI.some(d => d.id === s.donVi)
  const [all, setAll] = useState<Row[]>(() => {
    const ds = soDuRows()
    const mau = coSan ? ds.filter(r => r.loai === 'tien') : []
    const quy: Row[] = [...cnThem.filter(c => !mau.some(r => r.ma === quyCua(c).ma)).map(c => ({ loai: 'tien', ...quyCua(c), ten: TEN_TK['1111'], no: 0, co: 0, du: 0 })),
      ...(coSan ? [] : QUY.filter(q => q.kieu === 'Ngân hàng').map(q => ({ loai: 'tien', ...q, ten: TEN_TK[q.tk], no: 0, co: 0, du: 0 })))]
    const luu = s.soDuQuy?.[s.donVi] ?? {}
    const tien = [...mau, ...quy].map(r => luu[r.ma] ? { ...r, ...luu[r.ma], du: luu[r.ma].no - luu[r.ma].co } : r)
    return [...ds.filter(r => r.loai !== 'tien'), ...tien].map((r, i) => ({ ...r, id: i + 1 }))
  })
  const luuSoDu = () => {
    const quy = Object.fromEntries(all.filter(r => r.loai === 'tien').map(r => [r.ma, { no: Number(r.no) || 0, co: Number(r.co) || 0 }]))
    set({ soDuQuy: { ...s.soDuQuy, [s.donVi]: quy } })
    toast('Đã lưu số dư ban đầu')
  }
  const [hoiXoa, setHoiXoa] = useState<Row | null>(null)
  const suaDong = (id: number, p: Row) => setAll(ds => ds.map(r => r.id === id ? { ...r, ...p } : r))
  const soTien = (v: string) => Number(v.replace(/[^\d-]/g, '')) || 0
  const datSo = (r: Row, k: 'du' | 'no' | 'co', v: number) => {
    if (k === 'du') return suaDong(r.id, { du: v, no: Math.max(0, v), co: Math.max(0, -v) })
    const no = k === 'no' ? v : Number(r.no) || 0, co = k === 'co' ? v : Number(r.co) || 0
    suaDong(r.id, { no, co, du: no - co })
  }
  const loai = loaiTheo(s.goi, noCo)
  const [chon, setTab] = useState<TabKey>(cnMoi.length ? 'tien' : loai[0])
  const tab = loai.includes(chon) ? chon : loai[0]
  const [q, setQ] = useState('')
  const themDong = () => {
    const id = Math.max(0, ...all.map(r => r.id)) + 1
    setAll(ds => [...ds, { id, loai: tab, moi: true, no: 0, co: 0, du: 0 }])
    setQ('')
  }

  const theData = useMemo(() => THES.filter(t => loai.includes(t.k)).map(t => {
    const ds = all.filter(r => r.loai === t.k)
    const no = ds.reduce((a, r) => a + (Number(r.no) || 0), 0)
    const co = ds.reduce((a, r) => a + (Number(r.co) || 0), 0)
    return { ...t, rows: ds, phu: noCo ? `${ds.length} dòng · dư Nợ ${money(no)} đ, dư Có ${money(co)} đ` : `${ds.length} dòng · ${money(no - co)} đ` }
  }), [all, loai.join(), noCo])   // eslint-disable-line react-hooks/exhaustive-deps

  const curThe = theData.find(t => t.k === tab) ?? theData[0]
  const cardRows = curThe.rows
  const rows = useMemo(() => {
    if (!q) return cardRows
    return cardRows.filter(r => fold(Object.values(r).join(' ')).includes(fold(q)))
  }, [cardRows, q])

  const cols = useMemo((): Col[] => {
    const oSo = (k: 'du' | 'no' | 'co') => (r: Row) => r.id == null ? money(Number(r[k]) || 0) : (
      <input className="inp sdb-so" inputMode="numeric" value={Number(r[k]) ? money(Number(r[k])) : ''} placeholder="0"
        onChange={(e: ChangeEvent<HTMLInputElement>) => datSo(r, k, soTien(e.target.value))} />
    )
    const tien = (t: string): Col[] => noCo
      ? [{ k: 'no', t: 'Dư Nợ', num: true, w: 150, r: oSo('no') }, { k: 'co', t: 'Dư Có', num: true, w: 150, r: oSo('co') }]
      : [{ k: 'du', t, num: true, w: 170, r: oSo('du') }]
    const tk: Col[] = noCo ? [{ k: 'tk', t: 'Số hiệu TK', cls: 'code' }] : []
    // Dòng mới chưa chọn đối tượng: ô tên là ô chọn, chỉ liệt kê đối tượng chưa có số dư
    const oTen = (k: string): Col['r'] => r => {
      if (!r.moi || khoa(r)) return r[k]
      const daCo = new Set(all.filter(x => x.loai === tab && khoa(x)).map(khoa))
      const con = luaChon(tab, quyThem).filter(x => !daCo.has(x.ma))
      return con.length
        ? <Select className="inp sdb-chon" value="" onChange={e => { const x = con.find(o => o.ma === e.target.value); if (x) suaDong(r.id, x) }}>
            <option value="">Chọn {tab === 'tien' ? 'quỹ' : tab === 'tk' ? 'tài khoản' : tab === 'kho' ? 'hàng' : 'đối tượng'}</option>
            {con.map(o => <option key={o.ma} value={o.ma}>{tab === 'tk' ? `${o.tk} · ${o.ten}` : `${o.ma} · ${o.ct}`}</option>)}
          </Select>
        : <span className="muted">Đã khai hết, thêm mới ở danh mục</span>
    }
    const xoa: Col = { k: 'xoa', t: '', w: 44, c: true, r: r => r.id == null ? null : (
      <button type="button" className="btn ghost sm sdb-xoa" title="Xoá dòng" onClick={() => setHoiXoa(r)}><Icon n="trash" className="ic sm" /></button>
    ) }
    const oSl: Col['r'] = r => r.id == null ? r.sl : (
      <input className="inp sdb-so" inputMode="numeric" value={Number(r.sl) ? money(Number(r.sl)) : ''} placeholder="0" onChange={(e: ChangeEvent<HTMLInputElement>) => suaDong(r.id, { sl: soTien(e.target.value) })} />
    )
    if (tab === 'tk') return [{ k: 'tk', t: 'Số hiệu TK', cls: 'code' }, { k: 'ten', t: 'Tên tài khoản', r: oTen('ten') }, ...tien(''), xoa]
    if (tab === 'tien') return [{ k: 'ma', t: 'Mã quỹ', cls: 'code' }, { k: 'ct', t: 'Tên quỹ', r: oTen('ct') }, { k: 'kieu', t: 'Loại' }, { k: 'cn', t: 'Cửa hàng', cls: 'dim' }, ...tk, ...tien('Số dư')]   // đủ mọi quỹ, không xoá dòng (T160)
    if (tab === 'kho') return [{ k: 'kho', t: 'Kho' }, { k: 'ma', t: 'Mã hàng', cls: 'code' }, { k: 'ct', t: 'Tên hàng', r: oTen('ct') }, { k: 'dvt', t: 'ĐVT' }, { k: 'sl', t: 'Số lượng', num: true, w: 110, r: oSl }, ...tk, ...tien('Giá trị tồn'), xoa]
    return [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ct', t: tab === 'kh' ? 'Khách hàng' : 'Nhà cung cấp', r: oTen('ct') }, ...tk, ...tien(tab === 'kh' ? 'Còn phải thu' : 'Còn phải trả'), xoa]
  }, [tab, noCo, all])   // eslint-disable-line react-hooks/exhaustive-deps

  const sum = useMemo(() => {
    const no = rows.reduce((a, r) => a + (Number(r.no) || 0), 0)
    const co = rows.reduce((a, r) => a + (Number(r.co) || 0), 0)
    const dau = cols[0].k
    return noCo ? { [dau]: 'Tổng cộng', no, co } : { [dau]: 'Tổng cộng', du: no - co }
  }, [rows, cols, noCo])

  return (
    <div className="page">
      <PageHead crumb={[mod.ten]} title={tenMan(sc)} code={sc.code} meta={<span className="muted">Số dư tại ngày {ngayDauNam(s)}, ngày bắt đầu năm tài chính</span>}>
        <button type="button" className="btn"><Icon n="upload" className="ic sm" />Nhập Excel</button>
        <button type="button" className="btn"><Icon n="download" className="ic sm" />Xuất Excel</button>
        {tab !== 'tien' && <button type="button" className="btn" onClick={themDong}><Icon n="plus" className="ic sm" />Thêm mới</button>}
        <button type="button" className="btn pri" onClick={luuSoDu}><Icon n="check" className="ic sm" />Lưu</button>
      </PageHead>
      {theData.length > 1 && (
        <div className="rpt-grid" style={{ gridTemplateColumns: `repeat(${theData.length}, minmax(0, 1fr))`, marginBottom: 14 }}>
          {theData.map(t => {
            const sel = t.k === tab
            return (
              <button
                type="button"
                key={t.k}
                className="rpt-card"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  ...(sel ? { borderColor: 'var(--blue)', boxShadow: '0 0 0 1px var(--blue)' } : {}),
                }}
                onClick={() => { setTab(t.k); setQ('') }}
              >
                <span className="ri"><Icon n={t.icon} /></span>
                <span className="grow" style={{ minWidth: 0 }}>
                  <b>{t.ten}</b>
                  <small>{t.phu}</small>
                </span>
              </button>
            )
          })}
        </div>
      )}
      <section className="card">
        <ThanhLoc
          tim={{
            value: q,
            onChange: setQ,
            placeholder: 'Tìm theo mã, tên',
          }}
          phai={<span className="muted" style={{ fontSize: 12 }}>{rows.length}/{cardRows.length} dòng</span>}
        />
        {rows.length ? <Table cols={cols} rows={rows} sum={sum} /> : (
          cardRows.length ? <div className="empty"><b>Không có dòng khớp bộ lọc</b><button type="button" className="btn sm" style={{ marginTop: 10 }} onClick={() => setQ('')}>Xoá bộ lọc</button></div>
            : <div className="empty"><b>Chưa có dữ liệu</b></div>
        )}
      </section>
      {hoiXoa && (
        <HopXacNhan tieuDe="Xoá dòng số dư?" nut="Xoá dòng" onDong={() => setHoiXoa(null)}
          onDongY={() => { setAll(ds => ds.filter(r => r.id !== hoiXoa.id)); toast('Đã xoá dòng số dư'); setHoiXoa(null) }}>
          {khoa(hoiXoa) ? <>Số dư ban đầu của <b>{hoiXoa.ct || `${hoiXoa.tk} · ${hoiXoa.ten}`}</b> sẽ bị xoá khỏi bảng.</> : 'Dòng mới chưa chọn đối tượng sẽ bị xoá khỏi bảng.'}
        </HopXacNhan>
      )}
    </div>
  )
}
