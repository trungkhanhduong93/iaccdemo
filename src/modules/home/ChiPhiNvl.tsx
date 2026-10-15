// Chi phí NVL trong tháng gói Free (T232): mở từ thẻ Chi phí nguyên vật liệu ở trang chủ, dòng Chi phí NVL ở Báo cáo kết quả kinh doanh.
// Xem mọi chi nhánh: bảng từng chi nhánh với cách tính riêng, bấm dòng xem chi nhánh đó.
// Xem một chi nhánh: chi tiết theo cách tính; cách nhập tay có bảng món bán trong kỳ, số lượng, giá thành tự nhập, thành tiền.
import { useRef, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { chiNhanhHienTai, useSession } from '../../app/session'
import { CHI_NHANH } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Note } from '../../ui/Page'
import { Table } from '../../ui/Table'
import { Select } from '../../ui/Dropdown'
import { money, moneyD, pct } from '../../ui/format'
import { useMoTuTrangChu } from '../../app/tuTrangChu'
import { NutExcel, NutXuatExcel } from '../../ui/CongCuDs'
import { xuatBangExcel } from '../../ui/xuatBangExcel'
import { docGiaThanh, xuatGiaThanh } from './excel-gia-thanh'
import { CACH_NVL, daKhoaThang, datGiaThanhTay, giaThanhIvt, giaThanhTayCua, moTaCach, monBanKy, nvlKy, phieuMuaKy, tieuHaoKy } from './chi-phi-nvl'

const THANG = [7, 8, 9, 10]

