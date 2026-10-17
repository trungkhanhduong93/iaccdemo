// Trang chủ gói Free theo ba bài toán: Quản lý lãi lỗ, Quản lý thu chi, Quản lý kho (T230).
// Mỗi bài toán một cột: câu hỏi chủ quán hay hỏi, số trả lời, 4 dòng chi tiết, nút đi tới màn làm việc.
// Lãi lỗ tách chi phí như Báo cáo kết quả kinh doanh bản Free (T220): bỏ thu nhập, chi phí khác khỏi lợi nhuận
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { LenThanhTab } from '../../app/ModuleTabs'
import { CUA_HANG, KHOA_SO_DEN, KY_MO } from '../../data/mock'
import { Icon, ONen } from '../../ui/Icon'
import { Select } from '../../ui/Dropdown'
import { moneyD, pad, pct, short } from '../../ui/format'
import { tonQuyTheoSo } from './LichSuQuy'
import { soLieuCongNo, soLieuKiemKe, soLieuMua, type CotThang } from './khoFree'
import { datLocDaXem, docTuyChinh, luuTuyChinh } from '../../ui/bao-cao/tuyChinhBC'
import { tinhToanTongQuan, type TongQuanSoLieu } from './chiSo'
import { useSession, type Session } from '../../app/session'
import { LaiLoChart } from '../../ui/Charts'
import { moTaCach, nvlKy } from './chi-phi-nvl'
import { useMoTuTrangChu } from '../../app/tuTrangChu'
import { useDongEsc } from '../../ui/LocNangCao'
import { ModalQuy } from './quyThuChi'
import { type LaiLoCnItem } from './soLieuBieuDoFree'
import { BieuDoCuaHangModal } from './BieuDoFree'
import { DS_QUY_TIEN_112 } from '../danh-muc/data'

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

/** Thu, chi mẫu 12 tháng 10/2025–9/2026 cho biểu đồ Dòng tiền: [tháng, năm, thu so với thu tháng 10, chi so với thu cùng tháng].
 *  Có tháng chi nhiều hơn thu (Tết, sau Tết, tháng 5, tháng 9) để thấy dòng tiền thuần âm, tồn quỹ đi xuống (T303) */
const DONG_TIEN_MAU: [number, number, number, number][] = [
  [10, 2025, 0.88, 0.82], [11, 2025, 0.92, 0.9], [12, 2025, 1.05, 0.8], [1, 2026, 1.18, 1.2], [2, 2026, 0.72, 1.3],
  [3, 2026, 0.84, 0.92], [4, 2026, 0.9, 0.85], [5, 2026, 0.95, 1.15], [6, 2026, 0.98, 0.82], [7, 2026, 1, 0.88],
  [8, 2026, 1.04, 0.8], [9, 2026, 0.99, 1.12],
]

/** Dòng tiền 13 tháng 10/2025–10/2026 của các quỹ đang xem: cột Thu, cột Chi, đường Dòng tiền thuần = thu − chi (v, cùng kiểu đường lãi lỗ), đường Tồn quỹ cuối tháng (v2) (T303).
 *  Tháng 10/2026 lấy đúng số khối Quỹ tiền đang hiện (Sổ quỹ, Sổ ngân hàng cộng 5 quỹ mẫu); 12 tháng trước là số mẫu theo DONG_TIEN_MAU,
 *  tồn tính lùi từ tồn đầu tháng 10 (tồn cuối tháng trước = tồn đầu tháng sau) để đường tồn quỹ, dòng tiền thuần khớp nhau */
export function thuChi13Thang(selCns: string[]) {
  const q = [...tonQuyTheoSo(10, selCns), ...QUY_MAU_THEM]
  const tong = (f: (r: typeof q[number]) => number) => q.reduce((a, r) => a + f(r), 0)
  const nay = { thu: tong(r => r.thu), chi: tong(r => r.chi), cuoi: tong(r => r.cuoi) }
  const ds: { l: string; dt: number; cp: number; v: number; v2: number; ghiChu?: string; do?: boolean }[] = [{
    l: 'T10/26', dt: nay.thu, cp: nay.chi, v: nay.thu - nay.chi, v2: nay.cuoi, ghiChu: 'tháng 10 mới có số liệu đến 07/10', do: true,
  }]
  let cuoi = nay.cuoi - nay.thu + nay.chi   // tồn cuối tháng 9 = tồn đầu tháng 10
  for (let i = DONG_TIEN_MAU.length - 1; i >= 0; i--) {
    const [t, n, hThu, hChi] = DONG_TIEN_MAU[i]
    const thu = Math.round(nay.thu * hThu / 1e5) * 1e5, chi = Math.round(thu * hChi / 1e5) * 1e5
    ds.unshift({ l: `T${t}/${String(n).slice(2)}`, dt: thu, cp: chi, v: thu - chi, v2: Math.round(cuoi), ghiChu: 'số mẫu' })
    cuoi -= thu - chi
  }
  return ds
}

