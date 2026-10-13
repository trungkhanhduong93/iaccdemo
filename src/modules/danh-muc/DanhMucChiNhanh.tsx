// Danh mục chi nhánh (T142): chi nhánh của đơn vị và chi nhánh lên sổ thêm từ cửa hàng FABi.
// Thêm chi nhánh từ FABi: chỉ chọn cửa hàng chưa dùng kế toán, lên sổ từ ngày bắt đầu năm tài chính của đơn vị, có thể mở ngay màn Số dư ban đầu để khai quỹ tiền của chi nhánh mới.
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { ngayDauNam, useSession, type CnThem } from '../../app/session'
import { CHI_NHANH, DON_VI } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Note, PageHead } from '../../ui/Page'
import { Table } from '../../ui/Table'
import { CO_TRANG_DM, PhanTrang } from '../../ui/PhanTrang'
import { NutTuyChinhCot, useCotDs } from '../../ui/LocNangCao'
import { cuaHangChuaDung } from '../onboarding/cua-hang-fabi'
import { DsChiNhanh } from '../onboarding/OnboardFabi'

/** Cột luôn hiện, không ẩn được ở Tuỳ chỉnh cột (T148) */
const COT_CO_DINH = new Set(['ma', 'ten'])

export function DanhMucChiNhanh({ sc, mod }: ScreenProps) {
  const { s, set, toast } = useSession()
  const nav = useNavigate()
  const [q] = useSearchParams()
  const [mo, setMo] = useState(q.get('them') === '1')   // Bàn làm việc mở thẳng hộp thêm (?them=1)
  const them = s.cnThem?.[s.donVi] ?? []
  // đơn vị mẫu có sẵn chi nhánh mẫu; đơn vị mới tạo từ FABi chỉ có chi nhánh đã lên sổ
  const coSan = DON_VI.some(d => d.id === s.donVi)
  // Gói Free: mỗi chi nhánh tự có một kho mặc định, lấy kho đầu tiên của chi nhánh trên iPOS Inventory (T143)
  const free = s.goi === 'F' || s.goi === 'S'   // gói Free, Standard: dữ liệu mẫu một kho mỗi chi nhánh
  const khoCua = (id: string, ten: string) => CHI_NHANH.find(c => c.id === id)?.kho ?? [`Kho ${ten.replace(/^Phố Mây /, '')}`]
  const kho = (id: string, ten: string) => free ? khoCua(id, ten)[0] : khoCua(id, ten).join(', ')
  const rows: Row[] = useMemo(() => [
    ...(coSan ? CHI_NHANH.map(c => ({ ma: c.id.toUpperCase(), posId: c.posId, ten: c.ten, kv: 'TP.HCM', kho: kho(c.id, c.ten), nguon: 'FABi' })) : []),
    ...them.map((c, i) => ({ ma: c.id.toUpperCase(), posId: `2000${i + 1}`, ten: c.ten, kv: c.khuVuc, kho: kho(c.id, c.ten), nguon: 'FABi', moi: !c.banDau })),
  ], [coSan, them, free])   // eslint-disable-line react-hooks/exhaustive-deps

  const colsGoc: Col[] = useMemo(() => [
    { k: 'ma', t: 'Mã', cls: 'code', w: 100 },
    { k: 'posId', t: 'POS ID', cls: 'code' },
    { k: 'ten', t: 'Tên chi nhánh', w: 220, r: r => <>{r.ten}{r.moi && <span className="chip info" style={{ marginLeft: 8 }}>Mới lên sổ</span>}</> },
    { k: 'kv', t: 'Khu vực', cls: 'dim' },
    { k: 'kho', t: 'Kho', cls: 'dim', r: r => <>{r.kho}{free && <span className="chip" style={{ marginLeft: 8 }}>Mặc định</span>}</> },
    { k: 'nguon', t: 'Nguồn', cls: 'dim' },
  ], [free])

  const cot = useCotDs('/danh-muc/chi-nhanh', colsGoc, COT_CO_DINH)
  // Phân trang như danh mục khác: mặc định 50 dòng/trang (T153)
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(50)
  const trangHt = Math.min(trang, Math.max(1, Math.ceil(rows.length / coTrang)))
  const rowsTrang = rows.slice((trangHt - 1) * coTrang, trangHt * coTrang)

  const lenSo = (ds: CnThem[], khaiSoDu: boolean) => {
    set({ cnThem: { ...s.cnThem, [s.donVi]: [...them, ...ds] } })
    setMo(false)
    toast(`Đã lên sổ ${ds.length} chi nhánh từ FABi`)
    if (khaiSoDu) nav(`${s.goi === 'F' ? '/app/tien/so-du-ban-dau' : '/app/tong-hop/10-1-3'}?cnMoi=${ds.map(c => c.id).join(',')}`)
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
          onClick={() => toast(`Đã đồng bộ ${rows.length} chi nhánh theo POS`)}
        >
          <Icon n="refresh" className="ic sm" />
        </button>
        <button type="button" className="btn pri" onClick={() => setMo(true)}><Icon n="plus" className="ic sm" />Thêm chi nhánh từ FABi</button>
      </PageHead>
      {s.goi === 'F' && <Note icon="info">Gói Free: mỗi chi nhánh tự có một kho mặc định theo iPOS Inventory, không cần khai báo kho.</Note>}
      <section className="card dm-bang">
        <Table cols={cot.colsHien} doRong={cot.doRong} rows={rowsTrang} />
        <PhanTrang tong={rows.length} trang={trangHt} coTrang={coTrang} dsCoTrang={CO_TRANG_DM}
          onTrang={setTrang} onCoTrang={ct => { setCoTrang(ct); setTrang(1) }} />
      </section>
      {mo && <HopThemChiNhanh onDong={() => setMo(false)} onLenSo={lenSo} />}
    </div>
  )
}

