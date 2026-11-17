/** Popup Chia sẻ hoá đơn điện tử theo mẫu C (T874): 3 tab Ứng dụng chat, Email, Liên kết.
 *  Chuyển tab không đổi chiều cao popup (540x660px). Không hiện số tiền ở bất kỳ đâu. */
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { Icon } from '../../ui/Icon'
import { chiaSeFile, taiVe } from '../../ui/luuFile'
import { MaQr, NCC_HDDT, Vo, type HdDaXuat, type TtXem } from './hddt'
import { pdfHd, tenFileHd, xmlHd } from './hddtFile'

interface UngDung {
  ma: string
  ten: string
  logo: ReactNode
  mo: (tieuDe: string, noiDung: string) => string
  dienSan?: boolean
}

type TabChiaSe = 'chat' | 'email' | 'link'

const ma = encodeURIComponent

const PATH_HD = ['M6.5 3h11A1.5 1.5 0 0 1 19 4.5V21l-2.33-1.5', 'L14.33 21 12 19.5 9.67 21l-2.34-1.5L5 21V4.5A1.5 1.5 0 0 1 6.5 3z'].join('')

const UNG_DUNG: UngDung[] = [
  {
    ma: 'zalo',
    ten: 'Zalo',
    mo: () => 'https://chat.zalo.me/',
    logo: <img src="/logo-chia-se/zalo.png" width={24} height={24} alt="Zalo" />,
  },
  {
    ma: 'messenger',
    ten: 'Messenger',
    mo: () => 'https://www.messenger.com/',
    logo: <img src="/logo-chia-se/messenger.png" width={22} height={22} alt="Messenger" />,
  },
  {
    ma: 'telegram',
    ten: 'Telegram',
    mo: (_, nd) => `https://t.me/share/url?url=${ma(NCC_HDDT)}&text=${ma(nd)}`,
    dienSan: true,
    logo: (
      <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#2aabee" />
        <path fill="#ffffff" d="M5.4 11.8l11.6-4.5c.5-.2 1 .1.8.9l-2 9.3c-.1.6-.5.8-1 .5l-3-2.2-1.5 1.4c-.2.2-.3.3-.6.3l.2-3.1 5.6-5c.2-.2 0-.3-.4-.1l-6.9 4.3-3-.9c-.6-.2-.7-.6.2-.9z" />
      </svg>
    ),
  },
  {
    ma: 'whatsapp',
    ten: 'WhatsApp',
    mo: (_, nd) => `https://api.whatsapp.com/send?text=${ma(nd)}`,
    dienSan: true,
    logo: <img src="/logo-chia-se/whatsapp.png" width={26} height={26} alt="WhatsApp" />,
  },
]

