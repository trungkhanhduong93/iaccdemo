// Hướng dẫn từng bước ở Trang chủ ngay sau khi khởi tạo đơn vị xong (T138): kết nối FABi hoặc Thêm đơn vị kế toán. Màn tối đi, khoanh sáng từng chỗ trên giao diện thật,
// bong bóng bên cạnh giải thích và nút Tiếp. Xem hết hoặc Bỏ qua thì đơn vị đó không thấy lại. Bước nào không thấy chỗ khoanh thì bỏ qua.
// Điện thoại dùng bộ bước riêng (BUOC_DT), gắn ở MTrangChuStandard, MTrangChu.
import { useEffect, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '../../app/session'
import { Icon } from '../../ui/Icon'
import { useLaMobile } from '../../ui/mobile/useLaMobile'
import { heSoZoom } from '../../ui/zoom'

/** chon: chỗ khoanh (CSS selector), so: thứ tự khi nhiều chỗ cùng selector,
 *  lenDau: cuộn trang lên đầu thay vì cuộn tới chỗ khoanh (thanh dưới điện thoại tự ẩn khi đang cuộn xuống),
 *  nut: nút làm ngay trong bong bóng, bấm thì tạm dừng hướng dẫn và mở màn đó; viec: màn đó lưu xong thì về Trang chủ khen (KHEN) rồi chạy tiếp;
 *  chonKhen: chỗ khoanh lúc khen, hẹp hơn chon (vd đúng dòng Chi phí hoạt động); không có thì khoanh như chon */
type Viec = 'chi' | 'quy' | 'thue'
interface Buoc { chon?: string; so?: number; lenDau?: boolean; tieuDe: string; noiDung: string; nut?: { ten: string; di: string }; viec?: Viec; chonKhen?: string }

/** Theo trải nghiệm chủ quán lần đầu (vai chị Linh, PhuongXT gửi 28/10/2026): 3 bước ngắn, mỗi bước chỉ một việc nên làm ngay.
 *  Doanh thu khớp máy POS nhưng lợi nhuận còn tạm tính vì chưa ghi chi phí; két có tiền lẻ đầu ca nên cần số dư ban đầu;
 *  Kê khai thuế lần đầu mới hỏi loại hình, mã số thuế, rồi lập tờ khai theo kỳ. */
const KQKD: Omit<Buoc, 'chon' | 'so'> = {
  tieuDe: 'Doanh thu tự về từ FABi',
  noiDung: 'Doanh thu khớp báo cáo bán hàng trên máy POS. Lợi nhuận đang tạm tính, chưa trừ tiền nhà, điện, nguyên liệu bạn chưa ghi.',
  nut: { ten: 'Ghi một khoản chi', di: '/app/tien/2-1-1/moi?loai=chi' },
  viec: 'chi',
}
const QUY: Omit<Buoc, 'chon' | 'so'> = {
  tieuDe: 'Quỹ tiền',
  noiDung: 'Tiền mặt, chuyển khoản, QR tách riêng từng quỹ. Két có sẵn tiền lẻ đầu ca thì nhập số dư ban đầu để sổ khớp tiền thực tế.',
  // mở thẳng form quỹ tiền mặt cửa hàng đầu (Danh mục Quỹ tiền gói Standard có ô Số dư ban đầu)
  nut: { ten: 'Nhập số dư quỹ', di: '/app/danh-muc/1-12?mo=TM01' },
  viec: 'quy',
}
const THUE: Omit<Buoc, 'chon' | 'so'> = {
  tieuDe: 'Kê khai thuế',
  // khớp màn Kê khai thuế gói Standard: lần đầu mở hỏi loại hình, mã số thuế (popup), sau đó là danh sách tờ khai theo kỳ, trạng thái nộp
  noiDung: 'Lần đầu mở, bạn khai loại hình kinh doanh và mã số thuế. Sau đó lập tờ khai từng kỳ từ số bán FABi, theo dõi tờ khai đã nộp, chưa nộp.',
  nut: { ten: 'Mở Kê khai thuế', di: '/app/thue/to-khai' },
  viec: 'thue',
}

/** Làm xong việc của nút làm ngay (lưu phiếu chi, lưu số dư quỹ, nộp tờ khai): về Trang chủ, khoanh lại đúng khối đó và khen (PhuongXT 29/10/2026).
 *  ten: lý do khoản chi, số dư quỹ, kỳ tờ khai do màn đó truyền sang */
const KHEN: Record<Viec, (ten: string) => { tieuDe: string; noiDung: string }> = {
  chi: ten => ({
    tieuDe: `Tuyệt vời, bạn đã thêm chi phí${ten ? ` ${ten}` : ''}`,
    noiDung: 'Chi phí hoạt động của bạn đã được ghi nhận vào đây. Lợi nhuận tháng này đã trừ khoản vừa ghi, sát với tiền lãi thực tế hơn. Ghi đủ tiền nhà, điện, nguyên liệu để biết quán lãi thật bao nhiêu.',
  }),
  quy: ten => ({
    tieuDe: 'Tuyệt vời, quỹ của bạn đã có số dư',
    noiDung: `Số dư ban đầu${ten ? ` ${ten}` : ''} đã vào tồn quỹ. Từ nay tiền bán hàng thu từ FABi và các khoản chi bạn ghi sẽ phát sinh trên quỹ này, tồn quỹ khớp tiền trong két.`,
  }),
  // ten rỗng: khai xong thông tin kinh doanh rồi bấm Bỏ qua ở danh sách tờ khai (GoiYKeKhai), chưa lập tờ khai
  thue: ten => ten ? {
    tieuDe: 'Tuyệt vời, bạn đã hoàn thành tờ khai thuế',
    noiDung: `Tờ khai ${ten} đã ghi nhận nộp cơ quan thuế. Kỳ sau mở Kê khai thuế ở đây, doanh thu từ FABi tự điền vào tờ khai mới.`,
  } : {
    tieuDe: 'Tuyệt vời, thông tin kê khai thuế đã sẵn sàng',
    noiDung: 'Đến kỳ kê khai, mở Kê khai thuế ở đây để lập tờ khai. Doanh thu từ FABi tự điền, thuế GTGT, TNCN tự tính.',
  },
}

const BUOC: Buoc[] = [
  { tieuDe: 'Chào mừng bạn đến với iPOS Accounting', noiDung: 'Xem nhanh 3 chỗ quan trọng nhất, mất chừng 30 giây.' },
  { chon: '.tq-col-12 .bbt-cot', ...KQKD, chonKhen: '.tq-col-12 .bbt-kqkd-row[title="Xem chi phí hoạt động"]' },
  { chon: '.tq-col-12 .bbt-cot', so: 1, ...QUY, chonKhen: '.tq-col-12 .bbt-o-ton-quy' },
  { chon: '.sb-nav a[href="#/app/thue/to-khai"]', ...THUE },
]

/** Điện thoại: Trang chủ một cột thẻ (thẻ 0 là Thao tác nhanh), Kê khai thuế nằm trong Thao tác nhanh */
const BUOC_DT: Buoc[] = [
  BUOC[0],
  { chon: '.m-tcf-figma-card', so: 1, ...KQKD, chonKhen: '.m-tcf-kqkd-hang-link[title="Xem chi phí hoạt động"]' },
  { chon: '.m-tcf-figma-card', so: 2, ...QUY },
  { chon: '.m-tcf-nhanh-muc[href="#/app/thue/to-khai"]', ...THUE },
]

/** Màn cuối, giữa màn hình, không khoanh: đã đi hết các bước (PhuongXT 29/10/2026) */
const KET: Buoc = {
  tieuDe: 'Bạn đã sẵn sàng dùng iPOS Accounting',
  noiDung: 'Doanh thu từ FABi tự về sổ mỗi ngày. Ghi khoản chi, theo dõi quỹ, kê khai thuế ngay từ Trang chủ. Muốn xem lại hướng dẫn, bấm nút la bàn trên Trang chủ.',
}

/** Bấm Bỏ qua: trước khi tắt, chỉ vào nút Xem lại hướng dẫn trên Trang chủ (PhuongXT 29/10/2026) */
const NUT_XEM_LAI: Buoc = { chon: '[aria-label="Xem lại hướng dẫn"]', tieuDe: 'Xem lại hướng dẫn ở đây', noiDung: 'Bấm nút này bất cứ lúc nào để xem lại hướng dẫn từ đầu.' }

const LE = 6        // khoảng hở quanh chỗ khoanh
const RONG = 320    // bề rộng bong bóng
/** Trang có zoom ở thẻ html (vd 0.9, xem docs/BAY.md): toạ độ đo được phải chia zoom mới đặt đúng bằng left, top */
const zoom = heSoZoom
const timEl = (b: Buoc) => b.chon ? document.querySelectorAll(b.chon)[b.so ?? 0] : undefined
const doRect = (b: Buoc) => {
  const r = timEl(b)?.getBoundingClientRect()
  if (!r) return null
  const z = zoom()
  return new DOMRect(r.left / z, r.top / z, r.width / z, r.height / z)
}

/** Bong bóng: phải, trái, dưới, trên chỗ khoanh, chỗ nào đủ chỗ trước; khối to chiếm gần hết màn thì đặt ở đáy màn.
 *  cao: chiều cao bong bóng đo thật (điện thoại chữ to, bong bóng cao hơn 200 thì tràn khỏi đáy màn).
 *  Cao màn lấy visualViewport: Safari điện thoại có thanh địa chỉ, thanh công cụ che một phần innerHeight */
function viTriBong(o: DOMRect, cao = 200): React.CSSProperties {
  const z = zoom(), W = window.innerWidth / z, H = (window.visualViewport?.height ?? window.innerHeight) / z
  const doc = Math.max(12, Math.min(o.top, H - cao - 12)), ngang = Math.max(12, Math.min(o.left, W - RONG - 12))
  if (o.right + LE + 14 + RONG < W) return { left: o.right + LE + 14, top: doc }
  if (o.left - LE - 14 - RONG > 0) return { left: o.left - LE - 14 - RONG, top: doc }
  if (o.bottom + LE + 12 + cao + 12 < H) return { top: o.bottom + LE + 12, left: ngang }
  if (o.top - LE - 12 - cao - 12 > 0) return { top: o.top - LE - 12 - cao, left: ngang }
  return { top: Math.max(12, H - cao - 12), left: Math.max(12, (W - RONG) / 2) }   // khối cao gần hết màn: bong bóng ở đáy, chừa phần trên có con số
}

/** Đo chiều cao bong bóng sau khi vẽ, để viTriBong đặt không tràn màn */
function useCaoBong() {
  const [cao, setCao] = useState(200)
  const ref = (el: HTMLDivElement | null) => { if (el && Math.abs(el.offsetHeight - cao) > 2) setCao(el.offsetHeight) }
  return [cao, ref] as const
}

/** Cuộn tới chỗ khoanh: chỉ cuộn khung chứa nó (danh sách cuộn ngang, khung .m-than), không để cả trang lệch ngang.
 *  scrollIntoView cuộn mọi khung cha kể cả html; trang điện thoại hơi rộng hơn màn thì bị đẩy sang trái, khung khoanh lệch */
function cuonToi(el: Element, o: ScrollIntoViewOptions) {
  el.scrollIntoView(o)
  const goc = document.scrollingElement
  if (goc && goc.scrollLeft) goc.scrollLeft = 0
  document.querySelectorAll<HTMLElement>('.m-than, .m-tc-man, body').forEach(k => { if (k.scrollLeft) k.scrollLeft = 0 })
}

const SU_KIEN = 'iacc-xem-huong-dan'
/** Nút Xem lại hướng dẫn trên Trang chủ: mở lại từ bước chào, đơn vị nào cũng xem được */
export function moLaiHuongDan() { window.dispatchEvent(new Event(SU_KIEN)) }

/** Hướng dẫn đang tạm dừng, chờ chạy tiếp ở Tổng quan: bấm Bắt đầu ở Bàn làm việc, hoặc bấm nút làm ngay (Ghi một khoản chi…)
 *  rồi mở màn khác. Lưu ở sessionStorage để màn khác hiện nút Tiếp tục hướng dẫn (TiepHuongDan), tải lại trang vẫn còn */
interface Tiep { dv: string; b: number; moLai: boolean; cho?: Viec; khen?: { viec: Viec; ten: string } }   // cho: đang chờ màn làm ngay lưu xong; khen: đã lưu, về Trang chủ khen trước
const KHOA_TIEP = 'iacc-huong-dan-tiep'
const SU_KIEN_TIEP = 'iacc-huong-dan-tiep'
const docTiep = (): Tiep | null => { try { return JSON.parse(sessionStorage.getItem(KHOA_TIEP) || 'null') } catch { return null } }
function luuTiep(t: Tiep | null) {
  try { if (t) sessionStorage.setItem(KHOA_TIEP, JSON.stringify(t)); else sessionStorage.removeItem(KHOA_TIEP) } catch { /* trình duyệt chặn lưu thì thôi */ }
  window.dispatchEvent(new Event(SU_KIEN_TIEP))
}
const TRANG_HD = '/app/trang-chu/tong-quan'   // trang có đủ chỗ khoanh

/** Gọi ở màn làm ngay khi lưu xong (phiếu chi, số dư quỹ, nộp tờ khai). Hướng dẫn của đơn vị dv đang chờ việc này thì về Trang chủ khen
 *  rồi chạy tiếp, trả true để màn đó thôi chuyển trang của mình */
export function xongViecHuongDan(viec: Viec, ten: string, dv: string, di: (to: string) => void) {
  const t = docTiep()
  if (!t || t.dv !== dv || t.cho !== viec || navigator.webdriver) return false
  luuTiep({ dv: t.dv, b: t.b, moLai: t.moLai, khen: { viec, ten } })
  di(TRANG_HD)
  return true
}

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
  const [khen, setKhen] = useState(tiep?.khen ?? null)
  const ds = laMobile ? BUOC_DT : BUOC
  const hetSauKhen = (tiep?.b ?? 0) >= ds.length   // việc vừa xong là bước cuối: khen xong thì kết thúc
  // đã qua bước Kê khai thuế (bấm Mở Kê khai thuế) mà chưa nộp tờ khai, quay lại Trang chủ: không lặp bước đó, hiện màn Bắt đầu dùng (KET)
  const [ket, setKet] = useState(!tiep?.khen && hetSauKhen)
  const [i, setI] = useState(Math.min(tiep?.b ?? 0, ds.length - 1))
  const [o, setO] = useState<DOMRect | null>(null)
  const [caoBong, refBong] = useCaoBong()
  const [moLai, setMoLai] = useState(tiep?.moLai ?? false)   // bấm nút Xem lại hướng dẫn
  const [nhacNut, setNhacNut] = useState(false)   // đã bấm Bỏ qua, đang chỉ vào nút Xem lại hướng dẫn
  const dangDung = !!sang && docTiep()?.dv === s.donVi
  useEffect(() => {
    const mo = () => { setI(0); setNhacNut(false); setKhen(null); setKet(false); setMoLai(true) }
    window.addEventListener(SU_KIEN, mo)
    return () => window.removeEventListener(SU_KIEN, mo)
  }, [])
  // trình duyệt do máy điều khiển (tools/kiem_tra.py) thì không hiện, để lớp tối không chặn bấm
  const hien = s.loggedIn && (moLai || s.huongDan?.[s.donVi] === false) && !navigator.webdriver && !dangDung
  // bước khen: khoanh đúng khối của việc vừa làm (bước có cùng viec), chữ theo KHEN
  const buocKhen = khen ? ds.find(x => x.viec === khen.viec) : undefined
  const b: Buoc = nhacNut ? NUT_XEM_LAI : khen && buocKhen
    ? { ...(buocKhen.chonKhen ? { chon: buocKhen.chonKhen } : { chon: buocKhen.chon, so: buocKhen.so }), ...KHEN[khen.viec](khen.ten) } : ket ? KET : ds[i]

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
          cuonToi(el, { block: cao ? 'start' : 'center', inline: 'nearest' })
        }
        setO(doRect(b)); return
      }
      if (++lan < 6) t = window.setTimeout(tim, 150)
      else if (nhacNut) xong()   // trang không có nút Xem lại thì tắt luôn
      else if (khen) tiepSauKhen()
      else setI(x => Math.min(x + 1, ds.length - 1))
    }
    tim()
    return () => clearTimeout(t)
  }, [hien, i, nhacNut, khen])   // eslint-disable-line react-hooks/exhaustive-deps

  // bám theo chỗ khoanh mỗi khung hình: cuộn, đổi cỡ, hiệu ứng trang làm nó dịch chuyển
  useEffect(() => {
    if (!hien || !b.chon) return
    let f = 0
    const bam = () => {
      const r = doRect(b)
      if (r) setO(o => o && o.left === r.left && o.top === r.top && o.width === r.width && o.height === r.height ? o : r)
      f = requestAnimationFrame(bam)
    }
    bam()   // đo ngay, không chờ khung hình đầu (tab chạy nền thì requestAnimationFrame đứng)
    return () => cancelAnimationFrame(f)
  }, [hien, i, nhacNut, khen])   // eslint-disable-line react-hooks/exhaustive-deps

  const xong = () => { setMoLai(false); setNhacNut(false); setKhen(null); set({ huongDan: { ...s.huongDan, [s.donVi]: true } }) }
  const tiepSauKhen = () => { if (hetSauKhen) xong(); else setKhen(null) }
  if (!hien) return null
  // đơn vị vừa kết nối từ FABi: câu chào nói thêm dữ liệu FABi đã về sổ
  const loiChao = s.choKeKhai?.[s.donVi] ? `Doanh thu và thu chi từ FABi đã về sổ. ${b.noiDung}` : b.noiDung
  const cuoi = i === ds.length - 1

  const viTri = b.chon && o ? viTriBong(o, caoBong) : {}

  // gắn vào body: khung trang chủ có transform nên position: fixed bên trong bị lệch
  return createPortal(
    <div className="hdan" role="dialog" aria-label="Hướng dẫn sử dụng">
      {b.chon && o
        ? <div className="hdan-lo" style={{ left: o.left - LE, top: o.top - LE, width: o.width + LE * 2, height: o.height + LE * 2 }} />
        : <div className="hdan-toi" />}
      <div ref={refBong} className={`hdan-bong ${b.chon ? '' : 'giua'}`} style={viTri}>
        {!b.chon && <div className="hdan-bong-ic"><Icon n="check" className="ic" /></div>}
        {khen
          ? <div className="hdan-khen-dau"><span className="hdan-khen-ic"><Icon n="star" className="ic" /></span><b>{b.tieuDe}</b></div>
          : <b>{b.tieuDe}</b>}
        <p>{i === 0 && !nhacNut && !khen ? loiChao : b.noiDung}</p>
        {/* bấm làm ngay: tạm dừng, chờ màn đó lưu xong (viec) thì về đây khen; bước cuối cũng chờ, khen xong mới kết thúc */}
        {!nhacNut && !khen && b.nut && <button className="btn sm hdan-lam" onClick={() => { luuTiep({ dv: s.donVi, b: i + 1, moLai, cho: b.viec }); nav(b.nut!.di) }}>{b.nut.ten}<Icon n="arrow" className="ic sm" /></button>}
        {nhacNut ? (
          <div className="row hdan-nut"><span className="grow" /><button className="btn pri sm" onClick={xong}>Đã hiểu</button></div>
        ) : ket ? (
          <div className="row hdan-nut"><button className="btn pri sm" onClick={xong}>Bắt đầu dùng</button></div>
        ) : khen ? (
          <div className="row hdan-nut"><span className="grow" /><button className="btn pri sm" onClick={tiepSauKhen}>{hetSauKhen ? 'Bắt đầu dùng' : 'Tiếp tục'}</button></div>
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
    <>
    {t.cho === 'quy' && pathname.startsWith('/app/danh-muc/1-12') && <KhoanhSoDuQuy />}
    {/* điện thoại: nút dài ở đáy đè lên form, nút Lưu, tấm chọn; thay bằng dải mỏng dưới thanh tiêu đề (PhuongXT 29/10/2026) */}
    {laMobile ? <DaiHuongDanDt dem={`${Math.min(t.b, tong)}/${tong}`} onTiep={() => nav(TRANG_HD)} onTat={thoi} /> : <div className="hdan-tiep" role="status">
      <button className="btn pri sm" onClick={() => nav(TRANG_HD)}>Tiếp tục hướng dẫn ({Math.min(t.b, tong)}/{tong})<Icon n="arrow" className="ic sm" /></button>
      <button className="btn ghost sm" title="Tắt hướng dẫn" aria-label="Tắt hướng dẫn" onClick={thoi}><Icon n="x" className="ic sm" /></button>
    </div>}
    </>,
    document.body,
  )
}

/** Đầu màn đang thấy trên điện thoại: tìm chữ đậm cỡ lớn trên cùng không bị lớp phủ che (tấm, form trượt lên thì lấy tiêu đề tấm đó),
 *  trả cả thanh đầu chứa nó (thanh tiêu đề màn, đầu tấm) để đặt dải hướng dẫn ngay bên dưới */
function dauMan(): HTMLElement | null {
  const H = window.innerHeight
  let tot: { r: DOMRect; el: HTMLElement } | null = null
  // tiêu đề màn, tấm điện thoại: thẻ h, dòng đầu đầu phiếu (.dong1), chữ đậm ở đầu màn, đầu tấm (vd .m-tk-man-dau b)
  document.querySelectorAll<HTMLElement>('h1, h2, h3, .dong1, [class*="tieu-de"], [class*="-dau"] b').forEach(el => {
    if (el.closest('.hdan, .hdan-dai-dt') || !el.textContent?.trim()) return
    const cs = getComputedStyle(el)
    if (parseFloat(cs.fontSize) < 15 || Number(cs.fontWeight) < 500) return
    const range = document.createRange()
    range.selectNodeContents(el)
    const r = range.getBoundingClientRect()
    if (!r.width || r.top < 0 || r.top > H * 0.7) return
    // bỏ qua lớp của chính hướng dẫn (màn tối, viền, dải) khi xét bị che
    const tren = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2).find(x => !x.closest('.hdan, .hdan-dai-dt, .hdan-vien, .hdan-vien-chu'))
    if (!tren || !(el.contains(tren) || tren.contains(el))) return   // bị lớp phủ, tấm chọn che
    if (!tot || r.top < tot.r.top) tot = { r, el }
  })
  if (!tot) return null
  const { el } = tot as { r: DOMRect; el: HTMLElement }
  return el.closest<HTMLElement>('header, [class*="-dau"], [class*="thanh-tren"]') ?? el.parentElement ?? el
}

