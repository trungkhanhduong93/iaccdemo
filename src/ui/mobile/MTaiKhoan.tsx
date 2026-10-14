import { useCallback, useMemo, useState, type FC } from 'react'
import type { ScreenProps } from '../../modules/types'
import { useSession } from '../../app/session'
import { heThongTk, type TaiKhoanDef, type TinhChatTk } from '../../modules/danh-muc/he-thong-tk'
import { TEN_ANH } from '../../modules/danh-muc/he-thong-tk-en'
import { fold } from '../format'
import { Icon } from '../Icon'
import { Select } from '../Dropdown'
import { MTrong } from './MTrong'

const DS_TINH_CHAT: { v: TinhChatTk; t: string }[] = [
  { v: 'Dư Nợ', t: 'Dư Nợ' },
  { v: 'Dư Có', t: 'Dư Có' },
  { v: 'Lưỡng tính', t: 'Lưỡng tính' },
  { v: 'Không số dư', t: 'Không số dư' },
]

const DS_CAP = [1, 2, 3, 4, 5].map(c => ({ v: String(c), t: `Cấp ${c}` }))

interface FormTaiKhoan {
  so: string
  ten: string
  cha: string
  cap: number
  tinhChat: TinhChatTk
  dienGiai: string
  dangDung: boolean
}

