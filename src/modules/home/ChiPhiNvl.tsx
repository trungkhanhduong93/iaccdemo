// Chi phí NVL trong tháng gói Free (T232): mở từ thẻ Chi phí nguyên vật liệu ở trang chủ, dòng Chi phí NVL ở Báo cáo kết quả kinh doanh.
// Cách tính chung cả công ty, chọn ở Thông tin đơn vị (T767): kiểm kê định kỳ hoặc tổng chi phí mua hàng trong tháng.
// Xem mọi cửa hàng: bảng từng cửa hàng, bấm dòng xem cửa hàng đó. Xem một cửa hàng (chọn trên thanh trên hoặc bấm từ bảng):
// bảng mặt hàng NVL gồm mã, tên, ĐVT, số lượng tồn đầu, mua, tồn cuối, sử dụng, giá gần nhất, giá vốn (T768).
import { Link, useSearchParams } from 'react-router-dom'
import type { Col, ScreenProps } from '../types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Note } from '../../ui/Page'
import { Table } from '../../ui/Table'
import { moneyD, pct, soLuong } from '../../ui/format'
import { useMoTuTrangChu } from '../../app/tuTrangChu'
import { NutXuatExcel } from '../../ui/CongCuDs'
import { xuatBangExcel } from '../../ui/xuatBangExcel'
import { CACH_NVL, DI_DOI_CACH_NVL, daKhoaThang, moTaCach, nvlHangKy, nvlKy } from './chi-phi-nvl'

const THANG = [7, 8, 9, 10]