/** Hộp chọn cửa hàng FABi chưa dùng kế toán để lên sổ thành chi nhánh */
function HopThemChiNhanh({ onDong, onLenSo }: { onDong: () => void; onLenSo: (ds: CnThem[], khaiSoDu: boolean) => void }) {
  const { s } = useSession()
  const ds = cuaHangChuaDung(s)
  const [chon, setChon] = useState<string[]>(() => ds.map(c => c.id))
  const tuNgay = ngayDauNam(s)   // chi nhánh mới lên sổ từ ngày bắt đầu năm tài chính của đơn vị
  const [khaiSoDu, setKhaiSoDu] = useState(true)
  const ok = chon.length > 0
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop dmcn-hop" role="dialog" aria-modal="true" aria-label="Thêm chi nhánh từ FABi">
        <div className="ds-hop-dau"><b>Thêm chi nhánh từ FABi</b><span className="grow" />
          <button type="button" className="btn ghost sm" title="Đóng" onClick={onDong}><Icon n="x" className="ic sm" /></button></div>
        <div className="dmcn-than">
          {ds.length ? <>
            <p className="muted">Chỉ hiện cửa hàng FABi chưa dùng kế toán ở đơn vị nào. Tích cửa hàng muốn lên sổ.</p>
            <DsChiNhanh ds={ds} chon={chon} chinh="" doi={moi => setChon(moi)} coChinh={false} />
            <label className="row dmcn-tich"><input type="checkbox" checked={khaiSoDu} onChange={e => setKhaiSoDu(e.target.checked)} />
              <span>Khai số dư ban đầu cho chi nhánh mới ngay sau khi lên sổ</span></label>
          </> : <Note kind="ok" icon="check">Mọi cửa hàng trên FABi đã lên sổ kế toán.</Note>}
        </div>
        <div className="ds-chan">
          <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          {ds.length > 0 && <button type="button" className="btn pri" disabled={!ok}
            onClick={() => onLenSo(ds.filter(c => chon.includes(c.id)).map(c => ({ id: c.id, ten: c.ten, khuVuc: c.khuVuc, tuNgay })), khaiSoDu)}>
            Lên sổ {chon.length} chi nhánh</button>}
        </div>
      </div>
    </div>,
    document.body,
  )
}
