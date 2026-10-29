// Thanh chọn đổi nhanh báo cáo cùng phân hệ khi đang xem báo cáo trong phân hệ Báo cáo
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { ModuleDef, ScreenDef } from '../types'
import { MODULES, hienMan, maKhoa, moDuoc, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { GOI, minGoi } from '../../app/plan'
import { Icon } from '../../ui/Icon'
import { Select } from '../../ui/Dropdown'
import { kyHieuBC, laDauBcMoi } from './danh-sach'
import { docGhim, luuGhim } from './TrungTam'
import { baoCaoCuaPhanHe } from './cuaPhanHe'
import { laTuTrangChu } from '../../app/tuTrangChu'
import { NutHuongDan } from '../../ui/HuongDanNhanh'

// Báo cáo vừa xem ngay trước (T491): bấm từ báo cáo tổng hợp sang báo cáo chi tiết thì có nút về đúng báo cáo đó.
// Gắn theo khoá lịch sử của trang nên mở phiếu rồi quay lại vẫn còn nút; đổi báo cáo bằng ô chọn thì không tính
type BcTruoc = { slug: string; ten: string }
let bcVuaXem: BcTruoc | undefined
const BC_TRUOC = new Map<string, BcTruoc | undefined>()

/** trongPhanHe: báo cáo mở ngay trong phân hệ gốc (T384): nút quay lại về tab Báo cáo của phân hệ, đổi báo cáo vẫn ở phân hệ */
export function ThanhChonBaoCao({ sc, trongPhanHe }: { sc: ScreenDef; trongPhanHe?: ModuleDef }) {
  const { s } = useSession()
  const nav = useNavigate()
  const loc = useLocation()
  const tuTrangChu = laTuTrangChu(loc.state)   // mở từ trang chủ gói Free thì có nút về Trang chủ (T232)
  const doiBc = (loc.state as { doiBc?: boolean } | null)?.doiBc
  const truoc = useMemo(() => BC_TRUOC.has(loc.key) ? BC_TRUOC.get(loc.key)
    : bcVuaXem && bcVuaXem.slug !== sc.slug && !doiBc ? bcVuaXem : undefined, [loc.key])   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    BC_TRUOC.set(loc.key, truoc)
    bcVuaXem = { slug: sc.slug, ten: tenMan(sc) }
    return () => { bcVuaXem = undefined }   // rời sang màn không phải báo cáo thì báo cáo sau không tính là bấm từ báo cáo này
  }, [loc.key, sc.slug])   // eslint-disable-line react-hooks/exhaustive-deps
  const bcMod = MODULES.find(m => m.key === 'bao-cao')
  const cungGoc = (trongPhanHe ? baoCaoCuaPhanHe(trongPhanHe, s) : bcMod?.screens.filter(x => x.goc === sc.goc) ?? [])
    .filter(x => x.slug === sc.slug || hienMan(x, s.goi, s.cheDo, s))   // báo cáo đang xem luôn có trong ô chọn, kể cả báo cáo chỉ mở từ báo cáo khác (T200)

  // Ghi nhận báo cáo vừa mở vào danh sách mở gần đây (tối đa 8, mới nhất trước, T58)
  useEffect(() => {
    if (!sc.slug) return
    try {
      const raw = localStorage.getItem('bc-gan-day')
      const ds: string[] = raw ? JSON.parse(raw) : []
      const loc = Array.isArray(ds) ? ds.filter(x => typeof x === 'string' && x !== sc.slug) : []
      const moi = [sc.slug, ...loc].slice(0, 8)
      localStorage.setItem('bc-gan-day', JSON.stringify(moi))
    } catch {}
  }, [sc.slug])

  // Phần đầu mới (T576): đường dẫn Báo cáo / nhóm, dòng dưới là tên báo cáo đổi nhanh kèm sao ghim như Tất cả báo cáo
  const [ghim, setGhim] = useState(() => docGhim().includes(sc.slug))
  useEffect(() => { setGhim(docGhim().includes(sc.slug)) }, [sc.slug])
  const doiGhim = () => {
    const ds = docGhim().filter(x => x !== sc.slug)
    luuGhim(ghim ? ds : [sc.slug, ...ds])
    setGhim(!ghim)
  }
  const oChon = (
    <Select value={sc.slug} onChange={e => nav(`/app/${trongPhanHe ? trongPhanHe.key : 'bao-cao'}/${e.target.value}`, { state: { doiBc: true } })} aria-label="Đổi báo cáo">
      {cungGoc.map(x => {
        const ok = moDuoc(x, s.goi)
        const code = maKhoa(x)
        const kh = kyHieuBC(x.code, s.cheDo, s)   // ký hiệu mẫu viết liền sau tên báo cáo (T179)
        return (
          <option key={x.slug} value={x.slug}>
            {tenMan(x)}{kh ? ` · ${kh}` : ''}{ok || !code ? '' : ` (gói ${GOI[minGoi(code)].ten})`}
          </option>
        )
      })}
    </Select>
  )
  if (laDauBcMoi(sc.slug)) {
    const nhom = MODULES.find(m => m.key === (trongPhanHe?.key ?? sc.goc))
    const modHd = trongPhanHe ?? bcMod
    return (
      <div className="bc-chon bc-dau-moi">
        <div className="bc-dau-trai">
          <div className="bc-duong">
            {tuTrangChu && <><Link to="/app/trang-chu/tong-quan">Trang chủ</Link><span className="bc-duong-cach">/</span></>}
            <Link className="bc-duong-ve" to={trongPhanHe ? `/app/${trongPhanHe.key}/bao-cao` : '/app/bao-cao/tat-ca'}><Icon n="chevl" className="ic sm" />Báo cáo</Link>
            {nhom && <><span className="bc-duong-cach">/</span><span>{nhom.ngan ?? nhom.ten}</span></>}
            {truoc && <><span className="bc-duong-cach">/</span><button type="button" onClick={() => nav(-1)} title={`Quay lại ${truoc.ten}`}>{truoc.ten}</button></>}
          </div>
          <div className="bc-ten-hang">
            {oChon}
            <button type="button" className={`bc-sao${ghim ? ' on' : ''}`} onClick={doiGhim} title={ghim ? 'Bỏ ghim báo cáo' : 'Ghim báo cáo'} aria-label={ghim ? 'Bỏ ghim báo cáo' : 'Ghim báo cáo'} aria-pressed={ghim}>
              <Icon n={ghim ? 'star-fill' : 'star'} kieu="net" className="ic sm" />
            </button>
          </div>
          {/* Thanh công cụ báo cáo (ReportToolbar) đưa dòng thông số lọc và nút Xuất, Tuỳ chỉnh, In vào hai chỗ này */}
          <div className="bc-dau-mo-ta" />
        </div>
        {/* đầu mới nằm thay thanh tab nên nút la bàn Hướng dẫn nhanh đứng sau nút In (T674) */}
        <div className="bc-dau-phai">
          <div className="bc-dau-nut" />
          {modHd && <NutHuongDan mod={modHd} ngoaiThanhTab />}
        </div>
      </div>
    )
  }

  return (
    <div className={`bc-chon${trongPhanHe ? ' bc-chon-phan-he' : ''}`}>
      {tuTrangChu && <Link className="btn sm ghost bc-ve-tc" to="/app/trang-chu/tong-quan"><Icon n="chevl" className="ic sm" />Trang chủ</Link>}
      {trongPhanHe
        ? <Link className="btn sm ghost" to={`/app/${trongPhanHe.key}/bao-cao`}><Icon n="chevl" className="ic sm" />Báo cáo {trongPhanHe.ngan ?? trongPhanHe.ten}</Link>
        : <Link className="btn sm ghost" to="/app/bao-cao/tat-ca"><Icon n="chevl" className="ic sm" />Tất cả báo cáo</Link>}
      {truoc && <button type="button" className="btn sm ghost bc-ve-truoc" onClick={() => nav(-1)} title={`Quay lại ${truoc.ten}`}><Icon n="chevl" className="ic sm" />{truoc.ten}</button>}
      {oChon}
      {!trongPhanHe && bcMod && <NutHuongDan mod={bcMod} ngoaiThanhTab />}   {/* báo cáo trong phân hệ giữ thanh tab, nút nằm ở đó */}
    </div>
  )
}