export function ChiPhiNvl(_: ScreenProps) {
  const moTuTrangChu = useMoTuTrangChu()   // liên kết trong màn mở kèm nút về Trang chủ (T232)
  const { s, set, toast } = useSession()
  const [tham, setTham] = useSearchParams()
  const thang = THANG.includes(Number(tham.get('thang'))) ? Number(tham.get('thang')) : 10
  const cnThanh = chiNhanhHienTai(s)
  // chi nhánh xem: chi nhánh trên thanh trên, không có thì chi nhánh bấm từ bảng (?cn=)
  const cn = cnThanh ?? CHI_NHANH.find(c => c.id === tham.get('cn'))
  const doi = (p: Record<string, string | undefined>) => {
    const n = new URLSearchParams(tham)
    Object.entries(p).forEach(([k, v]) => v === undefined ? n.delete(k) : n.set(k, v))
    setTham(n, { replace: true })
  }
  const tong = nvlKy(s, cn ? [cn.id] : [], thang)
  const dt = tong.ds.reduce((a, x) => a + x.dt, 0)
  const khoa = daKhoaThang(thang)
  const [tab, setTab] = useState<'mon' | 'th'>('mon')   // cách iPOS Inventory: tab giá thành món, tab NVL tiêu hao
  const [locLoai, setLocLoai] = useState('')   // tab NVL tiêu hao: lọc theo loại phiếu, rỗng là tất cả
  const tep = useRef<HTMLInputElement>(null)
  const x = cn ? tong.ds[0] : undefined
  const mon = cn ? monBanKy(cn.id, thang) : []

  // Xuất Excel bảng đang xem (T232): mọi chi nhánh, giá thành món, NVL tiêu hao, phiếu nhập mua; nhập tay dùng mẫu nhập được
  const loiXuat = () => toast('Không xuất được file Excel')
  const xuat = () => {
    const ky = `Tháng ${thang}/2026`
    if (!cn || !x) return xuatBangExcel(`Chi phí NVL tháng ${thang}/2026`, 'Tất cả chi nhánh',
      [{ t: 'Chi nhánh', rong: 28 }, { t: 'Cách tính', rong: 30 }, { t: 'Doanh thu', so: true }, { t: 'Chi phí NVL', so: true }, { t: 'Tỷ lệ trên doanh thu', rong: 18 }],
      tong.ds.map(d => [d.ten, CACH_NVL[d.cach].ten, d.dt, d.tien, pct(d.dt ? d.tien / d.dt : 0)]), ['Cộng', '', dt, tong.tien, pct(dt ? tong.tien / dt : 0)]).catch(loiXuat)
    const cotMonX = [{ t: 'Mã món', rong: 12 }, { t: 'Tên món', rong: 30 }, { t: 'ĐVT', rong: 8 }, { t: 'Số lượng bán', so: true }, { t: 'Giá thành', so: true }, { t: 'Thành tiền', so: true }]
    if (x.cach === 'ivt' && tab === 'mon') {
      const gt = giaThanhIvt(cn.id, thang)
      return xuatBangExcel(`Giá thành iPOS Inventory ${cn.ten} tháng ${thang}/2026`, ky, cotMonX,
        mon.map(m => [m.ma, m.ten, m.dvt, m.sl, gt.get(m.ma) ?? 0, m.sl * (gt.get(m.ma) ?? 0)]), ['', `${mon.length} món bán trong tháng`, '', '', '', x.gtMon]).catch(loiXuat)
    }
    if (x.cach === 'ivt') {
      const ds = tieuHaoKy(cn.id, thang).ds.filter(r => !locLoai || r.tenLoai === locLoai)
      return xuatBangExcel(`Chi phí NVL tiêu hao ${cn.ten} tháng ${thang}/2026`, locLoai ? `${ky} · ${locLoai}` : ky,
        [{ t: 'Ngày', rong: 12 }, { t: 'Số phiếu', rong: 18 }, { t: 'Loại phiếu', rong: 18 }, { t: 'Diễn giải', rong: 44 }, { t: 'Giá trị', so: true }],
        ds.map(r => [String(r.ngay), String(r.so), String(r.tenLoai), String(r.dienGiai ?? ''), r.gt]), ['', `${ds.length} phiếu`, '', '', ds.reduce((a, r) => a + r.gt, 0)]).catch(loiXuat)
    }
    if (x.cach === 'nhap') {
      const ds = phieuMuaKy(cn.id, thang)
      return xuatBangExcel(`Phiếu nhập mua ${cn.ten} tháng ${thang}/2026`, ky,
        [{ t: 'Số phiếu', rong: 18 }, { t: 'Ngày', rong: 12 }, { t: 'Nhà cung cấp', rong: 36 }, { t: 'Tiền hàng', so: true }, { t: 'Thuế GTGT', so: true }, { t: 'Tổng tiền', so: true }],
        ds.map(r => [String(r.so), String(r.ngay), String(r.doiTuong), Number(r.tien), Number(r.thue), Number(r.tong)]),
        [`${ds.length} phiếu`, '', '', ds.reduce((a, r) => a + Number(r.tien), 0), ds.reduce((a, r) => a + Number(r.thue), 0), x.tien]).catch(loiXuat)
    }
    return xuatGiaThanh(`gia-thanh-${cn.id}-${thang}-2026.xlsx`, `Giá thành món ${cn.ten} tháng ${thang}/2026`,
      mon.map(m => ({ ...m, gia: giaThanhTayCua(s, cn.id, thang, m.ma) }))).catch(loiXuat)
  }
  // Nhập tay: nhập lại giá thành theo mã món từ file Excel; tháng đã khoá không nhập
  const nhap = async (f: File) => {
    if (!cn) return
    try {
      const doc = await docGiaThanh(f)
      let st = s, nhan = 0
      mon.forEach(m => { const g = doc.get(m.ma); if (g !== undefined) { st = { ...st, ...datGiaThanhTay(st, cn.id, thang, m.ma, g) }; nhan++ } })
      const thua = [...doc.keys()].filter(ma => !mon.some(m => m.ma === ma)).length
      if (nhan) set({ giaThanhTay: st.giaThanhTay })
      toast(nhan ? `Đã nhập giá thành ${nhan} món${thua ? `, bỏ qua ${thua} mã không bán trong tháng` : ''}` : 'File không có giá thành món nào khớp mã món trong tháng')
    } catch { toast('Không đọc được file Excel') }
  }
  const ve = cn && !cnThanh ? <button type="button" className="cpt-ve" title="Về mọi chi nhánh" aria-label="Về mọi chi nhánh" onClick={() => doi({ cn: undefined })}><Icon n="chevl" /></button>
    : <Link to="/app/trang-chu/tong-quan" className="cpt-ve" title="Về Tổng quan" aria-label="Về Tổng quan"><Icon n="chevl" /></Link>

  return (
    <div className="page cpt-trang" onClickCapture={moTuTrangChu}>   {/* phần đầu, thẻ tổng cố định; phần dưới cuộn riêng (T263) */}
      <div className="cpt-dau">
        {ve}
        <h1>Chi phí NVL tháng {thang}/2026</h1>
        <span className="grow" />
        {x?.cach === 'tay'
          ? <NutExcel onXuat={xuat} onNhap={() => khoa ? toast(`Tháng ${thang}/2026 đã khoá sổ, không nhập được giá thành`) : tep.current?.click()} />
          : <NutXuatExcel onXuat={xuat} />}
        <input ref={tep} type="file" accept=".xlsx" hidden onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) nhap(f) }} />
        <Select className="inp nvl-thang" value={String(thang)} aria-label="Tháng" ds={THANG.map(t => ({ v: String(t), t: `Tháng ${t}/2026` }))}
          onChange={e => doi({ thang: e.target.value })} />
      </div>
      <div className="cpt-tong">
        <span>Tổng chi phí NVL{cn ? ` · ${cn.ten}` : ''}<small className="nvl-phu">{moTaCach(tong.ds)} · {pct(dt ? tong.tien / dt : 0)} doanh thu</small></span>
        {/* Giá thành iPOS Inventory: chi phí NVL gồm hai phần, ghi công thức kèm số (T232) */}
        {cn && tong.ds[0].cach === 'ivt' && <span className="nvl-ct">= Tổng giá thành iPOS Inventory <b>{moneyD(tong.ds[0].gtMon ?? 0)}</b> + Chi phí NVL tiêu hao <b>{moneyD(tong.ds[0].tieuHao ?? 0)}</b></span>}
        <b>{moneyD(tong.tien)}</b>
      </div>
      <div className="cpt-cuon">
      {khoa && <Note kind="gray" icon="lock">Tháng {thang}/2026 đã khoá sổ: chi phí NVL giữ theo cách tính lúc khoá, không sửa được.</Note>}
      {cn ? <ChiTietCn cn={cn.id} thang={thang} khoa={khoa} tab={tab} setTab={setTab} locLoai={locLoai} setLocLoai={setLocLoai} /> : (
        <section className="card nvl-bang">
          <Table cols={[
            { k: 'ten', t: 'Chi nhánh', r: r => <>{r.ten}{Number(r.thieu) > 0 && <span className="chip warn nvl-chip">Còn {r.thieu} món chưa có giá thành</span>}</> },
            { k: 'cach', t: 'Cách tính' },
            { k: 'dt', t: 'Doanh thu', num: true },
            { k: 'tien', t: 'Chi phí NVL', num: true },
            { k: 'tyLe', t: 'Tỷ lệ trên doanh thu', num: true },
          ]} rows={tong.ds.map(x => ({ id: x.cn, ten: x.ten, thieu: x.thieuGia, cach: CACH_NVL[x.cach].ten, dt: x.dt, tien: x.tien, tyLe: pct(x.dt ? x.tien / x.dt : 0) }))}
            sum={{ ten: 'Cộng', dt, tien: tong.tien, tyLe: pct(dt ? tong.tien / dt : 0) }}
            onRow={r => doi({ cn: String(r.id) })} />
          <div className="nvl-chan">Bấm chi nhánh để xem chi tiết. Đổi cách tính ở <Link to="/app/danh-muc/chi-nhanh">Danh mục chi nhánh</Link>.</div>
        </section>
      )}
      </div>
    </div>
  )
}

