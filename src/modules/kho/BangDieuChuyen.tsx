// Đầu phiếu, bảng dòng phiếu điều chuyển (T155): xuất điều chuyển, nhập điều chuyển, chuyển kho.
// Nhập điều chuyển lấy dòng từ phiếu xuất tham chiếu, sửa được Thực nhận. Chuyển kho không có đơn giá, thành tiền, cột tài khoản
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Row } from '../types'
import { CUA_HANG, NVL } from '../../data/mock'
import { cheDoHienTai, useSession } from '../../app/session'
import { tkTheoCheDo } from '../tong-hop/so-cai'
import { ChonDanhMuc } from '../../ui/ChonDanhMuc'
import { Select } from '../../ui/Dropdown'
import { Icon } from '../../ui/Icon'
import { money } from '../../ui/format'
import { useDaXoa } from '../../ui/generic/daXoa'
import { OSo } from './BangSanXuat'
import { DCN, dongDcn, khoCuaCn, phieuMauDcn, type DongDcn, type LoaiDcn } from './dieu-chuyen'
import { soLuong } from './san-xuat'

/** Cột ẩn hiện được qua Tuỳ chỉnh giao diện phiếu */
export function cotDcn(loai: LoaiDcn): [string, string][] {
  if (loai === 'ck') return [['dvt', 'Đơn vị tính'], ['gcDong', 'Ghi chú dòng']]
  return [['dvt', 'Đơn vị tính'], ...(loai === 'ndc' ? [['slXuat', 'Số lượng xuất'] as [string, string]] : []), ['gia', 'Đơn giá'], ['tien', 'Thành tiền']]
}

/** Phiếu của một tab điều chuyển: phiếu mẫu, phiếu lưu trong phiên, bỏ phiếu đã xoá, áp nội dung đã sửa */
export function useDsPhieuDcn(loai: LoaiDcn): Row[] {
  const { ban, laDaXoa, phieuMoi, apSua } = useDaXoa(DCN[loai].man)
  const mau = useMemo(() => phieuMauDcn(loai), [loai])
  return useMemo(() => [...phieuMoi, ...mau].filter(r => !laDaXoa(r.id)).map(apSua), [mau, ban])
}

/** Ô Tham chiếu của phiếu nhập: chọn phiếu xuất điều chuyển đang Chờ nhập gửi tới cửa hàng đang làm việc */
function OThamChieuDcn({ cn, value, onChon }: { cn: string; value: string; onChon: (px: Row) => void }) {
  const ds = useDsPhieuDcn('xdc')
  const chon = ds.filter(r => (r.ttSx === 'cho' && (!cn || r._cnNhan === cn)) || r.id === value)
  return (
    <Select className="inp" value={value} aria-label="Phiếu tham chiếu" onChange={e => { const px = ds.find(r => r.id === e.target.value); if (px) onChon(px) }}
      ds={[{ v: '', t: chon.length ? 'Chọn phiếu xuất điều chuyển đang chờ nhập' : 'Không có phiếu chờ nhập' },
        ...chon.map(r => ({ v: String(r.id), t: `${r.so} · ${r.cn} · ${String(r.ngay).split(' ')[0]}` }))]} />
  )
}

/** Ô chọn trong danh sách cố định; chế độ xem hiện chữ */
function OChon({ nhan, value, ds, trong, sua, onChange }: { nhan: string; value: string; ds: string[]; trong: string; sua: boolean; onChange: (v: string) => void }) {
  return sua
    ? <Select className="inp" value={value} aria-label={nhan} onChange={e => onChange(e.target.value)}
        ds={[{ v: '', t: ds.length ? trong : 'Không có kho phù hợp' }, ...ds.map(x => ({ v: x, t: x }))]} />
    : <input className="inp" readOnly value={value} />
}

