// Trang chủ gói Free theo ba bài toán: Quản lý lãi lỗ, Quản lý thu chi, Quản lý kho (T230).
// Mỗi bài toán một cột: câu hỏi chủ quán hay hỏi, số trả lời, 4 dòng chi tiết, nút đi tới màn làm việc.
// Lãi lỗ tách chi phí như Báo cáo kết quả kinh doanh bản Free (T220): bỏ thu nhập, chi phí khác khỏi lợi nhuận
import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LenThanhTab } from '../../app/ModuleTabs'
import { CHI_NHANH } from '../../data/mock'
import { timMan } from '../../app/registry'
import { Icon } from '../../ui/Icon'
import { moneyD, pct, short } from '../../ui/format'
import { chungTu } from '../../ui/generic/gen'
import { mauDieuChinh } from '../kho/dieu-chinh'
import { PHIEU_MUA } from '../mua-hang/bao-cao'
import { tonQuyTheoSo } from './LichSuQuy'
import { rowsCongNo } from '../bao-cao/cong-no'
import { datLocDaXem } from '../../ui/bao-cao/tuyChinhBC'
import type { TongQuanSoLieu } from './chiSo'
import { useSession } from '../../app/session'
import { moTaCach, nvlKy } from './chi-phi-nvl'
import { useMoTuTrangChu } from '../../app/tuTrangChu'

function Cot({ so, icon, ten, hoi, tra, traCls, phu, di, nut, goiY, children }: {
  so: number; icon: string; ten: string; hoi: string; tra?: string; traCls?: string; phu: string; di?: string; nut?: string; goiY?: string; children?: ReactNode
}) {
  return (
    <section className="bbt-cot">
      <div className="bbt-ten"><Icon n={icon} className="ic sm" /><span>{so}. {ten}</span></div>
      <div className="bbt-hoi">{hoi}</div>
      {tra && <div className={`bbt-tra ${traCls ?? ''}`}>{tra}</div>}
      <div className="bbt-phu">{phu}</div>
      {children && <div className="bbt-ds">{children}</div>}
      {di && <div className="bbt-chan"><Link to={di} className="bbt-nut">{nut}<Icon n="chevr" className="ic sm" /></Link>{goiY && <span className="bbt-goiy">{goiY}</span>}</div>}
    </section>
  )
}

/** Báo cáo lãi lỗ tháng dạng thẻ xếp dọc (T230, học bố cục ảnh PhuongXT gửi, màu theo IACC): thẻ doanh thu, ba thẻ chi phí
 *  (tên, dòng giải thích, số tiền, % trên doanh thu), thẻ lợi nhuận; lỗ thì thẻ lợi nhuận đỏ */
function TheLaiLo({ thang, dt, nvl, nvlTheo, cpThang, phanBo, chiLon }: { thang: number; dt: number; nvl: number; nvlTheo: string; cpThang: number; phanBo: number; chiLon?: string }) {
  const ln = dt - nvl - cpThang - phanBo
  const tyLe = (v: number) => pct(dt > 0 ? v / dt : 0)
  // Thẻ chi phí; có di thì bấm mở màn chi tiết: chi phí trong tháng sang màn tổng theo lý do chi, phân bổ sang danh sách phân bổ (T230)
  const the = (ten: string, phu: string, v: number, di?: string) => {
    const noiDung = <>
      <div className="tll-trai"><b>{ten}</b><span>{phu}</span></div>
      <div className="tll-phai"><b>{moneyD(v)}</b><span>{tyLe(v)}</span></div>
      {di && <Icon n="chevr" className="ic sm tll-mui" />}
    </>
    return di ? <Link to={di} className="tll-the cp tll-link" title={`Xem ${ten.toLowerCase()}`}>{noiDung}</Link> : <div className="tll-the cp">{noiDung}</div>
  }
  return (
    <section className="tll">
      <div className="tll-dau"><b>Báo cáo lãi lỗ tháng</b></div>
      <div className="tll-the dt">
        <div className="tll-trai"><b>Doanh thu</b></div>
        <div className="tll-phai"><b>{moneyD(dt)}</b></div>
      </div>
      {the('Chi phí nguyên vật liệu', nvlTheo, nvl, `/app/trang-chu/chi-phi-nvl?thang=${thang}`)}
      {the('Chi phí trong tháng', chiLon ?? 'Lương, mặt bằng, điện nước, chi khác', cpThang, `/app/trang-chu/chi-phi-thang?thang=${thang}`)}
      {the('Chi phí phân bổ hàng tháng', 'Phân bổ công cụ dụng cụ, khấu hao', phanBo, '/app/ccdc/8-1-1')}
      <div className={`tll-the ${ln >= 0 ? 'lai' : 'lo'}`}>
        <div className="tll-trai"><b>Lợi nhuận</b></div>
        <div className="tll-phai"><b>{ln < 0 ? '−' : ''}{moneyD(Math.abs(ln))}</b><span>{tyLe(ln)}</span></div>
      </div>
    </section>
  )
}

