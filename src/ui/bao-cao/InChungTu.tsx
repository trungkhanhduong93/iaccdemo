// Mẫu in chứng từ: vẽ phiếu theo cấu hình mau-in.ts, khung xem trước toàn màn hình dùng lại tờ giấy của báo cáo (T47 đợt 5, kế hoạch mục 8.6)
import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { LoaiCT, Row, ScreenDef, VoucherCfg } from '../../modules/types'
import { mauChoCheDo, mauCuaChungTu, mauIn, type KhoiInK, type MauIn } from '../../app/mau-in'
import { canCu, type CheDo, type CheDoDef } from '../../app/che-do'
import { coTrongGoi, kieuGhiSo } from '../../app/plan'
import { cheDoHienTai, donViHienTai, useSession } from '../../app/session'
import { tkTheoCheDo } from '../../modules/tong-hop/so-cai'
import { Icon } from '../Icon'
import { Popover, Select } from '../Dropdown'
import { money } from '../format'
import { duLieuIn, type DonViIn, type DuLieuIn } from './duLieuIn'
import { NgatTrang, ToGiay, type Giay } from './ToGiay'
import { dsMauRieng, khoaMoi, layNguoiKy, luuMauRieng, mauDungIn, type MauRieng } from './khoMauIn'
import { CaiTrang } from '../thiet-ke/CaiTrang'
import { DsKy } from '../thiet-ke/DsKy'

/** Một phiếu đem in. dong: thay bảng chi tiết sinh từ cfg khi màn có dòng thật (vd chứng từ bán hàng 3.1.1) */
export interface PhieuIn { sc: ScreenDef; cfg: VoucherCfg; row: Row; loai?: LoaiCT; dong?: DuLieuIn['dong'] }

const CHAM = '......'
const soIn = (v: string | number | undefined) => typeof v === 'number' ? (v ? money(v) : '') : v ?? ''

/**
 * Vẽ một phiếu thành các khối theo mau.khoi, mỗi khối một phần tử con để tờ giấy đo và xếp trang. Hàm thuần, không hook.
 * Phần tử mang data-khoi, data-truong, data-cot để màn Thiết kế mẫu in (11.11) biết người dùng bấm vào đâu; thietKe thêm tay nắm kéo mép cột
 */
