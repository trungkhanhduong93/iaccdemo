// Dải cảnh báo, hướng dẫn trên bảng danh mục (T287): vàng khi có việc cần làm (so > 0), xám khi chỉ là gợi ý.
// Link "Cách làm" mở bảng nhỏ các bước ngay dưới link, cho người ít nghiệp vụ.
import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Note } from './Page'
import { Popover } from './Dropdown'

export interface CanhBaoDs { so: number; noiDung: ReactNode; cachLam?: ReactNode; hanhDong?: { nhan: string; to: string } }   // hanhDong: nút làm ngay trên dải (T421)

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