/** Tồn quỹ cuối tháng từng quỹ theo Sổ quỹ tiền mặt, Sổ ngân hàng (T230): thẻ tổng, mỗi quỹ một thẻ có số dư và % trên tổng;
 *  bấm quỹ mở Lịch sử thu chi của quỹ đó, cùng tháng. Cùng nguồn với Lịch sử thu chi nên bấm vào thấy đúng số dư */
function TheTonQuy({ thang, ds }: { thang: number; ds: ReturnType<typeof tonQuyTheoSo> }) {
  const tong = ds.reduce((a, r) => a + r.cuoi, 0)
  return (
    <section className="tll">
      <div className="tll-dau"><b>{thang === 10 ? 'Tồn quỹ hiện tại' : `Tồn quỹ cuối tháng ${thang}/2026`}</b></div>
      <div className="tll-the dt">
        <div className="tll-trai"><b>Tổng tồn quỹ</b></div>
        <div className="tll-phai"><b>{moneyD(tong)}</b></div>
      </div>
      {ds.map(r => (
        <Link key={r.quy} to={`/app/trang-chu/lich-su-quy?quy=${encodeURIComponent(r.quy)}&thang=${thang}`} className="tll-the quy tll-link" title={`Xem lịch sử thu chi ${r.quy}`}>
          <div className="tll-trai"><b>{r.quy}</b><span>{r.tienMat ? 'Tiền mặt' : 'Ngân hàng'}</span></div>
          <div className="tll-phai"><b>{moneyD(r.cuoi)}</b><span>{pct(tong ? r.cuoi / tong : 0)}</span></div>
          <Icon n="chevr" className="ic sm tll-mui" />
        </Link>
      ))}
    </section>
  )
}

/** Mua hàng, công nợ, hao hụt trong tháng dạng thẻ (T230); bấm thẻ mở màn tương ứng: phiếu mua hàng, báo cáo Công nợ nhà cung cấp, Báo cáo kiểm kê (T244) */
function TheKho({ thang, nhapMua, soDon, congNo, soNcc, matHH }: { thang: number; nhapMua: number; soDon: number; congNo: number; soNcc: number; matHH: number }) {
  const the = (cls: string, ten: string, phu: string, v: string, di: string, onClick?: () => void) => (
    <Link to={di} className={`tll-the ${cls} tll-link`} title={`Xem ${ten.toLowerCase()}`} onClick={onClick}>
      <div className="tll-trai"><b>{ten}</b><span>{phu}</span></div>
      <div className="tll-phai"><b>{v}</b></div>
      <Icon n="chevr" className="ic sm tll-mui" />
    </Link>
  )
  return (
    <section className="tll">
      <div className="tll-dau"><b>Mua hàng, công nợ, hao hụt tháng {thang}</b></div>
      {the('quy', 'Nhập mua', `${soDon} đơn mua hàng`, moneyD(nhapMua), '/app/mua-hang/4-1-1')}
      {the('cp', 'Công nợ phải trả', `${soNcc} nhà cung cấp còn nợ`, moneyD(congNo), '/app/bao-cao/4-2-3', () => datLocDaXem('/app/bao-cao/4-2-3', {}, String(thang)))}
      {/* Hao hụt kiểm kê mở Báo cáo kiểm kê cùng tháng: thừa, thiếu theo mặt hàng, kho (T244) */}
      {the('hh', 'Hao hụt kiểm kê', 'Các mặt hàng thừa thiếu trong kỳ', `${matHH} mặt hàng`, '/app/bao-cao/5-2-15', () => datLocDaXem('/app/bao-cao/5-2-15', {}, String(thang)))}
    </section>
  )
}

