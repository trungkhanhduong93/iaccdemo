// Bảng dòng chứng từ gõ trực tiếp và xem chi tiết theo chuẩn AMIS
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { VoucherCfg } from '../../modules/types'
import { CONG_VIEC, HANG, KHACH, KHO, KHOAN_MUC, NCC, NHAN_VIEN, NVL } from '../../data/mock'
import { Select } from '../Dropdown'
import { ChonDanhMuc, useMucDaThem } from '../ChonDanhMuc'
import { Icon } from '../Icon'
import { money } from '../format'
import type { Dong } from './gen'

export const DS_DOI_TUONG = Array.from(new Set([
  ...KHACH.map(x => x.ten),
  ...NCC.map(x => x.ten),
  ...NHAN_VIEN.map(x => x.ten),
]))

export interface BangSuaProps {
  cfg: VoucherCfg
  dong: Dong[]
  onChange?: (ds: Dong[]) => void
  cheDo: 'xem' | 'sua'
  coTk?: boolean
  nhanTk?: [string, string]
  coKho?: boolean
  coCk?: boolean
  coLo?: boolean
  coKm?: boolean               // dòng tiền có cột Khoản mục, Công việc; gói Free không có
  khoMacDinh?: string
  lyDo?: { nhan: string; ds: string[]; macDinh: string }   // cột Lý do thu, chi trên dòng phiếu tiền (T49)
  dtMacDinh?: string           // đối tượng của dòng mới, theo đối tượng đầu phiếu (T49)
  an?: string[]                // mã cột người dùng ẩn qua Tuỳ chỉnh giao diện phiếu (T49)
  khongTong?: boolean          // bỏ dòng Tổng cộng khi tổng đã hiện ở đáy form (phiếu thu chi)
}

/** Các cột ẩn hiện được của bảng chi tiết, theo loại phiếu (T49) */
export function cotTuyChon(cfg: VoucherCfg, o: { coKho?: boolean; coLo?: boolean; coCk?: boolean; coKm?: boolean; coLy?: boolean }): [string, string][] {
  const hang = cfg.dong === 'hang' || cfg.dong === 'nvl'
  const tien = cfg.dong === 'tien'
  const ds: [string, string, boolean | undefined][] = [
    ['kho', 'Kho', o.coKho], ['dvt', 'ĐVT', hang], ['lo', 'Số lô, hạn dùng', hang && o.coLo],
    ['ly', 'Lý do', tien && o.coLy], ['dt', 'Đối tượng', tien && cfg.doiTuong !== 'none'],
    ['km', 'Khoản mục', tien && o.coKm], ['cv', 'Công việc', tien && o.coKm],
    ['ck', 'Chiết khấu', o.coCk], ['thue', 'Thuế suất, tiền thuế', cfg.thue !== undefined || hang],
  ]
  return ds.filter(x => x[2]).map(([k, ten]) => [k, ten])
}

/** Ô nhập số: hiện số thô khi đang gõ, hiển thị định dạng có dấu chấm khi rời ô */
function OSo({
  val,
  onChange,
  disabled,
  placeholder = '0',
  className = 'inp sm num',
}: {
  val: number
  onChange?: (v: number) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}) {
  const [focus, setFocus] = useState(false)
  const [str, setStr] = useState(String(val || 0))

  useEffect(() => {
    if (!focus) setStr(String(val || 0))
  }, [val, focus])

  if (disabled) return <span className="num">{money(val)}</span>

  return (
    <input
      type="text"
      className={className}
      value={focus ? str : money(val)}
      placeholder={placeholder}
      onFocus={() => {
        setFocus(true)
        setStr(val === 0 ? '' : String(val))
      }}
      onChange={e => setStr(e.target.value.replace(/[^0-9.-]/g, ''))}
      onBlur={() => {
        setFocus(false)
        const n = parseFloat(str) || 0
        onChange?.(n)
      }}
    />
  )
}

