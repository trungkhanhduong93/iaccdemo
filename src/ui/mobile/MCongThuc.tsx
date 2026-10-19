import { useMemo, useState, type FC } from 'react'
import type { Row, ScreenProps } from '../../modules/types'
import { useSession } from '../../app/session'
import { Icon } from '../Icon'
import { Select } from '../Dropdown'
import { ONgay } from '../ChonNgay'
import { fold, money } from '../format'
import { MTrong } from './MTrong'
import { suaPhieu, themPhieu } from '../generic/daXoa'
import {
  hangCua,
  soLuong,
  tenKhoAd,
  type TtCongThuc,
  type NvlCongThuc,
} from '../../modules/kho/san-xuat'
import {
  useDsCongThuc,
  nvlCua,
  DS_SP,
  DS_NVL,
} from '../../modules/kho/CongThuc'

type LoaiCt = 'cb' | 'sc'
const MAN: Record<LoaiCt, string> = { cb: 'kho/9-1-3', sc: 'kho/5-1-5' }

export const MCongThuc: FC<ScreenProps> = ({ sc }) => {
  const { s, toast } = useSession()
  const loai: LoaiCt = sc.code === '5.1.5' || sc.slug === '5-1-5' ? 'sc' : 'cb'
  const cb = loai === 'cb'
  const ds = useDsCongThuc(loai)

  const khoaSp = cb ? 'spMa' : 'gocMa'
  const nhanSp = cb ? 'Sản phẩm' : 'Nguyên vật liệu gốc'
  const nhanNvl = cb ? 'Nguyên vật liệu' : 'Nguyên vật liệu đích'

  // Tìm kiếm
  const [q, setQ] = useState('')
  // Xem chi tiết công thức
  const [dangXem, setDangXem] = useState<Row | null>(null)
  // Mở form Thêm / Sửa
  const [dangSua, setDangSua] = useState<Row | null>(null)
  const [moForm, setMoForm] = useState(false)

  // State form
  const [formSp, setFormSp] = useState('')
  const [formNgay, setFormNgay] = useState('07/10/2026')
  const [formNvl, setFormNvl] = useState<NvlCongThuc[]>([])

  // Danh sách công thức lọc theo ô tìm kiếm
  const hienThi = useMemo(() => {
    if (!q.trim()) return ds
    const f = fold(q.trim())
    return ds.filter(c => {
      const sp = String(c[khoaSp])
      const h = hangCua(sp)
      const tenSp = h?.ten ?? sp
      const nvl = nvlCua(c)
      const nvlTxt = nvl.map(n => `${hangCua(n.ma)?.ten ?? n.ma} ${n.ma}`).join(' ')
      return fold(`${tenSp} ${sp} ${c.ma} ${nvlTxt}`).includes(f)
    })
  }, [ds, q, khoaSp])

  // Bật / tắt công thức
  const doiTt = (c: Row, e: React.MouseEvent) => {
    e.stopPropagation()
    const moi: TtCongThuc = c.tt === 'on' ? 'off' : 'on'
    suaPhieu(MAN[loai], String(c.id), { tt: moi })
    toast(`${moi === 'on' ? 'Đã bật' : 'Đã tắt'} công thức`)
  }

  // Mở xem chi tiết
  const xemCongThuc = (c: Row) => {
    setDangXem(c)
  }

  // Bắt đầu sửa
  const batDauSua = (c: Row) => {
    setDangSua(c)
    setFormSp(String(c[khoaSp] ?? ''))
    setFormNgay(String(c.ngay ?? '07/10/2026'))
    setFormNvl(nvlCua(c).map(n => ({ ...n })))
    setMoForm(true)
  }

  // Bắt đầu thêm
  const batDauThem = () => {
    setDangSua(null)
    setFormSp('')
    setFormNgay('07/10/2026')
    setFormNvl([{ ma: DS_NVL[0]?.ma ?? '', sl: 1 }])
    setMoForm(true)
  }

  // Đóng form
  const dongForm = () => {
    setMoForm(false)
    setDangSua(null)
  }

  // Lưu form
  const luuForm = () => {
    if (!formSp) {
      toast(`Vui lòng chọn ${nhanSp.toLowerCase()}`)
      return
    }
    if (!formNvl.length) {
      toast(`Vui lòng thêm ${nhanNvl.toLowerCase()}`)
      return
    }

    const ma = dangSua
      ? String(dangSua.ma)
      : `${cb ? 'CTCB' : 'CTSC'}${String(ds.length + 1).padStart(3, '0')}`
    const nd: Row = cb
      ? {
          ma,
          spMa: formSp,
          ngay: formNgay,
          kenh: dangSua?.kenh ?? ['Tại quán', 'Mang về'],
          kho: dangSua?.kho ?? [],
          moTa: dangSua?.moTa ?? '',
          tt: dangSua?.tt ?? 'on',
          nvl: formNvl,
        }
      : {
          ma,
          gocMa: formSp,
          ngay: formNgay,
          kho: dangSua?.kho ?? [],
          moTa: dangSua?.moTa ?? '',
          tt: dangSua?.tt ?? 'on',
          dich: formNvl,
        }

    if (dangSua) {
      suaPhieu(MAN[loai], String(dangSua.id), nd)
      toast(`Đã lưu công thức ${hangCua(formSp)?.ten ?? ''}`)
    } else {
      themPhieu(MAN[loai], { id: `moi-${Date.now()}`, ...nd }, s.ten)
      toast(`Đã thêm công thức ${hangCua(formSp)?.ten ?? ''}`)
    }

    dongForm()
    setDangXem(null)
  }

  const dsChonSp = useMemo(() => {
    const nguon = cb ? DS_SP : DS_NVL
    return nguon.map(h => ({ v: h.ma, t: `${h.ten} - ${h.ma}` }))
  }, [cb])

  const dsChonNvl = useMemo(() => {
    return DS_NVL.map(h => ({ v: h.ma, t: `${h.ten} - ${h.ma}` }))
  }, [])

  return (
    <div className="m-ct-khung">
      {/* Ô tìm kiếm */}
      <div className="m-ct-dau">
        <div className="m-ct-tim">
          <Icon n="search" className="m-ct-tim-ic ic sm" />
          <input
            type="text"
            className="m-ct-tim-inp"
            placeholder={`Tìm ${nhanSp.toLowerCase()}, nguyên liệu...`}
            value={q}
            onChange={e => setQ(e.target.value)}
            aria-label="Tìm kiếm công thức"
          />
          {q ? (
            <button
              type="button"
              className="m-ct-tim-x"
              onClick={() => setQ('')}
              aria-label="Xoá tìm kiếm"
            >
              <Icon n="x" className="ic sm" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Danh sách thẻ công thức */}
      {hienThi.length === 0 ? (
        <MTrong
          kieu="tim"
          tieuDe="Không tìm thấy công thức"
          moTa="Thử tìm theo mã hoặc tên hàng khác"
        />
      ) : (
        <div className="m-ct-ds">
          {hienThi.map(c => {
            const spMa = String(c[khoaSp])
            const h = hangCua(spMa)
            const nvl = nvlCua(c)
            const tongCp = nvl.reduce(
              (a, n) => a + Math.round(n.sl * (hangCua(n.ma)?.gia ?? 0)),
              0
            )
            const ttCls = c.tt === 'on' ? 'on' : c.tt === 'off' ? 'off' : 'nhap'
            const ttTxt =
              c.tt === 'on'
                ? 'Đang hoạt động'
                : c.tt === 'off'
                ? 'Không hoạt động'
                : 'Bản nháp'

            return (
              <div
                key={String(c.id)}
                className="m-ct-the"
                onClick={() => xemCongThuc(c)}
                role="button"
                tabIndex={0}
              >
                <div className="m-ct-the-dau">
                  <div className="m-ct-tp">
                    <b>{h?.ten ?? spMa}</b>
                    <span className="m-ct-ma"> - {spMa}</span>
                  </div>
                  <span className="code">{c.ma}</span>
                </div>

                <div className="m-ct-the-than">
                  <span className="m-ct-nvl-so">
                    {nvl.length} {cb ? 'nguyên vật liệu' : 'nguyên liệu đích'}
                  </span>
                  <span className="m-ct-gia-von">
                    Định mức: <b>{money(tongCp)} đ</b>
                  </span>
                </div>

                <div className="m-ct-the-chan">
                  <span className={`m-ct-tt-chip ${ttCls}`}>{ttTxt}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={c.tt === 'on'}
                    aria-label={c.tt === 'on' ? 'Tắt công thức' : 'Bật công thức'}
                    className={`ds-ct${c.tt === 'on' ? ' on' : ''}`}
                    onClick={e => doiTt(c, e)}
                  >
                    <i />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Nút thêm công thức nổi FAB */}
      <button
        type="button"
        className="m-nut-them-fab"
        onClick={batDauThem}
        aria-label="Thêm công thức"
      >
        <Icon n="plus" className="ic sm" />
        <span>Thêm công thức</span>
      </button>

      {/* Tấm nổi từ đáy: Xem chi tiết thành phần định lượng */}
      {dangXem && (
        <div className="m-form-dm m-ct-sheet-hop">
          <div className="overlay" onClick={() => setDangXem(null)} />
          <aside className="pn-hop">
            <div className="pn-dau m-ct-sheet-dau">
              <div>
                <h3>{hangCua(String(dangXem[khoaSp]))?.ten ?? dangXem[khoaSp]}</h3>
                <small className="muted">
                  Mã: {dangXem.ma} · Ngày: {dangXem.ngay}
                </small>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setDangXem(null)}
                aria-label="Đóng"
              >
                <Icon n="x" />
              </button>
            </div>

            <div className="pn-than m-ct-sheet-than">
              <div className="m-ct-sheet-tt-hang">
                <div>
                  <small className="muted">Kho áp dụng</small>
                  <div><b>{tenKhoAd((dangXem.kho as string[]) ?? [])}</b></div>
                </div>
                {cb && (
                  <div>
                    <small className="muted">Kênh áp dụng</small>
                    <div>
                      <b>
                        {((dangXem.kenh as string[]) ?? []).join(', ') || 'Tất cả kênh'}
                      </b>
                    </div>
                  </div>
                )}
              </div>

              <div className="m-ct-sheet-nvl">
                <h4 style={{ margin: '12px 0 8px', fontSize: 14 }}>
                  Thành phần định lượng ({nvlCua(dangXem).length} nguyên liệu)
                </h4>
                {nvlCua(dangXem).map((n, idx) => {
                  const h = hangCua(n.ma)
                  const cp = Math.round(n.sl * (h?.gia ?? 0))
                  return (
                    <div key={idx} className="m-ct-nvl-dong">
                      <div className="m-ct-nvl-trai">
                        <div className="m-ct-nvl-ten">{h?.ten ?? n.ma}</div>
                        <small className="muted">{n.ma} · Giá: {money(h?.gia ?? 0)} đ/{h?.dvt ?? ''}</small>
                      </div>
                      <div className="m-ct-nvl-phai">
                        <div className="m-ct-nvl-sl">
                          <b>{soLuong(n.sl)}</b> {h?.dvt ?? ''}
                        </div>
                        <div className="m-ct-nvl-tien">{money(cp)} đ</div>
                      </div>
                    </div>
                  )
                })}

                <div className="m-ct-nvl-tong">
                  <span>Tổng giá vốn định mức:</span>
                  <b>
                    {money(
                      nvlCua(dangXem).reduce(
                        (a, n) => a + Math.round(n.sl * (hangCua(n.ma)?.gia ?? 0)),
                        0
                      )
                    )}{' '}
                    đ
                  </b>
                </div>
              </div>
            </div>

            <div className="pn-chan">
              <button
                type="button"
                className="btn"
                onClick={() => setDangXem(null)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="btn pri"
                onClick={() => {
                  const target = dangXem
                  setDangXem(null)
                  batDauSua(target)
                }}
              >
                Sửa công thức
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Tấm nổi từ đáy: Thêm / Sửa công thức */}
      {moForm && (
        <div className="m-form-dm m-ct-sheet-hop">
          <div className="overlay" onClick={dongForm} />
          <aside className="pn-hop">
            <div className="pn-dau m-ct-sheet-dau">
              <div>
                <h3>{dangSua ? `Sửa công thức ${dangSua.ma}` : 'Thêm công thức mới'}</h3>
                <small className="muted">
                  {cb ? 'Công thức chế biến' : 'Công thức sơ chế'}
                </small>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={dongForm}
                aria-label="Đóng"
              >
                <Icon n="x" />
              </button>
            </div>

            <div className="pn-than m-ct-sheet-than">
              <div className="pn-luoi">
                <div className="f">
                  <label>{nhanSp} <em>*</em></label>
                  <Select
                    className="inp"
                    value={formSp}
                    ds={[{ v: '', t: `-- Chọn ${nhanSp.toLowerCase()} --` }, ...dsChonSp]}
                    onChange={e => setFormSp(e.target.value)}
                  />
                </div>

                <div className="f">
                  <label>Ngày áp dụng <em>*</em></label>
                  <ONgay value={formNgay} onChange={setFormNgay} />   {/* chọn ngày bằng lịch (T464) */}
                </div>

                <div className="f">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0' }}>
                    <label style={{ margin: 0 }}>{nhanNvl} định lượng</label>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => setFormNvl(ds => [...ds, { ma: DS_NVL[0]?.ma ?? '', sl: 1 }])}
                    >
                      + Thêm dòng
                    </button>
                  </div>

                  {formNvl.map((n, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Select
                          className="inp sm"
                          value={n.ma}
                          ds={dsChonNvl}
                          onChange={e => {
                            const val = e.target.value
                            setFormNvl(cur => cur.map((item, idx) => (idx === i ? { ...item, ma: val } : item)))
                          }}
                        />
                      </div>
                      <input
                        type="number"
                        className="inp sm num"
                        style={{ width: 80 }}
                        value={n.sl}
                        step="0.01"
                        min="0"
                        onChange={e => {
                          const slVal = parseFloat(e.target.value) || 0
                          setFormNvl(cur => cur.map((item, idx) => (idx === i ? { ...item, sl: slVal } : item)))
                        }}
                      />
                      <button
                        type="button"
                        className="icon-btn sm"
                        onClick={() => setFormNvl(cur => cur.filter((_, idx) => idx !== i))}
                        aria-label="Xoá dòng"
                      >
                        <Icon n="trash" className="ic sm" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pn-chan">
              <button type="button" className="btn" onClick={dongForm}>
                Huỷ
              </button>
              <button type="button" className="btn pri" onClick={luuForm}>
                Lưu
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
