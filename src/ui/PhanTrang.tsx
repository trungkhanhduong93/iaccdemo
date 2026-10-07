// Phân trang danh sách dữ liệu: chuyển trang, chọn số dòng trên một trang
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

  // Tối đa 5 số trang quanh trang hiện tại
  let dau = Math.max(1, trang - 2)
  let cuoi = Math.min(soTrang, dau + 4)
  if (cuoi - dau < 4) {
    dau = Math.max(1, cuoi - 4)
  }
  const cacTrang: number[] = []
  for (let p = dau; p <= cuoi; p++) {
    cacTrang.push(p)
  }

  return (
    <div className="pt-bar">
      <div className="pt-tong">Tổng số: <b>{tong}</b></div>
      <div className="pt-phai">
        <span className="pt-co-nhan">Số dòng/trang</span>
        <Select value={String(coTrang)} onChange={e => onCoTrang(Number(e.target.value))}>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </Select>
        <div className="pt-nav">
          <button
            type="button"
            className="icon-btn sm"
            disabled={trang <= 1}
            onClick={() => onTrang(1)}
            title="Trang đầu"
            aria-label="Trang đầu"
          >
            <span aria-hidden="true" style={{ fontSize: 13, fontWeight: 700 }}>«</span>
          </button>
          <button
            type="button"
            className="icon-btn sm"
            disabled={trang <= 1}
            onClick={() => onTrang(trang - 1)}
            title="Trang trước"
            aria-label="Trang trước"
          >
            <Icon n="chevl" className="ic sm" />
          </button>
          {cacTrang.map(p => (
            <button
              key={p}
              type="button"
              className={`btn sm ghost pt-num${p === trang ? ' pt-hien-tai' : ''}`}
              onClick={() => onTrang(p)}
              aria-current={p === trang ? 'page' : undefined}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className="icon-btn sm"
            disabled={trang >= soTrang}
            onClick={() => onTrang(trang + 1)}
            title="Trang sau"
            aria-label="Trang sau"
          >
            <Icon n="chevr" className="ic sm" />
          </button>
          <button
            type="button"
            className="icon-btn sm"
            disabled={trang >= soTrang}
            onClick={() => onTrang(soTrang)}
            title="Trang cuối"
            aria-label="Trang cuối"
          >
            <span aria-hidden="true" style={{ fontSize: 13, fontWeight: 700 }}>»</span>
          </button>
        </div>
      </div>
    </div>
  )
}
