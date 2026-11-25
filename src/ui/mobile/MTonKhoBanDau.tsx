import { useEffect, useMemo, useState, type FC } from 'react'
import { createPortal } from 'react-dom'
import type { ScreenProps } from '../../modules/types'
import { KHO } from '../../data/mock'
import { cuaHangHienTai, useSession } from '../../app/session'
import { dsTonDau, giaNhapGanNhat, khoaTonDau, locChip, luuTonDau, useTonDau, type DongTonDau } from '../../modules/kho/ton-dau'
import { fold, money } from '../format'
import { Icon } from '../Icon'
import { MTrong } from './MTrong'

// Tồn kho ban đầu trên điện thoại: khai tồn cho từng kho của cửa hàng đang đứng (mở từ Số dư ban đầu).
// Dùng chung dữ liệu với màn web Kho 5.1.12: chỉ hiện hàng có tồn đầu; phễu ở đầu trang lọc theo kho và hàng hoá; bấm hàng để gõ số lượng, đơn giá.

export const MTonKhoBanDau: FC<ScreenProps> = () => {
  const { s, toast } = useSession()
  const phienBan = useTonDau()
  const cnChon = cuaHangHienTai(s)
  const dsKho = cnChon?.kho.length ? cnChon.kho : KHO   // Tất cả cửa hàng thì thấy kho của mọi cửa hàng
  const [khoChon, setKho] = useState(dsKho[0])
  const kho = dsKho.includes(khoChon) ? khoChon : dsKho[0]
  const [maHang, setMaHang] = useState('')   // lọc hàng hoá, rỗng là tất cả
  const [moLoc, setMoLoc] = useState(false)
  const [nhapKho, setNhapKho] = useState(kho)
  const [nhapHang, setNhapHang] = useState('')
  const [phaiEl, setPhaiEl] = useState<HTMLElement | null>(null)
  useEffect(() => { setPhaiEl(document.getElementById('m-thanh-tren-phai-slot')) }, [])
  const [tim, setTim] = useState('')
  const [dangSua, setDangSua] = useState<DongTonDau | null>(null)
  const [sl, setSl] = useState('')
  const [gia, setGia] = useState('')

  const ds = useMemo(() => dsTonDau(kho), [kho, phienBan])   // eslint-disable-line react-hooks/exhaustive-deps
  const hien = useMemo(() => {
    const q = fold(tim.trim())
    return locChip(ds, 'co').filter(d => (!maHang || d.ma === maHang) && (!q || fold(`${d.ma} ${d.ten}`).includes(q)))
  }, [ds, maHang, tim])
  const dsHangKho = useMemo(() => locChip(dsTonDau(nhapKho), 'co'), [nhapKho, phienBan])   // eslint-disable-line react-hooks/exhaustive-deps
  const moBoLoc = () => { setNhapKho(kho); setNhapHang(maHang); setMoLoc(true) }
  const apLoc = () => { setKho(nhapKho); setMaHang(nhapHang); setMoLoc(false) }
  const datLai = () => { setNhapKho(dsKho[0]); setNhapHang('') }
  const soLoc = (kho !== dsKho[0] ? 1 : 0) + (maHang ? 1 : 0)
  const tong = ds.filter(d => d.co).reduce((a, d) => a + (d.tien ?? 0), 0)

  const mo = (d: DongTonDau) => {
    if (khoaTonDau(kho)) { toast('Kho đã khoá sổ hoặc đã kiểm kê, không sửa được tồn đầu'); return }
    setDangSua(d)
    setSl(d.sl != null ? String(d.sl) : '')
    setGia(d.gia != null ? String(d.gia) : '')
  }
  const dong = () => setDangSua(null)
  const luu = () => {
    if (!dangSua) return
    luuTonDau(kho, [{ ma: dangSua.ma, dvt: dangSua.dvt, dvtCu: dangSua.dvt, sl: sl === '' ? null : Number(sl), gia: gia === '' ? null : Number(gia) }])
    toast('Đã lưu tồn đầu')
    dong()
  }
  const layGia = () => { const g = dangSua ? giaNhapGanNhat(dangSua.ma, kho) : null; if (g != null) setGia(String(g)) }

  return (
    <div className="m-sdb-khung">
      {phaiEl && createPortal(
        <button type="button" className="m-thanh-tren-nut-loc m-dm-nut-loc-pheu" onClick={moBoLoc} title="Bộ lọc tồn kho" aria-label="Bộ lọc tồn kho">
          <Icon n="filter" className="ic" />
          {soLoc > 0 && <span className="m-thanh-tren-loc-cham" />}
        </button>,
        phaiEl
      )}

      <div className="m-sdb-phu m-tkd-hang">Kho: <b>{kho}</b>{maHang ? <> · Hàng: <b>{ds.find(d => d.ma === maHang)?.ten ?? maHang}</b></> : null}</div>

      <input className="inp m-tkd-hang" placeholder="Tìm mã, tên hàng hoá" value={tim} onChange={e => setTim(e.target.value)} aria-label="Tìm hàng hoá" />

      {hien.length === 0 ? (
        <MTrong tieuDe="Chưa có hàng hoá" moTa="Không có hàng hoá nào trong nhóm này" />
      ) : (
        <div className="m-t449-hang-ds">
          {hien.map((d, idx) => (
            <div key={d.id} className="m-t449-hang-the" role="button" tabIndex={0} onClick={() => mo(d)}>
              <div className="m-t449-hang-dau">
                <div className="m-t449-hang-ten">
                  {idx + 1}. {d.ten}
                  <> <span className="m-t449-hang-ma" style={{ color: 'var(--muted)', fontWeight: 'normal' }}>{d.ma}</span></>
                </div>
              </div>
              <div className="m-t449-hang-than">
                <div className="m-t449-hang-dong">
                  <span className="lbl">Số lượng:</span>
                  <span className="val bold num">{d.sl != null ? `${money(d.sl)} ${d.dvt}` : '—'}</span>
                </div>
                <div className="m-t449-hang-dong">
                  <span className="lbl">Đơn giá:</span>
                  <span className="val num">{d.gia != null ? `${money(d.gia)} đ` : '—'}</span>
                </div>
                <div className="m-t449-hang-dong">
                  <span className="lbl">Tổng tiền:</span>
                  <span className="val bold num">{d.tien != null ? `${money(d.tien)} đ` : '—'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="m-sdb-tong">
        <span className="m-sdb-tong-txt">Tổng giá trị tồn đầu: <b>{money(tong)} đ</b></span>
      </div>

      {moLoc && (
        <div className="m-form-dm m-sdb-form-hop">
          <div className="overlay" onClick={() => setMoLoc(false)} />
          <aside className="pn-hop">
            <div className="pn-dau">
              <h3>Bộ lọc tồn kho</h3>
              <button type="button" className="icon-btn" onClick={() => setMoLoc(false)} aria-label="Đóng"><Icon n="x" /></button>
            </div>
            <div className="pn-than">
              <div className="pn-luoi">
                <div className="f">
                  <label>Kho</label>
                  <select className="inp" value={nhapKho} onChange={e => { setNhapKho(e.target.value); setNhapHang('') }}>
                    {dsKho.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="f">
                  <label>Hàng hoá</label>
                  <select className="inp" value={nhapHang} onChange={e => setNhapHang(e.target.value)}>
                    <option value="">Tất cả hàng hoá</option>
                    {dsHangKho.map(d => <option key={d.id} value={d.ma}>{d.ma} - {d.ten}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="pn-chan">
              <button type="button" className="btn" onClick={datLai}>Đặt lại</button>
              <button type="button" className="btn pri" onClick={apLoc}>Áp dụng</button>
            </div>
          </aside>
        </div>
      )}

      {dangSua && (
        <div className="m-form-dm m-sdb-form-hop">
          <div className="overlay" onClick={dong} />
          <aside className="pn-hop">
            <div className="pn-dau">
              <div>
                <h3>{dangSua.ten}</h3>
                <small className="muted">{dangSua.ma} · {dangSua.dvt} · {kho}</small>
              </div>
              <button type="button" className="icon-btn" onClick={dong} aria-label="Đóng"><Icon n="x" /></button>
            </div>
            <div className="pn-than">
              <div className="pn-luoi">
                <div className="f">
                  <label>Số lượng ({dangSua.dvt})</label>
                  <input type="number" inputMode="decimal" className="inp num" value={sl} onChange={e => setSl(e.target.value)} />
                </div>
                <div className="f">
                  <label>Đơn giá (đ)</label>
                  <input type="number" inputMode="decimal" className="inp num" value={gia} onChange={e => setGia(e.target.value)} />
                </div>
                <button type="button" className="btn sm" onClick={layGia}>Lấy giá nhập gần nhất</button>
              </div>
            </div>
            <div className="pn-chan">
              <button type="button" className="btn" onClick={dong}>Huỷ</button>
              <button type="button" className="btn pri" onClick={luu}>Lưu</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