export const MTaiKhoan: FC<ScreenProps> = () => {
  const { s, toast } = useSession()
  const all = useMemo(() => heThongTk(s.cheDo), [s.cheDo])
  const bySo = useMemo(() => new Map(all.map(t => [t.so, t])), [all])

  const [q, setQ] = useState('')
  // Mặc định thu gọn cấp 1 (chưa mở cấp con nào)
  const [moRong, setMoRong] = useState<Set<string>>(() => new Set())
  const [dangSua, setDangSua] = useState<TaiKhoanDef | null>(null)
  const [moThem, setMoThem] = useState(false)

  const [form, setForm] = useState<FormTaiKhoan>({
    so: '',
    ten: '',
    cha: '',
    cap: 1,
    tinhChat: 'Dư Nợ',
    dienGiai: '',
    dangDung: true,
  })

  const toggleMoRong = useCallback((so: string) => {
    setMoRong(prev => {
      const next = new Set(prev)
      if (next.has(so)) next.delete(so)
      else next.add(so)
      return next
    })
  }, [])

  // Khi tìm kiếm: lọc theo số hoặc tên không dấu. Khi không tìm: hiển thị cây theo cấp thu gọn
  const hienThi = useMemo(() => {
    const tuKhoa = q.trim()
    if (tuKhoa) {
      const fq = fold(tuKhoa)
      return all.filter(tk => {
        const text = `${tk.so} ${tk.ten} ${TEN_ANH[tk.so] || ''}`
        return fold(text).includes(fq)
      })
    }

    // Khi không tìm: chỉ hiện các dòng mà tất cả cha của nó đều nằm trong moRong
    return all.filter(tk => {
      let cha = tk.cha
      while (cha) {
        if (!moRong.has(cha)) return false
        cha = bySo.get(cha)?.cha
      }
      return true
    })
  }, [all, q, moRong, bySo])

  const batDauThem = () => {
    setForm({
      so: '',
      ten: '',
      cha: '',
      cap: 1,
      tinhChat: 'Dư Nợ',
      dienGiai: '',
      dangDung: true,
    })
    setDangSua(null)
    setMoThem(true)
  }

  const batDauSua = (tk: TaiKhoanDef) => {
    setForm({
      so: tk.so,
      ten: tk.ten,
      cha: tk.cha || '',
      cap: tk.cap,
      tinhChat: tk.tinhChat,
      dienGiai: '',
      dangDung: true,
    })
    setDangSua(tk)
    setMoThem(true)
  }

  const dongForm = () => {
    setMoThem(false)
    setDangSua(null)
  }

  const luuForm = () => {
    if (!form.so.trim()) {
      toast('Vui lòng nhập số tài khoản')
      return
    }
    if (!form.ten.trim()) {
      toast('Vui lòng nhập tên tài khoản')
      return
    }
    toast(`Đã lưu tài khoản ${form.so}`)
    dongForm()
  }

  return (
    <div className="m-dmtk-khung">
      {/* Ô tìm kiếm */}
      <div className="m-dmtk-dau">
        <div className="m-dmtk-hang-tim">
          <div className="m-dmtk-tim">
            <Icon n="search" className="m-dmtk-tim-ic ic sm" />
            <input
              type="text"
              className="m-dmtk-tim-inp"
              placeholder="Tìm số, tên tài khoản..."
              value={q}
              onChange={e => setQ(e.target.value)}
              aria-label="Tìm kiếm tài khoản"
            />
            {q ? (
              <button
                type="button"
                className="m-dmtk-tim-x"
                onClick={() => setQ('')}
                aria-label="Xoá tìm kiếm"
              >
                <Icon n="x" className="ic sm" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="m-dmtk-tom-tat">
        <span>
          Tổng <b>{hienThi.length}</b> / {all.length} tài khoản
        </span>
      </div>

      {hienThi.length === 0 ? (
        <MTrong kieu="tim" tieuDe="Không tìm thấy tài khoản" moTa="Thử nhập số tài khoản hoặc tên không dấu khác" />
      ) : (
        <div className="m-dmtk-cay">
          {hienThi.map(tk => {
            const coCon = all.some(t => t.cha === tk.so)
            const daMo = moRong.has(tk.so)
            const leTrai = (tk.cap - 1) * 16

            return (
              <div
                key={tk.so}
                className={`m-dmtk-the${tk.laCha ? ' la-cha' : ''}`}
                style={{ paddingLeft: 12 + leTrai }}
                onClick={() => batDauSua(tk)}
                role="button"
                tabIndex={0}
              >
                <div className="m-dmtk-trai">
                  {coCon ? (
                    <button
                      type="button"
                      className={`m-dmtk-nut-mo${daMo ? ' mo' : ''}`}
                      onClick={e => {
                        e.stopPropagation()
                        toggleMoRong(tk.so)
                      }}
                      aria-label={daMo ? 'Thu gọn' : 'Mở rộng'}
                    >
                      <Icon n={daMo ? 'chevd' : 'chevr'} className="ic sm" />
                    </button>
                  ) : (
                    <span className="m-dmtk-nut-mo trong" />
                  )}
                  <span className="m-dmtk-so">{tk.so}</span>
                  <span className="m-dmtk-ten">{tk.ten}</span>
                </div>
                <div className="m-dmtk-phai">
                  <span className={`m-dmtk-chip-tc ${tk.tinhChat === 'Dư Nợ' ? 'no' : tk.tinhChat === 'Dư Có' ? 'co' : 'khac'}`}>
                    {tk.tinhChat}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Nút thêm nổi */}
      <button
        type="button"
        className="m-nut-them-fab"
        onClick={batDauThem}
        aria-label="Thêm tài khoản"
      >
        <Icon n="plus" className="ic sm" />
        <span>Thêm tài khoản</span>
      </button>

      {/* Tấm nổi từ đáy: Thêm / Sửa tài khoản */}
      {moThem && (
        <div className="m-form-dm m-dmtk-the-sua">
          <div className="overlay" onClick={dongForm} />
          <aside className="pn-hop">
            <div className="pn-dau">
              <div>
                <h3>{dangSua ? `Sửa tài khoản ${dangSua.so}` : 'Thêm tài khoản'}</h3>
                <small className="muted">Hệ thống tài khoản ({s.cheDo})</small>
              </div>
              <button type="button" className="icon-btn" onClick={dongForm} aria-label="Đóng">
                <Icon n="x" />
              </button>
            </div>

            <div className="pn-than">
              <div className="pn-luoi">
                <div className="f">
                  <label>Số tài khoản <em>*</em></label>
                  <input
                    className="inp"
                    value={form.so}
                    placeholder="Vd: 1111"
                    onChange={e => setForm(f => ({ ...f, so: e.target.value }))}
                  />
                </div>
                <div className="f">
                  <label>Tên tài khoản <em>*</em></label>
                  <input
                    className="inp"
                    value={form.ten}
                    placeholder="Vd: Tiền Việt Nam"
                    onChange={e => setForm(f => ({ ...f, ten: e.target.value }))}
                  />
                </div>
                <div className="f">
                  <label>Tính chất</label>
                  <Select
                    className="inp"
                    value={form.tinhChat}
                    ds={DS_TINH_CHAT}
                    onChange={e => setForm(f => ({ ...f, tinhChat: e.target.value as TinhChatTk }))}
                  />
                </div>
                <div className="f">
                  <label>Cấp</label>
                  <Select
                    className="inp"
                    value={String(form.cap)}
                    ds={DS_CAP}
                    onChange={e => setForm(f => ({ ...f, cap: Number(e.target.value) }))}
                  />
                </div>
                <div className="f">
                  <label>Diễn giải</label>
                  <textarea
                    className="inp"
                    rows={2}
                    value={form.dienGiai}
                    onChange={e => setForm(f => ({ ...f, dienGiai: e.target.value }))}
                  />
                </div>
                <div className="f">
                  <label className="row pn-tich">
                    <input
                      type="checkbox"
                      checked={form.dangDung}
                      onChange={e => setForm(f => ({ ...f, dangDung: e.target.checked }))}
                    />
                    <span>Đang sử dụng</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pn-chan">
              <button type="button" className="btn" onClick={dongForm}>Huỷ</button>
              <button type="button" className="btn pri" onClick={luuForm}>Lưu</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
