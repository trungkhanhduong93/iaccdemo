import { useEffect, useMemo, useState, type FC } from 'react'
import { Icon } from '../Icon'
import { fold } from '../format'

export interface MChonMuc {
  k: string
  ten: string
  moTa?: string
}

export interface MChonProps {
  mo: boolean
  onDong: () => void
  tieuDe: string
  ds: MChonMuc[]
  chon?: string
  onChon: (k: string) => void
  apDung?: boolean
  tim?: boolean
  onThem?: () => void
  nhanThem?: string
}

/** Hàng biểu tượng Thêm mới, Tải lại của sheet chọn danh mục, như ô chọn danh mục trên web (T538, T539) */
export const MThanhThem: FC<{ nhan: string, onThem?: () => void, onTaiLai: () => void }> = ({ nhan, onThem, onTaiLai }) => (   // không có onThem thì ẩn nút thêm, vd tab Thực đơn đồng bộ từ FABi (T705)
  <div className="m-tc-dt-thanh m-tam-thanh">
    {onThem && <button type="button" className="m-tc-dt-btn-ic" aria-label={nhan} title={nhan} onClick={onThem}>
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 5.2v5.6M5.2 8h5.6" />
      </svg>
    </button>}
    <button type="button" className="m-tc-dt-btn-ic" aria-label="Tải lại danh sách" title="Tải lại danh sách" onClick={onTaiLai}>
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.3 7.5A5.5 5.5 0 1 1 11.7 3.6L13.5 5.5" />
        <path d="M13.5 2v3.5H10" />
      </svg>
    </button>
  </div>
)

export const MChon: FC<MChonProps> = ({ mo, onDong, tieuDe, ds, chon, onChon, apDung, tim, onThem, nhanThem }) => {
  const [tamChon, setTamChon] = useState(chon ?? '')
  const [tuKhoa, setTuKhoa] = useState('')
  const [dangTai, setDangTai] = useState(false)

  useEffect(() => {
    if (mo) {
      setTamChon(chon ?? '')
      setTuKhoa('')
    }
  }, [mo, chon])

  const dsLoc = useMemo(() => {
    if (!tim || !tuKhoa.trim()) return ds
    const q = fold(tuKhoa.trim())
    return ds.filter(m => fold(m.ten).includes(q) || (m.moTa && fold(m.moTa).includes(q)))
  }, [ds, tim, tuKhoa])

  if (!mo) return null

  return (
    <div className="m-tam-overlay" onClick={onDong}>
      <div className={`m-tam-hop ${apDung ? 'm-tam-hop-apdung' : ''} ${tim ? 'm-tam-hop-tim' : ''}`} onClick={e => e.stopPropagation()}>
        {!apDung && <div className="m-tam-keo" />}
        <div className={`m-tam-dau ${apDung ? 'm-tam-dau-apdung' : ''}`}>
          <h2 className="m-tam-tieu">{tieuDe}</h2>
          <button type="button" className="m-tam-dong-btn" onClick={onDong} aria-label="Đóng">
            <Icon n="x" className="ic sm" />
          </button>
        </div>
        {tim && (
          <div className="m-tam-tim-wrap">
            <Icon n="search" className="ic sm m-tam-tim-ic" />
            <input
              type="text"
              className="m-tam-tim-inp"
              placeholder="Tìm kiếm"
              value={tuKhoa}
              onChange={e => setTuKhoa(e.target.value)}
            />
            {tuKhoa && (
              <button type="button" className="m-tam-tim-x" onClick={() => setTuKhoa('')} aria-label="Xoá tìm kiếm">
                <Icon n="x" className="ic sm" />
              </button>
            )}
          </div>
        )}
        {onThem && (
          <MThanhThem
            nhan={nhanThem ?? `Thêm ${tieuDe.replace(/^Chọn\s+/i, '').toLowerCase()}`}
            onThem={onThem}
            onTaiLai={() => {
              setDangTai(true)
              setTimeout(() => setDangTai(false), 600)
            }}
          />
        )}
        <div className="m-tam-ds">
          {dangTai ? <div className="m-tc-dt-dang-tai">Đang tải dữ liệu</div> : dsLoc.length === 0 ? <div className="m-tam-rong">Không tìm thấy kết quả phù hợp</div> : dsLoc.map(m => {
            const isChon = apDung ? m.k === tamChon : m.k === chon
            return (
              <div
                key={m.k}
                className={`m-tam-dong ${isChon ? 'on' : ''}`}
                onClick={() => {
                  if (apDung) {
                    setTamChon(m.k)
                  } else {
                    onChon(m.k)
                    onDong()
                  }
                }}
              >
                <div className="m-tam-dong-nd">
                  <div className="m-tam-dong-ten">{m.ten}</div>
                  {m.moTa && <div className="m-tam-dong-mota">{m.moTa}</div>}
                </div>
                {apDung ? (
                  <div className={`m-tam-radio ${isChon ? 'on' : ''}`}>
                    {isChon && <div className="m-tam-radio-cham" />}
                  </div>
                ) : (
                  isChon && (
                    <div className="m-tam-tich">
                      <Icon n="check" className="ic sm" />
                    </div>
                  )
                )}
              </div>
            )
          })}
        </div>
        {apDung && (
          <div className="m-tam-day">
            <button type="button" className="m-tam-btn-huy" onClick={onDong}>
              Huỷ
            </button>
            <button
              type="button"
              className="m-tam-btn-apdung"
              onClick={() => {
                onChon(tamChon)
                onDong()
              }}
            >
              Áp dụng
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