/** Khung đo bề rộng thật để vẽ biểu đồ 13 tháng trong cột trang chủ: cao cố định, chữ trục giữ cỡ ở mọi màn (T303) */
function KhungVua({ cao, ve }: { cao: number; ve: (rong: number) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [rong, setRong] = useState(0)
  useEffect(() => {
    const e = ref.current
    if (!e) return
    const ro = new ResizeObserver(() => setRong(Math.round(e.clientWidth)))
    ro.observe(e)
    return () => ro.disconnect()
  }, [])
  return <div ref={ref} style={{ height: cao }}>{rong > 0 && ve(rong)}</div>
}

/** Biểu đồ cột nhỏ 6 tháng hoặc theo cửa hàng ở ba khối kho (T304): cột cuối đậm hơn, cột số mẫu nhạt, rê chuột xem số.
 *  Tạm bỏ khỏi ba khối theo ý dinhlanphuongipacc, giữ lại để bật lại (số liệu `bieuDo` vẫn tính ở khoFree.ts) */
function CotNho({ ds, mau, cao = 96, dinhDang }: { ds: CotThang[]; mau: string; cao?: number; dinhDang: (v: number) => string }) {
  return <KhungVua cao={cao} ve={W => {
    const pt = 16, pb = 18, lon = Math.max(1, ...ds.map(x => x.v)), bw = W / (ds.length || 1)
    const y = (v: number) => pt + (cao - pt - pb) * (1 - v / lon)
    return (
      <svg className="chart bbt-cot-nho" viewBox={`0 0 ${W} ${cao}`} width="100%" role="img" aria-label="Biểu đồ cột">
        <line x1={0} x2={W} y1={cao - pb} y2={cao - pb} stroke="var(--line)" />
        {ds.map((x, i) => {
          const w = Math.min(34, bw * 0.55), cx = i * bw + bw / 2
          return (
            <g key={i}>
              <title>{`${x.l}: ${dinhDang(x.v)}${x.mau ? ' (số mẫu)' : ''}`}</title>
              <rect x={cx - w / 2} y={y(x.v)} width={w} height={Math.max(1, cao - pb - y(x.v))} rx={3} fill={mau}
                opacity={x.mau ? 0.35 : i === ds.length - 1 ? 1 : 0.7} />
              <text x={cx} y={y(x.v) - 4} textAnchor="middle" className="bbt-cot-nho-so">{dinhDang(x.v)}</text>
              <text x={cx} y={cao - 4} textAnchor="middle">{x.l}</text>
            </g>
          )
        })}
      </svg>
    )
  }} />
}

/** Tóm tắt thu chi 13 tháng cạnh biểu đồ (T303) */
function TomTatThuChi13({ ds }: { ds: ReturnType<typeof thuChi13Thang> }) {
  const tong = (f: (x: typeof ds[number]) => number) => ds.reduce((a, x) => a + f(x), 0)
  const chenh = tong(x => x.dt - x.cp)
  const cao = ds.reduce((a, x) => (x.v2 > a.v2 ? x : a), ds[0])
  const am = ds.filter(x => x.cp > x.dt)
  const dong = (ten: string, gt: string, cls = '') => <div className="bbt-13t-dong"><span>{ten}</span><b className={cls}>{gt}</b></div>
  return (
    <div className="bbt-13t-tt">
      {dong('Tổng thu', moneyD(tong(x => x.dt)), 'lai')}
      {dong('Tổng chi', moneyD(tong(x => x.cp)), 'lo')}
      {dong(chenh >= 0 ? 'Thu nhiều hơn chi' : 'Chi nhiều hơn thu', moneyD(Math.abs(chenh)), chenh >= 0 ? 'lai' : 'lo')}
      {dong(`Tồn quỹ cuối ${ds[ds.length - 1].l}`, moneyD(ds[ds.length - 1].v2))}
      {dong('Tồn cao nhất', `${cao.l} · ${short(cao.v2)}`)}
      {dong('Tháng chi nhiều hơn thu', am.length ? am.map(x => x.l).join(', ') : 'Không có', am.length ? 'lo' : '')}
    </div>
  )
}

/** Hộp biểu đồ thu chi 13 tháng, mở từ nút ở khối Quỹ tiền, bố cục như hộp lãi lỗ 13 tháng (T303) */
export function HopThuChi13({ ds, onDong }: { ds: ReturnType<typeof thuChi13Thang>; onDong: () => void }) {
  useDongEsc(onDong)
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop hop-13t" role="dialog" aria-modal="true" aria-label="Biểu đồ dòng tiền 13 tháng">
        <div className="ds-hop-dau">
          <Icon n="wallet" className="ic sm" /><b>Dòng tiền 13 tháng</b>
          <span className="grow" />
          <span className="bbt-13t-chu"><i className="thu2" />Thu<i className="chi2" />Chi<i className="thuan tron" /><span title="Thu trừ chi trong tháng">Dòng tiền thuần</span><i className="ton tron" />Tồn quỹ</span>
          <button type="button" className="pheu-dong" title="Đóng" aria-label="Đóng" onClick={onDong}><Icon n="x" className="ic sm" /></button>
        </div>
        <div className="hop-13t-than">
          <div className="bbt-13t-bd">
            <LaiLoChart data={ds} ten={['Thu', 'Chi']} mau={['var(--bd-thu, #0f8f84)', 'var(--bd-chi, #c2362b)']} duong={{ ten: 'Dòng tiền thuần' }} duong2={{ ten: 'Tồn quỹ', mau: 'var(--bd-ton, #0560a6)' }} />
            <div className="hop-13t-goiy">Rê chuột vào từng tháng để xem thu, chi, tồn quỹ cuối tháng. Thu, chi gồm cả tiền chuyển giữa các quỹ</div>
          </div>
          <TomTatThuChi13 ds={ds} />
        </div>
        <div className="ds-chan">
          <Link to="/app/trang-chu/lich-su-quy?quy=tat-ca&thang=10" className="btn" onClick={onDong}>Xem lịch sử thu chi</Link>
          <span className="grow" />
          <button type="button" className="btn pri" onClick={onDong}>Đóng</button>
        </div>
      </div>
    </div>,
    document.body,
  )
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
/** 5 quỹ mẫu chỉ có số dư, thêm vào khối Quỹ tiền trang chủ để thấy cách hiện khi có 10 quỹ (gom N quỹ khác, bảng Tất cả quỹ).
 *  Người dùng dinhlanphuongipacc yêu cầu giữ (T303). Chưa có giao dịch, chưa có trong Danh mục Quỹ tiền, Lịch sử thu chi */
const QUY_MAU_THEM = [
  { quy: 'Quỹ tiền mặt Hai Bà Trưng', tienMat: true, cuoi: 8_400_000 },
  { quy: 'Quỹ tiền mặt Phú Nhuận', tienMat: true, cuoi: 16_250_000 },
  { quy: 'Quỹ tiền mặt Thủ Đức', tienMat: true, cuoi: 12_700_000 },
  { quy: 'MB Bank, chi nhánh Phú Nhuận', tienMat: false, cuoi: 41_300_000 },
  { quy: 'VPBank, chi nhánh Thủ Đức', tienMat: false, cuoi: 33_600_000 },
].map(q => ({ ...q, mo: q.cuoi, thu: 0, chi: 0 }))

/** Tên hiển thị của quỹ theo Danh mục Quỹ tiền 1.12: quỹ ngân hàng tìm theo tên ngân hàng (chữ đầu), không thấy thì bỏ số tài khoản ở đuôi (T309) */
function tenQuyDanhMuc(quy: string, tienMat: boolean) {
  if (tienMat) return quy
  const nh = quy.split(/[ ,]/)[0]
  return DS_QUY_TIEN_112.find(x => x.loai === 'Ngân hàng' && x.ten.split(/[ ,]/)[0] === nh)?.ten ?? quy.replace(/(\s+[\d.\- ]+)+$/, '')
}

/** Quá 5 quỹ thì vòng, chú thích chỉ giữ 4 quỹ nhiều tiền nhất, còn lại gom một dòng "N quỹ khác"; bấm dòng đó mở bảng nổi liệt kê đủ mọi quỹ, khối không dài ra (T303) */
const QUY_HIEN = 4, QUY_KHAC = 'tat-ca'

function VongQuy({ ds: dsGoc, tong, onChon }: { ds: { quy: string; tienMat: boolean; cuoi: number }[]; tong: number; onChon: (quy: string) => void }) {
  const [tro, setTro] = useState<string | null>(null)
  const [moDs, setMoDs] = useState(false)
  useEffect(() => {
    if (!moDs) return
    const dong = (e: KeyboardEvent) => { if (e.key === 'Escape') setMoDs(false) }
    document.addEventListener('keydown', dong)
    return () => document.removeEventListener('keydown', dong)
  }, [moDs])
  const chon = (quy: string) => { if (quy === QUY_KHAC) setMoDs(true); else onChon(quy) }
  // Tên quỹ hiện như Danh mục Quỹ tiền 1.12 (vd "Vietcombank, chi nhánh Sài Gòn"), không kèm số tài khoản (T309); khoá quy vẫn là tên sổ để mở đúng quỹ
  const coMau = dsGoc.map((r, i) => ({ ...r, mau: MAU_QUY[i % MAU_QUY.length], ten: tenQuyDanhMuc(r.quy, r.tienMat) }))
  const ds = coMau.length <= QUY_HIEN + 1 ? coMau : (() => {
    const xep = [...coMau].sort((a, b) => b.cuoi - a.cuoi)
    const con = xep.slice(QUY_HIEN)
    const giu = new Set(xep.slice(0, QUY_HIEN).map(r => r.quy))
    return [...coMau.filter(r => giu.has(r.quy)),
      { quy: QUY_KHAC, tienMat: false, cuoi: con.reduce((a, r) => a + r.cuoi, 0), mau: 'var(--faint, #9ca3af)', ten: `${con.length} quỹ khác` }]
  })()
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
            <circle key={r.quy} cx={co / 2} cy={co / 2} r={rr} fill="none" stroke={r.mau} strokeWidth={day}
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} transform={`rotate(-90 ${co / 2} ${co / 2})`}
              className={`bbt-vq-lat${tro && tro !== r.quy ? ' mo' : ''}`} onClick={() => chon(r.quy)} onMouseEnter={() => setTro(r.quy)} onMouseLeave={() => setTro(null)}>
              <title>{`${r.ten}: ${moneyD(r.cuoi)}`}</title>
            </circle>
          )
          off += len
          return el
        })}
        <text x={co / 2} y={co / 2 - 10} textAnchor="middle" className="bbt-vq-nhan">{dangTro ? pct(tong ? dangTro.cuoi / tong : 0) : 'Tổng tồn quỹ'}</text>
        <text x={co / 2} y={co / 2 + 20} textAnchor="middle" className="bbt-vq-so">{short(dangTro ? dangTro.cuoi : tong)}</text>
      </svg>
      <ul className="bbt-vq-ct">
        {ds.map(r => (
          <li key={r.quy}>
            <button type="button" className={tro === r.quy ? 'on' : ''} title={r.quy === QUY_KHAC ? 'Xem danh sách tất cả quỹ' : `Xem biểu đồ thu chi ${r.quy}`} onClick={() => chon(r.quy)}
              onMouseEnter={() => setTro(r.quy)} onMouseLeave={() => setTro(null)}>
              <i style={{ background: r.mau }} />
              <span className="bbt-vq-ten"><span title={r.quy === QUY_KHAC ? undefined : r.quy}>{r.ten}</span><b>{moneyD(r.cuoi)}<small>{pct(tong ? r.cuoi / tong : 0)}</small></b></span>
              <Icon n="chevr" className="ic sm muted bbt-vq-mui" />
            </button>
          </li>
        ))}
      </ul>
      {moDs && (
        <>
          <div className="bbt-vq-ds-nen" onClick={() => setMoDs(false)} />
          <div className="bbt-vq-ds" role="dialog" aria-label="Tất cả quỹ">
            <div className="bbt-vq-ds-dau">
              <b>Tất cả quỹ ({coMau.length})</b>
              <button type="button" className="pheu-dong" title="Đóng" aria-label="Đóng" onClick={() => setMoDs(false)}><Icon n="x" className="ic sm" /></button>
            </div>
            <ul className="bbt-vq-ct">
              {[...coMau].sort((x, y) => y.cuoi - x.cuoi).map(r => (
                <li key={r.quy}>
                  <button type="button" title={`Xem biểu đồ thu chi ${r.quy}`} onClick={() => { setMoDs(false); onChon(r.quy) }}>
                    <i style={{ background: r.mau }} />
                    <span className="bbt-vq-ten"><span title={r.quy}>{r.ten}</span><b>{moneyD(r.cuoi)}<small>{pct(tong ? r.cuoi / tong : 0)}</small></b></span>
                    <Icon n="chevr" className="ic sm muted bbt-vq-mui" />
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="nut bbt-e-nut" onClick={() => { setMoDs(false); onChon(QUY_KHAC) }}>Biểu đồ thu chi tất cả quỹ ›</button>
          </div>
        </>
      )}
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

/** Trang chủ Free theo ba bài toán mẫu E (T272, T274): lọc cửa hàng; 6 thẻ biểu đồ bỏ ở T293; tab Cần theo dõi bỏ ở T309 */
export function BaBaiToanFree({ d, thang: thangXem, selCns, chonKy }: { d: TongQuanSoLieu; thang: number; selCns: string[]; chonKy?: ReactNode }) {
  const { s, set } = useSession()
  const moTuTrangChu = useMoTuTrangChu()

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

  const tenCn = useMemo(() => new Set(CUA_HANG.filter(c => cnsHien.includes(c.id)).map(c => c.ten)), [cnsHien])

  // 1. Lãi lỗ
  const nvl = nvlKy(s, cnsHien, thangXem)
  const cpThang = dHien.cpHoatDong - dHien.cpPhanBo
  const loiNhuan = dHien.dtThuan - nvl.tien - cpThang - dHien.cpPhanBo
  const bien = dHien.dtThuan > 0 ? loiNhuan / dHien.dtThuan : 0
  const laiLo13 = useMemo(() => laiLo13Thang(s, cnsHien), [s, cnsHien])

  // 2. Thu chi: số dư, thu, chi cộng từ Sổ quỹ tiền mặt, Sổ ngân hàng
  const quy = useMemo(() => [...tonQuyTheoSo(thangXem, cnsHien), ...QUY_MAU_THEM], [thangXem, cnsHien])   // T303: thêm 5 quỹ mẫu
  const tongQuy = { cuoi: quy.reduce((a, r) => a + r.cuoi, 0), thu: quy.reduce((a, r) => a + r.thu, 0), chi: quy.reduce((a, r) => a + r.chi, 0) }
  const chiLon = [...dHien.coCauCp].sort((a, b) => b.v - a.v)[0]
  const [modalQuy, setModalQuy] = useState<string | null>(null)
  const thuChi13 = useMemo(() => thuChi13Thang(cnsHien), [cnsHien])

  // 3. Kho

  // T304: ba khối Mua hàng, Công nợ phải trả NCC, Hao hụt kiểm kê
  const motCnKho = cnsHien.length === 1 ? CUA_HANG.find(c => c.id === cnsHien[0])?.ten : undefined
  const mua = useMemo(() => soLieuMua(thangXem, tenCn, dHien.dtThuan), [thangXem, tenCn, dHien.dtThuan])
  const no = useMemo(() => soLieuCongNo(thangXem, motCnKho), [thangXem, motCnKho])
  const kk = useMemo(() => soLieuKiemKe(thangXem, tenCn), [thangXem, tenCn])


  return (
    <div className="bbt bbt-e" onClickCapture={moTuTrangChu}>
      <h1 className="sr-only">Tổng quan</h1>
      <LenThanhTab>
        {chonKy}
      </LenThanhTab>

      {/* T309: bỏ tab Cần theo dõi, trang chủ Free chỉ còn Tổng quan; thanh đầu còn Thao tác nhanh (T290) */}
      <div className="bbt-thanh-dau">
        {/* T315: nhắc khoá sổ tháng trước khi chưa khoá */}
        {(KHOA_SO_DEN.nam < KY_MO.nam || (KHOA_SO_DEN.nam === KY_MO.nam && KHOA_SO_DEN.thang < KY_MO.thang - 1)) && (
          <Link to="/app/he-thong/khoa-so" className="bbt-nhac-khoa" title="Khoá sổ để chốt số liệu, phiếu trong tháng không bị sửa nhầm">
            <Icon n="lock" className="ic sm" />Tháng {KHOA_SO_DEN.thang === 12 ? 1 : KHOA_SO_DEN.thang + 1}/{KHOA_SO_DEN.thang === 12 ? KHOA_SO_DEN.nam + 1 : KHOA_SO_DEN.nam} chưa khoá sổ<b>Khoá sổ ›</b>
          </Link>
        )}
        {/* Thao tác nhanh cố định trên hàng tab, cả 2 tab (T290) */}
        <nav className="bbt-tt-nhanh" aria-label="Thao tác nhanh">
          {/* Nhãn cùng tên, cùng biểu tượng với mục Thao tác nhanh ở thanh bên để khách nhận ra */}
          <span className="bbt-tt-nhanh-nhan"><Icon n="sparkle" className="ic sm" />Thao tác nhanh</span>
          {TT_NHANH_FREE.map(m => (
            <Link key={m.ten} to={m.to} title={m.goiY} className="bbt-tt-nhanh-nut"><ONen n={m.icon} kieu="nhat" co="sm" />{m.ten}</Link>
          ))}
        </nav>
      </div>

        <>
          <div className="bbt-e-luoi bbt-e-luoi-2">   {/* hàng trên 2 cột lãi lỗ, thu chi; Quản lý kho kéo hết hàng dưới (T293) */}
        {/* Cột 1: Quản lý lãi lỗ; T303: phần số gọn lại, biểu đồ 13 tháng nằm ngay dưới */}
        <section className="bbt-cot col bbt-gon">
          <div className="bbt-e-ten-hang">
            <h2 className="ten bbt-e-ten">
              <Icon n="chart" className="ic sm" /> Kết quả kinh doanh
            </h2>
            {/* T316: mở Báo cáo kết quả kinh doanh 10.2.3 đúng tháng đang xem, như link Báo cáo ở các khối khác */}
            <span className="bbt-kho2-link">
              <Link to="/app/bao-cao/10-2-3" className="bbt-kho-mo" onClick={() => datLocDaXem('/app/bao-cao/10-2-3', {}, String(thangXem))}>Xem kết quả kinh doanh ›</Link>
            </span>
          </div>
          {/* T316: tiêu đề dùng thuật ngữ chuẩn, tiêu đề phụ giải nghĩa cho chủ chưa quen nghiệp vụ */}
          <div className="bbt-e-mota">Doanh thu trừ các khoản chi phí trong tháng</div>
          <div className="hoi bbt-e-hoi">
            Lợi nhuận {thangXem === 10 ? 'tháng này' : `tháng ${thangXem}`}
          </div>
          <div
            className={`tra bbt-tra ${loiNhuan >= 0 ? 'lai' : 'lo'}`}
            style={{ color: loiNhuan >= 0 ? 'var(--green, #138a52)' : 'var(--red, #c2362b)' }}
          >
            {loiNhuan < 0 ? `Lỗ ${moneyD(Math.abs(loiNhuan))}` : moneyD(loiNhuan)}
          </div>
          {/* Giải nghĩa biên lợi nhuận: lãi (lỗ) bao nhiêu đồng trên mỗi 100 đồng doanh thu, một chữ số lẻ (T316) */}
          <div className="phu bbt-phu bbt-e-phu">
            Biên lợi nhuận {pct(bien)} <span className="bbt-e-giai">· {bien < 0 ? 'lỗ' : 'lãi'} {Math.abs(bien * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} đ trên mỗi 100 đ doanh thu</span>
          </div>

          <div className="t dt">
            <div className="l"><b>Doanh thu</b><span>Tiền bán hàng trong tháng</span></div>
            <div className="r"><b style={{ fontSize: '17px' }}>{moneyD(d.dtThuan)}</b></div>
          </div>

          <Link
            to={`/app/trang-chu/chi-phi-nvl?thang=${thangXem}`}
            className="t cp bbt-e-the-link"
            title="Xem giá vốn nguyên vật liệu"
          >
            <div className="l">
              <b>Giá vốn nguyên vật liệu</b>
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
            title="Xem chi phí hoạt động"
          >
            <div className="l">
              <b>Chi phí hoạt động</b>
              <span>{chiLon ? `Lương, mặt bằng, điện nước… Lớn nhất: ${chiLon.l} ${short(chiLon.v)}` : 'Lương, mặt bằng, điện nước, chi khác'}</span>
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
            title="Xem chi phí phân bổ, khấu hao"
          >
            <div className="l">
              <b>Chi phí phân bổ, khấu hao</b>
              <span>Công cụ, tài sản mua một lần, ghi nhận dần theo tháng</span>
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

          {/* T303: biểu đồ lãi lỗ 13 tháng hiện thẳng trong cột, không cần bấm mở hộp */}
          <div className="bbt-13t-trong">
            <div className="bbt-13t-trong-dau">
              <div className="bbt-13t-trong-ten"><b>Hiệu quả kinh doanh 13 tháng</b><small>Doanh thu, chi phí, lợi nhuận từng tháng và so với cùng kỳ năm trước</small></div>
              <span className="bbt-13t-chu"><i className="dt" />Doanh thu<i className="cp" />Chi phí<i className="lai tron" />Lãi<i className="lo tron" />Lỗ</span>
            </div>
            <KhungVua cao={210} ve={r => <LaiLoChart data={laiLo13} h={210} rong={r} />} />
          </div>
        </section>

        {/* Cột 2: Quỹ tiền; T303: vòng tồn quỹ nhỏ lại, biểu đồ thu chi 13 tháng nằm ngay dưới */}
        <section className="bbt-cot col bbt-gon">
          <div className="bbt-e-ten-hang">
            <h2 className="ten bbt-e-ten">
              <Icon n="wallet" className="ic sm" /> Quỹ tiền
            </h2>
            {/* T303: nút Tạo quỹ luôn có ở khối Quỹ tiền */}
            <Link to="/app/danh-muc/1-12?moi=1&goiY=thuchi" className="bbt-tao-quy" title="Tạo quỹ tiền mặt hoặc tài khoản ngân hàng"><Icon n="plus" className="ic sm" />Tạo quỹ</Link>
          </div>
          <div className="bbt-e-mota">Tiền mặt tại cửa hàng và tiền gửi ngân hàng</div>
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
            {thangXem === 10 ? 'Tháng này thu' : `Tháng ${thangXem} thu`} <span style={{ color: 'var(--green, #138a52)' }}>{short(tongQuy.thu)}</span> · chi <span style={{ color: 'var(--red, #c2362b)' }}>{short(tongQuy.chi)}</span>
          </div>

          {quy.length > 0 ? <VongQuy ds={quy} tong={tongQuy.cuoi} onChon={setModalQuy} /> : (
            <div className="bbt-quy-trong">
              <Icon n="wallet" className="ic" />
              <b>Chưa có quỹ tiền nào</b>
              <span>Tạo quỹ tiền mặt hoặc tài khoản ngân hàng để lập phiếu thu, phiếu chi và theo dõi tồn quỹ.</span>
              <Link to="/app/danh-muc/1-12?moi=1&goiY=thuchi" className="btn pri"><Icon n="plus" className="ic sm" />Tạo quỹ</Link>
            </div>
          )}

          {/* T303: dòng tiền 13 tháng hiện thẳng trong cột; số tồn quỹ ở trên vẫn mở modal gộp các quỹ */}
          <div className="bbt-13t-trong">
            <div className="bbt-13t-trong-dau">
              <div className="bbt-13t-trong-ten"><b>Dòng tiền 13 tháng</b><small>Tiền thu vào, chi ra mỗi tháng và số dư quỹ cuối tháng</small></div>
              <span className="bbt-13t-chu"><i className="thu2" />Thu<i className="chi2" />Chi<i className="thuan tron" /><span title="Thu trừ chi trong tháng">Dòng tiền thuần</span><i className="ton tron" />Tồn quỹ</span>
            </div>
            <KhungVua cao={210} ve={r => <LaiLoChart data={thuChi13} h={210} rong={r} ten={['Thu', 'Chi']} mau={['var(--bd-thu, #0f8f84)', 'var(--bd-chi, #c2362b)']} duong={{ ten: 'Dòng tiền thuần' }} duong2={{ ten: 'Tồn quỹ', mau: 'var(--bd-ton, #0560a6)' }} />} />
          </div>
        </section>

        {/* Quản lý kho gộp còn 2 khối thẳng cột với hàng trên (T307): Mua hàng & công nợ NCC, Hao hụt kiểm kê */}
        <section className="bbt-cot col bbt-gon bbt-kho2">
          <div className="bbt-e-ten-hang">
            <h2 className="ten bbt-e-ten"><Icon n="khohang" className="ic sm" /> Mua hàng &amp; công nợ nhà cung cấp</h2>
            <span className="bbt-kho2-link">
              {/* Bảng kê mua hàng theo hàng hoá 4.2.7 gom theo mã hàng, dạng tổng hợp, đúng tháng đang xem (T304) */}
              <Link to="/app/bao-cao/4-2-7" className="bbt-kho-mo" onClick={() => {
                luuTuyChinh(s.donVi, '4.2.7', { ...(docTuyChinh(s.donVi, '4.2.7') ?? {}), nhom: ['ma'], xemNhom: 'tongHop' })
                datLocDaXem('/app/bao-cao/4-2-7', {}, String(thangXem))
              }}>Bảng kê ›</Link>
              <Link to="/app/bao-cao/4-2-3" className="bbt-kho-mo" onClick={() => datLocDaXem('/app/bao-cao/4-2-3', {}, String(thangXem))}>Công nợ ›</Link>
            </span>
          </div>
          <div className="bbt-e-mota">Giá trị hàng mua trong tháng và số tiền còn phải trả</div>
          <div className="bbt-kho2-hai">
            <div>
              <div className="hoi bbt-e-hoi">Giá trị mua hàng {thangXem === 10 ? 'tháng này' : `tháng ${thangXem}`}</div>
              <div className="tra bbt-tra" style={{ color: 'var(--blue, #0560a6)' }}>{moneyD(mua.nhap)}</div>
              <div className="phu bbt-phu bbt-e-phu">
                {mua.soDon} phiếu
                {mua.soSanh && <> · <span className={mua.soSanh.pct > 0 ? 'bbt-kho-tang' : 'bbt-kho-giam'} title={`So với ${mua.soSanh.nhan} (${short(mua.soSanh.truoc)})`}>{mua.soSanh.pct > 0 ? '▲' : '▼'} {pct(Math.abs(mua.soSanh.pct))} so với cùng kỳ</span></>}
              </div>
            </div>
            <div>
              <div className="hoi bbt-e-hoi">Công nợ phải trả</div>
              <div className="tra bbt-tra" style={{ color: 'var(--orange-d, #d0650a)' }}>{moneyD(no.cuoiRong)}</div>
              <div className="phu bbt-phu bbt-e-phu">{no.soNcc} nhà cung cấp</div>
            </div>
          </div>
          {/* Dòng chảy công nợ: khớp dòng Tổng cộng báo cáo 4.2.3 */}
          <div className="t"><div className="l"><b>Nợ đầu kỳ</b><span>Còn nợ từ đầu tháng</span></div><div className="r"><b>{moneyD(no.dau)}</b></div></div>
          <div className="t"><div className="l"><b>+ Phát sinh mua nợ</b><span>Mua chưa thanh toán</span></div><div className="r"><b>{moneyD(no.phatSinh)}</b></div></div>
          <div className="t"><div className="l"><b>− Đã thanh toán</b></div><div className="r"><b>{moneyD(no.traHang + no.thanhToan)}</b></div></div>
          <div className="t bbt-kho2-tong"><div className="l"><b>= Nợ cuối kỳ</b><span>Còn phải trả đến hôm nay</span></div><div className="r"><b>{moneyD(no.cuoiRong)}</b></div></div>
          <div className="bbt-kho2-ds">
            <div>
              <div className="bbt-kho-nhom">Mặt hàng mua nhiều nhất</div>
              {mua.topMh.map(x => (
                <div className="bbt-kho2-dong" key={x.ma}>
                  <span className="bbt-kho2-ten"><span className="bbt-kho-ma">{x.ma}</span>{x.ten}</span>
                  <b>{short(x.tien)}</b>
                </div>
              ))}
            </div>
            <div>
              <div className="bbt-kho-nhom">Nhà cung cấp nợ nhiều nhất</div>
              {no.top.map(x => (
                <div className="bbt-kho2-dong" key={x.ten}>
                  <span className="bbt-kho2-ten" title={x.ten}>{x.ten}</span>
                  <b>{short(x.v)}</b>
                </div>
              ))}
            </div>
          </div>
          <div className="bbt-kho-chan">
            <Link to="/app/mua-hang/4-1-1/moi" className="btn sm"><Icon n="plus" className="ic sm" />Tạo phiếu mua hàng</Link>
            <Link to="/app/tien/2-1-1/moi?loai=chi&ly=CHI02" className="btn sm"><Icon n="plus" className="ic sm" />Thanh toán nhà cung cấp</Link>
          </div>
        </section>

        <section className="bbt-cot col bbt-gon bbt-kho2">
          <div className="bbt-e-ten-hang">
            <h2 className="ten bbt-e-ten"><Icon n="khohang" className="ic sm" /> Hao hụt kiểm kê</h2>
            <span className="bbt-kho2-link">
              <Link to="/app/bao-cao/5-2-15" className="bbt-kho-mo" onClick={() => datLocDaXem('/app/bao-cao/5-2-15', {}, String(thangXem))}>Báo cáo hao hụt ›</Link>
            </span>
          </div>
          <div className="bbt-e-mota">Chênh lệch giữa tồn thực tế và tồn trên sổ sách</div>
          {/* Gói Free chỉ theo dõi số lượng, không có số tiền thừa, thiếu */}
          <div className="hoi bbt-e-hoi">Mặt hàng chênh lệch {thangXem === 10 ? 'tháng này' : `tháng ${thangXem}`}</div>
          <div className="tra bbt-tra" style={{ color: kk.thieu + kk.thua > 0 ? 'var(--red, #c2362b)' : 'var(--green, #138a52)' }}>{kk.thieu + kk.thua}</div>
          <div className="phu bbt-phu bbt-e-phu">Thiếu {kk.thieu} · thừa {kk.thua} · đã kiểm {kk.soKiem}/{kk.tongMh}</div>
          <div className="bbt-kho-nhom">Tiến độ kiểm kê theo cửa hàng</div>
          <div className="bbt-kho2-tien-do">
            {kk.theoCn.map(x => (
              <div className="bbt-kho2-cn" key={x.cn}>
                <span className="bbt-kho2-ten">{x.cn.replace(/^Phố Mây /, '')}</span>
                <span className="bbt-kho2-thanh"><i style={{ width: `${x.tong ? Math.min(100, (x.soKiem / x.tong) * 100) : 0}%` }} /></span>
                <span className="bbt-kho2-so">{x.soKiem}/{x.tong}</span>
                {x.daKiem
                  ? <span className={x.lech ? 'bbt-kho-thieu' : 'bbt-kho-giam'}>{x.lech ? `lệch ${x.lech}` : 'khớp'}</span>
                  : <span className="bbt-kho-thieu">chưa kiểm</span>}
              </div>
            ))}
          </div>
          <div className="bbt-kho2-ds">
            <div>
              <div className="bbt-kho-nhom">Thiếu nhiều nhất</div>
              {kk.topThieu.length ? kk.topThieu.map(x => (
                <div className="bbt-kho2-dong" key={x.cn + x.ma}>
                  <span className="bbt-kho2-ten" title={x.cn}><span className="bbt-kho-ma">{x.ma}</span>{x.ten}</span>
                  <b className="bbt-kho-thieu">−{Math.abs(x.lech).toLocaleString('vi-VN')} {x.dvt}</b>
                </div>
              )) : <div className="bbt-kho2-trong">Không có mặt hàng thiếu</div>}
            </div>
            <div>
              <div className="bbt-kho-nhom">Thừa nhiều nhất</div>
              {kk.topThua.length ? kk.topThua.map(x => (
                <div className="bbt-kho2-dong" key={x.cn + x.ma}>
                  <span className="bbt-kho2-ten" title={x.cn}><span className="bbt-kho-ma">{x.ma}</span>{x.ten}</span>
                  <b className="bbt-kho2-thua">+{x.lech.toLocaleString('vi-VN')} {x.dvt}</b>
                </div>
              )) : <div className="bbt-kho2-trong">Không có mặt hàng thừa</div>}
            </div>
          </div>
          <div className="bbt-kho-chan">
            <Link to="/app/kho/5-1-10/moi" className="btn sm"><Icon n="plus" className="ic sm" />Kiểm kê ngay</Link>
          </div>
        </section>
      </div>

    </>

  {modalQuy && <ModalQuy quyKey={modalQuy} thang={thangXem} selCns={cnsHien} onDong={() => setModalQuy(null)} />}
</div>
  )
}
