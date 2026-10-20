// Trang chủ gói Free theo ba bài toán: Quản lý lãi lỗ, Quản lý thu chi, Quản lý kho (T230).
// Mỗi bài toán một cột: câu hỏi chủ quán hay hỏi, số trả lời, 4 dòng chi tiết, nút đi tới màn làm việc.
// Lãi lỗ tách chi phí như Báo cáo kết quả kinh doanh bản Free (T220): bỏ thu nhập, chi phí khác khỏi lợi nhuận
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { LenThanhTab } from '../../app/ModuleTabs'
import { CUA_HANG, KHOA_SO_DEN, KY_MO } from '../../data/mock'
import { Icon, ONen } from '../../ui/Icon'
import { FigmaGradientIcon } from '../../ui/FigmaIcon'
import { Select } from '../../ui/Dropdown'
import { moneyD, pad, pct, short } from '../../ui/format'
import { tonQuyTheoSo } from './LichSuQuy'
import { soLieuCongNo, soLieuKiemKe, soLieuMua, type CotThang } from './khoFree'
import { datLocDaXem, docTuyChinh, luuTuyChinh } from '../../ui/bao-cao/tuyChinhBC'
import { tinhToanTongQuan, type TongQuanSoLieu } from './chiSo'
import { useSession, type Session } from '../../app/session'
import { LaiLoChart, trucLaiLo } from '../../ui/Charts'
import { moTaCachNgan, nvlKy } from './chi-phi-nvl'
import { useMoTuTrangChu } from '../../app/tuTrangChu'
import { useDongEsc } from '../../ui/LocNangCao'
import { ModalQuy } from './quyThuChi'
import { type LaiLoCnItem } from './soLieuBieuDoFree'
import { BieuDoCuaHangModal } from './BieuDoFree'
import { DS_QUY_TIEN_112 } from '../danh-muc/data'
import { chiPhiThangTuPhieu, phieuChiPhi, usePhieuChiPhi, type PhieuChiPhi } from './chiPhiPhieu'

// Hệ số mùa vụ quán ăn uống tháng 10/2025 đến 6/2026 so với trung bình tháng 7–9/2026: Tết (tháng 1) cao, sau Tết (tháng 2) thấp (T255)
const MUA_VU: [number, number, number][] = [   // [tháng, năm, hệ số doanh thu]
  [10, 2025, 0.9], [11, 2025, 0.94], [12, 2025, 1.08], [1, 2026, 1.16], [2, 2026, 0.74],
  [3, 2026, 0.86], [4, 2026, 0.93], [5, 2026, 0.97], [6, 2026, 1.01],
]

/** Lãi lỗ 13 tháng 10/2025–10/2026, cùng công thức thẻ Lãi lỗ: doanh thu thuần trừ chi phí NVL, chi phí hoạt động.
 *  Chi phí hoạt động tháng 7–10 cộng từ phiếu chi có lý do là chi phí cộng chi phí phân bổ, như thẻ trang chủ (T483).
 *  Dữ liệu mẫu chỉ có từ 01/07/2026: tháng 7–10 tính thật; 9 tháng trước sinh từ trung bình tháng 7–9 theo hệ số mùa vụ,
 *  NVL theo tỷ lệ doanh thu, chi phí hoạt động gần như cố định (T255) */