/** thang: tháng đang xem của năm 2026, chọn ở ô Năm, Tháng (T230) */
export function BaBaiToanFree({ d, thang: thangXem, selCns, chonKy }: { d: TongQuanSoLieu; thang: number; selCns: string[]; chonKy?: ReactNode }) {
  const thang = useMemo(() => [thangXem], [thangXem])
  const tenCn = useMemo(() => new Set(CHI_NHANH.filter(c => selCns.includes(c.id)).map(c => c.ten)), [selCns])

  // 1. Lãi lỗ: chi phí trong tháng không gồm phân bổ; lợi nhuận bỏ thu nhập, chi phí khác (T220)
  // Chi phí NVL theo cách tính từng chi nhánh (T232), thay giá vốn món bán
  const { s } = useSession()
  const moTuTrangChu = useMoTuTrangChu()
  const nvl = nvlKy(s, selCns, thangXem)
  const cpThang = d.cpHoatDong - d.cpPhanBo
  const loiNhuan = d.dtThuan - nvl.tien - cpThang - d.cpPhanBo
  const bien = d.dtThuan > 0 ? loiNhuan / d.dtThuan : 0

  // 2. Thu chi: số dư, thu, chi cộng từ Sổ quỹ tiền mặt, Sổ ngân hàng như khối Tồn quỹ, Lịch sử thu chi (T230)
  const quy = useMemo(() => tonQuyTheoSo(thangXem, selCns), [thangXem, selCns])
  const tongQuy = { cuoi: quy.reduce((a, r) => a + r.cuoi, 0), thu: quy.reduce((a, r) => a + r.thu, 0), chi: quy.reduce((a, r) => a + r.chi, 0) }
  // khoản chi lớn nhất theo cơ cấu chi phí
  const chiLon = [...d.coCauCp].sort((a, b) => b.v - a.v)[0]

  // 3. Kho: tồn hiện tại theo bảng định mức tồn (giá nguyên vật liệu), hao hụt là phiếu xuất điều chỉnh sinh từ kiểm kê trong kỳ
  // 3. Mua hàng, công nợ, hao hụt trong tháng (T230): phiếu mua 4.1.1; công nợ phải trả lấy Nợ cuối kỳ của báo cáo Công nợ nhà cung cấp 4.2.3;
  // hao hụt là phiếu xuất điều chỉnh sinh từ kiểm kê (thiếu hàng); gói Free phiếu điều chỉnh không có giá trị (T131) nên chỉ đếm mặt hàng, số phiếu
  const kho = useMemo(() => {
    const mua = chungTu(PHIEU_MUA, '4.1.1').filter(r => thang.includes(Number(r.thang)) && tenCn.has(String(r.cn)))
    const nhapMua = mua.reduce((a, r) => a + (Number(r.tong) || 0), 0)
    const motCn = selCns.length === 1 ? CHI_NHANH.find(c => c.id === selCns[0])?.ten : undefined
    const ncc = rowsCongNo('ncc', thangXem, motCn).filter(r => !r._t)
    const congNo = ncc.reduce((a, r) => a + Math.max(0, Number(r.cuoi) || 0), 0)
    const cfgKK = timMan('kho', '5-1-10').sc?.voucher
    const xdc = cfgKK ? mauDieuChinh(cfgKK).filter(r => r.loai === 'xdc' && thang.includes(Number(r.thang)) && tenCn.has(String(r.cn))) : []
    const matHH = new Set(xdc.flatMap(r => ((r._dong as { ma: string }[] | undefined) ?? []).map(d => d.ma))).size
    return { nhapMua, soDon: mua.length, congNo, soNcc: ncc.filter(r => Number(r.cuoi) > 0).length, matHH }
  }, [selCns, tenCn, thang, thangXem])

  return (
    <div className="bbt" onClickCapture={moTuTrangChu}>
      {/* Bỏ dòng giới thiệu, chọn tháng năm đưa lên thanh tab cho đỡ tốn chỗ (T250) */}
      <LenThanhTab>{chonKy}</LenThanhTab>
      <div className="bbt-luoi">
        <Cot so={1} icon="chart" ten="Quản lý lãi lỗ" hoi={`${thangXem === 10 ? 'Tháng này' : `Tháng ${thangXem}`} lãi bao nhiêu?`}
          tra={`${loiNhuan >= 0 ? '+' : '−'}${short(Math.abs(loiNhuan))}`} traCls={loiNhuan >= 0 ? 'lai' : 'lo'}
          phu={`Biên lãi ${pct(bien)} trên doanh thu`} di="/app/bao-cao/10-2-3" nut="Xem kết quả kinh doanh" />
        <Cot so={2} icon="wallet" ten="Quản lý thu chi" hoi={thangXem === 10 ? 'Tồn quỹ hiện tại' : `Tồn quỹ cuối tháng ${thangXem}/2026`}
          tra={short(tongQuy.cuoi)} phu={`Thu +${short(tongQuy.thu)} · Chi −${short(tongQuy.chi)}`} di="/app/danh-muc/1-12?moi=1&goiY=thuchi" nut="Tạo quỹ" goiY="Bấm vào quỹ bên dưới để xem lịch sử thu chi" />   {/* mở form thêm quỹ ở Danh mục Quỹ tiền (T245), lưu xong gợi ý lập phiếu thu, chi (T250) */}
        <Cot so={3} icon="khohang" ten="Quản lý kho" hoi="Quản lý mua hàng, công nợ, hao hụt hàng bán thẳng"
          phu={`Mua ${kho.soDon} đơn · Công nợ ${short(kho.congNo)} · ${kho.matHH} mặt hàng hao hụt`} />
      </div>
      {/* Biểu đồ dưới từng bài toán: lãi lỗ, thu chi, kho (T230) */}
      <div className="bbt-luoi bbt-bd">
        <TheLaiLo thang={thangXem} dt={d.dtThuan} nvl={nvl.tien} nvlTheo={moTaCach(nvl.ds)} cpThang={cpThang} phanBo={d.cpPhanBo} chiLon={chiLon ? `Nhiều nhất: ${chiLon.l} ${short(chiLon.v)}` : undefined} />
        <TheTonQuy thang={thangXem} ds={quy} />
        <TheKho thang={thangXem} nhapMua={kho.nhapMua} soDon={kho.soDon} congNo={kho.congNo} soNcc={kho.soNcc} matHH={kho.matHH} />
      </div>
    </div>
  )
}