export function veMauIn(mauGoc: MauIn, du: DuLieuIn, cd: CheDoDef, dv: DonViIn, thietKe?: boolean): ReactNode {
  const mau = mauChoCheDo(mauGoc, cd.ma)
  const goc: CSSProperties = {
    fontSize: `${mau.trang.coChu}pt`,
    fontFamily: mau.trang.phong === 'times' ? "'Times New Roman', Times, serif" : undefined,
  }
  const noCo = kieuGhiSo(cd.ma) === 'noco'
  const tk = (ds: string[]) => ds.map(t => tkTheoCheDo(t, cd.ma).so).join(', ')
  const kyHieu = mau.kyHieu[cd.ma]
  const khoi = mau.khoi.filter(x => !x.an).map(x => x.k)

  const dauTrang = (
    <div className="in-ct-dv" data-khoi="dauTrang">
      <div>Đơn vị: <b>{dv.ten}</b></div>
      <div>Địa chỉ: {dv.diaChi}</div>
    </div>
  )
  const coMauSo = kyHieu || mau.quyenSo || (mau.coNoCo && noCo)
  const mauSo = coMauSo ? (
    <div className="in-ct-mau-so" data-khoi="mauSo">
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

  const kieuTieuDe: CSSProperties | undefined = mau.tieuDeCo || mau.tieuDeDam === false
    ? { fontSize: mau.tieuDeCo ? `${mau.tieuDeCo}pt` : undefined, fontWeight: mau.tieuDeDam === false ? 400 : undefined }
    : undefined

  const veKhoi = (k: KhoiInK): ReactNode => {
    switch (k) {
      case 'tieuDe':
        return (
          <>
            <div className="in-ct-tieu-de" style={kieuTieuDe}>{mau.tieuDe}</div>
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
              <div key={t.k} className="in-ct-truong" data-truong={t.k}>
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
              <tr>{cot.map(c => <th key={c.k} data-cot={c.k}>{c.t}{thietKe && <span className="tkmi-mep" data-mep={c.k} title="Kéo để đổi độ rộng cột" />}</th>)}</tr>
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
    if (el) out.push(<div key={k} className={`in-ct in-ct-k-${k}`} style={goc} data-khoi={k}>{el}</div>)
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

/** Tờ giấy đem in của mẫu: khổ của mẫu, hoặc A4 dọc khi in 2 liên */
export const giayIn = (mau: MauIn): Giay => haiLien(mau) ? A4_TRANG : giayCua(mau)

/** Bọc phiếu thành 2 liên trên một tờ khi mẫu chọn 2 liên */
export function boLien(m: MauIn, phieu: ReactNode): ReactNode {
  if (!haiLien(m)) return phieu
  return (
    <div className="in-ct-hai-lien">
      {[1, 2].map(l => (
        <div key={l} className="in-ct-lien" style={{ padding: m.trang.le.map(x => `${x}mm`).join(' ') }}>
          <span className="in-ct-lien-so">Liên {l}</span>
          {phieu}
        </div>
      ))}
    </div>
  )
}

/** Ô ký chưa có họ tên trong mẫu thì lấy người ký mặc định của đơn vị theo chức danh */
export const kyTheoDonVi = (m: MauIn, nguoiKy: Record<string, string>): MauIn =>
  ({ ...m, ky: m.ky.map(x => x.hoTen ? x : { ...x, hoTen: nguoiKy[x.chucDanh] }) })

/** Tên mẫu riêng kế tiếp của một mẫu gốc: Mẫu riêng 1, Mẫu riêng 2… */
export function tenMauMoi(cungGoc: MauRieng[]): string {
  const n = cungGoc.reduce((a, r) => Math.max(a, Number(/^Mẫu riêng (\d+)$/.exec(r.ten)?.[1] ?? 0)), 0)
  return `Mẫu riêng ${Math.max(n, cungGoc.length) + 1}`
}

const dsMauCua = (p: PhieuIn, cdMa?: CheDo) => {
  const ds = mauCuaChungTu(p.sc.code ?? '', p.loai?.k, cdMa)
  return ds.length ? ds : [mauChoCheDo(mauIn('phieu-ke-toan')!, cdMa ?? 'TT133')]
}

/** Khung xem trước bản in toàn màn hình: chọn mẫu, zoom, In, Xuất PDF. In nhiều phiếu thì mỗi phiếu một trang */
export function HopInChungTu({ ds, onDong }: { ds: PhieuIn[]; onDong: () => void }) {
  const { s, toast } = useSession()
  const cd = cheDoHienTai(s)
  const donVi = donViHienTai(s)
  const dv: DonViIn = { ten: donVi.ten, diaChi: donVi.diaChi, mst: donVi.mst }
  const dsMau = useMemo(() => (ds[0] ? dsMauCua(ds[0], cd.ma) : [mauChoCheDo(mauIn('phieu-ke-toan')!, cd.ma)]), [ds, cd.ma])
  const [rev, setRev] = useState(0)          // tăng khi lưu mẫu riêng ngay trong hộp in, để đọc lại kho
  // Mẫu chuẩn của chứng từ và mẫu riêng của từng mẫu đó; giá trị ô chọn là id mẫu chuẩn hoặc id mẫu riêng
  const luaChon = useMemo(() => dsMau.flatMap(m => [
    { id: m.id, ten: m.ten, mau: m },
    ...dsMauRieng(donVi.id, cd.ma, m.id).map(r => ({ id: r.id, ten: `${m.ten} · ${r.ten}`, mau: r.mau })),
  ]), [dsMau, donVi.id, cd.ma, rev])
  const [chon, setChon] = useState(() => dsMauRieng(donVi.id, cd.ma, dsMau[0].id).find(r => r.macDinh)?.id ?? dsMau[0].id)
  const mau = luaChon.find(x => x.id === chon)?.mau ?? dsMau[0]
  const nguoiKy = useMemo(() => layNguoiKy(donVi.id), [donVi.id, rev])
  const [moSua, setMoSua] = useState(false)
  const nutSua = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') onDong() }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [onDong])

  // Phiếu khác loại trong In hàng loạt (phiếu thu lẫn phiếu chi): mẫu đang chọn không thuộc phiếu đó thì dùng mẫu mặc định của phiếu
  const than = useMemo(() => ds.map((p, i) => {
    const cua = dsMauCua(p, cd.ma)
    const m = kyTheoDonVi(cua.some(x => x.id === mau.id) ? mau : mauDungIn(donVi.id, cd.ma, cua[0].id), nguoiKy)
    const du = duLieuIn(m, p.cfg, p.row, p.loai, dv, p.sc.code ?? p.sc.slug)
    if (p.dong) du.dong = p.dong
    return <Fragment key={i}>{i > 0 && <NgatTrang />}{boLien(m, veMauIn(m, du, cd, dv))}</Fragment>
  }), [ds, mau, nguoiKy, cd, donVi.id, dv.ten, dv.diaChi, dv.mst])

  const giay = giayIn(mau)
  const kyHieu = mau.kyHieu[cd.ma]
  const tieuDe = `In ${ds.length > 1 ? `${ds.length} phiếu` : `${mau.ten} ${ds[0]?.row.so ?? ''}`}`
  const inNgay = () => window.dispatchEvent(new CustomEvent('bc-in'))
  // Gói có tiện ích 11.11 (Plus, Pro) sửa đủ ở màn Thiết kế mẫu in; Free, Standard chỉ sửa người ký, cỡ chữ, khổ ngay trong hộp in (câu 15)
  const suaDu = coTrongGoi('11.11', s.goi)

  // Lưu bản sửa gọn: đang chọn mẫu riêng thì ghi đè, đang chọn mẫu chuẩn thì tạo mẫu riêng mới; mẫu riêng đầu tiên của mẫu gốc thành mặc định
  const luuGon = (moi: MauIn) => {
    const cu = dsMauRieng(donVi.id, cd.ma).find(r => r.id === chon)
    const cungGoc = dsMauRieng(donVi.id, cd.ma, moi.id)
    const r: MauRieng = cu ? { ...cu, mau: moi } : {
      id: khoaMoi(), goc: moi.id, cheDo: cd.ma, ten: tenMauMoi(cungGoc), macDinh: !cungGoc.length, mau: moi, capNhat: '',
    }
    luuMauRieng(donVi.id, r)
    setChon(r.id)
    setRev(x => x + 1)
    setMoSua(false)
    toast(`Đã lưu ${r.ten}`)
  }

  return createPortal(
    <div className="overlay in-ct-nen" role="dialog" aria-modal="true" aria-label={tieuDe}>
      <div className="in-ct-hop">
        <header className="in-ct-dau-hop">
          <span className="fsf-ic"><Icon n="printer" /></span>
          <h1>{tieuDe}</h1>
          <span className="chip">{kyHieu ? `Mẫu số ${kyHieu}` : 'Mẫu tự thiết kế'}</span>
          {kyHieu && cd.choDuyet && <span className="chip warn">Ký hiệu chờ kế toán trưởng duyệt</span>}
          <span className="grow" />
          <button type="button" className="btn sm" onClick={() => { inNgay(); toast('Chọn máy in "Lưu dưới dạng PDF" để lưu file') }}>
            <Icon n="download" className="ic sm" />Xuất PDF
          </button>
          <button type="button" className="btn sm pri" onClick={inNgay}>
            <Icon n="printer" className="ic sm" />In
          </button>
          <button type="button" className="btn sm" title="Đóng (Esc)" onClick={onDong}>Đóng</button>
        </header>

        <div className="in-ct-studio">
          {/* Cột trái: chọn mẫu, đơn vị, người ký */}
          <aside className="in-ct-sidebar">
            <div className="in-ct-side-sec">
              <span className="in-ct-side-title">Chọn mẫu in</span>
              <div className="in-ct-mau-ds">
                {luaChon.map(x => (
                  <button
                    key={x.id}
                    type="button"
                    className={`in-ct-mau-card${x.id === chon ? ' on' : ''}`}
                    aria-pressed={x.id === chon}
                    onClick={() => setChon(x.id)}
                  >
                    <div>
                      <div className="in-ct-mau-card-name">{x.ten}</div>
                      <div className="in-ct-mau-card-sub">
                        {x.mau.kyHieu[cd.ma] ? `Mẫu số ${x.mau.kyHieu[cd.ma]}` : 'Khổ tự đặt'}
                        {haiLien(x.mau) ? ' · 2 liên A4' : ''}
                      </div>
                    </div>
                    {x.id === chon && <span className="in-ct-mau-card-check"><Icon n="check" className="ic sm" /></span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="in-ct-side-sec">
              <span className="in-ct-side-title">Đơn vị và người ký</span>
              <div className="in-ct-side-tt">
                <div className="in-ct-side-tt-dong">
                  <span className="in-ct-side-tt-nhan">Đơn vị:</span>
                  <b className="in-ct-side-tt-val">{donVi.ten}</b>
                </div>
                <div className="in-ct-side-tt-dong">
                  <span className="in-ct-side-tt-nhan">Chế độ:</span>
                  <b className="in-ct-side-tt-val">{cd.ten}</b>
                </div>
                {mau.ky.slice(0, 3).map(k => (
                  <div key={k.chucDanh} className="in-ct-side-tt-dong">
                    <span className="in-ct-side-tt-nhan">{k.chucDanh}:</span>
                    <b className="in-ct-side-tt-val">{nguoiKy[k.chucDanh] || k.hoTen || '(chưa đặt)'}</b>
                  </div>
                ))}
              </div>
            </div>

            <div className="in-ct-side-sec in-ct-side-cuoi">
              {suaDu ? (
                <Link
                  className="btn sm in-ct-side-cuoi-btn"
                  to={`/app/tien-ich/11-11?mau=${chon}${dsMau.some(m => m.id === chon) ? '&chuan=1' : ''}`}
                  onClick={onDong}
                >
                  <Icon n="edit" className="ic sm" />Thiết kế mẫu in
                </Link>
              ) : (
                <button
                  ref={nutSua}
                  type="button"
                  className={`btn sm in-ct-side-cuoi-btn${moSua ? ' on' : ''}`}
                  aria-expanded={moSua}
                  onClick={() => setMoSua(x => !x)}
                >
                  <Icon n="edit" className="ic sm" />Sửa nhanh khổ và người ký
                </button>
              )}
            </div>
          </aside>

          {/* Cột phải: xem trước tờ in */}
          <div className="in-ct-preview">
            <ToGiay giay={giay} anSoTrang={ds.length === 1} dau={null} than={than} khoMacDinh="doc" />
          </div>
        </div>

        {!suaDu && (
          <Popover anchor={nutSua} open={moSua} onClose={() => setMoSua(false)} align="start" role="dialog" className="tkmi-pop" width={380}>
            <SuaGon key={`${chon}-${rev}`} mau={mau} hoTenDonVi={nguoiKy} onLuu={luuGon} onHuy={() => setMoSua(false)} />
          </Popover>
        )}
      </div>
    </div>,
    document.body,
  )
}

/** Khung sửa gọn cho gói Free, Standard: khổ, cỡ chữ, người ký */
function SuaGon({ mau, hoTenDonVi, onLuu, onHuy }: { mau: MauIn; hoTenDonVi: Record<string, string>; onLuu: (m: MauIn) => void; onHuy: () => void }) {
  const [nhap, setNhap] = useState(mau)
  return (
    <div className="tkmi-gon">
      <div className="tkmi-gon-dau">
        <b>Sửa mẫu {mau.ten}</b>
        <span className="tkmi-goi-y">Gói đang dùng sửa được khổ giấy, cỡ chữ và người ký. Sửa đủ ở tiện ích Thiết kế mẫu in của gói Plus, Pro.</span>
      </div>
      <CaiTrang gon trang={nhap.trang} onChange={trang => setNhap(m => ({ ...m, trang }))} />
      <div className="tkmi-gon-nhom">Người ký</div>
      <DsKy ds={nhap.ky} hoTenDonVi={hoTenDonVi} onChange={ky => setNhap(m => ({ ...m, ky }))} />
      <div className="tkmi-gon-chan">
        <span className="grow" />
        <button type="button" className="btn sm" onClick={onHuy}>Huỷ</button>
        <button type="button" className="btn sm pri" onClick={() => onLuu(nhap)}>Lưu mẫu riêng</button>
      </div>
    </div>
  )
}