function ChiTietCn({ cn, thang, khoa, tab, setTab, locLoai, setLocLoai }: {
  cn: string; thang: number; khoa: boolean; tab: 'mon' | 'th'; setTab: (t: 'mon' | 'th') => void; locLoai: string; setLocLoai: (v: string) => void
}) {
  const { s, set } = useSession()
  const x = nvlKy(s, [cn], thang).ds[0]
  const mon = monBanKy(cn, thang)
  const dau = (
    <div className="nvl-cach">
      <span>Cách tính: <b>{CACH_NVL[x.cach].ten}</b> · {CACH_NVL[x.cach].mota}</span>
      <Link to="/app/danh-muc/chi-nhanh" className="btn sm ghost">Đổi cách tính</Link>
    </div>
  )
  // Cột bảng món dùng chung cho giá thành iPOS Inventory và nhập tay; gia: ô Giá thành
  const cotMon = (gia: (r: Row) => ReactNode): Col[] => [
    { k: 'ma', t: 'Mã món', cls: 'code', w: 90 }, { k: 'ten', t: 'Tên món' }, { k: 'dvt', t: 'ĐVT', w: 70 },
    { k: 'sl', t: 'Số lượng bán', num: true, w: 120 },
    { k: 'gia', t: 'Giá thành', num: true, w: 150, r: gia },
    { k: 'tien', t: 'Thành tiền', num: true, w: 150 },
  ]
  // iPOS Inventory (T232): hai tab, giá thành món lấy từ iPOS Inventory (chỉ xem) và chi phí NVL tiêu hao; mỗi tab ghi cách tính riêng
  if (x.cach === 'ivt') {
    const gt = giaThanhIvt(cn, thang)
    const th = tieuHaoKy(cn, thang)
    const dsTh = locLoai ? th.ds.filter(r => r.tenLoai === locLoai) : th.ds
    const rows: Row[] = mon.map(m => ({ ...m, gia: gt.get(m.ma) ?? 0, tien: m.sl * (gt.get(m.ma) ?? 0) }))
    const colsTh: Col[] = [{ k: 'ngay', t: 'Ngày', w: 110 }, { k: 'so', t: 'Số phiếu', cls: 'code', w: 150 }, { k: 'tenLoai', t: 'Loại phiếu', w: 150 },
      { k: 'dienGiai', t: 'Diễn giải' }, { k: 'gt', t: 'Giá trị', num: true, w: 150 }]
    return (
      <section className="card nvl-bang">
        <div className="nvl-tab-dau">
          <div className="tabs nvl-tabs">
            <button type="button" className={tab === 'mon' ? 'on' : ''} onClick={() => setTab('mon')}>Giá thành iPOS Inventory</button>
            <button type="button" className={tab === 'th' ? 'on' : ''} onClick={() => setTab('th')}>Chi phí NVL tiêu hao</button>
          </div>
          <Link to="/app/danh-muc/chi-nhanh" className="btn sm ghost">Đổi cách tính</Link>
        </div>
        {tab === 'mon' ? <>
          <div className="nvl-cach"><span>Cách tính: <b>Số lượng món bán × giá thành món trên iPOS Inventory</b></span></div>
          <Table cols={cotMon(r => money(Number(r.gia)))} rows={rows} sum={{ ten: `${mon.length} món bán trong tháng`, tien: x.gtMon }} />
        </> : <>
          <div className="nvl-cach"><span>Cách tính: <b>Xuất huỷ + Xuất điều chỉnh − Nhập điều chỉnh</b> · {moneyD(th.huy)} + {moneyD(th.xdc)} − {moneyD(th.ndc)}</span>
            <Select className="inp nvl-loc" value={locLoai} aria-label="Loại phiếu" onChange={e => setLocLoai(e.target.value)}
              ds={[{ v: '', t: 'Tất cả loại phiếu' }, ...['Xuất huỷ', 'Xuất điều chỉnh', 'Nhập điều chỉnh'].map(t => ({ v: t, t }))]} /></div>
          <Table cols={colsTh} rows={dsTh} sum={{ so: `${dsTh.length} phiếu`, gt: dsTh.reduce((a, r) => a + r.gt, 0) }} />
        </>}
      </section>
    )
  }
  if (x.cach === 'nhap') {
    const ds = phieuMuaKy(cn, thang)
    const cols: Col[] = [{ k: 'so', t: 'Số phiếu', cls: 'code' }, { k: 'ngay', t: 'Ngày' }, { k: 'doiTuong', t: 'Nhà cung cấp' },
      { k: 'tien', t: 'Tiền hàng', num: true }, { k: 'thue', t: 'Thuế GTGT', num: true }, { k: 'tong', t: 'Tổng tiền', num: true }]
    return (
      <section className="card nvl-bang">
        {dau}
        <Table cols={cols} rows={ds} sum={{ so: `${ds.length} phiếu`, tien: ds.reduce((a, r) => a + Number(r.tien), 0), thue: ds.reduce((a, r) => a + Number(r.thue), 0), tong: x.tien }} />
        <div className="nvl-chan"><Link to="/app/mua-hang/4-1-1">Xem danh sách phiếu mua hàng</Link></div>
      </section>
    )
  }
  // Nhập tay: món có bán trong kỳ, số lượng lấy từ FABi, giá thành tự nhập; thành tiền = số lượng × giá thành
  const rows: Row[] = mon.map(m => { const g = giaThanhTayCua(s, cn, thang, m.ma); return { ...m, gia: g, tien: g === undefined ? undefined : m.sl * g } })
  const cols = cotMon(r => khoa ? money(Number(r.gia ?? 0))
      : <input className={`inp nvl-gia${r.gia === undefined ? ' thieu' : ''}`} inputMode="numeric" placeholder="Nhập giá thành" aria-label={`Giá thành ${r.ten}`}
          value={r.gia === undefined ? '' : money(Number(r.gia))}
          onChange={e => { const so = e.target.value.replace(/\D/g, ''); set(datGiaThanhTay(s, cn, thang, String(r.ma), so ? Number(so) : undefined)) }} />)
  return (
    <section className="card nvl-bang">
      {dau}
      {x.thieuGia > 0 && !khoa && <Note kind="warn" icon="alert">Còn {x.thieuGia} món chưa có giá thành, đang tính bằng 0. Nhập giá thành vào ô tô vàng.</Note>}
      <Table cols={cols} rows={rows} sum={{ ten: `${mon.length} món bán trong tháng`, tien: x.tien }} />
    </section>
  )
}
