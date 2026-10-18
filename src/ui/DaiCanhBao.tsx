// Dải cảnh báo, hướng dẫn trên bảng danh mục (T287): vàng khi có việc cần làm (so > 0), xám khi chỉ là gợi ý.
// Link "Cách làm" mở bảng nhỏ các bước ngay dưới link, cho người ít nghiệp vụ.
import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Note } from './Page'
import { Popover } from './Dropdown'
import { Icon } from './Icon'

export interface CanhBaoDs { so: number; noiDung: ReactNode; cachLam?: ReactNode; hanhDong?: { nhan: string; to: string }; gon?: ReactNode }   // hanhDong: nút làm ngay trên dải (T421); gon: chữ ngắn khi nằm trong thanh công cụ (T429)

export function DaiCanhBao({ cb }: { cb: CanhBaoDs }) {
  const [mo, setMo] = useState(false)
  const o = useRef<HTMLSpanElement>(null)
  return (
    <div className="ds-canh-bao">
      <Note kind={cb.so > 0 ? 'warn' : 'gray'} icon={cb.so > 0 ? 'alert' : 'info'}>
        {cb.noiDung}
        {cb.hanhDong && <Link to={cb.hanhDong.to} className="btn sm ds-canh-bao-nut">{cb.hanhDong.nhan}</Link>}
        {cb.cachLam && (
          <span ref={o} className="ds-cach-lam-nut">
            <button type="button" className="ds-cach-lam-link" aria-expanded={mo} onClick={() => setMo(x => !x)}>Cách làm</button>
          </span>
        )}
      </Note>
      {cb.cachLam && (
        <Popover anchor={o} open={mo} onClose={() => setMo(false)} align="start" width={420} className="ds-cach-lam" role="dialog">
          {cb.cachLam}
        </Popover>
      )}
    </div>
  )
}

/** Nút ⓘ mở các bước Cách làm, đặt cạnh nút thêm mới thay cho dòng gợi ý trên bảng (T429) */
export function NutCachLam({ cachLam }: { cachLam: ReactNode }) {
  const [mo, setMo] = useState(false)
  const o = useRef<HTMLButtonElement>(null)
  return (
    <>
      <button ref={o} type="button" className="icon-btn ds-cach-lam-i" title="Cách làm" aria-label="Cách làm" aria-expanded={mo} onClick={() => setMo(x => !x)}>
        <Icon n="info" className="ic sm" />
      </button>
      <Popover anchor={o} open={mo} onClose={() => setMo(false)} align="end" width={420} className="ds-cach-lam" role="dialog">
        {cachLam}
      </Popover>
    </>
  )
}

/** Cảnh báo gọn nằm trong hàng 2 thanh công cụ (T429): nhãn vàng chữ ngắn, nút làm ngay; chỉ hiện khi còn việc (so > 0) */
export function CanhBaoGon({ cb }: { cb: CanhBaoDs }) {
  if (cb.so <= 0) return null
  return (
    <span className="ds-canh-bao-gon" role="status">
      <Icon n="alert" className="ic sm" />
      <span>{cb.gon ?? cb.noiDung}</span>
      {cb.hanhDong && <Link to={cb.hanhDong.to} className="ds-canh-bao-gon-nut">{cb.hanhDong.nhan} ›</Link>}
    </span>
  )
}