export function DauDieuChuyen({ loai, sua, cuaHang, kho, setKho, khoNhan, setKhoNhan, cnNhan, setCnNhan, nguon, thamChieu, onChonTc }: {
  loai: LoaiDcn; sua: boolean; cuaHang: string
  kho: string; setKho: (v: string) => void                // xuất, chuyển kho: kho xuất; nhập: kho nhận
  khoNhan: string; setKhoNhan: (v: string) => void        // xuất, chuyển kho: kho nhận
  cnNhan: string; setCnNhan: (v: string) => void          // xuất: cửa hàng nhận
  nguon: { cn: string; kho: string }                      // nhập: cửa hàng, kho của phiếu xuất
  thamChieu: { id: string; so: string }; onChonTc: (px: Row) => void
}) {
  const khoCn = khoCuaCn(cuaHang)
  const oKhoXuat = (
    <div className="f">
      <label>Kho xuất <em>*</em></label>
      {sua ? (
        <ChonDanhMuc dm="kho" nhan="kho" value={kho} ds={!kho || khoCn.includes(kho) ? khoCn : [kho, ...khoCn]}
          onChange={v => { setKho(v); if (loai === 'ck' && v === khoNhan) setKhoNhan('') }} />
      ) : <input className="inp" readOnly value={kho} />}
    </div>
  )
  if (loai === 'ndc') {
    return (
      <div className="dcn-dau">
        <div className="f">
          <label>Tham chiếu <em>*</em></label>
          {sua ? <OThamChieuDcn cn={cuaHang} value={thamChieu.id} onChon={onChonTc} />
            : <div className="sx-tc-xem">{thamChieu.id ? <Link className="ds-link-so" to={`/app/${DCN.xdc.man}/${thamChieu.id}`}>{thamChieu.so}</Link> : <span className="dim">Chưa có</span>}</div>}
        </div>
        <div className="f">
          <label>Xuất từ</label>
          <input className="inp" readOnly value={nguon.kho ? `${nguon.kho} · ${nguon.cn}` : ''} placeholder={sua ? 'Theo phiếu tham chiếu' : ''} />
        </div>
        <div className="f">
          <label>Kho nhận <em>*</em></label>
          <OChon nhan="Kho nhận" value={kho} ds={khoCn} trong="Chọn kho nhận" sua={sua} onChange={setKho} />
        </div>
      </div>
    )
  }
  if (loai === 'ck') {
    return (
      <div className="dcn-dau">
        {oKhoXuat}
        <div className="f">
          <label>Kho nhận <em>*</em></label>
          <OChon nhan="Kho nhận" value={khoNhan} ds={khoCn.filter(k => k !== kho)} trong="Chọn kho nhận cùng cửa hàng" sua={sua} onChange={setKhoNhan} />
        </div>
      </div>
    )
  }
  return (
    <div className="dcn-dau">
      {oKhoXuat}
      <div className="f">
        <label>Cửa hàng nhận <em>*</em></label>
        <OChon nhan="Cửa hàng nhận" value={cnNhan} ds={CUA_HANG.map(c => c.ten).filter(c => c !== cuaHang)} trong="Chọn cửa hàng nhận" sua={sua}
          onChange={v => { setCnNhan(v); const k = khoCuaCn(v); setKhoNhan(k.length === 1 ? k[0] : '') }} />
      </div>
      <div className="f">
        <label>Kho nhận <em>*</em></label>
        <OChon nhan="Kho nhận" value={khoNhan} ds={khoCuaCn(cnNhan)} trong={cnNhan ? 'Chọn kho nhận' : 'Chọn cửa hàng nhận trước'} sua={sua} onChange={setKhoNhan} />
      </div>
    </div>
  )
}

const DS_NVL = NVL.map(n => ({ v: n.ma, t: `${n.ten} - ${n.ma}` }))

