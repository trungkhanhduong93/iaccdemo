// Trang chủ gói Free theo ba bài toán: Quản lý lãi lỗ, Quản lý thu chi, Quản lý kho (T230).
// Mỗi bài toán một cột: câu hỏi chủ quán hay hỏi, số trả lời, 4 dòng chi tiết, nút đi tới màn làm việc.
// Lãi lỗ tách chi phí như Báo cáo kết quả kinh doanh bản Free (T220): bỏ thu nhập, chi phí khác khỏi lợi nhuận
import { useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, useSearchParams } from 'react-router-dom'
import { LenThanhTab } from '../../app/ModuleTabs'
import { CUA_HANG } from '../../data/mock'
import { timMan } from '../../app/registry'
import { Icon, ONen } from '../../ui/Icon'
import { Select } from '../../ui/Dropdown'
import { moneyD, pct, short } from '../../ui/format'
import { chungTu } from '../../ui/generic/gen'
import { mauDieuChinh } from '../kho/dieu-chinh'
import { PHIEU_MUA } from '../mua-hang/bao-cao'
import { tonQuyTheoSo } from './LichSuQuy'
import { rowsCongNo } from '../bao-cao/cong-no'
import { datLocDaXem } from '../../ui/bao-cao/tuyChinhBC'
import { tinhToanTongQuan, type TongQuanSoLieu } from './chiSo'
import { useSession, type Session } from '../../app/session'
import { LaiLoChart } from '../../ui/Charts'
import { moTaCach, nvlKy } from './chi-phi-nvl'
import { useMoTuTrangChu } from '../../app/tuTrangChu'
import { useDongEsc } from '../../ui/LocNangCao'
import { ModalQuy } from './quyThuChi'
import {
  layDuLieuCanTheoDoi,
  layLaiLoCuaHang,
  type LaiLoCnItem,
} from './soLieuBieuDoFree'
import {
  BieuDoCuaHangModal,
  LuoiCanTheoDoi,
} from './BieuDoFree'

// Hệ số mùa vụ quán ăn uống tháng 10/2025 đến 6/2026 so với trung bình tháng 7–9/2026: Tết (tháng 1) cao, sau Tết (tháng 2) thấp (T255)
const MUA_VU: [number, number, number][] = [   // [tháng, năm, hệ số doanh thu]
  [10, 2025, 0.9], [11, 2025, 0.94], [12, 2025, 1.08], [1, 2026, 1.16], [2, 2026, 0.74],
  [3, 2026, 0.86], [4, 2026, 0.93], [5, 2026, 0.97], [6, 2026, 1.01],
]

/** Lãi lỗ 13 tháng 10/2025–10/2026, cùng công thức thẻ Lãi lỗ: doanh thu thuần trừ chi phí NVL, chi phí hoạt động.
 *  Dữ liệu mẫu chỉ có từ 01/07/2026: tháng 7–10 tính thật; 9 tháng trước sinh từ trung bình tháng 7–9 theo hệ số mùa vụ,
 *  NVL theo tỷ lệ doanh thu, chi phí hoạt động gần như cố định (T255) */
export function laiLo13Thang(s: Session, selCns: string[]) {
  const that = [7, 8, 9, 10].map(t => {
    const d = tinhToanTongQuan(t === 10 ? 'thang-nay' : 'thang-truoc', selCns, s.cheDo, t)
    return { t, dt: d.dtThuan, nvl: nvlKy(s, selCns, t).tien, cp: d.cpHoatDong }
  })
  const du = that.slice(0, 3)
  const tb = (f: (x: typeof du[number]) => number) => du.reduce((a, x) => a + f(x), 0) / du.length
  const dtTb = tb(x => x.dt), tyLeNvl = tb(x => x.nvl) / (dtTb || 1), cpTb = tb(x => x.cp)
  const mau = MUA_VU.map(([t, n, h], i) => {
    const dt = dtTb * h
    const cp = cpTb * (0.97 + (i % 3) * 0.025)
    const chi = Math.round(dt * tyLeNvl + cp)
    return { l: `T${t}/${String(n).slice(2)}`, dt: Math.round(dt), cp: chi, v: Math.round(dt) - chi, ghiChu: 'số mẫu' }
  })
  return [...mau, ...that.map(x => ({
    l: `T${x.t}/26`, dt: x.dt, cp: x.nvl + x.cp, v: Math.round(x.dt - x.nvl - x.cp),
    ghiChu: x.t === 10 ? 'tháng 10 mới có số liệu đến 07/10' : undefined, do: x.t === 10,
  }))]
}

