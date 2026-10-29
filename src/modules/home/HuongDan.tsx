// Hướng dẫn từng bước ở Trang chủ ngay sau khi khởi tạo đơn vị xong (T138): kết nối FABi hoặc Thêm đơn vị kế toán. Màn tối đi, khoanh sáng từng chỗ trên giao diện thật,
// bong bóng bên cạnh giải thích và nút Tiếp. Xem hết hoặc Bỏ qua thì đơn vị đó không thấy lại. Bước nào không thấy chỗ khoanh thì bỏ qua.
// Điện thoại dùng bộ bước riêng (BUOC_DT), gắn ở MTrangChuStandard, MTrangChu.
import { useEffect, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '../../app/session'
import { Icon } from '../../ui/Icon'
import { useLaMobile } from '../../ui/mobile/useLaMobile'

/** chon: chỗ khoanh (CSS selector), so: thứ tự khi nhiều chỗ cùng selector,
 *  lenDau: cuộn trang lên đầu thay vì cuộn tới chỗ khoanh (thanh dưới điện thoại tự ẩn khi đang cuộn xuống),
 *  nut: nút làm ngay trong bong bóng, bấm thì tắt hướng dẫn và mở màn đó */
interface Buoc { chon?: string; so?: number; lenDau?: boolean; tieuDe: string; noiDung: string; nut?: { ten: string; di: string } }

/** Theo trải nghiệm chủ quán lần đầu (vai chị Linh, PhuongXT gửi 28/10/2026): 3 bước ngắn, mỗi bước chỉ một việc nên làm ngay.
 *  Doanh thu khớp máy POS nhưng lợi nhuận còn tạm tính vì chưa ghi chi phí; két có tiền lẻ đầu ca nên cần số dư ban đầu;
 *  Kê khai thuế lần đầu mới hỏi loại hình, mã số thuế, rồi lập tờ khai theo kỳ. */
const KQKD: Omit<Buoc, 'chon' | 'so'> = {
  tieuDe: 'Doanh thu tự về từ FABi',
  noiDung: 'Doanh thu khớp báo cáo bán hàng trên máy POS. Lợi nhuận đang tạm tính, chưa trừ tiền nhà, điện, nguyên liệu bạn chưa ghi.',
  nut: { ten: 'Ghi một khoản chi', di: '/app/tien/2-1-1/moi?loai=chi' },
}
const QUY: Omit<Buoc, 'chon' | 'so'> = {
  tieuDe: 'Quỹ tiền',
  noiDung: 'Tiền mặt, chuyển khoản, QR tách riêng từng quỹ. Két có sẵn tiền lẻ đầu ca thì nhập số dư ban đầu để sổ khớp tiền thực tế.',
  nut: { ten: 'Nhập số dư két', di: '/app/danh-muc/1-12' },
}
const THUE: Omit<Buoc, 'chon' | 'so'> = {
  tieuDe: 'Kê khai thuế',
  // khớp màn Kê khai thuế gói Standard: lần đầu mở hỏi loại hình, mã số thuế (popup), sau đó là danh sách tờ khai theo kỳ, trạng thái nộp
  noiDung: 'Lần đầu mở, bạn khai loại hình kinh doanh và mã số thuế. Sau đó lập tờ khai từng kỳ từ số bán FABi, theo dõi tờ khai đã nộp, chưa nộp.',
  nut: { ten: 'Mở Kê khai thuế', di: '/app/thue/to-khai' },
}

const BUOC: Buoc[] = [
  { tieuDe: 'Chào mừng bạn đến với iPOS Accounting', noiDung: 'Xem nhanh 3 chỗ quan trọng nhất, mất chừng 30 giây.' },
  { chon: '.tq-col-12 .bbt-cot', ...KQKD },
  { chon: '.tq-col-12 .bbt-cot', so: 1, ...QUY },
  { chon: '.sb-nav a[href="#/app/thue/to-khai"]', ...THUE },
]

/** Điện thoại: Trang chủ một cột thẻ (thẻ 0 là Thao tác nhanh), Kê khai thuế nằm trong Thao tác nhanh */
const BUOC_DT: Buoc[] = [
  BUOC[0],
  { chon: '.m-tcf-figma-card', so: 1, ...KQKD },
  { chon: '.m-tcf-figma-card', so: 2, ...QUY },
  { chon: '.m-tcf-nhanh-muc[href="#/app/thue/to-khai"]', ...THUE },
]

/** Bấm Bỏ qua: trước khi tắt, chỉ vào nút Xem lại hướng dẫn trên Trang chủ (PhuongXT 29/10/2026) */
const NUT_XEM_LAI: Buoc = { chon: '[aria-label="Xem lại hướng dẫn"]', tieuDe: 'Xem lại hướng dẫn ở đây', noiDung: 'Bấm nút này bất cứ lúc nào để xem lại hướng dẫn từ đầu.' }

const LE = 6        // khoảng hở quanh chỗ khoanh
const RONG = 320    // bề rộng bong bóng
/** Trang có zoom ở thẻ html (vd 0.9): toạ độ đo được phải chia zoom mới đặt đúng bằng left, top */
const zoom = () => parseFloat(getComputedStyle(document.documentElement).zoom) || 1
const timEl = (b: Buoc) => b.chon ? document.querySelectorAll(b.chon)[b.so ?? 0] : undefined
const doRect = (b: Buoc) => {
  const r = timEl(b)?.getBoundingClientRect()
  if (!r) return null
  const z = zoom()
  return new DOMRect(r.left / z, r.top / z, r.width / z, r.height / z)
}

const SU_KIEN = 'iacc-xem-huong-dan'
/** Nút Xem lại hướng dẫn trên Trang chủ: mở lại từ bước chào, đơn vị nào cũng xem được */
export function moLaiHuongDan() { window.dispatchEvent(new Event(SU_KIEN)) }

/** Hướng dẫn đang tạm dừng, chờ chạy tiếp ở Tổng quan: bấm Bắt đầu ở Bàn làm việc, hoặc bấm nút làm ngay (Ghi một khoản chi…)
 *  rồi mở màn khác. Lưu ở sessionStorage để màn khác hiện nút Tiếp tục hướng dẫn (TiepHuongDan), tải lại trang vẫn còn */
interface Tiep { dv: string; b: number; moLai: boolean }
const KHOA_TIEP = 'iacc-huong-dan-tiep'
const SU_KIEN_TIEP = 'iacc-huong-dan-tiep'
const docTiep = (): Tiep | null => { try { return JSON.parse(sessionStorage.getItem(KHOA_TIEP) || 'null') } catch { return null } }
function luuTiep(t: Tiep | null) {
  try { if (t) sessionStorage.setItem(KHOA_TIEP, JSON.stringify(t)); else sessionStorage.removeItem(KHOA_TIEP) } catch { /* trình duyệt chặn lưu thì thôi */ }
  window.dispatchEvent(new Event(SU_KIEN_TIEP))
}
const TRANG_HD = '/app/trang-chu/tong-quan'   // trang có đủ chỗ khoanh

/** Hiện khi đơn vị đang chọn vừa khởi tạo xong, chưa xem hướng dẫn (huongDan[đơn vị] === false). sang: trang này không có các khối để khoanh (Bàn làm việc),
 *  chỉ hiện bước chào, bấm Bắt đầu thì chuyển sang trang đó */
export function HuongDan({ sang }: { sang?: string }) {
  const { s, set } = useSession()
  const nav = useNavigate()
  const laMobile = useLaMobile()
  // đang tạm dừng thì chạy tiếp từ bước đã lưu; Bàn làm việc (sang) không có chỗ khoanh nên để nút Tiếp tục hướng dẫn đưa sang Tổng quan
  // đọc trong useState, xoá ở useEffect: chế độ dev gọi hàm khởi tạo 2 lần, xoá ngay thì lần sau đọc rỗng
  const [tiep] = useState(() => { const t = docTiep(); return !t || t.dv !== s.donVi || sang ? null : t })
  useEffect(() => { if (tiep) luuTiep(null) }, [])   // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(tiep?.b ?? 0)
  const [o, setO] = useState<DOMRect | null>(null)
  const [moLai, setMoLai] = useState(tiep?.moLai ?? false)   // bấm nút Xem lại hướng dẫn
  const [nhacNut, setNhacNut] = useState(false)   // đã bấm Bỏ qua, đang chỉ vào nút Xem lại hướng dẫn
  const dangDung = !!sang && docTiep()?.dv === s.donVi
  useEffect(() => {
    const mo = () => { setI(0); setNhacNut(false); setMoLai(true) }
    window.addEventListener(SU_KIEN, mo)
    return () => window.removeEventListener(SU_KIEN, mo)
  }, [])
  // trình duyệt do máy điều khiển (tools/kiem_tra.py) thì không hiện, để lớp tối không chặn bấm
  const hien = s.loggedIn && (moLai || s.huongDan?.[s.donVi] === false) && !navigator.webdriver && !dangDung
  const ds = laMobile ? BUOC_DT : BUOC
  const b = nhacNut ? NUT_XEM_LAI : ds[i]

  // tìm chỗ khoanh, cuộn tới; trang chủ vẽ chậm thì thử lại vài lần, không thấy thì sang bước sau
  useLayoutEffect(() => {
    if (!hien) return
    if (!b.chon) { setO(null); return }
    let lan = 0, t = 0
    const tim = () => {
      const el = timEl(b)
      if (el) {
        // điện thoại cuộn trong khung .m-than; cuộn lên thì thanh dưới hiện lại
        // cuộn 2 lần: lần cuộn trước còn chờ khung hình thì thanh dưới có thể ẩn lại sau lần đầu
        if (b.lenDau) { const len = () => document.querySelectorAll('.m-than, html').forEach(k => k.scrollTo({ top: 0 })); len(); t = window.setTimeout(len, 150) }
        else {
          // khối cao hơn nửa màn: cuộn cho đầu khối nằm dưới thanh trên và thanh tab (dính trên cùng), không để tiêu đề bị che
          const cao = el.getBoundingClientRect().height > window.innerHeight * 0.5
          if (cao) (el as HTMLElement).style.scrollMarginTop = '110px'
          el.scrollIntoView({ block: cao ? 'start' : 'center' })
        }
        setO(doRect(b)); return
      }
      if (++lan < 6) t = window.setTimeout(tim, 150)
      else if (nhacNut) xong()   // trang không có nút Xem lại thì tắt luôn
      else setI(x => Math.min(x + 1, ds.length - 1))
    }
    tim()
    return () => clearTimeout(t)
  }, [hien, i, nhacNut])   // eslint-disable-line react-hooks/exhaustive-deps

  // bám theo chỗ khoanh mỗi khung hình: cuộn, đổi cỡ, hiệu ứng trang làm nó dịch chuyển
  useEffect(() => {
    if (!hien || !b.chon) return
    let f = 0
    const bam = () => {
      const r = doRect(b)
      if (r) setO(o => o && o.left === r.left && o.top === r.top && o.width === r.width && o.height === r.height ? o : r)
      f = requestAnimationFrame(bam)
    }
    f = requestAnimationFrame(bam)
    return () => cancelAnimationFrame(f)
  }, [hien, i, nhacNut])   // eslint-disable-line react-hooks/exhaustive-deps

  const xong = () => { setMoLai(false); setNhacNut(false); set({ huongDan: { ...s.huongDan, [s.donVi]: true } }) }
  if (!hien) return null
  // đơn vị vừa kết nối từ FABi: câu chào nói thêm dữ liệu FABi đã về sổ
  const loiChao = s.choKeKhai?.[s.donVi] ? `Doanh thu và thu chi từ FABi đã về sổ. ${b.noiDung}` : b.noiDung
  const cuoi = i === ds.length - 1

  // bong bóng: phải, trái, dưới, trên chỗ khoanh, chỗ nào đủ chỗ trước; khối to chiếm gần hết màn thì đặt ở đáy màn
  let viTri: React.CSSProperties = {}
  if (b.chon && o) {
    const W = window.innerWidth / zoom(), H = window.innerHeight / zoom()
    const doc = Math.max(12, Math.min(o.top, H - 220)), ngang = Math.max(12, Math.min(o.left, W - RONG - 12))
    if (o.right + LE + 14 + RONG < W) viTri = { left: o.right + LE + 14, top: doc }
    else if (o.left - LE - 14 - RONG > 0) viTri = { left: o.left - LE - 14 - RONG, top: doc }
    else if (o.bottom + LE + 200 < H) viTri = { top: o.bottom + LE + 12, left: ngang }
    else if (o.top - LE - 200 > 0) viTri = { bottom: H - o.top + LE + 12, left: ngang }
    else viTri = { bottom: 12, left: Math.max(12, (W - RONG) / 2) }   // khối cao gần hết màn: bong bóng ở đáy, chừa phần trên có con số
  }

  // gắn vào body: khung trang chủ có transform nên position: fixed bên trong bị lệch
  return createPortal(
    <div className="hdan" role="dialog" aria-label="Hướng dẫn sử dụng">
      {b.chon && o
        ? <div className="hdan-lo" style={{ left: o.left - LE, top: o.top - LE, width: o.width + LE * 2, height: o.height + LE * 2 }} />
        : <div className="hdan-toi" />}
      <div className={`hdan-bong ${b.chon ? '' : 'giua'}`} style={viTri}>
        {!b.chon && <div className="hdan-bong-ic"><Icon n="check" className="ic" /></div>}
        <b>{b.tieuDe}</b>
        <p>{i === 0 && !nhacNut ? loiChao : b.noiDung}</p>
        {!nhacNut && b.nut && <button className="btn sm hdan-lam" onClick={() => { if (cuoi) xong(); else luuTiep({ dv: s.donVi, b: i + 1, moLai }); nav(b.nut!.di) }}>{b.nut.ten}<Icon n="arrow" className="ic sm" /></button>}
        {nhacNut ? (
          <div className="row hdan-nut"><span className="grow" /><button className="btn pri sm" onClick={xong}>Đã hiểu</button></div>
        ) : (
        <div className="row hdan-nut">
          {i > 0 && <span className="muted hdan-dem">{i}/{ds.length - 1}</span>}
          <span className="grow" />
          {!cuoi && <button className="btn ghost sm" onClick={() => setNhacNut(true)}>Bỏ qua</button>}
          {i > 1 && <button className="btn sm" onClick={() => setI(i - 1)}>Quay lại</button>}
          <button className="btn pri sm" onClick={cuoi ? xong : i === 0 && sang ? () => { luuTiep({ dv: s.donVi, b: 1, moLai }); nav(sang) } : () => setI(i + 1)}>{i === 0 ? 'Bắt đầu' : cuoi ? 'Bắt đầu dùng' : 'Tiếp'}</button>
        </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

/** Nút nổi Tiếp tục hướng dẫn ở mọi màn khi hướng dẫn đang tạm dừng (bấm nút làm ngay rồi sang màn khác).
 *  Gắn ở OnboardFabi (có trong Shell, MobileShell). Ở Tổng quan thì ẩn vì hướng dẫn tự chạy tiếp ở đó */
export function TiepHuongDan() {
  const { s, set } = useSession()
  const nav = useNavigate()
  const laMobile = useLaMobile()
  const { pathname } = useLocation()
  const [t, setT] = useState(docTiep)
  useEffect(() => {
    const doc = () => setT(docTiep())
    window.addEventListener(SU_KIEN_TIEP, doc)
    return () => window.removeEventListener(SU_KIEN_TIEP, doc)
  }, [])
  if (!t || t.dv !== s.donVi || pathname.startsWith(TRANG_HD) || navigator.webdriver) return null
  const tong = (laMobile ? BUOC_DT : BUOC).length - 1
  const thoi = () => { luuTiep(null); set({ huongDan: { ...s.huongDan, [s.donVi]: true } }) }
  return createPortal(
    <div className="hdan-tiep" role="status">
      <button className="btn pri sm" onClick={() => nav(TRANG_HD)}>Tiếp tục hướng dẫn ({t.b}/{tong})<Icon n="arrow" className="ic sm" /></button>
      <button className="btn ghost sm" title="Tắt hướng dẫn" aria-label="Tắt hướng dẫn" onClick={thoi}><Icon n="x" className="ic sm" /></button>
    </div>,
    document.body,
  )
}
