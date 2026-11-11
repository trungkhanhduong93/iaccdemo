// Mảnh giao diện dùng chung của Thông báo, Hỗ trợ, Ngôn ngữ cho web và điện thoại (T803)
import { useEffect, useId, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BIEU_TUONG, type NgonNgu, type ThongBao } from './data'

/** Đường vẽ biểu tượng nét, khung 24 */
export const D = {
  chuong: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  banhRang: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  hoTro: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01',
  dienThoai: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2',
  sach: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM20 17v5H6.5A2.5 2.5 0 0 1 4 19.5',
  gopY: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  khoa: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4',
  banPhim: 'M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8',
  moNgoai: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3',
  x: 'M18 6L6 18M6 6l12 12',
  tim: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  tich: 'M20 6L9 17l-5-5',
  docHet: 'M2 12l5 5L18 6M12 17l10-11',
  chep: 'M9 9h11v11H9zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1',
  mayAnh: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  lich: 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM16 2v4M8 2v4M3 10h18',
  thanhTruot: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  xuong: 'M6 9l6 6 6-6',
  len: 'M18 15l-6-6-6 6',
  phai: 'M9 18l6-6-6-6',
}

export function Sv({ d, c = 18, net = 1.9, className }: { d: string; c?: number; net?: number; className?: string }) {
  return (
    <svg className={className} width={c} height={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={net}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
  )
}

/** Cờ tròn của ngôn ngữ */
export function CoTron({ nn, c = 22 }: { nn: NgonNgu; c?: number }) {
  const id = useId()
  if (nn === 'vi') return (
    <svg className="tb-co" width={c} height={c} viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="13" fill="#da251d" /><path d="M13 6.5l1.53 4.7h4.94l-4 2.9 1.53 4.7-4-2.9-4 2.9 1.53-4.7-4-2.9h4.94z" fill="#ffcd00" />
    </svg>
  )
  return (
    <svg className="tb-co" width={c} height={c} viewBox="0 0 26 26" aria-hidden="true">
      <defs><clipPath id={id}><circle cx="13" cy="13" r="13" /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect width="26" height="26" fill="#012169" />
        <path d="M0 0L26 26M26 0L0 26" stroke="#fff" strokeWidth="5" /><path d="M0 0L26 26M26 0L0 26" stroke="#c8102e" strokeWidth="2" />
        <path d="M13 0v26M0 13h26" stroke="#fff" strokeWidth="7" /><path d="M13 0v26M0 13h26" stroke="#c8102e" strokeWidth="4" />
      </g>
    </svg>
  )
}

/** Công tắc bật tắt; to: cỡ điện thoại. truoc: chữ đứng trước công tắc, bấm vào chữ cũng đổi */
export function CongTac({ bat, onDoi, nhan, to, truoc }: { bat: boolean; onDoi: () => void; nhan: string; to?: boolean; truoc?: ReactNode }) {
  return (
    <button type="button" role="switch" aria-checked={bat} aria-label={truoc ? undefined : nhan}
      className={`tb-ct${bat ? ' bat' : ''}${to ? ' to' : ''}${truoc ? ' co-chu' : ''}`} onClick={onDoi}>
      {truoc}<span className="tb-ct-ray"><span className="tb-ct-num" /></span>
    </button>
  )
}

/** Nội dung thông báo: chữ giữa hai cặp ** in đậm */
export function NoiDung({ nd }: { nd: string }) {
  return <>{nd.split('**').map((t, i) => i % 2 ? <b key={i}>{t}</b> : t)}</>
}

/** Một dòng thông báo. Bấm dòng: đánh dấu đã đọc. Bấm nút thao tác: mở màn liên quan */
export function DongThongBao({ n, chuaDoc, onDoc, onDi }: { n: ThongBao; chuaDoc: boolean; onDoc: () => void; onDi?: () => void }) {
  const bt = BIEU_TUONG[n.k]
  return (
    <div className={`tb-dong${chuaDoc ? ' moi' : ''}`}>
      <button type="button" className="tb-dong-phu" aria-label={`${n.tieuDe}${chuaDoc ? ', chưa đọc. Bấm để đánh dấu đã đọc' : ''}`} onClick={onDoc} />
      <span className="tb-dong-ic" style={{ color: bt.mau }}><Sv d={bt.d} /></span>
      <span className="tb-dong-nd">
        <span className="tb-dong-tieu"><span>{n.tieuDe}</span>{chuaDoc && <i className="tb-cham" aria-hidden="true" />}</span>
        <span className="tb-dong-chu"><NoiDung nd={n.nd} /></span>
        <span className="tb-dong-chan">
          <span>{n.luc}</span>
          {n.viec && n.di && <Link className="tb-dong-viec" to={n.di} onClick={() => { onDoc(); onDi?.() }}>{n.viec} ›</Link>}
        </span>
      </span>
      {chuaDoc && <i className="tb-cham tb-cham-phai" aria-hidden="true" />}
    </div>
  )
}

/** Mã QR mẫu 21 ô: ba ô định vị và điểm giả, chỉ để minh hoạ */
export function QrMau() {
  const o: boolean[] = []
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
    const goc = (ox: number, oy: number) => {
      const dx = x - ox, dy = y - oy
      if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null
      return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)
    }
    const v = goc(0, 0) ?? goc(14, 0) ?? goc(0, 14)
    const trongGoc = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)
    o.push(v ?? (trongGoc ? false : (x * 7 + y * 13 + x * y * 3) % 5 < 2))
  }
  return (
    <div className="tb-qr" role="img" aria-label="Mã QR tải ứng dụng">
      <div className="tb-qr-luoi">{o.map((v, i) => <span key={i} className={v ? 'den' : undefined} />)}</div>
      <i className="tb-qr-goc g1" /><i className="tb-qr-goc g2" /><i className="tb-qr-goc g3" /><i className="tb-qr-goc g4" />
      <i className="tb-qr-tia" />
    </div>
  )
}