/** Điện thoại: dải mỏng ngay dưới thanh tiêu đề màn (PhuongXT 29/10/2026, cách B): la bàn, số bước, Tiếp tục, nút tắt.
 *  Nút dài ở đáy đè lên form, nút Lưu, tấm chọn nên bỏ. Tìm lại đầu màn mỗi nửa giây vì màn, tấm chọn đổi; không thấy thì nằm sát đỉnh */
const CAO_DAI = 28   // cao dải hướng dẫn điện thoại, khớp .hdan-dai-dt
function DaiHuongDanDt({ dem, onTiep, onTat }: { dem: string; onTiep: () => void; onTat: () => void }) {
  const [vt, setVt] = useState<{ left: number; top: number; width: number } | null>(null)
  useEffect(() => {
    // thanh đầu được chừa thêm khoảng dưới bằng chiều cao dải, để dải không đè lên nội dung đầu màn.
    // Giữ thanh đã chọn tới khi tìm được thanh khác hoặc nó rời màn: bỏ rồi gắn lại khoảng chừa làm cả màn giật lên xuống (nháy)
    let chua: HTMLElement | null = null
    const boChua = () => { if (chua) chua.style.marginBottom = ''; chua = null }
    let truoc: HTMLElement | null = null   // thanh tìm được lần trước: phải thấy 2 lần liền mới đổi, tránh lật qua lại
    const tim = () => {
      const d = dauMan()
      const conThay = !!chua && chua.isConnected && chua.getBoundingClientRect().width > 0
      if (d && d !== chua && (d === truoc || !conThay)) { boChua(); d.style.marginBottom = `${CAO_DAI}px`; chua = d }
      else if (!d && !conThay) boChua()
      truoc = d
    }
    // bám vị trí thanh đầu từng khung hình (cuộn, tấm trượt lên), chỉ đo một thẻ nên nhẹ; tìm lại thanh đầu mỗi nửa giây
    let f = 0
    const bam = () => {
      const z = zoom(), k = chua?.getBoundingClientRect()
      const m = k && k.width ? { left: k.left / z, top: k.bottom / z, width: k.width / z } : { left: 0, top: 0, width: window.innerWidth / z }
      setVt(o => o && Math.abs(o.left - m.left) < 1 && Math.abs(o.top - m.top) < 1 && Math.abs(o.width - m.width) < 1 ? o : m)
      f = requestAnimationFrame(bam)
    }
    tim()
    bam()
    const t = window.setInterval(tim, 500)
    return () => { clearInterval(t); cancelAnimationFrame(f); boChua() }
  }, [])
  if (!vt) return null
  return (
    <div className="hdan-dai-dt" style={vt} role="status">
      <button type="button" className="hdan-dai-tiep" onClick={onTiep}>
        <Icon n="la-ban" className="ic sm" /><span className="grow">Hướng dẫn {dem}</span><b>Tiếp tục<Icon n="chevr" className="ic sm" /></b>
      </button>
      <button type="button" className="hdan-dai-tat" aria-label="Tắt hướng dẫn" title="Tắt hướng dẫn" onClick={onTat}><Icon n="x" className="ic sm" /></button>
    </div>
  )
}
/** Hướng dẫn chờ việc Kê khai thuế, đã khai xong thông tin kinh doanh (popup loại hình, mã số thuế): ở danh sách tờ khai khoanh các cột
 *  doanh thu, tiền thuế, bong bóng mời lập tờ khai (PhuongXT 29/10/2026). Lập tờ khai: mở các bước kê khai (onLap), nộp xong mới về Trang chủ;
 *  Bỏ qua: về Trang chủ khen, kết thúc hướng dẫn. Gắn ở ToKhaiHKD; điện thoại (MToKhaiHKD) truyền chon: dòng tờ khai đầu có số liệu */
