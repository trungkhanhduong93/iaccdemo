import { useMemo, useState, type FC } from 'react'
import type { ScreenProps } from '../../modules/types'
import { useSession } from '../../app/session'
import { dsDuyetChungTu, type DuyetChungTuRow } from '../../modules/tien-ich/TienIch'
import { money } from '../format'
import { Icon } from '../Icon'
import { MTrong } from './MTrong'

export const MDuyetChungTu: FC<ScreenProps> = () => {
  const { toast } = useSession()
  const [cap, setCap] = useState<1 | 2>(1)
  const [rows1, setRows1] = useState<DuyetChungTuRow[]>(() => dsDuyetChungTu(1))
  const [rows2, setRows2] = useState<DuyetChungTuRow[]>(() => dsDuyetChungTu(2))
  const [daChon, setDaChon] = useState<string[]>([])
  const [dangXem, setDangXem] = useState<DuyetChungTuRow | null>(null)

  const activeRows = cap === 1 ? rows1 : rows2
  const setActiveRows = cap === 1 ? setRows1 : setRows2

  const tatCaDuocChon = activeRows.length > 0 && daChon.length === activeRows.length

  const chuyenCap = (c: 1 | 2) => {
    setCap(c)
    setDaChon([])
    setDangXem(null)
  }

  const toggleChon = (id: string) => {
    setDaChon(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    )
  }

  const toggleChonTatCa = () => {
    if (tatCaDuocChon) {
      setDaChon([])
    } else {
      setDaChon(activeRows.map(r => r.id))
    }
  }

  const duyetHangLoat = () => {
    const sl = daChon.length
    if (sl === 0) return
    setActiveRows(prev => prev.filter(r => !daChon.includes(r.id)))
    setDaChon([])
    toast(`Đã duyệt ${sl} chứng từ cấp ${cap}`)
  }

  const tuChoiHangLoat = () => {
    const sl = daChon.length
    if (sl === 0) return
    setActiveRows(prev => prev.filter(r => !daChon.includes(r.id)))
    setDaChon([])
    toast(`Đã từ chối ${sl} chứng từ cấp ${cap}`)
  }

  const duyetMot = (ct: DuyetChungTuRow) => {
    setActiveRows(prev => prev.filter(r => r.id !== ct.id))
    setDaChon(prev => prev.filter(x => x !== ct.id))
    toast(`Đã duyệt chứng từ ${ct.so}`)
    setDangXem(null)
  }

  const tuChoiMot = (ct: DuyetChungTuRow) => {
    setActiveRows(prev => prev.filter(r => r.id !== ct.id))
    setDaChon(prev => prev.filter(x => x !== ct.id))
    toast(`Đã từ chối chứng từ ${ct.so}`)
    setDangXem(null)
  }

  const dongSheet = () => setDangXem(null)

  return (
    <div className="m-dct">
      {/* 2 tabs cấp duyệt */}
      <div className="m-dct-tabs">
        <button
          type="button"
          className={`m-dct-tab ${cap === 1 ? 'on' : ''}`}
          onClick={() => chuyenCap(1)}
        >
          <span>Cấp 1: Vào sổ</span>
          <span className="m-dct-tab-so">{rows1.length}</span>
        </button>
        <button
          type="button"
          className={`m-dct-tab ${cap === 2 ? 'on' : ''}`}
          onClick={() => chuyenCap(2)}
        >
          <span>Cấp 2: Khoá sổ</span>
          <span className="m-dct-tab-so">{rows2.length}</span>
        </button>
      </div>

      {/* Thanh chọn tất cả */}
      <div className="m-dct-chon-tat">
        <button
          type="button"
          className="btn sm ghost"
          onClick={toggleChonTatCa}
          disabled={activeRows.length === 0}
        >
          <Icon n={tatCaDuocChon ? 'check' : 'layers'} className="ic sm" />
          <span>{tatCaDuocChon ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</span>
        </button>
        <span className="muted" style={{ fontSize: 13 }}>
          Đã chọn <b>{daChon.length}</b>/{activeRows.length}
        </span>
      </div>

      {/* Danh sách thẻ chứng từ */}
      {activeRows.length === 0 ? (
        <MTrong
          kieu="chung"
          tieuDe={`Không còn chứng từ chờ duyệt cấp ${cap}`}
          moTa="Chứng từ cần duyệt sẽ hiển thị ở đây"
        />
      ) : (
        <div className="m-dct-ds">
          {activeRows.map(r => {
            const isChon = daChon.includes(r.id)
            return (
              <div
                key={r.id}
                className={`m-dct-the ${isChon ? 'chon' : ''}`}
                onClick={() => setDangXem(r)}
                role="button"
                tabIndex={0}
              >
                <div
                  className="m-dct-the-trai"
                  onClick={e => {
                    e.stopPropagation()
                    toggleChon(r.id)
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChon}
                    onChange={() => {}}
                    aria-label={`Chọn ${r.so}`}
                  />
                </div>
                <div className="m-dct-the-phai">
                  <div className="m-dct-the-dau">
                    <span className="m-dct-so">{r.so}</span>
                    <span className="m-dct-loai">{r.loai}</span>
                  </div>
                  <div className="m-dct-the-than">
                    <span className="m-dct-nguoi">{r.nguoi}</span>
                    <span className="m-dct-ngay">{r.ngay}</span>
                  </div>
                  <div className="m-dct-the-chan">
                    <span className="m-dct-tien">{money(r.tien)} đ</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Hàng nút dính đáy: Duyệt / Từ chối */}
      <div className="m-dct-day">
        <button
          type="button"
          className="btn"
          disabled={daChon.length === 0}
          onClick={tuChoiHangLoat}
        >
          <span>Từ chối ({daChon.length})</span>
        </button>
        <button
          type="button"
          className="btn pri"
          disabled={daChon.length === 0}
          onClick={duyetHangLoat}
        >
          <Icon n="check" className="ic sm" />
          <span>Duyệt ({daChon.length})</span>
        </button>
      </div>

      {/* Tấm nổi từ đáy: Chi tiết chứng từ */}
      {dangXem && (
        <div className="m-dct-hop">
          <div className="overlay" onClick={dongSheet} />
          <aside className="pn-hop">
            <div className="pn-dau">
              <div>
                <h3>{dangXem.so}</h3>
                <small className="muted">{dangXem.loai}</small>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={dongSheet}
                aria-label="Đóng"
              >
                <Icon n="x" />
              </button>
            </div>

            <div className="pn-than">
              <div className="m-dct-ct-luoi">
                <div className="m-dct-ct-nhan">Số chứng từ</div>
                <div className="m-dct-ct-val" style={{ fontWeight: 600 }}>
                  {dangXem.so}
                </div>

                <div className="m-dct-ct-nhan">Loại chứng từ</div>
                <div className="m-dct-ct-val">{dangXem.loai}</div>

                <div className="m-dct-ct-nhan">Người lập</div>
                <div className="m-dct-ct-val">{dangXem.nguoi}</div>

                <div className="m-dct-ct-nhan">Ngày chứng từ</div>
                <div className="m-dct-ct-val">{dangXem.ngay}</div>

                <div className="m-dct-ct-nhan">Số tiền</div>
                <div
                  className="m-dct-ct-val"
                  style={{ fontWeight: 700, color: 'var(--ink)' }}
                >
                  {money(dangXem.tien)} đ
                </div>

                <div className="m-dct-ct-nhan">Cấp duyệt</div>
                <div className="m-dct-ct-val">
                  {cap === 1 ? 'Cấp 1 (Vào sổ)' : 'Cấp 2 (Khoá sổ)'}
                </div>
              </div>
            </div>

            <div className="pn-chan">
              <button
                type="button"
                className="btn"
                onClick={() => tuChoiMot(dangXem)}
              >
                Từ chối
              </button>
              <button
                type="button"
                className="btn pri"
                onClick={() => duyetMot(dangXem)}
              >
                Duyệt
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
