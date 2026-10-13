// Nút chấm tròn trạng thái bật/tắt trong bảng danh mục (T181)
import type { MouseEvent } from 'react'

export interface ChamTrangThaiProps {
  bat: boolean
  onToggle?: (e: MouseEvent<HTMLButtonElement>) => void
  title?: string
  ariaLabel?: string
  disabled?: boolean
}

export function ChamTrangThai({
  bat,
  onToggle,
  title,
  ariaLabel,
  disabled = false,
}: ChamTrangThaiProps) {
  const nhan = bat ? 'Đang dùng' : 'Ngừng dùng'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={bat}
      title={title ?? nhan}
      aria-label={ariaLabel ?? title ?? nhan}
      disabled={disabled}
      className={`cham-tt${bat ? ' bat' : ' tat'}`}
      onClick={e => {
        e.stopPropagation()
        onToggle?.(e)
      }}
    />
  )
}
