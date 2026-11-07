import { useEffect, useRef, useState, type JSX } from 'react'
import { Popover } from './Dropdown'
import type { Thang } from '../modules/kho/tinh-gia-von/du-lieu'

export type { Thang }

export function ChonThang(props: {
  value: Thang | null
  onChange: (t: Thang) => void
  goiY?: string
  btnClass?: string
  disabled?: boolean
  loi?: boolean
}): JSX.Element {
  const { value, onChange, goiY, btnClass = '', disabled = false, loi = false } = props
  const [open, setOpen] = useState(false)
  const nutRef = useRef<HTMLButtonElement>(null)

  const nay = new Date()
  const thangNay = nay.getMonth() + 1
  const namNay = nay.getFullYear()

  const [namXem, setNamXem] = useState<number>(() => value?.n ?? namNay)

  useEffect(() => {
    if (open) {
      setNamXem(value?.n ?? namNay)
    }
  }, [open, value, namNay])

  return (
    <>
      <button
        ref={nutRef}
        type="button"
        className={`ct-nut${btnClass ? ` ${btnClass}` : ''}${loi ? ' loi' : ''}`}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (!disabled) setOpen(o => !o)
        }}
      >
        <span className="ct-gt">
          {value ? (
            <span>Tháng {value.t}/{value.n}</span>
          ) : (
            <span className="cthang-goi-y">{goiY ?? 'Vui lòng chọn thời gian'}</span>
          )}
        </span>
        <svg
          className="ct-icon"
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          aria-hidden="true"
        >
          <rect x="2" y="3" width="12" height="11" rx="1.5" />
          <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" />
        </svg>
      </button>

      {open && (
        <Popover
          anchor={nutRef}
          open={open}
          onClose={() => setOpen(false)}
          className="ct-pop"
          role="dialog"
        >
          <div className="ct-lich-dau">
            <button
              type="button"
              aria-label="Năm trước"
              onClick={() => setNamXem(n => n - 1)}
            >
              &laquo;
            </button>
            <b>Năm {namXem}</b>
            <button
              type="button"
              aria-label="Năm sau"
              disabled={namXem >= namNay}
              onClick={() => setNamXem(n => n + 1)}
            >
              &raquo;
            </button>
          </div>
          <div className="ct-thang">
            {Array.from({ length: 12 }, (_, i) => {
              const t = i + 1
              const tuongLai = namXem > namNay || (namXem === namNay && t > thangNay)
              const dangChon = value && value.t === t && value.n === namXem
              const laNay = namXem === namNay && t === thangNay
              return (
                <button
                  key={t}
                  type="button"
                  className={`${laNay ? 'nay' : ''}${dangChon ? ' chon' : ''}`}
                  aria-pressed={!!dangChon}
                  aria-label={`Tháng ${t}/${namXem}`}
                  disabled={tuongLai}
                  onClick={() => {
                    onChange({ t, n: namXem })
                    setOpen(false)
                    nutRef.current?.focus()
                  }}
                >
                  Th.{t}
                </button>
              )
            })}
          </div>
        </Popover>
      )}
    </>
  )
}