export function BangSua({
  cfg,
  dong,
  onChange,
  cheDo,
  coTk = false,
  nhanTk = ['TK Nợ', 'TK Có'],
  coKho = false,
  coCk = false,
  coLo = false,
  coKm = true,
  khoMacDinh = 'Kho tổng',
  lyDo,
  dtMacDinh = '',
  an = [],
  khongTong = false,
}: BangSuaProps) {
  const hang = cfg.dong === 'hang' || cfg.dong === 'nvl'
  const tienDong = cfg.dong === 'tien'
  // Cột người dùng đã ẩn qua Tuỳ chỉnh giao diện phiếu
  const hien = (k: string) => !an.includes(k)
  coKho = coKho && hien('kho')
  coLo = coLo && hien('lo')
  coCk = coCk && hien('ck')
  const dvtCot = hang && hien('dvt')
  const thueCot = (cfg.thue !== undefined || hang) && hien('thue')
  const kmDong = tienDong && coKm && hien('km')
  const cvDong = tienDong && coKm && hien('cv')
  const dtDong = tienDong && cfg.doiTuong !== 'none' && hien('dt')   // phiếu chuyển quỹ không có đối tượng
  const lyDong = tienDong && Boolean(lyDo) && hien('ly')
  const danhMucHang = cfg.dong === 'nvl' ? NVL : HANG
  // Hàng hoá thêm mới ngay tại form (T65): đơn vị tính tạm "cái", giá 0, sửa trên dòng
  const dmHang = cfg.dong === 'nvl' ? 'nvl' : 'hang'
  const hangThem = useMucDaThem(dmHang)

  const colSpanDau = hang
    ? 3 + (dvtCot ? 1 : 0) + (coKho ? 1 : 0) + (coLo ? 2 : 0) + (coTk ? 2 : 0)
    : 2 + (coKho ? 1 : 0) + (coTk ? 2 : 0) + (lyDong ? 1 : 0) + (dtDong ? 1 : 0) + (kmDong ? 1 : 0) + (cvDong ? 1 : 0)

  function capNhat(idx: number, patch: Partial<Dong>) {
    if (!onChange) return
    const moi = dong.map((d, i) => {
      if (i !== idx) return d
      const hopNhat = { ...d, ...patch }
      const sl = hopNhat.sl ?? 0
      const gia = hopNhat.gia ?? 0
      const tien = patch.tien !== undefined ? patch.tien : Math.round(sl * gia)
      const ptCk = hopNhat.ptCk ?? 0
      const ck = patch.ck !== undefined ? patch.ck : Math.round(tien * ptCk / 100)
      const ts = hopNhat.ts ?? 0
      const thue = patch.thue !== undefined ? patch.thue : Math.round((tien - ck) * ts / 100)
      return { ...hopNhat, sl, gia, tien, ptCk, ck, ts, thue }
    })
    onChange(moi)
  }

  function chonMaHang(idx: number, ma: string, muc?: { v: string; t: string }) {
    const item = danhMucHang.find(x => x.ma === ma)
    if (!item) {
      const moi = muc ?? hangThem.find(x => x.v === ma)
      capNhat(idx, moi ? { ma, ten: moi.t.split(' - ').slice(1).join(' - '), dvt: dong[idx]?.dvt || 'cái' } : { ma })
      return
    }
    const sl = dong[idx]?.sl || 1
    const gia = item.gia
    const tien = sl * gia
    const ptCk = dong[idx]?.ptCk ?? 0
    const ck = Math.round(tien * ptCk / 100)
    const ts = cfg.thue === 0 ? 0 : item.ts
    const thue = Math.round((tien - ck) * ts / 100)
    capNhat(idx, {
      ma: item.ma,
      ten: item.ten,
      dvt: item.dvt,
      gia,
      sl,
      tien,
      ptCk,
      ck,
      ts,
      thue,
      kho: dong[idx]?.kho || khoMacDinh,
    })
  }

  function themDong() {
    if (!onChange) return
    const mauHang = danhMucHang[0]
    const dongMoi: Dong = hang && mauHang ? {
      ma: mauHang.ma,
      ten: mauHang.ten,
      dvt: mauHang.dvt,
      sl: 1,
      gia: mauHang.gia,
      tien: mauHang.gia,
      ts: cfg.thue === 0 ? 0 : mauHang.ts,
      thue: Math.round(mauHang.gia * (cfg.thue === 0 ? 0 : mauHang.ts) / 100),
      ptCk: 0,
      ck: 0,
      kho: khoMacDinh,
      dt: '',
      km: '',
      cv: '',
      lo: '',
      hsd: '',
    } : {
      ma: '',
      ten: cfg.dienGiai?.[0] ?? 'Nội dung chứng từ',
      dvt: '',
      sl: 1,
      gia: 1_000_000,
      tien: 1_000_000,
      ts: cfg.thue ?? 0,
      thue: Math.round(1_000_000 * (cfg.thue ?? 0) / 100),
      dt: dtMacDinh,
      ly: lyDo?.macDinh,
      km: '',
      cv: '',
      lo: '',
      hsd: '',
    }
    onChange([...dong, dongMoi])
  }

  function xoaDong(idx: number) {
    if (!onChange) return
    onChange(dong.filter((_, i) => i !== idx))
  }

  function xoaHet() {
    if (!onChange) return
    onChange([])
  }

  const tongSl = dong.reduce((a, d) => a + (d.sl || 0), 0)
  const tongTien = dong.reduce((a, d) => a + (d.tien || 0), 0)
  const tongCk = dong.reduce((a, d) => a + (d.ck || 0), 0)
  const tongThue = dong.reduce((a, d) => a + (d.thue || 0), 0)

  if (cheDo === 'xem') {
    return (
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th className="dim" style={{ width: 40 }}>#</th>
              {hang && <th className="code" style={{ width: 90 }}>Mã hàng</th>}
              <th>{hang ? 'Tên hàng hoá, dịch vụ' : 'Diễn giải'}</th>
              {coKho && <th style={{ width: 140 }}>Kho</th>}
              {dvtCot && <th style={{ width: 60 }}>ĐVT</th>}
              {hang && coLo && (
                <>
                  <th style={{ width: 100 }}>Số lô</th>
                  <th style={{ width: 105 }}>Hạn dùng</th>
                </>
              )}
              {coTk && (
                <>
                  <th className="code" style={{ width: 80 }}>{nhanTk[0]}</th>
                  <th className="code" style={{ width: 80 }}>{nhanTk[1]}</th>
                </>
              )}
              {tienDong && (
                <>
                  {lyDong && <th style={{ width: 200 }}>{lyDo!.nhan}</th>}
                  {dtDong && <th style={{ width: 180 }}>Đối tượng</th>}
                  {kmDong && <th style={{ width: 160 }}>Khoản mục</th>}
                  {cvDong && <th style={{ width: 160 }}>Công việc</th>}
                </>
              )}
              {hang && <th className="num" style={{ width: 80 }}>Số lượng</th>}
              {hang && <th className="num" style={{ width: 110 }}>Đơn giá</th>}
              <th className="num" style={{ width: 120 }}>Thành tiền</th>
              {coCk && (
                <>
                  <th className="num" style={{ width: 65 }}>% CK</th>
                  <th className="num" style={{ width: 100 }}>Tiền CK</th>
                </>
              )}
              {thueCot && (
                <>
                  <th className="num" style={{ width: 75 }}>Thuế suất</th>
                  <th className="num" style={{ width: 110 }}>Tiền thuế</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {dong.map((d, i) => (
              <tr key={i}>
                <td className="dim c">{i + 1}</td>
                {hang && <td className="code">{d.ma}</td>}
                <td>{d.ten}</td>
                {coKho && <td>{d.kho || khoMacDinh}</td>}
                {dvtCot && <td>{d.dvt}</td>}
                {hang && coLo && (
                  <>
                    <td>{d.lo || '—'}</td>
                    <td>{d.hsd || '—'}</td>
                  </>
                )}
                {coTk && (
                  <>
                    <td className="code">{d.tkNo ?? '—'}</td>
                    <td className="code">{d.tkCo ?? '—'}</td>
                  </>
                )}
                {tienDong && (
                  <>
                    {lyDong && <td>{d.ly || '—'}</td>}
                    {dtDong && <td>{d.dt || '—'}</td>}
                    {kmDong && <td>{d.km ? (KHOAN_MUC.find(x => x.ma === d.km)?.ten ?? d.km) : '—'}</td>}
                    {cvDong && <td>{d.cv ? (CONG_VIEC.find(x => x.ma === d.cv)?.ten ?? d.cv) : '—'}</td>}
                  </>
                )}
                {hang && <td className="num">{money(d.sl)}</td>}
                {hang && <td className="num">{money(d.gia)}</td>}
                <td className="num">{money(d.tien)}</td>
                {coCk && (
                  <>
                    <td className="num">{d.ptCk ? `${d.ptCk}%` : '0%'}</td>
                    <td className="num">{money(d.ck || 0)}</td>
                  </>
                )}
                {thueCot && (
                  <>
                    <td className="num">{d.ts ? `${d.ts}%` : 'KCT'}</td>
                    <td className="num">{money(d.thue)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
          {!khongTong && <tfoot>
            <tr className="sum">
              <td colSpan={colSpanDau}>Tổng cộng ({dong.length} dòng)</td>
              {hang && <td className="num">{money(tongSl)}</td>}
              {hang && <td />}
              <td className="num">{money(tongTien)}</td>
              {coCk && (
                <>
                  <td />
                  <td className="num">{money(tongCk)}</td>
                </>
              )}
              {thueCot && (
                <>
                  <td />
                  <td className="num">{money(tongThue)}</td>
                </>
              )}
            </tr>
          </tfoot>}
        </table>
      </div>
    )
  }

  // Chế độ sửa (gõ trực tiếp trên bảng)
  return (
    <div className="bang-sua-wrap">
      <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
        <table className="tbl bang-sua">
          <thead>
            <tr>
              <th className="dim" style={{ width: 36 }}>#</th>
              {hang && <th style={{ width: 120 }}>Mã hàng</th>}
              <th style={{ minWidth: 180 }}>{hang ? 'Tên hàng hoá, dịch vụ' : 'Diễn giải'}</th>
              {coKho && <th style={{ width: 140 }}>Kho</th>}
              {dvtCot && <th style={{ width: 65 }}>ĐVT</th>}
              {hang && coLo && (
                <>
                  <th style={{ width: 100 }}>Số lô</th>
                  <th style={{ width: 105 }}>Hạn dùng</th>
                </>
              )}
              {coTk && (
                <>
                  <th style={{ width: 80 }}>{nhanTk[0]}</th>
                  <th style={{ width: 80 }}>{nhanTk[1]}</th>
                </>
              )}
              {tienDong && (
                <>
                  {lyDong && <th style={{ width: 200 }}>{lyDo!.nhan}</th>}
                  {dtDong && <th style={{ width: 180 }}>Đối tượng</th>}
                  {kmDong && <th style={{ width: 160 }}>Khoản mục</th>}
                  {cvDong && <th style={{ width: 160 }}>Công việc</th>}
                </>
              )}
              {hang && <th className="num" style={{ width: 85 }}>Số lượng</th>}
              {hang && <th className="num" style={{ width: 110 }}>Đơn giá</th>}
              <th className="num" style={{ width: 120 }}>Thành tiền</th>
              {coCk && (
                <>
                  <th className="num" style={{ width: 65 }}>% CK</th>
                  <th className="num" style={{ width: 100 }}>Tiền CK</th>
                </>
              )}
              {thueCot && (
                <>
                  <th className="num" style={{ width: 80 }}>Thuế suất</th>
                  <th className="num" style={{ width: 110 }}>Tiền thuế</th>
                </>
              )}
              <th style={{ width: 44 }} />
            </tr>
          </thead>
          <tbody>
            {dong.map((d, i) => (
              <tr key={i}>
                <td className="dim c">{i + 1}</td>
                {hang && (
                  <td>
                    <ChonDanhMuc dm={dmHang} nhan={cfg.dong === 'nvl' ? 'nguyên vật liệu' : 'hàng hoá'} coMa className="inp sm" trong="Chọn" value={d.ma}
                      onChange={(v, muc) => chonMaHang(i, v, muc)} ds={danhMucHang.map(x => ({ v: x.ma, t: `${x.ma} - ${x.ten}` }))} />
                  </td>
                )}
                <td>
                  <input
                    type="text"
                    className="inp sm"
                    value={d.ten}
                    placeholder={hang ? 'Tên hàng' : 'Diễn giải'}
                    onChange={e => capNhat(i, { ten: e.target.value })}
                  />
                </td>
                {coKho && (
                  <td>
                    <ChonDanhMuc dm="kho" nhan="kho" className="inp sm" value={d.kho || khoMacDinh} onChange={v => capNhat(i, { kho: v })} ds={KHO} />
                  </td>
                )}
                {dvtCot && (
                  <td>
                    <input
                      type="text"
                      className="inp sm"
                      value={d.dvt}
                      placeholder="ĐVT"
                      onChange={e => capNhat(i, { dvt: e.target.value })}
                    />
                  </td>
                )}
                {hang && coLo && (
                  <>
                    <td>
                      <input
                        type="text"
                        className="inp sm"
                        value={d.lo ?? ''}
                        placeholder="Số lô"
                        onChange={e => capNhat(i, { lo: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="inp sm"
                        value={d.hsd ?? ''}
                        placeholder="dd/MM/yyyy"
                        onChange={e => capNhat(i, { hsd: e.target.value })}
                      />
                    </td>
                  </>
                )}
                {coTk && (
                  <>
                    <td>
                      <input
                        type="text"
                        className="inp sm code"
                        value={d.tkNo ?? ''}
                        placeholder={nhanTk[0]}
                        onChange={e => capNhat(i, { tkNo: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="inp sm code"
                        value={d.tkCo ?? ''}
                        placeholder={nhanTk[1]}
                        onChange={e => capNhat(i, { tkCo: e.target.value })}
                      />
                    </td>
                  </>
                )}
                {tienDong && (
                  <>
                    {lyDong && <td>
                      <ChonDanhMuc dm={`ly:${lyDo!.nhan}`} nhan={lyDo!.nhan.toLowerCase()} className="inp sm" value={d.ly ?? ''} onChange={v => capNhat(i, { ly: v })} ds={lyDo!.ds} />
                    </td>}
                    {dtDong && <td>
                      <ChonDanhMuc dm="doiTuong" nhan="đối tượng" className="inp sm" trong="—" value={d.dt ?? ''} onChange={v => capNhat(i, { dt: v })} ds={DS_DOI_TUONG} />
                    </td>}
                    {kmDong && <td>
                      <ChonDanhMuc dm="khoanMuc" nhan="khoản mục" coMa className="inp sm" trong="—" value={d.km ?? ''} onChange={v => capNhat(i, { km: v })}
                        ds={KHOAN_MUC.map(km => ({ v: km.ma, t: `${km.ma} · ${km.ten}` }))} />
                    </td>}
                    {cvDong && <td>
                      <ChonDanhMuc dm="congViec" nhan="công việc" coMa className="inp sm" trong="—" value={d.cv ?? ''} onChange={v => capNhat(i, { cv: v })}
                        ds={CONG_VIEC.map(cv => ({ v: cv.ma, t: `${cv.ma} · ${cv.ten}` }))} />
                    </td>}
                  </>
                )}
                {hang && (
                  <td className="num">
                    <OSo val={d.sl} onChange={sl => capNhat(i, { sl })} />
                  </td>
                )}
                {hang && (
                  <td className="num">
                    <OSo val={d.gia} onChange={gia => capNhat(i, { gia })} />
                  </td>
                )}
                <td className="num">
                  <OSo val={d.tien} onChange={tien => capNhat(i, { tien })} />
                </td>
                {coCk && (
                  <>
                    <td className="num">
                      <OSo val={d.ptCk ?? 0} onChange={ptCk => capNhat(i, { ptCk })} />
                    </td>
                    <td className="num">
                      <OSo val={d.ck ?? 0} onChange={ck => capNhat(i, { ck })} />
                    </td>
                  </>
                )}
                {thueCot && (
                  <>
                    <td>
                      <Select
                        className="inp sm"
                        value={String(d.ts ?? 0)}
                        onChange={e => capNhat(i, { ts: Number(e.target.value) })}
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={8}>8%</option>
                        <option value={10}>10%</option>
                      </Select>
                    </td>
                    <td className="num">
                      <OSo val={d.thue} onChange={thue => capNhat(i, { thue })} />
                    </td>
                  </>
                )}
                <td className="c">
                  <button
                    type="button"
                    className="icon-btn sm"
                    title="Xoá dòng"
                    onClick={() => xoaDong(i)}
                  >
                    <Icon n="trash" className="ic sm" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {!khongTong && <tfoot>
            <tr className="sum">
              <td colSpan={colSpanDau}>Tổng cộng ({dong.length} dòng)</td>
              {hang && <td className="num">{money(tongSl)}</td>}
              {hang && <td />}
              <td className="num">{money(tongTien)}</td>
              {coCk && (
                <>
                  <td />
                  <td className="num">{money(tongCk)}</td>
                </>
              )}
              {thueCot && (
                <>
                  <td />
                  <td className="num">{money(tongThue)}</td>
                </>
              )}
              <td />
            </tr>
          </tfoot>}
        </table>
      </div>
      <div className="row" style={{ padding: '8px 12px', gap: 10 }}>
        <button type="button" className="btn sm ghost" onClick={themDong}>
          <Icon n="plus" className="ic sm" />Thêm dòng
        </button>
        {dong.length > 0 && (
          <button type="button" className="btn sm ghost" onClick={xoaHet} style={{ color: 'var(--red)' }}>
            <Icon n="trash" className="ic sm" />Xoá hết
          </button>
        )}
      </div>
    </div>
  )
}

/** Tuỳ chỉnh giao diện phiếu: bật tắt các cột của bảng chi tiết (T49). Panel bên phải cùng kiểu panel danh mục (T81) */
export function HopCotPhieu({ ds, an, onDoi, onDong }: { ds: [string, string][]; an: string[]; onDoi: (an: string[]) => void; onDong: () => void }) {
  const hien = ds.filter(([k]) => !an.includes(k)).length
  // Esc chỉ đóng panel, chặn lan để không đóng luôn form phiếu toàn màn hình phía sau
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onDong() } }
    document.addEventListener('keydown', key, true)
    return () => document.removeEventListener('keydown', key, true)
  }, [onDong])
  return createPortal(
    <>
      <div className="overlay" onMouseDown={onDong} />
      <aside className="pn-hop pn-hop-hep" role="dialog" aria-modal="true" aria-label="Tuỳ chỉnh giao diện phiếu">
        <div className="pn-dau">
          <div className="pn-dau-ic"><Icon n="layers" className="ic" /></div>
          <div className="grow">
            <h3>Tuỳ chỉnh giao diện phiếu</h3>
            <small className="muted">Bật tắt cột của bảng chi tiết</small>
          </div>
          <button type="button" className="icon-btn" onClick={onDong} aria-label="Đóng"><Icon n="x" /></button>
        </div>
        <div className="pn-than">
          <div className="pn-khoi mo">
            <div className="pn-khoi-dau"><span>Cột bảng chi tiết</span><small className="muted">{hien}/{ds.length} đang hiện</small></div>
            <div className="pn-khoi-than pn-ds-cot">
              {ds.length ? ds.map(([k, ten]) => (
                <label key={k} className="pn-tich pn-dong-cot">
                  <span className="grow">{ten}</span>
                  <input type="checkbox" checked={!an.includes(k)} onChange={e => onDoi(e.target.checked ? an.filter(x => x !== k) : [...an, k])} />
                </label>
              )) : <p className="muted">Phiếu này không có cột nào để ẩn.</p>}
              <p className="muted pn-chu-nho pn-ghi-chu">Diễn giải và Thành tiền luôn hiện.</p>
            </div>
          </div>
        </div>
        <div className="pn-chan">
          <button type="button" className="btn" onClick={() => onDoi([])}>Khôi phục mặc định</button>
          <span className="grow" />
          <button type="button" className="btn pri" autoFocus onClick={onDong}>Xong</button>
        </div>
      </aside>
    </>,
    document.body,
  )
}
