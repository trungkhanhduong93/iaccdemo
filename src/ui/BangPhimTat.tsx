// Nút và hộp hướng dẫn phím tắt ở góc trên phải form toàn màn: phiếu chứng từ, thẻ chi phí (T297)
import { useEffect, useState } from 'react'
import { Icon } from './Icon'

const PHIM: [string, string][] = [
  ['Lưu chứng từ', 'Ctrl + S'], ['Lưu và thêm mới', 'Ctrl + Shift + S'], ['Sửa chứng từ', 'Ctrl + E'], ['Huỷ thay đổi', 'Ctrl + Q'],
  ['Thêm dòng chi tiết', 'Ctrl + Insert'], ['Xoá dòng chi tiết', 'Alt + Delete'], ['Sao chép chứng từ', 'Ctrl + O'], ['Xoá chứng từ', 'Ctrl + Delete'],
  ['Đóng form', 'Esc'],
]

/** Ctrl+Insert thêm dòng, Alt+Delete xoá dòng đang đứng ở bảng chi tiết form toàn màn (T297).
 *  Ctrl+Delete để dành cho xoá chứng từ khi đang xem, và trong ô nhập vẫn là phím xoá chữ của trình duyệt.
 *  Bấm hộ nút Thêm dòng, nút Xoá dòng của hàng có ô đang nhập, nên dùng được cho mọi bảng có hai nút này. Trả true nếu đã xử lý */
export function phimDong(e: KeyboardEvent): boolean {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Insert') {
    const nut = [...document.querySelectorAll<HTMLButtonElement>('.fsf button')].find(b => b.textContent?.trim() === 'Thêm dòng' && !b.disabled)
    if (!nut) return false
    e.preventDefault(); nut.click(); return true
  }
  if (e.altKey && e.key === 'Delete') {
    const hang = (document.activeElement as HTMLElement | null)?.closest('tr')
    const nut = hang?.querySelector<HTMLButtonElement>('button[title="Xoá dòng"], button[aria-label^="Xoá dòng"]')
    if (!nut) return false
    e.preventDefault(); nut.click(); return true
  }
  return false
}

/** Hộp phím tắt; ds: các dòng [việc, phím], mặc định 4 phím của form chứng từ */
export function HopPhimTat({ ds = PHIM, onDong }: { ds?: [string, string][]; onDong: () => void }) {
  // Esc chỉ đóng hộp, chặn lan để không đóng luôn form phía sau
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onDong() } }
    document.addEventListener('keydown', key, true)
    return () => document.removeEventListener('keydown', key, true)
  }, [onDong])
  return (
    <div className="pop-backdrop" onClick={onDong}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100, display: 'grid', placeItems: 'center' }}>
      <div className="card" style={{ width: 360, padding: 18 }} onClick={e => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <b>Phím tắt thao tác</b>
          <button type="button" className="icon-btn sm" onClick={onDong}><Icon n="x" /></button>
        </div>
        <div className="stack" style={{ gap: 8, fontSize: 13 }}>
          {ds.map(([viec, phim]) => (
            <div key={viec} className="row phim-dong">
              <span>{viec.replace(/:$/, '')}</span>
              {/* Mỗi phím một ô riêng: Ctrl + Shift + S */}
              <span className="phim-to-hop">
                {phim.split(' + ').map((k, i) => <span key={k}>{i > 0 && <i>+</i>}<kbd>{k}</kbd></span>)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Nút bàn phím mở hộp phím tắt, tự giữ trạng thái mở */
export function NutPhimTat({ ds }: { ds?: [string, string][] }) {
  const [mo, setMo] = useState(false)
  return (
    <>
      {/* Chú thích khi rê chuột ngắn gọn; danh sách phím xem trong hộp khi bấm */}
      <button type="button" className="icon-btn" title="Xem phím tắt" aria-label="Xem phím tắt" onClick={() => setMo(m => !m)}>
        <Icon n="keyboard" />
      </button>
      {mo && <HopPhimTat ds={ds} onDong={() => setMo(false)} />}
    </>
  )
}
