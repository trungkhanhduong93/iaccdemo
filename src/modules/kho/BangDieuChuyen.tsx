// Đầu phiếu, bảng dòng phiếu điều chuyển (T155): xuất điều chuyển, nhập điều chuyển, chuyển kho.
// Nhập điều chuyển lấy dòng từ phiếu xuất tham chiếu, sửa được Thực nhận. Chuyển kho không có đơn giá, thành tiền, cột tài khoản
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Row } from '../types'
import { CUA_HANG, NVL } from '../../data/mock'
import { cheDoHienTai, useSession } from '../../app/session'
import { tkTheoCheDo } from '../tong-hop/so-cai'
import { ChonDanhMuc } from '../../ui/ChonDanhMuc'
import { ThemHangLoat, type HangChon } from '../../ui/generic/ThemHangLoat'
import { quyDoiTuDanhMuc } from '../danh-muc/QuyDoiDvt'
import { Select } from '../../ui/Dropdown'
import { Icon } from '../../ui/Icon'
import { money } from '../../ui/format'
import { useDaXoa } from '../../ui/generic/daXoa'
import { OSo } from './BangSanXuat'
import { cnCuaKho, DCN, dongDcn, khoCuaCn, phieuMauDcn, type DongDcn, type LoaiDcn } from './dieu-chuyen'
import { soLuong } from './san-xuat'

/** Cột ẩn hiện được qua Tuỳ chỉnh giao diện phiếu */
export function cotDcn(loai: LoaiDcn): [string, string][] {
  if (loai === 'ck') return [['dvt', 'Đơn vị tính'], ['gcDong', 'Ghi chú dòng']]
  // Xuất điều chuyển: Đơn giá, Thành tiền gọi là Giá vốn, Tiền vốn (T748)
  const gv = loai === 'xdc'
  return [['dvt', 'Đơn vị tính'], ...(loai === 'ndc' ? [['slXuat', 'Số lượng xuất'] as [string, string]] : []), ['gia', gv ? 'Giá vốn' : 'Đơn giá'], ['tien', gv ? 'Tiền vốn' : 'Thành tiền']]
}

/** Phiếu của một tab điều chuyển: phiếu mẫu, phiếu lưu trong phiên, bỏ phiếu đã xoá, áp nội dung đã sửa */
export function useDsPhieuDcn(loai: LoaiDcn): Row[] {
  const { ban, laDaXoa, phieuMoi, apSua } = useDaXoa(DCN[loai].man)
  const mau = useMemo(() => phieuMauDcn(loai), [loai])
  return useMemo(() => [...phieuMoi, ...mau].filter(r => !laDaXoa(r.id)).map(apSua), [mau, ban])
}

/** Ô chọn trong danh sách cố định; chế độ xem hiện chữ */
function OChon({ nhan, value, ds, trong, sua, onChange }: { nhan: string; value: string; ds: string[]; trong: string; sua: boolean; onChange: (v: string) => void }) {
  return sua
    ? <Select className="inp" value={value} aria-label={nhan} onChange={e => onChange(e.target.value)}
        ds={[{ v: '', t: ds.length ? trong : 'Không có kho phù hợp' }, ...ds.map(x => ({ v: x, t: x }))]} />
    : <input className="inp" readOnly value={value} />
}

