/** Popup Chia sẻ hoá đơn điện tử (T793): chọn ứng dụng Zalo, Messenger, Telegram, Gmail.
 *  Bấm một ứng dụng: tải file PDF hoá đơn về máy, chép sẵn nội dung tin nhắn, mở ứng dụng đó.
 *  Người dùng chọn người nhận, dán nội dung, đính kèm file PDF rồi gửi. */
import { useEffect, useState, type ReactNode } from 'react'
import { Icon } from '../../ui/Icon'
import { money } from '../../ui/format'
import { chiaSeFile, taiVe } from '../../ui/luuFile'
import { NCC_HDDT, Vo, type HdDaXuat, type TtXem } from './hddt'
import { pdfHd, tenFileHd } from './hddtFile'

interface UngDung { ma: string; ten: string; logo: ReactNode; mo: (tieuDe: string, noiDung: string) => string; dienSan?: boolean }

const ma = encodeURIComponent
const UNG_DUNG: UngDung[] = [
  {
    ma: 'zalo', ten: 'Zalo', mo: () => 'https://chat.zalo.me/',
    logo: <svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#0068ff" /><text x="20" y="25" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">Zalo</text></svg>,
  },
  {
    ma: 'messenger', ten: 'Messenger', mo: () => 'https://www.messenger.com/',
    logo: <svg viewBox="0 0 40 40"><defs><linearGradient id="cs-msg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#0a7cff" /><stop offset="1" stopColor="#a033ff" /></linearGradient></defs>
      <circle cx="20" cy="20" r="20" fill="url(#cs-msg)" /><path d="M10 24l7-8 4 4 7-5-7 8-4-4z" fill="#fff" /></svg>,
  },
  {
    ma: 'telegram', ten: 'Telegram', mo: (_, nd) => `https://t.me/share/url?url=${ma(NCC_HDDT)}&text=${ma(nd)}`, dienSan: true,
    logo: <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#29a9eb" /><path d="M9 19.5l20-8-3.5 17-6-4.5-3 3 .5-4.5 8-7.5-10 6z" fill="#fff" /></svg>,
  },
  {
    ma: 'gmail', ten: 'Gmail', dienSan: true,
    mo: (td, nd) => `https://mail.google.com/mail/?view=cm&fs=1&su=${ma(td)}&body=${ma(nd)}`,
    logo: <svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#fff" stroke="#e2e8f0" /><path d="M8 13v15h5V18l7 5 7-5v10h5V13l-3-1-9 6.5L11 12z" fill="#ea4335" /></svg>,
  },
]

