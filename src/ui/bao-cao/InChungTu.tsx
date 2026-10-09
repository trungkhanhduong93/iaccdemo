// Mẫu in chứng từ: vẽ phiếu theo cấu hình mau-in.ts, khung xem trước toàn màn hình dùng lại tờ giấy của báo cáo (T47 đợt 5, kế hoạch mục 8.6)
import { Fragment, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { LoaiCT, Row, ScreenDef, VoucherCfg } from '../../modules/types'
import { mauCuaChungTu, mauIn, type KhoiInK, type MauIn } from '../../app/mau-in'
import { canCu, type CheDoDef } from '../../app/che-do'
import { kieuGhiSo } from '../../app/plan'
import { cheDoHienTai, donViHienTai, useSession } from '../../app/session'
import { tkTheoCheDo } from '../../modules/tong-hop/so-cai'
import { Icon } from '../Icon'
import { Select } from '../Dropdown'
import { money } from '../format'
import { duLieuIn, type DonViIn, type DuLieuIn } from './duLieuIn'
import { NgatTrang, ToGiay, type Giay } from './ToGiay'

/** Một phiếu đem in. dong: thay bảng chi tiết sinh từ cfg khi màn có dòng thật (vd chứng từ bán hàng 3.1.1) */
export interface PhieuIn { sc: ScreenDef; cfg: VoucherCfg; row: Row; loai?: LoaiCT; dong?: DuLieuIn['dong'] }

const CHAM = '......'
const soIn = (v: string | number | undefined) => typeof v === 'number' ? (v ? money(v) : '') : v ?? ''

/** Vẽ một phiếu thành các khối theo mau.khoi, mỗi khối một phần tử con để tờ giấy đo và xếp trang. Hàm thuần, không hook */
export function veMauIn(mau: MauIn, du: DuLieuIn, cd: CheDoDef, dv: DonViIn): ReactNode {
  const goc: CSSProperties = {
    fontSize: `${mau.trang.coChu}pt`,
    fontFamily: mau.trang.phong === 'times' ? "'Times New Roman', Times, serif" : undefined,
  }
  const noCo = kieuGhiSo(cd.ma) === 'noco'
  const tk = (ds: string[]) => ds.map(t => tkTheoCheDo(t, cd.ma).so).join(', ')
  const kyHieu = mau.kyHieu[cd.ma]
  const khoi = mau.khoi.filter(x => !x.an).map(x => x.k)

  const dauTrang = (
    <div className="in-ct-dv">
      <div>Đơn vị: <b>{dv.ten}</b></div>
      <div>Địa chỉ: {dv.diaChi}</div>
    </div>
  )
  const coMauSo = kyHieu || mau.quyenSo || (mau.coNoCo && noCo)
  const mauSo = coMauSo ? (
    <div className="in-ct-mau-so">
      {kyHieu && (
        <>
          <b>Mẫu số {kyHieu}</b>
          <i>({canCu(cd)})</i>
        </>
      )}
      {mau.quyenSo && <div className="in-ct-quyen">Quyển số: {CHAM}</div>}
      {mau.coNoCo && noCo && (
        <>
          <div>Nợ: {tk(du.no) || CHAM}</div>
          <div>Có: {tk(du.co) || CHAM}</div>
        </>
      )}
    </div>
  ) : null

  const veKhoi = (k: KhoiInK): ReactNode => {
    switch (k) {
      case 'tieuDe':
        return (
          <>
            <div className="in-ct-tieu-de">{mau.tieuDe}</div>
            <div className="in-ct-ngay">{du.ngayChu}</div>
            <div className="in-ct-so">Số: {du.so}</div>
          </>
        )
      case 'thongTin': {
        const ds = mau.thongTin.filter(t => !t.an)
        if (!ds.length) return null
        return (
          <div className="in-ct-tt" style={{ gridTemplateColumns: `repeat(${mau.soCotThongTin}, minmax(0, 1fr))` }}>
            {ds.map(t => (
              <div key={t.k} className="in-ct-truong">
                <span className="in-ct-nhan" style={t.rongNhan ? { width: `${t.rongNhan}mm` } : undefined}>{t.nhan}:</span>
                <span className="in-ct-gt">{du.tt[t.k]}</span>
              </div>
            ))}
          </div>
        )
      }
      case 'bang': {
        const b = mau.bang
        if (!b) return null
        const cot = b.cot.filter(c => !c.an && (!c.chiNoCo || noCo))
        const o = (c: (typeof cot)[number], v: string | number | undefined) => c.chiNoCo && v ? tkTheoCheDo(String(v), cd.ma).so : c.so ? soIn(v) : v ?? ''
        const kieuO = (c: (typeof cot)[number]): CSSProperties => ({ textAlign: c.can === 'phai' ? 'right' : c.can === 'giua' ? 'center' : 'left' })
        const trong = Math.max(0, b.dongTrongToiThieu - du.dong.length)
        const oCong = cot.find(c => !c.so && c.k !== 'stt') ?? cot[0]
        const cao = { height: `${b.caoDong}mm` }
        return (
          <table className="in-ct-bang" style={b.coChu ? { fontSize: `${b.coChu}pt` } : undefined}>
            <colgroup>{cot.map(c => <col key={c.k} style={{ width: `${c.rong}mm` }} />)}</colgroup>
            <thead>
              <tr>{cot.map(c => <th key={c.k}>{c.t}</th>)}</tr>
            </thead>
            <tbody>
              {du.dong.map((d, i) => <tr key={i} style={cao}>{cot.map(c => <td key={c.k} style={kieuO(c)}>{o(c, d[c.k])}</td>)}</tr>)}
              {Array.from({ length: trong }, (_, i) => <tr key={`t${i}`} style={cao}>{cot.map(c => <td key={c.k} />)}</tr>)}
              {b.dongTong && (
                <tr className="in-ct-cong" style={cao}>
                  {cot.map(c => (
                    <td key={c.k} style={kieuO(c)}>
                      {c === oCong ? 'Cộng' : c.so && c.k !== 'gia' ? soIn(du.dong.reduce((a, d) => a + (Number(d[c.k]) || 0), 0)) : ''}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        )
      }
      case 'tongCong':
        if (!mau.tongCong?.length) return null
        return (
          <div className="in-ct-tong">
            {mau.tongCong.map(t => (
              <div key={t.k} className="in-ct-tong-dong">
                <span>{t.nhan}</span>
                <span className="in-ct-cham" />
                <b>{t.k === 'thueSuat' ? `${du.tong[t.k] ?? 0}%` : money(du.tong[t.k] ?? 0)}</b>
              </div>
            ))}
          </div>
        )
      case 'bangChu':
        return mau.bangChu ? <div className="in-ct-bang-chu"><i>{mau.bangChu}: {du.bangChu}</i></div> : null
      case 'ghiChu':
        return mau.ghiChu?.length ? <div className="in-ct-ghi-chu">{mau.ghiChu.map((g, i) => <div key={i}>{g}</div>)}</div> : null
      case 'ky':
        return (
          <>
            <div className="in-ct-ngay-ky">{du.ngayChu}</div>
            <div className="in-ct-ky" style={{ gridTemplateColumns: `repeat(${mau.ky.length}, minmax(0, 1fr))` }}>
              {mau.ky.map((x, i) => (
                <div key={i}>
                  <b>{x.chucDanh}</b>
                  <i>{x.goiY}</i>
                  <div className="in-ct-cho-ky" />
                  <div>{x.hoTen ?? ''}</div>
                </div>
              ))}
            </div>
          </>
        )
      default:
        return null
    }
  }

  // Đầu trang và Mẫu số chung một hàng hai bên như mẫu giấy; ẩn một khối thì khối kia vẫn đúng bên
  const out: ReactNode[] = []
  for (let i = 0; i < khoi.length; i++) {
    const k = khoi[i]
    if (k === 'dauTrang' || k === 'mauSo') {
      const gop = k === 'dauTrang' && khoi[i + 1] === 'mauSo'
      if (gop) i++
      out.push(
        <div key={k} className="in-ct in-ct-hang-dau" style={goc}>
          {k === 'dauTrang' ? dauTrang : <span />}
          {(k === 'mauSo' || gop) && mauSo}
        </div>,
      )
      continue
    }
    const el = veKhoi(k)
    if (el) out.push(<div key={k} className={`in-ct in-ct-k-${k}`} style={goc}>{el}</div>)
  }
  return <>{out}</>
}

/** Khổ giấy theo mẫu: A4 210×297, A5 148×210, ngang thì đảo */
function giayCua(mau: MauIn): Giay {
  const [r, c] = mau.trang.kho === 'A5' ? [148, 210] : [210, 297]
  return mau.trang.huong === 'ngang' ? { rong: c, cao: r, le: mau.trang.le } : { rong: r, cao: c, le: mau.trang.le }
}
// Hai liên A5 ngang trên một tờ A4 dọc
const haiLien = (mau: MauIn) => mau.trang.lien === 2 && mau.trang.kho === 'A5' && mau.trang.huong === 'ngang'
const A4_TRANG: Giay = { rong: 210, cao: 297, le: [0, 0, 0, 0] }

const dsMauCua = (p: PhieuIn) => {
  const ds = mauCuaChungTu(p.sc.code ?? '', p.loai?.k)
  return ds.length ? ds : [mauIn('phieu-ke-toan')!]
}

/** Khung xem trước bản in toàn màn hình: chọn mẫu, zoom, In, Xuất PDF. In nhiều phiếu thì mỗi phiếu một trang */
export function HopInChungTu({ ds, onDong }: { ds: PhieuIn[]; onDong: () => void }) {
  const { s, toast } = useSession()
  const cd = cheDoHienTai(s)
  const donVi = donViHienTai(s)
  const dv: DonViIn = { ten: donVi.ten, diaChi: donVi.diaChi, mst: donVi.mst }
  const dsMau = useMemo(() => (ds[0] ? dsMauCua(ds[0]) : [mauIn('phieu-ke-toan')!]), [ds])
  const [chon, setChon] = useState(dsMau[0].id)
  const mau = dsMau.find(m => m.id === chon) ?? dsMau[0]

  useEffect(() => {
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') onDong() }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [onDong])

  // Phiếu khác loại trong In hàng loạt (phiếu thu lẫn phiếu chi): mẫu đang chọn không thuộc phiếu đó thì dùng mẫu mặc định của phiếu
  const than = useMemo(() => ds.map((p, i) => {
    const m = dsMauCua(p).find(x => x.id === mau.id) ?? dsMauCua(p)[0]
    const du = duLieuIn(m, p.cfg, p.row, p.loai, dv, p.sc.code ?? p.sc.slug)
    if (p.dong) du.dong = p.dong
    const phieu = veMauIn(m, du, cd, dv)
    const el = haiLien(m) ? (
      <div className="in-ct-hai-lien">
        {[1, 2].map(l => (
          <div key={l} className="in-ct-lien" style={{ padding: m.trang.le.map(x => `${x}mm`).join(' ') }}>
            <span className="in-ct-lien-so">Liên {l}</span>
            {phieu}
          </div>
        ))}
      </div>
    ) : phieu
    return <Fragment key={i}>{i > 0 && <NgatTrang />}{el}</Fragment>
  }), [ds, mau.id, cd, dv.ten, dv.diaChi, dv.mst])

  const giay = haiLien(mau) ? A4_TRANG : giayCua(mau)
  const kyHieu = mau.kyHieu[cd.ma]
  const tieuDe = `In ${ds.length > 1 ? `${ds.length} phiếu` : `${mau.ten} ${ds[0]?.row.so ?? ''}`}`
  const inNgay = () => window.dispatchEvent(new CustomEvent('bc-in'))

  return createPortal(
    <div className="overlay in-ct-nen" role="dialog" aria-modal="true" aria-label={tieuDe}>
      <div className="in-ct-hop">
        <header className="in-ct-dau-hop">
          <span className="fsf-ic"><Icon n="printer" /></span>
          <h1>{tieuDe}</h1>
          <label className="in-ct-chon-mau">
            Mẫu
            <Select value={mau.id} aria-label="Chọn mẫu in" onChange={e => setChon(e.target.value)}>
              {dsMau.map(m => <option key={m.id} value={m.id}>{m.ten}</option>)}
            </Select>
          </label>
          <span className="chip">{kyHieu ? `Mẫu số ${kyHieu}` : 'Mẫu tự thiết kế'}</span>
          {kyHieu && cd.choDuyet && <span className="chip warn">Ký hiệu chờ kế toán trưởng duyệt</span>}
          <span className="grow" />
          <Link className="btn sm" to={`/app/tien-ich/11-11?mau=${mau.id}`} onClick={onDong}><Icon n="edit" className="ic sm" />Sửa mẫu</Link>
          <button type="button" className="btn sm" onClick={() => { inNgay(); toast('Chọn máy in "Lưu dưới dạng PDF" để lưu file') }}>
            <Icon n="download" className="ic sm" />Xuất PDF
          </button>
          <button type="button" className="btn sm pri" onClick={inNgay}><Icon n="printer" className="ic sm" />In</button>
          <button type="button" className="btn sm" title="Đóng (Esc)" onClick={onDong}>Đóng</button>
        </header>
        <div className="in-ct-than">
          <ToGiay giay={giay} anSoTrang={ds.length === 1} dau={null} than={than} khoMacDinh="doc" />
        </div>
      </div>
    </div>,
    document.body,
  )
}
