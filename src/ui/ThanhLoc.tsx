// Thanh lọc và chọn khoảng ngày theo mẫu iFaster (lượt 1/2).
// Hướng dẫn cho lượt 2:
// - Các control Select trong khung Bộ lọc cần trông như ô nhập cao 34px, rộng 100%:
//   dùng <Select className="inp"> (đã có style .sel.inp trong app.css).
import { useCallback, useRef, useState, type ReactNode } from 'react'
import { ChonKhoangNgay, type KhoangNgay } from './ChonNgay'
import { Popover } from './Dropdown'
import { Icon } from './Icon'

export function LocO({ nhan, children }: { nhan: string; children: ReactNode }) {
  return (
    <div className="loc-o">
      <div className="loc-o-nhan">{nhan}</div>
      <div className="loc-o-ctl">{children}</div>
    </div>
  )
}

export function NutVuong({ icon, title, onClick, on, dot, className = '' }: {
  icon: string
  title: string
  onClick?: () => void
  on?: boolean
  dot?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      className={`nut-vuong${on ? ' on' : ''} ${className}`.trim()}
      title={title}
      aria-label={title}
      onClick={onClick}
    >
      <Icon n={icon} className="ic sm" />
      {dot && <span className="nut-vuong-dot" />}
    </button>
  )
}

export function ThanhLoc({ tim, ngay, boLoc, dangLoc, onLamMoi, onTaiLai, phai }: {
  tim?: { value: string; onChange: (v: string) => void; placeholder?: string }
  ngay?: { value: KhoangNgay; onChange: (k: KhoangNgay) => void }
  boLoc?: ReactNode
  dangLoc?: boolean
  onLamMoi?: () => void
  onTaiLai?: () => void
  phai?: ReactNode
}) {
  const [moPheu, setMoPheu] = useState(false)
  const btnPheu = useRef<HTMLButtonElement>(null)

  const dongPheu = useCallback(() => setMoPheu(false), [])

  return (
    <div className="thanh-loc">
      {/* 1. Ô tìm kiếm */}
      {tim && (
        <div className="thanh-loc-tim">
          <Icon n="search" className="ic sm thanh-loc-tim-ic" />
          <input
            type="text"
            value={tim.value}
            onChange={e => tim.onChange(e.target.value)}
            placeholder={tim.placeholder ?? 'Tìm kiếm...'}
            className="thanh-loc-tim-inp"
          />
        </div>
      )}

      {/* 2. Chọn khoảng ngày */}
      {ngay && (
        <ChonKhoangNgay value={ngay.value} onChange={ngay.onChange} />
      )}

      {/* 3. Nút phễu lọc */}
      {boLoc && (
        <>
          <button
            ref={btnPheu}
            type="button"
            className={`nut-vuong${moPheu || dangLoc ? ' on' : ''}`}
            title="Bộ lọc"
            aria-label="Bộ lọc"
            onClick={() => setMoPheu(o => !o)}
          >
            <Icon n="filter" className="ic sm" />
            {dangLoc && <span className="nut-vuong-dot" />}
          </button>

          <Popover
            anchor={btnPheu}
            open={moPheu}
            onClose={dongPheu}
            align="start"
            width={600}
            role="dialog"
            className="pheu-pop"
          >
            <div className="pheu-khung">
              {/* Đầu khung */}
              <div className="pheu-dau">
                <span className="pheu-tieu-de">Bộ lọc</span>
                <button
                  type="button"
                  className="pheu-dong"
                  onClick={dongPheu}
                  title="Đóng bộ lọc"
                  aria-label="Đóng"
                >
                  <Icon n="x" className="ic sm" />
                </button>
              </div>

              {/* Thân lưới 2 cột */}
              <div className="pheu-than">
                {boLoc}
              </div>

              {/* Chân căn phải */}
              <div className="pheu-chan">
                {onLamMoi && (
                  <button type="button" className="btn sm" onClick={onLamMoi}>
                    Làm mới
                  </button>
                )}
                <button type="button" className="btn pri sm" onClick={dongPheu}>
                  Áp dụng
                </button>
              </div>
            </div>
          </Popover>
        </>
      )}

      {/* 4. Nút tải lại */}
      {onTaiLai && (
        <NutVuong icon="refresh" title="Tải lại" onClick={onTaiLai} />
      )}

      {/* 5. Khoảng trống co giãn */}
      <span className="grow" />

      {/* 6. Nhóm nút bên phải */}
      {phai && (
        <div className="thanh-loc-phai">
          {phai}
        </div>
      )}
    </div>
  )
}