export function HopChiaSeHd({ hd, t, onDong, toast }: { hd: HdDaXuat; t: TtXem; onDong: () => void; toast: (m: string) => void }) {
  const [tab, setTab] = useState<TabChiaSe>('chat')
  const qrKhungRef = useRef<HTMLDivElement>(null)

  const tieuDe = `Hoá đơn điện tử ${hd.mau}${hd.kyHieu} số ${hd.so}`
  const tenNguoiMua = t.k.tenDv && t.k.loai === 'cty' && !t.khongLay ? t.k.tenDv : (t.k.tenNm || 'Khách hàng')

  // Kênh dùng lần trước từ localStorage (bọc try/catch)
  const [lastKenh, setLastKenh] = useState<string>(() => {
    try {
      return localStorage.getItem('cs_hd_last_channel') || 'zalo'
    } catch {
      return 'zalo'
    }
  })
  const dsKenh = [...UNG_DUNG].sort((a, b) => (a.ma === lastKenh ? -1 : b.ma === lastKenh ? 1 : 0))
  const [chonKenh, setChonKenh] = useState<string>(() => lastKenh)
  const kenhHienTai = UNG_DUNG.find(u => u.ma === chonKenh) || UNG_DUNG[0]

  // Tin nhắn mặc định (không chứa số tiền)
  const [noiDung, setNoiDung] = useState(() => [
    `Kính gửi Quý khách ${tenNguoiMua},`,
    `${t.dv.ten} gửi Quý khách hoá đơn điện tử:`,
    `- Ký hiệu: ${hd.mau}${hd.kyHieu}, số: ${hd.so}, ngày ${hd.ngay}`,
    ...(hd.traCuu ? [`- Mã tra cứu: ${hd.traCuu}, tra cứu tại trang của ${NCC_HDDT}`] : []),
    'File PDF hoá đơn gửi kèm tin nhắn này.',
  ].join('\n'))

  // State Tab Email
  const [emails, setEmails] = useState<string[]>(() => (t.k.email ? [t.k.email.trim()] : []))
  const [emailInp, setEmailInp] = useState('')
  const [tieuDeEmail, setTieuDeEmail] = useState(() => tieuDe)
  const [noiDungEmail, setNoiDungEmail] = useState(() => noiDung)
  const [kemPdf, setKemPdf] = useState(true)
  const [kemXml, setKemXml] = useState(true)

  // State Tab Liên kết
  const [daChepLk, setDaChepLk] = useState(false)
  const lienKet = hd.traCuu ? `${NCC_HDDT}?tc=${ma(hd.traCuu)}` : NCC_HDDT

  const tenFile = tenFileHd(hd, 'pdf')
  const tenFileXml = tenFileHd(hd, 'xml')

  // Phím Esc chỉ đóng popup chia sẻ
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        onDong()
      }
    }
    window.addEventListener('keydown', on, true)
    return () => window.removeEventListener('keydown', on, true)
  }, [onDong])

  // Thao tác gửi qua kênh chat
  const moKenh = async (u: UngDung) => {
    try {
      localStorage.setItem('cs_hd_last_channel', u.ma)
    } catch {}
    setLastKenh(u.ma)
    const pdf = pdfHd(hd, t)
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
    try {
      await navigator.clipboard.writeText(noiDung)
    } catch {
      daChep = false
    }
    window.open(u.mo(tieuDe, noiDung), '_blank', 'noopener')
    toast(
      u.dienSan
        ? `Đã mở ${u.ten} với nội dung soạn sẵn. Đính kèm file ${tenFile} trong thư mục Tải xuống rồi gửi`
        : `Đã mở ${u.ten}${daChep ? ', nội dung đã chép sẵn' : ''}. Chọn người nhận, dán nội dung (Ctrl+V), đính kèm file ${tenFile} rồi gửi`,
    )
  }

  const khac = () => {
    void chiaSeFile(pdfHd(hd, t), tenFile, tieuDe).then(m => m && toast(m))
  }

  // Thao tác Tab Email
  const themEmail = (val: string) => {
    const trimmed = val.trim().replace(/[,;]$/, '')
    if (trimmed && !emails.includes(trimmed)) {
      setEmails([...emails, trimmed])
    }
    setEmailInp('')
  }

  const xoaEmail = (idx: number) => {
    setEmails(emails.filter((_, i) => i !== idx))
  }

  const onEmailKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      themEmail(emailInp)
    } else if (e.key === 'Backspace' && !emailInp && emails.length > 0) {
      xoaEmail(emails.length - 1)
    }
  }

  const guiEmail = () => {
    if (kemPdf) taiVe(pdfHd(hd, t), tenFile)
    if (kemXml) taiVe(xmlHd(hd, t), tenFileXml)
    const toList = [...emails]
    if (emailInp.trim() && !toList.includes(emailInp.trim())) {
      toList.push(emailInp.trim())
    }
    const to = toList.join(',')
    const link = `https://mail.google.com/mail/?view=cm&fs=1${to ? `&to=${ma(to)}` : ''}&su=${ma(tieuDeEmail)}&body=${ma(noiDungEmail)}`
    window.open(link, '_blank', 'noopener')
    toast('Đã mở Gmail với nội dung soạn sẵn. Đính kèm file hoá đơn trong thư mục Tải xuống rồi gửi')
  }

  // Thao tác Tab Liên kết
  const saoChepLienKet = async () => {
    try {
      await navigator.clipboard.writeText(lienKet)
    } catch {}
    setDaChepLk(true)
    toast('Đã sao chép')
    setTimeout(() => setDaChepLk(false), 2000)
  }

  const taiQr = () => {
    const svgEl = qrKhungRef.current?.querySelector('svg')
    if (!svgEl) return
    const s = new XMLSerializer().serializeToString(svgEl)
    const blob = new Blob([s], { type: 'image/svg+xml;charset=utf-8' })
    taiVe(blob, `qr-hoa-don-${hd.so}.svg`)
    toast('Đã tải mã QR về máy')
  }

  const inQr = () => {
    const svgEl = qrKhungRef.current?.querySelector('svg')
    if (!svgEl) return
    const s = new XMLSerializer().serializeToString(svgEl)
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write('<!DOCTYPE html><html><head><title>Mã QR</title>')
    w.document.write('<style>body{text-align:center;padding:30px;font-family:sans-serif;}svg{width:220px;height:220px;}</style>')
    w.document.write(`</head><body><p><b>Hoá đơn số: ${hd.so}</b></p>${s}<p>Khách quét mã để xem hoá đơn</p></body></html>`)
    w.document.close()
    w.focus()
    w.print()
  }

  // Tiêu đề đầu popup theo mẫu C
  const tieuDeDau = (
    <div className="cs-hd-dau-khung">
      <div className="cs-hd-dau-bieu-tuong">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0560a6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={PATH_HD} fill="#ffffff" />
          <path d="M8.5 7.5h4.5" strokeWidth="2" />
          <path d="M8.5 11h7M8.5 14.5h7" />
        </svg>
      </div>
      <div className="cs-hd-dau-chu">
        <div className="cs-hd-dau-tieude">Gửi hoá đơn {hd.so}</div>
        <div className="cs-hd-dau-phu">{tenNguoiMua}</div>
      </div>
    </div>
  )

  // Chân popup thay đổi theo từng tab
  const chanPopup = tab === 'chat' ? (
    <>
      <span className="cs-hd-chan-chu">Chọn người nhận trong {kenhHienTai.ten} rồi bấm Gửi.</span>
      <span className="grow" />
      <div className="cs-hd-chan-phai">
        <button type="button" className="cs-hd-btn-phu" onClick={onDong}>Huỷ</button>
        <button type="button" className="cs-hd-btn-chinh" onClick={() => void moKenh(kenhHienTai)}>Mở {kenhHienTai.ten}</button>
      </div>
    </>
  ) : tab === 'email' ? (
    <>
      <button type="button" className="cs-hd-btn-text" onClick={() => taiVe(pdfHd(hd, t), tenFile)}>Tải PDF</button>
      <span className="grow" />
      <div className="cs-hd-chan-phai">
        <button type="button" className="cs-hd-btn-phu" onClick={onDong}>Huỷ</button>
        <button type="button" className="cs-hd-btn-chinh" onClick={guiEmail}>Gửi email</button>
      </div>
    </>
  ) : (
    <>
      <span className="cs-hd-chan-chu">Liên kết dùng được tới khi hoá đơn bị huỷ.</span>
      <span className="grow" />
      <div className="cs-hd-chan-phai">
        <button type="button" className="cs-hd-btn-chinh" onClick={onDong}>Đóng</button>
      </div>
    </>
  )

  return (
    <Vo hep lop="cs-hd" tieuDe={tieuDeDau} onDong={onDong} chan={chanPopup}>
      <div className="cs-hd-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'chat'}
          className={`cs-hd-tab${tab === 'chat' ? ' chon' : ''}`}
          onClick={() => setTab('chat')}
        >
          Ứng dụng chat
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'email'}
          className={`cs-hd-tab${tab === 'email' ? ' chon' : ''}`}
          onClick={() => setTab('email')}
        >
          Email
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'link'}
          className={`cs-hd-tab${tab === 'link' ? ' chon' : ''}`}
          onClick={() => setTab('link')}
        >
          Liên kết
        </button>
      </div>

      <div className="cs-hd-than">
        {tab === 'chat' && (
          <>
            <div className="cs-hd-luoi-2x2">
              {dsKenh.map((u, i) => (
                <button
                  type="button"
                  key={u.ma}
                  className={`cs-hd-kenh-o${chonKenh === u.ma ? ' chon' : ''}`}
                  onClick={() => setChonKenh(u.ma)}
                >
                  <span className="cs-hd-logo-o">{u.logo}</span>
                  <div className="cs-hd-kenh-tt">
                    <span className="cs-hd-kenh-ten">{u.ten}</span>
                    {i === 0 && <span className="cs-hd-badge-truoc">Dùng lần trước</span>}
                  </div>
                </button>
              ))}
            </div>

            <button type="button" className="cs-hd-btn-text" onClick={khac}>
              Ứng dụng khác trên máy
            </button>

            <label className="cs-hd-nhom">
              <span className="cs-hd-nhan">Tin nhắn kèm theo</span>
              <textarea
                className="cs-hd-textarea"
                rows={4}
                value={noiDung}
                onChange={e => setNoiDung(e.target.value)}
              />
            </label>

            <div className="cs-hd-file-dong">
              <div className="cs-hd-file-trai">
                <Icon n="file" className="ic sm" />
                <span className="cs-hd-file-ten">{tenFile}</span>
              </div>
              <span className="cs-hd-kem-san">Kèm sẵn</span>
            </div>
          </>
        )}

        {tab === 'email' && (
          <>
            <label className="cs-hd-nhom">
              <span className="cs-hd-nhan">Gửi đến</span>
              <div className="cs-hd-email-khung">
                {emails.map((em, i) => (
                  <span key={i} className="cs-hd-email-chip">
                    {em}
                    <button type="button" className="cs-hd-chip-x" onClick={() => xoaEmail(i)} aria-label="Xoá">
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className="cs-hd-email-inp"
                  value={emailInp}
                  onChange={e => setEmailInp(e.target.value)}
                  onKeyDown={onEmailKeyDown}
                  onBlur={() => { if (emailInp) themEmail(emailInp) }}
                  placeholder={emails.length === 0 ? 'Nhập địa chỉ email...' : ''}
                />
              </div>
            </label>

            <label className="cs-hd-nhom">
              <span className="cs-hd-nhan">Tiêu đề</span>
              <input
                type="text"
                className="cs-hd-inp"
                value={tieuDeEmail}
                onChange={e => setTieuDeEmail(e.target.value)}
              />
            </label>

            <label className="cs-hd-nhom">
              <span className="cs-hd-nhan">Nội dung</span>
              <textarea
                className="cs-hd-textarea"
                rows={3}
                value={noiDungEmail}
                onChange={e => setNoiDungEmail(e.target.value)}
              />
            </label>

            <div className="cs-hd-nhom">
              <span className="cs-hd-nhan">Đính kèm</span>
              <div className="cs-hd-dinh-kem-hang">
                <label className={`cs-hd-dinh-kem-o${kemPdf ? ' chon' : ''}`}>
                  <input
                    type="checkbox"
                    checked={kemPdf}
                    onChange={e => setKemPdf(e.target.checked)}
                  />
                  <span>PDF ({tenFile})</span>
                </label>
                <label className={`cs-hd-dinh-kem-o${kemXml ? ' chon' : ''}`}>
                  <input
                    type="checkbox"
                    checked={kemXml}
                    onChange={e => setKemXml(e.target.checked)}
                  />
                  <span>XML ({tenFileXml})</span>
                </label>
              </div>
            </div>
          </>
        )}

        {tab === 'link' && (
          <>
            <div className="cs-hd-qr-card" ref={qrKhungRef}>
              <MaQr so={hd.so} />
              <div className="cs-hd-qr-chu">Khách quét mã để xem hoá đơn</div>
              <div className="cs-hd-qr-nuts">
                <button type="button" className="cs-hd-nut-nho" onClick={taiQr}>
                  Tải mã QR
                </button>
                <button type="button" className="cs-hd-nut-nho" onClick={inQr}>
                  In mã
                </button>
              </div>
            </div>

            <label className="cs-hd-nhom">
              <span className="cs-hd-nhan">Liên kết tra cứu</span>
              <div className="cs-hd-lk-hang">
                <input
                  type="text"
                  readOnly
                  className="cs-hd-inp cs-hd-lk-inp"
                  value={lienKet}
                />
                <button type="button" className="cs-hd-btn-chep" onClick={saoChepLienKet}>
                  {daChepLk ? 'Đã sao chép' : 'Sao chép'}
                </button>
              </div>
            </label>

            <div className="cs-hd-2-o">
              <div className="cs-hd-o-nho">
                <span className="cs-hd-o-nhan">Mã tra cứu</span>
                <span className="cs-hd-o-gt">{hd.traCuu || 'Chưa có'}</span>
              </div>
              <div className="cs-hd-o-nho">
                <span className="cs-hd-o-nhan">Trang tra cứu</span>
                <span className="cs-hd-o-gt">{NCC_HDDT}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </Vo>
  )
}
