// Phân trang danh sách dữ liệu: chuyển trang gọn một hàng căn trái theo mẫu iPOS Inventory (T42)
import { Icon } from './Icon'
import { Select } from './Dropdown'

export function PhanTrang({ tong, trang, coTrang, onTrang, onCoTrang }: {
  tong: number
  trang: number
  coTrang: number
  onTrang: (trang: number) => void
  onCoTrang: (coTrang: number) => void
}) {
  const soTrang = Math.max(1, Math.ceil(tong / coTrang))

  // Danh sách trang rút gọn bằng dấu ba chấm "…"
  const taoDanhSachTrang = () => {
    if (soTrang <= 7) {
      return Array.from({ length: soTrang }, (_, i) => i + 1)
    }
    const pages: (number | string)[] = [1]
    if (trang <= 4) {
      for (let i = 2; i <= 5; i++) pages.push(i)
      pages.push('…', soTrang)
    } else if (trang >= soTrang - 3) {
      pages.push('…')
      for (let i = soTrang - 4; i <= soTrang; i++) pages.push(i)
    } else {
      pages.push('…', trang - 1, trang, trang + 1, '…', soTrang)
    }
    return pages
  }

  const danhSach = taoDanhSachTrang()

  return (
    <div className="pt-bar">
      <div className="pt-tong">Tổng <b>{tong}</b></div>
      <Select
        className="pt-sel"
        value={String(coTrang)}
        onChange={e => onCoTrang(Number(e.target.value))}
        aria-label="Số dòng mỗi trang"
      >
        <option value="20">20/trang</option>
        <option value="50">50/trang</option>
        <option value="100">100/trang</option>
      </Select>
      <div className="pt-nav">
        <button
          type="button"
          className="icon-btn sm pt-nav-btn"
          disabled={trang <= 1}
          onClick={() => onTrang(trang - 1)}
          title="Trang trước"
          aria-label="Trang trước"
        >
          <Icon n="chevl" className="ic sm" />
        </button>
        {danhSach.map((p, idx) => (
          typeof p === 'number' ? (
            <button
              key={`page-${p}`}
              type="button"
              className={`pt-num${p === trang ? ' on' : ''}`}
              onClick={() => onTrang(p)}
              aria-current={p === trang ? 'page' : undefined}
            >
              {p}
            </button>
          ) : (
            <span key={`dots-${idx}`} className="pt-cham" aria-hidden>…</span>
          )
        ))}
        <button
          type="button"
          className="icon-btn sm pt-nav-btn"
          disabled={trang >= soTrang}
          onClick={() => onTrang(trang + 1)}
          title="Trang sau"
          aria-label="Trang sau"
        >
          <Icon n="chevr" className="ic sm" />
        </button>
      </div>
    </div>
  )
}