/** Nhóm nút chọn một, kiểu thanh phân đoạn */
export function PhanDoan<T extends string>({ ds, chon, onChon, nhan, deu }: {
  ds: { id: T; ten: ReactNode }[]; chon: T; onChon: (id: T) => void; nhan: string; deu?: boolean
}) {
  return (
    <div className={`tb-doan${deu ? ' deu' : ''}`} role="radiogroup" aria-label={nhan}>
      {ds.map(o => (
        <button key={o.id} type="button" role="radio" aria-checked={o.id === chon} className={o.id === chon ? 'on' : undefined}
          onClick={() => onChon(o.id)}>{o.ten}</button>
      ))}
    </div>
  )
}

/** Hộp thoại giữa màn trên web: bấm nền hoặc Esc để đóng */
export function HopNen({ nhan, rong, onDong, children }: { nhan: string; rong: number; onDong: () => void; children: ReactNode }) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onDong() } }
    document.addEventListener('keydown', key, true)
    return () => document.removeEventListener('keydown', key, true)
  }, [onDong])
  return (
    <div className="tb-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <section role="dialog" aria-modal="true" aria-label={nhan} className="tb-hop" style={{ width: rong }}>{children}</section>
    </div>
  )
}

/** Đầu hộp thoại: biểu tượng, tên, dòng phụ, nút đóng */
export function DauHop({ d, ten, phu, onDong }: { d?: string; ten: string; phu?: ReactNode; onDong: () => void }) {
  return (
    <div className="tb-hop-dau">
      {d && <span className="tb-hop-ic"><Sv d={d} /></span>}
      <div className="grow"><h2>{ten}</h2>{phu && <p>{phu}</p>}</div>
      <button type="button" className="tb-nut-ic" aria-label="Đóng" onClick={onDong}><Sv d={D.x} net={2} /></button>
    </div>
  )
}