export function ChiPhiNvl(_: ScreenProps) {
  const moTuTrangChu = useMoTuTrangChu()   // liên kết trong màn mở kèm nút về Trang chủ (T232)
  const { s, toast } = useSession()
  const [tham, setTham] = useSearchParams()
  const thang = THANG.includes(Number(tham.get('thang'))) ? Number(tham.get('thang')) : 10
  const cnThanh = cuaHangHienTai(s)
  // cửa hàng xem: cửa hàng trên thanh trên, không có thì cửa hàng bấm từ bảng (?cn=)
  const cn = cnThanh ?? CUA_HANG.find(c => c.id === tham.get('cn'))
  const doi = (p: Record<string, string | undefined>) => {
    const n = new URLSearchParams(tham)
    Object.entries(p).forEach(([k, v]) => v === undefined ? n.delete(k) : n.set(k, v))
    setTham(n, { replace: true })
  }
  const tong = nvlKy(s, cn ? [cn.id] : [], thang)
  const kk = tong.cach === 'kk'
  const dt = tong.ds.reduce((a, x) => a + x.dt, 0)
  const khoa = daKhoaThang(thang)
  const dsHang = cn ? nvlHangKy(s, [cn.id], thang) : []

  // Kiểm kê định kỳ: đủ số lượng tồn đầu, mua, tồn cuối, sử dụng; tổng chi phí mua hàng thì giá vốn là tiền mua, chỉ còn số lượng mua
  const cotSl: [keyof typeof dsHang[number], string][] = kk
    ? [['slDau', 'Tồn đầu kỳ'], ['slMua', 'Mua trong kỳ'], ['slCuoi', 'Tồn cuối kỳ'], ['slDung', 'Sử dụng trong kỳ']]
    : [['slMua', 'Mua trong kỳ']]
  const cotHang: Col[] = [
    { k: 'ma', t: 'Mã hàng', cls: 'code' }, { k: 'ten', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT' },
    ...cotSl.map(([k, t]) => ({ k, t, num: true, r: (r: Record<string, unknown>) => soLuong(Number(r[k])) })),
    { k: 'gia', t: 'Giá gần nhất', num: true },
    { k: 'tien', t: 'Chi phí NVL', num: true },
  ]

  const cotCn: Col[] = [
    // tên cửa hàng màu liên kết cho biết bấm được; bấm lan lên dòng mở bảng mặt hàng (T491, T768)
    { k: 'ten', t: 'Cửa hàng', r: r => r.id ? <button type="button" className="ds-link-so nvl-ten-cn" title={`Xem chi phí NVL ${r.ten}`}>{r.ten}</button> : r.ten },
    // Kiểm kê định kỳ: đủ ba số của công thức; tổng chi phí mua hàng thì giá vốn chính là tiền mua, không lặp cột
    ...(kk ? [{ k: 'tonDau', t: 'Tồn đầu kỳ', num: true }, { k: 'mua', t: 'Mua trong tháng', num: true }, { k: 'tonCuoi', t: 'Tồn cuối kỳ', num: true }] : []),
    { k: 'tien', t: 'Chi phí NVL', num: true },
    { k: 'dt', t: 'Doanh thu', num: true },
    { k: 'tyLe', t: 'Tỷ lệ trên doanh thu', num: true },
  ]

  // Xuất Excel bảng đang xem: mọi cửa hàng, hoặc mặt hàng của một cửa hàng
  const loiXuat = () => toast('Không xuất được file Excel')
  const xuat = () => !cn ? xuatBangExcel(`Chi phí NVL tháng ${thang}/2026`, `Tất cả cửa hàng · ${CACH_NVL[tong.cach].ten}`,
      [{ t: 'Cửa hàng', rong: 28 }, ...(kk ? [{ t: 'Tồn đầu kỳ', so: true }, { t: 'Mua trong tháng', so: true }, { t: 'Tồn cuối kỳ', so: true }] : []),
        { t: 'Chi phí NVL', so: true }, { t: 'Doanh thu', so: true }, { t: 'Tỷ lệ trên doanh thu', rong: 18 }],
      tong.ds.map(d => [d.ten, ...(kk ? [d.tonDau ?? 0, d.mua, d.tonCuoi ?? 0] : []), d.tien, d.dt, pct(d.dt ? d.tien / d.dt : 0)]),
      ['Cộng', ...(kk ? [tong.tonDau, tong.mua, tong.tonCuoi] : []), tong.tien, dt, pct(dt ? tong.tien / dt : 0)]).catch(loiXuat)
    : xuatBangExcel(`Chi phí NVL ${cn.ten} tháng ${thang}/2026`, CACH_NVL[tong.cach].ten,
    [{ t: 'Mã hàng', rong: 12 }, { t: 'Tên hàng', rong: 30 }, { t: 'ĐVT', rong: 8 }, ...cotSl.map(([, t]) => ({ t, so: true })), { t: 'Giá gần nhất', so: true }, { t: 'Chi phí NVL', so: true }],
    dsHang.map(h => [h.ma, h.ten, h.dvt, ...cotSl.map(([k]) => Number(h[k])), h.gia, h.tien]),
    [`${dsHang.length} mặt hàng`, '', '', ...cotSl.map(() => ''), '', tong.tien]).catch(loiXuat)
  const ve = cn && !cnThanh ? <button type="button" className="cpt-ve" title="Về mọi cửa hàng" aria-label="Về mọi cửa hàng" onClick={() => doi({ cn: undefined })}><Icon n="chevl" /></button>
    : <Link to="/app/trang-chu/tong-quan" className="cpt-ve" title="Về Tổng quan" aria-label="Về Tổng quan"><Icon n="chevl" /></Link>

  return (
    <div className="page cpt-trang" onClickCapture={moTuTrangChu}>   {/* phần đầu, thẻ tổng cố định; phần dưới cuộn riêng (T263) */}
      <div className="cpt-dau">
        {ve}
        <h1>Chi phí NVL tháng {thang}/2026</h1>
        <span className="grow" />
        {/* mở form phiếu kiểm kê mới, nút xanh cho dễ thấy; tháng lấy từ trang chủ (?thang=), màn không có lọc tháng riêng (T768) */}
        <Link to="/app/kho/5-1-10/moi" className="btn sm pri"><Icon n="clipboard" className="ic sm" kieu="net" />Kiểm kê ngay</Link>
        <NutXuatExcel onXuat={xuat} />
      </div>
      <div className="cpt-tong">
        <span>Tổng chi phí NVL{cn ? ` · ${cn.ten}` : ''}<small className="nvl-phu">{moTaCach(tong.cach)} · {pct(dt ? tong.tien / dt : 0)} doanh thu</small></span>
        {/* Kiểm kê định kỳ: ghi công thức kèm số (T767) */}
        {kk && <span className="nvl-ct">= Tồn đầu kỳ <b>{moneyD(tong.tonDau)}</b> + Mua trong tháng <b>{moneyD(tong.mua)}</b> − Tồn cuối kỳ <b>{moneyD(tong.tonCuoi)}</b></span>}
        <b>{moneyD(tong.tien)}</b>
      </div>
      <div className="cpt-cuon">
      {khoa && <Note kind="gray" icon="lock">Tháng {thang}/2026 đã khoá sổ: chi phí NVL giữ theo cách tính lúc khoá, không sửa được.</Note>}
      <section className="card nvl-bang">
        <div className="nvl-cach">
          <span>Phương pháp tính chi phí NVL chung cả công ty: <b>{CACH_NVL[tong.cach].ten}</b> · {CACH_NVL[tong.cach].mota}</span>
          <Link to={DI_DOI_CACH_NVL} className="btn sm ghost">Đổi cách tính</Link>
        </div>
        {cn ? <>
        <Table cols={cotHang} rows={dsHang.map(h => ({ ...h }))} sum={{ ma: `${dsHang.length} mặt hàng`, tien: tong.tien }} />
        <div className="nvl-chan">
          Chi phí NVL{kk ? ' = Sử dụng trong kỳ × Giá gần nhất; sử dụng = tồn đầu + mua − tồn cuối' : ' là tiền phiếu mua hàng của từng mặt hàng'}. <Link to="/app/mua-hang/4-1-1">Xem danh sách phiếu mua hàng</Link>
          {kk && <>. Tồn đầu kỳ, tồn cuối kỳ lấy từ phiếu kiểm kê cuối tháng trước và cuối tháng này: <Link to="/app/kho/5-1-10">Xem phiếu kiểm kê</Link></>}
        </div>
        </> : <>
          <Table cols={cotCn}
            rows={tong.ds.map(x => ({ id: x.cn, ten: x.ten, tonDau: x.tonDau, mua: x.mua, tonCuoi: x.tonCuoi, dt: x.dt, tien: x.tien, tyLe: pct(x.dt ? x.tien / x.dt : 0) }))}
            sum={{ ten: 'Cộng', ...(kk ? { tonDau: tong.tonDau, mua: tong.mua, tonCuoi: tong.tonCuoi } : {}), dt, tien: tong.tien, tyLe: pct(dt ? tong.tien / dt : 0) }}
            onRow={r => doi({ cn: String(r.id) })} />
          <div className="nvl-chan">Bấm cửa hàng để xem chi phí từng mặt hàng NVL.</div>
        </>}
      </section>
      </div>
    </div>
  )
}