export function BangDieuChuyen({ loai, dong, onChange, cheDo, coTk, an = [], khongTong = false, kho, coThamChieu }: {
  loai: LoaiDcn; dong: DongDcn[]; onChange?: (ds: DongDcn[]) => void; cheDo: 'xem' | 'sua'; coTk?: boolean; an?: string[]; khongTong?: boolean
  kho: string            // chưa chọn kho xuất thì chưa thêm hàng được
  coThamChieu?: boolean  // phiếu nhập đã chọn phiếu xuất tham chiếu
}) {
  const { s } = useSession()
  const cd = cheDoHienTai(s).ma
  const sua = cheDo === 'sua' && Boolean(onChange)
  const ck = loai === 'ck', nhap = loai === 'ndc'
  const hien = (k: string) => !an.includes(k) && cotDcn(loai).some(([x]) => x === k)
  const capNhat = (i: number, p: Partial<DongDcn>) => onChange?.(dong.map((d, j) => (j === i ? { ...d, ...p } : d)))
  const xoaDong = (i: number) => onChange?.(dong.filter((_, j) => j !== i))
  const tongTien = dong.reduce((a, d) => a + (d.tien || 0), 0)

  const tk = coTk && !ck && DCN[loai].noCo[0] ? DCN[loai].noCo[0].slice(0, 2).map(t => tkTheoCheDo(t, cd).so) : null
  const soCot = 2 + Number(hien('dvt')) + Number(hien('slXuat')) + 1 + Number(hien('gia')) + Number(hien('tien')) + Number(hien('gcDong')) + (tk ? 2 : 0) + Number(sua && !nhap)

  const trong = !nhap && !kho ? <><b>Chưa có thông tin xuất</b>Chọn <b>Kho xuất</b> ở đầu phiếu để thêm hàng hoá.</>
    : nhap && !coThamChieu ? <><b>Chưa có thông tin nhập</b>Chọn phiếu <b>Tham chiếu</b> ở đầu phiếu, hàng cần nhập tự điền theo phiếu xuất.</>
      : dong.length ? null : <><b>Chưa có dòng nào</b>{sua && !nhap ? 'Bấm Thêm dòng để chọn nguyên vật liệu.' : ''}</>

  return (
    <div className="bang-sua-wrap sx-bang">
      <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
        <table className={`tbl${sua ? ' bang-sua' : ''}`}>
          <thead>
            <tr>
              <th className="dim c" style={{ width: 40 }}>#</th>
              <th style={{ minWidth: 260 }}>Hàng hoá</th>
              {hien('dvt') && <th style={{ width: 90 }}>Đơn vị tính</th>}
              {hien('slXuat') && <th className="num" style={{ width: 120 }}>Số lượng xuất</th>}
              <th className="num" style={{ width: 120 }}>{nhap ? 'Thực nhận' : 'Số lượng'}</th>
              {hien('gia') && <th className="num" style={{ width: 120 }}>Đơn giá</th>}
              {hien('tien') && <th className="num" style={{ width: 130 }}>Thành tiền</th>}
              {hien('gcDong') && <th style={{ minWidth: 200 }}>Ghi chú</th>}
              {tk && <><th className="c" style={{ width: 70 }}>TK Nợ</th><th className="c" style={{ width: 70 }}>TK Có</th></>}
              {sua && !nhap && <th style={{ width: 44 }} />}
            </tr>
          </thead>
          <tbody>
            {trong ? <tr><td colSpan={soCot} className="sx-trong">{trong}</td></tr> : dong.map((d, i) => (
              <tr key={i}>
                <td className="dim c">{i + 1}</td>
                <td>
                  {sua && !nhap ? <ChonDanhMuc dm="nvl" nhan="nguyên vật liệu" className="inp sm" value={d.ma} ds={DS_NVL}
                    onChange={v => capNhat(i, { ...dongDcn(v, d.sl, !ck), gcDong: d.gcDong })} />
                    : <span className="sx-ten">{d.ten}<small> - {d.ma}</small></span>}
                </td>
                {hien('dvt') && <td>{d.dvt}</td>}
                {hien('slXuat') && <td className="num dim">{soLuong(d.slXuat ?? 0)}</td>}
                <td className={`num${nhap && d.sl !== d.slXuat ? ' sx-lech' : ''}`} title={nhap && d.sl !== d.slXuat ? 'Thực nhận khác số lượng xuất' : undefined}>
                  {sua ? <OSo val={d.sl} onChange={v => capNhat(i, { sl: v, tien: Math.round(v * d.gia) })} /> : soLuong(d.sl)}
                </td>
                {hien('gia') && <td className="num">{money(d.gia)}</td>}
                {hien('tien') && <td className="num">{money(d.tien)}</td>}
                {hien('gcDong') && <td>{sua ? <input className="inp sm" value={d.gcDong ?? ''} aria-label="Ghi chú dòng" onChange={e => capNhat(i, { gcDong: e.target.value })} /> : d.gcDong}</td>}
                {tk && <><td className="code c">{tk[0]}</td><td className="code c">{tk[1]}</td></>}
                {sua && !nhap && <td className="c"><button type="button" className="icon-btn sm" title="Xoá dòng" onClick={() => xoaDong(i)}><Icon n="trash" className="ic sm" /></button></td>}
              </tr>
            ))}
          </tbody>
          {!khongTong && !trong && (
            <tfoot>
              <tr className="sum">
                <td colSpan={soCot - Number(hien('tien')) - Number(hien('gcDong')) - (tk ? 2 : 0) - Number(sua && !nhap)}>Tổng cộng ({dong.length} dòng)</td>
                {hien('tien') && <td className="num">{money(tongTien)}</td>}
                {hien('gcDong') && <td />}
                {tk && <td colSpan={2} />}
                {sua && !nhap && <td />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {sua && !nhap && kho && (
        <div className="row sx-them">
          <button type="button" className="btn sm ghost" onClick={() => onChange?.([...dong, { ...dongDcn(DS_NVL[0].v, 0, !ck), ...(ck ? { gcDong: '' } : {}) }])}>
            <Icon n="plus" className="ic sm" />Thêm dòng
          </button>
          {dong.length > 0 && (
            <button type="button" className="btn sm ghost" onClick={() => onChange?.([])} style={{ color: 'var(--red)' }}>
              <Icon n="trash" className="ic sm" />Xoá hết
            </button>
          )}
        </div>
      )}
    </div>
  )
}
