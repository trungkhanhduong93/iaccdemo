// Chi phí NVL trong tháng gói Standard (T232, T945): mở từ thẻ Chi phí nguyên vật liệu ở trang chủ.
// Cách tính chung cả công ty, chọn ở Thông tin đơn vị (T767): kiểm kê định kỳ hoặc tổng chi phí mua hàng trong tháng.
// Xem mọi cửa hàng: bảng từng cửa hàng, bấm dòng mở hộp chi tiết cửa hàng đó (T953). Xem một cửa hàng (chọn trên thanh trên hoặc ?cn=):
// bảng mặt hàng NVL gồm mã, tên, ĐVT, số lượng tồn đầu, mua, tồn cuối, sử dụng, giá gần nhất, giá vốn (T768).
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Col, ScreenProps } from '../types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Note } from '../../ui/Page'
import { Table } from '../../ui/Table'
import { ThongBao } from '../../ui/ThongBao'
import { money, moneyD, pct, soLuong } from '../../ui/format'
import { useMoTuTrangChu } from '../../app/tuTrangChu'
import { NutXuatExcel } from '../../ui/CongCuDs'
import { xuatBangExcel } from '../../ui/xuatBangExcel'
import { CACH_NVL, DI_DOI_CACH_NVL, canKiemKeCuoiThang, daKhoaThang, nvlHangKy, nvlKy } from './chi-phi-nvl'
import { TheTongChiPhi, type OCachTinh } from './TheTongChiPhi'
import { HopChiTietChiPhi } from './HopChiTietChiPhi'

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
  const [boQua, setBoQua] = useState(false)
  const [moChiTiet, setMoChiTiet] = useState(false)
  const [moCn, setMoCn] = useState<string | null>(null)   // cửa hàng đang mở hộp chi tiết (T953)
  const dongMo = tong.ds.find(x => x.cn === moCn)
  const dsHangMo = dongMo ? nvlHangKy(s, [dongMo.cn], thang) : []
  const dsChuaKk = tong.ds.filter(x => x.chuaKk)
  const coCanhBao = canKiemKeCuoiThang(s, thang) && dsChuaKk.length > 0
  const ngayCuoi = `${new Date(2026, thang, 0).getDate()}/${String(thang).padStart(2, '0')}`

  const cachTinh: OCachTinh[] = kk
    ? [
        { nhan: 'Tồn đầu kỳ', so: tong.tonDau, phu: `Tồn cuối tháng ${thang - 1}` },
        { dau: '+', nhan: 'Mua trong tháng', so: tong.mua, phu: <Link to="/app/mua-hang/4-1-1">Xem phiếu mua hàng</Link> },
        { dau: '−', nhan: 'Tồn cuối kỳ', so: tong.tonCuoi, phu: 'Tồn tới thời điểm xem' },
      ]
    : [
        { nhan: 'Mua trong tháng', so: tong.mua, phu: <Link to="/app/mua-hang/4-1-1">Xem phiếu mua hàng</Link> },
        { nhan: 'Tổng chi phí mua hàng trong tháng', phu: 'Chi phí NVL là tổng tiền các phiếu mua hàng NVL trong tháng.', vien: true, rong: true },
      ]

  const phuThe = kk ? (
    <>
      Số xuất dùng NVL theo báo cáo nhập xuất tồn, tính tới thời điểm xem
      {coCanhBao && boQua && (
        <button type="button" className="nvl-chip-bao" onClick={() => setMoChiTiet(true)}>
          {dsChuaKk.length} cửa hàng chưa kiểm kê {ngayCuoi}
        </button>
      )}
    </>
  ) : 'Tổng tiền phiếu mua hàng NVL trong tháng, tính tới thời điểm xem'

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
  // Hộp chi tiết ghi rõ cột số lượng (T953)
  const TEN_SL: Record<string, string> = { slDau: 'SL tồn đầu', slMua: 'SL mua', slCuoi: 'SL tồn cuối', slDung: 'SL sử dụng' }
  const cotHop = cotHang.map(c => ({ ...c, t: TEN_SL[c.k] ?? c.t }))

  const cotCn: Col[] = [
    // tên cửa hàng màu liên kết cho biết bấm được; bấm lan lên dòng mở bảng mặt hàng (T491, T768)
    { k: 'ten', t: 'Cửa hàng', r: r => r.id ? (
      <span className="nvl-ten-o">
        <button type="button" className="ds-link-so nvl-ten-cn" title={`Xem chi phí NVL ${r.ten}`}>{r.ten}</button>
        {Boolean(r.chuaKk) && <span className="nvl-chip-chua">Chưa kiểm kê</span>}
      </span>
    ) : r.ten },
    // Kiểm kê định kỳ: đủ ba số của công thức; tổng chi phí mua hàng thì giá vốn chính là tiền mua, không lặp cột
    ...(kk ? [{ k: 'tonDau', t: 'Tồn đầu kỳ', num: true }, { k: 'mua', t: 'Mua trong tháng', num: true }, { k: 'tonCuoi', t: 'Tồn cuối kỳ', num: true }] : []),
    { k: 'tien', t: 'Chi phí NVL', num: true, r: r => <b>{money(Number(r.tien))}</b> },
    { k: 'dt', t: 'Doanh thu', num: true },
    { k: 'tyLe', t: 'Tỷ lệ trên doanh thu', num: true, r: r => pct(Number(r.tyLe)) },
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
        <NutXuatExcel onXuat={xuat} />
        {kk && <Link to="/app/kho/5-1-10/moi" className="btn sm pri"><Icon n="clipboard" className="ic sm" kieu="net" />Kiểm kê ngay</Link>}
      </div>
      {coCanhBao && !boQua && (
        <section className="nvl-bao" role="alert">
          <Icon n="alert" className="ic" />
          <span className="nvl-bao-chu">
            <b>{dsChuaKk.length} cửa hàng chưa có phiếu kiểm kê ngày {ngayCuoi}.</b> Chi phí NVL của các cửa hàng này đang lấy tồn cuối theo báo cáo nhập xuất tồn.
          </span>
          <button type="button" className="btn sm nvl-bao-bo" onClick={() => setBoQua(true)}>Bỏ qua</button>
          <button type="button" className="btn sm pri" onClick={() => setMoChiTiet(true)}>Xem chi tiết</button>
        </section>
      )}
      <TheTongChiPhi
        nhan={cn ? `Tổng chi phí NVL · ${cn.ten}` : 'Tổng chi phí NVL'}
        tien={tong.tien}
        phu={phuThe}
        tyLe={dt ? tong.tien / dt : 0}
        dt={dt}
        cachTinh={cachTinh}
      />
      <div className="cpt-cuon">
      {khoa && <Note kind="gray" icon="lock">Tháng {thang}/2026 đã khoá sổ: chi phí NVL giữ theo cách tính lúc khoá, không sửa được.</Note>}
      <section className="card nvl-bang">
        <div className="nvl-cach">
          <span>
            Phương pháp tính chi phí NVL chung cả công ty: <b>{CACH_NVL[tong.cach].ten}</b> ·{' '}
            {kk ? 'Tồn đầu kỳ + Mua trong tháng − Tồn cuối kỳ theo báo cáo nhập xuất tồn' : 'Chi phí NVL là tổng tiền phiếu mua hàng NVL trong tháng'}
          </span>
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
            rows={tong.ds.map(x => ({ id: x.cn, ten: x.ten, tonDau: x.tonDau, mua: x.mua, tonCuoi: x.tonCuoi, dt: x.dt, tien: x.tien, chuaKk: x.chuaKk, tyLe: x.dt ? x.tien / x.dt : 0 }))}
            sum={{ ten: 'Cộng', ...(kk ? { tonDau: tong.tonDau, mua: tong.mua, tonCuoi: tong.tonCuoi } : {}), dt, tien: tong.tien, tyLe: dt ? tong.tien / dt : 0 }}
            onRow={r => setMoCn(String(r.id))} />
          <div className="nvl-chan">{kk ? 'Bấm cửa hàng để xem chi phí từng mặt hàng NVL.' : 'Bấm cửa hàng để xem tiền mua từng mặt hàng NVL.'}</div>
        </>}
      </section>
      </div>
      {dongMo && (
        <HopChiTietChiPhi
          tieuDe={`Chi phí NVL tháng ${String(thang).padStart(2, '0')}/2026`}
          phu={dongMo.ten}
          o={[
            ...(kk ? [{ nhan: 'Tồn đầu kỳ', so: moneyD(dongMo.tonDau ?? 0) }] : []),
            { nhan: kk ? '+ Mua trong tháng' : 'Mua trong tháng', so: moneyD(dongMo.mua) },
            ...(kk ? [{ nhan: '− Tồn cuối kỳ', so: moneyD(dongMo.tonCuoi ?? 0) }] : []),
            { nhan: '= Chi phí NVL', so: moneyD(dongMo.tien) },
            { nhan: 'Tỷ lệ trên doanh thu', so: dongMo.dt ? pct(dongMo.tien / dongMo.dt) : '–', phu: `Doanh thu ${moneyD(dongMo.dt)}`, cam: true },
          ]}
          ghiChu="Chi phí NVL tính theo giá vốn xuất kho, không nhân theo giá gần nhất."
          cols={cotHop}
          rows={dsHangMo.map(h => ({ ...h }))}
          onXuat={ds => xuatBangExcel(`Chi phí NVL ${dongMo.ten} tháng ${thang}/2026`, CACH_NVL[tong.cach].ten,
            [{ t: '#', so: true }, { t: 'Mã hàng', rong: 12 }, { t: 'Tên hàng', rong: 30 }, { t: 'ĐVT', rong: 8 }, ...cotSl.map(([k]) => ({ t: TEN_SL[k], so: true })), { t: 'Giá gần nhất', so: true }, { t: 'Chi phí NVL', so: true }],
            ds.map((h, i) => [i + 1, String(h.ma), String(h.ten), String(h.dvt), ...cotSl.map(([k]) => Number(h[k])), Number(h.gia), Number(h.tien)])).catch(loiXuat)}
          onDong={() => setMoCn(null)}
        />
      )}
      {moChiTiet && coCanhBao && (
        <ThongBao
          loai="canhBao"
          tieuDe={`Cửa hàng chưa kiểm kê ngày ${ngayCuoi}`}
          moTa="Kiểm kê thực tế ngày cuối tháng để tồn cuối khớp hàng còn trong kho."
          nutPhu="Đóng"
          onDong={() => setMoChiTiet(false)}
        >
          <div className="nvl-hop-ds">
            {dsChuaKk.map(c => (
              <div key={c.cn} className="nvl-hop-dong">
                <div className="nvl-hop-ten">
                  <b>{c.ten}</b>
                  <span>Tồn cuối theo NXT {moneyD(c.tonCuoi ?? 0)}</span>
                </div>
                <Link to="/app/kho/5-1-10/moi" className="btn sm pri" onClick={() => setMoChiTiet(false)}>
                  Kiểm kê ngày {ngayCuoi}
                </Link>
              </div>
            ))}
          </div>
        </ThongBao>
      )}
    </div>
  )
}