/** Tóm tắt 13 tháng cạnh biểu đồ: tổng doanh thu, chi phí, lãi lỗ, tháng lãi cao nhất, số tháng lỗ (T255) */
function TomTat13({ ds }: { ds: ReturnType<typeof laiLo13Thang> }) {
  const tong = (f: (x: typeof ds[number]) => number) => ds.reduce((a, x) => a + f(x), 0)
  const ln = tong(x => x.v)
  const cao = ds.reduce((a, x) => (x.v > a.v ? x : a), ds[0])
  const lo = ds.filter(x => x.v < 0)
  const dong = (ten: string, gt: string, cls = '') => <div className="bbt-13t-dong"><span>{ten}</span><b className={cls}>{gt}</b></div>
  return (
    <div className="bbt-13t-tt">
      {dong('Tổng doanh thu', moneyD(tong(x => x.dt)))}
      {dong('Tổng chi phí', moneyD(tong(x => x.cp)))}
      {dong(ln >= 0 ? 'Tổng lãi' : 'Tổng lỗ', moneyD(Math.abs(ln)), ln >= 0 ? 'lai' : 'lo')}
      {dong('Lãi cao nhất', `${cao.l} · ${short(cao.v)}`)}
      {dong('Tháng lỗ', lo.length ? lo.map(x => x.l).join(', ') : 'Không có', lo.length ? 'lo' : '')}
    </div>
  )
}