export function DauDieuChuyen({ loai, sua, cuaHang, kho, setKho, khoNhan, setKhoNhan, setCnNhan, nguon, thamChieu }: {
  loai: LoaiDcn; sua: boolean; cuaHang: string
  kho: string; setKho: (v: string) => void                // xuất, chuyển kho: kho xuất; nhập: kho nhận
  khoNhan: string; setKhoNhan: (v: string) => void        // xuất, chuyển kho: kho nhận
  setCnNhan: (v: string) => void                          // xuất: cửa hàng nhận, theo kho nhận
  nguon: { cn: string; kho: string }                      // nhập: cửa hàng, kho của phiếu xuất
  thamChieu: { id: string; so: string }
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
  // Phiếu nhập chỉ sinh từ phiếu xuất (T748): tham chiếu cố định, chuyển xuống dưới Xuất từ, Kho nhận
  if (loai === 'ndc') {
    return (
      <>
      <div className="dcn-dau">
        <div className="f">
          <label>Xuất từ</label>
          <input className="inp" readOnly value={nguon.kho ? `${nguon.kho} · ${nguon.cn}` : ''} placeholder={sua ? 'Theo phiếu tham chiếu' : ''} />
        </div>
        <div className="f">
          <label>Kho nhận <em>*</em></label>
          <OChon nhan="Kho nhận" value={kho} ds={khoCn} trong="Chọn kho nhận" sua={sua} onChange={setKho} />
        </div>
      </div>
      <div className="f">
        <label>Tham chiếu</label>
        <div className="sx-tc-xem">{thamChieu.id ? <Link className="ds-link-so" to={`/app/${DCN.xdc.man}/${thamChieu.id}`}>{thamChieu.so}</Link> : <span className="dim">Chưa có</span>}</div>
      </div>
      </>
    )
  }
  if (loai === 'ck') {
    const dsKhoNhan = CUA_HANG.flatMap(c => c.kho).filter(k => k !== kho)
    return (
      <div className="dcn-dau">
        {oKhoXuat}
        <div className="f">
          <label>Kho nhận <em>*</em></label>
          <OChon nhan="Kho nhận" value={khoNhan} ds={dsKhoNhan} trong="Chọn kho nhận" sua={sua} onChange={setKhoNhan} />
        </div>
      </div>
    )
  }
  return (
    <div className="dcn-dau">
      {oKhoXuat}
      {/* Bỏ ô Cửa hàng nhận (T748): kho nhận là mọi kho trừ kho xuất, cửa hàng nhận suy ra từ kho */}
      <div className="f">
        <label>Kho nhận <em>*</em></label>
        <OChon nhan="Kho nhận" value={khoNhan} ds={CUA_HANG.flatMap(c => c.kho).filter(k => k !== kho)} trong="Chọn kho nhận" sua={sua}
          onChange={v => { setKhoNhan(v); setCnNhan(cnCuaKho(v)) }} />
      </div>
    </div>
  )
}

const DS_NVL = NVL.map(n => ({ v: n.ma, t: `${n.ma} - ${n.ten}` }))   // ô Mã hàng ghi mã trước như phiếu mua hàng
const DS_HANG_LOAT: HangChon[] = NVL.map(n => ({ ma: n.ma, ten: n.ten, dvt: n.dvt, nhom: n.nhom, loai: 'Nguyên vật liệu' }))

/** ĐVT chọn được của một hàng: ĐVT chính và các ĐVT có quy đổi trong danh mục Quy đổi ĐVT (1.4) */
function dsDvtCuaHang(ma: string, dvtDong: string) {
  const h = NVL.find(n => n.ma === ma)
  const qd = h ? quyDoiTuDanhMuc(h.ten, h.dvt) : []
  const ds = [...new Set([h?.dvt ?? dvtDong, ...qd.map(q => q.dv), dvtDong].filter(Boolean))]
  return { ds, h, qd }
}

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
  const [moHangLoat, setMoHangLoat] = useState(false)
  /** Đổi ĐVT: giá theo ĐVT mới quy từ giá ĐVT chính, thành tiền tính lại */
  const doiDvt = (i: number, dvt: string) => {
    const d = dong[i], { h, qd } = dsDvtCuaHang(d.ma, d.dvt)
    const q = qd.find(x => x.dv === dvt)
    const giaChinh = h?.gia ?? d.gia
    const gia = dvt === h?.dvt || !q || !q.tl ? giaChinh : Math.round(q.nguoc ? giaChinh * q.tl : giaChinh / q.tl)
    capNhat(i, { dvt, gia: ck ? 0 : gia, tien: ck ? 0 : Math.round(d.sl * gia) })
  }

  const tk = coTk && !ck && DCN[loai].noCo[0] ? DCN[loai].noCo[0].slice(0, 2).map(t => tkTheoCheDo(t, cd).so) : null
  const soCot = 3 + Number(hien('dvt')) + Number(hien('slXuat')) + 1 + Number(hien('gia')) + Number(hien('tien')) + Number(hien('gcDong')) + (tk ? 2 : 0) + Number(sua && !nhap)

  // Xuất, chuyển kho: bảng như phiếu mua hàng, chưa có dòng vẫn hiện hàng Tổng cộng và nút Thêm dòng; chỉ phiếu nhập cần báo chờ tham chiếu
  const trong = nhap ? (!coThamChieu ? <><b>Chưa có thông tin nhập</b>Chọn phiếu <b>Tham chiếu</b> ở đầu phiếu, hàng cần nhập tự điền theo phiếu xuất.</>
    : dong.length ? null : <b>Chưa có dòng nào</b>) : null

  return (
    <div className="bang-sua-wrap">
      <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
        <table className={`tbl${sua ? ' bang-sua' : ''}`}>
          <thead>
            <tr>
              <th className="dim c" style={{ width: 40 }}>#</th>
              <th style={{ width: 120 }}>Mã hàng</th>
              <th style={{ minWidth: 200 }}>Tên hàng hoá, dịch vụ</th>
              {hien('dvt') && <th style={{ width: 90 }}>Đơn vị tính</th>}
              {hien('slXuat') && <th className="num" style={{ width: 120 }}>Số lượng xuất</th>}
              <th className="num" style={{ width: 120 }}>{nhap ? 'Thực nhận' : 'Số lượng'}</th>
              {hien('gia') && <th className="num" style={{ width: 120 }}>{loai === 'xdc' ? 'Giá vốn' : 'Đơn giá'}</th>}
              {hien('tien') && <th className="num" style={{ width: 130 }}>{loai === 'xdc' ? 'Tiền vốn' : 'Thành tiền'}</th>}
              {hien('gcDong') && <th style={{ minWidth: 200 }}>Ghi chú</th>}
              {tk && <><th className="c" style={{ width: 70 }}>TK Nợ</th><th className="c" style={{ width: 70 }}>TK Có</th></>}
              {sua && !nhap && <th style={{ width: 44 }} />}
            </tr>
          </thead>
          <tbody>
            {trong ? <tr><td colSpan={soCot} className="sx-trong">{trong}</td></tr> : dong.map((d, i) => (
              <tr key={i}>
                <td className="dim c">{i + 1}</td>
                {sua && !nhap ? (
                  <td>
                    <ChonDanhMuc dm="nvl" nhan="nguyên vật liệu" coMa chiMa className="inp sm" trong="Chọn" value={d.ma} ds={DS_NVL}
                      onChange={v => capNhat(i, { ...dongDcn(v, d.sl, !ck), gcDong: d.gcDong })} />
                  </td>
                ) : <td className="code">{d.ma}</td>}
                <td>
                  {sua && !nhap ? <input type="text" className="inp sm" value={d.ten} placeholder="Tên hàng" aria-label="Tên hàng hoá" onChange={e => capNhat(i, { ten: e.target.value })} />
                    : d.ten}
                </td>
                {hien('dvt') && <td>{sua && !nhap ? (() => { const { ds } = dsDvtCuaHang(d.ma, d.dvt)
                  return <Select className="inp sm" value={d.dvt} aria-label="Đơn vị tính" onChange={e => doiDvt(i, e.target.value)} ds={ds.map(v => ({ v, t: v }))} /> })() : d.dvt}</td>}
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
      {sua && !nhap && (
        <div className="row sx-them">
          <button type="button" className="btn sm ghost" disabled={!kho} title={kho ? undefined : 'Chọn Kho xuất ở đầu phiếu để thêm hàng hoá'} onClick={() => onChange?.([...dong, { ...dongDcn(DS_NVL[0].v, 0, !ck), ...(ck ? { gcDong: '' } : {}) }])}>
            <Icon n="plus" className="ic sm" />Thêm dòng
          </button>
          <button type="button" className="btn sm ghost" disabled={!kho} title={kho ? undefined : 'Chọn Kho xuất ở đầu phiếu để thêm hàng hoá'} onClick={() => setMoHangLoat(true)}>
            <Icon n="plus" className="ic sm" />Thêm hàng loạt
          </button>
          {moHangLoat && <ThemHangLoat ds={DS_HANG_LOAT} daCo={dong.map(d => d.ma)} onDong={() => setMoHangLoat(false)}
            onXacNhan={ds => onChange?.([...dong, ...ds.map(h => ({ ...dongDcn(h.ma, 1, !ck), ...(ck ? { gcDong: '' } : {}) }))])} />}
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