export function HopChiaSeHd({ hd, t, onDong, toast }: { hd: HdDaXuat; t: TtXem; onDong: () => void; toast: (m: string) => void }) {
  const tieuDe = `Hoá đơn điện tử ${hd.mau}${hd.kyHieu} số ${hd.so}`
  const [noiDung, setNoiDung] = useState(() => [
    `Kính gửi Quý khách ${t.k.tenDv && t.k.loai === 'cty' && !t.khongLay ? t.k.tenDv : t.k.tenNm},`,
    `${t.dv.ten} gửi Quý khách hoá đơn điện tử:`,
    `- Ký hiệu: ${hd.mau}${hd.kyHieu}, số: ${hd.so}, ngày ${hd.ngay}`,
    `- Tổng tiền thanh toán: ${money(t.tien.tong)} đồng`,
    ...(hd.traCuu ? [`- Mã tra cứu: ${hd.traCuu}, tra cứu tại trang của ${NCC_HDDT}`] : []),
    'File PDF hoá đơn gửi kèm tin nhắn này.',
  ].join('\n'))
  const tenFile = tenFileHd(hd, 'pdf')
  // Esc chỉ đóng popup chia sẻ, không đóng luôn popup hoá đơn phía sau
  useEffect(() => {
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopImmediatePropagation(); onDong() } }
    window.addEventListener('keydown', on, true)
    return () => window.removeEventListener('keydown', on, true)
  }, [onDong])
  const coChiaSeMay = (() => { try { return navigator.canShare?.({ files: [new File([''], 'a.pdf', { type: 'application/pdf' })] }) ?? false } catch { return false } })()

  const chon = async (u: UngDung) => {
    const pdf = pdfHd(hd, t)
    // Máy cho trình duyệt chia sẻ file (Chrome, Edge trên Windows, điện thoại): mở bảng chia sẻ của máy,
    // file PDF đã đính kèm, nội dung điền sẵn, bấm ứng dụng đã cài rồi chọn người nhận
    const file = new File([pdf], tenFile, { type: 'application/pdf' })
    const du = { files: [file], title: tieuDe, text: noiDung }
    if (navigator.canShare?.(du)) {
      void navigator.clipboard?.writeText(noiDung).catch(() => {})
      try {
        await navigator.share(du)
        onDong()
        return
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return
      }
    }
    taiVe(pdf, tenFile)
    let daChep = true
    try { await navigator.clipboard.writeText(noiDung) } catch { daChep = false }
    window.open(u.mo(tieuDe, noiDung), '_blank', 'noopener')
    toast(u.dienSan
      ? `Đã mở ${u.ten} với nội dung soạn sẵn. Đính kèm file ${tenFile} trong thư mục Tải xuống rồi gửi`
      : `Đã mở ${u.ten}${daChep ? ', nội dung đã chép sẵn' : ''}. Chọn người nhận, dán nội dung (Ctrl+V), đính kèm file ${tenFile} rồi gửi`)
  }
  const khac = () => { void chiaSeFile(pdfHd(hd, t), tenFile, tieuDe).then(m => m && toast(m)) }

  return (
    <Vo hep lop="cs-hd" tieuDe="Chia sẻ hoá đơn" onDong={onDong} chan={<>
      <span className="grow" />
      <button type="button" className="xp-btn-outline" onClick={onDong}>Đóng</button>
    </>}>
      <div className="cs-hd-than">
        {coChiaSeMay
          ? <ol className="cs-hd-buoc">
            <li><b>Bước 1:</b> Chọn ứng dụng bên dưới. Máy mở bảng chia sẻ, file PDF hoá đơn và nội dung tin nhắn đã kèm sẵn. Bấm ứng dụng muốn gửi trong bảng đó.</li>
            <li><b>Bước 2:</b> Chọn người hoặc nhóm cần gửi rồi ấn Gửi.</li>
          </ol>
          : <ol className="cs-hd-buoc">
            <li><b>Bước 1:</b> Chọn ứng dụng bên dưới. Phần mềm tải file PDF hoá đơn về máy, chép sẵn nội dung và mở ứng dụng đó.</li>
            <li><b>Bước 2:</b> Chọn người hoặc nhóm cần gửi, dán nội dung vào ô tin nhắn, đính kèm file PDF rồi ấn Gửi.</li>
          </ol>}
        <div className="cs-hd-ud">
          {UNG_DUNG.map(u => (
            <button type="button" key={u.ma} className="cs-hd-nut" onClick={() => void chon(u)} title={`Gửi qua ${u.ten}`}>
              <span className="cs-hd-logo">{u.logo}</span><span>{u.ten}</span>
            </button>
          ))}
          {coChiaSeMay && (
            <button type="button" className="cs-hd-nut" onClick={khac} title="Mở bảng chia sẻ của máy">
              <span className="cs-hd-logo khac"><Icon n="link" className="ic" /></span><span>Ứng dụng khác</span>
            </button>
          )}
        </div>
        <label className="cs-hd-nd">
          <span>Nội dung tin nhắn</span>
          <textarea className="inp" rows={6} value={noiDung} onChange={e => setNoiDung(e.target.value)} />
        </label>
        <div className="cs-hd-file"><Icon n="file" className="ic sm" />File đính kèm: <b>{tenFile}</b></div>
      </div>
    </Vo>
  )
}