export function laiLo13Thang(s: Session, selCns: string[], pcp: PhieuChiPhi[] = phieuChiPhi(s)) {
  const that = [7, 8, 9, 10].map(t => {
    const d = tinhToanTongQuan(t === 10 ? 'thang-nay' : 'thang-truoc', selCns, s.cheDo, t)
    return { t, dt: d.dtThuan, nvl: nvlKy(s, selCns, t).tien, cp: chiPhiThangTuPhieu(pcp, t, selCns).tong + d.cpPhanBo }
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
/** Khung đo bề rộng cho biểu đồ. Có toiThieu: biểu đồ tự thấp xuống (không dưới toiThieu, không quá cao) cho đáy khối nằm trong màn,
 *  màn đặt tỉ lệ 150% vẫn thấy trọn hai khối đầu kể cả biểu đồ 13 tháng (T338) */
function KhungVua({ cao, ve, toiThieu }: { cao: number; ve: (rong: number, cao: number) => ReactNode; toiThieu?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [rong, setRong] = useState(0)
  const [caoVua, setCaoVua] = useState(cao)
  useEffect(() => {
    const e = ref.current
    if (!e) return
    const tinh = () => {
      setRong(Math.round(e.clientWidth))
      const khoi = e.closest<HTMLElement>('.bbt-cot'), cuon = e.closest<HTMLElement>('.main')
      if (!toiThieu || !khoi || !cuon || !window.matchMedia('(min-width: 901px)').matches) return
      // đo theo offsetTop (không lệch khi khối đang chạy hiệu ứng trượt vào, không theo vị trí cuộn)
      const dinh = (x: HTMLElement | null) => { let y = 0; for (; x; x = x.offsetParent as HTMLElement | null) y += x.offsetTop; return y }
      const tran = dinh(khoi) - dinh(cuon) + khoi.offsetHeight + 12 - cuon.clientHeight
      setCaoVua(Math.round(Math.min(cao, Math.max(toiThieu, e.offsetHeight - tran))))
    }
    const ro = new ResizeObserver(tinh)
    ro.observe(e)
    const khoi = toiThieu ? e.closest('.bbt-cot') : null
    if (khoi) ro.observe(khoi)   // khối cao lên khi số liệu, khối bên cạnh hiện đủ thì tính lại
    window.addEventListener('resize', tinh)
    return () => { ro.disconnect(); window.removeEventListener('resize', tinh) }
  }, [cao, toiThieu])
  return <div ref={ref} style={{ height: caoVua }}>{rong > 0 && ve(rong, caoVua)}</div>
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

/** Trang chủ hiện tối đa 4 cửa hàng ở Tiến độ kiểm kê, còn lại xem trong hộp (T339) */
const KK_TOI_DA = 4
type KkCn = ReturnType<typeof soLieuKiemKe>['theoCn'][number]

/** Một dòng tiến độ kiểm kê của cửa hàng; du = thêm cột số mặt hàng đã kiểm, số lệch (hộp xem tất cả) */
function DongKkCn({ x, du }: { x: KkCn; du?: boolean }) {
  return (
    <div className="bbt-kho2-cn">
      <span className="bbt-kho2-ten">{x.cn.replace(/^Phố Mây /, '')}</span>
      <span className="bbt-kho2-thanh"><i style={{ width: `${x.tong ? Math.min(100, (x.soKiem / x.tong) * 100) : 0}%` }} /></span>
      {du && <span className="bbt-kho2-so">{x.soKiem}/{x.tong}</span>}
      {du && <span className={x.lech ? 'bbt-kho-thieu' : 'bbt-kho2-so'}>{x.lech || '—'}</span>}
      {x.daKiem
        ? <span className="bbt-kho2-ngay" title={`Lần kiểm kê cuối ngày ${x.ngayCuoi}${x.lech ? `, lệch ${x.lech} mặt hàng` : ', khớp sổ sách'}`}>{x.ngayCuoi.slice(0, 5)}</span>
        : <span className="bbt-kho-thieu">chưa kiểm</span>}
    </div>
  )
}

/** Hộp đủ danh sách tiến độ kiểm kê theo cửa hàng, mở từ dòng Xem tất cả (T339) */
function HopTienDoKk({ ds, onDong }: { ds: KkCn[]; onDong: () => void }) {
  useDongEsc(onDong)
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop hop-kk-cn" role="dialog" aria-modal="true" aria-label="Tiến độ kiểm kê theo cửa hàng">
        <div className="ds-hop-dau">
          <Icon n="khohang" className="ic sm" /><b>Tiến độ kiểm kê theo cửa hàng</b>
          <span className="grow" />
          <button type="button" className="pheu-dong" title="Đóng" aria-label="Đóng" onClick={onDong}><Icon n="x" className="ic sm" /></button>
        </div>
        <div className="bbt-kho2-tien-do hop-kk-cn-than">
          <div className="bbt-kho2-cn bbt-kho2-dau"><span>Cửa hàng</span><span>Tiến độ</span><span>Đã kiểm</span><span>Mặt hàng lệch</span><span>Kiểm kê lần cuối</span></div>
          {ds.map(x => <DongKkCn key={x.cn} x={x} du />)}
        </div>
      </div>
    </div>,
    document.body,
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
          <span className="bbt-13t-chu"><i className="thu2" />Thu<i className="chi2" />Chi<i className="thuan duong" /><span title="Thu trừ chi trong tháng">Dòng tiền thuần</span><i className="ton duong" />Tồn quỹ</span>
          <button type="button" className="pheu-dong" title="Đóng" aria-label="Đóng" onClick={onDong}><Icon n="x" className="ic sm" /></button>
        </div>
        <div className="hop-13t-than">
          <div className="bbt-13t-bd">
            <LaiLoChart data={ds} ten={['Thu', 'Chi']} mau={['var(--bd-thu, #0f8f84)', 'var(--bd-chi, #c2362b)']} duong={{ ten: 'Dòng tiền thuần', mau: 'var(--bd-thuan, #e29a2e)' }} duong2={{ ten: 'Tồn quỹ', mau: 'var(--bd-ton, #0560a6)' }} />
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
      <div className={`ds-hop hop-13t ${kieuXem === 'cn' ? 'hop-13t--cn' : ''}`} role="dialog" aria-modal="true" aria-label="Biểu đồ hiệu quả kinh doanh 13 tháng">
        <div className="ds-hop-dau">
          <Icon n="chart" className="ic sm" /><b>{kieuXem === 'cn' ? `Lãi lỗ theo cửa hàng tháng ${thangXem ?? 10}/2026` : 'Hiệu quả kinh doanh 13 tháng'}</b>
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
          <span className="bbt-13t-chu"><i className="dt" />Doanh thu<i className="cp" />Chi phí<i className="ln duong" />Lợi nhuận</span>
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

/** Màu biểu đồ tròn tồn quỹ tươi theo thứ tự lát lớn tới nhỏ (T402) */
const MAU_QUY_T402 = [
  'var(--qt-1, #FFB347)',
  'var(--qt-2, #64B5F6)',
  'var(--qt-3, #4DD0A8)',
  'var(--qt-4, #FF8A65)',
  'var(--qt-5, #B39DDB)',
]
const MAU_CON_LAI = 'var(--qt-6, #CFD8DC)'

export interface QuyVongItem {
  quy: string
  tienMat: boolean
  cuoi: number
  ten: string
  mau: string
  tyLe: number
  startAngle: number
  endAngle: number
  midAngle: number
}

/** Biểu đồ tròn tồn quỹ theo Figma T495: vòng 120px + chú thích bên phải + hàng nút đáy */
const MAU_QUY_FIGMA = [
  'var(--blue, #0560a6)',
  'var(--blue2, #4f8cc4)',
  'var(--blue3, #93b8dc)',
  'var(--slate, #94a3b8)',
  'var(--cneutral, #c7d2de)',
]
const MAU_CON_LAI_FIGMA = 'var(--cneutral, #c7d2de)'

export function VongQuy({
  ds: dsGoc,
  tong,
  onChon,
  cuoi,
  kieu = 'mobile',
}: {
  ds: { quy: string; tienMat: boolean; cuoi: number }[]
  tong: number
  onChon: (quy: string) => void
  cuoi?: ReactNode
  kieu?: 'desktop' | 'mobile' | 'figma-mobile'
}) {
  const [tro, setTro] = useState<string | null>(null)
  const [moDs, setMoDs] = useState(false)

  useEffect(() => {
    if (!moDs) return
    const dong = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoDs(false)
    }
    document.addEventListener('keydown', dong)
    return () => document.removeEventListener('keydown', dong)
  }, [moDs])

  const chon = (quy: string) => {
    if (quy === 'tat-ca') setMoDs(true)
    else onChon(quy)
  }

  // Chuẩn hoá và lọc các quỹ dương
  const dsDuong = dsGoc.filter(r => r.cuoi > 0)
  const tongDuong = dsDuong.reduce((a, r) => a + r.cuoi, 0) || 1

  // Sắp xếp từ lớn tới nhỏ
  const xep = [...dsDuong]
    .map(r => ({
      ...r,
      ten: tenQuyDanhMuc(r.quy, r.tienMat),
      tyLe: r.cuoi / tongDuong,
    }))
    .sort((a, b) => b.cuoi - a.cuoi)

  const laDesktop = kieu === 'desktop'
  const laFigma = laDesktop || kieu === 'figma-mobile'
  const mauQuy = laFigma ? MAU_QUY_FIGMA : MAU_QUY_T402
  const mauConLai = laFigma ? MAU_CON_LAI_FIGMA : MAU_CON_LAI

  // Quy tắc gộp lát "Còn lại":
  // - Desktop (Figma T495): Quỹ thứ 5 trở đi gộp thành Còn lại
  // - Mobile (T402, T303): Quỹ có tỷ trọng dưới 5% gộp thành lát "Còn lại" khi có từ 6 quỹ trở lên
  const dsGop = (() => {
    if (laFigma) {
      if (xep.length > 5) {
        const top4 = xep.slice(0, 4)
        const rest = xep.slice(4)
        const cuoiCon = rest.reduce((a, r) => a + r.cuoi, 0)
        const out = top4.map((r, i) => ({ ...r, mau: mauQuy[i % mauQuy.length] }))
        out.push({
          quy: 'tat-ca',
          tienMat: false,
          cuoi: cuoiCon,
          ten: 'Còn lại',
          mau: mauConLai,
          tyLe: cuoiCon / tongDuong,
        })
        return out
      }
      return xep.map((r, i) => ({ ...r, mau: mauQuy[i % mauQuy.length] }))
    }

    if (xep.length >= 6) {
      const lon = xep.filter(r => r.tyLe >= 0.05)
      const giu = lon.slice(0, 5)
      const giuSet = new Set(giu.map(r => r.quy))
      const con = xep.filter(r => !giuSet.has(r.quy))
      const out = giu.map((r, i) => ({ ...r, mau: mauQuy[i % mauQuy.length] }))
      if (con.length > 0) {
        const cuoiCon = con.reduce((a, r) => a + r.cuoi, 0)
        out.push({
          quy: 'tat-ca',
          tienMat: false,
          cuoi: cuoiCon,
          ten: 'Còn lại',
          mau: mauConLai,
          tyLe: cuoiCon / tongDuong,
        })
      }
      return out
    }
    return xep.map((r, i) => ({ ...r, mau: mauQuy[i % mauQuy.length] }))
  })()

  // Tính góc các lát
  let start = -Math.PI / 2
  const dsLats: QuyVongItem[] = dsGop.map(r => {
    const sliceAngle = r.tyLe * 2 * Math.PI
    const end = start + sliceAngle
    const mid = start + sliceAngle / 2
    const item: QuyVongItem = {
      ...r,
      startAngle: start,
      endAngle: end,
      midAngle: mid,
    }
    start = end
    return item
  })

  const dangTro = dsLats.find(r => r.quy === tro)

  // Khung popup danh sách tất cả quỹ
  const popupDanhSach = moDs && (
    <>
      <div className="bbt-vq-ds-nen" onClick={() => setMoDs(false)} />
      <div className="bbt-vq-ds" role="dialog" aria-label="Tất cả quỹ">
        <div className="bbt-vq-ds-dau">
          <b>Tất cả quỹ ({dsGoc.length})</b>
          <button
            type="button"
            className="pheu-dong"
            title="Đóng"
            aria-label="Đóng"
            onClick={() => setMoDs(false)}
          >
            <Icon n="x" className="ic sm" />
          </button>
        </div>
        <ul className="bbt-vq-ct" style={{ maxHeight: 240, overflowY: 'auto' }}>
          {[...dsGoc]
            .sort((x, y) => y.cuoi - x.cuoi)
            .map((r, i) => (
              <li key={r.quy}>
                <button
                  type="button"
                  title={`Xem biểu đồ thu chi ${r.quy}`}
                  onClick={() => {
                    setMoDs(false)
                    onChon(r.quy)
                  }}
                >
                  <i style={{ background: mauQuy[i % mauQuy.length] }} />
                  <span className="bbt-vq-ten">
                    <span title={r.quy}>{tenQuyDanhMuc(r.quy, r.tienMat)}</span>
                    <b>
                      {moneyD(r.cuoi)}
                      <small>{pct(tong ? r.cuoi / tong : 0)}</small>
                    </b>
                  </span>
                  <Icon n="chevr" className="ic sm muted bbt-vq-mui" />
                </button>
              </li>
            ))}
        </ul>
        <button
          type="button"
          className="nut bbt-e-nut"
          onClick={() => {
            setMoDs(false)
            onChon('tat-ca')
          }}
        >
          Biểu đồ thu chi tất cả quỹ ›
        </button>
      </div>
    </>
  )

  if (kieu === 'figma-mobile') {
    const W = 116
    const H = 116
    const cx = 58
    const cy = 58
    const R = 52
    const day = 15
    const rIn = R - day

    return (
      <div className="m-figma-co-cau-quy">
        <div className="m-figma-vq-svg-wrap">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width={W}
            height={H}
            role="img"
            aria-label="Cơ cấu quỹ tiền"
          >
            <circle cx={cx} cy={cy} r={(R + rIn) / 2} fill="none" stroke="var(--line-2, #eeeeee)" strokeWidth={day} />
            {dsLats.map(r => {
              const sliceAngle = r.endAngle - r.startAngle
              const gap = dsLats.length > 1 ? 0.04 : 0
              const a1 = r.startAngle + gap / 2
              const a2 = r.endAngle - gap / 2
              const actA1 = a2 > a1 ? a1 : r.startAngle
              const actA2 = a2 > a1 ? a2 : r.endAngle

              const x1Out = cx + R * Math.cos(actA1)
              const y1Out = cy + R * Math.sin(actA1)
              const x2Out = cx + R * Math.cos(actA2)
              const y2Out = cy + R * Math.sin(actA2)
              const x1In = cx + rIn * Math.cos(actA1)
              const y1In = cy + rIn * Math.sin(actA1)
              const x2In = cx + rIn * Math.cos(actA2)
              const y2In = cy + rIn * Math.sin(actA2)
              const large = sliceAngle > Math.PI ? 1 : 0

              const pathD = `M ${x1In} ${y1In} L ${x1Out} ${y1Out} A ${R} ${R} 0 ${large} 1 ${x2Out} ${y2Out} L ${x2In} ${y2In} A ${rIn} ${rIn} 0 ${large} 0 ${x1In} ${y1In} Z`

              return (
                <path
                  key={r.quy}
                  d={pathD}
                  fill={r.mau}
                  onClick={() => chon(r.quy)}
                  style={{ cursor: 'pointer' }}
                >
                  <title>{`${r.ten}: ${moneyD(r.cuoi)} (${pct(r.tyLe)})`}</title>
                </path>
              )
            })}
            <g onClick={() => setMoDs(true)} style={{ cursor: 'pointer' }}>
              <text x={cx} y={cy - 5} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--muted, #6b7280)' }}>
                Tổng tồn quỹ
              </text>
              <text x={cx} y={cy + 13} textAnchor="middle" style={{ fontSize: 13.5, fontWeight: 700, fill: 'var(--ink, #1f2225)' }}>
                {short(tong)}
              </text>
            </g>
          </svg>
        </div>
        <div className="m-figma-vq-chuthich">
          {dsLats.map(r => (
            <div
              key={r.quy}
              className="m-figma-vq-row"
              onClick={() => chon(r.quy)}
            >
              <div className="m-figma-vq-trai">
                <span className="m-figma-vq-dot" style={{ background: r.mau }} />
                <span className="m-figma-vq-ten">{r.ten}</span>
              </div>
              <span className="m-figma-vq-pt">{pct(r.tyLe)}</span>
            </div>
          ))}
        </div>
        {popupDanhSach}
      </div>
    )
  }

  if (laDesktop) {
    // Đường kính 120, cx=60, cy=60, R=54, rIn=36 theo Figma
    const W = 120
    const H = 120
    const cx = 60
    const cy = 60
    const R = 54
    const day = 16
    const rIn = R - day

    return (
      <div className="bbt-cum-vong-quy">
        <div className="bbt-vq-hang">
          <div className="bbt-vq-svg-wrap">
            <svg
              className="bbt-vq-svg-120"
              viewBox={`0 0 ${W} ${H}`}
              width={W}
              height={H}
              role="img"
              aria-label="Biểu đồ tròn tồn quỹ theo quỹ"
            >
              {/* Nền vòng xám */}
              <circle cx={cx} cy={cy} r={(R + rIn) / 2} fill="none" stroke="var(--line-2, #eeeeee)" strokeWidth={day} />

              {/* Các lát biểu đồ tròn */}
              {dsLats.map(r => {
                const sliceAngle = r.endAngle - r.startAngle
                const gap = dsLats.length > 1 ? 0.04 : 0
                const a1 = r.startAngle + gap / 2
                const a2 = r.endAngle - gap / 2
                const actA1 = a2 > a1 ? a1 : r.startAngle
                const actA2 = a2 > a1 ? a2 : r.endAngle

                const x1Out = cx + R * Math.cos(actA1)
                const y1Out = cy + R * Math.sin(actA1)
                const x2Out = cx + R * Math.cos(actA2)
                const y2Out = cy + R * Math.sin(actA2)
                const x1In = cx + rIn * Math.cos(actA1)
                const y1In = cy + rIn * Math.sin(actA1)
                const x2In = cx + rIn * Math.cos(actA2)
                const y2In = cy + rIn * Math.sin(actA2)
                const large = sliceAngle > Math.PI ? 1 : 0

                const pathD = `M ${x1In} ${y1In} L ${x1Out} ${y1Out} A ${R} ${R} 0 ${large} 1 ${x2Out} ${y2Out} L ${x2In} ${y2In} A ${rIn} ${rIn} 0 ${large} 0 ${x1In} ${y1In} Z`

                return (
                  <path
                    key={r.quy}
                    d={pathD}
                    fill={r.mau}
                    className={`bbt-vq-lat${tro && tro !== r.quy ? ' mo' : ''}${tro === r.quy ? ' on' : ''}`}
                    onClick={() => chon(r.quy)}
                    onMouseEnter={() => setTro(r.quy)}
                    onMouseLeave={() => setTro(null)}
                  >
                    <title>{`${r.ten}: ${moneyD(r.cuoi)}`}</title>
                  </path>
                )
              })}

              {/* Chữ giữa vòng: Tổng tồn quỹ và số tiền rút gọn, bấm mở popup danh sách quỹ */}
              <g
                onClick={() => setMoDs(true)}
                style={{ cursor: 'pointer' }}
              >
                <title>Bấm để xem danh sách tất cả quỹ</title>
                <text x={cx} y={cy - 5} textAnchor="middle" className="bbt-vq-c-lbl">
                  {dangTro ? 'Tỷ trọng' : 'Tổng tồn quỹ'}
                </text>
                <text x={cx} y={cy + 13} textAnchor="middle" className="bbt-vq-c-val">
                  {dangTro ? pct(dangTro.tyLe) : short(tong)}
                </text>
              </g>
            </svg>
          </div>

          {/* Chú thích bên phải */}
          <div className="bbt-vq-chuthich">
            {dsLats.map(r => (
              <div
                key={r.quy}
                className={`bbt-vq-ct-row${tro === r.quy ? ' on' : ''}`}
                onMouseEnter={() => setTro(r.quy)}
                onMouseLeave={() => setTro(null)}
                onClick={() => chon(r.quy)}
                title={`${r.ten}: ${moneyD(r.cuoi)}`}
              >
                <span className="bbt-vq-ct-dot" style={{ background: r.mau }} />
                <span className="bbt-vq-ct-name">{r.ten}</span>
                <span className="bbt-vq-ct-val">{short(r.cuoi)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hàng nút dưới biểu đồ tròn */}
        <div className="bbt-vq-hang-nut">
          <Link to="/app/danh-muc/1-12?moi=1&goiY=thuchi" className="bbt-btn-quy bbt-btn-tao-quy" title="Tạo quỹ tiền mặt hoặc tài khoản ngân hàng">
            <Icon n="plus" className="ic sm" /> Tạo quỹ
          </Link>
          <button type="button" className="bbt-btn-quy" onClick={() => setMoDs(true)}>
            Tất cả quỹ ({dsGoc.length}) ›
          </button>
        </div>

        {popupDanhSach}
      </div>
    )
  }

  // Kích thước SVG điện thoại theo mẫu app ví (T402, T303): vòng dày 28%, khe nhỏ, nhãn ngoài vòng nối đường xám
  const W = 380
  const H = 210
  const cx = 190
  const cy = 105
  const R = 64
  const day = Math.round(R * 0.28) // Độ dày 28% bán kính (18px)
  const rIn = R - day // 46px

  // Phân chia nhãn trái / phải
  const nhanPhai = dsLats
    .filter(r => Math.cos(r.midAngle) >= 0)
    .sort((a, b) => Math.sin(a.midAngle) - Math.sin(b.midAngle))

  const nhanTrai = dsLats
    .filter(r => Math.cos(r.midAngle) < 0)
    .sort((a, b) => Math.sin(a.midAngle) - Math.sin(b.midAngle))

  const layYs = (n: number) => {
    if (n <= 0) return []
    if (n === 1) return [cy]
    const step = Math.min(42, 140 / (n - 1))
    const startY = cy - (step * (n - 1)) / 2
    return Array.from({ length: n }, (_, i) => startY + i * step)
  }

  const ysPhai = layYs(nhanPhai.length)
  const ysTrai = layYs(nhanTrai.length)

  const mapY = new Map<string, { y: number; isRight: boolean }>()
  nhanPhai.forEach((r, i) => mapY.set(r.quy, { y: ysPhai[i], isRight: true }))
  nhanTrai.forEach((r, i) => mapY.set(r.quy, { y: ysTrai[i], isRight: false }))

  return (
    <div className="bbt-vq-t402">
      <svg
        className="bbt-vq-svg"
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        role="img"
        aria-label="Biểu đồ tròn tồn quỹ theo quỹ"
      >
        {/* Nền vòng xám */}
        <circle cx={cx} cy={cy} r={(R + rIn) / 2} fill="none" stroke="var(--line-2, #eee)" strokeWidth={day} />

        {/* Các lát biểu đồ tròn */}
        {dsLats.map(r => {
          const sliceAngle = r.endAngle - r.startAngle
          const gap = dsLats.length > 1 ? 0.035 : 0
          const a1 = r.startAngle + gap / 2
          const a2 = r.endAngle - gap / 2
          const actA1 = a2 > a1 ? a1 : r.startAngle
          const actA2 = a2 > a1 ? a2 : r.endAngle

          const x1Out = cx + R * Math.cos(actA1)
          const y1Out = cy + R * Math.sin(actA1)
          const x2Out = cx + R * Math.cos(actA2)
          const y2Out = cy + R * Math.sin(actA2)
          const x1In = cx + rIn * Math.cos(actA1)
          const y1In = cy + rIn * Math.sin(actA1)
          const x2In = cx + rIn * Math.cos(actA2)
          const y2In = cy + rIn * Math.sin(actA2)
          const large = sliceAngle > Math.PI ? 1 : 0

          const pathD = `M ${x1In} ${y1In} L ${x1Out} ${y1Out} A ${R} ${R} 0 ${large} 1 ${x2Out} ${y2Out} L ${x2In} ${y2In} A ${rIn} ${rIn} 0 ${large} 0 ${x1In} ${y1In} Z`

          return (
            <path
              key={r.quy}
              d={pathD}
              fill={r.mau}
              className={`bbt-vq-lat${tro && tro !== r.quy ? ' mo' : ''}${tro === r.quy ? ' on' : ''}`}
              onClick={() => chon(r.quy)}
              onMouseEnter={() => setTro(r.quy)}
              onMouseLeave={() => setTro(null)}
            >
              <title>{`${r.ten}: ${moneyD(r.cuoi)} (${pct(r.tyLe)})`}</title>
            </path>
          )
        })}

        {/* Chữ giữa vòng: Tổng tồn quỹ và số tiền, bấm mở popup danh sách quỹ */}
        <g
          onClick={() => setMoDs(true)}
          style={{ cursor: 'pointer' }}
        >
          <title>Bấm để xem danh sách tất cả quỹ</title>
          <text x={cx} y={cy - 6} textAnchor="middle" className="bbt-vq-center-lbl">
            {dangTro ? pct(dangTro.tyLe) : 'Tổng tồn quỹ'}
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" className="bbt-vq-center-val">
            {dangTro ? moneyD(dangTro.cuoi) : short(tong)}
          </text>
        </g>

        {/* Đường nối và Nhãn ngoài vòng */}
        {dsLats.map(r => {
          const pos = mapY.get(r.quy)
          if (!pos) return null
          const { y: targetY, isRight } = pos

          const x0 = cx + (R + 3) * Math.cos(r.midAngle)
          const y0 = cy + (R + 3) * Math.sin(r.midAngle)

          let lineD = ''
          if (isRight) {
            const x1 = cx + R + 18
            const x2 = 292
            lineD = `M ${x0} ${y0} L ${Math.max(x0 + 6, x1)} ${targetY} L ${x2} ${targetY}`
          } else {
            const x1 = cx - R - 18
            const x2 = 88
            lineD = `M ${x0} ${y0} L ${Math.min(x0 - 6, x1)} ${targetY} L ${x2} ${targetY}`
          }

          const labelX = isRight ? 298 : 14
          const tenHienThi = r.ten.length > 13 ? r.ten.slice(0, 12) + '…' : r.ten

          return (
            <g
              key={`lbl-${r.quy}`}
              className={`bbt-vq-nhan-g${tro && tro !== r.quy ? ' mo' : ''}${tro === r.quy ? ' on' : ''}`}
              onClick={() => chon(r.quy)}
              onMouseEnter={() => setTro(r.quy)}
              onMouseLeave={() => setTro(null)}
            >
              <title>{`${r.ten}: ${moneyD(r.cuoi)} (${pct(r.tyLe)})`}</title>
              {/* Đường nối */}
              <path d={lineD} fill="none" className="bbt-vq-line" />

              {/* Icon quỹ (tiền mặt / ngân hàng / còn lại) */}
              <g transform={`translate(${labelX + 6}, ${targetY - 5})`}>
                {r.tienMat ? (
                  <g>
                    <rect x="-6" y="-4" width="12" height="8" rx="1.5" fill="none" stroke={r.mau} strokeWidth="1.3" />
                    <circle cx="0" cy="0" r="1.8" fill="none" stroke={r.mau} strokeWidth="1.3" />
                  </g>
                ) : r.quy === 'tat-ca' ? (
                  <g fill={r.mau}>
                    <circle cx="-3.5" cy="0" r="1.5" />
                    <circle cx="0" cy="0" r="1.5" />
                    <circle cx="3.5" cy="0" r="1.5" />
                  </g>
                ) : (
                  <g fill={r.mau}>
                    <path d="M-6 -2 L0 -5.5 L6 -2 Z" />
                    <rect x="-4.8" y="-1.2" width="1.6" height="4.5" />
                    <rect x="-0.8" y="-1.2" width="1.6" height="4.5" />
                    <rect x="3.2" y="-1.2" width="1.6" height="4.5" />
                    <rect x="-6.5" y="3.5" width="13" height="1.5" rx="0.4" />
                  </g>
                )}
              </g>

              {/* Dòng 1: % đậm cùng màu lát */}
              <text x={labelX + 18} y={targetY - 1} fill={r.mau} className="bbt-vq-nhan-pct">
                {pct(r.tyLe)}
              </text>

              {/* Dòng 2: Tên quỹ chữ xám */}
              <text x={labelX} y={targetY + 12} className="bbt-vq-nhan-ten">
                {tenHienThi}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Nút Tạo quỹ và Nút xem tất cả quỹ */}
      <div className="bbt-vq-chan">
        {cuoi}
        {dsGoc.length > 5 && (
          <button
            type="button"
            className="btn sm ghost"
            style={{ fontSize: 12, padding: '3px 8px' }}
            onClick={() => setMoDs(true)}
            title="Xem danh sách tất cả quỹ"
          >
            Tất cả quỹ ({dsGoc.length}) ›
          </button>
        )}
      </div>

      {popupDanhSach}
    </div>
  )
}

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
  // Chi phí hoạt động cộng từ phiếu chi có lý do là chi phí, khớp màn Chi phí hoạt động và danh sách Thu chi (T483)
  const pcp = usePhieuChiPhi(s)
  const cpPhieu = chiPhiThangTuPhieu(pcp, thangXem, cnsHien)
  const cpThang = cpPhieu.tong
  const loiNhuan = dHien.dtThuan - nvl.tien - cpThang - dHien.cpPhanBo
  const bien = dHien.dtThuan > 0 ? loiNhuan / dHien.dtThuan : 0
  const laiLo13 = useMemo(() => laiLo13Thang(s, cnsHien, pcp), [s, cnsHien, pcp])

  // 2. Thu chi: số dư, thu, chi cộng từ Sổ quỹ tiền mặt, Sổ ngân hàng
  const quy = useMemo(() => [...tonQuyTheoSo(thangXem, cnsHien), ...QUY_MAU_THEM], [thangXem, cnsHien])   // T303: thêm 5 quỹ mẫu
  const tongQuy = { cuoi: quy.reduce((a, r) => a + r.cuoi, 0), thu: quy.reduce((a, r) => a + r.thu, 0), chi: quy.reduce((a, r) => a + r.chi, 0) }
  const chiLon = cpPhieu.ds[0]   // lý do chi phí lớn nhất trong tháng
  const [moXemSo, setMoXemSo] = useState(false)
  const xemSoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!moXemSo) return
    const dong = (e: MouseEvent) => {
      if (xemSoRef.current && !xemSoRef.current.contains(e.target as Node)) {
        setMoXemSo(false)
      }
    }
    document.addEventListener('mousedown', dong)
    return () => document.removeEventListener('mousedown', dong)
  }, [moXemSo])

  const [modalQuy, setModalQuy] = useState<string | null>(null)
  const thuChi13 = useMemo(() => thuChi13Thang(cnsHien), [cnsHien])
  // T331: hai biểu đồ 13 tháng chừa cùng phần dưới 0 để đường 0 thẳng hàng hai bên
  const duoi0 = Math.max(trucLaiLo(laiLo13).duoi0, trucLaiLo(thuChi13, true).duoi0)

  // 3. Kho

  // T304: ba khối Mua hàng, Công nợ phải trả NCC, Hao hụt kiểm kê
  const motCnKho = cnsHien.length === 1 ? CUA_HANG.find(c => c.id === cnsHien[0])?.ten : undefined
  const mua = useMemo(() => soLieuMua(thangXem, tenCn, dHien.dtThuan), [thangXem, tenCn, dHien.dtThuan])
  const no = useMemo(() => soLieuCongNo(thangXem, motCnKho), [thangXem, motCnKho])
  const kk = useMemo(() => soLieuKiemKe(thangXem, tenCn), [thangXem, tenCn])
  // T339: cửa hàng cần chú ý lên đầu: chưa kiểm, lệch nhiều, tiến độ thấp
  const kkCn = useMemo(() => [...kk.theoCn].sort((a, b) =>
    Number(a.daKiem) - Number(b.daKiem) || b.lech - a.lech || a.soKiem / (a.tong || 1) - b.soKiem / (b.tong || 1)), [kk])
  const [moHopKk, setMoHopKk] = useState(false)


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
          {TT_NHANH_FREE.map(m => {
            const gradName = m.icon === 'cashin' ? 'thu-tien' : m.icon === 'cashout' ? 'chi-tien' : m.icon === 'truck' ? 'mua-hang' : m.icon === 'percent' ? 'ke-khai-thue' : 'nhap-kho'
            return (
              <Link key={m.ten} to={m.to} title={m.goiY} className="bbt-tt-nhanh-nut">
                <FigmaGradientIcon name={gradName} size={20} />
                <span>{m.ten}</span>
              </Link>
            )
          })}
        </nav>
      </div>

        <>
          <div className="bbt-e-luoi bbt-e-luoi-2">   {/* hàng trên 2 cột lãi lỗ, thu chi; Quản lý kho kéo hết hàng dưới (T293) */}
        {/* Cột 1: Quản lý lãi lỗ (Kết quả kinh doanh theo Figma T495) */}
        <section className="bbt-cot col bbt-gon">
          <div className="bbt-e-ten-hang">
            <div className="bbt-tieu-de-khoi">
              <FigmaGradientIcon name="bao-cao" size={24} />
              <div>
                <h2 className="ten bbt-e-ten">Kết quả kinh doanh</h2>
                <div className="bbt-e-mota">Doanh thu trừ các khoản chi phí trong tháng</div>
              </div>
            </div>
            <Link
              to="/app/bao-cao/10-2-3"
              className="bbt-btn-xem"
              onClick={() => datLocDaXem('/app/bao-cao/10-2-3', {}, String(thangXem))}
            >
              Xem Kết quả kinh doanh
            </Link>
          </div>

          <div className="bbt-o-loi-nhuan">
            <div className="hoi bbt-e-hoi">
              Lợi nhuận {thangXem === 10 ? 'tháng này' : `tháng ${thangXem}`}
            </div>
            <div
              className={`tra bbt-tra ${loiNhuan >= 0 ? 'lai' : 'lo'}`}
              style={{ color: loiNhuan >= 0 ? 'var(--green, #138a52)' : 'var(--red, #c2362b)' }}
            >
              {loiNhuan < 0 ? `Lỗ ${moneyD(Math.abs(loiNhuan))}` : moneyD(loiNhuan)}
            </div>
            <div className="phu bbt-phu bbt-e-phu">
              Biên lợi nhuận {pct(bien)} <span className="bbt-e-giai">· {bien < 0 ? 'lỗ' : 'lãi'} {Math.abs(bien * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} đ trên mỗi 100 đ doanh thu</span>
            </div>
          </div>

          <div className="bbt-bang-kqkd">
            <div className="t dt bbt-kqkd-row">
              <div className="l"><b>Doanh thu</b></div>
              <div className="r"><b style={{ color: 'var(--blue, #0560a6)' }}>{moneyD(d.dtThuan)}</b></div>
            </div>

            <Link
              to={`/app/trang-chu/chi-phi-nvl?thang=${thangXem}`}
              className="t cp bbt-e-the-link bbt-kqkd-row"
              title="Xem chi phí nguyên vật liệu"
            >
              <div className="l">
                <b>Giá vốn nguyên vật liệu</b>
                <span>{moTaCachNgan(nvl.ds)}</span>
              </div>
              <div className="r">
                <b>{moneyD(nvl.tien)}</b>
                <span className="bbt-kqkd-pct" style={{ color: 'var(--orange, #f28020)' }}>{pct(d.dtThuan > 0 ? nvl.tien / d.dtThuan : 0)}</span>
              </div>
              <Icon n="chevr" className="ic sm muted" />
            </Link>

            <Link
              to={`/app/trang-chu/chi-phi-thang?thang=${thangXem}`}
              className="t cp bbt-e-the-link bbt-kqkd-row"
              title="Xem chi phí hoạt động"
            >
              <div className="l">
                <b>Chi phí hoạt động</b>
                <span>{chiLon ? `Lớn nhất: ${chiLon.ly} ${short(chiLon.v)}` : 'Lương, mặt bằng, điện nước'}</span>
              </div>
              <div className="r">
                <b>{moneyD(cpThang)}</b>
                <span className="bbt-kqkd-pct" style={{ color: 'var(--orange, #f28020)' }}>{pct(d.dtThuan > 0 ? cpThang / d.dtThuan : 0)}</span>
              </div>
              <Icon n="chevr" className="ic sm muted" />
            </Link>

            <Link
              to="/app/ccdc/8-1-1"
              className="t cp bbt-e-the-link bbt-kqkd-row"
              title="Xem chi phí phân bổ, khấu hao"
            >
              <div className="l">
                <b>Chi phí phân bổ, khấu hao</b>
                <span>Chi phí phân bổ nhiều tháng</span>
              </div>
              <div className="r">
                <b>{moneyD(d.cpPhanBo)}</b>
                <span className="bbt-kqkd-pct" style={{ color: 'var(--orange, #f28020)' }}>{pct(d.dtThuan > 0 ? d.cpPhanBo / d.dtThuan : 0)}</span>
              </div>
              <Icon n="chevr" className="ic sm muted" />
            </Link>

            <div className={`t bbt-kqkd-row bbt-kqkd-ln ${loiNhuan >= 0 ? 'lai' : 'lo'}`}>
              <div className="l"><b>Lợi nhuận</b></div>
              <div className="r">
                <b>
                  {loiNhuan < 0 ? `Lỗ ${moneyD(Math.abs(loiNhuan))}` : moneyD(loiNhuan)}
                </b>
                <span className="bbt-kqkd-pct">{pct(bien)}</span>
              </div>
            </div>
          </div>

          {/* Biểu đồ lãi lỗ 13 tháng giữ nguyên */}
          <div className="bbt-13t-trong">
            <div className="bbt-13t-trong-dau">
              <div className="bbt-13t-trong-ten"><b>Hiệu quả kinh doanh 13 tháng</b><small>Doanh thu, chi phí, lợi nhuận từng tháng và so với cùng kỳ năm trước</small></div>
              <span className="bbt-13t-chu"><i className="dt" />Doanh thu<i className="cp" />Chi phí<i className="ln duong" />Lợi nhuận</span>
            </div>
            <KhungVua cao={210} toiThieu={120} ve={(r, h) => <LaiLoChart data={laiLo13} h={h} rong={r} duoi0={duoi0} />} />
          </div>
        </section>

        {/* Cột 2: Quỹ tiền theo Figma T495 */}
        <section className="bbt-cot col bbt-gon">
          <div className="bbt-e-ten-hang">
            <div className="bbt-tieu-de-khoi">
              <FigmaGradientIcon name="thu-tien" size={24} />
              <div>
                <h2 className="ten bbt-e-ten">Quỹ tiền</h2>
                <div className="bbt-e-mota">Tiền mặt tại cửa hàng và tiền gửi ngân hàng</div>
              </div>
            </div>
            <div className="bbt-dropdown-wrap" ref={xemSoRef}>
              <button
                type="button"
                className={`bbt-btn-xem${moXemSo ? ' on' : ''}`}
                onClick={() => setMoXemSo(!moXemSo)}
              >
                <span>Xem sổ</span>
                <Icon n="chevd" className={`ic sm bbt-chev-xem${moXemSo ? ' xoay' : ''}`} />
              </button>
              {moXemSo && (
                <div className="bbt-menu-xem">
                  <Link
                    to="/app/bao-cao/2-2-1"
                    className="bbt-menu-item"
                    onClick={() => {
                      setMoXemSo(false)
                      datLocDaXem('/app/bao-cao/2-2-1', {}, String(thangXem))
                    }}
                  >
                    Sổ quỹ tiền mặt
                  </Link>
                  <Link
                    to="/app/bao-cao/2-2-3"
                    className="bbt-menu-item"
                    onClick={() => {
                      setMoXemSo(false)
                      datLocDaXem('/app/bao-cao/2-2-3', {}, String(thangXem))
                    }}
                  >
                    Sổ ngân hàng
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="bbt-o-ton-quy">
            <div className="hoi bbt-e-hoi">
              {thangXem === 10 ? 'Tồn quỹ hiện tại' : `Tồn quỹ cuối tháng ${thangXem}/2026`}
            </div>
            <button
              type="button"
              className="bbt-o-ton-btn"
              onClick={() => setModalQuy('tat-ca')}
              title="Xem biểu đồ thu chi tất cả quỹ"
            >
              <span>{moneyD(tongQuy.cuoi)}</span>
              <Icon n="chevr" className="ic sm" />
            </button>
            <div className="phu bbt-phu bbt-e-phu">
              {thangXem === 10 ? 'Tháng này thu' : `Tháng ${thangXem} thu`}{' '}
              <span style={{ color: 'var(--green, #138a52)' }}>{short(tongQuy.thu)}</span> · chi{' '}
              <span style={{ color: 'var(--red, #c2362b)' }}>{short(tongQuy.chi)}</span>
            </div>
          </div>

          {quy.length > 0 ? (
            <VongQuy ds={quy} tong={tongQuy.cuoi} onChon={setModalQuy} kieu="desktop" />
          ) : (
            <div className="bbt-quy-trong">
              <Icon n="wallet" className="ic" />
              <b>Chưa có quỹ tiền nào</b>
              <span>Tạo quỹ tiền mặt hoặc tài khoản ngân hàng để lập phiếu thu, phiếu chi và theo dõi tồn quỹ.</span>
              <Link to="/app/danh-muc/1-12?moi=1&goiY=thuchi" className="btn pri"><Icon n="plus" className="ic sm" />Tạo quỹ</Link>
            </div>
          )}

          {/* Biểu đồ dòng tiền 13 tháng giữ nguyên */}
          <div className="bbt-13t-trong">
            <div className="bbt-13t-trong-dau">
              <div className="bbt-13t-trong-ten"><b>Dòng tiền 13 tháng</b><small>Tiền thu vào, chi ra mỗi tháng và số dư quỹ cuối tháng</small></div>
              <span className="bbt-13t-chu"><i className="thu2" />Thu<i className="chi2" />Chi<i className="thuan duong" /><span title="Thu trừ chi trong tháng">Dòng tiền thuần</span><i className="ton duong" />Tồn quỹ</span>
            </div>
            <KhungVua cao={210} toiThieu={120} ve={(r, h) => <LaiLoChart data={thuChi13} h={h} rong={r} duoi0={duoi0} ten={['Thu', 'Chi']} mau={['var(--bd-thu, #0f8f84)', 'var(--bd-chi, #c2362b)']} duong={{ ten: 'Dòng tiền thuần', mau: 'var(--bd-thuan, #e29a2e)' }} duong2={{ ten: 'Tồn quỹ', mau: 'var(--bd-ton, #0560a6)' }} />} />
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
          {/* T331: khoảng trống co giãn đẩy vùng xếp hạng xuống đáy, hai khối thẳng hàng */}
          <div className="bbt-kho2-gian" />
          <div className="bbt-kho2-ds">
            <div>
              <div className="bbt-kho-nhom">Top mua hàng</div>
              {mua.topMh.map(x => (
                <div className="bbt-kho2-dong" key={x.ma}>
                  <span className="bbt-kho2-ten"><span className="bbt-kho-ma">{x.ma}</span>{x.ten}</span>
                  <b>{short(x.tien)}</b>
                </div>
              ))}
            </div>
            <div>
              <div className="bbt-kho-nhom">Top công nợ</div>
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
            <div className="bbt-kho2-cn bbt-kho2-dau"><span /><span /><span>Kiểm kê lần cuối</span></div>
            {kkCn.slice(0, KK_TOI_DA).map(x => <DongKkCn key={x.cn} x={x} />)}
            {kkCn.length > KK_TOI_DA && (
              <div className="bbt-kho2-cn bbt-kho2-tom">
                <span>Đã kiểm {kkCn.filter(x => x.daKiem).length}/{kkCn.length} cửa hàng</span>
                <span />
                <button type="button" className="bbt-kho-mo" onClick={() => setMoHopKk(true)}>Xem tất cả ›</button>
              </div>
            )}
          </div>
          {moHopKk && <HopTienDoKk ds={kkCn} onDong={() => setMoHopKk(false)} />}
          {/* T331: khoảng trống co giãn đẩy vùng xếp hạng xuống đáy, hai khối thẳng hàng */}
          <div className="bbt-kho2-gian" />
          <div className="bbt-kho2-ds">
            <div>
              <div className="bbt-kho-nhom">Top kiểm kê thiếu</div>
              {kk.topThieu.length ? kk.topThieu.map(x => (
                <div className="bbt-kho2-dong" key={x.cn + x.ma}>
                  <span className="bbt-kho2-ten" title={x.cn}><span className="bbt-kho-ma">{x.ma}</span>{x.ten}</span>
                  <b className="bbt-kho-thieu">−{Math.abs(x.lech).toLocaleString('vi-VN')} {x.dvt}</b>
                </div>
              )) : <div className="bbt-kho2-trong">Không có mặt hàng thiếu</div>}
            </div>
            <div>
              <div className="bbt-kho-nhom">Top kiểm kê thừa</div>
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