export function GoiYKeKhai({ onLap, chon }: { onLap: () => void; chon?: string }) {
  const { s } = useSession()
  const nav = useNavigate()
  const [an, setAn] = useState(false)
  const [o, setO] = useState<DOMRect | null>(null)
  const [caoBong, refBong] = useCaoBong()
  const t = docTiep()
  const hien = !an && !!t && t.dv === s.donVi && t.cho === 'thue' && !s.choKeKhai?.[s.donVi] && !navigator.webdriver
  useEffect(() => {
    if (!hien) return
    let f = 0, daCuon = false
    const bam = () => {
      const el = chon ? document.querySelector(chon) : null
      if (el) {
        if (!daCuon) { cuonToi(el, { block: 'start' }); daCuon = true }   // dòng lên đầu màn, chừa chỗ bên dưới cho bong bóng
        const r = el.getBoundingClientRect(), z = zoom()
        const m = new DOMRect(r.left / z, r.top / z, r.width / z, r.height / z)
        setO(o => o && o.left === m.left && o.top === m.top && o.width === m.width && o.height === m.height ? o : m)
        f = requestAnimationFrame(bam)
        return
      }
      // vùng từ cột Doanh thu tính thuế tới cột Thuế TNCN, từ dòng tiêu đề tới hết bảng
      const th = [...document.querySelectorAll('.page th')]
      const dau = th.find(x => x.textContent?.trim() === 'Doanh thu tính thuế'), cuoi = th.find(x => x.textContent?.trim() === 'Thuế TNCN')
      const bang = dau?.closest('table')
      if (dau && cuoi && bang) {
        // màn hẹp bảng cuộn ngang: cuộn cho thấy cột Thuế TNCN, khung cắt theo phần bảng đang thấy
        if (!daCuon) { cuonToi(cuoi, { block: 'nearest', inline: 'end' }); daCuon = true }
        const a = dau.getBoundingClientRect(), c = cuoi.getBoundingClientRect(), k = bang.parentElement!.getBoundingClientRect(), z = zoom()
        const trai = Math.max(a.left, k.left), phai = Math.min(c.right, k.right)
        const m = new DOMRect(trai / z, a.top / z, (phai - trai) / z, (bang.getBoundingClientRect().bottom - a.top) / z)
        setO(o => o && o.left === m.left && o.top === m.top && o.width === m.width && o.height === m.height ? o : m)
      }
      f = requestAnimationFrame(bam)
    }
    bam()   // đo ngay, không chờ khung hình đầu (tab chạy nền thì requestAnimationFrame đứng)
    return () => cancelAnimationFrame(f)
  }, [hien])
  if (!hien || !o) return null
  return createPortal(
    <div className="hdan" role="dialog" aria-label="Hướng dẫn sử dụng">
      <div className="hdan-lo" style={{ left: o.left - LE, top: o.top - LE, width: o.width + LE * 2, height: o.height + LE * 2 }} />
      <div ref={refBong} className="hdan-bong" style={viTriBong(o, caoBong)}>
        <div className="hdan-khen-dau"><span className="hdan-khen-ic"><Icon n="star" className="ic" /></span><b>Thông tin kê khai đã xong, giờ lập tờ khai</b></div>
        <p>Mỗi kỳ tờ khai có sẵn doanh thu tính thuế lấy từ FABi, phần giảm trừ, thuế GTGT, thuế TNCN phải nộp. Lập tờ khai để xem từng bước rồi nộp.</p>
        <div className="row hdan-nut">
          <span className="grow" />
          <button className="btn ghost sm" onClick={() => { setAn(true); xongViecHuongDan('thue', '', s.donVi, nav) }}>Bỏ qua</button>
          <button className="btn pri sm" onClick={() => { setAn(true); onLap() }}>Lập tờ khai thuế<Icon n="arrow" className="ic sm" /></button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** Hướng dẫn chờ việc Kê khai thuế, lướt các bước tờ khai tới bước cuối (Xem và nộp tờ khai): khen ngay trong màn, Bắt đầu dùng thì kết thúc
 *  hướng dẫn, về Trang chủ (PhuongXT 29/10/2026). Gắn ở hộp tờ khai web (ToKhaiHKD) và điện thoại (MToKhaiHKD) */
export function KhenToKhai({ ky }: { ky: string }) {
  const { s, set } = useSession()
  const nav = useNavigate()
  const [an, setAn] = useState(false)
  const t = docTiep()
  if (an || !t || t.dv !== s.donVi || t.cho !== 'thue' || navigator.webdriver) return null
  const xong = () => { setAn(true); luuTiep(null); set({ huongDan: { ...s.huongDan, [s.donVi]: true } }); nav(TRANG_HD) }
  return createPortal(
    <div className="hdan-bong hdan-khen-tk" role="status">
      <div className="hdan-khen-dau"><span className="hdan-khen-ic"><Icon n="star" className="ic" /></span><b>Tuyệt vời, bạn đã lập xong tờ khai {ky}</b></div>
      <p>Doanh thu, thuế GTGT, TNCN đã điền sẵn từ số bán FABi. Kiểm tra tờ khai, tải XML nộp lên cổng thuế, rồi bấm Đã nộp CQT để ghi nhận.</p>
      <div className="row hdan-nut"><span className="grow" /><button className="btn pri sm" onClick={xong}>Bắt đầu dùng</button></div>
    </div>,
    document.body,
  )
}

/** Bấm Nhập số dư quỹ ở hướng dẫn, form quỹ mở ra: khoanh ô Số dư ban đầu; máy tính đặt con trỏ vào ô (PhuongXT 29/10/2026).
 *  Chỉ viền, không làm tối màn, không chặn bấm; bám theo ô mỗi khung hình vì form trượt vào từ bên phải.
 *  Điện thoại không tự đặt con trỏ: bàn phím bật lên đẩy màn nhìn thấy lên, viền vẽ lệch sang ô phía trên (Safari iPhone) */
function KhoanhSoDuQuy() {
  const [o, setO] = useState<DOMRect | null>(null)
  useEffect(() => {
    let f = 0, daFocus = false
    const chuot = window.matchMedia('(pointer: fine)').matches
    const bam = () => {
      const nhan = [...document.querySelectorAll('label')].find(l => l.textContent?.trim().startsWith('Số dư ban đầu'))
      const r = nhan?.parentElement?.getBoundingClientRect()
      if (r && r.width) {
        if (!daFocus) {
          daFocus = true
          const inp = nhan!.parentElement!.querySelector('input')
          if (chuot) { inp?.focus(); inp?.select() } else cuonToi(nhan!.parentElement!, { block: 'center' })
        }
        const z = zoom(), m = new DOMRect(r.left / z, r.top / z, r.width / z, r.height / z)
        setO(o => o && o.left === m.left && o.top === m.top && o.width === m.width && o.height === m.height ? o : m)
      } else setO(null)
      f = requestAnimationFrame(bam)
    }
    bam()   // đo ngay, không chờ khung hình đầu (tab chạy nền thì requestAnimationFrame đứng)
    return () => cancelAnimationFrame(f)
  }, [])
  if (!o) return null
  return (
    <>
      <div className="hdan-vien" style={{ left: o.left - LE, top: o.top - LE, width: o.width + LE * 2, height: o.height + LE * 2 }} />
      {/* chữ nhắc canh phải theo ô: ô nằm sát mép phải form */}
      <div className="hdan-vien-chu" style={{ right: Math.max(12, window.innerWidth / zoom() - o.right - LE), top: o.bottom + LE + 8 }}>
        Nhập số tiền đang có trong két, rồi bấm <b>Lưu</b>
      </div>
    </>
  )
}
