// Bảng dòng phiếu sản xuất (T152): cột theo iPOS Inventory cho xuất, nhập sơ chế và xuất, nhập chế biến. Không làm số lô.
// Phiếu nhập lấy dòng từ phiếu xuất tham chiếu; xuất chế biến chọn thành phẩm thì kéo nguyên vật liệu theo công thức
import { Fragment, useEffect, useMemo, useState } from 'react'
import type { Row } from '../types'
import { NCC } from '../../data/mock'
import { cheDoHienTai, useSession } from '../../app/session'
import { tkTheoCheDo } from '../tong-hop/so-cai'
import { ChonDanhMuc } from '../../ui/ChonDanhMuc'
import { Select } from '../../ui/Dropdown'
import { Icon } from '../../ui/Icon'
import { money } from '../../ui/format'
import { OSoGo } from '../../ui/OSoGo'
import { useDaXoa } from '../../ui/generic/daXoa'
import {
  CONG_THUC_CB, CONG_THUC_SC, SX, chiaGia, ctCbCua, ctScCua, dongXuatSc, hangCua, keoNvlCb, phieuMauSx, soLuong, tenMa, tron3,
  type DongSx, type LoaiSx,
} from './san-xuat'

/** Cột ẩn hiện được qua Tuỳ chỉnh giao diện phiếu */
export function cotSx(loai: LoaiSx): [string, string][] {
  if (loai === 'xsc') return [['dvt', 'Đơn vị tính'], ['gia', 'Đơn giá'], ['ncc', 'Nhà cung cấp'], ['tien', 'Thành tiền']]
  return [['dvt', 'Đơn vị tính'], ['slKh', 'Số lượng kế hoạch'], ['gia', 'Đơn giá'], ['tien', 'Thành tiền']]
}

/** Phiếu của một tab sản xuất: phiếu mẫu, phiếu lưu trong phiên, bỏ phiếu đã xoá, áp nội dung đã sửa */
export function useDsPhieuSx(loai: LoaiSx): Row[] {
  const man = SX[loai].man
  const { ban, laDaXoa, phieuMoi, apSua } = useDaXoa(man)
  const mau = useMemo(() => phieuMauSx(loai), [loai])
  return useMemo(() => [...phieuMoi, ...mau].filter(r => !laDaXoa(r.id)).map(apSua), [mau, ban])
}

/** Ô Tham chiếu của phiếu nhập: chọn phiếu xuất cùng loại, cùng chi nhánh, đang Chờ nhập */
export function OThamChieuSx({ loai, cn, value, onChon }: { loai: LoaiSx; cn: string; value: string; onChon: (px: Row) => void }) {
  const doi = SX[loai].doi!
  const ds = useDsPhieuSx(doi)
  const chon = ds.filter(r => (r.ttSx === 'cho' && (!cn || r.cn === cn)) || r.id === value)
  return (
    <Select className="inp" value={value} aria-label="Phiếu tham chiếu" onChange={e => { const px = ds.find(r => r.id === e.target.value); if (px) onChon(px) }}
      ds={[{ v: '', t: chon.length ? `Chọn phiếu ${SX[doi].ten.toLowerCase()} đang chờ nhập` : 'Không có phiếu chờ nhập' },
        ...chon.map(r => ({ v: String(r.id), t: `${r.so} · ${r._kho} · ${String(r.ngay).split(' ')[0]}` }))]} />
  )
}

/** Ô số lượng, tiền: đang gõ đã có chấm ngăn nghìn, phẩy thập phân, báo số ngay; rời ô hiện kiểu Việt Nam (T284) */
export function OSo({ val, onChange, tien }: { val: number; onChange: (v: number) => void; tien?: boolean }) {
  return <OSoGo val={val} onChange={v => onChange(tron3(v))} hien={tien ? money : soLuong} />
}

/** Số thực tế nằm ngoài mức tăng, giảm tối đa của công thức chế biến */
function lechCt(d: DongSx): string {
  if (!d.tpMa || !d.slKh) return ''
  const n = CONG_THUC_CB.find(c => c.spMa === d.tpMa && c.tt === 'on')?.nvl.find(x => x.ma === d.ma)
  if (!n) return ''
  if (n.tang !== undefined && d.sl > d.slKh * (1 + n.tang / 100)) return `Vượt mức tăng tối đa ${n.tang}% của công thức`
  if (n.giam !== undefined && d.sl < d.slKh * (1 - n.giam / 100)) return `Dưới mức giảm tối đa ${n.giam}% của công thức`
  return ''
}

