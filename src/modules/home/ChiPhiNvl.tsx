// Chi phí NVL trong tháng gói Free (T232): mở từ thẻ Chi phí nguyên vật liệu ở trang chủ, dòng Chi phí NVL ở Báo cáo kết quả kinh doanh.
// Xem mọi chi nhánh: bảng từng chi nhánh với cách tính riêng, bấm dòng xem chi nhánh đó.
// Xem một chi nhánh: chi tiết theo cách tính; cách nhập tay có bảng món bán trong kỳ, số lượng, giá thành tự nhập, thành tiền.
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
import { CACH_NVL, daKhoaThang, datGiaThanhTay, giaThanhTayCua, moTaCach, monBanKy, nvlKy, phieuMuaKy } from './chi-phi-nvl'

const THANG = [7, 8, 9, 10]

export function ChiPhiNvl(_: ScreenProps) {
  const moTuTrangChu = useMoTuTrangChu()   // liên kết trong màn mở kèm nút về Trang chủ (T232)
  const { s } = useSession()
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
  const ve = cn && !cnThanh ? <button type="button" className="cpt-ve" title="Về mọi chi nhánh" aria-label="Về mọi chi nhánh" onClick={() => doi({ cn: undefined })}><Icon n="chevl" /></button>
    : <Link to="/app/trang-chu/tong-quan" className="cpt-ve" title="Về Tổng quan" aria-label="Về Tổng quan"><Icon n="chevl" /></Link>

  return (
    <div className="page" onClickCapture={moTuTrangChu}>
      <div className="cpt-dau">
        {ve}
        <h1>Chi phí NVL tháng {thang}/2026</h1>
        <span className="grow" />
        <Select className="inp nvl-thang" value={String(thang)} aria-label="Tháng" ds={THANG.map(t => ({ v: String(t), t: `Tháng ${t}/2026` }))}
          onChange={e => doi({ thang: e.target.value })} />
      </div>
      <div className="cpt-tong">
        <span>Tổng chi phí NVL{cn ? ` · ${cn.ten}` : ''}<small className="nvl-phu">{moTaCach(tong.ds)} · {pct(dt ? tong.tien / dt : 0)} doanh thu</small></span>
        <b>{moneyD(tong.tien)}</b>
      </div>
      {khoa && <Note kind="gray" icon="lock">Tháng {thang}/2026 đã khoá sổ: chi phí NVL giữ theo cách tính lúc khoá, không sửa được.</Note>}
      {cn ? <ChiTietCn cn={cn.id} thang={thang} khoa={khoa} /> : (
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
  )
}

function ChiTietCn({ cn, thang, khoa }: { cn: string; thang: number; khoa: boolean }) {
  const { s, set } = useSession()
  const x = nvlKy(s, [cn], thang).ds[0]
  const dau = (
    <div className="nvl-cach">
      <span>Cách tính: <b>{CACH_NVL[x.cach].ten}</b> · {CACH_NVL[x.cach].mota}</span>
      <Link to="/app/danh-muc/chi-nhanh" className="btn sm ghost">Đổi cách tính</Link>
    </div>
  )
  if (x.cach === 'ivt') return (
    <section className="card nvl-bang">
      {dau}
      <div className="nvl-chan">Số khớp giá vốn xuất bán POS. <Link to="/app/kho/5-2-3">Xem tổng hợp nhập xuất tồn</Link></div>
    </section>
  )
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
  const mon = monBanKy(cn, thang)
  const rows: Row[] = mon.map(m => { const g = giaThanhTayCua(s, cn, thang, m.ma); return { ...m, gia: g, tien: g === undefined ? undefined : m.sl * g } })
  const cols: Col[] = [
    { k: 'ma', t: 'Mã món', cls: 'code', w: 90 }, { k: 'ten', t: 'Tên món' }, { k: 'dvt', t: 'ĐVT', w: 70 },
    { k: 'sl', t: 'Số lượng bán', num: true, w: 120 },
    { k: 'gia', t: 'Giá thành', num: true, w: 150, r: r => khoa ? money(Number(r.gia ?? 0))
      : <input className={`inp nvl-gia${r.gia === undefined ? ' thieu' : ''}`} inputMode="numeric" placeholder="Nhập giá thành" aria-label={`Giá thành ${r.ten}`}
          value={r.gia === undefined ? '' : money(Number(r.gia))}
          onChange={e => { const so = e.target.value.replace(/\D/g, ''); set(datGiaThanhTay(s, cn, thang, String(r.ma), so ? Number(so) : undefined)) }} /> },
    { k: 'tien', t: 'Thành tiền', num: true, w: 150 },
  ]
  return (
    <section className="card nvl-bang">
      {dau}
      {x.thieuGia > 0 && !khoa && <Note kind="warn" icon="alert">Còn {x.thieuGia} món chưa có giá thành, đang tính bằng 0. Nhập giá thành vào ô tô vàng.</Note>}
      <Table cols={cols} rows={rows} sum={{ ten: `${mon.length} món bán trong tháng`, tien: x.tien }} />
    </section>
  )
}