/** Hộp biểu đồ lãi lỗ 13 tháng, mở từ nút ở thẻ Quản lý lãi lỗ: biểu đồ bên trái, tóm tắt bên phải; chân hộp vẫn mở được Kết quả kinh doanh (T255, T274) */
export function HopLaiLo13({
  ds,
  onDong,
  thangXem,
  selCns,
  laiLoCn,
}: {
  ds: ReturnType<typeof laiLo13Thang>
  onDong: () => void
  thangXem?: number
  selCns?: string[]
  laiLoCn?: LaiLoCnItem[]
}) {
  useDongEsc(onDong)
  const isTatCa = !selCns || selCns.length > 1
  const [kieuXem, setKieuXem] = useState<'13t' | 'cn'>('13t')

  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className={`ds-hop hop-13t ${kieuXem === 'cn' ? 'hop-13t--cn' : ''}`} role="dialog" aria-modal="true" aria-label="Biểu đồ lãi lỗ 13 tháng">
        <div className="ds-hop-dau">
          <Icon n="chart" className="ic sm" /><b>{kieuXem === 'cn' ? `Lãi lỗ theo cửa hàng tháng ${thangXem ?? 10}/2026` : 'Lãi lỗ 13 tháng'}</b>
          {isTatCa && (
            <div className="bbt-modal-segmented" role="tablist" aria-label="Kiểu xem lãi lỗ">
              <button
                type="button"
                role="tab"
                aria-selected={kieuXem === '13t'}
                className={`bbt-seg-btn ${kieuXem === '13t' ? 'on' : ''}`}
                onClick={() => setKieuXem('13t')}
              >
                13 tháng
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={kieuXem === 'cn'}
                className={`bbt-seg-btn ${kieuXem === 'cn' ? 'on' : ''}`}
                onClick={() => setKieuXem('cn')}
              >
                Theo cửa hàng
              </button>
            </div>
          )}
          <span className="grow" />
          <span className="bbt-13t-chu"><i className="dt" />Doanh thu<i className="cp" />Chi phí<i className="lai tron" />Lãi<i className="lo tron" />Lỗ</span>
          <button type="button" className="pheu-dong" title="Đóng" aria-label="Đóng" onClick={onDong}><Icon n="x" className="ic sm" /></button>
        </div>
        <div className="hop-13t-than">
          {kieuXem === 'cn' && laiLoCn ? (
            <BieuDoCuaHangModal ds={laiLoCn} thang={thangXem ?? 10} />
          ) : (
            <>
              <div className="bbt-13t-bd"><LaiLoChart data={ds} /><div className="hop-13t-goiy">Rê chuột vào từng tháng để xem doanh thu, chi phí, lãi lỗ</div></div>
              <TomTat13 ds={ds} />
            </>
          )}
        </div>
        <div className="ds-chan">
          <Link to="/app/bao-cao/10-2-3" className="btn" onClick={onDong}>Xem kết quả kinh doanh</Link>
          <span className="grow" />
          <button type="button" className="btn pri" onClick={onDong}>Đóng</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** Màu lát biểu đồ tròn tồn quỹ (T291): theo thứ tự quỹ, hết màu thì quay vòng */
const MAU_QUY = ['var(--blue, #0560a6)', 'var(--teal, #0f766e)', 'var(--amber, #b45309)', 'var(--indigo, #4338ca)', 'var(--green, #138a52)', 'var(--orange-d, #d0650a)', '#7c3aed', '#0891b2']

/** Biểu đồ tròn tồn quỹ theo quỹ (T291): giữa vòng là tổng; bấm lát hoặc dòng chú thích mở biểu đồ thu chi của quỹ */
function VongQuy({ ds, tong, onChon }: { ds: { quy: string; tienMat: boolean; cuoi: number }[]; tong: number; onChon: (quy: string) => void }) {
  const [tro, setTro] = useState<string | null>(null)
  const co = 260, rr = 104, day = 44, C = 2 * Math.PI * rr   // T293: cột thu chi rộng gấp rưỡi, vòng to theo
  const duong = ds.map(r => Math.max(0, r.cuoi))
  const tongDuong = duong.reduce((a, v) => a + v, 0) || 1
  let off = 0
  const dangTro = ds.find(r => r.quy === tro)
  return (
    <div className="bbt-vq">
      <svg className="bbt-vq-vong" viewBox={`0 0 ${co} ${co}`} width={co} height={co} role="img" aria-label="Biểu đồ tròn tồn quỹ theo quỹ">
        <circle cx={co / 2} cy={co / 2} r={rr} fill="none" stroke="var(--line-2, #eee)" strokeWidth={day} />
        {ds.map((r, i) => {
          const len = (duong[i] / tongDuong) * C
          const el = (
            <circle key={r.quy} cx={co / 2} cy={co / 2} r={rr} fill="none" stroke={MAU_QUY[i % MAU_QUY.length]} strokeWidth={day}
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} transform={`rotate(-90 ${co / 2} ${co / 2})`}
              className={`bbt-vq-lat${tro && tro !== r.quy ? ' mo' : ''}`} onClick={() => onChon(r.quy)} onMouseEnter={() => setTro(r.quy)} onMouseLeave={() => setTro(null)}>
              <title>{`${r.quy}: ${moneyD(r.cuoi)}`}</title>
            </circle>
          )
          off += len
          return el
        })}
        <text x={co / 2} y={co / 2 - 10} textAnchor="middle" className="bbt-vq-nhan">{dangTro ? pct(tong ? dangTro.cuoi / tong : 0) : 'Tổng tồn'}</text>
        <text x={co / 2} y={co / 2 + 20} textAnchor="middle" className="bbt-vq-so">{short(dangTro ? dangTro.cuoi : tong)}</text>
      </svg>
      <ul className="bbt-vq-ct">
        {ds.map((r, i) => (
          <li key={r.quy}>
            <button type="button" className={tro === r.quy ? 'on' : ''} title={`Xem biểu đồ thu chi ${r.quy}`} onClick={() => onChon(r.quy)}
              onMouseEnter={() => setTro(r.quy)} onMouseLeave={() => setTro(null)}>
              <i style={{ background: MAU_QUY[i % MAU_QUY.length] }} />
              <span className="bbt-vq-ten"><span>{r.quy}</span><b>{moneyD(r.cuoi)}<small>{pct(tong ? r.cuoi / tong : 0)}</small></b></span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Thao tác nhanh đầu trang chủ Free (T290): cố định 5 nút, không theo danh sách tuỳ chỉnh ở thanh bên */
const TT_NHANH_FREE = [
  { ten: 'Thu tiền', icon: 'cashin', to: '/app/tien/2-1-1/moi?loai=thu', goiY: 'Lập phiếu thu tiền' },
  { ten: 'Chi tiền', icon: 'cashout', to: '/app/tien/2-1-1/moi?loai=chi', goiY: 'Lập phiếu chi tiền' },
  { ten: 'Mua hàng', icon: 'truck', to: '/app/mua-hang/4-1-1/moi', goiY: 'Lập phiếu mua hàng' },
  { ten: 'Kiểm kê', icon: 'clipboard', to: '/app/kho/5-1-10/moi', goiY: 'Lập phiếu kiểm kê' },
  { ten: 'Kê khai thuế', icon: 'percent', to: '/app/thue/to-khai', goiY: 'Mở danh sách tờ khai thuế' },
]

/** Trang chủ Free theo ba bài toán mẫu E (T272, T274): 2 tab Tổng quan | Cần theo dõi, lọc cửa hàng; 6 thẻ biểu đồ bỏ ở T293 */
export function BaBaiToanFree({ d, thang: thangXem, selCns, chonKy }: { d: TongQuanSoLieu; thang: number; selCns: string[]; chonKy?: ReactNode }) {
  const { s, set } = useSession()
  const moTuTrangChu = useMoTuTrangChu()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const tabHien = tabParam === 'theo-doi' ? 'theo-doi' : 'tong-quan'

  const chuyenTab = (t: 'tong-quan' | 'theo-doi') => {
    setSearchParams(prev => {
      const n = new URLSearchParams(prev)
      if (t === 'theo-doi') n.set('tab', 'theo-doi')
      else n.delete('tab')
      return n
    }, { replace: true })
  }

  // Cửa hàng chọn từ thanh trên / session (T274)
  const cnChon = s.cuaHang || 'all'
  const cnsHien = useMemo(() => {
    if (s.cuaHang && s.cuaHang !== 'all') return [s.cuaHang]
    return CUA_HANG.map(c => c.id)
  }, [s.cuaHang])

  // Tính lại số liệu tổng quan nếu cửa hàng đổi
  const dHien = useMemo(() => {
    const khop = cnsHien.length === selCns.length && cnsHien.every(id => selCns.includes(id))
    if (khop) return d
    return tinhToanTongQuan(thangXem === 10 ? 'thang-nay' : 'thang-truoc', cnsHien, s.cheDo, thangXem)
  }, [d, cnsHien, selCns, s.cheDo, thangXem])

  const thang = useMemo(() => [thangXem], [thangXem])
  const tenCn = useMemo(() => new Set(CUA_HANG.filter(c => cnsHien.includes(c.id)).map(c => c.ten)), [cnsHien])

  // 1. Lãi lỗ
  const nvl = nvlKy(s, cnsHien, thangXem)
  const cpThang = dHien.cpHoatDong - dHien.cpPhanBo
  const loiNhuan = dHien.dtThuan - nvl.tien - cpThang - dHien.cpPhanBo
  const bien = dHien.dtThuan > 0 ? loiNhuan / dHien.dtThuan : 0
  const laiLo13 = useMemo(() => laiLo13Thang(s, cnsHien), [s, cnsHien])
  const [moBieuDo, setMoBieuDo] = useState(false)

  // 2. Thu chi: số dư, thu, chi cộng từ Sổ quỹ tiền mặt, Sổ ngân hàng
  const quy = useMemo(() => tonQuyTheoSo(thangXem, cnsHien), [thangXem, cnsHien])
  const tongQuy = { cuoi: quy.reduce((a, r) => a + r.cuoi, 0), thu: quy.reduce((a, r) => a + r.thu, 0), chi: quy.reduce((a, r) => a + r.chi, 0) }
  const chiLon = [...dHien.coCauCp].sort((a, b) => b.v - a.v)[0]
  const [modalQuy, setModalQuy] = useState<string | null>(null)

  // 3. Kho

  const kho = useMemo(() => {
    const mua = chungTu(PHIEU_MUA, '4.1.1').filter(r => thang.includes(Number(r.thang)) && tenCn.has(String(r.cn)))
    const nhapMua = mua.reduce((a, r) => a + (Number(r.tong) || 0), 0)
    const motCn = cnsHien.length === 1 ? CUA_HANG.find(c => c.id === cnsHien[0])?.ten : undefined
    const ncc = rowsCongNo('ncc', thangXem, motCn).filter(r => !r._t)
    const congNo = ncc.reduce((a, r) => a + Math.max(0, Number(r.cuoi) || 0), 0)
    const cfgKK = timMan('kho', '5-1-10').sc?.voucher
    const xdc = cfgKK ? mauDieuChinh(cfgKK).filter(r => r.loai === 'xdc' && thang.includes(Number(r.thang)) && tenCn.has(String(r.cn))) : []
    const matHH = new Set(xdc.flatMap(r => ((r._dong as { ma: string }[] | undefined) ?? []).map(d => d.ma))).size
    return { nhapMua, soDon: mua.length, congNo, soNcc: ncc.filter(r => Number(r.cuoi) > 0).length, matHH }
  }, [cnsHien, tenCn, thang, thangXem])

  // Số liệu 5 biểu đồ top 5 + Lãi lỗ cửa hàng + Cần theo dõi (T274)
  const laiLoCn = useMemo(() => layLaiLoCuaHang(thangXem, cnsHien, s), [thangXem, cnsHien, s])
  const ctdData = useMemo(() => layDuLieuCanTheoDoi(thangXem, cnsHien, dHien.dtThuan), [thangXem, cnsHien, dHien.dtThuan])

  return (
    <div className="bbt bbt-e" onClickCapture={moTuTrangChu}>
      <LenThanhTab>
        {chonKy}
      </LenThanhTab>

      {/* Thanh 2 tab: Tổng quan | Cần theo dõi (T274) */}
      <div className="bbt-thanh-dau">
        <div className="bbt-tabs" role="tablist" aria-label="Chuyển tab trang chủ">
          <button
            type="button"
            role="tab"
            aria-selected={tabHien === 'tong-quan'}
            className={`bbt-tab-btn ${tabHien === 'tong-quan' ? 'on' : ''}`}
            onClick={() => chuyenTab('tong-quan')}
          >
            Tổng quan
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tabHien === 'theo-doi'}
            className={`bbt-tab-btn ${tabHien === 'theo-doi' ? 'on' : ''}`}
            onClick={() => chuyenTab('theo-doi')}
          >
            Cần theo dõi
            {ctdData.soCanhBao > 0 && <span className="bbt-tab-badge">{ctdData.soCanhBao}</span>}
          </button>
        </div>
        {/* Thao tác nhanh cố định trên hàng tab, cả 2 tab (T290) */}
        <nav className="bbt-tt-nhanh" aria-label="Thao tác nhanh">
          {/* Nhãn cùng tên, cùng biểu tượng với mục Thao tác nhanh ở thanh bên để khách nhận ra */}
          <span className="bbt-tt-nhanh-nhan"><Icon n="sparkle" className="ic sm" />Thao tác nhanh</span>
          {TT_NHANH_FREE.map(m => (
            <Link key={m.ten} to={m.to} title={m.goiY} className="bbt-tt-nhanh-nut"><ONen n={m.icon} kieu="nhat" co="sm" />{m.ten}</Link>
          ))}
        </nav>
      </div>

      {tabHien === 'theo-doi' ? (
        <LuoiCanTheoDoi data={ctdData} thang={thangXem} />
      ) : (
        <>
          <div className="bbt-e-luoi bbt-e-luoi-2">   {/* hàng trên 2 cột lãi lỗ, thu chi; Quản lý kho kéo hết hàng dưới (T293) */}
        {/* Cột 1: Quản lý lãi lỗ */}
        <section className="bbt-cot col">
          <h2 className="ten bbt-e-ten">
            <Icon n="chart" className="ic sm" /> 1. Quản lý lãi lỗ
          </h2>
          <div className="hoi bbt-e-hoi">
            {thangXem === 10 ? 'Tháng này' : `Tháng ${thangXem}`} lãi bao nhiêu?
          </div>
          <div
            className={`tra bbt-tra ${loiNhuan >= 0 ? 'lai' : 'lo'}`}
            style={{ color: loiNhuan >= 0 ? 'var(--green, #138a52)' : 'var(--red, #c2362b)' }}
          >
            {loiNhuan < 0 ? `Lỗ ${moneyD(Math.abs(loiNhuan))}` : moneyD(loiNhuan)}
          </div>
          <div className="phu bbt-phu bbt-e-phu">
            Biên lãi {pct(bien)} trên doanh thu
          </div>

          <div className="t dt">
            <div className="l"><b>Doanh thu</b></div>
            <div className="r"><b style={{ fontSize: '17px' }}>{moneyD(d.dtThuan)}</b></div>
          </div>

          <Link
            to={`/app/trang-chu/chi-phi-nvl?thang=${thangXem}`}
            className="t cp bbt-e-the-link"
            title="Xem chi phí nguyên vật liệu"
          >
            <div className="l">
              <b>Chi phí nguyên vật liệu</b>
              <span>{moTaCach(nvl.ds)}</span>
            </div>
            <div className="r">
              <b>{moneyD(nvl.tien)}</b>
              <span>{pct(d.dtThuan > 0 ? nvl.tien / d.dtThuan : 0)}</span>
            </div>
            <Icon n="chevr" className="ic sm muted" />
          </Link>

          <Link
            to={`/app/trang-chu/chi-phi-thang?thang=${thangXem}`}
            className="t cp bbt-e-the-link"
            title="Xem chi phí trong tháng"
          >
            <div className="l">
              <b>Chi phí trong tháng</b>
              <span>{chiLon ? `Nhiều nhất: ${chiLon.l} ${short(chiLon.v)}` : 'Lương, mặt bằng, điện nước, chi khác'}</span>
            </div>
            <div className="r">
              <b>{moneyD(cpThang)}</b>
              <span>{pct(d.dtThuan > 0 ? cpThang / d.dtThuan : 0)}</span>
            </div>
            <Icon n="chevr" className="ic sm muted" />
          </Link>

          <Link
            to="/app/ccdc/8-1-1"
            className="t cp bbt-e-the-link"
            title="Xem chi phí phân bổ hàng tháng"
          >
            <div className="l">
              <b>Chi phí phân bổ hàng tháng</b>
              <span>Phân bổ công cụ dụng cụ, khấu hao</span>
            </div>
            <div className="r">
              <b>{moneyD(d.cpPhanBo)}</b>
              <span>{pct(d.dtThuan > 0 ? d.cpPhanBo / d.dtThuan : 0)}</span>
            </div>
            <Icon n="chevr" className="ic sm muted" />
          </Link>

          <div className={`t ${loiNhuan >= 0 ? 'lai' : 'lo'}`}>
            <div className="l"><b>Lợi nhuận</b></div>
            <div className="r">
              <b style={{ fontSize: '17px' }}>
                {loiNhuan < 0 ? `Lỗ ${moneyD(Math.abs(loiNhuan))}` : moneyD(loiNhuan)}
              </b>
              <span>{pct(bien)}</span>
            </div>
          </div>

          <button
            type="button"
            className="nut bbt-e-nut"
            onClick={() => setMoBieuDo(true)}
          >
            Xem biểu đồ lãi lỗ 13 tháng ›
          </button>
        </section>

        {/* Cột 2: Quản lý thu chi */}
        <section className="bbt-cot col">
          <h2 className="ten bbt-e-ten">
            <Icon n="wallet" className="ic sm" /> 2. Quản lý thu chi
          </h2>
          <div className="hoi bbt-e-hoi">
            {thangXem === 10 ? 'Tồn quỹ hiện tại' : `Tồn quỹ cuối tháng ${thangXem}/2026`}
          </div>
          <button
            type="button"
            className="tra bbt-tra bbt-tra-btn"
            style={{ color: 'var(--blue, #0560a6)' }}
            onClick={() => setModalQuy('tat-ca')}
            title="Xem biểu đồ thu chi tất cả quỹ"
          >
            {moneyD(tongQuy.cuoi)} ›
          </button>
          <div className="phu bbt-phu bbt-e-phu">
            Thu <span style={{ color: 'var(--green, #138a52)' }}>{short(tongQuy.thu)}</span> · Chi <span style={{ color: 'var(--red, #c2362b)' }}>{short(tongQuy.chi)}</span>
          </div>

          <VongQuy ds={quy} tong={tongQuy.cuoi} onChon={setModalQuy} />

          {/* T273: nút "Biểu đồ thu chi ›" mở modal gộp, bỏ dòng gợi ý */}
          <button
            type="button"
            className="nut bbt-e-nut"
            onClick={() => setModalQuy('tat-ca')}
          >
            Biểu đồ thu chi ›
          </button>
        </section>

        {/* Quản lý kho: hàng dưới, 3 thẻ xếp ngang (T293) */}
        <section className="bbt-cot col bbt-kho-ngang">
          <h2 className="ten bbt-e-ten">
            <Icon n="khohang" className="ic sm" /> 3. Quản lý kho
          </h2>
          <div className="hoi bbt-e-hoi">
            Hao hụt kiểm kê tháng {thangXem}
          </div>
          <div className="tra bbt-tra hh" style={{ color: 'var(--red, #c2362b)' }}>
            {kho.matHH} mặt hàng
          </div>
          <div className="phu bbt-phu bbt-e-phu">
            Mua {kho.soDon} đơn · Công nợ {short(kho.congNo)}
          </div>

          <div className="bbt-kho-the">
          <Link to="/app/mua-hang/4-1-1" className="t qy bbt-e-the-link" title="Xem nhập mua">
            <div className="l">
              <b>Nhập mua</b>
              <span>{kho.soDon} đơn mua hàng</span>
            </div>
            <div className="r">
              <b>{moneyD(kho.nhapMua)}</b>
            </div>
            <Icon n="chevr" className="ic sm muted" />
          </Link>

          <Link
            to="/app/bao-cao/4-2-3"
            className="t cp bbt-e-the-link"
            title="Xem công nợ phải trả"
            onClick={() => datLocDaXem('/app/bao-cao/4-2-3', {}, String(thangXem))}
          >
            <div className="l">
              <b>Công nợ phải trả</b>
              <span>{kho.soNcc} nhà cung cấp còn nợ</span>
            </div>
            <div className="r">
              <b>{moneyD(kho.congNo)}</b>
            </div>
            <Icon n="chevr" className="ic sm muted" />
          </Link>

          <Link
            to="/app/bao-cao/5-2-15"
            className="t hh bbt-e-the-link"
            title="Xem hao hụt kiểm kê"
            onClick={() => datLocDaXem('/app/bao-cao/5-2-15', {}, String(thangXem))}
          >
            <div className="l">
              <b>Hao hụt kiểm kê</b>
              <span>Các mặt hàng thừa thiếu trong kỳ</span>
            </div>
            <div className="r">
              <b>{kho.matHH} mặt hàng</b>
            </div>
            <Icon n="chevr" className="ic sm muted" />
          </Link>
          </div>

          <Link
            to="/app/bao-cao/5-2-15"
            className="nut"
            onClick={() => datLocDaXem('/app/bao-cao/5-2-15', {}, String(thangXem))}
          >
            Mở báo cáo kiểm kê ›
          </Link>
        </section>
      </div>

    </>
  )}

  {moBieuDo && (
    <HopLaiLo13
      ds={laiLo13}
      onDong={() => setMoBieuDo(false)}
      thangXem={thangXem}
      selCns={cnsHien}
      laiLoCn={laiLoCn}
    />
  )}
  {modalQuy && <ModalQuy quyKey={modalQuy} thang={thangXem} selCns={cnsHien} onDong={() => setModalQuy(null)} />}
</div>
  )
}