/** Gom các dòng liền nhau cùng khoá để gộp ô (đầu vào nhập sơ chế, thành phẩm xuất chế biến) */
function nhomLien(dong: DongSx[], khoa: (d: DongSx) => string): [number, number][] {
  const ra: [number, number][] = []
  dong.forEach((d, i) => { if (i && khoa(dong[i - 1]) === khoa(d)) ra[ra.length - 1][1]++; else ra.push([i, 1]) })
  return ra
}

export function BangSanXuat({ loai, dong, onChange, cheDo, coTk, an = [], khongTong = false, kho, coThamChieu }: {
  loai: LoaiSx; dong: DongSx[]; onChange?: (ds: DongSx[]) => void; cheDo: 'xem' | 'sua'; coTk?: boolean; an?: string[]; khongTong?: boolean
  kho: string            // chưa chọn kho thì chưa thêm hàng được
  coThamChieu?: boolean  // phiếu nhập đã chọn phiếu xuất tham chiếu
}) {
  const { s } = useSession()
  const cd = cheDoHienTai(s).ma
  const hien = (k: string) => !an.includes(k)
  const sua = cheDo === 'sua' && Boolean(onChange)
  const nhap = SX[loai].nhap
  const [no, co] = SX[loai].noCo[0]
  const capNhat = (i: number, p: Partial<DongSx>) => onChange?.(dong.map((d, j) => (j === i ? { ...d, ...p } : d)))
  // Phiếu nhập: đổi thực nhận thì chia lại giá trị đầu vào, tổng nhập vẫn bằng tổng xuất
  const doiThucNhan = (i: number, sl: number) => onChange?.(chiaGia(dong.map((d, j) => (j === i ? { ...d, sl } : d))))
  const xoaDong = (i: number) => onChange?.(nhap ? chiaGia(dong.filter((_, j) => j !== i)) : dong.filter((_, j) => j !== i))
  const tongTien = dong.reduce((a, d) => a + (d.tien || 0), 0)

  // Xuất sơ chế chọn NVL gốc có công thức sơ chế đang hoạt động; xuất chế biến chọn thành phẩm có công thức chế biến đang hoạt động
  const dsGoc = CONG_THUC_SC.filter(c => c.tt === 'on').map(c => ({ v: c.gocMa, t: tenMa(c.gocMa) }))
  const dsTp = CONG_THUC_CB.filter(c => c.tt === 'on').map(c => ({ v: c.spMa, t: tenMa(c.spMa) }))
  const [tpMoi, setTpMoi] = useState('')

  const thamTk = coTk ? [tkTheoCheDo(no, cd).so, tkTheoCheDo(co, cd).so] : null
  const oTk = thamTk && <><td className="code c">{thamTk[0]}</td><td className="code c">{thamTk[1]}</td></>
  const thTk = thamTk && <><th className="c" style={{ width: 70 }} rowSpan={2}>TK Nợ</th><th className="c" style={{ width: 70 }} rowSpan={2}>TK Có</th></>

  const trong = !nhap && !kho ? <><b>Chưa có thông tin xuất</b>Chọn <b>Kho xuất</b> ở đầu phiếu để thêm hàng hoá.</>
    : nhap && !coThamChieu ? <><b>Chưa có thông tin nhập</b>Chọn phiếu <b>Tham chiếu</b> ở đầu phiếu, hàng cần nhập tự điền theo phiếu xuất và công thức.</>
      : dong.length ? null : <><b>Chưa có dòng nào</b>{sua ? (loai === 'xcb' ? 'Chọn thành phẩm bên dưới, nguyên vật liệu tự kéo theo công thức chế biến.' : 'Bấm Thêm dòng để chọn nguyên vật liệu gốc.') : ''}</>

  const oSl = (d: DongSx, i: number) => sua ? <OSo val={d.sl} onChange={v => (nhap ? doiThucNhan(i, v) : capNhat(i, { sl: v, tien: Math.round(v * d.gia) }))} /> : soLuong(d.sl)
  const oGia = (d: DongSx, i: number) => sua && loai === 'xsc' ? <OSo tien val={d.gia} onChange={v => capNhat(i, { gia: v, tien: Math.round(v * d.sl) })} /> : money(d.gia)
  const nutXoa = (i: number) => sua && (
    <td className="c"><button type="button" className="icon-btn sm" title="Xoá dòng" onClick={() => xoaDong(i)}><Icon n="trash" className="ic sm" /></button></td>
  )
  const coSlKh = loai !== 'xsc'
  const soCot = 1 + (loai === 'nsc' || loai === 'xcb' ? 2 : 1) + Number(hien('dvt')) + (coSlKh ? Number(hien('slKh')) + 1 : 1)
    + Number(hien('gia')) + Number(loai === 'xsc' && hien('ncc')) + Number(hien('tien')) + (thamTk ? 2 : 0) + Number(sua)

  // Hàng tiêu đề: cột Số lượng chia Kế hoạch, Thực nhận (hoặc Thực tế); nhập sơ chế chia Nguyên vật liệu thành Đầu vào, Đầu ra
  const tieuDe = (
    <thead>
      <tr>
        <th className="dim c" style={{ width: 40 }} rowSpan={2}>#</th>
        {loai === 'nsc' && <th className="c" colSpan={2}>Nguyên vật liệu</th>}
        {loai === 'xcb' && <><th style={{ minWidth: 220 }} rowSpan={2}>Thành phẩm</th><th style={{ minWidth: 200 }} rowSpan={2}>Nguyên vật liệu</th></>}
        {loai === 'xsc' && <th style={{ minWidth: 240 }} rowSpan={2}>Hàng hoá</th>}
        {loai === 'ncb' && <th style={{ minWidth: 240 }} rowSpan={2}>Thành phẩm</th>}
        {hien('dvt') && <th style={{ width: 90 }} rowSpan={2}>Đơn vị tính</th>}
        {coSlKh ? <th className="c" colSpan={1 + Number(hien('slKh'))}>Số lượng</th> : <th className="num" style={{ width: 120 }} rowSpan={2}>Số lượng</th>}
        {hien('gia') && <th className="num" style={{ width: 120 }} rowSpan={2}>Đơn giá</th>}
        {loai === 'xsc' && hien('ncc') && <th style={{ minWidth: 200 }} rowSpan={2}>Nhà cung cấp</th>}
        {hien('tien') && <th className="num" style={{ width: 130 }} rowSpan={2}>Thành tiền</th>}
        {thTk}
        {sua && <th style={{ width: 44 }} rowSpan={2} />}
      </tr>
      <tr>
        {loai === 'nsc' && <><th style={{ minWidth: 190 }}>Đầu vào</th><th style={{ minWidth: 190 }}>Đầu ra</th></>}
        {coSlKh && <>{hien('slKh') && <th className="num" style={{ width: 110 }}>Kế hoạch</th>}<th className="num" style={{ width: 120 }}>{loai === 'xcb' ? 'Thực tế' : 'Thực nhận'}</th></>}
      </tr>
    </thead>
  )

  const oHang = (ma: string) => <span className="sx-ten">{hangCua(ma)?.ten ?? ma}<small> - {ma}</small></span>
  const oSlKh = (d: DongSx) => hien('slKh') && <td className="num dim">{soLuong(d.slKh ?? 0)}</td>
  const giuaCot = (d: DongSx, i: number) => <>
    {hien('dvt') && <td>{d.dvt}</td>}
    {coSlKh && oSlKh(d)}
    <td className={`num${lechCt(d) ? ' sx-lech' : ''}`} title={lechCt(d) || undefined}>{oSl(d, i)}</td>
    {hien('gia') && <td className="num">{oGia(d, i)}</td>}
  </>

  const than = (() => {
    if (loai === 'xsc') {
      return dong.map((d, i) => {
        const dich = ctScCua(d.ma)?.dich ?? []
        return (
          <tr key={i}>
            <td className="dim c">{i + 1}</td>
            <td>
              {sua ? <ChonDanhMuc dm="nvl" nhan="nguyên vật liệu" className="inp sm" value={d.ma} ds={dsGoc}
                onChange={v => capNhat(i, dongXuatSc(v, d.sl, d.ncc))} /> : oHang(d.ma)}
              {/* Gợi ý NVL đích theo công thức sơ chế, phiếu nhập sơ chế sẽ nhập các mã này */}
              {dich.length > 0 && <div className="sx-goi-y" title="Nguyên vật liệu đích theo công thức sơ chế">Ra: {dich.map(n => hangCua(n.ma)?.ten ?? n.ma).join(', ')}</div>}
            </td>
            {giuaCot(d, i)}
            {hien('ncc') && <td>{sua ? <ChonDanhMuc dm="ncc" nhan="nhà cung cấp" className="inp sm" trong="Chọn" value={d.ncc ?? ''} ds={NCC.map(x => x.ten)}
              onChange={v => capNhat(i, { ncc: v })} /> : d.ncc}</td>}
            {hien('tien') && <td className="num">{money(d.tien)}</td>}
            {oTk}
            {nutXoa(i)}
          </tr>
        )
      })
    }
    if (loai === 'ncb') {
      return dong.map((d, i) => (
        <tr key={i}>
          <td className="dim c">{i + 1}</td>
          <td>{oHang(d.ma)}</td>
          {giuaCot(d, i)}
          {hien('tien') && <td className="num">{money(d.tien)}</td>}
          {oTk}
          {nutXoa(i)}
        </tr>
      ))
    }
    // Nhập sơ chế gộp ô Đầu vào; xuất chế biến gộp ô Thành phẩm
    const nhom = nhomLien(dong, d => (loai === 'nsc' ? `${d.vaoMa}|${d.gtVao}` : `${d.tpMa}|${d.tpSl}`))
    return nhom.map(([dau, n], g) => (
      <Fragment key={g}>
        {dong.slice(dau, dau + n).map((d, j) => {
          const i = dau + j
          return (
            <tr key={i} className={j === n - 1 ? 'sx-cuoi-nhom' : undefined}>
              <td className="dim c">{i + 1}</td>
              {j === 0 && (loai === 'nsc'
                ? <td rowSpan={n} className="sx-gop">{oHang(d.vaoMa ?? '')}</td>
                : <td rowSpan={n} className="sx-gop">
                  {oHang(d.tpMa ?? '')}
                  <div className="sx-tp-sl">
                    {sua ? <>
                      <span>Số lượng làm</span>
                      <OSo val={d.tpSl ?? 0} onChange={v => onChange?.([...dong.slice(0, dau), ...keoNvlCb(d.tpMa ?? '', v), ...dong.slice(dau + n)])} />
                      <span>{d.tpDvt}</span>
                      <button type="button" className="icon-btn sm" title="Bỏ thành phẩm này" onClick={() => onChange?.([...dong.slice(0, dau), ...dong.slice(dau + n)])}>
                        <Icon n="x" className="ic sm" />
                      </button>
                    </> : <span>Làm {soLuong(d.tpSl ?? 0)} {d.tpDvt}</span>}
                  </div>
                </td>)}
              <td>{oHang(d.ma)}</td>
              {giuaCot(d, i)}
              {hien('tien') && <td className="num">{money(d.tien)}</td>}
              {oTk}
              {nutXoa(i)}
            </tr>
          )
        })}
      </Fragment>
    ))
  })()

  return (
    <div className="bang-sua-wrap sx-bang">
      <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
        <table className={`tbl${sua ? ' bang-sua' : ''}`}>
          {tieuDe}
          <tbody>
            {trong ? <tr><td colSpan={soCot} className="sx-trong">{trong}</td></tr> : than}
          </tbody>
          {!khongTong && !trong && (
            <tfoot>
              <tr className="sum">
                <td colSpan={soCot - Number(hien('tien')) - (thamTk ? 2 : 0) - Number(sua)}>Tổng cộng ({dong.length} dòng)</td>
                {hien('tien') && <td className="num">{money(tongTien)}</td>}
                {thamTk && <td colSpan={2} />}
                {sua && <td />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {sua && !nhap && kho && (
        <div className="row sx-them">
          {loai === 'xsc' ? (
            <button type="button" className="btn sm ghost" onClick={() => onChange?.([...dong, dongXuatSc(dsGoc[0]?.v ?? '', 0)])}><Icon n="plus" className="ic sm" />Thêm dòng</button>
          ) : (
            <>
              <Select className="inp sm" value={tpMoi} aria-label="Thành phẩm cần làm" onChange={e => setTpMoi(e.target.value)}
                ds={[{ v: '', t: 'Chọn thành phẩm cần làm' }, ...dsTp.filter(x => ctCbCua(x.v))]} />
              <button type="button" className="btn sm" disabled={!tpMoi} onClick={() => { onChange?.([...dong, ...keoNvlCb(tpMoi, 1)]); setTpMoi('') }}>
                <Icon n="plus" className="ic sm" />Thêm thành phẩm
              </button>
            </>
          )}
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
